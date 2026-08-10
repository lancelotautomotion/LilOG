import { HomeShell } from "@/components/home-shell";

/**
 * L'accueil (LIL_OG_DESKTOP.EXE) ne présente aucune grille de produits :
 * il n'a donc plus besoin d'interroger Shopify. Les pièces se découvrent
 * par la Dressing Machine ou par les dossiers de FILE_EXPLORER.SYS, qui
 * pointent sur /category/[handle].
 */
export default function Home() {
  return <HomeShell />;
}
