"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n-context";
import { Nav } from "@/components/nav";
import { Drawer } from "@/components/drawer";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/product-card";
import type { Product } from "@/lib/shopify/types";

export function CategoryPage({ catKey, products }: { catKey: string; products: Product[] }) {
  const { t } = useLanguage();
  const [menu, setMenu] = useState(false);
  const label = t.cat[catKey] ?? catKey;

  return (
    <>
      <Nav onMenu={() => setMenu(true)} forceSolid />
      <Drawer open={menu} onClose={() => setMenu(false)} />
      <main className="category-page">
        <h1 className="category-title">{label}</h1>

        {products.length === 0 ? (
          <p className="category-empty">{t.category.empty}</p>
        ) : (
          <div className="drops-grid">
            {products.map((p, idx) => (
              <ProductCard key={p.id} product={p} idx={idx} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
