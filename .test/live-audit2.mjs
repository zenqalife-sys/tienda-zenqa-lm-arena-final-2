/* Cuarta pasada: Lighthouse, barrido de páginas legales, contraste real y peso de recursos.
   Uso: node .test/live-audit2.mjs      → audit-out/{lh-summary.json,policies.json,contrast.json,assets.json} */
import fsp from "node:fs/promises";
import path from "node:path";
const BASE = (process.env.BASE || "https://zenqalife.roadshop.online").replace(/\/$/, "");
const OUT = process.env.OUT || "audit-out";
await fsp.mkdir(OUT, { recursive: true });
const J = (f, o) => fsp.writeFile(path.join(OUT, f), JSON.stringify(o, null, 2));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36";

/* 1 · barrido de URLs legales / de confianza */
const URLS = [
  "/pages/legal", "/pages/aviso-legal", "/pages/terminos", "/pages/condiciones", "/pages/envios",
  "/pages/devoluciones", "/pages/privacidad", "/pages/cookies", "/pages/contacto", "/pages/faq",
  "/policies/privacy-policy", "/policies/refund-policy", "/policies/terms-of-service",
  "/policies/shipping-policy", "/policies/legal-notice", "/policies/contact-information",
  "/policies/terms-of-service#", "/account/login", "/blogs/noticias", "/agents.md", "/.well-known/ucp",
  "/favicon.ico", "/checkout",
];
const pol = {};
for (const u of URLS) {
  try {
    const r = await fetch(BASE + u, { headers: { "user-agent": UA }, redirect: "follow" });
    const t = await r.text();
    pol[u] = { status: r.status, final: r.url.replace(BASE, ""), bytes: t.length, titulo: (t.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [, ""])[1].trim().slice(0, 60), h1: (t.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [, ""])[1].replace(/<[^>]+>/g, "").trim().slice(0, 60) };
  } catch (e) { pol[u] = { error: String(e.message || e) }; }
  await sleep(150);
}
await J("policies.json", pol);
console.log("· barrido de URLs legales:", Object.entries(pol).map(([k, v]) => k + "=" + (v.status || v.error)).join(" "));

/* 2 · navegador: contraste real, peso de recursos, zoom, alt de imágenes */
const puppeteer = (await import("puppeteer")).default;
const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"] });
const P = [["home", "/"], ["producto", "/products/eco-tote-bag"], ["tienda", "/pages/tienda"], ["coleccion", "/collections/all"], ["carrito", "/cart"]];
const contraste = {}, assets = {};
for (const [name, p] of P) {
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.setUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1");
  await page.goto(BASE + p, { waitUntil: "networkidle2", timeout: 60000 }); await sleep(1600);
  contraste[name] = await page.evaluate(() => {
    const lum = (c) => { const s = c.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * s[0] + 0.7152 * s[1] + 0.0722 * s[2]; };
    const rgb = (s) => (s.match(/\d+(\.\d+)?/g) || [0, 0, 0]).slice(0, 3).map(Number);
    const alpha = (s) => { const m = s.match(/rgba?\(([^)]+)\)/); if (!m) return 1; const parts = m[1].split(","); return parts.length > 3 ? parseFloat(parts[3]) : 1; };
    const fondo = (el) => { let x = el; while (x && x !== document.documentElement) { const cs = getComputedStyle(x); const c = cs.backgroundColor; if (c && c !== "rgba(0, 0, 0, 0)" && alpha(c) > 0.5) return c; if (cs.backgroundImage && cs.backgroundImage !== "none") return null; x = x.parentElement; } return "rgb(255,255,255)"; };
    const malos = [];
    const vistos = new Set();
    for (const el of document.querySelectorAll("p,span,a,li,h1,h2,h3,h4,button,strong,b,i,small,td,th,label")) {
      const txt = (el.innerText || "").trim();
      if (!txt || txt.length > 120 || el.children.length > 0) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 3 || r.height < 3) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === "hidden" || +cs.opacity < 0.1) continue;
      const bg = fondo(el);
      if (!bg) continue;
      const l1 = lum(rgb(cs.color)), l2 = lum(rgb(bg));
      const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
      const px = parseFloat(cs.fontSize); const bold = +cs.fontWeight >= 700;
      const grande = px >= 24 || (px >= 18.66 && bold);
      const min = grande ? 3 : 4.5;
      if (ratio < min) {
        const k = txt.slice(0, 40) + ratio.toFixed(2);
        if (vistos.has(k)) continue; vistos.add(k);
        malos.push({ txt: txt.slice(0, 40), ratio: +ratio.toFixed(2), min, px, color: cs.color, bg, sel: el.tagName + "." + String(el.className).slice(0, 30) });
      }
      if (malos.length > 25) break;
    }
    return { malos, n: malos.length };
  });
  contraste[name].ampliable = await page.evaluate(() => { const m = document.querySelector('meta[name="viewport"]'); return m ? m.content.includes("maximum-scale=1") || m.content.includes("user-scalable=no") : null; });
  contraste[name].altImagenes = await page.evaluate(() => { const alts = {}; for (const i of document.querySelectorAll("img")) { const a = i.alt || "(vacío)"; alts[a] = (alts[a] || 0) + 1; } return alts; });
  assets[name] = await page.evaluate(() => {
    const res = performance.getEntriesByType("resource").map((r) => ({ u: r.name, t: r.initiatorType, b: r.transferSize || 0, tipo: /\.(jpe?g|png|webp|avif|gif)/i.test(r.name) ? "imagen" : /\.js/.test(r.name) ? "js" : /\.css/.test(r.name) ? "css" : /\.woff2?/.test(r.name) ? "fuente" : "otro" }));
    const porTipo = {};
    for (const r of res) porTipo[r.tipo] = (porTipo[r.tipo] || 0) + r.b;
    return { n: res.length, porTipo, top: res.sort((a, b) => b.b - a.b).slice(0, 10).map((r) => ({ t: r.tipo, kb: Math.round(r.b / 1024), u: r.u.replace(location.origin, "").slice(0, 90) })), totalKB: Math.round(res.reduce((a, r) => a + r.b, 0) / 1024) };
  });
  console.log(`· ${name}: ${assets[name].n} peticiones · ${assets[name].totalKB} KB · contraste malo: ${contraste[name].n}`);
  await page.close();
}
await J("contrast.json", contraste);
await J("assets.json", assets);

