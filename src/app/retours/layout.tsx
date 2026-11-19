import type { Metadata } from "next";

/* La page est un composant client : elle ne peut pas exporter de
   métadonnées. Ce layout, lui, est un composant serveur, et pose le titre
   et la description propres à la page (sans lui, elle héritait de ceux de
   l'accueil). */
export const metadata: Metadata = {
  title: "Retours & remboursements · Lil'OG",
  description: "Rétractation sous 14 jours, retours et remboursements : tout savoir pour renvoyer une pièce Lil'OG.",
  alternates: { canonical: "./" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
