// The Stack, part B: VALUATION finding, EPS ladder, ledger, scenario keys and P/E test strip.
const { C, svgOpen, svgDefs, daxStr } = require("./stack_lib");
const { pct, ledger } = require("./stack_measures_a");

// Ladder geometry: P/E 14..42 across x 80..960; EPS $0..$50 across y 460..60.
const X = (pe) => `(80 + (${pe} - 14) * 31.4286)`;
const Y = (eps) => `(460 - (${eps}) * 8)`;
const clampX = (v) => `MAX(80, MIN(960, ${v}))`;
const r1 = (v) => `ROUND(${v}, 1)`;

const ladderStatic = svgOpen(1000, 540) + svgDefs +
  `<text x='0' y='22' font-size='16' font-weight='bold' fill='${C.ink}'>EPS the price requires, at each P/E</text>` +
  [10, 20, 30, 40, 50].map((e) => `<line x1='80' y1='${460 - e * 8}' x2='960' y2='${460 - e * 8}' stroke='${C.ink}' stroke-width='1' stroke-dasharray='2 5'/><text x='70' y='${465 - e * 8}' text-anchor='end' font-size='13' fill='${C.ink}'>$${e}</text>`).join("") +
  `<text x='70' y='465' text-anchor='end' font-size='13' fill='${C.ink}'>$0</text><rect x='80' y='459' width='880' height='3' fill='${C.ink}'/>` +
  [16, 20, 24, 28, 32, 36, 40].map((pe) => `<rect x='${80 + (pe - 14) * 31.4286 - 1}' y='460' width='2' height='8' fill='${C.ink}'/><text x='${80 + (pe - 14) * 31.4286}' y='486' text-anchor='middle' font-size='13' fill='${C.ink}'>${pe}x</text>`).join("");

// A multiple read-out on the axis row, centred under its marker and kept inside the plot.
const axisLabel = (xDax, textDax) => `
        & "<rect x='" & (MAX(150, MIN(850, ${xDax})) - 150) & "' y='502' width='300' height='30' fill='${C.paper}'/>"
        & "<text x='" & MAX(150, MIN(850, ${xDax})) & "' y='523' text-anchor='middle' font-size='14' font-weight='bold' fill='${C.ink}'>" & ${textDax} & "</text>"`;

const ladder = `
VAR _price = [Latest Price]
VAR _pe = [Selected PE]
VAR _sc = SELECTEDVALUE('Scenario'[Scenario], "Base")
VAR _epsSel = [Projected EPS]
VAR _bear = CALCULATE(DIVIDE(MAX('Scenario'[Net Income]), 269.8), REMOVEFILTERS('Scenario'), 'Scenario'[Scenario] = "Bear")
VAR _bull = CALCULATE(DIVIDE(MAX('Scenario'[Net Income]), 269.8), REMOVEFILTERS('Scenario'), 'Scenario'[Scenario] = "Bull")
VAR _gLo = 4750 / 269.8
VAR _gHi = 5000 / 269.8
VAR _peak = [Peak EPS]
VAR _peX = ${r1(clampX(X("DIVIDE(_price, _peak)")))}
VAR _scX = ${r1(clampX(X("DIVIDE(_price, _epsSel)")))}
VAR _selX = ${r1(X("_pe"))}
VAR _selY = ${r1(`MAX(60, ${Y("DIVIDE(_price, _pe)")})`)}
VAR _boxX = IF(_selX > 700, _selX - 246, _selX + 20)
VAR _curve = CONCATENATEX(GENERATESERIES(14, 42, 0.5), ${r1(X("[Value]"))} & "," & ${r1(`MAX(60, ${Y("DIVIDE(_price, [Value])")})`)}, " ", [Value], ASC)
RETURN
    ${daxStr(ladderStatic)}
        & "<rect x='80' y='" & ${r1(Y("_bull"))} & "' width='880' height='" & ${r1("(_bull - _bear) * 8")} & "' fill='url(%23s)' stroke='${C.ink}' stroke-width='1'/>"
        & "<rect x='80' y='" & ${r1(Y("_gHi"))} & "' width='880' height='" & ${r1("(_gHi - _gLo) * 8")} & "' fill='${C.green}'/>"
        & "<rect x='80' y='" & ${r1(`${Y("_peak")} - 1.5`)} & "' width='880' height='3' fill='${C.ink}'/>"
        & "<text x='960' y='" & ${r1(`${Y("_peak")} - 10`)} & "' text-anchor='end' font-size='13' font-weight='bold' fill='${C.ink}'>FY" & [Peak EPS Year] & " record, " & FORMAT(_peak, "$0.00") & "</text>"
        & "<polyline fill='none' stroke='${C.ink}' stroke-width='4' points='" & _curve & "'/>"
        & "<text x='150' y='104' font-size='14' font-weight='bold' fill='${C.ink}'>Close " & FORMAT(_price, "$0.00") & "</text>"
        & "<line x1='" & _peX & "' y1='" & ${r1(Y("_peak"))} & "' x2='" & _peX & "' y2='500' stroke='${C.ink}' stroke-width='2' stroke-dasharray='3 4'/>"
        & "<line x1='" & _scX & "' y1='" & ${r1(Y("_epsSel"))} & "' x2='" & _scX & "' y2='500' stroke='${C.ink}' stroke-width='2' stroke-dasharray='3 4'/>"
        & "<rect x='86' y='" & ${r1(`${Y("_bull")} - 26`)} & "' width='218' height='18' fill='${C.paper}'/>"
        & "<text x='90' y='" & ${r1(`${Y("_bull")} - 12`)} & "' font-size='13' font-weight='bold' fill='${C.green}'>Management guidance, FY2026</text>"
        & "<rect x='86' y='" & ${r1(`${Y("_bear")} + 6`)} & "' width='246' height='18' fill='${C.paper}'/>"
        & "<text x='90' y='" & ${r1(`${Y("_bear")} + 20`)} & "' font-size='13' fill='${C.ink}'>CYCLEBOOK scenarios, bear to bull</text>"
        & "<rect x='" & (_peX - 7) & "' y='" & ${r1(`${Y("_peak")} - 7`)} & "' width='14' height='14' fill='${C.ink}'/>"
        & "<rect x='" & (_scX - 7) & "' y='" & ${r1(`${Y("_epsSel")} - 7`)} & "' width='14' height='14' fill='${C.paper}' stroke='${C.ink}' stroke-width='3'/>"
        ${axisLabel("_peX", `FORMAT(DIVIDE(_price, _peak), "0.0") & "x = FY" & [Peak EPS Year] & " record EPS"`)}
        ${axisLabel("_scX", `FORMAT(DIVIDE(_price, _epsSel), "0.0") & "x = " & LOWER(_sc) & "-case FY2026 EPS"`)}
        & "<rect x='" & (_selX - 9) & "' y='" & (_selY - 9) & "' width='18' height='18' fill='${C.yellow}' stroke='${C.ink}' stroke-width='3'/>"
        & "<rect x='" & _boxX & "' y='" & (_selY - 54) & "' width='226' height='34' fill='${C.paper}' stroke='${C.ink}' stroke-width='2'/>"
        & "<text x='" & (_boxX + 12) & "' y='" & (_selY - 31) & "' font-size='15' font-weight='bold' fill='${C.ink}'>At " & FORMAT(_pe, "0") & "x: EPS " & FORMAT(DIVIDE(_price, _pe), "$0.00") & "</text>"
        & "</svg>"`;

