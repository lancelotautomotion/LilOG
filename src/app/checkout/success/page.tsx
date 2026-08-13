import Link from "next/link";

export default async function CheckoutSuccessPage() {
  return (
    <main style={{
      minHeight: "100dvh",
      backgroundImage: "url('/leo.jpeg')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "clamp(20px, 5vw, 60px)",
    }}>
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.22)", pointerEvents: "none" }} />

      <div style={{
        position: "relative",
        zIndex: 1,
        width: "min(480px, 96vw)",
        borderTop: "3px solid #fff",
        borderLeft: "3px solid #fff",
        borderRight: "3px solid #444",
        borderBottom: "3px solid #444",
        background: "#c0c0c0",
        boxShadow: "2px 2px 0 #000, inset 1px 1px 0 #dfdfdf",
      }}>
        {/* Title bar */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "linear-gradient(90deg, #d4006e 0%, #f7a3e3 100%)",
          padding: "4px 6px",
          gap: "8px",
        }}>
          <span style={{ fontFamily: "var(--mono)", fontSize: "0.7rem", color: "#fff", letterSpacing: "0.06em", textTransform: "uppercase", flex: 1 }}>
            ✓ Commande confirmée — Lil&apos;OG
          </span>
          <div style={{ display: "flex", gap: "3px" }}>
            {["_", "□", "×"].map((s) => (
              <span key={s} style={{
                width: 16, height: 14,
                background: "#c0c0c0",
                borderTop: "1.5px solid #fff",
                borderLeft: "1.5px solid #fff",
                borderRight: "1.5px solid #444",
                borderBottom: "1.5px solid #444",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.55rem",
                fontFamily: "var(--mono)",
                color: "#000",
                userSelect: "none",
              }}>{s}</span>
            ))}
          </div>
        </div>

        <div style={{ padding: "12px 14px 14px" }}>
          {/* Confirmation display */}
          <div style={{
            borderTop: "2px solid #444",
            borderLeft: "2px solid #444",
            borderRight: "2px solid #dfdfdf",
            borderBottom: "2px solid #dfdfdf",
            background: "#000080",
            padding: "18px 16px 20px",
            textAlign: "center",
            marginBottom: "12px",
          }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: "2.4rem", color: "#00ff41", marginBottom: "8px", textShadow: "0 0 12px #00ff41, 0 0 24px rgba(0,255,65,0.4)" }}>✓</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#fff", marginBottom: "4px" }}>
              Merci pour ta commande !
            </div>
            <div style={{ fontFamily: "var(--mono)", fontSize: "0.62rem", color: "#a0cfff", letterSpacing: "0.1em" }}>
              Paiement accepté · Un email de confirmation t&apos;a été envoyé
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "center" }}>
            <Link href="/" style={{
              fontFamily: "var(--mono)",
              fontSize: "0.7rem",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: "#000",
              textDecoration: "none",
              background: "#c0c0c0",
              borderTop: "2px solid #fff",
              borderLeft: "2px solid #fff",
              borderRight: "2px solid #444",
              borderBottom: "2px solid #444",
              boxShadow: "1px 1px 0 #000",
              padding: "6px 24px",
              display: "inline-block",
            }}>
              Retour à la boutique
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
