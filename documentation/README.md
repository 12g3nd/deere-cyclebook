# DEERE // CYCLEBOOK

An interactive equity research report on Deere & Company (operating cycle, scenario model and valuation), built as a Power BI Project (PBIP).

## Open it

1. Extract the entire `DEERE_CYCLEBOOK` folder. Do not move only the `.pbip` file; it depends on the adjacent `.Report` and `.SemanticModel` folders.
2. In Power BI Desktop, enable **Power BI Project (.pbip) save option** under Preview features if your build still requires it.
3. Open `DEERE_CYCLEBOOK.pbip`.
4. Choose **Refresh**. The Deere company data is embedded and portable. The macro tables pull public data from FRED; Power BI may ask you to approve the `https://fred.stlouisfed.org` data source. Set the privacy level to **Public**.
5. Save the project. If you want a conventional binary afterward, use **File → Save a copy** / PBIX options available in your Desktop version.

## What is real vs modeled

- **ACTUAL**: Deere reported historical financial and segment data, plus FRED series.
- **GUIDANCE**: Deere management outlook, most importantly the Q3 FY2026 $4.75B–$5.00B net-income range and segment-sales outlook.
- **MODEL**: CYCLEBOOK bear/base/bull assumptions and user sensitivities. These are not presented as company forecasts.

## Pages

1. **PULSE** — latest quarter, portfolio divergence, revenue trend, segment inflection.
2. **FINANCIALS** — annual and quarterly earnings arc.
3. **SEGMENTS** — PPA vs Small Ag & Turf vs Construction & Forestry.
4. **THE CYCLE** — live FRED commodity, rates, housing and farm-income context.
5. **MODEL LAB** — scenario, sales-growth and margin sensitivity controls.
6. **VALUATION // THESIS** — scenario EPS, P/E valuation, catalysts and risks.
7. **MODEL // PROVENANCE** — sources, architecture and refresh behavior.

## Design intent

The report uses a restrained industrial editorial system: warm paper, graphite, John-Deere-adjacent green as structural signal, yellow used sparingly, hard edges, Bahnschrift/Consolas microtypography, hairline rules and transparent chart surfaces. The goal is closer to an analyst instrument or field manual than a generic KPI-card dashboard.

## Important build note

This project was generated from the documented PBIP/PBIR/TMDL formats without a Windows Power BI Desktop runtime inside the build environment. The project files were structurally checked, but the final rendering must be verified in your installed Power BI Desktop. If Desktop reports a schema/rendering error, preserve the exact error text or screenshot; PBIR is text-based, so the issue can be patched directly rather than rebuilding the report from scratch.
