// Emit a DAX query that defines the Stack measures (plus a query-scoped Glyphs table) against the running model,
// so the SVG measures can be tested and previewed without reloading Power BI Desktop.
const fs = require("fs");
const path = require("path");
const { glyphRows } = require("./stack_lib");
const A = require("./stack_measures_a");
const B = require("./stack_measures_b");

const out = path.join(__dirname, "stack_test");
fs.mkdirSync(out, { recursive: true });
const all = [...A.measures, ...B.measures];
const glyphs = glyphRows().map(([c, b]) => `{${c}, "${b}"}`).join(", ");

const define = [
  "DEFINE",
  `TABLE Glyphs = DATATABLE("Code", INTEGER, "Bits", STRING, {${glyphs}})`,
  ...all.map((m) => `MEASURE _Measures[${m.name}] = ${m.expr.trim()}`),
].join("\n");

const svgs = all.filter((m) => m.svg).map((m) => m.name);
const query = `${define}\nEVALUATE ROW(${[
  `"Finding", [Valuation Finding]`,
  `"PeriodLabel", [Latest Period Label]`,
  `"EpsYoY", [Latest EPS YoY]`,
  ...svgs.map((n, i) => `"s${i}", [${n}]`),
].join(", ")})`;
fs.writeFileSync(path.join(out, "query.dax"), query, "utf8");
fs.writeFileSync(path.join(out, "svg_names.json"), JSON.stringify(svgs), "utf8");
console.log(`query written: ${query.length} chars, ${svgs.length} SVG measures`);
