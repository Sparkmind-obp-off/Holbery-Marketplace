import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createTestD1 } from './helpers/d1'
import { DuitkuClient, ProviderError, hmacSha256, timingSafeEqual } from '../src/payments/duitku'
import { applyInquiry, createOrder, downloadBlocker, consumeDownload, getOrder, getOwnedOrder, handleCallback, parseCheckoutInput, reconcile, rateLimit, OrderError } from '../src/payments/orders'
import { checkoutBlockers, providerBlockers } from '../src/payments/config'
import { PRODUCTS } from '../src/catalog/products'
import { productSchema, type Product } from '../src/catalog/schema'
import { isFirstPartyEligible, isPurchasable } from '../src/catalog/rules'

// Synthetic test credentials — NOT real.
const RT = { environment: 'production' as const, merchantCode: 'DTEST1', apiKey: 'test-api-key-0123456789abcdef', origin: 'https://shop.example' }

const product: Product = productSchema.parse({
  ...PRODUCTS[0],
  id: 'prd_testpay01',
  sku: 'HB-TEST-PAY-001',
  slug: 'test-pay-product',
  kind: 'product',
  status: 'published',
  availability: 'available',
  deliveryMethod: 'protected_download',
  reviews: { quality: 'passed', rights: 'passed' },
  validationEvidence: [{ date: '2026-10-20', source: 'Uji pengguna', summary: 'Tiga pengguna menyelesaikan tugas.' }],
  channelListings: [],
  checkout: { provider: 'duitku_pop', deliverableKey: 'deliverables/HB-TEST-PAY-001/file.xlsx', deliverableFileName: 'file.xlsx' },
  price: { amount: 49000, currency: 'IDR' }
})

type Handler = (url: string, body: Record<string, unknown>, headers: Record<string, string>) => unknown
function mockFetch(handler: Handler) {
  return vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
    const body = JSON.parse(String(init?.body ?? '{}'))
    const result = handler(String(url), body, (init?.headers ?? {}) as Record<string, string>)
    if (result instanceof Response) return result
    return new Response(JSON.stringify(result), { status: 200, headers: { 'Content-Type': 'application/json' } })
  }) as unknown as typeof fetch
}

/** Simulated Duitku: issues reference on createInvoice, returns configurable status on inquiry. */
function fakeDuitku(state: { status: '00' | '01' | '02'; amount?: number; reference?: string }) {
  return mockFetch((url, body, headers) => {
    if (url.endsWith('/api/merchant/createInvoice')) {
      return { merchantCode: headers['x-duitku-merchantcode'], reference: 'DREF123ABC', paymentUrl: 'https://app-prod.duitku.com/redirect_checkout?reference=DREF123ABC', statusCode: '00', statusMessage: 'SUCCESS' }
    }
    if (url.endsWith('/webapi/api/merchant/transactionStatus')) {
      return { merchantOrderId: body.merchantOrderId, reference: state.reference ?? 'DREF123ABC', amount: String(state.amount ?? 49000), statusCode: state.status, statusMessage: 'x' }
    }
    return new Response('nope', { status: 404 })
  })
}

async function signedCallback(merchantOrderId: string, amount: number, extra: Record<string, string> = {}) {
  return {
    merchantCode: RT.merchantCode,
    amount: String(amount),
    merchantOrderId,
    resultCode: '00',
    reference: 'DREF123ABC',
    paymentCode: 'SP',
    signature: await hmacSha256(RT.apiKey, RT.merchantCode + amount + merchantOrderId),
    ...extra
  }
}

const input = { slug: product.slug, name: 'Budi Santoso', email: 'budi@example.com', acceptTerms: true as const }

