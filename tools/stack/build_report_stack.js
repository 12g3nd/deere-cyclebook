// The Stack: generate all seven card pages (PBIR) and hide the pre-Stack versions. Re-runnable.
const fs = require("fs");
const path = require("path");
const R = require("./report_lib");
const A = require("./stack_measures_a");
const B = require("./stack_measures_b");
const F = require("./card_financials");
const S = require("./card_segments");
const Y = require("./card_cycle");
const M = require("./card_modellab");
const P = require("./card_sources");

const DEF = path.resolve(__dirname, "../../DEERE_CYCLEBOOK.Report/definition");
const PAGES = path.join(DEF, "pages");
// Pre-Stack pages stay in the file, hidden, so nothing is deleted.
const OLD = ["85e801881afa98c3cc2d", "a656be65e12870af248f", "2f2c922a6f3436a46dd5", "d91eaac0343ef21a4cd9", "65721da987f3a5fa0c79", "a24fb8747b56660faf1b", "aa26ab00db387bbd7409"];
const NEW = { pulse: "stack_pulse", financials: "stack_financials", segments: "stack_segments", cycle: "stack_cycle", modelLab: "stack_modellab", valuation: "stack_valuation", sources: "stack_sources" };
const SYNC = { scenario: "cbScenario", sales: "cbSales", margin: "cbMargin" };
const log = [];

const INDEX = [["PULSE", NEW.pulse], ["FINANCIALS", NEW.financials], ["SEGMENTS", NEW.segments], ["THE CYCLE", NEW.cycle], ["MODEL LAB", NEW.modelLab], ["VALUATION", NEW.valuation], ["SOURCES", NEW.sources]];
const stackIndex = (current) => INDEX.map(([label, target], i) =>
  R.button({ x: 28, y: 84 + i * 133, w: 160, h: 107, z: 400 + i }, label, { page: target }, target === current ? "currentIndex" : "index"));

const desk = () => R.image({ x: 0, y: 0, w: 1920, h: 1080, z: 0 }, "SVG Stack Desk", "Dithered desk with the CYCLEBOOK card stack");
const header = (title) => R.image({ x: 256, y: 64, w: 1420, h: 96, z: 100 }, `SVG Header ${title}`, `${title} card header with latest close and reporting period`);
const finding = (m, alt) => R.image({ x: 256, y: 172, w: 1420, h: 84, z: 110 }, m, `Finding: ${alt}`);
const note = (pos, text) => R.textbox({ ...pos, z: 140 }, [{ text, size: 12 }], "Sources");
// Card foot: buttons right-aligned to the content edge, the yellow one rightmost.
function foot(y, plain, go) {
  const out = [];
  let right = 1676;
  if (go) { out.push(...R.paintedButton({ x: right - 360, y, w: 360, h: 56, z: 304 }, go[0], { page: go[1] }, "go")); right -= 380; }
  plain.forEach(([label, page], i) => { out.push(...R.paintedButton({ x: right - 220, y, w: 220, h: 56, z: 296 + i * 2 }, label, { page })); right -= 240; });
  return out;
}
// Standard card: exhibit 960x620 and a 440px ledger.
const standard = (key, title, mods, alts, sources, plain, go) => [
  desk(), header(title),
  finding(`SVG ${key} Finding`, alts.finding),
  R.image({ x: 256, y: 264, w: 960, h: 620, z: 120 }, `SVG ${key} Exhibit`, alts.exhibit),
  R.image({ x: 1236, y: 264, w: 440, h: mods.ledgerHeight, z: 130 }, `SVG ${key} Ledger`, alts.ledger),
  note({ x: 256, y: 912, w: 560, h: 56 }, sources),
  ...foot(912, plain, go),
  ...stackIndex(NEW[{ Financials: "financials", Segments: "segments", Cycle: "cycle", Sources: "sources" }[key]]),
];

const pulse = [
  desk(), header("PULSE"),
  finding("SVG Pulse Finding", "large ag shrinking again while small ag and construction still grow"),
  R.image({ x: 256, y: 264, w: 960, h: 620, z: 120 }, "SVG Pulse Divergence", "Segment net sales growth versus the same quarter a year earlier, last seven fiscal quarters"),
  R.image({ x: 1236, y: 264, w: 440, h: A.pulseLedgerHeight, z: 130 }, "SVG Pulse Ledger", "Latest-quarter actuals, fiscal 2026 guidance and share price"),
  R.textbox({ x: 256, y: 926, w: 560, h: 24, z: 140 }, [{ text: "Sources: Deere Q3 FY2026 news release (20 Aug 2026); Nasdaq daily close.", size: 12 }], "Sources"),
  ...foot(912, [["The cycle", NEW.cycle], ["The segments", NEW.segments]], ["What the price assumes", NEW.valuation]),
  ...stackIndex(NEW.pulse),
];

