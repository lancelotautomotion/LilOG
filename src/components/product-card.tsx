"use client";

import { useState } from "react";
import Link from "next/link";
import { SmartImg } from "@/components/smart-img";
import { Icon } from "@/components/icons";
import { useCart } from "@/lib/cart-context";
import type { Product } from "@/lib/shopify/types";

export function ProductCard({ product, idx }: { product: Product; idx: number }) {
  const { addItem } = useCart();
  const [fav, setFav] = useState(false);
  const [added, setAdded] = useState(false);
  const sold = product.tag === "SOLD";

  const add = (e: React.MouseEvent) => {
    e.preventDefault();
    if (sold) return;
    setAdded(true);
    addItem();
    setTimeout(() => setAdded(false), 1400);
  };

  const toggleFav = (e: React.MouseEvent) => {
    e.preventDefault();
    setFav(!fav);
  };

  return (
    <article className="card">
      <Link href={`/products/${product.handle}`} className="card-media">
        {product.tag && <span className={"card-tag" + (sold ? " sold" : "")}>{product.tag}</span>}
        <button className={"card-fav" + (fav ? " on" : "")} aria-label="Save" onClick={toggleFav}>
          {fav ? <Icon.heart /> : <Icon.heartO />}
        </button>
        <SmartImg className="img-a" src={product.imageA} alt={product.name} tone={idx} />
        <SmartImg className="img-b" src={product.imageB} alt={product.name} tone={idx + 1} />
        <button className={"quick-add" + (added ? " added" : "")} onClick={add} disabled={sold}>
          {sold ? "Sold out" : added ? "Added ✓" : "Quick add"}
        </button>
      </Link>
      <Link href={`/products/${product.handle}`} className="card-info">
        <div className="card-text">
          <div className="card-name">{product.name}</div>
          {product.meta && <div className="card-meta">{product.meta}</div>}
        </div>
        <div className="card-price">
          {product.was && <s>£{product.was}</s>}£{product.price}
        </div>
      </Link>
    </article>
  );
}
