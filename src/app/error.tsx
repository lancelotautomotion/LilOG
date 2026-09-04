"use client";

import { useEffect } from "react";
import Link from "next/link";

/* ══════════════════════════════════════════════════════════════
   ERREUR_SYSTEME.EXE — filet sous les pages du site

   Sans ce fichier, une exception non rattrapée dans un composant
   serveur (Shopify injoignable, quota dépassé, requête GraphQL
   invalidée par un changement de version d'API) affichait l'écran
   d'erreur brut de Next : fond blanc, texte noir, hors charte, et
   sans aucun moyen de repartir.

   Styles en ligne à dessein. Une page d'erreur qui dépend de la
   feuille de style de l'application est fragile au moment précis
   où l'on a besoin qu'elle tienne. Les valeurs reprennent celles de
   globals.css (--y2k-titlebar, --dm-well, --dm-lcd) pour rester
   dans la charte sans en dépendre.
   ══════════════════════════════════════════════════════════════ */

const TITLEBAR = "linear-gradient(90deg, #3b1d8f 0%, #7147d4 45%, #ff3fb0 100%)";
const WELL = "#1b0f3a";
const LCD = "#5affa0";
const MONO = 'ui-monospace, "IBM Plex Mono", "Courier New", monospace';

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    /* Le digest est le seul lien entre ce que voit la visiteuse et la trace
       complète dans les logs Vercel : en production, Next remplace le
       message d'origine par un texte générique pour ne rien divulguer. */
    console.error("[error-boundary]", error.digest ?? "", error.message);
  }, [error]);

  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "#F7F8FC",
        color: "#1E2430",
        fontFamily: MONO,
      }}
    >
      <div
        style={{
          width: "min(620px, 100%)",
          background: "#d8d5e6",
          border: "3px solid #9b97b3",
          borderRadius: "10px",
          overflow: "hidden",
          boxShadow: "0 16px 40px rgba(30, 36, 48, 0.28)",
        }}
      >
        <div
          style={{
            background: TITLEBAR,
            padding: "8px 14px",
            color: "#fff",
            fontSize: "0.875rem",
            letterSpacing: "0.04em",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>ERREUR_SYSTEME.EXE</span>
          <span aria-hidden="true">×</span>
        </div>

        <div
          style={{
            margin: "14px",
            padding: "20px",
            background: WELL,
            color: LCD,
            borderTop: "3px solid #9b97b3",
            borderLeft: "3px solid #9b97b3",
            borderRight: "3px solid #fff",
            borderBottom: "3px solid #fff",
            fontSize: "0.875rem",
            lineHeight: 1.7,
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            alignItems: "flex-start",
          }}
        >
          <p style={{ margin: 0 }}>&gt; ERREUR : LA PAGE N&apos;A PAS PU SE CHARGER.</p>
          <p style={{ margin: 0 }}>&gt; La boutique est momentanément injoignable.</p>
          <p style={{ margin: 0 }}>&gt; Réessaie dans un instant, tes articles sont conservés.</p>
          {error.digest && (
            <p style={{ margin: 0, opacity: 0.55, fontSize: "0.75rem" }}>
              &gt; RÉF : {error.digest}
            </p>
          )}
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            padding: "0 14px 18px",
          }}
        >
          {/* `retry()` re-rend le segment sans recharger la page : sur une
              panne passagère, la visiteuse reprend là où elle en était. */}
          <button
            onClick={() => retry()}
            style={{
              cursor: "pointer",
              padding: "11px 20px",
              fontFamily: MONO,
              fontSize: "0.875rem",
              color: "#fff",
              border: "1px solid rgba(93, 11, 70, 0.55)",
              borderRadius: "999px",
              background:
                "linear-gradient(180deg, #ff9ee4 0%, #ff45b4 42%, #d61f8f 74%, #a6106b 100%)",
              boxShadow: "0 4px 0 #7d0f56",
            }}
          >
            RÉESSAYER.EXE →
          </button>

          <Link
            href="/"
            style={{
              padding: "11px 20px",
              fontFamily: MONO,
              fontSize: "0.875rem",
              color: "#1E2430",
              textDecoration: "none",
              border: "1px solid #c6c2d8",
              borderRadius: "999px",
              background: "linear-gradient(180deg, #fdfdff 0%, #ebe9f4 48%, #d3d0e1 100%)",
              boxShadow: "0 4px 0 #b9b5cb",
            }}
          >
            RETOUR_ACCUEIL.EXE
          </Link>
        </div>
      </div>
    </main>
  );
}
