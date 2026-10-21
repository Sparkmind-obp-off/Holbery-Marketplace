# Architecture Decision Records

## ADR-001: Separate repository
Status: Accepted. HOLBERY Marketplace lives separately from HIO and Bozq One System. This gives independent scope, releases, access controls, and rollback. Any shared integration requires explicit contracts and authorization.

## ADR-002: First-party storefront before multi-vendor
Status: Accepted. The first release sells HOLBERY-owned products only, avoiding seller onboarding, moderation, payout, and support complexity while demand is unproven. Revisit after demonstrated seller demand and a documented legal/operational plan.

## ADR-003: Static-first MVP
Status: Proposed. Prefer a simple storefront/catalog before accounts, database, checkout, or AI runtime. Revisit when a measurable requirement cannot be met with the current architecture.

## ADR-004: Channel checkout first where compliant
Status: Proposed. Use a verified compliant external channel for the first paid transactions if it supports the product format. Verify current policies and account eligibility for every channel/product type.

## ADR-005: Phase 1 stack
Status: Accepted (2026-10-21). Server-rendered Hono JSX on Cloudflare Pages Functions, built with Vite. Catalog lives as typed data in the repository and is validated with Zod at build time and worker start. No database, KV, R2, CDN, web fonts, or analytics. Reason: zero cost, works without JavaScript, strict CSP, and the catalog is small and owner-edited. Revisit when an operator needs to edit the catalog without a commit, or when order/delivery state must be stored (D1/R2 then).

## ADR-006: Purchase gate
Status: Accepted (2026-10-21). One function, `isPurchasable()` in `src/catalog/rules.ts`, decides whether a buy CTA renders. It requires a real published product, passed reviews, a real delivery method, and a verified active `https://` listing. The schema rejects contradictory records. Demonstration records can never be purchasable.
