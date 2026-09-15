// Export the Stack report as a static web page (web/): the card layouts from the PBIR files, and every SVG
// measure evaluated by the Power BI model for each control state it depends on.
// Needs Power BI Desktop open on DEERE_CYCLEBOOK.pbip, because the export queries its local engine.
// Usage: node tools/web/export_web.js
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");
const { G } = require("../stack/stack_lib");

const ROOT = path.resolve(__dirname, "../..");
const DEF = path.join(ROOT, "DEERE_CYCLEBOOK.Report", "definition");
const TABLES = path.join(ROOT, "DEERE_CYCLEBOOK.SemanticModel", "definition", "tables");
const WEB = path.join(ROOT, "web");
const DATA = path.join(WEB, "data");
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), "cyclebook-web-"));
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Each slicer column: the value the cards start on (the measures' SELECTEDVALUE fallback), its URL key, and how a
// screen reader names the control and each setting.
const CONTROLS = {
  "Scenario[Scenario]": { param: "scenario", start: "Base", name: "Scenario", say: (v) => v },
  "Sales Adjustment[Sales Adjustment]": { param: "sales", start: "0", name: "Sales for all three segments", say: (v) => `${+v > 0 ? "+" : ""}${Math.round(+v * 100)}%` },
  "Margin Adjustment[Margin Adjustment (bps)]": { param: "margin", start: "0", name: "Margin for all three segments", say: (v) => `${+v > 0 ? "+" : ""}${+v} basis points` },
  "PE Multiple[P/E Multiple]": { param: "pe", start: "28", name: "P/E multiple", say: (v) => `${+v}x` },
};

const read = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const lit = (o) => o?.expr?.Literal?.Value;
const litStr = (o) => { const v = lit(o); return typeof v === "string" && v.startsWith("'") ? v.slice(1, -1).replace(/''/g, "'") : v; };
const litNum = (o) => (lit(o) == null ? undefined : parseFloat(lit(o)));
const litBool = (o) => lit(o) === "true";
const props = (entries, id) => (entries || []).find((e) => (id ? e.selector?.id === id : !e.selector))?.properties || {};
const splitKey = (key) => key.match(/^(.*)\[(.*)\]$/).slice(1);
const colRef = (key) => { const [t, c] = splitKey(key); return `'${t}'[${c}]`; };
const daxValue = (v) => (/^-?\d+(\.\d+)?(E-?\d+)?$/i.test(v) ? v : `"${v.replace(/"/g, '""')}"`);
const slicerKey = (vc) => { const c = vc.visual.query.queryState.Values.projections[0].field.Column; return `${c.Expression.SourceRef.Entity}[${c.Property}]`; };

let seq = 0;
function dax(queries) {
  const jobs = queries.map((query) => ({ query, out: path.join(TMP, `result${seq++}.ndjson`) }));
  const file = path.join(TMP, `jobs${seq++}.json`);
  fs.writeFileSync(file, JSON.stringify(jobs), "utf8");
  execFileSync("powershell", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", path.join(__dirname, "query.ps1"), "-Jobs", file], { stdio: ["ignore", "ignore", "inherit"] });
  return jobs.map((j) => fs.readFileSync(j.out, "utf8").split("\n").filter((l) => l.trim()).map((l) => JSON.parse(l)));
}

// A slicer lists its values in the column's sort-by order (Scenario sorts by Default P/E: Bear, Base, Bull).
function sortColumn(table, column) {
  const text = fs.readFileSync(path.join(TABLES, `${table}.tmdl`), "utf8").replace(/\r\n/g, "\n");
  const name = /^[A-Za-z_]\w*$/.test(column) ? column : `'${column.replace(/'/g, "''")}'`;
  const at = text.search(new RegExp(`\\n\\tcolumn ${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[\\s=]`));
  if (at < 0) return null;
  const rest = text.slice(at + 1);
  const end = rest.slice(1).search(/\n\t\S/);
  const match = (end < 0 ? rest : rest.slice(0, end + 1)).match(/\n\t\tsortByColumn: (.+)/);
  return match ? match[1].trim().replace(/^'(.*)'$/, "$1") : null;
}

function toVisual(vc) {
  const { x, y, width, height } = vc.position;
  const box = [x, y, width, height];
  const v = vc.visual;
  const o = v.objects || {};
  const alt = litStr(props(v.visualContainerObjects?.general).altText) || "";
  if (v.visualType === "image") {
    const src = props(o.image).sourceUrl;
    return src?.expr?.Measure ? { type: "image", box, alt, measure: src.expr.Measure.Property } : { type: "image", box, alt, src: litStr(src) };
  }
  if (v.visualType === "textbox") {
    const paragraphs = props(o.general).paragraphs || [];
    return { type: "text", box, paragraphs: paragraphs.map((p) => ({ align: p.horizontalAlignment || "left", runs: p.textRuns.map((r) => ({ text: r.value, style: r.textStyle || {} })) })) };
  }
  if (v.visualType === "actionButton") {
    const state = (id) => {
      const text = props(o.text, id), fill = props(o.fill, id), outline = props(o.outline, id);
      return {
        fill: litBool(fill.show) && litNum(fill.transparency) < 100 ? litStr(fill.fillColor?.solid?.color) : null,
        color: litStr(text.fontColor?.solid?.color),
        underline: litBool(text.underline),
        outline: litBool(outline.show) ? litNum(outline.weight) : 0,
      };
    };
    const text = props(o.text, "default");
    const shadow = props(o.shadow, "default");
    const link = props(v.visualContainerObjects?.visualLink);
    return {
      type: "button", box, label: litStr(text.text), fontPt: litNum(text.fontSize), target: litStr(link.navigationSection),
      lift: litBool(shadow.show) ? litNum(shadow.shadowDistance) : 0,
      states: { rest: state("default"), hover: state("hover"), press: state("selected") },
    };
  }
  if (v.visualType === "advancedSlicerVisual") return { type: "slicer", box, control: slicerKey(vc) };
  console.warn(`skipped ${v.visualType} ${vc.name}`);
  return null;
}

// The cover note's masthead uses the card titles' 5x7 glyphs.
function bitmap(text, p) {
  let rects = "";
  [...text].forEach((ch, i) => (G[ch] || G[" "]).forEach((row, r) => [...row].forEach((bit, c) => {
    if (bit === "1") rects += `<rect x="${(i * 6 + c) * p}" y="${r * p}" width="${p}" height="${p}"/>`;
  })));
  const w = (text.length * 6 - 1) * p;
  return `<svg class="masthead" viewBox="0 0 ${w} ${7 * p}" width="${w}" height="${7 * p}" aria-hidden="true" focusable="false" shape-rendering="crispEdges"><g fill="#0E0E0C">${rects}</g></svg>`;
}

// 1. Cards and controls, from the report files.
const pageOrder = read(path.join(DEF, "pages", "pages.json")).pageOrder;
const raw = pageOrder.map((id) => {
  const dir = path.join(DEF, "pages", id, "visuals");
  return { id, page: read(path.join(DEF, "pages", id, "page.json")), visuals: fs.readdirSync(dir).map((n) => read(path.join(dir, n, "visual.json"))) };
});
// Hidden synced slicers count too: the page keeps one state per column, as a sync group does.
const controlKeys = [...new Set(raw.flatMap((p) => p.visuals.filter((v) => v.visual.visualType === "advancedSlicerVisual").map(slicerKey)))];
const domains = dax(controlKeys.map((key) => {
  const [table, column] = splitKey(key);
  const sort = sortColumn(table, column);
  return sort
    ? `EVALUATE ALL('${table}'[${column}], '${table}'[${sort}]) ORDER BY '${table}'[${sort}], '${table}'[${column}]`
    : `EVALUATE ALL(${colRef(key)}) ORDER BY ${colRef(key)}`;
}));
const controls = controlKeys.map((key, i) => {
  const c = CONTROLS[key];
  if (!c) throw new Error(`No CONTROLS entry for slicer column ${key}`);
  const values = domains[i].map((row) => row[0]);
  if (!values.includes(c.start)) throw new Error(`${key} has no value ${c.start}; its values are ${values.join(", ")}`);
  return { key, param: c.param, name: c.name, start: c.start, values, labels: values.map(c.say) };
});
console.log(controls.map((c) => `${c.param}: ${c.values.join(" ")}`).join("\n"));

// 2. Which controls each measure responds to: vary one control at a time and count distinct renders.
const measureNames = [...new Set(raw.flatMap((p) => p.visuals
  .filter((v) => !v.isHidden && v.visual.visualType === "image")
  .map((v) => props(v.visual.objects?.image).sourceUrl?.expr?.Measure?.Property).filter(Boolean)))];
const atStart = controls.map((c) => `${colRef(c.key)} = ${daxValue(c.start)}`).join(", ");
const distinct = (m, c) => `COUNTROWS(DISTINCT(SELECTCOLUMNS(ADDCOLUMNS(VALUES(${colRef(c.key)}), "@v", [${m}]), "@v", [@v])))`;
const probes = dax(measureNames.map((m) =>
  `EVALUATE ROW(${controls.map((c, i) => `"c${i}", ${distinct(m, c)}`).join(", ")}, "start", IF([${m}] == CALCULATE([${m}], ${atStart}), 1, 0))`));
const deps = {};
measureNames.forEach((m, i) => {
  const row = probes[i][0];
  deps[m] = controls.filter((c, j) => +row[j] > 1);
  if (row[controls.length] !== "1") console.warn(`${m}: the render with no selection differs from the start state`);
});

// 3. Every state of every measure. Each render is split into SVG elements, shared across states through one dictionary.
const results = dax(measureNames.map((m) => {
  const ds = deps[m];
  if (!ds.length) return `EVALUATE ROW("@v", [${m}])`;
  const table = ds.length === 1 ? `VALUES(${colRef(ds[0].key)})` : `CROSSJOIN(${ds.map((c) => `VALUES(${colRef(c.key)})`).join(", ")})`;
  return `EVALUATE ADDCOLUMNS(${table}, "@v", [${m}])`;
}));
fs.rmSync(DATA, { recursive: true, force: true });
fs.mkdirSync(DATA, { recursive: true });
const measures = {};
let bytes = 0;
measureNames.forEach((m, i) => {
  const ds = deps[m];
  const dict = [], ids = new Map(), seqs = [], seqIds = new Map(), states = {};
  for (const row of results[i]) {
    let svg = row[row.length - 1];
    // The page draws the desk dither at screen resolution, so the exported desk keeps only the card stack.
    if (m === "SVG Stack Desk") svg = svg.replace(/<rect width='1920' height='1080' fill='[^']*'\/>/g, "");
    const parts = svg.split(/(?=<)/).map((t) => { if (!ids.has(t)) { ids.set(t, dict.length); dict.push(t); } return ids.get(t); });
    const joined = parts.join(",");
    if (!seqIds.has(joined)) { seqIds.set(joined, seqs.length); seqs.push(parts); }
    const key = ds.map((c, j) => {
      const at = c.values.indexOf(row[j]);
      if (at < 0) throw new Error(`${m}: unexpected ${c.param} value ${row[j]}`);
      return at;
    }).join(".");
    states[key] = seqIds.get(joined);
  }
  const file = `${slug(m)}.json`;
  const json = JSON.stringify({ controls: ds.map((c) => c.key), dict, seqs, states });
  fs.writeFileSync(path.join(DATA, file), json, "utf8");
  bytes += json.length;
  measures[m] = { file, controls: ds.map((c) => c.key) };
  console.log(`${m}: ${ds.map((c) => c.param).join(" x ") || "static"}, ${results[i].length} states, ${seqs.length} distinct, ${Math.round(json.length / 1024)} KB`);
});

// 4. The manifest, and the export date and masthead in index.html.
const pages = raw.map(({ id, page, visuals }) => ({
  id, name: page.displayName, slug: slug(page.displayName),
  visuals: visuals.filter((v) => !v.isHidden).sort((a, b) => a.position.z - b.position.z).map(toVisual).filter(Boolean),
}));
const now = new Date();
const iso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
fs.writeFileSync(path.join(DATA, "manifest.json"), JSON.stringify({ exported: iso, controls, measures, pages }), "utf8");
const indexFile = path.join(WEB, "index.html");
const html = fs.readFileSync(indexFile, "utf8")
  .replace(/<!-- masthead -->[\s\S]*?<!-- \/masthead -->/, `<!-- masthead -->${bitmap("DEERE // CYCLEBOOK", 4)}<!-- /masthead -->`)
  .replace(/<time data-exported datetime="[^"]*">[^<]*<\/time>/, `<time data-exported datetime="${iso}">${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}</time>`);
fs.writeFileSync(indexFile, html, "utf8");
fs.rmSync(TMP, { recursive: true, force: true });
console.log(`web/data: ${measureNames.length} measures, ${(bytes / 1048576).toFixed(2)} MB before compression`);
