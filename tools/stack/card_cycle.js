// The Stack, THE CYCLE card: the outside drivers of Deere's demand, from FRED. Crop prices and interest rates lead;
// housing starts and net farm income sit beside them on the same 2020-2026 axis.
const { C, svgOpen, daxStr } = require("./stack_lib");
const { pct, ledger, ledgerHeight, header, finding2 } = require("./stack_measures_a");

const lastDate = (s) => `CALCULATE(MAX('Macro Data'[Date]), REMOVEFILTERS('Macro Data'), 'Macro Data'[Series] = "${s}")`;
const valueAt = (s, d) => `CALCULATE(AVERAGE('Macro Data'[Value]), REMOVEFILTERS('Macro Data'), 'Macro Data'[Series] = "${s}", 'Macro Data'[Date] = ${d})`;
const esc25 = (dax) => `SUBSTITUTE(${dax}, "%", "%25")`;

// Latest reading and the reading twelve months earlier for each monthly series.
const series = [["C", "Corn"], ["S", "Soybeans"], ["F", "Federal Funds"], ["H", "Housing Starts"]];
const vars = `
${series.map(([k, s]) => `VAR _d${k} = ${lastDate(s)}
VAR _v${k} = ${valueAt(s, `_d${k}`)}
VAR _p${k} = ${valueAt(s, `EDATE(_d${k}, -12)`)}`).join("\n")}
VAR _cPk = CALCULATE(MAX('Macro Data'[Value]), REMOVEFILTERS('Macro Data'), 'Macro Data'[Series] = "Corn")
VAR _cPkD = CALCULATE(MAX('Macro Data'[Date]), REMOVEFILTERS('Macro Data'), 'Macro Data'[Series] = "Corn", 'Macro Data'[Value] = _cPk)
VAR _fiY = CALCULATE(MAX('Farm Income'[Date]), REMOVEFILTERS('Farm Income'))
VAR _fiV = CALCULATE(AVERAGE('Farm Income'[Net Farm Income]), REMOVEFILTERS('Farm Income'), 'Farm Income'[Date] = _fiY)
VAR _fiPk = CALCULATE(MAX('Farm Income'[Net Farm Income]), REMOVEFILTERS('Farm Income'))
VAR _fiPkY = CALCULATE(MAX('Farm Income'[Date]), REMOVEFILTERS('Farm Income'), 'Farm Income'[Net Farm Income] = _fiPk)
VAR _month = FORMAT(_dC, "mmmm yyyy")`;

// The authored claim shows while the data says it. Otherwise the card still makes a claim: how many of the four drivers
// moved in Deere's favour over the year (crop prices up, rates down, housing starts up), naming the ones that did not.
const AUTHORED = "_vC >= _pC && _vS >= _pS && _vF < _pF && _vH < _pH";
const fallback = `(VAR _t = {("corn prices", INT(_vC < _pC)), ("soybean prices", INT(_vS < _pS)), ("interest rates", INT(_vF >= _pF)), ("housing starts", INT(_vH < _pH))}
            VAR _bad = COUNTROWS(FILTER(_t, [Value2] = 1))
            VAR _good = 4 - _bad
            RETURN IF(_bad = 0, "All four demand drivers moved Deere's way over the past year.",
                IF(_good = 0, "None of Deere's four demand drivers moved its way over the past year.",
                    SWITCH(_good, 1, "One", 2, "Two", 3, "Three") & " of four demand drivers moved Deere's way over the past year; " & CONCATENATEX(FILTER(_t, [Value2] = 1), [Value1], ", ") & " did not.")))`;
const line1 = (cond) => `IF(${cond}, "Over the past year crop prices rose and interest rates fell, while housing starts kept dropping.", ${fallback})`;
const line2 = `_month & " vs a year earlier: corn " & ${esc25(`FORMAT(DIVIDE(_vC, _pC) - 1, "+0%;-0%")`)} & ", soybeans " & ${esc25(`FORMAT(DIVIDE(_vS, _pS) - 1, "+0%;-0%")`)} & ", fed funds " & FORMAT(_vF, "0.00") & "%25 (was " & FORMAT(_pF, "0.00") & "%25), housing starts " & ${esc25(`FORMAT(DIVIDE(_vH, _pH) - 1, "+0%;-0%")`)} & "."`;
const finding = finding2(vars, line1(AUTHORED), line2);
// Test-only: the same finding with the authored condition forced false, to render the fallback on today's data.
const findingForcedFallback = finding2(vars, line1("FALSE()"), line2);

