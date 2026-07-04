"use client";

import { useState } from "react";
import { Nav } from "@/components/nav";
import { Drawer } from "@/components/drawer";
import { Hero } from "@/components/hero";
import { FeaturedDrops } from "@/components/featured-drops";
import { Lookbook } from "@/components/lookbook";
import { Editorial } from "@/components/editorial";
import { Footer } from "@/components/footer";
import type { Product } from "@/lib/shopify/types";

export function HomeShell({ products }: { products: Product[] }) {
  const [menu, setMenu] = useState(false);

  return (
    <>
      <Nav onMenu={() => setMenu(true)} />
      <Drawer open={menu} onClose={() => setMenu(false)} />
      <Hero />
      <main>
        <FeaturedDrops products={products} />
        <Lookbook />
        <Editorial />
      </main>
      <Footer />
    </>
  );
}
