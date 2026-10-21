import { Hono, type Context } from 'hono'
import { secureHeaders } from 'hono/secure-headers'
import type { Child } from 'hono/jsx'
import { SITE } from './config/site'
import {
  CATEGORIES,
  getCategory,
  getPublicProductBySlug,
  getPublicProducts,
  parseCatalogQuery,
  queryCatalog,
  formatPrice,
  isPurchasable,
  getActiveListing
} from './catalog'
import { Layout, type PageMeta } from './components/Layout'
import { CategoryPage, HomePage, ProductListPage } from './pages/catalog'
import { ProductDetailPage } from './pages/product'
import { AboutPage, ContactPage, ErrorPage, FaqPage, FAQS, NotFoundPage, PrivacyPage, RefundPage, TermsPage } from './pages/content'

export type Bindings = {
  /** Public canonical URL (plain variable, not a secret). */
  SITE_URL?: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.use(
  '*',
  secureHeaders({
    contentSecurityPolicy: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'", 'data:'],
      fontSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      objectSrc: ["'none'"]
    },
    referrerPolicy: 'strict-origin-when-cross-origin',
    permissionsPolicy: { camera: [], microphone: [], geolocation: [], payment: [] }
  })
)

function siteUrl(c: Context<{ Bindings: Bindings }>): string {
  const configured = c.env?.SITE_URL
  if (configured && /^https?:\/\//.test(configured)) return configured.replace(/\/+$/, '')
  return SITE.defaultUrl
}

function render(c: Context<{ Bindings: Bindings }>, meta: Omit<PageMeta, 'siteUrl' | 'path'> & { path?: string }, body: Child, status: 200 | 404 | 500 = 200) {
  const path = meta.path ?? new URL(c.req.url).pathname
  const html = (
    <Layout meta={{ ...meta, path, siteUrl: siteUrl(c) }} currentPath={new URL(c.req.url).pathname}>
      {body}
    </Layout>
  )
  c.header('Cache-Control', 'public, max-age=300')
  return c.html('<!doctype html>' + html.toString(), status)
}

// ---------- Pages ----------

app.get('/', (c) => {
  const featured = getPublicProducts().slice(0, 3)
  return render(
    c,
    {
      title: SITE.name,
      description: SITE.description,
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE.name,
        url: siteUrl(c),
        potentialAction: {
          '@type': 'SearchAction',
          target: `${siteUrl(c)}/produk?q={search_term_string}`,
          'query-input': 'required name=search_term_string'
        }
      }
    },
    <HomePage featured={featured} />
  )
})

app.get('/produk', (c) => {
  const query = parseCatalogQuery(c.req.query())
  const products = queryCatalog(getPublicProducts(), query)
  const filtered = Boolean(query.q || query.category || query.sort !== 'relevance')
  return render(
    c,
    {
      title: 'Semua Produk',
      description: 'Katalog lengkap produk digital orisinal HOLBERY: template, spreadsheet, panduan, software, dan workflow AI.',
      path: '/produk',
      noindex: filtered
    },
    <ProductListPage products={products} query={query} />
  )
})

app.get('/produk/:slug', (c) => {
  const product = getPublicProductBySlug(c.req.param('slug'))
  if (!product) return c.notFound()
  const related = getPublicProducts()
    .filter((p) => p.slug !== product.slug)
    .sort((a, b) => Number(b.category === product.category) - Number(a.category === product.category))
    .slice(0, 3)
  const listing = getActiveListing(product)
  return render(
    c,
    {
      title: product.title,
      description: product.shortDescription,
      image: product.previewImages[0]?.src,
      type: 'product',
      // Demonstration records must not be indexed as if they were real offers.
      noindex: product.kind === 'demonstration',
      jsonLd:
        product.kind === 'product'
          ? {
              '@context': 'https://schema.org',
              '@type': 'Product',
              name: product.title,
              description: product.shortDescription,
              sku: product.sku,
              brand: { '@type': 'Brand', name: SITE.brand },
              ...(isPurchasable(product) && listing?.url
                ? {
                    offers: {
                      '@type': 'Offer',
                      price: product.price.currency === 'IDR' ? product.price.amount : product.price.amount / 100,
                      priceCurrency: product.price.currency,
                      availability: 'https://schema.org/InStock',
                      url: listing.url
                    }
                  }
                : {})
            }
          : undefined
    },
    <ProductDetailPage product={product} related={related} />
  )
})

app.get('/kategori/:slug', (c) => {
  const category = getCategory(c.req.param('slug'))
  if (!category) return c.notFound()
  const query = { ...parseCatalogQuery(c.req.query()), category: category.slug }
  const products = queryCatalog(getPublicProducts(), query)
  return render(
    c,
    {
      title: category.name,
      description: `${category.name}: ${category.description}`,
      path: `/kategori/${category.slug}`,
      noindex: Boolean(query.q || query.sort !== 'relevance')
    },
    <CategoryPage category={category} products={products} query={query} />
  )
})

