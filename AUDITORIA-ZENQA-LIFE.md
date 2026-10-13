# Auditoría completa · ZENQA LIFE (`zenqalife.roadshop.online`)

**Fecha:** 13 de octubre de 2026 · **Tienda:** Shopify (tema propio «zq», `/cdn/shop/t/10/`) · **Método:** navegador real (Chrome headless) en **móvil 390×844**, **tablet 768×1024** y **PC 1440×900**, más rastreo de HTML/JSON/API y auditoría funcional de carrito, fichas, buscador, formularios, checkout, accesibilidad (axe-core) y Lighthouse.

> **Veredicto corto:** el **diseño y la identidad están muy bien** (trabajados, coherentes, con personalidad).
> **La tienda, como negocio, todavía NO está terminada:** de los 19 productos que enseña solo **5 se pueden comprar de verdad**, el **carrito que ve el cliente dice que está vacío** cuando sí tiene producto, **las 10 recetas dan 404**, **las páginas legales dan 404** y **los formularios no envían nada a ningún sitio**. Todo lo demás está detallado y priorizado abajo.

---

## 1 · Cómo se ha probado (para que puedas reproducirlo)

| Prueba | Qué se hizo | Dónde está la evidencia |
| --- | --- | --- |
| HTTP y cabeceras | 14 URLs: estado, redirecciones, tiempo, seguridad, SEO on-page | `audit-out/http.json` |
| Enlaces y recursos | 114 enlaces/recursos internos comprobados uno a uno | `audit-out/links.json` |
| Catálogo real | `/products.json` (catálogo publicado completo) + `product.js` de cada producto | `audit-out/catalog.json` |
| Anclas | 100 % de los enlaces con `#id` de las 14 páginas | `audit-out/anchors.json` |
| Navegador real | 35 combinaciones página × dispositivo: errores JS, 404 de red, desbordes, imágenes rotas, elementos táctiles, fuentes, DOM renderizado | `audit-out/browser.json`, `audit-out/dom/` |
| Flujos funcionales | Añadir al carrito, carrito lateral, ficha rápida, buscador, guía/lead, newsletter, contacto, compra real hasta el checkout | `audit-out/funcional.json` |
| Sondas puntuales | Menú móvil, solapes del menú pegajoso, cookies, filtros, sellos de pago, reseñas | `audit-out/probe.json` |
| Accesibilidad | axe-core (WCAG 2.0/2.1 A-AA + buenas prácticas) en 6 páginas | `audit-out/axe.json` |
| Rendimiento | Lighthouse móvil y escritorio, contraste real calculado, peso por tipo de recurso | `audit-out/lh-summary.json`, `contrast.json`, `assets.json` |
| Capturas | 100 capturas: móvil/tablet/PC, página completa, por tramos de scroll y de cada flujo | `audit-out/screens/` |

Los scripts viven en `.test/live-audit.mjs`, `.test/live-probe.mjs`, `.test/live-audit2.mjs` y se ejecutan solos en `.github/workflows/auditoria-live.yml` (Actions). Resumen legible de todo: **`audit-out/RESUMEN.txt`**.

---

## 2 · Catálogo: lo que la web promete y lo que existe de verdad

El catálogo publicado de la tienda tiene **8 productos**. La página `/pages/tienda` enseña **19 fichas**. Esta es la comparación real, extraída de la tienda en vivo:

| Producto en `/pages/tienda` | Precio web | Tachado | Urgencia | Reseñas | Realidad en Shopify |
| --- | --- | --- | --- | --- | --- |
| Té Matcha Orgánico PREMIUM Grado CEREMONIAL | 31,20 € | 31,20 € | «quedan 18 uds» | ★4.9 (412) | existe · **AGOTADO** |
| Té Matcha Orgánico PREMIUM Grado Culinario | 19,50 € | 19,50 € | — | ★4.7 (128) | existe · **AGOTADO** |
| Pack Descubrimiento · 3 botes 30 g | 24,95 € | 38,90 € (−36 %) | — | ★4.8 (96) | **no existe** |
| Matcha Latte Guante Blanco 60 g | 27,95 € | — | — | ★4.6 (54) | **no existe** |
| Hojicha tostado de Kioto 60 g | 21,95 € | 24,95 € (−12 %) | — | ★4.7 (84) | **no existe** |
| Sencha de primavera · hoja entera 50 g | 19,95 € | — | — | ★4.6 (51) | **no existe** |
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

