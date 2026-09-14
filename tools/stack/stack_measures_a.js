// The Stack, part A: desk, card headers, helpers, PULSE finding, exhibit and ledger.
const { C, pixelRects, svgOpen, svgDefs, daxPixel, daxStr } = require("./stack_lib");

const pct = (dax) => `SUBSTITUTE(FORMAT(${dax}, "+0%;-0%;0%"), "%", "%25")`;
const esc = (s) => s.replace(/&/g, "&amp;");

function header(title) {
  const svg = svgOpen(1420, 96) + `<g fill='${C.ink}'>${pixelRects(title, 0, 8, 10)}</g>`;
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

// PULSE finding (1420x84): the author's sentence, then the latest quarter's segment growth behind it.
const yoyAt = (keyDax, code) => `LOOKUPVALUE('Quarterly Segments'[Sales YoY %], 'Quarterly Segments'[Period Key], ${keyDax}, 'Quarterly Segments'[Segment Code], "${code}")`;
const pulseFinding = `
VAR _key = [Latest Period Key]
RETURN
    ${daxStr(svgOpen(1420, 84))}
        & "<text x='0' y='30' font-size='24' font-weight='bold' fill='${C.ink}'>Large ag is shrinking again; small ag and construction still grow, just more slowly.</text>"
        & "<text x='0' y='70' font-size='22' fill='${C.ink}'>Sales in " & [Latest Period Label] & " vs a year earlier: PPA " & ${pct(yoyAt("_key", "PPA"))} & ", SAT " & ${pct(yoyAt("_key", "SAT"))} & ", C&amp;F " & ${pct(yoyAt("_key", "CF"))} & ".</text>"
        & "</svg>"`;

// PULSE exhibit (960x620): segment sales growth vs a year earlier, last seven fiscal quarters.
// Plot: +40% at y 100, zero at y 305, -40% at y 510.
const segs = [
  { code: "PPA", style: "stroke-width='5'" },
  { code: "SAT", style: "stroke-width='3' stroke-dasharray='14 7'" },
  { code: "CF", style: "stroke-width='3' stroke-dasharray='4 6'" },
];
const yPix = (v) => `ROUND(MAX(100, MIN(510, 305 - ${v} * 512.5)), 1)`;

const divergenceStatic = svgOpen(960, 620) +
  `<text x='0' y='22' font-size='16' font-weight='bold' fill='${C.ink}'>Segment net sales, change vs the same quarter a year earlier</text>` +
  `<g fill='none' stroke='${C.ink}'>` +
  `<line x1='0' y1='44' x2='34' y2='44' stroke-width='5'/><line x1='270' y1='44' x2='304' y2='44' stroke-width='3' stroke-dasharray='14 7'/><line x1='510' y1='44' x2='544' y2='44' stroke-width='3' stroke-dasharray='4 6'/></g>` +
  `<g font-size='13' fill='${C.ink}'><text x='42' y='49'>PPA ${esc("Production & Precision Ag")}</text><text x='312' y='49'>SAT Small Ag ${esc("&")} Turf</text><text x='552' y='49'>C${esc("&")}F Construction ${esc("&")} Forestry</text></g>` +
  [40, 20, -20, -40].map((v) => `<line x1='70' y1='${305 - v * 5.125}' x2='820' y2='${305 - v * 5.125}' stroke='${C.ink}' stroke-width='1' stroke-dasharray='2 5'/><text x='60' y='${310 - v * 5.125}' text-anchor='end' font-size='13' fill='${C.ink}'>${v > 0 ? "+" : ""}${v}%25</text>`).join("") +
  `<rect x='70' y='304' width='750' height='3' fill='${C.ink}'/><text x='60' y='310' text-anchor='end' font-size='13' fill='${C.ink}'>0</text>` +
  `<text x='78' y='297' font-size='12' fill='${C.ink}'>growing</text><text x='78' y='323' font-size='12' fill='${C.ink}'>shrinking</text>`;

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
        & CONCATENATEX(_pts, "<text x='" & [@x] & "' y='544' text-anchor='middle' font-size='13' fill='${C.ink}'>" & 'Period'[Period Label] & "</text>", "", [@x], ASC)
        & "</svg>"`;
}

// Ledger: a lead row with one bitmap figure, then plain rows. Every row carries its provenance word
// (ACTUAL solid, GUIDANCE green, MODEL stipple-marked outline) so it never relies on color alone.
// MODEL values sit in a stipple panel with a gutter, knocked out in paper behind the numerals.
const LEAD_H = 112, ROW_H = 76, PANEL_W = 150;
const TAG_W = { ACTUAL: 54, GUIDANCE: 72, MODEL: 60 };
function tag(t, x, y) {
  const w = TAG_W[t];
  if (t === "GUIDANCE") return `<rect x='${x}' y='${y}' width='${w}' height='16' fill='${C.green}'/><text x='${x + w / 2}' y='${y + 12}' text-anchor='middle' font-size='10' font-weight='bold' fill='${C.paper}'>GUIDANCE</text>`;
  if (t === "MODEL") return `<rect x='${x + 0.75}' y='${y + 0.75}' width='${w - 1.5}' height='14.5' fill='${C.paper}' stroke='${C.ink}' stroke-width='1.5'/><rect x='${x + 4}' y='${y + 4}' width='8' height='8' fill='url(%23s)'/><text x='${x + 36}' y='${y + 12}' text-anchor='middle' font-size='10' font-weight='bold' fill='${C.ink}'>MODEL</text>`;
  return `<rect x='${x}' y='${y}' width='${w}' height='16' fill='${C.ink}'/><text x='${x + w / 2}' y='${y + 12}' text-anchor='middle' font-size='10' font-weight='bold' fill='${C.paper}'>ACTUAL</text>`;
}
const ledgerHeight = (rows) => LEAD_H + (rows.length - 1) * ROW_H + 4;

function ledger(width, rows, idBase) {
  const h = ledgerHeight(rows);
  let dax = daxStr(svgOpen(width, h) + svgDefs);
  rows.forEach((r, i) => {
    const fill = r.tag === "GUIDANCE" ? C.green : C.ink;
    const noteX = TAG_W[r.tag] + 8;
    if (i === 0) {
      const p = 5;
      const figW = `(LEN(${r.value}) * ${6 * p} - ${p})`;
      // A MODEL lead figure sits on its stipple mat, knocked out in paper, like the MODEL rows below it.
      const model = r.tag === "MODEL";
      const right = model ? width - 12 : width;
      const mat = model ? `
        & "<rect x='" & (${width} - ${figW} - 34) & "' y='58' width='" & (${figW} + 34) & "' height='50' fill='url(%23g)'/>"
        & "<rect x='" & (${right} - ${figW} - 6) & "' y='62' width='" & (${figW} + 12) & "' height='43' fill='${C.paper}'/>"` : "";
      dax += `
        & ${daxStr(`<rect x='0' y='0' width='${width}' height='3' fill='${C.ink}'/>` + tag(r.tag, 0, 38))}${mat}
        & "<text x='0' y='26' font-size='15' font-weight='bold' fill='${C.ink}'>" & ${r.label} & "</text>"
        & "<text x='${noteX}' y='51' font-size='13' fill='${C.ink}'>" & ${r.note} & "</text>"
        & "<g fill='${fill}'>" & ${daxPixel(r.value, `(${right} - ${figW})`, "66", p, `${idBase}${i}`)} & "</g>"`;
      return;
    }
    const y = LEAD_H + (i - 1) * ROW_H;
    const model = r.tag === "MODEL";
    const panel = model ? `<rect x='${width - PANEL_W}' y='${y + 10}' width='${PANEL_W}' height='${ROW_H - 20}' fill='url(%23g)'/>` : "";
    const valueX = model ? width - 10 : width;
    const halo = model ? ` stroke='${C.paper}' stroke-width='7' stroke-linejoin='round' paint-order='stroke'` : "";
    dax += `
        & ${daxStr(`<rect x='0' y='${y}' width='${width}' height='1' fill='${C.ink}'/>` + panel + tag(r.tag, 0, y + 34))}
        & "<text x='0' y='${y + 24}' font-size='14' font-weight='bold' fill='${C.ink}'>" & ${r.label} & "</text>"
        & "<text x='${noteX}' y='${y + 47}' font-size='12' fill='${C.ink}'>" & ${r.note} & "</text>"
        & "<text x='${valueX}' y='${y + 45}' text-anchor='end' font-size='22' font-weight='bold' fill='${fill}'${halo}>" & ${r.value} & "</text>"`;
  });
  return dax + `
        & ${daxStr(`<rect x='0' y='${h - 3}' width='${width}' height='2' fill='${C.ink}'/></svg>`)}`;
}

const bridge = (kindFilter) => `CALCULATE(SUM('Earnings Bridge'[Q3 FY26]), ${kindFilter})`;
const pulseRows = [
  { label: `"Net sales and revenues, " & _period`, tag: "ACTUAL", value: `"$" & FORMAT([Latest Revenue], "#,##0") & "M"`, note: `${pct("[Latest Revenue YoY]")} & " vs a year earlier"` },
  { label: `"Net income, " & _period`, tag: "ACTUAL", value: `"$" & FORMAT([Latest Net Income], "#,##0") & "M"`, note: `${pct("[Latest Net Income YoY]")} & " vs a year earlier"` },
  { label: `"Diluted EPS, " & _period`, tag: "ACTUAL", value: `FORMAT([Latest EPS], "$0.00")`, note: `${pct("[Latest EPS YoY]")} & " vs a year earlier"` },
  { label: `"Equipment operating profit, " & _period`, tag: "ACTUAL", value: `"$" & FORMAT(${bridge(`'Earnings Bridge'[Order] <= 3`)}, "#,##0") & "M"`, note: `"PPA $" & FORMAT(${bridge(`'Earnings Bridge'[Order] = 1`)}, "#,##0") & "M, SAT $" & FORMAT(${bridge(`'Earnings Bridge'[Order] = 2`)}, "#,##0") & "M, C&amp;F $" & FORMAT(${bridge(`'Earnings Bridge'[Order] = 3`)}, "#,##0") & "M"` },
  { label: `"Net income, fiscal 2026 to date"`, tag: "ACTUAL", value: `"$" & FORMAT(CALCULATE(SUM('Earnings Bridge'[YTD FY26]), 'Earnings Bridge'[Kind] = "Total"), "#,##0") & "M"`, note: `"First three quarters"` },
  { label: `"Net income guidance, FY2026"`, tag: "GUIDANCE", value: `"$4.75B-5.00B"`, note: `"Management range"` },
  { label: `"Share price, " & FORMAT([Latest Price Date], "d mmm yyyy")`, tag: "ACTUAL", value: `FORMAT([Latest Price], "$0.00")`, note: `FORMAT([Trailing PE], "0.0") & "x trailing four-quarter EPS"` },
];
const pulseLedger = () => `
VAR _period = [Latest Period Label]
RETURN
    ${ledger(440, pulseRows, "pl")}`;

// A card finding (1420x84): the claim in 24px bold, the evidence under it in 22px regular.
// vars is a DAX VAR block; l1 and l2 are DAX text expressions with % already escaped.
const finding2 = (vars, l1, l2) => `
${vars}
RETURN
    ${daxStr(svgOpen(1420, 84))}
        & "<text x='0' y='30' font-size='24' font-weight='bold' fill='${C.ink}'>" & ${l1} & "</text>"
        & "<text x='0' y='70' font-size='22' fill='${C.ink}'>" & ${l2} & "</text>"
        & "</svg>"`;

module.exports = {
  pct, esc, ledger, ledgerHeight, header, finding2, tag,
  pulseLedgerHeight: ledgerHeight(pulseRows),
  measures: [
    { name: "Latest Period Label", doc: "Latest fiscal quarter as Q# FY####.", expr: `VAR p = [Latest Period Key] RETURN LOOKUPVALUE('Period'[Fiscal Quarter], 'Period'[Period Key], p) & " FY" & LOOKUPVALUE('Period'[Fiscal Year], 'Period'[Period Key], p)` },
    { name: "Latest EPS YoY", doc: "Latest-quarter diluted EPS growth versus the prior-year quarter.", expr: `VAR p = [Latest Period Key] RETURN CALCULATE(MAX('Quarterly Financials'[EPS YoY %]), REMOVEFILTERS('Period'), 'Quarterly Financials'[Period Key] = p)`, fmt: "0.0%" },
    { name: "SVG Stack Desk", doc: "The Stack: dithered desk with the card stack, full 1920x1080 canvas.", expr: daxStr(desk), svg: true },
    { name: "SVG Header PULSE", doc: "The Stack: PULSE card header with bitmap title and as-of line.", expr: header("PULSE"), svg: true },
    { name: "SVG Header VALUATION", doc: "The Stack: VALUATION card header with bitmap title and as-of line.", expr: header("VALUATION"), svg: true },
    { name: "SVG Pulse Finding", doc: "The Stack: PULSE finding (author to rewrite line one, see _brief/VOICE_REWRITES.md P2) over the latest quarter's segment growth.", expr: pulseFinding, svg: true },
    { name: "SVG Pulse Divergence", doc: "The Stack: segment sales growth vs a year earlier over the last seven fiscal quarters.", expr: divergence(), svg: true },
    { name: "SVG Pulse Ledger", doc: "The Stack: PULSE ledger of latest-quarter actuals, guidance and price.", expr: pulseLedger(), svg: true },
  ],
};
