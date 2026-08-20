import { HomeShell } from "@/components/home-shell";
import { getLounaPicks } from "@/lib/shopify/products";

/**
 * L'accueil (LIL_OG_DESKTOP.EXE) ne présente pas de grille de produits
 * classique : les pièces se découvrent surtout par la Dressing Machine ou
 * par les dossiers de FILE_EXPLORER.SYS, qui pointent sur
 * /category/[handle]. Seul le Cover Flow PLAYLIST_HIGHLIGHTS.EXE interroge
 * Shopify, pour les dix coups de cœur de la semaine.
 */
export default async function Home() {
  const highlights = await getLounaPicks(10).catch(() => []);
  return <HomeShell highlights={highlights} />;
}
