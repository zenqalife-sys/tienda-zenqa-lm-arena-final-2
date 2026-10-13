# Auditoría completa · ZENQA LIFE (`zenqalife.roadshop.online`)

**Fecha:** 13 de octubre de 2026 · **Tienda:** Shopify (tema propio «zq», `/cdn/shop/t/10/`)
**Método:** navegador real (Chrome headless) en **móvil 390×844**, **tablet 768×1024** y **PC 1440×900**, más rastreo de HTML/JSON/API, auditoría funcional de carrito, fichas, buscador, formularios y checkout, accesibilidad (axe-core) y Lighthouse móvil/escritorio.

> **Veredicto:** el **diseño y la identidad están muy bien** (trabajados, coherentes, con personalidad, sin desbordes ni errores de JS propios). **Pero la tienda, como negocio, todavía NO está terminada:** de los 19 productos que enseña solo **5 se pueden comprar de verdad**, el **carrito que ve el cliente dice que está vacío** cuando sí tiene producto, **las 10 recetas dan 404**, **las páginas legales dan 404** y **los formularios no envían nada a ningún sitio** (los leads se pierden). Detalle y plan de acción abajo.

---

## 1 · Cómo se ha probado (reproducible)

| Prueba | Qué se hizo |
| --- | --- |
| HTTP y cabeceras | 14 URLs: estado, redirecciones, tiempos, seguridad y SEO on-page → `audit-out/http.json` |
| Enlaces y recursos | **114** enlaces/recursos internos comprobados uno a uno → `audit-out/links.json` |
| Catálogo real | `/products.json` (catálogo publicado) + `product.js` de cada producto → `catalog.json`, `funcional.json` |
| Anclas | **100 %** de los enlaces con `#id` de las 14 páginas → `audit-out/anchors.json` |
| Navegador real | **33 combinaciones** página × dispositivo: errores JS, 404 de red, desbordes, imágenes rotas, objetivos táctiles, fuentes, DOM renderizado → `browser.json`, `dom/` |
| Flujos funcionales | añadir al carrito, carrito lateral, ficha rápida, buscador, guía/lead, newsletter, contacto y **compra real hasta el checkout** → `funcional.json` |
| Sondas puntuales | menú móvil, solapes del chrome pegajoso, cookies, filtros, sellos de pago, reseñas → `probe.json` |
| Accesibilidad | axe-core (WCAG 2.0/2.1 A-AA + buenas prácticas) en 6 páginas → `axe.json` |
| Rendimiento | Lighthouse móvil y escritorio, contraste real calculado, peso por tipo de recurso → `lh-summary.json`, `contrast.json`, `assets.json` |
| Capturas | **105** capturas (móvil/tablet/PC, página completa, por tramos y de cada flujo) → `audit-out/screens/` |

Scripts: `.test/live-audit.mjs`, `.test/live-probe.mjs`, `.test/live-audit2.mjs` + `.github/workflows/auditoria-live.yml`. Resumen legible de todo: **`audit-out/RESUMEN.txt`**.

---

## 2 · Catálogo: lo que la web promete y lo que existe de verdad

El catálogo publicado tiene **8 productos**. La página `/pages/tienda` enseña **19 fichas** (y la home reparte otras). Comparación extraída de la tienda en vivo:

