// The Stack, FINANCIALS card: net income by fiscal year against FY2026 guidance, and the year-to-date ledger.
const { C, svgOpen, daxStr } = require("./stack_lib");
const { pct, ledger, ledgerHeight, header, finding2 } = require("./stack_measures_a");

const ytd = (col, back) => `CALCULATE(SUM('Quarterly Financials'[${col}]), REMOVEFILTERS('Quarterly Financials'), REMOVEFILTERS('Period'), 'Quarterly Financials'[Fiscal Year] = _fy - ${back}, 'Quarterly Financials'[Period Key] <= _k - ${back * 100})`;
const annual = (col, yearVar) => `CALCULATE(SUM('Annual Financials'[${col}]), REMOVEFILTERS('Annual Financials'), 'Annual Financials'[Fiscal Year] = ${yearVar})`;

// Shared by the finding, the exhibit and the ledger. Guidance is the Q3 FY2026 release range, in $M.
const vars = `
VAR _k = [Latest Period Key]
VAR _fy = INT(_k / 100)
VAR _q = MOD(_k, 100)
VAR _ni = ${ytd("Net Income", 0)}
VAR _niP = ${ytd("Net Income", 1)}
VAR _rev = ${ytd("Net Sales & Revenues", 0)}
VAR _revP = ${ytd("Net Sales & Revenues", 1)}
VAR _eps = ${ytd("Diluted EPS", 0)}
VAR _peak = CALCULATE(MAX('Annual Financials'[Net Income]), REMOVEFILTERS('Annual Financials'))
VAR _peakYr = CALCULATE(MAX('Annual Financials'[Fiscal Year]), REMOVEFILTERS('Annual Financials'), 'Annual Financials'[Net Income] = _peak)
VAR _lastYr = CALCULATE(MAX('Annual Financials'[Fiscal Year]), REMOVEFILTERS('Annual Financials'))
VAR _lastNi = ${annual("Net Income", "_lastYr")}
VAR _lastEps = ${annual("Diluted EPS", "_lastYr")}
VAR _peakEps = ${annual("Diluted EPS", "_peakYr")}
VAR _lastQ4 = CALCULATE(SUM('Quarterly Financials'[Net Income]), REMOVEFILTERS('Quarterly Financials'), REMOVEFILTERS('Period'), 'Quarterly Financials'[Period Key] = _lastYr * 100 + 4)
VAR _gLo = 4750
VAR _gHi = 5000
VAR _thru = "FY" & _fy & " through Q" & _q`;

const dir = (ratio) => `IF(${ratio} >= 0, "up ", "down ") & SUBSTITUTE(FORMAT(ABS(${ratio}), "0%"), "%", "%25")`;
const finding = finding2(vars,
  `"Through Q" & _q & ", fiscal " & _fy & " sales are " & ${dir("DIVIDE(_rev, _revP) - 1")} & " on a year earlier and net income is " & ${dir("DIVIDE(_ni, _niP) - 1")} & "."`,
  `"Net income peaked at " & FORMAT(_peak / 1000, "$0.00") & "B in FY" & _peakYr & "; FY" & _fy & " guidance of $4.75B-5.00B " & IF(_gHi < _lastNi, "is below", IF(_gLo > _lastNi, "is above", "brackets")) & " FY" & _lastYr & "'s " & FORMAT(_lastNi / 1000, "$0.00") & "B."`);

