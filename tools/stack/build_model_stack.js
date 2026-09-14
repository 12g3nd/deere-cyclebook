// The Stack: write the Glyphs table and the SVG / helper measures into the semantic model. Re-runnable.
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { glyphRows } = require("./stack_lib");
const A = require("./stack_measures_a");
const B = require("./stack_measures_b");

const SM = path.resolve(__dirname, "../../DEERE_CYCLEBOOK.SemanticModel/definition");
const measuresFile = path.join(SM, "tables", "_Measures.tmdl");
const log = [];

let text = fs.readFileSync(measuresFile, "utf8");
const EOL = text.includes("\r\n") ? "\r\n" : "\n";
const all = [...A.measures, ...B.measures];

// Remove earlier runs of these measures, keeping their lineage tags stable.
const keepTags = {};
let lines = text.split(EOL);
for (const m of all) {
  const start = lines.findIndex((l) => l.startsWith(`\tmeasure '${m.name}' =`));
  if (start < 0) continue;
  let from = start > 0 && lines[start - 1].startsWith("\t///") ? start - 1 : start;
  let to = start + 1;
  while (to < lines.length && !/^\t(\/\/\/|measure |column |partition |hierarchy )/.test(lines[to])) to++;
  while (to > start + 1 && lines[to - 1].trim() === "") to--;
  const tag = lines.slice(start, to).find((l) => l.trim().startsWith("lineageTag:"));
  if (tag) keepTags[m.name] = tag.trim().slice("lineageTag:".length).trim();
  if (from > 0 && lines[from - 1].trim() === "") from--;
  lines.splice(from, to - from);
  log.push(`removed previous: ${m.name}`);
}
text = lines.join(EOL);

const block = [];
for (const m of all) {
  const expr = m.expr.trim().split(/\r?\n/).filter((l) => l.trim() !== "");
  block.push("", `\t/// ${m.doc}`);
  if (expr.length === 1) block.push(`\tmeasure '${m.name}' = ${expr[0].trim()}`);
  else block.push(`\tmeasure '${m.name}' =`, ...expr.map((l) => `\t\t\t${l}`));
  if (m.fmt) block.push(`\t\tformatString: ${m.fmt}`);
  if (m.svg) block.push(`\t\tdataCategory: ImageUrl`);
  block.push(`\t\tdisplayFolder: The Stack`, `\t\tlineageTag: ${keepTags[m.name] || crypto.randomUUID()}`);
}
const anchor = `${EOL}\tcolumn Dummy`;
if (text.split(anchor).length !== 2) throw new Error("Dummy column anchor not found exactly once");
text = text.replace(anchor, `${block.join(EOL)}${EOL}${anchor}`);
fs.writeFileSync(measuresFile, text, "utf8");
log.push(`wrote ${all.length} measures`);

// Glyphs table: 5x7 bitmap font keyed by Unicode code point (DAX text comparison is case-insensitive).
// A calculated table, so Power BI computes it on open without a data refresh.
const glyphFile = path.join(SM, "tables", "Glyphs.tmdl");
const rows = glyphRows();
const oldGlyph = fs.existsSync(glyphFile) ? fs.readFileSync(glyphFile, "utf8") : "";
const tagOf = (label) => {
  const m = oldGlyph.match(new RegExp(`${label}\\r?\\n(?:\\t\\t[^\\r\\n]*\\r?\\n)*?\\t\\tlineageTag: ([0-9a-f-]+)`));
  return m ? m[1] : crypto.randomUUID();
};
const tableTag = (oldGlyph.match(/^\tlineageTag: ([0-9a-f-]+)/m) || [])[1] || crypto.randomUUID();
const glyph = [
  "/// 5x7 bitmap glyphs for The Stack's pixel lettering. Code = Unicode code point; Bits = 35 cells, row-major.",
  "table Glyphs",
  "\tisHidden",
  `\tlineageTag: ${tableTag}`,
  "",
  "\tcolumn Code", "\t\tdataType: int64", "\t\tisHidden", "\t\tisNameInferred", `\t\tlineageTag: ${tagOf("\\tcolumn Code")}`, "\t\tsummarizeBy: none", "\t\tsourceColumn: [Code]", "",
  "\tcolumn Bits", "\t\tdataType: string", "\t\tisHidden", "\t\tisNameInferred", `\t\tlineageTag: ${tagOf("\\tcolumn Bits")}`, "\t\tsummarizeBy: none", "\t\tsourceColumn: [Bits]", "",
  "\tpartition Glyphs = calculated",
  "\t\tmode: import",
  "\t\tsource =",
  `\t\t\t\tDATATABLE("Code", INTEGER, "Bits", STRING, {`,
  ...rows.map(([code, bits], i) => `\t\t\t\t\t{${code}, "${bits}"}${i < rows.length - 1 ? "," : ""}`),
  "\t\t\t\t})",
  "",
];
fs.writeFileSync(glyphFile, glyph.join(EOL) + EOL, "utf8");
log.push(`wrote Glyphs.tmdl as calculated table (${rows.length} glyphs)`);

// Scenario order (Bear, Base, Bull) so slicer tiles line up with the painted keys.
// Sort by the existing 'Default P/E' (22, 28, 32): a calculated column derived from Scenario itself is a circular sort.
const scenarioFile = path.join(SM, "tables", "Scenario.tmdl");
let scenario = fs.readFileSync(scenarioFile, "utf8");
const calcBlock = new RegExp(`${EOL}\\tcolumn 'Scenario Order' = [^\\r\\n]*(?:${EOL}\\t\\t[^\\r\\n]*)*${EOL}`);
if (calcBlock.test(scenario)) {
  scenario = scenario.replace(calcBlock, EOL);
  log.push("Scenario: removed calculated 'Scenario Order'");
}
scenario = scenario.replace(`\t\tsortByColumn: 'Scenario Order'${EOL}`, "");
if (!scenario.includes("sortByColumn: 'Default P/E'")) {
  scenario = scenario.replace(`\t\tsourceColumn: Scenario${EOL}`, `\t\tsourceColumn: Scenario${EOL}\t\tsortByColumn: 'Default P/E'${EOL}`);
  log.push("Scenario: sort by 'Default P/E'");
}
fs.writeFileSync(scenarioFile, scenario, "utf8");

const modelFile = path.join(SM, "model.tmdl");
let model = fs.readFileSync(modelFile, "utf8");
if (!model.includes("ref table Glyphs")) {
  model = model.replace(`"Earnings Bridge","_Measures"]`, `"Earnings Bridge","Glyphs","_Measures"]`);
  model = model.replace(`ref table 'Earnings Bridge'${EOL}`, `ref table 'Earnings Bridge'${EOL}ref table Glyphs${EOL}`);
  fs.writeFileSync(modelFile, model, "utf8");
  log.push("registered Glyphs in model.tmdl");
}

// Report the longest measure so data-URI length limits are visible.
const longest = all.map((m) => [m.name, m.expr.length]).sort((a, b) => b[1] - a[1]).slice(0, 3);
log.push(`longest expressions: ${longest.map(([n, l]) => `${n} ${l}`).join(", ")}`);
console.log(log.join("\n"));
