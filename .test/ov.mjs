/* Comprueba visual y geométricamente que los paneles no se pisan (el fallo de la v1). */
import puppeteer from "puppeteer";
import fs from "fs";
process.env.LD_LIBRARY_PATH = "/home/user/.local/chromelibs/usr/lib/x86_64-linux-gnu:" + (process.env.LD_LIBRARY_PATH || "");
const EXE = "/home/user/.cache/puppeteer/chrome/linux-148.0.7778.97/chrome-linux64/chrome";
const BASE = "http://127.0.0.1:8080/";
fs.mkdirSync("shots", { recursive: true });
const browser = await puppeteer.launch({ executablePath: EXE, args: ["--no-sandbox", "--disable-dev-shm-usage", "--hide-scrollbars"] });
const over = (a, b) => !(a.right <= b.left + 1 || b.right <= a.left + 1 || a.bottom <= b.top + 1 || b.bottom <= a.top + 1);

async function run(w, h, tag) {
  const page = await browser.newPage();
  const bad = [];
  page.on("pageerror", (e) => bad.push("pageerror: " + e.message));
  page.on("console", (m) => { if (m.type() === "error") bad.push("console: " + m.text()); });
  page.on("response", (r) => { if (r.status() >= 400) bad.push("HTTP " + r.status() + " " + r.url().replace(BASE, "")); });
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
  await page.goto(BASE + "index.html", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 700));

  const shot = async (n) => { await new Promise((r) => setTimeout(r, 480)); await page.screenshot({ path: `shots/ov-${tag}-${n}.png` }); };
  const boxes = () => page.evaluate(() => [...document.querySelectorAll('[data-open="true"] .x, [data-open="true"] .modal__x')]
    .map((b) => { const r = b.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, owner: b.closest("[data-open]").id }; }));
  const openCount = () => page.evaluate(() => document.querySelectorAll('[data-open="true"]').length);

  // 1) carrito con 2 artículos
  await page.click('[data-act="add"]'); await page.click('[data-act="add"]');
  await page.click('[data-act="cart"]'); await shot("cart");
  let n = await openCount(); if (n !== 1) bad.push("cart: hay " + n + " paneles abiertos");
  let xs = await boxes(); if (xs.some((a, i) => xs.some((b, j) => i !== j && over(a, b)))) bad.push("cart: × solapadas");

  // 2) el pie queda inert e mientras hay un panel: cerrar y abrir la guía
  await page.keyboard.press("Escape"); await new Promise((r) => setTimeout(r, 380));
  if (await openCount() !== 0) bad.push("el carrito no cierra con Escape");
  await page.$eval('.foot [data-act="lead"]', (el) => el.click()); await shot("lead");
  n = await openCount(); if (n !== 1) bad.push("lead: hay " + n + " paneles abiertos a la vez");
  if (await page.evaluate(() => document.getElementById("cart").dataset.open) === "true") bad.push("lead: el carrito sigue abierto debajo");
  xs = await boxes(); if (xs.length !== 1) bad.push("lead: " + xs.length + " botones × en la capa visible");
  // la × tiene que estar despegada: nada por encima de ella
  const hittable = await page.evaluate(() => { const b = document.querySelector('#leadModal [data-act="close"]'); const r = b.getBoundingClientRect();
    const e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return b.contains(e) || e === b; });
  if (!hittable) bad.push("lead: la × está tapada por otra capa");
  // las × de paneles distintos nunca se solapan (el fallo de la v1)
  const allX = await page.evaluate(() => [...document.querySelectorAll(".x")].filter((b) => b.offsetParent !== null)
    .map((b) => { const r = b.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom }; }));
  if (allX.some((a, i) => allX.some((b, j) => i !== j && !(a.r <= b.l + 1 || b.r <= a.l + 1 || a.b <= b.t + 1 || b.b <= a.t + 1)))) bad.push("hay dos × solapadas");

  // 3) cierre con Escape y estado del body
  await page.keyboard.press("Escape"); await new Promise((r) => setTimeout(r, 400));
  if (await openCount() !== 0) bad.push("Escape no cerró el panel");
  if (await page.evaluate(() => !!document.querySelector('.nav__cell.open'))) bad.push("quedó un flyout abierto");
  const locked = await page.evaluate(() => document.body.className);
  if (/lock|ov/.test(locked)) bad.push("body se quedó bloqueado: '" + locked + "'");

  // 4) buscador + ficha rápida
  await page.click('[data-act="search"]'); await page.type("#q", "kit"); await new Promise((r) => setTimeout(r, 250));
  await page.click("#sres a"); await shot("qv");
  n = await openCount(); if (n !== 1) bad.push("qv: " + n + " paneles");
  const qvHas = await page.evaluate(() => /Añadir al carrito/.test(document.getElementById("qv").textContent));
  if (!qvHas) bad.push("qv: sin botón de añadir");

  // 5) menú móvil (solo en ancho pequeño) y hover del flyout (solo ancho grande)
  if (w < 900) {
    await page.keyboard.press("Escape"); await new Promise((r) => setTimeout(r, 300));
    await page.click('[data-act="menu"]'); await shot("menu");
    if (await openCount() !== 1) bad.push("menu: paneles " + await openCount());
  } else {
    // cerrar la ficha rápida: con un diálogo abierto la página de detrás está inerte a propósito
    await page.keyboard.press("Escape"); await new Promise((r) => setTimeout(r, 380));
    if (await openCount() !== 0) bad.push("qv: Escape no cierra la ficha rápida");
    const db = await (await page.$("[data-drop]")).boundingBox();
    await page.mouse.move(0, 0); await page.mouse.move(db.x + db.width / 2, db.y + db.height / 2, { steps: 10 });
    await new Promise((r) => setTimeout(r, 320));
    // que el panel sea visible Y que el puntero pueda aterrizar dentro (lo que impedía entrar en la v1)
    const vis = await page.evaluate(() => {
      const cell = document.querySelector(".nav__drop").closest(".nav__cell");
      const d = cell.querySelector(".nav__drop"), a = cell.querySelector(".nav__drop a");
      const cs = getComputedStyle(d), r = d.getBoundingClientRect(), ar = a.getBoundingClientRect();
      const hit = document.elementFromPoint(ar.left + ar.width / 2, ar.top + ar.height / 2);
      return { op: cs.opacity, vp: cs.visibility, h: r.height, links: cell.querySelectorAll(".nav__drop a").length,
        linkHit: a.contains(hit) || hit === a, gap: r.top - cell.getBoundingClientRect().bottom };
    });
    if (+vis.op < 1 || vis.vp !== "visible") bad.push("flyout: invisible al pasar el ratón (opacity " + vis.op + ", " + vis.vp + ")");
    if (vis.links < 4) bad.push("flyout: " + vis.links + " enlaces");
    if (!vis.linkHit) bad.push("flyout: el puntero no llega a los enlaces (otro elemento encima)");
    if (vis.gap > 9) bad.push("flyout: hueco de " + vis.gap + "px entre el botón y el panel (se cierra al cruzar)");
    const lb = await (await page.$(".nav__drop a")).boundingBox();
    await page.mouse.move(lb.x + lb.width / 2, lb.y + lb.height / 2, { steps: 10 }); await new Promise((r) => setTimeout(r, 320));
    const stay = await page.evaluate(() => getComputedStyle(document.querySelector(".nav__cell .nav__drop")).opacity);
    if (+stay < 1) bad.push("flyout: se cierra al meter el ratón dentro");
    await shot("flyout");
    await page.mouse.move(db.x + db.width / 2, 400, { steps: 10 }); await new Promise((r) => setTimeout(r, 350));
    if (await page.evaluate(() => getComputedStyle(document.querySelector(".nav__cell .nav__drop")).opacity) > 0.1) bad.push("flyout: no se cierra al salir");
  }
  await page.close();
  console.log(`${tag} ${w}x${h}: ${bad.length ? "PROBLEMAS\n  ! " + [...new Set(bad)].join("\n  ! ") : "sin solapamientos ni errores"}`);
  return bad.length;
}
let f = 0;
f += await run(390, 844, "m");
f += await run(1440, 900, "d");
await browser.close();
process.exit(f ? 1 : 0);
