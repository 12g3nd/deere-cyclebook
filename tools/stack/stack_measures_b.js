// The Stack, part B: VALUATION finding, EPS ladder, ledger, scenario keys and P/E test strip.
const { C, svgOpen, svgDefs, daxStr } = require("./stack_lib");
const { pct, ledger, ledgerHeight } = require("./stack_measures_a");

// Ladder geometry: P/E 14..42 across x 80..860; EPS $10..$45 across y 460..60 (11.4286 px per dollar).
// The strip right of the plot (x 866..1000) carries the management guidance bracket and its label.
const X = (pe) => `(80 + (${pe} - 14) * 27.857)`;
const Y = (eps) => `(460 - ((${eps}) - 10) * 11.4286)`;
const clampX = (v) => `MAX(80, MIN(860, ${v}))`;
const clampY = (v) => `MAX(60, MIN(460, ${v}))`;
const r1 = (v) => `ROUND(${v}, 1)`;

const ladderStatic = svgOpen(1000, 540) + svgDefs +
  `<text x='0' y='22' font-size='16' font-weight='bold' fill='${C.ink}'>EPS Deere has to earn at each P/E</text>` +
  [20, 30, 40].map((e) => `<line x1='80' y1='${460 - (e - 10) * 11.4286}' x2='860' y2='${460 - (e - 10) * 11.4286}' stroke='${C.ink}' stroke-width='1' stroke-dasharray='2 5'/><text x='70' y='${465 - (e - 10) * 11.4286}' text-anchor='end' font-size='13' fill='${C.ink}'>$${e}</text>`).join("") +
  `<text x='70' y='465' text-anchor='end' font-size='13' fill='${C.ink}'>$10</text><rect x='80' y='459' width='780' height='3' fill='${C.ink}'/>` +
  [16, 20, 24, 28, 32, 36, 40].map((pe) => `<rect x='${80 + (pe - 14) * 27.857 - 1}' y='460' width='2' height='8' fill='${C.ink}'/><text x='${80 + (pe - 14) * 27.857}' y='486' text-anchor='middle' font-size='13' fill='${C.ink}'>${pe}x</text>`).join("");

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
VAR _selY = ${r1(clampY(Y("DIVIDE(_price, _pe)")))}
VAR _boxX = IF(_selX > 680, _selX - 250, _selX + 26)
VAR _boxY = _selY - 48
VAR _closeX = ${r1(X("16"))}
VAR _closeY = ${r1(clampY(Y("DIVIDE(_price, 16)")))}
VAR _curve = CONCATENATEX(GENERATESERIES(15.5, 42, 0.5), ${r1(X("[Value]"))} & "," & ${r1(clampY(Y("DIVIDE(_price, [Value])")))}, " ", [Value], ASC)
RETURN
    ${daxStr(ladderStatic)}
        & "<rect x='80' y='" & ${r1(Y("_bull"))} & "' width='780' height='" & ${r1("(_bull - _bear) * 11.4286")} & "' fill='url(%23s)'/>"
        & "<rect x='80' y='" & ${r1(Y("_bull"))} & "' width='780' height='1' fill='${C.ink}'/><rect x='80' y='" & ${r1(`${Y("_bear")} - 1`)} & "' width='780' height='1' fill='${C.ink}'/>"
        & "<rect x='870' y='" & ${r1(`${Y("_gHi")} - 1.5`)} & "' width='4' height='" & ${r1("(_gHi - _gLo) * 11.4286 + 3")} & "' fill='${C.green}'/>"
        & "<rect x='864' y='" & ${r1(`${Y("_gHi")} - 1.5`)} & "' width='16' height='3' fill='${C.green}'/><rect x='864' y='" & ${r1(`${Y("_gLo")} - 1.5`)} & "' width='16' height='3' fill='${C.green}'/>"
        & "<text x='886' y='" & ${r1(`${Y("_gHi")} - 6`)} & "' font-size='14' font-weight='bold' fill='${C.green}'>Guidance</text>"
        & "<text x='886' y='" & ${r1(`${Y("_gLo")} + 16`)} & "' font-size='13' font-weight='bold' fill='${C.green}'>" & FORMAT(_gLo, "$0.00") & "-" & FORMAT(_gHi, "0.00") & "</text>"
        & "<rect x='80' y='" & ${r1(`${Y("_peak")} - 1.5`)} & "' width='780' height='3' fill='${C.ink}'/>"
        & "<text x='860' y='" & ${r1(`${Y("_peak")} - 10`)} & "' text-anchor='end' font-size='13' font-weight='bold' fill='${C.ink}'>FY" & [Peak EPS Year] & " record, " & FORMAT(_peak, "$0.00") & "</text>"
        & "<polyline fill='none' stroke='${C.ink}' stroke-width='4' points='" & _curve & "'/>"
        & "<rect x='" & (_closeX - 5) & "' y='" & (_closeY - 5) & "' width='10' height='10' fill='${C.ink}'/>"
        & "<text x='" & (_closeX + 14) & "' y='" & (_closeY - 6) & "' font-size='14' font-weight='bold' fill='${C.ink}'>EPS needed at today's " & FORMAT(_price, "$0.00") & "</text>"
        & "<line x1='" & _peX & "' y1='" & ${r1(Y("_peak"))} & "' x2='" & _peX & "' y2='500' stroke='${C.ink}' stroke-width='2' stroke-dasharray='3 4'/>"
        & "<line x1='" & _scX & "' y1='" & ${r1(Y("_epsSel"))} & "' x2='" & _scX & "' y2='500' stroke='${C.ink}' stroke-width='2' stroke-dasharray='3 4'/>"
        & "<rect x='86' y='" & ${r1(`${Y("_bear")} + 6`)} & "' width='246' height='18' fill='${C.paper}'/>"
        & "<text x='90' y='" & ${r1(`${Y("_bear")} + 20`)} & "' font-size='13' fill='${C.ink}'>My bear-to-bull range</text>"
        & "<rect x='" & (_peX - 7) & "' y='" & ${r1(`${Y("_peak")} - 7`)} & "' width='14' height='14' fill='${C.ink}'/>"
        & "<rect x='" & (_scX - 7) & "' y='" & ${r1(`${Y("_epsSel")} - 7`)} & "' width='14' height='14' fill='${C.paper}' stroke='${C.ink}' stroke-width='3'/>"
        ${axisLabel("_peX", `FORMAT(DIVIDE(_price, _peak), "0.0") & "x = FY" & [Peak EPS Year] & " record EPS"`)}
        ${axisLabel("_scX", `FORMAT(DIVIDE(_price, _epsSel), "0.0") & "x = " & LOWER(_sc) & "-case FY2026 EPS"`)}
        & "<line x1='" & _selX & "' y1='" & _selY & "' x2='" & IF(_selX > 680, _boxX + 224, _boxX) & "' y2='" & (_boxY + 34) & "' stroke='${C.ink}' stroke-width='2'/>"
        & "<rect x='" & (_selX - 9) & "' y='" & (_selY - 9) & "' width='18' height='18' fill='${C.yellow}' stroke='${C.ink}' stroke-width='3'/>"
        & "<rect x='" & _boxX & "' y='" & _boxY & "' width='224' height='34' fill='${C.paper}' stroke='${C.ink}' stroke-width='2'/>"
        & "<text x='" & (_boxX + 12) & "' y='" & (_boxY + 23) & "' font-size='15' font-weight='bold' fill='${C.ink}'>At " & FORMAT(_pe, "0") & "x: EPS " & FORMAT(DIVIDE(_price, _pe), "$0.00") & "</text>"
        & "</svg>"`;

const valuationRows = [
  { label: `"Share price, " & FORMAT([Latest Price Date], "d mmm yyyy")`, tag: "ACTUAL", value: `FORMAT([Latest Price], "$0.00")`, note: `"52-week range " & FORMAT([Price 52W Low], "$0") & "-" & FORMAT([Price 52W High], "$0")` },
  { label: `"Market cap, diluted"`, tag: "ACTUAL", value: `"$" & FORMAT([Market Cap Bn], "0.0") & "B"`, note: `"on 269.8M diluted shares"` },
  { label: `"Trailing P/E"`, tag: "ACTUAL", value: `FORMAT([Trailing PE], "0.0") & "x"`, note: `"on " & FORMAT([TTM EPS], "$0.00") & " last-four-quarter EPS"` },
  { label: `"FY2026 EPS, " & LOWER(_sc) & " case"`, tag: "MODEL", value: `FORMAT([Projected EPS], "$0.00")`, note: `"net income " & FORMAT([Scenario Net Income Bn], "$0.00") & "B"` },
  { label: `"Value at " & FORMAT(_pe, "0") & "x"`, tag: "MODEL", value: `FORMAT([Implied Price], "$0")`, note: `${pct("[Implied Upside]")} & " vs close"` },
  { label: `"Q4 net income needed"`, tag: "MODEL", value: `"$" & FORMAT([Q4 Net Income Needed Bn], "0.00") & "B"`, note: `"after $3.81B through Q3"` },
];
const valuationLedger = `
VAR _sc = SELECTEDVALUE('Scenario'[Scenario], "Base")
VAR _pe = [Selected PE]
RETURN
    ${ledger(400, valuationRows, "vl")}`;

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
                    & IF(_on, "", "<rect x='" & (_x + 8) & "' y='60' width='72' height='12' fill='url(%23s)'/>")
                    & "<text x='" & (_x + 44.4) & "' y='28' text-anchor='middle' font-size='17' font-weight='bold' fill='" & _ink & "'>" & FORMAT('PE Multiple'[P/E Multiple], "0") & "x</text>"
                    & "<text x='" & (_x + 44.4) & "' y='52' text-anchor='middle' font-size='14' fill='" & _ink & "'>" & FORMAT('PE Multiple'[P/E Multiple] * _eps, "$0") & "</text>",
            "",
            'PE Multiple'[P/E Multiple], ASC
        )
        & "</svg>"`;

