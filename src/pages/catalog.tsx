import type { FC } from 'hono/jsx'
import { CATEGORIES, type Category } from '../catalog/categories'
import type { Product } from '../catalog/schema'
import { SORT_OPTIONS, type CatalogQuery } from '../catalog/query'
import { getPublicProducts } from '../catalog'
import { ProductGrid } from '../components/ProductCard'
import { EmptyState, PageHeader } from '../components/Common'

export const HomePage: FC<{ featured: Product[] }> = ({ featured }) => {
  const all = getPublicProducts()
  const countFor = (slug: string) => all.filter((p) => p.category === slug).length
  return (
    <>
      <section class="hero" id="hero-section" aria-labelledby="hero-title">
        <div class="container hero-inner">
          <p class="eyebrow">Toko resmi produk digital HOLBERY</p>
          <h1 id="hero-title" class="hero-title">Alat kerja digital yang jelas isinya, jujur janjinya.</h1>
          <p class="hero-lead">
            Template, spreadsheet, panduan PDF, alat bisnis, software, dan workflow AI praktis — dirancang untuk satu pekerjaan
            nyata, lengkap dengan petunjuk, kompatibilitas, dan lisensi yang jelas sebelum Anda membeli.
          </p>
          <form class="hero-search" action="/produk" method="get" role="search">
            <label for="hero-search-input" class="visually-hidden">Cari produk</label>
            <input id="hero-search-input" type="search" name="q" placeholder="Mis. arus kas, HPP, SOP…" maxlength={80} />
            <button type="submit" class="btn btn-primary">Cari</button>
          </form>
        </div>
      </section>

      <section class="section" id="principles-section" aria-labelledby="principles-title">
        <div class="container">
          <h2 id="principles-title" class="section-title">Cara kami membuat produk</h2>
          <ul class="principles" role="list">
            <li>
              <h3>Satu masalah, satu solusi</h3>
              <p>Setiap produk dimulai dari pekerjaan spesifik yang ingin diselesaikan pelanggan — bukan dari tren.</p>
            </li>
            <li>
              <h3>Isi yang transparan</h3>
              <p>Deliverable, format file, kompatibilitas, dan batasan dicantumkan sebelum pembelian.</p>
            </li>
            <li>
              <h3>Tanpa klaim berlebihan</h3>
              <p>Tidak ada testimoni palsu, angka penjualan rekaan, atau janji hasil finansial.</p>
            </li>
            <li>
              <h3>Ditinjau manusia</h3>
              <p>Produk melalui pemeriksaan kualitas dan hak cipta sebelum dipublikasikan.</p>
            </li>
          </ul>
        </div>
      </section>

      <section class="section section-alt" id="categories-section" aria-labelledby="categories-title">
        <div class="container">
          <div class="section-head">
            <h2 id="categories-title" class="section-title">Jelajahi kategori</h2>
            <a href="/produk" class="link-arrow">Lihat semua produk</a>
          </div>
          <ul class="category-grid" role="list">
            {CATEGORIES.map((c) => (
              <li>
                <a href={`/kategori/${c.slug}`} class="category-card">
                  <h3 class="category-card-title">{c.name}</h3>
                  <p class="category-card-desc">{c.description}</p>
                  <span class="category-card-count">
                    {countFor(c.slug) > 0 ? `${countFor(c.slug)} produk` : 'Belum ada produk'}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section class="section" id="featured-section" aria-labelledby="featured-title">
        <div class="container">
          <div class="section-head">
            <h2 id="featured-title" class="section-title">Dalam pengembangan</h2>
            <a href="/produk" class="link-arrow">Semua produk</a>
          </div>
          <p class="section-lead">
            Berikut contoh produk yang sedang dirancang. Semuanya masih <strong>data demonstrasi</strong> — belum divalidasi dan belum
            dapat dibeli.
          </p>
          <ProductGrid products={featured} />
        </div>
      </section>
    </>
  )
}

const FilterBar: FC<{ query: CatalogQuery; action: string; showCategory: boolean }> = ({ query, action, showCategory }) => (
  <form class="filter-bar" action={action} method="get" role="search" aria-label="Filter katalog" id="catalog-filter">
    <div class="field field-grow">
      <label for="catalog-q">Cari</label>
      <input id="catalog-q" type="search" name="q" value={query.q} placeholder="Nama, format, atau kebutuhan…" maxlength={80} />
    </div>
    {showCategory && (
      <div class="field">
        <label for="catalog-category">Kategori</label>
        <select id="catalog-category" name="category" data-autosubmit>
          <option value="">Semua kategori</option>
          {CATEGORIES.map((c) => (
            <option value={c.slug} selected={query.category === c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
    )}
    <div class="field">
      <label for="catalog-sort">Urutkan</label>
      <select id="catalog-sort" name="sort" data-autosubmit>
        {Object.entries(SORT_OPTIONS).map(([k, label]) => (
          <option value={k} selected={query.sort === k}>
            {label}
          </option>
        ))}
      </select>
    </div>
    <div class="field field-action">
      <button type="submit" class="btn btn-primary">Terapkan</button>
    </div>
  </form>
)

const ResultSummary: FC<{ count: number; query: CatalogQuery; resetHref: string }> = ({ count, query, resetHref }) => (
  <div class="result-summary" aria-live="polite">
    <p>
      {count} produk{query.q ? <> untuk “<strong>{query.q}</strong>”</> : null}
    </p>
    {(query.q || query.sort !== 'relevance' || query.category) && (
      <a href={resetHref} class="link-reset">Hapus filter</a>
    )}
  </div>
)

export const ProductListPage: FC<{ products: Product[]; query: CatalogQuery }> = ({ products, query }) => (
  <>
    <PageHeader
      title="Semua Produk"
      lead="Telusuri seluruh katalog HOLBERY. Gunakan pencarian, kategori, dan urutan untuk menemukan alat yang sesuai."
      crumbs={[{ href: '/', label: 'Beranda' }, { label: 'Semua Produk' }]}
    />
    <section class="section section-tight" aria-label="Hasil katalog">
      <div class="container">
        <FilterBar query={query} action="/produk" showCategory />
        <ResultSummary count={products.length} query={query} resetHref="/produk" />
        {products.length > 0 ? (
          <ProductGrid products={products} headingLevel="h2" />
        ) : (
          <EmptyState title="Tidak ada produk yang cocok">
            <p>Coba kata kunci lain, pilih kategori berbeda, atau <a href="/produk">lihat semua produk</a>.</p>
          </EmptyState>
        )}
      </div>
    </section>
  </>
)

export const CategoryPage: FC<{ category: Category; products: Product[]; query: CatalogQuery }> = ({ category, products, query }) => (
  <>
    <PageHeader
      eyebrow={category.nameEn}
      title={category.name}
      lead={category.description}
      crumbs={[{ href: '/', label: 'Beranda' }, { href: '/produk', label: 'Produk' }, { label: category.name }]}
    />
    <section class="section section-tight" aria-label={`Produk ${category.name}`}>
      <div class="container">
        <nav class="chip-nav" aria-label="Kategori lain">
          <ul>
            {CATEGORIES.map((c) => (
              <li>
                <a href={`/kategori/${c.slug}`} class="chip" aria-current={c.slug === category.slug ? 'page' : undefined}>
                  {c.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <FilterBar query={query} action={`/kategori/${category.slug}`} showCategory={false} />
        <ResultSummary count={products.length} query={{ ...query, category: null }} resetHref={`/kategori/${category.slug}`} />
        {products.length > 0 ? (
          <ProductGrid products={products} headingLevel="h2" />
        ) : (
          <EmptyState title={query.q ? 'Tidak ada produk yang cocok' : 'Belum ada produk di kategori ini'}>
            <p>
              {query.q
                ? 'Coba kata kunci lain atau hapus filter.'
                : 'Produk untuk kategori ini sedang dirancang dan akan muncul setelah lolos validasi.'}{' '}
              <a href="/produk">Lihat semua produk</a>.
            </p>
          </EmptyState>
        )}
      </div>
    </section>
  </>
)
