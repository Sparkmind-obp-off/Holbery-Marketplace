import { Hono, type Context } from 'hono'
import { bodyLimit } from 'hono/body-limit'
import { getCatalogProductById, getPublicProductBySlug, isFirstPartyEligible } from '../catalog'
import { DuitkuClient, ProviderError } from '../payments/duitku'
import { checkoutBlockers, providerBlockers, runtime, type Bindings } from '../payments/config'
import {
  OrderError,
  consumeDownload,
  createOrder,
  downloadBlocker,
  getOwnedOrder,
  handleCallback,
  parseCheckoutInput,
  rateLimit,
  reconcile,
  type OrderRow
} from '../payments/orders'

type Env = { Bindings: Bindings }
export const commerce = new Hono<Env>()

// Tests / misconfigured runtimes may have no env object at all — fail closed.
commerce.use('*', async (c, next) => {
  if (!c.env) (c as unknown as { env: Bindings }).env = {}
  await next()
})

const clientKey = (c: Context<Env>) => c.req.header('CF-Connecting-IP') || 'local'
const windowDays = (order: OrderRow) => getCatalogProductById(order.product_id)?.checkout?.downloadWindowDays ?? 30

function jsonError(c: Context<Env>, code: string, status: 400 | 401 | 403 | 404 | 409 | 413 | 415 | 429 | 503) {
  c.header('Cache-Control', 'no-store')
  return c.json({ error: code }, status)
}

commerce.use('/api/checkout', bodyLimit({ maxSize: 4096, onError: (c) => c.json({ error: 'BODY_TOO_LARGE' }, 413) }))
commerce.use('/api/payments/*', bodyLimit({ maxSize: 16384, onError: (c) => c.json({ error: 'BODY_TOO_LARGE' }, 413) }))
commerce.use('/api/orders/*', bodyLimit({ maxSize: 1024, onError: (c) => c.json({ error: 'BODY_TOO_LARGE' }, 413) }))

/** Non-secret readiness report: names of missing prerequisites only. */
commerce.get('/api/payments/readiness', (c) => {
  c.header('Cache-Control', 'no-store')
  const provider = providerBlockers(c.env)
  const checkout = checkoutBlockers(c.env)
  return c.json({
    provider: 'duitku_pop',
    environment: c.env.DUITKU_ENV ?? null,
    providerConfigured: provider.length === 0,
    checkoutOpen: checkout.length === 0,
    missing: checkout
  })
})

/** Same-origin guard against CSRF for browser-initiated JSON writes. */
function sameOrigin(c: Context<Env>): boolean {
  const origin = c.req.header('Origin')
  if (!origin) return false
  try {
    return new URL(origin).host === new URL(c.req.url).host
  } catch {
    return false
  }
}

commerce.post('/api/checkout', async (c) => {
  c.header('Cache-Control', 'no-store')
  if (!sameOrigin(c)) return jsonError(c, 'FORBIDDEN_ORIGIN', 403)
  if (!c.req.header('Content-Type')?.includes('application/json')) return jsonError(c, 'JSON_REQUIRED', 415)
  if (checkoutBlockers(c.env).length) return jsonError(c, 'CHECKOUT_CLOSED', 503)
  const rt = runtime(c.env)!
  let raw: unknown
  try {
    raw = await c.req.json()
  } catch {
    return jsonError(c, 'INVALID_JSON', 400)
  }
  try {
    const input = parseCheckoutInput(raw)
    await rateLimit(c.env.DB!, 'checkout', clientKey(c), 8)
    const product = getPublicProductBySlug(input.slug)
    if (!product || !isFirstPartyEligible(product)) return jsonError(c, 'NOT_PURCHASABLE', 409)
    const order = await createOrder(c.env.DB!, rt, product, input, c.env.TERMS_VERSION!)
    return c.json(
      {
        orderId: order.orderId,
        reference: order.reference,
        orderUrl: `/pesanan/${order.orderId}?t=${order.accessToken}`,
        amount: order.amount
      },
      201
    )
  } catch (e) {
    if (e instanceof OrderError) return jsonError(c, e.code, e.status)
    if (e instanceof ProviderError) return jsonError(c, 'PROVIDER_UNAVAILABLE', 503)
    throw e
  }
})

