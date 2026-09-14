// The Stack, part A: desk, card headers, helpers, PULSE exhibit and ledger.
const { C, pixelRects, svgOpen, svgDefs, daxPixel, daxStr } = require("./stack_lib");

const pct = (dax) => `SUBSTITUTE(FORMAT(${dax}, "+0%;-0%;0%"), "%", "%25")`;
const esc = (s) => s.replace(/&/g, "&amp;");

// Merge horizontal pixel runs so static titles stay short.
function titleRects(text, x, y, p) {
  return pixelRects(text, x, y, p);
}

function header(title) {
  const svg = svgOpen(1420, 96) + `<g fill='${C.ink}'>${titleRects(title, 0, 8, 10)}</g>`;
  return `
VAR _price = [Latest Price]
VAR _date = [Latest Price Date]
RETURN
    ${daxStr(svg)}
        & "<text x='1420' y='36' text-anchor='end' font-size='16' font-weight='bold' fill='${C.ink}'>Deere &amp; Company &%23183; NYSE: DE</text>"
        & "<text x='1420' y='62' text-anchor='end' font-size='15' fill='${C.ink}'>Close " & FORMAT(_price, "$#,##0.00") & " on " & FORMAT(_date, "d mmm yyyy") & " &%23183; reported through " & [Latest Period Label] & "</text>"
        & "<rect x='0' y='86' width='1420' height='4' fill='${C.ink}'/></svg>"`;
}

const desk = svgOpen(1920, 1080) + svgDefs +
  `<rect width='1920' height='1080' fill='${C.paper}'/><rect width='1920' height='1080' fill='url(%23d)'/>` +
  `<rect x='242' y='62' width='1500' height='1000' fill='${C.ink}'/>` +
  `<rect x='236' y='56' width='1500' height='1000' fill='${C.paper}' stroke='${C.ink}' stroke-width='3'/>` +
  `<rect x='226' y='46' width='1500' height='1000' fill='${C.paper}' stroke='${C.ink}' stroke-width='3'/>` +
  `<rect x='216' y='36' width='1500' height='1000' fill='${C.paper}' stroke='${C.ink}' stroke-width='4'/></svg>`;

// PULSE exhibit: segment sales growth vs a year ago, last seven fiscal quarters.
const segs = [
  { code: "PPA", style: "stroke-width='5'" },
  { code: "SAT", style: "stroke-width='3' stroke-dasharray='14 7'" },
  { code: "CF", style: "stroke-width='3' stroke-dasharray='4 6'" },
];
const yoyAt = (keyDax, code) => `LOOKUPVALUE('Quarterly Segments'[Sales YoY %], 'Quarterly Segments'[Period Key], ${keyDax}, 'Quarterly Segments'[Segment Code], "${code}")`;
// Plot: +40% at y 90, zero at y 295, -40% at y 500 (leaves room for the key row above).
const yPix = (v) => `ROUND(MAX(90, MIN(500, 295 - ${v} * 512.5)), 1)`;

const divergenceStatic = svgOpen(960, 600) +
  `<text x='0' y='22' font-size='16' font-weight='bold' fill='${C.ink}'>Segment net sales, change vs the same quarter a year earlier</text>` +
  `<g fill='none' stroke='${C.ink}'>` +
  `<line x1='0' y1='44' x2='34' y2='44' stroke-width='5'/><line x1='270' y1='44' x2='304' y2='44' stroke-width='3' stroke-dasharray='14 7'/><line x1='510' y1='44' x2='544' y2='44' stroke-width='3' stroke-dasharray='4 6'/></g>` +
  `<g font-size='13' fill='${C.ink}'><text x='42' y='49'>PPA ${esc("Production & Precision Ag")}</text><text x='312' y='49'>SAT Small Ag ${esc("&")} Turf</text><text x='552' y='49'>C${esc("&")}F Construction ${esc("&")} Forestry</text></g>` +
  [40, 20, -20, -40].map((v) => `<line x1='70' y1='${295 - v * 5.125}' x2='820' y2='${295 - v * 5.125}' stroke='${C.ink}' stroke-width='1' stroke-dasharray='2 5'/><text x='60' y='${300 - v * 5.125}' text-anchor='end' font-size='13' fill='${C.ink}'>${v > 0 ? "+" : ""}${v}%25</text>`).join("") +
  `<rect x='70' y='294' width='750' height='3' fill='${C.ink}'/><text x='60' y='300' text-anchor='end' font-size='13' fill='${C.ink}'>0</text>` +
  `<text x='78' y='287' font-size='12' fill='${C.ink}'>growing</text><text x='78' y='313' font-size='12' fill='${C.ink}'>shrinking</text>`;

