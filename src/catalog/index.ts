import { SITE } from '../config/site'
import { PRODUCTS } from './products'
import { catalogSchema, type Product } from './schema'
import { isPubliclyVisible } from './rules'

/**
 * Validated catalog. Parsing happens at module load so an invalid record
 * fails the build / worker start instead of silently rendering bad data.
 */
export const CATALOG: readonly Product[] = Object.freeze(catalogSchema.parse(PRODUCTS))

export function getPublicProducts(): Product[] {
  return CATALOG.filter((p) => isPubliclyVisible(p, { showDemonstrationRecords: SITE.showDemonstrationRecords }))
}

export function getPublicProductBySlug(slug: string): Product | undefined {
  return getPublicProducts().find((p) => p.slug === slug)
}

export { CATEGORIES, getCategory } from './categories'
export * from './rules'
export * from './query'
export type { Product, CategorySlug } from './schema'
