/* Auditoría visual de la v4 en Chrome real: desbordes, banda fina, nav pegajosa,
   rejillas de 3, tipografía cargada, revelados y densidad de texto.
   Uso: node .test/v4audit.mjs [base]  ·  sale con código != 0 si algo falla. */
import puppeteer from "puppeteer";
import fs from "fs";

process.env.LD_LIBRARY_PATH = "/tmp/al2023lib/lib:/home/user/.local/chromelibs/usr/lib/x86_64-linux-gnu:" + (process.env.LD_LIBRARY_PATH || "");
const EXE = process.env.ZENQA_CHROME || ["/tmp/chromium", "/home/user/.cache/puppeteer/chrome/linux-148.0.7778.97/chrome-linux64/chrome"].find((p) => { try { return fs.existsSync(p); } catch (e) { return false; } });
const BASE = process.argv[2] || "http://127.0.0.1:8080/";
const PAGES = ["index.html", "matcha.html", "productos.html", "recetas.html", "nosotros.html", "legal.html"];
fs.mkdirSync("shots", { recursive: true });

const { execSync } = await import("node:child_process");
let V3WORDS = "?";
const V3REF = process.env.V3REF || "d611ca2"; // el último commit de la v3 (8 páginas, home con 1140 palabras)
try {
  const html = execSync(`git show ${V3REF}:index.html`, { encoding: "utf8" }).replace(/<script[\s\S]*?<\/script>/g, "").replace(/<[^>]+>/g, " ");
  V3WORDS = (html.match(/[\wÁ-Úá-úÀ-Öà-ö0-9]+/g) || []).length;
} catch (e) {}
const browser = await puppeteer.launch({ executablePath: EXE, args: ["--no-sandbox", "--disable-dev-shm-usage", "--hide-scrollbars", "--force-device-scale-factor=1"] });
const problems = [];
const say = (m) => { problems.push(m); console.log("  ✗ " + m); };

const SIZES = [{ w: 390, h: 844, tag: "movil" }, { w: 1440, h: 900, tag: "escritorio" }];

