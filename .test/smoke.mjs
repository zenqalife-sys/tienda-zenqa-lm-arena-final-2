/* Comprobación de la v4: 5 páginas, todo minimalista y enfocado a vender.
   Ejecuta data.js + app.js de verdad dentro de jsdom y exige la estructura
   que pidió el cliente, sección por sección, más el carrito y las capas. */
import { JSDOM, VirtualConsole } from "jsdom";
import vm from "node:vm";
import fs from "fs";
import path from "path";

const cs = (doc) => (el) => doc.defaultView.getComputedStyle(el);
const BASE = process.env.BASE || "http://127.0.0.1:8080/";
const ROOT = path.resolve(import.meta.dirname, "..");
const sb = { window: {} }; vm.createContext(sb);
vm.runInContext(fs.readFileSync(path.join(ROOT, "assets/js/data.js"), "utf8"), sb);
const D = sb.window.ZENQA;

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const len = (t) => (t || "").replace(/\s+/g, " ").trim();
const CSS = fs.readFileSync(path.join(ROOT, "assets/css/zenqa.css"), "utf8");
const fails = [];
function ok(cond, msg) { if (!cond) fails.push(msg); return cond; }

/* ---------------- 1 · datos ---------------- */
const data = [];
data.push(["5 bloques de catálogo en orden", JSON.stringify(D.categories.map((c) => c.id)) === '["matcha","te","kit","vaso","ropa"]']);
data.push(["19 productos, todos en un bloque existente", D.products.length === 19 && D.products.every((p) => D.categories.some((c) => c.id === p.cat))]);
data.push(["orden de compra: matcha culinario y ceremonial los primeros", D.products[0].id === "te-culinario" && D.products[1].id === "te-ceremonial"]);
data.push(["el bloque de matcha tiene los dos grados y el pack", D.products.filter((p) => p.cat === "matcha").map((p) => p.id).join() === "te-culinario,te-ceremonial,pack-descubrimiento"]);
data.push(["3 tés distintos en 'más variedades'", D.products.filter((p) => p.cat === "te").length === 3]);
data.push(["merchandising = camiseta, sudadera y tote", D.products.filter((p) => p.cat === "ropa").length === 3]);
data.push(["ficha: pitch largo + 4 notas + 3 argumentos numéricos", D.products.every((p) => len(p.pitch).length > 180 && Object.keys(p.notes).length === 4 && p.bullets.length === 3 && p.bullets.filter((b) => /[0-9]/.test(b)).length >= 2)]);
data.push(["gancho corto para la tarjeta (sin párrafos en la página)", D.products.every((p) => len(p.hook).length > 30 && len(p.hook).length < 130)]);
data.push(["todas las imágenes de producto existen", D.products.every((p) => fs.existsSync(path.join(ROOT, "assets/img", p.img)))]);
data.push(["envío gratis a 35 € y 3 mensajes de franja, sin península ni 24-48", D.brand.freeShip === 35 && D.bandTop.length === 3 && /35/.test(D.bandTop[0]) && !/Pen[ií]nsula|24-48/.test(D.bandTop.join(" "))]);
data.push(["la franja invita a la guía y a unirse", /gu[ií]a/i.test(D.bandTop[1]) && D.bandTop[2] === "Únete a Zenqa Life"]);
data.push(["qué incluye del kit: solo herramientas, sin bote de 54 g (3 líneas)", D.kitIncluye.length === 3 && !/54|bote/i.test(JSON.stringify(D.kitIncluye)) && D.kitIncluye.every((x) => x[0].length < 24 && x[1].length > 18)]);
data.push(["maneras de prepararlo: 6 resumidas", D.ways.length === 6 && D.ways.every((w) => len(w.s).length < 26)]);
data.push(["ritual en 60 s = 4 pasos de una línea", D.ritual4.length === 4 && D.ritual4.every((s) => len(s.d).length < 130)]);
data.push(["comparativa sin perdedor ni «rendimiento» (precio por vaso)", D.vsMatcha.a.list.length === 3 && D.vsMatcha.b.list.length === 3 && D.vsMatcha.a.id !== D.vsMatcha.b.id && !/rendimiento|por vaso|por taza/i.test(JSON.stringify(D.vsMatcha))]);
data.push(["nada dice que un grado sea peor", !/peor|inferior|mala calidad|no llega/i.test(JSON.stringify(D.vsMatcha))]);
data.push(["café: 4 filas honestas, sin demonizar", D.energy.length === 4 && /café no es el enemigo|no es el enemigo/i.test(JSON.stringify(D.energy) + "no es el enemigo")]);
data.push(["ficha de calidad: los 6 apartados nuevos", D.quality.length === 6 && D.quality.every((x) => len(x[1]).length > 8)]);
data.push(["los 6 hitos del proceso y los 5 números de la casa", D.proceso.length === 6 && D.nosStats.length === 5]);
data.push(["el kit completo no promete bote de 54 g", !/54 g/.test(D.byId["kit-completo"].name + D.byId["kit-completo"].pitch + JSON.stringify(D.byId["kit-completo"].bullets))]);
data.push(["10 recetas con 4 pasos y producto asociado", D.recipes.length === 10 && D.recipes.every((r) => r.steps.length === 4 && D.byId[r.product])]);
data.push(["7 opiniones reales con producto", D.reviews.length === 7 && D.reviews.every((r) => D.byId[r.p] && len(r.txt).length > 140)]);
console.log("datos v4: " + data.filter((x) => x).length + "/" + data.length + " cumplen");
data.filter((x) => !x).forEach((x) => fails.push("[datos] " + x[0]));

