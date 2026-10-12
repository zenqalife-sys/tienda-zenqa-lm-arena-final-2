/* Enlazado completo: recorre las 5 páginas de la v4 (+legal y las 4 redirecciones) y comprueba que TODO lo local resuelve.
   ids dinámicos (productos, categorías, recetas, legal) se validan contra data.js. */
import fs from "fs";
import path from "path";
import vm from "node:vm";

const ROOT = path.resolve(import.meta.dirname, "..");
const sb = { window: {} }; vm.createContext(sb);
vm.runInContext(fs.readFileSync(path.join(ROOT, "assets/js/data.js"), "utf8"), sb);
const { products, categories, recipes } = sb.window.ZENQA;
if (!products || products.length !== 19) { console.log("FAIL: data.js no expone los 19 productos de la v4"); process.exit(1); }
if (!recipes || recipes.length !== 10) { console.log("FAIL: data.js no expone las 10 recetas"); process.exit(1); }

const PAGES = ["index.html", "matcha.html", "productos.html", "recetas.html", "nosotros.html", "legal.html", "tienda.html", "ritual.html", "contacto.html", "prepararlo.html",
  ...recipes.map((r) => "receta-" + r.id + ".html")];

const dynIds = new Set([
  ...products.map((p) => p.id), ...categories.map((c) => c.id), ...recipes.map((r) => r.id),
  "menu", "cart", "search", "qv", "lead", "recipe", "toast", "unete", "top", "ways", "groups", "grid-tri", "grid-tes", "grid-picks", "grid-reviews", "grid-recipes", "grid-recipes-all", "quality", "grades", "ritual4", "energy", "vsTable", "opiniones",
]);

let bad = 0, checked = 0;
const staticIds = {};
for (const f of PAGES) {
  const html = fs.readFileSync(path.join(ROOT, f), "utf8");
  staticIds[f] = new Set([...html.matchAll(/id="([^"]+)"/g)].map((m) => m[1]));
}
for (const f of PAGES) {
  const html = fs.readFileSync(path.join(ROOT, f), "utf8");
  const errs = [];
  const app = fs.readFileSync(path.join(ROOT, "assets/js/app.js"), "utf8");
  const refs = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map((m) => m[1])
    .concat([...app.matchAll(/href=\\"([^"\\]+)/g)].map((m) => m[1]))
    .concat([...app.matchAll(/href="([^"]+)"/g)].map((m) => m[1]))
    .concat(products.map((p) => "assets/img/" + p.img))
    .concat(recipes.map((r) => "assets/img/" + r.img))
    .concat(["assets/downloads/guia-matcha-zenqa.pdf", "assets/img/logo-2x.png", "assets/img/favicon.png"]);
  for (let r of refs) {
    r = String(r).trim();
    if (!r || /['"+$%()\\]/.test(r)) continue;             // restos de plantilla JS
    if (/^(https?:|mailto:|tel:|data:)/.test(r) || r.includes("${") || r === "#") continue;
    checked++;
    const [file, hash] = r.replace(/^https?:\/\/[^/]+/, "").split("#");
    if (/^\/\//.test(r)) { errs.push("absurdo: " + r); continue; }
    if (file && !file.endsWith(".html") && file !== "") {
      const p = path.join(ROOT, decodeURI(file.split("?")[0]));
      if (!fs.existsSync(p)) errs.push("archivo ausente: " + file);
      continue;
    }
    if (file.endsWith(".html") && !PAGES.includes(path.basename(file))) errs.push("página inexistente: " + file);
    if (hash && file && PAGES.includes(path.basename(file))) {
      const ids = staticIds[path.basename(file)];
      if (!ids.has(hash) && !dynIds.has(hash)) errs.push("ancla rota: " + r);
    }
  }
  console.log((errs.length ? "✗ " : "✓ ") + f.padEnd(15) + (errs.length ? "\n    " + [...new Set(errs)].join("\n    ") : ""));
  if (errs.length) bad++;
}
/* los productos citados en la home existen */
const home = fs.readFileSync(path.join(ROOT, "index.html"), "utf8") + fs.readFileSync(path.join(ROOT, "assets/js/app.js"), "utf8");
for (const m of home.matchAll(/data-id="([a-z0-9-]+)"/g)) if (!products.some((p) => p.id === m[1])) { console.log("✗ data-id desconocido:", m[1]); bad++; }
console.log(`\n${checked} referencias comprobadas · ${bad ? bad + " problema(s)" : "todo resuelve"}`);
process.exit(bad ? 1 : 0);
