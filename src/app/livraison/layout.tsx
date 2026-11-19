import type { Metadata } from "next";

/* La page est un composant client : elle ne peut pas exporter de
   métadonnées. Ce layout, lui, est un composant serveur, et pose le titre
   et la description propres à la page (sans lui, elle héritait de ceux de
   l'accueil). */
export const metadata: Metadata = {
  title: "Livraison · Lil'OG",
  description: "Délais, frais et suivi : livraison offerte dès 90 € en France métropolitaine, colis soigné et suivi.",
  alternates: { canonical: "./" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