| Producto en `/pages/tienda` | Precio web | Tachado | Urgencia | Reseñas | Realidad en Shopify |
| --- | --- | --- | --- | --- | --- |
| Té Matcha… Grado CEREMONIAL | 31,20 € | 31,20 € | «quedan 18 uds» | ★4.9 (412) | existe · **AGOTADO** |
| Té Matcha… Grado Culinario | 19,50 € | 19,50 € | — | ★4.7 (128) | existe · **AGOTADO** |
| Pack Descubrimiento · 3 botes 30 g | 24,95 € | 38,90 € (−36 %) | — | ★4.8 (96) | **no existe** |
| Matcha Latte Guante Blanco 60 g | 27,95 € | — | — | ★4.6 (54) | **no existe** |
| Hojicha tostado de Kioto 60 g | 21,95 € | 24,95 € (−12 %) | — | ★4.7 (84) | **no existe** |
| Sencha de primavera · hoja 50 g | 19,95 € | — | — | ★4.6 (51) | **no existe** |
| Kit Basico Matcha Zenqa Life | 49,95 € | — | «quedan 14 uds» | ★4.9 (233) | **no existe** |
| Kit Completo Matcha Zenqa Life | 79,95 € | — | «quedan 9 uds» | ★5 (141) | **no existe** |
| Kit Regalo Zenqa · caja negra | 64,95 € | 74,85 € (−13 %) | — | ★4.8 (67) | **no existe** |
| Chasen de repuesto · bambú Nara | 14,95 € | — | — | ★4.5 (39) | **no existe** |
| Chawan Bol Ceremonial Zenqa Life | 24,95 € | — | — | ★4.8 (88) | **no existe** |
| Vasos Matcha Latte Zenqa Life | 19,95 € | — | — | ★4.7 (156) | **no existe** |
| Botella Termica Zenqa Life | 22,95 € | — | — | ★4.8 (63) | **no existe** |
| Taza esmaltada Zenqa Rosa | 16,95 € | — | — | ★4.5 (38) | **no existe** |
| Taza Te Matcha Vibes | 13,90 € | — | — | ★4.6 (74) | existe · en stock |
| Vaso térmico de doble cara con pajita | 21,90 € | — | «quedan 19 uds» | ★4.9 (112) | existe · en stock |
| Sudadera con capucha unisex | 25,50 € | — | — | ★4.8 (61) | existe · en stock |
| Camiseta clásica unisex | 10,50 € | — | — | ★4.6 (47) | existe · en stock |
| Eco Tote Bag | 19,90 € | — | — | ★4.7 (95) | existe · en stock |

**Resultado: 5 comprables · 2 agotados · 12 inexistentes.** La home destaca el **ceremonial** (agotado) y el **Kit Completo** (no existe) como primeras compras.

### Qué pasa cuando el cliente pulsa (probado de verdad)

| Acción | Qué ocurre |
| --- | --- |
| «AÑADIR» en un producto que **no existe** | Salta a `/cart/add` y aparece la **página de error de Shopify en inglés**: *«Cart Error: Cannot find variant»* con ID de solicitud. |
| «VER FICHA» en esos productos | **Página 404** «Page not found» (en inglés). |
| «AÑADIR AL CARRITO» en el **ceremonial** (producto estrella, agotado) | Error en español: *«El artículo … ya está agotado»*. Sin plan B para el cliente: ni «avísame», ni alternativas, ni vuelta al producto. |
| «AÑADIR» en un producto **real y en stock** (Eco Tote Bag) | Aterriza en `/cart` de Shopify con el artículo y el importe correctos ✔ … pero **el badge del carrito sigue en 0** y si abre el carrito de la tienda ve **«El carrito está vacío · Total 0,00 € · Te faltan 35,00 € para el envío gratis»**. |
| «FINALIZAR COMPRA» desde ese carrito «vacío» | Sí llega al checkout real con los 19,90 € ✔ — el dibujo del carrito y el carrito real cuentan cosas distintas. |

---

## 3 · Hallazgos por gravedad

### 🔴 CRÍTICOS — impiden vender

**C1 · La mayoría del catálogo no existe (12 de 19 fichas).** Kits (49,95/79,95/64,95 €), chawan, vasos latte, botella, chasen de repuesto, taza esmaltada, hojicha, sencha, pack descubrimiento y «matcha latte guante blanco» no están en Shopify. Es la primera impresión de casi cualquier visitante que entre por «Kits».

**C2 · El producto estrella está agotado y la web no lo dice.** Ceremonial y culinario tienen `available: false`. En `/collections/all` sí aparece «Agotado», pero en la **home, la página de matcha y la tienda propia** se venden con «quedan 18 uds» y «MÁS VENDIDO».