function divergence() {
  const lines = segs.map((s) => `
        & "<polyline fill='none' stroke='${C.ink}' ${s.style} points='" & CONCATENATEX(_pts, [@x] & "," & ${yPix(yoyAt("'Period'[Period Key]", s.code))}, " ", [@x], ASC) & "'/>"
        & CONCATENATEX(_pts, "<rect x='" & ([@x] - 4) & "' y='" & (${yPix(yoyAt("'Period'[Period Key]", s.code))} - 4) & "' width='8' height='8' fill='${C.ink}'/>", "")
        & "<text x='834' y='" & (${yPix(`_v${s.code}`)} + 5) & "' font-size='15' font-weight='bold' fill='${C.ink}'>${s.code === "CF" ? "C&amp;F" : s.code} " & ${pct(`_v${s.code}`)} & "</text>"`).join("");
  return `
VAR _last = TOPN(7, ALL('Period'[Period Key], 'Period'[Period Sort], 'Period'[Period Label]), 'Period'[Period Sort], DESC)
VAR _minSort = MINX(_last, 'Period'[Period Sort])
VAR _maxKey = MAXX(_last, 'Period'[Period Key])
VAR _pts = ADDCOLUMNS(_last, "@x", 70 + ('Period'[Period Sort] - _minSort) * 125)
VAR _vPPA = ${yoyAt("_maxKey", "PPA")}
VAR _vSAT = ${yoyAt("_maxKey", "SAT")}
VAR _vCF = ${yoyAt("_maxKey", "CF")}
RETURN
    ${daxStr(divergenceStatic)}${lines}
        & CONCATENATEX(_pts, "<text x='" & [@x] & "' y='536' text-anchor='middle' font-size='13' fill='${C.ink}'>" & 'Period'[Period Label] & "</text>", "", [@x], ASC)
        & "</svg>"`;
}

// Ledger rows: label, provenance tag, bitmap value, note.
const TAGS = {
  ACTUAL: (x, y) => `<rect x='${x - 72}' y='${y}' width='72' height='22' fill='${C.ink}'/><text x='${x - 36}' y='${y + 16}' text-anchor='middle' font-size='12' font-weight='bold' fill='${C.paper}'>ACTUAL</text>`,
  GUIDANCE: (x, y) => `<rect x='${x - 96}' y='${y}' width='96' height='22' fill='${C.green}'/><text x='${x - 48}' y='${y + 16}' text-anchor='middle' font-size='12' font-weight='bold' fill='${C.paper}'>GUIDANCE</text>`,
  MODEL: (x, y) => `<rect x='${x - 84}' y='${y + 1}' width='83' height='20' fill='${C.paper}' stroke='${C.ink}' stroke-width='2'/><rect x='${x - 80}' y='${y + 5}' width='12' height='12' fill='url(%23s)'/><text x='${x - 36}' y='${y + 16}' text-anchor='middle' font-size='12' font-weight='bold' fill='${C.ink}'>MODEL</text>`,
};