describe('Duitku signatures (official HMAC-SHA256 contract)', () => {
  it('createInvoice sends HMAC(merchantCode+timestamp) header and validates response origin', async () => {
    let seen: Record<string, string> = {}
    const f = mockFetch((_u, _b, h) => {
      seen = h
      return { merchantCode: 'DTEST1', reference: 'DREF1', paymentUrl: 'https://app-prod.duitku.com/redirect_checkout?reference=DREF1', statusCode: '00' }
    })
    const inv = await new DuitkuClient(RT, f).createInvoice({ merchantOrderId: 'M1', amount: 49000, productDetails: 'x', email: 'a@b.co', customerVaName: 'A', items: [{ name: 'x', price: 49000, quantity: 1 }], returnPath: '/p', expiryMinutes: 60 })
    expect(inv.reference).toBe('DREF1')
    expect(seen['x-duitku-signature']).toBe(await hmacSha256(RT.apiKey, 'DTEST1' + seen['x-duitku-timestamp']))
  })

  it('rejects invoice whose paymentUrl is not the production Duitku app origin', async () => {
    const f = mockFetch(() => ({ merchantCode: 'DTEST1', reference: 'DREF1', paymentUrl: 'https://evil.example/pay', statusCode: '00' }))
    await expect(new DuitkuClient(RT, f).createInvoice({ merchantOrderId: 'M1', amount: 10000, productDetails: 'x', email: 'a@b.co', customerVaName: 'A', items: [{ name: 'x', price: 10000, quantity: 1 }], returnPath: '/p', expiryMinutes: 60 })).rejects.toBeInstanceOf(ProviderError)
  })

  it('refuses to create an invoice when item total != amount', async () => {
    await expect(new DuitkuClient(RT, mockFetch(() => ({}))).createInvoice({ merchantOrderId: 'M1', amount: 10000, productDetails: 'x', email: 'a@b.co', customerVaName: 'A', items: [{ name: 'x', price: 9000, quantity: 1 }], returnPath: '/p', expiryMinutes: 60 })).rejects.toThrow('AMOUNT_MISMATCH')
  })

  it('verifies a genuine callback signature and rejects forged / wrong-merchant ones', async () => {
    const c = new DuitkuClient(RT, mockFetch(() => ({})))
    const good = await signedCallback('HBMX1', 49000)
    expect(await c.verifyCallbackSignature(good)).toBe(true)
    expect(await c.verifyCallbackSignature({ ...good, amount: '1' })).toBe(false)
    expect(await c.verifyCallbackSignature({ ...good, signature: 'a'.repeat(64) })).toBe(false)
    expect(await c.verifyCallbackSignature({ ...good, merchantCode: 'DOTHER' })).toBe(false)
  })

  it('timingSafeEqual behaves', () => {
    expect(timingSafeEqual('abc', 'abc')).toBe(true)
    expect(timingSafeEqual('abc', 'abd')).toBe(false)
    expect(timingSafeEqual('abc', 'abcd')).toBe(false)
  })
})

describe('checkout input validation', () => {
  it('accepts valid input and normalises email', () => {
    expect(parseCheckoutInput({ ...input, email: ' Budi@Example.COM ' }).email).toBe('budi@example.com')
  })
  it.each([
    [{ ...input, name: 'A' }, 'INVALID_NAME'],
    [{ ...input, name: '<script>' }, 'INVALID_NAME'],
    [{ ...input, email: 'nope' }, 'INVALID_EMAIL'],
    [{ ...input, acceptTerms: false }, 'TERMS_NOT_ACCEPTED'],
    [{ ...input, price: 1 }, 'UNEXPECTED_FIELD'],
    [{ ...input, slug: '../etc' }, 'INVALID_PRODUCT']
  ])('rejects %o', (body, code) => {
    expect(() => parseCheckoutInput(body)).toThrow(code)
  })
})

