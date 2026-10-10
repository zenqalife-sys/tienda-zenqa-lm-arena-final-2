/* ZENQA LIFE · catálogo y contenido (v2). Copy orientado a venta:
   beneficio concreto + prueba + precio, no prosa poética. */
window.ZENQA = (function () {
  const brand = {
    name: "ZENQA LIFE",
    url: "https://zenqalife.com",
    tagline: "Matcha ceremonial para gente que quiere foco, no ansiedad.",
    shopNow: "Comprar ahora",
    freeShip: 35,
    social: [
      { k: "Instagram", h: "@zenqa.life", u: "https://instagram.com" },
      { k: "TikTok", h: "@zenqalife", u: "https://tiktok.com" },
      { k: "YouTube", h: "Zenqa Life", u: "https://youtube.com" },
      { k: "Pinterest", h: "@zenqalife", u: "https://pinterest.com" },
    ],
  };

  const categories = [
    { id: "matcha", name: "Matcha", note: "Grado ceremonial · 54 g" },
    { id: "kit", name: "Kits", note: "Todo para empezar" },
    { id: "vaso", name: "Tazas y vasos", note: "Chawan, cristal, térmico" },
    { id: "ropa", name: "Ropa y accesorios", note: "Para llevar el matcha puesto" },
  ];

  /* ---------------- productos ---------------- */
  const products = [
    {
      id: "te-ceremonial", name: "Matcha Ceremonial Uji 54 g", cat: "matcha", price: 29.95, compareAt: 34.95,
      rating: 4.9, reviews: 412, badge: "Más vendido", stock: 18, img: "p-ceremonial.jpg",
      short: "27 tazas por bote. 1,11 € la taza, frente a 3,50 € en cafetería.",
      bullets: ["Grado ceremonial de Uji: umami dulce, cero amargor", "Foco de 4 h sin taquicardia ni bajón de las 5", "Molido en piedra y envasado en atmósfera protectora"],
      specs: { "Origen": "Uji, Japón", "Contenido": "54 g · 27 tazas", "Preparación": "1 g + 70 ml a 70 °C", "Caducidad": "9 meses abierto" },
    },
    {
      id: "te-culinario", name: "Matcha Culinario 100 g", cat: "matcha", price: 19.95, compareAt: 0,
      rating: 4.7, reviews: 128, badge: "Para lattes", stock: 40, img: "p-culinary.jpg",
      short: "Con sabor intenso aguanta la leche, el hielo y el azúcar sin desaparecer.",
      bullets: ["100 g = 50 lattes fríos", "Color verde estable, no se apaga con la leche", "Ideal para repostería, smoothies y bowls"],
      specs: { "Origen": "Nishio, Japón", "Contenido": "100 g · 50 dosis", "Uso": "Latte, cocina, horneado", "Caducidad": "12 meses abierto" },
    },
    {
      id: "pack-descubrimiento", name: "Pack Descubrimiento · 3 botes 30 g", cat: "matcha", price: 24.95, compareAt: 38.9,
      rating: 4.8, reviews: 96, badge: "Empieza aquí", stock: 25, img: "p-pack3.jpg",
      short: "Prueba los tres grados y paga solo dos. El que repita, con 10 % de dto.",
      bullets: ["Ceremonial, latte y culinario en formato 30 g", "Tarjeta para anotar tu textura favorita", "Canjeable por 10 % en tu primer bote grande"],
      specs: { "Contenido": "3 × 30 g · 90 tazas", "Formato": "Botes recargables", "Ideal": "Regalo o primer matcha", "Envío": "Gratis (siempre)" },
    },
    {
      id: "te-guante", name: "Matcha Latte Guante Blanco 60 g", cat: "matcha", price: 27.95, compareAt: 0,
      rating: 4.6, reviews: 54, badge: "Nuevo", stock: 32, img: "p-teapot.jpg",
      short: "Mezclado con vainilla de Madagascar: latte perfecto sin jarabes.",
      bullets: ["Ya lleva el punto dulce: solo leche y hielo", "60 g = 30 lattes", "Sin azúcares añadidos ni aromas artificiales"],
      specs: { "Origen": "Uji + vainilla", "Contenido": "60 g · 30 lattes", "Preparación": "2 g + 200 ml de leche", "Caducidad": "10 meses" },
    },
    {
      id: "kit-basico", name: "Kit Básico · cuenco, batidor y cuchara", cat: "kit", price: 49.95, compareAt: 59.85,
      rating: 4.9, reviews: 233, badge: "Mejor precio", stock: 14, img: "p-kit.jpg",
      short: "Las 3 piezas que necesitas. Nada de lo que no.",
      bullets: ["Ahorras 9,90 € frente a comprarlo suelto", "Chawan de 320 ml + chasen de 80 púas + chashaku", "Guía en vídeo de 60 segundos incluida"],
      specs: { "Incluye": "Chawan, chasen, chashaku", "Chawan": "Gres 320 ml", "Chasen": "Bambú · 80 púas", "Garantía": "2 años" },
    },
    {
      id: "kit-completo", name: "Kit Completo Pro · 6 piezas + tamizador", cat: "kit", price: 79.95, compareAt: 94.8,
      rating: 5, reviews: 141, badge: "El favorito", stock: 9, img: "p-chawan.jpg",
      short: "El que te deja la textura de cafetería en tu casa desde la primera taza.",
      bullets: ["Ahorras 14,85 € y te enviamos 54 g de ceremonial gratis", "Incluye espumador eléctrico para los días sin tiempo", "Caja de regalo: se lo puedes regalar tal cual"],
      specs: { "Incluye": "6 piezas + 54 g matcha", "Tamizador": "Malla fina inox", "Espumador": "USB-C", "Garantía": "2 años" },
    },
    {
      id: "kit-regalo", name: "Kit Regalo Zenqa · caja negra", cat: "kit", price: 64.95, compareAt: 74.85,
      rating: 4.8, reviews: 67, badge: "Regalo listo", stock: 21, img: "p-set.jpg",
      short: "Caja dura, lazo y tarjeta escrita a mano. Sin gastos extra de envío.",
      bullets: ["Ceremonial 30 g + cuenco + batidor de repuesto", "Envío 24 h y entrega en punto limpio", "Tarjeta personalizable en el carrito"],
      specs: { "Incluye": "4 piezas + 30 g", "Caja": "Cartón rígido negro", "Mensaje": "Personalizable", "Envío": "Gratis 24 h" },
    },
    {
      id: "recambio-chasen", name: "Chasen de repuesto · bambú Nara", cat: "kit", price: 14.95, compareAt: 0,
      rating: 4.5, reviews: 39, badge: "", stock: 60, img: "p-kit.jpg",
      short: "Cada 3 meses toca cambiarlo. Ten el tuyo en el cajón.",
      bullets: ["80 púas, tallado a mano en Nara", "Espuma densa durante 90 preparaciones", "Envío gratis si lo sumas a cualquier pedido"],
      specs: { "Material": "Bambú entero", "Púas": "80 · doble capa", "Vida útil": "~3 meses", "Cuidado": "Aire, nunca jabón" },
    },
    {
      id: "chawan-negro", name: "Chawan Negro Mate 320 ml", cat: "vaso", price: 24.95, compareAt: 0,
      rating: 4.8, reviews: 88, badge: "", stock: 27, img: "p-chawan.jpg",
      short: "Borde ancho para batir sin salpicar y base que mantiene el calor.",
      bullets: ["Esmalte mate, no retiene olores", "Apta lavavajillas y microondas", "El cuenco que sale en todos nuestros reels"],
      specs: { "Capacidad": "320 ml", "Material": "Gres 1.280 °C", "Peso": "390 g", "Cuidado": "Lavavajillas" },
    },
    {
      id: "taza-zenqa", name: "Taza Matcha Zenqa con asa", cat: "vaso", price: 18.95, compareAt: 0,
      rating: 4.6, reviews: 74, badge: "", stock: 44, img: "m-mug.jpg",
      short: "Para el matcha de diario, en el escritorio, sin ritual completo.",
      bullets: ["350 ml con marca de nivel para el batido", "Asa grande: se sostiene con una mano", "Apta horno y lavavajillas"],
      specs: { "Capacidad": "350 ml", "Material": "Porcelana", "Marca": "Nivel 70 ml", "Cuidado": "Lavavajillas" },
    },
    {
      id: "vaso-latte", name: "Vaso Latte de cristal con pajita", cat: "vaso", price: 19.95, compareAt: 23.9,
      rating: 4.7, reviews: 156, badge: "Top Instagram", stock: 33, img: "m-glass.jpg",
      short: "El de las capas verdes que se ven en el feed. Borosilicato, no plástico.",
      bullets: ["450 ml: la medida exacta del iced latte", "Pajita de cristal + tapón de bambú", "Apto microondas y lavavajillas"],
      specs: { "Capacidad": "450 ml", "Material": "Borosilicato", "Incluye": "Pajita + tapón", "Cuidado": "Lavavajillas" },
    },
    {
      id: "termico", name: "Vaso térmico Matcha 450 ml", cat: "vaso", price: 26.95, compareAt: 0,
      rating: 4.9, reviews: 112, badge: "Para llevar", stock: 19, img: "m-thermal.jpg",
      short: "Bate, cierra y sal. 6 h frío, 4 h caliente y cero goteo en la mochila.",
      bullets: ["Doble pared inox 304, no sabe a metal", "Boca ancha: entra el chasen sin problema", "Cabe en el portavasos del coche"],
      specs: { "Capacidad": "450 ml", "Mantiene": "6 h frío · 4 h caliente", "Inox": "304 alimentario", "Fugas": "Testado 100 %" },
    },
    {
      id: "sudadera", name: "Sudadera «Te Matcha Vibes»", cat: "ropa", price: 42.95, compareAt: 0,
      rating: 4.8, reviews: 61, badge: "", stock: 23, img: "m-hoodie.jpg",
      short: "Algodón orgánico 420 g. El rosa que solo se ve en la calle.",
      bullets: ["Gramaje grueso, no se deforma al lavar", "Serigrafía a base de agua, no se cuartea", "Unisex: talla de la XS a la XXL"],
      specs: { "Composición": "85 % algodón orgánico", "Gramaje": "420 g/m²", "Tallas": "XS – XXL", "Cuidado": "Lavar del revés 30°" },
    },
    {
      id: "camiseta", name: "Camiseta Zenqa clásica", cat: "ropa", price: 24.95, compareAt: 0,
      rating: 4.6, reviews: 47, badge: "", stock: 52, img: "m-tee.jpg",
      short: "La prenda que más nos pedís en los comentarios. Ahora con el logo grande.",
      bullets: ["Pima peinada 180 g, tacto suave", "Corte recto unisex", "Estampado en agua, dura 100 lavados"],
      specs: { "Composición": "100 % algodón pima", "Gramaje": "180 g/m²", "Tallas": "XS – XXL", "Cuidado": "30° del revés" },
    },
    {
      id: "tote", name: "Eco Tote Bag «Matcha o nada»", cat: "ropa", price: 14.95, compareAt: 0,
      rating: 4.7, reviews: 95, badge: "", stock: 78, img: "m-tote.jpg",
      short: "Cabe el bote, el cuenco y la compra del lunes. Lona cruda de 320 g.",
      bullets: ["Asa larga: se lleva al hombro con las manos ocupadas", "Costuras reforzadas, aguanta 12 kg", "Con bolsillo interior para el chashaku"],
      specs: { "Material": "Lona algodón 320 g", "Medidas": "38 × 42 cm", "Asa": "70 cm", "Cuidado": "Lavado 30°" },
    },
    {
      id: "taza-esmaltada", name: "Taza esmaltada Zenqa Rosa", cat: "ropa", price: 16.95, compareAt: 0,
      rating: 4.5, reviews: 38, badge: "", stock: 36, img: "m-mug.jpg",
      short: "Para el parque, la oficina o la furgoneta. Irrompible y bonita.",
      bullets: ["Acero vitrificado: se cae y sigue viva", "Apta fuego directo y lavavajillas", "Asa plegable de silicona"],
      specs: { "Capacidad": "350 ml", "Material": "Acero esmaltado", "Fuego": "Apto vitro e inducción", "Cuidado": "Lavavajillas" },
    },
  ];

  /* ---------------- recetas / guías ---------------- */
  const recipes = [
    { id: "usucha", name: "Usucha tradicional", time: "60 seg", level: "Fácil", kind: "receta", img: "r-matcha-latte.jpg",
      short: "La receta base. Si te sale densa y sin grumos, ya sabes hacer matcha.",
      steps: ["Tamiza 1 g (2 chashaku) dentro del chawan", "Añade 70 ml de agua a 70 °C", "Bate en «W» 15 s hasta microespuma", "Bebe en 3 sorbos, sin prisa"] },
    { id: "iced-latte", name: "Iced Matcha Latte de avena", time: "2 min", level: "Fácil", kind: "receta", img: "r-iced-latte.jpg",
      short: "El de cafetería por 1,11 € y en menos tiempo que esperar la cola.",
      steps: ["Disuelve 2 g con 40 ml de agua tibia", "Añade vainilla o sirope de arce al gusto", "Llena un vaso de 450 ml con hielo", "Vierte 250 ml de avena y no remuevas"] },
    { id: "fresa", name: "Strawberry Cloud Matcha", time: "3 min", level: "Fácil", kind: "receta", img: "r-strawberry.jpg",
      short: "Fresa + matcha + hielo. Tu tarde se reorganiza sola.",
      steps: ["Tritura 4 fresas con 10 ml de miel", "Monta 100 ml de leche con el espumador", "Prepara 1 g de matcha concentrado", "Capas: fresa, hielo, leche, matcha"] },
    { id: "yuzu", name: "Sparkling Matcha Yuzu Tonic", time: "2 min", level: "Media", kind: "receta", img: "r-yuzu.jpg",
      short: "Sin alcohol, con burbujas y con cara de cóctel de restaurante.",
      steps: ["Mezcla 30 ml de tónica con 15 ml de yuzu", "Concentra 1,5 g de matcha en 30 ml de agua", "Sirve sobre mucho hielo", "Decora con lima deshidratada"] },
    { id: "pre-noche", name: "Matcha nocturno (sin teína alta)", time: "2 min", level: "Fácil", kind: "guia", img: "r-matcha-latte.jpg",
      short: "Segunda infusión con la mitad de cafeína: la misma calma, otro sueño.",
      steps: ["Usa 1,5 g del primer bote ya infusionado", "Agua a 65 °C, más suave", "Bate 10 s, sin espuma densa", "Añade canela en vez de azúcar"] },
    { id: "antes-entreno", name: "Matcha pre-entreno", time: "1 min", level: "Fácil", kind: "receta", img: "r-iced-latte.jpg",
      short: "20 minutos antes de entrenar: foco y bombeo sin el temblor del pre-entreno.",
      steps: ["2 g de matcha en 60 ml de agua a 70 °C", "Pizca de sal marina y lima", "150 ml de agua fría con hielo", "Bebe 20 min antes de empezar"] },
    { id: "smoothie", name: "Smoothie verde de 90 segundos", time: "2 min", level: "Fácil", kind: "receta", img: "r-strawberry.jpg",
      short: "Desayuno completo para los días en los que no desayunas.",
      steps: ["1 g de matcha culinario", "1 plátano congelado + 150 ml de yogur", "100 ml de leche de coco", "Tritura 30 s: textura de helado"] },
    { id: "hojitas", name: "Por qué 70 °C y no hirviendo", time: "2 min", level: "Clave", kind: "guia", img: "r-yuzu.jpg",
      short: "Agua a 100 °C quema la hoja y sale amargor. Es el 90 % de los fallos.",
      steps: ["Hierve y espera 4 minutos destapado", "O usa una jarra a 70 °C", "Si te amarga: menos cantidad, no más agua", "Tamiza siempre: el grumo no se va batiendo"] },
    { id: "conservacion", name: "Cómo guardar el bote (y no perder aroma)", time: "1 min", level: "Clave", kind: "guia", img: "p-ceremonial.jpg",
      short: "El matcha pierde el 40 % del aroma en 30 días si lo dejas en el mueble.",
      steps: ["Nunca en la nevera: la condensación lo apelmaza", "Bote opaco, cerrado y en un armario fresco", "Tras abrirlo, consumir en 60-90 días", "Sin cuchara húmeda dentro del bote"] },
    { id: "espuma", name: "La espuma perfecta en 3 fallos", time: "3 min", level: "Media", kind: "guia", img: "p-kit.jpg",
      short: "Grumos, espuma grande y sabor a hierba: las tres cosas que se arreglan hoy.",
      steps: ["Sin tamizar → grumos: 5 segundos con el colador", "Batiendo en círculos → espuma de fregar: haz «W»", "Agua hirviendo → sabor a heno: baja a 70 °C"] },
  ];

  const reviews = [
    { id: "r1", n: "Laura M.", c: "Madrid", r: 5, t: "1 semana", p: "te-ceremonial",
      txt: "Llevaba 6 años con el café de las 5 y el bajón posterior. Ahora tomo matcha a esa hora y sigo enfocada hasta la cena. El sabor es dulce, no amargo." },
    { id: "r2", n: "Sergio R.", c: "Madrid", r: 5, t: "hace 2 días", p: "kit-completo",
      txt: "Pedí el Kit Pro el jueves y el viernes lo estaba usando. El color es verde intenso y el tamizador se nota: cero grumos. Buenísimo." },
    { id: "r3", n: "Paula G.", c: "Valencia", r: 4, t: "1 mes", p: "te-ceremonial",
      txt: "Al principio me quedaba amargo (agua demasiado caliente). Seguí la guía y ahora me queda cremoso. Cambié el café por esto." },
    { id: "r4", n: "Nerea F.", c: "Sevilla", r: 5, t: "1 mes", p: "vaso-latte",
      txt: "El iced latte con leche de avena está más rico que en mi cafetería y me cuesta 1,10 € en vez de 4,50 €. El vaso es precioso." },
    { id: "r5", n: "Diego L.", c: "Bilbao", r: 5, t: "3 semanas", p: "termico",
      txt: "Lo uso antes del gimnasio y no me tiembla nada, que con los pre-entrenos me pasaba. Y no pierde una gota en la mochila." },
    { id: "r6", n: "Andrea V.", c: "Málaga", r: 5, t: "2 semanas", p: "pack-descubrimiento",
      txt: "Compré el pack para no fallar con el grado. Acabé repitiendo el ceremonial con el descuento. Atención rápida por WhatsApp." },
  ];

  const faq = [
    { q: "¿Cuánto tarda el envío?", a: "Península 24-48 h laborables desde 35 € gratis. Baleares 48 h. Canarias, Ceuta y Melilla 3-5 días con tasas aparte." },
    { q: "¿Y si no me gusta el sabor?", a: "Tienes 30 días y puedes tener el bote abierto. Te devolvemos el importe completo y no tienes que explicarnos nada." },
    { q: "¿Cuántas tazas salen de un bote?", a: "27 con la medida de 1 g. Es 1,11 € por taza frente a los 3,50-4,50 € de cafetería." },
    { q: "¿Tiene tanta cafeína como el café?", a: "Menos y liberada despacio: 68 mg por taza con L-teanina. No hay pico a los 20 minutos ni bajón a las 5." },
    { q: "¿Necesito el kit entero?", a: "Para empezar, no: con la taza y un batidor vale. El kit llega cuando quieres la textura de espuma de verdad." },
  ];

  const money = (n) => n.toFixed(2).replace(".", ",") + " €";
  const byId = Object.fromEntries(products.map((p) => [p.id, p]));
  const recipeById = Object.fromEntries(recipes.map((r) => [r.id, r]));
  const stars = (r) => "★★★★★".slice(0, Math.round(r)) + "☆☆☆☆☆".slice(0, 5 - Math.round(r));

  return { brand, categories, products, recipes, reviews, faq, money, byId, recipeById, stars };
})();
