import type { Metadata } from "next";

/* La page est un composant client : elle ne peut pas exporter de
   métadonnées. Ce layout, lui, est un composant serveur, et pose le titre
   et la description propres à la page (sans lui, elle héritait de ceux de
   l'accueil). */
export const metadata: Metadata = {
  title: "Conditions générales de vente · Lil'OG",
  description: "Conditions générales de vente de Lil'OG : commande, prix, paiement, livraison, rétractation et garanties.",
  alternates: { canonical: "./" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
