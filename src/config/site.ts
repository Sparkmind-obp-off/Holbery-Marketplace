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
  /** Public business contacts supplied by the owner. Publish only channels that are monitored. */
  generalEmail: 'hello@holbery.biz.id',
  supportEmail: 'support@holbery.biz.id' as string | null,
  whatsappNumber: '085712658316',
  /** Legal operator; HOLBERY remains the consumer-facing brand. */
  legalSellerName: 'PT Waskita Cakrawarti Digital',
  legalSellerType: 'Perseroan Perorangan',
  /**
   * Demonstration records are shown (clearly labelled, never purchasable) so the
   * storefront can be reviewed before real products exist. Set to false only
   * after a real product is approved for publication.
   */
  showDemonstrationRecords: true,
  policiesLastUpdated: '2026-10-21'
} as const