// Painted scenario keys in Bear, Base, Bull order; the pressed key inverts and loses its shadow.
const scenarioKeys = `
VAR _sel = SELECTEDVALUE('Scenario'[Scenario], "Base")
RETURN
    ${daxStr(svgOpen(372, 64))}${["Bear", "Base", "Bull"].map((name, i) => {
      const x = i * 124;
      return `
        & IF(_sel = "${name}",
            "<rect x='${x + 5.5}' y='5.5' width='109' height='53' rx='12' fill='${C.ink}' stroke='${C.ink}' stroke-width='3'/><text x='${x + 60}' y='38' text-anchor='middle' font-size='17' font-weight='bold' fill='${C.paper}'>${name}</text>",
            "<rect x='${x + 5.5}' y='5.5' width='109' height='53' rx='12' fill='${C.ink}' stroke='${C.ink}' stroke-width='3'/><rect x='${x + 1.5}' y='1.5' width='109' height='53' rx='12' fill='${C.paper}' stroke='${C.ink}' stroke-width='3'/><text x='${x + 56}' y='34' text-anchor='middle' font-size='17' font-weight='bold' fill='${C.ink}'>${name}</text>")`;
    }).join("")}
        & "</svg>"`;

// The live finding: what the close implies against the selected scenario, and where record EPS would put the multiple.
const findingParts = `
VAR _price = [Latest Price]
VAR _pe = [Selected PE]
VAR _sc = LOWER(SELECTEDVALUE('Scenario'[Scenario], "Base"))
VAR _eps = [Projected EPS]
VAR _need = DIVIDE(_price, _pe)
VAR _case = IF([Selected Sales Adjustment] = 0 && [Selected Margin Adjustment Bps] = 0, "the ", "your ") & _sc & " case"
VAR _l1 = "At " & FORMAT(_price, "$#,##0.00") & ", you're paying " & FORMAT(DIVIDE(_price, _eps), "0.0") & "x the " & FORMAT(_eps, "$0.00") & " a share Deere earns in " & _case & " this year."
VAR _gap = FORMAT(ABS(DIVIDE(_need, _eps) - 1), "0%") & IF(_need >= _eps, " above ", " below ")
VAR _l2 = "To justify " & FORMAT(_pe, "0") & "x, Deere has to earn " & FORMAT(_need, "$0.00") & " a share, " & _gap & _case & ". Its record EPS gets you to " & FORMAT(DIVIDE(_price, [Peak EPS]), "0.0") & "x."`;

