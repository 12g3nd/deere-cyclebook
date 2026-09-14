// Write a DAX query that defines one card module's measures and evaluates each, for run_dax.ps1.
// Usage: node test_card.js card_financials [extra DEFINE MEASURE module...]
const fs = require("fs");
const path = require("path");

const out = path.join(__dirname, "stack_test");
fs.mkdirSync(out, { recursive: true });
const names = process.argv.slice(2);
const measures = names.flatMap((n) => require(`./${n}`).measures);
const define = ["DEFINE", ...measures.map((m) => `MEASURE _Measures[${m.name}] = ${m.expr.trim()}`)].join("\n");
const query = `${define}\nEVALUATE ROW(${measures.map((m, i) => `"m${i}", [${m.name}]`).join(", ")})`;
const file = path.join(out, `${names[0]}.dax`);
fs.writeFileSync(file, query, "utf8");
fs.writeFileSync(path.join(out, `${names[0]}.names.json`), JSON.stringify(measures.map((m) => m.name)), "utf8");
console.log(`${file} (${query.length} chars, ${measures.length} measures)`);
