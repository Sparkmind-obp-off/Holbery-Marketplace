# Security, Privacy, and Access Control

## Security baseline
- Never commit API keys, tokens, cookies, private keys, payment credentials, customer exports, or environment files.
- Keep a sanitized example environment file with placeholders only.
- Store runtime secrets in the deployment provider's secret manager.
- Enforce server-side validation and authorization for every write or private read.
- Use least privilege for GitHub, hosting, payment, storage, and analytics access.
- Separate preview and production credentials/data.
- Review dependencies and update them deliberately.
- Do not expose stack traces or provider responses to public clients.
- Back up mutable production data and test restoration.

## Privacy baseline
- Publish a plain-language privacy notice before collecting personal data.
- Collect only data needed for a stated purpose.
- Use consent where required for non-essential tracking or marketing.
- Provide a contact path for privacy requests.
- Document retention and deletion rules.
- Keep personal data out of public issues, PRs, analytics URLs, and test fixtures.
- Use synthetic data in development and screenshots.

## Roles
- Owner: final approval of release, pricing, legal pages, and production access.
- Operator: manages approved catalog/support workflows within assigned permissions.
- Contributor: proposes changes through branches and PRs; no production secrets by default.
- Customer: accesses public catalog and only their authorized purchases if accounts are introduced.

## Incident response
1. Contain: revoke exposed credentials and disable affected integration.
2. Assess scope, logs, affected data, and notification obligations.
3. Recover from a known-good revision or backup.
4. Rotate secrets and validate controls.
5. Document timeline, impact, cause, and prevention without publishing secrets or personal data.

## Release gate
Do not launch if secrets are exposed, authorization is client-only, private deliverables are publicly enumerable, or payment confirmation can be spoofed.
