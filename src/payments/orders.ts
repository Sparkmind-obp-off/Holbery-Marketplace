import type { Product } from '../catalog/schema'
import { DuitkuClient, ProviderError, sha256, timingSafeEqual, type InquiryResult } from './duitku'
import type { PaymentRuntime } from './config'

export type OrderStatus = 'PENDING_PAYMENT' | 'PAID' | 'FAILED' | 'EXPIRED' | 'REFUNDED'

export interface OrderRow {
  id: string
  merchant_order_id: string
  access_hash: string
  product_id: string
  sku: string
  product_title: string
  product_version: string
  amount_idr: number
  buyer_name: string
  buyer_email: string
  terms_version: string
  status: OrderStatus
  provider: string
  provider_reference: string | null
  provider_payment_code: string | null
  paid_at: string | null
  download_count: number
  download_limit: number
  download_expires_at: string | null
  created_at: string
  updated_at: string
}

export class OrderError extends Error {
  constructor(public code: string, public status: 400 | 404 | 409 | 429 | 503 = 400) {
    super(code)
  }
}

const INVOICE_EXPIRY_MINUTES = 60

const nowIso = () => new Date().toISOString()
function randomToken(bytes = 24): string {
  const a = new Uint8Array(bytes)
  crypto.getRandomValues(a)
  return Array.from(a, (b) => b.toString(36).padStart(2, '0')).join('').replace(/[^a-z0-9]/g, '').slice(0, bytes * 2)
}
export function newOrderId(): string {
  return 'ord_' + randomToken(10)
}
export function newMerchantOrderId(): string {
  // <= 50 chars, unique, no PII.
  return 'HBM' + Date.now().toString(36).toUpperCase() + randomToken(4).toUpperCase()
}

/* ---------- Input validation (server-side, untrusted) ---------- */

export interface CheckoutInput {
  slug: string
  name: string
  email: string
  acceptTerms: boolean
}

const EMAIL_RE = /^[^\s@<>"'()]{1,64}@[A-Za-z0-9.-]{1,190}\.[A-Za-z]{2,24}$/

export function parseCheckoutInput(raw: unknown): CheckoutInput {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new OrderError('INVALID_BODY')
  const b = raw as Record<string, unknown>
  const allowed = ['slug', 'name', 'email', 'acceptTerms']
  if (Object.keys(b).some((k) => !allowed.includes(k))) throw new OrderError('UNEXPECTED_FIELD')
  const slug = typeof b.slug === 'string' ? b.slug.trim() : ''
  const name = typeof b.name === 'string' ? b.name.replace(/\s+/g, ' ').trim() : ''
  const email = typeof b.email === 'string' ? b.email.trim().toLowerCase() : ''
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 100) throw new OrderError('INVALID_PRODUCT')
  if (name.length < 2 || name.length > 60 || /[\u0000-\u001f<>]/.test(name)) throw new OrderError('INVALID_NAME')
  if (email.length > 254 || !EMAIL_RE.test(email)) throw new OrderError('INVALID_EMAIL')
  if (b.acceptTerms !== true) throw new OrderError('TERMS_NOT_ACCEPTED')
  return { slug, name, email, acceptTerms: true }
}

/* ---------- Data access ---------- */

export async function getOrder(db: D1Database, id: string): Promise<OrderRow | null> {
  if (!/^ord_[a-z0-9]{6,40}$/.test(id)) return null
  return db.prepare('SELECT * FROM orders WHERE id=?').bind(id).first<OrderRow>()
}

export async function getOrderByMerchantId(db: D1Database, merchantOrderId: string): Promise<OrderRow | null> {
  if (!/^[A-Za-z0-9_-]{1,50}$/.test(merchantOrderId)) return null
  return db.prepare('SELECT * FROM orders WHERE merchant_order_id=?').bind(merchantOrderId).first<OrderRow>()
}

/** Returns the order only if the bearer token matches (capability URL). */
export async function getOwnedOrder(db: D1Database, id: string, token: string): Promise<OrderRow | null> {
  if (!/^[a-z0-9]{20,80}$/.test(token)) return null
  const row = await getOrder(db, id)
  if (!row) return null
  return timingSafeEqual(row.access_hash, await sha256(token)) ? row : null
}

async function logEvent(db: D1Database, orderId: string, type: string, detail?: string) {
  await db
    .prepare('INSERT INTO order_events (id, order_id, type, detail, created_at) VALUES (?,?,?,?,?)')
    .bind('evt_' + randomToken(10), orderId, type, detail ?? null, nowIso())
    .run()
}

