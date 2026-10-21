import { z } from 'zod'

/**
 * Catalog schema — the single contract for every product record.
 *
 * Price convention (docs/05-data-model.md): `price.amount` is an integer in the
 * currency's MINOR unit as defined by ISO 4217. IDR has exponent 0, so
 * Rp49.000 is stored as 49000. USD would store $9.99 as 999.
 */

export const CATEGORY_SLUGS = [
  'bisnis-keuangan',
  'produktivitas-operasional',
  'kreatif-desain',
  'pengetahuan-edukasi',
  'software-tools',
  'ai-otomasi',
  'solusi-industri',
  'bundel-sistem-premium'
] as const

export const categorySlugSchema = z.enum(CATEGORY_SLUGS)
export type CategorySlug = z.infer<typeof categorySlugSchema>

/** Lifecycle from docs/04-product-taxonomy.md and docs/05-data-model.md. */
export const PUBLICATION_STATUSES = ['draft', 'review', 'published', 'paused', 'archived'] as const
export const publicationStatusSchema = z.enum(PUBLICATION_STATUSES)
export type PublicationStatus = z.infer<typeof publicationStatusSchema>

/**
 * `product`        — a real HOLBERY product record.
 * `demonstration`  — a clearly-labelled sample used only to exercise the UI.
 *                    Can never be purchased, regardless of any other field.
 */
export const recordKindSchema = z.enum(['product', 'demonstration'])
export type RecordKind = z.infer<typeof recordKindSchema>

export const availabilitySchema = z.enum(['available', 'coming_soon', 'not_available'])
export type Availability = z.infer<typeof availabilitySchema>

export const deliveryMethodSchema = z.enum([
  'external_channel', // fulfilled by a verified third-party sales channel
  'protected_download', // future: signed / authenticated delivery
  'manual', // operator sends deliverable after verified order
  'not_yet_available'
])
export type DeliveryMethod = z.infer<typeof deliveryMethodSchema>

export const reviewStatusSchema = z.enum(['not_started', 'in_progress', 'passed', 'failed'])
export type ReviewStatus = z.infer<typeof reviewStatusSchema>

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const skuRegex = /^[A-Z0-9]+(?:-[A-Z0-9]+)*$/
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Gunakan format tanggal YYYY-MM-DD')
const semver = z.string().regex(/^\d+\.\d+\.\d+$/, 'Gunakan versi semver, mis. 1.0.0')

/** Public preview assets must be local, public static files — never private deliverables. */
const publicPreviewPath = z
  .string()
  .regex(/^\/static\/previews\/[a-z0-9-]+\.(svg|png|jpg|jpeg|webp)$/, 'Pratinjau harus berada di /static/previews/')

export const deliverableSchema = z.object({
  name: z.string().min(2),
  format: z.string().min(2),
  description: z.string().min(5)
})

export const previewImageSchema = z.object({
  src: publicPreviewPath,
  alt: z.string().min(5),
  /** True when the image is an illustrative mock-up, not a real product screenshot. */
  illustrative: z.boolean()
})

export const validationEvidenceSchema = z.object({
  date: isoDate,
  source: z.string().min(2),
  summary: z.string().min(5),
  url: z.string().url().optional()
})

export const channelListingSchema = z.object({
  channel: z.enum(['holbery_store', 'shopee', 'tiktok_shop', 'etsy', 'other']),
  label: z.string().min(2),
  /** Only listings with status `active` AND a verified URL may produce a buy button. */
  status: z.enum(['planned', 'draft', 'active', 'paused', 'removed']),
  url: z.string().url().startsWith('https://').optional(),
  price: z.number().int().nonnegative().optional(),
  lastVerified: isoDate.optional()
})
export type ChannelListing = z.infer<typeof channelListingSchema>

