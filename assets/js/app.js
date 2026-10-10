/* ZENQA LIFE · app.js (v2)
   Header/footer compartidos + gestor de overlays (un solo panel a la vez) + carrito real
   con localStorage + ficha rápida + buscador + lead magnet con validación. */
(function () {
  "use strict";
  const Z = window.ZENQA;
  const page = document.body.dataset.page || "home";
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const mq = (m) => (window.matchMedia ? window.matchMedia("(min-width: " + m + "px)").matches : window.innerWidth >= m);
  const LS = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
  };
  const ICON = {
    cart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 5h2l2.2 10.2h10L20 8H6.2"/><circle cx="9.5" cy="19.5" r="1.5"/><circle cx="17.5" cy="19.5" r="1.5"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/></svg>',
    burger: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="m4 12.5 5 5L20 6.5"/></svg>',
    truck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M2 6h11v10H2zM13 9h4l3 3v4h-7z"/><circle cx="6" cy="18" r="1.7"/><circle cx="17" cy="18" r="1.7"/></svg>',
    leaf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M20 4c-9 0-15 4-15 10a6 6 0 0 0 6 6c6 0 9-6 9-16z"/><path d="M6 20C9 15 13 11 18 8"/></svg>',
    bolt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M13 2 5 14h6l-1 8 8-12h-6l1-8z"/></svg>',
    return: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 9h12a5 5 0 1 1 0 10H8"/><path d="m8 5-4 4 4 4"/></svg>',
    bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 8h14l-1 12H6L5 8z"/><path d="M9 8a3 3 0 0 1 6 0"/></svg>',
  };

  /* ==================================================================
     1. Gestor de overlays — un único panel abierto a la vez.
        Nada de dos × solapados ni de "cierro uno y se abre el otro".
     ================================================================== */
  const Panes = {
    cart: { el: null, kind: "drawer" },
    search: { el: null, kind: "panel" },
    menu: { el: null, kind: "sheet" },
    lead: { el: null, kind: "modal" },
    qv: { el: null, kind: "modal" },
  };
  let openName = null;
  function paneOpen(name) {
    if (!Panes[name] || !Panes[name].el) return;
    if (openName === name) return paneClose(name);
    if (openName) hardClose(openName);
    openName = name;
    Panes[name].el.dataset.open = "true";
    document.body.classList.add("ov", "lock");
    document.documentElement.style.setProperty("--scroll-lock", window.scrollY + "px");
    const f = Panes[name].el.querySelector("[data-autofocus]");
    if (f) setTimeout(() => f.focus({ preventScroll: true }), 60);
    Panes[name].el.dispatchEvent(new CustomEvent("pane:open", { bubbles: true }));
  }
  function hardClose(name) {
    if (!name || !Panes[name] || !Panes[name].el) return;
    Panes[name].el.dataset.open = "false";
  }
  function paneClose(name) {
    if (name && openName !== name) return;
    hardClose(openName);
    openName = null;
    document.body.classList.remove("ov", "lock");
    document.documentElement.style.removeProperty("--scroll-lock");
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { if (openName) { paneClose(); return; } closeAllDrops(); }
  });
  document.addEventListener("click", (e) => {
    if (e.target.classList && e.target.classList.contains("scrim")) paneClose();
    if (!e.target.closest(".nav__cell") && !e.target.closest(".msheet")) closeAllDrops();
  });
  function closeAllDrops() { $$(".nav__cell.open").forEach((c) => { c.classList.remove("open"); const b = $(".nav__a", c); if (b) b.setAttribute("aria-expanded", "false"); }); }

  /* ==================================================================
     2. Carrito
     ================================================================== */
  const CK = "zenqa_cart";
  let cart = LS.get(CK, []);
  const save = () => LS.set(CK, cart);
  const lines = () => cart.reduce((a, l) => a + l.q, 0);
  const subtotal = () => cart.reduce((a, l) => a + (Z.byId[l.id] ? Z.byId[l.id].price * l.q : 0), 0);
  function addToCart(id, qty, from) {
    const p = Z.byId[id]; if (!p) return;
    qty = qty || 1;
    const i = cart.findIndex((l) => l.id === id);
    if (i >= 0) cart[i].q = Math.min(20, cart[i].q + qty); else cart.push({ id, q: qty });
    save(); renderCart();
    toast((from || "Añadido") + " · " + p.name, "cart");
  }
  function setQty(id, d) {
    const i = cart.findIndex((l) => l.id === id); if (i < 0) return;
    cart[i].q += d;
    if (cart[i].q <= 0) cart.splice(i, 1);
    save(); renderCart();
  }
  function renderCart() {
    const badge = $("[data-cart-count]");
    if (badge) { badge.textContent = lines(); badge.hidden = lines() === 0; }
    const bd = $("#cartItems"), foot = $("#cartFoot");
    if (!bd) return;
    if (!cart.length) {
      bd.innerHTML = '<div class="empty">' + ICON.bag + "<p>Tu carrito está vacío. El matcha ceremonial es lo que más sale hoy.</p>" +
        '<button class="btn btn--buy" data-act="go-shop">Ver la tienda<span class="arw">→</span></button></div>';
      if (foot) foot.hidden = true; return;
    }
    bd.innerHTML = cart.map((l) => {
      const p = Z.byId[l.id]; if (!p) return "";
      return '<article class="citem"><img src="assets/img/' + p.img + '" alt="' + p.name + '">' +
        '<div><h3>' + p.name + '</h3><p class="note">' + Z.money(p.price) + "</p>" +
        '<div class="qty"><button data-act="minus" data-id="' + p.id + '" aria-label="Quitar una unidad">−</button><b>' + l.q +
        '</b><button data-act="plus" data-id="' + p.id + '" aria-label="Añadir una unidad">+</button></div></div>' +
        '<div class="citem__end"><b class="price">' + Z.money(p.price * l.q) + '</b><button data-act="del" data-id="' + p.id + '" class="note">Eliminar</button></div></article>';
    }).join("");
    if (foot) {
      const sub = subtotal(), left = Math.max(0, Z.brand.freeShip - sub), pct = Math.min(100, (sub / Z.brand.freeShip) * 100);
      foot.hidden = false;
      $("#shipMsg").innerHTML = left > 0 ? "Te faltan <b>" + Z.money(left) + "</b> para el envío gratis" : "✔ <b>Envío gratis</b> conseguido";
      $("#shipFill").style.width = pct + "%";
      $("#cartTotal").textContent = Z.money(sub);
    }
  }
  function toast(msg, kind) {
    if (openName) return;                     // con un panel abierto, el propio panel es la confirmación
    let t = $("#toast");
    if (!t) { t = document.createElement("div"); t.id = "toast"; t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
    t.innerHTML = '<span class="k"></span><span>' + msg + "</span>";
    t.classList.add("on");
    clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove("on"), 2600);
    if (kind === "cart") { const b = $("[data-cart-count]"); if (b && b.animate) b.animate([{ transform: "scale(1)" }, { transform: "scale(1.4)" }, { transform: "scale(1)" }], { duration: 420 }); }
  }

  /* ==================================================================
     3. Header / footer compartidos
     ================================================================== */
  const NAV = [
    { k: "home", t: "Inicio", href: "index.html" },
    { k: "shop", t: "Tienda", href: "tienda.html", kids: [
      { t: "Matcha", s: "4", h: "tienda.html#matcha" }, { t: "Kits", s: "4", h: "tienda.html#kit" },
      { t: "Tazas y vasos", s: "4", h: "tienda.html#vaso" }, { t: "Ropa y accesorios", s: "4", h: "tienda.html#ropa" },
      { t: "Ver todo", s: "16", h: "tienda.html" } ] },
    { k: "ritual", t: "Ritual", href: "ritual.html", kids: [
      { t: "Cómo prepararlo", s: "60 seg", h: "ritual.html#pasos" }, { t: "Matcha vs café", s: "", h: "ritual.html#vs" },
      { t: "Recetas y guías", s: "10", h: "recetas.html" }, { t: "Cómo guardar el bote", s: "", h: "recetas.html#conservacion" } ] },
    { k: "nosotros", t: "Nosotros", href: "nosotros.html", kids: [
      { t: "La marca", s: "", h: "nosotros.html" }, { t: "Contacto y envíos", s: "", h: "contacto.html" },
      { t: "Opiniones", s: "1,2k", h: "index.html#resenas" } ] },
  ];
  const LOGO = '<img src="assets/img/logo-2x.png" width="34" height="34" alt="Zenqa Life" loading="eager">';

  function buildHeader() {
    const promo = document.createElement("div");
    promo.className = "promo";
    const grp = '<div class="promo__grp">' + ICON.truck.replace("<svg", '<svg class="promo__i"') +
      '<span class="promo__t">Envíos gratis a partir de 35&nbsp;€</span></div>';
    promo.innerHTML = '<div class="promo__track">' + grp + grp + "</div>";
    promo.setAttribute("aria-hidden", "false");

    const nav = document.createElement("header");
    nav.className = "nav";
    nav.innerHTML = '<div class="wrap nav__in">' +
      '<a class="brand" href="index.html">' + LOGO + '<span class="brand__w">Zenqa Life</span></a>' +
      '<nav class="nav__menu" aria-label="Principal">' + NAV.map((n) => {
        const cur = n.k === page ? ' aria-current="page"' : "";
        if (!n.kids) return '<a class="nav__a" href="' + n.href + '"' + cur + ">" + n.t + "</a>";
        return '<div class="nav__cell"><a class="nav__a" href="' + n.href + '"' + cur + ' aria-expanded="false" aria-haspopup="true" data-drop>' +
          n.t + '<i class="car" aria-hidden="true"></i></a>' +
          '<div class="nav__drop"><ul>' + n.kids.map((k) => '<li><a href="' + k.h + '"><span>' + k.t + "</span>" + (k.s ? "<b>" + k.s + "</b>" : "") + "</a></li>").join("") + "</ul></div></div>";
      }).join("") + "</nav>" +
      '<div class="nav__tools">' +
      '<button class="ib" data-act="search" aria-label="Buscar productos">' + ICON.search + "</button>" +
      '<button class="ib" data-act="cart" aria-label="Ver carrito">' + ICON.cart + '<span class="dot" data-cart-count hidden>0</span></button>' +
      '<button class="ib burger" data-act="menu" aria-label="Abrir el menú" aria-expanded="false">' + ICON.burger + "</button>" +
      "</div></div>";

    const sheet = document.createElement("div");
    sheet.className = "msheet"; sheet.id = "menu"; sheet.setAttribute("role", "dialog"); sheet.setAttribute("aria-label", "Menú");
    sheet.innerHTML = '<div class="msheet__top"><span class="brand">' + LOGO + '<span class="brand__w">Zenqa Life</span></span>' +
      '<button class="x" data-act="close" aria-label="Cerrar el menú">' + ICON.x + "</button></div>" +
      "<nav>" + NAV.map((n) => '<a href="' + n.href + '"' + (n.k === page ? ' aria-current="page"' : "") + ">" + n.t + "<i>" + (n.kids ? "+" : "→") + "</i></a>").join("") + "</nav>" +
      '<div class="msheet__cta"><a class="btn btn--buy" href="tienda.html">Comprar matcha<span class="arw">→</span></a>' +
      '<a class="btn btn--ghost" href="ritual.html">Aprender en 60 s</a></div>';

    document.body.prepend(sheet);
    document.body.prepend(nav);
    document.body.prepend(promo);
    nav.classList.add("nav");

    // flyout: clic/tecla abre, hover mantiene (con puente de 8 px ya en CSS), fuera cierra
    $$(".nav__cell").forEach((cell) => {
      const btn = $("[data-drop]", cell);
      btn.addEventListener("click", (e) => {
        if (!mq(900)) return;                 // en móvil el toque navega a la sección
        e.preventDefault();
        const on = cell.classList.contains("open");
        closeAllDrops();
        if (!on) { cell.classList.add("open"); btn.setAttribute("aria-expanded", "true"); }
      });
      cell.addEventListener("mouseenter", () => { if (mq(900)) cell.classList.add("open"); });
      cell.addEventListener("mouseleave", () => { if (mq(900)) cell.classList.remove("open"); });
      cell.addEventListener("focusout", (e) => { if (!cell.contains(e.relatedTarget)) cell.classList.remove("open"); });
      cell.addEventListener("keydown", (e) => { if (e.key === "ArrowDown") { const a = $(".nav__drop a", cell); if (a) a.focus(); } });
    });
    // estado pegado
    const onScroll = () => nav.classList.toggle("stuck", window.scrollY > 8);
    onScroll(); window.addEventListener("scroll", onScroll, { passive: true });
  }

  function buildFooter() {
    const f = document.createElement("footer");
    f.className = "foot";
    f.innerHTML = '<div class="wrap"><div class="foot__top">' +
      '<div class="col">' +
      '<a class="brand" href="index.html">' + LOGO.replace('width="34" height="34"', 'width="46" height="46"') + '<span class="brand__w">Zenqa Life</span></a>' +
      '<p class="lede" style="color:rgba(255,255,255,.76)">Matcha ceremonial de Uji para tener foco toda la tarde sin el bajón del café.</p>' +
      '<div class="row row--wrap foot__soc">' + Z.brand.social.map((s) => '<a class="btn btn--lineLight btn--sm" href="' + s.u + '" target="_blank" rel="noopener">' + s.k + "</a>").join("") + "</div>" +
      "</div>" +
      '<div class="foot__nav">' +
      '<div><h3>Tienda</h3><ul>' + Z.categories.map((c) => '<li><a href="tienda.html#' + c.id + '">' + c.name + "</a></li>").join("") +
      '<li><a href="tienda.html">Todo el catálogo</a></li></ul></div>' +
      '<div><h3>Ayuda</h3><ul>' +
      '<li><a href="ritual.html">Cómo prepararlo</a></li><li><a href="recetas.html">Recetas y guías</a></li>' +
      '<li><a href="contacto.html">Contacto</a></li><li><a href="contacto.html#envios">Envíos y devoluciones</a></li>' +
      '<li><a href="index.html#resenas">Opiniones</a></li></ul></div>' +
      "</div>" +
      '<form class="foot__news" data-form="news" novalidate>' +
      '<p style="font-weight:800;text-transform:uppercase;letter-spacing:-.01em">Guía + 10&nbsp;% de descuento</p>' +
      '<p class="note" style="color:rgba(255,255,255,.7)">Te enviamos la guía en PDF y un cupón para tu primer bote.</p>' +
      '<div class="field"><label class="sr" for="fmail">Tu email</label><input id="fmail" name="email" type="email" required placeholder="tu@email.com" data-autofocus><p class="err" data-err hidden>Revisa el email</p></div>' +
      '<label class="consent" style="color:rgba(255,255,255,.7)"><input type="checkbox" name="consent" required> Acepto la política de privacidad.</label>' +
      '<button class="btn btn--buy" type="submit">Quiero la guía<span class="arw">→</span></button>' +
      "</form></div>" +
      '<div class="pays">' + ["VISA", "MASTERCARD", "BIZUM", "PAYPAL", "APPLE PAY", "KLARNA"].map((p) => '<span class="pay">' + p + "</span>").join("") + "</div>" +
      '<div class="foot__word"><svg viewBox="0 0 1000 116" preserveAspectRatio="none" role="img" aria-label="Te matcha vibes">' +
      '<text x="500" y="86" text-anchor="middle" font-family="Switzer, Helvetica, Arial" font-size="104" font-weight="800" letter-spacing="-4" fill="none" stroke="#FF6EBC" stroke-width="3">TE MATCHA VIBES</text></svg></div>' +
      '<div class="foot__leg"><nav>' +
      '<a href="legal.html#aviso">Aviso legal</a><a href="legal.html#condiciones">Condiciones</a><a href="legal.html#envios">Envíos</a>' +
      '<a href="legal.html#devoluciones">Devoluciones</a><a href="legal.html#privacidad">Privacidad</a><a href="legal.html#cookies">Cookies</a>' +
      "</nav>" +
      '<a href="#guia" data-act="lead" style="color:var(--pink);font-size:0.74rem;font-weight:700;text-decoration:underline">Guía gratis + 10 % de dto.</a>' +
      '<p class="foot__cp">© ' + new Date().getFullYear() + ' Zenqa Life · Precio con IVA incluido · Demo de tienda para migrar a Shopify.</p></div></div>';
    document.body.appendChild(f);
  }

  /* ==================================================================
     4. Overlays: carrito, búsqueda, lead magnet, ficha rápida
     ================================================================== */
  function buildOverlays() {
    const scrim = document.createElement("div"); scrim.className = "scrim"; document.body.appendChild(scrim);

    // carrito
    const drawer = document.createElement("aside");
    drawer.className = "drawer"; drawer.id = "cart"; drawer.dataset.open = "false";
    drawer.setAttribute("role", "dialog"); drawer.setAttribute("aria-label", "Carrito de la compra"); drawer.setAttribute("aria-modal", "true");
    drawer.innerHTML = '<div class="drawer__hd"><h2>Tu carrito <span data-cart-count hidden>0</span></h2>' +
      '<button class="x" data-act="close" aria-label="Cerrar el carrito">' + ICON.x + "</button></div>" +
      '<div class="drawer__bd" id="cartItems"></div>' +
      '<div class="drawer__ft" id="cartFoot" hidden><div class="ship"><div class="bar"><div class="fill" id="shipFill" style="width:0%"></div></div><p id="shipMsg"></p></div>' +
      '<div class="row row--between"><span class="note">Subtotal</span><b class="price price--lg" id="cartTotal">0,00 €</b></div>' +
      '<button class="btn btn--buy btn--lg" data-act="checkout">Finalizar compra<span class="arw">→</span></button>' +
      '<p class="note center">Impuestos incluidos · Pago simulado en esta demo</p></div>';
    document.body.appendChild(drawer);

    // buscador
    const sr = document.createElement("div");
    sr.className = "search"; sr.id = "search"; sr.dataset.open = "false";
    sr.setAttribute("role", "dialog"); sr.setAttribute("aria-label", "Buscar"); sr.setAttribute("aria-modal", "true");
    sr.innerHTML = '<div class="wrap search__hd"><span aria-hidden="true">' + ICON.search.replace("<svg", '<svg style="width:22px;height:22px"') + "</span>" +
      '<input id="q" type="search" placeholder="Buscar matcha, kit, taza…" data-autofocus autocomplete="off">' +
      '<button class="x" data-act="close" aria-label="Cerrar el buscador">' + ICON.x + "</button></div>" +
      '<div class="wrap search__bd" id="sres"></div>';
    document.body.appendChild(sr);

    // lead magnet (modal)
    const lead = document.createElement("div");
    lead.className = "modal"; lead.id = "leadModal"; lead.dataset.open = "false";
    lead.setAttribute("role", "dialog"); lead.setAttribute("aria-modal", "true"); lead.setAttribute("aria-label", "Guía gratuita");
    lead.innerHTML = '<div class="modal__box"><button class="x modal__x" data-act="close" aria-label="Cerrar">' + ICON.x + "</button>" +
      '<div class="modal__aside"><span class="kicker kicker--light">Gratis · PDF de 4 páginas</span>' +
      '<p class="d d-3" style="color:#fff">La guía que te<br>da la textura<br>perfecta</p>' +
      '<p class="note" style="color:rgba(255,255,255,.78)">Cuatro pasos, temperaturas y cómo guardar el bote para que no pierda aroma.</p></div>' +
      '<div class="modal__in"><div data-lead-form></div>' +
      '<p class="note center">Sin spam. Un email al mes con recetas y ofertas reales.</p></div></div>';
    document.body.appendChild(lead);

    // ficha rápida
    const qv = document.createElement("div");
    qv.className = "modal"; qv.id = "qv"; qv.dataset.open = "false";
    qv.setAttribute("role", "dialog"); qv.setAttribute("aria-modal", "true"); qv.setAttribute("aria-label", "Ficha de producto");
    qv.innerHTML = '<div class="modal__box"><button class="x modal__x" data-act="close" aria-label="Cerrar">' + ICON.x + "</button>" +
      '<div class="modal__in" id="qvBody"></div></div>';
    document.body.appendChild(qv);

    Panes.cart.el = drawer; Panes.search.el = sr; Panes.lead.el = lead; Panes.qv.el = qv; Panes.menu.el = $("#menu");

    // lead form reutilizable
    renderLeadForm($("[data-lead-form]", lead), "modal");

    sr.addEventListener("input", () => search($("#q", sr).value));
    renderCart();
  }

  function search(q) {
    q = (q || "").trim().toLowerCase();
    const box = $("#sres"); if (!box) return;
    if (!q) {
      box.innerHTML = '<p class="note">Lo más buscado</p><div class="row row--wrap" style="gap:8px">' +
        ["Ceremonial", "Kit", "Vaso térmico", "Iced latte", "Sudadera"].map((t) => '<button class="chip" data-act="sq" data-q="' + t + '">' + t + "</button>").join("") + "</div>";
      return;
    }
    const hit = Z.products.filter((p) => (p.name + " " + p.short + " " + p.cat).toLowerCase().includes(q)).slice(0, 8);
    box.innerHTML = hit.length ? '<div class="sres">' + hit.map((p) => '<a href="tienda.html#' + p.id + '" data-act="qv" data-id="' + p.id + '"><img src="assets/img/' + p.img + '" alt="">' +
      "<span><b>" + p.name + "</b><i>" + Z.categories.find((c) => c.id === p.cat).name + "</i></span><em>" + Z.money(p.price) + "</em></a>").join("") + "</div>"
      : '<p class="note">Nada para «' + q + "». Prueba con <b>matcha</b>, <b>kit</b> o <b>vaso</b>.</p>";
  }

  /* ---------- lead magnet: validación real + estado persistente ---------- */
  function renderLeadForm(host, where) {
    if (!host) return;
    host.dataset.lead = where || "";
    const done = LS.get("zenqa_lead", null);
    if (done) { host.innerHTML = leadOk(done); return; }
    host.innerHTML = '<form data-form="lead" novalidate>' +
      '<div class="leadin__hd"><span class="kicker">' + (where === "modal" ? "Descarga + cupón" : "Regalo de bienvenida") + "</span>" +
      '<p class="d d-3">Guía matcha<br>+ 10 %</p></div>' +
      '<div class="two"><div class="field"><label for="le' + where + '">Email</label>' +
      '<input id="le' + where + '" name="email" type="email" required placeholder="tu@email.com" data-autofocus><p class="err" data-err hidden>Escribe un email válido</p></div>' +
      '<div class="field"><label for="na' + where + '">Cómo te llamas</label><input id="na' + where + '" name="name" required placeholder="Laura"></div></div>' +
      '<label class="consent"><input type="checkbox" name="consent" required> Acepto recibir la guía y la política de privacidad.</label>' +
      '<button class="btn btn--buy btn--lg" type="submit">Descargar la guía<span class="arw">→</span></button></form>';
  }
  function leadOk(email) {
    return '<div class="ok">' +
      '<p class="d d-4" style="text-transform:none">Listo, dentro está el PDF.</p>' +
      '<p class="note">Te hemos enviado <b>' + email + "</b> la guía «Matcha perfecto en 60 segundos» (4 páginas).</p>" +
      '<a class="btn btn--buy" href="assets/downloads/guia-matcha-zenqa.pdf" download>Descargar el PDF</a>' +
      '<div class="coupon">ZENQA10</div>' +
      '<p class="note center">Cupón del 10 % válido en tu primer pedido (cópialo y pégalo en el carrito).</p>' +
      '<button class="chip" data-act="copy-coupon" style="justify-self:center">Copiar cupón</button></div>';
  }

  /* ---------- ficha rápida de producto ---------- */
  function quickView(id) {
    const p = Z.byId[id]; if (!p) return;
    const b = $("#qvBody"); if (!b) return;
    const cat = Z.categories.find((c) => c.id === p.cat);
    b.innerHTML = '<div class="qv">' +
      '<figure class="qv__img"><img src="assets/img/' + p.img + '" alt="' + p.name + '"></figure>' +
      (p.badge ? '<span class="tag" style="justify-self:start">' + p.badge + "</span>" : "") +
      '<p class="kicker">' + cat.name + "</p>" +
      '<h2 class="d d-3" style="text-transform:none">' + p.name + "</h2>" +
      '<p class="note">' + p.short + "</p>" +
      '<div class="card__p"><b class="price price--lg">' + Z.money(p.price) + (p.compareAt ? '<s>' + Z.money(p.compareAt) + "</s>" : "") + "</b>" +
      '<span class="card__r"><i class="st">' + Z.stars(p.rating) + "</i> " + p.rating + " · " + p.reviews + " reseñas</span></div>" +
      '<ul class="bullets">' + p.bullets.map((x) => "<li>" + ICON.check + "<span>" + x + "</span></li>").join("") + "</ul>" +
      '<dl class="specs">' + Object.keys(p.specs).map((k) => "<div><dt>" + k + "</dt><dd>" + p.specs[k] + "</dd></div>").join("") + "</dl>" +
      '<p class="note">Quedan <b>' + p.stock + "</b> botes · Envío gratis desde 35 € · 30 días de prueba</p>" +
      '<button class="btn btn--buy btn--lg" data-act="add" data-id="' + p.id + '">Añadir al carrito · ' + Z.money(p.price) + "</button>" +
      '<a class="link" href="tienda.html#' + p.id + '" style="justify-self:center">Ver en la tienda</a></div>';
    Panes.qv.el.setAttribute("aria-label", p.name);
    paneOpen("qv");
  }

  /* ==================================================================
     5. Acciones globales (delegación)
     ================================================================== */
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-act]");
    if (!t) return;
    const a = t.dataset.act, id = t.dataset.id;
    if (["cart", "menu", "search", "lead", "qv-open"].includes(a) || a === "close") e.preventDefault();
    switch (a) {
      case "cart": paneOpen("cart"); break;
      case "search": paneOpen("search"); break;
      case "menu":
        paneOpen("menu");
        t.setAttribute("aria-expanded", openName === "menu" ? "true" : "false");
        break;
      case "lead": renderLeadForm($("#leadModal [data-lead-form]"), "modal"); wire($("#leadModal")); paneOpen("lead"); break;
      case "close": paneClose(); break;
      case "go-shop": paneClose(); location.href = "tienda.html"; break;
      case "add": addToCart(id, 1, "Al carrito"); break;
      case "qv": e.preventDefault(); paneClose("search"); quickView(id); break;
      case "plus": setQty(id, 1); break;
      case "minus": setQty(id, -1); break;
      case "del": cart = cart.filter((l) => l.id !== id); save(); renderCart(); break;
      case "sq": $("#q").value = t.dataset.q; search(t.dataset.q); $("#q").focus(); break;
      case "checkout": toast("Demo: aquí Shopify te lleva a /checkout seguro"); break;
      case "copy-coupon":
        navigator.clipboard && navigator.clipboard.writeText("ZENQA10").then(() => toast("Cupón ZENQA10 copiado"));
        t.textContent = "Copiado ✔"; break;
      case "closedet":
        history.replaceState("", "", location.pathname); const rd = $("#recipeDetail"); if (rd) rd.hidden = true; break;
      case "faq": {
        const it = t.closest(".acc__i"); it.classList.toggle("open");
        t.setAttribute("aria-expanded", it.classList.contains("open") ? "true" : "false"); break;
      }
    }
  });

  /* ---------- formularios ---------- */
  const okMail = (v) => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test((v || "").trim());
  function wire(root) {
    $$("form", root || document).forEach((f) => {
      if (f.dataset.wired) return; f.dataset.wired = "1";
      f.addEventListener("submit", (e) => {
        e.preventDefault();
        let bad = null;
        $$("input, textarea, select", f).forEach((i) => {
          const err = i.parentElement.querySelector("[data-err]") || (i.closest(".field") && $(".err", i.closest(".field")));
          let wrong = false;
          if (i.type === "checkbox") wrong = i.required && !i.checked;
          else if (i.type === "email") wrong = !okMail(i.value);
          else wrong = i.required && i.value.trim().length < 2;
          i.setAttribute("aria-invalid", wrong ? "true" : "false");
          if (err) err.hidden = !wrong;
          if (wrong && !bad) bad = i;
        });
        if (bad) { bad.focus(); return; }
        const kind = f.dataset.form;
        if (kind === "lead" || kind === "news") {
          const em = $("input[type=email]", f).value.trim();
          LS.set("zenqa_lead", em);
          const host = f.closest("[data-lead-form]") || (kind === "news" ? f.parentElement : null);
          if (host) host.innerHTML = leadOk(em);
          const m = $("#leadModal [data-lead-form]"); if (m && host !== m) m.innerHTML = leadOk(em);
          toast("Guía enviada · revisa tu bandeja");
        } else if (kind === "contact") {
          f.innerHTML = '<div class="ok"><p class="d d-4" style="text-transform:none">Mensaje enviado</p><p class="note">Te contestamos por email en menos de 24 h laborables. Si es urgente, escríbenos por WhatsApp.</p></div>';
          toast("Gracias, 'hoy' te contestamos");
        } else toast("Recibido ✔");
      });
    });
  }

  /* ==================================================================
     6. Cards de producto
     ================================================================== */
  function cardHTML(p) {
    const cat = Z.categories.find((c) => c.id === p.cat);
    return '<article class="card" id="' + p.id + '">' +
      '<a class="card__img" href="tienda.html#' + p.id + '" data-act="qv" data-id="' + p.id + '">' +
      '<img src="assets/img/' + p.img + '" alt="' + p.name + '" loading="lazy">' +
      (p.badge ? '<span class="tag card__flag">' + p.badge + "</span>" : "") +
      '<span class="card__qb only-desk">Ver ficha</span></a>' +
      '<div class="card__bd"><p class="card__kt">' + cat.name + (p.compareAt ? ' · <span style="color:var(--pink-deep)">-' + Math.round((1 - p.price / p.compareAt) * 100) + " %</span>" : "") + "</p>" +
      '<h3 class="card__t">' + p.name + "</h3>" +
      '<p class="card__r"><i class="st">' + Z.stars(p.rating) + "</i> " + p.rating + " (" + p.reviews + ")" +
      (p.stock <= 20 ? ' · <b class="card__urg">quedan ' + p.stock + "</b>" : "") + "</p>" +
      '<p class="note">' + p.short + "</p>" +
      '<div class="card__buy"><p class="card__pp"><b class="price">' + Z.money(p.price) + (p.compareAt ? "<s>" + Z.money(p.compareAt) + "</s>" : "") + "</b>" +
      "</p>" +
      '<button class="card__add" data-act="add" data-id="' + p.id + '"><span class="plus" aria-hidden="true">+</span>Añadir al carrito</button></div></div></article>';
  }
  function recipeCard(r) {
    return '<a class="rcard" href="recetas.html#' + r.id + '"><div class="rcard__m"><img src="assets/img/' + r.img + '" alt="' + r.name + '" loading="lazy">' +
      '<span class="tag rcard__t">' + r.kind + "</span></div>" +
      '<div class="rcard__b"><h3>' + r.name + "</h3><p>" + r.short + "</p>" +
      '<div class="rcard__go">Ver receta<span>' + r.time + " · " + r.level + "</span></div></div></a>";
  }

  /* ==================================================================
     7. Montaje por página
     ================================================================== */
  function mountHome() {
    const g = $("#grid-home");
    if (g) {
      const ids = ["te-ceremonial", "kit-completo", "vaso-latte", "pack-descubrimiento", "termico", "sudadera"];
      g.innerHTML = ids.map((i) => cardHTML(Z.byId[i])).join("");
    }
    const k = $("#grid-kit");
    if (k) k.innerHTML = ["kit-basico", "kit-completo", "kit-regalo"].map((i) => cardHTML(Z.byId[i])).join("");
    const r = $("#grid-reviews");
    if (r) r.innerHTML = Z.reviews.map((v) => '<article class="quote"><div class="st">' + Z.stars(v.r) + "</div><p>«" + v.txt + "»</p>" +
      '<footer><span class="av">' + v.n[0] + "</span><span><b>" + v.n + "</b> · " + v.c + " · " + v.t + "</span></footer></article>").join("");
    const ng = $("#grid-nos");
    if (ng) ng.innerHTML = ["te-ceremonial", "kit-basico"].map((i) => cardHTML(Z.byId[i])).join("");
    const rec = $("#grid-recipes");
    if (rec) rec.innerHTML = [Z.recipes[1], Z.recipes[2], Z.recipes[5]].map(recipeCard).join("");
  }
  function mountFaq() {
    const host = $("#faqList"); if (!host) return;
    host.innerHTML = '<div class="acc">' + Z.faq.map((f) => '<div class="acc__i"><button class="acc__b" data-act="faq" aria-expanded="false">' +
      f.q + '<span class="pm" aria-hidden="true">+</span></button><div class="acc__p"><div><p>' + f.a + "</p></div></div></div>").join("") + "</div>";
  }
  function mountShop() {
    const grid = $("#grid"); if (!grid) return;
    const state = LS.get("zenqa_shop", { cat: "todo", sort: "pop" });
    const h = location.hash.slice(1);
    if (h && Z.categories.some((c) => c.id === h)) state.cat = h;
    const chips = $$(".chip[data-cat]");
    function paint() {
      let list = Z.products.slice();
      if (state.cat !== "todo") list = list.filter((p) => p.cat === state.cat);
      const s = state.sort;
      if (s === "asc") list.sort((a, b) => a.price - b.price);
      if (s === "desc") list.sort((a, b) => b.price - a.price);
      if (s === "rate") list.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
      if (s === "pop") list.sort((a, b) => b.reviews - a.reviews);
      chips.forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.cat === state.cat)));
      $("#count").textContent = list.length + (list.length === 1 ? " producto" : " productos");
      grid.innerHTML = list.map(cardHTML).join("");
      LS.set("zenqa_shop", state);
      if (location.hash) {
        const el = $(location.hash); if (el && el.scrollIntoView) { el.scrollIntoView({ block: "center" }); if (el.animate) el.animate([{ boxShadow: "0 0 0 3px #FF6EBC" }, { boxShadow: "0 0 0 0 rgba(255,110,188,0)" }], { duration: 1400 }); }
      }
    }
    chips.forEach((c) => c.addEventListener("click", () => { state.cat = c.dataset.cat; paint(); }));
    const sel = $("#sort"); if (sel) { sel.value = state.sort; sel.addEventListener("change", () => { state.sort = sel.value; paint(); }); }
    paint();
  }
  function mountRecipes() {
    const grid = $("#grid-r"); if (!grid) return;
    const tabs = $$(".chip[data-kind]");
    let kind = "todo";
    function paint() {
      const list = kind === "todo" ? Z.recipes : Z.recipes.filter((r) => r.kind === kind);
      tabs.forEach((t) => t.setAttribute("aria-pressed", String(t.dataset.kind === kind)));
      $("#count-r").textContent = list.length + " guías";
      grid.innerHTML = list.map(recipeCard).join("");
    }
    tabs.forEach((t) => t.addEventListener("click", () => { kind = t.dataset.kind; paint(); }));
    paint();
    const host = $("#recipeDetail");
    function detail() {
      const id = location.hash.slice(1); const r = Z.recipeById[id];
      if (!host) return;
      if (!r) { host.hidden = true; return; }
      host.hidden = false;
      host.innerHTML = '<div class="split"><figure class="kit__media"><img src="assets/img/' + r.img + '" alt="' + r.name + '"></figure>' +
        '<div class="col"><span class="kicker">' + r.kind + " · " + r.time + " · " + r.level + "</span>" +
        '<h2 class="d d-2">' + r.name + "</h2><p class=\"lede\">" + r.short + "</p>" +
        '<ol class="steps" style="grid-template-columns:1fr">' + r.steps.map((s, i) => '<li><span class="n">PASO ' + (i + 1) + "</span><p>" + s + "</p></li>").join("") + "</ol>" +
        '<div class="row"><a class="btn btn--buy btn--auto" href="tienda.html#te-ceremonial">Comprar el matcha para esta receta</a>' +
        '<button class="btn btn--ghost btn--auto" data-act="closedet">Cerrar</button></div></div></div>';
      host.scrollIntoView({ block: "start" });
    }
    window.addEventListener("hashchange", detail); detail();
  }

  /* ---------- lead magnet automático: educado, nunca encima de otro panel ---------- */
  function autoLead() {
    if (page !== "home" || LS.get("zenqa_lead", null) || sessionStorage.getItem("zenqa_pop")) return;
    setTimeout(() => {
      if (openName || sessionStorage.getItem("zenqa_pop")) return;
      if (window.scrollY < window.innerHeight * 0.9) return;
      sessionStorage.setItem("zenqa_pop", "1");
      renderLeadForm($("#leadModal [data-lead-form]"), "modal");
      paneOpen("lead");
    }, 40000);
  }

  /* ---------- reveal suave ---------- */
  function reveal() {
    if (!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { en.target.style.opacity = 1; en.target.style.transform = "none"; io.unobserve(en.target); } }), { rootMargin: "0px 0px -8% 0px" });
    $$(".card, .quote, .rcard, .why__i, .steps li, .sec-head").forEach((el) => {
      el.style.opacity = 0; el.style.transform = "translateY(14px)"; el.style.transition = "opacity .5s var(--ease), transform .5s var(--ease)";
      io.observe(el);
    });
  }

  /* ==================================================================
     init
     ================================================================== */
  buildHeader();
  buildFooter();
  buildOverlays();
  mountHome();
  if (page === "tienda") mountShop();
  if (page === "recetas") mountRecipes();
  if (page === "contacto") mountFaq();
  $$("[data-lead-form]").forEach((host, i) => renderLeadForm(host, host.closest("#leadModal") ? "modal" : (i ? "foot" : "home")));
  wire();
  autoLead();
  reveal();
  if (location.hash && page === "tienda") setTimeout(() => { const el = $(location.hash); if (el) el.scrollIntoView({ block: "center" }); }, 120);
})();