**Resultado: 5 comprables · 2 agotados · 12 inexistentes.** Además la home destaca el **ceremonial** (agotado) y el **Kit Completo** (no existe) como primeras compras.

### Qué pasa cuando el cliente pulsa

| Acción del cliente | Qué ocurre de verdad |
| --- | --- |
| «AÑADIR» en un producto que **no existe** (kits, chawan, vasos, botella…) | Salta a `/cart/add` y se abre una **página de error de Shopify en inglés**: *«Cart Error: Cannot find variant»* con ID de solicitud. |
| «VER FICHA» en esos mismos productos | **Página 404** («Page not found», en inglés). |
| «AÑADIR AL CARRITO» en el **matcha ceremonial** (el producto estrella, agotado) | Página de error en español: *«El artículo … ya está agotado»*. El cliente sale de la tienda sin plan B (no hay «avísame», ni alternativas, ni volver al producto). |
| «AÑADIR» en un producto **real y en stock** (Eco Tote Bag) | Aterriza en `/cart` de Shopify con el artículo y el importe correctos ✔ … pero **el badge del carrito sigue en 0** y, si el cliente abre el carrito de la tienda, ve **«El carrito está vacío · Total 0,00 € · Te faltan 35,00 € para el envío gratis»**. |
| «FINALIZAR COMPRA» desde ese carrito «vacío» | Sí llega al checkout real con los 19,90 € ✔ — o sea, el dibujo del carrito y el carrito real cuentan cosas distintas. |

---

## 3 · Hallazgos por gravedad

### 🔴 CRÍTICOS — impiden vender

**C1 · La mayoría del catálogo no existe (12 de 19 fichas).**
Los kits (49,95 € / 79,95 € / 64,95 €), el chawan, los vasos latte, la botella, el chasen de repuesto, la taza esmaltada, el hojicha, el sencha, el pack descubrimiento y el «matcha latte guante blanco» no están en la tienda. Al pulsarlos: error de Shopify o 404. Es la primera impresión de casi cualquier visitante que entre por «Kits».

**C2 · El producto estrella está agotado y la web no lo dice.**
Ceremonial y culinario tienen `available: false`. En `/collections/all` sí aparece la etiqueta «Agotado», pero en la **home, la página de matcha y la tienda propia** se venden con «quedan 18 uds» y «MÁS VENDIDO». Pulsar el botón lleva a un error de Shopify.

**C3 · El carrito lateral miente (0,00 € y «vacío» con producto dentro).**
El cajón del carrito del tema lee `localStorage.zenqa_cart`, que **no tiene nada que ver** con el carrito real de Shopify. Consecuencias: tras añadir cualquier producto el badge no se actualiza, el cajón dice que está vacío, la barra de «Te faltan 35 € para el envío gratis» va con el total falso y los botones «+ / − / Quitar» no modifican la compra real.

**C4 · Dos precios distintos para el mismo producto.**
El tema lleva sus propios precios (matcha ceremonial **29,95 €**, tachado 34,95 €, pack «−36 %») mientras Shopify cobra **31,20 €**. Lo mismo con los tachados: «31,20 € ~~31,20 €~~» (tachado idéntico al precio, se lee como error) y cuotas de reseñas/stock inventadas.

