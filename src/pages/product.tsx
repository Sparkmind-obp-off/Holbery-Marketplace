import type { FC } from 'hono/jsx'
import type { Product } from '../catalog/schema'
import { getCategory } from '../catalog/categories'
import {
  DELIVERY_LABEL,
  DISPLAY_STATE_LABEL,
  REVIEW_LABEL,
  STATUS_LABEL,
  getActiveListing,
  getDisplayState,
  isPurchasable
} from '../catalog/rules'
import { formatPrice } from '../catalog/query'
import { Breadcrumbs } from '../components/Common'
import { ProductGrid, StatusBadge } from '../components/ProductCard'

const PurchasePanel: FC<{ product: Product }> = ({ product }) => {
  const state = getDisplayState(product)
  const listing = getActiveListing(product)
  const purchasable = isPurchasable(product)
  return (
    <aside class="purchase-panel" aria-labelledby="purchase-title" id="purchase-panel">
      <h2 id="purchase-title" class="visually-hidden">Harga dan ketersediaan</h2>
      <div class="purchase-price">
        <span class="purchase-price-value">{formatPrice(product.price)}</span>
        {product.kind === 'demonstration' && <span class="purchase-price-note">Harga perencanaan — bukan penawaran</span>}
      </div>
      <dl class="purchase-facts">
        <div>
          <dt>Ketersediaan</dt>
          <dd><StatusBadge product={product} /></dd>
        </div>
        <div>
          <dt>Pengiriman</dt>
          <dd>{DELIVERY_LABEL[product.deliveryMethod]}</dd>
        </div>
        <div>
          <dt>Versi</dt>
          <dd>{product.version}</dd>
        </div>
        <div>
          <dt>SKU</dt>
          <dd><code>{product.sku}</code></dd>
        </div>
      </dl>

      {purchasable && listing?.url ? (
        <>
          <a class="btn btn-primary btn-block" href={listing.url} rel="noopener noreferrer" target="_blank" data-testid="buy-button">
            Beli di {listing.label}
            <span class="visually-hidden"> (membuka situs eksternal)</span>
          </a>
          <p class="purchase-help">
            Pembayaran dan pengiriman diproses oleh {listing.label}. Listing terakhir diverifikasi {listing.lastVerified}.
          </p>
        </>
      ) : (
        <div class="purchase-unavailable" role="status" data-testid="not-purchasable">
          <p class="purchase-unavailable-title">{DISPLAY_STATE_LABEL[state]} — tidak dapat dibeli</p>
          <p>
            {state === 'demonstration'
              ? 'Ini adalah data demonstrasi untuk pratinjau toko. Produk belum divalidasi dan tidak dijual.'
              : state === 'paused'
                ? 'Penjualan produk ini sedang dijeda.'
                : 'Produk ini belum tersedia untuk dibeli. Tidak ada pembayaran yang dapat dilakukan.'}
          </p>
          <a href="/kontak" class="btn btn-secondary btn-block">Tanyakan produk ini</a>
        </div>
      )}
    </aside>
  )
}

