import { describe, expect, it } from 'vitest'
import app from '../src/index'
import { getPublicProducts } from '../src/catalog'

const get = (path: string) => app.request(path)

describe('storefront routes', () => {
  it.each([
    '/',
    '/produk',
    '/kategori/bisnis-keuangan',
    '/tentang',
    '/faq',
    '/kontak',
    '/kebijakan-privasi',
    '/syarat-ketentuan',
    '/kebijakan-refund'
  ])('GET %s returns 200 HTML', async (path) => {
    const res = await get(path)
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toContain('text/html')
    const html = await res.text()
    expect(html.startsWith('<!doctype html>')).toBe(true)
    expect(html).toContain('<main id="main-content"')
    expect(html).toContain('<link rel="canonical"')
    expect(html).toContain('og:title')
  })

  it('every category page renders', async () => {
    for (const slug of ['produktivitas-operasional', 'kreatif-desain', 'pengetahuan-edukasi', 'software-tools', 'ai-otomasi', 'solusi-industri', 'bundel-sistem-premium']) {
      expect((await get(`/kategori/${slug}`)).status).toBe(200)
    }
  })

  it('returns 404 page for unknown product, category and path', async () => {
    for (const p of ['/produk/tidak-ada', '/kategori/tidak-ada', '/acak']) {
      const res = await get(p)
      expect(res.status).toBe(404)
      expect(await res.text()).toContain('Halaman tidak ditemukan')
    }
  })

  it('returns JSON 404 for unknown API path', async () => {
    const res = await get('/api/tidak-ada')
    expect(res.status).toBe(404)
    expect(await res.json()).toEqual({ error: 'not_found' })
  })

  it('sets security headers including CSP', async () => {
    const res = await get('/')
    expect(res.headers.get('content-security-policy')).toContain("default-src 'self'")
    expect(res.headers.get('x-content-type-options')).toBe('nosniff')
  })
})

describe('demonstration products cannot be purchased', () => {
  it('no product page renders a buy button; each shows the not-purchasable state', async () => {
    const products = getPublicProducts()
    expect(products.length).toBeGreaterThan(0)
    for (const p of products) {
      const html = await (await get(`/produk/${p.slug}`)).text()
      expect(html).not.toContain('data-testid="buy-button"')
      expect(html).toContain('data-testid="not-purchasable"')
      expect(html).toContain('Data demonstrasi')
      expect(html).toContain('noindex')
    }
  })

  it('API reports purchasable=false for every record', async () => {
    const body = (await (await get('/api/products')).json()) as { products: { purchasable: boolean }[] }
    expect(body.products.every((p) => p.purchasable === false)).toBe(true)
  })

  it('sitemap excludes demonstration products', async () => {
    const xml = await (await get('/sitemap.xml')).text()
    expect(xml).not.toContain('/produk/workbook-arus-kas-penjual-mikro')
    expect(xml).toContain('/kategori/ai-otomasi')
  })
})

describe('search and filtering via HTTP', () => {
  it('filters by search query', async () => {
    const html = await (await get('/produk?q=hpp')).text()
    expect(html).toContain('Kalkulator HPP')
    expect(html).not.toContain('Paket SOP Usaha Jasa Kecil')
  })

  it('shows empty state when nothing matches', async () => {
    const html = await (await get('/produk?q=zzzz-tidak-ada')).text()
    expect(html).toContain('Tidak ada produk yang cocok')
  })

  it('escapes untrusted search input (no reflected XSS)', async () => {
    const html = await (await get('/produk?q=%3Cscript%3Ealert(1)%3C%2Fscript%3E')).text()
    expect(html).not.toContain('<script>alert(1)</script>')
    expect(html).toContain('&lt;script&gt;')
  })

  it('ignores invalid category and sort values', async () => {
    const res = await get('/produk?category=evil&sort=drop')
    expect(res.status).toBe(200)
  })
})

describe('robots and aliases', () => {
  it('serves robots.txt with sitemap', async () => {
    const txt = await (await get('/robots.txt')).text()
    expect(txt).toContain('Sitemap:')
    expect(txt).toContain('Disallow: /api/')
  })

  it('redirects English aliases', async () => {
    const res = await get('/about')
    expect(res.status).toBe(301)
    expect(res.headers.get('location')).toBe('/tentang')
  })
})