**C5 · Las 10 recetas no existen.**
`/pages/receta-usucha`, `receta-iced-latte`, `receta-fresa`, `receta-yuzu`, `receta-pre-noche`, `receta-antes-entreno`, `receta-smoothie`, `receta-hojitas`, `receta-conservacion` y `receta-espuma` → **404**. Se enlazan desde la home, la página de matcha, la de recetas y el buscador. La sección «Descubre recetas», que es el gancho de contenido de la marca, está rota entera.

**C6 · No hay páginas legales y el pie apunta a un 404.**
`/pages/legal` (destino de «Aviso legal», «Condiciones», «Envíos», «Devoluciones», «Privacidad», «Cookies», «Envíos y devoluciones» y de los **checkbox de consentimiento** de los 3 formularios) **no existe**. Solo hay `/policies/privacy-policy` (la plantilla genérica de Shopify) y `/policies/refund-policy` también da 404. Para una tienda que **cobra de verdad** y vende a particulares en España esto es un problema legal (LSSI-CE, RGPD, derecho de desistimiento) y de confianza.

**C7 · Se puede pagar de verdad, pero la web se presenta como «demo».**
El checkout funciona y pide tarjeta (`/checkouts/...`, «Pantalla de pago – ZENQA LIFE»), y a la vez el pie dice *«tienda de demostración (destino: Shopify)»* y los formularios responden «(demo)». O se cierra la venta o se quita el «demo»: las dos cosas a la vez, con 30+ enlaces legales rotos, es la peor combinación.

### 🟠 GRAVES — cuestan dinero o credibilidad

**G1 · Los formularios no envían nada: todos los leads se pierden.**
Guía (imán de leads, 3 sitios), newsletter del pie y formulario de contacto **no hacen ninguna petición** (no hay POST a ningún sitio; no hay app de email ni formulario de Shopify). El email se guarda **solo en el navegador del visitante** (`localStorage.zenqa_lead`) y la web dice «Te hemos enviado la guía a …» y «Mensaje enviado». Nadie recibe nada, tú no te enteras de ningún contacto. Además no hay ninguna app de reseñas ni fidelización.

**G2 · Imágenes rotas del producto estrella (y de otros 3).**
Las fotos se piden a una URL mal montada — `/cdn/shop/t/10/assets/zq-https://cdn.shopify.com/...` → **404**. Afecta al ceremonial y al culinario en **home, tienda y matcha**, y a la taza y al vaso térmico. Son las fotos que más se ven de la marca.

**G3 · «Reseñas verificadas» y valoraciones inventadas, sin app de reseñas.**
«4,9 / 5 · 1.284 opiniones verificadas», estrellas y número de reseñas por producto están escritos a mano en los datos del tema; no hay Judge.me, Loox, Yotpo ni ninguna app instalada: **el cliente no puede dejar una reseña** y nada de eso es verificable. En la UE (Directiva Omnibus) mostrar reseñas no verificadas está tipificado como práctica desleal.

**G4 · Cero analítica y cero píxeles.**
No hay GA4, Meta Pixel, TikTok Pixel ni ninguna app de medición. Hoy no puedes saber visitas, conversión, carritos abandonados ni de dónde viene el tráfico (y la web presume de Instagram/TikTok).

**G5 · Fichas de producto incoherentes.**
- La **ficha rápida** mezcla datos: al abrir la ficha de un producto que sí existe se ve el texto, las notas de cata y las reseñas del **matcha ceremonial** (el tema solo sustituye nombre/precio/imagen de los 2 matchas, el resto mantiene el contenido inventado del prototipo).
- **Descripciones en inglés** en las fichas nativas: *«Say goodbye to plastic, and bag your goodies in this organic cotton tote bag…»*, medidas en pulgadas, y el fabricante **«AWArtisan Dropship»** visible como vendedor en los dos matchas (además con etiquetas `White Label` / `Artisan Product`). Rompe el relato «finca de Uji, una cosecha al año».
- Dos productos distintos comparten la misma foto (`p-kit.jpg` para Kit Básico y Chasen de repuesto; `p-chawan.jpg` para Chawan y Kit Completo), y la foto del latte es una tetera.
- Stock falso: «quedan 18 uds», «quedan 9 uds»… escribidos en el tema, sin relación con el inventario.

