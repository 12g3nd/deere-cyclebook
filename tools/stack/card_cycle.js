// The Stack, THE CYCLE card: the outside drivers of Deere's demand, from FRED, as four small panels and a ledger.
const { C, svgOpen, daxStr } = require("./stack_lib");
const { pct, ledger, ledgerHeight, header, finding2 } = require("./stack_measures_a");

const lastDate = (s) => `CALCULATE(MAX('Macro Data'[Date]), REMOVEFILTERS('Macro Data'), 'Macro Data'[Series] = "${s}")`;
const valueAt = (s, d) => `CALCULATE(AVERAGE('Macro Data'[Value]), REMOVEFILTERS('Macro Data'), 'Macro Data'[Series] = "${s}", 'Macro Data'[Date] = ${d})`;
const esc25 = (dax) => `SUBSTITUTE(${dax}, "%", "%25")`;

// Latest reading and the reading twelve months earlier for each monthly series.
const series = [["C", "Corn"], ["S", "Soybeans"], ["F", "Federal Funds"], ["H", "Housing Starts"], ["K", "Construction Spending"]];
const vars = `
${series.map(([k, s]) => `VAR _d${k} = ${lastDate(s)}
VAR _v${k} = ${valueAt(s, `_d${k}`)}
VAR _p${k} = ${valueAt(s, `EDATE(_d${k}, -12)`)}`).join("\n")}
VAR _dX = ${lastDate("CAD per USD")}
VAR _vX = ${valueAt("CAD per USD", "_dX")}
VAR _fiY = CALCULATE(MAX('Farm Income'[Date]), REMOVEFILTERS('Farm Income'))
VAR _fiV = CALCULATE(AVERAGE('Farm Income'[Net Farm Income]), REMOVEFILTERS('Farm Income'), 'Farm Income'[Date] = _fiY)
VAR _fiPk = CALCULATE(MAX('Farm Income'[Net Farm Income]), REMOVEFILTERS('Farm Income'))
VAR _fiPkY = CALCULATE(MAX('Farm Income'[Date]), REMOVEFILTERS('Farm Income'), 'Farm Income'[Net Farm Income] = _fiPk)
VAR _month = FORMAT(_dC, "mmmm yyyy")`;

// The authored claim only shows while the data still says it; otherwise the card falls back to a neutral lead.
const finding = finding2(vars,
  `IF(_vC >= _pC && _vS >= _pS && _vF < _pF && _vH < _pH, "Over the past year crop prices rose and interest rates fell, while housing starts kept dropping.", "How Deere's outside demand drivers moved over the past year.")`,
  `_month & " vs a year earlier: corn " & ${esc25(`FORMAT(DIVIDE(_vC, _pC) - 1, "+0%;-0%")`)} & ", soybeans " & ${esc25(`FORMAT(DIVIDE(_vS, _pS) - 1, "+0%;-0%")`)} & ", fed funds " & FORMAT(_vF, "0.00") & "%25 (was " & FORMAT(_pF, "0.00") & "%25), housing starts " & ${esc25(`FORMAT(DIVIDE(_vH, _pH) - 1, "+0%;-0%")`)} & "."`);

