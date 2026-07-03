/* Lil'OG — data + smart image helper (shared via window) */
(function () {
  function ux(id, w) {
    return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w || 900}&q=80`;
  }

  // Branded duotone fallback so a missing Unsplash photo still looks intentional.
  const TONES = [
    ["#5a3f2c", "#f4ecdb"], // choco / cream
    ["#382215", "#ffb3d9"], // brown / pink
    ["#271509", "#fff5c3"], // deep / butter
    ["#7a5a44", "#efe5d0"],
  ];
  function placeholder(label, i) {
    const [a, b] = TONES[(i || 0) % TONES.length];
    const txt = (label || "Lil'OG").toUpperCase();
    const svg =
      `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='800'>` +
      `<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>` +
      `<stop offset='0' stop-color='${a}'/><stop offset='1' stop-color='${b}'/>` +
      `</linearGradient></defs>` +
      `<rect width='600' height='800' fill='url(%23g)'/>` +
      `<text x='300' y='410' font-family='Georgia,serif' font-size='34' font-style='italic' ` +
      `fill='${b}' opacity='0.85' text-anchor='middle'>${txt}</text></svg>`;
    return "data:image/svg+xml," + encodeURIComponent(svg).replace(/%2520/g, "%20");
  }

  // <SmartImg> keeps an <img> element even on failure (swaps to data-URI),
  // so CSS hover/opacity transitions keep working.
  function SmartImg({ src, alt, className, tone }) {
    return (
      <img
        className={className}
        src={src}
        alt={alt || ""}
        loading="lazy"
        onError={(e) => {
          if (!e.target.dataset.fb) {
            e.target.dataset.fb = "1";
            e.target.src = placeholder(alt, tone);
          }
        }}
      />
    );
  }

  // ---- resource resolver (works standalone via window.__resources, else falls back to path) ----
  const R = (id, path) => (window.__resources && window.__resources[id]) || path;

  // ---- Hero carousel images ----
  const HERO = [
    { src: R("heroKitchen", "images/hero-kitchen.webp"), label: "Archive 001" },
    { src: R("luxeLaundromat", "images/luxe-laundromat.webp"), label: "Archive 002" },
    { src: R("dressesChalk", "images/dresses-chalk.webp"), label: "Archive 003" },
  ];

  // ---- Featured drops ----
  const DROPS = [
    { name: "Baby Tee", meta: "Cropped · M", price: 38, was: null, tag: "NEW",
      a: ux("1521572163474-6864f9cf17ab"), b: ux("1554568218-0f1715e72254") },
    { name: "Bootcut Jean", meta: "Low-rise · 27", price: 64, was: 89, tag: "1 OF 1",
      a: ux("1542272604-787c3835535d"), b: ux("1604176354204-9268737828e4") },
    { name: "Mesh Top", meta: "Sheer · S", price: 42, was: null, tag: "NEW",
      a: ux("1496747611176-843222e1e57c"), b: ux("1485462537746-965f33f7f6a7") },
    { name: "Track Jacket", meta: "Velour · L", price: 78, was: null, tag: null,
      a: ux("1551028719-00167b16eac5"), b: ux("1539109136881-3be0616acf4b") },
    { name: "Butterfly Halter", meta: "Y2K · XS", price: 36, was: 52, tag: "1 OF 1",
      a: ux("1515372039744-b8f02a3ae446"), b: ux("1483118714900-540cf339fd46") },
    { name: "Cargo Skirt", meta: "Maxi · M", price: 58, was: null, tag: "NEW",
      a: ux("1583496661160-fb5886a0aaaa"), b: ux("1576995853123-5a10305d93c0") },
    { name: "Shield Shades", meta: "Tinted", price: 28, was: null, tag: null,
      a: ux("1572635196237-14b3f281503f"), b: ux("1511499767150-a48a237f0083") },
    { name: "Trucker Cap", meta: "Logo", price: 24, was: 34, tag: "SOLD" ,
      a: ux("1588850561407-ed78c282e89b"), b: ux("1576871337622-98d48d1cf531") },
  ];

  // ---- Category tiles (legacy) ----
  const CATS = [
    { name: "Tops", num: "01", count: 142, img: ux("1434389677669-e08b4cac3105", 1100) },
    { name: "Denim", num: "02", count: 96, img: ux("1543076447-215ad9ba6923", 1100) },
    { name: "Accessories", num: "03", count: 73, img: ux("1492707892479-7bc8d5a4ee93", 1100) },
  ];

  // ---- Lookbook: Zara-style succession of full-bleed campaign photos (i18n keys) ----
  const LOOKBOOK = [
    { type: "full", img: R("newinRoad", "images/newin-road.jpeg"),
      kicker: "newinKicker", name: "newin", cta: "view", align: "left", tone: 0 },
    { type: "split", items: [
      { img: R("topsLawn", "images/tops-lawn.webp"), key: "tops", tone: 1 },
      { img: R("skirtsStreet", "images/skirts-street.webp"), key: "skirts", tone: 2 },
    ]},
    { type: "full", img: R("dressesChalk", "images/dresses-chalk.webp"),
      kicker: "oneofone", name: "ogdresses", cta: "dresses", align: "center", tone: 3 },
    { type: "split", items: [
      { img: R("accessoriesMirror", "images/accessories-mirror.webp"), key: "accessories", tone: 0 },
      { img: R("shoesSteps", "images/shoes-steps.webp"), key: "shoes", tone: 1 },
    ]},
    { type: "full", img: R("luxeLaundromat", "images/luxe-laundromat.webp"),
      name: "luxe", cta: "luxe", align: "center", tone: 2 },
  ];

  const EDITORIAL_IMG = R("editorialPhone", "images/editorial-phone.jpeg");

  window.LilOG = { SmartImg, HERO, DROPS, CATS, LOOKBOOK, EDITORIAL_IMG, placeholder, ux };
})();
