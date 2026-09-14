# The Stack generators

PULSE and VALUATION are generated, not hand-edited. Change these scripts, then rebuild.

| File | What it does |
| --- | --- |
| stack_lib.js | Palette, 5x7 bitmap glyphs, SVG and DAX code generation helpers |
| stack_measures_a.js | Desk, card headers, PULSE chart and ledger measures |
| stack_measures_b.js | VALUATION finding, EPS ladder, ledger, scenario keys, P/E strip |
| build_model_stack.js | Writes the measures, the Glyphs calculated table and Scenario sort into the semantic model |
| report_lib.js | PBIR JSON builders (image, textbox, painted button, button slicer, page) |
| build_report_stack.js | Writes the stack_pulse and stack_valuation pages, hides the v1 pages |
| test_stack_dax.js | Emits a DAX query that evaluates every measure against the running model |

Rebuild from this folder:

```
node build_model_stack.js
node build_report_stack.js
powerbi-report-author validate ../../DEERE_CYCLEBOOK.Report
```

Model changes need Power BI Desktop to close and reopen the project; powerbi-desktop reload only reloads report files.
