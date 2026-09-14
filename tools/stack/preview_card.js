// Lay one card's tested SVG outputs (stack_test/<card>.m<i>.txt) onto the desk at card positions, then screenshot with headless Edge.
// Usage: node preview_card.js card_financials "256,64,1420,96" "256,172,1420,84" "256,264,960,620" "1236,264,440,0"
// Each box is x,y,w,h in the order the card module lists its measures; h 0 means natural height.
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const A = require("./stack_measures_a");

const [card, ...boxes] = process.argv.slice(2);
const dir = path.join(__dirname, "stack_test");
const desk = A.measures.find((m) => m.name === "SVG Stack Desk").expr.replace(/^"|"$/g, "").replace(/""/g, '"');
// HTML decodes entities inside attributes, so escape & before " or the SVG's own &amp; would break it.
const attr = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
const imgs = boxes.map((b, i) => {
  const [x, y, w, h] = b.split(",").map(Number);
  const src = fs.readFileSync(path.join(dir, `${card}.m${i}.txt`), "utf8").trim();
  return `<img src="${attr(src)}" style="position:absolute;left:${x}px;top:${y}px;width:${w}px;${h ? `height:${h}px;` : ""}">`;
});
const html = `<!doctype html><html><body style="margin:0;width:1920px;height:1080px;position:relative;overflow:hidden">` +
  `<img src="${attr(desk)}" style="position:absolute;left:0;top:0;width:1920px;height:1080px">${imgs.join("")}</body></html>`;
const htmlFile = path.join(dir, `${card}.html`);
const png = path.join(dir, `${card}.png`);
fs.writeFileSync(htmlFile, html, "utf8");
const edge = ["C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", "C:/Program Files/Microsoft/Edge/Application/msedge.exe"].find((p) => fs.existsSync(p));
execFileSync(edge, ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--window-size=1920,1080", `--screenshot=${png}`, `file:///${htmlFile.replace(/\\/g, "/")}`], { stdio: "ignore" });
console.log(png);
