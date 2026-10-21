# HOLBERY Marketplace

A product-owned digital marketplace and distribution platform for original HOLBERY digital products, tools, templates, workbooks, guides, and software.

## Project status

**Phase 1 — static-first storefront: implemented and deployed as a preview.**

- The storefront, catalog, validation rules, and policy pages work.
- The catalog contains **demonstration records only** (`kind: "demonstration"`). They are clearly labelled, marked `noindex`, left out of the sitemap, and **cannot be purchased**.
- **No payment provider, checkout, or protected file delivery is active.** No marketplace listing is live.
- Legal pages (privacy, terms, refund) are **drafts** that need owner review before any sale.
- Public contacts are configured: `hello@holbery.biz.id`, `support@holbery.biz.id`, WhatsApp `085712658316`.
- Legal seller identity configured for display: **PT Waskita Cakrawarti Digital — Perseroan Perorangan**.
- First real product prototype is registered as a hidden draft; it is not yet validated or purchasable.

## URLs

| | URL |
|---|---|
| Production (Cloudflare Pages, project `holbery-marketplace`) | https://holbery-marketplace.pages.dev |
| GitHub | https://github.com/Sparkmind-obp-off/Holbery-Marketplace |
| Public catalog JSON | `/api/products` (read-only, public fields only) |
| Health | `/api/health` |

## Tech stack

- **Hono** (server-rendered JSX) on **Cloudflare Pages Functions**
- **Vite** + `@hono/vite-build` for the production bundle
- **Zod** for catalog schema validation
- **Vitest** for tests, **TypeScript** in strict mode
- Plain CSS design system. No CDN, web fonts, trackers, or third-party scripts. A strict CSP (`default-src 'self'`) is enforced.
- No D1, KV, or R2. The current scope doesn't need them (ADR-003).

## Routes

| Path | Page |
|---|---|
| `/` | Home |
| `/produk?q=&category=&sort=` | All products (search, category filter, sort) |
| `/kategori/:slug?q=&sort=` | Product category (8 categories) |
| `/produk/:slug` | Product detail |
| `/tentang` | About HOLBERY |
| `/faq` | FAQ (with FAQPage JSON-LD) |
| `/kontak` | Contact / Support |
| `/kebijakan-privasi` | Privacy Policy (draft) |
| `/syarat-ketentuan` | Terms of Service (draft) |
| `/kebijakan-refund` | Refund & Cancellation Policy (draft) |
| `/sitemap.xml`, `/robots.txt` | SEO |
| `/about`, `/products`, `/contact`, `/support`, `/privacy`, `/terms`, `/refund` | 301 → Indonesian canonical paths |

Sort keys: `relevance`, `newest`, `price-asc`, `price-desc`, `title-asc`. Invalid input is ignored, and search terms are capped at 80 characters.

## Project structure

```
src/
  catalog/
    schema.ts       Zod product schema + publication rules (single source of truth)
    categories.ts   8 product categories
    products.ts     Catalog records (currently demonstration only)
    rules.ts        Visibility, purchasability, display-state rules
    query.ts        Search / filter / sort / price formatting
    index.ts        Validated catalog + public accessors
  components/       Layout, ProductCard, breadcrumbs, empty state
  pages/            Home/list/category, product detail, content & policy pages
  config/site.ts    Public, non-secret site configuration
  index.tsx         Hono app: routes, security headers, SEO, 404/500
public/static/      CSS, small progressive-enhancement JS, favicon, preview SVGs
scripts/validate-catalog.ts   CLI validator (runs before every build)
tests/              Catalog rules + HTTP route tests
```

## Catalog data model

All product records live in `src/catalog/products.ts` and are validated against `src/catalog/schema.ts` when the module loads and again before each build.

Fields: `id`, `sku`, `slug`, `kind`, `title`, `category`, `shortDescription`, `fullDescription`, `targetCustomer`, `problemSolved`, `deliverables`, `fileFormats`, `languages`, `compatibility`, `howToUse`, `price {amount, currency}`, `version`, `license`, `previewImages`, `deliveryMethod`, `deliveryNote`, `supportPolicy`, `updatePolicy`, `status`, `availability`, `reviews {quality, rights}`, `validationEvidence`, `channelListings`, `tags`, `createdAt`, `updatedAt`.

