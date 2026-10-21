# HOLBERY Product Portfolio Architecture
**Version:** 1.0  
**Date:** 2026-10-21  
**Status:** Research-backed portfolio hypothesis — not a claim that every item exists or is validated  
**Owner:** HOLBERY  
**Canonical marketplace repo:** https://github.com/Sparkmind-obp-off/Holbery-Marketplace  
**Research source:** Shipee SEA MCP product search, Indonesia market; dataset's latest seller/listing datapoint is 2026-09-22.

## 1. Portfolio rule

HOLBERY should not publish a large catalog of imagined products. Build a hierarchy where each child product has a real buyer, a painful job, a usable deliverable, proof of quality, and a legal route to sale.

**Parent brand → Product family → Customer segment → Job-to-be-done → Product → Bundle/upgrade → Service/software expansion.**

Keep one product record and one canonical SKU per actual deliverable. Names, prices, formats, and features are not products until a usable artifact exists and passes QA.

## 2. Evidence from Shopee MCP research

These are observed marketplace listings, not independently verified sales ledgers. Counts may cover only stored listings; the connector explicitly warns that product coverage and sold-count ranking are incomplete. Use them as directional signals, not total-market estimates or proof that HOLBERY's version will sell.

| Observed listing | Price observed | Sold count | Monthly sold count | Rating / reviews | Signal |
|---|---:|---:|---:|---:|---|
| Aplikasi Kasir Android Offline — KASMINI STOK | Rp214.000 | 10,000 | 184 | 4.93 / 5,236 | Retail/POS software has a visible paid market |
| Aplikasi Kasir SID Retail PRO (Windows) | Rp25.000 | 6,000 | 165 | 4.90 / 2,848 | Low-price software listings compete strongly; licensing/support risk must be checked |
| Template Excel Laporan Keuangan Siap Pakai | Rp19.999 | 3,000 | 9 | 4.80 / 933 | Clear signal for simple finance spreadsheets |
| Aplikasi Kasir untuk jasa servis, petshop, salon, barbershop — KASMINI SERVIS | Rp219.000 | 893 | 18 | 4.93 / 337 | Vertical-specific service business software is a relevant signal |
| Template Excel Slip Gaji & KPI Kehadiran | Rp25.999 | 731 | 6 | 4.93 / 302 | Payroll/attendance templates have visible demand |
| 12 Template Excel KPI Dashboard | Rp9.999 | 681 | 21 | 4.83 / 234 | Low-ticket dashboards compete on breadth and price |
| Template Excel Kalkulator HPP Otomatis | Rp69.999 | 24 | 5 | 5.00 / 6 | HPP/pricing problem is plausible but this particular listing has much weaker evidence |

Source listing URLs:
- https://shopee.co.id/product/173991649/19331426501
- https://shopee.co.id/product/56245882/23104747431
- https://shopee.co.id/product/777210158/18627947155
- https://shopee.co.id/product/173991649/22146246352
- https://shopee.co.id/product/1008008235/22245055998
- https://shopee.co.id/product/1097885119/27374649726
- https://shopee.co.id/product/562900107/52305915099

### Interpretation

1. Finance/operations templates have visible demand, but generic spreadsheets are highly price-competitive.
2. Vertical-specific software appears at higher price points, but copying software functionality is not automatically the right move: support, compatibility, licensing, updates, and trust are harder.
3. A narrow, job-specific workflow product can be a better first test than a broad “AI business system”.
4. Shopee search results do not prove that Shopee permits every type of downloadable file, software key, or off-platform fulfillment. Verify the current seller/product policy before listing there. Do not use a prohibited category or evade platform enforcement.
5. Searches for “konsinyasi”, “stok barang”, “template invoice”, and “template WhatsApp bisnis” returned no matching records in this connector query. That means no result was found in this dataset/query, not that demand is zero.

## 3. Hierarchical product map

### L0 — HOLBERY
One parent company/brand, not a collection of disconnected microbrands.

### L1 — Product families

**A. BUSINESS CONTROL — spreadsheets and operating kits**
- A1. Money & reporting: daily sales log, cash flow, simple profit/loss, monthly close checklist.
- A2. Pricing & margin: HPP calculator, service/product pricing, break-even and target calculator.
- A3. Stock & purchasing: stock ledger, reorder threshold, supplier/purchase log, shrinkage check.
- A4. Sales & customer follow-up: quote/order tracker, customer follow-up templates, repeat-purchase reminders.
- A5. People & SOP: shift/attendance template, simple payroll helper, role-based SOPs.
- A6. Owner dashboard: weekly KPI dashboard assembled from the preceding inputs.

**B. VERTICAL BUSINESS KITS — same core logic, adapted to one trade**
- B1. Barber & salon: service menu/pricing, daily cut log, capster commission, product stock, customer revisit, weekly owner report.
- B2. Small food/drink business: recipe costing, menu margin, daily sales, waste and stock.
- B3. Warung/retail: purchases, stock movement, cash reconciliation, supplier debt.
- B4. Consignment/multi-outlet: per-outlet stock, sold/remaining units, settlement, return/damage reconciliation. This is a hypothesis to validate; the current MCP searches did not establish demand for the exact “konsinyasi” phrase.
- B5. Freelancers/service operators: quote, job tracking, deposits, expenses, customer follow-up.

**C. DIGITAL OPERATING SYSTEMS — higher complexity, only after workflow validation**
- C1. Lightweight web tools that automate one proven workbook workflow.
- C2. Vertical micro-SaaS for one customer type.
- C3. Integrations/automation with clear data access and privacy boundaries.
- C4. Owner dashboard and reporting. Do not build a general-purpose AI platform before a repeated paid workflow is established.