// Exhibit (960x620). Plot: $0 at y 470, 36.36px per $1B; one column per fiscal year, 166px pitch from x 153.
const yB = (m) => `ROUND(470 - (${m}) / 1000 * 36.36, 1)`;
const exhibitStatic = svgOpen(960, 620) +
  `<text x='0' y='22' font-size='16' font-weight='bold' fill='${C.ink}'>Net income by fiscal year, against FY2026 guidance</text>` +
  `<g font-size='13' fill='${C.ink}'><rect x='0' y='35' width='14' height='14' fill='${C.ink}'/><text x='22' y='47'>Reported</text>` +
  `<rect x='120' y='36' width='13' height='13' fill='none' stroke='${C.ink}' stroke-width='2' stroke-dasharray='4 3'/><text x='142' y='47'>Still to earn in Q4 to reach guidance</text>` +
  `<rect x='430' y='35' width='14' height='14' fill='${C.green}'/><text x='452' y='47'>Management guidance</text></g>` +
  [2, 4, 6, 8, 10].map((b) => `<line x1='70' y1='${470 - b * 36.36}' x2='900' y2='${470 - b * 36.36}' stroke='${C.ink}' stroke-width='1' stroke-dasharray='2 5'/><text x='60' y='${475 - b * 36.36}' text-anchor='end' font-size='13' fill='${C.ink}'>$${b}B</text>`).join("") +
  `<rect x='70' y='469' width='830' height='3' fill='${C.ink}'/>` +
  `<rect x='0' y='508' width='960' height='3' fill='${C.ink}'/><rect x='0' y='546' width='960' height='1' fill='${C.ink}'/><rect x='0' y='580' width='960' height='2' fill='${C.ink}'/>` +
  `<g font-size='14' font-weight='bold' fill='${C.ink}'><text x='0' y='533'>Sales</text><text x='0' y='569'>EPS</text></g>`;

const exhibit = `${vars}
VAR _y0 = MINX(ALL('Annual Financials'), 'Annual Financials'[Fiscal Year])
VAR _cx = 153 + (_fy - _y0) * 166
VAR _top = ${yB("_ni")}
VAR _gTop = ${yB("_gHi")}
VAR _gBot = ${yB("_gLo")}
RETURN
    ${daxStr(exhibitStatic)}
        & CONCATENATEX(ALL('Annual Financials'),
            VAR _x = 153 + ('Annual Financials'[Fiscal Year] - _y0) * 166
            VAR _t = ${yB("'Annual Financials'[Net Income]")}
            RETURN
                "<rect x='" & (_x - 50) & "' y='" & _t & "' width='100' height='" & (470 - _t) & "' fill='${C.ink}'/>"
                & "<text x='" & _x & "' y='" & (_t - 10) & "' text-anchor='middle' font-size='15' font-weight='bold' fill='${C.ink}'>" & FORMAT('Annual Financials'[Net Income] / 1000, "$0.00") & "B</text>"
                & "<text x='" & _x & "' y='496' text-anchor='middle' font-size='14' font-weight='bold' fill='${C.ink}'>FY" & 'Annual Financials'[Fiscal Year] & "</text>"
                & "<text x='" & _x & "' y='533' text-anchor='middle' font-size='14' fill='${C.ink}'>" & FORMAT('Annual Financials'[Net Sales & Revenues] / 1000, "$0.0") & "B</text>"
                & "<text x='" & _x & "' y='569' text-anchor='middle' font-size='14' fill='${C.ink}'>" & FORMAT('Annual Financials'[Diluted EPS], "$0.00") & "</text>",
            "", 'Annual Financials'[Fiscal Year], ASC)
        & "<rect x='" & (_cx - 50) & "' y='" & _top & "' width='100' height='" & (470 - _top) & "' fill='${C.ink}'/>"
        & "<text x='" & _cx & "' y='" & (_top + 24) & "' text-anchor='middle' font-size='15' font-weight='bold' fill='${C.paper}'>" & FORMAT(_ni / 1000, "$0.00") & "B</text>"
        & "<text x='" & _cx & "' y='" & (_top + 42) & "' text-anchor='middle' font-size='12' fill='${C.paper}'>to Q" & _q & "</text>"
        & "<rect x='" & (_cx - 49) & "' y='" & _gBot & "' width='98' height='" & (_top - _gBot) & "' fill='none' stroke='${C.ink}' stroke-width='2' stroke-dasharray='6 4'/>"
        & "<rect x='" & (_cx - 50) & "' y='" & _gTop & "' width='100' height='" & (_gBot - _gTop) & "' fill='${C.green}'/>"
        & "<rect x='" & (_cx - 90) & "' y='" & (_gTop - 46) & "' width='180' height='40' fill='${C.paper}'/>"
        & "<text x='" & _cx & "' y='" & (_gTop - 30) & "' text-anchor='middle' font-size='13' font-weight='bold' fill='${C.green}'>Guidance $4.75B-5.00B</text>"
        & "<text x='" & _cx & "' y='" & (_gTop - 12) & "' text-anchor='middle' font-size='13' fill='${C.ink}'>Q4 needs " & FORMAT((_gLo - _ni) / 1000, "$0.00") & "B-" & FORMAT((_gHi - _ni) / 1000, "0.00") & "B</text>"
        & "<text x='" & _cx & "' y='496' text-anchor='middle' font-size='14' font-weight='bold' fill='${C.ink}'>FY" & _fy & "</text>"
        & "<text x='" & _cx & "' y='533' text-anchor='middle' font-size='14' fill='${C.ink}'>" & FORMAT(_rev / 1000, "$0.0") & "B to Q" & _q & "</text>"
        & "<text x='" & _cx & "' y='569' text-anchor='middle' font-size='14' fill='${C.ink}'>" & FORMAT(_eps, "$0.00") & " to Q" & _q & "</text>"
        & "</svg>"`;

