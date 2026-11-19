import type { Metadata } from "next";

/* La page est un composant client : elle ne peut pas exporter de
   métadonnées. Ce layout, lui, est un composant serveur, et pose le titre
   et la description propres à la page (sans lui, elle héritait de ceux de
   l'accueil). */
export const metadata: Metadata = {
  title: "Politique de cookies · Lil'OG",
  description: "Les cookies utilisés par Lil'OG, leur durée de vie et comment gérer vos préférences.",
  alternates: { canonical: "./" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
