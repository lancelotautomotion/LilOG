import { HomeShell } from "@/components/home-shell";
import { getFeaturedProducts } from "@/lib/shopify/products";
import type { Product } from "@/lib/shopify/types";

export default async function Home() {
  let products: Product[] = [];
  try {
    products = await getFeaturedProducts(8);
  } catch (err) {
    // Shopify env vars not configured yet, or the API call failed —
    // render the homepage without the live product grid instead of crashing.
    console.warn("[shopify] featured products unavailable:", (err as Error).message);
  }

  return <HomeShell products={products} />;
}
