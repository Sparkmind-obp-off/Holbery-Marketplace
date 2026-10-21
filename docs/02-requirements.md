# Product Requirements Document

Status: Draft for MVP

## Users
- Shopper: discovers and evaluates a product.
- Buyer: purchases through a supported channel and receives the promised deliverable.
- Owner/operator: manages product metadata, listing status, assets, support notes, and performance.
- Contributor: proposes changes through a pull request and receives no production credentials by default.

## User stories
1. Shoppers can browse categories and understand what is included.
2. Product pages disclose price, language, format, compatibility, license, delivery, and support/update policy.
3. Operators can draft, review, publish, pause, and archive products.
4. Buyers can access the correct deliverable after a confirmed order through the selected channel.
5. Operators can trace an order reference to delivery status without exposing payment credentials or unnecessary personal data.
6. Visitors can find support and policy information.
7. Owners can export the catalog and maintain backups.
8. Contributors can submit changes with documented checks and no production secrets.

## MVP functional requirements
- Responsive landing page, category navigation, search/filter, and product detail pages.
- Catalog data separated from presentation.
- Product lifecycle: draft, review, published, paused, archived.
- Product records include SKU/slug, category, description, target customer, deliverables, format, language, compatibility, price/currency, license, version, delivery method, support, and update policy.
- Original product assets have clear ownership and access rules.
- Support page, privacy notice, terms, and refund policy suitable for the actual channel and applicable law.
- Basic privacy-conscious analytics, if needed.
- Semantic HTML, keyboard navigation, mobile layout, and useful error/empty states.
- Deployment instructions and rollback plan.

## Later requirements
- Secure order status and protected file delivery.
- Payment integration only after production account, credentials, webhooks, legal obligations, and end-to-end tests are verified.
- Operator dashboard and analytics only when manual work warrants it.
- Customer accounts only if necessary; browsing should not require an account.
- Automation only after manual workflows are proven.

## Acceptance criteria
- No placeholder product is represented as purchasable.
- Unpublished products are not exposed publicly.
- Prices and delivery terms match the active sales channel.
- Payment success is never inferred from a client redirect alone.
- Secrets are server-side and absent from Git, client bundles, and logs.
- Relevant tests and build checks pass before merge.
- Mobile and keyboard checks are completed.
- A real end-to-end order test is complete before claiming payment or delivery is live.

## Open questions
- Which sales channel launches first, based on verified platform rules?
- Which legal seller details must be public?
- Which payment provider is available for the deployment and jurisdiction?
- Which secure file-delivery method can be tested end-to-end?