**C3 · El carrito lateral miente (0,00 € y «vacío» con producto dentro).** El cajón del carrito del tema lee `localStorage.zenqa_cart`, que **no tiene relación** con el carrito real de Shopify: tras añadir cualquier producto el badge no cambia, el cajón dice «vacío», la barra de «Te faltan 35 €…» va con el total falso y los botones «+/−/Quitar» no modifican la compra real.

**C4 · Dos precios distintos para el mismo producto.** El tema lleva sus propios precios (ceremonial **29,95 €**, tachado 34,95 €, pack «−36 %») mientras Shopify cobra **31,20 €**. Y hay tachados absurdos: «31,20 € ~~31,20 €~~». Los «quedan X uds», las notas (4,5-5 ★) y el número de reseñas están escritos a mano, sin relación con inventario ni con opiniones reales.

**C5 · Las 10 recetas no existen.** `receta-usucha`, `receta-iced-latte`, `receta-fresa`, `receta-yuzu`, `receta-pre-noche`, `receta-antes-entreno`, `receta-smoothie`, `receta-hojitas`, `receta-conservacion` y `receta-espuma` → **404**. Se enlazan desde la home, la página de matcha, la de recetas y el buscador: la sección de contenido, que es el gancho de la marca, está rota entera.

**C6 · No hay páginas legales y el pie apunta a un 404.** `/pages/legal` — destino de «Aviso legal», «Condiciones», «Envíos», «Devoluciones», «Privacidad», «Cookies», «Envíos y devoluciones» y de los **checkbox de consentimiento** de los tres formularios — **no existe**. Solo funcionan `/policies/privacy-policy` (plantilla genérica de Shopify) y `/pages/aviso-legal`, que **dice literalmente en la web** que faltan los datos fiscales («deben completarse los datos fiscales obligatorios … incluido NIF/CIF»). Para una tienda que **cobra de verdad** a particulares en España esto es un problema legal (LSSI-CE, RGPD, desistimiento) y de confianza.

**C7 · Se puede pagar de verdad, pero la web se presenta como «demo».** El checkout funciona y pide tarjeta (`/checkouts/...` → «Pantalla de pago – ZENQA LIFE», 19,90 € correctos), y a la vez el pie dice *«tienda de demostración (destino: Shopify)»* y los formularios responden «(demo)». O se cierra la venta o se quita el «demo»; las dos cosas a la vez, con 30+ enlaces legales rotos, es la peor combinación.

### 🟠 GRAVES — cuestan dinero o credibilidad

**G1 · Los formularios no envían nada: todos los leads se pierden.** Guía (imán de leads, 3 sitios), newsletter del pie y formulario de contacto **no hacen ninguna petición de red** (verificado: ni un POST, ninguna app de email/formulario instalada). El email se guarda solo en `localStorage.zenqa_lead` del visitante y la web dice «Te hemos enviado la guía a …» y «Mensaje enviado». El PDF de la guía sí existe (200 OK, 4 páginas) — el contenido está hecho, solo falta que se entregue y se capture el lead de verdad.

**G2 · Imágenes rotas del producto estrella (y de otros dos).** Las fotos se piden a una URL mal montada — `/cdn/shop/t/10/assets/zq-https://cdn.shopify.com/...` → **404**. Afecta al ceremonial y al culinario en **home, tienda y matcha** (en PC deja un hueco enorme con el título montado encima: ver `screens/home.escritorio.jpg`), y también a la taza y al vaso térmico.

**G3 · «Reseñas verificadas» y valoraciones inventadas, sin app de reseñas.** «4,9 / 5 · 1.284 opiniones verificadas» y las estrellas por producto están escritas a mano; **no hay ninguna app de reseñas** (ni Judge.me, Loox, Yotpo…), así que el cliente no puede opinar y nada de eso es verificable. En la UE (Directiva Omnibus) mostrar reseñas no verificadas está tipificado como práctica desleal.

