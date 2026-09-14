// The Stack, SEGMENTS card: operating profit by segment and quarter, and who earns the money now.
const { C, svgOpen, daxStr } = require("./stack_lib");
const { pct, esc, ledger, ledgerHeight, header, finding2 } = require("./stack_measures_a");

const op = (keyDax, code, col = "Operating Profit") => `LOOKUPVALUE('Quarterly Segments'[${col}], 'Quarterly Segments'[Period Key], ${keyDax}, 'Quarterly Segments'[Segment Code], "${code}")`;
const ytdPrior = (code) => `CALCULATE(SUM('Quarterly Segments'[Operating Profit]), REMOVEFILTERS('Quarterly Segments'), REMOVEFILTERS('Period'), 'Quarterly Segments'[Segment Code] = "${code}", 'Quarterly Segments'[Period Key] > (_fy - 1) * 100, 'Quarterly Segments'[Period Key] <= _k - 100)`;
const bridge = (order) => `CALCULATE(SUM('Earnings Bridge'[YTD FY26]), REMOVEFILTERS('Earnings Bridge'), 'Earnings Bridge'[Order] = ${order})`;
const annualOp = (code, yearDax) => `CALCULATE(SUM('Annual Segments'[Operating Profit]), REMOVEFILTERS('Annual Segments'), 'Annual Segments'[Fiscal Year] = ${yearDax}${code ? `, 'Annual Segments'[Segment Code] = "${code}"` : ""})`;

// Year to date comes from the reported Q3 FY2026 bridge; quarter-by-quarter comparisons from Quarterly Segments.
const vars = `
VAR _k = [Latest Period Key]
VAR _fy = INT(_k / 100)
VAR _q = MOD(_k, 100)
VAR _ppa = ${bridge(1)}
VAR _sat = ${bridge(2)}
VAR _cf = ${bridge(3)}
VAR _prior = ${ytdPrior("PPA")} + ${ytdPrior("SAT")} + ${ytdPrior("CF")}
VAR _quarters = FILTER(ALL('Period'[Period Key]), 'Period'[Period Key] > _fy * 100 && 'Period'[Period Key] <= _k)
VAR _satAhead = COUNTROWS(FILTER(_quarters, ${op("'Period'[Period Key]", "SAT")} > ${op("'Period'[Period Key]", "PPA")}))
VAR _prev = FILTER(ALL('Period'[Period Key]), 'Period'[Period Key] > (_fy - 2) * 100 && 'Period'[Period Key] < _fy * 100)
VAR _nPrev = COUNTROWS(_prev)
VAR _ppaAhead = COUNTROWS(FILTER(_prev, ${op("'Period'[Period Key]", "PPA")} > ${op("'Period'[Period Key]", "SAT")}))`;

const finding = finding2(vars,
  `IF(_satAhead = _q, "Small ag and turf has earned more than large ag in " & SWITCH(_q, 1, "the first quarter", 2, "both quarters", 3, "all three quarters", "all four quarters") & " of fiscal " & _fy & ".", "Small ag and turf earned more than large ag in " & _satAhead & " of " & _q & " quarters of fiscal " & _fy & ".")`,
  `"Large ag led " & IF(_ppaAhead = _nPrev, "all " & _nPrev, _ppaAhead & " of " & _nPrev) & " quarters of FY" & (_fy - 2) & "-" & RIGHT(_fy - 1, 2) & ". Through Q" & _q & " this year, " & IF(_sat >= _ppa, "small ag leads $" & FORMAT(_sat, "#,##0") & "M to $" & FORMAT(_ppa, "#,##0"), "large ag leads $" & FORMAT(_ppa, "#,##0") & "M to $" & FORMAT(_sat, "#,##0")) & "M."`);