describe('order lifecycle with simulated Duitku (no real network)', () => {
  let d1: D1Database
  beforeEach(() => {
    d1 = createTestD1().d1
  })

  it('creates a PENDING order with server-authoritative amount and hashed access token', async () => {
    const o = await createOrder(d1, RT, product, input, 'TERMS-1', new DuitkuClient(RT, fakeDuitku({ status: '01' })))
    const row = await getOrder(d1, o.orderId)
    expect(row?.status).toBe('PENDING_PAYMENT')
    expect(row?.amount_idr).toBe(49000)
    expect(row?.provider_reference).toBe('DREF123ABC')
    expect(row?.access_hash).not.toContain(o.accessToken)
    expect(await getOwnedOrder(d1, o.orderId, o.accessToken)).not.toBeNull()
    expect(await getOwnedOrder(d1, o.orderId, 'x'.repeat(48))).toBeNull()
  })

  it('marks order FAILED (no paid state) when invoice creation fails', async () => {
    const f = mockFetch(() => new Response('err', { status: 500 }))
    await expect(createOrder(d1, RT, product, input, 'T', new DuitkuClient(RT, f))).rejects.toBeInstanceOf(ProviderError)
    const row = await d1.prepare('SELECT status FROM orders').first<{ status: string }>()
    expect(row?.status).toBe('FAILED')
  })

  it('valid callback + PAID inquiry → PAID; duplicate callback is idempotent', async () => {
    const client = new DuitkuClient(RT, fakeDuitku({ status: '00' }))
    const o = await createOrder(d1, RT, product, input, 'T', client)
    const row = (await getOrder(d1, o.orderId))!
    const cb = await signedCallback(row.merchant_order_id, 49000)
    expect(await handleCallback(d1, client, cb, () => 30)).toBe('PAID')
    expect(await handleCallback(d1, client, cb, () => 30)).toBe('ALREADY_PAID')
    const paid = (await getOrder(d1, o.orderId))!
    expect(paid.status).toBe('PAID')
    expect(paid.provider_payment_code).toBe('SP')
    const events = await d1.prepare("SELECT count(*) AS n FROM order_events WHERE type='PAYMENT_VERIFIED'").first<{ n: number }>()
    expect(Number(events?.n)).toBe(1)
  })

  it('forged callback (bad signature) never mutates state', async () => {
    const client = new DuitkuClient(RT, fakeDuitku({ status: '00' }))
    const o = await createOrder(d1, RT, product, input, 'T', client)
    const row = (await getOrder(d1, o.orderId))!
    const forged = { ...(await signedCallback(row.merchant_order_id, 49000)), signature: 'f'.repeat(64) }
    expect(await handleCallback(d1, client, forged, () => 30)).toBe('BAD_SIGNATURE')
    expect((await getOrder(d1, o.orderId))!.status).toBe('PENDING_PAYMENT')
  })

  it('callback claiming success is NOT trusted when inquiry says PENDING', async () => {
    const client = new DuitkuClient(RT, fakeDuitku({ status: '01' }))
    const o = await createOrder(d1, RT, product, input, 'T', client)
    const row = (await getOrder(d1, o.orderId))!
    expect(await handleCallback(d1, client, await signedCallback(row.merchant_order_id, 49000), () => 30)).toBe('PENDING')
    expect((await getOrder(d1, o.orderId))!.status).toBe('PENDING_PAYMENT')
  })

  it('amount mismatch (callback or inquiry) is rejected', async () => {
    const client = new DuitkuClient(RT, fakeDuitku({ status: '00', amount: 1000 }))
    const o = await createOrder(d1, RT, product, input, 'T', client)
    const row = (await getOrder(d1, o.orderId))!
    // signed callback for wrong amount
    expect(await handleCallback(d1, client, await signedCallback(row.merchant_order_id, 1000), () => 30)).toBe('MISMATCH')
    // correct callback amount but provider inquiry reports a different amount
    expect(await handleCallback(d1, client, await signedCallback(row.merchant_order_id, 49000), () => 30)).toBe('MISMATCH')
    expect((await getOrder(d1, o.orderId))!.status).toBe('PENDING_PAYMENT')
  })

  it('reference mismatch from inquiry is rejected', async () => {
    const client = new DuitkuClient(RT, fakeDuitku({ status: '00', reference: 'DOTHERREF' }))
    const o = await createOrder(d1, RT, product, input, 'T', client)
    const row = (await getOrder(d1, o.orderId))!
    expect(await handleCallback(d1, client, await signedCallback(row.merchant_order_id, 49000), () => 30)).toBe('MISMATCH')
  })

  it('unknown order callback is rejected', async () => {
    const client = new DuitkuClient(RT, fakeDuitku({ status: '00' }))
    expect(await handleCallback(d1, client, await signedCallback('HBMUNKNOWN', 49000), () => 30)).toBe('UNKNOWN_ORDER')
  })

  it('inquiry FAILED marks order FAILED; a PAID order cannot be reverted', async () => {
    const o = await createOrder(d1, RT, product, input, 'T', new DuitkuClient(RT, fakeDuitku({ status: '01' })))
    let row = (await getOrder(d1, o.orderId))!
    expect(await applyInquiry(d1, row, { merchantOrderId: row.merchant_order_id, reference: 'DREF123ABC', amount: 49000, status: 'PAID' }, 't', 30)).toBe('PAID')
    row = (await getOrder(d1, o.orderId))!
    expect(await applyInquiry(d1, row, { merchantOrderId: row.merchant_order_id, reference: 'DREF123ABC', amount: 49000, status: 'FAILED' }, 't', 30)).toBe('IGNORED')
    expect((await getOrder(d1, o.orderId))!.status).toBe('PAID')
    await expect(d1.prepare("UPDATE orders SET status='FAILED' WHERE id=?").bind(o.orderId).run()).rejects.toThrow(/INVALID_TRANSITION/)
    await expect(d1.prepare('UPDATE orders SET amount_idr=1 WHERE id=?').bind(o.orderId).run()).rejects.toThrow(/IMMUTABLE/)
  })

  it('reconcile uses inquiry and is idempotent', async () => {
    const client = new DuitkuClient(RT, fakeDuitku({ status: '00' }))
    const o = await createOrder(d1, RT, product, input, 'T', client)
    expect(await reconcile(d1, client, (await getOrder(d1, o.orderId))!, 30)).toBe('PAID')
    expect(await reconcile(d1, client, (await getOrder(d1, o.orderId))!, 30)).toBe('IGNORED')
  })

  it('download allowed only for PAID orders and limited by count', async () => {
    const client = new DuitkuClient(RT, fakeDuitku({ status: '00' }))
    const o = await createOrder(d1, RT, product, input, 'T', client)
    expect(downloadBlocker((await getOrder(d1, o.orderId))!)).toBe('NOT_PAID')
    await reconcile(d1, client, (await getOrder(d1, o.orderId))!, 30)
    let row = (await getOrder(d1, o.orderId))!
    expect(downloadBlocker(row)).toBeNull()
    for (let i = 0; i < row.download_limit; i++) expect(await consumeDownload(d1, row)).toBe(true)
    row = (await getOrder(d1, o.orderId))!
    expect(downloadBlocker(row)).toBe('DOWNLOAD_LIMIT')
    expect(await consumeDownload(d1, row)).toBe(false)
  })

  it('rate limit blocks excessive attempts', async () => {
    for (let i = 0; i < 3; i++) await rateLimit(d1, 'x', 'ip', 3)
    await expect(rateLimit(d1, 'x', 'ip', 3)).rejects.toBeInstanceOf(OrderError)
  })
})

