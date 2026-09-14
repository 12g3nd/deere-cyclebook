// The Stack, MODEL LAB card: the assumptions that turn FY2025 actuals into a FY2026 model, and the controls that move them.
const { C, svgOpen, svgDefs, daxStr } = require("./stack_lib");
const { pct, ledger, ledgerHeight, header, finding2 } = require("./stack_measures_a");

const bridge = (order) => `CALCULATE(SUM('Earnings Bridge'[YTD FY26]), REMOVEFILTERS('Earnings Bridge'), 'Earnings Bridge'[Order] = ${order})`;
const fy25 = (col, code) => `CALCULATE(SUM('Annual Segments'[${col}]), REMOVEFILTERS('Annual Segments'), 'Annual Segments'[Fiscal Year] = 2025${code ? `, 'Annual Segments'[Segment Code] = "${code}"` : ""})`;
const seg = (measure, code) => `CALCULATE([${measure}], 'Segment'[Segment Code] = "${code}")`;

// Model fix: sales and margin changes now reach net income, after tax at the FY2026 year-to-date effective rate.
// With both adjustments at zero this returns the scenario's own net income, so VALUATION's defaults are unchanged.
const scenarioNetIncome = `
VAR _base = SELECTEDVALUE('Scenario'[Net Income], 4875)
VAR _op = [Model Equipment Operating Profit]
VAR _op0 = CALCULATE([Model Equipment Operating Profit], REMOVEFILTERS('Sales Adjustment'), REMOVEFILTERS('Margin Adjustment'))
VAR _tax = DIVIDE(-${bridge(6)}, ${bridge(7)} - ${bridge(6)})
RETURN _base + (_op - _op0) * (1 - _tax)`;

const vars = `
VAR _sc = SELECTEDVALUE('Scenario'[Scenario], "Base")
VAR _sa = [Selected Sales Adjustment]
VAR _ma = [Selected Margin Adjustment Bps]
VAR _sales = [Model Equipment Sales]
VAR _op = [Model Equipment Operating Profit]
VAR _ni = [Scenario Net Income]
VAR _eps = [Projected EPS]
VAR _op25 = ${fy25("Operating Profit")}
VAR _sales25 = ${fy25("Net Sales")}
VAR _tax = DIVIDE(-${bridge(6)}, ${bridge(7)} - ${bridge(6)})
VAR _set = IF(_sa = 0 && _ma = 0, "the ", "your ") & LOWER(_sc) & " case"`;

// "your" marks a case the reader has adjusted; the strips under the exhibit show which settings.
const finding = finding2(vars,
  `"In " & _set & ", Deere's equipment business earns " & FORMAT(_op / 1000, "$0.00") & "B in operating profit, " & SUBSTITUTE(FORMAT(ABS(DIVIDE(_op, _op25) - 1), "0%"), "%", "%25") & IF(_op >= _op25, " more", " less") & " than FY2025."`,
  `"Net income comes to " & FORMAT(_ni / 1000, "$0.00") & "B, or " & FORMAT(_eps, "$0.00") & " a share, " & IF(_ni < 4750, "below", IF(_ni > 5000, "above", "inside")) & " the $4.75B-5.00B management expects."`);

// Exhibit (1000x540): a bridge from FY2025 reported operating profit to the FY2026 model, then the assumptions under it.
// $0 at y 440, 54.29px per $1B; five columns, 180px pitch from x 170.
const yB = (m) => `ROUND(MAX(60, 440 - (${m}) / 1000 * 54.29), 1)`;
const codes = [["PPA", "PPA"], ["SAT", "SAT"], ["CF", "C&amp;F"]];
const exhibitStatic = svgOpen(1000, 540) + svgDefs +
  `<text x='0' y='22' font-size='16' font-weight='bold' fill='${C.ink}'>Equipment operating profit, FY2025 reported to FY2026 model</text>` +
  `<g font-size='13' fill='${C.ink}'><rect x='0' y='35' width='14' height='14' fill='${C.ink}'/><text x='22' y='47'>Reported</text>` +
  `<rect x='120' y='35' width='14' height='14' fill='url(%23s)' stroke='${C.ink}' stroke-width='1.5'/><text x='142' y='47'>CYCLEBOOK model</text></g>` +
  [2, 4, 6].map((b) => `<line x1='80' y1='${440 - b * 54.29}' x2='980' y2='${440 - b * 54.29}' stroke='${C.ink}' stroke-width='1' stroke-dasharray='2 5'/><text x='70' y='${445 - b * 54.29}' text-anchor='end' font-size='13' fill='${C.ink}'>$${b}B</text>`).join("") +
  `<rect x='80' y='439' width='900' height='3' fill='${C.ink}'/>` +
  [["FY2025", 170], ["PPA", 350], ["SAT", 530], ["C&amp;F", 710], ["FY2026 model", 890]].map(([t, x]) => `<text x='${x}' y='466' text-anchor='middle' font-size='14' font-weight='bold' fill='${C.ink}'>${t}</text>`).join("") +
  `<rect x='0' y='478' width='1000' height='3' fill='${C.ink}'/><rect x='0' y='508' width='1000' height='1' fill='${C.ink}'/><rect x='0' y='537' width='1000' height='2' fill='${C.ink}'/>` +
  `<g font-size='14' font-weight='bold' fill='${C.ink}'><text x='0' y='499'>Sales</text><text x='0' y='529'>Margin</text></g>`;

