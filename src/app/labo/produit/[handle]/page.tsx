import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SpinProduct } from "@/components/labo/spin-product";
import { getProductByHandle } from "@/lib/shopify/products";

/* ============================================================
   /labo/produit/<handle> — BROUILLON, fiche produit « spin »
   ------------------------------------------------------------
   Page d'essai : la pièce au centre, qu'on fait tourner en la
   glissant, entre deux fenêtres Y2K flottantes. Ne remplace pas
   /products/<handle>, qui reste la fiche officielle.

   Non publique au sens « invisible » : aucun lien du site ne
   pointe ici, `noindex` ci-dessous, doublé de l'en-tête HTTP
   X-Robots-Tag (next.config.ts), d'un Disallow dans robots.txt,
   et absente du plan de site. Quiconque a l'URL peut l'ouvrir :
   elle n'affiche que ce que la fiche officielle montre déjà.
   ============================================================ */

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Lil'OG · Labo",
  robots: { index: false, follow: false, nocache: true },
};

export default async function LaboProductPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const product = await getProductByHandle(decodeURIComponent(handle)).catch(() => null);
  if (!product) notFound();
  return <SpinProduct product={product} />;
}
