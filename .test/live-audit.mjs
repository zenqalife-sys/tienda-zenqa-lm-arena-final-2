/* Auditoría de la tienda Shopify publicada (por defecto zenqalife.roadshop.online).

   Uso:  node .test/live-audit.mjs
   Evidencia en audit-out/ (ver .test/live-audit-report.mjs y el workflow
   .github/workflows/auditoria-live.yml). El tema pinta casi todo por JS, así que
   además del HTML servido se guarda el DOM ya renderizado (dom/) y capturas. */

import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";

const BASE = (process.env.BASE || "https://zenqalife.roadshop.online").replace(/\/$/, "");
const OUT = process.env.OUT || "audit-out";
const HOST = new URL(BASE).host;
for (const d of ["", "html", "dom", "screens"]) await fsp.mkdir(path.join(OUT, d), { recursive: true });
const J = (f, o) => fsp.writeFile(path.join(OUT, f), JSON.stringify(o, null, 2));
const now = () => performance.now();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const H = { "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36" };
const UA_MOVIL = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";

const PAGES = [
  ["home", "/"],
  ["tienda", "/pages/tienda"],
  ["matcha", "/pages/te-matcha"],
  ["recetas", "/pages/recetas-y-guias"],
  ["nosotros", "/pages/el-ritual"],
  ["receta-usucha", "/pages/receta-usucha"],
  ["producto-ceremonial", "/products/te-matcha-ceremonial-organico446"],
  ["producto-kit", "/products/kit-completo-matcha-zenqa-life"],
  ["producto-sudadera", "/products/sudadera-con-capucha-unisex"],
  ["carrito", "/cart"],
  ["coleccion-all", "/collections/all"],
  ["buscador", "/search?q=matcha"],
  ["legal", "/pages/legal"],
  ["404", "/pages/pagina-que-no-existe-zenqa"],
];

