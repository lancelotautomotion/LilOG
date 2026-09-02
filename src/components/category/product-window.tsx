"use client";

/* ============================================================
   MEDIA_GRID : la fiche produit en fenêtre d'application
   ------------------------------------------------------------
   Chaque pièce du catalogue est une petite fenêtre : barre de
   titre bleue avec le nom tronqué et ses boutons [ _ ] [ × ],
   visuel au ratio constant qui gagne en contraste au survol,
   stickers d'état collés dans les coins, et pied de fenêtre où
   le prix s'affiche en afficheur vert sur noir à côté du bouton
   d'ajout rapide.

   ⚠ PAREFEU : Tailwind + feuille locale préfixée `lde-`, servie
   une seule fois par la page. Aucune classe de globals.css.
   ============================================================ */

import { useState } from "react";
import Link from "next/link";
import { SmartImg } from "@/components/smart-img";
import { Icon } from "@/components/icons";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/hooks/use-wishlist";
import { BEVEL_IN, MONO, NAVY_BAR, PLASTIC, PLASTIC_FACE, PLASTIC_PRESS } from "@/components/y2k/kit";
import type { Product } from "@/lib/shopify/types";

/* Bascule A/B des visuels + soulèvement de la fenêtre au survol : toute
   page qui rend <ProductWindow> doit servir cette feuille (une seule fois),
   sans quoi les deux photos (imageA/imageB) restent empilées en flux normal
   au lieu de se superposer — la seconde reste visible sous la première,
   coupée par overflow-hidden. */
export const PRODUCT_WINDOW_CSS = `
/* ---- Visuels des fiches : bascule A/B, contraste au survol ---- */
.lde-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;
  transition:opacity 420ms ease, transform 560ms ease, filter 320ms ease}
.lde-img-b{opacity:0}
/* Bascule A/B réservée aux pointeurs fins (souris) : sur tactile, :hover
   reste « collé » après un tap tant qu'on ne touche pas ailleurs, ce qui
   fige le fondu enchaîné à mi-parcours (les deux photos apparaissent alors
   mélangées, surtout là où elles diffèrent le plus, ex. un plan large vs
   un gros plan). */
@media (hover: hover) and (pointer: fine) {
  .lde-media:hover .lde-img-a{opacity:0}
  .lde-media:hover .lde-img-b{opacity:1}
  .lde-media:hover .lde-img{transform:scale(1.06);filter:contrast(1.18) saturate(1.06)}
}

/* ---- La fenêtre-fiche se soulève ---- */
.lde-card{transition:transform 180ms ease, box-shadow 180ms ease}
.lde-card:hover{transform:translateY(-3px);box-shadow:7px 9px 0 rgba(24,12,58,.5)}

@media (prefers-reduced-motion: reduce){
  .lde-img,.lde-card{transition:none}
}
`;

/* ---- Stickers d'état ---- */

type Sticker = { label: React.ReactNode; from: string; to: string; ink: string };

const HOT: Sticker = { label: "🔥 HOT", from: "#ffb03b", to: "#e8541b", ink: "#3d1400" };
const RARE: Sticker = { label: "💎 RARE", from: "#bfe9ff", to: "#4aa8e0", ink: "#06304d" };
const SOLD: Sticker = { label: "× SOLD", from: "#d8d5e6", to: "#8b87a3", ink: "#1e1a2e" };
/* Même gris « chunky plastic » que les boutons [ _ ] [ × ] du header de
   fiche : un badge éditorial n'a pas besoin de crier plus fort qu'un état
   du produit (HOT, RARE, SOLD), qui gardent eux leurs couleurs vives. */
const LOUNA_PICK: Sticker = { label: "💗 Coup de cœur", from: "#fdfdff", to: "#d3d0e1", ink: "#262626" };

/** Le sticker du coin haut : l'état de la pièce prime sur tout le reste. */
function primarySticker(product: Product, sold: boolean): Sticker | null {
  if (sold) return SOLD;
  if (product.tag === "1 OF 1") return RARE;
  if (product.tag === "NEW" || product.was) return HOT;
  return null;
}

