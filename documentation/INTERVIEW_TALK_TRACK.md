# CYCLEBOOK — Portfolio / Interview Notes

## 20-second version
I built a research report on John Deere in Power BI. It runs on Deere's reported numbers and live FRED data, and you can change my assumptions to see what earnings today's price needs. I tagged every number as reported, guided or assumed, because that's the first thing I'd want to know.

## What makes it more than a dashboard
- Explicit star-schema relationships.
- Real company actuals with source provenance.
- Live Power Query web ingestion for macro data.
- DAX measures that respect filter context.
- Disconnected assumptions tables for financial modeling.
- Bear/Base/Bull operating cases and P/E valuation.
- Actual vs Guidance vs Model labeling.
- PBIP/PBIR/TMDL project structure that can be version controlled.

## Best demo sequence
1. Open PULSE and explain the portfolio divergence.
2. Move to SEGMENTS and show how PPA peak-cycle profitability compressed.
3. Open THE CYCLE and connect the company to external demand drivers.
4. Go to MODEL LAB and change Scenario, Sales Adjustment and Margin Adjustment.
5. Finish at VALUATION // THESIS and explain the valuation chain.
6. If the interviewer is technical, open MODEL // PROVENANCE or Model view.

## One sentence for a resume project bullet
Built a 7-page Power BI equity research report on Deere & Company, with a DAX scenario model linking segment sales and margin assumptions to EPS and implied share value.
