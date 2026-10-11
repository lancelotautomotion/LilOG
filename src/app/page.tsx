import { HomeShell } from "@/components/home-shell";
import { getLounaPicks } from "@/lib/shopify/products";

/**
 * L'accueil (LIL_OG_DESKTOP.EXE) ne présente pas de grille de produits
 * classique : les pièces se découvrent surtout par la Dressing Machine ou
 * par les dossiers de FILE_EXPLORER.SYS, qui pointent sur
 * /category/[handle]. Seule la rangée LOUNA_PICKS.EXE interroge
 * Shopify, pour toutes les pièces « Louna pick » encore disponibles.
 */
export default async function Home() {
  const highlights = await getLounaPicks().catch(() => []);
  return <HomeShell highlights={highlights} />;
}
