/* Genera el imán de leads: assets/downloads/guia-matcha-zenqa.pdf
   4 páginas A4 con la identidad de la web (Switzer + Permanent Marker,
   rosa/verde salvia/crema/verde bosque) y el contenido que promete el
   formulario: recetas, dosis, conservación y hoja de cata.
   Uso: LD_LIBRARY_PATH=/tmp/al2023lib/lib node .test/make-guia.mjs */
import puppeteer from "puppeteer";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
process.env.LD_LIBRARY_PATH = "/tmp/al2023lib/lib:/home/user/.local/chromelibs/usr/lib/x86_64-linux-gnu:" + (process.env.LD_LIBRARY_PATH || "");
const EXE = process.env.ZENQA_CHROME || ["/tmp/chromium", "/home/user/.cache/puppeteer/chrome/linux-148.0.7778.97/chrome-linux64/chrome"].find((p) => { try { return fs.existsSync(p); } catch (e) { return false; } });

const sb = { window: {} };
vm.createContext(sb);
vm.runInContext(fs.readFileSync(path.join(ROOT, "assets/js/data.js"), "utf8"), sb);
const Z = sb.window.ZENQA;

const fontCss = ["300", "400", "500", "600", "700", "800", "900"]
  .map((w) => `@font-face{font-family:"Switzer";font-weight:${w};src:url("file://${ROOT}/assets/fonts/switzer-${w}.woff2") format("woff2")}`)
  .join("\n") +
  `\n@font-face{font-family:"Permanent Marker";font-weight:400;src:url("file://${ROOT}/assets/fonts/permanent-marker-400.woff2") format("woff2")}`;

const img = (n) => `file://${ROOT}/assets/img/${n}`;
const steps = (r) => r.steps.map((s, i) => `
  <li><b>${i + 1}</b><div><h4>${s.s}</h4><p>${s.d}</p></div></li>`).join("");

const usucha = Z.recipes.find((r) => r.id === "usucha");
const iced = Z.recipes.find((r) => r.id === "iced-latte");

