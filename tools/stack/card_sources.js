// The Stack, SOURCES card: the source registry drawn from the model's own table, and how fresh each input is.
const { C, svgOpen, svgDefs, daxStr } = require("./stack_lib");
const { ledger, ledgerHeight, header, finding2, tag } = require("./stack_measures_a");

const finding = finding2("VAR _none = 0",
  `"Every ledger figure in this stack carries a tag that says where it came from."`,
  `"ACTUAL: reported by Deere, FRED or Nasdaq. GUIDANCE: management's outlook. MODEL: an assumption made here."`);

// Exhibit (960x620): one 50px row per registry entry, ACTUAL first, then GUIDANCE, then MODEL.
const safe = (dax) => `SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(${dax}, "&", "&amp;"), "%", "%25"), "#", "%23")`;
// Reader-facing wording for registry text written for the author (matches the updated Source Registry rows once refreshed).
const reader = (dax) => `SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(${dax}, "Bundled: DE-3Q26-News-Release.pdf", "investor.deere.com, Q3 FY2026 release"), "Bundled in sources/", "investor.deere.com"), "; live refresh", ""), "Live-refresh macroeconomic", "Macroeconomic")`;
const key = `SWITCH('Source Registry'[Classification], "Actual", "1", "Guidance", "2", "3") & 'Source Registry'[Source]`;
const exhibitStatic = svgOpen(960, 620) + svgDefs +
  `<text x='0' y='22' font-size='16' font-weight='bold' fill='${C.ink}'>Where every figure comes from</text>` +
  `<rect x='0' y='38' width='960' height='3' fill='${C.ink}'/>`;
const exhibit = `
VAR _rows = ADDCOLUMNS(ALL('Source Registry'), "@i", RANKX(ALL('Source Registry'), ${key}, , ASC, DENSE) - 1)
RETURN
    ${daxStr(exhibitStatic)}
        & CONCATENATEX(_rows,
            VAR _y = 41 + [@i] * 50
            VAR _cls = 'Source Registry'[Classification]
            RETURN "<g transform='translate(0," & _y & ")'>"
                & SWITCH(_cls, "Actual", ${daxStr(tag("ACTUAL", 0, 17))}, "Guidance", ${daxStr(tag("GUIDANCE", 0, 17))}, ${daxStr(tag("MODEL", 0, 17))})
                & "<text x='92' y='21' font-size='14' font-weight='bold' fill='${C.ink}'>" & ${safe("'Source Registry'[Source]")} & "<tspan font-size='12' font-weight='normal'>  &%23183;  " & ${safe("'Source Registry'[Source Type]")} & "</tspan></text>"
                & "<text x='92' y='40' font-size='12' fill='${C.ink}'>" & ${safe(reader("'Source Registry'[Notes]"))} & "  &%23183;  " & ${safe(reader(`SUBSTITUTE(SUBSTITUTE('Source Registry'[URL / Location], "https://", ""), "www.", "")`))} & "</text>"
                & "<rect x='0' y='49' width='960' height='1' fill='${C.ink}'/></g>",
            "", [@i], ASC)
        & "</svg>"`;

const fredLast = `CALCULATE(MAX('Macro Data'[Date]), REMOVEFILTERS('Macro Data'), 'Macro Data'[Series] <> "CAD per USD")`;
const rows = [
  { label: `"Latest Deere quarter"`, tag: "ACTUAL", value: `[Latest Period Label]`, note: `"From Deere's earnings release"` },
  { label: `"Latest share price"`, tag: "ACTUAL", value: `FORMAT([Latest Price Date], "d mmm yyyy")`, note: `"Nasdaq close " & FORMAT([Latest Price], "$0.00")` },
  { label: `"Latest monthly FRED reading"`, tag: "ACTUAL", value: `FORMAT(${fredLast}, "mmm yyyy")`, note: `"Corn, soybeans, rates, housing"` },
  { label: `"Latest net farm income"`, tag: "ACTUAL", value: `FORMAT(YEAR(CALCULATE(MAX('Farm Income'[Date]), REMOVEFILTERS('Farm Income'))), "0")`, note: `"BEA via FRED, published yearly"` },
  { label: `"Management guidance"`, tag: "GUIDANCE", value: `"20 Aug 2026"`, note: `"Q3 FY2026 release"` },
  { label: `"Diluted shares used"`, tag: "ACTUAL", value: `"269.8M"`, note: `"Q3 FY2026 average"` },
  { label: `"Scenarios and P/E range"`, tag: "MODEL", value: `FORMAT(MINX(ALL('PE Multiple'), 'PE Multiple'[P/E Multiple]), "0") & "x-" & FORMAT(MAXX(ALL('PE Multiple'), 'PE Multiple'[P/E Multiple]), "0") & "x"`, note: `"Bear, base and bull"` },
];

module.exports = {
  ledgerHeight: ledgerHeight(rows),
  measures: [
    { name: "SVG Header SOURCES", doc: "The Stack: SOURCES card header.", expr: header("SOURCES"), svg: true },
    { name: "SVG Sources Finding", doc: "The Stack: SOURCES finding, what the three provenance tags mean.", expr: finding, svg: true },
    { name: "SVG Sources Exhibit", doc: "The Stack: the source registry, one row per source with its provenance tag, type, notes and location.", expr: exhibit, svg: true },
    { name: "SVG Sources Ledger", doc: "The Stack: SOURCES ledger of how current each input is.", expr: `RETURN\n    ${ledger(440, rows, "rl")}`.replace(/^RETURN\n    /, ""), svg: true },
  ],
};