describe('runtime gating', () => {
  it('provider/checkout blockers list missing configuration', () => {
    expect(providerBlockers({})).toEqual(expect.arrayContaining(['DB', 'DUITKU_ENV', 'DUITKU_MERCHANT_CODE', 'DUITKU_API_KEY', 'SITE_URL']))
    expect(checkoutBlockers({})).toEqual(expect.arrayContaining(['DELIVERABLES', 'CHECKOUT_ENABLED', 'TERMS_VERSION', 'SUPPORT_CONTACT']))
  })

  it('first-party eligibility requires a fully gated real product', () => {
    expect(isFirstPartyEligible(product)).toBe(true)
    expect(isPurchasable(product)).toBe(true)
    expect(isFirstPartyEligible({ ...product, kind: 'demonstration' })).toBe(false)
    expect(isFirstPartyEligible({ ...product, status: 'draft' })).toBe(false)
    expect(isFirstPartyEligible({ ...product, checkout: undefined })).toBe(false)
  })

  it('schema rejects checkout on demonstration records and non-protected delivery', () => {
    expect(productSchema.safeParse({ ...PRODUCTS[0], checkout: product.checkout }).success).toBe(false)
    expect(productSchema.safeParse({ ...product, deliveryMethod: 'manual' }).success).toBe(false)
    expect(productSchema.safeParse({ ...product, price: { amount: 5000, currency: 'IDR' } }).success).toBe(false)
  })

  it('no catalog record is currently purchasable', () => {
    expect(PRODUCTS.filter(isPurchasable)).toEqual([])
  })
})