**G6 · Anclas muertas que rompen la navegación.**
`/pages/tienda#te` (en la página de matcha, sección «Todos nuestros tés») y `/pages/legal#privacidad` (en los 3 formularios) no existen: el clic no lleva a ningún sitio. El buscador devuelve resultados que enlazan a `#te-hojicha`, `#te-sencha`… que tampoco existen.

**G7 · Sin datos estructurados y SEO de plantilla.**
**0 bloques JSON-LD** en toda la tienda (ni `Product` con precio y stock, ni `Organization`, ni `BreadcrumbList`) → sin resultados enriquecidos en Google. La **meta description es idéntica en las 14 páginas** («Matcha ceremonial, accesorios y rituales Zenqa Life.»), **sin Open Graph** en las páginas propias (solo lo pone Shopify en las fichas de producto), **sin `h1` en `/search`**, y sin `theme-color` ni favicon (`/favicon.ico` → 404).

**G8 · Sin banner de cookies y sin consentimiento.**
Se carga el Web Pixel de Shopify, telemetría y el iframe de `shop.app` sin pedir consentimiento ni mostrar aviso de cookies. En España eso es RGPD + guía AEPD.

**G9 · Sellos de pago que son texto.**
El pie muestra `VISA MASTERCARD BIZUM PAYPAL APPLE PAY KLARNA` como **texto plano** (no son iconos oficiales ni están enlazados a nada). Si Bizum, Klarna o Apple Pay no están activos en tu checkout, es publicidad engañosa (y sin iconos verificables transmite menos confianza).

### 🟡 MEDIOS — uso, diseño y responsive

**M1 · Chrome pegajoso muy alto en móvil.** Banda rosa (37 px) + menú (63 px) + barra de etiquetas de categoría = **~100-165 px de 844 px** siempre ocupados (~12-20 % de la pantalla). `scroll-padding-top` está fijado en 74 px y no contempla la banda ni la barra de etiquetas.

**M2 · Objetivos táctiles pequeños en móvil.** Entre **22 y 59 elementos por página** por debajo de 40×40 px: iconos de buscar/carrito/menú (**38×38**), chips de categoría (**26 px de alto**), enlaces sociales (39 px), «Compró …» del bloque de reseñas (**16 px de alto**). Por debajo de 44 px se falla más al pulsar (WCAG 2.5.8).

**M3 · Menú móvil sin gestión de foco.** Se abre como `role="dialog" aria-modal="true"`, pero **el foco no entra en el diálogo** y **el fondo no queda inerte** (`inert`: 0 elementos). Con teclado o lector de pantalla se sigue navegando por la página de atrás. Lo mismo en el cajón del carrito.

**M4 · Idiomas mezclados.** 404, errores de carrito y «Continue shopping» en **inglés**; el resto en español. El 404 además no ayuda (no enlaza a la tienda real ni al matcha).

**M5 · Formato de precio inconsistente.** El tema pinta `19,90 €` y Shopify `€19,90` en el mismo flujo de compra (carrito y checkout).

**M6 · Desborde horizontal leve en PC (3 px)** en `/collections/all` y `/search` por la barra de filtros de Shopify (1290→1443 px). No rompe la web, pero aparece scroll lateral.

**M7 · Barra de búsqueda y filtros heredados de Shopify** mezclan estilos con el tema (widgets con tipografía y controles distintos, dos menús «Ordenar» duplicados, «Columna de cuadrícula», «Filtro 0»). En móvil se comen media pantalla.

**M8 · Jerarquía de encabezados irregular.** Los `h2` del tema se usan a veces como etiqueta de bloque y hay *headings* vacíos detectados por axe; contenido del `h1` fuera de *landmarks*.