const financials = standard("Financials", "FINANCIALS", F,
  { finding: "fiscal 2026 sales and net income to date against a year earlier, the peak and guidance", exhibit: "Net income by fiscal year with fiscal 2026 to date, what Q4 still needs and the guidance range", ledger: "Year-to-date actuals, prior years and guidance" },
  "Sources: Deere annual and quarterly earnings releases, FY2022 to Q3 FY2026; guidance from the Q3 FY2026 release (20 Aug 2026).",
  [["Back to PULSE", NEW.pulse]], ["Profit by segment", NEW.segments]);

const segments = standard("Segments", "SEGMENTS", S,
  { finding: "small ag and turf has out-earned large ag in every quarter of fiscal 2026", exhibit: "Segment operating profit by quarter over the last eleven quarters", ledger: "Year-to-date segment operating profit and the fiscal 2026 sales outlook" },
  "Sources: Deere quarterly earnings releases, FY2024 to Q3 FY2026; sales outlook from the Q3 FY2026 release (20 Aug 2026).",
  [["Financials", NEW.financials]], ["What drives demand", NEW.cycle]);

const cycle = standard("Cycle", "THE CYCLE", Y,
  { finding: "over the past year crop prices rose and rates fell while housing starts kept dropping", exhibit: "Corn and soybean prices, U.S. net farm income, the federal funds rate and housing starts", ledger: "Latest FRED readings for each demand driver" },
  "Sources: FRED series PMAIZMTUSDM, PSOYBUSDM, FEDFUNDS, HOUST, TTLCONS, DEXCAUS and B1448C1A027NBEA (BEA net farm income).",
  [["Segments", NEW.segments]], ["Model fiscal 2026", NEW.modelLab]);

const sources = standard("Sources", "SOURCES", P,
  { finding: "every number in the stack carries a tag saying where it came from", exhibit: "Source registry with each source's provenance tag, type, notes and location", ledger: "How current each input is" },
  "In Power BI Desktop, Refresh updates the FRED and Nasdaq data from the web; Deere figures are entered from the releases listed.",
  [["Back to PULSE", NEW.pulse]], null);

const modelLab = [
  desk(), header("MODEL LAB"),
  finding("SVG Model Lab Finding", "modeled operating profit against FY2025 and net income against guidance for the current settings"),
  R.image({ x: 256, y: 264, w: 1000, h: 540, z: 120 }, "SVG Model Lab Exhibit", "Bridge from FY2025 reported operating profit to the FY2026 model by segment, with growth and margin assumptions"),
  R.image({ x: 1276, y: 264, w: 400, h: M.ledgerHeight, z: 130 }, "SVG Model Lab Ledger", "Modeled net income, sales and operating profit against guidance and FY2025"),
  R.textbox({ x: 256, y: 818, w: 380, h: 26, z: 141 }, [{ text: "Scenario", size: 13, bold: true }]),
  R.textbox({ x: 660, y: 818, w: 480, h: 26, z: 142 }, [{ text: "Sales, every segment", size: 13, bold: true }]),
  R.textbox({ x: 1176, y: 818, w: 500, h: 26, z: 143 }, [{ text: "Operating margin, every segment", size: 13, bold: true }]),
  R.image({ x: 256, y: 844, w: 372, h: 64, z: 145 }, "SVG Scenario Keys", "Scenario keys: Bear, Base, Bull"),
  R.buttonSlicer({ x: 256, y: 844, w: 372, h: 64, z: 310 }, "Scenario", "Scenario", 3, "overlay", { sync: SYNC.scenario }),
  R.image({ x: 660, y: 844, w: 480, h: 64, z: 150 }, "SVG Sales Strip", "Sales adjustment for every segment, minus 10 to plus 10 percent"),
  R.buttonSlicer({ x: 660, y: 844, w: 480, h: 64, z: 320 }, "Sales Adjustment", "Sales Adjustment", 5, "overlay", { sync: SYNC.sales }),
  R.image({ x: 1176, y: 844, w: 500, h: 64, z: 155 }, "SVG Margin Strip", "Operating margin adjustment for every segment, minus 200 to plus 200 basis points"),
  R.buttonSlicer({ x: 1176, y: 844, w: 500, h: 64, z: 330 }, "Margin Adjustment", "Margin Adjustment (bps)", 5, "overlay", { sync: SYNC.margin }),
  note({ x: 256, y: 968, w: 780, h: 44 }, "Scenario, sales and margin settings are CYCLEBOOK assumptions and carry over to VALUATION. FY2025 actuals from Deere's annual report. Stipple = model."),
  ...foot(946, [["The cycle", NEW.cycle]], ["What the price assumes", NEW.valuation]),
  ...stackIndex(NEW.modelLab),
];

