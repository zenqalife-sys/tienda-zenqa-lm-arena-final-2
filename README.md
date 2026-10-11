# ZENQA LIFE · tienda (v4)

Demo de e-commerce de té matcha hecha a mano (HTML + CSS + JS, sin build) para migrar después a Shopify.

**v4 = cinco páginas, minimalista y a vender.** Se ha quitado todo el texto informativo de las
páginas y se ha movido a la ficha de producto (la capa que se abre al pulsar «Ver ficha»). Lo que
se ve es foto, precio y botón.

**Ver online:** https://zenqalife-sys.github.io/zenqa-life-final-finalisima/
· repositorio `zenqalife-sys/zenqa-life-final-finalisima`, rama `main`, Pages en `main/(root)`.
· la maqueta anterior (v3, 8 páginas) sigue publicada en
  `https://zenqalife-sys.github.io/tienda-zenqa-lm-arena-final-2/`.

Para subirla a un repo nuevo hace falta un PAT **clásico con el scope `repo`** (los
fine-grained no pueden crear repositorios) y:

```bash
GITHUB_TOKEN=ghp_xxx REPO=zenqa-life-final-finalisima bash .test/deploy.sh
```

El script crea el repositorio si no existe, empuja `main`, activa Pages, espera el build,
comprueba recurso a recurso y pasa la suite funcional contra la URL publicada. El token solo
se usa en memoria; el `origin` local queda con la URL limpia.

---

## Las 5 páginas y lo que hay en cada una

| Página | Estructura exacta |
| --- | --- |
| `index.html` | Hero con la foto de portada + `#MATCHA VIBES` en blanco y subrayado rosa tipo rotulador + dos botones (Comprar matcha ya / Cómo se prepara) · «Tu momento Matcha» en rosa a la izquierda y el bote a la derecha con sus dos botones · franja rosa en bucle · Kit de preparación con la foto a la izquierda y «qué incluye» a la derecha · rejilla de 3 bloques a la tienda · opiniones · recetas + imán de leads con «Ver más» · sobre nosotros en tres líneas · «Únete» · pie. |
| `matcha.html` | Hero «Tu ritual diario» / «Energía pura» · los dos botes en paralelo (culinario a la izquierda, ceremonial a la derecha), cada uno con «añadir» y «ver ficha» · comparativa sin perdedor · ficha de calidad (8 apartados) · ritual en 60 segundos en 4 pasos · matcha frente al café · 3 recetas · rejilla de 3 fotos a los demás tés · «Únete». |
| `productos.html` | Banner y menú y, directamente, el catálogo completo en bloques de tres por fila: matcha (culinario, ceremonial, pack) → más variedades de té → kits → teteras/tazas/botellas/vasos → ropa y accesorios. Y «Únete». |
| `recetas.html` | Hero «Latte, ice, solo…» con las 6 maneras resumidas y dos botones-ancla (Recetas / Guía gratis) · «Energía limpia» · las 10 recetas + CTA + rejilla de productos de la tienda · imán de leads · «Únete». |
| `nosotros.html` | Hero «Nacidos en las colinas de Uji» · «Menos ruido, más intención» · «Calidad del té» con los 3 grados · contacto en `nosotros.html#contacto` (formulario validado) · imán de leads · «Únete». |
| `legal.html` | Los textos legales en claro, con anclas. No lleva «Únete» ni newsletter. |
| `tienda` `ritual` `contacto` `prepararlo` | Redirecciones de una línea a la página nueva, para que no se rompa ningún enlace compartido. |

**Común en todas las páginas** (inyectado desde `assets/js/app.js`, así no puede descuadrar):

- franja rosa finísima arriba (31 px) que repite «envíos gratis a partir de 35 €» en bucle
  perfecto — dos grupos del mismo ancho y `translateX(-50%)`, por eso no se ven huecos;
- menú debajo, `position: sticky`: la franja sube y se va, el menú se queda;
- **la home no está en el menú**: se entra pulsando el logo (que es el PNG tal cual, sin recírculo);
- pie idéntico: «TE MATCHA VIBES» en contorno rosa, wordmark blanco, columnas Tienda/Ayuda,
  redes y medios de pago. **Sin imán de leads y sin newsletter**, como se pidió;
- la sección «Únete al universo Zenqa» (redes + tarjeta de newsletter) cierra todas las páginas
  interiores y la home.

Los textos de producto, receta y reseña viven en **`assets/js/data.js`** (19 productos, 10 recetas,
7 opiniones, 4 franjas/datos sueltos). Cada página solo declara huecos
(`data-spot="te-ceremonial"`, `data-inc`, `#grid-tri`, `#vsTable`, `#quality`…) y el JS los rellena
**por presencia**: si el contenedor no está en el HTML, ese bloque no existe.

## Colores y tipografía

`:root` en `assets/css/zenqa.css`: `--pink #FF6EBC`, `--pink-deep #EF2F97`, `--sage #A3B47E`,
`--sage-soft`, `--mint #F0F4E3`, `--cream #FAF9F2`, `--paper #FFFFFF`, `--forest #14301E`,
`--ink #12160F`. No se usa ningún otro color (ni un gris suelto: los textos secundarios son
`color-mix`/`rgba` de esos dos).