**M9 · Redes sociales que no llevan a tus perfiles.** Todos los iconos apuntan a `instagram.com`, `tiktok.com`, `youtube.com`, `pinterest.com` (portadas genéricas), no a `@zenqa.life`. Igual con los datos de contacto: `hola@zenqalife.com` y `+34 600 00 00 00`, «18.400 pedidos enviados», «9 granjas familiares»: son de relleno.

**M10 · Tablet 768×1024 sin adaptaciones específicas.** Todas las rejillas caen al layout de móvil (1-2 columnas y fichas muy altas: la home mide **8.451 px** de alto en tablet frente a 6.422 px en PC). No está roto, pero se desaprovecha el ancho.

### 🟢 BIEN — conviene saberlo y no tocarlo

- **Diseño y marca:** el sistema visual (rosa `#FF6EBC`, verde `#A3B47E`, crema, negro; Switzer + rotulador «Permanent Marker»; subrayados y etiquetas) está muy bien resuelto y es consistente en todas las páginas, en los tres tamaños.
- **Sin desbordes horizontales reales:** 0 px en 390 y 768, y solo los 3 px de un widget de Shopify en PC.
- **Errores JS propios: ninguno.** Los únicos mensajes en consola son el 404 de las imágenes mal montadas y un aviso de `shop.app`.
- **Rendimiento base aceptable:** TTFB **233 ms**, primer pintado **340 ms**, **CLS 0**, ~132 peticiones y **~1,4 MB** en la home móvil; fuentes autoalojadas con `font-display: swap` e imágenes con `loading="lazy"`.
- **Accesibilidad de base correcta:** axe-core solo señala 3 tipos de incidencia en 6 páginas (una crítica que viene de código de terceros de Shopify, no del tema); hay `:focus-visible`, *skip link*, `aria-modal` en los cajones y se respeta `prefers-reduced-motion` (la banda se para).
- **Checkout de Shopify** bien configurado y en español: probado de punta a punta con la Eco Tote Bag (carrito → pantalla de pago con el importe correcto).
- **El PDF de la guía existe y descarga** (4 páginas, con la identidad de la marca, `200 OK`): el contenido está hecho, solo falta que el formulario lo envíe.
- **Seguridad de plataforma:** HTTPS, HSTS, CSP, `X-Frame-Options: DENY`, `nosniff`.

---

## 4 · Qué tocaría arreglar, en orden

### P0 · Hoy (bloquea ventas)
1. **Ocultar de la web todo lo que no existe** o crearlo en Shopify y vincularlo: kits (básico/completo/regalo), chawan, vasos latte, botella, chasen de repuesto, taza esmaltada, hojicha, sencha, pack descubrimiento, matcha latte. La web usa un mapa `ZQ_PRODUCTS` (handle + variante) para 23 productos: **17 no tienen producto detrás**.
2. **Reponer el matcha ceremonial y el culinario** (o desactivar el botón de compra y ofrecer «avísame»): son el producto estrella y ahora mismo llevan a un error.
3. **Un solo carrito.** Que el cajón del tema lea el carrito real (`/cart.js`) y use `/cart/change.js` para +/−/quitar; o, más rápido, **quitar el carrito del tema** y usar el nativo de Shopify. Que el badge del header se rellene con el contador real.
4. **Una sola fuente de precios y stock:** que las tarjetas se pinten con el precio y la disponibilidad de Shopify (hoy hay precios duplicados y «quedan X uds» inventado).
5. **Arreglar las URLs de las imágenes** (quitar el prefijo `zq-` cuando la ruta ya es absoluta) y reasignar fotos correctas a cada producto.
6. **Publicar o redirigir las 10 recetas** (`/pages/receta-*`) — al menos a `/pages/recetas-y-guias#recetas` mientras no existan.
7. **Crear `/pages/legal`** (aviso legal + condiciones + envíos + devoluciones + privacidad + cookies, con anclas `#privacidad` etc.) o apuntar a las páginas de `/policies/*` que sí existan, y configurar en Shopify las que faltan (devoluciones, envíos, condiciones).
8. **Decidir qué es la web:** si vende, quitar «tienda de demostración» / «(demo)» del pie y de los formularios; si no vende, cerrar el checkout.
9. **Conectar los 3 formularios** a un destino real (Shopify Forms, Klaviyo, Mailchimp o un endpoint propio) y mandar el PDF por email — ahora mismo **el lead se pierde**.

