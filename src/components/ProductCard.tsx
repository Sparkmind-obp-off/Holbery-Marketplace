import type { FC } from 'hono/jsx'
import type { Product } from '../catalog/schema'
import { getCategory } from '../catalog/categories'
import { DISPLAY_STATE_LABEL, getDisplayState } from '../catalog/rules'
import { formatPrice } from '../catalog/query'

export const StatusBadge: FC<{ product: Product }> = ({ product }) => {
  const state = getDisplayState(product)
  return <span class={`badge badge-${state}`}>{DISPLAY_STATE_LABEL[state]}</span>
}

export const ProductCard: FC<{ product: Product; headingLevel?: 'h2' | 'h3' }> = ({ product, headingLevel = 'h3' }) => {
  const category = getCategory(product.category)
  const preview = product.previewImages[0]
  const Heading = headingLevel
  const isDemo = product.kind === 'demonstration'
  return (
    <article class="product-card" data-sku={product.sku}>
      <a href={`/produk/${product.slug}`} class="product-card-link">
        <div class="product-card-media">
          {preview && <img src={preview.src} alt={preview.alt} width={800} height={600} loading="lazy" decoding="async" />}
        </div>
        <div class="product-card-body">
          <div class="product-card-meta">
            <span class="product-card-category">{category?.name}</span>
            <StatusBadge product={product} />
          </div>
          <Heading class="product-card-title">{product.title}</Heading>
          <p class="product-card-desc">{product.shortDescription}</p>
          <div class="product-card-foot">
            <span class="product-card-formats">{product.fileFormats.join(' · ')}</span>
            <span class="product-card-price">
              {isDemo ? <span class="price-muted" title="Harga perencanaan, bukan penawaran">{formatPrice(product.price)}*</span> : formatPrice(product.price)}
            </span>
          </div>
        </div>
      </a>
    </article>
  )
}

export const ProductGrid: FC<{ products: Product[]; headingLevel?: 'h2' | 'h3' }> = ({ products, headingLevel }) => (
  <ul class="product-grid" role="list">
    {products.map((p) => (
      <li>
        <ProductCard product={p} headingLevel={headingLevel} />
      </li>
    ))}
  </ul>
)
