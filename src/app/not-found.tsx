import Link from "next/link";
import type { Metadata } from "next";

/* 404 maison. Sans ce fichier, le `notFound()` des fiches produit et des
   rayons — celui qui répond aux pièces vendues, uniques par nature —
   affichait la page « This page could not be found » de Next : fond blanc,
   police système, aucun lien de retour.
   Styles en ligne, même raison que dans error.tsx. */

export const metadata: Metadata = { title: "Page introuvable · Lil'OG" };

const TITLEBAR = "linear-gradient(90deg, #3b1d8f 0%, #7147d4 45%, #ff3fb0 100%)";
const MONO = 'ui-monospace, "IBM Plex Mono", "Courier New", monospace';

export default function NotFound() {
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
          <span>404_INTROUVABLE.SYS</span>
          <span aria-hidden="true">×</span>
        </div>

        <div
          style={{
            margin: "14px",
            padding: "20px",
            background: "#1b0f3a",
            color: "#5affa0",
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
          <p style={{ margin: 0 }}>&gt; FICHIER INTROUVABLE.</p>
          <p style={{ margin: 0 }}>
            &gt; Cette pièce est peut-être déjà partie : chaque article est unique.
          </p>
          <p style={{ margin: 0 }}>&gt; Le reste de l&apos;archive t&apos;attend.</p>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", padding: "0 14px 18px" }}>
          <Link
            href="/catalogue"
            style={{
              padding: "11px 20px",
              fontFamily: MONO,
              fontSize: "0.875rem",
              color: "#fff",
              textDecoration: "none",
              border: "1px solid rgba(93, 11, 70, 0.55)",
              borderRadius: "999px",
              background:
                "linear-gradient(180deg, #ff9ee4 0%, #ff45b4 42%, #d61f8f 74%, #a6106b 100%)",
              boxShadow: "0 4px 0 #7d0f56",
            }}
          >
            TOUT_LE_CATALOGUE.EXE →
          </Link>

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