// Exhibit (960x620). Panels: { px, py, plot width, plot height }. Large panels lead the card; small ones sit at right.
const L = { w: 510, h: 200 }, S = { w: 130, h: 140 };
const P = { ag: [0, 40, L], rates: [0, 330, L], housing: [680, 40, S], farm: [680, 330, S] };
const kx = (g) => (g === L ? "_kL" : "_kS");
const Y = (py, g, v, lo, hi) => `ROUND(${py + 36 + g.h} - (MIN(MAX(${v}, ${lo}), ${hi}) - ${lo}) / ${hi - lo} * ${g.h}, 1)`;
const X = (px, g, d) => `ROUND(${px + 50} + DATEDIFF(DATE(2020, 1, 1), ${d}, MONTH) * ${kx(g)}, 1)`;
function frame(px, py, g, title, lo, hi, ticks, fmt) {
  const base = py + 36 + g.h;
  return `<text x='${px}' y='${py + 18}' font-size='${g === L ? 15 : 14}' font-weight='bold' fill='${C.ink}'>${title}</text>` +
    ticks.map((t) => { const y = base - (t - lo) / (hi - lo) * g.h; return `<line x1='${px + 50}' y1='${y}' x2='${px + 50 + g.w}' y2='${y}' stroke='${C.ink}' stroke-width='1' stroke-dasharray='2 5'/><text x='${px + 42}' y='${y + 5}' text-anchor='end' font-size='12' fill='${C.ink}'>${fmt(t)}</text>`; }).join("") +
    `<rect x='${px + 50}' y='${base - 1}' width='${g.w}' height='3' fill='${C.ink}'/>`;
}
const years = (px, py, g, step) => `
        & CONCATENATEX(FILTER(GENERATESERIES(2020, YEAR(_maxD)), MOD([Value], ${step}) = 0), "<rect x='" & ${X(px, g, "DATE([Value], 1, 1)")} & "' y='${py + 38 + g.h}' width='1' height='6' fill='${C.ink}'/><text x='" & ${X(px, g, "DATE([Value], 1, 1)")} & "' y='${py + 58 + g.h}' text-anchor='middle' font-size='12' fill='${C.ink}'>" & [Value] & "</text>", "")`;
function line(px, py, g, name, style, lo, hi, label) {
  return `
        & (VAR _r = CALCULATETABLE(SELECTCOLUMNS('Macro Data', "@d", 'Macro Data'[Date], "@v", 'Macro Data'[Value]), REMOVEFILTERS('Macro Data'), 'Macro Data'[Series] = "${name}", 'Macro Data'[Date] >= DATE(2020, 1, 1))
           VAR _ld = MAXX(_r, [@d])
           VAR _lv = MAXX(FILTER(_r, [@d] = _ld), [@v])
           RETURN "<polyline fill='none' stroke='${C.ink}' ${style} points='" & CONCATENATEX(_r, ${X(px, g, "[@d]")} & "," & ${Y(py, g, "[@v]", lo, hi)}, " ", [@d], ASC) & "'/>"
               & "<text x='${px + 58 + g.w}' y='" & (${Y(py, g, "_lv", lo, hi)} + 5) & "' font-size='14' font-weight='bold' fill='${C.ink}'>" & ${label} & "</text>")`;
}
const [fx, fy, fg] = P.farm;
const bars = `
        & (VAR _fi = FILTER(SELECTCOLUMNS(ALL('Farm Income'), "@y", YEAR('Farm Income'[Date]), "@v", 'Farm Income'[Net Farm Income]), [@y] >= 2020)
           VAR _bw = ROUND(12 * _kS * 0.7, 1)
           RETURN CONCATENATEX(_fi, "<rect x='" & ROUND(${X(fx, fg, "DATE([@y], 7, 1)")} - _bw / 2, 1) & "' y='" & ${Y(fy, fg, "[@v]", 0, 200)} & "' width='" & _bw & "' height='" & ROUND(${fy + 36 + fg.h} - ${Y(fy, fg, "[@v]", 0, 200)}, 1) & "' fill='${C.ink}'/>", "", [@y], ASC)
               & "<text x='${fx + 58 + fg.w}' y='" & (${Y(fy, fg, "_fiV", 0, 200)} + 5) & "' font-size='14' font-weight='bold' fill='${C.ink}'>" & FORMAT(_fiV, "$0") & "B</text>"
               & "<text x='" & ROUND(${X(fx, fg, "DATE(YEAR(_fiY) + 1, 1, 1)")} + 4, 1) & "' y='${fy + 26 + fg.h}' font-size='11' fill='${C.ink}'>no data after " & YEAR(_fiY) & "</text>")`;

