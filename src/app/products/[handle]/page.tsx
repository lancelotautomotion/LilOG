import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductDetail } from "@/components/product-detail";
import { getProductByHandle, getFeaturedProducts, getCollectionProducts } from "@/lib/shopify/products";
import type { Product } from "@/lib/shopify/types";

const TOPS_HANDLES = ["tops"];
const BOTTOMS_HANDLES = ["jupes", "shorts-bermudas", "pantalons", "jeans"];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProductByHandle(decodeURIComponent(handle)).catch(() => null);
  if (!product) return { title: "Lil'OG" };
  const plainDescription = product.descriptionHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return {
    title: `${product.name} — Lil'OG`,
    description: plainDescription || undefined,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle: rawHandle } = await params;
  const handle = decodeURIComponent(rawHandle);
  const product = await getProductByHandle(handle).catch(() => null);
  if (!product) notFound();

  const isTops = product.collections.some((h) => TOPS_HANDLES.includes(h));
  const isBottoms = product.collections.some((h) => BOTTOMS_HANDLES.includes(h));

  let related: Product[] = [];

  if (isTops) {
    const results = await Promise.all(BOTTOMS_HANDLES.map((h) => getCollectionProducts(h, 10)));
    const all = results.flatMap((r) => r?.products ?? []).filter((p) => p.handle !== handle);
    related = all.sort(() => Math.random() - 0.5).slice(0, 4);
  } else if (isBottoms) {
    const result = await getCollectionProducts("tops", 10);
    const all = (result?.products ?? []).filter((p) => p.handle !== handle);
    related = all.sort(() => Math.random() - 0.5).slice(0, 4);
  } else {
    const featured = await getFeaturedProducts(8);
    related = featured.filter((p) => p.handle !== handle).slice(0, 4);
  }

  return <ProductDetail product={product} related={related} />;
}
