/**
 * Duitku POP adapter (production).
 *
 * Sources checked 2026-10-21:
 *  - https://docs.duitku.com/pop/id/  (createInvoice, callback, duitku.js)
 *  - https://docs.duitku.com/api/id/  (transactionStatus, getpaymentmethod)
 *
 * Contract (same as parent Commerce repo, src/payments.ts):
 *  createInvoice header signature  = HMAC_SHA256(merchantCode + timestamp, apiKey)
 *  callback signature              = HMAC_SHA256(merchantCode + amount + merchantOrderId, apiKey)
 *  transactionStatus signature     = HMAC_SHA256(merchantCode + merchantOrderId, apiKey)
 *
 * The callback HMAC does NOT cover resultCode/reference, so the server always
 * corroborates the callback with an authenticated transactionStatus inquiry
 * before marking an order PAID. Browser POP events are UX only.
 */

export type DuitkuEnvironment = 'production' | 'sandbox'

export interface DuitkuConfig {
  environment: DuitkuEnvironment
  merchantCode: string
  apiKey: string
  /** Public https origin used for callbackUrl/returnUrl. */
  origin: string
}

export interface InvoiceInput {
  merchantOrderId: string
  amount: number
  productDetails: string
  email: string
  customerVaName: string
  items: { name: string; price: number; quantity: number }[]
  returnPath: string
  expiryMinutes: number
}

export interface Invoice {
  reference: string
  paymentUrl: string
}

export type InquiryStatus = 'PAID' | 'PENDING' | 'FAILED'
export interface InquiryResult {
  merchantOrderId: string
  reference: string
  amount: number
  status: InquiryStatus
}

export class ProviderError extends Error {
  constructor(public reason: string) {
    super('PROVIDER_UNAVAILABLE')
  }
}

const HOSTS = {
  production: { api: 'https://api-prod.duitku.com', app: 'https://app-prod.duitku.com', passport: 'https://passport.duitku.com' },
  sandbox: { api: 'https://api-sandbox.duitku.com', app: 'https://app-sandbox.duitku.com', passport: 'https://sandbox.duitku.com' }
} as const

export function popScriptUrl(env: DuitkuEnvironment): string {
  return `${HOSTS[env].app}/lib/js/duitku.js`
}
export function appOrigin(env: DuitkuEnvironment): string {
  return HOSTS[env].app
}

const enc = new TextEncoder()
export function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('')
}
export async function hmacSha256(key: string, value: string): Promise<string> {
  const k = await crypto.subtle.importKey('raw', enc.encode(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  return toHex(await crypto.subtle.sign('HMAC', k, enc.encode(value)))
}
export async function sha256(value: string): Promise<string> {
  return toHex(await crypto.subtle.digest('SHA-256', enc.encode(value)))
}
/** Constant-time string comparison. */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

const REF_RE = /^[A-Za-z0-9_-]{1,100}$/

export class DuitkuClient {
  constructor(
    private readonly cfg: DuitkuConfig,
    private readonly fetcher: typeof fetch = (...args) => fetch(...args)
  ) {}

  private async post(url: string, body: unknown, headers: Record<string, string> = {}): Promise<Record<string, unknown>> {
    let res: Response
    try {
      res = await this.fetcher(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...headers },
        body: JSON.stringify(body),
        redirect: 'manual',
        signal: AbortSignal.timeout(15000)
      })
    } catch {
      throw new ProviderError('network')
    }
    if (!res.ok) throw new ProviderError(`http_${res.status}`)
    let data: unknown
    try {
      data = await res.json()
    } catch {
      throw new ProviderError('invalid_json')
    }
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new ProviderError('invalid_body')
    return data as Record<string, unknown>
  }

  async createInvoice(input: InvoiceInput): Promise<Invoice> {
    const itemsTotal = input.items.reduce((s, i) => s + i.price * i.quantity, 0)
    if (!Number.isSafeInteger(input.amount) || input.amount <= 0 || itemsTotal !== input.amount) throw new Error('AMOUNT_MISMATCH')
    const { merchantCode, apiKey, origin, environment } = this.cfg
    const timestamp = Date.now().toString()
    const data = await this.post(
      `${HOSTS[environment].api}/api/merchant/createInvoice`,
      {
        paymentAmount: input.amount,
        merchantOrderId: input.merchantOrderId,
        productDetails: input.productDetails.slice(0, 255),
        email: input.email,
        customerVaName: input.customerVaName.slice(0, 20),
        itemDetails: input.items.map((i) => ({ name: i.name.slice(0, 50), price: i.price, quantity: i.quantity })),
        callbackUrl: `${origin}/api/payments/duitku/callback`,
        returnUrl: `${origin}${input.returnPath}`,
        expiryPeriod: input.expiryMinutes
      },
      {
        'x-duitku-merchantcode': merchantCode,
        'x-duitku-timestamp': timestamp,
        'x-duitku-signature': await hmacSha256(apiKey, merchantCode + timestamp)
      }
    )
    if (data.statusCode !== '00' || data.merchantCode !== merchantCode || typeof data.reference !== 'string' || !REF_RE.test(data.reference) || typeof data.paymentUrl !== 'string') {
      throw new ProviderError('invoice_rejected')
    }
    let url: URL
    try {
      url = new URL(data.paymentUrl)
    } catch {
      throw new ProviderError('invoice_url')
    }
    if (url.origin !== HOSTS[environment].app) throw new ProviderError('invoice_origin')
    return { reference: data.reference, paymentUrl: url.href }
  }

  /** Verifies the HMAC on a Duitku HTTP callback. Does NOT prove resultCode — use inquiry(). */
  async verifyCallbackSignature(fields: Record<string, string>): Promise<boolean> {
    const sig = (fields.signature || '').toLowerCase()
    if (fields.merchantCode !== this.cfg.merchantCode || !/^[a-f0-9]{64}$/.test(sig)) return false
    if (!/^\d+$/.test(fields.amount || '') || !fields.merchantOrderId) return false
    const expected = await hmacSha256(this.cfg.apiKey, fields.merchantCode + fields.amount + fields.merchantOrderId)
    return timingSafeEqual(sig, expected)
  }

  async inquiry(merchantOrderId: string): Promise<InquiryResult> {
    const { merchantCode, apiKey, environment } = this.cfg
    const data = await this.post(`${HOSTS[environment].passport}/webapi/api/merchant/transactionStatus`, {
      merchantCode,
      merchantOrderId,
      signature: await hmacSha256(apiKey, merchantCode + merchantOrderId)
    })
    const amount = Number(data.amount)
    const code = String(data.statusCode)
    if (data.merchantOrderId !== merchantOrderId || typeof data.reference !== 'string' || !REF_RE.test(data.reference) || !Number.isSafeInteger(amount) || amount <= 0 || !['00', '01', '02'].includes(code)) {
      throw new ProviderError('inquiry_invalid')
    }
    return { merchantOrderId, reference: data.reference, amount, status: code === '00' ? 'PAID' : code === '01' ? 'PENDING' : 'FAILED' }
  }
}