export const productSchema = z
  .object({
    id: z.string().regex(/^prd_[a-z0-9]{4,}$/, 'ID harus berformat prd_xxxx'),
    sku: z.string().regex(skuRegex, 'SKU harus huruf besar/angka dipisah tanda hubung'),
    slug: z.string().regex(slugRegex, 'Slug harus huruf kecil dipisah tanda hubung'),
    kind: recordKindSchema,
    title: z.string().min(3).max(90),
    category: categorySlugSchema,
    shortDescription: z.string().min(20).max(180),
    fullDescription: z.array(z.string().min(20)).min(1),
    targetCustomer: z.string().min(10),
    problemSolved: z.string().min(10),
    deliverables: z.array(deliverableSchema),
    fileFormats: z.array(z.string().min(2)).min(1),
    languages: z.array(z.string().min(2)).min(1),
    compatibility: z.array(z.string().min(3)).min(1),
    howToUse: z.array(z.string().min(5)).min(1),
    price: z.object({
      amount: z.number().int().nonnegative(),
      currency: z.enum(['IDR', 'USD'])
    }),
    version: semver,
    license: z.object({
      name: z.string().min(3),
      permitted: z.array(z.string().min(3)).min(1),
      notPermitted: z.array(z.string().min(3)).min(1)
    }),
    previewImages: z.array(previewImageSchema).min(1),
    deliveryMethod: deliveryMethodSchema,
    deliveryNote: z.string().min(10),
    supportPolicy: z.string().min(10),
    updatePolicy: z.string().min(10),
    status: publicationStatusSchema,
    availability: availabilitySchema,
    reviews: z.object({
      quality: reviewStatusSchema,
      rights: reviewStatusSchema
    }),
    validationEvidence: z.array(validationEvidenceSchema),
    channelListings: z.array(channelListingSchema),
    tags: z.array(z.string().min(2)).default([]),
    createdAt: isoDate,
    updatedAt: isoDate
  })
  .superRefine((p, ctx) => {
    const issue = (path: (string | number)[], message: string) =>
      ctx.addIssue({ code: z.ZodIssueCode.custom, path, message })

    if (p.updatedAt < p.createdAt) issue(['updatedAt'], 'updatedAt tidak boleh sebelum createdAt')

    // Published-product gate (docs/05-data-model.md → Validation rules).
    if (p.status === 'published') {
      if (p.kind === 'demonstration') issue(['status'], 'Produk demonstrasi tidak boleh berstatus published')
      if (p.reviews.quality !== 'passed') issue(['reviews', 'quality'], 'Produk published wajib lulus quality review')
      if (p.reviews.rights !== 'passed') issue(['reviews', 'rights'], 'Produk published wajib lulus rights review')
      if (p.deliverables.length === 0) issue(['deliverables'], 'Produk published wajib punya minimal satu deliverable')
      if (p.deliveryMethod === 'not_yet_available') issue(['deliveryMethod'], 'Produk published wajib punya metode pengiriman nyata')
      if (p.validationEvidence.length === 0) issue(['validationEvidence'], 'Produk published wajib punya bukti validasi')
    }

    // "Available" must be backed by a real, active, verified listing.
    if (p.availability === 'available') {
      if (p.kind === 'demonstration') issue(['availability'], 'Produk demonstrasi tidak boleh berstatus available')
      if (p.status !== 'published') issue(['availability'], 'Hanya produk published yang boleh available')
      const hasActive = p.channelListings.some((l) => l.status === 'active' && l.url && l.lastVerified)
      if (!hasActive) issue(['channelListings'], 'Produk available wajib punya listing aktif dengan URL dan tanggal verifikasi')
    }

    // Active listings must carry a URL and verification date — never invented links.
    p.channelListings.forEach((l, i) => {
      if (l.status === 'active' && (!l.url || !l.lastVerified)) {
        issue(['channelListings', i], 'Listing aktif wajib memiliki URL dan lastVerified')
      }
    })

    if (p.kind === 'demonstration' && p.channelListings.some((l) => l.status === 'active')) {
      issue(['channelListings'], 'Produk demonstrasi tidak boleh memiliki listing aktif')
    }
  })

export type Product = z.infer<typeof productSchema>

export const catalogSchema = z.array(productSchema).superRefine((products, ctx) => {
  for (const key of ['id', 'sku', 'slug'] as const) {
    const seen = new Map<string, number>()
    products.forEach((p, i) => {
      const prev = seen.get(p[key])
      if (prev !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [i, key],
          message: `${key} "${p[key]}" duplikat (juga dipakai indeks ${prev})`
        })
      } else seen.set(p[key], i)
    })
  }
})
