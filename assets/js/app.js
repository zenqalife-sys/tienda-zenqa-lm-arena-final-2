/* ============================================================
   ZENQA LIFE · v4 — motor de la tienda
   Cabecera con franja en bucle + nav pegajosa, pie común en todas
   las páginas, carrito real, ficha rápida, recetas en capa, buscador,
   imán de leads y formularios. Las secciones de texto no existen:
   se monta lo que la página pide por data-* y nada más.
   ============================================================ */
(function () {
  "use strict";
  const Z = window.ZENQA;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));
  const page = document.body.dataset.page || "";
  const LS_CART = "zenqa_cart";
  const LS_LEAD = "zenqa_lead";
  const mq = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  const reduce = !!(mq && mq.matches);

  const ICON = {
    cart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2l2.4 10.4A2 2 0 0 0 9.4 16h8.2a2 2 0 0 0 2-1.6L21 7H6"/><circle cx="10" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/></svg>',
    search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/></svg>',
    menu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 7h17M3.5 12h17M3.5 17h11"/></svg>',
    x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    bag: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 8h12l-1 12H7L6 8Z"/><path d="M9.5 8V6.5a2.5 2.5 0 0 1 5 0V8"/></svg>',
  };
  const LOGO = '<img src="assets/img/logo-2x.png" alt="" width="30" height="30" loading="eager">';
  const NAV = [
    { k: "matcha", t: "Matcha", href: "matcha.html" },
    { k: "productos", t: "Productos", href: "productos.html" },
    { k: "recetas", t: "Recetas y guías", href: "recetas.html" },
    { k: "nosotros", t: "Nosotros", href: "nosotros.html" },
  ];
  const TRI_HOME = [
    { img: "p-ceremonial.jpg", t: "Matcha y tés", s: "Ceremonial, culinario, hojicha", h: "productos.html#matcha" },
    { img: "m-glass.jpg", t: "Tazas y vasos", s: "Chawan, cristal y térmicos", h: "productos.html#vaso" },
    { img: "m-hoodie.jpg", t: "Ropa", s: "Sudadera, camiseta y tote bag", h: "productos.html#ropa" },
  ];
  const TRI_TES = [
    { img: "p-hojicha.jpg", t: "Hojicha", s: "Tostado, casi sin cafeína", h: "productos.html#te" },
    { img: "p-sencha.jpg", t: "Sencha", s: "Hoja entera, tres vertidos", h: "productos.html#te" },
    { img: "p-pack3.jpg", t: "Pack 3 botes", s: "Prueba los tres grados", h: "productos.html#matcha" },
  ];

  /* ---------------- franja rosa superior: estática (sin movimiento), mensajes
     separados por punto blanco y las redes del pie junto a «Únete» ---------------- */
  const SOCIAL_ICON = {
    instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1.2" fill="currentColor" stroke="none"/></svg>',
    tiktok: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M14 4v10.5a4 4 0 1 1-3.2-3.92"/><path d="M14 6.5c.8 1.8 2.4 2.9 4.5 3"/></svg>',
    youtube: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="2.5" y="5.5" width="19" height="13" rx="4"/><path d="M10.5 9.5v5l4.5-2.5-4.5-2.5Z" fill="currentColor" stroke="none"/></svg>',
    pinterest: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M10 19c.7-2.2 1.4-4.4 1.8-6.2-.9-1.6.1-4 2-4 1.6 0 2.2 1.3 1.8 2.9-.4 1.7-1.3 3.4-1.3 3.4"/><path d="M9.7 15.4c-.5-2 .1-4.4 1.6-5.7"/></svg>',
  };
  function buildBand() {
    const msgs = Z.bandTop.map((t) => '<span class="band__i">' + t + "</span>").join("");
    const soc = '<span class="band__soc">' + Z.brand.social.map((s) =>
      '<a href="' + s.u + '" target="_blank" rel="noopener" aria-label="' + s.k + '" title="' + s.k + '">' +
      (SOCIAL_ICON[s.k.toLowerCase()] || "") + "</a>").join("") + "</span>";
    document.body.insertAdjacentHTML("afterbegin",
      '<div class="band band--static" role="region" aria-label="Envío gratuito desde 35 euros">' +
      '<div class="band__row">' + msgs + soc + "</div></div>");
  }

  /* ---------------- cabecera: más alta, menú centrado y la subpágina
     Contacto bajo Nosotros (con flechita) ---------------- */
  const CHEV = '<svg class="nav__chev" viewBox="0 0 12 8" aria-hidden="true"><path d="M1 1.5 6 6.5l5-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  function buildHeader() {
    const links = NAV.map((n) => {
      const cur = n.k === page ? ' aria-current="page"' : "";
      if (n.k !== "nosotros") return '<a href="' + n.href + '"' + cur + ">" + n.t + "</a>";
      return '<div class="nav__cell"><a class="nav__a" href="' + n.href + '"' + cur + ">" + n.t + CHEV + "</a>" +
        '<div class="nav__drop"><ul><li><a href="nosotros.html#contacto">Contacto <i>&#8594;</i></a></li></ul></div></div>';
    }).join("");
    const head = '<header class="nav"><div class="wrap nav__in">' +
      '<a class="brand" href="index.html" aria-label="ZENQA LIFE · ir al inicio">' + LOGO + '<span class="brand__w">Zenqa Life</span></a>' +
      '<nav class="nav__ul" aria-label="Principal">' + links + "</nav>" +
      '<div class="nav__tools">' +
      '<button class="iconbtn" data-act="search" aria-label="Buscar productos">' + ICON.search + "</button>" +
      '<button class="iconbtn" data-act="cart" aria-label="Ver el carrito">' + ICON.cart + '<b data-cart-count hidden>0</b></button>' +
      '<button class="iconbtn nav__burger" data-act="menu" aria-label="Abrir el menú">' + ICON.menu + "</button>" +
      "</div></div></header>";
    document.body.insertAdjacentHTML("afterbegin", head);
    const cell = document.querySelector(".nav__cell");
    if (cell) {
      const open = (v) => cell.classList.toggle("open", v);
      cell.addEventListener("mouseenter", () => open(true));
      cell.addEventListener("mouseleave", () => open(false));
      cell.addEventListener("focusin", () => open(true));
      cell.addEventListener("focusout", (e) => { if (!cell.contains(e.relatedTarget)) open(false); });
    }
  }

  /* ---------------- pie idéntico en las 5 páginas, sin lead magnet ni newsletter ---------------- */
  function buildFooter() {
    const cols = '<div class="foot__cols">' +
      "<div><h3>Tienda</h3>" + NAV.map((n) => '<p><a class="foot__leg" href="' + n.href + '">' + n.t + "</a></p>").join("") + "</div>" +
      '<div><h3>Ayuda</h3><p><a class="foot__leg" href="nosotros.html#contacto">Contacto</a></p>' +
      '<p><a class="foot__leg" href="matcha.html#ritual">Cómo prepararlo</a></p>' +
      '<p><a class="foot__leg" href="legal.html#envios">Envíos y devoluciones</a></p>' +
      '<p><a class="foot__leg" href="index.html#opiniones">Opiniones</a></p></div></div>';
    const socials = Z.brand.social.map((s) => '<a href="' + s.u + '" target="_blank" rel="noopener" aria-label="' + s.k + '"><span>' + s.k + "</span></a>").join("");
    const pay = ["VISA", "MASTERCARD", "BIZUM", "PAYPAL", "APPLE PAY", "KLARNA"].map((p) => "<span>" + p + "</span>").join("");
    const word = '<svg class="foot__word" viewBox="0 0 640 64" role="img" aria-label="Te matcha vibes">' +
      '<text x="0" y="46" font-size="46" font-weight="900" font-style="italic" letter-spacing="-1.5" fill="none" stroke="#ff6ebc" stroke-width="1.6" textLength="640" lengthAdjust="spacingAndGlyphs">TE MATCHA VIBES</text></svg>';
    const legal = '<a class="link" href="legal.html#aviso">Aviso legal</a><a class="link" href="legal.html#condiciones">Condiciones</a>' +
      '<a class="link" href="legal.html#envios">Envíos</a><a class="link" href="legal.html#devoluciones">Devoluciones</a>' +
      '<a class="link" href="legal.html#privacidad">Privacidad</a><a class="link" href="legal.html#cookies">Cookies</a>';
    document.body.insertAdjacentHTML("beforeend",
      '<footer class="foot"><div class="wrap">' + word +
      '<div class="foot__grid"><div class="col" style="gap:12px">' +
      '<span class="brand">' + LOGO + '<span class="brand__w" style="color:#fff">Zenqa Life</span></span>' +
      '<p class="note" style="color:rgba(255,255,255,.78);max-width:34ch">' + Z.brand.claim + "</p>" +
      '<div class="socials" style="margin-top:2px">' + socials + "</div>" +
      '<div class="pay">' + pay + "</div></div>" + cols + "</div>" +
      '<div class="foot__claim"><span>© 2026 Zenqa Life · tienda de demostración (destino: Shopify)</span><span>' + legal + "</span></div>" +
      "</div></footer>");
  }

  /* ---------------- únete (la misma sección en todas las páginas) ---------------- */
  function mountJoin() {
    $$("[data-join]").forEach((host) => {
      const socials = Z.brand.social.map((s) => '<a href="' + s.u + '" target="_blank" rel="noopener">' + s.k + " <i>" + s.h + "</i></a>").join("");
      host.outerHTML = '<section class="join" id="unete"><div class="wrap join__in">' +
        '<div class="col" style="gap:12px"><span class="kicker">Redes sociales</span>' +
        '<h2 class="d d-2">Únete al <span class="hl">universo</span> Zenqa</h2>' +
        '<p class="note" style="color:rgba(18,22,15,.72);max-width:42ch">Recetas, lanzamientos y ofertas antes que nadie. Y un montón de vídeos de espuma verde a cámara lenta.</p>' +
        '<div class="socials">' + socials + "</div></div>" +
        '<div class="join__card"><h3 class="d d-4">Newsletter Zenqa</h3>' +
        '<p class="note">Cada dos semanas: una receta, un consejo de preparación y una oferta solo para suscriptores.</p>' +
        '<form data-form="news" novalidate>' +
        '<div class="subscribe"><input type="email" name="email" placeholder="tu@email.com" aria-label="Tu email" required>' +
        '<button class="btn btn--pink" type="submit">Suscribirme</button></div>' +
        '<label class="consent"><input type="checkbox" name="priv" required> Acepto la <a class="link" href="legal.html#privacidad">política de privacidad</a>.</label>' +
        '<p class="err" data-err hidden>Necesitamos un email válido y tu consentimiento.</p>' +
        "</form></div></div></section>";
    });
  }

  /* ---------------- fichas ---------------- */
  function catOf(p) { const c = Z.categories.find((x) => x.id === p.cat); return c ? c.name : "Zenqa"; }
  function rateLine(p) {
    return '<p class="card__r"><span class="card__rate"><i class="st">' + Z.stars(p.rating) + "</i><b>" + p.rating + '</b><span class="muted">(' + p.reviews + ")</span></span>" +
      (p.stock <= 20 ? '<b class="card__urg">quedan ' + p.stock + " uds</b>" : "") + "</p>";
  }
  function cardHTML(p) {
    const off = p.compareAt ? Math.round((1 - p.price / p.compareAt) * 100) : 0;
    return '<article class="card" id="' + p.id + '">' +
      '<a class="card__img" href="#' + p.id + '" data-act="qv" data-id="' + p.id + '">' +
      '<img src="assets/img/' + p.img + '" alt="' + p.name + '" loading="lazy" width="600" height="750">' +
      (p.badge ? '<span class="tag card__flag">' + p.badge + "</span>" : "") + "</a>" +
      '<p class="card__kt">' + catOf(p) + (off ? ' · <span style="color:var(--pink-deep)">−' + off + " %</span>" : "") + "</p>" +
      '<h3 class="card__t"><a href="#' + p.id + '" data-act="qv" data-id="' + p.id + '">' + p.name + "</a></h3>" +
      rateLine(p) +
      '<div class="card__buy"><b class="price">' + Z.money(p.price) + (p.compareAt ? "<s>" + Z.money(p.compareAt) + "</s>" : "") + "</b>" +
      '<div class="card__acts"><button class="btn btn--pink" data-act="add" data-id="' + p.id + '">Añadir</button>' +
      '<button class="btn" data-act="qv" data-id="' + p.id + '">Ver ficha</button></div></div></article>';
  }

  /* ---------------- hueco de producto: foto + nombre + precio + dos botones ---------------- */
  function spotHTML(p) {
    const off = p.compareAt ? Math.round((1 - p.price / p.compareAt) * 100) : 0;
    return '<a class="frame" href="#' + p.id + '" data-act="qv" data-id="' + p.id + '" aria-label="Ver la ficha de ' + p.name + '">' +
      '<img src="assets/img/' + p.img + '" alt="' + p.name + '" width="900" height="1100">' +
      (p.badge ? '<span class="tag card__flag">' + p.badge + "</span>" : "") + "</a>" +
      '<p class="card__kt" style="margin-top:10px">' + catOf(p).toUpperCase() + (off ? " \u00b7 \u2212" + off + " %" : "") + "</p>" +
      '<h3 class="d d-4" style="letter-spacing:-.03em">' + p.name + "</h3>" +
      '<p class="row" style="align-items:baseline;gap:10px"><b class="price price--lg">' + Z.money(p.price) + "</b>" +
      (p.compareAt ? '<s class="note">' + Z.money(p.compareAt) + "</s>" : "") +
      '<span class="note">' + (p.unit || (p.specs && p.specs.Contenido) || "unidad") + "</span></p>" +
      '<div class="buy"><button class="btn btn--pink" data-act="add" data-id="' + p.id + '">A\u00f1adir al carrito</button>' +
      '<button class="btn" data-act="qv" data-id="' + p.id + '">Ver ficha de producto</button></div>';
  }
  function mountSpots() {
    $$("[data-spot]").forEach((el) => {
      const p = Z.byId[el.dataset.spot];
      if (!p) { el.remove(); return; }
      el.innerHTML = spotHTML(p);
    });
  }
  function mountInc() {
    $$("[data-inc]").forEach((el) => {
      const items = el.dataset.inc === "basico"
        ? Z.kitIncluye.slice(0, 3)
        : Z.kitIncluye;
      el.innerHTML = '<ul class="inc">' + items.map((x) => "<li><span>" + x[0] + "</span><span>" + x[1] + "</span></li>").join("") + "</ul>";
    });
  }

  /* ---------------- selecciones de producto y grados ---------------- */
  function mountPicks() {
    const host = $("#grid-picks");
    if (!host) return;
    const ids = (host.dataset.picks || "te-ceremonial,te-culinario,kit-basico,vaso-latte,botella-ice,pack-descubrimiento").split(",");
    host.innerHTML = ids.map((i) => Z.byId[i.trim()]).filter(Boolean).map(cardHTML).join("");
  }
  function mountProcess() {
    const host = $("#proceso");
    if (!host) return;
    host.innerHTML = '<div class="proc">' + Z.proceso.map((c) =>
      '<article class="proc__i"><p class="proc__top"><span class="proc__n">' + c.n + '</span><span class="proc__idx">' + c.i + '</span></p>' +
      '<h3>' + c.t + '</h3><p class="note">' + c.d + '</p></article>').join("") + '</div>';
  }
  function mountNosStats() {
    const host = $("#nosStats");
    if (!host) return;
    host.innerHTML = Z.nosStats.map((s) => '<div class="stat2"><b>' + s[0] + '</b><span class="note">' + s[1] + "</span></div>").join("");
  }
  function mountGrades() {
    const host = $("#grades");
    if (!host) return;
    host.innerHTML = '<div class="tiles">' + Z.grades.map((g) => '<article class="tile"><img src="assets/img/' + g.img + '" alt="' + g.t + '" loading="lazy">' +
      '<span class="tag' + (g.hot ? " tag--pink" : " tag--sage") + '">' + g.k + "</span>" +
      '<h3 class="d d-4">' + g.t + "</h3><p class=\"note\">" + g.d + "</p>" +
      '<p style="margin-top:2px">' + g.use + "</p></article>").join("") + "</div>";
  }
  /* ---------------- grupos de la página de productos ---------------- */
  function mountGroups() {
    const host = $("#groups");
    if (!host) return;
    host.innerHTML = Z.categories.map((c) => {
      const items = Z.products.filter((p) => p.cat === c.id);
      const z = Z.categories.indexOf(c);
      return '<section class="sec sec--tight' + (z % 2 ? " sec--paper" : "") + '" id="' + c.id + '">' +
        '<div class="wrap"><div class="sec__h"><div><span class="kicker kicker--sage">' + items.length + ' productos</span>' +
        '<h2 class="d d-2">' + c.name + "</h2></div><p class=\"note\">" + c.note + "</p></div>" +
        '<div class="pgrid">' + items.map(cardHTML).join("") + "</div></div></section>";
    }).join("");
  }

  /* ---------------- reseñas, recetas, triángulos, ways, matcha ---------------- */
  function mountReviews() {
    const host = $("#grid-reviews");
    if (!host) return;
    const n = +(host.dataset.n || 3);
    host.innerHTML = Z.reviews.slice(0, n).map((v) => {
      const p = Z.byId[v.p];
      return '<article class="quote"><div class="st">' + Z.stars(v.r) + "</div>" +
        '<p class="quote__txt">«' + v.txt + '»</p>' +
        '<footer class="quote__f"><i>' + v.n[0] + "</i><span><b>" + v.n + "</b> · " + v.c + " · " + v.t +
        (p ? '<br><a class="link" href="#' + p.id + '" data-act="qv" data-id="' + p.id + '">Compró ' + p.name + "</a>" : "") +
        "</span></footer></article>";
    }).join("");
  }
  function recipeCard(r) {
    return '<a class="rcard" href="#' + r.id + '" data-act="recipe" data-id="' + r.id + '">' +
      '<div class="rcard__m"><img src="assets/img/' + r.img + '" alt="' + r.name + '" loading="lazy"></div>' +
      '<div class="rcard__b"><h3>' + r.name + "</h3><p>" + r.short + "</p>" +
      '<p class="rcard__go">' + r.kind + " · " + r.time + "</p></div></a>";
  }
  function mountRecipes() {
    const some = $("#grid-recipes");
    if (some) some.innerHTML = [Z.recipes[1], Z.recipes[2], Z.recipes[5]].filter(Boolean).map(recipeCard).join("");
    const all = $("#grid-recipes-all");
    if (all) all.innerHTML = Z.recipes.map(recipeCard).join("");
  }
  function mountTri(id, data) {
    const host = $(id);
    if (!host) return;
    host.innerHTML = data.map((t) => '<a class="tri__i" href="' + t.h + '"><img src="assets/img/' + t.img + '" alt="' + t.t + '" loading="lazy">' +
      '<span class="tri__b"><b class="d">' + t.t + "</b><br><span>" + t.s + "</span></span></a>").join("");
  }
  function mountWays() {
    const host = $("#ways");
    if (!host) return;
    host.innerHTML = Z.ways.map((w) => '<span class="chip">' + w.t + " <i>" + w.s + "</i></span>").join("");
  }
  function mountVs() {
    const host = $("#vsTable");
    if (!host) return;
    const col = (side, cls) => {
      const p = Z.byId[side.id];
      return '<article class="vs__c' + cls + '"><p class="who">' + side.who + "</p>" +
        "<h3>" + p.name + "</h3>" +
        '<ul>' + side.list.map((x) => "<li><b>" + x[0] + "</b><span>" + x[1] + "</span></li>").join("") + "</ul>" +
        '<div class="row row--wrap" style="margin-top:4px"><button class="btn btn--pink btn--auto" data-act="add" data-id="' + p.id + '">Añadir · ' + Z.money(p.price) + "</button>" +
        '<button class="btn btn--auto" data-act="qv" data-id="' + p.id + '">Ver ficha</button></div></article>';
    };
    host.innerHTML = col(Z.vsMatcha.a, "") + col(Z.vsMatcha.b, " vs__c--pink");
  }
  function mountQuality() {
    const host = $("#quality");
    if (!host) return;
    host.innerHTML = '<dl class="specs">' + Z.quality.map((x) => "<div><dt>" + x[0] + "</dt><dd>" + x[1] + "</dd></div>").join("") + "</dl>";
  }
  function mountRitual() {
    const host = $("#ritual4");
    if (!host) return;
    host.innerHTML = '<div class="steps">' + Z.ritual4.map((s, i) => '<article class="step"><span class="step__n">' + (i + 1) + "</span>" +
      "<h3>" + s.t + "</h3><p>" + s.d + "</p></article>").join("") + "</div>";
  }
  function mountEnergy() {
    const host = $("#energy");
    if (!host) return;
    host.innerHTML = '<div class="vs"><article class="vs__c"><h3>Matcha Zenqa</h3><ul>' +
      Z.energy.map((r) => "<li><b>" + r.k + "</b><span>" + r.m + "</span></li>").join("") + "</ul></article>" +
      '<article class="vs__c"><h3>Lo que tomas ahora</h3><ul>' +
      Z.energy.map((r) => "<li><b>" + r.k + "</b><span>" + r.c + "</span></li>").join("") + "</ul>" +
      '<p class="note" style="margin-top:6px">El café no es el enemigo: si te sienta bien, bébelo por la mañana. Esto solo explica por qué la tarde cambia.</p></article></div>';
  }

  /* ---------------- capas: una abierta cada vez ---------------- */
  const PANES = ["cart", "menu", "search", "qv", "lead", "recipe"];
  let openPane = null;
  function paneOpen(name) {
    if (openPane && openPane !== name) paneClose();
    const el = document.getElementById(name);
    if (!el) return;
    el.dataset.open = "true";
    openPane = name;
    document.body.classList.add("lock");
    const f = el.querySelector("[data-autofocus]");
    if (f) setTimeout(() => { try { f.focus(); } catch (e) {} }, 60);
  }
  function paneClose() {
    if (!openPane) return;
    const el = document.getElementById(openPane);
    if (el) el.dataset.open = "false";
    openPane = null;
    document.body.classList.remove("lock");
  }
  function buildPanes() {
    document.body.insertAdjacentHTML("beforeend",
      '<div class="ov" id="cart" data-open="false" role="dialog" aria-modal="true" aria-label="Carrito">' +
      '<div class="ov__scrim" data-act="close"></div><div class="drawer">' +
      '<div class="ov__h"><span class="d">Tu carrito</span><button class="x" data-act="close" aria-label="Cerrar">' + ICON.x + "</button></div>" +
      '<div class="ov__b" id="cartItems"></div>' +
      '<div class="ov__f"><div class="ship" id="shipBox"><div class="ship__bar"><b id="shipBar" style="width:0"></b></div><span id="shipMsg"></span></div>' +
      '<div class="row" style="justify-content:space-between;align-items:baseline"><b class="note">Total</b><b class="price price--lg" id="cartTotal">0,00 €</b></div>' +
      '<button class="btn btn--pink" data-act="checkout" style="width:100%">Finalizar compra</button></div></div></div>' +

      '<div class="ov" id="menu" data-open="false" role="dialog" aria-modal="true" aria-label="Menú">' +
      '<div class="ov__scrim" data-act="close"></div><div class="drawer drawer--left msheet" style="background:var(--cream)">' +
      '<div class="msheet__top"><span class="brand">' + LOGO + '<span class="brand__w">Zenqa Life</span></span>' +
      '<button class="x" data-act="close" aria-label="Cerrar el menú" style="margin-left:auto">' + ICON.x + "</button></div>" +
      '<div class="ov__b"><nav>' + NAV.map((n) => {
        const cur = n.k === page ? ' aria-current="page"' : "";
        const sub = n.k === "nosotros" ? '<a class="msheet__sub" href="nosotros.html#contacto">Contacto <i>→</i></a>' : "";
        return '<a href="' + n.href + '"' + cur + ">" + n.t + "<i>→</i></a>" + sub;
      }).join("") + "</nav></div></div></div>" +

      '<div class="ov" id="search" data-open="false" role="dialog" aria-modal="true" aria-label="Buscar">' +
      '<div class="ov__scrim" data-act="close"></div><div class="search"><div class="wrap">' +
      '<input id="q" type="search" placeholder="Buscar matcha, vaso, kit…" data-autofocus aria-label="Buscar" autocomplete="off">' +
      '<div class="sres" id="sres"></div></div></div></div>' +

      '<div class="ov" id="qv" data-open="false" role="dialog" aria-modal="true" aria-label="Ficha de producto">' +
      '<div class="ov__scrim" data-act="close"></div><div class="modal"><div class="ov__h"><span class="d">Ficha de producto</span>' +
      '<button class="x" data-act="close" aria-label="Cerrar">' + ICON.x + "</button></div><div class=\"ov__b\"><div class=\"qv\" id=\"qvBody\"></div></div></div></div>" +

      '<div class="ov" id="recipe" data-open="false" role="dialog" aria-modal="true" aria-label="Receta">' +
      '<div class="ov__scrim" data-act="close"></div><div class="modal"><div class="ov__h"><span class="d">Receta y guía</span>' +
      '<button class="x" data-act="close" aria-label="Cerrar">' + ICON.x + "</button></div><div class=\"ov__b\"><div class=\"qv\" id=\"recipeBody\"></div></div></div></div>" +

      '<div class="ov" id="lead" data-open="false" role="dialog" aria-modal="true" aria-label="Guía gratuita">' +
      '<div class="ov__scrim" data-act="close"></div><div class="modal"><div class="ov__h"><span class="d">La guía gratis</span>' +
      '<button class="x" data-act="close" aria-label="Cerrar">' + ICON.x + "</button></div><div class=\"ov__b\"><div class=\"lead\" id=\"leadBody\" style=\"box-shadow:none\"></div></div></div></div>");
  }

  /* ---------------- ficha rápida ---------------- */
  function quickView(id) {
    const p = Z.byId[id];
    if (!p) return;
    const rev = Z.reviews.find((r) => r.p === p.id) || Z.reviews.find((r) => Z.byId[r.p] && Z.byId[r.p].cat === p.cat) || Z.reviews[0];
    const rel = Z.products.filter((x) => x.cat === p.cat && x.id !== p.id).slice(0, 3);
    $("#qvBody").innerHTML =
      '<div class="qv__m"><img src="assets/img/' + p.img + '" alt="' + p.name + '"></div>' +
      '<div class="qv__kt">' + (p.badge ? '<span class="tag">' + p.badge + "</span>" : "") + '<span class="tag tag--sage">' + catOf(p) + "</span></div>" +
      "<h2>" + p.name + "</h2>" + rateLine(p) +
      '<p class="qv__hook">' + p.hook + "</p>" +
      '<p class="qv__pitch">' + p.pitch + "</p>" +
      (p.notes ? '<dl class="qv__notes">' + Object.keys(p.notes).slice(0, 4).map((k) => "<div><dt>" + k + "</dt><dd>" + p.notes[k] + "</dd></div>").join("") + "</dl>" : "") +
      '<ul class="qv__bullets">' + p.bullets.slice(0, 3).map((b) => "<li>" + b + "</li>").join("") + "</ul>" +
      (rev ? '<blockquote class="quote"><div class="st">' + Z.stars(rev.r) + "</div><p class=\"quote__txt\">«" + rev.txt + '»</p><footer class="quote__f"><i>' + rev.n[0] + "</i><span><b>" + rev.n + "</b> · " + rev.c + "</span></footer></blockquote>" : "") +
      '<div class="qv__buy"><b class="price price--lg">' + Z.money(p.price) + (p.compareAt ? "<s>" + Z.money(p.compareAt) + "</s>" : "") + "</b>" +
      '<button class="btn btn--pink" data-act="add" data-id="' + p.id + '" data-close="true">Añadir al carrito</button>' +
      '<a class="btn" href="productos.html#' + p.id + '">Ver en la tienda</a></div>' +
      (rel.length ? '<p class="kicker kicker--sage" style="margin-top:6px">Va bien con</p><div class="qv__rel">' +
        rel.map((x) => '<button data-act="qv" data-id="' + x.id + '"><img src="assets/img/' + x.img + '" alt=""><span>' + x.name + "</span><b class=\"note\">" + Z.money(x.price) + "</b></button>").join("") + "</div>" : "");
    paneOpen("qv");
  }

  function recipeView(id) {
    const r = Z.recipeById[id];
    if (!r) return;
    const p = Z.byId[r.product] || Z.byId["te-ceremonial"];
    $("#recipeBody").innerHTML =
      '<div class="qv__m"><img src="assets/img/' + r.img + '" alt="' + r.name + '"></div>' +
      '<div class="rd__meta"><span>' + r.kind + "</span><span>" + r.time + "</span><span>" + r.level + "</span></div>" +
      "<h2>" + r.name + "</h2><p class=\"qv__hook\">" + r.short + "</p>" +
      '<p class="qv__pitch">' + r.why + "</p>" +
      '<ol class="rd__steps">' + r.steps.map((s, i) => "<li><b>" + (i + 1) + "</b><span><b>" + s.s + "</b><br>" + s.d + "</span></li>").join("") + "</ol>" +
      '<div class="qv__buy"><img src="assets/img/' + p.img + '" alt="" style="width:52px;height:52px;object-fit:cover;border-radius:8px;border:var(--edge)">' +
      '<span style="flex:1 1 120px"><b>' + p.name + "</b><br><span class=\"note\">el que mejor queda aquí</span></span>" +
      '<button class="btn btn--pink" data-act="add" data-id="' + p.id + '" data-close="true">' + Z.money(p.price) + "</button></div>";
    paneOpen("recipe");
  }

  /* ---------------- carrito ---------------- */
  const readCart = () => { try { return JSON.parse(localStorage.getItem(LS_CART)) || []; } catch (e) { return []; } };
  const writeCart = (c) => { localStorage.setItem(LS_CART, JSON.stringify(c)); paintCart(); };
  function addToCart(id, qty) {
    const c = readCart();
    const l = c.find((x) => x.id === id);
    if (l) l.q = Math.min(l.q + (qty || 1), 20); else c.push({ id, q: qty || 1 });
    writeCart(c);
    const p = Z.byId[id];
    toast(p ? p.name + " en el carrito" : "Añadido al carrito");
  }
  function paintCart() {
    const c = readCart();
    const n = c.reduce((a, x) => a + x.q, 0);
    const total = c.reduce((a, x) => a + (Z.byId[x.id] ? Z.byId[x.id].price * x.q : 0), 0);
    $$("[data-cart-count]").forEach((el) => { el.textContent = n; el.hidden = n === 0; });
    const box = $("#cartItems");
    if (box) {
      if (!c.length) {
        box.innerHTML = '<div class="empty">' + ICON.bag + "<p><b>El carrito está vacío</b></p>" +
          '<p class="note">Empieza por el bote con el que no se falla: ceremonial de Uji, 54 g para 27 tazas.</p>' +
          '<div class="row row--wrap" style="justify-content:center"><button class="btn btn--pink" data-act="add" data-id="te-ceremonial">Añadir · 29,95 €</button>' +
          '<a class="btn" href="productos.html">Ver la tienda</a></div></div>';
      } else {
        box.innerHTML = c.map((l) => {
          const p = Z.byId[l.id];
          if (!p) return "";
          return '<div class="citem"><img src="assets/img/' + p.img + '" alt="">' +
            "<div><h4>" + p.name + '</h4><p class="note">' + Z.money(p.price) + " / unidad</p>" +
            '<span class="qty"><button data-act="minus" data-id="' + p.id + '" aria-label="Quitar uno">–</button><b>' + l.q + "</b>" +
            '<button data-act="plus" data-id="' + p.id + '" aria-label="Sumar uno">+</button></span></div>' +
            '<div><b class="p">' + Z.money(p.price * l.q) + '</b><br><button class="del" data-act="del" data-id="' + p.id + '">Quitar</button></div></div>';
        }).join("");
      }
    }
    const t = $("#cartTotal");
    if (t) t.textContent = Z.money(total);
    const bar = $("#shipBar");
    const msg = $("#shipMsg");
    if (bar && msg) {
      const need = Z.brand.freeShip;
      const pc = Math.min(100, Math.round((total / need) * 100));
      bar.style.width = pc + "%";
      msg.innerHTML = total >= need
        ? "✓ <b>Envío gratis</b> aplicado · te llega en 24-48 h"
        : "Te faltan <b>" + Z.money(need - total) + "</b> para el envío gratis";
    }
  }

  /* ---------------- buscador ---------------- */
  function search(q) {
    const t = q.trim().toLowerCase();
    const host = $("#sres");
    if (!host) return;
    if (t.length < 2) {
      host.innerHTML = '<p class="note">Escribe dos letras: <b>kit</b>, <b>vaso</b>, <b>hielo</b>, <b>sin cafeína</b>…</p>' +
        '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">' + ["ceremonial", "culinario", "kit", "vaso", "helado", "sudadera"].map((k) => '<button class="chip" data-act="sug" data-q="' + k + '">' + k + "</button>").join("") + "</div>";
      return;
    }
    const hit = (s) => s.toLowerCase().indexOf(t) >= 0;
    const ps = Z.products.filter((p) => hit(p.name) || hit(p.hook) || hit(p.benefits.join(" ")) || hit(p.pitch) || hit(catOf(p))).slice(0, 6);
    const rs = Z.recipes.filter((r) => hit(r.name) || hit(r.short) || hit(r.why)).slice(0, 3);
    host.innerHTML =
      (ps.length ? ps.map((p) => '<a href="#' + p.id + '" data-act="qv" data-id="' + p.id + '"><img src="assets/img/' + p.img + '" alt=""><span><b>' + p.name + "</b><span>" + p.hook.slice(0, 62) + "…</span></span><b class=\"price\">" + Z.money(p.price) + "</b></a>").join("") : "") +
      (rs.length ? rs.map((r) => '<a href="#' + r.id + '" data-act="recipe" data-id="' + r.id + '"><img src="assets/img/' + r.img + '" alt=""><span><b>' + r.name + "</b><span>" + r.kind + " · " + r.time + "</span></span></a>").join("") : "") +
      (!ps.length && !rs.length ? '<p class="note">No encontramos nada con <b>' + q + "</b>. Prueba con «matcha», «kit» o «vaso», o escríbenos por WhatsApp y te lo buscamos.</p>" : "");
  }

  /* ---------------- formularios: guía (con PDF y cupón) y newsletter ---------------- */
  const okMail = (v) => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v);
  function leadForm(inline) {
    const id = inline ? "i" : "m";
    return '<form data-form="lead" class="lead__grid" novalidate>' +
      '<div class="lead__col">' +
      '<span class="kicker kicker--sage">Empieza sin riesgo</span>' +
      '<h3 class="d d-3 lead__h">Descarga la <i>guía Zenqa</i> y pruébala</h3>' +
      '<p class="note">Antes de comprar, lee el PDF de 4 páginas: recetas, dosis, conservación y hoja de cata. Si el matcha no te convence, lo devuelves en 30 días.</p>' +
      '<div class="field"><label class="sr" for="le-' + id + '">Tu email</label>' +
      '<input id="le-' + id + '" type="email" name="email" placeholder="tu@email.com" required></div>' +
      '<label class="consent"><input type="checkbox" name="priv" required> Acepto recibir la guía y la <a class="link" href="legal.html#privacidad">política de privacidad</a>.</label>' +
      '<p class="err" data-err hidden>Necesitamos un email válido y tu consentimiento.</p>' +
      '<button class="btn btn--pink" type="submit">Descargar la guía gratis</button></div>' +
      '<div class="mock" aria-hidden="true"><span>PDF · 4 pág.</span><b>Guía Matcha<br>Zenqa Life</b><span>Recetas · dosis · cata</span></div>' +
      "</form>";
  }
  function leadOk(mail) {
    return '<div class="ok"><p class="kicker kicker--sage">Listo</p>' +
      "<p><b>Te hemos enviado la guía a " + mail + "</b><br><span class=\"note\">Revisa la carpeta de promociones si no aparece en un minuto.</span></p>" +
      '<div class="row"><a class="btn btn--forest" href="assets/downloads/guia-matcha-zenqa.pdf" download>Descargar el PDF</a></div>' +
      '<p class="note">Envíos gratis desde 35 € · 30 días de prueba con el bote abierto.</p></div>';
  }
  function mountLead() {
    $$("[data-lead]").forEach((host) => { host.innerHTML = leadForm(host.dataset.lead === "inline"); });
  }
  function wireForms() {
    $$("form[data-form]").forEach((f) => {
      if (f.dataset.wired) return;
      f.dataset.wired = "1";
      f.addEventListener("submit", (ev) => {
        ev.preventDefault();
        const mail = f.querySelector('input[type="email"]');
        const priv = f.querySelector('input[name="priv"]');
        const err = f.querySelector("[data-err]");
        let bad = false;
        [mail, priv].forEach((i) => {
          if (!i) return;
          const wrong = i.type === "checkbox" ? !i.checked : !okMail(i.value.trim());
          i.setAttribute("aria-invalid", wrong ? "true" : "false");
          if (wrong) bad = true;
        });
        if (err) err.hidden = !bad;
        if (bad) { if (mail && !okMail(mail.value)) mail.focus(); return; }
        const host = f.parentElement;
        if (f.dataset.form === "lead") {
          try { localStorage.setItem(LS_LEAD, mail.value.trim()); } catch (e) {}
          host.innerHTML = leadOk(mail.value.trim());
          toast("Guía enviada · revisa tu correo");
        } else if (f.dataset.form === "contact") {
          const need = ["name", "email", "msg"].map((n) => f.querySelector('[name="' + n + '"]')).filter(Boolean);
          const bad2 = need.some((i) => (i.type === "email" ? !okMail(i.value.trim()) : i.value.trim().length < 4));
          const e2 = f.querySelector("[data-err]");
          if (e2) e2.hidden = !bad2;
          if (bad2) { need[0].focus(); return; }
          host.innerHTML = '<div class="ok"><p class="kicker kicker--sage">Recibido</p>' +
            '<p><b>Gracias, ' + (f.querySelector('[name="name"]').value.trim().split(" ")[0] || "hola") + '.</b><br>' +
            '<span class="note">Te contestamos a ' + f.querySelector('[name="email"]').value.trim() + " en menos de 24 h laborables. Si es sobre un pedido, ten el número a mano: suele ir más rápido por WhatsApp.</span></p>" +
            '<p class="note">Horario de atención: L-V 9:00-18:00 CET · +34 600 00 00 00 (demo).</p></div>';
          toast("Mensaje enviado (demo)");
        } else {
          host.innerHTML = '<div class="ok"><p class="kicker kicker--sage">Dentro</p><p><b>Ya estás en la lista.</b><br><span class="note">Cada dos semanas: una receta, un consejo y una oferta. Baja cuando quieras, sin dramas.</span></p></div>';
          toast("Suscripción confirmada");
        }
      });
    });
  }

  /* ---------------- extras ---------------- */
  let tId = null;
  function toast(msg) {
    if (openPane) return;
    let el = $("#toast");
    if (!el) { document.body.insertAdjacentHTML("beforeend", '<div class="toast" id="toast" role="status" aria-live="polite"></div>'); el = $("#toast"); }
    el.textContent = msg;
    el.classList.add("on");
    clearTimeout(tId);
    tId = setTimeout(() => el.classList.remove("on"), 2600);
  }
  function reveal() {
    const els = $$(".rv");
    if (!els.length) return;
    if (reduce || !("IntersectionObserver" in window)) { els.forEach((e) => e.classList.add("is-in")); return; }
    const io = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } }), { rootMargin: "0px 0px -8%" });
    els.forEach((e) => io.observe(e));
  }

  /* ---------------- un solo sitio para todos los clics ---------------- */
  function wire() {
    document.addEventListener("click", (ev) => {
      const a = ev.target.closest("[data-act]");
      if (!a) return;
      const act = a.dataset.act;
      const id = a.dataset.id;
      if (act !== "add") ev.preventDefault();
      switch (act) {
        case "add": {
          addToCart(id, 1);
          const label = a.innerHTML;
          a.innerHTML = "Añadido \u2713";
          a.classList.add("is-done");
          setTimeout(() => { a.innerHTML = label; a.classList.remove("is-done"); }, 1300);
          if (a.dataset.close) setTimeout(paneClose, 260);
          break;
        }
        case "qv": quickView(id); break;
        case "recipe": recipeView(id); break;
        case "cart": paintCart(); paneOpen("cart"); break;
        case "menu": paneOpen("menu"); break;
        case "search": paneOpen("search"); setTimeout(() => { const q = $("#q"); if (q) search(q.value); }, 80); break;
        case "lead": { const b = $("#leadBody"); if (b && !b.dataset.filled) { b.innerHTML = leadForm(false); b.dataset.filled = "1"; wireForms(); } paneOpen("lead"); break; }
        case "close": paneClose(); break;
        case "plus": case "minus": case "del": {
          const c = readCart();
          const l = c.find((x) => x.id === id);
          if (l) {
            if (act === "plus") l.q = Math.min(20, l.q + 1);
            else if (act === "minus") { l.q -= 1; if (l.q < 1) c.splice(c.indexOf(l), 1); }
            else c.splice(c.indexOf(l), 1);
          }
          writeCart(c);
          break;
        }
        case "sug": { const q = $("#q"); if (q) { q.value = a.dataset.q; search(q.value); q.focus(); } break; }
        case "checkout": toast("El checkout se activa al conectar Shopify · el carrito ya funciona"); break;
      }
    });
    document.addEventListener("keydown", (ev) => { if (ev.key === "Escape") paneClose(); });
    const q = $("#q");
    if (q) q.addEventListener("input", () => search(q.value));
  }

  /* ---------------- arranque ---------------- */
  buildHeader();
  buildBand();
  buildFooter();
  buildPanes();
  mountJoin();
  mountSpots();
  mountInc();
  mountPicks();
  mountGrades();
  mountProcess();
  mountNosStats();
  mountGroups();
  mountReviews();
  mountRecipes();
  mountTri("#grid-tri", TRI_HOME);
  mountTri("#grid-tes", TRI_TES);
  mountWays();
  mountVs();
  mountQuality();
  mountRitual();
  mountEnergy();
  mountLead();
  wire();
  wireForms();
  paintCart();
  reveal();
  document.addEventListener("zq:forms", wireForms);
})();
