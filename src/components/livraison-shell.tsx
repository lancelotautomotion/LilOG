"use client";

import { useState } from "react";
import Image from "next/image";
import { Nav } from "@/components/nav";
import { Drawer } from "@/components/drawer";
import { Footer } from "@/components/footer";

export function LivraisonShell() {
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
              <span className="static-title-line1">
                Livraison &
                <Image
                  src="/livraison-hero-img.png"
                  alt=""
                  width={220}
                  height={150}
                  style={{ objectFit: "contain", width: "200px", height: "auto", display: "inline-block", verticalAlign: "top", marginTop: "-0.5em" }}
                  priority
                />
              </span>
              <em style={{ display: "block", marginTop: "-0.5em" }}>expédition.</em>
            </h1>
          </div>
        </div>

        <div className="static-body">

          <section className="static-section static-section--left">
            <h2>Délais de livraison</h2>
            <p>
              Chaque pièce Lil'OG est unique — une fois ta commande confirmée, nous la préparons avec soin avant
              de te l'envoyer. Compte <strong>2 à 5 jours ouvrés</strong> pour la préparation et l'expédition,
              auxquels s'ajoutent les délais du transporteur.
            </p>
            <p>
              En cas de retard exceptionnel, nous t'en informerons par e-mail dès que possible. Si le délai ne
              te convient plus, tu pourras annuler ta commande avant expédition et être intégralement remboursé·e.
            </p>
          </section>

          <section className="static-section static-section--right histoire-section--accent">
            <h2>Modes de livraison</h2>
            <p>
              Nous expédions via <strong>Colissimo</strong> (France) et <strong>Mondial Relay</strong> (France & Europe),
              avec numéro de suivi transmis par e-mail dès l'expédition.
            </p>
            <p>
              Les livraisons sont effectuées du lundi au vendredi, hors jours fériés. Aucune livraison le week-end.
            </p>
            <p>
              Pour toute demande de livraison express ou internationale hors zone standard, contacte-nous à
              <strong> lilog.shop@gmail.com</strong> avant de passer commande.
            </p>
          </section>

          <section className="static-section static-section--left">
            <h2>Frais de livraison</h2>
            <p>
              Les frais de livraison sont calculés en fonction du mode choisi et affichés clairement lors du
              passage de commande. <strong>Aucun frais caché.</strong>
            </p>
            <p>
              La livraison est offerte pour toute commande supérieure à <strong>150 €</strong> en France métropolitaine.
            </p>
          </section>

          <section className="static-section static-section--right histoire-section--accent">
            <h2>Suivi de commande</h2>
            <p>
              Un e-mail de confirmation t'est envoyé dès la validation de ta commande, puis un second avec
              ton numéro de suivi dès l'expédition du colis.
            </p>
            <p>
              En cas de non-réception dans les délais annoncés, contacte-nous à
              <strong> lilog.shop@gmail.com</strong> en précisant ton numéro de commande — nous faisons le
              nécessaire pour retrouver ton colis.
            </p>
          </section>

          <section className="static-section static-section--left" style={{ display: "flex", alignItems: "center", gap: "clamp(24px, 4vw, 60px)", maxWidth: "100%" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2>Colis endommagé ou manquant</h2>
              <p>
                Si ton colis arrive endommagé, <strong>signale-le immédiatement au transporteur</strong> et
                prends des photos avant d'ouvrir le colis. Envoie-nous ensuite ces photos à
                <strong> lilog.shop@gmail.com</strong> avec ton numéro de commande.
              </p>
              <p>
                Nous prenons en charge les litiges liés au transport et trouvons une solution rapide —
                renvoi ou remboursement — selon les cas.
              </p>
            </div>
            <Image
              src="/colis-img.png"
              alt=""
              width={200}
              height={200}
              style={{ flexShrink: 0, width: "clamp(140px, 16vw, 220px)", height: "auto" }}
            />
          </section>

        </div>
      </main>
      <Footer />
    </>
  );
}