const valuationLedger = `
VAR _sc = SELECTEDVALUE('Scenario'[Scenario], "Base")
VAR _pe = [Selected PE]
RETURN
    ${ledger(400, 88, [
      { label: `"Share price, " & FORMAT([Latest Price Date], "d mmm yyyy")`, tag: "ACTUAL", value: `FORMAT([Latest Price], "$0.00")`, note: `"52-week range " & FORMAT([Price 52W Low], "$0") & "-" & FORMAT([Price 52W High], "$0")` },
      { label: `"Market cap, diluted"`, tag: "ACTUAL", value: `"$" & FORMAT([Market Cap Bn], "0.0") & "B"`, note: `"on 269.8M diluted shares"` },
      { label: `"Trailing P/E"`, tag: "ACTUAL", value: `FORMAT([Trailing PE], "0.0") & "x"`, note: `"on " & FORMAT([TTM EPS], "$0.00") & " last-four-quarter EPS"` },
      { label: `"FY2026 EPS, " & LOWER(_sc) & " case"`, tag: "MODEL", value: `FORMAT([Projected EPS], "$0.00")`, note: `"net income " & FORMAT([Scenario Net Income Bn], "$0.00") & "B"` },
      { label: `"Value at " & FORMAT(_pe, "0") & "x"`, tag: "MODEL", value: `FORMAT([Implied Price], "$0")`, note: `${pct("[Implied Upside]")} & " vs close"` },
      { label: `"Q4 net income needed"`, tag: "MODEL", value: `"$" & FORMAT([Q4 Net Income Needed Bn], "0.00") & "B"`, note: `"after $3.81B through Q3"` },
    ], "vl")}`;