/* 3 · Lighthouse móvil y escritorio */
try {
  const { default: lighthouse } = await import("lighthouse");
  const { launch } = await import("chrome-launcher");
  const chrome = await launch({ chromePath: process.env.CHROME_PATH || undefined, chromeFlags: ["--headless=new", "--no-sandbox", "--disable-dev-shm-usage"] });
  const resumen = {};
  for (const [name, p] of [["home", "/"], ["producto", "/products/eco-tote-bag"], ["coleccion", "/collections/all"]]) {
    for (const modo of ["mobile", "desktop"]) {
      const settings = modo === "desktop"
        ? { formFactor: "desktop", screenEmulation: { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1, disabled: false }, throttling: { rttMs: 40, throughputKbps: 10240, cpuSlowdownMultiplier: 1 } }
        : { formFactor: "mobile", screenEmulation: { mobile: true, width: 412, height: 823, deviceScaleFactor: 1.75, disabled: false } };
      const run = await lighthouse(BASE + p, { port: chrome.port, output: "json", logLevel: "error", onlyCategories: ["performance", "accessibility", "best-practices", "seo"], ...settings });
      const { lhr } = run;
      const fallos = Object.values(lhr.audits).filter((a) => a.score !== null && a.score < 1 && !["notApplicable", "informative", "manual"].includes(a.scoreDisplayMode)).map((a) => ({ id: a.id, titulo: a.title, score: a.score, valor: a.displayValue || "" }));
      const metricas = {};
      for (const k of ["first-contentful-paint", "largest-contentful-paint", "total-blocking-time", "cumulative-layout-shift", "speed-index", "server-response-time", "total-byte-weight", "unused-javascript", "uses-responsive-images", "uses-optimized-images", "modern-image-formats", "render-blocking-resources"]) if (lhr.audits[k]) metricas[k] = lhr.audits[k].displayValue || lhr.audits[k].score;
      resumen[`${name}-${modo}`] = { puntuaciones: Object.fromEntries(Object.entries(lhr.categories).map(([k, c]) => [k, Math.round((c.score || 0) * 100)])), metricas, nFallos: fallos.length, fallos: fallos.slice(0, 25) };
      console.log(`· LH ${name} ${modo}: ${JSON.stringify(resumen[`${name}-${modo}`].puntuaciones)}`);
    }
  }
  await J("lh-summary.json", resumen);
  await chrome.kill();
} catch (e) { console.log("✗ Lighthouse:", e.message); }

await browser.close();
console.log("✓ listo");