**Price convention:** an integer in the ISO 4217 minor unit. IDR uses exponent 0, so Rp49.000 is stored as `49000`. USD $9.99 is stored as `999`.

**Enforced rules:**
- `id`, `sku`, and `slug` are unique and well-formed.
- A `published` product must be `kind: product`, pass both quality and rights reviews, have at least one deliverable, have a real delivery method, and include validation evidence.
- An `available` product must be published and have an `active` channel listing with an `https://` URL and a `lastVerified` date.
- Demonstration records can't be published, available, or carry active listings.
- Preview images must live under `/static/previews/`, so private deliverables can never be referenced.
- The public site shows real products only when they are `published` or `paused`. Draft, review, and archived records stay hidden.
- **A buy button renders only when `isPurchasable()` is true** (`src/catalog/rules.ts`). It links to the verified external listing. There is no internal checkout.

### Adding a real product

1. Add a record with `kind: "product"` and `status: "draft"`.
2. Collect validation evidence, then complete the quality and rights reviews.
3. Publish the listing manually on a compliant channel and verify it.
4. Add the listing as `status: "active"` with `url` and `lastVerified`. Set `status: "published"` and `availability: "available"`.
5. Run `npm run check`. Once real products exist, set `SITE.showDemonstrationRecords = false`.

## Development

Requirements: Node.js 20+ and npm.

```bash
npm install
npm run dev                # Vite dev server
npm run validate:catalog   # validate catalog
npm run typecheck          # tsc --noEmit
npm test                   # vitest
npm run build              # validate + production build into dist/
npm run check              # typecheck + tests + build
npm run preview            # wrangler pages dev dist on :3000
```

Inside the sandbox: `npm run build && pm2 start ecosystem.config.cjs`.

## Deployment (Cloudflare Pages)

The project is deployed to the owner's Cloudflare account as the Pages project `holbery-marketplace` (production branch `main`). It is separate from the HIO Pages project.

```bash
export CLOUDFLARE_API_TOKEN=...   # never commit
npm run build
npx wrangler pages deploy dist --project-name holbery-marketplace --branch main
```

Optional plain variable: `SITE_URL` (canonical URL for SEO; defaults to `https://holbery-marketplace.pages.dev`). See `.env.example`. No secrets are needed right now.

**Rollback:** in the Cloudflare dashboard, go to Pages → `holbery-marketplace` → Deployments and roll back to a previous deployment. Or redeploy a known-good commit.

## Security

- No secrets in the repo or client bundle. `.env`, `.dev.vars`, and `.wrangler/` are gitignored.
- Strict CSP, `X-Content-Type-Options`, a frame-ancestors restriction, a referrer policy, and a permissions policy that disables camera, microphone, geolocation, and payment.
- Untrusted query input is normalised and bounded, and all output is escaped by Hono JSX (covered by tests).
- No cookies, accounts, analytics, or personal-data collection.

## Not yet implemented

- Market validation and quality/rights review for the first real product prototype.
- A verified sales-channel listing (Shopee, TikTok Shop, Etsy, etc.) or tested first-party checkout.
- Owner/legal review of the draft policy pages.
- Owner and legal review of the draft policy pages.
- First-party checkout (e.g. Duitku) and protected delivery. Phase 4 is conditional and needs production credentials, signed webhooks, idempotency, and end-to-end tests (see `docs/07-payments-and-delivery.md`).
- A custom domain.
- Privacy-conscious analytics, if needed.

## Scope boundaries

This repository owns the HOLBERY Marketplace storefront, product catalog, product delivery, distribution workflows, and marketplace analytics. HOLBERY Intelligent OS (HIO) is a separate system. Bozq One System is private to Bosku Cukur and out of scope. Do not copy secrets, customer data, or internal HIO/Bozq data into this repository.

## Docs

[Product vision](docs/01-product-vision.md) · [Requirements](docs/02-requirements.md) · [Architecture](docs/03-architecture.md) · [Taxonomy](docs/04-product-taxonomy.md) · [Data model](docs/05-data-model.md) · [Security](docs/06-security-privacy.md) · [Payments](docs/07-payments-and-delivery.md) · [Roadmap](docs/10-roadmap.md) · [Decisions](docs/12-decisions.md) · [Contributing](CONTRIBUTING.md) · [Security policy](SECURITY.md)
