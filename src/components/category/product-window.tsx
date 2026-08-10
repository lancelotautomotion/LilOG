"use client";

/* ============================================================
   MEDIA_GRID — la fiche produit en fenêtre d'application
   ------------------------------------------------------------
   Chaque pièce du catalogue est une petite fenêtre : barre de
   titre bleue avec le nom tronqué et ses boutons [ _ ] [ ✖ ],
   visuel au ratio constant qui gagne en contraste au survol,
   stickers d'état collés dans les coins, et pied de fenêtre où
   le prix s'affiche en afficheur vert sur noir à côté du bouton
   d'ajout rapide.

   Deux présentations, même composant : `grid` (vignette) et
   `list` (rangée), pour la bascule [ 🗔 GRILLE ] / [ ☰ LISTE ].

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

export type ViewMode = "grid" | "list";

/* ---- Stickers d'état ---- */

type Sticker = { label: React.ReactNode; from: string; to: string; ink: string };

const HOT: Sticker = { label: "🔥 HOT", from: "#ffb03b", to: "#e8541b", ink: "#3d1400" };
const RARE: Sticker = { label: "💎 RARE", from: "#bfe9ff", to: "#4aa8e0", ink: "#06304d" };
const SOLD: Sticker = { label: "✖ SOLD", from: "#d8d5e6", to: "#8b87a3", ink: "#1e1a2e" };
const LOUNA_PICK: Sticker = {
  label: (
    <>
      ♡ COUP DE CŒUR
      <br />— LOUNA
    </>
  ),
  from: "#ffd0ec",
  to: "#ff45b4",
  ink: "#4d0029",
};

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
 * tout seul — aucun outil supplémentaire à construire pour elle.
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

