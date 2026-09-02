// Lil'OG : i18n dictionary (9 languages), ported from design-reference/i18n.jsx

export type LangCode = "fr" | "en" | "es" | "it" | "de" | "ru" | "zh" | "ja" | "ko";

export const LANGS: { code: LangCode; label: string; native: string }[] = [
  { code: "fr", label: "FR", native: "Français" },
  { code: "en", label: "EN", native: "English" },
  { code: "es", label: "ES", native: "Español" },
  { code: "it", label: "IT", native: "Italiano" },
  { code: "de", label: "DE", native: "Deutsch" },
  { code: "ru", label: "RU", native: "Русский" },
  { code: "zh", label: "ZH", native: "中文" },
  { code: "ja", label: "JA", native: "日本語" },
  { code: "ko", label: "KO", native: "한국어" },
];

export interface Dict {
  nav: { search: string; bag: string; login: string };
  menu: { title: string; close: string; dmTagline: string };
  cat: Record<string, string>;
  foot: { selltous: string; tagline: string };
  hero: { kicker: string; line: string; words: string[]; shop: string; story: string; avail: string };
  /** LIL_OG_DESKTOP.EXE : libellés propres à la page d'accueil Y2K OS. */
  home: {
    scroll: string;
    slotIntroTitle: string;
    slotIntroBody: string;
    slotSub: string;
    slotCta: string;
    slotCoin: string;
    filesTitle: string;
    filesSub: string;
    filesObjects: string;
    sysStats: string;
  };
  drops: { eyebrow: string; title: string; shopAll: string };
  lb: { view: string; oneofone: string; newinKicker: string; ogdresses: string; shop: string };
  ed: {
    eyebrow: string;
    title: (string | { em: string })[];
    p1: string;
    p2: string;
    stats: [string, string][];
  };
  footer: {
    newsH: string; newsP: string; email: string; join: string;
    shop: string; help: string; about: string; legalH: string;
    helpLinks: string[]; aboutLinks: string[]; legalLinks: string[];
    copy: string; legal: string;
  };
  pdp: {
    back: string; unique: string; newIn: string; soldOut: string;
    addToCart: string; added: string; ref: string;
    detailsH: string; detailsBody: string;
    shippingH: string; shippingBody: string;
    completeLook: string;
  };
  cart: {
    title: string; empty: string; emptyCta: string;
    subtotal: string; subtotalNote: string; checkout: string;
    remove: string; each: string;
  };
  category: { empty: string };
}