/**
 * Le sticker du coin bas est un choix éditorial, pas un état automatique :
 * Louna tague la fiche "coup de cœur" (ou "louna-pick") dans l'admin
 * Shopify, insensible aux accents/à la casse/aux tirets, et le badge sort
 * tout seul : aucun outil supplémentaire à construire pour elle.
 */
function isLounaPick(product: Product): boolean {
  return product.tags.some((tag) => {
    const n = tag.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z]/g, "");
    return n === "coupdecoeur" || n === "coupdecoeurdelouna" || n === "lounapick";
  });
}

function lounaPickSticker(product: Product): Sticker | null {
  return isLounaPick(product) ? LOUNA_PICK : null;
}

/* ---- Pastilles du pied de fiche ----
   Prix, taille, [ + CART ] et le cœur forment une seule rangée : sans
   gabarit commun, chacune se réglait sur son propre contenu — le bouton
   panier héritait de l'interligne du corps de page et dépassait les autres
   de huit pixels, la pastille de taille gagnait ses deux pixels de bordure —
   et le pied partait en escalier. Une hauteur fixe, un corps de texte
   commun, un centrage commun : les quatre s'alignent quel que soit leur
   contenu. */
const CHIP_H = "h-[26px]";
const CHIP_BASE =
  `${CHIP_H} inline-flex items-center justify-center text-[0.75rem] leading-none ` +
  "font-bold whitespace-nowrap";

function StickerChip({
  sticker,
  className = "",
  smallOnMobile = false,
}: {
  sticker: Sticker;
  className?: string;
  /** Réduit le badge sur mobile : utile pour "💗 Coup de cœur", le seul
   *  libellé assez long pour risquer de dépasser (et donc d'être coupé par
   *  l'`overflow: hidden` du média) sur une carte à deux colonnes. Les
   *  autres badges (HOT, RARE, SOLD) sont déjà courts, pas besoin d'y toucher. */
  smallOnMobile?: boolean;
}) {
  return (
    <span
      className={`${MONO} pointer-events-none absolute z-20 rounded-[5px] border border-black/25 font-bold tracking-[0.06em] whitespace-nowrap uppercase ${PLASTIC} ${
        smallOnMobile ? "px-1 py-[2px] text-[0.6875rem] sm:px-1.5 sm:py-[3px] sm:text-[0.8125rem]" : "px-1.5 py-[3px] text-[0.8125rem]"
      } ${className}`}
      style={{
        background: `linear-gradient(180deg, ${sticker.from} 0%, ${sticker.to} 100%)`,
        color: sticker.ink,
        textShadow: "0 1px 0 rgba(255,255,255,0.45)",
      }}
    >
      {sticker.label}
    </span>
  );
}

/* ---- Boutons de contrôle de la fiche ---- */

function CardControl({ glyph, label }: { glyph: React.ReactNode; label: string }) {
  return (
    <span
      role="presentation"
      aria-label={label}
      title={label}
      className={`grid h-[15px] w-[18px] shrink-0 place-items-center rounded-[3px] border border-[#c6c2d8] ${PLASTIC_FACE} text-[0.8125rem] leading-none font-bold text-[#262626] select-none ${PLASTIC}`}
    >
      {glyph}
    </span>
  );
}

/** Trait de « Réduire », dessiné plutôt qu'écrit : le caractère « _ » loge
 *  son encre tout en bas de sa boîte de ligne, un centrage flex/grid ne
 *  centre que la boîte — dans un bouton de 15px la barre se retrouvait
 *  collée au bord inférieur. Même correctif que MaximizeGlyph pour « 🗖 ». */
function MinimizeGlyph() {
  return <span aria-hidden className="block h-[1.5px] w-[8px] rounded-full bg-current" />;
}

/* ============================================================
   Fiche
   ============================================================ */

