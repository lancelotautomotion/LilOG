"use client";

/* ============================================================
   ITEM_INSPECTOR_2000.EXE — /products/[handle]
   ------------------------------------------------------------
   La fiche produit vit dans une seule fenêtre applicative, comme
   /category, /histoire et /faq : LIL_OG_PHOTO_VIEWER à gauche
   (lecteur média + Polaroids), ITEM_STATS.SYS à droite (titre
   brutaliste, écran LED, fiche de specs RPG, alerte stock
   clignotante, bouton chunky 3D), puis SYSTEM_LOGS en pied de
   fenêtre — trois fichiers système à onglets plutôt qu'une pile
   d'accordéons plats.

   RECOMMENDED_COMBO.EXE, le cross-sell, est un module séparé en
   dessous, comme FILE_EXPLORER.SYS sur l'accueil.

   ⚠ PAREFEU : Tailwind + feuille locale préfixée `lpi-`, servie
   une seule fois pour toute la page. Aucune classe de
   globals.css — les anciennes règles `.pdp-*` ne sont plus
   utilisées par cette page.
   ============================================================ */

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n-context";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/hooks/use-wishlist";
import { Nav } from "@/components/nav";
import { Drawer } from "@/components/drawer";
import { Footer } from "@/components/footer";
import { Icon } from "@/components/icons";
import { ProductGallery } from "@/components/product-gallery";
import { ProductWindow } from "@/components/category/product-window";
import {
  BEVEL_IN,
  LCD,
  LeopardBackdrop,
  MATRIX,
  MONO,
  NEON,
  PLASTIC,
  PLASTIC_FACE,
  PLASTIC_PRESS,
  WindowFrame,
} from "@/components/y2k/kit";
import type { Product, ProductDetail as ProductDetailType } from "@/lib/shopify/types";

const INTERNAL_TAGS = new Set(["new", "one-of-one", "1-of-1"]);

const DESC_SECTIONS: { re: RegExp; label: string; accordion: boolean }[] = [
  { re: /les détails de la pépite/i,       label: "Les détails de la pépite", accordion: false },
  { re: /nos conseils de style/i,          label: "Nos conseils de style",     accordion: true  },
  { re: /info(?:s)?\s+mannequin/i,         label: "Info Mannequin & Fit",      accordion: true  },
  { re: /à propos de notre sélection/i,    label: "À propos de notre sélection", accordion: true },
];

function parseDescription(html: string): {
  sections: { label: string | null; content: string; accordion: boolean }[];
} {
  const segments = html.split(/(?=<p[\s>])/i);
  const raw: { label: string | null; accordion: boolean; chunks: string[] }[] = [
    { label: null, accordion: false, chunks: [] },
  ];

  for (const seg of segments) {
    const text = seg.replace(/<[^>]+>/g, "");
    const match = DESC_SECTIONS.find((s) => s.re.test(text));
    if (match) {
      const chunk = match.accordion
        ? seg.replace(/<strong[^>]*>[\s\S]*?<\/strong>\s*(<br\s*\/?>)?\s*/i, "")
        : seg;
      raw.push({ label: match.label, accordion: match.accordion, chunks: [chunk] });
    } else {
      raw[raw.length - 1].chunks.push(seg);
    }
  }

  return {
    sections: raw.map((s) => ({ label: s.label, content: s.chunks.join(""), accordion: s.accordion })),
  };
}

