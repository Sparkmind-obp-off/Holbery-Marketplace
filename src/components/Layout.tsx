import type { Child, FC } from 'hono/jsx'
import { SITE } from '../config/site'
import { CATEGORIES } from '../catalog/categories'

export interface PageMeta {
  title: string
  description: string
  path: string
  siteUrl: string
  image?: string
  type?: 'website' | 'product' | 'article'
  noindex?: boolean
  jsonLd?: Record<string, unknown>
}

const NAV = [
  { href: '/produk', label: 'Semua Produk' },
  { href: '/tentang', label: 'Tentang' },
  { href: '/faq', label: 'FAQ' },
  { href: '/kontak', label: 'Kontak' }
]

export const Layout: FC<{ meta: PageMeta; currentPath: string; children?: Child }> = ({ meta, currentPath, children }) => {
  const fullTitle = meta.title === SITE.name ? SITE.name : `${meta.title} — ${SITE.name}`
  const canonical = new URL(meta.path, meta.siteUrl).toString()
  const image = new URL(meta.image ?? '/static/og-default.svg', meta.siteUrl).toString()
  const isActive = (href: string) => currentPath === href || currentPath.startsWith(href + '/')

  return (
    <html lang={SITE.lang} class="no-js">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{fullTitle}</title>
        <meta name="description" content={meta.description} />
        <link rel="canonical" href={canonical} />
        {meta.noindex && <meta name="robots" content="noindex, follow" />}
        <meta name="theme-color" content="#14211d" />
        <meta property="og:site_name" content={SITE.name} />
        <meta property="og:locale" content={SITE.locale} />
        <meta property="og:type" content={meta.type === 'product' ? 'product' : 'website'} />
        <meta property="og:title" content={fullTitle} />
        <meta property="og:description" content={meta.description} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={image} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={fullTitle} />
        <meta name="twitter:description" content={meta.description} />
        <meta name="twitter:image" content={image} />
        <link rel="icon" href="/static/favicon.svg" type="image/svg+xml" />
        <link rel="stylesheet" href="/static/styles.css" />
        {meta.jsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(meta.jsonLd).replace(/</g, '\\u003c') }}
          />
        )}
        <script src="/static/app.js" defer></script>
      </head>
      <body>
        <a class="skip-link" href="#main-content">Lewati ke konten utama</a>
        <header class="site-header" id="site-header">
          <div class="container header-inner">
            <a href="/" class="brand" aria-label="HOLBERY Marketplace — Beranda">
              <span class="brand-mark" aria-hidden="true">H</span>
              <span class="brand-text">
                HOLBERY <span class="brand-sub">Marketplace</span>
              </span>
            </a>
            <button class="nav-toggle" id="nav-toggle" type="button" aria-expanded="false" aria-controls="primary-nav">
              <span class="nav-toggle-bar" aria-hidden="true"></span>
              <span class="visually-hidden">Buka menu</span>
            </button>
            <nav id="primary-nav" class="primary-nav" aria-label="Navigasi utama">
              <ul>
                {NAV.map((n) => (
                  <li>
                    <a href={n.href} aria-current={isActive(n.href) ? 'page' : undefined}>
                      {n.label}
                    </a>
                  </li>
                ))}
              </ul>
              <form class="header-search" action="/produk" method="get" role="search">
                <label for="header-search-input" class="visually-hidden">Cari produk</label>
                <input id="header-search-input" type="search" name="q" placeholder="Cari produk…" maxlength={80} autocomplete="off" />
              </form>
            </nav>
          </div>
        </header>

        <div class="notice-bar" role="note">
          <div class="container">
            Pratinjau toko: produk yang tampil saat ini adalah <strong>data demonstrasi</strong> dan belum dapat dibeli.
          </div>
        </div>

        <main id="main-content" tabindex={-1}>
          {children}
        </main>

        <footer class="site-footer" id="site-footer">
          <div class="container footer-grid">
            <section aria-labelledby="footer-brand">
              <h2 id="footer-brand" class="footer-title">HOLBERY Marketplace</h2>
              <p class="footer-text">{SITE.tagline}</p>
            </section>
            <nav aria-labelledby="footer-categories">
              <h2 id="footer-categories" class="footer-title">Kategori</h2>
              <ul class="footer-links">
                {CATEGORIES.map((c) => (
                  <li>
                    <a href={`/kategori/${c.slug}`}>{c.name}</a>
                  </li>
                ))}
              </ul>
            </nav>
            <nav aria-labelledby="footer-help">
              <h2 id="footer-help" class="footer-title">Bantuan</h2>
              <ul class="footer-links">
                <li><a href="/tentang">Tentang HOLBERY</a></li>
                <li><a href="/faq">FAQ</a></li>
                <li><a href="/kontak">Kontak & Dukungan</a></li>
              </ul>
            </nav>
            <nav aria-labelledby="footer-legal">
              <h2 id="footer-legal" class="footer-title">Kebijakan</h2>
              <ul class="footer-links">
                <li><a href="/kebijakan-privasi">Kebijakan Privasi</a></li>
                <li><a href="/syarat-ketentuan">Syarat & Ketentuan</a></li>
                <li><a href="/kebijakan-refund">Refund & Pembatalan</a></li>
              </ul>
            </nav>
          </div>
          <div class="container footer-bottom">
            <p>© {new Date().getFullYear()} HOLBERY. Seluruh produk adalah karya orisinal HOLBERY.</p>
          </div>
        </footer>
      </body>
    </html>
  )
}
