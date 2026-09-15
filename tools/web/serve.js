// Serve web/ on localhost to preview the static report: node tools/web/serve.js [port]
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "../../web");
const PORT = Number(process.argv[2]) || 4173;
const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png" };

http.createServer((req, res) => {
  const url = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  const file = path.join(ROOT, url.endsWith("/") ? `${url}index.html` : url);
  if (!file.startsWith(ROOT)) return res.writeHead(403).end();
  fs.readFile(file, (err, body) => {
    if (err) return res.writeHead(404, { "Content-Type": "text/plain" }).end("Not found");
    res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream", "Cache-Control": "no-store" }).end(body);
  });
}).listen(PORT, () => console.log(`Serving web/ at http://localhost:${PORT}`));
