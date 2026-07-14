"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n-context";
import { useCart } from "@/lib/cart-context";
import { Nav } from "@/components/nav";
import { Drawer } from "@/components/drawer";
import { Footer } from "@/components/footer";
import { Icon } from "@/components/icons";
import { ProductGallery } from "@/components/product-gallery";
import { ProductCard } from "@/components/product-card";
import type { Product, ProductDetail as ProductDetailType } from "@/lib/shopify/types";

const INTERNAL_TAGS = new Set(["new", "one-of-one", "1-of-1"]);

export function ProductDetail({ product, related }: { product: ProductDetailType; related: Product[] }) {
  const { t } = useLanguage();
  const { addItem } = useCart();
  const [menu, setMenu] = useState(false);
  const [added, setAdded] = useState(false);

  const hasVariants = product.variants.length > 0;
  const [variant, setVariant] = useState(() => product.variants.find((v) => v.availableForSale) ?? product.variants[0]);

  const sold = hasVariants ? !variant?.availableForSale : !product.available;
  const variantId = hasVariants ? (variant?.id ?? null) : product.defaultVariantId;
  const displayTags = product.tags.filter((tg) => !INTERNAL_TAGS.has(tg.toLowerCase())).slice(0, 6);
  const discount = product.was ? Math.round((1 - product.price / product.was) * 100) : null;

  const eyebrow = product.tag === "1 OF 1" ? t.pdp.unique : product.tag === "NEW" ? t.pdp.newIn : null;

  const add = async () => {
    if (sold || !variantId) return;
    setAdded(true);
    await addItem(variantId, 1);
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <>
      <Nav onMenu={() => setMenu(true)} forceSolid />
      <Drawer open={menu} onClose={() => setMenu(false)} />
      <main className="pdp">
        <Link className="pdp-back" href="/">
          <Icon.arrowL /> {t.pdp.back}
        </Link>

        <div className="pdp-row">
          <ProductGallery images={product.images} name={product.name} />

          <div className="pdp-info">
            {eyebrow && <div className="pdp-eyebrow">{eyebrow}</div>}
            <h1 className="pdp-title">{product.name}</h1>

            <div className="pdp-price-row">
              {product.was && <s>€{product.was}</s>}
              <span className="pdp-price-now">€{product.price}</span>
              {discount !== null && <span className="pdp-discount">-{discount}%</span>}
            </div>

            {product.etat && (
              <div className="pdp-tags">
                <span className="pdp-tag pdp-tag--etat">État : {product.etat}</span>
              </div>
            )}

            {hasVariants && (
              <div className="pdp-variants">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    className={"pdp-variant" + (variant?.id === v.id ? " on" : "")}
                    disabled={!v.availableForSale}
                    onClick={() => setVariant(v)}
                  >
                    {v.title}
                  </button>
                ))}
              </div>
            )}

            <button className={"pdp-add" + (added ? " added" : "")} onClick={add} disabled={sold || !variantId}>
              {sold ? t.pdp.soldOut : added ? t.pdp.added : t.pdp.addToCart}
            </button>

            {product.descriptionHtml && (
              <div className="pdp-desc" dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
            )}

            <div className="pdp-accordion">
              <details className="pdp-acc-item">
                <summary>{t.pdp.detailsH} <Icon.chevD className="chev" /></summary>
                <div className="pdp-acc-body">{t.pdp.detailsBody}</div>
              </details>
              <details className="pdp-acc-item">
                <summary>{t.pdp.shippingH} <Icon.chevD className="chev" /></summary>
                <div className="pdp-acc-body">{t.pdp.shippingBody}</div>
              </details>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div className="pdp-cross">
            <h3>{t.pdp.completeLook}</h3>
            <div className="drops-grid">
              {related.map((p, idx) => (
                <ProductCard key={p.id} product={p} idx={idx} />
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
