import { Suspense } from "react";
import type { Metadata } from "next";
import { CategoryPage } from "@/components/category-page";
import { getAllProducts } from "@/lib/shopify/products";

export const metadata: Metadata = { title: "Tout le catalogue · Lil'OG" };

export default async function Page() {
  const products = await getAllProducts().catch(() => []);

  return (
    <Suspense>
      <CategoryPage catKey="all" products={products} />
    </Suspense>
  );
}