const exhibitStatic = svgOpen(960, 620) +
  `<text x='0' y='22' font-size='16' font-weight='bold' fill='${C.ink}'>Crop prices and interest rates, with housing and farm income beside them</text>` +
  frame(...P.ag, "Corn and soybeans, USD per tonne", 100, 650, [200, 400, 600], (t) => `$${t}`) +
  frame(...P.rates, "Federal funds rate", 0, 6, [2, 4, 6], (t) => `${t}%25`) +
  frame(...P.housing, "Housing starts, thousands", 800, 1900, [1000, 1400, 1800], (t) => t.toLocaleString("en-US")) +
  frame(...P.farm, "U.S. net farm income, $B", 0, 200, [100, 200], (t) => `$${t}`);

const exhibit = `${vars}
VAR _maxD = MAX(MAX(_dC, _dF), _dH)
VAR _n = DATEDIFF(DATE(2020, 1, 1), _maxD, MONTH)
VAR _kL = ${L.w} / _n
VAR _kS = ${S.w} / _n
RETURN
    ${daxStr(exhibitStatic)}${years(...P.ag, 1)}${years(...P.rates, 1)}${years(...P.housing, 2)}${years(...P.farm, 2)}${
  line(...P.ag, "Soybeans", "stroke-width='5'", 100, 650, `"Soy $" & FORMAT(_lv, "0")`)}${
  line(...P.ag, "Corn", "stroke-width='3' stroke-dasharray='8 5'", 100, 650, `"Corn $" & FORMAT(_lv, "0")`)}${
  line(...P.rates, "Federal Funds", "stroke-width='4'", 0, 6, `FORMAT(_lv, "0.00") & "%25"`)}${
  line(...P.housing, "Housing Starts", "stroke-width='3'", 800, 1900, `FORMAT(_lv, "#,##0") & "K"`)}${bars}
        & "</svg>"`;

const yoy = (k) => `${pct(`DIVIDE(_v${k}, _p${k}) - 1`)} & " vs a year earlier"`;
const mon = (k) => `FORMAT(_d${k}, "mmm yyyy")`;
const rows = [
  { label: `"Corn, USD per tonne, " & ${mon("C")}`, tag: "ACTUAL", value: `"$" & FORMAT(_vC, "0")`, note: yoy("C") },
  { label: `"Soybeans, USD per tonne, " & ${mon("S")}`, tag: "ACTUAL", value: `"$" & FORMAT(_vS, "0")`, note: yoy("S") },
  { label: `"Federal funds rate, " & ${mon("F")}`, tag: "ACTUAL", value: `FORMAT(_vF, "0.00") & "%25"`, note: `FORMAT(_pF, "0.00") & "%25 a year earlier"` },
  { label: `"Housing starts, " & ${mon("H")}`, tag: "ACTUAL", value: `FORMAT(_vH, "#,##0") & "K"`, note: yoy("H") },
  { label: `"U.S. net farm income, " & YEAR(_fiY)`, tag: "ACTUAL", value: `"$" & FORMAT(_fiV, "0.0") & "B"`, note: `${pct("DIVIDE(_fiV, _fiPk) - 1")} & " from the " & YEAR(_fiPkY) & " peak"` },
  { label: `"Corn, against its " & FORMAT(_cPkD, "mmm yyyy") & " peak"`, tag: "ACTUAL", value: pct("DIVIDE(_vC, _cPk) - 1"), note: `"$" & FORMAT(_cPk, "0") & " a tonne at the peak"` },
];

module.exports = {
  ledgerHeight: ledgerHeight(rows),
  forcedFallback: findingForcedFallback,
  measures: [
    { name: "SVG Header THE CYCLE", doc: "The Stack: THE CYCLE card header.", expr: header("THE CYCLE"), svg: true },
    { name: "SVG Cycle Finding", doc: "The Stack: THE CYCLE finding, how the outside drivers moved over the past year; always names each driver's direction.", expr: finding, svg: true },
    { name: "SVG Cycle Exhibit", doc: "The Stack: crop prices and the fed funds rate as the lead panels, with housing starts and net farm income on the same 2020-2026 axis.", expr: exhibit, svg: true },
    { name: "SVG Cycle Ledger", doc: "The Stack: THE CYCLE ledger of the latest FRED readings.", expr: `${vars}\nRETURN\n    ${ledger(440, rows, "cl")}`, svg: true },
  ],
};