// Exhibit (960x620): four panels. Each plot runs x px+50..px+360 and y py+36..py+230; end labels sit right of the plot.
const Y = (py, v, lo, hi) => `ROUND(${py + 230} - (MIN(MAX(${v}, ${lo}), ${hi}) - ${lo}) / ${hi - lo} * 194, 1)`;
const X = (px, d) => `ROUND(${px + 50} + DATEDIFF(DATE(2020, 1, 1), ${d}, MONTH) * _kx, 1)`;
function frame(px, py, title, lo, hi, ticks, fmt) {
  return `<text x='${px}' y='${py + 18}' font-size='15' font-weight='bold' fill='${C.ink}'>${title}</text>` +
    ticks.map((t) => { const y = py + 230 - (t - lo) / (hi - lo) * 194; return `<line x1='${px + 50}' y1='${y}' x2='${px + 360}' y2='${y}' stroke='${C.ink}' stroke-width='1' stroke-dasharray='2 5'/><text x='${px + 42}' y='${y + 5}' text-anchor='end' font-size='12' fill='${C.ink}'>${fmt(t)}</text>`; }).join("") +
    `<rect x='${px + 50}' y='${py + 229}' width='310' height='3' fill='${C.ink}'/>`;
}
const years = (px, py) => `
        & CONCATENATEX(GENERATESERIES(2020, YEAR(_maxD)), "<rect x='" & ${X(px, "DATE([Value], 1, 1)")} & "' y='${py + 232}' width='1' height='6' fill='${C.ink}'/><text x='" & ${X(px, "DATE([Value], 1, 1)")} & "' y='${py + 252}' text-anchor='middle' font-size='12' fill='${C.ink}'>" & [Value] & "</text>", "")`;
function line(px, py, name, style, lo, hi, label) {
  return `
        & (VAR _r = CALCULATETABLE(SELECTCOLUMNS('Macro Data', "@d", 'Macro Data'[Date], "@v", 'Macro Data'[Value]), REMOVEFILTERS('Macro Data'), 'Macro Data'[Series] = "${name}", 'Macro Data'[Date] >= DATE(2020, 1, 1))
           VAR _ld = MAXX(_r, [@d])
           VAR _lv = MAXX(FILTER(_r, [@d] = _ld), [@v])
           RETURN "<polyline fill='none' stroke='${C.ink}' ${style} points='" & CONCATENATEX(_r, ${X(px, "[@d]")} & "," & ${Y(py, "[@v]", lo, hi)}, " ", [@d], ASC) & "'/>"
               & "<text x='${px + 368}' y='" & (${Y(py, "_lv", lo, hi)} + 5) & "' font-size='14' font-weight='bold' fill='${C.ink}'>" & ${label} & "</text>")`;
}
const bars = (px, py, lo, hi) => `
        & (VAR _fi = SELECTCOLUMNS(ALL('Farm Income'), "@y", YEAR('Farm Income'[Date]), "@v", 'Farm Income'[Net Farm Income])
           VAR _y0 = MINX(_fi, [@y])
           VAR _pitch = 310 / COUNTROWS(_fi)
           VAR _ly = MAXX(_fi, [@y])
           RETURN CONCATENATEX(_fi, "<rect x='" & ROUND(${px + 50} + ([@y] - _y0) * _pitch + _pitch * 0.15, 1) & "' y='" & ${Y(py, "[@v]", lo, hi)} & "' width='" & ROUND(_pitch * 0.7, 1) & "' height='" & ROUND(${py + 230} - ${Y(py, "[@v]", lo, hi)}, 1) & "' fill='${C.ink}'/>"
                   & IF(MOD([@y], 3) = MOD(_ly, 3), "<text x='" & ROUND(${px + 50} + ([@y] - _y0 + 0.5) * _pitch, 1) & "' y='${py + 252}' text-anchor='middle' font-size='12' fill='${C.ink}'>" & [@y] & "</text>", ""), "", [@y], ASC)
               & "<text x='${px + 368}' y='" & (${Y(py, "_fiV", lo, hi)} + 5) & "' font-size='14' font-weight='bold' fill='${C.ink}'>" & FORMAT(_fiV, "$0") & "B</text>")`;

const P = { ag: [0, 60], farm: [500, 60], rates: [0, 340], housing: [500, 340] };
const exhibitStatic = svgOpen(960, 620) +
  `<text x='0' y='22' font-size='16' font-weight='bold' fill='${C.ink}'>Crop prices, farm income, interest rates and housing</text>` +
  frame(...P.ag, "Corn and soybeans, USD per tonne", 100, 650, [200, 400, 600], (t) => `$${t}`) +
  frame(...P.farm, "U.S. net farm income, $ billions, yearly", 0, 200, [50, 100, 150, 200], (t) => `$${t}`) +
  frame(...P.rates, "Federal funds rate", 0, 6, [2, 4, 6], (t) => `${t}%25`) +
  frame(...P.housing, "Housing starts, thousands a year", 800, 1900, [1000, 1400, 1800], (t) => `${t.toLocaleString("en-US")}`);