// Test strip: one cell per P/E step, implied value for the selected scenario, selected step inverted.
const peStrip = `
VAR _sel = [Selected PE]
VAR _eps = [Projected EPS]
VAR _steps = ADDCOLUMNS(ALL('PE Multiple'[P/E Multiple]), "@i", RANKX(ALL('PE Multiple'[P/E Multiple]), 'PE Multiple'[P/E Multiple], , ASC) - 1)
RETURN
    ${daxStr(svgOpen(1036, 80) + svgDefs)}
        & CONCATENATEX(
            _steps,
            VAR _x = ROUND([@i] * 94.7, 1)
            VAR _on = 'PE Multiple'[P/E Multiple] = _sel
            VAR _ink = IF(_on, "${C.paper}", "${C.ink}")
            RETURN
                "<rect x='" & (_x + 1.5) & "' y='1.5' width='85.7' height='77' fill='" & IF(_on, "${C.ink}", "${C.paper}") & "' stroke='${C.ink}' stroke-width='3'/>"
                    & IF(_on, "", "<rect x='" & (_x + 8) & "' y='62' width='72' height='8' fill='url(%23s)'/>")
                    & "<text x='" & (_x + 44.4) & "' y='28' text-anchor='middle' font-size='17' font-weight='bold' fill='" & _ink & "'>" & FORMAT('PE Multiple'[P/E Multiple], "0") & "x</text>"
                    & "<text x='" & (_x + 44.4) & "' y='52' text-anchor='middle' font-size='14' fill='" & _ink & "'>" & FORMAT('PE Multiple'[P/E Multiple] * _eps, "$0") & "</text>",
            "",
            'PE Multiple'[P/E Multiple], ASC
        )
        & "</svg>"`;

// Painted scenario keys in Bear, Base, Bull order; the pressed key inverts and loses its shadow.
const scenarioKeys = `
VAR _sel = SELECTEDVALUE('Scenario'[Scenario], "Base")
VAR _key = (name, i) => 0
RETURN
    ${daxStr(svgOpen(372, 64))}${["Bear", "Base", "Bull"].map((name, i) => {
      const x = i * 124;
      return `
        & IF(_sel = "${name}",
            "<rect x='${x + 5.5}' y='5.5' width='109' height='53' rx='12' fill='${C.ink}' stroke='${C.ink}' stroke-width='3'/><text x='${x + 60}' y='38' text-anchor='middle' font-size='17' font-weight='bold' fill='${C.paper}'>${name}</text>",
            "<rect x='${x + 5.5}' y='5.5' width='109' height='53' rx='12' fill='${C.ink}'/><rect x='${x + 1.5}' y='1.5' width='109' height='53' rx='12' fill='${C.paper}' stroke='${C.ink}' stroke-width='3'/><text x='${x + 56}' y='34' text-anchor='middle' font-size='17' font-weight='bold' fill='${C.ink}'>${name}</text>")`;
    }).join("")}
        & "</svg>"`.replace("VAR _key = (name, i) => 0\n", "");

// The live finding, set on two lines so it never truncates.
const finding = `
VAR _pe = [Selected PE]
VAR _gap = [Price Implied EPS vs Peak]
RETURN
    "At " & FORMAT(_pe, "0") & "x, today's price of " & FORMAT([Latest Price], "$#,##0.00")
        & " needs EPS of " & FORMAT([Price Implied EPS], "$0.00") & ", "
        & FORMAT(ABS(_gap), "0%") & IF(_gap < 0, " below", " above")
        & " the FY" & [Peak EPS Year] & " record of " & FORMAT([Peak EPS], "$0.00") & "."`;

const findingSvg = `
VAR _pe = [Selected PE]
VAR _gap = [Price Implied EPS vs Peak]
RETURN
    ${daxStr(svgOpen(1420, 84))}
        & "<text x='0' y='30' font-size='27' font-weight='bold' fill='${C.ink}'>At " & FORMAT(_pe, "0") & "x, today's price of " & FORMAT([Latest Price], "$#,##0.00") & " needs EPS of " & FORMAT([Price Implied EPS], "$0.00") & ",</text>"
        & "<text x='0' y='72' font-size='27' font-weight='bold' fill='${C.ink}'>" & SUBSTITUTE(FORMAT(ABS(_gap), "0%"), "%", "%25") & IF(_gap < 0, " below", " above") & " the FY" & [Peak EPS Year] & " record of " & FORMAT([Peak EPS], "$0.00") & ".</text>"
        & "</svg>"`;

module.exports = {
  measures: [
    { name: "Valuation Finding", doc: "The Stack: live VALUATION finding sentence as plain text (author to rewrite the words, see _brief/VOICE_REWRITES.md N1).", expr: finding },
    { name: "SVG Valuation Finding", doc: "The Stack: the live VALUATION finding set on two lines.", expr: findingSvg, svg: true },
    { name: "SVG Valuation Ladder", doc: "The Stack: EPS the latest close requires at each P/E, against the FY2023 record, guidance and scenarios.", expr: ladder, svg: true },
    { name: "SVG Valuation Ledger", doc: "The Stack: VALUATION ledger of price, multiples and scenario outputs.", expr: valuationLedger, svg: true },
    { name: "SVG PE Strip", doc: "The Stack: test strip of implied value at every P/E step; the transparent P/E slicer sits on top.", expr: peStrip, svg: true },
    { name: "SVG Scenario Keys", doc: "The Stack: painted Bear, Base and Bull keys; the transparent Scenario slicer sits on top.", expr: scenarioKeys, svg: true },
  ],
};
