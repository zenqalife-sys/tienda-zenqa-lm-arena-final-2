/* Comprobación de la v3: la tienda tiene que seguir funcionando (capas, carrito, buscador,
   flyout, imán de leads) y el contenido tiene que tener cuerpo real por página. */
import { JSDOM, VirtualConsole } from "jsdom";
import vm from "node:vm";
import fs from "fs";
import path from "path";

const BASE = "http://127.0.0.1:8080/";
const ROOT = path.resolve(import.meta.dirname, "..");
const sb = { window: {} }; vm.createContext(sb);
fs.readFileSync(path.join(ROOT, "assets/js/data.js"), "utf8");
vm.runInContext(fs.readFileSync(path.join(ROOT, "assets/js/data.js"), "utf8"), sb);
const D = sb.window.ZENQA;

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
function assert(cond, msg) { if (!cond) throw new Error("FAIL: " + msg); }
const len = (t) => (t || "").replace(/\s+/g, " ").trim().length;

/* ---- exigencias de contenido, comprobadas sobre los datos ---- */
const content = {
  productos: D.products.length === 16,
  pitchLargo: D.products.every((p) => len(p.pitch) > 180),
  hookTarjeta: D.products.every((p) => len(p.hook) > 45 && len(p.hook) < 160),
  notas: D.products.every((p) => Object.keys(p.notes).length >= 4),
  chips: D.products.every((p) => p.benefits.length >= 3),
  argumentos: D.products.every((p) => p.bullets.length === 3 && p.bullets.every((b) => len(b) > 44) && p.bullets.filter((b) => /[0-9]/.test(b)).length >= 2),
  recetas: D.recipes.length === 10 && D.recipes.every((r) => len(r.why) > 100 && r.steps.length === 4 && r.steps.every((s) => len(s.d) > 55) && r.steps.filter((s) => len(s.d) > 90).length >= 2),
  resenas: D.reviews.length === 7 && D.reviews.every((r) => len(r.txt) > 180),
  faq: D.faq.length === 6 && D.faq.every((f) => len(f.a) > 180),
  comparativa: D.compare.rows.length === 7,
  manifiesto: len(D.manifesto.body) > 240 && D.manifesto.stats.length === 3,
  grados: D.grades.length === 3 && D.grades.every((g) => len(g.body) > 120),
  plazos: D.timeline.length === 3,
};
console.log("datos base: " + Object.entries(content).filter(([, v]) => v).length + "/" + Object.keys(content).length + " cumplen");
const dataFails = Object.entries(content).filter(([, v]) => !v).map(([k]) => k);

