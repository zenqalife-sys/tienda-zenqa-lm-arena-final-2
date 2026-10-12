/* Genera una página HTML por receta (receta-<id>.html) a partir de data.js.
   Cada receta se ve en SU página, nunca en un pop up. El contenido lo monta
   app.js por data-recipe; aquí va la cabeza SEO única de cada página.
   Uso: node .test/gen-recetas.mjs */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const ROOT = path.resolve(import.meta.dirname, "..");
const sb = { window: {} };
vm.createContext(sb);
vm.runInContext(fs.readFileSync(path.join(ROOT, "assets/js/data.js"), "utf8"), sb);
const { recipes } = sb.window.ZENQA;

const BASE_URL = "https://zenqalife-sys.github.io/tienda-zenqa-lm-arena-final-2";
const strip = (t) => String(t).replace(/<[^>]*>/g, "");

for (const r of recipes) {
  const file = `receta-${r.id}.html`;
  const title = `${strip(r.name)} · receta ZENQA LIFE`;
  const desc = strip(r.short).slice(0, 155);
  const mins = /seg/i.test(r.time) ? "PT" + parseInt(r.time, 10) + "S" : "PT" + parseInt(r.time, 10) + "M";
  const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${desc}">
<meta name="theme-color" content="#ff6ebc">
<link rel="canonical" href="${BASE_URL}/${file}">
<link rel="icon" href="assets/img/favicon.png" sizes="32x32">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:type" content="article">
<meta property="og:image" content="assets/img/${r.img}">
<link rel="preload" href="assets/fonts/switzer-700.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="assets/css/zenqa.css">
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"HowTo","name":${JSON.stringify(strip(r.name))},"totalTime":"${mins}","tool":["Chawan","Chasen","Tamizador"],"step":${JSON.stringify(r.steps.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: strip(s.s), text: strip(s.d) })))}}
</script>
<script defer src="assets/js/data.js"></script>
<script defer src="assets/js/app.js"></script>
</head>
<body data-page="receta">
<main>
  <div data-recipe="${r.id}"></div>
  <div data-join></div>
</main>
</body>
</html>
`;
  fs.writeFileSync(path.join(ROOT, file), html);
  console.log("✓", file);
}
console.log(recipes.length + " páginas de receta generadas");