/* ---------------- 2 · contrato común a las 5 páginas ---------------- */
const PAGES = {
  "index.html": "home", "matcha.html": "matcha", "productos.html": "productos",
  "recetas.html": "recetas", "nosotros.html": "nosotros",
};
const EXTRA = ["legal.html", "tienda.html", "ritual.html", "contacto.html", "prepararlo.html"];
const results = {};

async function load(f) {
  const vc = new VirtualConsole();
  vc.on("jsdomError", (e) => fails.push(f + " jsdomError: " + e.message));
  vc.on("error", (m) => fails.push(f + " console.error: " + m));
  const dom = await JSDOM.fromURL(BASE + f, {
    runScripts: "dangerously", resources: "usable", pretendToBeVisual: true, virtualConsole: vc,
  });
  await new Promise((r) => dom.window.addEventListener("load", r));
  await wait(260);
  return dom;
}

function common(f, d, page) {
  const q = (s) => d.querySelector(s);
  const Q = (s) => Array.from(d.querySelectorAll(s));
  const txt = (s) => len(d.querySelector(s) ? d.querySelector(s).textContent : "");
  // franja rosa superior: estática, 3 mensajes con punto blanco y redes del pie
  ok(!!q(".band--static"), f + ": franja arriba");
  ok(!q(".band__track") && !q(".band--mid"), f + ": la franja no se mueve (sin bucle ni franja intermedia)");
  const bi = Q(".band--static .band__i");
  ok(bi.length === 3, f + ": 3 mensajes en la franja (" + bi.length + ")");
  const btop = q(".band--static") ? q(".band--static").textContent : "";
  ok(/Env[ií]os gratis a partir de 35/i.test(btop), f + ": la franja habla del envío gratis");
  ok(/Descarga nuestra gu[ií]a gratis/i.test(btop), f + ": la franja invita a la guía");
  ok(/Únete a Zenqa Life/i.test(btop), f + ": la franja invita a unirse");
  ok(!/Pen[ií]nsula|24-48/i.test(btop), f + ": sin plazos inventados en la franja");
  const soc = Q(".band--static .band__soc a");
  ok(soc.length === 4, f + ": las redes del pie junto a «Únete» (" + soc.length + ")");
  ok(soc.every((a) => /instagram|tiktok|youtube|pinterest/.test(a.getAttribute("aria-label").toLowerCase())), f + ": las 4 redes del pie");
  // menú: alto, centrado, con la subpágina Contacto bajo Nosotros
  ok(d.defaultView.getComputedStyle(q(".nav")).position === "sticky", f + ": el menú es pegajoso");
  const links = [...Q(".nav__ul > a"), ...Q(".nav__ul > .nav__cell > a.nav__a")];
  ok(links.length === 4, f + ": el menú son 4 entradas (" + links.length + ")");
  ok(links.every((a) => a.getAttribute("href") !== "index.html"), f + ": la home no está en el menú");
  const drop = q(".nav__cell .nav__drop a");
  ok(!!drop && drop.getAttribute("href") === "nosotros.html#contacto", f + ": Contacto como subpágina de Nosotros (ancla)");
  ok(!!q(".nav__chev"), f + ": flechita del desplegable");
  ok(q(".brand").getAttribute("href") === "index.html", f + ": el logo lleva a la home");
  ok(/logo-2x\.png/.test(q(".brand img").getAttribute("src")), f + ": logo sin redibujar");
  ok(Q(".foot").length === 1, f + ": un solo pie");
  ok(/TE MATCHA VIBES/.test(q(".foot__word").textContent), f + ": pie con TE MATCHA VIBES");
  const wtext = q(".foot__word text");
  ok(wtext && wtext.getAttribute("font-style") === "italic", f + ": el lema del pie en cursiva");
  ok(!q(".foot form"), f + ": el pie no lleva formularios");
  ok(!/newsletter|gu[ií]a gratis|suscr[ií]bete/i.test(q(".foot").textContent), f + ": el pie no lleva imán de leads ni newsletter");
  ok(Q("main h1").length === 1, f + ": un solo h1");
  ok(!/Directo de colina/i.test(d.body.textContent), f + ": sin la frase rechazada");
  ok(!/merchandising/i.test(d.body.textContent), f + ": sin la palabra merchandising");
  if (page !== "legal") ok(!!q("#unete .join__card form[data-form='news']"), f + ": sección únete con newsletter");
  ok(Q(".hero .hero__cta a, .hero .hero__cta").length >= 0, f + ": hero");
  return { q, Q };
}