const margin = (n, d) => `SUBSTITUTE(FORMAT(DIVIDE(${n}, ${d}), "0.0%"), "%", "%25")`;
const rows = [
  { label: `"Net income, " & _thru`, tag: "ACTUAL", value: `"$" & FORMAT(_ni, "#,##0") & "M"`, note: `${pct("DIVIDE(_ni, _niP) - 1")} & " vs the same quarters of FY" & (_fy - 1)` },
  { label: `"Net sales and revenues, " & _thru`, tag: "ACTUAL", value: `"$" & FORMAT(_rev, "#,##0") & "M"`, note: `${pct("DIVIDE(_rev, _revP) - 1")} & " vs a year earlier"` },
  { label: `"Net margin, " & _thru`, tag: "ACTUAL", value: margin("_ni", "_rev"), note: `${margin("_niP", "_revP")} & " a year earlier"` },
  { label: `"Net income, FY" & _lastYr`, tag: "ACTUAL", value: `"$" & FORMAT(_lastNi, "#,##0") & "M"`, note: `"Diluted EPS " & FORMAT(_lastEps, "$0.00")` },
  { label: `"Net income, FY" & _peakYr & " record"`, tag: "ACTUAL", value: `"$" & FORMAT(_peak, "#,##0") & "M"`, note: `"Diluted EPS " & FORMAT(_peakEps, "$0.00")` },
  { label: `"Net income guidance, FY" & _fy`, tag: "GUIDANCE", value: `"$4.75B-5.00B"`, note: `"Management range"` },
  { label: `"Q4 net income implied by guidance"`, tag: "GUIDANCE", value: `"$" & FORMAT(_gLo - _ni, "#,##0") & "M-" & FORMAT(_gHi - _ni, "#,##0") & "M"`, note: `"Q4 FY" & _lastYr & ": $" & FORMAT(_lastQ4, "#,##0") & "M"` },
];

module.exports = {
  ledgerHeight: ledgerHeight(rows),
  measures: [
    { name: "SVG Header FINANCIALS", doc: "The Stack: FINANCIALS card header.", expr: header("FINANCIALS"), svg: true },
    { name: "SVG Financials Finding", doc: "The Stack: FINANCIALS finding, year-to-date sales and net income against a year earlier, then the peak and guidance.", expr: finding, svg: true },
    { name: "SVG Financials Exhibit", doc: "The Stack: net income by fiscal year with the current year to date, what Q4 still needs, and the guidance range.", expr: exhibit, svg: true },
    { name: "SVG Financials Ledger", doc: "The Stack: FINANCIALS ledger of year-to-date actuals, prior years and guidance.", expr: `${vars}\nRETURN\n    ${ledger(440, rows, "fl")}`, svg: true },
  ],
};