const PDP_CSS = `
@keyframes lpi-blink{0%,49%{opacity:1}50%,100%{opacity:.25}}
.lpi-blink{animation:lpi-blink 1.15s step-end infinite}

/* Lignes de balayage de l'afficheur de prix — l'écran a l'air allumé,
   pas imprimé. Purement décoratif, sous le texte. */
.lpi-crt::after{content:"";position:absolute;inset:0;pointer-events:none;
  background:repeating-linear-gradient(to bottom,rgba(0,0,0,.32) 0 1px,rgba(0,0,0,0) 1px 3px)}

/* Ascenseur du Notepad, façon Windows : gouttière grise, poignée en
   plastique biseauté.
   scrollbar-gutter:stable réserve la place en permanence — sans elle
   Chrome dessine un ascenseur flottant qui n'apparaît qu'au survol, et
   rien n'indique que le texte continue. On ne déclare surtout pas
   scrollbar-width / scrollbar-color : ces propriétés standard, une
   fois posées, désactivent les pseudo-éléments -webkit- ci-dessous.
   Firefox, lui, garde son ascenseur natif. */
.lpi-scroll{scrollbar-gutter:stable}
.lpi-scroll::-webkit-scrollbar{width:14px}
.lpi-scroll::-webkit-scrollbar-track{background:#eceafa;border-left:1px solid #d8d5e6}
.lpi-scroll::-webkit-scrollbar-thumb{border:1px solid #a5a1bd;
  background:linear-gradient(180deg,#fdfdff 0%,#ebe9f4 48%,#c9c6da 100%);
  box-shadow:inset 1px 1px 0 rgba(255,255,255,.95),inset -1px -1px 0 rgba(90,86,120,.55)}

.lpi-desc p{margin:0 0 1.1em}
.lpi-desc p:last-child{margin-bottom:0}
.lpi-desc strong,.lpi-desc b{font-weight:700}
.lpi-desc em,.lpi-desc i{font-style:italic}
.lpi-desc ul,.lpi-desc ol{margin:0 0 1.1em;padding-left:1.3em}
.lpi-desc li{margin-bottom:.35em}
.lpi-desc a{text-decoration:underline;text-underline-offset:2px}
.lpi-desc br+br{display:none}

@media (prefers-reduced-motion: reduce){ .lpi-blink{animation:none} }
`;

/* ============================================================
   ITEM_STATS.SYS — bloc RPG
   ============================================================ */

function StatCell({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div
      className={`flex min-w-0 flex-1 items-center gap-2 rounded-md border border-[#c6c2d8] bg-[#f7f6fc] px-2.5 py-2 ${BEVEL_IN}`}
    >
      <span aria-hidden className="shrink-0 text-[0.9rem] leading-none">{icon}</span>
      <span className="min-w-0">
        <span className={`${MONO} block truncate text-[0.46rem] font-bold tracking-[0.1em] text-[#6B7280] uppercase`}>
          {label}
        </span>
        <span className={`${MONO} block truncate text-[0.62rem] font-bold text-[#1E2430] uppercase`}>{value}</span>
      </span>
    </div>
  );
}

/* ============================================================
   SYSTEM_LOGS — onglets fichiers système
   ============================================================ */

