# HOLBERY Marketplace

A product-owned digital marketplace and distribution platform for original HOLBERY digital products, tools, templates, workbooks, guides, and software.

## AI operating instructions

Use [`MASTER-SYSTEM-PROMPT-V3.md`](./MASTER-SYSTEM-PROMPT-V3.md) as the current operating prompt. V3 requires Shopee SEA MCP evidence before product decisions and follows the hierarchical portfolio in [`PRODUCT-PORTFOLIO-ARCHITECTURE.md`](./PRODUCT-PORTFOLIO-ARCHITECTURE.md). V2 and v1 are retained as historical baselines.

## Project status

**Phase 1 storefront: deployed. Phase 4 first-party checkout (Duitku POP Production): implemented, deployed, and gated.**

| Item | Status |
|---|---|
| Storefront, catalog, validation | IMPLEMENTED · DEPLOYED |
| Duitku production credentials | Stored as encrypted Pages secrets. Read-only `getpaymentmethod` returned HTTP 200 / `00` / 18 methods (2026-10-21) |
| D1 `holbery-marketplace-production` | Migrated (orders, order_events, rate_limits) · 0 orders |
| R2 `holbery-marketplace-deliverables` | Private bucket · no public URL · empty |
| Checkout runtime | **CLOSED**: `SUPPORT_CONTACT` is empty and no product passes the purchase gate |
| Real paid transaction | **NOT STARTED**: no invoice has been created and no payment has been made |

- The catalog contains demonstration records plus one real **draft** product (`HB-OPS-CONSIGN-001`, not public). None of them is purchasable.
- Legal pages are drafts (`TERMS_VERSION=HBM-TERMS-2026-10-DRAFT`) and need owner review.
- Do not call payment "live" or "production verified" until a genuine buyer payment is verified server-side and delivered (see `docs/07-payments-and-delivery.md` → Launch proof).

## URLs

| | URL |
|---|---|
| Production (Cloudflare Pages, project `holbery-marketplace`) | https://holbery-marketplace.pages.dev |
| GitHub | https://github.com/Sparkmind-obp-off/Holbery-Marketplace |
| Public catalog JSON | `/api/products` (read-only, public fields only) |
| Payment readiness | `/api/payments/readiness` (names of missing prerequisites only, no values) |
| Health | `/api/health` |

## Tech stack

- **Hono** (server-rendered JSX) on **Cloudflare Pages Functions**
- **Vite** + `@hono/vite-build` for the production bundle
- **Zod** for catalog schema validation
- **Vitest** for tests, **TypeScript** in strict mode
- Plain CSS design system. No CDN, web fonts, trackers, or third-party scripts. A strict CSP (`default-src 'self'`) is enforced.
- **Cloudflare D1** for orders, the audit trail, and rate limits. **Cloudflare R2 (private)** for paid deliverables.
- **Duitku POP (production)** for first-party payments. `duitku.js` loads only on product and order pages that can actually pay, and per-page CSP allows `app-prod.duitku.com` only there.

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
| `POST /api/checkout` | Create order + Duitku invoice (same-origin, rate-limited, gated) |
| `POST /api/payments/duitku/callback` | Duitku server notification (HMAC verified, then inquiry) |
| `/pesanan/:id?t=<token>` | Private order page (capability token, `no-store`, `no-referrer`, noindex) |
| `POST /api/orders/:id/reconcile?t=` | Buyer-triggered status check via Duitku `transactionStatus` |
| `/pesanan/:id/unduh?t=` | Protected download (PAID only, count + time limited, streamed from private R2) |
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

## First-party checkout (Duitku POP Production)

Flow, following the official docs (https://docs.duitku.com/pop/id/) and the parent Commerce contract:

1. The buyer submits name, email, and terms acceptance. The server validates them, applies a rate limit, and checks that the product is first-party eligible.
2. The server creates the order (`PENDING_PAYMENT`) with the **catalog price**. The browser never sends an amount.
3. The server calls `createInvoice`, signed with `HMAC_SHA256(merchantCode+timestamp, apiKey)`. It verifies that the response `paymentUrl` origin is `app-prod.duitku.com`, then stores the reference.
4. The browser calls `checkout.process(reference)`. POP events only redirect the buyer to the order page and **never change state**.
5. Duitku sends the callback. The server verifies `HMAC_SHA256(merchantCode+amount+merchantOrderId, apiKey)`, then calls **`transactionStatus`**, because the callback HMAC does not cover `resultCode`. An order becomes `PAID` only when order, amount, and reference all match. Callbacks are idempotent, and a DB trigger forbids reverting a PAID order.
6. The order page offers a download from private R2 (default 5 downloads within 30 days).

**Opening checkout for a real product** (each step needs owner approval):

1. Finish validation, QA, and the rights review. Set the product to `status: published`, `availability: available`, `deliveryMethod: protected_download`, and add `checkout: { provider: 'duitku_pop', deliverableKey: 'deliverables/<SKU>/<file>', deliverableFileName }`.
2. Upload the file privately: `npx wrangler r2 object put holbery-marketplace-deliverables/deliverables/<SKU>/<file> --file <path> --remote`.
3. Set `SUPPORT_CONTACT` (a monitored channel) and a final `TERMS_VERSION` in `wrangler.jsonc`, then build and deploy.
4. Confirm `/api/payments/readiness` shows `checkoutOpen: true`.
5. First real buyer: verify callback → inquiry → `PAID` → download, then record redacted evidence.

Kill switch: set `CHECKOUT_ENABLED` to `"false"` and redeploy.

**Credential rotation:** the API key was shared in chat, so rotate it in the Duitku merchant portal, then run `npx wrangler pages secret put DUITKU_API_KEY --project-name holbery-marketplace` and redeploy.

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

Plain vars live in `wrangler.jsonc` (`SITE_URL`, `DUITKU_ENV`, `CHECKOUT_ENABLED`, `TERMS_VERSION`, `SUPPORT_CONTACT`). Secrets are encrypted Pages secrets (`DUITKU_MERCHANT_CODE`, `DUITKU_API_KEY`) and are never committed. For local dev, put test values in `.dev.vars` (gitignored). D1 migrations: `npx wrangler d1 migrations apply holbery-marketplace-production --remote`.

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
- A real paid Duitku transaction (requires a genuine buyer and an approved product).
- Order notification emails (buyers currently rely on the private order link).
- An operator view for orders and refunds (for now, use `wrangler d1 execute` with read-only queries).
- A custom domain.
- Privacy-conscious analytics, if needed.

## Scope boundaries

This repository owns the HOLBERY Marketplace storefront, product catalog, product delivery, distribution workflows, and marketplace analytics. HOLBERY Intelligent OS (HIO) is a separate system. Bozq One System is private to Bosku Cukur and out of scope. Do not copy secrets, customer data, or internal HIO/Bozq data into this repository.

## Docs

[Product vision](docs/01-product-vision.md) · [Requirements](docs/02-requirements.md) · [Architecture](docs/03-architecture.md) · [Taxonomy](docs/04-product-taxonomy.md) · [Data model](docs/05-data-model.md) · [Security](docs/06-security-privacy.md) · [Payments](docs/07-payments-and-delivery.md) · [Roadmap](docs/10-roadmap.md) · [Decisions](docs/12-decisions.md) · [Contributing](CONTRIBUTING.md) · [Security policy](SECURITY.md)
