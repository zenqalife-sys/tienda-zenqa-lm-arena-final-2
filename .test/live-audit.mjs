/* Auditoría de la tienda Shopify publicada (por defecto zenqalife.roadshop.online).

   Uso:  node .test/live-audit.mjs
   Escribe toda la evidencia en audit-out/ :
     http.json       · estado, cadena de redirecciones, cabeceras y tiempos de cada página
     links.json      · todos los enlaces/recursos internos y su estado real
     anchors.json    · anclas (#id) que se usan y si existen en la página destino
     catalog.json    · /products.json normalizado (precio, disponibilidad, vendor, tipo…)
     browser.json    · por página y viewport: errores, 404, desborde, táctiles, fuentes, capturas
     imgs.json       · imágenes rotas (naturalWidth 0) en la página viva
     funcional.json  · flujos: añadir al carrito, ficha, buscador, guía, newsletter, contacto, checkout
     axe.json        · accesibilidad (axe-core) por página
     lh-summary.json · resumen de Lighthouse (puntuaciones + auditorías que fallan)
     html/           · HTML crudo de cada página
     screens/        · capturas (jpg) móvil 390, tablet 768 y escritorio 1440
   Pensado para correr en GitHub Actions (.github/workflows/auditoria-live.yml). */

import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";

const require_ = createRequire(import.meta.url);
const BASE = (process.env.BASE || "https://zenqalife.roadshop.online").replace(/\/$/, "");
const OUT = process.env.OUT || "audit-out";
const HOST = new URL(BASE).host;
for (const d of ["", "html", "screens"]) await fsp.mkdir(path.join(OUT, d), { recursive: true });
const J = (f, o) => fsp.writeFile(path.join(OUT, f), JSON.stringify(o, null, 2));
const now = () => performance.now();
const H = { "user-agent": "Mozilla/5.0 (compatible; ZenqaAudit/1.0; +auditoria)" };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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

/* ─────────────────────────── A · HTTP de cada página ─────────────────────────── */
async function fetchChain(url, opts = {}) {
  const chain = [];
  let cur = url;
  for (let i = 0; i < 6; i++) {
    const t0 = now();
    let r;
    try {
      r = await fetch(cur, { redirect: "manual", headers: H, ...opts });
    } catch (e) {
      chain.push({ url: cur, error: String(e && e.message || e) });
      break;
    }
    const body = r.status === 204 || r.status === 304 ? "" : await r.text();
    chain.push({
      url: cur, status: r.status, location: r.headers.get("location"),
      type: r.headers.get("content-type"), ms: Math.round(now() - t0), bytes: body.length,
    });
    if (r.status >= 300 && r.status < 400 && r.headers.get("location")) {
      cur = new URL(r.headers.get("location"), cur).href;
      continue;
    }
    return { chain, final: cur, status: r.status, body, headers: Object.fromEntries(r.headers) };
  }
  return { chain, final: cur, status: 0, body: "", headers: {} };
}