function ledger(width, rowH, rows, idBase) {
  let dax = daxStr(svgOpen(width, rows.length * rowH + 8) + svgDefs);
  rows.forEach((r, i) => {
    const y = i * rowH;
    const fill = r.tag === "GUIDANCE" ? C.green : C.ink;
    dax += `
        & ${daxStr(`<rect x='0' y='${y}' width='${width}' height='2' fill='${C.ink}'/>` + TAGS[r.tag](width, y + 10))}
        & "<text x='0' y='${y + 26}' font-size='14' font-weight='bold' fill='${C.ink}'>" & ${r.label} & "</text>"
        & "<g fill='${fill}'>" & ${daxPixel(r.value, "0", String(y + 40), 4, `${idBase}${i}`)} & "</g>"
        & "<text x='${width}' y='${y + rowH - 14}' text-anchor='end' font-size='14' fill='${C.ink}'>" & ${r.note} & "</text>"`;
  });
  return dax + `
        & ${daxStr(`<rect x='0' y='${rows.length * rowH}' width='${width}' height='2' fill='${C.ink}'/></svg>`)}`;
}

const pulseLedger = () => `
VAR _rev = [Latest Revenue]
VAR _ni = [Latest Net Income]
VAR _eps = [Latest EPS]
VAR _period = [Latest Period Label]
RETURN
    ${ledger(440, 116, [
      { label: `"Net sales and revenues, " & _period`, tag: "ACTUAL", value: `"$" & FORMAT(_rev, "#,##0") & "M"`, note: `${pct("[Latest Revenue YoY]")} & " vs a year earlier"` },
      { label: `"Net income, " & _period`, tag: "ACTUAL", value: `"$" & FORMAT(_ni, "#,##0") & "M"`, note: `${pct("[Latest Net Income YoY]")} & " vs a year earlier"` },
      { label: `"Diluted EPS, " & _period`, tag: "ACTUAL", value: `FORMAT(_eps, "$0.00")`, note: `${pct("[Latest EPS YoY]")} & " vs a year earlier"` },
      { label: `"Net income guidance, FY2026"`, tag: "GUIDANCE", value: `"$4.75B-5.00B"`, note: `"Management range, Q3 FY2026 release"` },
      { label: `"Share price, " & FORMAT([Latest Price Date], "d mmm yyyy")`, tag: "ACTUAL", value: `FORMAT([Latest Price], "$0.00")`, note: `FORMAT([Trailing PE], "0.0") & "x trailing four-quarter EPS"` },
    ], "pl")}`;

module.exports = {
  pct, esc, ledger, TAGS,
  measures: [
    { name: "Latest Period Label", doc: "Latest fiscal quarter as Q# FY####.", expr: `VAR p = [Latest Period Key] RETURN LOOKUPVALUE('Period'[Fiscal Quarter], 'Period'[Period Key], p) & " FY" & LOOKUPVALUE('Period'[Fiscal Year], 'Period'[Period Key], p)` },
    { name: "Latest EPS YoY", doc: "Latest-quarter diluted EPS growth versus the prior-year quarter.", expr: `VAR p = [Latest Period Key] RETURN CALCULATE(MAX('Quarterly Financials'[EPS YoY %]), REMOVEFILTERS('Period'), 'Quarterly Financials'[Period Key] = p)`, fmt: "0.0%" },
    { name: "SVG Stack Desk", doc: "The Stack: dithered desk with the card stack, full 1920x1080 canvas.", expr: daxStr(desk), svg: true },
    { name: "SVG Header PULSE", doc: "The Stack: PULSE card header with bitmap title and as-of line.", expr: header("PULSE"), svg: true },
    { name: "SVG Header VALUATION", doc: "The Stack: VALUATION card header with bitmap title and as-of line.", expr: header("VALUATION"), svg: true },
    { name: "SVG Pulse Divergence", doc: "The Stack: segment sales growth vs a year earlier over the last seven fiscal quarters.", expr: divergence(), svg: true },
    { name: "SVG Pulse Ledger", doc: "The Stack: PULSE ledger of latest-quarter actuals, guidance and price.", expr: pulseLedger(), svg: true },
  ],
};
