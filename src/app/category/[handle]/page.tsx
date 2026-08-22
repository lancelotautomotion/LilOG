import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";
import { CategoryPage } from "@/components/category-page";
import { getCollectionProducts } from "@/lib/shopify/products";
import { CATEGORIES, CAT_VIBES } from "@/lib/categories";

const SITE_URL = "https://lilog.shop";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle: rawHandle } = await params;
  const handle = decodeURIComponent(rawHandle);
  const collection = await getCollectionProducts(handle).catch(() => null);
  if (!collection) return { title: "Lil'OG" };

  const known = CATEGORIES.find((c) => c.handle === handle);
  const vibe = known ? CAT_VIBES[known.catKey] : undefined;
  const title = `${collection.title} · Lil'OG`;
  const description = vibe?.desc;
  /* Canonical pointe toujours vers l'URL de base du rayon : les variantes
     filtrées (`?sub=...`) partagent le même contenu et ne doivent pas être
     traitées comme des pages distinctes par Google. */
  const canonical = `${SITE_URL}/category/${handle}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "Lil'OG",
      locale: "fr_FR",
      type: "website",
    },
  };
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ handle: string }>;
  searchParams: Promise<{ sub?: string }>;
}) {
  const { handle: rawHandle } = await params;
  const { sub } = await searchParams;
  const handle = decodeURIComponent(rawHandle);

  const known = CATEGORIES.find((c) => c.handle === handle);
  if (!known) notFound();

  const collection = await getCollectionProducts(handle).catch(() => null);
  if (!collection) notFound();

  return (
    <Suspense>
      <CategoryPage catKey={known.catKey} products={collection.products} sub={sub} />
    </Suspense>
  );
}