export const DICT: Record<LangCode, Dict> = {
  en: {
    nav: { search: "Search", bag: "Bag", login: "Log in" },
    menu: { title: "Menu", close: "Close", dmTagline: "I want to be iconic, I'm starting the machine" },
    cat: {
      all: "Whole catalog", newin: "New In", clothing: "Clothing", accessories: "Accessories", shoes: "Shoes", luxe: "Luxe edit",
      tops: "Tops", shirts: "Shirts", cardigans: "Cardigans", sweatshirts: "Sweatshirts", dresses: "Dresses",
      skirts: "Skirts", shorts: "Shorts", jumpsuits: "Jumpsuits", jeans: "Jeans", trousers: "Trousers",
      leather: "Leather", lingerie: "Lingerie", swimwear: "Swimwear",
      sneakers: "Sneakers", heels: "Heels", flats: "Flats", ballet: "Ballet flats", boots: "Boots", open: "Open-toe",
      jewelry: "Jewelry", scarves: "Scarves", hats: "Hats", bags: "Bags", wallets: "Wallets",
      sunglasses: "Sunglasses", gloves: "Gloves", belts: "Belts",
      outerwear: "Coats & Jackets", dressesSkirts: "Dresses & Skirts", bottoms: "Trousers & Jeans",
    },
    foot: { selltous: "Sell to us", tagline: "Pre-loved since the Y2K · Paris" },
    hero: { kicker: "Lil'OG · Vintage, Reborn", line: "We are born to",
      words: ["Shine.", "Conquer.", "Slay.", "Burn."], shop: "Shop the drop", story: "Our story", avail: "Next drop · June 3" },
    home: {
      scroll: "SCROLL",
      slotIntroTitle: "What's the Dressing Machine?",
      slotIntroBody: "A style vending machine, no candy involved. Hit the button and it pulls three one-of-a-kind pieces from our vintage archive to build you a complete look in three seconds. Every piece exists only once. Like the look, and it's gone for good.",
      slotSub: "Three pieces pulled from the archive, one whole look. The machine picks, you approve.",
      slotCta: "RUN DRESSING_MACHINE.EXE", slotCoin: "INSERT COIN · FREE PLAY",
      filesTitle: "Rack explorer", filesSub: "Open a folder to dig through the archive.",
      filesObjects: "objects", sysStats: "SYSTEM STATS",
    },
    drops: { eyebrow: "This week's edit", title: "Featured Drops", shopAll: "Shop all" },
    lb: { view: "View collection", oneofone: "One of one, never restocked",
      newinKicker: "Spring Archive · Vol. 001", ogdresses: "OG's dresses", shop: "Shop" },
    ed: { eyebrow: "Our story", title: ["Worn once. ", { em: "Wanted" }, " forever."],
      p1: "Lil'OG is a second-hand vintage house obsessed with the early 2000s, the era of low-rise, butterfly clips and logo everything. We hunt down the pieces that defined a generation and bring them back, one-of-one.",
      p2: "Every garment is hand-sourced, cleaned and authenticated in Paris. No mass production, no two alike. Just the originals, reborn for the people born to shine.",
      stats: [["300+", "Pieces rehomed"], ["100%", "One of one"], ["Since 2026", "Y2K archive"]] },
    footer: { newsH: "Get on the list",
      newsP: "First dibs on every drop. No spam. Just the good stuff, before it's gone.",
      email: "your@email.com", join: "Join →", shop: "Shop", help: "Help", about: "About", legalH: "Legal",
      helpLinks: ["Shipping", "Returns", "Authenticity"],
      aboutLinks: ["Our story", "Sustainability"], legalLinks: ["CGV", "Legal notices", "Privacy", "Cookies"],
      copy: "© 2026 Lil'OG · Pre-loved Y2K, Paris", legal: "Terms · Privacy · Cookies" },
    pdp: {
      back: "Back to shop", unique: "One of one", newIn: "New in", soldOut: "Sold out",
      addToCart: "Add to cart", added: "Added ✓", ref: "Ref.",
      detailsH: "Details & care", detailsBody: "Follow the washing instructions on each item's label. If no label is present, we recommend a delicate cycle or dry clean to preserve the fabric.",
      shippingH: "Shipping & returns", shippingBody: "Tracked shipping from Paris. Orders are dispatched within 3 business days. As every piece is one of one, returns are accepted within 14 days if unworn.",
      completeLook: "Complete your look",
    },
    cart: {
      title: "Your cart", empty: "Your cart is empty", emptyCta: "Continue shopping",
      subtotal: "Subtotal", subtotalNote: "Shipping and taxes calculated at checkout.", checkout: "Checkout",
      remove: "Remove", each: "each",
    },
    category: { empty: "No pieces in this category yet. Check back soon." },
  },

  fr: {
    nav: { search: "Rechercher", bag: "Panier", login: "Connexion" },
    menu: { title: "Menu", close: "Fermer", dmTagline: "Je veux être iconique, je lance la machine" },
    cat: {
      all: "Tout le catalogue", newin: "Nouveautés", clothing: "Vêtements", accessories: "Accessoires", shoes: "Chaussures", luxe: "Sélection luxe",
      tops: "Tops", shirts: "Chemises", cardigans: "Cardigans", sweatshirts: "Sweatshirts", dresses: "Robes",
      skirts: "Jupes", shorts: "Shorts", jumpsuits: "Combinaisons", jeans: "Jeans", trousers: "Pantalons",
      leather: "Cuir", lingerie: "Lingerie", swimwear: "Maillots de bain",
      sneakers: "Baskets", heels: "Talons", flats: "Plates", ballet: "Ballerines", boots: "Bottes", open: "Ouvertes",
      jewelry: "Bijoux", scarves: "Foulards/Écharpes", hats: "Chapeaux", bags: "Sacs", wallets: "Porte-monnaie",
      sunglasses: "Lunettes", gloves: "Gants", belts: "Ceintures",
      outerwear: "Vestes & Manteaux", dressesSkirts: "Robes & Jupes", bottoms: "Pantalons & Jeans",
    },
    foot: { selltous: "Vendez-nous", tagline: "Seconde main depuis le Y2K · Paris" },
    hero: { kicker: "Lil'OG · Vintage, Renaissance", line: "Nous sommes nées pour",
      words: ["Briller.", "Conquérir.", "Régner.", "Flamber."], shop: "Voir le drop", story: "Notre histoire", avail: "Prochain drop · 3 juin" },
    home: {
      scroll: "DÉFILER",
      slotIntroTitle: "C'est quoi la Dressing Machine ?",
      slotIntroBody: "Un distributeur de style, pas de bonbons. Appuie sur le bouton : la machine pioche trois pièces uniques dans notre archive vintage et te compose un look complet en trois secondes. Chaque pièce n'existe qu'en un seul exemplaire. Si le look te plaît, il ne reviendra pas.",
      slotSub: "Trois pièces tirées de l'archive, un look entier. La machine choisit, tu valides.",
      slotCta: "LANCER LA DRESSING_MACHINE.EXE", slotCoin: "INSÉRER UN JETON · PARTIE OFFERTE",
      filesTitle: "Explorateur de rayons", filesSub: "Ouvre un dossier pour fouiller l'archive.",
      filesObjects: "objets", sysStats: "STATISTIQUES SYSTÈME",
    },
    drops: { eyebrow: "La sélection de la semaine", title: "Nos derniers drops", shopAll: "Tout voir" },
    lb: { view: "Voir la collection", oneofone: "Pièce unique, jamais réassortie",
      newinKicker: "Archive Printemps · Vol. 001", ogdresses: "OG's dresses", shop: "Voir" },
    ed: { eyebrow: "Notre histoire", title: ["Portée une fois. ", { em: "Désirée" }, " pour toujours."],
      p1: "Lil'OG est une maison vintage de seconde main obsédée par le début des années 2000, l'ère du taille basse, des pinces papillon et du logo partout. Nous traquons les pièces qui ont marqué une génération et les faisons renaître, en exemplaire unique.",
      p2: "Chaque pièce est sourcée à la main, nettoyée et authentifiée à Paris. Aucune production de masse, aucune semblable. Juste les originales, renées pour celles et ceux nés pour briller.",
      stats: [["300+", "Pièces rehabitées"], ["100%", "Pièce unique"], ["Depuis 2026", "Archive Y2K"]] },
    footer: { newsH: "Rejoignez la liste",
      newsP: "La priorité sur chaque drop. Pas de spam. Juste le meilleur, avant que tout parte.",
      email: "votre@email.com", join: "Rejoindre →", shop: "Boutique", help: "Aide", about: "À propos", legalH: "Légal",
      helpLinks: ["Livraison", "Retours", "Authenticité"],
      aboutLinks: ["L'histoire", "Durabilité"], legalLinks: ["CGV", "Mentions légales", "Confidentialité", "Cookies"],
      copy: "© 2026 Lil'OG · Seconde main Y2K, Paris", legal: "Conditions · Confidentialité · Cookies" },
    pdp: {
      back: "Retour à la boutique", unique: "Pièce unique", newIn: "Nouveauté", soldOut: "Épuisé",
      addToCart: "Ajouter au panier", added: "Ajouté ✓", ref: "Réf.",
      detailsH: "Détails & entretien", detailsBody: "Suivez les indications de lavage présentes sur l'étiquette de chaque pièce. En l'absence d'étiquette, nous recommandons un lavage en cycle délicat ou à sec afin de préserver les matières.",
      shippingH: "Livraison & retours", shippingBody: "Livraison suivie depuis Paris. Les commandes sont expédiées sous 3 jours ouvrés. Chaque pièce étant unique, les retours sont acceptés sous 14 jours si non portée.",
      completeLook: "Complétez votre look",
    },
    cart: {
      title: "Votre panier", empty: "Ton panier est vide", emptyCta: "Continuer mes achats",
      subtotal: "Sous-total", subtotalNote: "Livraison et taxes calculées au paiement.", checkout: "Passer commande",
      remove: "Retirer", each: "l'unité",
    },
    category: { empty: "Aucune pièce dans cette catégorie pour l'instant. Reviens bientôt." },
  },

  es: {
    nav: { search: "Buscar", bag: "Cesta", login: "Acceder" },
    menu: { title: "Menú", close: "Cerrar", dmTagline: "Quiero ser icónica, activo la máquina" },
    cat: {
      all: "Todo el catálogo", newin: "Novedades", clothing: "Ropa", accessories: "Accesorios", shoes: "Zapatos", luxe: "Selección lujo",
      tops: "Tops", shirts: "Camisas", cardigans: "Cárdigans", sweatshirts: "Sudaderas", dresses: "Vestidos",
      skirts: "Faldas", shorts: "Shorts", jumpsuits: "Monos", jeans: "Vaqueros", trousers: "Pantalones",
      leather: "Cuero", lingerie: "Lencería", swimwear: "Bañadores",
      sneakers: "Zapatillas", heels: "Tacones", flats: "Planos", ballet: "Bailarinas", boots: "Botas", open: "Abiertos",
      jewelry: "Joyas", scarves: "Pañuelos/Bufandas", hats: "Sombreros", bags: "Bolsos", wallets: "Monederos",
      sunglasses: "Gafas", gloves: "Guantes", belts: "Cinturones",
      outerwear: "Abrigos & Chaquetas", dressesSkirts: "Vestidos & Faldas", bottoms: "Pantalones & Vaqueros",
    },
    foot: { selltous: "Véndenos", tagline: "Segunda mano desde el Y2K · París" },
    hero: { kicker: "Lil'OG · Vintage, Renacido", line: "Nacimos para",
      words: ["Brillar.", "Conquistar.", "Reinar.", "Arder."], shop: "Ver el drop", story: "Nuestra historia", avail: "Próximo drop · 3 de junio" },
    home: {
      scroll: "DESLIZA",
      slotIntroTitle: "¿Qué es la Dressing Machine?",
      slotIntroBody: "Una máquina expendedora de estilo, sin caramelos. Pulsa el botón: elige tres piezas únicas de nuestro archivo vintage y te compone un look completo en tres segundos. Cada pieza existe en un solo ejemplar. Si el look te gusta, no volverá.",
      slotSub: "Tres piezas sacadas del archivo, un look entero. La máquina elige, tú apruebas.",
      slotCta: "EJECUTAR DRESSING_MACHINE.EXE", slotCoin: "INSERTA UNA FICHA · PARTIDA GRATIS",
      filesTitle: "Explorador de secciones", filesSub: "Abre una carpeta para rebuscar en el archivo.",
      filesObjects: "objetos", sysStats: "ESTADÍSTICAS DEL SISTEMA",
    },
    drops: { eyebrow: "La selección de la semana", title: "Drops destacados", shopAll: "Ver todo" },
    lb: { view: "Ver colección", oneofone: "Pieza única, nunca repuesta",
      newinKicker: "Archivo Primavera · Vol. 001", ogdresses: "OG's dresses", shop: "Comprar" },
    ed: { eyebrow: "Nuestra historia", title: ["Usada una vez. ", { em: "Deseada" }, " para siempre."],
      p1: "Lil'OG es una casa vintage de segunda mano obsesionada con los primeros 2000, la era del tiro bajo, las pinzas mariposa y el logo en todo. Buscamos las piezas que definieron a una generación y las devolvemos, únicas.",
      p2: "Cada prenda se busca a mano, se limpia y se autentica en París. Sin producción en masa, ninguna igual. Solo las originales, renacidas para quienes nacieron para brillar.",
      stats: [["300+", "Prendas reubicadas"], ["100%", "Pieza única"], ["Desde 2026", "Archivo Y2K"]] },
    footer: { newsH: "Únete a la lista",
      newsP: "Prioridad en cada drop. Sin spam. Solo lo bueno, antes de que vuele.",
      email: "tu@email.com", join: "Unirme →", shop: "Tienda", help: "Ayuda", about: "Acerca de", legalH: "Legal",
      helpLinks: ["Envíos", "Devoluciones", "Autenticidad"],
      aboutLinks: ["Nuestra historia", "Sostenibilidad"], legalLinks: ["CGV", "Aviso legal", "Privacidad", "Cookies"],
      copy: "© 2026 Lil'OG · Segunda mano Y2K, París", legal: "Términos · Privacidad · Cookies" },
    pdp: {
      back: "Volver a la tienda", unique: "Pieza única", newIn: "Novedad", soldOut: "Agotado",
      addToCart: "Añadir a la cesta", added: "Añadido ✓", ref: "Ref.",
      detailsH: "Detalles y cuidado", detailsBody: "Siga las instrucciones de lavado de la etiqueta de cada prenda. En ausencia de etiqueta, recomendamos un ciclo delicado o limpieza en seco para preservar los tejidos.",
      shippingH: "Envío y devoluciones", shippingBody: "Envío rastreado desde París. Los pedidos se envían en 3 días hábiles. Como cada pieza es única, se aceptan devoluciones en 14 días si no se ha usado.",
      completeLook: "Completa tu look",
    },
    cart: {
      title: "Tu cesta", empty: "Tu cesta está vacía", emptyCta: "Seguir comprando",
      subtotal: "Subtotal", subtotalNote: "Envío e impuestos calculados al finalizar la compra.", checkout: "Finalizar compra",
      remove: "Quitar", each: "cada uno",
    },
    category: { empty: "Todavía no hay piezas en esta categoría. Vuelve pronto." },
  },

  it: {
    nav: { search: "Cerca", bag: "Carrello", login: "Accedi" },
    menu: { title: "Menu", close: "Chiudi", dmTagline: "Voglio essere iconica, avvio la macchina" },
    cat: {
      all: "Tutto il catalogo", newin: "Novità", clothing: "Abbigliamento", accessories: "Accessori", shoes: "Scarpe", luxe: "Selezione lusso",
      tops: "Top", shirts: "Camicie", cardigans: "Cardigan", sweatshirts: "Felpe", dresses: "Vestiti",
      skirts: "Gonne", shorts: "Shorts", jumpsuits: "Tute", jeans: "Jeans", trousers: "Pantaloni",
      leather: "Pelle", lingerie: "Lingerie", swimwear: "Costumi",
      sneakers: "Sneakers", heels: "Tacchi", flats: "Basse", ballet: "Ballerine", boots: "Stivali", open: "Aperte",
      jewelry: "Gioielli", scarves: "Foulard/Sciarpe", hats: "Cappelli", bags: "Borse", wallets: "Portamonete",
      sunglasses: "Occhiali", gloves: "Guanti", belts: "Cinture",
      outerwear: "Giacche & Cappotti", dressesSkirts: "Vestiti & Gonne", bottoms: "Pantaloni & Jeans",
    },
    foot: { selltous: "Vendi a noi", tagline: "Seconda mano dal Y2K · Parigi" },
    hero: { kicker: "Lil'OG · Vintage, Rinato", line: "Siamo nati per",
      words: ["Brillare.", "Conquistare.", "Regnare.", "Ardere."], shop: "Vedi il drop", story: "La nostra storia", avail: "Prossimo drop · 3 giugno" },
    home: {
      scroll: "SCORRI",
      slotIntroTitle: "Cos'è la Dressing Machine?",
      slotIntroBody: "Un distributore di stile, niente caramelle. Premi il pulsante: la macchina pesca tre pezzi unici dal nostro archivio vintage e ti compone un look completo in tre secondi. Ogni pezzo esiste in un solo esemplare. Se il look ti piace, non tornerà.",
      slotSub: "Tre pezzi presi dall'archivio, un look intero. La macchina sceglie, tu approvi.",
      slotCta: "AVVIA DRESSING_MACHINE.EXE", slotCoin: "INSERISCI UN GETTONE · PARTITA GRATIS",
      filesTitle: "Esplora risorse", filesSub: "Apri una cartella per frugare nell'archivio.",
      filesObjects: "oggetti", sysStats: "STATISTICHE DI SISTEMA",
    },
    drops: { eyebrow: "La selezione della settimana", title: "Drop in evidenza", shopAll: "Vedi tutto" },
    lb: { view: "Vedi collezione", oneofone: "Pezzo unico, mai riassortito",
      newinKicker: "Archivio Primavera · Vol. 001", ogdresses: "OG's dresses", shop: "Acquista" },
    ed: { eyebrow: "La nostra storia", title: ["Indossata una volta. ", { em: "Desiderata" }, " per sempre."],
      p1: "Lil'OG è una casa vintage di seconda mano ossessionata dai primi anni 2000, l'era del vita bassa, delle mollette a farfalla e del logo ovunque. Cerchiamo i pezzi che hanno definito una generazione e li riportiamo in vita, pezzi unici.",
      p2: "Ogni capo è selezionato a mano, pulito e autenticato a Parigi. Niente produzione di massa, nessuno uguale. Solo gli originali, rinati per chi è nato per brillare.",
      stats: [["300+", "Capi ricollocati"], ["100%", "Pezzo unico"], ["Dal 2026", "Archivio Y2K"]] },
    footer: { newsH: "Iscriviti alla lista",
      newsP: "Priorità su ogni drop. Niente spam. Solo il meglio, prima che finisca.",
      email: "tua@email.com", join: "Iscriviti →", shop: "Shop", help: "Aiuto", about: "Chi siamo", legalH: "Legale",
      helpLinks: ["Spedizioni", "Resi", "Autenticità"],
      aboutLinks: ["La nostra storia", "Sostenibilità"], legalLinks: ["CGV", "Note legali", "Privacy", "Cookies"],
      copy: "© 2026 Lil'OG · Seconda mano Y2K, Parigi", legal: "Termini · Privacy · Cookie" },
    pdp: {
      back: "Torna al negozio", unique: "Pezzo unico", newIn: "Novità", soldOut: "Esaurito",
      addToCart: "Aggiungi al carrello", added: "Aggiunto ✓", ref: "Rif.",
      detailsH: "Dettagli e cura", detailsBody: "Seguire le istruzioni di lavaggio sull'etichetta di ogni capo. In assenza di etichetta, consigliamo un ciclo delicato o il lavaggio a secco per preservare i tessuti.",
      shippingH: "Spedizione e resi", shippingBody: "Spedizione tracciata da Parigi. Gli ordini vengono spediti entro 3 giorni lavorativi. Essendo ogni pezzo unico, i resi sono accettati entro 14 giorni se non indossato.",
      completeLook: "Completa il tuo look",
    },
    cart: {
      title: "Il tuo carrello", empty: "Il tuo carrello è vuoto", emptyCta: "Continua lo shopping",
      subtotal: "Subtotale", subtotalNote: "Spedizione e tasse calcolate al checkout.", checkout: "Vai alla cassa",
      remove: "Rimuovi", each: "cad.",
    },
    category: { empty: "Ancora nessun pezzo in questa categoria. Torna presto." },
  },

  de: {
    nav: { search: "Suchen", bag: "Warenkorb", login: "Anmelden" },
    menu: { title: "Menü", close: "Schließen", dmTagline: "Ich will ikonisch sein, ich starte die Maschine" },
    cat: {
      all: "Gesamter Katalog", newin: "Neu", clothing: "Kleidung", accessories: "Accessoires", shoes: "Schuhe", luxe: "Luxus-Auswahl",
      tops: "Tops", shirts: "Hemden", cardigans: "Strickjacken", sweatshirts: "Sweatshirts", dresses: "Kleider",
      skirts: "Röcke", shorts: "Shorts", jumpsuits: "Overalls", jeans: "Jeans", trousers: "Hosen",
      leather: "Leder", lingerie: "Dessous", swimwear: "Bademode",
      sneakers: "Sneaker", heels: "Absätze", flats: "Flache", ballet: "Ballerinas", boots: "Stiefel", open: "Offen",
      jewelry: "Schmuck", scarves: "Tücher/Schals", hats: "Hüte", bags: "Taschen", wallets: "Geldbörsen",
      sunglasses: "Brillen", gloves: "Handschuhe", belts: "Gürtel",
      outerwear: "Jacken & Mäntel", dressesSkirts: "Kleider & Röcke", bottoms: "Hosen & Jeans",
    },
    foot: { selltous: "Verkauf an uns", tagline: "Pre-loved seit dem Y2K · Paris" },
    hero: { kicker: "Lil'OG · Vintage, Wiedergeboren", line: "Wir sind geboren, um zu",
      words: ["Strahlen.", "Erobern.", "Herrschen.", "Brennen."], shop: "Zum Drop", story: "Unsere Geschichte", avail: "Nächster Drop · 3. Juni" },
    home: {
      scroll: "SCROLLEN",
      slotIntroTitle: "Was ist die Dressing Machine?",
      slotIntroBody: "Ein Style-Automat, ganz ohne Süßigkeiten. Drück den Knopf: Die Maschine zieht drei Einzelstücke aus unserem Vintage-Archiv und stellt dir in drei Sekunden ein komplettes Outfit zusammen. Jedes Teil gibt es nur einmal. Gefällt dir der Look, kommt er nicht zurück.",
      slotSub: "Drei Teile aus dem Archiv, ein ganzer Look. Die Maschine wählt, du bestätigst.",
      slotCta: "DRESSING_MACHINE.EXE STARTEN", slotCoin: "MÜNZE EINWERFEN · FREISPIEL",
      filesTitle: "Regal-Explorer", filesSub: "Öffne einen Ordner und wühle im Archiv.",
      filesObjects: "Objekte", sysStats: "SYSTEMSTATISTIK",
    },
    drops: { eyebrow: "Die Auswahl der Woche", title: "Aktuelle Drops", shopAll: "Alle ansehen" },
    lb: { view: "Kollektion ansehen", oneofone: "Einzelstück, nie nachbestellt",
      newinKicker: "Frühjahrs-Archiv · Vol. 001", ogdresses: "OG's dresses", shop: "Shoppen" },
    ed: { eyebrow: "Unsere Geschichte", title: ["Einmal getragen. ", { em: "Für immer" }, " begehrt."],
      p1: "Lil'OG ist ein Second-Hand-Vintage-Haus, besessen von den frühen 2000ern, der Ära von Low-Rise, Schmetterlingsspangen und Logos überall. Wir spüren die Stücke auf, die eine Generation prägten, und bringen sie als Einzelstücke zurück.",
      p2: "Jedes Teil wird von Hand beschafft, gereinigt und in Paris authentifiziert. Keine Massenproduktion, kein zweites gleiches. Nur die Originale, wiedergeboren für die, die zum Strahlen geboren sind.",
      stats: [["300+", "Teile vermittelt"], ["100%", "Einzelstück"], ["Seit 2026", "Y2K-Archiv"]] },
    footer: { newsH: "Auf die Liste",
      newsP: "Zuerst bei jedem Drop. Kein Spam. Nur das Gute, bevor es weg ist.",
      email: "deine@email.com", join: "Beitreten →", shop: "Shop", help: "Hilfe", about: "Über uns", legalH: "Rechtliches",
      helpLinks: ["Versand", "Rückgabe", "Echtheit"],
      aboutLinks: ["Unsere Geschichte", "Nachhaltigkeit"], legalLinks: ["AGB", "Impressum", "Datenschutz", "Cookies"],
      copy: "© 2026 Lil'OG · Pre-loved Y2K, Paris", legal: "AGB · Datenschutz · Cookies" },
    pdp: {
      back: "Zurück zum Shop", unique: "Einzelstück", newIn: "Neu", soldOut: "Ausverkauft",
      addToCart: "In den Warenkorb", added: "Hinzugefügt ✓", ref: "Ref.",
      detailsH: "Details & Pflege", detailsBody: "Bitte folgen Sie den Pflegehinweisen auf dem Etikett jedes Kleidungsstücks. Falls kein Etikett vorhanden ist, empfehlen wir einen Schonwaschgang oder chemische Reinigung, um die Materialien zu schonen.",
      shippingH: "Versand & Rückgabe", shippingBody: "Versand mit Sendungsverfolgung aus Paris. Bestellungen werden innerhalb von 3 Werktagen versandt. Da jedes Stück ein Einzelstück ist, sind Rückgaben innerhalb von 14 Tagen ungetragen möglich.",
      completeLook: "Vervollständige deinen Look",
    },
    cart: {
      title: "Dein Warenkorb", empty: "Dein Warenkorb ist leer", emptyCta: "Weiter einkaufen",
      subtotal: "Zwischensumme", subtotalNote: "Versand und Steuern werden an der Kasse berechnet.", checkout: "Zur Kasse",
      remove: "Entfernen", each: "je",
    },
    category: { empty: "Noch keine Teile in dieser Kategorie. Schau bald wieder vorbei." },
  },

  ru: {
    nav: { search: "Поиск", bag: "Корзина", login: "Войти" },
    menu: { title: "Меню", close: "Закрыть", dmTagline: "Хочу быть иконой — запускаю машину" },
    cat: {
      all: "Весь каталог", newin: "Новинки", clothing: "Одежда", accessories: "Аксессуары", shoes: "Обувь", luxe: "Люкс-подборка",
      tops: "Топы", shirts: "Рубашки", cardigans: "Кардиганы", sweatshirts: "Свитшоты", dresses: "Платья",
      skirts: "Юбки", shorts: "Шорты", jumpsuits: "Комбинезоны", jeans: "Джинсы", trousers: "Брюки",
      leather: "Кожа", lingerie: "Бельё", swimwear: "Купальники",
      sneakers: "Кроссовки", heels: "Каблуки", flats: "Без каблука", ballet: "Балетки", boots: "Ботинки", open: "Открытые",
      jewelry: "Украшения", scarves: "Платки/Шарфы", hats: "Шляпы", bags: "Сумки", wallets: "Кошельки",
      sunglasses: "Очки", gloves: "Перчатки", belts: "Ремни",
      outerwear: "Куртки и пальто", dressesSkirts: "Платья и юбки", bottoms: "Брюки и джинсы",
    },
    foot: { selltous: "Продать нам", tagline: "Секонд-хенд со времён Y2K · Париж" },
    hero: { kicker: "Lil'OG · Винтаж, Возрождённый", line: "Мы рождены, чтобы",
      words: ["Сиять.", "Покорять.", "Править.", "Гореть."], shop: "Смотреть дроп", story: "Наша история", avail: "Следующий дроп · 3 июня" },
    home: {
      scroll: "ЛИСТАТЬ",
      slotIntroTitle: "Что такое Dressing Machine?",
      slotIntroBody: "Автомат стиля, только без конфет. Нажмите кнопку: машина достанет три уникальные вещи из нашего винтажного архива и соберёт для вас цельный образ за три секунды. Каждая вещь существует в единственном экземпляре. Если образ понравится, второго шанса не будет.",
      slotSub: "Три вещи из архива, целый образ. Машина выбирает, вы одобряете.",
      slotCta: "ЗАПУСТИТЬ DRESSING_MACHINE.EXE", slotCoin: "ВСТАВЬТЕ ЖЕТОН · ИГРА БЕСПЛАТНА",
      filesTitle: "Проводник по разделам", filesSub: "Откройте папку и покопайтесь в архиве.",
      filesObjects: "объектов", sysStats: "СИСТЕМНАЯ СТАТИСТИКА",
    },
    drops: { eyebrow: "Подборка недели", title: "Актуальные дропы", shopAll: "Смотреть все" },
    lb: { view: "Смотреть коллекцию", oneofone: "Единственный экземпляр, без повтора",
      newinKicker: "Весенний архив · Vol. 001", ogdresses: "OG's dresses", shop: "Купить" },
    ed: { eyebrow: "Наша история", title: ["Надето однажды. ", { em: "Желанно" }, " навсегда."],
      p1: "Lil'OG: винтажный секонд-хенд, одержимый ранними 2000-ми, эпохой низкой посадки, заколок-бабочек и логотипов повсюду. Мы находим вещи, определившие поколение, и возвращаем их в единственном экземпляре.",
      p2: "Каждая вещь подбирается вручную, очищается и проходит проверку подлинности в Париже. Никакого массового производства, ни одной одинаковой. Только оригиналы, возрождённые для тех, кто рождён сиять.",
      stats: [["300+", "Вещей нашли дом"], ["100%", "Единственный экземпляр"], ["С 2026", "Архив Y2K"]] },
    footer: { newsH: "В список",
      newsP: "Первыми о каждом дропе. Без спама. Только лучшее, пока не разобрали.",
      email: "ваш@email.com", join: "Вступить →", shop: "Магазин", help: "Помощь", about: "О нас", legalH: "Правовая",
      helpLinks: ["Доставка", "Возврат", "Подлинность"],
      aboutLinks: ["Наша история", "Устойчивость"], legalLinks: ["Условия", "Реквизиты", "Конфиденциальность", "Cookies"],
      copy: "© 2026 Lil'OG · Секонд-хенд Y2K, Париж", legal: "Условия · Конфиденциальность · Cookies" },
    pdp: {
      back: "Вернуться в магазин", unique: "Единственный экземпляр", newIn: "Новинка", soldOut: "Продано",
      addToCart: "В корзину", added: "Добавлено ✓", ref: "Арт.",
      detailsH: "Детали и уход", detailsBody: "Следуйте инструкциям по уходу на этикетке каждого изделия. При отсутствии этикетки рекомендуем деликатную стирку или химчистку для сохранения тканей.",
      shippingH: "Доставка и возврат", shippingBody: "Доставка с трек-номером из Парижа. Заказы отправляются в течение 3 рабочих дней. Поскольку каждая вещь единственная в своём роде, возврат принимается в течение 14 дней без следов носки.",
      completeLook: "Дополните образ",
    },
    cart: {
      title: "Ваша корзина", empty: "Ваша корзина пуста", emptyCta: "Продолжить покупки",
      subtotal: "Промежуточный итог", subtotalNote: "Доставка и налоги рассчитываются при оформлении заказа.", checkout: "Оформить заказ",
      remove: "Удалить", each: "за шт.",
    },
    category: { empty: "В этой категории пока нет вещей. Загляните позже." },
  },

  zh: {
    nav: { search: "搜索", bag: "购物袋", login: "登录" },
    menu: { title: "菜单", close: "关闭", dmTagline: "我要成为焦点，启动机器" },
    cat: {
      all: "全部商品", newin: "新品", clothing: "服装", accessories: "配饰", shoes: "鞋履", luxe: "奢选",
      tops: "上衣", shirts: "衬衫", cardigans: "开衫", sweatshirts: "卫衣", dresses: "连衣裙",
      skirts: "半裙", shorts: "短裤", jumpsuits: "连体衣", jeans: "牛仔", trousers: "长裤",
      leather: "皮革", lingerie: "内衣", swimwear: "泳装",
      sneakers: "运动鞋", heels: "高跟鞋", flats: "平底鞋", ballet: "芭蕾鞋", boots: "靴子", open: "露趾鞋",
      jewelry: "珠宝", scarves: "丝巾/围巾", hats: "帽子", bags: "包袋", wallets: "钱包",
      sunglasses: "墨镜", gloves: "手套", belts: "腰带",
      outerwear: "外套 & 夹克", dressesSkirts: "连衣裙 & 半裙", bottoms: "长裤 & 牛仔裤",
    },
    foot: { selltous: "卖给我们", tagline: "自 Y2K 起的二手好物 · 巴黎" },
    hero: { kicker: "Lil'OG · 复古，重生", line: "我们生来",
      words: ["闪耀。", "征服。", "称王。", "燃烧。"], shop: "查看上新", story: "我们的故事", avail: "下次上新 · 6月3日" },
    home: {
      scroll: "向下滚动",
      slotIntroTitle: "DRESSING MACHINE 是什么？",
      slotIntroBody: "一台造型自动贩卖机，不卖糖果。按下按钮，机器会从我们的复古档案中抽取三件独一无二的单品，三秒为你搭配出一整套造型。每件单品都只有一件。如果你喜欢这套造型，它不会再来第二次。",
      slotSub: "从档案里抽三件，凑成一整套造型。机器来选，你来定。",
      slotCta: "运行 DRESSING_MACHINE.EXE", slotCoin: "投币 · 免费游戏",
      filesTitle: "货架资源管理器", filesSub: "打开文件夹，翻一翻档案。",
      filesObjects: "个对象", sysStats: "系统统计",
    },
    drops: { eyebrow: "本周精选", title: "热门上新", shopAll: "查看全部" },
    lb: { view: "查看系列", oneofone: "独一无二，绝不补货",
      newinKicker: "春季档案 · Vol. 001", ogdresses: "OG's dresses", shop: "选购" },
    ed: { eyebrow: "我们的故事", title: ["只穿一次。", { em: "永远" }, "被渴望。"],
      p1: "Lil'OG 是一家痴迷于千禧年初的二手复古店，那是低腰、蝴蝶发夹和满身 logo 的年代。我们寻回定义一代人的单品，让它们以独一无二的形式重生。",
      p2: "每一件单品都在巴黎手工甄选、清洁并鉴真。没有量产，没有两件相同。只有原版，为生来闪耀的人重生。",
      stats: [["300+", "件单品找到新家"], ["100%", "独一无二"], ["始于 2026", "Y2K 档案"]] },
    footer: { newsH: "加入名单",
      newsP: "每次上新优先知晓。没有垃圾邮件。只有好物，售罄之前。",
      email: "你的@email.com", join: "加入 →", shop: "商店", help: "帮助", about: "关于", legalH: "法律",
      helpLinks: ["配送", "退货", "正品保证"],
      aboutLinks: ["我们的故事", "可持续"], legalLinks: ["条款", "法律声明", "隐私", "Cookies"],
      copy: "© 2026 Lil'OG · Y2K 二手好物，巴黎", legal: "条款 · 隐私 · Cookie" },
    pdp: {
      back: "返回商店", unique: "独一无二", newIn: "新品", soldOut: "已售罄",
      addToCart: "加入购物袋", added: "已加入 ✓", ref: "货号",
      detailsH: "细节与保养", detailsBody: "请遵照每件商品标签上的洗涤说明。如无标签，建议选择轻柔洗涤或干洗，以保护面料。",
      shippingH: "配送与退货", shippingBody: "巴黎发货，可追踪物流。订单将在3个工作日内发出。由于每件单品独一无二，未穿着可在14天内退货。",
      completeLook: "搭配全look",
    },
    cart: {
      title: "购物袋", empty: "购物袋是空的", emptyCta: "继续购物",
      subtotal: "小计", subtotalNote: "运费和税费将在结账时计算。", checkout: "去结账",
      remove: "移除", each: "单价",
    },
    category: { empty: "这个分类暂时还没有商品，敬请期待。" },
  },

  ja: {
    nav: { search: "検索", bag: "バッグ", login: "ログイン" },
    menu: { title: "メニュー", close: "閉じる", dmTagline: "アイコニックになりたい、マシンを起動する" },
    cat: {
      all: "全カタログ", newin: "新着", clothing: "ウェア", accessories: "アクセサリー", shoes: "シューズ", luxe: "ラグジュアリー",
      tops: "トップス", shirts: "シャツ", cardigans: "カーディガン", sweatshirts: "スウェット", dresses: "ワンピース",
      skirts: "スカート", shorts: "ショーツ", jumpsuits: "オールインワン", jeans: "ジーンズ", trousers: "パンツ",
      leather: "レザー", lingerie: "ランジェリー", swimwear: "水着",
      sneakers: "スニーカー", heels: "ヒール", flats: "フラット", ballet: "バレエシューズ", boots: "ブーツ", open: "オープントゥ",
      jewelry: "ジュエリー", scarves: "スカーフ/マフラー", hats: "帽子", bags: "バッグ", wallets: "財布",
      sunglasses: "サングラス", gloves: "手袋", belts: "ベルト",
      outerwear: "アウター & コート", dressesSkirts: "ワンピース & スカート", bottoms: "パンツ & ジーンズ",
    },
    foot: { selltous: "買取", tagline: "Y2K以来の古着 · パリ" },
    hero: { kicker: "Lil'OG · ヴィンテージ、再生", line: "私たちは生まれた",
      words: ["輝くために。", "制すために。", "魅せるために。", "燃えるために。"], shop: "ドロップを見る", story: "私たちの物語", avail: "次のドロップ · 6月3日" },
    home: {
      scroll: "スクロール",
      slotIntroTitle: "ドレッシングマシンって何？",
      slotIntroBody: "お菓子の代わりにスタイルが出てくる自販機。ボタンを押せば、ヴィンテージアーカイブから一点物のアイテムを3つ選び、3秒でひとつの着こなしを完成させます。どのアイテムも世界に一つだけ。気に入ったら、二度と同じルックには出会えません。",
      slotSub: "アーカイブから3点、ひとつの完成された着こなしへ。選ぶのはマシン、決めるのはあなた。",
      slotCta: "DRESSING_MACHINE.EXE を起動", slotCoin: "コインを入れる · フリープレイ",
      filesTitle: "ラック エクスプローラー", filesSub: "フォルダを開いてアーカイブを掘る。",
      filesObjects: "個のオブジェクト", sysStats: "システム統計",
    },
    drops: { eyebrow: "今週のセレクト", title: "注目のドロップ", shopAll: "すべて見る" },
    lb: { view: "コレクションを見る", oneofone: "一点物、再入荷なし",
      newinKicker: "スプリングアーカイブ · Vol. 001", ogdresses: "OG's dresses", shop: "見る" },
    ed: { eyebrow: "私たちの物語", title: ["一度だけ着られた。", { em: "永遠に" }, "求められる。"],
      p1: "Lil'OG は2000年代初頭に夢中なセカンドハンドのヴィンテージハウス。ローライズ、バタフライクリップ、ロゴだらけの時代。世代を象徴したピースを探し出し、一点物として蘇らせます。",
      p2: "すべての一着はパリで手作業により仕入れ、洗浄し、真贋を確認しています。大量生産はなく、同じものは二つとありません。輝くために生まれた人へ、オリジナルを再生します。",
      stats: [["300+", "点が新たな家へ"], ["100%", "一点物"], ["2026年より", "Y2Kアーカイブ"]] },
    footer: { newsH: "リストに登録",
      newsP: "すべてのドロップを最速で。スパムなし。売り切れる前に、良いものだけ。",
      email: "your@email.com", join: "登録 →", shop: "ショップ", help: "ヘルプ", about: "私たちについて", legalH: "法的事項",
      helpLinks: ["配送", "返品", "真贋保証"],
      aboutLinks: ["私たちの物語", "サステナビリティ"], legalLinks: ["利用規約", "法的通知", "プライバシー", "Cookies"],
      copy: "© 2026 Lil'OG · Y2K 古着、パリ", legal: "規約 · プライバシー · Cookie" },
    pdp: {
      back: "ショップに戻る", unique: "一点物", newIn: "新着", soldOut: "売り切れ",
      addToCart: "バッグに追加", added: "追加済み ✓", ref: "品番",
      detailsH: "詳細＆お手入れ", detailsBody: "各商品のタグに記載された洗濯表示に従ってください。タグがない場合は、素材を保護するためデリケートコースまたはドライクリーニングをお勧めします。",
      shippingH: "配送＆返品", shippingBody: "パリから追跡可能な配送。ご注文は3営業日以内に発送されます。一点物のため、未着用の場合14日以内の返品が可能です。",
      completeLook: "コーディネートを完成させる",
    },
    cart: {
      title: "カート", empty: "カートは空です", emptyCta: "ショッピングを続ける",
      subtotal: "小計", subtotalNote: "配送料と税金はチェックアウト時に計算されます。", checkout: "レジに進む",
      remove: "削除", each: "単価",
    },
    category: { empty: "このカテゴリーにはまだアイテムがありません。近日公開。" },
  },

  ko: {
    nav: { search: "검색", bag: "장바구니", login: "로그인" },
    menu: { title: "메뉴", close: "닫기", dmTagline: "아이코닉해지고 싶어, 머신을 가동한다" },
    cat: {
      all: "전체 카탈로그", newin: "신상품", clothing: "의류", accessories: "액세서리", shoes: "신발", luxe: "럭셔리 셀렉션",
      tops: "탑", shirts: "셔츠", cardigans: "가디건", sweatshirts: "스웨트셔츠", dresses: "드레스",
      skirts: "스커트", shorts: "쇼츠", jumpsuits: "점프수트", jeans: "진", trousers: "팬츠",
      leather: "레더", lingerie: "란제리", swimwear: "수영복",
      sneakers: "스니커즈", heels: "힐", flats: "플랫", ballet: "발레슈즈", boots: "부츠", open: "오픈토",
      jewelry: "주얼리", scarves: "스카프/머플러", hats: "모자", bags: "백", wallets: "지갑",
      sunglasses: "선글라스", gloves: "장갑", belts: "벨트",
      outerwear: "코트 & 재킷", dressesSkirts: "원피스 & 스커트", bottoms: "팬츠 & 진",
    },
    foot: { selltous: "판매하기", tagline: "Y2K부터의 빈티지 · 파리" },
    hero: { kicker: "Lil'OG · 빈티지, 다시 태어나다", line: "우리는 태어났다",
      words: ["빛나기 위해.", "정복하기 위해.", "군림하기 위해.", "불태우기 위해."], shop: "드롭 보기", story: "우리의 이야기", avail: "다음 드롭 · 6월 3일" },
    home: {
      scroll: "스크롤",
      slotIntroTitle: "드레싱 머신이 뭐예요?",
      slotIntroBody: "사탕 대신 스타일이 나오는 자판기예요. 버튼을 누르면 빈티지 아카이브에서 단 하나뿐인 피스 세 개를 골라 3초 만에 완성된 룩을 만들어줘요. 모든 피스는 세상에 단 하나뿐, 마음에 든 룩은 다시 만날 수 없어요.",
      slotSub: "아카이브에서 세 피스, 하나의 완성된 룩. 고르는 건 머신, 정하는 건 당신.",
      slotCta: "DRESSING_MACHINE.EXE 실행", slotCoin: "코인 투입 · 무료 플레이",
      filesTitle: "랙 탐색기", filesSub: "폴더를 열어 아카이브를 뒤져보세요.",
      filesObjects: "개 항목", sysStats: "시스템 통계",
    },
    drops: { eyebrow: "이번 주 셀렉션", title: "피처드 드롭", shopAll: "전체 보기" },
    lb: { view: "컬렉션 보기", oneofone: "단 하나, 재입고 없음",
      newinKicker: "스프링 아카이브 · Vol. 001", ogdresses: "OG's dresses", shop: "쇼핑" },
    ed: { eyebrow: "우리의 이야기", title: ["한 번 입은. ", { em: "영원히" }, " 갈망되는."],
      p1: "Lil'OG는 2000년대 초반에 푹 빠진 세컨핸드 빈티지 하우스입니다. 로우라이즈, 나비 핀, 로고가 가득하던 시대. 한 세대를 정의한 피스를 찾아내 단 하나의 형태로 되살립니다.",
      p2: "모든 의류는 파리에서 직접 소싱하고 세척하며 정품 인증을 거칩니다. 대량 생산도, 같은 것도 없습니다. 오직 오리지널, 빛나기 위해 태어난 이들을 위해 다시 태어납니다.",
      stats: [["300+", "피스가 새 주인에게"], ["100%", "단 하나"], ["2026부터", "Y2K 아카이브"]] },
    footer: { newsH: "리스트에 등록",
      newsP: "모든 드롭을 가장 먼저. 스팸 없이, 좋은 것만, 사라지기 전에.",
      email: "your@email.com", join: "등록 →", shop: "쇼핑", help: "도움말", about: "소개", legalH: "법적",
      helpLinks: ["배송", "반품", "정품 인증"],
      aboutLinks: ["우리의 이야기", "지속가능성"], legalLinks: ["이용약관", "법적고지", "개인정보", "Cookies"],
      copy: "© 2026 Lil'OG · Y2K 빈티지, 파리", legal: "약관 · 개인정보 · 쿠키" },
    pdp: {
      back: "쇼핑으로 돌아가기", unique: "단 하나", newIn: "신상품", soldOut: "품절",
      addToCart: "장바구니에 담기", added: "담김 ✓", ref: "품번",
      detailsH: "상세 정보 & 관리", detailsBody: "각 상품의 라벨에 표시된 세탁 지침을 따르세요. 라벨이 없는 경우 소재 보호를 위해 섬세한 세탁 또는 드라이클리닝을 권장합니다.",
      shippingH: "배송 & 반품", shippingBody: "파리에서 추적 가능한 배송. 주문은 영업일 기준 3일 이내에 발송됩니다. 모든 제품이 단 하나뿐이므로, 미착용 상태로 14일 이내 반품이 가능합니다.",
      completeLook: "룩 완성하기",
    },
    cart: {
      title: "장바구니", empty: "장바구니가 비어 있습니다", emptyCta: "쇼핑 계속하기",
      subtotal: "소계", subtotalNote: "배송비와 세금은 결제 시 계산됩니다.", checkout: "결제하기",
      remove: "삭제", each: "개당",
    },
    category: { empty: "아직 이 카테고리에 상품이 없습니다. 곧 다시 확인해 주세요." },
  },
};