export function ProductWindow({ product, idx }: { product: Product; idx: number }) {
  const { addItem } = useCart();
  const { has, toggle } = useWishlist();
  const [added, setAdded] = useState(false);

  const fav = has(product.handle);
  const sold = product.tag === "SOLD" || !product.variantId;
  const href = `/products/${product.handle}`;
  const badge = primarySticker(product, sold);
  const pick = lounaPickSticker(product);

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
    toggle({
      handle: product.handle,
      title: product.name,
      price: product.price,
      image: product.imageA,
      variantId: product.variantId,
    });
  };

  /* ---- Briques réutilisées par les deux présentations ---- */

  const mediaClassName = `lde-media group/media relative block shrink-0 overflow-hidden bg-[#e7e5f1] aspect-[3/4] w-full ${BEVEL_IN}`;
  const mediaContent = (
    <>
      <SmartImg className="lde-img lde-img-a" src={product.imageA} alt={product.name} tone={idx} />
      <SmartImg className="lde-img lde-img-b" src={product.imageB} alt={product.name} tone={idx + 1} />

      {badge && <StickerChip sticker={badge} className="top-1.5 left-1.5 -rotate-3" />}
      {pick && <StickerChip sticker={pick} className="right-1.5 bottom-1.5 rotate-2" smallOnMobile />}
      {sold && <span className="pointer-events-none absolute inset-0 z-10 bg-white/45" />}
    </>
  );
  // Vendue = fiche introuvable (404) : inutile de faire pointer la fenêtre
  // vers un lien mort, on rend simplement le média/titre non cliquables.
  const media = sold ? (
    <div className={mediaClassName}>{mediaContent}</div>
  ) : (
    <Link href={href} className={mediaClassName}>
      {mediaContent}
    </Link>
  );

  const price = (
    <span
      className={`${MONO} ${CHIP_BASE} shrink-0 rounded bg-black px-1.5 text-green-400`}
      style={{ textShadow: "0 0 8px rgba(74,222,128,.55)" }}
    >
      {product.was && <s className="mr-1 text-[0.75rem] text-green-400/45">{product.was}€</s>}{product.price}€
    </span>
  );

  /* Taille posée à côté du prix : c'est le premier critère de tri d'une
     friperie, et l'ouvrir fiche par fiche pour le connaître n'a pas de sens.
     Rien pour les pièces sans taille (sacs, bijoux), « TU » n'apprendrait
     rien. Au-delà de trois tailles, la liste est coupée à la source.

     `shrink-0` : la pastille ne cède plus de terrain. Elle le faisait, et
     comme `CHIP_BASE` centre son contenu, la comprimer ne produisait pas
     une ellipse mais un rognage des DEUX côtés — sur une carte de 202px on
     lisait « / », le milieu de « 📏 XS / S / M ». C'est désormais la barre
     d'action qui passe à deux rangées quand la place manque, et plus la
     taille qui s'efface. `justify-start` et `max-w-full` restent le
     garde-fou du cas extrême, où l'ellipse tombe alors au bon endroit. */
  const sizeChip = product.sizes.length > 0 && (
    <span
      className={`${MONO} ${CHIP_BASE} max-w-full shrink-0 justify-start truncate rounded border border-[#c6c2d8] px-1 text-[#3b3550] uppercase ${PLASTIC_FACE} ${PLASTIC}`}
      title={`Taille ${product.sizes.join(" / ")}`}
    >
      📏 {product.sizes.slice(0, 3).join(" / ")}
      {product.sizes.length > 3 && "…"}
    </span>
  );

  const cartButton = (
    <button
      type="button"
      onClick={add}
      disabled={sold}
      aria-label={sold ? "Épuisé" : `Ajouter ${product.name} au panier`}
      className={`${MONO} ${CHIP_BASE} grow rounded-md border border-[#c6c2d8] px-1.5 text-[#262626] uppercase transition disabled:cursor-not-allowed disabled:opacity-45 ${
        added ? "bg-[linear-gradient(180deg,#d8ffe8_0%,#8ce8b4_48%,#4fbe84_100%)]" : PLASTIC_FACE
      } ${PLASTIC} ${sold ? "" : PLASTIC_PRESS} ${sold ? "" : "hover:brightness-105"}`}
    >
      {sold ? "[×SOLD]" : added ? "[✓ OK]" : "[+CART]"}
    </button>
  );

  const favButton = (
    <button
      type="button"
      onClick={toggleFav}
      disabled={sold}
      aria-label={sold ? "Épuisé" : fav ? "Retirer de la wishlist" : "Ajouter à la wishlist"}
      aria-pressed={fav}
      className={`${CHIP_H} grid w-[26px] shrink-0 place-items-center rounded-md border border-[#c6c2d8] ${PLASTIC_FACE} transition disabled:cursor-not-allowed disabled:opacity-45 ${sold ? "" : `hover:brightness-105 ${PLASTIC_PRESS}`} ${PLASTIC} ${
        fav ? "text-[#d3016d]" : "text-[#6B7280]"
      }`}
    >
      {fav ? <Icon.heart width={13} height={13} /> : <Icon.heartO width={13} height={13} />}
    </button>
  );

  const titleBar = (
    <div
      className="flex items-center gap-1.5 border-b-2 border-[#2a1370] px-1.5 py-1"
      style={{ background: NAVY_BAR }}
    >
      <Icon.folder width={12} height={10} className="shrink-0" />
      <span
        className={`${MONO} min-w-0 flex-1 truncate text-[0.8125rem] font-bold tracking-[0.04em] text-white uppercase`}
      >
        {product.name}
      </span>
      <CardControl glyph={<MinimizeGlyph />} label="Réduire" />
      <CardControl glyph="×" label="Fermer" />
    </div>
  );

  return (
    <article className="lde-card flex flex-col overflow-hidden rounded-lg border-2 border-[#b8b4cc] bg-[#f0f0f5] shadow-[4px_4px_0_rgba(24,12,58,0.45)]">
      {titleBar}

      <div className="p-1.5">{media}</div>

      {sold ? (
        <div className="min-w-0 px-2.5 pb-1">
          <h3 className={`${MONO} line-clamp-2 text-[1.125rem] leading-snug font-bold text-[#1E2430]`}>{product.name}</h3>
          <p className={`${MONO} mt-0.5 truncate text-[0.8125rem] tracking-[0.06em] text-[#6B7280] uppercase`}>
            {product.productType || product.meta || "Pièce unique"}
          </p>
        </div>
      ) : (
        <Link href={href} className="min-w-0 px-2.5 pb-1">
          <h3 className={`${MONO} line-clamp-2 text-[1.125rem] leading-snug font-bold text-[#1E2430]`}>{product.name}</h3>
          <p className={`${MONO} mt-0.5 truncate text-[0.8125rem] tracking-[0.06em] text-[#6B7280] uppercase`}>
            {product.productType || product.meta || "Pièce unique"}
          </p>
        </Link>
      )}

      {/* Barre d'action, deux rangées : informations puis actions.

          Elle tenait sur une seule, et les quatre pastilles n'y entraient
          pas : le pire cas — prix barré et trois tailles — demande 236px,
          que n'offrent ni un téléphone (153px sur un écran de 390) ni la
          colonne la plus étroite du bureau (198px en trois colonnes vers
          1024px). C'est la taille qui payait l'addition, et comme
          `CHIP_BASE` centre son contenu, la comprimer ne produisait pas une
          ellipse mais un rognage des DEUX côtés : sur une carte de 202px on
          lisait « / », le milieu de « 📏 XS / S / M ».

          Deux rangées pour TOUTES les cartes, et non seulement les étroites :
          replier au cas par cas laissait, dans une même ligne de la grille,
          la fiche en promotion sur deux rangées à côté de voisines sur une
          seule — les barres ne s'alignaient plus. Uniforme, donc, à toute
          largeur : prix et taille en haut, [+CART] étiré et le cœur en bas.
          Le bouton y gagne au passage une cible tactile digne de ce nom. */}
      <div className="mt-auto flex flex-col gap-1 border-t border-[#d8d5e6] bg-[#e9e7f2] px-1.5 py-2">
        <span className="flex min-w-0 flex-wrap items-center gap-1">
          {price}
          {sizeChip}
        </span>
        <span className="flex items-center gap-1">
          {cartButton}
          {favButton}
        </span>
      </div>
    </article>
  );
}