**D. IMPLEMENTATION SERVICES — optional cash-flow bridge**
- D1. Setup and customization of a proven template.
- D2. Data cleanup/import and onboarding.
- D3. Monthly reporting/operating review.
- D4. Custom automation only after the customer pays for the scope. Do not rely on cold spam or assume a buyer exists.

### L2 — Product maturity ladder

1. **Research card:** buyer, job, evidence, competitor links, platform-policy status.
2. **Problem test:** real conversations or public evidence showing pain and current workaround.
3. **Prototype:** one complete, usable artifact with sample data clearly marked.
4. **Quality gate:** formulas/tests, instructions, compatibility, privacy, license, and refund terms.
5. **Offer gate:** approved price, deliverables, preview, terms, support, and delivery method.
6. **Payment/delivery gate:** real production checkout and server-verified paid state; private asset delivery tested.
7. **Sales evidence:** genuine buyer, paid order, fulfillment, support outcome, and refund/chargeback observation.
8. **Expansion:** bundle, add-on, vertical variant, service, or software only when buyer evidence supports it.

No product skips a gate because an AI generated a file or a page renders.

## 4. Prioritization model

Score each opportunity 0–5, with evidence attached:
- observed demand / paid market signal (25%)
- severity and frequency of buyer problem (20%)
- ability to reach buyers without spam (15%)
- prototype speed and zero/low cost (15%)
- defensibility / fit with HOLBERY capabilities (10%)
- support burden and implementation risk (10%, inverse score)
- platform/legal compatibility (5%)

A high Shopee sold count is one signal, not a sufficient score. Record missing data as unknown, not zero or an invented number.

## 5. Current priority order

### P0 — Validate first
**A narrow operations/finance toolkit for small operators**, because Shopee MCP data shows a 3,000-sold finance spreadsheet listing and a 681-sold KPI dashboard listing. This is a category signal, not yet proof of the exact best product.

Run buyer/problem validation against two candidate wedges:
1. **Daily sales + cash reconciliation + weekly owner summary** for small operators.
2. **Vertical-specific pricing/stock/follow-up kit** for a known trade, with barber/salon as an accessible research segment.

Do not declare BRS the winner solely because it already exists. Compare its actual contents, buyer specificity, price, and evidence with the alternatives. Preserve the current BRS artifact as a candidate; do not discard it without evidence.

### P1 — Build one smallest paid offer
Choose only after comparing actual product assets and buyer evidence. It should solve one complete workflow, not be a bundle of unrelated PDFs.

### P2 — Payment and delivery
Use the canonical HOLBERY Commerce path with Duitku POP JS Production if the latest code/configuration and owner-approved production state confirm it is the right path. Do not build a duplicate payment system in Marketplace. Do not create a production invoice or charge during research/audit.

### P3 — Distribution assets
Create the faceless product video from the real deliverable and actual product UI only after the chosen offer and page are accurate. Video is distribution, not proof of demand.

### P4 — Portfolio expansion
Add product families and more products after first real paid evidence and observed support burden.

## 6. Product record minimum schema

Each opportunity/product must track:
- product_id / SKU / parent family / vertical / version
- target buyer and job-to-be-done
- problem evidence with source URL, date, excerpt/summary, and evidence class
- alternatives and competitor listing IDs/URLs
- customer conversations and consent/source notes
- product files, hashes, license/IP provenance, compatibility
- price hypothesis and validation status
- distribution channel and channel-policy check date
- checkout/payment provider and fulfillment route
- QA/test results, known limitations, support and refund terms
- status: idea → researching → validating → prototype → QA → offer-ready → payment/delivery verified → sold/learning → maintained/retired
- decision log and next measurable test

## 7. Research protocol using Shopee SEA MCP

The operator MUST use the Shopee MCP tools for Shopee market questions and product prioritization:
1. Search several synonymous Indonesian buyer terms, not just one exact phrase.
2. Record query, country, date, returned listing IDs, price, sold count, monthly sold count, rating, reviews, shop, URL, listing date.
3. Fetch promising product and shop details before drawing stronger conclusions.
4. Compare at least three independent shops where the result set allows it.
5. Mark missing fields and connector coverage limitations explicitly.
6. Do not infer monthly sales from lifetime sold count; do not treat ratings as verified product quality.
7. Never scrape beyond available authorized MCP results or invent listing URLs.
8. Check current official marketplace rules before proposing to list digital downloads/software; if uncertain, keep the own-site channel separate and flag policy review.
9. Do not copy competitors' text, files, brand assets, software, or proprietary workbook design. Use competitors only as demand and positioning evidence.
10. Separate physical goods demand from digital product demand. Physical stock, affiliate/resale, digital files, and software licenses have different cost, fulfillment, and policy risks.

## 8. Guardrails

- Never fabricate customers, reviews, testimonials, sold counts, market size, conversion, revenue, or payment success.
- Do not use a public competitor listing as proof that a product is legally licensed or platform-compliant.
- Do not activate demonstration catalog records as purchasable.
- Do not publish or alter production payment settings, secrets, legal policies, prices, or public campaigns without required owner approval.
- Do not import HIO or Bozq One System / Bosku Cukur private information or code into this portfolio.
- Keep the product portfolio original, useful, small enough to support, and evidence-led.

## 9. First required operator output

Before writing more products or code, deliver:
1. A concise research table with source links and limitations.
2. A ranked shortlist of no more than three candidate products.
3. A comparison of existing BRS against the top candidates.
4. The one recommended first offer and the reason.
5. A list of unknowns that block purchase-readiness.
6. The smallest next experiment to test buyer willingness to pay.

Do not create a new product just to fill the catalog.
