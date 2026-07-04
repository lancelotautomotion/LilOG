import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductDetail } from "@/components/product-detail";
import { getProductByHandle, getFeaturedProducts } from "@/lib/shopify/products";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProductByHandle(handle).catch(() => null);
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
  const { handle } = await params;
  const product = await getProductByHandle(handle).catch(() => null);
  if (!product) notFound();

  const featured = await getFeaturedProducts(6).catch(() => []);
  const related = featured.filter((p) => p.handle !== handle).slice(0, 4);

  return <ProductDetail product={product} related={related} />;
}