function StickerChip({ sticker, className = "" }: { sticker: Sticker; className?: string }) {
  return (
    <span
      className={`${MONO} pointer-events-none absolute z-20 rounded-[5px] border border-black/25 px-1.5 py-[3px] text-[0.46rem] font-bold tracking-[0.06em] whitespace-nowrap uppercase ${PLASTIC} ${className}`}
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

function CardControl({ glyph, label }: { glyph: string; label: string }) {
  return (
    <span
      role="presentation"
      aria-label={label}
      title={label}
      className={`grid h-[15px] w-[18px] shrink-0 place-items-center rounded-[3px] border border-[#c6c2d8] ${PLASTIC_FACE} text-[0.55rem] leading-none font-bold text-[#262626] select-none ${PLASTIC}`}
    >
      {glyph}
    </span>
  );
}

/* ============================================================
   Fiche
   ============================================================ */

export function ProductWindow({
  product,
  idx,
  view = "grid",
}: {
  product: Product;
  idx: number;
  view?: ViewMode;
}) {
  const { addItem } = useCart();
  const { has, toggle } = useWishlist();
  const [added, setAdded] = useState(false);

  const fav = has(product.handle);
  const sold = product.tag === "SOLD" || !product.variantId;
  const href = `/products/${product.handle}`;
  const badge = primarySticker(product, sold);
  const pick = lounaPickSticker(product);
  const list = view === "list";

  const add = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (sold || !product.variantId) return;
    setAdded(true);
    await addItem(product.variantId, 1);
    setTimeout(() => setAdded(false), 1400);
  };

  const toggleFav = (e: React.MouseEvent) => {
    e.preventDefault();
    toggle({
      handle: product.handle,
      title: product.name,
      price: product.price,
      image: product.imageA,
      variantId: product.variantId,
    });
  };

  /* ---- Briques réutilisées par les deux présentations ---- */

  const media = (
    <Link
      href={href}
      className={`lde-media group/media relative block shrink-0 overflow-hidden bg-[#e7e5f1] ${BEVEL_IN} ${
        list ? "aspect-square w-[92px] sm:w-[120px]" : "aspect-[3/4] w-full"
      }`}
    >
      <SmartImg className="lde-img lde-img-a" src={product.imageA} alt={product.name} tone={idx} />
      <SmartImg className="lde-img lde-img-b" src={product.imageB} alt={product.name} tone={idx + 1} />

      {badge && <StickerChip sticker={badge} className="top-1.5 left-1.5 -rotate-3" />}
      {!list && pick && <StickerChip sticker={pick} className="right-1.5 bottom-1.5 rotate-2 text-center" />}
      {sold && <span className="pointer-events-none absolute inset-0 z-10 bg-white/45" />}
    </Link>
  );

  const price = (
    <span
      className={`${MONO} rounded bg-black px-2 py-1 text-[0.62rem] leading-none font-bold whitespace-nowrap text-green-400`}
      style={{ textShadow: "0 0 8px rgba(74,222,128,.55)" }}
    >
      {product.was && <s className="mr-1 text-green-400/45">€{product.was}</s>}€{product.price}
    </span>
  );

  const cartButton = (
    <button
      type="button"
      onClick={add}
      disabled={sold}
      aria-label={sold ? "Épuisé" : `Ajouter ${product.name} au panier`}
      className={`${MONO} shrink-0 rounded-md border border-[#c6c2d8] px-1.5 py-1.5 text-[0.46rem] font-bold tracking-[0.04em] whitespace-nowrap text-[#262626] uppercase transition disabled:cursor-not-allowed disabled:opacity-45 sm:px-2.5 sm:text-[0.52rem] ${
        added ? "bg-[linear-gradient(180deg,#d8ffe8_0%,#8ce8b4_48%,#4fbe84_100%)]" : PLASTIC_FACE
      } ${PLASTIC} ${sold ? "" : PLASTIC_PRESS} ${sold ? "" : "hover:brightness-105"}`}
    >
      {sold ? "[ ✖ SOLD ]" : added ? "[ ✓ OK ]" : "[ + CART ]"}
    </button>
  );

  const favButton = (
    <button
      type="button"
      onClick={toggleFav}
      aria-label={fav ? "Retirer de la wishlist" : "Ajouter à la wishlist"}
      aria-pressed={fav}
      className={`grid h-[26px] w-[24px] shrink-0 place-items-center rounded-md border border-[#c6c2d8] sm:w-[26px] ${PLASTIC_FACE} transition hover:brightness-105 ${PLASTIC} ${PLASTIC_PRESS} ${
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
        className={`${MONO} min-w-0 flex-1 truncate text-[0.52rem] font-bold tracking-[0.04em] text-white uppercase`}
      >
        {product.name}
      </span>
      <CardControl glyph="_" label="Réduire" />
      <CardControl glyph="✖" label="Fermer" />
    </div>
  );

  /* ---- Rangée (mode LISTE) ---- */

  if (list) {
    return (
      <article className="lde-card overflow-hidden rounded-lg border-2 border-[#b8b4cc] bg-[#f0f0f5] shadow-[4px_4px_0_rgba(24,12,58,0.45)]">
        {titleBar}
        {/* Trois colonnes à partir de sm — visuel, informations, actions —
            pour que la rangée se remplisse au lieu de s'étirer dans le vide. */}
        <div className="flex items-stretch gap-3 p-2.5">
          {media}

          <div className="flex min-w-0 flex-1 flex-col justify-between gap-2 py-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <Link href={href} className="min-w-0 sm:flex-1">
              <h3 className={`${MONO} truncate text-[0.72rem] font-bold text-[#1E2430]`}>{product.name}</h3>
              <p className={`${MONO} mt-1 truncate text-[0.52rem] tracking-[0.06em] text-[#6B7280] uppercase`}>
                {[product.productType, product.meta, ...product.sizes.slice(0, 4)]
                  .filter(Boolean)
                  .join("  ·  ") || "PIÈCE UNIQUE"}
              </p>
              {pick && (
                <span className="relative mt-2 hidden sm:inline-block">
                  <StickerChip sticker={pick} className="relative top-0 left-0 rotate-0 text-center" />
                </span>
              )}
            </Link>

            <div className="flex shrink-0 items-center gap-2">
              {price}
              {cartButton}
              {favButton}
            </div>
          </div>
        </div>
      </article>
    );
  }

  /* ---- Vignette (mode GRILLE) ---- */

  return (
    <article className="lde-card flex flex-col overflow-hidden rounded-lg border-2 border-[#b8b4cc] bg-[#f0f0f5] shadow-[4px_4px_0_rgba(24,12,58,0.45)]">
      {titleBar}

      <div className="p-1.5">{media}</div>

      <Link href={href} className="min-w-0 px-2.5 pb-1">
        <h3 className={`${MONO} truncate text-[0.62rem] font-bold text-[#1E2430]`}>{product.name}</h3>
        <p className={`${MONO} mt-0.5 truncate text-[0.48rem] tracking-[0.06em] text-[#6B7280] uppercase`}>
          {product.productType || product.meta || "Pièce unique"}
        </p>
      </Link>

      {/* Barre d'action : sur une carte de deux colonnes en mobile, la place
          est comptée — le pied passe à la ligne plutôt que de déborder. */}
      <div className="mt-auto flex flex-wrap items-center justify-between gap-1.5 border-t border-[#d8d5e6] bg-[#e9e7f2] px-2 py-2">
        {price}
        <span className="flex items-center gap-1.5">
          {cartButton}
          {favButton}
        </span>
      </div>
    </article>
  );
}
