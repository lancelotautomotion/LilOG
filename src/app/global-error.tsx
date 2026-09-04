"use client";

/* Dernier filet : `error.tsx` n'attrape pas les erreurs du layout racine
   lui-même. Si `RootLayout` échoue (une police, un provider, le chargement
   initial du panier), c'est ce fichier qui prend la main.
   Il REMPLACE le layout racine : il doit donc porter ses propres <html> et
   <body>, et globals.css n'est pas chargé. D'où des styles entièrement en
   ligne — ici ce n'est pas une précaution, c'est une obligation. */

const MONO = 'ui-monospace, "Courier New", monospace';

export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="fr">
      <body style={{ margin: 0 }}>
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
              width: "min(560px, 100%)",
              background: "#d8d5e6",
              border: "3px solid #9b97b3",
              borderRadius: "10px",
              overflow: "hidden",
              boxShadow: "0 16px 40px rgba(30, 36, 48, 0.28)",
            }}
          >
            <div
              style={{
                background: "linear-gradient(90deg, #3b1d8f 0%, #7147d4 45%, #ff3fb0 100%)",
                padding: "8px 14px",
                color: "#fff",
                fontSize: "0.875rem",
                letterSpacing: "0.04em",
              }}
            >
              PANNE_GENERALE.SYS
            </div>

            <div
              style={{
                margin: "14px",
                padding: "20px",
                background: "#1b0f3a",
                color: "#5affa0",
                border: "3px solid #9b97b3",
                fontSize: "0.875rem",
                lineHeight: 1.7,
              }}
            >
              <p style={{ margin: 0 }}>&gt; ARRÊT INATTENDU DU SYSTÈME.</p>
              <p style={{ margin: "10px 0 0" }}>&gt; Lil&apos;OG revient dans un instant.</p>
              {error.digest && (
                <p style={{ margin: "10px 0 0", opacity: 0.55, fontSize: "0.75rem" }}>
                  &gt; RÉF : {error.digest}
                </p>
              )}
            </div>

            <div style={{ padding: "0 14px 18px" }}>
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
                REDÉMARRER.EXE →
              </button>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
