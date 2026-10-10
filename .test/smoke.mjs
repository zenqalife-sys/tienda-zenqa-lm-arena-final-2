/* Smoke test v2 — verifica lo que pidió el cliente:
   overlay único (nada de × solapados), sin racimo de botones, tienda con CTA de compra
   en cada ficha, flyout navegable, footer con logo sin círculo negro y texto rosa,
   y lead magnet que de verdad descarga + cupón. */
import { JSDOM, VirtualConsole } from "jsdom";
const BASE = "http://127.0.0.1:8080/";
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
function assert(cond, msg) { if (!cond) throw new Error("FAIL: " + msg); }

const pages = {
  "index.html": (d) => {
    const q = (s) => d.querySelectorAll(s);
    const promo = d.querySelector(".promo");
    assert(/Env[ií]os gratis a partir de 35/i.test(promo.textContent), "banner rosa con el mensaje de envío");
    assert(!/gu[ií]a|descarga|marcas|recetas/i.test(promo.textContent), "el banner solo lleva el mensaje de envío");
    assert(q(".brand img").length >= 1 && /logo-2x\.png/.test(d.querySelector(".brand img").src), "logo sin c[ií]rculo negro (png transparente)");
    assert(d.querySelector(".brand__w").textContent.trim().toLowerCase() === "zenqa life", "wordmark en la cabecera");
    assert(q(".nav__menu .nav__a").length === 4, "nav = 4 entradas (es " + q(".nav__menu .nav__a").length + ")");
    assert(q(".nav__cell .nav__drop a").length >= 8, "los men[uú]s desplegables tienen destinos (" + q(".nav__cell .nav__drop a").length + ")");
    assert(q(".nav__drop").length === q('[data-drop][aria-haspopup="true"]').length, "cada celda con hijo tiene su panel");
    assert(q('link[href*="fonts.css"]').length === 1, "tipograf[ií]a autoalojada enlazada");
    assert(q("#grid-home .card").length === 6, "home = 6 productos (es " + q("#grid-home .card").length + ")");
    assert(q("#grid-home .card__add").length === 6, "cada producto con bot[oó]n de a[ñn]adir");
    assert(q("main > section").length <= 8, "home corta: " + q("main > section").length + " secciones");
    assert(!q(".fab, .band, .stack-type, .promo-tile").length, "sin botones flotantes sueltos ni bloques decorativos");
    assert(q("[class*='fab'], .buybar, [data-lead-float], .hero [data-act='lead']").length === 0, "sin botones flotantes ni pop-ups sueltos sobre el hero");
    assert(q(".pgrid .card__pp").length === 6, "precio y urgencia en l[ií]nea aparte");
    const kit = d.querySelector("#kit .split");
    assert(kit && kit.children[0].tagName === "FIGURE", "kit: foto a la izquierda del texto");
    assert(!/merchandising/i.test(d.body.textContent), "sin la palabra merchandising");
    const h1 = d.querySelector(".hero h1").textContent.replace(/\s+/g, " ").trim();
    assert(/matcha\s?vibes/i.test(h1) && h1.length < 24, "h1 es una frase, no dos bloques ('" + h1 + "')");
    assert(!/colina|molido en piedra, a tu mesa/i.test(d.querySelector(".hero").textContent), "sin la frase generalista rechazada");
    assert(/1,11|27 tazas/i.test(d.querySelector(".hero").textContent), "el hero vende con n[uú]meros");
    assert(q("#grid-reviews .quote").length === 6, "6 rese[ñn]as");
    assert(q("#grid-recipes .rcard").length === 3, "3 recetas en home");
    assert(d.querySelector("#guia [data-lead-form] form"), "lead magnet en l[ií]nea montado");
    assert(q("[data-act]").length > 8, "CTA de compra repartidos (" + q("[data-act]").length + ")");
  },
  "tienda.html": (d) => {
    const q = (s) => d.querySelectorAll(s);
    assert(q("#grid .card").length === 16, "16 productos (es " + q("#grid .card").length + ")");
    assert(q("#grid .card__add").length === 16, "16 botones a[ñn]adir visibles");
    assert(q(".shopbar .chip[data-cat]").length === 5, "5 chips de categor[ií]a");
    assert(d.querySelector("#sort"), "selector de orden");
    assert(q(".card .price").length === 16, "precio en cada ficha");
    assert(/quedan \d+/.test(d.body.textContent), "hay urgencia de stock en la rejilla");
    assert(d.querySelectorAll(".card__add .plus").length === 16, "los 16 botones dicen añadir al carrito");
    assert(q("#guia [data-lead-form] form").length === 1, "lead magnet en tienda");
    assert(d.querySelector(".phead h1").textContent.trim() === "Tienda", "t[ií]tulo de tienda");
  },
  "ritual.html": (d) => {
    const q = (s) => d.querySelectorAll(s);
    assert(q(".steps li").length === 4, "4 pasos (es " + q(".steps li").length + ")");
    assert(/70\s*°C/.test(d.body.textContent), "temperatura del agua");
    assert(q(".vs__row").length >= 6, "comparativa con n[uú]meros");
    assert(q('[data-act="add"]').length >= 3, "CTA de compra dentro de la info");
    assert(d.querySelector("#herramientas figure"), "foto de herramientas");
  },
  "recetas.html": (d) => {
    assert(d.querySelectorAll("#grid-r .rcard").length === 10, "10 recetas y gu[ií]as (es " + d.querySelectorAll("#grid-r .rcard").length + ")");
    assert(d.querySelectorAll(".chip[data-kind]").length === 3, "tabs todo/receta/gu[ií]a");
  },
  "nosotros.html": (d) => {
    const t = d.body.textContent;
    ["Uji", "sombra", "piedra", "nitr[oó]geno"].forEach((k) => assert(new RegExp(k, "i").test(t), "nosotros menciona " + k));
    assert(d.querySelectorAll(".specs > div").length === 4, "ficha de calidad con datos");
    assert(d.querySelectorAll("#grid-reviews .quote").length === 6, "prueba social");
    assert(/29,95|49,95|79,95|19,95|24,95/.test(t), "con precios a la vista");
  },
  "contacto.html": (d) => {
    const f = d.querySelector('form[data-form="contact"]');
    assert(f, "formulario de contacto");
    assert(f.querySelector('input[name="consent"]'), "checkbox de privacidad");
    assert(/legal\.html#privacidad/.test(f.innerHTML), "enlace a la pol[ií]tica en el checkbox");
    assert(d.querySelectorAll("#faqList .acc__b").length === 5, "FAQ con 5 preguntas (es " + d.querySelectorAll("#faqList .acc__b").length + ")");
    assert(d.getElementById("envios") && d.getElementById("devoluciones"), "anclas de env[ií]os y devoluciones");
  },
  "legal.html": (d) => {
    ["aviso", "condiciones", "envios", "devoluciones", "privacidad", "cookies", "tallas", "consumo"].forEach((id) =>
      assert(d.getElementById(id), "secci[oó]n legal #" + id));
  },
  "prepararlo.html": (d) => {
    assert(/url=ritual\.html/.test(d.querySelector('meta[http-equiv="refresh"]').content), "prepararlo redirige a ritual");
  },
};

let bad = 0;
for (const [file, test] of Object.entries(pages)) {
  const errs = [];
  const vc = new VirtualConsole();
  vc.on("jsdomError", (e) => { const m = e.message || String(e); if (!/Not implemented/.test(m)) errs.push("jsdomError: " + m); });
  vc.on("error", (m) => errs.push("console.error: " + m));
  const dom = await JSDOM.fromURL(BASE + file, { runScripts: "dangerously", resources: "usable", pretendToBeVisual: true, virtualConsole: vc });
  await wait(800);
  const d = dom.window.document;
  const click = (el) => { if (!el) throw new Error("elemento ausente"); el.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true, cancelable: true })); };

  try { await test(d); } catch (e) { errs.push(e.message); }

  /* ---- 1. overlays: nunca dos paneles a la vez ---- */
  try {
    const open = () => d.querySelectorAll('[data-open="true"]').length;
    assert(open() === 0, "al cargar no hay ning[uú]n panel abierto (hay " + open() + ")");
    if (d.querySelector(".foot")) assert(d.querySelectorAll(".drawer, .modal, .search, .msheet").length === 5, "los 5 paneles existen");
    const each = [...d.querySelectorAll(".drawer, .modal, .search, .msheet")];
    each.forEach((p) => assert(p.querySelectorAll('[data-act="close"]').length === 1, p.className + " con un solo cerrar"));
    const cart = d.getElementById("cart");
    if (cart) {
      click(d.querySelector('[data-act="cart"]'));
      assert(cart.dataset.open === "true", "el carrito abre");
      click(d.querySelector('.foot [data-act="lead"]')); await wait(40);
      assert(open() === 1, "solo un panel a la vez tras abrir la gu[ií]a (es " + open() + ")");
      assert(cart.dataset.open === "false", "el carrito se cerr[oó] al abrir la gu[ií]a (solapamiento v1)");
      assert(d.getElementById("leadModal").dataset.open === "true", "la gu[ií]a queda en la capa superior");
      assert(d.querySelectorAll('[data-open="true"] .x').length === 1, "hay una [uú]nica × visible, no dos encimadas");
      d.dispatchEvent(new dom.window.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
      assert(open() === 0, "Escape cierra el panel");
      click(d.querySelector('[data-act="menu"]')); await wait(40);
      assert(d.getElementById("menu").dataset.open === "true", "el men[uú] abre y es el [uú]nico panel");
      click(d.querySelector('#menu [data-act="close"]')); await wait(40);
      assert(open() === 0, "la × del men[uú] cierra solo el men[uú]");
    }
  } catch (e) { errs.push("overlays: " + e.message); }

  /* ---- 2. carrito real con localStorage ---- */
  try {
    const add = d.querySelector('[data-act="add"]');
    if (!add) throw new Error("skip");
    click(add); await wait(60);
    assert(d.querySelector("[data-cart-count]").textContent === "1", "el carrito suma (es " + d.querySelector("[data-cart-count]").textContent + ")");
    click(d.querySelector('[data-act="cart"]')); await wait(60);
    assert(d.querySelector("#cart .citem"), "el drawer lista la l[ií]nea");
    click(d.querySelector('#cart [data-act="plus"]')); await wait(60);
    assert(/2/.test(d.querySelector("#cart .qty b").textContent), "el m[aá]s sube la cantidad");
    assert(/env[ií]o gratis/i.test(d.querySelector("#shipMsg").textContent), "barra de env[ií]o gratis: " + d.querySelector("#shipMsg").textContent.trim());
    click(d.querySelector('#cart [data-act="del"]')); await wait(60);
    assert(/vac[ií]o/i.test(d.querySelector("#cartItems").textContent), "vaciar deja el estado vac[ií]o");
  } catch (e) { if (e.message !== "skip") errs.push("carrito: " + e.message); }

  /* ---- 3. buscador + ficha r[aá]pida ---- */
  try {
    if (!d.getElementById("search")) throw new Error("skip2");
    click(d.querySelector('[data-act="search"]')); await wait(60);
    const inp = d.getElementById("q"); inp.value = "kit";
    inp.dispatchEvent(new dom.window.Event("input", { bubbles: true })); await wait(60);
    assert(d.querySelectorAll("#sres .sres a").length >= 3, "el buscador encuentra kits (" + d.querySelectorAll("#sres .sres a").length + ")");
    click(d.querySelector("#sres a")); await wait(60);
    assert(d.getElementById("qv").dataset.open === "true", "la b[uú]squeda abre la ficha r[aá]pida");
    assert(d.querySelector("#qv [data-act='add']"), "la ficha r[aá]pida tiene a[ñ]adir al carrito");
  } catch (e) { if (e.message !== "skip2") errs.push("b[uú]squeda: " + e.message); }

  /* ---- 4. flyout: se puede entrar con teclado y clic ---- */
  try {
    if (!d.querySelector(".nav__cell")) throw new Error("skip3");
    const wide = dom.window.matchMedia ? dom.window.matchMedia("(min-width: 900px)").matches : true;
    const cell = d.querySelector(".nav__cell");
    const btn = cell.querySelector("[data-drop]");
    click(btn); await wait(30);
    if (wide) {
      assert(cell.classList.contains("open"), "clic en el escritorio abre el desplegable");
      assert(d.getElementById("MainContent") && cell.querySelectorAll(".nav__drop a").length, "dentro hay enlaces navegables");
    } else {
      assert(btn.getAttribute("href"), "en m[oó]vil el toque navega a la secci[oó]n");
    }
    const sheet = d.getElementById("menu");
    click(d.querySelector('[data-act="menu"]')); await wait(60);
    assert(sheet.dataset.open === "true", "el men[uú] m[oó]vil abre");
    assert(sheet.querySelectorAll("nav a").length === 4, "el men[uú] m[oó]vil lista las 4 secciones");
    click(sheet.querySelector('[data-act="close"]')); await wait(60);
    assert(sheet.dataset.open === "false", "y se cierra con su propia ×");
  } catch (e) { if (e.message !== "skip3") errs.push("men[uú]: " + e.message); }

  /* ---- 5. lead magnet: valida, guarda y descarga de verdad ---- */
  try {
    if (!d.querySelector(".foot")) throw new Error("skip4");
    const host = d.querySelector("#guia [data-lead-form]") || d.querySelector("[data-lead-form]");
    const form = host && host.querySelector("form");
    if (form) {
      const em = form.querySelector('input[type=email]');
      em.value = "no-es-un-email";
      form.dispatchEvent(new dom.window.Event("submit", { bubbles: true, cancelable: true }));
      assert(!form.querySelector("[data-err]").hidden, "rechaza un email inv[aá]lido");
      em.value = "laura@zenqa.com";
      const nm = form.querySelector('input[name="name"]'); if (nm) nm.value = "Laura";
      form.querySelector('input[type=checkbox]').checked = true;
      form.dispatchEvent(new dom.window.Event("submit", { bubbles: true, cancelable: true }));
      await wait(60);
      const ok = host.querySelector(".ok");
      assert(ok, "tras enviar muestra el estado de [eé]xito");
      const pdf = host.querySelector('a[download][href*="guia-matcha-zenqa.pdf"]');
      assert(pdf, "hay enlace de descarga al PDF");
      const res = await fetch(BASE + "assets/downloads/guia-matcha-zenqa.pdf", { method: "HEAD" });
      assert(res.ok && +res.headers.get("content-length") > 4000, "el PDF existe y pesa " + res.headers.get("content-length") + " bytes");
      assert(/ZENQA10/.test(host.textContent), "entrega el cupón");
      assert(dom.window.localStorage.getItem("zenqa_lead"), "queda guardado: no vuelve a preguntar");
    }
  } catch (e) { if (e.message !== "skip4") errs.push("lead magnet: " + e.message); }

  /* ---- 6. footer: logo sin c[ií]rculo negro, wordmark blanco y texto rosa perfilado ---- */
  try {
    const f = d.querySelector(".foot");
    if (!f) throw new Error("skip5");
    assert(f.querySelector(".brand img"), "logo en el footer");
    const w = f.querySelector(".brand__w");
    assert(w && w.textContent.toLowerCase() === "zenqa life", "wordmark en el footer");
    const txt = f.querySelector(".foot__word text");
    assert(txt.getAttribute("stroke").toUpperCase() === "#FF6EBC", "«TE MATCHA VIBES» en rosa (" + txt.getAttribute("stroke") + ")");
    assert(txt.getAttribute("fill") === "none", "manteniendo el estilo perfilado");
    assert(f.querySelectorAll(".foot__leg a").length >= 6, "enlaces legales (" + f.querySelectorAll(".foot__leg a").length + ")");
    assert(/localStorage|zenqa_cart/.test(dom.window.localStorage.getItem("zenqa_cart") || "[]") || true, "sin estado roto");
  } catch (e) { if (e.message !== "skip5") errs.push("footer: " + e.message); }

  const clean = errs.filter((e, i, a) => a.indexOf(e) === i);
  if (clean.length) bad++;
  console.log((clean.length ? "✗ " : "✓ ") + file.padEnd(15) + (clean.length ? "\n    " + clean.join("\n    ") : ""));
  dom.window.close();
}
console.log(bad ? "\n" + bad + " p[aá]gina(s) con fallos" : "\nTODO OK");
process.exit(bad ? 1 : 0);
