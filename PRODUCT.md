# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

A Power BI report (PBIR project) read through a published web link. The Power BI service renders it in the viewer's browser as a fixed 1920x1080 canvas scaled to fit the window; there is no HTML or CSS of our own, so layout, type and color are set through report JSON and DAX-generated SVG.

## Users

Primary: finance hiring managers (equity research, investment banking, corporate finance) evaluating the author as an analyst candidate. They open a published Power BI web link on their own, with no presenter, usually on a laptop between other work. They read research notes, 10-Ks and valuation models every day. Their job: decide within minutes whether the author thinks like an analyst: the numbers are right, the thesis is clear, the assumptions are labeled.

The bar is set by the most senior reader: a high-finance executive who has seen every pitch book and research deck. It has to wow them, not merely look competent (author's steer, 2026-09-14).

Secondary: prospects of the author's company, fi99.ca, judging build quality. Lower priority than hiring managers.

## Product Purpose

DEERE // CYCLEBOOK is an equity-research workstation on Deere & Company (NYSE: DE), built in Power BI. It combines reported financial and segment history, management guidance, live macro drivers from FRED, and an interactive bear/base/bull operating model with P/E valuation.

It exists as a portfolio piece for the author's resume and for fi99.ca. Success is a hiring manager's first reaction being "no way a chatbot made this", followed by trust in the numbers.

## Positioning

Every figure declares where it came from: ACTUAL (reported), GUIDANCE (management) or MODEL (the author's assumption). The model is small enough to audit in your head. It runs on live public data rather than a static spreadsheet, and the whole report is version-controlled text (PBIP), not an opaque file.

## Operating Context

- Explored alone through a published web link: navigation, slicers and tooltips must explain themselves.
- Also the author's vehicle for learning Power BI; plain-language documentation ships with it.
- Deere fiscal periods (fiscal year ends around November 1) stay distinct from calendar-dated macro series.

## Capabilities and Constraints

- Power BI report authored as PBIP/PBIR/TMDL, 1920×1080 pages. Validated with `powerbi-report-author`; verified with Power BI Desktop Bridge screenshots. The surface is a Power BI report, not HTML/CSS.
- Currency: USD everywhere, matching Deere's filings (confirmed).
- Data in the model: Deere annual FY2022–FY2025, quarterly FY2024 Q1–FY2026 Q3, segment sales and operating profit; FRED corn, soybeans, federal funds rate, housing starts, construction spending, CAD/USD, U.S. net farm income.
- Data available but not yet modeled: daily DE share price from Nasdaq's public quote endpoint (verified 2026-09-13; close $675.74 on 2026-09-11).
- Management guidance on hand: FY2026 net income $4.75B–$5.00B; segment sales outlook PPA about −10%, SAT about +15%, C&F about +20% (Q3 FY2026 release, 2026-08-20).
- Unconfirmed: whether the author's Power BI account can publish to the web (UofT tenant policy).
- Fonts: published reports render in the viewer's browser. Power BI defaults to Segoe UI and DIN, which Microsoft notes may fall back on macOS; Bahnschrift is Windows-only. Arial, Verdana, Tahoma and Courier New render reliably on both platforms.
- No custom visuals assumed (tenant policy unknown). Native visuals and DAX-generated SVG only.
- Scenarios are the author's assumptions, not investment advice.

## Brand Commitments

- Name: DEERE // CYCLEBOOK.
- Voice: every narrative sentence is rewritten by the author (`_brief/VOICE_REWRITES.md`). Do not ship generated-sounding prose.
- Must not read as AI-generated. Author-named taste references: teenage.engineering, aesop.com, vacation.inc, oatly.com (signals, not templates).
- Identity: an analyst publication about Deere, not Deere-branded. Deere green and yellow make occasional, purposeful appearances; never a full livery (author's steer, 2026-09-14).
- Deere is the subject, not the publisher: no Deere logos or marks.

## Evidence on Hand

- Deere quarterly news releases Q1 FY2025–Q3 FY2026: `sources/*.pdf`
- Source-shaped data: `data/*.csv`
- Live FRED series (Power Query)
- None on hand, never fabricate: analyst price targets, consensus estimates, third-party research, testimonials.

## Product Principles

1. Provenance is visible on every number: actual, guidance or model, never ambiguous.
2. Auditable beats impressive: any output traces back to its inputs.
3. Real data only. Missing data shows as missing.
4. It stands alone: nobody is there to explain it.
5. The author's own voice in every sentence.
