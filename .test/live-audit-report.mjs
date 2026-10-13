/* Resumen legible de audit-out/ (lo que ha visto la auditoría live).
   Uso: node .test/live-audit-report.mjs   [DIR=audit-out] */
import fs from "node:fs";
import path from "node:path";

const OUT = process.env.DIR || "audit-out";
const read = (f, d = null) => { try { return JSON.parse(fs.readFileSync(path.join(OUT, f), "utf8")); } catch { return d; } };
const L = [];
const p = (...a) => { L.push(a.join(" ")); };
const bullets = (arr, n = 12) => arr.slice(0, n).forEach((x) => p("   - " + x));

const http = read("http.json", {});
p("═══ 1 · PÁGINAS (estado HTTP) ═══");
for (const [k, v] of Object.entries(http)) p(`  ${String(v.status).padEnd(4)} ${k.padEnd(20)} ${v.path.padEnd(46)} h1:${v.h1count} h2:${v.h2count} img:${v.imgCount} sin-alt:${v.imgNoAlt} ld:${v.jsonld.length} lang:${v.lang} ${v.metaRobots ? "robots:" + v.metaRobots : ""}`);
p("");
p("  Títulos:");
for (const [k, v] of Object.entries(http)) p(`   ${k.padEnd(20)} «${(v.title || "").slice(0, 90)}»`);
p("  Canónicas:");
for (const [k, v] of Object.entries(http)) if (v.canonical) p(`   ${k.padEnd(20)} ${v.canonical}`);
p("  JSON-LD:");
for (const [k, v] of Object.entries(http)) v.jsonld?.forEach((j, i) => p(`   ${k} #${i}: ${JSON.stringify(j.types)}`));

const links = read("links.json", {});
const rotos = Object.entries(links).filter(([, v]) => (v.status >= 400 || v.err) && !v.skipped);
p("");
p("═══ 2 · ENLACES Y RECURSOS ROTOS ═══  " + rotos.length + " de " + Object.keys(links).length);
rotos.forEach(([u, v]) => p(`  ${String(v.status || v.err).padEnd(20)} ${u}\n      en: ${v.where.join(", ")}`));

const cat = read("catalog.json", { products: [] });
p("");
p("═══ 3 · CATÁLOGO SHOPIFY (" + cat.products.length + " productos) ═══");
for (const pr of cat.products) {
  const av = [...new Set(pr.variants.map((v) => v.available ? "sí" : "NO"))].join("/");
  const prices = [...new Set(pr.variants.map((v) => v.price + (v.compare_at && v.compare_at !== v.price ? ">" + v.compare_at : "")))].slice(0, 4).join(" ");
  p(`  disp:${av.padEnd(5)} ${pr.title.slice(0, 52).padEnd(54)} ${prices.padEnd(18)} var:${String(pr.variants.length).padEnd(3)} img:${pr.images} vendor:${pr.vendor} tipo:${pr.type}`);
  if (!pr.bodyText || pr.bodyText.length < 30) p(`      ⚠ descripción vacía/corta: «${(pr.bodyText || "").slice(0, 60)}»`);
}

const anchors = read("anchors.json", {});
const malas = [];
for (const [page, list] of Object.entries(anchors)) {
  if (page === "_extra") continue;
  for (const [href, ok] of Object.entries(list || {})) if (ok === false) malas.push(`${page} → ${href}`);
}
p("");
p("═══ 4 · ANCLAS QUE NO EXISTEN ═══  " + malas.length);
bullets(malas, 40);

const br = read("browser.json", {});
p("");
p("═══ 5 · NAVEGADOR REAL (por página y viewport) ═══");
for (const [k, v] of Object.entries(br)) {
  const i = v.info || {};
  p(`  ${k.padEnd(30)} ${v.status} alto:${i.height} desborde:${i.overflow}px rotas:${(i.broken || []).length} táctiles<40:${i.smallCount} errores:${(v.errs || []).length} fallos-red:${(v.netFail || []).length} 404:${(v.bad || []).length} cab:${i.headerPos} fuentes:${(i.fonts || []).length} cookieBanner:${(i.cookieish || []).length}`);
}
p("");
p("  · Desborde horizontal (detalle):");
for (const [k, v] of Object.entries(br)) if ((v.info?.overflow || 0) > 1) { p(`   ${k}: ${v.info.overflow}px`); (v.info.wide || []).slice(0, 6).forEach((w) => p(`      ${w.sel} left:${w.left} right:${w.right} w:${w.w}`)); }
p("  · Imágenes rotas:");
for (const [k, v] of Object.entries(br)) (v.info?.broken || []).slice(0, 8).forEach((b) => p(`   ${k}: ${b.src.slice(0, 130)} (alt «${b.alt}», ${Math.round(b.w)}px)`));
p("  · Errores de consola / JS únicos:");
const errs = new Set();
for (const v of Object.values(br)) (v.errs || []).forEach((e) => errs.add(e));
[...errs].slice(0, 30).forEach((e) => p("   - " + e.slice(0, 200)));
p("  · Peticiones fallidas:");
const nf = new Set();
for (const v of Object.values(br)) (v.netFail || []).forEach((e) => nf.add(e));
[...nf].slice(0, 20).forEach((e) => p("   - " + e.slice(0, 180)));
p("  · Respuestas 4xx/5xx:");
const bad = new Set();
for (const v of Object.values(br)) (v.bad || []).forEach((e) => bad.add(e));
[...bad].slice(0, 40).forEach((e) => p("   - " + e.slice(0, 180)));
p("  · Elementos táctiles < 40 px (muestra):");
const small = new Set();
for (const [k, v] of Object.entries(br)) if (k.includes("movil")) (v.info?.small || []).slice(0, 6).forEach((s) => small.add(`${k}: «${s.t}» ${s.w}x${s.h}`));
[...small].slice(0, 25).forEach((s) => p("   - " + s));

const fn = read("funcional.json", {});
p("");
p("═══ 6 · FLUJOS FUNCIONALES ═══");
for (const [k, v] of Object.entries(fn)) p(`  ${k}: ${JSON.stringify(v).slice(0, 1400)}`);

const axe = read("axe.json", {});
p("");
p("═══ 7 · ACCESIBILIDAD (axe-core, móvil) ═══");
for (const [k, v] of Object.entries(axe)) {
  if (k === "error") { p("  error: " + v); continue; }
  p(`  ${k}: ${v.length} tipos`);
  v.forEach((x) => p(`   - [${x.impact}] ${x.id} (${x.n}) ${x.help}`));
}

const lh = read("lh-summary.json", {});
p("");
p("═══ 8 · LIGHTHOUSE ═══");
for (const [k, v] of Object.entries(lh)) {
  const sc = v.puntuaciones || v.scores || {};
  const mt = v.metricas || v.metrics || {};
  const fl = v.fallos || v.fails || [];
  p(`  ${k}: perf ${sc.performance} · a11y ${sc.accessibility} · buenas prácticas ${sc["best-practices"]} · SEO ${sc.seo}   (${v.nFallos ?? v.failCount ?? fl.length} auditorías que fallan)`);
  p(`     ${JSON.stringify(mt)}`);
  fl.slice(0, 14).forEach((f) => p(`      - ${f.id}: ${f.titulo || f.title} ${f.valor || f.value || ""}`));
}

const out = L.join("\n");
fs.writeFileSync(path.join(OUT, "RESUMEN.txt"), out);
console.log(out);
