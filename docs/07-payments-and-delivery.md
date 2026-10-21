# Payments and Digital Delivery

Status (2026-10-21): Duitku POP Production is IMPLEMENTED and DEPLOYED with checkout **closed by gates**. No invoice has been created and no real payment has occurred, so payment is NOT production-verified. Implementation: `src/payments/`, `src/routes/commerce.tsx`, `migrations/0001_orders.sql`. Tests: `tests/payments.test.ts`.

## Launch principle
Prefer checkout and fulfillment offered by a verified sales channel when that channel explicitly permits the product type. Confirm current seller rules for digital goods, file delivery, service listings, refunds, and prohibited content before publishing.

## Provider checklist
- Production account approved for the correct country and business setup.
- Production credentials and webhook configuration available.
- Payment methods, settlement timing, fees, refunds, disputes, and reconciliation documented.
- Signature verification and idempotency supported.
- Test/live environments clearly separated.
- Privacy, accounting, and legal obligations reviewed.

## Future first-party checkout flow
1. Server creates an order with unique reference, amount, and currency.
2. Server creates payment request with provider.
3. Buyer completes provider checkout.
4. Provider sends a signed server-to-server event.
5. Server verifies signature, amount, currency, order reference, and event freshness.
6. Server performs an idempotent state transition.
7. Delivery is granted only for verified paid orders.
8. Refund/revocation rules are recorded and applied.

## Digital file delivery
- Separate public previews from paid assets.
- Never place paid files in a publicly indexed folder or public object bucket.
- Use short-lived signed links or authenticated access when supported.
- Avoid permanent reusable download links on public order pages.
- Log only what is necessary for troubleshooting and abuse prevention.
- Provide a recovery procedure for legitimate buyers.
- Validate uploaded file type and size.

## Launch proof
Complete an end-to-end test using an approved production test process. Test duplicate/out-of-order events, delivery, and refund handling. If checks are incomplete, mark the integration blocked or unconfigured.
