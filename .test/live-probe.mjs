/* Sondas puntuales sobre la tienda publicada: solapes del menú pegajoso, carrito
   del tema, badge, menú móvil, filtros, cookies y pagos. Escribe audit-out/probe.json.
   Uso: node .test/live-probe.mjs   (BASE=https://zenqalife.roadshop.online) */
import fsp from "node:fs/promises";
import path from "node:path";
const BASE = (process.env.BASE || "https://zenqalife.roadshop.online").replace(/\/$/, "");
const OUT = process.env.OUT || "audit-out";
await fsp.mkdir(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const UA_M = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";
const puppeteer = (await import("puppeteer")).default;
const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage", "--hide-scrollbars"] });
const out = {};
const guard = async (n, fn) => { try { out[n] = await fn(); } catch (e) { out[n] = { error: String(e.message || e) }; console.log("· sonda " + n + " falló: " + out[n].error); } };
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await page.setUserAgent(UA_M);
await page.setExtraHTTPHeaders({ "accept-language": "es-ES,es;q=0.9" });
const shot = (n) => page.screenshot({ path: path.join(OUT, "screens", "probe-" + n + ".jpg"), type: "jpeg", quality: 70 }).catch(() => {});

/* P1 · ¿el menú pegajoso tapa los títulos al saltar con las etiquetas? */
await page.goto(BASE + "/pages/tienda", { waitUntil: "networkidle2" }); await sleep(1300);
out.p1 = await page.evaluate(async () => {
  const medir = () => {
    const nav = document.querySelector(".nav"), shelf = document.querySelector("[class*=shelf],[class*=catnav],.chips");
    const n = nav ? nav.getBoundingClientRect() : null, s = shelf ? shelf.getBoundingClientRect() : null;
    return { navBottom: n ? Math.round(n.bottom) : null, shelfBottom: s ? Math.round(s.bottom) : null, shelfCls: shelf ? shelf.className : null, shelfHeight: s ? Math.round(s.height) : null };
  };
  const antes = medir();
  const chip = [...document.querySelectorAll('a[href*="#"]')].find((a) => /kits de preparación|kits/i.test(a.textContent || "") && a.closest("[class*=shelf],[class*=catnav],nav,.chips") === null ? false : /kits/i.test(a.textContent || ""));
  const destino = chip ? chip.getAttribute("href").split("#")[1] : null;
  if (chip) chip.click();
  await new Promise((r) => setTimeout(r, 1500));
  const el = destino ? document.getElementById(destino) : null;
  const r = el ? el.getBoundingClientRect() : null;
  const titulo = el ? el.querySelector("h2,h1") : null;
  const tr = titulo ? titulo.getBoundingClientRect() : null;
  return { antes, chip: chip ? { txt: chip.textContent.trim().slice(0, 30), href: chip.getAttribute("href") } : null, scroll: Math.round(window.scrollY), seccionTop: r ? Math.round(r.top) : null, tituloTop: tr ? Math.round(tr.top) : null, tapadoPor: medir() };
});
await shot("p1-ancla-etiqueta");

/* P2 · carrito del tema: badge, contenido del cajón y «Finalizar compra» */
await page.goto(BASE + "/pages/tienda", { waitUntil: "networkidle2" }); await sleep(1300);
out.p2 = {};
out.p2.add = await page.evaluate(() => { const b = document.querySelector('[data-act="add"][data-id="tote"]'); if (!b) return { ok: false }; const antes = document.querySelector("[data-cart-count]")?.textContent; b.scrollIntoView({ block: "center" }); b.click(); return { ok: true, badgeAntes: antes }; });
await sleep(1200);
out.p2.badgeDespues = await page.evaluate(() => ({ badge: document.querySelector("[data-cart-count]")?.textContent, hidden: document.querySelector("[data-cart-count]")?.hidden, ls: (() => { try { return localStorage.getItem("zenqa_cart"); } catch { return null; } })() }));
out.p2.abrirCajon = await page.evaluate(() => { document.querySelector('[data-act="cart"]')?.click(); return true; });
await sleep(900);
out.p2.cajon = await page.evaluate(() => { const c = document.querySelector("#cart"); return { open: c?.dataset.open, texto: (c?.innerText || "").replace(/\s+/g, " ").slice(0, 600), total: document.querySelector("#cartTotal")?.textContent, envio: document.querySelector("#shipMsg")?.innerText }; });
await shot("p2-carrito-tema");
out.p2.checkoutBtn = await page.evaluate(() => { const b = document.querySelector('[data-act="checkout"]'); if (!b) return { ok: false, n: document.querySelectorAll("#cart button").length }; b.click(); return { ok: true }; });
await sleep(3500);
out.p2.final = { url: page.url(), title: await page.title(), texto: (await page.evaluate(() => document.body.innerText)).replace(/\s+/g, " ").slice(0, 400) };
await shot("p2-checkout-tema");

/* P3 · /cart real con dos unidades: texto de envío gratis */
await page.goto(BASE + "/cart", { waitUntil: "networkidle2" }); await sleep(1200);
out.p3 = await page.evaluate(() => ({ texto: (document.querySelector("main")?.innerText || document.body.innerText).replace(/\s+/g, " ").slice(0, 500) }));
await shot("p3-carrito-shopify");

/* P4 · ficha de producto nativa: añadir + checkout (producto con stock) */
await page.goto(BASE + "/products/eco-tote-bag", { waitUntil: "networkidle2" }); await sleep(1500);
out.p4 = {};
out.p4.ficha = await page.evaluate(() => ({ h1: document.querySelector("h1")?.innerText, precio: (document.body.innerText.match(/[^\n]*€[^\n]*/g) || []).slice(0, 5), variantes: document.querySelectorAll('input[type=radio],select[name*=id],variant-selects').length, botones: [...document.querySelectorAll("button")].map((b) => b.innerText.trim()).filter(Boolean).slice(0, 12), descripcion: (document.querySelector('[class*=description],[class*=product-info]')?.innerText || "").replace(/\s+/g, " ").slice(0, 300) }));
await shot("p4-ficha-tote");

/* P5 · menú móvil: qué contiene y cómo se comporta */
await page.goto(BASE + "/", { waitUntil: "networkidle2" }); await sleep(1300);
out.p5 = {};
out.p5.abrir = await page.evaluate(() => { const b = document.querySelector('[data-act="menu"]'); if (!b) return { ok: false }; b.click(); return { ok: true }; });
await sleep(800);
out.p5.menu = await page.evaluate(() => { const m = document.querySelector("#menu"); return { open: m?.dataset.open, role: m?.getAttribute("role"), ariaModal: m?.getAttribute("aria-modal"), enlaces: [...(m?.querySelectorAll("a") || [])].map((a) => a.innerText.trim().slice(0, 30)), focoDentro: m?.contains(document.activeElement), inert: document.querySelectorAll("[inert]").length, btnCerrar: !!m?.querySelector('[data-act="close"]') }; });
await shot("p5-menu-movil");
out.p5.cerrarEsc = await page.keyboard.press("Escape").then(async () => { await sleep(500); return page.evaluate(() => document.querySelector("#menu")?.dataset.open); });

/* P6 · solape: ¿cuánto ocupa el chrome pegajoso y tapa contenido al cargar? */
await page.goto(BASE + "/pages/tienda", { waitUntil: "networkidle2" }); await sleep(1500);
out.p6 = await page.evaluate(() => {
  const alto = (sel) => { const e = document.querySelector(sel); return e ? Math.round(e.getBoundingClientRect().height) : null; };
  const nav = document.querySelector(".nav");
  const shelf = document.querySelector("[class*=shelf],[class*=catnav]");
  const prod = document.querySelector('[data-act="add"]')?.closest("article,li,.card,div");
  const r = prod?.getBoundingClientRect();
  const shelfR = shelf?.getBoundingClientRect();
  const tapado = [];
  for (const el of document.querySelectorAll('[data-act="add"],[data-act="qv"]')) {
    const b = el.getBoundingClientRect();
    if (shelfR && b.top < shelfR.bottom && b.bottom > shelfR.top) tapado.push({ txt: el.innerText.trim().slice(0, 12), top: Math.round(b.top) });
    if (nav && b.top < nav.getBoundingClientRect().bottom && b.bottom > nav.getBoundingClientRect().top) tapado.push({ txt: el.innerText.trim().slice(0, 12), bajoNav: true });
    if (tapado.length > 6) break;
  }
  return { alturaBanda: alto(".band"), alturaNav: alto(".nav"), alturaShelf: shelf ? Math.round(shelfR.height) : null, shelfCls: shelf?.className, scrollPadding: getComputedStyle(document.documentElement).scrollPaddingTop, chromeTotal: (alto(".band") || 0) + (alto(".nav") || 0) + (shelf ? Math.round(shelfR.height) : 0), botonesBajoElMenus: tapado, viewport: window.innerHeight };
});
/* ¿el cajón del carrito bloquea el fondo? */
out.p6b = await page.evaluate(() => ({ inertTrasAbrir: document.querySelectorAll("[inert]").length, ariaHidden: document.querySelectorAll('[aria-hidden="true"]').length }));

/* P7 · cookies y consentimiento */
{
  const p2 = await browser.newPage();
  await p2.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await p2.setUserAgent(UA_M);
  const cookies = [];
  p2.on("response", async (r) => { const sc = r.headers()["set-cookie"]; if (sc) cookies.push(...sc.split(/,(?=[^ ]+=)/).map((c) => c.split("=")[0].trim())); });
  await p2.goto(BASE + "/", { waitUntil: "networkidle2" }); await sleep(2500);
  await p2.evaluate(() => window.scrollTo(0, 2500)); await sleep(1500);
  out.p7 = await p2.evaluate(() => {
    const vis = (el) => { const r = el.getBoundingClientRect(), cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && +cs.opacity > 0.1; };
    const cand = [...document.querySelectorAll("body > *, body *")].filter((e) => vis(e) && /cookie|consentimiento|consent|acepto todas|rechazar/i.test(e.textContent || "") && (e.textContent || "").length < 400);
    const metas = [...document.querySelectorAll("meta")].filter((m) => m.httpEquiv).map((m) => m.outerHTML);
    return { banner: cand.slice(0, 3).map((e) => ({ sel: e.tagName + "." + String(e.className).slice(0, 40), txt: (e.textContent || "").replace(/\s+/g, " ").trim().slice(0, 200) })), metaRefresh: metas, cookiesJs: document.cookie.slice(0, 400), iframes: [...document.querySelectorAll("iframe")].map((f) => f.src.slice(0, 80)) };
  });
  out.p7.cookiesRespuesta = [...new Set(cookies)].slice(0, 20);
  await p2.screenshot({ path: path.join(OUT, "screens", "probe-p7-cookies.jpg"), type: "jpeg", quality: 70 });
  await p2.close();
}

/* P8 · buscador y filtros de la colección (widgets con texto raro, orden, «agotado») */
await page.goto(BASE + "/search?q=matcha", { waitUntil: "networkidle2" }); await sleep(1500);
out.p8 = {};
out.p8.search = await page.evaluate(() => ({ h1: document.querySelector("h1")?.innerText, titulo: document.title, resultados: document.querySelectorAll("[class*=product-card],[class*=card__],li[class*=grid]").length, agotado: (document.body.innerText.match(/Agotado/gi) || []).length, filtrosTexto: (document.body.innerText.match(/€\{\{[^}]*\}\}/g) || []).length }));
await page.goto(BASE + "/collections/all", { waitUntil: "networkidle2" }); await sleep(1500);
out.p8.collection = await page.evaluate(() => ({ articulos: (document.body.innerText.match(/\d+ artículos/gi) || [])[0], agotado: (document.body.innerText.match(/Agotado/gi) || []).length, filtroMoneda: (document.body.innerText.match(/€\{\{[^}]*\}\}/g) || []).length, ordenOpciones: [...document.querySelectorAll("select option")].map((o) => o.textContent.trim()).slice(0, 12), h1: document.querySelector("h1")?.innerText }));
out.p8.orden = await page.evaluate(async () => {
  const sel = [...document.querySelectorAll("select")].find((s) => [...s.options].some((o) => /precio, menor/i.test(o.textContent)));
  if (!sel) return { ok: false };
  sel.value = [...sel.options].find((o) => /precio, menor/i.test(o.textContent)).value;
  sel.dispatchEvent(new Event("change", { bubbles: true }));
  await new Promise((r) => setTimeout(r, 2500));
  return { ok: true, url: location.href, primeros: (document.body.innerText.match(/€\d+,\d\d/g) || []).slice(0, 6) };
});
await shot("p8-coleccion");

