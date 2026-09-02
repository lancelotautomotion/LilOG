"use client";

/* ============================================================
   ITEM_INSPECTOR_2000.EXE : /products/[handle]
   ------------------------------------------------------------
   La fiche produit vit dans une seule fenêtre applicative, comme
   /category, /histoire et /faq : LIL_OG_PHOTO_VIEWER à gauche
   (lecteur média + Polaroids), ITEM_STATS.SYS à droite (titre
   brutaliste, écran LED, fiche de specs RPG, alerte stock
   clignotante, bouton chunky 3D), puis SYSTEM_LOGS en pied de
   fenêtre : trois fichiers système en menus déroulants, un seul
   ouvert à la fois.

   RECOMMENDED_COMBO.EXE, le cross-sell, est une seconde fenêtre en
   dessous, comme FILE_EXPLORER.SYS sur l'accueil.

   ⚠ PAREFEU : Tailwind + feuille locale préfixée `lpi-`, servie
   une seule fois pour toute la page. Aucune classe de
   globals.css : les anciennes règles `.pdp-*` ne sont plus
   utilisées par cette page.
   ============================================================ */

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n-context";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/hooks/use-wishlist";
import { Nav } from "@/components/nav";
import { Drawer } from "@/components/drawer";
import { Footer } from "@/components/footer";
import { Icon } from "@/components/icons";
import { SmartImg } from "@/components/smart-img";
import { ProductGallery } from "@/components/product-gallery";
import { CATEGORIES } from "@/lib/categories";
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
  { re: /les détails de la pépite/i,       label: "Les détails de la pépite", accordion: true  },
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

/* La case ÉTAT (ITEM_STATS.SYS) et la pastille des cartes suggérées portent
   déjà l'info par leur icône/libellé : le mot ne doit pas se répéter dans la
   valeur (« Très bon état » → « Très bon »).
   `\b` ne reconnaît que [A-Za-z0-9_] comme caractère de mot : sans le flag
   `u` et des frontières en `\p{L}`, il ne voit aucune frontière avant un
   « é » et ne matche jamais. */
function stripEtatWord(raw: string): string {
  return raw.replace(/(?<![\p{L}\p{N}])état(?![\p{L}\p{N}])/giu, "").replace(/\s{2,}/g, " ").trim();
}

const PDP_CSS = `
@keyframes lpi-blink{0%,49%{opacity:1}50%,100%{opacity:.25}}
.lpi-blink{animation:lpi-blink 1.15s step-end infinite}

/* Lignes de balayage de l'afficheur de prix : l'écran a l'air allumé,
   pas imprimé. Purement décoratif, sous le texte. */
.lpi-crt::after{content:"";position:absolute;inset:0;pointer-events:none;
  background:repeating-linear-gradient(to bottom,rgba(0,0,0,.32) 0 1px,rgba(0,0,0,0) 1px 3px)}

/* Ascenseur du Notepad, façon Windows : gouttière grise, poignée en
   plastique biseauté.
   scrollbar-gutter:stable réserve la place en permanence, sans elle
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
   ITEM_STATS.SYS : bloc RPG
   ============================================================ */

function StatCell({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    /* `sm:flex-1` et non `flex-1` : au bureau les trois cases se partagent
       la rangée à parts égales, mais sur téléphone une largeur imposée les
       forçait à découper leur valeur sur deux lignes — « TRÈS BON » cassé en
       deux — et les trois cases héritaient de cette hauteur par
       `items-stretch` : 94px de haut sur un portable contre 75 au bureau,
       plus grosses sur le petit écran que sur le grand. À largeur naturelle,
       chacune prend ce que son texte demande et passe à la ligne suivante
       quand la rangée est pleine. */
    <div
      className={`flex min-w-0 items-center gap-1.5 rounded-md border border-[#c6c2d8] bg-[#f7f6fc] px-1.5 py-1.5 sm:flex-1 sm:gap-2 sm:px-2.5 sm:py-2 ${BEVEL_IN}`}
    >
      <span aria-hidden className="shrink-0 text-[1rem] leading-none sm:text-[1.125rem]">{icon}</span>
      <span className="min-w-0">
        {/* Mêmes tailles que le bloc de description des catalogues :
            0.58rem pour l'étiquette (comme les #tags), 0.76rem pour la
            valeur (comme le paragraphe). */}
        <span className={`${MONO} block truncate text-[0.8125rem] font-bold tracking-[0.1em] text-[#6B7280] uppercase`}>
          {label}
        </span>
        <span className={`${MONO} block text-[0.9375rem] leading-tight font-bold text-[#1E2430] uppercase`}>{value}</span>
      </span>
    </div>
  );
}

