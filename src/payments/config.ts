import type { DuitkuEnvironment } from './duitku'

export type Bindings = {
  /** Public canonical URL (plain var). */
  SITE_URL?: string
  DB?: D1Database
  DELIVERABLES?: R2Bucket
  /** 'production' | 'sandbox' (plain var). Production deployments must use 'production'. */
  DUITKU_ENV?: string
  /** Encrypted Pages secrets. */
  DUITKU_MERCHANT_CODE?: string
  DUITKU_API_KEY?: string
  /** Kill switch, plain var. Must be exactly 'true' to accept new orders. */
  CHECKOUT_ENABLED?: string
  /** Owner-approved policy versions, plain vars. Required for checkout. */
  TERMS_VERSION?: string
  /** Public support contact shown to buyers, plain var. Required for checkout. */
  SUPPORT_CONTACT?: string
}

export interface PaymentRuntime {
  environment: DuitkuEnvironment
  merchantCode: string
  apiKey: string
  origin: string
}

/** Returns the list of missing runtime prerequisites. Empty list == payment provider configured. */
export function providerBlockers(env: Bindings): string[] {
  const missing: string[] = []
  if (!env.DB) missing.push('DB')
  if (env.DUITKU_ENV !== 'production' && env.DUITKU_ENV !== 'sandbox') missing.push('DUITKU_ENV')
  if (!env.DUITKU_MERCHANT_CODE || !/^[A-Za-z0-9]{3,20}$/.test(env.DUITKU_MERCHANT_CODE)) missing.push('DUITKU_MERCHANT_CODE')
  if (!env.DUITKU_API_KEY || env.DUITKU_API_KEY.length < 16) missing.push('DUITKU_API_KEY')
  if (!env.SITE_URL || !/^https:\/\/[^/]+$/.test(env.SITE_URL)) missing.push('SITE_URL')
  return missing
}

/** Prerequisites for accepting NEW orders (stricter than processing callbacks for existing orders). */
export function checkoutBlockers(env: Bindings): string[] {
  const missing = providerBlockers(env)
  if (!env.DELIVERABLES) missing.push('DELIVERABLES')
  if (env.CHECKOUT_ENABLED !== 'true') missing.push('CHECKOUT_ENABLED')
  if (!env.TERMS_VERSION) missing.push('TERMS_VERSION')
  if (!env.SUPPORT_CONTACT) missing.push('SUPPORT_CONTACT')
  return missing
}

export function runtime(env: Bindings): PaymentRuntime | null {
  if (providerBlockers(env).length) return null
  return {
    environment: env.DUITKU_ENV as DuitkuEnvironment,
    merchantCode: env.DUITKU_MERCHANT_CODE!,
    apiKey: env.DUITKU_API_KEY!,
    origin: env.SITE_URL!
  }
}
