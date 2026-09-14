import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SelectionShell } from "@/components/selection-shell";
import { getCollectionProducts } from "@/lib/shopify/products";
import { isSelectionKey, selectionCollectionHandles } from "@/lib/private-selection";

/* ============================================================
   /selection/<clé> — la vitrine privée partagée aux influenceuses
   ------------------------------------------------------------
   Trois verrous, indépendants les uns des autres :

   1. L'ADRESSE. Le segment doit être exactement PRIVATE_SELECTION_KEY
      (variable d'environnement Vercel, jamais dans le dépôt, qui est
      public). Tout le reste tombe en 404 — le même 404 que n'importe
      quelle URL inconnue, qui ne laisse donc pas deviner que cette
      page existe.
   2. L'INDEXATION. `robots: noindex` ci-dessous, doublé de l'en-tête
      HTTP X-Robots-Tag (next.config.ts) et d'un Disallow dans
      robots.txt. Aucun lien du site ne pointe ici, et le plan de site
      ne la mentionne pas.
   3. LE CONTENU. Uniquement les pièces de la collection Shopify, rien
      du reste du catalogue.
   ============================================================ */

/* Pas de rendu statique : la validité du segment se juge à la requête,
   contre une variable d'environnement. Prérendre reviendrait à figer une
   réponse pour une clé que l'on ne connaît pas encore. */
export const dynamic = "force-dynamic";

/**
 * Métadonnées volontairement muettes : titre générique, aucune description,
 * aucune balise Open Graph. Un lien collé dans une story ou une messagerie
 * ne doit pas afficher un aperçu qui raconte le contenu de la vitrine.
 */
export const metadata: Metadata = {
  title: "Lil'OG",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

/** La collection, essayée sur chaque handle candidat ; le premier qui répond gagne. */
async function loadSelection() {
  for (const handle of selectionCollectionHandles()) {
    const collection = await getCollectionProducts(handle).catch(() => null);
    if (collection) return collection;
  }
  return null;
}

export default async function Page({ params }: { params: Promise<{ key: string }> }) {
  const { key: rawKey } = await params;

  if (!isSelectionKey(decodeURIComponent(rawKey))) notFound();

  const collection = await loadSelection();
  if (!collection) notFound();

  return <SelectionShell title={collection.title} products={collection.products} />;
}