**G4 · Cero analítica propia y cero píxeles.** No hay GA4, Meta Pixel, TikTok Pixel ni app de medición. Hoy no puedes saber visitas, conversión, carritos abandonados ni de dónde viene el tráfico (solo la telemetría interna de Shopify). Y la web presume de Instagram y TikTok.

**G5 · Fichas de producto incoherentes.** La **ficha rápida** mezcla datos: al abrir la ficha de un producto que sí existe se ve el texto, las notas de cata y la reseña de **Laura M.** del matcha ceremonial (el tema solo sustituye nombre/precio/imagen de los dos matchas; el resto mantiene el contenido del prototipo). Las **fichas nativas tienen descripciones en inglés** (*«Say goodbye to plastic, and bag your goodies in this organic cotton tote bag…»*, medidas en pulgadas) y el fabricante **«AWArtisan Dropship»** aparece como vendedor de los dos matchas, con etiquetas internas `White Label` / `Artisan Product` visibles en el tipo de producto. Además dos productos distintos comparten la misma foto (`p-kit.jpg` para Kit Básico y Chasen; `p-chawan.jpg` para Chawan y Kit Completo), la foto del latte es una tetera, y la del «Espumador» y demás accesorios no existe.

**G6 · Anclas muertas que rompen la navegación.** `/pages/tienda#te` (en matcha, «Todos nuestros tés») y `/pages/legal#privacidad` (en los tres formularios) no existen: el clic no lleva a ningún sitio. Los resultados del buscador enlazan a `#te-hojicha` / `#te-sencha`, que tampoco existen (solo hay `#te`).

**G7 · SEO de plantilla.** **0 bloques JSON-LD** en toda la tienda (ni `Product` con precio/stock, ni `Organization`, ni `BreadcrumbList`): sin resultados enriquecidos en Google. La **meta description es idéntica en las 14 páginas** («Matcha ceremonial, accesorios y rituales Zenqa Life»), **sin Open Graph** en las páginas propias (solo en las fichas nativas), **sin `h1` en `/search`**, sin favicon (`/favicon.ico` → 404) y sin `theme-color`.

**G8 · Sin banner de cookies ni consentimiento.** No hay aviso de cookies en ninguna página, y a la vez se carga el Web Pixel de Shopify, telemetría y el iframe de `shop.app`. En España: RGPD + guía AEPD.

**G9 · Sellos de pago que son texto.** El pie muestra `VISA MASTERCARD BIZUM PAYPAL APPLE PAY KLARNA` como **texto plano** (`<span>`), sin iconos oficiales ni enlaces: no verifica nada y, si esos métodos no están todos activos en el checkout, es publicidad engañosa (solo hay tarjeta + «+2» visibles en el pago).

**G10 · El buscador manda al 404.** Al buscar «hojicha» devuelve la tarjeta… con enlace `#te-hojicha`, que no existe; y su mejor resultado real («Kit Completo») lleva a una página inexistente. Las colecciones tampoco están preparadas: `/collections/all` muestra **2 productos agotados** y solo 8 artículos.

### 🟡 MEDIOS — uso, diseño y responsive

**M1 · Chrome pegajoso de 173 px en móvil.** Banda rosa (37 px) + menú (63 px) + barra de etiquetas pegajosa `.phead-stick` (73 px) = **173 px de 844 px = 20,5 % de la pantalla** siempre ocupados, y con el teclado abierto o en móviles pequeños es peor. Además `scroll-padding-top` está fijado en **74 px**, así que al saltar a `#kit` el título queda a 176 px y la barra de etiquetas acaba en 135 px: **5 px del contenido quedan por debajo de la barra**.

