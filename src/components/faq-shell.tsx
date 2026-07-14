"use client";

import { useState } from "react";
import Image from "next/image";
import { Nav } from "@/components/nav";
import { Drawer } from "@/components/drawer";
import { Footer } from "@/components/footer";

const FAQS = [
  {
    q: "Comment authentifiez-vous les pièces ?",
    a: "Chaque pièce est inspectée à la main par Louna, styliste de formation. Elle vérifie les étiquettes, les coutures, les matières et l'état général avant toute mise en vente. Aucune pièce douteuse ne passe — si on a un doute, on ne vend pas.",
  },
  {
    q: "Les pièces sont-elles nettoyées avant expédition ?",
    a: "Oui. Toutes les pièces sont nettoyées et préparées avant d'être expédiées. Tu reçois une pièce prête à porter, pas un article de fripe qui sent le grenier.",
  },
  {
    q: "Les tailles sont-elles fiables sur des pièces vintage ?",
    a: "Le vintage a ses propres codes : un L des années 90 peut correspondre à un M actuel. C'est pourquoi chaque fiche produit indique les mesures réelles de la pièce (tour de poitrine, longueur, épaules) — pas seulement la taille étiquetée. Mesure-toi et compare, c'est le seul moyen fiable.",
  },
  {
    q: "Puis-je retourner un article ?",
    a: "Oui, tu disposes de 14 jours calendaires à compter de la réception pour exercer ton droit de rétractation. L'article doit être non porté, non lavé et dans son état d'origine. Les frais de retour sont à ta charge. Consulte notre page Retours pour tous les détails.",
  },
  {
    q: "Combien de temps prend la livraison ?",
    a: "Compte 2 à 5 jours ouvrés pour la préparation, auxquels s'ajoutent les délais du transporteur (Colissimo ou Mondial Relay). Tu reçois un e-mail avec ton numéro de suivi dès l'expédition.",
  },
  {
    q: "Est-ce qu'une pièce peut être réservée ?",
    a: "Non. Chaque pièce est unique et disponible en premier arrivé, premier servi. Si tu hésites, quelqu'un d'autre peut l'acheter entre-temps — c'est la nature de la seconde main sélective. Pas de réservation, pas d'exception.",
  },
  {
    q: "Acceptez-vous le paiement en plusieurs fois ?",
    a: "Oui, le paiement en 3 ou 4 fois sans frais est disponible via Klarna ou Alma selon les montants, directement au moment du paiement.",
  },
  {
    q: "Puis-je vous vendre mes propres pièces ?",
    a: "Lil'OG n'est pas une plateforme de dépôt-vente pour le moment. La sélection est entièrement curatée par Louna. Si tu as des pièces exceptionnelles à proposer, envoie-nous un message à lilog.shop@gmail.com — on ne promet rien, mais on regarde.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="faq-item" onClick={() => setOpen(!open)}>
      <div className="faq-row">
        <span className="faq-question">{q}</span>
        <span className="faq-icon">{open ? "×" : "+"}</span>
      </div>
      <div className="faq-answer" style={{ maxHeight: open ? "400px" : "0px" }}>
        <p>{a}</p>
      </div>
    </div>
  );
}

export function FaqShell() {
  const [menu, setMenu] = useState(false);

  return (
    <>
      <Nav onMenu={() => setMenu(true)} forceSolid />
      <Drawer open={menu} onClose={() => setMenu(false)} />
      <main className="static-page">

        <div className="static-hero static-hero--light static-hero--bg" style={{ backgroundImage: "url('/leo.jpeg')" }}>
          <div className="static-hero-text">
            <p className="static-eyebrow">Aide</p>
            <h1 className="static-title">
              Questions<br />
              <em>fréquentes.</em>
            </h1>
          </div>
        </div>

        <div className="static-body faq-body">
          <div className="faq-main">
            <div className="faq-intro">
              <p className="faq-intro-sub">Des questions ? On a les réponses.</p>
            </div>

            <div className="faq-list">
              {FAQS.map((item) => (
                <FaqItem key={item.q} q={item.q} a={item.a} />
              ))}
            </div>

            <div className="faq-contact">
              <p>Tu ne trouves pas ta réponse ?</p>
              <a href="mailto:lilog.shop@gmail.com">lilog.shop@gmail.com →</a>
            </div>
          </div>

          <div className="faq-side-img">
            <Image
              src="/faq-side-img.png"
              alt=""
              width={260}
              height={500}
              style={{ width: "100%", height: "auto" }}
            />
          </div>
        </div>

      </main>
      <Footer />
    </>
  );
}
