"use client";

import { useState } from "react";
import Link from "next/link";
import { SmartImg } from "@/components/smart-img";
import { Icon } from "@/components/icons";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/hooks/use-wishlist";
import type { Product } from "@/lib/shopify/types";

/* Grille `.drops-grid` : 4 colonnes, 2 en dessous de 1000 px. Décrire la
   place réelle évite au navigateur de télécharger la variante 1600 px pour
   une vignette de 177 px de large sur téléphone. */
const CARD_SIZES = "(max-width: 1000px) 48vw, 24vw";

export function ProductCard({ product, idx }: { product: Product; idx: number }) {
  const { addItem } = useCart();
  const { has, toggle } = useWishlist();
  const fav = has(product.handle);
  const [added, setAdded] = useState(false);
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

  const mediaContent = (
    <>
      {product.tag && <span className={"card-tag" + (sold ? " sold" : "")}>{product.tag}</span>}
      <button className={"card-fav" + (fav ? " on" : "")} aria-label="Save" onClick={toggleFav} disabled={sold}>
        {fav ? <Icon.heart /> : <Icon.heartO />}
      </button>
      <SmartImg className="img-a" src={product.imageA} alt={product.name} tone={idx} sizes={CARD_SIZES} />
      <SmartImg className="img-b" src={product.imageB} alt={product.name} tone={idx + 1} sizes={CARD_SIZES} />
      <button className={"quick-add" + (added ? " added" : "")} onClick={add} disabled={sold}>
        {sold ? "Sold out" : added ? "Added ✓" : "Quick add"}
      </button>
    </>
  );

  const infoContent = (
    <>
      <div className="card-text">
        <div className="card-name">{product.name}</div>
        {product.meta && <div className="card-meta">{product.meta}</div>}
      </div>
      <div className="card-price">
        {product.was && <s>{product.was}€</s>}{product.price}€
      </div>
    </>
  );

  return (
    <article className="card">
      {/* Win95 titlebar */}
      <div className="card-w95-bar">
        <span className="card-w95-title">{product.name}</span>
        <div className="card-w95-dots"><span /><span /><span /></div>
      </div>
      {/* Vendue = fiche introuvable (404) : inutile de faire pointer la carte
          vers un lien mort. */}
      {sold ? (
        <div className="card-media">{mediaContent}</div>
      ) : (
        <Link href={`/products/${product.handle}`} className="card-media">
          {mediaContent}
        </Link>
      )}
      {sold ? (
        <div className="card-info">{infoContent}</div>
      ) : (
        <Link href={`/products/${product.handle}`} className="card-info">
          {infoContent}
        </Link>
      )}
    </article>
  );
}
