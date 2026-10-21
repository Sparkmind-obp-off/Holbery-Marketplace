# System Architecture

Status: Proposed; deployment and integrations are not yet verified.

## Boundaries
- HOLBERY Marketplace: storefront, product catalog, product metadata, channel references, and future order/delivery workflows.
- HOLBERY Intelligent OS (HIO): separate internal system. No shared production changes or implicit data access.
- Bozq One System: private Bosku Cukur system and explicitly out of scope.
- External sales channels: independent platforms with their own rules and capabilities.
- Payment provider: external system; payment confirmation must be verified server-side.

## MVP approach
Choose the simplest stack already supported by the repository and hosting environment. If starting clean, prefer a lightweight TypeScript web app with static-first rendering and a small API only when needed. Do not add a database, queue, framework, or AI API without a concrete requirement.

Potential target: Cloudflare Pages for the storefront, with Workers and D1 only if dynamic features require them. This is a proposal, not a claim that deployment is configured.

## Components
1. Storefront: home, categories, product detail, FAQs, support, and policy pages.
2. Catalog source: structured product records with validation.
3. Asset storage: public previews separated from paid/private deliverables.
4. Channel registry: channel-specific URL, status, price, format restrictions, and last-checked date.
5. Order adapter, later: provider-neutral order state and verified server-side payment events.
6. Delivery service, later: time-limited or authenticated access to purchased files.
7. Analytics: minimal aggregate events and clear privacy disclosures.
8. Operations: backups, deployment checks, incident handling, and content review.

## Data flow
Catalog authoring → validation/review → storefront publication → channel listing → buyer order → trusted payment confirmation → delivery → minimal status record → support/refund workflow.

For the MVP, external channel checkout can remain the source of truth. Do not build internal checkout until channel constraints and payment capabilities are confirmed.

## Environment separation
Local development, preview deployment, and production use separate credentials and data. Preview environments must not access production payment credentials or private customer data.

## Rules
- Separate business logic from presentation.
- Validate external inputs on the server.
- Use least privilege and deny-by-default authorization.
- Keep provider-specific logic behind adapters.
- Make migrations and deployment repeatable.
- Document data collection and retention.
- Feature-flag incomplete integrations.