**M2 · Objetivos táctiles pequeños.** Entre **22 y 59 elementos por página** por debajo de 40×40 px: buscar/carrito/menú (**38×38**), chips de categoría (**26-31 px de alto**), enlaces sociales (39 px) y «Compró …» del bloque de reseñas (**16-38 px de alto**). Por debajo de 44 px se falla más al pulsar (WCAG 2.5.8).

**M3 · Menú móvil y cajones sin gestión de foco.** Se abren como `role="dialog" aria-modal="true"` (bien), pero **el foco no entra en el diálogo** (`focoDentro: false`) y **el fondo no queda inerte** (`inert`: 0 elementos). Con teclado o lector de pantalla se sigue navegando por la página de atrás. El orden de tabulación empieza por la banda rosa, no por el contenido (`skip link` funciona, pero está después de las 3 redes sociales).

**M4 · Idiomas mezclados.** 404, errores de carrito y «Continue shopping» en **inglés**; el resto en español. El 404 no ayuda (no enlaza a la tienda ni al matcha).

**M5 · Formato de precio inconsistente.** El tema pinta `19,90 €` y Shopify `€19,90` en el mismo flujo (carrito y checkout).

**M6 · Desborde horizontal de 3 px en PC** en `/collections/all` y `/search` por la barra de filtros nativa de Shopify (1290→1443 px). No rompe la web, pero aparece scroll lateral.

**M7 · Buscador y filtros heredados de Shopify** mezclan estilos con el tema (dos bloques «Ordenar» duplicados, «Columna de cuadrícula», «Filtro 0», controles con otra tipografía) y en móvil ocupan media pantalla.

**M8 · Jerarquía de encabezados irregular.** axe detecta *headings* vacíos, contenido fuera de *landmarks* y en PC salto de nivel (`heading-order` en producto y colección). Los `h2` del tema se usan a veces como etiqueta de bloque.

**M9 · Enlaces y datos de relleno.** Los iconos sociales apuntan a `instagram.com`, `tiktok.com`, `youtube.com`, `pinterest.com` (portadas genéricas), no a tus perfiles. Contacto: `hola@zenqalife.com`, **`+34 600 00 00 00`** y «L-V 9:00-18:00», «18.400 pedidos enviados», «9 granjas familiares», «1.284 reseñas»: son de relleno. Y `/pages/contacto` **no es una página de contacto**: duplica la de «Nosotros» y su formulario tampoco envía nada.

**M10 · Tablet 768×1024 sin adaptaciones.** Las rejillas caen al layout de móvil; la home mide **8.451 px** de alto en tablet frente a 6.422 px en PC. No está roto, pero se desaprovecha el ancho.

**M11 · Contraste y tamaño de texto.** Textos por debajo del mínimo AA (4,5:1): el wordmark «ZENQA LIFE» (**3,6:1**, 17 px), los porcentajes de descuento «−36 %» a **9,9 px** (**3,8:1**), «T-SHIRT» de las fichas (**2,5:1**), el botón «Añadir al carrito» de la ficha nativa (rosa `#FF6EBC` sobre verde oscuro, **3,06:1**) y «TU MOMENTO MATCHA» del carrito (2,56:1). Nada bloquea la compra, pero se lee peor y Lighthouse lo marca (`color-contrast`). El zoom no está bloqueado (bien).

**M12 · Estabilidad visual (CLS) alta en móvil.** Lighthouse mide **CLS 0,321** en la home móvil (con 4,8 s de LCP y 62/100 de rendimiento frente a 89/100 en PC). Parte del salto lo provocan las propias imágenes rotas y las tarjetas que se pintan por JS.

### 🟢 BIEN — conviene saberlo y no tocarlo

