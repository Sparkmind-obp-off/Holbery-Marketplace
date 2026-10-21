# Data Model — Initial Contract

Status: Proposed schema; no production database is implied.

## Catalog product fields
- Identity: id, slug, SKU, title, category, status.
- Description: short description, full description, target customer, job-to-be-done.
- Deliverables: name, format, and description for each included item.
- Compatibility: languages, required apps, file types, device/platform limitations.
- Commercial terms: price, currency, license, version, support policy, update policy.
- Delivery: external channel, protected download, manual, or not yet available.
- Review: validation evidence, rights review, quality review.
- Distribution: channel, listing URL, status, last-checked date.
- Audit: created and updated timestamps.

## Product states
Draft, review, published, paused, archived.

## Future order states
Created, pending payment, paid, delivery pending, delivered, refunded, cancelled, failed.

An order may become paid only after trusted server-side confirmation. Store provider references and state transitions, not raw payment credentials. Webhook handling must verify signatures and be idempotent.

## Data minimization
Collect only what is needed for fulfillment, support, accounting, and legal compliance. Define retention before launch. Restrict order access to authorized operators and audit privileged access.

## Validation rules
- ID, slug, and SKU must be unique.
- Price representation must use one documented convention consistently.
- Published products must pass rights and quality reviews, include at least one deliverable, and disclose delivery method.
- Published content must not include internal notes, private asset URLs, secrets, or customer data.
- Products not available for purchase must not display a buy CTA.
