import { describe, expect, it } from 'vitest'
import { PRODUCTS } from '../src/catalog/products'
import { catalogSchema, productSchema, CATEGORY_SLUGS, type Product } from '../src/catalog/schema'
import { CATEGORIES } from '../src/catalog/categories'
import { getDisplayState, isPubliclyVisible, isPurchasable } from '../src/catalog/rules'
import { formatPrice, parseCatalogQuery, queryCatalog } from '../src/catalog/query'

const base = PRODUCTS[0] as Product

/** Builds a fully-valid, real, purchasable product used as a positive control. */
function realProduct(overrides: Partial<Product> = {}): Product {
  return {
    ...base,
    id: 'prd_real0001',
    sku: 'HB-BF-001',
    slug: 'real-product',
    kind: 'product',
    status: 'published',
    availability: 'available',
    deliveryMethod: 'external_channel',
    reviews: { quality: 'passed', rights: 'passed' },
    validationEvidence: [{ date: '2026-10-01', source: 'Wawancara pengguna', summary: 'Lima pengguna menyelesaikan tugas.' }],
    channelListings: [
      { channel: 'shopee', label: 'Shopee', status: 'active', url: 'https://example.com/listing', lastVerified: '2026-10-20' }
    ],
    ...overrides
  }
}

describe('catalog data', () => {
  it('passes schema validation', () => {
    expect(() => catalogSchema.parse(PRODUCTS)).not.toThrow()
  })

  it('defines exactly the 8 required categories', () => {
    expect(CATEGORIES.map((c) => c.slug)).toEqual([...CATEGORY_SLUGS])
    expect(CATEGORIES).toHaveLength(8)
  })

  it('has no purchasable record until the owner approves a real product', () => {
    for (const p of PRODUCTS) {
      expect(isPurchasable(p)).toBe(false)
      expect(p.channelListings.some((l) => l.status === 'active')).toBe(false)
      if (p.kind === 'demonstration') {
        expect(getDisplayState(p)).toBe('demonstration')
        expect(p.checkout).toBeUndefined()
      }
    }
  })

  it('stores IDR prices as integers in minor units (exponent 0)', () => {
    for (const p of PRODUCTS) expect(Number.isInteger(p.price.amount)).toBe(true)
  })
})

describe('schema publication rules', () => {
  it('accepts a fully reviewed, verified real product', () => {
    expect(productSchema.safeParse(realProduct()).success).toBe(true)
  })

  it('rejects published demonstration records', () => {
    expect(productSchema.safeParse({ ...base, status: 'published' }).success).toBe(false)
  })

  it('rejects published products without passed reviews', () => {
    expect(productSchema.safeParse(realProduct({ reviews: { quality: 'passed', rights: 'in_progress' } })).success).toBe(false)
  })

  it('rejects published products without validation evidence', () => {
    expect(productSchema.safeParse(realProduct({ validationEvidence: [] })).success).toBe(false)
  })

  it('rejects published products without deliverables', () => {
    expect(productSchema.safeParse(realProduct({ deliverables: [] })).success).toBe(false)
  })

  it('rejects "available" without a verified active listing', () => {
    const r = productSchema.safeParse(
      realProduct({ channelListings: [{ channel: 'shopee', label: 'Shopee', status: 'planned' }] })
    )
    expect(r.success).toBe(false)
  })

  it('rejects active listings with no URL (no invented links)', () => {
    const r = productSchema.safeParse(
      realProduct({ channelListings: [{ channel: 'shopee', label: 'Shopee', status: 'active', lastVerified: '2026-10-20' }] })
    )
    expect(r.success).toBe(false)
  })

  it('rejects non-https listing URLs', () => {
    const r = productSchema.safeParse(
      realProduct({
        channelListings: [{ channel: 'shopee', label: 'Shopee', status: 'active', url: 'http://example.com', lastVerified: '2026-10-20' }]
      })
    )
    expect(r.success).toBe(false)
  })

  it('rejects preview images outside the public preview folder', () => {
    const r = productSchema.safeParse({
      ...base,
      previewImages: [{ src: '/private/deliverable.png', alt: 'Berkas privat', illustrative: false }]
    })
    expect(r.success).toBe(false)
  })

  it('rejects duplicate id, sku and slug', () => {
    expect(catalogSchema.safeParse([base, { ...base }]).success).toBe(false)
    expect(catalogSchema.safeParse([base, { ...base, id: 'prd_other001', slug: 'other' }]).success).toBe(false) // dup sku
  })

  it('rejects invalid slug and SKU formats', () => {
    expect(productSchema.safeParse({ ...base, slug: 'Bad Slug' }).success).toBe(false)
    expect(productSchema.safeParse({ ...base, sku: 'lower-case' }).success).toBe(false)
  })
})