- **Diseño y marca:** el sistema visual (rosa `#FF6EBC`, verde `#A3B47E`, crema, negro; Switzer + rotulador «Permanent Marker»; subrayados, etiquetas y tarjetas) está muy bien resuelto y es consistente en todas las páginas y los tres tamaños. El hero, el menú y las fichas se ven «de marca», no de plantilla.
- **Sin desbordes horizontales reales:** 0 px en móvil y tablet; solo los 3 px de un widget de Shopify en PC.
- **Errores JS propios: ninguno.** Los únicos mensajes en consola son el 404 de las imágenes mal montadas y un aviso de `shop.app`.
- **Rendimiento de servidor excelente:** TTFB 233 ms, primer pintado 340 ms, `load` 741 ms; ~1,4 MB y 132 peticiones en la home móvil; fuentes autoalojadas con `font-display: swap` e imágenes con `loading="lazy"`.
- **Accesibilidad de base correcta:** axe-core solo señala 3 tipos de incidencia en 6 páginas y la crítica viene de código de terceros de Shopify, no del tema. Hay `:focus-visible`, *skip link*, `aria-modal` en los cajones y se respeta `prefers-reduced-motion` (la banda se detiene).
- **Checkout de Shopify bien configurado y en español**, probado de punta a punta (Eco Tote Bag: carrito → pantalla de pago con el importe correcto, gastos y provincias correctas).
- **Seguridad de plataforma:** HTTPS, HSTS, CSP, `X-Frame-Options: DENY`, `nosniff`.
- **El PDF de la guía existe y descarga** (4 páginas con la identidad de la marca).
- **La ficha nativa de producto funciona** (precio, galería, añadir al carrito, checkout) y el buscador nativo y las colecciones responden.

---

## 4 · Plan de acción en orden

### P0 · Hoy (bloquea ventas)
1. **Ocultar de la web todo lo que no existe** o crearlo en Shopify y vincularlo. La web usa un mapa con **23 productos** (handle + variante); **17 no tienen producto detrás**.
2. **Reponer ceremonial y culinario** (o desactivar el botón y ofrecer «avísame»): son el producto estrella y ahora llevan a un error.
3. **Un solo carrito.** Que el cajón del tema lea el carrito real (`/cart.js`) y use `/cart/change.js` para +/−/quitar; o, más rápido, **quitar el carrito del tema** y usar el nativo. Que el badge del header muestre el contador real.
4. **Una sola fuente de precios y stock:** pintar tarjetas con el precio y la disponibilidad de Shopify (hoy hay dos precios por producto y «quedan X uds» inventado).
5. **Arreglar las URLs de las imágenes** (sobra el prefijo `zq-` cuando la ruta ya es absoluta) y asignar una foto correcta a cada producto.
6. **Publicar o redirigir las 10 recetas** (`/pages/receta-*` → al menos a `/pages/recetas-y-guias#recetas`) mientras no existan.
7. **Crear `/pages/legal`** con anclas `#privacidad`, `#envios`, `#devoluciones`… o repuntar todos los enlaces a las páginas de `/policies/*` que existan, y configurar en Shopify las que faltan (devoluciones, envíos, condiciones). Completar los datos fiscales del aviso legal.
8. **Decidir qué es la web:** si vende, quitar «tienda de demostración» y «(demo)»; si no vende, cerrar el checkout.
9. **Conectar los tres formularios** a un destino real (Shopify Forms, Klaviyo, Mailchimp o un endpoint propio) y enviar el PDF por email. Hoy **el lead se pierde**.

### P1 · Esta semana (confianza y conversión)
10. **Sustituir las reseñas inventadas** por una app real (Judge.me, Loox, Yotpo) o rotularlas claramente como de ejemplo.
11. **Arreglar las fichas:** quitar «AWArtisan Dropship» y las etiquetas `White Label`, traducir/rehacer las descripciones en inglés y hacer que la ficha rápida use los datos de **su** producto (hoy mezcla con el ceremonial).
12. **SEO básico:** JSON-LD (`Product` con precio/stock, `Organization`, `BreadcrumbList`), `title` y `meta description` únicos, Open Graph, `h1` en `/search`, favicon y `theme-color`.
13. **Cookies y consentimiento:** banner con aceptar/rechazar y bloqueo de píxeles hasta el consentimiento.
14. **Analítica y píxeles** (GA4 + Meta/TikTok si vas a hacer publicidad), tras consentimiento.
15. **Sellos de pago reales** (iconos oficiales de los métodos activos) y revisar qué métodos están activados en el checkout.
16. **Reescribir los 404 y los errores de carrito** en español, con salida útil (buscar, ver la tienda, contacto).

