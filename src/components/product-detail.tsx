"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

export function ProductDetail({ product, related }: { product: ProductDetailType; related: Product[] }) {
  const { t } = useLanguage();
  const { addItem } = useCart();
  const router = useRouter();
  const [menu, setMenu] = useState(false);
  const [added, setAdded] = useState(false);
  const [liked, setLiked] = useState(false);

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
        <button className="pdp-back" onClick={() => router.back()}>
          <Icon.arrowL /> {t.pdp.back}
        </button>

        <div className="pdp-win">
          <div className="w95-bar">
            <span className="w95-title">{product.name}</span>
            <div className="w95-dots"><span /><span /><span /></div>
          </div>
        <div className="pdp-row">
          <ProductGallery images={product.images} name={product.name} />

          <div className="pdp-info">
            {eyebrow && <div className="pdp-eyebrow">{eyebrow}</div>}
            <h1 className="pdp-title">{product.name}</h1>

            <div className="pdp-price-row">
              {product.was && <s>{product.was}€</s>}
              <span className="pdp-price-now">{product.price}€</span>
              {discount !== null && <span className="pdp-discount">-{discount}%</span>}
            </div>

            <div className="pdp-tags">
              <span className="pdp-tag pdp-tag--etat">État : {product.etat ?? "Non renseigné"}</span>
              {(product.size ?? (product.variants.length > 0 && variant?.title)) && (
                <span className="pdp-tag pdp-tag--taille">
                  Taille : {variant?.title ?? product.size}
                </span>
              )}
            </div>

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

            <div className="pdp-add-row">
              <button className={"pdp-add" + (added ? " added" : "")} onClick={add} disabled={sold || !variantId}>
                <span style={{ position: "relative", zIndex: 1 }}>
                  {sold ? t.pdp.soldOut : added ? t.pdp.added : t.pdp.addToCart}
                </span>
              </button>
              <button className={"pdp-like" + (liked ? " on" : "")} onClick={() => setLiked((l) => !l)} aria-label="Ajouter aux favoris">
                <svg viewBox="0 0 24 24" width="22" height="22" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>
            </div>

            {product.descriptionHtml && (() => {
              const { sections } = parseDescription(product.descriptionHtml);
              const visible = sections.filter((s) => !s.accordion);
              const accordions = sections.filter((s) => s.accordion);
              return (
                <>
                  {visible.map((s, i) => s.content && (
                    <div key={i} className="pdp-desc" dangerouslySetInnerHTML={{ __html: s.content }} />
                  ))}
                  <div className="pdp-accordion">
                    {accordions.map(({ label, content }) => (
                      <details key={label} className="pdp-acc-item">
                        <summary><span /><span>{label}</span><Icon.chevD className="chev" /></summary>
                        <div className="pdp-acc-body pdp-desc" dangerouslySetInnerHTML={{ __html: content }} />
                      </details>
                    ))}
                    <details className="pdp-acc-item">
                      <summary><span /><span>{t.pdp.detailsH}</span><Icon.chevD className="chev" /></summary>
                      <div className="pdp-acc-body">{t.pdp.detailsBody}</div>
                    </details>
                    <details className="pdp-acc-item">
                      <summary><span /><span>{t.pdp.shippingH}</span><Icon.chevD className="chev" /></summary>
                      <div className="pdp-acc-body">{t.pdp.shippingBody}</div>
                    </details>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
        </div>{/* .pdp-win */}

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
