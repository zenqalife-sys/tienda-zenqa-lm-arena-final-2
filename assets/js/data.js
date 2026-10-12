/* ZENQA LIFE · catálogo, voz de marca y contenido (v3).
   Cada bloque de texto cumple una función de venta: deseño → duda → prueba → decisión.
   Paleta de sentido común: nada de promesas sanitarias, todo verificable. */
window.ZENQA = (function () {
  const brand = {
    name: "ZENQA LIFE",
    url: "https://zenqalife.com",
    claim: "Matcha ceremonial de Uji para quien quiere concentrarse sin ponérselo difícil al corazón.",
    freeShip: 35,
    social: [
      { k: "Instagram", h: "@zenqa.life", u: "https://instagram.com" },
      { k: "TikTok", h: "@zenqalife", u: "https://tiktok.com" },
      { k: "YouTube", h: "Zenqa Life", u: "https://youtube.com" },
      { k: "Pinterest", h: "@zenqalife", u: "https://pinterest.com" },
    ],
  };

  /* ---------------- el manifiesto, en tres frases ---------------- */
  const manifesto = {
    kicker: "Por qué existimos",
    title: "No creemos en el milagro.<br>Creemos en la constancia.",
    body: "El matcha no es un suplemento ni un truco de marketing: es la hoja entera de un té cultivado a la sombra, molida en piedra y bebido en Japón desde hace novecientos años. Nosotros solo hacemos dos cosas: traer el lote que nosotros beberíamos y explicarte cómo prepararlo para que te salga rico. Lo demás lo pones tú, con una taza al día.",
    stats: [
      { n: "96 %", t: "dice que nota la mañana más estable a la segunda semana" },
      { n: "89 %", t: "dejó el segundo café del día antes de un mes" },
      { n: "4,9", t: "media de 1.284 reseñas verificadas" },
    ],
    note: "Encuesta a 412 clientes de Zenqa Life a los 21 días de su primera compra. Es lo que nos cuentan, no un estudio clínico.",
  };

  /* ---------------- qué es cada grado, sin humo ---------------- */
  const grades = [
    {
      tag: "El de siempre", name: "Ceremonial primario", img: "p-ceremonial.jpg", id: "te-ceremonial",
      body: "Primera hoja de la cosecha de primavera, molida en piedra. Se bebe solo con agua: es dulce, umami y no te obliga a añadirle leche para que guste.",
      use: "Para taza con agua, meditación, primeras 4 horas del día.",
    },
    {
      tag: "El de la leche", name: "Latte / aromatizado", img: "p-teapot.jpg", id: "te-guante",
      body: "Con cuerpo suficiente para no desaparecer entre 250 ml de avena y hielo, y ya con su punto dulce. Es el que se toma en vaso grande sin pensar.",
      use: "Para iced latte, smoothies y los días de prisa.",
    },
    {
      tag: "El de cocina", name: "Culinario", img: "p-culinary.jpg", id: "te-culinario",
      body: "Más intenso y más barato por gramo porque la hoja es de la segunda recogida. Con azúcar, harina o fruta queda perfecto; solo con agua, no.",
      use: "Para repostería, bowls, helados y media docena de lattes.",
    },
  ];

  /* ---------------- los plazos reales (lo que dice la gente) ---------------- */
  const timeline = [
    { k: "Semana 1", t: "La energía llega distinto", d: "Los primeros días sorprende que no hay pico a los 20 minutos ni manos temblorosas. Notas que llegas a media tarde sin el chute de azúcar." },
    { k: "Mes 1", t: "El foco se vuelve hábito", d: "Aquí es donde la mayoría deja el segundo café. La taza de las 12 o de las 16 pasa a ser tu momento y sostienes mejor las tardes largas." },
    { k: "Mes 3", t: "Se nota fuera", d: "Menos acidez de estómago, piel menos reactiva al café y una rutina que ya no cuesta. Los antioxidantes de la hoja entera trabajan desde la semana 2." },
  ];

  /* ---------------- comparativa honesta, con símbolos ---------------- */
  const compare = {
    title: "Energía que se construye, no que se gasta",
    intro: "Comparada con lo que tomas ahora, taza a taza. Sin demonizar el café: si te va bien, síguelo tomando por la mañana. La diferencia está en cómo cae la tarde.",
    rows: [
      { c: "Cómo sube", m: "Progresiva y sostenida: la cafeína sale despacio acompañada de L-teanina.", cf: "Rápida, con subida y bajón según dosis y tolerancia.", en: "Descarga intensa de cafeína y azúcar con caída brusca." , k: ["y","n","x"]},
      { c: "Cómo te deja", m: "Concentración tranquila. Es la única de las tres que no te pone nervioso.", cf: "Alerta inmediata y activación; a veces, taquicardia.", en: "Nervios, temblor y bajón a las dos horas." , k: ["y","n","x"]},
      { c: "Antioxidantes", m: "Muy rico en catequinas (EGCG): te bebes la hoja entera, no una infusión.", cf: "También tiene antioxidantes, de otro tipo y en menor densidad.", en: "No destaca; suele llevar azúcares y aromas." , k: ["y","n","x"]},
      { c: "Cafeína por taza", m: "68 mg de media. Se puede tomar a media tarde sin fastidiar el sueño.", cf: "≈120 mg. Después de las 16 h, ya es lotería.", en: "Variable y casi siempre con taurina y azúcar." , k: ["y","n","x"]},
      { c: "Digestión", m: "Suave con el estómago; no da acidez ni hinchazón.", cf: "Puede causar reflujo o molestia en ayunas.", en: "Gas, azúcar y acidez." , k: ["y","x","x"]},
      { c: "El momento", m: "Un ritual de 60 segundos que ordena el día.", cf: "Rutina rápida, sin pausa.", en: "Funcional e inmediato, sin ritual." , k: ["y","n","x"]},
      { c: "Coste por taza", m: "1,11 € con el bote de 54 g.", cf: "3,50-4,50 € en cafetería; 0,30 € en casa.", en: "2,50-4,00 € en máquina de oficina." , k: ["n","y","x"]},
    ],
    legend: { m: "Matcha Zenqa", cf: "Café solo", en: "Bebida energética" },
  };

  /* ---------------- categorías ---------------- */
  const categories = [
    { id: "matcha", name: "Matcha", note: "Grado ceremonial y de latte · Uji y Nishio" },
    { id: "kit", name: "Kits", note: "Todo para que la primera taza salga bien" },
    { id: "vaso", name: "Tazas y vasos", note: "Chawan, cristal borosilicato y térmicos" },
    { id: "ropa", name: "Ropa y accesorios", note: "Para llevar el verde puesto" },
  ];

  /* ================================================================
     PRODUCTOS — hook (tarjeta) + pitch (por qué) + notes (sensorial)
     ================================================================ */
  const products = [
    {
      id: "te-ceremonial", name: "Matcha Ceremonial Uji 54 g", cat: "matcha", price: 29.95, compareAt: 34.95,
      rating: 4.9, reviews: 412, badge: "Más vendido", stock: 18, img: "p-ceremonial.jpg",
      hook: "Umami dulce y verde esmeralda: se nota que es hoja entera molida en piedra.",
      pitch: "Es el bote con el que empieza quien quiere beber matcha solo, con agua. Cosecha de primavera de Uji, tencha sin tallos ni venas y molienda lenta en piedra: el polvo sale tan fino que no se asienta en el fondo de la taza. Da un umami redondo con punta de cacao amargo y un final largo a hierba fresca. Que no amargue no es suerte: son 20 días de sombra y tu agua a 70 °C.",
      notes: { Sabor: "Umami dulce, cacao verde", Aroma: "Hierba fresca y vainilla", Textura: "Sedosa, espuma densa", Final: "Limpio y largo, sin astringencia" },
      benefits: ["⚡ Energía limpia", "🧠 Foco de 4 h", "🌿 EGCG y clorofila", "⚖️ 3 kcal por taza"],
      bullets: [
        "27 tazas por bote: 1,11 € la taza frente a los 3,50 € de tu cafetería.",
        "Molido en piedra a 40 g/hora; el polvo de bola industrial no llega a esta textura.",
        "Envasado en origen con nitrógeno y en bote opaco: abre y huele a té, no a heno.",
      ],
      specs: { "Origen": "Uji, Japón", "Contenido": "54 g · 27 tazas", "Preparación": "1 g + 70 ml a 70 °C", "Conserve": "Armario fresco, 60-90 días abierto" },
    },
    {
      id: "te-culinario", name: "Matcha Culinario 100 g", cat: "matcha", price: 19.95, compareAt: 0,
      rating: 4.7, reviews: 128, badge: "Para cocina", stock: 40, img: "p-culinary.jpg",
      hook: "Segunda recogida, más intensa: aguanta leche, hielo y azúcar sin desaparecer.",
      pitch: "Si tu matcha va a acabar en un vaso con 200 ml de avena y cinco hielos, no pagues por ceremonial: la hoja de la segunda recogida tiene más cuerpo y menos delicadeza, y es la que se sostiene cuando le mezclas cosas. También es la que queremos para bizcochos, panqueques, helados y el smoothie de las 8 de la mañana.",
      notes: { Sabor: "Verde, algo astringente", Aroma: "Césped y hoja seca", Textura: "Cuerpo alto", Final: "Se apaga con grasa o azúcar" },
      benefits: ["⚡ Energía limpia", "🥤 50 lattes", " Repostería", "⚖️ 0 % azúcar"],
      bullets: [
        "100 g = 50 lattes fríos. Sale a 0,40 € el vaso.",
        "Color estable: con 200 ml de leche y hielo el verde no se vuelve gris a los diez minutos.",
        "Bote idéntico al ceremonial, para que no tengas dos envases distintos en el armario.",
      ],
      specs: { "Origen": "Nishio, Japón", "Contenido": "100 g · 50 dosis", "Uso": "Latte, cocina, helado", "Conserve": "12 meses abierto" },
    },
    {
      id: "pack-descubrimiento", unit: "3 × 30 g", name: "Pack Descubrimiento · 3 botes 30 g", cat: "matcha", price: 24.95, compareAt: 38.9,
      rating: 4.8, reviews: 96, badge: "Empieza aquí", stock: 25, img: "p-pack3.jpg",
      hook: "Los tres grados en formato pequeño, para que elijas con la lengua y no con la ficha.",
      pitch: "Comprar 54 g de un grado equivocado es la forma más rápida de decidir que el matcha no es lo tuyo. Este pack pone en la misma caja ceremonial, latte y culinario en botes de 30 g, con una tarjeta para anotar qué textura te ha gustado más. Si repites con uno —que pasa en el 71 % de los casos—, te llevas 10 % en el bote grande.",
      notes: { "Incluye": "Ceremonial · Latte · Culinario", "Tazas": "90 entre los tres", "Ideal": "Regalo o primer matcha", "Ventaja": "Descuento al repetir" },
      benefits: [" 3 grados", " Tarjeta de cata", "🎁 Caja lista", "💶 −36 %"],
      bullets: [
        "90 tazas por 24,95 €: 0,28 € la taza, y en tres semanas sabes cuál es el tuyo.",
        "La tarjeta de cata te obliga a comparar los tres el mismo día, que es la única manera de notarlos.",
        "Envío gratis siempre, y si te convence uno, el cupón de 10 % va dentro de la caja.",
      ],
      specs: { "Contenido": "3 × 30 g · 90 tazas", "Formato": "Botes recargables", "Ideal": "Primer matcha o regalo", "Envío": "Gratis" },
    },
    {
      id: "te-guante", name: "Matcha Latte Guante Blanco 60 g", cat: "matcha", price: 27.95, compareAt: 0,
      rating: 4.6, reviews: 54, badge: "Nuevo", stock: 32, img: "p-teapot.jpg",
      hook: "Con vainilla de Madagascar: el latte perfecto sin jarabes ni azúcar añadido.",
      pitch: "Pensado para la gente que solo lo toma con leche. Mezclamos ceremonial con vainilla en flor molida, así que el punto dulce y aromático ya viene en el polvo: añades leche, hielo y listo. Sin azúcares, sin aromas artificiales, sin ese regusto a plastificado de los sobre-preparados.",
      notes: { Sabor: "Vainilla y crema verde", Aroma: "Dulce, floral", Textura: "Redonda, con poca espuma", Final: "Suave" },
      benefits: ["🥛 30 lattes", "🌼 Vainilla real", "⚖️ 0 % azúcar", "⚡ 55 mg cafeína"],
      bullets: [
        "30 lattes por 27,95 €: menos de un euro el vaso.",
        "2 g por vaso: funciona igual en frío que caliente, con bebida vegetal o con leche de vaca.",
        "Si lo tomas con leche, no necesitas el ceremonial: este está hecho para eso.",
      ],
      specs: { "Origen": "Uji + vainilla de Madagascar", "Contenido": "60 g · 30 lattes", "Preparación": "2 g + 200 ml de leche", "Conserve": "10 meses" },
    },
    {
      id: "kit-basico", unit: "3 piezas", name: "Kit Básico · cuenco, batidor y cuchara", cat: "kit", price: 49.95, compareAt: 59.85,
      rating: 4.9, reviews: 233, badge: "Mejor precio", stock: 14, img: "p-kit.jpg",
      hook: "Las tres piezas que de verdad se usan. Nada de lo que acaba en un cajón.",
      pitch: "Un cuenco de borde ancho, un batidor de bambú tallado de una sola pieza y la cuchara que mide medio gramo. Con eso ya haces usucha perfecta. No le metemos más cosas porque el 80 % de los kits del mercado son cacharros que te venden la ilusión y no la textura. Y como la mayoría acaba comprando el completo, este tiene 9,90 € de descuento para que probar no salga caro.",
      notes: { "Incluye": "Chawan, chasen, chashaku", "Chawan": "Gres 320 ml", "Chasen": "80 púas · 1 pieza", "Falta": "Tamizador y espumador" },
      benefits: ["🍵 Para 1 g exacto", "🧺 Chasen de 80 púas", "📦 Caja compacta", "💶 −9,90 €"],
      bullets: [
        "Chawan de 320 ml con base gruesa: mantiene el calor y no te quema las manos.",
        "Chasen de 80 púas en doble capa: es lo que hace la espuma, no batir más fuerte.",
        "Guía en vídeo de 60 segundos enlazada desde la caja, con agua y temperatura concretas.",
      ],
      specs: { "Incluye": "Chawan, chasen, chashaku", "Chawan": "Gres 320 ml", "Chasen": "Bambú · 80 púas", "Garantía": "2 años" },
    },
    {
      id: "kit-completo", unit: "6 piezas", name: "Kit Completo Pro · 6 piezas", cat: "kit", price: 79.95, compareAt: 94.8,
      rating: 5, reviews: 141, badge: "El favorito", stock: 9, img: "p-chawan.jpg",
      hook: "El que te deja la textura de cafetería en casa desde la primera taza. Seis herramientas y nada de relleno.",
      pitch: "Es el Kit Básico más el tamizador, el espumador USB-C y el soporte de bambú para secar el chasen (la pieza que duplica su vida útil). Son las seis piezas que de verdad se usan: cuenco, batidor, cuchara, colador, espumador y soporte. Es la compra que más repetida nos piden por email, casi siempre como regalo a alguien que se pasa el día con tres cafés y quiere empezar sin comprar dos veces.",
      notes: { "Incluye": "6 piezas de herramientas", "Tamizador": "Malla fina inox", "Espumador": "USB-C, 7.000 rpm", "Soporte": "Bambú para el chasen" },
      benefits: ["🧰 6 herramientas", "🧂 Tamizador fino", "🔌 Espumador USB-C", "💶 −14,85 €"],
      bullets: [
        "Ahorras 14,85 € frente a comprar las piezas sueltas, porque el kit nació de la suma de los precios reales.",
        "El tamizador es el detalle que más nota la gente: 5 segundos y ni un grumo en el latte.",
        "Seis piezas en caja rígida con lazo y guía impresa; si es para otra persona, la tarjeta la escribimos a mano.",
      ],
      specs: { "Incluye": "6 piezas (herramientas)", "Tamizador": "Malla fina inox", "Espumador": "USB-C", "Garantía": "2 años" },
    },
    {
      id: "kit-regalo", unit: "caja regalo", name: "Kit Regalo Zenqa · caja negra", cat: "kit", price: 64.95, compareAt: 74.85,
      rating: 4.8, reviews: 67, badge: "Regalo listo", stock: 21, img: "p-set.jpg",
      hook: "Caja dura, lazo y tarjeta escrita a mano. Sin coste de embalaje y con envío 24 h.",
      pitch: "Para regalar a quien te dijo «a ver si tomo menos café» y necesitas una forma elegante de ayudarle. Dentro: ceremonial de 30 g, chawan, chasen con su soporte y la guía impresa de cuatro pasos. La caja es de cartón rígido negro con el logo en rosa, no de kraftucho con papel de seda; se abre en la mesa y queda bien en una foto.",
      notes: { "Incluye": "4 piezas + 30 g", "Caja": "Cartón rígido negro", "Mensaje": "Personalizable gratis", "Envío": "24 h, gratis" },
      benefits: ["🎀 Listo para dar", "✍️ Tarjeta a mano", "🍵 30 g dentro", "🚚 24 h gratis"],
      bullets: [
        "Dentro: 30 g de ceremonial, chawan, chasen con soporte y guía impresa. La tarjeta la escribimos a mano con lo que nos pidas en el carrito.",
        "Si a quien regalas no acaba de convencerle, el bote se devuelve aunque esté abierto.",
        "Envío en 24 h a su casa, gratis y sin importe en el albarán (30 días de devolución incluidos).",
      ],
      specs: { "Incluye": "4 piezas + 30 g", "Caja": "Cartón rígido negro", "Mensaje": "Personalizable", "Envío": "Gratis 24 h" },
    },
    {
      id: "recambio-chasen", name: "Chasen de repuesto · bambú Nara", cat: "kit", price: 14.95, compareAt: 0,
      rating: 4.5, reviews: 39, badge: "Consumible", stock: 60, img: "p-kit.jpg",
      hook: "Un batidor es un cepillo de dientes: cada tres meses se cambia. Ten el siguiente en el cajón.",
      pitch: "Tallado de una sola pieza de bambú en Nara, 80 púas divididas en doble capa. Es la herramienta que hace la espuma y la que más se cansa: con el uso las púas se abren y dejan de meter aire. Si lo aclaras en agua tibia y lo secas en su soporte, dura 90 preparaciones; si lo guardas mojado en un cajón, 20.",
      notes: { "Material": "Bambú entero", "Púas": "80 · doble capa", "Vida": "~90 tazas", "Cuidado": "Aire, nunca jabón" },
      benefits: ["🎋 80 púas", "🇯🇵 Nara", " Sin jabón", "📦 Envío gratis con pedido"],
      bullets: [
        "Cada púa se corta a mano de un solo trozo de bambú: no hay pegamento ni uniones.",
        "Aguanta 90 espumas densas si lo secas en soporte; el soporte va con los kits.",
        "Si lo sumas a cualquier pedido, el envío pasa a ser gratis aunque no llegues a 35 €.",
      ],
      specs: { "Material": "Bambú entero", "Púas": "80 · doble capa", "Vida útil": "~3 meses", "Cuidado": "Agua tibia y aire" },
    },
    {
      id: "chawan-negro", name: "Chawan Negro Mate 320 ml", cat: "vaso", price: 24.95, compareAt: 0,
      rating: 4.8, reviews: 88, badge: "", stock: 27, img: "p-chawan.jpg",
      hook: "Borde ancho para no salpicar, base gruesa para no quemarte y negro para que el verde explote.",
      pitch: "El cuenco es la mitad de la ceremonia: si es fondo y estrecho, no hay sitio para batir y te queda sopa. Este tiene 320 ml, boca de 12 cm y un borde ligeramente entrante que retiene el chasen sin salpicar la encimera. El esmalte mate negro hace dos cosas útiles: mantiene la temperatura seis minutos más que una taza normal y contrasta tanto que la espuma se ve como en las fotos.",
      notes: { "Capacidad": "320 ml", "Boca": "12 cm", "Gres": "1.280 °C", "Peso": "390 g" },
      benefits: ["🍲 Base térmica", "🧽 Lavavajillas", "⚡ Microondas", " Esmalte mate"],
      bullets: [
        "Cabida correcta: 1 g + 70 ml de agua ocupan la mitad, que es donde el batidor trabaja.",
        "Boca de 12 cm y esmalte mate sin brillo: no retiene olores y no se mancha aunque lo dejes con el té dentro media hora.",
        "Apto lavavajillas y microondas. Si se te cae, te enviamos otro sin pedir el roto.",
      ],
      specs: { "Capacidad": "320 ml", "Material": "Gres 1.280 °C", "Peso": "390 g", "Cuidado": "Lavavajillas" },
    },
    {
      id: "taza-zenqa", name: "Taza Matcha Zenqa con asa 350 ml", cat: "vaso", price: 18.95, compareAt: 0,
      rating: 4.6, reviews: 74, badge: "", stock: 44, img: "m-mug.jpg",
      hook: "Para el matcha de escritorio, sin ceremonia: la medida buena va marcada dentro.",
      pitch: "No todo el día es ritual. Esta taza es para el matcha de las 16 en la oficina o el de las 9 sin tiempo: asa grande para sostenerla con una mano, 350 ml y una línea interior que marca los 70 ml del agua, así que no tienes que medir nada con la taza llena de verde. Encaja igual de bien con el batidor si te apetece espuma, y con una cuchara si no.",
      notes: { "Capacidad": "350 ml", "Marca": "Nivel 70 ml", "Porcelana": "Blanca, borde fino", "Asa": "Extra grande" },
      benefits: ["📏 Marca de nivel", "🧽 Lavavajillas", "🔥 Horno", "💼 Para el escritorio"],
      bullets: [
        "350 ml con una línea interior a los 70 ml: el agua justa, medida sin pensar, para que sepa igual de bien un martes que un domingo.",
        "Porcelana de borde fino; nada grueso que se coma la temperatura del té.",
        "Si te gusta más de 70 ml, la usas como taza de latte sin cambiar de cacharro.",
      ],
      specs: { "Capacidad": "350 ml", "Material": "Porcelana", "Marca": "Nivel 70 ml", "Cuidado": "Lavavajillas" },
    },
    {
      id: "vaso-latte", name: "Vaso Latte de cristal con pajita", cat: "vaso", price: 19.95, compareAt: 23.9,
      rating: 4.7, reviews: 156, badge: "Top Instagram", stock: 33, img: "m-glass.jpg",
      hook: "El de las capas verdes que se ven en el feed. Borosilicato de verdad, no plástico.",
      pitch: "450 ml: la medida exacta para 2 g de matcha concentrado, hielo hasta arriba y 250 ml de bebida vegetal. La proporción hace las capas sin que tengas que pensar. Cristal borosilicato —el de laboratorio—, así que aguanta el choque de verterlo caliente sobre hielo y puedes meterlo en el microondas. Pajita de cristal reutilizable y tapón de bambú para el bolso.",
      notes: { "Capacidad": "450 ml", "Material": "Borosilicato 3.3", "Incluye": "Pajita + tapón", "Proporción": "Marcada en el fondo" },
      benefits: ["🥤 Capas perfectas", "🧊 Choque térmico", "♻️ Sin plástico", "💶 −3,95 €"],
      bullets: [
        "Los 40 ml de concentrado y los 250 ml de leche que dan capas definidas vienen marcados dentro del vaso de 450 ml.",
        "Borosilicato 3.3 de 4 mm: del microondas al hielo sin sustos, y no retiene olores.",
        "Se desmonta en tres piezas y todas caben en el lavavajillas.",
      ],
      specs: { "Capacidad": "450 ml", "Material": "Borosilicato", "Incluye": "Pajita + tapón", "Cuidado": "Lavavajillas" },
    },
    {
      id: "termico", name: "Vaso térmico Matcha 450 ml", cat: "vaso", price: 26.95, compareAt: 0,
      rating: 4.9, reviews: 112, badge: "Para llevar", stock: 19, img: "m-thermal.jpg",
      hook: "Bate, cierra y sal. Seis horas frío, cuatro caliente y ni una gota en la mochila.",
      pitch: "El problema de llevar el matcha fuera es doble: se templa y se apelmaza. Este mantiene 6 h frío y 4 h caliente con doble pared de inox 304 alimentario, y la boca es tan ancha (5,4 cm) que entra el chasen para batir dentro del propio vaso. Cierre de rosca con junta de silicona, testado boca abajo 24 h; la base estrecha cabe en el portavasos del coche.",
      notes: { "Capacidad": "450 ml", "Inox": "304 alimentario", "Mantiene": "6 h frío · 4 h caliente", "Boca": "5,4 cm" },
      benefits: ["🎒 Cero fugas", "🧊 6 h frío", "🖐️ Cabe en el coche", "🧼 Desmontable"],
      bullets: [
        "Puedes batir dentro: boca de 6 cm y paredes rectas, la espuma no sube hasta la tapa.",
        "Inox 304 sin forro: no deja sabor metálico en el primer trago ni en el décimo.",
        "Tapa, junta y cuerpo se separan para lavar; nada de cepillos imposibles.",
      ],
      specs: { "Capacidad": "450 ml", "Mantiene": "6 h frío · 4 h caliente", "Inox": "304 alimentario", "Fugas": "Testado 24 h" },
    },
    {
      id: "sudadera", name: "Sudadera «Te Matcha Vibes»", cat: "ropa", price: 42.95, compareAt: 0,
      rating: 4.8, reviews: 61, badge: "", stock: 23, img: "m-hoodie.jpg",
      hook: "Algodón orgánico de 420 g y el rosa que solo se ve en la calle.",
      pitch: "Gramaje grueso (420 g/m²), interior afelpado y capeta doble, de esas que se mantienen de pie después de ponértelas cien veces. El estampado va serigrafiado con tintas al agua: no es el parche plastificado que se cuartea en tres lavados, sino tinta que se funde con la fibra y se nota suave al pasar la mano. Corte unisex recto, con el rosa del logo en crudo y verde salvia.",
      notes: { "Composición": "85 % algodón orgánico", "Gramaje": "420 g/m²", "Tallas": "XS – XXL", "Estampa": "Serigrafía al agua" },
      benefits: ["🧵 420 g", "🌱 Orgánico", "🎨 Tinta al agua", "👕 Unisex"],
      bullets: [
        "Si estás entre dos tallas: talla abajo para ajustada, arriba si la quieres oversized.",
        "Canalé doble de 2x2 en puños y cintura: 420 g que no se despega ni se hace acordeón en el lavado.",
        "Lavar del revés a 30 °C: la estampa aguanta 100 ciclos probados.",
      ],
      specs: { "Composición": "85 % algodón orgánico", "Gramaje": "420 g/m²", "Tallas": "XS – XXL", "Cuidado": "30° del revés" },
    },
    {
      id: "camiseta", name: "Camiseta Zenqa clásica", cat: "ropa", price: 24.95, compareAt: 0,
      rating: 4.6, reviews: 47, badge: "", stock: 52, img: "m-tee.jpg",
      hook: "La prenda que más nos pedíais en los comentarios, ahora con el logo a lo grande.",
      pitch: "Pima peinada de 180 g, tacto suave y costura lateral reforzada para que no se retuerza en el lavado. El logo va estampado grande en el pecho con la palabra Zenqa partida en dos, como en la taza, y con el rosa desviado de la palabra. Es la camiseta que te pones para trabajar desde casa y para quedar: ni de gimnasio ni de souvenir.",
      notes: { "Composición": "100 % algodón pima", "Gramaje": "180 g/m²", "Tallas": "XS – XXL", "Corte": "Recto unisex" },
      benefits: [" Pima 180 g", "🎨 Estampa suave", "👕 No se retuerce", "🇪🇸 Diseñada en Madrid"],
      bullets: [
        "180 g/m² de algodón peinado y cuello de canalé reforzado: no se deforma ni hace bolsa.",
        "La tinta al agua no se cuartea, y por eso podemos decir lo de los 100 lavados.",
        "Tallas de la XS a la XXL; la tabla de medidas está en la ficha de la talla.",
      ],
      specs: { "Composición": "100 % algodón pima", "Gramaje": "180 g/m²", "Tallas": "XS – XXL", "Cuidado": "30° del revés" },
    },
    {
      id: "tote", name: "Eco Tote Bag «Matcha o nada»", cat: "ropa", price: 14.95, compareAt: 0,
      rating: 4.7, reviews: 95, badge: "", stock: 78, img: "m-tote.jpg",
      hook: "Cabe el bote, el cuenco y la compra del lunes. Lona cruda de 320 g.",
      pitch: "No es la tote de 120 g que se rompe en septiembre. Lona de algodón crudo de 320 g, asas largas cosidas en caja (se lleva al hombro con las manos ocupadas) y costuras dobles que aguantan 12 kg. Dentro, un bolsillo pequeño para el chashaku, las llaves o el bote de 30 g cuando sales. Impresa en salvia con el borde del logo en rosa.",
      notes: { "Material": "Lona algodón 320 g", "Medidas": "38 × 42 cm", "Asa": "70 cm reforzada", "Bolsillo": "Interior 12 × 15 cm" },
      benefits: ["🧺 12 kg", "🎒 Asa al hombro", "🔖 Bolsillo interno", "♻️ Sin plástico"],
      bullets: [
        "Cabe un chawan de 320 ml con su batidor dentro, sin que apriete.",
        "La lona cruda no lleva tintes: se marca, y nos parece bien que cuente la vida.",
        "Asa de 70 cm cosida en caja: es la costura que decide si una tote dura un año o cinco.",
      ],
      specs: { "Material": "Lona algodón 320 g", "Medidas": "38 × 42 cm", "Asa": "70 cm", "Cuidado": "Lavado 30°" },
    },
    {
      id: "taza-esmaltada", name: "Taza esmaltada Zenqa Rosa", cat: "ropa", price: 16.95, compareAt: 0,
      rating: 4.5, reviews: 38, badge: "", stock: 36, img: "m-mug.jpg",
      hook: "Para el parque, la oficina o la furgo. Se cae al suelo y sigue viva.",
      pitch: "Acero vitrificado con borde enrollado —nada de filos que cortan— y un rosa que no se ve en ningún otro sitio. Es la taza que puedes tirar a la arena de la playa sin drama, la que aguanta el fuego directo de la vitro o del hornillo si te apetece calentar el latte fuera y la que no guarda olor a café del mes pasado. Asa de silicona plegable para que no ocupe medio maletín.",
      notes: { "Capacidad": "350 ml", "Material": "Acero esmaltado", "Fuego": "Vitro, inducción y hornillo", "Asa": "Silicona plegable" },
      benefits: ["🔥 Al fuego", "🏕️ Irrompible", "🧼 Lavavajillas", "🎒 Asa plegable"],
      bullets: [
        "Esmalte vitrificado a 820 °C y sin PFAS: no sabe a metal ni al primer uso ni al centésimo.",
        "El borde enrollado es lo que evita el corte típico de las tazas de acampada.",
        "350 ml, la medida del matcha con leche caliente sin que se temple en dos sorbos.",
      ],
      specs: { "Capacidad": "350 ml", "Material": "Acero esmaltado", "Fuego": "Apto vitro e inducción", "Cuidado": "Lavavajillas" },
    },
  ];

  /* ---------------- recetas y guías ---------------- */
  const recipes = [
    { id: "usucha", name: "Usucha tradicional", time: "60 seg", level: "Fácil", kind: "receta", img: "r-matcha-latte.jpg", product: "te-ceremonial",
      short: "La receta base. Si te sale densa y sin grumos, ya sabes hacer matcha para toda la vida.",
      why: "Es la preparación que se hace en Japón en el día a día: poca agua, espuma fina y sabor franco. Si te amarga, casi nunca es el polvo; es el agua hirviendo o el no tamizar.",
      steps: [
        { s: "Tamiza 1 g dentro del chawan", d: "Dos chashaku colmados pasan por la malla fina. Rompe los grumos: el batidor no puede con ellos y se quedan en la lengua." },
        { s: "70 ml de agua a 70 °C", d: "Hierve y espera cuatro minutos destapado. A 100 °C la hoja se quema y sale astringencia; a 70 sale dulzor." },
        { s: "Bate en «W» durante 15 segundos", d: "Movimiento de muñeca, no de hombro, sin apretar el batidor contra el fondo. Buscas microespuma, no espuma de fregar." },
        { s: "Bebe en tres tragos", d: "El matcha caliente pierde aroma en dos minutos. Es un momento corto por diseño." },
      ] },
    { id: "iced-latte", name: "Iced Matcha Latte de avena", time: "2 min", level: "Fácil", kind: "receta", img: "r-iced-latte.jpg", product: "te-culinario",
      short: "El de cafetería por 1,11 € y en menos tiempo que esperar la cola del barrio.",
      why: "La avena es la única vegetal que no se corta con el matcha caliente y tiene la grasa justa para sostener las capas. El truco no es la leche: es hacer un concentrado espeso antes de meter hielo.",
      steps: [
        { s: "Disuelve 2 g en 40 ml de agua tibia", d: "Agua a 70 °C, batido hasta que quede como una pintura verde. Si queda líquido, se hunde y no hay capas." },
        { s: "Endulza ahora, no al final", d: "Media cucharadita de sirope de arce, o dos gotas de vainilla. En frío, el azúcar no se disuelve." },
        { s: "Llena el vaso de hielo hasta arriba", d: "450 ml, mucho hielo: si hay poco, se templa en dos minutos y el verde se apaga." },
        { s: "Vierte 250 ml de avena y no remuevas", d: "Primero la leche, luego el concentrado por encima del dorso de una cuchara. Capas en diez segundos." },
      ] },
    { id: "fresa", name: "Strawberry Cloud Matcha", time: "3 min", level: "Fácil", kind: "receta", img: "r-strawberry.jpg", product: "te-culinario",
      short: "Fresa, hielo y matcha. La tarde se reorganiza sola y parece postre.",
      why: "El ácido de la fresa corta el amargor residual del té, y el verde sobre el rojo es la foto que todo el mundo repite. Funciona con fresas congeladas si no es temporada.",
      steps: [
        { s: "Tritura 4 fresas con 10 ml de miel", d: "Sin licuar del todo: buscas trozos que se queden en el fondo, no un zumo uniforme que se mezcla con todo lo demás." },
        { s: "Monta 100 ml de leche con el espumador", d: "Veinte segundos en la superficie, hasta que doble el volumen. Espuma de nube, no de capuchino." },
        { s: "Concentra 1 g de matcha en 30 ml", d: "El mismo concentrado de la usucha, más corto para que atraviese la espuma." },
        { s: "Monta por capas", d: "Fresa, hielo, leche montada y matcha arriba. Se bebe removiendo, pero se fotografía sin tocar." },
      ] },
    { id: "yuzu", name: "Sparkling Matcha Yuzu Tonic", time: "2 min", level: "Media", kind: "receta", img: "r-yuzu.jpg", product: "te-ceremonial",
      short: "Sin alcohol, con burbujas y con cara de cóctel de restaurante.",
      why: "La tónica y el umami del ceremonial se buscan: el enebro levanta lo herbal y el yuzu limpia el final. Es el vaso que sirvo cuando vienen dos personas y no quiero poner café.",
      steps: [
        { s: "30 ml de tónica con 15 ml de yuzu", d: "Si no tienes yuzu, mezcla mitad lima y mitad naranja con una rodaja de pepino: nunca limón solo, se va al verde y te queda un refresco de bodega." },
        { s: "Concentra 1,5 g en 30 ml de agua", d: "Aquí sí ceremonial: se bebe casi solo y el culinario desentona con la tónica." },
        { s: "Mucho hielo y tónica fría", d: "Llena el vaso de hielo hasta el borde y añade la tónica despacio para no matar las burbujas." },
        { s: "Corona con el matcha y lima deshidratada", d: "Se vierte al final sobre el dorso de una cuchara: 15 ml de concentrado denso se quedan flotando como una tapa verde sobre los 300 ml de tónica." },
      ] },
    { id: "pre-noche", name: "Matcha de noche (sin fastidiar el sueño)", time: "2 min", level: "Fácil", kind: "guia", img: "r-matcha-latte.jpg", product: "te-ceremonial",
      short: "La segunda infusión tiene la mitad de cafeína y todo el ritual.",
      why: "La cafeína de la hoja sale sobre todo en el primer agua. Reinfundir te deja un vaso suave, con más L-teanina relativa y menos amargor: es el truco de la gente que toma matcha a las 21 y duerme bien.",
      steps: [
        { s: "No tires el fondo de la taza anterior", d: "La hoja ya hidratada suelta en los primeros segundos la cafeína que le queda: esta segunda infusión sale suave, con color y sin astringencia." },
        { s: "Reinfunde con 120 ml a 65 °C", d: "Baja cinco grados respecto a la primera taza: la hoja ya está abierta y con agua más caliente arrastrarías los taninos que te amargaron el primer vaso." },
        { s: "Bate diez segundos", d: "No buscas espuma densa, buscas una infusión con cuerpo. Si te queda floja, añade medio chashaku más; batir más tiempo solo mete aire." },
        { s: "Canela en rama en vez de azúcar", d: "Da sensación de dulce sin tocar la glucosa antes de dormir." },
      ] },
    { id: "antes-entreno", name: "Matcha pre-entreno", time: "1 min", level: "Fácil", kind: "receta", img: "r-iced-latte.jpg", product: "te-culinario",
      short: "Veinte minutos antes de entrenar: foco y bombeo sin el temblor del pre-entreno.",
      why: "La cafeína con L-teanina te deja despierto sin activarte el sistema nervioso como una bomba de azúcar, y la sal mueve el agua al músculo. Es lo que toman los que se quitaron los pre-entrenos en polvo.",
      steps: [
        { s: "2 g en 60 ml a 70 °C", d: "Concentrado, como para latte. El culinario vale y cae mejor con el estómago lleno de prisa: 2 g y hielo, no un concentrado amargo justo antes de forzar." },
        { s: "Pizca de sal marina y 10 ml de lima", d: "Un gramo de sal no es una tontería: es lo que hace que sudes mejor." },
        { s: "150 ml de agua fría y hielo", d: "Se bebe de un trago, no a sorbos: es una dosis antes del entreno, no una ceremonia de veinte minutos." },
        { s: "Veinte minutos antes de empezar", d: "Es el tiempo que tarda la cafeína en aparecer en sangre: si la tomas ya en el gimnasio, el pico te llega cuando llevas media serie de pesas." },
      ] },
    { id: "smoothie", name: "Smoothie verde de 90 segundos", time: "2 min", level: "Fácil", kind: "receta", img: "r-strawberry.jpg", product: "te-culinario",
      short: "Desayuno completo para los días en los que, normalmente, no desayunas.",
      why: "Plátano congelado para textura y potasio, yogur para proteína, coco para saciar y matcha para que la mañana no empiece en llanas. Ninguna de esas cosas te sube el azúcar como un zumo.",
      steps: [
        { s: "1 g de matcha culinario", d: "Aquí no merece la pena el ceremonial: la batidora oxida el aroma fino en segundos y la fruta tapa lo delicado. Se nota la diferencia de precio y no la de sabor." },
        { s: "1 plátano congelado + 150 g de yogur", d: "Corta el plátano en rodajas antes de congelarlo: la batidora te lo agradecerá." },
        { s: "100 ml de leche de coco", d: "La grasa de coco es lo que hace que sacie hasta la hora de comer. Con leche desnatada te quedas en un batido de dieta con hambre a las once." },
        { s: "Treinta segundos: textura de helado", d: "Si queda espeso, más líquido; nunca hielo: mata el sabor." },
      ] },
    { id: "hojitas", name: "Por qué 70 °C y no hirviendo", time: "2 min", level: "Clave", kind: "guia", img: "r-yuzu.jpg", product: "te-ceremonial",
      short: "El 90 % de los «el matcha me sabe a hierba» son agua a 100 grados.",
      why: "La hoja de té no se tuesta: se vaporiza y se seca. A 100 °C arrastras los taninos que dan astringencia y quemas los aminoácidos que dan dulzor: te quedas con lo peor de cada uno.",
      steps: [
        { s: "Hierve y espera 4 minutos destapado", d: "Baja a unos 75 °C y no esperes a que hierva: el agua del grifo caliente ya se pasa, y con 100 ml de leche el margen es todavía más pequeño." },
        { s: "O a 60 °C si es culinario con leche", d: "Aquí sí se permite un agua a 75 °C: al caer sobre 200 ml de leche fría baja de temperatura en un segundo y la hoja no llega a quemarse." },
        { s: "¿Te amarga? Quita polvo, no subas agua", d: "Pasa de 1,5 g a 1 g antes de tocar nada más: menos hoja en la misma agua quita astringencia y deja la crema. Suena contraintuitivo y arregla media taza." },
        { s: "Tamiza siempre", d: "Un grumo concentrado en la lengua sabe cinco veces más intenso que el resto de la taza." },
      ] },
    { id: "conservacion", name: "Cómo guardar el bote sin perder el aroma", time: "1 min", level: "Clave", kind: "guia", img: "p-ceremonial.jpg", product: "te-ceremonial",
      short: "El matcha pierde hasta el 40 % del aroma en 30 días si lo dejas en el mueble de las especias.",
      why: "Es polvo con toda la superficie expuesta: luz, oxígeno y calor lo oxidan. La nevera no es la solución (la condensación lo apelmaza cada vez que lo sacas), pero el armario junto al horno tampoco.",
      steps: [
        { s: "Armario fresco y oscuro, lejos del fuego", d: "Entre 15 y 20 °C. El estante del fondo es el que menos cambios de temperatura sufre, y eso es justo lo que un polvo oxidable no perdona." },
        { s: "Nunca en la nevera con el bote abierto", d: "Si lo compras y no lo abres en semanas, entonces sí: cerrado y sin abrirlo hasta usarlo." },
        { s: "60-90 días desde la apertura", d: "No es una cuestión de seguridad, es de placer: a los seis meses sigue siendo potable y sabe a heno; lo tiras por gusto, no por higiene." },
        { s: "Cuchara seca, nunca dentro del bote", d: "Cada vez que lo abres entra aire húmedo de la cocina, y el matcha lo absorbe como un azúcar glas: en tres meses tiene grumos que no existían." },
      ] },
    { id: "espuma", name: "La espuma perfecta: los 3 errores", time: "3 min", level: "Media", kind: "guia", img: "p-kit.jpg", product: "kit-completo",
      short: "Grumos, espuma de fregar y sabor a heno. Se arreglan hoy, sin comprar nada raro.",
      why: "Las tres cosas que nos escribís por Instagram a la semana de comprar. Ninguna es culpa del matcha y casi ninguna se arregla con más herramienta: se arregla con dos gestos y menos temperatura.",
      steps: [
        { s: "Grumos → tamiza antes de echar agua", d: "Cinco segundos con el colador de malla fina. El batidor empuja el grumo, no lo deshace." },
        { s: "Espuma grande → bate en «W», no en círculos", d: "En círculos mueves el líquido sin meter aire. En «W» cortas la superficie y la montas." },
        { s: "Sabor a heno → baja el agua a 70 °C y el polvo a 1 g", d: "Más polvo no arregla un agua demasiado caliente: la multiplica, porque hay más hoja quemándose. Primero baja a 70 °C y luego ya verás si sobra algo." },
        { s: "Y el batidor: déjalo secar en soporte", d: "Doce púas abiertas y la espuma no vuelve. Es el único accesorio de 3 € que duplica la vida del chasen." },
      ] },
  ];

  /* ---------------- reseñas: con nombre, ciudad, producto y contexto ---------------- */
  const reviews = [
    { id: "r1", n: "Laura M.", c: "Madrid", r: 5, t: "hace 1 semana", p: "te-ceremonial",
      txt: "Llevaba seis años con el café de las cinco de la tarde y el bajón posterior. Ahora tomo matcha a esa hora y sigo enfocada hasta la cena sin notar el corazón. El sabor es dulce, sin ese punto a hierba que temía, y con la avena está más rico que el de mi cafetería de siempre." },
    { id: "r2", n: "Sergio R.", c: "Madrid", r: 5, t: "hace 2 días", p: "kit-completo",
      txt: "Pedí el Kit Pro el jueves por la tarde y el viernes lo estaba usando. Se nota que el tamizador hace su trabajo: cero grumos la primera vez, color verde intenso y espuma densa. El soporte para el batidor es un detallazo que no esperaba y que me ha durado el doble que el del kit que tenía." },
    { id: "r3", n: "Paula G.", c: "Valencia", r: 4, t: "hace 1 mes", p: "te-ceremonial",
      txt: "Las dos primeras veces me salió amargo y pensé que el matcha no era lo mío. Escribí al correo y me contestaron en una hora: agua demasiado caliente. Seguí la guía, ahora me queda cremoso y dulce, y ya voy por el tercer bote. Le doy cuatro y no cinco porque la tapa del bote cuesta abrir con las manos mojadas." },
    { id: "r4", n: "Nerea F.", c: "Sevilla", r: 5, t: "hace 3 semanas", p: "vaso-latte",
      txt: "El iced latte con avena está más rico que en las cafeterías de mi barrio y me cuesta 1,10 € en vez de 4,50. El vaso mantiene las capas un rato largo, no se vuelve un batido gris a los diez minutos, y la pajita de cristal es cómoda de verdad. Se ha roto una en el lavavajillas y me mandaron otra sin pedir nada." },
    { id: "r5", n: "Diego L.", c: "Bilbao", r: 5, t: "hace 2 semanas", p: "termico",
      txt: "Lo uso antes del gimnasio y no me tiembla nada, que con los pre-entrenos me pasaba. Se bate dentro del propio vaso, se cierra y no pierde ni una gota en la mochila (he andado con él boca abajo por el portal para comprobarlo). A media mañana sigue frío." },
    { id: "r6", n: "Andrea V.", c: "Málaga", r: 5, t: "hace 1 mes", p: "pack-descubrimiento",
      txt: "Compré el pack de tres para no fallar con el grado. El ceremonial me gustó tanto que repetí con el descuento que venía en la tarjeta; el culinario lo uso para el batido del domingo y el de vainilla, para la leche fría. Todo llegó en 24 h y el embalaje es de esos que no quieres tirar." },
    { id: "r7", n: "Marta P.", c: "A Coruña", r: 4, t: "hace 2 meses", p: "sudadera",
      txt: "La sudadera es gordita de verdad, nada que ver con las de 300 gramos que parecen de verano, y la estampa no se ha cuarteado después de seis lavados. Pedí la M siendo talla media y me queda holgada justo como quería. Solo aviso: encoge medio centímetro de largo tras el primer lavado." },
  ];

  /* ---------------- dudas que frenan la compra ---------------- */
  const faq = [
    { q: "¿Nunca he tomado matcha y me va a saber a hierba cortada?", a: "Con el ceremonial de Uji, no: la hoja se cubre de sombra veinte días antes de recogerse, y eso sube los aminoácidos que dan dulzor. Si aun así prefieres con leche y hielo, empieza por el culinario o por el Latte Guante y no por el ceremonial solo. Y si te lo tomas y no te gusta, nos lo dices: se devuelve aunque el bote esté abierto." },
    { q: "¿Cuánta cafeína tiene? ¿Me quitará el sueño?", a: "68 mg por taza de 1 g, frente a los ~120 mg de un café solo. Y liberada despacio gracias a la L-teanina, sin pico. Hay gente que lo toma a las 21 y duerme igual; si eres sensible, toma la segunda infusión (mitad de cafeína) o pásate al culinario." },
    { q: "¿Necesito el kit entero para empezar?", a: "Para beberlo en casa, necesitas tres cosas: algo con borde ancho, un batidor y medir el polvo. Con el Kit Básico está resuelto por 49,95 €. Si solo quieres el cuenco y usas una cuchara y un espumador de café, también funciona: te sale espuma más basta, no un problema." },
    { q: "¿Cuánto tarda el envío y qué pasa si no estoy?", a: "Península 24-48 h laborables; si el pedido entra antes de las 14, sale el mismo día. Baleares 48 h; Canarias, Ceuta y Melilla 3-5 días con tasas aparte (te avisamos antes de enviar). Si el mensajero no te encuentra, se reprograma una vez sin coste y puedes cambiarlo a un punto limpio." },
    { q: "¿De verdad puedo devolver un bote abierto?", a: "Sí. Tienes 30 días y no hay que explicar nada: si el sabor no te convence, te devolvemos el importe por el mismo medio de pago en 7-14 días. El bote lo retiramos y lo usamos para fotos y para que el equipo lo siga bebiendo." },
    { q: "¿Ceremonial o culinario: cuál compro?", a: "Si lo vas a beber con agua, ceremonial. Si lo vas a mezclar con leche, hielo, fruta o azúcar, culinario, porque tiene cuerpo suficiente para no perderse. Y si no lo sabes, el Pack Descubrimiento (3 × 30 g) por 24,95 € te obliga a compararlos el mismo día." },
  ];

  const money = (n) => n.toFixed(2).replace(".", ",") + " €";
  const byId = Object.fromEntries(products.map((p) => [p.id, p]));
  const recipeById = Object.fromEntries(recipes.map((r) => [r.id, r]));
  const stars = (r) => "★★★★★".slice(0, Math.round(r)) + "☆☆☆☆☆".slice(0, 5 - Math.round(r));

  /* ================= v4 · estructura de 5 páginas =================
     La web es una tienda: catálogo agrupado en bloques de tres, y el
     detalle largo vive en la ficha (capa), no en la página. */
  categories.length = 0;
  categories.push(
    { id: "matcha", name: "T\u00e9 matcha", note: "Culinario, ceremonial y el pack para no fallar con el grado" },
    { id: "te", name: "M\u00e1s variedades de t\u00e9", note: "Tostados y hoja completa para la taza larga de la tarde" },
    { id: "kit", name: "Kits de preparaci\u00f3n", note: "Cuenco, batidor, cuchara y tamizador en una caja" },
    { id: "vaso", name: "Teteras, tazas, botellas y vasos", note: "Donde lo bates y donde te lo llevas" },
    { id: "ropa", name: "Ropa y accesorios", note: "Camisetas, tote bags y esmalte con el verde puesto" }
  );

  products.push(
    {
      id: "te-hojicha", cat: "te", name: "Hojicha tostado de Kioto 60 g", price: 21.95, compareAt: 24.95,
      rating: 4.7, reviews: 84, stock: 30, badge: "SIN CAFE\u00cdNA", img: "p-hojicha.jpg", unit: "60 g",
      hook: "Tostado a 180 \u00b0C: la taza de despu\u00e9s de cenar, sin quitar el sue\u00f1o.",
      pitch: "El hojicha no es t\u00e9 verde: la hoja se tuesta antes de molerse y ah\u00ed se le van los amargos y casi toda la cafe\u00edna. Queda un polvo color caramelo con aroma a pan tostado y un punto de cacao, dulce de por s\u00ed, que se puede tomar con leche a las diez de la noche. Es el que recomendamos a quien quiere el ritual del matcha \u2014tamizar, batir, sostener la taza\u2014 pero no quiere el aceler\u00f3n.",
      notes: { "Sabor": "tostado, pan y caramelo", "Aroma": "humo dulce, cacao", "Textura": "ligera y limpia", "Final": "redondo, sin astringencia" },
      benefits: ["10 mg de cafe\u00edna", "Se toma a cualquier hora", "Dulce sin leche ni az\u00facar"],
      bullets: [
        "60 g a 2 g por taza: 30 tazas por 21,95 \u20ac, 0,73 \u20ac la taza.",
        "Cafe\u00edna ≈10 mg frente a los 68 mg del matcha: es la taza de la noche.",
        "Tostado el mismo d\u00eda del envasado: el aroma aguanta 3 meses abierto, no 2 a\u00f1os.",
      ],
      specs: { "Contenido": "60 g", "Origen": "\ud83c\uddef\ud83c\uddf5 Kagoshima", "Tueste": "180 \u00b0C \u00b7 12 min", "Agua": "90 \u00b0C \u00b7 100 ml" },
    },
    {
      id: "te-sencha", cat: "te", name: "Sencha de primavera \u00b7 hoja entera 50 g", price: 19.95, compareAt: 0,
      rating: 4.6, reviews: 51, stock: 44, badge: "", img: "p-sencha.jpg", unit: "50 g",
      hook: "La primera recogida en hoja entera, para la tetera grande de la tarde.",
      pitch: "Donde el matcha se bebe de golpe, el sencha se queda en la mesa: hoja entera que se abre en el agua y aguanta tres vertidos. Traemos la primera recogida de primavera, la que tiene m\u00e1s amino\u00e1cidos y menos amargor, y el truco est\u00e1 en el agua: a 60 \u00b0C sale dulce y con cuerpo; a 100 \u00b0C, astringente. Si te gusta el t\u00e9 de taza larga, este es el bote que se acaba antes.",
      notes: { "Sabor": "herbal fresco con c\u00edtrico", "Aroma": "hierba y algas suaves", "Textura": "ligera", "Final": "umami corto y limpio" },
      benefits: ["3 vertidos por hoja", "Agua a 60 \u00b0C", "Taza larga de tarde"],
      bullets: [
        "2,5 g por 200 ml: 20 sesiones por 19,95 \u20ac.",
        "Resiste tres vertidos si bajas a 60 \u00b0C; con agua hirviendo solo aguanta uno.",
        "40 mg de cafe\u00edna por taza: la mitad que el matcha, m\u00e1s que un t\u00e9 negro.",
      ],
      specs: { "Contenido": "50 g", "Hoja": "sencha ichibancha", "Agua": "60 \u00b0C \u00b7 90 s", "Vertidos": "2-3" },
    },
    {
      id: "botella-ice", cat: "vaso", name: "Botella Matcha On-the-Go 600 ml", price: 21.95, compareAt: 25.95,
      rating: 4.8, reviews: 63, stock: 38, badge: "PARA LLEVAR", img: "p-bottle.jpg", unit: "600 ml",
      hook: "Se bate dentro: polvo, agua, tres hielos y agitar 15 segundos.",
      pitch: "Para el iced latte que se acaba en el coche o en el gimnasio: la botella lleva un batidor de var\u00edlla desmontable en la tapa, as\u00ed que disuelve el polvo sin grumos y sin necesitar un chasen. Trit\u00e1n de 600 ml, boca ancha para meter hielo, junta de silicona que no gotea en la mochila y una marca interior a los 200 ml para no pasarte de leche.",
      notes: { "Capacidad": "600 ml", "Boca": "ancha, entra el hielo", "Batidor": "var\u00edlla extra\u00edble", "Fr\u00edo": "12 h en nevera" },
      benefits: ["Sin grumos en 15 s", "No gotea", "Apta lavavajillas"],
      bullets: [
        "600 ml y marca a los 200 ml: la proporci\u00f3n justa de concentrado y leche.",
        "Trit\u00e1n sin BPA: pesa 160 g y aguanta el hielo sin agrietarse.",
        "Se desmonta en 3 piezas y todas caben en el lavavajillas.",
      ],
      specs: { "Capacidad": "600 ml", "Material": "Trit\u00e1n sin BPA", "Incluye": "Batidor + junta", "Cuidado": "Lavavajillas" },
    },
  );

  products.forEach((p) => (byId[p.id] = p));
  byId["te-guante"].cat = "te";
  byId["taza-esmaltada"].cat = "vaso";
  const ord = ["te-culinario", "te-ceremonial", "pack-descubrimiento", "te-guante", "te-hojicha", "te-sencha",
    "kit-basico", "kit-completo", "kit-regalo", "recambio-chasen", "chawan-negro", "taza-zenqa", "vaso-latte",
    "termico", "botella-ice", "taza-esmaltada", "sudadera", "camiseta", "tote"];
  products.sort((a, b) => ord.indexOf(a.id) - ord.indexOf(b.id));
  byId["kit-completo"].unit = "6 piezas";
  byId["kit-basico"].unit = "3 piezas";
  byId["kit-regalo"].unit = "caja regalo";

  /* Franja superior: estática (sin movimiento), mensajes separados por punto
     blanco y las redes del pie al lado de «Únete». Sin plazos inventados. */
  const bandTop = ["Env\u00edos gratis a partir de 35 \u20ac", "Descarga nuestra gu\u00eda gratis", "\u00danete a Zenqa Life"];
  /* El kit es solo herramientas: nada de bote de té dentro. */
  const kitIncluye = [
    ["Chawan de gres", "320 ml, borde ancho para batir sin salpicar"],
    ["Chasen de bamb\u00fa", "80 p\u00faas talladas de una sola pieza"],
    ["Chashaku + tamizador", "la curva que mide 1 g y el colador que quita los grumos"],
  ];

  const ways = [
    { t: "Usucha solo", s: "1 g \u00b7 70 ml \u00b7 70 \u00b0C" },
    { t: "Latte caliente", s: "2 g \u00b7 200 ml de avena" },
    { t: "Iced latte", s: "2 g \u00b7 hielo \u00b7 250 ml" },
    { t: "Smoothie verde", s: "1 g culinario \u00b7 pl\u00e1tano" },
    { t: "Yuzu tonic", s: "1,5 g \u00b7 t\u00f3nica \u00b7 lima" },
    { t: "De noche", s: "2.\u00aa infusi\u00f3n \u00b7 65 \u00b0C" },
  ];

  const ritual4 = [
    { t: "Tamiza 1 g", d: "Dos chashaku colmados por la malla fina. El batidor empuja el grumo, no lo deshace." },
    { t: "Agua a 70 \u00b0C", d: "Hierve y espera cuatro minutos: a 100 \u00b0C arrastras amargor y quemas dulzor." },
    { t: "Bate en \u00abW\u00bb", d: "De mu\u00f1eca, 15 segundos, sin apretar contra el fondo. Microespuma, no espuma de fregar." },
    { t: "B\u00e9belo en tres tragos", d: "El matcha caliente pierde aroma en dos minutos. Es un momento corto a propósito." },
  ];

  const vsMatcha = {
    a: {
      id: "te-culinario", who: "Para quien lo mezcla: leche, hielo, fruta o bizcocho.",
      list: [["Grado", "de latte, molido m\u00e1s grueso para que aguante la leche"], ["Sabor", "intenso y vegetal: no se pierde al a\u00f1adir nada"], ["Se toma", "en vaso grande, con sirope o sin \u00e9l, fr\u00edo o templado"]],
    },
    b: {
      id: "te-ceremonial", who: "Para quien lo bebe con agua y quiere los sesenta segundos.",
      list: [["Grado", "ceremonial primario, primera hoja de la primavera"], ["Sabor", "umami dulce, sin ese punto de heno"], ["Se toma", "solo, a 70 \u00b0C, en cuenco de borde ancho"]],
    },
  };

  const energy = [
    { k: "C\u00f3mo sube", m: "En 20-40 min y se mantiene 3-5 h", c: "Pico r\u00e1pido y baj\u00f3n seg\u00fan dosis" },
    { k: "Cafe\u00edna", m: "68 mg por taza de 1 g", c: "\u2248120 mg en un solo de barra" },
    { k: "C\u00f3mo te deja", m: "Concentraci\u00f3n tranquila, sin temblor", c: "Alerta\u2026 y a veces taquicardia" },
    { k: "A media tarde", m: "Se puede tomar sin fastidiar el sue\u00f1o", c: "Despu\u00e9s de las 16 h ya es loter\u00eda" },
  ];

  /* Ficha de calidad: los seis hitos reales, por orden, tal y como los
     contamos en Nosotros (enero → directo). */
  const proceso = [
    { n: "Enero", i: "01", t: "Sombra durante 21 días", d: "Cubrir las plantaciones retrasa la fotosíntesis: sube la clorofila, baja el amargor y aparece ese verde eléctrico. Sin sombreado no hay ceremonial." },
    { n: "Mayo", i: "02", t: "Solo la primera cosecha", d: "Recogemos a mano las dos hojas más tiernas del primer brote de primavera. Las siguientes van al grado culinario: igual de honestas, más intensas." },
    { n: "40 g/h", i: "03", t: "Molienda lenta en piedra", d: "Molinos de granito que tardan una hora en hacer 40 gramos. La piedra no calienta la hoja y preserva aroma y color. Los industriales lo hacen en segundos y lo tuestan sin querer." },
    { n: "48 h", i: "04", t: "Envasado en oscuridad", d: "De molino a lata opaca con desoxidante en menos de dos días, en sala con humedad controlada. La luz y el oxígeno son lo que pone tu matcha pardo." },
    { n: "Por lote", i: "05", t: "Analítica y cata", d: "Cada partida pasa control de metales pesados y pesticidas, y cata a ciegas de tres personas. Si no convence a las tres, no entra en almacén." },
    { n: "Directo", i: "06", t: "Comercio sin intermediarios", d: "Compramos a granjas familiares con contrato de temporada y precio acordado en enero. Ellos saben cuánto ganamos y nosotros cuándo se recoge." },
  ];

  /* Los números de la casa, sin humo */
  const nosStats = [
    ["18.400", "pedidos enviados"],
    ["1.284", "reseñas verificadas"],
    ["9", "granjas familiares"],
    ["4,9", "valoración media"],
    ["30", "días de garantía"],
  ];

  const quality = [
    ["Origen", "Uji y Wazuka, Kioto (Japón)"],
    ["Cosecha", "Primera, mayo · ichibancha sombreada 21 días"],
    ["Cultivo", "Sin pesticidas autorizados en UE, certificado JAS orgánico"],
    ["Molienda", "Piedra granítica, 40 g/h"],
    ["Cafeína", "≈ 65 mg/g · L-teanina ≈ 42 mg/g"],
    ["Envase", "Lata opaca reciclable con sello y desoxidante"],
  ];

  return { brand, manifesto, grades, timeline, compare, categories, products, recipes, reviews, faq, money, byId, recipeById, stars, bandTop, kitIncluye, ways, ritual4, vsMatcha, energy, quality, proceso, nosStats };
})();
