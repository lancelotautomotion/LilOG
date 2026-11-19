import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArchiveProduct } from "@/components/labo/archive-product";
import { LAB_STAGE_SIZES } from "@/components/labo/stage-sizes";
import { fallbackSrc, imageSrcSet } from "@/lib/shopify/image-url";
import { getProductByHandle } from "@/lib/shopify/products";

/* ============================================================
   /labo/produit/<handle> — BROUILLON, fiche produit v2
   ------------------------------------------------------------
   Page d'essai de la refonte : photo d'abord, achat dans le
   premier écran, décor Y2K assumé sous l'achat. Remplace le
   brouillon « spin ». Ne remplace pas /products/<handle>, qui
   reste la fiche officielle.

   Invisible des moteurs : aucun lien du site ne pointe ici,
   `noindex` ci-dessous, doublé de l'en-tête HTTP X-Robots-Tag
   (next.config.ts), d'un Disallow dans robots.txt, et absente du
   plan de site. Quiconque a l'URL peut l'ouvrir : elle n'affiche
   que ce que la fiche officielle montre déjà.
   ============================================================ */

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Lil'OG · Labo",
  robots: { index: false, follow: false, nocache: true },
};

export default async function LaboProductPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const product = await getProductByHandle(decodeURIComponent(handle)).catch(() => null);
  // Même règle que la fiche officielle : une pièce vendue n'a plus de page.
  if (!product || !product.available) notFound();

  /* Première photo préchargée, avec exactement les `sizes` de la galerie,
     pour que le navigateur ne télécharge qu'une seule variante. */
  const firstPhoto = product.images[0];

  return (
    <>
      {firstPhoto && (
        <link
          rel="preload"
          as="image"
          href={fallbackSrc(firstPhoto)}
          imageSrcSet={imageSrcSet(firstPhoto)}
          imageSizes={LAB_STAGE_SIZES}
          fetchPriority="high"
        />
      )}
      <ArchiveProduct product={product} />
    </>
  );
}