/** Fixed-window limiter. Keyed by SHA-256 of action+client, never raw IP. */
export async function rateLimit(db: D1Database, action: string, client: string, max: number): Promise<void> {
  const window = Math.floor(Date.now() / 60000)
  const key = await sha256(`${action}:${client}`)
  await db.prepare('DELETE FROM rate_limits WHERE window < ?').bind(window - 2).run()
  const row = await db
    .prepare(
      'INSERT INTO rate_limits (key_hash, window, count) VALUES (?,?,1) ON CONFLICT(key_hash) DO UPDATE SET count = CASE WHEN rate_limits.window = excluded.window THEN rate_limits.count + 1 ELSE 1 END, window = excluded.window RETURNING count'
    )
    .bind(key, window)
    .first<{ count: number }>()
  if (Number(row?.count) > max) throw new OrderError('RATE_LIMITED', 429)
}

/* ---------- Create order + Duitku invoice ---------- */

export interface CreatedOrder {
  orderId: string
  accessToken: string
  reference: string
  paymentUrl: string
  amount: number
}

export async function createOrder(
  db: D1Database,
  rt: PaymentRuntime,
  product: Product,
  input: CheckoutInput,
  termsVersion: string,
  client: DuitkuClient = new DuitkuClient(rt)
): Promise<CreatedOrder> {
  if (!product.checkout) throw new OrderError('NOT_PURCHASABLE', 409)
  const orderId = newOrderId()
  const merchantOrderId = newMerchantOrderId()
  const accessToken = randomToken(24)
  const amount = product.price.amount // server-authoritative price
  const date = nowIso()

  await db
    .prepare(
      `INSERT INTO orders (id, merchant_order_id, access_hash, product_id, sku, product_title, product_version, amount_idr,
        buyer_name, buyer_email, terms_version, status, download_limit, created_at, updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,'PENDING_PAYMENT',?,?,?)`
    )
    .bind(
      orderId, merchantOrderId, await sha256(accessToken), product.id, product.sku, product.title, product.version, amount,
      input.name, input.email, termsVersion, product.checkout.downloadLimit, date, date
    )
    .run()
  await logEvent(db, orderId, 'ORDER_CREATED', `amount=${amount}`)

  let invoice
  try {
    invoice = await client.createInvoice({
      merchantOrderId,
      amount,
      productDetails: `HOLBERY ${product.sku}`,
      email: input.email,
      customerVaName: input.name,
      items: [{ name: product.title, price: amount, quantity: 1 }],
      returnPath: `/pesanan/${orderId}?t=${accessToken}`,
      expiryMinutes: INVOICE_EXPIRY_MINUTES
    })
  } catch (e) {
    await db.prepare("UPDATE orders SET status='FAILED', updated_at=? WHERE id=?").bind(nowIso(), orderId).run()
    await logEvent(db, orderId, 'INVOICE_FAILED', e instanceof ProviderError ? e.reason : 'error')
    throw e
  }

  await db.prepare('UPDATE orders SET provider_reference=?, updated_at=? WHERE id=?').bind(invoice.reference, nowIso(), orderId).run()
  await logEvent(db, orderId, 'INVOICE_CREATED')
  return { orderId, accessToken, reference: invoice.reference, paymentUrl: invoice.paymentUrl, amount }
}

/* ---------- Apply authoritative provider status ---------- */

export type ApplyOutcome = 'PAID' | 'ALREADY_PAID' | 'PENDING' | 'FAILED' | 'MISMATCH' | 'IGNORED'

/**
 * Applies a provider inquiry result to an order. This is the ONLY code path
 * that can mark an order PAID. Idempotent.
 */