### P2 · Este mes (pulido)
17. **Móvil:** bajar el chrome pegajoso (banda + menú + etiquetas = 173 px), subir los botones de icono y chips a ≥44 px, `scroll-padding-top` a la altura real y marcar el fondo como inerte al abrir menú/carrito (foco dentro + cierre con `Esc`).
18. **Detalles de diseño:** etiquetas «Agotado»/«Últimas unidades» proporcionadas, revisar los 3 px de scroll lateral en PC y la altura de imagen de las tarjetas.
19. **Datos reales de marca:** enlaces a tus perfiles sociales, teléfono y email reales, y cifras verificables («18.400 pedidos», «9 granjas familiares», «1.284 reseñas») solo si son ciertas.
20. **Rendimiento móvil:** CLS 0,321 y LCP 4,8 s en la home (Lighthouse 62/100 móvil vs 89/100 escritorio). Peso por tipo en `assets.json`: home 1.605 KB (1.076 KB de JS de checkout/web-pixel), colección 839 KB (todos imágenes). Imágenes en formatos modernos, tamaños responsive y menos JS de Shopify en páginas donde no se compra.

---

## 5 · Resumen numérico

| Métrica | Valor |
| --- | --- |
| Fichas mostradas / comprables de verdad | **19 / 5** (2 agotados, 12 inexistentes) |
| Enlaces y recursos internos comprobados | 114 (3 rotos, todos relevantes) |
| Páginas legales que existen | 2 de 10 probadas (una de ellas con datos fiscales sin rellenar) |
| Recetas publicadas | 0 de 10 |
| Formularios que envían datos | **0 de 3** (guía, newsletter, contacto) |
| Apps de reseñas / analítica propias | **0 / 0** |
| Bloques JSON-LD | **0** en 14 páginas |
| Cambios de carrito reales con el carrito del tema | **0** (badge, total y envío gratis siempre a 0) |
| Errores JS propios / desbordes horizontales | 0 / 0 (3 px en un widget de Shopify en PC) |
| Lighthouse (móvil / escritorio) | home **62 / 89** · producto 88 / 98 · colección 84 / 98 · Accesibilidad 94-96 · SEO 100 |
| Contraste | 4 textos por debajo de AA en home/tienda/carrito (2,5-3,8:1) |
| Objetivos táctiles < 40 px | 22-59 por página en móvil |
| Chrome pegajoso en móvil | **173 px** de 844 px (20,5 %) |

---

## 6 · Evidencia adjunta (todo en el repositorio)

- **`audit-out/RESUMEN.txt`** — resumen legible de todas las comprobaciones.
- `audit-out/*.json` — datos en crudo: `http`, `links`, `catalog`, `anchors`, `browser`, `funcional`, `probe`, `axe`, `contrast`, `assets`, `policies`, `lh-summary`.
- `audit-out/dom/` y `audit-out/html/` — DOM renderizado y HTML servido.
- `audit-out/screens/` — 105 capturas: `home.movil.full.jpg`, `home.escritorio.full.jpg` (con el hueco de la imagen rota), `tienda.movil.s1..s5.jpg`, `producto-ceremonial.movil.jpg`, `flujo2-ceremonial-agotado.jpg`, `flujo3-kit-add.jpg`, `flujo4-carrito-tema.jpg`, `flujo8-checkout-real.jpg`, `probe-p5-menu-movil.jpg`, `probe-p7-cookies.jpg`…
- `.test/live-audit.mjs`, `.test/live-probe.mjs`, `.test/live-audit2.mjs` y `.github/workflows/auditoria-live.yml` — para repetir la auditoría cuando quieras.