for (const { w, h, tag } of SIZES) {
  console.log("\n### " + tag + " " + w + "×" + h);
  for (const f of PAGES) {
    const page = await browser.newPage();
    await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
    const errs = [];
    page.on("pageerror", (e) => errs.push("pageerror: " + e.message));
    page.on("console", (m) => { if (m.type() === "error") errs.push("console: " + m.text().slice(0, 90)); });
    page.on("requestfailed", (r) => errs.push("404/failed: " + r.url().replace(BASE, "")));
    page.on("response", (r) => { if (r.status() >= 400 && !r.url().startsWith("data:")) errs.push("HTTP " + r.status() + " " + r.url().replace(BASE, "")); });
    await page.goto(BASE + f, { waitUntil: "networkidle0", timeout: 45000 });
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 30)); }
      window.scrollTo(0, 0);
      await new Promise((r) => setTimeout(r, 240));
    });
    const r = await page.evaluate((vw) => {
      const de = document.documentElement;
      const out = {};
      out.hOverflow = de.scrollWidth - vw;
      out.pageH = de.scrollHeight;
      // qué elementos salen del viewport
      const bad = [];
      for (const el of document.querySelectorAll("body *")) {
        const b = el.getBoundingClientRect();
        if (!b.width) continue;
        const st = getComputedStyle(el);
        if (st.position === "fixed" && parseFloat(st.opacity) === 0) continue;
        if (b.right > vw + 1.5 || b.left < -1.5) {
          if (el.closest(".band__track")) continue; // la marquesina va ancha a propósito
          bad.push(el.tagName.toLowerCase() + "." + (el.className.baseVal || el.className || "").toString().split(" ")[0] + " " + Math.round(b.right));
        }
      }
      out.wide = bad.slice(0, 5);
      const band = document.querySelector(".band");
      out.bandH = band ? Math.round(band.getBoundingClientRect().height) : 0;
      out.bandStatic = !document.querySelector(".band__track") && !document.querySelector(".band--mid");
      out.bandItems = document.querySelectorAll(".band--static .band__i").length;
      out.bandSoc = document.querySelectorAll(".band--static .band__soc a").length;
      const nav = document.querySelector(".nav");
      out.navPos = nav ? getComputedStyle(nav).position : "no";
      window.scrollTo(0, 700);
      out.navTop = Math.round(document.querySelector(".nav").getBoundingClientRect().top);
      out.bandTopAfterScroll = Math.round(document.querySelector(".band").getBoundingClientRect().bottom);
      window.scrollTo(0, 0);
      const h1 = document.querySelector("main h1");
      out.h1 = h1 ? { size: Math.round(parseFloat(getComputedStyle(h1).fontSize)), color: getComputedStyle(h1).color, fam: getComputedStyle(h1).fontFamily.split(",")[0] } : null;
      const hl = document.querySelector(".hero h1 .hl");
      out.hl = hl ? getComputedStyle(hl, "::after").backgroundColor : (document.querySelector(".hero") ? "sin-hl" : "sin-hero");
      out.hero = document.querySelector(".hero") ? getComputedStyle(document.querySelector(".hero h1")).color : null;
      out.font = document.fonts.check("700 32px Switzer");
      const grid = document.querySelector("#groups .pgrid");
      out.cols = grid ? getComputedStyle(grid).gridTemplateColumns.split(" ").length : null;
      out.anyPgrid = document.querySelectorAll(".pgrid").length;
      out.cards = document.querySelectorAll("#groups .card").length;
      out.btnPerCard = document.querySelector(".card") ? document.querySelectorAll(".card")[0].querySelectorAll("button").length : 0;
      out.hidden = [...document.querySelectorAll(".rv")].filter((e) => !e.classList.contains("is-in")).length;
      out.words = (document.body.innerText.match(/[\wÁ-Úá-úÀ-Öà-ö0-9]+/g) || []).length;
      out.empty = [...document.querySelectorAll("main section, main .split, main .two, main .tri, main .rcards, main .rev, main .steps")]
        .filter((s) => s.innerText.trim().length < 3 && !s.querySelector("img")).map((s) => s.className.toString().slice(0, 28)).slice(0, 4);
      const buys = [...document.querySelectorAll(".buy")];
      out.buyRows = buys.map((b) => b.querySelectorAll("button").length).join(",");
      out.buyOver = buys.some((b) => { const k = [...b.querySelectorAll("button")]; return k.length > 1 && k[0].getBoundingClientRect().right > k[1].getBoundingClientRect().left - 0.5 && k[0].getBoundingClientRect().bottom > k[1].getBoundingClientRect().top + 0.5; });
      return out;
    }, w);
    const label = f.padEnd(14);
    console.log("  " + label + " h+" + (r.hOverflow < 0 ? 0 : r.hOverflow) + " · " + r.pageH + "px alto · " + r.words + " palabras · banda " + r.bandH + "px · rejilla " + r.cols + " col · " + r.cards + " fichas · nav top " + r.navTop + " · h1 " + (r.h1 ? r.h1.size + "px " + r.h1.color : "-") + " · hl " + r.hl + " · fuente " + (r.font ? "switzer" : "SUSTITUTA") + " · ocultos " + r.hidden + " · botones " + r.buyRows);
    if (r.hOverflow > 0) say(f + " (" + tag + "): desborde horizontal de " + r.hOverflow + "px → " + r.wide.join(", "));
    if (r.bandH > 52) say(f + " (" + tag + "): la franja mide " + r.bandH + "px, debía quedar fina");
    if (!r.bandStatic) say(f + ": la franja de arriba sigue siendo una marquesina en movimiento");
    if (r.bandItems !== 3) say(f + ": la franja lleva " + r.bandItems + " mensajes, deben ser 3");
    if (r.bandSoc !== 4) say(f + ": faltan las redes del pie junto a «Únete» (" + r.bandSoc + ")");
    if (r.navPos !== "sticky") say(f + ": el menú no es sticky");
    if (r.navTop !== 0) say(f + " (" + tag + "): al hacer scroll el menú queda a " + r.navTop + "px");
    if (r.bandTopAfterScroll > 0.5) say(f + " (" + tag + "): la franja no se va al hacer scroll");
    if (r.cols === null) { /* la página no lleva rejilla de catálogo */ }
    else if (tag === "escritorio" && r.cols !== 3) say(f + ": la rejilla de catálogo es de " + r.cols + " columnas, deben ser 3");
    if (r.hl === "sin-hl") say(f + ": el titular del hero no lleva subrayado rosa");
    if (r.hero && r.hero.replace(/\s/g, "") !== "rgb(255,255,255)") say(f + ": el h1 del hero no es blanco (" + r.hero + ")");
    if (r.hl === "rgba(0, 0, 0, 0)") say(f + ": el subrayado del h1 no pinta");
    if (!r.font) say(f + ": la tipografía no está cargada");
    if (r.hidden) say(f + " (" + tag + "): " + r.hidden + " bloques siguen ocultos tras recorrer la página");
    if (r.empty.length) say(f + " (" + tag + "): contenedores vacíos → " + r.empty.join(" | "));
    if (r.buyOver) say(f + " (" + tag + "): los dos botones del producto se solapan");
    if (r.btnPerCard > 2) say(f + ": las fichas de producto llevan " + r.btnPerCard + " botones");
    if (f === "index.html") console.log("      · texto de la home: " + r.words + " palabras (la v3 tenía " + V3WORDS + ")");
    if (tag === "movil" && r.words > 1400) say(f + ": " + r.words + " palabras en móvil, se sigue leyendo como un dosier");
    errs.slice(0, 4).forEach((e) => say(f + " (" + tag + ") · " + e));
    await page.screenshot({ path: "shots/v4-" + tag + "-" + f.replace(".html", "") + ".png", fullPage: true });
    await page.close();
  }
}
await browser.close();
console.log("\n" + (problems.length ? problems.length + " avisos" : "AUDITORÍA VISUAL: TODO OK"));
process.exit(problems.length ? 1 : 0);
