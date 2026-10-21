/**
 * CLI catalog validator — run with `npm run validate:catalog`.
 * Runs automatically before every production build.
 */
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { PRODUCTS } from '../src/catalog/products'
import { catalogSchema } from '../src/catalog/schema'
import { isPurchasable } from '../src/catalog/rules'

const result = catalogSchema.safeParse(PRODUCTS)
let failed = false

if (!result.success) {
  failed = true
  console.error('✗ Katalog tidak valid:')
  for (const issue of result.error.issues) {
    const idx = typeof issue.path[0] === 'number' ? issue.path[0] : undefined
    const label = idx !== undefined ? (PRODUCTS[idx]?.sku ?? `#${idx}`) : 'katalog'
    console.error(`  - [${label}] ${issue.path.slice(1).join('.') || '(root)'}: ${issue.message}`)
  }
} else {
  for (const p of result.data) {
    for (const img of p.previewImages) {
      const file = resolve('public', img.src.replace(/^\//, ''))
      if (!existsSync(file)) {
        failed = true
        console.error(`  - [${p.sku}] file pratinjau tidak ditemukan: public${img.src}`)
      }
    }
  }
}

if (failed) process.exit(1)

const data = result.success ? result.data : []
const demo = data.filter((p) => p.kind === 'demonstration').length
const purchasable = data.filter(isPurchasable).length
console.log(`✓ Katalog valid: ${data.length} record (${demo} demonstrasi, ${purchasable} dapat dibeli).`)