/* P9 · «Compró …» en móvil: ¿es clicable y abre la ficha? */
await page.goto(BASE + "/#opiniones", { waitUntil: "networkidle2" }); await sleep(1500);
out.p9 = await page.evaluate(async () => {
  const a = [...document.querySelectorAll("a")].find((x) => /^Compró/i.test((x.textContent || "").trim()));
  if (!a) return { ok: false };
  const r = a.getBoundingClientRect();
  a.scrollIntoView({ block: "center" });
  a.click();
  await new Promise((x) => setTimeout(x, 1200));
  return { ok: true, href: a.getAttribute("href"), alto: Math.round(r.height), text: a.textContent.trim().slice(0, 50), qvAbierto: document.querySelector("#qv")?.dataset.open, hash: location.hash };
});
await shot("p9-compro-click");

/* P10 · pagos: ¿los sellos del pie son imágenes reales o texto? */
await page.goto(BASE + "/", { waitUntil: "networkidle2" }); await sleep(1200);
out.p10 = await page.evaluate(() => {
  const el = [...document.querySelectorAll("body *")].find((e) => /VISA/.test(e.textContent || "") && (e.textContent || "").length < 200 && e.children.length > 0);
  return { html: el ? el.outerHTML.replace(/\s+/g, " ").slice(0, 700) : null, imagenesPago: document.querySelectorAll('img[src*=visa],img[src*=payment],svg[class*=payment]').length, alt: [...document.querySelectorAll("img")].map((i) => i.alt).filter((a) => /visa|master|paypal|bizum|klarna/i.test(a)) };
});

/* P11 · ¿cuántos productos muestra cada bloque y coinciden con la realidad? */
await page.goto(BASE + "/pages/tienda", { waitUntil: "networkidle2" }); await sleep(1500);
out.p11 = await page.evaluate(() => {
  const cont = [...document.querySelectorAll("h2")].map((h) => ({ t: h.innerText.trim(), n: h.closest("section,div")?.querySelectorAll("[data-act=add]").length }));
  return { bloques: cont, tarjetas: document.querySelectorAll("[data-act=add]").length, enlacesFicha: [...document.querySelectorAll("[data-act=qv]")].map((b) => b.dataset.id) };
});

await fsp.writeFile(path.join(OUT, "probe.json"), JSON.stringify(out, null, 2));
await browser.close().catch(() => {});
console.log(JSON.stringify(out, null, 1).slice(0, 6000));
