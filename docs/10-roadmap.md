# Roadmap

A phase is complete only when its acceptance criteria have been demonstrated.

## Phase 0 — Repository foundation
- [x] Create repository and initial README.
- [x] Add foundational documentation in this pull request.
- [ ] Review documentation and approve PR.
- [ ] Confirm repository visibility and branch protection.

## Phase 1 — Static-first storefront
- [x] Inspect repository files and select stack based on evidence (Hono + Vite + Cloudflare Pages, 2026-10-21).
- [x] Build responsive home, category, product detail, support, and policy pages.
- [x] Load catalog from validated structured data.
- [x] Add catalog schema checks and tests (53 automated tests).
- [ ] Complete accessibility and responsive checks (automated headless checks done: skip link, mobile menu, no horizontal overflow at 390px; manual screen-reader audit pending).
- [x] Deploy preview without checkout claims (https://holbery-marketplace.pages.dev, demonstration data only).

## Phase 2 — First validated products
- [ ] Collect evidence and select one narrow product.
- [ ] Create original usable deliverable and guide.
- [ ] Complete quality, compatibility, license, and rights review.
- [ ] Test with representative users where possible.
- [ ] Publish after owner approval and channel-policy verification.

## Phase 3 — Distribution
- [ ] Establish channel records and listing checklist.
- [ ] Publish manually to one compliant channel.
- [ ] Test listing, checkout, fulfillment, support, and refund experience.
- [ ] Record fees and net revenue.

## Phase 4 — Secure order and delivery, conditional
- [ ] Confirm first-party checkout is needed.
- [ ] Select verified production payment provider.
- [ ] Implement signed webhook verification, idempotency, order state machine, protected delivery, refunds, and audit logs.
- [ ] Complete security review and end-to-end tests.

## Phase 5 — Analytics and automation
- [ ] Add privacy-conscious analytics.
- [ ] Build operator views when manual operation becomes a bottleneck.
- [ ] Automate channel tasks only where official APIs and permissions allow.
- [ ] Review costs before adding AI/runtime dependencies.

## Release gate
Do not mark a phase complete from a plan or generated code alone. Attach test results, deployment evidence with secrets removed, and owner approval.
