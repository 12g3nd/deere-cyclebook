# DEERE // CYCLEBOOK

An equity research report on Deere & Company, built in Power BI. Seven cards walk from the latest quarter through the segments and the farm cycle to a scenario model and what today's share price assumes. Every figure is tagged ACTUAL (reported), GUIDANCE (management's outlook) or MODEL (my assumption).

## See it

`web/` is the report as a static web page. Every card image on it is the Power BI model's own output, exported for every setting of the controls, so the buttons, the scenario keys and the sales, margin and P/E strips all work without Power BI.

## Open it in Power BI Desktop

1. Clone or download the repo and keep the folder whole. `DEERE_CYCLEBOOK.pbip` needs the `.Report` and `.SemanticModel` folders beside it.
2. Open `DEERE_CYCLEBOOK.pbip` in Power BI Desktop (Windows).
3. Choose **Refresh**. Deere's figures are in the project, and the FRED and Nasdaq data load from the web. If Power BI asks about those sources, set their privacy level to **Public**.

## The cards

1. **PULSE**: the latest quarter, and which segments are growing.
2. **FINANCIALS**: net income by fiscal year against FY2026 guidance, and what Q4 needs.
3. **SEGMENTS**: operating profit by segment and quarter.
4. **THE CYCLE**: crop prices, interest rates, housing starts and farm income from FRED.
5. **MODEL LAB**: scenario, sales and margin settings that build FY2026 operating profit, net income and EPS.
6. **VALUATION**: the EPS Deere has to earn at each P/E at today's price, against its record, guidance and my range.
7. **SOURCES**: where every figure comes from.

## Update the web page

After a data refresh or a report change:

1. Open `DEERE_CYCLEBOOK.pbip` in Power BI Desktop and wait for the report to load.
2. Run `node tools/web/export_web.js`. It reads the card layouts from the report files, asks the model for every card image at every control setting, and writes `web/data/`.
3. Preview it with `node tools/web/serve.js` at http://localhost:4173.
4. Commit `web/` and push.

## How it's built

- `tools/stack` generates the report: DAX measures that draw each card as SVG, and the PBIR pages that place them.
- `tools/web` exports the static page from the open model.
- [DESIGN.md](DESIGN.md) is the design system ("The Stack"), and [documentation](documentation/) has the build notes.

The scenarios are my assumptions, not investment advice.