const step = (i, code, label) => `
        & (VAR _from = _run${i}
           VAR _to = _run${i + 1}
           VAR _x = ${350 + i * 180}
           VAR _top = ${yB("MAX(_from, _to)")}
           VAR _bot = ${yB("MIN(_from, _to)")}
           RETURN "<rect x='" & (_x - 55) & "' y='" & _top & "' width='110' height='" & MAX(2, _bot - _top) & "' fill='url(%23s)' stroke='${C.ink}' stroke-width='2'/>"
               & "<line x1='" & (_x - 125) & "' y1='" & ${yB("_from")} & "' x2='" & (_x - 55) & "' y2='" & ${yB("_from")} & "' stroke='${C.ink}' stroke-width='1' stroke-dasharray='3 3'/>"
               & "<rect x='" & (_x - 58) & "' y='" & (_top - 30) & "' width='116' height='22' fill='${C.paper}'/>"
               & "<text x='" & _x & "' y='" & (_top - 13) & "' text-anchor='middle' font-size='15' font-weight='bold' fill='${C.ink}'>" & IF(_to >= _from, "+", "-") & FORMAT(ABS(_to - _from) / 1000, "$0.00") & "B</text>"
               & "<text x='" & _x & "' y='499' text-anchor='middle' font-size='14' fill='${C.ink}'>" & SUBSTITUTE(FORMAT(${seg("Model Segment Growth", code)}, "+0%;-0%;0%"), "%", "%25") & "</text>"
               & "<text x='" & _x & "' y='529' text-anchor='middle' font-size='14' fill='${C.ink}'>" & SUBSTITUTE(FORMAT(${seg("Model Segment Margin", code)}, "0.0%"), "%", "%25") & "</text>")`;

const exhibit = `${vars}
VAR _run0 = _op25
VAR _run1 = _run0 + ${seg("Model Segment Operating Profit", "PPA")} - ${fy25("Operating Profit", "PPA")}
VAR _run2 = _run1 + ${seg("Model Segment Operating Profit", "SAT")} - ${fy25("Operating Profit", "SAT")}
VAR _run3 = _run2 + ${seg("Model Segment Operating Profit", "CF")} - ${fy25("Operating Profit", "CF")}
RETURN
    ${daxStr(exhibitStatic)}
        & "<rect x='115' y='" & ${yB("_op25")} & "' width='110' height='" & (440 - ${yB("_op25")}) & "' fill='${C.ink}'/>"
        & "<text x='170' y='" & (${yB("_op25")} - 13) & "' text-anchor='middle' font-size='15' font-weight='bold' fill='${C.ink}'>" & FORMAT(_op25 / 1000, "$0.00") & "B</text>"
        & "<text x='170' y='499' text-anchor='middle' font-size='14' fill='${C.ink}'>" & FORMAT(_sales25 / 1000, "$0.0") & "B</text>"
        & "<text x='170' y='529' text-anchor='middle' font-size='14' fill='${C.ink}'>" & SUBSTITUTE(FORMAT(DIVIDE(_op25, _sales25), "0.0%"), "%", "%25") & "</text>"${codes.map(([code, label], i) => step(i, code, label)).join("")}
        & "<line x1='765' y1='" & ${yB("_run3")} & "' x2='835' y2='" & ${yB("_run3")} & "' stroke='${C.ink}' stroke-width='1' stroke-dasharray='3 3'/>"
        & "<rect x='835' y='" & ${yB("_op")} & "' width='110' height='" & (440 - ${yB("_op")}) & "' fill='url(%23s)' stroke='${C.ink}' stroke-width='3'/>"
        & "<rect x='832' y='" & (${yB("_op")} - 30) & "' width='116' height='22' fill='${C.paper}'/>"
        & "<text x='890' y='" & (${yB("_op")} - 13) & "' text-anchor='middle' font-size='15' font-weight='bold' fill='${C.ink}'>" & FORMAT(_op / 1000, "$0.00") & "B</text>"
        & "<text x='890' y='499' text-anchor='middle' font-size='14' fill='${C.ink}'>" & FORMAT(_sales / 1000, "$0.0") & "B</text>"
        & "<text x='890' y='529' text-anchor='middle' font-size='14' fill='${C.ink}'>" & SUBSTITUTE(FORMAT(DIVIDE(_op, _sales), "0.0%"), "%", "%25") & "</text>"
        & "</svg>"`;

