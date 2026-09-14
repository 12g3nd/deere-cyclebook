# DEERE // CYCLEBOOK — Builder’s Manual

## 1. What you are looking at

Power BI has three layers that beginners often blur together:

1. **Power Query** acquires and transforms data. In this project, Deere actuals are embedded for portability while FRED is loaded from the web.
2. **The semantic model** defines tables, relationships, measures and business logic. CYCLEBOOK uses TMDL, Microsoft’s text representation of a tabular model.
3. **The report** is the interactive interface: pages, charts, slicers, text and formatting. CYCLEBOOK uses PBIR, the text representation of a Power BI report.

The `.pbip` file is basically the front door. The interesting machinery lives in the sibling `.SemanticModel` and `.Report` folders.

## 2. Why the model is built this way

### Company actuals are embedded

Public-company financial statements are small at the grain we need. Embedding them means the project opens on another Windows machine without a broken local CSV path. Copies of the source-shaped data are still included in `/data` for auditability.

### Macro data is live

`Macro Data.tmdl` contains a Power Query function called `GetFred`. It calls FRED’s CSV endpoint, standardizes each series, labels it, and appends the series into one long table. This is a useful production pattern: one reusable function, one normalized schema.

### Facts and dimensions

`Period` and `Segment` are dimensions. `Quarterly Financials`, `Quarterly Segments`, `Annual Financials` and `Annual Segments` contain observations. Relationships let a filter on `Period` or `Segment` flow into the appropriate fact table.

That separation is the beginning of a **star schema**, the most important modeling habit to learn in Power BI. Star schemas make measures easier to reason about and usually outperform giant flat tables.

## 3. DAX: the mental model

DAX measures do not store a number. They store a recipe that is evaluated under the current **filter context**.

For example:

```DAX
Segment Operating Margin =
DIVIDE([Segment Operating Profit], [Segment Sales])
```

On a chart with Segment on the axis, Power BI evaluates that same measure once for PPA, once for SAT and once for Construction & Forestry. Add a period slicer and the context narrows again.

### Latest-quarter pattern

```DAX
Latest Revenue =
VAR p = [Latest Period Key]
RETURN
    CALCULATE(
        [Quarter Revenue],
        REMOVEFILTERS('Period'),
        'Period'[Period Key] = p
    )
```

This is a compact example of why DAX is different from Excel. `CALCULATE` changes filter context. `REMOVEFILTERS` prevents a stray page period selection from turning “latest quarter” into “latest quarter within whatever the user happened to select.”

## 4. Scenario modeling

`Scenario`, `Sales Adjustment`, `Margin Adjustment` and `PE Multiple` are **disconnected tables**. They intentionally have no relationships.

A slicer selects a value. A measure retrieves it with `SELECTEDVALUE`, then uses it as an assumption.

```DAX
Selected Sales Adjustment =
SELECTEDVALUE('Sales Adjustment'[Sales Adjustment], 0)
```

The model then combines:

- FY2025 reported segment sales
- a scenario growth assumption
- your incremental sales sensitivity
- a scenario operating-margin assumption
- your incremental margin-basis-point sensitivity

This is the Power BI equivalent of the assumptions section in a financial model, except every downstream visual recalculates instantly.

## 5. Why the Base case is special

The Base case uses Deere’s current Q3 FY2026 segment-sales outlook as its growth anchor:

- Production & Precision Agriculture: down about 10%
- Small Agriculture & Turf: up about 15%
- Construction & Forestry: up about 20%

Its $4.875B net-income assumption is the midpoint of management’s current $4.75B–$5.00B guidance. Margins are analyst assumptions, not Deere guidance, and are therefore kept in the MODEL bucket.

This distinction matters. A good analyst tool makes provenance visible.

## 6. Valuation chain

The valuation is intentionally simple enough to audit in your head:

```text
Scenario net income
÷ assumed diluted shares
= projected EPS

Projected EPS
× selected P/E multiple
= implied value per share
```

That simplicity is a feature. A complicated DCF would create more knobs, but it would not automatically create more insight. Once you are comfortable with this version, the natural extension is a three-statement / free-cash-flow valuation module.

## 7. Fiscal periods vs calendar dates

Deere’s company results remain on Deere fiscal periods. The macro series retain normal calendar dates.

Do not casually relabel Deere fiscal Q3 as “calendar Q3.” That looks harmless in a class dashboard but is analytically wrong. In professional BI work, time semantics are part of data quality.

## 8. Visual design system

CYCLEBOOK avoids the default dashboard grammar of floating rounded cards. Instead it uses:

- 1920×1080 canvas
- warm off-white canvas and dark wallpaper
- one primary green signal color
- yellow only as a secondary analytical accent
- squared containers
- Bahnschrift for engineered typography
- Consolas for micro-labels and provenance
- separate text labels above charts rather than decorative visual titles
- whitespace and rules to establish hierarchy

The main lesson: **Power BI design is information architecture first, decoration second.**

## 9. Files worth opening in a text editor

- `DEERE_CYCLEBOOK.SemanticModel/definition/model.tmdl`
- `.../relationships.tmdl`
- `.../tables/_Measures.tmdl`
- `.../tables/Macro Data.tmdl`
- `DEERE_CYCLEBOOK.Report/definition/pages/`
- `DEERE_CYCLEBOOK.Report/StaticResources/RegisteredResources/`

Because PBIP is text-based, Git can show exactly what changed when you add a measure or move a visual. This is a radically better workflow for serious BI engineering than treating a `.pbix` as an opaque blob.

## 10. First exercises after it opens

1. In **Model view**, trace the four relationships and explain which side is one vs many.
2. In **Transform data**, inspect `Macro Data` and identify the `GetFred` function pattern.
3. In **MODEL LAB**, select Bear/Base/Bull and then add +5% sales sensitivity. Predict the result before looking.
4. Open the `Model Segment Sales` DAX measure and trace every dependency backward.
5. Duplicate THE CYCLE and add the CAD-per-USD series. Decide whether it actually improves the investment thesis. Delete it if it does not.
6. Create your own measure: `Net Income Margin = Net Income / Net Sales & Revenues`.
7. Add a tooltip page only after you can explain what filter context it will inherit.

## 11. Interview talk track

Do not describe this as “I made a dashboard.” A stronger explanation is:

> I built a Power BI equity-research workstation for Deere using real reported financial and segment data, live macroeconomic data from FRED, a star-schema semantic model, DAX measures and disconnected scenario parameters. The report separates actuals, management guidance and analyst assumptions, then turns the assumptions into an interactive operating and valuation model.

Then show MODEL // PROVENANCE. It signals that you understand data lineage, not just chart formatting.

## 12. What to learn next

The highest-value extensions are calculation groups for reusable time intelligence, a proper daily market-price dataset, a DCF / FCF model, parameterized company ingestion, and a reusable FI99 public-company research template.