app.get('/tentang', (c) =>
  render(c, { title: 'Tentang HOLBERY', description: 'Siapa HOLBERY dan bagaimana kami membuat produk digital orisinal.' }, <AboutPage />)
)
app.get('/faq', (c) =>
  render(
    c,
    {
      title: 'FAQ',
      description: 'Pertanyaan umum tentang produk, pembelian, pengiriman, dan lisensi HOLBERY Marketplace.',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } }))
      }
    },
    <FaqPage />
  )
)
app.get('/kontak', (c) =>
  render(c, { title: 'Kontak & Dukungan', description: 'Cara menghubungi dukungan HOLBERY Marketplace.' }, <ContactPage />)
)
app.get('/kebijakan-privasi', (c) =>
  render(c, { title: 'Kebijakan Privasi', description: 'Bagaimana HOLBERY Marketplace menangani data pengunjung.' }, <PrivacyPage />)
)
app.get('/syarat-ketentuan', (c) =>
  render(c, { title: 'Syarat & Ketentuan', description: 'Syarat dan ketentuan penggunaan HOLBERY Marketplace.' }, <TermsPage />)
)
app.get('/kebijakan-refund', (c) =>
  render(c, { title: 'Kebijakan Refund & Pembatalan', description: 'Kebijakan refund dan pembatalan produk digital HOLBERY.' }, <RefundPage />)
)

// English-friendly aliases → canonical Indonesian paths.
const ALIASES: Record<string, string> = {
  '/products': '/produk',
  '/about': '/tentang',
  '/contact': '/kontak',
  '/support': '/kontak',
  '/privacy': '/kebijakan-privasi',
  '/terms': '/syarat-ketentuan',
  '/refund': '/kebijakan-refund'
}
for (const [from, to] of Object.entries(ALIASES)) app.get(from, (c) => c.redirect(to, 301))

// ---------- Machine-readable ----------

/** Public, read-only catalog JSON. Exposes only public fields of visible products. */
app.get('/api/products', (c) => {
  const query = parseCatalogQuery(c.req.query())
  const products = queryCatalog(getPublicProducts(), query).map((p) => ({
    id: p.id,
    sku: p.sku,
    slug: p.slug,
    kind: p.kind,
    title: p.title,
    category: p.category,
    shortDescription: p.shortDescription,
    price: p.price,
    priceFormatted: formatPrice(p.price),
    status: p.status,
    availability: p.availability,
    purchasable: isPurchasable(p),
    url: `/produk/${p.slug}`
  }))
  c.header('Cache-Control', 'public, max-age=300')
  return c.json({ count: products.length, products })
})

app.get('/api/health', (c) => c.json({ status: 'ok' }))

app.get('/robots.txt', (c) => {
  c.header('Content-Type', 'text/plain; charset=utf-8')
  return c.body(`User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${siteUrl(c)}/sitemap.xml\n`)
})

app.get('/sitemap.xml', (c) => {
  const base = siteUrl(c)
  const staticPaths = ['/', '/produk', '/tentang', '/faq', '/kontak', '/kebijakan-privasi', '/syarat-ketentuan', '/kebijakan-refund']
  const urls = [
    ...staticPaths.map((p) => ({ loc: base + p, lastmod: SITE.policiesLastUpdated })),
    ...CATEGORIES.map((cat) => ({ loc: `${base}/kategori/${cat.slug}`, lastmod: SITE.policiesLastUpdated })),
    // Only real products are listed; demonstration records are noindex.
    ...getPublicProducts()
      .filter((p) => p.kind === 'product')
      .map((p) => ({ loc: `${base}/produk/${p.slug}`, lastmod: p.updatedAt }))
  ]
  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod></url>`).join('\n') +
    '\n</urlset>\n'
  c.header('Content-Type', 'application/xml; charset=utf-8')
  return c.body(xml)
})

// ---------- Errors ----------

app.notFound((c) => {
  if (new URL(c.req.url).pathname.startsWith('/api/')) return c.json({ error: 'not_found' }, 404)
  return render(c, { title: 'Halaman tidak ditemukan', description: 'Halaman tidak ditemukan.', noindex: true }, <NotFoundPage />, 404)
})

app.onError((err, c) => {
  console.error('Unhandled error:', err instanceof Error ? err.message : 'unknown')
  if (new URL(c.req.url).pathname.startsWith('/api/')) return c.json({ error: 'internal_error' }, 500)
  return render(c, { title: 'Terjadi kesalahan', description: 'Terjadi kesalahan.', noindex: true }, <ErrorPage />, 500)
})

export default app