export const ProductDetailPage: FC<{ product: Product; related: Product[] }> = ({ product, related }) => {
  const category = getCategory(product.category)
  const preview = product.previewImages[0]
  return (
    <>
      <div class="container">
        <Breadcrumbs
          items={[
            { href: '/', label: 'Beranda' },
            { href: '/produk', label: 'Produk' },
            ...(category ? [{ href: `/kategori/${category.slug}`, label: category.name }] : []),
            { label: product.title }
          ]}
        />
      </div>

      {product.kind === 'demonstration' && (
        <div class="container">
          <div class="alert alert-demo" role="note" id="demo-notice">
            <strong>Data demonstrasi.</strong> Halaman ini menunjukkan struktur informasi produk HOLBERY. Isi, harga, dan
            deliverable belum final, belum melalui validasi, dan produk ini tidak dapat dibeli.
          </div>
        </div>
      )}

      <article class="product-detail" id="product-detail" itemscope>
        <div class="container product-hero">
          <div class="product-hero-media">
            {preview && (
              <figure>
                <img src={preview.src} alt={preview.alt} width={800} height={600} />
                {preview.illustrative && <figcaption>Gambar ilustrasi, bukan tangkapan layar produk akhir.</figcaption>}
              </figure>
            )}
          </div>
          <div class="product-hero-info">
            {category && (
              <a class="eyebrow eyebrow-link" href={`/kategori/${category.slug}`}>
                {category.name}
              </a>
            )}
            <h1 class="product-title">{product.title}</h1>
            <p class="product-lead">{product.shortDescription}</p>
            <PurchasePanel product={product} />
          </div>
        </div>

        <div class="container product-body">
          <div class="product-main">
            <section class="detail-section" aria-labelledby="sec-overview">
              <h2 id="sec-overview">Ringkasan</h2>
              {product.fullDescription.map((p) => (
                <p>{p}</p>
              ))}
            </section>

            <section class="detail-section detail-pair" aria-label="Untuk siapa dan masalah yang diselesaikan">
              <div>
                <h2 id="sec-for">Untuk siapa</h2>
                <p>{product.targetCustomer}</p>
              </div>
              <div>
                <h2 id="sec-problem">Masalah yang diselesaikan</h2>
                <p>{product.problemSolved}</p>
              </div>
            </section>

            <section class="detail-section" aria-labelledby="sec-included">
              <h2 id="sec-included">Yang Anda dapatkan</h2>
              {product.deliverables.length > 0 ? (
                <ul class="deliverables" role="list">
                  {product.deliverables.map((d) => (
                    <li>
                      <div class="deliverable-head">
                        <span class="deliverable-name">{d.name}</span>
                        <span class="deliverable-format">{d.format}</span>
                      </div>
                      <p>{d.description}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Deliverable belum ditentukan.</p>
              )}
            </section>

            <section class="detail-section" aria-labelledby="sec-howto">
              <h2 id="sec-howto">Cara menggunakan</h2>
              <ol class="steps">
                {product.howToUse.map((s) => (
                  <li>{s}</li>
                ))}
              </ol>
            </section>

            <section class="detail-section" aria-labelledby="sec-license">
              <h2 id="sec-license">Lisensi & penggunaan</h2>
              <p class="license-name">{product.license.name}</p>
              <div class="detail-pair">
                <div>
                  <h3>Diperbolehkan</h3>
                  <ul class="check-list">
                    {product.license.permitted.map((x) => (
                      <li>{x}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3>Tidak diperbolehkan</h3>
                  <ul class="cross-list">
                    {product.license.notPermitted.map((x) => (
                      <li>{x}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            <section class="detail-section" aria-labelledby="sec-support">
              <h2 id="sec-support">Dukungan & pembaruan</h2>
              <h3>Dukungan</h3>
              <p>{product.supportPolicy}</p>
              <h3>Pembaruan</h3>
              <p>{product.updatePolicy}</p>
              <h3>Pengiriman</h3>
              <p>{product.deliveryNote}</p>
            </section>
          </div>

          <aside class="product-specs" aria-labelledby="sec-specs">
            <h2 id="sec-specs">Spesifikasi</h2>
            <dl class="spec-list">
              <div>
                <dt>Format file</dt>
                <dd>{product.fileFormats.join(', ')}</dd>
              </div>
              <div>
                <dt>Bahasa</dt>
                <dd>{product.languages.join(', ')}</dd>
              </div>
              <div>
                <dt>Kompatibilitas</dt>
                <dd>
                  <ul>
                    {product.compatibility.map((c) => (
                      <li>{c}</li>
                    ))}
                  </ul>
                </dd>
              </div>
              <div>
                <dt>Versi</dt>
                <dd>{product.version}</dd>
              </div>
              <div>
                <dt>Status publikasi</dt>
                <dd>{STATUS_LABEL[product.status]}</dd>
              </div>
              <div>
                <dt>Tinjauan kualitas</dt>
                <dd>{REVIEW_LABEL[product.reviews.quality]}</dd>
              </div>
              <div>
                <dt>Tinjauan hak cipta</dt>
                <dd>{REVIEW_LABEL[product.reviews.rights]}</dd>
              </div>
              <div>
                <dt>Bukti validasi</dt>
                <dd>{product.validationEvidence.length > 0 ? `${product.validationEvidence.length} catatan` : 'Belum ada'}</dd>
              </div>
              <div>
                <dt>Terakhir diperbarui</dt>
                <dd><time datetime={product.updatedAt}>{product.updatedAt}</time></dd>
              </div>
            </dl>
          </aside>
        </div>
      </article>

      {related.length > 0 && (
        <section class="section section-alt" aria-labelledby="related-title" id="related-section">
          <div class="container">
            <h2 id="related-title" class="section-title">Produk lain</h2>
            <ProductGrid products={related} />
          </div>
        </section>
      )}
    </>
  )
}
