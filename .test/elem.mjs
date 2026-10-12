/* Capturas por bloque, cosiendo tiras de viewport (evita los problemas de clip en páginas altas).
   Uso: node .test/elem.mjs index.html 390 844 "#tienda,#grados" z3e  */
import puppeteer from "puppeteer";
import fs from "fs";
process.env.LD_LIBRARY_PATH = "/tmp/al2023lib/lib:/home/user/.local/chromelibs/usr/lib/x86_64-linux-gnu:" + (process.env.LD_LIBRARY_PATH || "");
const EXE = process.env.ZENQA_CHROME || ["/tmp/chromium", "/home/user/.cache/puppeteer/chrome/linux-148.0.7778.97/chrome-linux64/chrome"].find((p) => { try { return fs.existsSync(p); } catch (e) { return false; } });
fs.mkdirSync("shots", { recursive: true });
const [file, w, h, selRaw, tag] = process.argv.slice(2);
const browser = await puppeteer.launch({ executablePath: EXE, args: ["--no-sandbox", "--disable-dev-shm-usage", "--font-render-hinting=none", "--hide-scrollbars"] });
const page = await browser.newPage();
const problems = [];
page.on("pageerror", (e) => problems.push("pageerror: " + e.message));
page.on("response", (r) => { if (r.status() >= 400) problems.push("HTTP " + r.status() + " " + r.url()); });
await page.setViewport({ width: +w, height: +h, deviceScaleFactor: 2 });
await page.goto("http://127.0.0.1:8080/" + file, { waitUntil: "networkidle0" });
await new Promise((r) => setTimeout(r, 700));
await page.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; document.querySelectorAll(".reveal").forEach((e) => e.classList.add("is-in")); });
let n = 0;
for (const sel of (selRaw || "").split(",").filter(Boolean)) {
  if (sel.startsWith("@")) {
    const act = sel.slice(1);
    if (act === "qv") await page.evaluate(() => document.querySelector('[data-act="qv"]').click());
    if (act === "cart") await page.evaluate(() => document.querySelector('[data-act="cart"]').click());
    if (act === "sheet") await page.evaluate(() => document.querySelector('[data-act="menu"]').click());
    if (act === "search") await page.evaluate(() => document.querySelector('[data-act="search"]').click());
    await new Promise((r) => setTimeout(r, 700));
    await page.screenshot({ path: `shots/${tag}-${n++}.png` });
    continue;
  }
  const geo = await page.evaluate((s) => {
    const e = document.querySelector(s);
    if (!e) return null;
    const r = e.getBoundingClientRect();
    return { top: Math.round(r.top + window.scrollY), height: Math.round(r.height) };
  }, sel);
  if (!geo || geo.height < 8) { console.log("· sin bloque:", sel); continue; }
  const strips = Math.min(4, Math.ceil(geo.height / +h));
  for (let i = 0; i < strips; i++) {
    const y = Math.min(geo.top + i * +h, Math.max(0, (await page.evaluate(() => document.documentElement.scrollHeight)) - +h));
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await new Promise((r) => setTimeout(r, 450));
    await page.screenshot({ path: `shots/${tag}-${n++}.png` });
  }
}
console.log(file + " @ " + w + " · " + n + " tiras" + (problems.length ? " · ! " + [...new Set(problems)].join(" ! ") : " · sin errores"));
await browser.close();
