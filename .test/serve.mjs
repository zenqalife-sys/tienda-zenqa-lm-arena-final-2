/* Servidor estático mínimo para probar la tienda en local (sin dependencias).
   Uso: node .test/serve.mjs [puerto]  ·  luego:  BASE=http://127.0.0.1:8080/ node .test/smoke.mjs */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const PORT = +(process.argv[2] || 8080);
const TYPE = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".svg": "image/svg+xml",
  ".woff2": "font/woff2", ".woff": "font/woff", ".pdf": "application/pdf", ".xml": "application/xml", ".txt": "text/plain",
};

http.createServer((req, res) => {
  let f = decodeURIComponent(req.url.split("?")[0]);
  if (f.endsWith("/")) f += "index.html";
  const p = path.join(ROOT, f);
  fs.readFile(p, (e, b) => {
    if (e) { res.writeHead(404, { "content-type": "text/plain" }); res.end("404 " + f); console.log("404", f); return; }
    res.writeHead(200, { "content-type": TYPE[path.extname(p)] || "application/octet-stream", "cache-control": "no-store" });
    res.end(b);
  });
}).listen(PORT, "0.0.0.0", () => console.log("ZENQA · http://0.0.0.0:" + PORT + "/ (raíz " + ROOT + ")"));