/* ---------------- 3 · página a página ---------------- */
function checkIndex(d) {
  const { q, Q } = common("index.html", d, "home");
  ok(/hero-matcha\.jpg/.test(q(".hero__m img").getAttribute("src")), "home: la portada es la foto de la v1");
  const h1 = len(q(".hero h1").textContent);
  ok(/MATCHA\s*VIBES/i.test(h1), "home: h1 #MATCHA VIBES (" + h1 + ")");
  ok(q(".hero h1 .hl"), "home: subrayado tipo rotulador");
  ok(q(".hero").classList.contains("hero--italic"), "home: el título de la portada en cursiva");
  ok(/\.hero--italic h1 \{ font-style: italic/.test(CSS), "home: CSS de la cursiva del título");
  const cta = [...Q(".hero__cta a")];
  ok(cta.length === 2, "home: dos botones en la portada");
  ok(cta.every((a) => a.classList.contains("btn--lg")), "home: los dos botones grandes y separados");
  ok(cta[0].classList.contains("btn--pink") && cta[0].getAttribute("href") === "matcha.html", "home: el primero, rosa, a la página del matcha");
  ok(/c[oó]mo se prepara/i.test(cta[1].textContent) && cta[1].getAttribute("href").startsWith("recetas.html"), "home: el segundo lleva a recetas");
  // bloque 1: título pincel a la izquierda a la altura del producto
  const s1 = Q("main > section")[1];
  ok(/momento/i.test(s1.textContent) && /matcha/i.test(s1.textContent), "home: 'tu momento matcha'");
  ok(s1.querySelector(".moment__t h2") === s1.querySelector("h2"), "home: el título es lo primero de la sección");
  ok(s1.querySelector(".moment__t h2").classList.contains("brush"), "home: el título del momento, fuente pincel graffiti");
  ok(/Permanent Marker/.test(CSS) && /--brush/.test(CSS), "home: la fuente pincel está en la CSS");
  ok(s1.querySelector(".split").classList.contains("split--fill"), "home: el texto ocupa todo el alto del producto");
  const spot1 = s1.querySelector("[data-spot]");
  ok(spot1.getAttribute("data-spot") === "te-ceremonial", "home: el producto es el bote de matcha");
  const sp1 = s1.querySelector(".split");
  ok(sp1.firstElementChild.classList.contains("moment__t") && sp1.children[1].matches("[data-spot]") && !!sp1.children[1].querySelector(".buy"), "home: texto a la izquierda, producto a la derecha");
  const buy1 = spot1.querySelectorAll(".buy button");
  ok(buy1.length === 2, "home: dos botones bajo el producto");
  ok(/a[nñ]adir al carrito/i.test(buy1[0].textContent) && /ver ficha de producto/i.test(buy1[1].textContent), "home: añadir + ver ficha");
  // sección verde clarito: qué es el té matcha, 4 líneas y solo texto
  const secs = Q("main > section");
  const what = secs[2];
  ok(what.classList.contains("whatis"), "home: la sección verde clarito va justo después del momento");
  ok(!q(".band--mid"), "home: la franja en movimiento desapareció");
  const lines = what.querySelectorAll(".whatis__lines p");
  ok(lines.length === 4, "home: el matcha explicado en 4 líneas (" + lines.length + ")");
  ok(!what.querySelector("img"), "home: la sección qué-es, solo texto");
  ok(/\.whatis \{ background: var\(--sage-soft\)/.test(CSS), "home: fondo verde clarito en la sección qué-es");
  // bloque 2: kit a la izquierda, «preparación» a lo grande
  const kitSec = secs.find((x) => x.querySelector('[data-spot="kit-completo"]'));
  ok(kitSec && kitSec.querySelector(".split--flip"), "home: el kit va en el lado izquierto");
  ok(/kit de\s*preparaci/i.test(len(kitSec.textContent)), "home: nombre del kit");
  ok(!!kitSec.querySelector(".kit-big"), "home: «preparación» a tamaño grande");
  ok(kitSec.querySelector(".split__t").classList.contains("split__t--fill"), "home: el kit ocupa todo el alto de la sección");
  ok(kitSec.querySelectorAll(".inc li").length === 3, "home: 'qué incluye' en tres líneas, sin bote de 54 g");
  ok(!/54 g/i.test(kitSec.textContent), "home: nada de «viene 54 g» en el kit");
  ok(kitSec.querySelectorAll(".buy button").length === 2, "home: los dos botones también bajo el kit");
  // rejillas
  const tri = Q("#grid-tri .tri__i");
  ok(tri.length === 3, "home: rejilla de 3 bloques");
  ok(tri.every((a) => a.getAttribute("href").startsWith("productos.html")), "home: los 3 llevan a productos");
  ok(tri[0].getAttribute("href").endsWith("#matcha") && tri[2].getAttribute("href").endsWith("#ropa"), "home: matcha y tés primero, ropa tercera");
  const triSec = secs.find((x) => x.querySelector("#grid-tri"));
  ok(/Nuestros\s*productos/i.test(triSec.querySelector("h2").textContent), "home: la sección se llama «Nuestros productos»");
  ok(Q("#grid-reviews .quote").length === 3, "home: 3 opiniones");
  const revSec = secs.find((x) => x.querySelector("#grid-reviews"));
  ok(/Quien lo compra,?\s*repite/i.test(revSec.querySelector("h2").textContent), "home: reseñas con el título «Quien lo compra, repite»");
  ok(Q("#grid-recipes .rcard").length === 3, "home: 3 recetas");
  const secR = secs.find((x) => x.querySelector("#grid-recipes"));
  ok(secR && /Descubre\s*recetas/i.test(secR.querySelector("h2").textContent), "home: la sección de recetas se llama «Descubre recetas»");
  ok(!!secR.querySelector('a[href="recetas.html"]'), "home: CTA a recetas");
  // imán de leads en su propia sección, sin 10 % ni cupón
  const guia = secs.find((x) => x.id === "guia");
  ok(!!guia && guia.previousElementSibling === secR, "home: el imán de leads va en su propia sección, separada de recetas");
  const lead = guia.querySelector(".lead");
  ok(lead && !!lead.querySelector("form[data-form='lead']"), "home: imán de leads con formulario");
  ok(!!lead.querySelector(".mock"), "home: el imán con su tarjeta PDF (estilo de la referencia)");
  ok(!/10\s*%|ZENQA10|cup[oó]n/i.test(lead.textContent), "home: el imán sin 10 % falso");
  ok(!!q('a[href="nosotros.html"]'), "home: CTA a nosotros");
  const about = secs.find((x) => /Nacidos en/.test(x.textContent));
  ok(about && about.querySelector(".split--fill"), "home: «Nacidos en las colinas de Uji» con el texto a todo el alto de la foto");
  ok(about && len(about.textContent).length < 460, "home: sobre nosotros en pocas líneas (" + (about ? len(about.textContent).length : 0) + ")");
}

function checkMatcha(d) {
  const { q, Q } = common("matcha.html", d, "matcha");
  ok(/tu ritual\s*diario/i.test(len(q(".hero h1").textContent)), "matcha: h1 'Tu ritual diario'");
  const ep = q(".hero .sub-energia");
  ok(!!ep && /energ[ií]a pura/i.test(ep.textContent), "matcha: subtítulo 'Energía pura'");
  ok(/\.sub-energia \{[^}]*color: var\(--pink\)/.test(CSS) && /text-decoration-color: var\(--sage-soft\)/.test(CSS), "matcha: 'Energía pura' en rosa y subrayado en verde clarito");
  ok(/font-size: clamp\(1\.7rem/.test(CSS), "matcha: 'Energía pura' grande");
  const duo = q(".two");
  ok(duo && duo.children.length === 2, "matcha: dos productos en paralelo");
  ok(duo.children[0].getAttribute("data-spot") === "te-culinario", "matcha: culinario a la izquierda");
  ok(duo.children[1].getAttribute("data-spot") === "te-ceremonial", "matcha: ceremonial a la derecha");
  ok(duo.querySelectorAll(".buy button").length === 4, "matcha: dos botones bajo cada foto");
  const vs = Q("#vsTable .vs__c");
  ok(vs.length === 2, "matcha: comparativa a dos columnas");
  ok(vs[0].querySelectorAll("li").length === 3 && vs[1].querySelectorAll("li").length === 3, "matcha: comparativa sin la fila de rendimiento");
  ok(!/rendimiento|por vaso/i.test(q("#vsTable").textContent), "matcha: nada de precio por vaso en la comparativa");
  ok(Q("#vsTable .vs__c").every((c) => c.querySelector("[data-act='add']")), "matcha: comprar desde las dos columnas");
  ok(!/peor|inferior|no es|dejad de/i.test(vs[0].textContent + vs[1].textContent), "matcha: ninguna columna queda mal");
  const cal = q("#calidad");
  ok(cal.classList.contains("sec--mint"), "matcha: «Calidad de nuestro matcha» con fondo verde");
  ok(/Calidad de nuestro matcha/i.test(cal.querySelector("h2").textContent), "matcha: título «Calidad de nuestro matcha»");
  ok(Q("#quality .specs > div").length === 6, "matcha: ficha de calidad con 6 apartados");
  const rit = q("#ritual");
  ok(!rit.classList.contains("sec--mint") && !rit.classList.contains("sec--paper"), "matcha: el ritual va con fondo distinto al verde (se separan)");
  ok(Q("#ritual4 .step").length === 4, "matcha: ritual en 4 pasos");
  ok(Q("#energy .vs__c").length === 2 && Q("#energy li").length === 8, "matcha: beneficios frente al café");
  ok(/no es el enemigo/i.test(q("#energy").textContent), "matcha: sin demonizar el café");
  const forms = [...Q("main > section h2")].map((h) => len(h.textContent));
  ok(forms.some((t) => /Más formas de\s*beberlo/i.test(t)), "matcha: «Más formas de beberlo»");
  ok(Q("#grid-recipes .rcard").length === 3, "matcha: mini sección de recetas");
  ok(!!q('a[href="recetas.html"]'), "matcha: la mini sección enlaza a la página de recetas");
  const ink = [...Q("main > section")].find((x) => x.querySelector("#grid-tes"));
  ok(ink && ink.classList.contains("sec--ink"), "matcha: «Todos nuestros tés» con fondo negro");
  ok(/Todos nuestros\s*tés/i.test(ink.querySelector("h2").textContent), "matcha: título «Todos nuestros tés»");
  ok(Q("#grid-tes .tri__i").length === 3, "matcha: rejilla de 3 fotos a productos");
  ok(!!q("#unete"), "matcha: sección únete");
}

function checkProductos(d) {
  const { q, Q } = common("productos.html", d, "productos");
  const hero = Q("main > section")[0];
  ok(hero.classList.contains("phead-soft"), "productos: portada con fondo verde clarito");
  ok(/\.phead-soft \{ background: var\(--sage-soft\)/.test(CSS), "productos: CSS del fondo verde clarito");
  ok(!hero.querySelector("img"), "productos: la portada sin foto");
  ok(/Movimiento\s*Zenqa Life/i.test(len(hero.querySelector("h1").textContent)), "productos: título «Movimiento Zenqa Life»");
  ok(!/Todo lo que\s*vendemos/i.test(hero.textContent), "productos: sin «Todo lo que vendemos»");
  ok(!/Pen[ií]nsula|24-48/.test(hero.textContent), "productos: sin plazos inventados en la portada");
  const secs = [...Q("#groups > section")];
  ok(secs.length === 5, "productos: 5 bloques (" + secs.length + ")");
  ok(JSON.stringify(secs.map((s) => s.id)) === '["matcha","te","kit","vaso","ropa"]', "productos: orden matcha > tés > kits > vaso > ropa");
  const cards = Q("#groups .card");
  ok(cards.length === 19, "productos: los 19 productos del catálogo (" + cards.length + ")");
  ok(Q("#groups .pgrid").length === 5, "productos: cada bloque en su rejilla");
  ok(secs[0].querySelectorAll(".card").length === 3, "productos: el bloque de matcha abre con culinario y ceremonial");
  ok(cards.every((c) => c.querySelectorAll("button").length === 2), "productos: dos botones por ficha, ni uno más");
  ok(cards.every((c) => c.querySelector(".price")), "productos: precio visible en cada ficha");
  ok(!cards.some((c) => c.querySelector("p.note, .qv__pitch")), "productos: sin párrafos en la rejilla");
  ok(!!q("#unete"), "productos: sección únete");
}

function checkRecetas(d) {
  const { q, Q } = common("recetas.html", d, "recetas");
  ok(/latte,?\s*ice,?\s*solo/i.test(len(q(".hero h1").textContent)), "recetas: h1 'Latte, ice, solo…'");
  ok(q(".hero h1 .hl").classList.contains("hl--draw"), "recetas: el título se ve mejor (el rotulador se dibuja)");
  ok(/Encuentra tu manera preferida de prepararlo/i.test(q(".hero").textContent), "recetas: subtítulo nuevo");
  ok(!/Diez formas de preparar el mismo polvo/i.test(q(".hero").textContent), "recetas: sin el subtítulo viejo");
  ok(!q("#ways") && !q(".hero .chip"), "recetas: sin etiquetas bajo el subtítulo");
  const b = [...Q(".hero__cta a")];
  ok(b.length === 2 && b.every((x) => x.classList.contains("btn") && x.closest(".hero__cta")), "recetas: dos botones");
  ok(q(".hero .hero__cta .btn").classList.contains("btn--lg"), "recetas: los botones grandes");
  ok(b[0].getAttribute("href") === "#recetas" && b[0].classList.contains("btn--pink"), "recetas: el primero, rosa, ancla a las recetas");
  ok(b[1].getAttribute("href") === "#guia", "recetas: el segundo ancla a la guía");
  ok(!!q("#recetas") && !!q("#guia") && !!q("#energia"), "recetas: las tres anclas existen");
  const en = q("#energia");
  ok(/energ[ií]a limpia/i.test(en.textContent), "recetas: sección energía limpia");
  ok(en.classList.contains("sec--center") && en.classList.contains("sec--mint"), "recetas: energía limpia centrada y en verde clarito");
  ok(!!en.querySelector(".big-statement"), "recetas: energía limpia con frase grande");
  ok(len(en.textContent).length < 560, "recetas: energía limpia en pocas líneas");
  ok(Q("#grid-recipes-all .rcard").length === 10, "recetas: las 10 recetas");
  const rec = q("#recetas");
  ok(/Recetas infinitas,?\s*sabores únicos/i.test(rec.querySelector("h2").textContent), "recetas: «Recetas infinitas, sabores únicos»");
  ok(!/dale al paso/i.test(rec.textContent), "recetas: sin «Elige una y dale al paso 1»");
  ok(!/cada tarjeta abre la receta/i.test(rec.textContent), "recetas: sin el texto de las tarjetas");
  const comprar = q("#comprar");
  ok(!!comprar, "recetas: «Comprar lo que falta» en su propia sección");
  ok(comprar.classList.contains("sec--paper"), "recetas: esa sección, con otro fondo (diferenciada)");
  ok(!!comprar.querySelector(".buyblock"), "recetas: y en un bloque diferenciado");
  ok(/comprar lo que falta/i.test(comprar.textContent), "recetas: se llama «Comprar lo que falta»");
  ok(Q("#grid-picks .card").length === 6, "recetas: rejilla de productos de la tienda");
  ok(!!q("#guia form[data-form='lead']"), "recetas: imán de leads en su sección");
  const lead = q("#guia .lead");
  ok(!!lead.querySelector(".mock"), "recetas: el imán con su tarjeta PDF");
  ok(!/10\s*%|ZENQA10/i.test(lead.textContent), "recetas: el imán sin 10 % falso");
  ok(!!q("#unete"), "recetas: sección únete");
}

function checkNosotros(d) {
  const { q, Q } = common("nosotros.html", d, "nosotros");
  ok(/nacidos en\s*las colinas\s*de uji/i.test(len(q(".hero h1").textContent)), "nosotros: h1 'Nacidos en las colinas de Uji'");
  const mani = q("#manifiesto");
  ok(mani.classList.contains("sec--sage"), "nosotros: manifiesto sobre verde clarito");
  ok(/\.sec--sage \{ background: var\(--sage-soft\)/.test(CSS), "nosotros: CSS del verde clarito");
  ok(/Menos ruido,?\s*m[aá]s intenci/i.test(len(mani.querySelector("h2").textContent)), "nosotros: 'Menos ruido, más intención'");
  ok(/Nacimos para convertir una bebida funcional/i.test(mani.textContent), "nosotros: el copy nuevo del manifiesto");
  ok(/Premium sin solemnidad/i.test(mani.textContent), "nosotros: la cita «Premium sin solemnidad»");
  ok(!/creemos en la constancia/i.test(mani.textContent), "nosotros: el copy viejo, fuera");
  ok(/\.mani \{ text-align: center \}/.test(CSS) && mani.classList.contains("mani"), "nosotros: todo el manifiesto centrado");
  ok(!!mani.querySelector(".mani__fig img") && /Uji, prefectura de Kioto/i.test(mani.textContent), "nosotros: la foto con su pie");
  const cal = q("#calidad");
  ok(Q("#calidad #quality .specs > div").length === 6, "nosotros: calidad del té (6 apartados)");
  ok(/Lo que pasa\s*antes de\s*que abras la lata/i.test(cal.querySelector("h2").textContent), "nosotros: cabecera verbatim «Lo que pasa antes de que abras la lata»");
  ok(/La calidad del t[eé]/i.test(cal.querySelector(".kicker").textContent), "nosotros: kicker «La calidad del té»");
  ok(/Cada decisión de campo y de molino/i.test(cal.textContent), "nosotros: copy que explica el proceso");
  ok(Q("#proceso .proc__i").length === 6, "nosotros: los 6 hitos del proceso");
  ok(!q("#grades") && !cal.querySelector(".tile img"), "nosotros: fuera las fotos sin sentido de esta sección");
  ok(Q("#nosStats .stat2").length === 5, "nosotros: los 5 números de la casa");
  ok(!!q("#contacto"), "nosotros: el contacto es una ancla de esta página");
  ok(Q("#contacto .split__t, #contacto .inc li").length >= 4, "nosotros: los datos de contacto a la izquierda");
  const f = q("#contacto form[data-form='contact']");
  ok(!!f, "nosotros: formulario de contacto");
  ok(["name", "email", "tema", "msg", "priv"].every((n) => f.querySelector('[name="' + n + '"]')), "nosotros: nombre, email, motivo, mensaje y consentimiento");
  const guia = q("#guia");
  ok(!!guia && guia.previousElementSibling === q("#contacto"), "nosotros: el imán de leads justo debajo del formulario");
  ok(!!guia.querySelector("form[data-form='lead']") && !!guia.querySelector(".mock"), "nosotros: el imán con su tarjeta PDF (estilo de la referencia)");
  ok(!/10\s*%|ZENQA10/i.test(guia.textContent), "nosotros: el imán sin 10 % falso");
  ok(!!q("#unete"), "nosotros: sección únete");
}

/* ---------------- 4 · comportamiento ---------------- */
async function behavior(d) {
  const w = d.window, doc = w.document;
  const q = (s) => doc.querySelector(s), Q = (s) => Array.from(doc.querySelectorAll(s));
  const click = (el) => el.dispatchEvent(new w.MouseEvent("click", { bubbles: true, cancelable: true }));
  const openPanes = () => [...Q(".ov")].filter((o) => o.dataset.open === "true").map((o) => o.id);

  const add = q("[data-spot] [data-act='add']");
  click(add); await wait(60);
  ok(q("[data-cart-count]").textContent === "1" && !q("[data-cart-count]").hidden, "carrito: el contador sube a 1");
  const cart = JSON.parse(w.localStorage.getItem("zenqa_cart"));
  ok(cart.length === 1 && cart[0].q === 1, "carrito: guardado en localStorage");
  click(add); await wait(40);
  ok(JSON.parse(w.localStorage.getItem("zenqa_cart"))[0].q === 2, "carrito: repetir suma cantidad");
  click(q(".nav__tools [data-act='cart']")); await wait(120);
  ok(openPanes().join() === "cart", "capas: solo el carrito abierto");
  ok(q("#shipBar").style.width !== "0%", "carrito: barra de envío gratis en marcha");
  click(q("[data-act='plus']")); await wait(40);
  ok(JSON.parse(w.localStorage.getItem("zenqa_cart"))[0].q === 3, "carrito: el más funciona");
  click(q("[data-act='minus']")); await wait(40);
  ok(JSON.parse(w.localStorage.getItem("zenqa_cart"))[0].q === 2, "carrito: el menos funciona");
  click(q('[data-act="close"]')); await wait(40);
  ok(openPanes().length === 0 && !doc.body.classList.contains("lock"), "capas: se cierra y libera el scroll");

  click(q('[data-spot="kit-completo"] [data-act="qv"]')); await wait(140);
  const qv = q("#qvBody");
  ok(openPanes().join() === "qv", "ficha: se abre la capa");
  ok(qv && len(qv.querySelector(".qv__pitch").textContent).length > 180, "ficha: el texto largo vive aquí");
  ok(qv.querySelectorAll(".qv__notes > div").length === 4, "ficha: 4 notas de sabor");
  ok(qv.querySelectorAll(".qv__bullets li").length === 3, "ficha: 3 argumentos");
  ok(!!qv.querySelector(".quote"), "ficha: una opinión de comprador");
  ok(qv.querySelectorAll(".qv__rel button").length >= 2 && qv.querySelectorAll(".qv__rel button").length <= 3, "ficha: 2-3 relacionados");
  click(qv.querySelector('[data-act="add"]')); await wait(340);
  ok(openPanes().length === 0, "ficha: añadir desde la capa la cierra");
  ok(JSON.parse(w.localStorage.getItem("zenqa_cart")).length === 2, "ficha: segundo producto en el carrito");

  click(q('[data-act="search"]')); await wait(140);
  const qi = q("#q");
  qi.value = "kit"; qi.dispatchEvent(new w.Event("input", { bubbles: true })); await wait(60);
  ok(Q("#sres a").length >= 1, "buscador: encuentra kits");
  qi.value = ""; qi.dispatchEvent(new w.Event("input", { bubbles: true })); await wait(40);
  ok(Q("#sres .chip").length >= 4, "buscador: sugerencias con el campo vacío");
  w.document.dispatchEvent(new w.KeyboardEvent("keydown", { key: "Escape", bubbles: true })); await wait(60);
  ok(openPanes().length === 0, "buscador: escape cierra");

  click(q('[data-act="menu"]')); await wait(120);
  const mpages = Q(".msheet nav > a:not(.msheet__sub)");
  ok(openPanes().join() === "menu" && mpages.length === 4, "flyout: 4 páginas, sin 'inicio' (" + mpages.length + ")");
  ok(!q(".msheet__cats"), "flyout: sin bocadillos de atajos");
  ok(!!q('.msheet__sub[href="nosotros.html#contacto"]'), "flyout: Contacto como subpágina de Nosotros");
  click(q(".msheet__top [data-act='close']")); await wait(40);

  // imán de leads
  const lf = q("form[data-form='lead']");
  const mail = lf.querySelector('input[type="email"]');
  click(lf.querySelector('button[type="submit"]')); await wait(40);
  ok(!lf.querySelector("[data-err]").hidden, "leads: sin email no cuela");
  mail.value = "hola@zenqa.life"; lf.querySelector('input[name="priv"]').checked = true;
  click(lf.querySelector('button[type="submit"]')); await wait(60);
  const done = Q(".lead .ok").pop();
  ok(!!done, "leads: el formulario se sustituye por el éxito");
  ok(/\.pdf/.test(done.querySelector("a").getAttribute("href")) && !/ZENQA10|10\s*%/.test(done.textContent), "leads: PDF sin cupón inventado");
  ok(w.localStorage.getItem("zenqa_lead") === "hola@zenqa.life", "leads: queda registrado para no repetir el modal");

  // newsletter de la sección únete
  const nf = q("#unete form[data-form='news']");
  const ncard = nf.closest(".join__card");
  nf.querySelector('input[type="email"]').value = "otra@zenqa.life";
  nf.querySelector('input[name="priv"]').checked = true;
  click(nf.querySelector('button[type="submit"]')); await wait(60);
  ok(/ya est[a\u00e1]s en la lista/i.test(ncard.textContent), "únete: newsletter confirmada dentro de la tarjeta");
  ok(!ncard.querySelector("form"), "únete: el formulario se sustituye por el aviso");
  ok(!/form/.test(doc.querySelector(".foot").innerHTML), "pie: sin formularios (como se pidió)");

  // receta en capa
  const rc = q(".rcard");
  if (rc) {
    click(rc); await wait(140);
    ok(openPanes().join() === "recipe", "recetas: la tarjeta abre la capa de receta");
    ok(Q("#recipeBody .rd__steps li").length === 4, "recetas: 4 pasos en la capa");
    ok(!!q("#recipeBody [data-act='add']"), "recetas: el bote se añade desde la receta");
    click(q("#recipe [data-act='close']")); await wait(40);
  }
  return true;
}

/* ---------------- 5 · enlaces e ids ---------------- */
function refs() {
  const all = [...Object.keys(PAGES), ...EXTRA];
  const src = Object.fromEntries(all.map((f) => [f, fs.readFileSync(path.join(ROOT, f), "utf8")]));
  src["__app"] = fs.readFileSync(path.join(ROOT, "assets/js/app.js"), "utf8");
  const dyn = new Set([...D.products.map((p) => p.id), ...D.categories.map((c) => c.id), ...D.recipes.map((r) => r.id),
    "cart", "menu", "search", "qv", "recipe", "lead", "toast", "unete", "top"]);
  const idsOf = Object.fromEntries(all.map((f) => [f, new Set([...src[f].matchAll(/id="([^"]+)"/g)].map((m) => m[1]))]));
  let bad = 0, checked = 0;
  const check = (from, r) => {
    if (/^(https?:|mailto:|tel:|data:)/.test(r) || r === "#") return;
    checked++;
    const [file, hash] = r.split("#");
    if (file && !fs.existsSync(path.join(ROOT, file))) { fails.push(from + " \u2192 no existe " + file); bad++; return; }
    if (file && hash) {
      const pool = idsOf[file] || new Set();
      if (!pool.has(hash) && !dyn.has(hash)) { fails.push(from + " \u2192 ancla rota " + r); bad++; }
    } else if (!file && hash) {
      const pool = idsOf[from] || new Set();
      if (!pool.has(hash) && !dyn.has(hash)) { fails.push(from + " \u2192 ancla rota #" + hash); bad++; }
    } else if (!file && !hash) { fails.push(from + " \u2192 href vac\u00edo"); bad++; }
  };
  for (const f of all) for (const m of src[f].matchAll(/(?:href|src)="([^"]+)"/g)) check(f, m[1]);
  const union = new Set([].concat(...all.map((f) => [...idsOf[f]])));
  for (const m of src.__app.matchAll(/["'](assets\/[^"']+|[a-z]+\.html(?:#[a-z0-9-]+)?)/g)) check("app.js", m[1]);
  for (const m of src.__app.matchAll(/href="#([a-z0-9-]+)"/g)) { checked++; if (!union.has(m[1]) && !dyn.has(m[1])) { fails.push("app.js \u2192 ancla roto #" + m[1]); bad++; } }
  for (const m of src.__app.matchAll(/href=\\"([^"\\]+)/g)) check("app.js", m[1]);
  console.log("referencias: " + checked + " comprobadas, " + bad + " rotas");
}

/* ---------------- 6 · sin desborde horizontal ---------------- */
function noOverflow(css) {
  // nada de anchos fijos de escritorio sin tope: eso es lo que produce el scroll lateral
  const body = css.replace(/@media[^{]*\{\s*\([^)]*\)\s*\{/g, "@media{");
  const fixed = [...body.matchAll(/(?:^|[^-a-z])width:\s*(\d{3,})px/g)].map((m) => +m[1]);
  ok(!fixed.length, "css: ningún width fijo suelto (" + fixed.join() + ")");
  ok(/min-width: 0|overflow-x: hidden|overflow-x: clip/.test(css), "css: el body corta el desborde");
  ok(!/position:\s*fixed[^}]{0,80}(left|right):\s*\d{3,}px/.test(css), "css: nada fijo fuera de la pantalla");
  ok(!/\bw\s*:\s*1\d{3}%|1[0-9]{2}%\s*!important/.test(css), "css: ningún ancho mayor que la pantalla");
  ok(/max-width:\s*100%/.test(css), "css: imágenes y medios limitadas al contenedor");
  ok(/\*\s*\{|\*,[^(]*\{[^}]*box-sizing/.test(css), "css: box-sizing global");
}

(async () => {
  noOverflow(fs.readFileSync(path.join(ROOT, "assets/css/zenqa.css"), "utf8"));
  refs();
  const checks = { "index.html": checkIndex, "matcha.html": checkMatcha, "productos.html": checkProductos, "recetas.html": checkRecetas, "nosotros.html": checkNosotros };
  for (const [f, fn] of Object.entries(checks)) {
    try {
      const d = await load(f);
      results[f] = d;
      fn(d.window.document);
      if (f === "index.html") await behavior(d);
      else {
        // en el resto, el carrito tiene que seguir vivo
        const w = d.window;
        const card = w.document.querySelector("[data-act='add']");
        if (card) { card.dispatchEvent(new w.MouseEvent("click", { bubbles: true })); await wait(40); ok(!!JSON.parse(w.localStorage.getItem("zenqa_cart")).length, f + ": comprar desde esta página meten el producto en el carrito"); }
        ok(!/<(section|div)[^>]*class="[^"]*sec[^"]*"[^>]*>\s*<\/(section|div)>/.test(w.document.body.innerHTML), f + ": ninguna sección montada vacía");
      }
      console.log((fails.filter((x) => x.startsWith(f)).length ? "✗ " : "✓ ") + f);
    } catch (e) {
      fails.push(f + " EXCEPTION: " + e.message + "\n   " + String(e.stack).split("\n")[1]);
      console.log("✗ " + f + " · " + e.message);
    }
  }
  const before = fails.length;
  console.log("\n" + (fails.length ? fails.length + " fallos:\n - " + fails.join("\n - ") : "TODO OK · " + Object.keys(PAGES).length + " páginas + " + EXTRA.length + " redirecciones"));
  process.exit(fails.length ? 1 : 0);
})();