// Adjustment strips, built like the P/E test strip: each cell names its setting and shows the FY2026 EPS that setting
// produces with everything else held; the stipple swatch marks the outcome as model; the selected cell inverts.
function strip(table, column, selDax, width, pitch, cellW, labelDax, labelSize) {
  const col = `'${table}'[${column}]`;
  return `
VAR _sel = ${selDax}
VAR _steps = ADDCOLUMNS(ALL(${col}), "@i", RANKX(ALL(${col}), ${col}, , ASC) - 1, "@eps", CALCULATE([Projected EPS]))
RETURN
    ${daxStr(svgOpen(width, 80) + svgDefs)}
        & CONCATENATEX(_steps,
            VAR _x = [@i] * ${pitch}
            VAR _on = ${col} = _sel
            VAR _ink = IF(_on, "${C.paper}", "${C.ink}")
            RETURN "<rect x='" & (_x + 1.5) & "' y='1.5' width='${cellW}' height='77' fill='" & IF(_on, "${C.ink}", "${C.paper}") & "' stroke='${C.ink}' stroke-width='3'/>"
                & IF(_on, "", "<rect x='" & (_x + 8) & "' y='60' width='${cellW - 16}' height='12' fill='url(%23s)'/>")
                & "<text x='" & (_x + ${cellW / 2 + 1.5}) & "' y='28' text-anchor='middle' font-size='${labelSize}' font-weight='bold' fill='" & _ink & "'>" & ${labelDax} & "</text>"
                & "<text x='" & (_x + ${cellW / 2 + 1.5}) & "' y='52' text-anchor='middle' font-size='14' fill='" & _ink & "'>" & FORMAT([@eps], "$0.00") & "</text>",
            "", ${col}, ASC)
        & "</svg>"`;
}

const rows = [
  { label: `"Net income, FY2026, " & LOWER(_sc) & " case"`, tag: "MODEL", value: `FORMAT(_ni / 1000, "$0.00") & "B"`, note: `"EPS " & FORMAT(_eps, "$0.00") & " on 269.8M diluted shares"` },
  { label: `"Equipment sales, FY2026"`, tag: "MODEL", value: `FORMAT(_sales / 1000, "$0.0") & "B"`, note: `${pct("DIVIDE(_sales, _sales25) - 1")} & " on FY2025"` },
  { label: `"Operating profit, FY2026"`, tag: "MODEL", value: `FORMAT(_op / 1000, "$0.00") & "B"`, note: `SUBSTITUTE(FORMAT(DIVIDE(_op, _sales), "0.0%"), "%", "%25") & " margin"` },
  { label: `"Net income guidance, FY2026"`, tag: "GUIDANCE", value: `"$4.75B-5.00B"`, note: `"Management's range"` },
  { label: `"Operating profit, FY2025"`, tag: "ACTUAL", value: `FORMAT(_op25 / 1000, "$0.00") & "B"`, note: `SUBSTITUTE(FORMAT(DIVIDE(_op25, _sales25), "0.0%"), "%", "%25") & " margin"` },
  { label: `"Tax rate on your changes"`, tag: "MODEL", value: `SUBSTITUTE(FORMAT(_tax, "0.0%"), "%", "%25")`, note: `"FY2026 effective rate, to Q3"` },
];

module.exports = {
  ledgerHeight: ledgerHeight(rows),
  measures: [
    { name: "Scenario Net Income", inPlace: true, expr: scenarioNetIncome },
    { name: "SVG Header MODEL LAB", doc: "The Stack: MODEL LAB card header.", expr: header("MODEL LAB"), svg: true },
    { name: "SVG Model Lab Finding", doc: "The Stack: MODEL LAB finding, modeled operating profit against FY2025 and net income against guidance, for the current settings.", expr: finding, svg: true },
    { name: "SVG Model Lab Exhibit", doc: "The Stack: bridge from FY2025 reported operating profit to the FY2026 model by segment, with the growth and margin assumptions.", expr: exhibit, svg: true },
    { name: "SVG Model Lab Ledger", doc: "The Stack: MODEL LAB ledger of modeled outputs against guidance and FY2025.", expr: `${vars}\nRETURN\n    ${ledger(400, rows, "ml")}`, svg: true },
    { name: "SVG Sales Strip", doc: "The Stack: painted sales-adjustment cells; the transparent slicer sits on top.", expr: strip("Sales Adjustment", "Sales Adjustment", "[Selected Sales Adjustment]", 480, 96, 88, `SUBSTITUTE(FORMAT('Sales Adjustment'[Sales Adjustment], "+0%;-0%;0%"), "%", "%25")`, 17), svg: true },
    { name: "SVG Margin Strip", doc: "The Stack: painted operating-margin adjustment cells; the transparent slicer sits on top.", expr: strip("Margin Adjustment", "Margin Adjustment (bps)", "[Selected Margin Adjustment Bps]", 500, 100, 92, `FORMAT('Margin Adjustment'[Margin Adjustment (bps)], "+0;-0;0") & "bp"`, 15), svg: true },
  ],
};
