# Operations Runbook

## Operating loop
1. Check product and channel listing status.
2. Respond to customer questions within the published support window.
3. Verify delivery issues/refunds using authorized records.
4. Log meaningful feedback without unnecessary personal data.
5. Update versions and changelog when deliverables change.
6. Review product economics and policy changes periodically.

## Release workflow
1. Create a focused branch.
2. Make the change and update relevant tests/docs.
3. Run format, lint, type-check, tests, and build where applicable.
4. Open a PR with purpose, risks, evidence, and rollback notes.
5. Review security, accessibility, truthfulness, and licensing.
6. Obtain owner approval for public-facing and production changes.
7. Merge only after checks pass.
8. Verify deployment and record the release commit.

## Rollback
Identify the last known-good commit/deployment, revert or redeploy, preserve necessary audit evidence, verify storefront/catalog/delivery/support, and document cause and follow-up.

## Backup and recovery
Keep source in Git. Export mutable catalog/order data according to retention policy. Store backups with restricted access and separate from the primary environment. Test restoration periodically. Never commit secrets in backups.

## Incident severity
- Critical: credential exposure, unauthorized access, payment spoofing, private asset exposure.
- High: checkout/delivery outage or data corruption.
- Normal: catalog display issue or non-critical error.
- Low: copy/design improvement.

Report verified facts separately from assumptions. Never call an integration live without successful verification.