const valuation = [
  desk(), header("VALUATION"),
  finding("SVG Valuation Finding", "EPS today's price requires at the selected multiple, against the record"),
  R.image({ x: 256, y: 264, w: 1000, h: 540, z: 120 }, "SVG Valuation Ladder", "EPS the latest close requires at each P/E multiple, against the FY2023 record, management guidance and CYCLEBOOK scenarios"),
  R.image({ x: 1276, y: 264, w: 400, h: B.valuationLedgerHeight, z: 130 }, "SVG Valuation Ledger", "Share price, market cap, trailing P/E and scenario outputs"),
  R.textbox({ x: 256, y: 818, w: 200, h: 26, z: 140 }, [{ text: "Scenario", size: 13, bold: true }]),
  R.image({ x: 256, y: 844, w: 372, h: 64, z: 145 }, "SVG Scenario Keys", "Scenario keys: Bear, Base, Bull"),
  R.buttonSlicer({ x: 256, y: 844, w: 372, h: 64, z: 310 }, "Scenario", "Scenario", 3, "overlay", { sync: SYNC.scenario }),
  R.textbox({ x: 640, y: 818, w: 300, h: 26, z: 141 }, [{ text: "P/E multiple", size: 13, bold: true }]),
  R.image({ x: 640, y: 848, w: 1036, h: 80, z: 150 }, "SVG PE Strip", "Implied value per share at each P/E multiple for the selected scenario"),
  R.buttonSlicer({ x: 640, y: 848, w: 1036, h: 80, z: 320 }, "PE Multiple", "P/E Multiple", 11, "overlay"),
  // Hidden, synced copies of the MODEL LAB adjustments, so VALUATION prices the same model.
  R.buttonSlicer({ x: 1276, y: 818, w: 200, h: 26, z: 340 }, "Sales Adjustment", "Sales Adjustment", 5, "overlay", { sync: SYNC.sales, hidden: true }),
  R.buttonSlicer({ x: 1476, y: 818, w: 200, h: 26, z: 342 }, "Margin Adjustment", "Margin Adjustment (bps)", 5, "overlay", { sync: SYNC.margin, hidden: true }),
  R.textbox({ x: 256, y: 968, w: 780, h: 44, z: 142 }, [{ text: "Sources: Deere Q3 FY2026 release (20 Aug 2026); Nasdaq daily close. Green = guidance. Stipple = model.", size: 12 }], "Sources and legend"),
  ...foot(946, [["Back to PULSE", NEW.pulse]], ["Change the assumptions", NEW.modelLab]),
  ...stackIndex(NEW.valuation),
];

function writePage(id, displayName, visuals) {
  const dir = path.join(PAGES, id);
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true }); // generated by this script only
  fs.mkdirSync(path.join(dir, "visuals"), { recursive: true });
  fs.writeFileSync(path.join(dir, "page.json"), JSON.stringify(R.page(id, displayName), null, 2), "utf8");
  for (const v of visuals) {
    // Stable names (page + z-order + type) keep git diffs readable across rebuilds.
    v.name = require("crypto").createHash("sha1").update(`${id}:${v.position.z}:${v.visual.visualType}`).digest("hex").slice(0, 20);
    fs.mkdirSync(path.join(dir, "visuals", v.name));
    fs.writeFileSync(path.join(dir, "visuals", v.name, "visual.json"), JSON.stringify(v, null, 2), "utf8");
  }
  log.push(`page ${id} (${displayName}): ${visuals.length} visuals`);
}
writePage(NEW.pulse, "PULSE", pulse);
writePage(NEW.financials, "FINANCIALS", financials);
writePage(NEW.segments, "SEGMENTS", segments);
writePage(NEW.cycle, "THE CYCLE", cycle);
writePage(NEW.modelLab, "MODEL LAB", modelLab);
writePage(NEW.valuation, "VALUATION", valuation);
writePage(NEW.sources, "SOURCES", sources);

for (const id of OLD) {
  const f = path.join(PAGES, id, "page.json");
  const p = JSON.parse(fs.readFileSync(f, "utf8"));
  if (p.visibility !== "HiddenInViewMode") {
    p.visibility = "HiddenInViewMode";
    p.displayName = `${p.displayName} (v1)`;
    fs.writeFileSync(f, JSON.stringify(p, null, 2), "utf8");
    log.push(`hidden old page ${id}`);
  }
}

// Hide the Filters pane for readers: every control lives on the cards.
const reportFile = path.join(DEF, "report.json");
const reportJson = JSON.parse(fs.readFileSync(reportFile, "utf8"));
reportJson.objects = reportJson.objects || {};
reportJson.objects.outspacePane = [{ properties: { expanded: { expr: { Literal: { Value: "false" } } }, visible: { expr: { Literal: { Value: "false" } } } } }];
fs.writeFileSync(reportFile, JSON.stringify(reportJson, null, 2), "utf8");

const pagesFile = path.join(PAGES, "pages.json");
const meta = JSON.parse(fs.readFileSync(pagesFile, "utf8"));
meta.pageOrder = [...Object.values(NEW), ...OLD];
meta.activePageName = NEW.pulse;
fs.writeFileSync(pagesFile, JSON.stringify(meta, null, 2), "utf8");
log.push("pages.json updated");
console.log(log.join("\n"));