describe('purchase and visibility rules', () => {
  it('real verified product is purchasable', () => {
    expect(isPurchasable(realProduct())).toBe(true)
    expect(getDisplayState(realProduct())).toBe('available')
  })

  it.each([
    ['demonstration', { kind: 'demonstration' as const }],
    ['draft', { status: 'draft' as const }],
    ['paused', { status: 'paused' as const }],
    ['coming soon', { availability: 'coming_soon' as const }],
    ['no delivery method', { deliveryMethod: 'not_yet_available' as const }],
    ['failed rights review', { reviews: { quality: 'passed' as const, rights: 'failed' as const } }],
    ['no active listing', { channelListings: [] }]
  ])('is NOT purchasable when %s', (_label, override) => {
    expect(isPurchasable(realProduct(override as Partial<Product>))).toBe(false)
  })

  it('hides draft, review and archived real products from the public', () => {
    const opts = { showDemonstrationRecords: true }
    expect(isPubliclyVisible(realProduct({ status: 'draft' }), opts)).toBe(false)
    expect(isPubliclyVisible(realProduct({ status: 'review' }), opts)).toBe(false)
    expect(isPubliclyVisible(realProduct({ status: 'archived' }), opts)).toBe(false)
    expect(isPubliclyVisible(realProduct(), opts)).toBe(true)
    expect(isPubliclyVisible(realProduct({ status: 'paused' }), opts)).toBe(true)
  })

  it('shows demonstration records only when enabled', () => {
    expect(isPubliclyVisible(base, { showDemonstrationRecords: true })).toBe(true)
    expect(isPubliclyVisible(base, { showDemonstrationRecords: false })).toBe(false)
  })
})

describe('search, filter and sort', () => {
  it('sanitises and bounds untrusted query input', () => {
    const q = parseCatalogQuery({ q: '  <script>\u0000 '.repeat(20), category: 'nope', sort: 'evil' })
    expect(q.q.length).toBeLessThanOrEqual(80)
    expect(q.q).not.toMatch(/\u0000/)
    expect(q.category).toBeNull()
    expect(q.sort).toBe('relevance')
  })

  it('filters by category', () => {
    const r = queryCatalog(PRODUCTS, { q: '', category: 'ai-otomasi', sort: 'relevance' })
    expect(r.length).toBeGreaterThan(0)
    expect(r.every((p) => p.category === 'ai-otomasi')).toBe(true)
  })

  it('finds by title term, case- and accent-insensitive', () => {
    const r = queryCatalog(PRODUCTS, { q: 'KALKULATOR hpp', category: null, sort: 'relevance' })
    expect(r[0]?.slug).toBe('kalkulator-hpp-harga-jual')
  })

  it('returns empty list when nothing matches', () => {
    expect(queryCatalog(PRODUCTS, { q: 'zzzz-tidak-ada', category: null, sort: 'relevance' })).toEqual([])
  })

  it('sorts by price ascending and descending', () => {
    const asc = queryCatalog(PRODUCTS, { q: '', category: null, sort: 'price-asc' }).map((p) => p.price.amount)
    expect(asc).toEqual([...asc].sort((a, b) => a - b))
    const desc = queryCatalog(PRODUCTS, { q: '', category: null, sort: 'price-desc' }).map((p) => p.price.amount)
    expect(desc).toEqual([...desc].sort((a, b) => b - a))
  })

  it('formats IDR prices without decimals', () => {
    expect(formatPrice({ amount: 49000, currency: 'IDR' }).replace(/\s/g, ' ')).toMatch(/Rp\s?49\.000/)
  })
})
