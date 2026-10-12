/* Comprobación contra la URL pública: misma batería visual que los tests locales. */
import puppeteer from "puppeteer";
process.env.LD_LIBRARY_PATH = "/tmp/al2023lib/lib:/home/user/.local/chromelibs/usr/lib/x86_64-linux-gnu:" + (process.env.LD_LIBRARY_PATH || "");
import fs from "node:fs";
const EXE = process.env.ZENQA_CHROME || ["/tmp/chromium", "/home/user/.cache/puppeteer/chrome/linux-148.0.7778.97/chrome-linux64/chrome"].find((p) => { try { return fs.existsSync(p); } catch (e) { return false; } });
const B = "https://zenqalife-sys.github.io/zenqa-life-final-finalisima/";
const b = await puppeteer.launch({ executablePath: EXE, args: ["--no-sandbox", "--disable-dev-shm-usage", "--hide-scrollbars"] });
let bad = 0;
for (const [w, h, pages] of [[390, 844, ["index.html", "tienda.html", "ritual.html", "nosotros.html", "contacto.html", "recetas.html", "legal.html"]], [1440, 900, ["index.html", "tienda.html"]]]) {
  for (const p of pages) {
    const pg = await b.newPage(); const errs = [];
    pg.on("pageerror", (e) => errs.push("js: " + e.message));
    pg.on("console", (m) => { if (m.type() === "error") errs.push("cons: " + m.text()); });
    pg.on("requestfailed", (r) => errs.push("net: " + r.url().split("/").pop()));
    pg.on("response", (r) => { if (r.status() >= 400) errs.push("HTTP " + r.status() + " " + r.url().split("/").pop()); });
    await pg.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
    await pg.goto(B + p + "?cb=" + Date.now(), { waitUntil: "networkidle0" });
    await new Promise((r) => setTimeout(r, 1100));
    const info = await pg.evaluate(() => ({
      alt: document.documentElement.scrollHeight,
      cards: document.querySelectorAll(".card").length,
      hooks: document.querySelectorAll(".card__hook").length,
      rail: document.querySelectorAll(".cmpmob__c").length,
      grades: document.querySelectorAll(".grade").length,
      qv: !!document.querySelector("#qv .modal__box"),
      st: document.querySelector(".card__r .st") ? getComputedStyle(document.querySelector(".card__r .st")).color : "-",
      lead: document.querySelector(".lead-in") ? getComputedStyle(document.querySelector(".lead-in")).backgroundColor : "-",
      leadTxt: document.querySelector(".lead-in") ? getComputedStyle(document.querySelector(".lead-in")).color : "-",
      font: getComputedStyle(document.body).fontFamily.split(",")[0],
      cmpShown: document.querySelector("#cmpTable") ? getComputedStyle(document.querySelector("#cmpTable")).display : "-",
      overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
      open: document.querySelectorAll('[data-open="true"]').length,
    }));
    const ok = !errs.length && !info.overflow && info.open === 0 && info.cards > 0 && info.font === '"Switzer"';
    if (!ok) bad++;
    console.log((ok ? "✓ " : "✗ ") + p.padEnd(14) + w + "px · alt " + info.alt + " · fichas " + info.cards + " (hook " + info.hooks + ") · grades " + info.grades + " · cmp " + info.cmpShown + " · rail " + info.rail + " · qv " + info.qv + " · lead " + info.lead + "/" + info.leadTxt + " · " + info.font + (info.overflow ? " · OVERFLOW-X" : "") + (errs.length ? " · ! " + [...new Set(errs)].slice(0, 3).join(" | ") : ""));
    await pg.close();
  }
}
await b.close();
console.log(bad ? bad + " problema(s) en producción" : "producción OK");
process.exit(bad ? 1 : 0);
