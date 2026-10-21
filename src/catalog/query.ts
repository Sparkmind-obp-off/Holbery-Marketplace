import { CATEGORY_SLUGS, type CategorySlug, type Product } from './schema'
import { getDisplayState } from './rules'

export const SORT_OPTIONS = {
  relevance: 'Paling relevan',
  newest: 'Terbaru',
  'price-asc': 'Harga terendah',
  'price-desc': 'Harga tertinggi',
  'title-asc': 'Nama A–Z'
} as const
export type SortKey = keyof typeof SORT_OPTIONS

export interface CatalogQuery {
  q: string
  category: CategorySlug | null
  sort: SortKey
}

const MAX_QUERY_LENGTH = 80

/** Normalises untrusted query-string input into a safe, bounded query. */
export function parseCatalogQuery(input: Record<string, string | undefined>): CatalogQuery {
  const rawQ = typeof input.q === 'string' ? input.q : ''
  const q = rawQ.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, MAX_QUERY_LENGTH)
  const category = (CATEGORY_SLUGS as readonly string[]).includes(input.category ?? '')
    ? (input.category as CategorySlug)
    : null
  const sort = input.sort && input.sort in SORT_OPTIONS ? (input.sort as SortKey) : 'relevance'
  return { q, category, sort }
}

function normalise(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

/** Simple weighted relevance score. 0 means "does not match". */
export function scoreProduct(p: Product, q: string): number {
  if (!q) return 1
  const terms = normalise(q).split(' ').filter(Boolean)
  const title = normalise(p.title)
  const tags = normalise(p.tags.join(' '))
  const body = normalise(
    [p.shortDescription, p.targetCustomer, p.problemSolved, p.sku, p.fileFormats.join(' ')].join(' ')
  )
  let score = 0
  for (const t of terms) {
    let termScore = 0
    if (title.includes(t)) termScore += 5
    if (tags.includes(t)) termScore += 3
    if (body.includes(t)) termScore += 1
    if (termScore === 0) return 0 // every term must match somewhere
    score += termScore
  }
  return score
}

const STATE_RANK = { available: 0, coming_soon: 1, paused: 2, not_available: 3, demonstration: 4 } as const

export function queryCatalog(products: readonly Product[], query: CatalogQuery): Product[] {
  const scored = products
    .filter((p) => (query.category ? p.category === query.category : true))
    .map((p) => ({ p, s: scoreProduct(p, query.q) }))
    .filter((x) => x.s > 0)

  const byTitle = (a: Product, b: Product) => a.title.localeCompare(b.title, 'id')
  scored.sort((a, b) => {
    switch (query.sort) {
      case 'newest':
        return b.p.createdAt.localeCompare(a.p.createdAt) || byTitle(a.p, b.p)
      case 'price-asc':
        return a.p.price.amount - b.p.price.amount || byTitle(a.p, b.p)
      case 'price-desc':
        return b.p.price.amount - a.p.price.amount || byTitle(a.p, b.p)
      case 'title-asc':
        return byTitle(a.p, b.p)
      case 'relevance':
      default:
        return (
          b.s - a.s ||
          STATE_RANK[getDisplayState(a.p)] - STATE_RANK[getDisplayState(b.p)] ||
          byTitle(a.p, b.p)
        )
    }
  })
  return scored.map((x) => x.p)
}

export function formatPrice(price: Product['price']): string {
  return new Intl.NumberFormat(price.currency === 'IDR' ? 'id-ID' : 'en-US', {
    style: 'currency',
    currency: price.currency,
    minimumFractionDigits: price.currency === 'IDR' ? 0 : 2,
    maximumFractionDigits: price.currency === 'IDR' ? 0 : 2
  }).format(price.currency === 'IDR' ? price.amount : price.amount / 100)
}
