/* Auditoría de contraste: busca texto cuyo color está demasiado cerca del fondo efectivo.
   Catches the "tarjeta clara dentro de .sec--forest" bug (texto blanco sobre blanco).
   Uso: node .test/contrast.mjs [w] [h]   —  pasa si no encuentra nada. */
import puppeteer from "puppeteer";
process.env.LD_LIBRARY_PATH = "/home/user/.local/chromelibs/usr/lib/x86_64-linux-gnu:" + (process.env.LD_LIBRARY_PATH || "");
const EXE = "/home/user/.cache/puppeteer/chrome/linux-148.0.7778.97/chrome-linux64/chrome";
const [w = "390", h = "844"] = process.argv.slice(2);
const PAGES = ["index.html", "tienda.html", "ritual.html", "recetas.html", "nosotros.html", "contacto.html", "legal.html"];
const browser = await puppeteer.launch({ executablePath: EXE, args: ["--no-sandbox", "--disable-dev-shm-usage", "--hide-scrollbars"] });
const probe = () => {
  const lum = (c) => { const [r, g, b] = c.match(/\d+/g).map(Number).slice(0, 3).map((v) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
  const parse = (c) => { const n = (c.match(/[\d.]+/g) || [0, 0, 0, 0]).map(Number); return { r: n[0], g: n[1], b: n[2], a: n.length > 3 ? n[3] : 1 }; };
  const bgOf = (el) => {
    const stack = []; let e = el;
    while (e && e !== document.documentElement.parentElement) { const c = getComputedStyle(e).backgroundColor; if (c && !/transparent/.test(c) && parse(c).a > 0) stack.push(parse(c)); if (stack.length && parse(c).a === 1) break; e = e.parentElement; }
    if (!stack.length) stack.push(parse("rgb(250,249,242)"));
    let out = { r: 250, g: 249, b: 242, a: 1 };
    for (let i = stack.length - 1; i >= 0; i--) { const l = stack[i]; out = { r: out.r * (1 - l.a) + l.r * l.a, g: out.g * (1 - l.a) + l.g * l.a, b: out.b * (1 - l.a) + l.b * l.a, a: 1 }; }
    return "rgb(" + Math.round(out.r) + "," + Math.round(out.g) + "," + Math.round(out.b) + ")";
  };
  const out = [];
  for (const el of document.querySelectorAll("main *, .foot *, .modal__box *, .drawer *, .msheet *, .search *")) {
    if (!el.textContent.trim() || el.children.length && [...el.childNodes].every((n) => n.nodeType === 1)) {
      if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
    }
    const r = el.getBoundingClientRect();
    if (r.width < 12 || r.height < 6) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || +cs.opacity < 0.35 || (el.closest("[data-open]") && el.closest("[data-open]").dataset.open !== "true")) continue;
    const fg = lum(cs.color);
    const alpha = +(cs.color.match(/[\d.]+\)$/) || [1])[0];
    let bg = lum(bgOf(el));
    if (alpha < 1) bg = bg * (1 - alpha) + fg * alpha;
    const ratio = (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05);
    if (ratio < 2.6) out.push({ sel: el.tagName.toLowerCase() + (el.className && typeof el.className === "string" ? "." + el.className.trim().split(/\s+/).slice(0, 2).join(".") : ""), ratio: +ratio.toFixed(2), txt: el.textContent.trim().slice(0, 46), col: cs.color, bg: bgOf(el) });
  }
  return out.slice(0, 25);
};
let bad = 0;
for (const f of PAGES) {
  const p = await browser.newPage();
  await p.setViewport({ width: +w, height: +h, deviceScaleFactor: 1 });
  await p.goto("http://127.0.0.1:8080/" + f, { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 800));
  await p.evaluate(() => { document.querySelectorAll(".reveal").forEach((e) => e.classList.add("is-in")); });
  const hits = await p.evaluate(probe);
  if (hits.length) { bad++; console.log("✗ " + f); hits.forEach((x) => console.log("   " + x.ratio.toFixed(2) + "  " + x.sel.padEnd(26) + " " + JSON.stringify(x.txt) + "  " + x.col + " sobre " + x.bg)); }
  else console.log("✓ " + f + " — sin texto ilegible");
  await p.close();
}
await browser.close();
console.log(bad ? "\n" + bad + " página(s) con bajo contraste" : "\ncontraste OK en " + PAGES.length + " páginas @ " + w + "x" + h);
process.exit(bad ? 1 : 0);
