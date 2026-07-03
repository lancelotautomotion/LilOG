"use client";

import { useLanguage } from "@/lib/i18n-context";
import { Icon } from "@/components/icons";
import { ProductCard } from "@/components/product-card";
import type { Product } from "@/lib/shopify/types";

export function FeaturedDrops({ products }: { products: Product[] }) {
  const { t } = useLanguage();

  if (products.length === 0) return null;

  return (
    <section className="section" id="drops">
      <div className="section-head">
        <div>
          <div className="eyebrow">{t.drops.eyebrow}</div>
          <h2 className="section-title">{t.drops.title}</h2>
        </div>
        <a className="link-arrow" href="#drops">{t.drops.shopAll} <Icon.upRight /></a>
      </div>
      <div className="drops-grid">
        {products.map((p, idx) => (
          <ProductCard key={p.id} product={p} idx={idx} />
        ))}
      </div>
    </section>
  );
}
