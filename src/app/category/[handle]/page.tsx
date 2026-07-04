import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CategoryPage } from "@/components/category-page";
import { getCollectionProducts } from "@/lib/shopify/products";
import { CATEGORIES } from "@/lib/categories";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const collection = await getCollectionProducts(decodeURIComponent(handle)).catch(() => null);
  return { title: collection ? `${collection.title} — Lil'OG` : "Lil'OG" };
}

export default async function Page({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle: rawHandle } = await params;
  const handle = decodeURIComponent(rawHandle);

  const known = CATEGORIES.find((c) => c.handle === handle);
  if (!known) notFound();

  const collection = await getCollectionProducts(handle).catch(() => null);
  if (!collection) notFound();

  return <CategoryPage catKey={known.catKey} products={collection.products} />;
}