const http = {};
for (const [name, p] of PAGES) {
  const r = await fetchChain(BASE + p);
  http[name] = { path: p, status: r.status, final: r.final, chain: r.chain, headers: {
    "content-type": r.headers["content-type"], "x-shopid": r.headers["x-shopid"],
    "cache-control": r.headers["cache-control"],
    "content-security-policy": r.headers["content-security-policy"] ? "sí" : "no",
    "strict-transport-security": r.headers["strict-transport-security"] || "no",
    "x-frame-options": r.headers["x-frame-options"] || "no",
    "x-content-type-options": r.headers["x-content-type-options"] || "no",
    "x-robots-tag": r.headers["x-robots-tag"] || "no",
  }, title: (r.body.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [, ""])[1].trim(),
     metaDescription: (r.body.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)/i) || [, ""])[1],
     metaRobots: (r.body.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)/i) || [, ""])[1],
     canonical: (r.body.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)/i) || [, ""])[1],
     h1: [...r.body.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) => m[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()),
     h1count: (r.body.match(/<h1/gi) || []).length,
     h2count: (r.body.match(/<h2/gi) || []).length,
     imgCount: (r.body.match(/<img/gi) || []).length,
     imgNoAlt: (r.body.match(/<img(?![^>]*\balt=)[^>]*>/gi) || []).length,
     imgNoDims: (r.body.match(/<img(?![^>]*\bwidth=)[^>]*>/gi) || []).length,
     imgLazy: (r.body.match(/<img[^>]*loading=["']lazy["']/gi) || []).length,
     jsonld: [...r.body.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => {
       const t = m[1].trim();
       try { const o = JSON.parse(t); return { types: [].concat(o["@type"] || o["@graph"]?.map?.(g => g["@type"]) || "?"), raw: o }; }
       catch { return { types: ["no-parsea"], raw: t.slice(0, 300) }; }
     }),
     scripts: [...r.body.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)].map((m) => m[1]),
     styles: [...r.body.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["']/gi)].map((m) => m[1]),
     lang: (r.body.match(/<html[^>]*\blang=["']([^"']*)/i) || [, ""])[1],
     text: r.body.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ")
       .replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&#39;|&rsquo;/g, "'")
       .replace(/&quot;/g, '"').replace(/&euro;/g, "€").replace(/[ \t]+/g, " ").replace(/\n{2,}/g, "\n").trim(),
     html: undefined,
  };
  await fsp.writeFile(path.join(OUT, "html", name + ".html"), r.body || "");
  console.log(`· HTTP ${name.padEnd(20)} ${r.status} ${r.chain.at(-1).bytes}b ${r.chain.at(-1).ms}ms`);
}
await J("http.json", http);

/* ─────────────────────────── B · enlaces y recursos ─────────────────────────── */
const urls = new Map(); // url → {where:[], kind}
const add = (u, where, kind) => {
  try { const abs = new URL(u, BASE); if (abs.host !== HOST) return; const k = abs.origin + abs.pathname + abs.search; (urls.get(k) || urls.set(k, { url: k, where: [], kind }).get(k)).where.push(where); }
  catch {}
};
for (const [name, p] of PAGES) {
  const html = http[name].text == null ? "" : await fsp.readFile(path.join(OUT, "html", name + ".html"), "utf8");
  for (const m of html.matchAll(/(?:href|src)=["']([^"'#][^"']*)["']/gi)) add(m[1], name, /\.(jpe?g|png|webp|gif|svg|avif)$/i.test(m[1]) || m[1].startsWith("/cdn/") ? "recurso" : "enlace");
}
const linkResults = {};
let n = 0;
for (const [u, meta] of urls) {
  if (++n > 420) { linkResults[u] = { skipped: true }; continue; }
  let st = 0, type = "", bytes = 0, err = "";
  try {
    const r = await fetch(u, { headers: H, redirect: "follow" });
    st = r.status; type = r.headers.get("content-type") || ""; const b = await r.arrayBuffer(); bytes = b.byteLength;
  } catch (e) { err = String(e.message || e); }
  linkResults[u] = { status: st, type, bytes, err, kind: meta.kind, where: [...new Set(meta.where)] };
  if (st >= 400 || err) console.log(`  ✗ ${st || err} ${u}  (en: ${meta.where.slice(0, 3).join(", ")})`);
}
await J("links.json", linkResults);

/* ─────────────────────────── C · catálogo real de Shopify ─────────────────────── */
let catalog = { products: [], error: "" };
try {
  const r = await fetch(BASE + "/products.json?limit=250", { headers: H });
  const data = await r.json();
  catalog.products = data.products.map((p) => ({
    id: p.id, handle: p.handle, title: p.title, vendor: p.vendor, type: p.product_type,
    tags: p.tags, published: p.published_at, updated: p.updated_at,
    bodyText: p.body_html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
    images: p.images.length, imageStatus: [],
    variants: p.variants.map((v) => ({ id: v.id, title: v.title, sku: v.sku, price: v.price, compare_at: v.compare_at_price, available: v.available, grams: v.grams })),
  }));
  console.log(`· catálogo: ${catalog.products.length} productos, ${catalog.products.reduce((a, p) => a + p.variants.length, 0)} variantes`);
} catch (e) { catalog.error = String(e.message || e); console.log("✗ catálogo:", catalog.error); }
await J("catalog.json", catalog);

/* ─────────────────────────── D · anclas usadas vs existentes ─────────────────── */
const anchors = {};
{
  const ids = {};
  for (const [name] of PAGES) {
    const html = await fsp.readFile(path.join(OUT, "html", name + ".html"), "utf8");
    ids["/" + name] = new Set([...html.matchAll(/\bid=["']([^"']+)["']/gi)].map((m) => m[1]));
  }
  const seen = new Set();
  for (const [name] of PAGES) {
    const html = await fsp.readFile(path.join(OUT, "html", name + ".html"), "utf8");
    for (const m of html.matchAll(/href=["']([^"']*#[^"']*)["']/gi)) {
      const raw = m[1];
      const [p, hash] = raw.split("#");
      const targetPath = !p ? "/" + name : "/" + p.replace(/^\/|\/$/g, "").replace(/\.html$/, "");
      const key = raw + " @" + name;
      if (seen.has(key)) continue; seen.add(key);
      const target = p ? http[[p.replace(/^\/.*\//, "").replace(/^\//, "")] ? "" : ""] : null;
      let exists = null;
      if (!p) exists = ids["/" + name]?.has(hash);
      else {
        const key2 = Object.entries(http).find(([, v]) => v.path === p || v.path === "/" + p);
        if (key2) exists = ids["/" + key2[0]]?.has(hash);
        else { // página no auditada: la bajamos
          const r = await fetchChain(new URL(p, BASE).href);
          if (!anchors._extra) anchors._extra = {};
          anchors._extra[p] = r.status;
          exists = r.status < 400 ? new RegExp(`id=["']${hash.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`, "i").test(r.body) : false;
        }
      }
      (anchors[name] ||= {})[raw] = exists;
    }
  }
}
await J("anchors.json", anchors);

/* ─────────────────────────── E · navegador real ─────────────────────────── */
const VIEWPORTS = [
  { name: "movil", width: 390, height: 844, isMobile: true, deviceScaleFactor: 2, ua: "mobile" },
  { name: "tablet", width: 768, height: 1024, isMobile: true, deviceScaleFactor: 1, ua: "mobile" },
  { name: "escritorio", width: 1440, height: 900, isMobile: false, deviceScaleFactor: 1, ua: "desktop" },
];
const TABLET_PAGES = new Set(["home", "tienda", "matcha", "recetas", "producto-ceremonial", "carrito"]);
const ESCRITORIO_FULL = new Set(["home", "tienda", "matcha", "recetas", "producto-ceremonial", "carrito", "nosotros", "404"]);
const browserReport = {};
const funcional = {};

let puppeteer;
try { puppeteer = (await import("puppeteer")).default; } catch (e) { console.log("✗ sin puppeteer:", e.message); }
if (puppeteer) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--hide-scrollbars", "--font-render-hinting=none"],
  });
  const newPage = async (vp) => {
    const page = await browser.newPage();
    await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: vp.deviceScaleFactor, isMobile: vp.isMobile, hasTouch: vp.isMobile });
    await page.setExtraHTTPHeaders({ "accept-language": "es-ES,es;q=0.9" });
    return page;
  };
  const PROBE = `(() => {
    const vis = (el) => { const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity > 0.05; };
    const txt = (el) => (el.innerText || el.value || '').replace(/\\s+/g, ' ').trim();
    return { vis, txt };
  })()`;
  const clickText = (page, t, opts = {}) => page.evaluate((t, opts) => {
    const vis = (el) => { const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity > 0.05; };
    const norm = (s) => (s || '').replace(/\s+/g, ' ').trim().toLowerCase();
    const scope = opts.scope ? document.querySelector(opts.scope) : document;
    if (!scope) return { ok: false, why: 'sin scope ' + opts.scope };
    const els = [...scope.querySelectorAll('button,a,[role=button],input[type=submit],summary,label')];
    const cands = els.filter((e) => vis(e) && norm(e.value || e.textContent).includes(t.toLowerCase()));
    if (!cands.length) return { ok: false, why: 'no encontrado: ' + t, n: els.length };
    const el = cands[0];
    el.scrollIntoView({ block: 'center', behavior: 'instant' });
    el.click();
    return { ok: true, tag: el.tagName, cls: (el.className || '').toString().slice(0, 90), href: el.getAttribute('href'), text: norm(el.value || el.textContent).slice(0, 70) };
  }, t, opts);

  /* --- E1 · recorrido de páginas por viewport --- */
  for (const [name, p] of PAGES) {
    for (const vp of VIEWPORTS) {
      if (vp.name === "tablet" && !TABLET_PAGES.has(name)) continue;
      const key = `${name}.${vp.name}`;
      const page = await newPage(vp);
      const errs = [], netFail = [], bad = [], reqs = [];
      page.on("pageerror", (e) => errs.push("js: " + e.message));
      page.on("console", (m) => { if (m.type() === "error") errs.push("consola: " + m.text().slice(0, 200)); });
      page.on("requestfailed", (r) => netFail.push((r.failure()?.errorText || "?") + " " + r.url().slice(0, 140)));
      page.on("response", (r) => { const u = r.url(); reqs.push(r.status() + " " + u.slice(0, 140)); if (r.status() >= 400) bad.push(r.status() + " " + u); });
      let status = 0;
      try {
        const resp = await page.goto(BASE + p, { waitUntil: "networkidle2", timeout: 60000 });
        status = resp ? resp.status() : 0;
      } catch (e) { errs.push("nav: " + e.message); }
      await sleep(1200);
      const info = await page.evaluate(() => {
        const vis = (el) => { const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
          return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity > 0.05; };
        const doc = document.documentElement;
        const overflow = doc.scrollWidth - window.innerWidth;
        const wide = [];
        for (const el of document.querySelectorAll("body *")) {
          const r = el.getBoundingClientRect();
          if (r.width > 0 && (r.right > window.innerWidth + 1 || r.left < -1) && vis(el) && getComputedStyle(el).position !== "fixed") {
            wide.push({ sel: el.tagName.toLowerCase() + (el.className ? "." + String(el.className).split(/\s+/).slice(0, 2).join(".") : ""), right: Math.round(r.right), left: Math.round(r.left), w: Math.round(r.width) });
            if (wide.length > 12) break;
          }
        }
        const broken = [...document.querySelectorAll("img")].filter((i) => i.complete && i.naturalWidth === 0)
          .map((i) => ({ src: i.currentSrc || i.src, alt: i.alt, w: i.getBoundingClientRect().width }));
        const small = [];
        for (const el of document.querySelectorAll("a,button,input[type=submit],[role=button]")) {
          if (!vis(el)) continue; const r = el.getBoundingClientRect();
          if (r.width < 40 || r.height < 40) small.push({ t: (el.innerText || el.getAttribute("aria-label") || "").replace(/\s+/g, " ").trim().slice(0, 40), w: Math.round(r.width), h: Math.round(r.height) });
        }
        const hdr = document.querySelector("header");
        const hdrCS = hdr ? getComputedStyle(hdr) : null;
        const scripts = [...document.querySelectorAll("script[src]")].map((s) => s.src);
        const styles = [...document.querySelectorAll("link[rel=stylesheet]")].map((s) => s.href);
        const cookieish = [...document.querySelectorAll("body *")].filter((e) => /cookie|consentimiento|acepto todas/i.test(e.textContent || "") && vis(e) && e.children.length < 6).slice(0, 5).map((e) => (e.textContent || "").replace(/\s+/g, " ").trim().slice(0, 120));
        const fonts = document.fonts ? [...document.fonts].map((f) => f.family + ":" + f.weight + ":" + f.status) : [];
        return {
          title: document.title, h1: [...document.querySelectorAll("h1")].map((h) => h.innerText).join(" | "),
          height: doc.scrollHeight, overflow, wide, broken, small: small.slice(0, 25), smallCount: small.length,
          headerH: hdr ? Math.round(hdr.getBoundingClientRect().height) : null,
          headerPos: hdrCS ? hdrCS.position : null, headerTop: hdr ? Math.round(hdr.getBoundingClientRect().top) : null,
          cartBadge: (() => { const e = [...document.querySelectorAll("header *, [class*=cart], [class*=carrito]")].find((x) => /^\s*\d+\s*$/.test(x.textContent || "") && vis(x)); return e ? e.textContent.trim() : null; })(),
          lang: document.documentElement.lang,
          fonts: [...new Set(fonts)], scripts, styles, cookieish,
          themeColor: (document.querySelector('meta[name="theme-color"]') || {}).content || null,
          viewportMeta: (document.querySelector('meta[name="viewport"]') || {}).content || null,
          localStorage: Object.keys(localStorage),
        };
      }).catch((e) => ({ error: String(e.message) }));

      // cabecera pegajosa tras hacer scroll
      let sticky = null;
      try {
        await page.evaluate(() => window.scrollTo(0, 1800));
        await sleep(600);
        sticky = await page.evaluate(() => {
          const h = document.querySelector("header"); if (!h) return null;
          const r = h.getBoundingClientRect(); const cs = getComputedStyle(h);
          return { top: Math.round(r.top), h: Math.round(r.height), position: cs.position, zIndex: cs.zIndex,
            visible: r.top > -2 && r.top < 6, tapado: (() => { const el = document.elementFromPoint(window.innerWidth / 2, 40); return el ? el.tagName + "." + String(el.className).slice(0, 40) : null; })() };
        });
        await page.evaluate(() => window.scrollTo(0, 0));
      } catch {}

      const shot = async (suffix, full) => page.screenshot({ path: path.join(OUT, "screens", `${key}${suffix}.jpg`), type: "jpeg", quality: 62, fullPage: full }).catch(() => {});
      await shot("", false);
      if (vp.name === "movil" || (vp.name === "escritorio" && ESCRITORIO_FULL.has(name))) await shot(".full", true);

      browserReport[key] = { path: p, status, vp: `${vp.width}x${vp.height}`, info, sticky, errs: [...new Set(errs)].slice(0, 12), netFail: [...new Set(netFail)].slice(0, 12), bad: [...new Set(bad)].slice(0, 20), reqs: reqs.filter((r) => /cart|cart\.js|checkout|contact|lead|klaviyo|mail|signup/i.test(r)).slice(0, 30) };
      console.log(`· ${key.padEnd(30)} ${status} imp ${info.height}px desborde ${info.overflow} px · táctiles<40 ${info.smallCount} · rotas ${info.broken?.length || 0} · errores ${errs.length}`);
      if (!errs.length && info.overflow <= 1 && !(info.broken || []).length) { /* ok */ }
      await page.close();
    }
  }

  /* --- E2 · flujos funcionales --- */
  const flowLog = (k, v) => { funcional[k] = v; console.log("· flujo " + k + " → " + (v.ok === false ? "FALLA: " + v.why : "ok")); };

  // 1. añadir al carrito desde la portada (móvil)
  {
    const vp = VIEWPORTS[0], page = await newPage(vp);
    const calls = [];
    page.on("response", async (r) => { const u = r.url(); if (/\/(cart|cart\/add|cart\/change|cart\/update)|cart\.js/.test(u)) calls.push({ url: u, status: r.status(), body: (await r.text().catch(() => "")).slice(0, 400) }); });
    await page.goto(BASE + "/", { waitUntil: "networkidle2" }); await sleep(1000);
    const before = await page.evaluate(() => fetch("/cart.js").then((r) => r.json()).then((c) => ({ items: c.item_count, total: c.total_price })).catch((e) => ({ err: String(e) })));
    const click = await clickText(page, "añadir");
    await sleep(2500);
    const after = await page.evaluate(() => fetch("/cart.js").then((r) => r.json()).then((c) => ({ items: c.item_count, total: c.total_price, lines: c.items.map((i) => ({ title: i.title, variant: i.variant_title, qty: i.quantity, price: i.price / 100, product: i.product_title })) })).catch((e) => ({ err: String(e) })));
    const drawer = await page.evaluate(() => {
      const vis = (el) => { const r = el.getBoundingClientRect(), cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden'; };
      const cands = [...document.querySelectorAll("[class*=cart],[class*=carrito],[id*=cart],[id*=carrito],[role=dialog],[class*=drawer],[class*=modal]")].filter(vis);
      const el = cands.sort((a, b) => (b.innerText || "").length - (a.innerText || "").length)[0];
      return el ? { sel: el.tagName + "#" + el.id + "." + String(el.className).slice(0, 60), text: (el.innerText || "").replace(/\s+/g, " ").slice(0, 600) } : null;
    });
    await page.screenshot({ path: path.join(OUT, "screens", "flujo1-carrito-movil.jpg"), type: "jpeg", quality: 72 });
    const alerts = await page.evaluate(() => [...document.querySelectorAll("body *")].filter((e) => e.children.length === 0 && /no disponible|agotado|sin stock|error|no se ha podido|unavailable/i.test(e.textContent || "")).map((e) => (e.textContent || "").trim().slice(0, 160)).slice(0, 6));
    flowLog("anadir-portada", { ok: after.items > before.items && after.items >= 0 ? after.items !== before.items : false, why: after.items === before.items ? "el carrito no cambió" : "", before, after, click, drawer, calls, alerts });
    if (typeof after.items === "number" && after.items !== before.items) funcional["anadir-portada"].ok = true;

    // 1b · persiste al recargar
    await page.reload({ waitUntil: "networkidle2" }); await sleep(1200);
    const persist = await page.evaluate(() => fetch("/cart.js").then((r) => r.json()).then((c) => c.item_count).catch(() => -1));
    funcional["persistencia-carrito"] = { ok: persist > 0, items: persist };

    // 1c · sumar/restar y quitar
    const plus = await clickText(page, "+").catch(() => ({ ok: false }));
    await sleep(1800);
    const afterPlus = await page.evaluate(() => fetch("/cart.js").then((r) => r.json()).then((c) => ({ items: c.item_count, total: c.total_price / 100, q: c.items.map((i) => i.quantity) })).catch((e) => ({ err: String(e) })));
    funcional["sumar-unidad"] = { ok: (afterPlus.q || []).some((q) => q > 1), click: plus, afterPlus, calls: calls.slice(-3) };

    // 1d · barra de envío gratis
    funcional["envio-gratis-texto"] = await page.evaluate(() => {
      const t = (document.body.innerText || "").match(/[^\n]*(env[íi]o gratis|Te faltan|faltan)[^\n]*/gi) || [];
      return { matches: t.slice(0, 6) };
    });
    await page.close();
  }

  // 2. ficha rápida (Ver ficha) en la tienda
  {
    const page = await newPage(VIEWPORTS[0]);
    await page.goto(BASE + "/pages/tienda", { waitUntil: "networkidle2" }); await sleep(1200);
    const before = await page.evaluate(() => ({ dialogs: document.querySelectorAll('[role=dialog],[class*=modal],[class*=ficha],[class*=qv]').length }));
    const click = await clickText(page, "ver ficha");
    await sleep(1500);
    const layer = await page.evaluate(() => {
      const vis = (el) => { const r = el.getBoundingClientRect(), cs = getComputedStyle(el); return r.width > 300 && r.height > 200 && cs.visibility !== 'hidden' && +cs.opacity > 0.1; };
      const cands = [...document.querySelectorAll("body *")].filter((e) => vis(e) && /Añadir|precio|€|ficha|ingredientes|dosis|notas/i.test(e.innerText || "") && (e.innerText || "").length < 4000);
      const el = cands.sort((a, b) => (a.innerText || "").length - (b.innerText || "").length).reverse()[0];
      return el ? { sel: el.tagName + "." + String(el.className).slice(0, 70), text: (el.innerText || "").replace(/\s+/g, " ").slice(0, 1500) } : null;
    });
    await page.screenshot({ path: path.join(OUT, "screens", "flujo2-ficha-movil.jpg"), type: "jpeg", quality: 72 });
    const esc = await page.keyboard.press("Escape").then(() => true).catch(() => false);
    await sleep(700);
    const closed = await page.evaluate(() => { const el = document.querySelector('[role=dialog][open],[class*=modal][data-open=true],[class*=ficha].is-open'); return !el; });
    flowLog("ficha-rapida", { ok: !!layer, why: layer ? "" : "no se abrió ninguna capa", before, click, layer, esc, closed });
    await page.close();
  }

  // 3. buscador
  {
    const page = await newPage(VIEWPORTS[0]);
    await page.goto(BASE + "/", { waitUntil: "networkidle2" }); await sleep(1000);
    const opened = await clickText(page, "buscar");
    await sleep(1200);
    const typed = await page.evaluate(async () => {
      const inp = [...document.querySelectorAll("input[type=search],input[type=text],input:not([type])")].find((i) => i.getBoundingClientRect().width > 60);
      if (!inp) return { ok: false };
      inp.focus(); inp.value = "hojicha"; inp.dispatchEvent(new Event("input", { bubbles: true }));
      await new Promise((r) => setTimeout(r, 900));
      return { ok: true, ph: inp.placeholder, results: (document.body.innerText.match(/[^\n]*hojicha[^\n]*/gi) || []).slice(0, 8) };
    });
    await sleep(1200);
    const results = await page.evaluate(() => (document.body.innerText.match(/[^\n]*hojicha[^\n]*/gi) || []).slice(0, 10));
    await page.screenshot({ path: path.join(OUT, "screens", "flujo3-buscador-movil.jpg"), type: "jpeg", quality: 72 });
    flowLog("buscador", { ok: !!typed?.ok && results.length > 0, why: typed?.ok ? (results.length ? "" : "sin resultados al escribir") : "no hay campo de búsqueda visible", opened, typed, results });
    await page.close();
  }

  // 4. imán de leads + newsletter (¿capta el email?) 
  {
    const page = await newPage(VIEWPORTS[0]);
    const posts = [];
    page.on("request", (r) => { if (r.method() === "POST") posts.push({ url: r.url().slice(0, 160), data: (r.postData() || "").slice(0, 300) }); });
    await page.goto(BASE + "/#guia", { waitUntil: "networkidle2" }); await sleep(1500);
    const filled = await page.evaluate(() => {
      const inp = [...document.querySelectorAll("input[type=email]")].find((i) => i.getBoundingClientRect().width > 60);
      if (!inp) return { ok: false };
      inp.focus(); inp.value = "auditoria.test@example.com"; inp.dispatchEvent(new Event("input", { bubbles: true }));
      const chk = [...document.querySelectorAll('input[type=checkbox]')].find((c) => !c.checked && c.getBoundingClientRect().width > 0);
      if (chk) { chk.click(); }
      return { ok: true, checked: chk ? chk.checked : null, forms: document.querySelectorAll("form").length, allInputs: [...document.querySelectorAll("input")].map((i) => i.type + ":" + i.name).slice(0, 12) };
    });
    await sleep(300);
    const submitted = await clickText(page, "descargar la guía");
    await sleep(2500);
    const after = await page.evaluate(() => ({
      links: [...document.querySelectorAll("a")].map((a) => a.href).filter((h) => /\.pdf/i.test(h)).slice(0, 4),
      msg: (document.body.innerText.match(/[^\n]*(guía|gracias|descarga|email válido|consentimiento)[^\n]*/gi) || []).slice(0, 8),
      stored: Object.keys(localStorage).flatMap((k) => { try { return [[k, (localStorage.getItem(k) || "").slice(0, 120)]]; } catch { return []; } }),
    }));
    // ¿el PDF existe?
    let pdf = null;
    if (after.links[0]) { const r = await fetch(after.links[0], { headers: H }).catch((e) => ({ status: 0, headers: { get: () => "" } })); pdf = { url: after.links[0], status: r.status, type: r.headers.get?.("content-type") || "" }; }
    flowLog("guia-lead", { ok: !!submitted?.ok, why: submitted?.ok ? "" : "no encontré el botón de descarga", filled, submitted, after, posts, pdf });

    // newsletter del pie
    const nl = await page.evaluate(async () => {
      const inp = [...document.querySelectorAll("input[type=email]")].filter((i) => i.getBoundingClientRect().width > 40);
      const last = inp[inp.length - 1]; if (!last) return { ok: false };
      window.scrollTo(0, document.body.scrollHeight);
      last.focus(); last.value = "auditoria.test@example.com"; last.dispatchEvent(new Event("input", { bubbles: true }));
      const chks = [...document.querySelectorAll('input[type=checkbox]')]; const c = chks[chks.length - 1]; if (c && !c.checked) c.click();
      await new Promise((r) => setTimeout(r, 200));
      const btns = [...document.querySelectorAll("button,[role=button],input[type=submit]")];
      const b = btns.filter((x) => /suscrib|apuntar|enviar|quiero/i.test(x.textContent || x.value || "")).pop();
      if (b) { b.click(); return { ok: true, btn: (b.textContent || "").trim().slice(0, 40), checked: c ? c.checked : null }; }
      if (last.form) { last.form.requestSubmit ? last.form.requestSubmit() : last.form.submit(); return { ok: true, btn: "form" }; }
      return { ok: false };
    });
    await sleep(2500);
    const nlAfter = await page.evaluate(() => ({ msg: (document.body.innerText.match(/[^\n]*(gracias|suscrit|newsletter|revisa tu correo|email válido)[^\n]*/gi) || []).slice(-6), stored: Object.keys(localStorage) }));
    flowLog("newsletter-pie", { ok: !!nl?.ok, why: nl?.ok ? "" : "sin formulario de newsletter en el pie", nl, nlAfter, posts: posts.slice(-4) });
    await page.close();
  }

  // 5. formulario de contacto
  {
    const page = await newPage(VIEWPORTS[2]);
    const posts = [];
    page.on("request", (r) => { if (r.method() === "POST") posts.push({ url: r.url().slice(0, 160), data: (r.postData() || "").slice(0, 400) }); });
    await page.goto(BASE + "/pages/el-ritual#contacto", { waitUntil: "networkidle2" }); await sleep(1200);
    const filled = await page.evaluate(() => {
      const set = (el, v) => { if (!el) return false; el.focus(); el.value = v; el.dispatchEvent(new Event("input", { bubbles: true })); el.dispatchEvent(new Event("change", { bubbles: true })); return true; };
      const email = [...document.querySelectorAll("input[type=email],input[name*=email]")][0];
      const name = [...document.querySelectorAll("input[type=text],input[name*=nombre]")][0];
      const msg = [...document.querySelectorAll("textarea")][0];
      const sel = [...document.querySelectorAll("select")][0];
      const chk = [...document.querySelectorAll('input[type=checkbox]')][0];
      const out = { email: set(email, "auditoria.test@example.com"), name: set(name, "Auditoría"), msg: set(msg, "Prueba automática de auditoría: no es un pedido real."), sel: sel ? sel.options.length : 0 };
      if (sel) { sel.selectedIndex = 1; sel.dispatchEvent(new Event("change", { bubbles: true })); }
      if (chk && !chk.checked) chk.click();
      out.checked = chk ? chk.checked : null;
      out.forms = [...document.querySelectorAll("form")].map((f) => f.action || location.href).slice(0, 5);
      return out;
    });
    await sleep(300);
    const sent = await clickText(page, "enviar mensaje");
    await sleep(3000);
    const after = await page.evaluate(() => ({ msg: (document.body.innerText.match(/[^\n]*(gracias|recibido|enviado|error|falta)[^\n]*/gi) || []).slice(-6), url: location.href }));
    await page.screenshot({ path: path.join(OUT, "screens", "flujo5-contacto.jpg"), type: "jpeg", quality: 72 });
    flowLog("contacto", { ok: !!sent?.ok, why: sent?.ok ? "" : "no encontré el botón de enviar", filled, sent, after, posts });
    await page.close();
  }

  // 6. carrito completo + checkout
  {
    const page = await newPage(VIEWPORTS[0]);
    const calls = [];
    page.on("response", async (r) => { if (/cart|checkout/i.test(r.url())) calls.push({ url: r.url().slice(0, 130), status: r.status() }); });
    await page.goto(BASE + "/cart", { waitUntil: "networkidle2" }); await sleep(1000);
    const cart = await page.evaluate(() => ({
      text: (document.body.innerText || "").replace(/\s+/g, " ").slice(0, 1200),
      empty: /carrito está vacío|no hay productos|continúa comprando/i.test(document.body.innerText || ""),
      items: document.querySelectorAll("[class*=cart-item],[class*=line-item],tr[class*=item]").length,
      qtyInputs: document.querySelectorAll('input[type=number],[name*=quantity],button[data-action*=quantity]').length,
    }));
    await page.screenshot({ path: path.join(OUT, "screens", "flujo6-carrito-movil.jpg"), type: "jpeg", quality: 72 });
    const co = await clickText(page, "finalizar compra");
    await sleep(5000);
    const coInfo = await page.evaluate(() => ({ url: location.href, title: document.title, text: (document.body.innerText || "").replace(/\s+/g, " ").slice(0, 1200) }));
    await page.screenshot({ path: path.join(OUT, "screens", "flujo6-checkout-movil.jpg"), type: "jpeg", quality: 72 });
    flowLog("carrito-checkout", { ok: /checkout|checkouts|pay/i.test(coInfo.url) || coInfo.url !== BASE + "/cart", cart, click: co, coInfo, calls: calls.slice(-8) });
    await page.close();
  }

  // 7. anclas: ¿el destino queda bajo la cabecera? + estructura del tema
  {
    const page = await newPage(VIEWPORTS[0]);
    await page.goto(BASE + "/pages/tienda", { waitUntil: "networkidle2" }); await sleep(800);
    const anchorsDOM = await page.evaluate(() => {
      const out = [];
      for (const a of [...document.querySelectorAll('a[href*="#"]')].slice(0, 25)) {
        const id = a.getAttribute("href").split("#")[1]; if (!id) continue;
        const el = document.getElementById(id);
        out.push({ href: a.getAttribute("href"), text: (a.innerText || "").trim().slice(0, 30), existe: !!el, top: el ? Math.round(el.getBoundingClientRect().top) : null });
      }
      return out;
    });
    const structure = await page.evaluate(() => {
      const cls = {}; for (const el of document.querySelectorAll("body *")) for (const c of String(el.className).split(/\s+/)) if (c && c.length < 40) cls[c] = (cls[c] || 0) + 1;
      const dataAttrs = {}; for (const el of document.querySelectorAll("body *")) for (const a of el.getAttributeNames()) if (a.startsWith("data-")) dataAttrs[a] = (dataAttrs[a] || 0) + 1;
      return { top: Object.entries(cls).sort((a, b) => b[1] - a[1]).slice(0, 60), dataAttrs, spots: [...document.querySelectorAll("[data-spot]")].map((e) => e.getAttribute("data-spot")) };
    });
    const jumped = await page.evaluate(async () => {
      const before = window.scrollY;
      location.hash = "#vaso";
      await new Promise((r) => setTimeout(r, 1200));
      const el = document.getElementById("vaso"); const h = document.querySelector("header");
      return { before, after: window.scrollY, targetTop: el ? Math.round(el.getBoundingClientRect().top) : null, headerH: h ? Math.round(h.getBoundingClientRect().height) : 0 };
    });
    funcional["anclas-y-estructura"] = { anchorsDOM, structure, jumped };
    await page.close();
  }

  /* --- E3 · axe-core --- */
  const axe = {};
  try {
    const axeSrc = fs.readFileSync(path.join(process.cwd(), "node_modules/axe-core/axe.min.js"), "utf8");
    for (const [name, p] of PAGES) {
      if (!["home", "tienda", "matcha", "recetas", "producto-ceremonial", "carrito"].includes(name)) continue;
      const page = await newPage(VIEWPORTS[0]);
      await page.goto(BASE + p, { waitUntil: "networkidle2" }); await sleep(1200);
      await page.addScriptTag({ content: axeSrc });
      const r = await page.evaluate(async () => await window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"] } }));
      axe[name] = r.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, n: v.nodes.length, sample: v.nodes.slice(0, 3).map((n) => ({ target: n.target.join(" "), summary: (n.failureSummary || "").replace(/\s+/g, " ").slice(0, 220) })) }));
      console.log(`· axe ${name}: ${r.violations.length} tipos de violación (${r.violations.reduce((a, v) => a + v.nodes.length, 0)} nodos)`);
      await page.close();
    }
  } catch (e) { axe.error = String(e.message || e); console.log("✗ axe:", axe.error); }
  await J("axe.json", axe);

  await J("browser.json", browserReport);
  await J("funcional.json", funcional);
  await J("imgs.json", Object.fromEntries(Object.entries(browserReport).map(([k, v]) => [k, v.info?.broken || []])));

  /* --- E4 · Lighthouse --- */
  let lh = null;
  try {
    const { default: lighthouse } = await import("lighthouse");
    const { launch } = await import("chrome-launcher");
    const chrome = await launch({ chromePath: process.env.CHROME_PATH || undefined, chromeFlags: ["--headless=new", "--no-sandbox", "--disable-dev-shm-usage"] });
    const summary = {};
    const targets = [["home", "/"], ["tienda", "/pages/tienda"], ["producto", "/products/te-matcha-ceremonial-organico446"]];
    for (const [name, p] of targets) {
      for (const mode of ["mobile", "desktop"]) {
        const settings = mode === "desktop"
          ? { formFactor: "desktop", screenEmulation: { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1, disabled: false }, throttling: { rttMs: 40, throughputKbps: 10240, cpuSlowdownMultiplier: 1 } }
          : { formFactor: "mobile", screenEmulation: { mobile: true, width: 412, height: 823, deviceScaleFactor: 1.75, disabled: false } };
        const run = await lighthouse(BASE + p, { port: chrome.port, output: "json", logLevel: "error", onlyCategories: ["performance", "accessibility", "best-practices", "seo"], ...settings });
        const { lhr } = run;
        await fsp.writeFile(path.join(OUT, `lh-${name}-${mode}.json`), run.report);
        const fails = Object.values(lhr.audits)
          .filter((a) => a.score !== null && a.score < 1 && a.scoreDisplayMode !== "informative" && a.scoreDisplayMode !== "notApplicable")
          .map((a) => ({ id: a.id, title: a.title, score: a.score, value: a.displayValue || "" }));
        const metrics = Object.fromEntries(["first-contentful-paint", "largest-contentful-paint", "total-blocking-time", "cumulative-layout-shift", "speed-index", "server-response-time", "total-byte-weight"].map((k) => [k, lhr.audits[k]?.displayValue || ""]));
        summary[`${name}-${mode}`] = { scores: Object.fromEntries(Object.entries(lhr.categories).map(([k, c]) => [k, Math.round((c.score || 0) * 100)])), metrics, fails: fails.slice(0, 40), failCount: fails.length };
        console.log(`· LH ${name} ${mode}: ${JSON.stringify(summary[`${name}-${mode}`].scores)}`);
      }
    }
    await J("lh-summary.json", summary);
    await chrome.kill();
  } catch (e) { console.log("✗ Lighthouse:", e.message); lh = String(e.message); }

  await browser.close();
}
console.log("✓ evidencia en " + OUT + "/");