const html = `<!doctype html><html lang="es"><head><meta charset="utf-8">
<style>
${fontCss}
:root{--pink:#ff6ebc;--pink-deep:#ef2f97;--sage:#a3b47e;--sage-soft:#dfe8cb;--mint:#f0f4e3;--cream:#faf9f2;--paper:#fff;--forest:#14301e;--ink:#12160f;--ink70:rgba(18,22,15,.7);--line:rgba(18,22,15,.16);--f:"Switzer",sans-serif;--brush:"Permanent Marker",cursive}
*{box-sizing:border-box;margin:0;padding:0}
@page{size:A4;margin:0}
body{font-family:var(--f);color:var(--ink);background:var(--cream);-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{width:210mm;height:296.5mm;page-break-after:always;overflow:hidden;position:relative;display:flex;flex-direction:column}
.page:last-child{page-break-after:auto}
.pad{padding:16mm 15mm}
.k{display:inline-flex;align-items:center;gap:6px;font-size:8.5pt;font-weight:800;letter-spacing:.14em;text-transform:uppercase}
.k::before{content:"";width:7px;height:7px;border-radius:50%;background:var(--pink);border:1.2px solid var(--ink)}
.d{font-weight:900;line-height:.98;letter-spacing:-.03em;text-transform:uppercase}
.brush{font-family:var(--brush);font-weight:400;text-transform:none;letter-spacing:.01em;line-height:1.05}
.foot{margin-top:auto;display:flex;align-items:center;justify-content:space-between;gap:8mm;border-top:1.6px solid var(--ink);padding:5mm 15mm 7mm;font-size:8.5pt;font-weight:700}
.foot .w{font-weight:900;text-transform:uppercase;letter-spacing:-.02em}
.foot .pink{color:var(--pink-deep)}
.brand{display:flex;align-items:center;gap:8px}
.brand img{width:34px;height:34px;object-fit:contain}
.brand b{font-size:13pt;font-weight:900;letter-spacing:-.02em;text-transform:uppercase;color:var(--pink-deep)}
.hl{position:relative;display:inline-block;isolation:isolate}
.hl::after{content:"";position:absolute;left:-2px;right:-2px;bottom:2px;height:.3em;background:var(--pink);border-radius:99px;z-index:-1}
p{line-height:1.55}
.note{color:var(--ink70)}
li{list-style:none}

/* portada */
.cover{background:var(--forest);color:#fff}
.cover .pad{display:flex;flex-direction:column;gap:8mm;height:100%}
.cover .brand b{color:#fff}
.cover h1{font-family:var(--brush);font-weight:400;font-size:46pt;line-height:1.02;color:#fff;text-transform:none;letter-spacing:.01em}
.cover h1 i{font-style:normal;color:var(--pink)}
.cover .sub{font-size:13.5pt;font-weight:700;line-height:1.45;max-width:14.5cm;color:rgba(255,255,255,.9)}
.cover .imgband{border:1.8px solid rgba(255,255,255,.5);border-radius:12px;overflow:hidden;flex:1;min-height:74mm}
.cover .imgband img{width:100%;height:100%;object-fit:cover;display:block}
.cover .tags{display:flex;flex-wrap:wrap;gap:6px}
.cover .tags span{border:1.5px solid rgba(255,255,255,.55);border-radius:99px;padding:5px 11px;font-size:8.5pt;font-weight:800;text-transform:uppercase;letter-spacing:.06em}
.cover .foot{border-top-color:rgba(255,255,255,.35);color:rgba(255,255,255,.8)}

/* páginas interiores */
.sheet{background:var(--cream)}
.h2{font-size:22pt;margin:2mm 0 3mm}
.lead{font-size:11pt;line-height:1.55;max-width:16cm;color:var(--ink70)}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:6mm}
.card{border:1.8px solid var(--ink);border-radius:11px;background:var(--paper);padding:6mm}
.card--sage{background:var(--sage-soft)}
.card--mint{background:var(--mint)}
.card--pink{background:var(--pink)}
.card h3{font-size:11.5pt;font-weight:900;letter-spacing:-.01em;text-transform:uppercase;margin-bottom:2mm}
.steps{display:grid;gap:3.4mm}
.steps li{display:grid;grid-template-columns:9mm 1fr;gap:4mm}
.steps b{width:9mm;height:9mm;border-radius:50%;background:var(--pink);border:1.5px solid var(--ink);display:flex;align-items:center;justify-content:center;font-size:10pt;font-weight:900}
.steps h4{font-size:10.5pt;font-weight:900;letter-spacing:-.01em}
.steps p{font-size:9pt;line-height:1.45;color:var(--ink70);margin-top:1mm}
table{width:100%;border-collapse:collapse;font-size:9.5pt}
th,td{text-align:left;padding:2.6mm 2mm;border-bottom:1.2px dashed var(--line)}
th{font-size:8pt;text-transform:uppercase;letter-spacing:.1em;color:var(--ink70)}
td b{font-weight:900}
.cata{display:grid;grid-template-columns:1fr 1fr;gap:4mm}
.cata div{border:1.6px solid var(--ink);border-radius:10px;padding:4.5mm;background:var(--paper)}
.cata h4{font-size:9pt;font-weight:900;text-transform:uppercase;letter-spacing:.09em;margin-bottom:1.5mm}
.cata .line{border-bottom:1.2px dotted var(--ink);height:9mm}
.num{font-family:var(--brush);color:var(--pink-deep);font-size:20pt;line-height:1}
.pill{display:inline-flex;align-items:center;gap:5px;border:1.5px solid var(--ink);background:var(--paper);border-radius:99px;padding:4px 10px;font-size:8pt;font-weight:800;text-transform:uppercase;letter-spacing:.05em}
.rules{display:grid;grid-template-columns:repeat(3,1fr);gap:4mm}
.rule{border:1.8px solid var(--ink);border-radius:11px;padding:5mm;background:var(--paper)}
.rule .num{margin-bottom:1mm}
.rule h4{font-size:10pt;font-weight:900;text-transform:uppercase;letter-spacing:-.01em}
.rule p{font-size:8.5pt;color:var(--ink70);margin-top:1.2mm;line-height:1.45}
.closing{border:1.8px solid var(--ink);border-radius:11px;background:var(--pink);padding:6mm;display:flex;align-items:center;justify-content:space-between;gap:6mm}
.closing b{font-size:13pt;font-weight:900;text-transform:uppercase;letter-spacing:-.02em;line-height:1.15}
.closing .box{border:1.6px dashed var(--ink);background:var(--cream);border-radius:9px;padding:4mm 5mm;font-size:9pt;font-weight:700;max-width:7cm}
</style></head><body>

<!-- 1 · portada -->
<section class="page cover">
  <div class="pad">
    <div class="brand"><img src="${img("logo-2x.png")}" alt=""><b>Zenqa Life</b></div>
    <h1>Guía Matcha<br><i>Zenqa</i> <span class="hl">Life</span></h1>
    <p class="sub">Recetas, dosis, conservación y hoja de cata. Todo lo que necesitas para que tu primera taza —y la número cien— salgan bien.</p>
    <div class="tags"><span>PDF · 4 páginas</span><span>Recetas · dosis · cata</span><span>Uji · Kioto</span></div>
    <div class="imgband"><img src="${img("hero-matcha.jpg")}" alt="Taza de matcha"></div>
  </div>
  <div class="foot"><span class="w">Te matcha vibes</span><span>Envíos gratis desde 35 € · 30 días de prueba con el bote abierto</span></div>
</section>

<!-- 2 · lo básico -->
<section class="page sheet">
  <div class="pad">
    <span class="k">El ritual</span>
    <h2 class="d h2">Lo básico en 60 segundos</h2>
    <p class="lead">Cuatro pasos, las mismas medidas siempre. El matcha no es difícil: es exacto.</p>
    <ol class="steps" style="margin-top:6mm">
      ${Z.ritual4.map((s, i) => `<li><b>${i + 1}</b><div><h4>${s.t}</h4><p>${s.d}</p></div></li>`).join("")}
    </ol>
    <h3 class="d" style="font-size:13pt;margin:8mm 0 3mm">Las dosis de siempre</h3>
    <table>
      <tr><th>Preparación</th><th>Matcha</th><th>Agua / leche</th><th>Temperatura</th></tr>
      <tr><td><b>Usucha (solo con agua)</b></td><td>1 g</td><td>70 ml</td><td>70 °C</td></tr>
      <tr><td><b>Latte caliente</b></td><td>2 g</td><td>200 ml de avena</td><td>70 °C el agua</td></tr>
      <tr><td><b>Iced latte</b></td><td>2 g</td><td>40 ml + hielo + 250 ml</td><td>70 °C el agua</td></tr>
      <tr><td><b>Smoothie verde</b></td><td>1 g (culinario)</td><td>150 g de yogur + 100 ml</td><td>frío</td></tr>
      <tr><td><b>De noche (2.ª infusión)</b></td><td>la hoja de antes</td><td>120 ml</td><td>65 °C</td></tr>
    </table>
    <div class="rules" style="margin-top:8mm">
      <div class="rule"><div class="num">01</div><h4>Tamiza siempre</h4><p>El batidor empuja los grumos, no los deshace. Cinco segundos con la malla fina y la taza cambia.</p></div>
      <div class="rule"><div class="num">02</div><h4>Agua a 70 °C</h4><p>Hierve y espera cuatro minutos destapado. A 100 °C arrastras amargor y quemas el dulzor.</p></div>
      <div class="rule"><div class="num">03</div><h4>Bate en «W»</h4><p>De muñeca, 15 segundos. Se busca microespuma, no espuma de fregar.</p></div>
    </div>
  </div>
  <div class="foot"><span class="w">Zenqa Life · guía matcha</span><span>2 / 4</span></div>
</section>

<!-- 3 · dos recetas -->
<section class="page sheet">
  <div class="pad">
    <span class="k">Para empezar</span>
    <h2 class="d h2">Dos recetas que nunca fallan</h2>
    <div class="grid2" style="margin-top:5mm">
      <div class="card">
        <h3>${usucha.name}</h3>
        <p class="note" style="font-size:9.5pt;margin-bottom:3mm">${usucha.short}</p>
        <ol class="steps">${steps(usucha)}</ol>
      </div>
      <div class="card">
        <h3>${iced.name}</h3>
        <p class="note" style="font-size:9.5pt;margin-bottom:3mm">${iced.short}</p>
        <ol class="steps">${steps(iced)}</ol>
      </div>
    </div>
    <div class="card card--sage" style="margin-top:6mm;display:flex;gap:6mm;align-items:center">
      <img src="${img("p-ceremonial.jpg")}" alt="" style="width:26mm;height:26mm;object-fit:cover;border:1.6px solid var(--ink);border-radius:9px">
      <div>
        <h3 style="margin-bottom:1.5mm">El bote con el que se aprende</h3>
        <p style="font-size:9.5pt">Ceremonial de Uji, 54 g para 27 tazas. Si te amarga, casi nunca es el polvo: es el agua hirviendo o el no tamizar.</p>
      </div>
    </div>
  </div>
  <div class="foot"><span class="w">Zenqa Life · guía matcha</span><span>3 / 4</span></div>
</section>

<!-- 4 · conservación + hoja de cata -->
<section class="page sheet">
  <div class="pad">
    <span class="k">Que dure y que se note</span>
    <h2 class="d h2">Conservación y hoja de cata</h2>
    <div class="grid2" style="margin-top:4mm">
      <div class="card card--mint">
        <h3>Guardar el bote</h3>
        <ul class="steps" style="gap:2.6mm">
          <li><b>✓</b><div><h4>Armario fresco y oscuro</h4><p>Entre 15 y 20 °C, lejos del horno y del sol.</p></div></li>
          <li><b>✓</b><div><h4>60-90 días desde la apertura</h4><p>No es seguridad, es placer: después pierde aroma.</p></div></li>
          <li><b>✕</b><div><h4>Nunca en la nevera abierto</h4><p>La condensación lo apelmaza cada vez que lo sacas.</p></div></li>
          <li><b>✕</b><div><h4>Cuchara seca, nunca dentro</h4><p>La humedad de la cocina entra y hace grumos.</p></div></li>
        </ul>
      </div>
      <div>
        <h3 class="d" style="font-size:12pt;margin-bottom:3mm">Hoja de cata · tres tazas, un mismo día</h3>
        <p class="note" style="font-size:9pt;margin-bottom:3mm">La única forma honesta de saber qué grado es el tuyo: prepara los tres el mismo día y anota. Sin prisa.</p>
        <div class="cata">
          <div><h4>Sabor</h4><div class="line"></div></div>
          <div><h4>Aroma</h4><div class="line"></div></div>
          <div><h4>Textura</h4><div class="line"></div></div>
          <div><h4>Final</h4><div class="line"></div></div>
        </div>
        <div class="cata" style="margin-top:4mm">
          <div><h4>¿Cuál repetirías?</h4><div class="line"></div></div>
          <div><h4>¿A qué te recuerda?</h4><div class="line"></div></div>
        </div>
      </div>
    </div>
    <div class="closing" style="margin-top:7mm">
      <b>Cualquier duda,<br>escríbenos sin rodeos</b>
      <div class="box">hola@zenqalife.com · L-V 9:00-18:00 CET<br>Y si el matcha no te convence: 30 días, con el bote abierto.</div>
    </div>
  </div>
  <div class="foot"><span class="w">Zenqa Life · guía matcha</span><span class="pink">Te matcha vibes · 4 / 4</span></div>
</section>

</body></html>`;

const tmpHtml = "/tmp/zenqa-guia.html";
fs.writeFileSync(tmpHtml, html);
const browser = await puppeteer.launch({ executablePath: EXE, args: ["--no-sandbox", "--disable-dev-shm-usage", "--font-render-hinting=none", "--hide-scrollbars", "--allow-file-access-from-files"] });
const page = await browser.newPage();
await page.goto("file://" + tmpHtml, { waitUntil: "networkidle0" });
await page.evaluate(() => document.fonts.ready);
await new Promise((r) => setTimeout(r, 400));
const out = path.join(ROOT, "assets/downloads/guia-matcha-zenqa.pdf");
if (process.env.GUIA_SHOTS) {
  await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1 });
  const els = await page.$$(".page");
  fs.mkdirSync(path.join(ROOT, "shots"), { recursive: true });
  for (let i = 0; i < els.length; i++) await els[i].screenshot({ path: path.join(ROOT, "shots", "guia-" + i + ".png") });
  console.log("✓ capturas de preview:", els.length);
}
await page.pdf({ path: out, format: "A4", printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
await browser.close();
console.log("✓", out, fs.statSync(out).size, "bytes");