### P1 · Esta semana (confianza y conversión)
10. **Sustituir las reseñas inventadas** por una app real (Judge.me, Loox, Yotpo) y quitar los números escritos a mano, o rotularlas claramente como «opiniones de ejemplo».
11. **Arreglar las fichas de producto:** quitar el «vendedor AWArtisan Dropship» y las etiquetas `White Label`, traducir/rehacer las descripciones en inglés, y que la ficha rápida use los datos de **su** producto (hoy mezcla con el ceremonial).
12. **SEO básico:** JSON-LD (`Product` con precio/stock, `Organization`, `BreadcrumbList`), `title` y `meta description` únicos por página, Open Graph, `h1` en `/search`, favicon y `theme-color`.
13. **Cookies y consentimiento:** banner con aceptar/rechazar y bloquear píxeles hasta el consentimiento.
14. **Analítica y píxeles** (GA4 + Meta/TikTok si vas a hacer publicidad), también tras consentimiento.
15. **Revisar los sellos de pago:** usar los iconos oficiales de los métodos que **sí** estén activos en el checkout.
16. **Reescribir los 404 y los errores de carrito** en español y con salida útil (buscar, ver la tienda).

### P2 · Este mes (pulido)
17. **Móvil:** bajar el chrome pegajoso, subir los botones de icono y chips a ≥44 px, y marcar el fondo como inerte cuando se abre el menú o el carrito (`inert` + foco dentro + cierre con `Esc`).
18. **Detalles de diseño:** chawan de altura de imagen consistente, etiquetas «Agotado»/«Últimas unidades» proporcionales, y revisar los 3 px de scroll lateral en PC.
19. **Datos reales de marca:** enlaces a tus perfiles sociales, teléfono y email reales, y cifras verificables («18.400 pedidos», «9 granjas familiares», «1.284 reseñas» solo si son ciertas).
20. **Rendimiento:** revisar las 132 peticiones (peso por tipo en `audit-out/assets.json`), imágenes en formatos modernos y tamaños responsive; y las puntuaciones de Lighthouse móvil/escritorio en `audit-out/lh-summary.json`.

---

## 5 · Evidencia adjunta (todo está en el repositorio)

- `audit-out/RESUMEN.txt` — resumen legible de todas las comprobaciones (páginas, enlaces, catálogo, flujos, accesibilidad, Lighthouse).
- `audit-out/*.json` — datos en crudo: `http`, `links`, `catalog`, `anchors`, `browser`, `funcional`, `probe`, `axe`, `contrast`, `assets`, `lh-summary`.
- `audit-out/dom/` — DOM ya renderizado de home y tienda (el tema pinta casi todo por JS).
- `audit-out/html/` — HTML servido de las 14 páginas.
- `audit-out/screens/` — capturas: `home.movil.full.jpg`, `home.escritorio.full.jpg`, `tienda.movil.s1..s5.jpg`, `producto-ceremonial.*`, `carrito.*`, `404.*`, y los flujos: `flujo2-ceremonial-agotado.jpg` (error de agotado), `flujo3-kit-add.jpg` (error de variante), `flujo4-carrito-tema.jpg` (carrito «vacío»), `flujo8-checkout-real.jpg` (checkout real).
- `.test/live-audit.mjs`, `.test/live-probe.mjs`, `.test/live-audit2.mjs`, `.github/workflows/auditoria-live.yml` — para repetir la auditoría cuando quieras (`node .test/live-audit.mjs` o el workflow de Actions).
