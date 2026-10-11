# ZENQA LIFE · tienda (v2)

Demo de e-commerce de té matcha construida a mano (HTML + CSS + JS, sin build) para migrar después a Shopify.
Versión 2: móvil de verdad, tienda por delante y textos que venden.

**Ver online:** https://zenqalife-sys.github.io/tienda-zenqa-lm-arena-final-2/

Repositorio: `zenqalife-sys/tienda-zenqa-lm-arena-final-2` · rama `main` · 52 archivos · Pages con `main/(root)`.

---

## v3 · el fondo: copy de marca que vende (no titulares sueltos)

La v2 se quedó en esqueleto: precios y eslóganes, sin explicación. La v3 mantiene la
estructura de tienda (móvil primero, producto arriba, una sola capa abierta, sin botones
flotando) y añade el texto que hace que alguien pague 29,95 € por un bote.

**Un solo banco de copy: `assets/js/data.js`.** Cada producto lleva `hook` (frase de venta
en la ficha), `pitch` (párrafo de 300-400 caracteres con sabor, uso y objeto de la compra),
`notes` (Sabor / Aroma / Textura / Final), `benefits` (chips de beneficio), `bullets`
(tres argumentos con número: gramos, precio por taza, durabilidad), `specs`, rating, nº de
reseñas y stock real. Las recetas llevan `why` + 4 pasos con `s` (qué hacer) y `d` (por qué).
Encima: `manifesto` (con stats y la nota honesta de la encuesta a 412 clientes), `compare`
(7 criterios matcha / café / energética, con marca ✓ ○ ✕ por celda), `grades`, `timeline`
(semana 1 / mes 1 / mes 3), `reviews` (7 con contexto y producto comprado), `faq` (6).

**Cómo se pinta:** `mountContent()` renderiza `#stats`, `#grades`… los anclajes que existan
en la página (`#stats`, `#grades`, `#cmpTable`, `#timeline`, `#grid-reviews[data-long]`) y
`mountHome/mountShop/mountRecipes/mountFaq` hacen lo mismo con las rejillas. Por eso se puede
añadir un bloque a una página sin tocar el JS: si el contenedor existe, se llena.

**Comparativa:** tabla real en escritorio; en móvil se convierte en un carrusel de tres
tarjetas deslizables (`.cmpmob`) con la frase por criterio, porque una tabla de 21 celdas de
prosa ocupaba media pantalla en un móvil de 390 px.

**Altura controlada:** la home es larga a propósito (historia + prueba + producto) pero la
rejilla de productos va la tercera, justo tras el hero y la franja de confianza. En móvil se
ocultan las imágenes de los bloques que no venden (grados), se acoplan los párrafos con
`-webkit-line-clamp` y las recetas pasan a horizontal.

**Qué se verificó con `node .test/*`:** `smoke.mjs` (13 comprobaciones de sustancia sobre los
datos: pitch > 180 caracteres, 3 argumentos con número por producto, 4 pasos explicados por
receta, 7 filas de comparativa, 6 FAQ; y por página: ficha rápida con pitch/notas/reseña/3
relacionados, carrito, buscador, menú, imán de leads, footer, y que ni la home ni la tienda
tengan bloques flotantes), `contrast.mjs` (auditoría de contraste WCAG-lumi sobre *todos* los
textos con su fondo real compuesto, en 390×844 y 1440×900 — cazó el texto blanco sobre
tarjeta blanca dentro de las secciones verdes), `ov.mjs` (solapamientos y `overflow-x`),
`final.mjs` (522 referencias: href, src, anclas, ids de producto/receta), `elem.mjs` y
`shot.mjs` (capturas para revisar a ojo). Todo en verde antes de subir.

**Dependencias del sandbox:** `npm i puppeteer jsdom` y, si Chrome no arranca por librerías
del sistema, `node .test/fetch-chrome-libs.mjs` (baja los `.deb` de trixie a
`~/.local/chromelibs`; `node /tmp/h.mjs`-style nothing: basta con relanzar los tests). Los
`.test/*.mjs` usan un servidor estático en `http://127.0.0.1:8080/`.

## Qué hay dentro

| Página | Qué hace |
| --- | --- |
| `index.html` | Home corta: hero con precio por taza, barra de confianza, 6 productos, Kit Pro, 3 razones, reseñas, 3 recetas y la guía gratuita. Cada CTA lleva a comprar. |
| `tienda.html` | La página principal del negocio: barra de filtros pegajosa (Todo / Matcha / Kits / Tazas / Ropa), orden por precio y valoración, 16 fichas con botón «Añadir al carrito», urgencia de stock y ficha rápida. |
| `ritual.html` | Toda la teoría junto: los 4 pasos, qué piezas hacen falta, matcha vs café con números y conservación. |
| `recetas.html` | 10 recetas y guías con filtro; se abre el detalle por URL (`recetas.html#iced-latte`). |
| `nosotros.html` | Marca, origen de Uji, control de calidad, reseñas y dos fichas de producto para cerrar la venta. |
| `contacto.html` | Formulario validado, canales, envíos/devoluciones y FAQ. |
| `legal.html` | Avisos con anclas (`#aviso`, `#condiciones`, `#envios`, `#devoluciones`, `#privacidad`, `#cookies`, `#tallas`, `#consumo`). |
| `prepararlo.html` | Redirección a `ritual.html` (para no romper enlaces antiguos). |