// Exhibit (960x620): operating profit by quarter, last eleven quarters. $0 at y 510, 0.2278px per $1M ($1.8B at y 100).
const segs = [
  { code: "PPA", label: "PPA", style: "stroke-width='5'" },
  { code: "SAT", label: "SAT", style: "stroke-width='3' stroke-dasharray='14 7'" },
  { code: "CF", label: "C&amp;F", style: "stroke-width='3' stroke-dasharray='4 6'" },
];
const yPix = (v) => `ROUND(MAX(100, MIN(510, 510 - (${v}) * 0.2278)), 1)`;
const exhibitStatic = svgOpen(960, 620) +
  `<text x='0' y='22' font-size='16' font-weight='bold' fill='${C.ink}'>Segment operating profit by quarter</text>` +
  `<g fill='none' stroke='${C.ink}'><line x1='0' y1='44' x2='34' y2='44' stroke-width='5'/><line x1='270' y1='44' x2='304' y2='44' stroke-width='3' stroke-dasharray='14 7'/><line x1='510' y1='44' x2='544' y2='44' stroke-width='3' stroke-dasharray='4 6'/></g>` +
  `<g font-size='13' fill='${C.ink}'><text x='42' y='49'>PPA ${esc("Production & Precision Ag")}</text><text x='312' y='49'>SAT Small Ag ${esc("&")} Turf</text><text x='552' y='49'>C${esc("&")}F Construction ${esc("&")} Forestry</text></g>` +
  [500, 1000, 1500].map((v) => `<line x1='70' y1='${510 - v * 0.2278}' x2='820' y2='${510 - v * 0.2278}' stroke='${C.ink}' stroke-width='1' stroke-dasharray='2 5'/><text x='60' y='${515 - v * 0.2278}' text-anchor='end' font-size='13' fill='${C.ink}'>$${(v / 1000).toFixed(1)}B</text>`).join("") +
  `<rect x='70' y='509' width='750' height='3' fill='${C.ink}'/><text x='60' y='515' text-anchor='end' font-size='13' fill='${C.ink}'>$0</text>`;

const exhibit = `${vars}
VAR _last = TOPN(11, ALL('Period'[Period Key], 'Period'[Period Sort], 'Period'[Fiscal Year], 'Period'[Fiscal Quarter]), 'Period'[Period Sort], DESC)
VAR _minSort = MINX(_last, 'Period'[Period Sort])
VAR _pts = ADDCOLUMNS(_last, "@x", 70 + ('Period'[Period Sort] - _minSort) * 75)
VAR _x0 = MINX(FILTER(_pts, 'Period'[Fiscal Year] = _fy), [@x])
${segs.map((s) => `VAR _v${s.code} = ${op("_k", s.code)}`).join("\n")}
RETURN
    ${daxStr(exhibitStatic)}${segs.map((s) => `
        & "<polyline fill='none' stroke='${C.ink}' ${s.style} points='" & CONCATENATEX(_pts, [@x] & "," & ${yPix(op("'Period'[Period Key]", s.code))}, " ", [@x], ASC) & "'/>"
        & CONCATENATEX(_pts, "<rect x='" & ([@x] - 4) & "' y='" & (${yPix(op("'Period'[Period Key]", s.code))} - 4) & "' width='8' height='8' fill='${C.ink}'/>", "")
        & "<text x='834' y='" & (${yPix(`_v${s.code}`)} + 5) & "' font-size='15' font-weight='bold' fill='${C.ink}'>${s.label} $" & FORMAT(_v${s.code}, "#,##0") & "M</text>"`).join("")}
        & CONCATENATEX(FILTER(_pts, 'Period'[Fiscal Quarter] = "Q1" && [@x] > 70), "<line x1='" & ([@x] - 37.5) & "' y1='100' x2='" & ([@x] - 37.5) & "' y2='580' stroke='${C.ink}' stroke-width='1' stroke-dasharray='2 5'/>", "")
        & CONCATENATEX(_pts, "<text x='" & [@x] & "' y='536' text-anchor='middle' font-size='13' fill='${C.ink}'>" & 'Period'[Fiscal Quarter] & "</text>", "", [@x], ASC)
        & CONCATENATEX(DISTINCT(SELECTCOLUMNS(_pts, "@fy", 'Period'[Fiscal Year])), VAR _f = [@fy] RETURN "<text x='" & AVERAGEX(FILTER(_pts, 'Period'[Fiscal Year] = _f), [@x]) & "' y='562' text-anchor='middle' font-size='14' font-weight='bold' fill='${C.ink}'>FY" & _f & "</text>", "")
        // FY2026 SAT and PPA values sit in two rows under the axis, off the line paths where the series cross.
        & "<text x='" & (_x0 - 34) & "' y='592' text-anchor='end' font-size='12' font-weight='bold' fill='${C.ink}'>SAT, $M</text><text x='" & (_x0 - 34) & "' y='610' text-anchor='end' font-size='12' font-weight='bold' fill='${C.ink}'>PPA, $M</text>"
        & CONCATENATEX(FILTER(_pts, 'Period'[Fiscal Year] = _fy),
            "<text x='" & [@x] & "' y='592' text-anchor='middle' font-size='12' fill='${C.ink}'>" & FORMAT(${op("'Period'[Period Key]", "SAT")}, "#,##0") & "</text>"
                & "<text x='" & [@x] & "' y='610' text-anchor='middle' font-size='12' fill='${C.ink}'>" & FORMAT(${op("'Period'[Period Key]", "PPA")}, "#,##0") & "</text>", "")
        & IF(_satAhead = _q, "<rect x='" & (_x0 - 10) & "' y='76' width='" & (MAXX(_pts, [@x]) - _x0 + 20) & "' height='3' fill='${C.ink}'/><rect x='" & (_x0 - 10) & "' y='76' width='3' height='12' fill='${C.ink}'/><rect x='" & (MAXX(_pts, [@x]) + 7) & "' y='76' width='3' height='12' fill='${C.ink}'/><text x='" & (MAXX(_pts, [@x]) + 10) & "' y='70' text-anchor='end' font-size='14' font-weight='bold' fill='${C.ink}'>Small ag ahead all year</text>", "")
        & "</svg>"`;