function SystemLogs({
  tabs,
}: {
  tabs: { file: string; icon: string; body: React.ReactNode }[];
}) {
  const [active, setActive] = useState(0);
  const shown = tabs[active] ?? tabs[0];

  /* Le texte est plafonné en hauteur : reste à le dire. L'ascenseur ne
     suffit pas — Chrome le dessine en flottant, invisible tant qu'on ne
     survole pas le cadre. On mesure donc le débordement pour n'afficher
     le dégradé et la mention [ ▼ SUITE ] que lorsqu'il reste à lire. */
  const bodyRef = useRef<HTMLDivElement>(null);
  const [more, setMore] = useState(false);

  const measure = useCallback(() => {
    const el = bodyRef.current;
    if (!el) return;
    setMore(el.scrollHeight - el.scrollTop - el.clientHeight > 8);
  }, []);

  useEffect(() => {
    measure();
    const el = bodyRef.current;
    if (!el) return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure, active]);

  return (
    /* `flex-1` : en grand écran, le bloc s'étire pour absorber la hauteur
       laissée par le lecteur photo — les deux colonnes tombent d'aplomb
       quelle que soit la taille du cadre photo, sans réglage à la main. */
    <div className="mt-6 flex min-h-0 flex-1 flex-col">
      <div className={`${MONO} mb-2 text-[0.5rem] font-bold tracking-[0.14em] text-[#5b2fb8] uppercase`}>
        ▶ SYSTEM_LOGS
      </div>

      {/* Onglets posés sur le bord haut du Notepad : l'actif partage son
          blanc et perd sa bordure basse, donc les deux ne font qu'un. */}
      <div className="flex flex-wrap gap-1">
        {tabs.map((tb, i) => (
          <button
            key={tb.file}
            type="button"
            onClick={() => setActive(i)}
            aria-pressed={i === active}
            className={`${MONO} flex items-center gap-1 rounded-t-md border border-b-0 px-2 py-1.5 text-[0.46rem] font-bold tracking-[0.02em] uppercase transition sm:text-[0.5rem] ${
              i === active
                ? "relative z-[1] -mb-px border-[#c6c2d8] bg-white text-[#1E2430]"
                : "border-transparent bg-[#dcdaea] text-[#6B7280] hover:bg-[#eceafa]"
            }`}
          >
            <span aria-hidden>{tb.icon}</span>
            {tb.file}
          </button>
        ))}
      </div>

      {/* Fenêtre Notepad encastrée. Les fiches Shopify vont d'une ligne à
          trois écrans de texte : le texte défile dans sa fenêtre plutôt que
          d'étirer la page sans fin.
          Hauteur imposée, pas plafonnée : avec `max-h`, la fenêtre se
          rétractait sur les onglets courts et le bloc sautait d'un onglet
          à l'autre. Elle garde donc la même taille quel que soit l'onglet
          — un cadre de fenêtre ne change pas de dimension parce qu'on
          ouvre un autre fichier. */}
      <div className="relative flex min-h-0 flex-1 flex-col">
        <div
          ref={bodyRef}
          onScroll={measure}
          className={`lpi-scroll h-[clamp(220px,38vh,300px)] overflow-y-auto rounded-md rounded-tl-none border border-[#c6c2d8] bg-white p-3.5 lg:h-auto lg:min-h-[200px] lg:flex-1 ${BEVEL_IN}`}
        >
          <div className={`${MONO} lpi-desc text-[0.64rem] leading-[1.75] text-[#3b3550]`}>{shown.body}</div>
        </div>

        {more && (
          <>
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-px bottom-px h-12 rounded-b-md"
              style={{ background: "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.96) 78%)" }}
            />
            <span
              aria-hidden
              className={`${MONO} pointer-events-none absolute right-4 bottom-1.5 rounded-sm border border-[#c6c2d8] bg-[#eceafa] px-1.5 py-0.5 text-[0.44rem] font-bold tracking-[0.08em] text-[#5b2fb8] uppercase`}
            >
              ▼ SUITE
            </span>
          </>
        )}
      </div>
    </div>
  );
}