/* ─────────────── A · HTTP + cabeceras de cada página ─────────────── */
async function fetchChain(url, opts = {}) {
  const chain = []; let cur = url;
  for (let i = 0; i < 6; i++) {
    const t0 = now(); let r;
    try { r = await fetch(cur, { redirect: "manual", headers: H, ...opts }); }
    catch (e) { chain.push({ url: cur, error: String((e && e.message) || e) }); break; }
    const body = r.status === 204 || r.status === 304 ? "" : await r.text();
    chain.push({ url: cur, status: r.status, location: r.headers.get("location"), type: r.headers.get("content-type"), ms: Math.round(now() - t0), bytes: body.length });
    if (r.status >= 300 && r.status < 400 && r.headers.get("location")) { cur = new URL(r.headers.get("location"), cur).href; continue; }
    return { chain, final: cur, status: r.status, body, headers: Object.fromEntries(r.headers) };
  }
  return { chain, final: cur, status: 0, body: "", headers: {} };
}
const pick = (b, re) => (b.match(re) || [, ""])[1];
const http = {};
for (const [name, p] of PAGES) {
  const r = await fetchChain(BASE + p);
  http[name] = {
    path: p, status: r.status, final: r.final, chain: r.chain,
    headers: {
      "content-type": r.headers["content-type"], "cache-control": r.headers["cache-control"],
      csp: r.headers["content-security-policy"] ? r.headers["content-security-policy"].slice(0, 300) : "no",
      hsts: r.headers["strict-transport-security"] || "no", "x-frame-options": r.headers["x-frame-options"] || "no",
      "x-content-type-options": r.headers["x-content-type-options"] || "no", "x-robots-tag": r.headers["x-robots-tag"] || "no",
      server: r.headers["server"] || "no", "powered-by": r.headers["x-powered-by"] || "no",
    },
    title: pick(r.body, /<title[^>]*>([\s\S]*?)<\/title>/i).trim(),
    metaDescription: pick(r.body, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)/i),
    ogTags: [...r.body.matchAll(/<meta[^>]+property=["'](og:[^"']+)["'][^>]+content=["']([^"']*)/gi)].map((m) => m[1] + "=" + m[2].slice(0, 80)),
    twitter: [...r.body.matchAll(/<meta[^>]+name=["'](twitter:[^"']+)["']/gi)].map((m) => m[1]),
    favicon: [...r.body.matchAll(/<link[^>]+rel=["'][^"']*icon[^"']*["'][^>]*>/gi)].map((m) => m[0].slice(0, 160)),
    canonical: pick(r.body, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)/i),
    h1count: (r.body.match(/<h1/gi) || []).length, h2count: (r.body.match(/<h2/gi) || []).length,
    imgCount: (r.body.match(/<img/gi) || []).length, imgNoAlt: (r.body.match(/<img(?![^>]*\balt=)[^>]*>/gi) || []).length,
    imgNoDims: (r.body.match(/<img(?![^>]*\bwidth=)[^>]*>/gi) || []).length,
    imgLazy: (r.body.match(/<img[^>]*loading=["']lazy["']/gi) || []).length,
    jsonld: [...r.body.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1].replace(/\s+/g, " ").slice(0, 400)),
    scripts: [...r.body.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)].map((m) => m[1]),
    lang: pick(r.body, /<html[^>]*\blang=["']([^"']*)/i),
    refreshMeta: /http-equiv=["']refresh["']/i.test(r.body),
    anclasUsadas: [...new Set([...r.body.matchAll(/href=["']([^"']*#[^"']+)["']/gi)].map((m) => m[1]))],
  };
  await fsp.writeFile(path.join(OUT, "html", name + ".html"), r.body || "");
  console.log(`· HTTP ${name.padEnd(20)} ${r.status} ${r.chain.at(-1).bytes}b ${r.chain.at(-1).ms}ms  h1:${http[name].h1count} og:${http[name].ogTags.length} ld:${http[name].jsonld.length}`);
}
await J("http.json", http);

/* ─────────────── B · enlaces y recursos ─────────────── */
const urls = new Map();
const add = (u, where, kind) => { try { const a = new URL(u, BASE); if (a.host !== HOST) return; const k = a.origin + a.pathname + a.search; (urls.get(k) || urls.set(k, { url: k, where: [], kind }).get(k)).where.push(where); } catch {} };
for (const [name] of PAGES) {
  const html = await fsp.readFile(path.join(OUT, "html", name + ".html"), "utf8");
  for (const m of html.matchAll(/(?:href|src)=["']([^"'#][^"']*)["']/gi)) add(m[1], name, /\.(jpe?g|png|webp|gif|svg|avif)/i.test(m[1]) || m[1].startsWith("/cdn/") || m[1].startsWith("//") ? "recurso" : "enlace");
}
const linkResults = {}; let n = 0;
for (const [u, meta] of urls) {
  if (++n > 300) { linkResults[u] = { skipped: true }; continue; }
  let st = 0, type = "", bytes = 0, err = "";
  try { const r = await fetch(u, { headers: H, redirect: "follow" }); st = r.status; type = r.headers.get("content-type") || ""; bytes = (await r.arrayBuffer()).byteLength; }
  catch (e) { err = String(e.message || e); }
  linkResults[u] = { status: st, type, bytes, err, kind: meta.kind, where: [...new Set(meta.where)] };
  if (st >= 400 || err) console.log(`  ✗ ${st || err} ${u.slice(0, 120)}  (en: ${meta.where.slice(0, 2).join(", ")})`);
  await sleep(120);
}
await J("links.json", linkResults);

/* ─────────────── C · catálogo real de Shopify ─────────────── */
let catalog = { products: [], error: "" };
try {
  const r = await fetch(BASE + "/products.json?limit=250", { headers: H });
  const data = await r.json();
  catalog.products = data.products.map((p) => ({
    id: p.id, handle: p.handle, title: p.title, vendor: p.vendor, type: p.product_type, tags: p.tags,
    bodyText: (p.body_html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(), images: p.images.length,
    variants: p.variants.map((v) => ({ id: v.id, title: v.title, sku: v.sku, price: v.price, compare_at: v.compare_at_price, available: v.available, grams: v.grams })),
  }));
  console.log(`· catálogo real: ${catalog.products.length} productos`);
} catch (e) { catalog.error = String(e.message || e); }
await J("catalog.json", catalog);

/* ─────────────── D · anclas ─────────────── */
const anchors = {};
for (const [name] of PAGES) {
  const html = await fsp.readFile(path.join(OUT, "html", name + ".html"), "utf8");
  const ids = new Set([...html.matchAll(/\bid=["']([^"']+)["']/gi)].map((m) => m[1]));
  for (const href of http[name].anclasUsadas) {
    const [p, hash] = href.split("#");
    if (!hash) continue;
    let exists = null;
    if (!p) exists = ids.has(hash);
    else {
      const ent = Object.entries(http).find(([, v]) => v.path === p);
      if (ent) exists = new RegExp(`id=["']${hash.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`).test(await fsp.readFile(path.join(OUT, "html", ent[0] + ".html"), "utf8"));
      else { const r = await fetchChain(new URL(p, BASE).href); exists = r.status < 400 && new RegExp(`id=["']${hash.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`).test(r.body); (anchors._extra ||= {})[p] = r.status; }
    }
    (anchors[name] ||= {})[href] = exists;
  }
}
await J("anchors.json", anchors);

/* ─────────────── E · navegador ─────────────── */
const VIEWPORTS = [
  { name: "movil", width: 390, height: 844, isMobile: true, deviceScaleFactor: 2, ua: UA_MOVIL },
  { name: "tablet", width: 768, height: 1024, isMobile: true, deviceScaleFactor: 1, ua: UA_MOVIL },
  { name: "escritorio", width: 1440, height: 900, isMobile: false, deviceScaleFactor: 1, ua: H["user-agent"] },
];
const TABLET = new Set(["home", "tienda", "matcha", "producto-ceremonial", "carrito"]);
const FULL = { movil: new Set(PAGES.map(([k]) => k)), escritorio: new Set(["home", "tienda", "matcha", "recetas", "nosotros", "producto-ceremonial", "carrito", "404"]) };
const SLICES = new Set(["home", "tienda", "matcha", "producto-ceremonial", "recetas"]);
const browserReport = {}, funcional = {}, domDumps = {};

const puppeteer = (await import("puppeteer")).default;
const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage", "--hide-scrollbars", "--font-render-hinting=none"] });
const newPage = async (vp, capture) => {
  const page = await browser.newPage();
  await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: vp.deviceScaleFactor, isMobile: vp.isMobile, hasTouch: vp.isMobile });
  await page.setUserAgent(vp.ua);
  await page.setExtraHTTPHeaders({ "accept-language": "es-ES,es;q=0.9" });
  if (capture) {
    page.on("response", (r) => { const u = r.url(); if (/\/(cart|cart\.js|cart\/add|checkout|contact|newsletter|lead)/i.test(u)) capture.push({ url: u.slice(0, 160), status: r.status() }); });
  }
  return page;
};
const PERF = `(() => {
  const out = {};
  const nav = performance.getEntriesByType('navigation')[0];
  if (nav) out.ttfb = Math.round(nav.responseStart), out.domReady = Math.round(nav.domContentLoadedEventEnd), out.load = Math.round(nav.loadEventEnd), out.transfer = nav.transferSize, out.domNodes = document.getElementsByTagName('*').length;
  const res = performance.getEntriesByType('resource');
  out.requests = res.length;
  out.bytes = res.reduce((a, r) => a + (r.transferSize || 0), 0);
  out.slowest = res.map((r) => ({ u: r.name.split('/').pop().slice(0, 60), t: Math.round(r.duration) })).sort((a, b) => b.t - a.t).slice(0, 6);
  const p = performance.getEntriesByType('paint');
  out.fcp = Math.round((p.find((x) => x.name === 'first-contentful-paint') || {}).startTime || 0);
  out.lcp = Math.round((window.__lcp || 0));
  out.cls = Math.round((window.__cls || 0) * 1000) / 1000;
  return out;
})()`;

for (const [name, p] of PAGES) {
  for (const vp of VIEWPORTS) {
    if (vp.name === "tablet" && !TABLET.has(name)) continue;
    const key = `${name}.${vp.name}`;
    const page = await newPage(vp);
    const errs = [], netFail = [], bad = [];
    page.on("pageerror", (e) => errs.push("js: " + e.message));
    page.on("console", (m) => { if (m.type() === "error") errs.push("consola: " + m.text().slice(0, 220)); });
    page.on("requestfailed", (r) => netFail.push((r.failure()?.errorText || "?") + " " + r.url().slice(0, 130)));
    page.on("response", (r) => { if (r.status() >= 400) bad.push(r.status() + " " + r.url().slice(0, 150)); });
    await page.evaluateOnNewDocument(() => {
      window.__lcp = 0; window.__cls = 0;
      try { new PerformanceObserver((l) => { const e = l.getEntries(); window.__lcp = e[e.length - 1].startTime; }).observe({ type: "largest-contentful-paint", buffered: true }); } catch {}
      try { new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: "layout-shift", buffered: true }); } catch {}
    });
    let status = 0;
    try { const resp = await page.goto(BASE + p, { waitUntil: "networkidle2", timeout: 60000 }); status = resp ? resp.status() : 0; } catch (e) { errs.push("nav: " + e.message); }
    await sleep(1400);
    const info = await page.evaluate(() => {
      const vis = (el) => { const r = el.getBoundingClientRect(), cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && cs.display !== "none" && +cs.opacity > 0.05; };
      const doc = document.documentElement;
      const wide = [];
      for (const el of document.querySelectorAll("body *")) {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.right > window.innerWidth + 1 && vis(el) && getComputedStyle(el).position !== "fixed" && !el.closest('[id="shopify-block"]'))
          wide.push({ sel: el.tagName.toLowerCase() + (el.className ? "." + String(el.className).split(/\s+/).slice(0, 2).join(".") : ""), right: Math.round(r.right), w: Math.round(r.width) });
      }
      const broken = [...document.querySelectorAll("img")].filter((i) => i.complete && i.naturalWidth === 0).map((i) => ({ src: (i.currentSrc || i.src).slice(0, 160), alt: i.alt, w: Math.round(i.getBoundingClientRect().width) }));
      const small = [];
      for (const el of document.querySelectorAll("a,button,input[type=submit],[role=button]")) { if (!vis(el)) continue; const r = el.getBoundingClientRect(); if (r.width < 40 || r.height < 40) small.push({ t: (el.innerText || el.getAttribute("aria-label") || "").replace(/\s+/g, " ").trim().slice(0, 45), w: Math.round(r.width), h: Math.round(r.height) }); }
      const hdr = document.querySelector("header");
      const compro = [...document.querySelectorAll("body *")].filter((e) => /^Compró\b/.test((e.textContent || "").trim()) && e.children.length === 0).slice(0, 3).map((e) => {
        const chain = []; let x = e; for (let i = 0; i < 4 && x; i++) { chain.push(x.tagName + (x.id ? "#" + x.id : "") + (x.className ? "." + String(x.className).split(/\s+/).slice(0, 2).join(".") : "")); x = x.parentElement; }
        return { text: e.textContent.trim().slice(0, 60), cadena: chain, enIframe: e.ownerDocument !== document };
      });
      const refresh = document.querySelector('meta[http-equiv="refresh"]');
      const forms = [...document.querySelectorAll("form")].map((f) => ({ form: f.dataset.form || f.getAttribute("action") || "(sin data-form)", inputs: [...f.querySelectorAll("input,select,textarea")].map((i) => (i.type || i.tagName) + ":" + (i.name || "")), botones: [...f.querySelectorAll("button,[type=submit]")].map((b) => (b.innerText || b.value || "").trim().slice(0, 30)) }));
      return {
        title: document.title, h1: [...document.querySelectorAll("h1")].map((h) => h.innerText).join(" | "),
        height: doc.scrollHeight, overflow: doc.scrollWidth - window.innerWidth, wide: wide.slice(0, 8), broken, small: small.slice(0, 20), smallCount: small.length,
        headerH: hdr ? Math.round(hdr.getBoundingClientRect().height) : null, headerPos: hdr ? getComputedStyle(hdr).position : null,
        cartBadge: (() => { const e = document.querySelector("[data-cart-count]"); return e ? e.textContent.trim() : null; })(),
        lang: document.documentElement.lang, viewportMeta: document.querySelector('meta[name="viewport"]')?.content || null,
        themeColor: document.querySelector('meta[name="theme-color"]')?.content || null,
        compro, refreshMeta: refresh ? refresh.outerHTML : null, forms,
        cssRefs: [...document.querySelectorAll('link[rel=stylesheet]')].map((l) => l.href),
        shopIframe: !!document.querySelector('iframe[src*="shop.app"]'),
        dialogos: [...document.querySelectorAll('[role="dialog"],dialog')].map((d) => ({ id: d.id, open: d.dataset.open || d.open || null })),
        dataOpen: [...document.querySelectorAll("[data-open]")].map((d) => d.id + ":" + d.dataset.open),
      };
    }).catch((e) => ({ error: String(e.message) }));
    info.perf = await page.evaluate(PERF).catch(() => null);
    if ((name === "home" || name === "tienda") && vp.name === "movil") domDumps[name] = await page.evaluate(() => document.documentElement.outerHTML).catch(() => "");

    await page.screenshot({ path: path.join(OUT, "screens", `${key}.jpg`), type: "jpeg", quality: 62, fullPage: false }).catch(() => {});
    if (FULL[vp.name]?.has(name)) await page.screenshot({ path: path.join(OUT, "screens", `${key}.full.jpg`), type: "jpeg", quality: 60, fullPage: true }).catch(() => {});
    if (vp.name === "movil" && SLICES.has(name)) {
      for (let s = 0; s < 5; s++) {
        await page.evaluate((y) => window.scrollTo(0, y), s * 800);
        await sleep(450);
        await page.screenshot({ path: path.join(OUT, "screens", `${key}.s${s + 1}.jpg`), type: "jpeg", quality: 68 }).catch(() => {});
      }
      await page.evaluate(() => window.scrollTo(0, 0));
    }
    browserReport[key] = { path: p, status, vp: `${vp.width}x${vp.height}`, info, errs: [...new Set(errs)].slice(0, 10), netFail: [...new Set(netFail)].slice(0, 10), bad: [...new Set(bad)].slice(0, 15) };
    console.log(`· ${key.padEnd(30)} ${status} h:${info.height} desb:${info.overflow} rotas:${(info.broken || []).length} táct:${info.smallCount} err:${errs.length} 4xx:${bad.length} LCP:${info.perf?.lcp}ms CLS:${info.perf?.cls}`);
    await page.close();
    await sleep(250);
  }
}
await J("browser.json", browserReport);
for (const [k, v] of Object.entries(domDumps)) await fsp.writeFile(path.join(OUT, "dom", k + ".html"), v);

/* ─────────────── F · flujos funcionales ─────────────── */
const flowLog = (k, v) => { funcional[k] = v; console.log("· flujo " + k + " → " + (v.ok === false ? "FALLA: " + v.why : "ok")); };

// F1 · Añadir al carrito un producto que existe y tiene stock (Eco Tote Bag)
{
  const cap = [];
  const page = await newPage(VIEWPORTS[0], cap);
  const posts = [];
  page.on("request", (r) => { if (r.method() === "POST") posts.push(r.url().slice(0, 140)); });
  await page.goto(BASE + "/pages/tienda", { waitUntil: "networkidle2" }); await sleep(1200);
  const antes = await page.evaluate(() => document.querySelector("[data-cart-count]")?.textContent);
  const btn = await page.evaluate(() => {
    const b = [...document.querySelectorAll('[data-act="add"]')].find((x) => x.dataset.id === "tote");
    if (!b) return { ok: false };
    b.scrollIntoView({ block: "center" }); b.click();
    return { ok: true, id: b.dataset.id, texto: b.innerText.trim().slice(0, 40) };
  });
  await sleep(4000);
  const despues = { url: page.url(), title: await page.title(), texto: (await page.evaluate(() => document.body.innerText)).replace(/\s+/g, " ").slice(0, 700), badge: await page.evaluate(() => document.querySelector("[data-cart-count]")?.textContent), cartJs: await page.evaluate(() => fetch("/cart.js").then((r) => r.json()).then((c) => ({ items: c.item_count, total: c.total_price / 100, lineas: c.items.map((i) => i.title + " · " + i.quantity + " × " + i.price / 100 + " €") })).catch((e) => ({ err: String(e) }))) };
  await page.screenshot({ path: path.join(OUT, "screens", "flujo1-tote-add.jpg"), type: "jpeg", quality: 68 });
  flowLog("1-anadir-producto-real-tote", { ok: despues.url !== BASE + "/pages/tienda", antes, btn, despues, posts, llamadas: cap });
  await page.close();
}

// F2 · Añadir el producto estrella (ceremonial, agotado) desde la portada
{
  const page = await newPage(VIEWPORTS[0]);
  const cap = [];
  page.on("response", (r) => { const u = r.url(); if (/\/(cart|checkout)/.test(u)) cap.push(u.slice(0, 120) + " → " + r.status()); });
  await page.goto(BASE + "/", { waitUntil: "networkidle2" }); await sleep(1200);
  const click = await page.evaluate(() => {
    const b = [...document.querySelectorAll('[data-act="add"]')].find((x) => x.dataset.id === "te-ceremonial");
    if (!b) return { ok: false, n: document.querySelectorAll('[data-act="add"]').length };
    b.scrollIntoView({ block: "center" }); b.click(); return { ok: true, texto: b.innerText.trim() };
  });
  await sleep(4500);
  const despues = { url: page.url(), title: await page.title(), texto: (await page.evaluate(() => document.body.innerText)).replace(/\s+/g, " ").slice(0, 600) };
  await page.screenshot({ path: path.join(OUT, "screens", "flujo2-ceremonial-agotado.jpg"), type: "jpeg", quality: 68 });
  flowLog("2-anadir-ceremonial-agotado", { ok: !/agotado|no disponible/i.test(despues.texto), why: /agotado/i.test(despues.texto) ? "acaba en la página de error de Shopify («ya está agotado»)" : "", click, despues, llamadas: cap });
  await page.close();
}

// F3 · Añadir un producto del catálogo falso (kit) → ¿qué ve el cliente?
{
  const page = await newPage(VIEWPORTS[0]);
  const cap = [];
  page.on("response", (r) => { const u = r.url(); if (/\/(cart|checkout)/.test(u)) cap.push(u.slice(0, 120) + " → " + r.status()); });
  await page.goto(BASE + "/pages/tienda", { waitUntil: "networkidle2" }); await sleep(1200);
  const click = await page.evaluate(() => {
    const b = [...document.querySelectorAll('[data-act="add"]')].find((x) => x.dataset.id === "kit-completo");
    if (!b) return { ok: false, n: document.querySelectorAll('[data-act="add"]').length };
    b.scrollIntoView({ block: "center" }); b.click(); return { ok: true, texto: b.innerText.trim() };
  });
  await sleep(4500);
  const despues = { url: page.url(), title: await page.title(), texto: (await page.evaluate(() => document.body.innerText)).replace(/\s+/g, " ").slice(0, 700), badge: await page.evaluate(() => document.querySelector("[data-cart-count]")?.textContent) };
  await page.screenshot({ path: path.join(OUT, "screens", "flujo3-kit-add.jpg"), type: "jpeg", quality: 68 });
  flowLog("3-anadir-kit-inexistente", { ok: false, why: "no es una compra real: " + despues.url, click, despues, llamadas: cap });
  await page.close();
}

// F4 · carrito pintado por el tema (localStorage) + «Finalizar compra»
{
  const page = await newPage(VIEWPORTS[0]);
  const cap = [];
  page.on("response", (r) => { const u = r.url(); if (/\/(cart|checkout)/.test(u)) cap.push(u.slice(0, 130) + " → " + r.status()); });
  await page.goto(BASE + "/pages/tienda", { waitUntil: "networkidle2" }); await sleep(1000);
  await page.evaluate(() => { const b = [...document.querySelectorAll('[data-act="add"]')].find((x) => x.dataset.id === "chawan-negro"); if (b) { b.scrollIntoView({ block: "center" }); b.click(); } });
  await sleep(1800);
  const drawer = await page.evaluate(() => { document.querySelector('[data-act="cart"]')?.click(); return true; });
  await sleep(900);
  const carrito = await page.evaluate(() => {
    const c = document.querySelector("#cart");
    return { abierto: c?.dataset.open, texto: (c?.innerText || "").replace(/\s+/g, " ").slice(0, 900), localStorage: (() => { try { return localStorage.getItem("zenqa_cart"); } catch { return null; } })() };
  });
  await page.screenshot({ path: path.join(OUT, "screens", "flujo4-carrito-tema.jpg"), type: "jpeg", quality: 68 });
  const antesUrl = page.url();
  await page.evaluate(() => document.querySelector('[data-act="checkout"]')?.click());
  await sleep(5000);
  const fuera = { url: page.url(), texto: (await page.evaluate(() => document.body.innerText)).replace(/\s+/g, " ").slice(0, 900) };
  await page.screenshot({ path: path.join(OUT, "screens", "flujo4-checkout.jpg"), type: "jpeg", quality: 68 });
  flowLog("4-carrito-tema-y-checkout", { ok: false, why: "el carrito del tema es una simulación en localStorage", drawer, carrito, antesUrl, fuera, llamadas: cap });
  await page.close();
}

// F5 · ficha rápida (Ver ficha)
{
  const page = await newPage(VIEWPORTS[0]);
  await page.goto(BASE + "/pages/tienda", { waitUntil: "networkidle2" }); await sleep(1200);
  const click = await page.evaluate(() => { const b = document.querySelector('[data-act="qv"][data-id="te-ceremonial"]') || document.querySelector('[data-act="qv"]'); if (!b) return { ok: false, n: document.querySelectorAll("[data-act]").length }; b.scrollIntoView({ block: "center" }); b.click(); return { ok: true, id: b.dataset.id }; });
  await sleep(1200);
  const ficha = await page.evaluate(() => { const q = document.querySelector("#qv"); return { abierto: q?.dataset.open, texto: (q?.innerText || "").replace(/\s+/g, " ").slice(0, 1200), enlaces: [...(q?.querySelectorAll("a") || [])].map((a) => a.getAttribute("href")).slice(0, 8) }; });
  await page.screenshot({ path: path.join(OUT, "screens", "flujo5-ficha.jpg"), type: "jpeg", quality: 68 });
  const addEnFicha = await page.evaluate(() => { const b = document.querySelector("#qv [data-act='add']"); if (!b) return { ok: false }; b.click(); return { ok: true, id: b.dataset.id }; });
  await sleep(1200);
  const cartTrasFicha = await page.evaluate(() => (() => { try { return localStorage.getItem("zenqa_cart"); } catch { return null; } })());
  const esc = await page.keyboard.press("Escape"); await sleep(600);
  const cerrado = await page.evaluate(() => document.querySelector("#qv")?.dataset.open);
  flowLog("5-ficha-rapida", { ok: !!ficha.abierto, click, ficha, addEnFicha, cartTrasFicha, cerrado });
  await page.close();
}

// F6 · buscador
{
  const page = await newPage(VIEWPORTS[0]);
  await page.goto(BASE + "/", { waitUntil: "networkidle2" }); await sleep(1000);
  const abrir = await page.evaluate(() => { const b = document.querySelector('[data-act="search"]'); if (!b) return { ok: false }; b.click(); return { ok: true }; });
  await sleep(700);
  const escribir = await page.evaluate(async () => {
    const q = document.querySelector("#q"); if (!q) return { ok: false };
    q.focus(); q.value = "hojicha"; q.dispatchEvent(new Event("input", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 700));
    return { ok: true, resultados: (document.querySelector("#sres")?.innerText || "").replace(/\s+/g, " ").slice(0, 500) };
  });
  await page.screenshot({ path: path.join(OUT, "screens", "flujo6-buscador.jpg"), type: "jpeg", quality: 68 });
  // clic al primer resultado → ¿existe el producto?
  const ir = await page.evaluate(() => { const a = document.querySelector("#sres a"); if (!a) return { ok: false }; const h = a.getAttribute("href"); a.click(); return { ok: true, href: h }; });
  await sleep(2500);
  flowLog("6-buscador", { ok: escribir.ok && !!escribir.resultados, abrir, escribir, ir, urlFinal: page.url() });
  await page.close();
}

// F7 · formularios (guía, newsletter, contacto): ¿se envía algo a algún sitio?
{
  const page = await newPage(VIEWPORTS[2]);
  const posts = [];
  page.on("request", (r) => { if (r.method() === "POST") posts.push({ url: r.url().slice(0, 150), data: (r.postData() || "").slice(0, 200) }); });
  const salida = {};
  for (const [p, doc] of [["/#guia", "guia"], ["/#join", "newsletter"], ["/pages/el-ritual#contacto", "contacto"]]) {
    await page.goto(BASE + p, { waitUntil: "networkidle2" }); await sleep(1400);
    const r = await page.evaluate(async (doc) => {
      const forms = [...document.querySelectorAll("form")];
      if (!forms.length) return { ok: false, why: "sin formularios", forms: 0 };
      const f = forms.find((x) => /lead|contact|news/i.test(x.dataset.form || "")) || forms[0];
      const set = (el, v) => { if (!el) return false; el.focus(); el.value = v; el.dispatchEvent(new Event("input", { bubbles: true })); el.dispatchEvent(new Event("change", { bubbles: true })); return true; };
      const mail = f.querySelector('input[type="email"]'); const priv = f.querySelector('input[name="priv"],input[type="checkbox"]');
      const nombre = f.querySelector('[name="name"]'); const msg = f.querySelector("textarea"); const sel = f.querySelector("select");
      const out = { form: f.dataset.form, email: set(mail, "auditoria.test@example.com"), nombre: set(nombre, "Auditoría"), msg: set(msg, "Prueba automática: ignorar."), checked: priv ? (priv.click(), priv.checked) : null, sel: sel ? sel.options.length : 0 };
      const btn = [...f.querySelectorAll("button,[type=submit]")].find((b) => /descargar|suscrib|enviar|quiero|apuntar/i.test(b.innerText || b.value || ""));
      out.boton = btn ? btn.innerText.trim().slice(0, 40) : null;
      if (btn) btn.click(); else f.requestSubmit ? f.requestSubmit() : f.submit();
      await new Promise((x) => setTimeout(x, 2200));
      out.despues = (document.body.innerText.match(/[^\n]*(gracias|recibido|enviado|lista|guía|correo|24 h|demo)[^\n]*/gi) || []).slice(-6);
      out.almacenado = Object.keys(localStorage).map((k) => k + "=" + String(localStorage.getItem(k)).slice(0, 60));
      out.oculto = [...document.querySelectorAll("[hidden],.sr,.visually-hidden")].filter((e) => /error|falta|inválido/i.test(e.textContent || "")).length;
      return out;
    }, doc).catch((e) => ({ error: String(e.message) }));
    salida[doc] = r;
  }
  const pdf = await page.evaluate(() => fetch("/cdn/shop/t/10/assets/zq-guia-matcha-zenqa.pdf", { method: "HEAD" }).then((r) => r.status).catch(() => 0));
  flowLog("7-formularios", { ok: false, why: "ninguno envía datos fuera del navegador", salida, posts, pdfGuia: pdf });
  await page.close();
}

// F8 · compra real de punta a punta con un producto que sí existe (tote) hasta el checkout
{
  const page = await newPage(VIEWPORTS[0]);
  const cap = [];
  page.on("response", (r) => { const u = r.url(); if (/cart|checkout|pay/i.test(u)) cap.push(u.slice(0, 140) + " → " + r.status()); });
  await page.goto(BASE + "/pages/tienda", { waitUntil: "networkidle2" }); await sleep(1200);
  await page.evaluate(() => { const b = [...document.querySelectorAll('[data-act="add"]')].find((x) => x.dataset.id === "tote"); if (b) { b.scrollIntoView({ block: "center" }); b.click(); } });
  await sleep(4000);
  const trasAdd = { url: page.url(), title: await page.title(), texto: (await page.evaluate(() => document.body.innerText)).replace(/\s+/g, " ").slice(0, 500) };
  await page.screenshot({ path: path.join(OUT, "screens", "flujo8-tras-add.jpg"), type: "jpeg", quality: 68 });
  let checkout = null;
  if (/\/cart/.test(page.url())) {
    const btn = await page.evaluate(() => { const b = [...document.querySelectorAll("button,a,input[type=submit]")].find((x) => /finalizar|pagar|checkout/i.test(x.innerText || x.value || "")); if (!b) return { ok: false, n: document.querySelectorAll("form button").length }; b.scrollIntoView({ block: "center" }); b.click(); return { ok: true, texto: (b.innerText || b.value).trim().slice(0, 40) }; });
    await sleep(6000);
    checkout = { click: btn, url: page.url(), title: await page.title(), texto: (await page.evaluate(() => document.body.innerText)).replace(/\s+/g, " ").slice(0, 1500) };
    await page.screenshot({ path: path.join(OUT, "screens", "flujo8-checkout-real.jpg"), type: "jpeg", quality: 68, fullPage: false });
  }
  flowLog("8-compra-real-tote", { ok: !!checkout && /checkout|checkouts/.test(checkout.url), trasAdd, checkout, llamadas: cap.slice(-10) });
  await page.close();
}

// F9 · accesibilidad con teclado y capas
{
  const page = await newPage(VIEWPORTS[2]);
  await page.goto(BASE + "/", { waitUntil: "networkidle2" }); await sleep(1000);
  const orden = [];
  for (let i = 0; i < 12; i++) { await page.keyboard.press("Tab"); orden.push(await page.evaluate(() => { const a = document.activeElement; return (a.tagName + " «" + (a.innerText || a.getAttribute("aria-label") || a.value || "").replace(/\s+/g, " ").trim().slice(0, 34) + "»").slice(0, 70); })); }
  const abrirCarrito = await page.evaluate(() => { const b = document.querySelector('[data-act="cart"]'); if (b) { b.click(); return true; } return false; });
  await sleep(700);
  const foco = await page.evaluate(() => { const q = document.querySelector("#cart"); return { abierto: q?.dataset.open, aria: q?.getAttribute("role"), ariaModal: q?.getAttribute("aria-modal"), inertes: document.querySelectorAll("[inert]").length, foco: document.activeElement?.tagName + " «" + (document.activeElement?.getAttribute("aria-label") || document.activeElement?.innerText || "").slice(0, 30) + "»" }; });
  await page.keyboard.press("Escape"); await sleep(400);
  const cerrado = await page.evaluate(() => document.querySelector("#cart")?.dataset.open);
  funcional["9-teclado-y-capas"] = { orden, abrirCarrito, foco, cerrado };
  await page.close();
}

// F10 · tabla de disponibilidad real de los 23 productos que el tema cree tener
{
  const page = await newPage(VIEWPORTS[0]);
  await page.goto(BASE + "/", { waitUntil: "networkidle2" }); await sleep(1200);
  const mapa = await page.evaluate(() => window.ZQ_PRODUCTS || null);
  const filas = {};
  if (mapa) {
    for (const [id, v] of Object.entries(mapa)) {
      const r = await page.evaluate(async (h, varId) => {
        try {
          const res = await fetch("/products/" + h + ".js");
          if (!res.ok) return { status: res.status };
          const j = await res.json();
          const vari = (j.variants || []).find((x) => String(x.id) === String(varId)) || (j.variants || [])[0];
          return { status: res.status, producto: j.title, publicado: j.published_at, varianteExiste: !!vari, disp: vari ? vari.available : null, precio: vari ? vari.price / 100 : null };
        } catch (e) { return { err: String(e.message) }; }
      }, v.handle, v.variant).catch((e) => ({ err: String(e.message) }));
      filas[id] = { handle: v.handle, variante: v.variant, ...r };
      await sleep(220);
    }
  }
  funcional["10-disponibilidad-catalogo-tema"] = { n: mapa ? Object.keys(mapa).length : 0, filas };
  console.log("· flujo 10 → " + Object.values(filas).filter((f) => !f.disp).length + "/" + Object.keys(filas).length + " sin stock o inexistentes");
  await page.close();
}

await J("funcional.json", funcional);

/* ─────────────── G · axe ─────────────── */
const axe = {};
try {
  const axeSrc = fs.readFileSync(path.join(process.cwd(), "node_modules/axe-core/axe.min.js"), "utf8");
  for (const [name, p] of PAGES) {
    if (!["home", "tienda", "matcha", "recetas", "producto-ceremonial", "carrito"].includes(name)) continue;
    const page = await newPage(VIEWPORTS[0]);
    await page.goto(BASE + p, { waitUntil: "networkidle2" }); await sleep(1300);
    await page.addScriptTag({ content: axeSrc });
    const r = await page.evaluate(async () => await window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"] } })).catch((e) => ({ error: String(e.message) }));
    axe[name] = r.violations ? r.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, n: v.nodes.length, muestra: v.nodes.slice(0, 3).map((x) => ({ target: x.target.join(" "), resumen: (x.failureSummary || "").replace(/\s+/g, " ").slice(0, 200) })) })) : [r];
    console.log(`· axe ${name}: ${r.violations ? r.violations.length + " tipos" : "error"}`);
    await page.close();
    await sleep(200);
  }
} catch (e) { axe.error = String(e.message || e); }
await J("axe.json", axe);

/* ─────────────── H · imágenes rotas (mapa completo) ─────────────── */
await J("imgs.json", Object.fromEntries(Object.entries(browserReport).map(([k, v]) => [k, v.info?.broken || []])));

await browser.close();
console.log("✓ evidencia en " + OUT + "/");