/* ============================================================
   SYSTEM_LOGS : fichiers système en menus déroulants
   ------------------------------------------------------------
   Un seul fichier ouvert à la fois : cliquer sur un en-tête ferme
   le précédent. Le premier (DETAILS_&_PEPITE.SYS) est ouvert au
   chargement.

   Ce bloc était en onglets, au-dessus d'une fenêtre de hauteur
   imposée. Deux des trois fiches tiennent en quelques lignes : la
   fenêtre restait alors aux trois quarts vide. Chaque panneau prend
   désormais la hauteur de son texte, et ne se met à défiler qu'une
   fois passé le plafond, le cas des longues descriptions Shopify,
   qui feraient sinon une page à rallonge.
   ============================================================ */

function SystemLogs({
  tabs,
}: {
  tabs: { file: string; icon: string; body: React.ReactNode }[];
}) {
  const [open, setOpen] = useState<number | null>(0);

  /* Le texte est plafonné en hauteur : reste à le dire. L'ascenseur ne
     suffit pas, Chrome le dessine en flottant, invisible tant qu'on ne
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
  }, [measure, open]);

  return (
    /* Plus de `flex-1` : la pile de menus prend la hauteur de son
       contenu. C'est tout l'objet du changement, la colonne ne
       s'étire plus pour rejoindre le bas du lecteur photo, elle
       s'arrête où le texte s'arrête. */
    <div className="mt-6 flex flex-col">
      <div className={`${MONO} mb-2 text-[0.8125rem] font-bold tracking-[0.14em] text-[#5b2fb8] uppercase`}>
        ▶ SYSTEM_LOGS
      </div>

      <div className="flex flex-col gap-1.5">
        {tabs.map((tb, i) => {
          const isOpen = i === open;
          const panelId = `syslog-panel-${i}`;
          const headerId = `syslog-header-${i}`;
          return (
            <div
              key={tb.file}
              className="overflow-hidden rounded-md border border-[#c6c2d8]"
            >
              {/* En-tête : une ligne de fenêtre, pas un onglet. Le
                  fichier ouvert prend l'encre foncée et le [ − ]. */}
              <button
                type="button"
                id={headerId}
                onClick={() => {
                  /* Remis à zéro avec l'ouverture : sans ça, passer d'un
                     texte long à un texte court laisserait le [ ▼ SUITE ]
                     affiché le temps que la mesure se refasse. */
                  setMore(false);
                  setOpen(isOpen ? null : i);
                }}
                aria-expanded={isOpen}
                aria-controls={panelId}
                className={`${MONO} flex w-full items-center gap-2 px-3 py-2.5 text-left text-[0.8125rem] font-bold tracking-[0.02em] uppercase transition sm:text-[0.8125rem] ${
                  isOpen
                    ? "border-b border-[#c6c2d8] bg-[#e9e7f2] text-[#1E2430]"
                    : `${PLASTIC_FACE} text-[#3b3550] hover:brightness-105 ${PLASTIC} ${PLASTIC_PRESS}`
                }`}
              >
                <span aria-hidden className="shrink-0">{tb.icon}</span>
                <span className="min-w-0 flex-1 truncate">{tb.file}</span>
                <span aria-hidden className="shrink-0 text-[#5b2fb8]">
                  {isOpen ? "[ − ]" : "[ + ]"}
                </span>
              </button>

              {isOpen && (
                <div className="relative">
                  <div
                    ref={bodyRef}
                    onScroll={measure}
                    id={panelId}
                    role="region"
                    aria-labelledby={headerId}
                    className={`lpi-scroll max-h-[clamp(240px,52vh,560px)] overflow-y-auto bg-white p-3.5 ${BEVEL_IN}`}
                  >
                    {/* Même corps de texte que le bloc de description des
                        catalogues (0.76rem / 1.85) : les deux se lisent de
                        la même façon. */}
                    <div className={`${MONO} lpi-desc text-[0.9375rem] leading-[1.85] text-[#3b3550]`}>
                      {tb.body}
                    </div>
                  </div>

                  {more && (
                    <>
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-x-px bottom-0 h-12"
                        style={{ background: "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.96) 78%)" }}
                      />
                      <span
                        aria-hidden
                        className={`${MONO} pointer-events-none absolute right-4 bottom-1.5 rounded-sm border border-[#c6c2d8] bg-[#eceafa] px-1.5 py-0.5 text-[0.8125rem] font-bold tracking-[0.08em] text-[#5b2fb8] uppercase`}
                      >
                        ▼ SUITE
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
   SUGGESTED_STYLE_COMBO.EXE : carte d'inventaire
   ------------------------------------------------------------
   Une carte propre à cette page plutôt que la fenêtre Win98 dense
   du catalogue (barre de titre, menus, chrome serré) : même famille
   que ITEM_STATS.SYS, écran LED rose, bouton chunky 3D, typo LCD,
   pour que le cross-sell parle la même langue que la fiche
   au-dessus de lui, avec de l'air autour de la photo.
   ============================================================ */

function ComboCard({ product, idx }: { product: Product; idx: number }) {
  const { addItem } = useCart();
  const { has, toggle } = useWishlist();
  const [added, setAdded] = useState(false);
  const fav = has(product.handle);
  const sold = product.tag === "SOLD" || !product.variantId;

  const add = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (sold || !product.variantId) return;
    setAdded(true);
    await addItem(product.variantId, 1);
    setTimeout(() => setAdded(false), 1400);
  };

  const toggleFav = (e: React.MouseEvent) => {
    e.preventDefault();
    if (sold) return;
    toggle({ handle: product.handle, title: product.name, price: product.price, image: product.imageA, variantId: product.variantId });
  };

  const badge = sold ? "× SOLD" : product.tag === "1 OF 1" ? "💎 1/1" : product.tag === "NEW" ? "🔥 NEW" : null;
  const cardClassName =
    "group block overflow-hidden rounded-2xl border-2 border-[#b8b4cc] bg-white shadow-[5px_5px_0_rgba(24,12,58,0.35)] transition hover:-translate-y-1 hover:shadow-[7px_9px_0_rgba(24,12,58,0.42)]";

  const cardContent = (
    <>
      {/* Photo posée à même la carte, sur un carré blanc plein, l'encadrement
          précédent (padding + fond lavande + biseau) creusait un cadre
          visible tout autour de chaque photo. */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-t-2xl bg-white">
        <SmartImg
          className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.06]"
          src={product.imageA}
          alt={product.name}
          tone={idx}
        />
        {badge && (
          <span
            className={`${MONO} absolute top-1.5 left-1.5 rounded-sm border border-[#c6c2d8] ${PLASTIC_FACE} px-1.5 py-1 text-[0.8125rem] font-bold tracking-[0.04em] text-[#5b2fb8] uppercase ${PLASTIC}`}
          >
            {badge}
          </span>
        )}
        {sold && <span aria-hidden className="absolute inset-0 bg-white/50" />}
      </div>

      <div className="p-3">
        <h3 className={`${MONO} truncate text-[0.875rem] font-bold text-[#1E2430]`}>{product.name}</h3>
        <p className={`${MONO} mt-0.5 truncate text-[0.8125rem] tracking-[0.06em] text-[#6B7280] uppercase`}>
          {product.productType || product.meta || "Pièce unique"}
        </p>

        {/* Prix, taille et état côte à côte, toujours sur une seule ligne :
            avec `flex-wrap`, une pastille État longue passait seule à la
            ligne et poussait le bouton d'achat plus bas sur cette carte,
            décalant sa hauteur par rapport aux autres. Prix et taille
            restent en entier (`shrink-0`), seule la pastille État peut se
            tronquer si la carte est trop étroite pour tout afficher. */}
        <div className="mt-2 flex flex-nowrap items-center gap-1.5">
          {/* Mini écran LED : même famille que PRICE_TAG.SYS au-dessus. */}
          <div className={`lpi-crt relative shrink-0 overflow-hidden rounded-md border-2 border-[#2b2b3d] bg-black px-2 py-1 ${BEVEL_IN}`}>
            <span className="relative z-[2] flex items-baseline gap-1.5">
              <span className={`${LCD} text-[1.25rem] leading-none tracking-[0.02em]`} style={{ color: NEON, textShadow: `0 0 8px ${NEON}b3` }}>
                {product.price}€
              </span>
              {product.was && <s className={`${MONO} text-[0.8125rem] text-white/35`}>{product.was}€</s>}
            </span>
          </div>

          {product.sizes.length > 0 && (
            <span
              className={`${MONO} shrink-0 rounded-md border border-[#c6c2d8] ${PLASTIC_FACE} px-2 py-1.5 text-[0.8125rem] font-bold tracking-[0.04em] text-[#3b3550] uppercase ${PLASTIC}`}
            >
              📏 {product.sizes.join(" / ")}
            </span>
          )}
          {product.etat && (
            <span
              className={`${MONO} hidden min-w-0 truncate rounded-md border border-[#c6c2d8] ${PLASTIC_FACE} px-2 py-1.5 text-[0.8125rem] font-bold tracking-[0.04em] text-[#3b3550] uppercase sm:inline-block ${PLASTIC}`}
            >
              💎 {stripEtatWord(product.etat) || product.etat}
            </span>
          )}
        </div>

        <div className="mt-2.5 flex items-stretch gap-1.5">
          <button
            type="button"
            onClick={add}
            disabled={sold}
            className={`${MONO} flex-1 rounded-md border-b-[3px] px-1.5 py-1 text-[0.75rem] whitespace-nowrap sm:px-2 sm:py-1.5 sm:text-[1rem] font-black tracking-[0.04em] text-white uppercase transition active:translate-y-[3px] active:border-b-0 active:shadow-none disabled:cursor-not-allowed disabled:opacity-45 disabled:active:translate-y-0 ${
              added ? "border-[#0f5c26] bg-gradient-to-b from-[#4fbe84] to-[#1B8A3C]" : "border-[#7a0a52] bg-gradient-to-b from-[#ff5ec4] to-[#c3128a]"
            }`}
            style={{ boxShadow: "0 3px 0 rgba(0,0,0,0.18)" }}
          >
            {sold ? "[ SOLD ]" : added ? "[ ✓ OK ]" : "[ + CART ]"}
          </button>
          <button
            type="button"
            onClick={toggleFav}
            disabled={sold}
            aria-label={sold ? "Épuisé" : fav ? "Retirer de la wishlist" : "Ajouter à la wishlist"}
            aria-pressed={fav}
            className={`flex w-9 shrink-0 items-center justify-center rounded-md border-b-[3px] transition active:translate-y-[3px] active:border-b-0 active:shadow-none disabled:cursor-not-allowed disabled:opacity-45 ${
              fav ? "border-[#7a0a52] bg-gradient-to-b from-[#ff9ee4] to-[#d3016d] text-white" : `border-[#8b87a3] ${PLASTIC_FACE} text-[#6B7280]`
            }`}
            style={{ boxShadow: "0 3px 0 rgba(0,0,0,0.18)" }}
          >
            {fav ? <Icon.heart width={13} height={13} /> : <Icon.heartO width={13} height={13} />}
          </button>
        </div>
      </div>
    </>
  );

  // Vendue = fiche introuvable (404) : inutile de faire pointer la suggestion
  // vers un lien mort, on rend simplement la carte non cliquable.
  return sold ? (
    <div className={cardClassName}>{cardContent}</div>
  ) : (
    <Link href={`/products/${product.handle}`} className={cardClassName}>
      {cardContent}
    </Link>
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
  const etat = (product.etat && stripEtatWord(product.etat)) || "Non renseigné";
  /* Shopify renvoie des identifiants de collection (« manteaux-et-vestes »),
     alors que les traductions sont rangées par clé de rayon (« outerwear ») :
     sans ce passage par CATEGORIES, la pastille RAYON affichait le handle brut,
     tirets compris. */
  const deptKey = product.collections
    .map((handle) => CATEGORIES.find((c) => c.handle === handle)?.catKey)
    .find(Boolean);
  const dept = deptKey ? (t.cat[deptKey] ?? deptKey) : (product.collections[0] ?? null);

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
  const detailsHtml = sections.find((s) => s.label === "Les détails de la pépite")?.content ?? "";
  const moodHtml = sections
    .filter((s) => s.label !== "Info Mannequin & Fit" && s.label !== "Les détails de la pépite")
    .map((s) => s.content)
    .join("");
  const fitHtml = sections.find((s) => s.label === "Info Mannequin & Fit")?.content ?? "";

  const logTabs = [
    {
      file: "DETAILS_&_PEPITE.SYS",
      icon: "📂",
      body: detailsHtml ? (
        <div dangerouslySetInnerHTML={{ __html: detailsHtml }} />
      ) : (
        <p>Aucun détail renseigné pour cette pièce.</p>
      ),
    },
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

        <div className="relative z-[1] mx-auto w-full max-w-[1400px] px-4 pt-[calc(72px+clamp(16px,2.4vw,28px))] pb-[clamp(24px,4vw,48px)] sm:px-6">
          <button
            type="button"
            onClick={() => router.back()}
            className={`${MONO} mb-4 inline-flex items-center gap-1.5 rounded-md border border-[#c6c2d8] ${PLASTIC_FACE} px-3 py-1.5 text-[0.8125rem] font-bold text-[#262626] uppercase transition hover:brightness-105 ${PLASTIC} ${PLASTIC_PRESS}`}
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
                <span key={m} className={`${MONO} text-[0.8125rem] tracking-[0.06em] text-[#3b3550] uppercase`}>
                  {m}
                </span>
              ))}
            </div>

            {/* Barre d'adresse */}
            <div className="flex items-center gap-2 border-b border-[#c6c2d8] bg-[#f0eef7] px-3 py-2">
              <span className={`${MONO} shrink-0 text-[0.8125rem] tracking-[0.14em] text-[#6B7280] uppercase`}>
                Adresse
              </span>
              <span
                className={`${MONO} flex min-w-0 flex-1 items-center gap-1.5 rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-[0.8125rem] tracking-[0.04em] text-[#1E2430] ${BEVEL_IN}`}
              >
                <Icon.folder width={14} height={12} className="shrink-0" />
                <span className="truncate">{`C:\\LIL_OG\\ITEMS\\${product.handle}`}</span>
              </span>
              <span
                className={`${MONO} shrink-0 rounded-full border border-[#c6c2d8] ${PLASTIC_FACE} px-3 py-1.5 text-[0.8125rem] font-bold text-[#262626] ${PLASTIC}`}
              >
                [ OK ]
              </span>
            </div>

            {/* ---- Corps : galerie + specs ---- */}
            <div className="grid grid-cols-1 gap-6 p-4 lg:grid-cols-2 lg:gap-8 lg:p-6">
              {/* LIL_OG_PHOTO_VIEWER */}
              <ProductGallery images={product.images} name={product.name} />

              {/* ITEM_STATS.SYS : colonne en flex, empilement simple : depuis
                  que SYSTEM_LOGS est une pile de menus déroulants, plus rien
                  ne s'étire pour rejoindre le bas du lecteur photo. */}
              <div className="flex min-w-0 flex-col">
                {/* Même alignement que le titre juste en dessous : centré sur
                    téléphone, où toute la colonne l'est, à gauche au bureau. */}
                <div className={`${MONO} mb-2 text-center text-[0.8125rem] font-bold tracking-[0.14em] text-[#5b2fb8] uppercase sm:text-left`}>
                  ▶ ITEM_STATS.SYS
                </div>

                {badge && (
                  <span
                    /* `self-center` : enfant d'une colonne flex, le jeton
                       s'étirerait sinon sur toute la largeur au lieu de rester
                       une pastille. `sm:self-start` le recale à gauche au
                       bureau, où le bloc reste justifié à gauche. */
                    className={`${MONO} mb-2 self-center rounded-sm border border-[#c6c2d8] ${PLASTIC_FACE} px-2 py-1 text-[0.8125rem] font-bold tracking-[0.06em] text-[#5b2fb8] uppercase sm:self-start ${PLASTIC}`}
                  >
                    {badge}
                  </span>
                )}

                {/* Même typo LCD que les titres de /category, /histoire,
                    /faq et /durabilite, le nom de la pièce parle le même
                    langage que le reste du site plutôt qu'une typo
                    brutaliste propre à cette page. */}
                <h1
                  className={`${LCD} text-center text-[clamp(1.6rem,3.6vw,2.6rem)] leading-[1.05] tracking-[0.02em] text-[#2a1266] uppercase sm:text-left`}
                >
                  {product.name}
                </h1>

                {/* Prix et caractéristiques sur une même rangée : l'afficheur
                    garde sa largeur naturelle (shrink-0), les trois pastilles
                    se partagent le reste. `items-stretch` les met à la hauteur
                    de l'afficheur. Sous 360px de place pour le groupe, colonne
                    étroite ou affichage en une colonne, il repasse dessous. */}
                {/* Centré sur téléphone, où le bloc est empilé sous les
                    photos et occupe toute la largeur de la fenêtre ; justifié à
                    gauche au bureau, où il forme la colonne de droite. */}
                <div className="mt-4 flex flex-wrap items-stretch justify-center gap-2 sm:justify-start">
                  {/* Écran LED : un vrai afficheur d'appareil : boîtier noir
                      encastré, libellé gravé, chiffres néon en typo LCD, prix
                      barré et remise logés dans le même bandeau plutôt que
                      dispersés à côté. */}
                  <div
                    className={`lpi-crt relative max-w-full shrink-0 overflow-hidden rounded-lg border-2 border-[#2b2b3d] bg-black px-4 py-2.5 ${BEVEL_IN}`}
                  >
                    <div className="relative z-[2] flex flex-wrap items-end gap-x-5 gap-y-1.5">
                      <div className="min-w-0">
                        <span
                          className={`${MONO} block text-[0.8125rem] font-bold tracking-[0.22em] text-white/70 uppercase`}
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
                            <s className={`${MONO} text-[0.9375rem] text-white/35`}>{product.was}€</s>
                          )}
                        </span>
                      </div>

                      {discount !== null && (
                        <span
                          className={`${LCD} shrink-0 rounded border border-[#5affa0]/50 px-2 py-0.5 text-[1.25rem] leading-none`}
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
                  {/* Sur téléphone, le groupe prend sa propre rangée sous
                      l'afficheur de prix (`w-full`).

                      Il obtenait ce passage à la ligne par un `min-w-[360px]`,
                      un plancher plus large que ce qui restait à côté du prix.
                      Mais ce plancher dépassait aussi le conteneur lui-même —
                      360px demandés pour 322 disponibles sur un écran de 390 —
                      et la rangée débordait par la droite, la pastille RAYON
                      venant mourir sur le bord de l'écran. `w-full` obtient le
                      même passage à la ligne sans jamais réclamer plus que la
                      place existante. Le plancher reste au bureau, où il
                      décide du moment où le groupe descend sous le prix. */}
                  <div className="flex w-full min-w-0 flex-wrap items-stretch justify-center gap-2 sm:w-auto sm:min-w-[360px] sm:flex-1 sm:justify-start">
                    <StatCell icon="📏" label="Taille" value={size} />
                    <StatCell icon="💎" label="État" value={etat} />
                    {dept && <StatCell icon="🗂️" label="Rayon" value={dept} />}
                  </div>
                </div>

                {/* Tailles disponibles. Même alignement que les pastilles
                    au-dessus : centré sur téléphone, à gauche au bureau. */}
                {hasVariants && product.variants.length > 1 && (
                  <div className="mt-3 flex flex-wrap justify-center gap-1.5 sm:justify-start">
                    {product.variants.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        disabled={!v.availableForSale}
                        onClick={() => setVariant(v)}
                        className={`${MONO} rounded-md border px-3 py-1.5 text-[0.8125rem] font-bold uppercase transition disabled:cursor-not-allowed disabled:opacity-35 disabled:line-through ${
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
                    className={`lpi-blink ${MONO} mt-4 inline-flex items-center gap-1.5 rounded-sm border border-amber-500 bg-amber-100 px-2.5 py-1.5 text-[0.8125rem] font-bold tracking-[0.04em] text-amber-800 uppercase`}
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
                    className={`${MONO} flex-1 rounded-lg border-b-4 border-[#7a0a52] px-4 py-3.5 text-[1rem] font-black tracking-[0.06em] text-white uppercase transition active:translate-y-1 active:border-b-0 active:shadow-none disabled:cursor-not-allowed disabled:opacity-45 disabled:active:translate-y-0 ${
                      added
                        ? "bg-gradient-to-b from-[#4fbe84] to-[#1B8A3C] border-[#0f5c26]"
                        : "bg-gradient-to-b from-[#ff5ec4] to-[#c3128a]"
                    }`}
                    style={{ boxShadow: "0 5px 0 rgba(0,0,0,0.18)" }}
                  >
                    {sold ? "[ × SOLD_OUT.SYS ]" : added ? "[ ✓ ADDED.OK ]" : "[ 🛒 ADD_TO_CART.EXE ]"}
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
                  <p className={`${MONO} mt-2.5 text-[0.8125rem] text-[#d4006e]`}>⚠ {addError}</p>
                )}

                {/* SYSTEM_LOGS : dans la colonne de droite, sous l'achat :
                    c'est lui qui occupe la hauteur laissée libre par le
                    lecteur photo, au lieu de s'étaler en pleine largeur
                    sous un grand vide. */}
                <SystemLogs tabs={logTabs} />
              </div>
            </div>

            {/* Barre d'état */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-b-2xl border-t-2 border-[#c6c2d8] bg-[#e9e7f2] px-3 py-2">
              <span className={`${MONO} text-[0.8125rem] tracking-[0.1em] text-[#3b3550] uppercase`}>
                1 objet · 100% one of one
              </span>
              <span className={`${MONO} text-[0.8125rem] tracking-[0.1em] text-[#6B7280] uppercase`}>
                {t.pdp.ref} {product.handle}
              </span>
            </div>
          </WindowFrame>

          {/* RECOMMENDED_COMBO.EXE : une seconde fenêtre sous la fiche, pas
              des cartes posées à même le décor : titre et suggestions tiennent
              dans le même bloc blanc, sans bandes de léopard entre elles.
              Le titre quitte donc le blanc néon (illisible sur fond clair)
              pour l'encre LCD des autres titres du site. */}
          {related.length > 0 && (
            <div className="mt-[clamp(20px,3vw,32px)]">
              <WindowFrame
                title={
                  <>
                    <span className="sm:hidden">RECOMMENDATION.EXE</span>
                    <span className="hidden sm:inline">C:\ LIL_OG \ RECOMMENDED_COMBO.EXE</span>
                  </>
                }
                icon={<Icon.folderOpen width={15} height={12} />}
                bodyStyle={{ backgroundColor: "#ffffff" }}
              >
                <div className="border-b border-[#d8d5e6] px-4 pt-5 pb-4 text-center sm:px-6">
                  <h2
                    className={`${LCD} text-[clamp(1.4rem,4.2vw,2.4rem)] leading-none tracking-[0.03em] text-[#2a1266] uppercase`}
                  >
                    🎮 SUGGESTED_STYLE_COMBO.EXE
                  </h2>
                </div>

                <div className="grid grid-cols-2 gap-[clamp(12px,2vw,20px)] px-4 py-4 sm:px-6 md:grid-cols-4">
                  {related.map((p, idx) => (
                    <ComboCard key={p.id} product={p} idx={idx} />
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-[#c6c2d8] bg-[#e9e7f2] px-3 py-2">
                  <span className={`${MONO} text-[0.8125rem] tracking-[0.1em] text-[#3b3550] uppercase`}>
                    {related.length} objet(s) suggéré(s)
                  </span>
                  <span className={`${MONO} text-[0.8125rem] tracking-[0.1em] text-[#6B7280] uppercase`}>
                    Pour aller avec
                  </span>
                </div>
              </WindowFrame>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