const finding = `${findingParts}
RETURN _l1 & " " & _l2`;

const findingSvg = `${findingParts}
RETURN
    ${daxStr(svgOpen(1420, 84))}
        & "<text x='0' y='30' font-size='24' font-weight='bold' fill='${C.ink}'>" & _l1 & "</text>"
        & "<text x='0' y='70' font-size='22' fill='${C.ink}'>" & SUBSTITUTE(_l2, "%", "%25") & "</text>"
        & "</svg>"`;

module.exports = {
  valuationLedgerHeight: ledgerHeight(valuationRows),
  measures: [
    { name: "Valuation Finding", doc: "The Stack: live VALUATION finding as plain text (author to rewrite the words, see _brief/VOICE_REWRITES.md N1).", expr: finding },
    { name: "SVG Valuation Finding", doc: "The Stack: the live VALUATION finding set on two lines.", expr: findingSvg, svg: true },
    { name: "SVG Valuation Ladder", doc: "The Stack: EPS the latest close requires at each P/E, against the FY2023 record, guidance and scenarios.", expr: ladder, svg: true },
    { name: "SVG Valuation Ledger", doc: "The Stack: VALUATION ledger of price, multiples and scenario outputs.", expr: valuationLedger, svg: true },
    { name: "SVG PE Strip", doc: "The Stack: test strip of implied value at every P/E step; the transparent P/E slicer sits on top.", expr: peStrip, svg: true },
    { name: "SVG Scenario Keys", doc: "The Stack: painted Bear, Base and Bull keys; the transparent Scenario slicer sits on top.", expr: scenarioKeys, svg: true },
  ],
};
