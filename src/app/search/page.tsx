import type { Metadata } from "next";
import { SearchShell } from "@/components/search-shell";
import { searchProducts } from "@/lib/shopify/products";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const { q } = await searchParams;
  return { title: q ? `Recherche — ${q} — Lil'OG` : "Recherche — Lil'OG" };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const results = query ? await searchProducts(query).catch(() => []) : [];

  return <SearchShell query={query} results={results} />;
}