/**
 * Duitku server-to-server notification (x-www-form-urlencoded).
 * Always answers quickly; never echoes secrets or internal state.
 */
commerce.post('/api/payments/duitku/callback', async (c) => {
  c.header('Cache-Control', 'no-store')
  const rt = runtime(c.env)
  if (!rt) return c.text('NOT_CONFIGURED', 503)
  let fields: Record<string, string> = {}
  try {
    const form = await c.req.parseBody()
    for (const [k, v] of Object.entries(form)) if (typeof v === 'string' && v.length <= 512) fields[k] = v
  } catch {
    return c.text('BAD_REQUEST', 400)
  }
  try {
    const outcome = await handleCallback(c.env.DB!, new DuitkuClient(rt), fields, windowDays)
    switch (outcome) {
      case 'BAD_REQUEST':
        return c.text('BAD_REQUEST', 400)
      case 'BAD_SIGNATURE':
        return c.text('BAD_SIGNATURE', 401)
      case 'UNKNOWN_ORDER':
        return c.text('UNKNOWN_ORDER', 404)
      case 'MISMATCH':
        return c.text('MISMATCH', 409)
      default:
        return c.text('OK', 200)
    }
  } catch (e) {
    // Provider inquiry unavailable → 503 so Duitku retries; no state was changed.
    if (e instanceof ProviderError) return c.text('RETRY', 503)
    throw e
  }
})

/** Buyer-triggered status check (capability token required). */
commerce.post('/api/orders/:id/reconcile', async (c) => {
  c.header('Cache-Control', 'no-store')
  if (!sameOrigin(c)) return jsonError(c, 'FORBIDDEN_ORIGIN', 403)
  const rt = runtime(c.env)
  if (!rt) return jsonError(c, 'NOT_CONFIGURED', 503)
  const token = c.req.query('t') || ''
  const order = await getOwnedOrder(c.env.DB!, c.req.param('id'), token)
  if (!order) return jsonError(c, 'NOT_FOUND', 404)
  try {
    await rateLimit(c.env.DB!, 'reconcile', order.id, 10)
    await reconcile(c.env.DB!, new DuitkuClient(rt), order, windowDays(order))
    const fresh = await getOwnedOrder(c.env.DB!, order.id, token)
    return c.json({ status: fresh?.status ?? order.status })
  } catch (e) {
    if (e instanceof OrderError) return jsonError(c, e.code, e.status)
    if (e instanceof ProviderError) return jsonError(c, 'PROVIDER_UNAVAILABLE', 503)
    throw e
  }
})

/** Protected download: only for a server-verified PAID order, limited count & window. */
commerce.get('/pesanan/:id/unduh', async (c) => {
  c.header('Cache-Control', 'no-store')
  c.header('Referrer-Policy', 'no-referrer')
  c.header('X-Robots-Tag', 'noindex, nofollow')
  if (!c.env.DB || !c.env.DELIVERABLES) return c.text('Unduhan belum tersedia.', 503)
  const token = c.req.query('t') || ''
  const order = await getOwnedOrder(c.env.DB, c.req.param('id'), token)
  if (!order) return c.text('Pesanan tidak ditemukan.', 404)
  const blocker = downloadBlocker(order)
  if (blocker) return c.text(blocker === 'NOT_PAID' ? 'Pembayaran belum terverifikasi.' : 'Batas unduhan telah tercapai atau kedaluwarsa. Hubungi dukungan.', 403)
  const product = getCatalogProductById(order.product_id)
  if (!product?.checkout) return c.text('Berkas tidak tersedia. Hubungi dukungan.', 503)
  const object = await c.env.DELIVERABLES.get(product.checkout.deliverableKey)
  if (!object) return c.text('Berkas sedang disiapkan. Hubungi dukungan.', 503)
  if (!(await consumeDownload(c.env.DB, order))) {
    object.body.cancel()
    return c.text('Batas unduhan telah tercapai.', 403)
  }
  const name = product.checkout.deliverableFileName.replace(/"/g, '')
  return new Response(object.body, {
    headers: {
      'Content-Type': object.httpMetadata?.contentType || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${name}"`,
      'Cache-Control': 'no-store',
      'Referrer-Policy': 'no-referrer',
      'X-Content-Type-Options': 'nosniff',
      'X-Robots-Tag': 'noindex, nofollow'
    }
  })
})

