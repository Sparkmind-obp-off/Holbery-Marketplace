/**
 * Public, non-secret site configuration. Nothing in this file is sensitive.
 * Do NOT put API keys or credentials here — use `wrangler pages secret put`.
 */
export const SITE = {
  name: 'HOLBERY Marketplace',
  brand: 'HOLBERY',
  tagline: 'Produk digital orisinal yang praktis untuk usaha dan pekerjaan sehari-hari.',
  description:
    'HOLBERY Marketplace adalah toko resmi produk digital orisinal HOLBERY: template, spreadsheet, panduan PDF, alat bisnis, software, dan workflow AI praktis.',
  locale: 'id_ID',
  lang: 'id',
  /** Fallback canonical URL; overridden at runtime by the SITE_URL variable when set. */
  defaultUrl: 'https://holbery-marketplace.pages.dev',
  /**
   * Support contact is not yet published by the owner. Keep `null` until a
   * real, monitored address exists — never invent one.
   */
  supportEmail: null as string | null,
  /**
   * Demonstration records are shown (clearly labelled, never purchasable) so the
   * storefront can be reviewed before real products exist. Set to `false` once
   * real published products are in the catalog.
   */
  showDemonstrationRecords: true,
  policiesLastUpdated: '2026-10-21'
} as const