export async function applyInquiry(db: D1Database, order: OrderRow, inq: InquiryResult, source: string, windowDays: number): Promise<ApplyOutcome> {
  if (inq.merchantOrderId !== order.merchant_order_id) return 'MISMATCH'
  if (order.provider_reference && inq.reference !== order.provider_reference) {
    await logEvent(db, order.id, 'REFERENCE_MISMATCH', source)
    return 'MISMATCH'
  }
  if (inq.amount !== order.amount_idr) {
    await logEvent(db, order.id, 'AMOUNT_MISMATCH', `${source} expected=${order.amount_idr} got=${inq.amount}`)
    return 'MISMATCH'
  }
  if (order.status === 'PAID' || order.status === 'REFUNDED') return order.status === 'PAID' && inq.status === 'PAID' ? 'ALREADY_PAID' : 'IGNORED'

  const date = nowIso()
  if (inq.status === 'PAID') {
    const expires = new Date(Date.now() + windowDays * 86400000).toISOString()
    const res = await db
      .prepare(
        "UPDATE orders SET status='PAID', paid_at=?, provider_reference=COALESCE(provider_reference, ?), download_expires_at=?, updated_at=? WHERE id=? AND status IN ('PENDING_PAYMENT','FAILED','EXPIRED')"
      )
      .bind(date, inq.reference, expires, date, order.id)
      .run()
    if (!res.meta.changes) return 'ALREADY_PAID'
    await logEvent(db, order.id, 'PAYMENT_VERIFIED', source)
    return 'PAID'
  }
  if (inq.status === 'FAILED' && order.status === 'PENDING_PAYMENT') {
    await db.prepare("UPDATE orders SET status='FAILED', updated_at=? WHERE id=? AND status='PENDING_PAYMENT'").bind(date, order.id).run()
    await logEvent(db, order.id, 'PAYMENT_FAILED', source)
    return 'FAILED'
  }
  return inq.status === 'PENDING' ? 'PENDING' : 'IGNORED'
}

/* ---------- Duitku HTTP callback ---------- */

export type CallbackOutcome = ApplyOutcome | 'BAD_SIGNATURE' | 'UNKNOWN_ORDER' | 'BAD_REQUEST'

export async function handleCallback(
  db: D1Database,
  client: DuitkuClient,
  fields: Record<string, string>,
  windowDaysFor: (order: OrderRow) => number
): Promise<CallbackOutcome> {
  if (!fields.merchantOrderId || !fields.amount || !fields.signature || !fields.merchantCode) return 'BAD_REQUEST'
  if (!(await client.verifyCallbackSignature(fields))) return 'BAD_SIGNATURE'
  const order = await getOrderByMerchantId(db, fields.merchantOrderId)
  if (!order) return 'UNKNOWN_ORDER'
  if (Number(fields.amount) !== order.amount_idr) {
    await logEvent(db, order.id, 'CALLBACK_AMOUNT_MISMATCH')
    return 'MISMATCH'
  }
  if (fields.paymentCode && /^[A-Z0-9]{1,4}$/.test(fields.paymentCode) && !order.provider_payment_code) {
    await db.prepare('UPDATE orders SET provider_payment_code=? WHERE id=?').bind(fields.paymentCode, order.id).run()
  }
  await logEvent(db, order.id, 'CALLBACK_RECEIVED', `resultCode=${/^\d{2}$/.test(fields.resultCode || '') ? fields.resultCode : '?'}`)
  // Callback HMAC does not cover resultCode → corroborate with authenticated inquiry.
  const inq = await client.inquiry(order.merchant_order_id)
  return applyInquiry(db, order, inq, 'callback+inquiry', windowDaysFor(order))
}

/** Customer-triggered reconciliation (e.g. order page "Periksa status"). Safe & idempotent. */
export async function reconcile(db: D1Database, client: DuitkuClient, order: OrderRow, windowDays: number): Promise<ApplyOutcome> {
  if (order.status !== 'PENDING_PAYMENT') return 'IGNORED'
  const inq = await client.inquiry(order.merchant_order_id)
  const outcome = await applyInquiry(db, order, inq, 'reconcile+inquiry', windowDays)
  if (outcome === 'PENDING' && Date.parse(order.created_at) + (INVOICE_EXPIRY_MINUTES + 30) * 60000 < Date.now()) {
    await db.prepare("UPDATE orders SET status='EXPIRED', updated_at=? WHERE id=? AND status='PENDING_PAYMENT'").bind(nowIso(), order.id).run()
    await logEvent(db, order.id, 'ORDER_EXPIRED')
  }
  return outcome
}

/* ---------- Protected download ---------- */

export function downloadBlocker(order: OrderRow): string | null {
  if (order.status !== 'PAID') return 'NOT_PAID'
  if (order.download_expires_at && Date.parse(order.download_expires_at) < Date.now()) return 'DOWNLOAD_EXPIRED'
  if (order.download_count >= order.download_limit) return 'DOWNLOAD_LIMIT'
  return null
}

export async function consumeDownload(db: D1Database, order: OrderRow): Promise<boolean> {
  const res = await db
    .prepare("UPDATE orders SET download_count = download_count + 1, updated_at=? WHERE id=? AND status='PAID' AND download_count < download_limit")
    .bind(nowIso(), order.id)
    .run()
  if (res.meta.changes) await logEvent(db, order.id, 'DOWNLOAD')
  return !!res.meta.changes
}
