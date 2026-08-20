import { HomeShell } from "@/components/home-shell";
import { getFeaturedProducts } from "@/lib/shopify/products";

/**
 * L'accueil (LIL_OG_DESKTOP.EXE) ne présente pas de grille de produits
 * classique : les pièces se découvrent surtout par la Dressing Machine ou
 * par les dossiers de FILE_EXPLORER.SYS, qui pointent sur
 * /category/[handle]. Seul le Cover Flow PLAYLIST_HIGHLIGHTS.EXE interroge
 * Shopify, pour la sélection mise en avant.
 */
export default async function Home() {
  const highlights = await getFeaturedProducts(10).catch(() => []);
  return <HomeShell highlights={highlights} />;
}
