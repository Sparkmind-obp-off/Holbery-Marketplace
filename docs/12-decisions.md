# Architecture Decision Records

## ADR-001: Separate repository
Status: Accepted. HOLBERY Marketplace lives separately from HIO and Bozq One System. This gives independent scope, releases, access controls, and rollback. Any shared integration requires explicit contracts and authorization.

## ADR-002: First-party storefront before multi-vendor
Status: Accepted. The first release sells HOLBERY-owned products only, avoiding seller onboarding, moderation, payout, and support complexity while demand is unproven. Revisit after demonstrated seller demand and a documented legal/operational plan.

## ADR-003: Static-first MVP
Status: Proposed. Prefer a simple storefront/catalog before accounts, database, checkout, or AI runtime. Revisit when a measurable requirement cannot be met with the current architecture.

## ADR-004: Channel checkout first where compliant
Status: Proposed. Use a verified compliant external channel for the first paid transactions if it supports the product format. Verify current policies and account eligibility for every channel/product type.
