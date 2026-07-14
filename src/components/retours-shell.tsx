"use client";

import { useState } from "react";
import Image from "next/image";
import { Nav } from "@/components/nav";
import { Drawer } from "@/components/drawer";
import { Footer } from "@/components/footer";

export function RetoursShell() {
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
                Retours &
                <Image
                  src="/retours-hero-img.png"
                  alt=""
                  width={220}
                  height={150}
                  style={{ objectFit: "contain", width: "200px", height: "auto", display: "inline-block", verticalAlign: "top", marginTop: "-0.5em" }}
                  priority
                />
              </span>
              <em style={{ display: "block", marginTop: "-0.5em" }}>remboursements.</em>
            </h1>
          </div>
        </div>

        <div className="static-body">

          <section className="static-section static-section--left">
            <h2>Ton droit de rétractation</h2>
            <p>
              Conformément aux articles L.221-18 et suivants du Code de la consommation, tu disposes d'un délai de
              <strong> 14 jours calendaires</strong> à compter de la réception de ta commande pour exercer ton droit
              de rétractation, sans avoir à justifier de motif.
            </p>
            <p>
              Pour exercer ce droit, contacte-nous avant l'expiration du délai à l'adresse :
              <strong> lilog.shop@gmail.com</strong> en précisant ton numéro de commande et le ou les articles concernés.
            </p>
          </section>

          <section className="static-section static-section--right histoire-section--accent" style={{ position: "relative" }}>
            <Image
              src="/metalik-sticker.png"
              alt=""
              width={160}
              height={160}
              style={{ position: "absolute", left: "-320px", top: "50%", transform: "translateY(-50%)", width: "220px", height: "auto", pointerEvents: "none" }}
            />
            <h2>Conditions de retour</h2>
            <p>
              Chaque pièce Lil'OG est unique et sélectionnée avec soin. Pour être accepté, tout article retourné doit être :
            </p>
            <ul className="static-list" style={{ textAlign: "left", marginTop: "16px" }}>
              <li>→ Dans son état d'origine, <strong>non porté et non lavé</strong></li>
              <li>→ Sans trace d'utilisation, d'odeur ou de détérioration</li>
              <li>→ Accompagné de ton numéro de commande</li>
            </ul>
            <p style={{ marginTop: "16px" }}>
              Tout article renvoyé ne respectant pas ces conditions sera refusé et retourné à l'expéditeur.
            </p>
          </section>

          <section className="static-section static-section--left">
            <h2>Frais de retour</h2>
            <p>
              Les <strong>frais de retour sont à la charge du client</strong>. Nous te recommandons d'utiliser un
              service de livraison avec suivi et assurance, car Lil'OG ne pourra être tenu responsable en cas de
              perte ou de détérioration du colis lors du transport retour.
            </p>
            <p>
              Adresse de retour :
            </p>
            <p style={{
              fontFamily: "var(--mono)",
              fontSize: "0.95rem",
              lineHeight: "1.8",
              marginTop: "8px",
              display: "inline-block",
              color: "#d4006e",
              fontWeight: 700,
              border: "2px solid #d4006e",
              borderRadius: "6px",
              padding: "14px 24px",
            }}>
              Lil'OG<br />
              26 rue Soubise<br />
              93400 Saint-Ouen-Sur-Seine<br />
              France
            </p>
          </section>

          <section className="static-section static-section--right histoire-section--accent">
            <h2>Remboursement</h2>
            <p>
              Dès réception et vérification de l'article, nous procédons au remboursement dans un délai de
              <strong> 14 jours maximum</strong>, via le moyen de paiement utilisé lors de la commande.
            </p>
            <p>
              Les frais de livraison initiaux ne sont pas remboursés, sauf en cas d'erreur de notre part ou
              d'article non conforme à sa description.
            </p>
          </section>

          <section className="static-section static-section--left" style={{ display: "flex", alignItems: "center", gap: "clamp(24px, 4vw, 60px)", maxWidth: "100%" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2>Exceptions</h2>
              <p>
                Conformément à l'article L.221-28 du Code de la consommation, le droit de rétractation ne s'applique
                pas aux articles qui ont été manifestement portés, altérés ou endommagés après réception.
              </p>
              <p>
                En cas de litige, tu peux contacter le médiateur de la consommation compétent ou la DGCCRF.
              </p>
            </div>
            <Image
              src="/exceptions-img.png"
              alt=""
              width={200}
              height={200}
              style={{ flexShrink: 0, width: "clamp(156px, 18vw, 260px)", height: "auto" }}
            />
          </section>

        </div>
      </main>
      <Footer />
    </>
  );
}