const pages = {
  "index.html": (d) => {
    const q = (s) => d.querySelectorAll(s);
    const promo = d.querySelector(".promo");
    assert(/Env[ií]os gratis a partir de 35/i.test(promo.textContent), "banner rosa con el mensaje de envío");
    assert(!/gu[ií]a|descarga|recetas|marcas/i.test(promo.textContent), "el banner solo lleva el mensaje de envío");
    assert(/logo-2x\.png/.test(d.querySelector(".brand img").src), "logo sin círculo negro (png transparente)");
    assert(q(".nav__menu .nav__a").length === 4, "nav = 4 entradas");
    assert(q(".nav__cell .nav__drop a").length >= 8, "los desplegables tienen destinos");
    assert(q('link[href*="fonts.css"]').length === 1, "tipografía autoalojada enlazada");
    // estructura de tienda
    assert(q("#grid-home .card").length === 6, "6 productos destacados (es " + q("#grid-home .card").length + ")");
    assert(q("#grid-home .card__add").length === 6, "seis botones de añadir");
    assert(q("#grid-home .card__hook").length === 6, "seis ganchos de copy en las fichas");
    assert(q("#grid-home .bchips span").length >= 12, "chips de beneficio en las fichas");
    assert(q("#grid-home .card__more").length === 6, "acceso a la explicación desde cada ficha");
    assert(q("main > section").length <= 13, "home ordenada: " + q("main > section").length + " secciones");
    assert(!q(".fab, .band, .stack-type, .promo-tile, .buybar").length, "sin botones flotantes ni bloques decorativos");
    const kit = d.querySelector("#kit .edit");
    assert(kit && kit.children[0].tagName === "FIGURE", "kit: foto a la izquierda del texto");
    assert(!/merchandising/i.test(d.body.textContent), "sin la palabra merchandising");
    const h1 = d.querySelector(".hero h1").textContent.replace(/\s+/g, " ").trim();
    assert(/matcha\s?vibes/i.test(h1) && h1.length < 24, "h1 es una frase ('" + h1 + "')");
    assert(!/colina|molido en piedra, a tu mesa/i.test(d.body.textContent), "sin la frase generalista rechazada");
    // cuerpo del texto
    const heroTxt = d.querySelector(".hero p").textContent;
    assert(len(heroTxt) > 180, "el hero explica algo (es " + len(heroTxt) + " car.)");
    assert(/1,11|27/.test(d.querySelector(".hero").textContent), "el hero da los números");
    assert(q("#marca .lede--big").length === 1 && len(q("#marca .lede--big")[0].textContent) > 240, "manifiesto escrito");
    assert(q("#stats .stats__i").length === 3 && q("#stats .src").length === 1, "prueba social con fuente");
    assert(q("#grades .grade").length === 3, "los tres grados explicados (es " + q("#grades .grade").length + ")");
    assert(q("#grades .grade button[data-act='add']").length === 3, "cada grado se puede añadir desde ahí");
    assert(q("#cmpTable .cmp__r").length === 7, "comparativa con 7 criterios");
    assert(q("#cmpTable .cmp__r .cmp__c--m").length === 7, "columna de matcha resaltada en la tabla");
    assert(q("#cmpTable .cmpmob__c").length === 3, "rail de comparación para móvil");
    assert([...q("#cmpTable .cmpmob__c div span")].every((x) => len(x.textContent) > 20), "el rail móvil trae frases, no solo iconos");
    assert(q("#timeline .tl__i").length === 3, "tres plazos de efecto");
    assert(q("#origen .edit__t p").length >= 3 && len(q("#origen .edit__t p")[1].textContent) > 200, "origen explicado en párrafos");
    assert(q("#origen .specs > div").length === 4, "datos del lote");
    assert(q("#ritual .why__i").length === 4 && len(d.querySelector("#ritual .why__i p").textContent) > 120, "los 4 pasos con explicación");
    assert(/70\s*°C/.test(d.body.textContent), "temperatura del agua en la home");
    assert(q("#resenas .quote--lg").length === 7, "siete reseñas largas (es " + q("#resenas .quote").length + ")");
    assert(q("#resenas .quote .card__more").length === 7, "cada reseña enlaza con lo que compraron");
    assert(q("#grid-recipes .rcard").length === 3 && q("#grid-recipes .rcard .note").length === 3, "recetas con su porqué");
    assert(d.querySelector("#guia [data-lead-form] form"), "lead magnet en línea montado");
    assert(q("[data-act]").length >= 16, "CTA de compra repartidos (" + q("[data-act]").length + ")");
  },
  "tienda.html": (d) => {
    const q = (s) => d.querySelectorAll(s);
    assert(q("#grid .card").length === 16, "16 productos (es " + q("#grid .card").length + ")");
    assert(q("#grid .card__add").length === 16, "16 botones de añadir visibles");
    assert(q("#grid .card__hook").length === 16, "16 textos de venta");
    assert(q(".shopbar .chip[data-cat]").length === 5, "5 chips de categoría");
    assert(d.querySelector("#sort"), "selector de orden");
    assert(/quedan \d+/.test(d.body.textContent), "urgencia de stock real en la rejilla");
    assert(q("#guia-grados .why__i").length === 3 && len(d.querySelector("#guia-grados .why__i p").textContent) > 130, "guía rápida de compra con argumento");
    assert(q("#grid-kit .card").length === 3, "los 3 kits en su bloque");
    assert(q("#envios .edit__t p").length >= 3, "condiciones de compra escritas en la tienda");
    assert(q("#guia [data-lead-form] form").length === 1, "lead magnet en tienda");
    assert(d.querySelector(".phead h1").textContent.trim() === "Tienda", "título de tienda");
  },
  "ritual.html": (d) => {
    const q = (s) => d.querySelectorAll(s);
    assert(q("#pasos .rsteps__i").length === 4, "4 pasos (es " + q("#pasos .rsteps__i").length + ")");
    assert([...q("#pasos .rsteps__i span > span")].every((p) => len(p.textContent) > 140), "cada paso explicado, no enunciado");
    assert(q("#errores .grade").length === 3, "tres errores típicos con arreglo");
    assert(q("#herramientas .kit__list li").length === 4 && /Chawan|Chasen|Chashaku|Tamizador/.test(d.querySelector("#herramientas").textContent), "las cuatro piezas con precio");
    assert(q("#grados .grade").length === 3, "grados explicados con ancla propia (#grados)");
    assert(q("#guardar .why__i").length === 3, "conservación en tres ideas");
    assert(/70\s*°C|70 °C/.test(d.body.textContent), "temperatura concreta");
    assert(q('[data-act="add"], [data-act="qv"], .btn[href*="tienda"]').length >= 6, "la página de teoría también vende");
  },
  "recetas.html": (d) => {
    assert(d.querySelectorAll("#grid-r .rcard").length === 10, "10 recetas y guías (es " + d.querySelectorAll("#grid-r .rcard").length + ")");
    assert(d.querySelectorAll(".chip[data-kind]").length === 3, "tabs todo/receta/guía");
    assert(d.querySelectorAll("#recetas-consejos .why__i, .sec--mint .why__i").length === 4, "consejos antes de ponerse");
    assert(d.querySelectorAll('button[data-act="add"]').length >= 1, "la página de recetas vende el bote");
  },
  "nosotros.html": (d) => {
    const q = (s) => d.querySelectorAll(s);
    const t = d.body.textContent;
    ["Uji", "sombra", "tencha", "nitr", "pesticidas", "lote"].forEach((k) => assert(new RegExp(k, "i").test(t), "nosotros menciona " + k));
    assert(q("#origen .edit__t p, .sec .edit__t p").length >= 3, "la historia va en párrafos");
    assert(q(".rsteps__i").length === 6, "seis pasos de selección (es " + q(".rsteps__i").length + ")");
    assert(q("#marca .why__i, .sec .why__i").length >= 3, "lo que no hacemos");
    assert(q("#grid-reviews .quote").length === 7, "prueba social larga");
    assert(q("#grid-nos .card").length === 2, "dos fichas de producto en la página de marca");
    assert(/29,95|49,95|79,95|24,95/.test(t), "con precios a la vista");
  },
  "contacto.html": (d) => {
    const f = d.querySelector('form[data-form="contact"]');
    assert(f, "formulario de contacto");
    assert(f.querySelector("select"), "el formulario pide el motivo");
    assert(f.querySelector('input[name="consent"]'), "checkbox de privacidad");
    assert(/legal\.html#privacidad/.test(f.innerHTML), "enlace a la política en el checkbox");
    assert(d.querySelectorAll("#faqList .acc__b").length === 6, "FAQ con 6 respuestas (es " + d.querySelectorAll("#faqList .acc__b").length + ")");
    assert([...d.querySelectorAll("#faqList .acc__p p")].every((p) => len(p.textContent) > 150), "cada respuesta de FAQ tiene sustancia");
    assert(d.getElementById("envios") && d.getElementById("devoluciones"), "anclas de envíos y devoluciones");
    assert(d.querySelectorAll(".kit__list li").length === 10, "diez líneas de condiciones");
  },
  "legal.html": (d) => {
    ["aviso", "condiciones", "envios", "devoluciones", "privacidad", "cookies", "tallas", "consumo"].forEach((id) =>
      assert(d.getElementById(id), "sección legal #" + id));
    assert(/demo de demostraci|de demostración/.test(d.body.textContent), "avisa de que es una demo");
  },
  "prepararlo.html": (d) => {
    assert(/url=ritual\.html/.test(d.querySelector('meta[http-equiv="refresh"]').content), "prepararlo redirige a ritual");
  },
};

let bad = dataFails.length ? 1 : 0;
if (dataFails.length) console.log("  ! datos: " + dataFails.join(", "));
for (const [file, test] of Object.entries(pages)) {
  const errs = [];
  const vc = new VirtualConsole();
  vc.on("jsdomError", (e) => { const m = e.message || String(e); if (!/Not implemented/.test(m)) errs.push("jsdomError: " + m); });
  vc.on("error", (m) => errs.push("console.error: " + m));
  const dom = await JSDOM.fromURL(BASE + file, { runScripts: "dangerously", resources: "usable", pretendToBeVisual: true, virtualConsole: vc });
  await wait(850);
  const d = dom.window.document;
  const click = (el) => { if (!el) throw new Error("elemento ausente"); el.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true, cancelable: true })); };

  try { await test(d); } catch (e) { errs.push(e.message); }

  /* ---- 1. overlays: un solo panel a la vez ---- */
  try {
    const open = () => d.querySelectorAll('[data-open="true"]').length;
    assert(open() === 0, "al cargar no hay ningún panel abierto (hay " + open() + ")");
    if (d.querySelector(".foot")) {
      assert(d.querySelectorAll(".drawer, .modal, .search, .msheet").length === 5, "los 5 paneles existen");
      [...d.querySelectorAll(".drawer, .modal, .search, .msheet")].forEach((p) =>
        assert(p.querySelectorAll('[data-act="close"]').length === 1, p.className + " con un solo cerrar"));
      const cart = d.getElementById("cart");
      click(d.querySelector('[data-act="cart"]'));
      assert(cart.dataset.open === "true", "el carrito abre");
      click(d.querySelector('.foot [data-act="lead"]')); await wait(40);
      assert(open() === 1, "solo un panel a la vez tras abrir la guía (es " + open() + ")");
      assert(cart.dataset.open === "false", "el carrito se cerró al abrir la guía (solapamiento v1)");
      assert(d.getElementById("leadModal").dataset.open === "true", "la guía queda en la capa superior");
      assert(d.querySelectorAll('[data-open="true"] .x').length === 1, "hay una única × visible, no dos encimadas");
      d.dispatchEvent(new dom.window.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
      assert(open() === 0, "Escape cierra el panel");
      assert(!/lock/.test(d.body.className), "el body se desbloquea al cerrar");
      click(d.querySelector('[data-act="menu"]')); await wait(40);
      assert(d.getElementById("menu").dataset.open === "true", "el menú abre como único panel");
      click(d.querySelector('#menu [data-act="close"]')); await wait(40);
      assert(open() === 0, "la × del menú cierra solo el menú");
    }
  } catch (e) { errs.push("overlays: " + e.message); }

  /* ---- 2. carrito ---- */
  try {
    const add = d.querySelector('[data-act="add"]');
    if (!add) throw new Error("skip");
    click(add); await wait(60);
    assert(d.querySelector("[data-cart-count]").textContent === "1", "el carrito suma");
    click(d.querySelector('[data-act="cart"]')); await wait(60);
    assert(d.querySelector("#cart .citem"), "el drawer lista la línea");
    click(d.querySelector('#cart [data-act="plus"]')); await wait(60);
    assert(/2/.test(d.querySelector("#cart .qty b").textContent), "el + sube la cantidad");
    assert(/envío gratis/i.test(d.querySelector("#shipMsg").textContent), "barra de envío gratis: " + d.querySelector("#shipMsg").textContent.trim());
    click(d.querySelector('#cart [data-act="del"]')); await wait(60);
    assert(/vacío/i.test(d.querySelector("#cartItems").textContent), "vaciar deja el estado vacío");
  } catch (e) { if (e.message !== "skip") errs.push("carrito: " + e.message); }

  /* ---- 3. buscador + ficha rápida con contenido ---- */
  try {
    if (!d.getElementById("search")) throw new Error("skip2");
    click(d.querySelector('[data-act="search"]')); await wait(60);
    const inp = d.getElementById("q"); inp.value = "kit";
    inp.dispatchEvent(new dom.window.Event("input", { bubbles: true })); await wait(60);
    assert(d.querySelectorAll("#sres .sres a").length >= 3, "el buscador encuentra kits");
    click(d.querySelector("#sres a")); await wait(60);
    assert(d.getElementById("qv").dataset.open === "true", "la búsqueda abre la ficha rápida");
    const qv = d.getElementById("qv");
    assert(qv.querySelector('[data-act="add"]'), "la ficha rápida tiene añadir al carrito");
    assert(len(qv.querySelector(".qv__pitch") && qv.querySelector(".qv__pitch").textContent) > 180, "la ficha rápida explica el producto");
    assert(qv.querySelectorAll(".notes > div").length >= 4, "con notas de sabor o ficha técnica");
    assert(qv.querySelectorAll(".bullets li").length === 3, "tres argumentos");
    assert(qv.querySelector(".quote"), "y una reseña real de ese producto");
    assert(qv.querySelectorAll(".qv__relrow button").length === 3, "tres productos relacionados");
  } catch (e) { if (e.message !== "skip2") errs.push("búsqueda: " + e.message); }

  /* ---- 4. flyout navegable ---- */
  try {
    if (!d.querySelector(".nav__cell")) throw new Error("skip3");
    const wide = dom.window.matchMedia ? dom.window.matchMedia("(min-width: 900px)").matches : true;
    const cell = d.querySelector(".nav__cell");
    const btn = cell.querySelector("[data-drop]");
    click(btn); await wait(30);
    if (wide) assert(cell.classList.contains("open"), "clic en escritorio abre el desplegable");
    else assert(btn.getAttribute("href"), "en móvil el toque navega a la sección");
    const sheet = d.getElementById("menu");
    click(d.querySelector('[data-act="menu"]')); await wait(60);
    assert(sheet.dataset.open === "true", "el menú móvil abre");
    assert(sheet.querySelectorAll("nav > a").length === 4, "cuatro secciones en el menú móvil");
    assert(sheet.querySelectorAll(".msheet__cats .chip").length >= 4, "atajos a categorías dentro del menú móvil");
    click(sheet.querySelector('[data-act="close"]')); await wait(60);
  } catch (e) { if (e.message !== "skip3") errs.push("menú: " + e.message); }

  /* ---- 5. lead magnet funcional ---- */
  try {
    if (!d.querySelector(".foot")) throw new Error("skip4");
    const host = d.querySelector("#guia [data-lead-form]") || d.querySelector("#leadModal [data-lead-form]");
    const form = host && host.querySelector("form");
    if (form) {
      const em = form.querySelector('input[type=email]');
      em.value = "no-es-un-email";
      form.dispatchEvent(new dom.window.Event("submit", { bubbles: true, cancelable: true }));
      assert(!form.querySelector("[data-err]").hidden, "rechaza un email inválido");
      em.value = "laura@zenqa.com";
      const cb = form.querySelector('input[type=checkbox]'); if (cb) cb.checked = true;
      form.dispatchEvent(new dom.window.Event("submit", { bubbles: true, cancelable: true }));
      await wait(60);
      assert(host.querySelector(".ok"), "tras enviar muestra el estado de éxito");
      const pdf = host.querySelector('a[download][href*="guia-matcha-zenqa.pdf"]');
      assert(pdf, "hay enlace de descarga al PDF");
      const res = await fetch(BASE + "assets/downloads/guia-matcha-zenqa.pdf", { method: "HEAD" });
      assert(res.ok && +res.headers.get("content-length") > 4000, "el PDF existe y pesa " + res.headers.get("content-length") + " bytes");
      assert(/ZENQA10/.test(host.textContent), "entrega el cupón");
      assert(dom.window.localStorage.getItem("zenqa_lead"), "queda guardado: no vuelve a preguntar");
    }
  } catch (e) { if (e.message !== "skip4") errs.push("lead magnet: " + e.message); }

  /* ---- 6. footer y cabecera ---- */
  try {
    const f = d.querySelector(".foot");
    if (!f) throw new Error("skip5");
    assert(f.querySelector(".brand img"), "logo en el footer");
    assert(f.querySelector(".brand__w").textContent.toLowerCase() === "zenqa life", "wordmark en el footer");
    const txt = f.querySelector(".foot__word text");
    assert(txt.getAttribute("stroke").toUpperCase() === "#FF6EBC", "«TE MATCHA VIBES» en rosa");
    assert(txt.getAttribute("fill") === "none", "manteniendo el estilo perfilado");
    assert(f.querySelector(".foot__claim, .lede"), "el pie explica la marca");
    assert(f.querySelectorAll(".foot__leg a").length >= 6, "enlaces legales");
  } catch (e) { if (e.message !== "skip5") errs.push("footer: " + e.message); }

  const clean = errs.filter((e, i, a) => a.indexOf(e) === i);
  if (clean.length) bad++;
  console.log((clean.length ? "✗ " : "✓ ") + file.padEnd(15) + (clean.length ? "\n    " + clean.join("\n    ") : ""));
  dom.window.close();
}
console.log(bad ? "\n" + bad + " problema(s)" : "\nTODO OK");
process.exit(bad ? 1 : 0);
