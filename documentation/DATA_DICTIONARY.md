# CYCLEBOOK — Data Dictionary

| Table | Grain | Purpose |
|---|---|---|
| Period | one row per Deere fiscal quarter | quarter sorting/filtering |
| Segment | one row per equipment segment | segment filtering and labels |
| Quarterly Financials | one row per fiscal quarter | consolidated quarterly actuals |
| Quarterly Segments | one row per quarter × segment | segment sales/profit/margin |
| Annual Financials | one row per fiscal year | annual consolidated history |
| Annual Segments | one row per year × segment | annual segment cycle |
| Scenario | one row per analyst case | Bear/Base/Bull assumptions |
| Sales Adjustment | one row per sensitivity choice | disconnected what-if control |
| Margin Adjustment | one row per bps choice | disconnected what-if control |
| P/E Multiple | one row per multiple | valuation control |
| Macro Data | one row per date × FRED series | live cycle indicators |
| Farm Income | one row per annual FRED observation | ag economics |
| Source Registry | one row per provenance entry | actual/guidance/model audit trail |
| _Measures | one dummy row | central DAX measure table |