Cabecera, pie, carrito, buscador, ficha rápida y captura de leads se inyectan desde `assets/js/app.js`: las 8 páginas comparten exactamente el mismo menú y el mismo pie.

## Cómo se ve la carta de colores

`assets/css/zenqa.css` declara en `:root` la paleta tomada del logo: `--pink #FF6EBC`, `--pink-deep #EF2F97`, `--sage #A3B47E`, `--forest #14301E`, `--cream #FAF9F2`, `--paper #FFFFFF`, `--ink #12160F`. No se usa ningún otro color.

## Tipografía

`assets/fonts/fonts.css` autoaloja **Switzer** (Fontshare, gratuita también para uso comercial) en pesos 300-900.

> **HK Modular**, la fuente que pediste, es de **Klim Type Foundry** y es de pago: no existe descarga legal gratuita, así que la he sustituido por Switzer, que es la alternativa libre estándar (mismo aire neo-grotesco, mismas proporciones). Cuando tengas la licencia, copia los `.woff2` en `assets/fonts/` y cambia `'Switzer'` por `'HK Modular'` en esa hoja: no hay que tocar nada más.

## Cómo funciona la tienda (demo)

- **Carrito** en `localStorage` bajo `zenqa_cart`: cantidades, borrado, subtotal y barra de progreso hasta los 35 € del envío gratis. «Finalizar compra» está simulado (avisa con un aviso flotante).
- **Ficha rápida**: cualquier producto abre un panel con foto, precio, tres argumentos, especificaciones, stock y añadir. Desde ahí también se puede llegar por URL (`tienda.html#kit-completo`).
- **Filtros y orden** en tienda se recuerdan en `zenqa_shop`.
- **Buscador** a pantalla completa: filtra por nombre, categoría y texto de venta, y cada resultado abre la ficha rápida.
- **Imán de leads**: validación de email y consentimiento en el sitio; al aceptarlo se guarda `zenqa_lead`, se muestra el cupón `ZENQA10` y se enlaza la descarga real de `assets/downloads/guia-matcha-zenqa.pdf` (4 páginas). Una vez entregado, el modal automático deja de aparecer para siempre en ese navegador.
- **Capas**: carrito, buscador, menú, ficha rápida y guía comparten un único gestor: solo hay un panel abierto a la vez, con su propia ×, Escape lo cierra y el fondo queda inerte. No se solapan.

## Responsive

Mobile-first: la hoja base es la de 390 px y luego escalan `@media (min-width: 700px)` y `(min-width: 900px)`. Rejilla de producto a 2 columnas en móvil y 3 en escritorio; filtros y barra de confianza se deslizan en horizontal; los menús desplegables del escritorio son enlaces directos en la hoja del menú móvil (con atajos a las categorías).

## Comprobar antes de entregar

```bash
python3 -m http.server 8080 --bind 0.0.0.0 --directory .   # y abrir http://localhost:8080
node .test/smoke.mjs     # 8 páginas + carrito, buscador, flyout, capas e imán de leads (necesita jsdom)
node .test/final.mjs     # 463 enlaces y recursos comprobados
node .test/shot.mjs index.html:m:390:844 tienda.html:d:1440:900   # capturas (necesita puppeteer + Chrome)
node .test/ov.mjs        # geométrico: que ninguna × se pise y que el flyout sea entrante
```

## Mapa a Shopify

| Esta demo | En Shopify |
| --- | --- |
| `assets/js/data.js` → `products` | Colecciones `matcha`, `kit`, `vaso`, `ropa` + CSV de 16 productos |
| Fichas y filtros de `tienda.html` | `collection.liquid` + filtros nativos (Shopify Search & Discovery) |
| Carrito lateral | Carrito de tema (drawer) nativo |
| Ficha rápida | Quick add del tema + página `product.liquid` completa |
| Imán de leads | Klaviyo/Shopify Email con el PDF como archivo y cupón automático |
| `ritual.html`, `recetas.html` | Páginas + blog (etiquetas «receta» / «guía») |
| Barra de envío gratis | Anuncio del tema + texto de envíos en `sections/` |

## Pendiente para que sea real

1. Las fotos son de muestra y los precios son de ejemplo; hay que sustituirlos por los de la finca y por los análisis del lote.
2. Faltan las páginas de producto individuales (`product.liquid`) con tallas y fotos por variante.
3. Los textos legales son plantilla: hay que registrar la empresa, la política real de privacidad y el consentimiento de cookies con GA4/Meta Pixel.
4. Hace falta el checkout de verdad (Shopify Payments, Bizum y Klarna) y la gestión de suscripciones si se ofrece «cada 30 días».
5. HK Modular: comprar la licencia web en Klim y reemplazar los archivos (arriba).
6. `@zenqalife` apunta a las redes genéricas: enlazar los perfiles reales.

*Los derechos de las fotos de terceros usadas como muestra son del autor original; este repositorio es una maqueta técnica, no una tienda en producción.*
