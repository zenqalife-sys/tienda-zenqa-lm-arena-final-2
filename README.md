# ZENQA LIFE · tienda

Demo de e-commerce de té matcha hecha a mano (HTML + CSS + JS, sin build) para migrar después a Shopify.

**Rediseño completo orientado a vender**: menú alto con submenú «Contacto», titulares con
rotulador (Permanent Marker), secciones de color alternadas (verde clarito del logo, crema, papel,
negro) y todos los textos de venta a la vista. La franja rosa de arriba va **fija en escritorio**
y **en bucle en móvil** (un mensaje tras otro, centrado, sin quedarse en blanco). Auditoría
responsive completa: sin solapes, sin desbordes y con el formulario de contacto maquetado en
tarjeta también en pantallas pequeñas.

**Ver online:** https://zenqalife-sys.github.io/tienda-zenqa-lm-arena-final-2/
· repositorio `zenqalife-sys/tienda-zenqa-lm-arena-final-2`, GitHub Pages desde `main/(root)`.

---

## Las páginas y lo que hay en cada una

| Página | Estructura |
| --- | --- |
| `index.html` | Franja rosa (en PC **fija** con los tres mensajes + las 4 redes; **en móvil, en bucle**: un mensaje tras otro centrado, fundiendo, y los tres se ven siempre) · Hero con `#MATCHA VIBES` **en cursiva**, el claim **«Únete al movimiento Zenqa Life»** en verde clarito subrayado en rosa (mismo tamaño que «Energía pura» de matcha), y dos botones grandes separados · «Tu momento Matcha» **sobre fondo verde clarito** con el título en **fuente pincel graffiti** y, **solo el texto de «¿Qué es el té matcha?»** justo debajo del título, **en letra más grande** (así los dos primeros productos de la home van pegados, sin ninguna sección entre ellos) · Kit de preparación: «preparación» a tamaño grande, columna ocupando todo el alto con el qué-incluye (**solo herramientas: chawan, chasen y chashaku+tamizador; sin bote de 54 g**, en letra más grande) · «Nuestros productos» (Matcha y tés primero, ropa tercera) · «Quien lo compra, repite» · «Descubre recetas» + **imán de leads en su propia sección verde** (estilo de la referencia, sin 10 %) · «La casa» desarrollada (dos párrafos + tres pilares en etiquetas + CTA) con el texto a todo el alto de la foto y el botón **«Conócenos» en rosa** · «Únete» · pie con «TE MATCHA VIBES» **en cursiva**. |
| `matcha.html` | Hero «Tu ritual diario» con subtítulo **«Energía pura»** grande, en rosa y subrayado en verde clarito · los dos botes en paralelo · comparativa sin perdedor (**sin la fila de rendimiento/precio por vaso**) · **«Calidad de nuestro matcha»** sobre fondo verde (el mismo de «Matcha frente al café»), ficha de 6 apartados · «Ritual en 60 segundos» con fondo distinto (separadas) · «Matcha frente al café» · **«Más formas de beberlo»** · **«Todos nuestros tés»** sobre fondo negro (la tipografía blanca, solo las fotos con su color) · «Únete». |
| `productos.html` | **Barra de etiquetas por categoría justo debajo del menú principal** (pégajosa, **centrada**, solo enlaces ancla: #matcha, #te, #kit, #vaso, #ropa) · portada **sin foto y sobre verde clarito**: kicker «Envíos gratis a partir de 35 €» + título **«Movimiento Zenqa Life»** (sin «Todo lo que vendemos») y **las 4 redes con icono** (Instagram, TikTok, YouTube, Pinterest) en lugar del texto «Toca cualquier foto…» · catálogo en bloques: matcha → **«Más variedades de té» sobre fondo negro** → kits → vasos → ropa (19 productos) · «Únete». |
| `recetas.html` | Hero con título mejorado (rotulador dibujado), subtítulo **«Encuentra tu manera preferida de prepararlo»** **como subtítulo de verdad** (mismo tamaño que «Energía pura» de matcha, **subrayado en verde clarito**, sin chips) y dos botones grandes (Recetas / Guía gratis) · **«Energía limpia»** centrada y sobre verde clarito con la frase grande · **«Recetas infinitas, sabores únicos»** (las 10 recetas en tarjetas, cada una enlaza a **su propia página**) · **«Comprar lo que falta»** en su propia sección con fondo papel y bloque propio · imán de leads rediseñado y **sin el 10 %** · «Únete». |
| `nosotros.html` | Menú con flecha y submenú **«Contacto»** que ancla a `nosotros.html#contacto` (en móvil, el menú se cierra y el salto funciona de verdad) · «Menos ruido, más intención» **sobre verde clarito, todo centrado y con el copy literal** (manifiesto + cita «Premium sin solemnidad» + foto de Uji con pie) · «La calidad del té» con cabecera literal **«Lo que pasa antes de que abras la lata»**, la tabla de 6 comprobables, los **6 hitos del proceso contados en general —cómo se cultiva y se cuida un matcha, sin atribuírselo ni hablar de dinero—** y los **5 números de la casa** · contacto con su formulario **en tarjeta y con los campos separados** (maquetado también en móvil) · **imán de leads debajo del formulario**, copiado del de la referencia · «Únete». |
| `receta-<id>.html` × 10 | **Una página por receta** (generadas por `node .test/gen-recetas.mjs`): foto, por qué funciona, los 4 pasos maquetados, el bote que mejor queda con botones de compra, y anterior/siguiente. Nada de pop up por receta. |
| `legal.html` | Los textos legales en claro, con anclas. No lleva «Únete» ni newsletter. |
| `tienda` `ritual` `contacto` `prepararlo` | Redirecciones de una línea a la página nueva, para que no se rompa ningún enlace compartido. |

**Común en todas las páginas** (inyectado desde `assets/js/app.js`, así no puede descuadrar):

- franja rosa arriba: en escritorio **estática** (tres mensajes con punto blanco + las redes), en
  móvil **en bucle** (los tres mensajes giran centrados uno tras otro, siempre hay uno visible);
- menú `position: sticky`, más alto y centrado; «Nosotros» abre un desplegable con **Contacto**;
- en móvil, el menú hoja contiene **solo enlaces de página** (4 + Contacto como subpágina), sin atajos;
- pie idéntico: «TE MATCHA VIBES» en cursiva rosa, wordmark, columnas Tienda/Ayuda, redes y
  medios de pago. **Sin imán de leads y ni newsletter en el pie**, como se pidió;
- anclas con `scroll-padding-top` para que ningún enlace quede bajo el menú (y, en productos,
  bajo la barra de etiquetas).

Los textos de producto, receta y reseña viven en **`assets/js/data.js`** (19 productos, 10 recetas,
7 opiniones, franja, kit, comparativas, calidad, proceso y números). Cada página solo declara
huecos (`data-spot="te-ceremonial"`, `data-inc`, `#grid-tri`, `#vsTable`, `#quality`…) y el JS los
rellena **por presencia**: si el contenedor no está en el HTML, ese bloque no existe.

## Colores y tipografía

`:root` en `assets/css/zenqa.css`: `--pink #FF6EBC`, `--pink-deep #EF2F97`, `--sage #A3B47E`,
`--sage-soft #DFE8CB` (el verde clarito del logo, para «¿Qué es el té matcha?», portada de
productos, manifiesto y secciones de imán), `--mint`, `--cream`, `--paper`, `--forest`, `--ink`.
No se usa ningún otro color (ni un gris suelto: los textos secundarios son `color-mix`/`rgba`).

Tipografía **Switzer** (Fontshare) autoalojada en `assets/fonts/`, pesos 300-900, más
**Permanent Marker** (OFL, vía Fontsource) como `--brush` para los titulares de rotulador.

## Cómo funciona la parte de tienda

- **Carrito** real en `localStorage.zenqa_cart`: sumar, restar, quitar, subtotal y barra de
  progreso hasta los 35 € del envío gratis. «Finalizar compra» avisa de que el checkout llega al
  conectar Shopify.
- **Ficha rápida** (capa): foto, precio con tachado, gancho, párrafo de venta, 4 notas de cata,
  3 argumentos con número, una opinión verificada y 2-3 relacionados. Aquí es donde hay texto
  largo; la página, no.
- **Buscador** por nombre, categoría, beneficios y texto de venta; cada resultado abre la ficha.
- **Imán de leads** (home `#guia`, `recetas.html#guia` y `nosotros.html#guia`): estilo de la
  referencia (columna de texto + tarjeta PDF rotada), valida email + consentimiento, guarda
  `zenqa_lead` y enlaza la descarga real del PDF de 4 páginas. **Sin cupón, sin «10 %»**.
  Nunca está en el pie. El PDF es **`assets/downloads/guia-matcha-zenqa.pdf`**, una guía de
  4 páginas con la identidad de la web (Switzer + Permanent Marker, rosa/verde/crema) que
  recoge lo que promete el formulario: recetas, dosis, conservación y hoja de cata.
  Se regenera con `node .test/make-guia.mjs` (con `GUIA_SHOTS=1` saca capturas de preview).
- **Capas**: carrito, menú, buscador, ficha, receta y guía comparten un gestor: una abierta cada
  vez, × propia, Escape cierra y el fondo queda inerte.
- Las **reseñas** y los **marcadores** de las fichas salen de los mismos datos, así que no hay
  promesa que se contradiga de una página a otra.

## Comprobar antes de entregar

```bash
node .test/serve.mjs 8080 &            # servidor estático sin dependencias
node .test/smoke.mjs                   # jsdom: 22 comprobaciones de datos + contrato de las 5 páginas
                                       #   + carrito, capas, ficha, buscador, flyout y leads
node .test/final.mjs                   # 555 referencias (href, src, anclas, ids) en las 10 páginas
node .test/v4audit.mjs                 # Chrome: 0 px de desborde en 390 y 1440, franja de
                                       #   3 mensajes + 4 redes, menú pegajoso, tipografía cargada
node .test/gen-recetas.mjs             # regenera las 10 páginas receta-<id>.html desde data.js
node .test/make-guia.mjs               # regenera el PDF del imán de leads (GUIA_SHOTS=1 = preview)
node .test/stack.mjs                   # que ningún bloque pise al siguiente
node .test/contrast.mjs 390 844        # WCAG-lumi de todos los textos sobre su fondo real compuesto
node .test/elem.mjs index.html 390 844 ".hero,#que-es" z1     # capturas por bloque
```

El navegador de los tests de Chrome se resuelve solo: `ZENQA_CHROME` manda, y si no existe se
prueba `/tmp/chromium` (extraído por `@sparticuz/chromium`) y por último el Chrome de puppeteer.
En este sandbox arranca con `LD_LIBRARY_PATH=/tmp/al2023lib/lib` (las `.so` se extraen de
`node_modules/@sparticuz/chromium/bin/al2023.tar.br`); si no, `node .test/fetch-chrome-libs.mjs`
baja los `.deb` a `~/.local/chromelibs`. Instalar con `PUPPETEER_SKIP_DOWNLOAD=1 npm install`.

## Mapa a Shopify

| Esta demo | En Shopify |
| --- | --- |
| `assets/js/data.js` → `products` (19) | Colecciones `matcha`, `te`, `kit`, `vaso`, `ropa` + CSV de productos |
| `data-spot` y `cardHTML` | Bloque «Producto destacado» del tema + `product.card` |
| Ficha rápida | Quick add del tema; la ficha larga va en `product.liquid` |
| `#groups` de `productos.html` | `collection.liquid` con los 5 catálogos en el mismo orden |
| Carrito lateral | Drawer nativo del tema |
| Barra de envío gratis | Anuncio del tema |
| Imán de leads | Klaviyo/Shopify Email con el PDF (sin cupón) |
| `recetas.html` | Páginas + blog con etiquetas «receta» / «guía» |
| Redirecciones `tienda/ritual/contacto/prepararlo` | `url_redirects` de Shopify |

## Pendiente para que sea real

1. Las fotos son de muestra (algunas generadas) y los precios son de ejemplo: sustituirlos por los
   de la finca y por el análisis del lote.
2. Faltan las páginas de producto con variantes (tallas de ropa, sabores) y su `product.liquid`.
3. Los textos legales son plantilla: hace falta la empresa registrada, la política real y el
   consentimiento de cookies con GA4/Meta Pixel.
4. Checkout de verdad (Shopify Payments, Bizum, Klarna) y suscripciones si se ofrece «cada 30 días».
5. `@zenqalife` apunta a redes genéricas: enlazar los perfiles reales.

*Los derechos de las fotos de terceros usadas como muestra son del autor original; este
repositorio es una maqueta técnica, no una tienda en producción.*