const exhibit = `${vars}
VAR _maxD = MAX(MAX(_dC, _dF), _dH)
VAR _kx = 310 / DATEDIFF(DATE(2020, 1, 1), _maxD, MONTH)
RETURN
    ${daxStr(exhibitStatic)}${years(...P.ag)}${years(...P.rates)}${years(...P.housing)}${
  line(...P.ag, "Soybeans", "stroke-width='5'", 100, 650, `"Soy $" & FORMAT(_lv, "0")`)}${
  line(...P.ag, "Corn", "stroke-width='3' stroke-dasharray='8 5'", 100, 650, `"Corn $" & FORMAT(_lv, "0")`)}${
  bars(...P.farm, 0, 200)}${
  line(...P.rates, "Federal Funds", "stroke-width='4'", 0, 6, `FORMAT(_lv, "0.00") & "%25"`)}${
  line(...P.housing, "Housing Starts", "stroke-width='4'", 800, 1900, `FORMAT(_lv, "#,##0") & "K"`)}
        & "</svg>"`;

const yoy = (k) => `${pct(`DIVIDE(_v${k}, _p${k}) - 1`)} & " vs a year earlier"`;
const mon = (k) => `FORMAT(_d${k}, "mmm yyyy")`;
const rows = [
  { label: `"Corn, USD per tonne, " & ${mon("C")}`, tag: "ACTUAL", value: `"$" & FORMAT(_vC, "0")`, note: yoy("C") },
  { label: `"Soybeans, USD per tonne, " & ${mon("S")}`, tag: "ACTUAL", value: `"$" & FORMAT(_vS, "0")`, note: yoy("S") },
  { label: `"Federal funds rate, " & ${mon("F")}`, tag: "ACTUAL", value: `FORMAT(_vF, "0.00") & "%25"`, note: `FORMAT(_pF, "0.00") & "%25 a year earlier"` },
  { label: `"Housing starts, " & ${mon("H")}`, tag: "ACTUAL", value: `FORMAT(_vH, "#,##0") & "K"`, note: yoy("H") },
  { label: `"Construction spending, " & ${mon("K")}`, tag: "ACTUAL", value: `"$" & FORMAT(_vK / 1000000, "0.00") & "T"`, note: yoy("K") },
  { label: `"U.S. net farm income, " & YEAR(_fiY)`, tag: "ACTUAL", value: `"$" & FORMAT(_fiV, "0.0") & "B"`, note: `${pct("DIVIDE(_fiV, _fiPk) - 1")} & " from the " & YEAR(_fiPkY) & " peak"` },
  { label: `"Canadian dollars per USD"`, tag: "ACTUAL", value: `FORMAT(_vX, "0.000")`, note: `"Daily, " & FORMAT(_dX, "d mmm yyyy")` },
];

module.exports = {
  ledgerHeight: ledgerHeight(rows),
  measures: [
    { name: "SVG Header THE CYCLE", doc: "The Stack: THE CYCLE card header.", expr: header("THE CYCLE"), svg: true },
    { name: "SVG Cycle Finding", doc: "The Stack: THE CYCLE finding, how the outside drivers moved over the past year (authored claim shown only while the data supports it).", expr: finding, svg: true },
    { name: "SVG Cycle Exhibit", doc: "The Stack: corn and soybeans, net farm income, the fed funds rate and housing starts as four small panels.", expr: exhibit, svg: true },
    { name: "SVG Cycle Ledger", doc: "The Stack: THE CYCLE ledger of the latest FRED readings.", expr: `${vars}\nRETURN\n    ${ledger(440, rows, "cl")}`, svg: true },
  ],
};