const margin = (code) => `SUBSTITUTE(FORMAT(${op("_k", code, "Operating Margin")}, "0.0%"), "%", "%25")`;
const outlook = (name, value) => ({ label: `"${name} net sales outlook, FY" & _fy`, tag: "GUIDANCE", value: `"${value}"`, note: `"Management, Q3 release"` });
const rows = [
  { label: `"Equipment operating profit, FY" & _fy & " through Q" & _q`, tag: "ACTUAL", value: `"$" & FORMAT(_ppa + _sat + _cf, "#,##0") & "M"`, note: `${pct("DIVIDE(_ppa + _sat + _cf, _prior) - 1")} & " vs the same quarters of FY" & (_fy - 1)` },
  { label: `"SAT operating profit, through Q" & _q`, tag: "ACTUAL", value: `"$" & FORMAT(_sat, "#,##0") & "M"`, note: `"Q" & _q & " margin " & ${margin("SAT")}` },
  { label: `"PPA operating profit, through Q" & _q`, tag: "ACTUAL", value: `"$" & FORMAT(_ppa, "#,##0") & "M"`, note: `"Q" & _q & " margin " & ${margin("PPA")}` },
  { label: `"C&amp;F operating profit, through Q" & _q`, tag: "ACTUAL", value: `"$" & FORMAT(_cf, "#,##0") & "M"`, note: `"Q" & _q & " margin " & ${margin("CF")}` },
  outlook("PPA", "About -10%25"),
  outlook("SAT", "About +15%25"),
  outlook("C&amp;F", "About +20%25"),
];

module.exports = {
  ledgerHeight: ledgerHeight(rows),
  measures: [
    { name: "SVG Header SEGMENTS", doc: "The Stack: SEGMENTS card header.", expr: header("SEGMENTS"), svg: true },
    { name: "SVG Segments Finding", doc: "The Stack: SEGMENTS finding, which segment earns more this fiscal year, then year-to-date profit against the peak-year mix.", expr: finding, svg: true },
    { name: "SVG Segments Exhibit", doc: "The Stack: segment operating profit by quarter over the last eleven quarters.", expr: exhibit, svg: true },
    { name: "SVG Segments Ledger", doc: "The Stack: SEGMENTS ledger of year-to-date segment profit and the FY2026 sales outlook.", expr: `${vars}\nRETURN\n    ${ledger(440, rows, "sl")}`, svg: true },
  ],
};