export function ProductDetail({ product, related }: { product: ProductDetailType; related: Product[] }) {
  const { t } = useLanguage();
  const { addItem } = useCart();
  const router = useRouter();
  const [menu, setMenu] = useState(false);
  const [added, setAdded] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const { has, toggle } = useWishlist();
  const liked = has(product.handle);

  const hasVariants = product.variants.length > 0;
  const [variant, setVariant] = useState(() => product.variants.find((v) => v.availableForSale) ?? product.variants[0]);

  const sold = hasVariants ? !variant?.availableForSale : !product.available;
  const variantId = hasVariants ? (variant?.id ?? null) : product.defaultVariantId;
  const discount = product.was ? Math.round((1 - product.price / product.was) * 100) : null;

  const badge = product.tag === "1 OF 1" ? "💎 1 OF 1" : product.tag === "NEW" ? "🔥 NEW IN" : null;
  const size = variant?.title ?? product.size ?? "UNIQUE";
  const dept = product.collections[0] ? (t.cat[product.collections[0]] ?? product.collections[0]) : null;

  const add = async () => {
    if (sold || !variantId) return;
    setAdded(true);
    setAddError(null);
    try {
      await addItem(variantId, 1);
      setTimeout(() => setAdded(false), 1400);
    } catch (err) {
      setAdded(false);
      setAddError(err instanceof Error ? err.message : "Erreur lors de l'ajout au panier");
    }
  };

  const { sections } = product.descriptionHtml ? parseDescription(product.descriptionHtml) : { sections: [] };
  const moodHtml = sections
    .filter((s) => s.label !== "Info Mannequin & Fit")
    .map((s) => s.content)
    .join("");
  const fitHtml = sections.find((s) => s.label === "Info Mannequin & Fit")?.content ?? "";

  const logTabs = [
    {
      file: "DESCRIPTION_&_MOOD.TXT",
      icon: "📂",
      body: moodHtml ? (
        <div dangerouslySetInnerHTML={{ __html: moodHtml }} />
      ) : (
        <p>Aucune description renseignée pour cette pièce.</p>
      ),
    },
    {
      file: "FIT_&_MEASUREMENTS.SYS",
      icon: "📂",
      body: (
        <>
          {fitHtml && <div dangerouslySetInnerHTML={{ __html: fitHtml }} />}
          <p className={fitHtml ? "mt-4" : ""}>
            <strong>{t.pdp.detailsH}</strong>
            <br />
            {t.pdp.detailsBody}
          </p>
        </>
      ),
    },
    {
      file: "SHIPPING_&_RETURNS.EXE",
      icon: "📂",
      body: (
        <p>
          <strong>{t.pdp.shippingH}</strong>
          <br />
          {t.pdp.shippingBody}
        </p>
      ),
    },
  ];

  return (
    <>
      <Nav onMenu={() => setMenu(true)} forceSolid />
      <Drawer open={menu} onClose={() => setMenu(false)} />

      <main className="relative">
        <style>{PDP_CSS}</style>
        <LeopardBackdrop />

        <div className="relative z-[1] mx-auto w-full max-w-[1180px] px-4 pt-[calc(72px+clamp(16px,2.4vw,28px))] pb-[clamp(48px,8vw,96px)] sm:px-6">
          <button
            type="button"
            onClick={() => router.back()}
            className={`${MONO} mb-4 inline-flex items-center gap-1.5 rounded-md border border-[#c6c2d8] ${PLASTIC_FACE} px-3 py-1.5 text-[0.56rem] font-bold text-[#262626] uppercase transition hover:brightness-105 ${PLASTIC} ${PLASTIC_PRESS}`}
          >
            <Icon.arrowL width={13} height={13} className="[transform:scaleX(-1)]" /> {t.pdp.back}
          </button>

          <WindowFrame
            title="C:\ LIL_OG \ ITEM_INSPECTOR_2000.EXE"
            icon={<Icon.folderOpen width={15} height={12} />}
            bodyStyle={{ backgroundColor: "#ffffff" }}
          >
            {/* Barre de menus */}
            <div className="flex flex-wrap items-center gap-4 border-b border-[#c6c2d8] bg-[#e9e7f2] px-3 py-1.5">
              {["Fichier", "Édition", "Affichage", "Favoris", "?"].map((m) => (
                <span key={m} className={`${MONO} text-[0.54rem] tracking-[0.06em] text-[#3b3550] uppercase`}>
                  {m}
                </span>
              ))}
            </div>

            {/* Barre d'adresse */}
            <div className="flex items-center gap-2 border-b border-[#c6c2d8] bg-[#f0eef7] px-3 py-2">
              <span className={`${MONO} shrink-0 text-[0.52rem] tracking-[0.14em] text-[#6B7280] uppercase`}>
                Adresse
              </span>
              <span
                className={`${MONO} flex min-w-0 flex-1 items-center gap-1.5 rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-[0.54rem] tracking-[0.04em] text-[#1E2430] ${BEVEL_IN}`}
              >
                <Icon.folder width={14} height={12} className="shrink-0" />
                <span className="truncate">{`C:\\LIL_OG\\ITEMS\\${product.handle}`}</span>
              </span>
              <span
                className={`${MONO} shrink-0 rounded-full border border-[#c6c2d8] ${PLASTIC_FACE} px-3 py-1.5 text-[0.52rem] font-bold text-[#262626] ${PLASTIC}`}
              >
                [ OK ]
              </span>
            </div>

            {/* ---- Corps : galerie + specs ---- */}
            <div className="grid grid-cols-1 gap-6 p-4 lg:grid-cols-2 lg:gap-8 lg:p-6">
              {/* LIL_OG_PHOTO_VIEWER */}
              <ProductGallery images={product.images} name={product.name} />

              {/* ITEM_STATS.SYS — colonne en flex : c'est ce qui permet à
                  SYSTEM_LOGS, en bas, de prendre toute la hauteur restante. */}
              <div className="flex min-w-0 flex-col">
                <div className={`${MONO} mb-2 text-[0.5rem] font-bold tracking-[0.14em] text-[#5b2fb8] uppercase`}>
                  ▶ ITEM_STATS.SYS
                </div>

                {badge && (
                  <span
                    className={`${MONO} mb-2 inline-block rounded-sm border border-[#c6c2d8] ${PLASTIC_FACE} px-2 py-1 text-[0.5rem] font-bold tracking-[0.06em] text-[#5b2fb8] uppercase ${PLASTIC}`}
                  >
                    {badge}
                  </span>
                )}

                {/* Même typo LCD que les titres de /category, /histoire,
                    /faq et /durabilite — le nom de la pièce parle le même
                    langage que le reste du site plutôt qu'une typo
                    brutaliste propre à cette page. */}
                <h1
                  className={`${LCD} text-[clamp(1.6rem,3.6vw,2.6rem)] leading-[1.05] tracking-[0.02em] text-[#2a1266] uppercase`}
                >
                  {product.name}
                </h1>

                {/* Écran LED — un vrai afficheur d'appareil : boîtier noir
                    encastré, libellé gravé, chiffres néon en typo LCD, prix
                    barré et remise logés dans le même bandeau plutôt que
                    dispersés à côté. */}
                <div
                  className={`lpi-crt relative mt-4 w-fit max-w-full overflow-hidden rounded-lg border-2 border-[#2b2b3d] bg-black px-4 py-2.5 ${BEVEL_IN}`}
                >
                  <div className="relative z-[2] flex flex-wrap items-end gap-x-5 gap-y-1.5">
                    <div className="min-w-0">
                      <span
                        className={`${MONO} block text-[0.42rem] font-bold tracking-[0.22em] uppercase`}
                        style={{ color: "rgba(255,94,196,0.55)" }}
                      >
                        PRICE_TAG.SYS
                      </span>
                      <span className="flex items-baseline gap-2.5">
                        <span
                          className={`${LCD} text-[2.6rem] leading-[0.9] tracking-[0.02em]`}
                          style={{ color: NEON, textShadow: `0 0 14px ${NEON}b3, 0 0 34px ${NEON}59` }}
                        >
                          {product.price}€
                        </span>
                        {product.was && (
                          <s className={`${MONO} text-[0.72rem] text-white/35`}>{product.was}€</s>
                        )}
                      </span>
                    </div>

                    {discount !== null && (
                      <span
                        className={`${LCD} shrink-0 rounded border border-[#5affa0]/50 px-2 py-0.5 text-[1.15rem] leading-none`}
                        style={{
                          color: MATRIX,
                          textShadow: `0 0 10px ${MATRIX}8c`,
                          background: "rgba(90,255,160,0.08)",
                        }}
                      >
                        -{discount}%
                      </span>
                    )}
                  </div>
                </div>

                {/* Fiche de caractéristiques RPG */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <StatCell icon="📏" label="Taille" value={size} />
                  <StatCell icon="💎" label="État" value={product.etat ?? "Non renseigné"} />
                  {dept && <StatCell icon="🗂️" label="Rayon" value={dept} />}
                </div>

                {hasVariants && product.variants.length > 1 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {product.variants.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        disabled={!v.availableForSale}
                        onClick={() => setVariant(v)}
                        className={`${MONO} rounded-md border px-3 py-1.5 text-[0.58rem] font-bold uppercase transition disabled:cursor-not-allowed disabled:opacity-35 disabled:line-through ${
                          variant?.id === v.id
                            ? "border-[#1E2430] bg-[#1E2430] text-white"
                            : `border-[#c6c2d8] ${PLASTIC_FACE} text-[#262626] ${PLASTIC} ${PLASTIC_PRESS}`
                        }`}
                      >
                        {v.title}
                      </button>
                    ))}
                  </div>
                )}

                {/* Alerte stock */}
                {!sold && (
                  <div
                    className={`lpi-blink ${MONO} mt-4 inline-flex items-center gap-1.5 rounded-sm border border-amber-500 bg-amber-100 px-2.5 py-1.5 text-[0.5rem] font-bold tracking-[0.04em] text-amber-800 uppercase`}
                  >
                    ⚠️ WARNING : 1 SINGLE PIECE AVAILABLE
                  </div>
                )}

                {/* Bouton chunky 3D + wishlist */}
                <div className="mt-5 flex items-stretch gap-3">
                  <button
                    type="button"
                    onClick={add}
                    disabled={sold || !variantId}
                    className={`${MONO} flex-1 rounded-lg border-b-4 border-[#7a0a52] px-4 py-3.5 text-[0.72rem] font-black tracking-[0.06em] text-white uppercase transition active:translate-y-1 active:border-b-0 active:shadow-none disabled:cursor-not-allowed disabled:opacity-45 disabled:active:translate-y-0 ${
                      added
                        ? "bg-gradient-to-b from-[#4fbe84] to-[#1B8A3C] border-[#0f5c26]"
                        : "bg-gradient-to-b from-[#ff5ec4] to-[#c3128a]"
                    }`}
                    style={{ boxShadow: "0 5px 0 rgba(0,0,0,0.18)" }}
                  >
                    {sold ? "[ ✖ SOLD_OUT.SYS ]" : added ? "[ ✓ ADDED.OK ]" : "[ 🛒 ADD_TO_CART.EXE ]"}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      toggle({ handle: product.handle, title: product.name, price: product.price, image: product.images[0], variantId })
                    }
                    aria-label="Ajouter aux favoris"
                    aria-pressed={liked}
                    className={`flex w-14 shrink-0 items-center justify-center rounded-lg border-b-4 transition active:translate-y-1 active:border-b-0 active:shadow-none ${
                      liked
                        ? "border-[#7a0a52] bg-gradient-to-b from-[#ff9ee4] to-[#d3016d] text-white"
                        : `border-[#8b87a3] ${PLASTIC_FACE} text-[#6B7280]`
                    }`}
                    style={{ boxShadow: "0 5px 0 rgba(0,0,0,0.18)" }}
                  >
                    <svg viewBox="0 0 24 24" width="20" height="20" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </button>
                </div>

                {addError && (
                  <p className={`${MONO} mt-2.5 text-[0.6rem] text-[#d4006e]`}>⚠ {addError}</p>
                )}

                {/* SYSTEM_LOGS — dans la colonne de droite, sous l'achat :
                    c'est lui qui occupe la hauteur laissée libre par le
                    lecteur photo, au lieu de s'étaler en pleine largeur
                    sous un grand vide. */}
                <SystemLogs tabs={logTabs} />
              </div>
            </div>

            {/* Barre d'état */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-b-2xl border-t-2 border-[#c6c2d8] bg-[#e9e7f2] px-3 py-2">
              <span className={`${MONO} text-[0.5rem] tracking-[0.1em] text-[#3b3550] uppercase`}>
                1 objet · 100% one of one
              </span>
              <span className={`${MONO} text-[0.5rem] tracking-[0.1em] text-[#6B7280] uppercase`}>
                {t.pdp.ref} {product.handle}
              </span>
            </div>
          </WindowFrame>

          {/* RECOMMENDED_COMBO.EXE */}
          {related.length > 0 && (
            <div className="mt-[clamp(40px,6vw,72px)]">
              <div className={`${MONO} mb-3 text-[0.58rem] font-bold tracking-[0.14em] text-white uppercase`} style={{ textShadow: "0 2px 6px rgba(0,0,0,0.85)" }}>
                <span style={{ color: "#ff9ee4" }}>▶</span> 🎮 SUGGESTED_STYLE_COMBO.EXE
              </div>
              <div className="grid grid-cols-2 gap-[clamp(10px,1.6vw,16px)] md:grid-cols-4">
                {related.map((p, idx) => (
                  <ProductWindow key={p.id} product={p} idx={idx} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