Tipografía **Switzer** (Fontshare, gratis también para uso comercial) autoalojada en
`assets/fonts/` y declarada en la propia hoja, pesos 300-900.

> **HK Modular**, la que pediste, es de Klim Type Foundry y es de pago: no hay descarga legal
> gratuita, así que la sustituye Switzer (mismo aire neo-grotesco). Cuando compres la licencia,
> copia los `.woff2` en `assets/fonts/` y cambia `"Switzer"` por `"HK Modular"` en `:root` y en
> los `@font-face` de `assets/css/zenqa.css` — nada más.

## Cómo funciona la parte de tienda

- **Carrito** real en `localStorage.zenqa_cart`: sumar, restar, quitar, subtotal y barra de
  progreso hasta los 35 € del envío gratis. «Finalizar compra» avisa de que el checkout llega al
  conectar Shopify.
- **Ficha rápida** (capa): foto, precio con tachado, gancho, párrafo de venta, 4 notas de cata,
  3 argumentos con número, una opinión verificada y 2-3 relacionados. Aquí es donde hay texto
  largo; la página, no.
- **Buscador** por nombre, categoría, beneficios y texto de venta; cada resultado abre la ficha.
- **Imán de leads** (solo en home, `recetas.html#guia` y `nosotros.html#guia`): valida email +
  consentimiento, guarda `zenqa_lead`, enseña el cupón `ZENQA10` y enlaza la descarga real del PDF
  de 4 páginas. Nunca está en el pie.
- **Capas**: carrito, menú, buscador, ficha, receta y guía comparten un gestor: una abierta cada
  vez, × propia, Escape cierra y el fondo queda inerte.
- Las **reseñas** y los **marcadores** de las fichas salen de los mismos datos, así que no hay
  promesa que se contradiga de una página a otra.

## Comprobar antes de entregar

```bash
node .test/serve.mjs 8080 &            # servidor estático sin dependencias
node .test/smoke.mjs                   # jsdom: 19 comprobaciones de datos + contrato de las 5 páginas
                                       #   + carrito, capas, ficha, buscador, flyout, leads y newsletter
node .test/final.mjs                   # 554 referencias (href, src, anclas, ids) en las 10 páginas
BASE=https://zenqalife-sys.github.io/zenqa-life-final-finalisima/ node .test/smoke.mjs   # contra lo publicado
node .test/v4audit.mjs                 # Chrome: 0 px de desborde horizontal en 390 y 1440, franja fina
                                       #   sin huecos, menú pegajoso, rejilla de 3, tipografía cargada
node .test/stack.mjs                   # que ningún bloque pise al siguiente (lazy-load mediante)
node .test/contrast.mjs 390 844        # WCAG-lumi de todos los textos sobre su fondo real compuesto
node .test/elem.mjs index.html 390 844 ".hero,.moment__t" z1     # capturas por bloque
```

Dependencias del sandbox: `npm i jsdom puppeteer`; si Chrome no arranca por librerías del sistema,
`node .test/fetch-chrome-libs.mjs` (baja los `.deb` a `~/.local/chromelibs`).

## Mapa a Shopify

| Esta demo | En Shopify |
| --- | --- |
| `assets/js/data.js` → `products` (19) | Colecciones `matcha`, `te`, `kit`, `vaso`, `ropa` + CSV de productos |
| `data-spot` y `cardHTML` | Bloque «Producto destacado» del tema + `product.card` |
| Ficha rápida | Quick add del tema; la ficha larga va en `product.liquid` |
| `#groups` de `productos.html` | `collection.liquid` con los 5 catálogos en el mismo orden |
| Carrito lateral | Drawer nativo del tema |
| Barra de envío gratis | Anuncio del tema (el carrusel de la demo es `.band`) |
| Imán de leads | Klaviyo/Shopify Email con el PDF y cupón automático |
| `recetas.html` | Páginas + blog con etiquetas «receta» / «guía» |
| Redirecciones `tienda/ritual/contacto/prepararlo` | `url_redirects` de Shopify |

## Pendiente para que sea real

1. Las fotos son de muestra (algunas generadas) y los precios son de ejemplo: sustituirlos por los
   de la finca y por el análisis del lote.
2. Faltan las páginas de producto con variantes (tallas de ropa, sabores) y su `product.liquid`.
3. Los textos legales son plantilla: hace falta la empresa registrada, la política real y el
   consentimiento de cookies con GA4/Meta Pixel.
4. Checkout de verdad (Shopify Payments, Bizum, Klarna) y suscripciones si se ofrece «cada 30 días».
5. Licencia de HK Modular (arriba).
6. `@zenqalife` apunta a redes genéricas: enlazar los perfiles reales.

*Los derechos de las fotos de terceros usadas como muestra son del autor original; este
repositorio es una maqueta técnica, no una tienda en producción.*
