import Link from "next/link";
import { stripe } from "@/lib/stripe";

interface Props {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { session_id } = await searchParams;

  let total: string | null = null;
  let email: string | null = null;
  let firstName: string | null = null;

  if (session_id) {
    try {
      const session = await stripe.checkout.sessions.retrieve(session_id, {
        expand: ["line_items"],
      });
      total =
        session.amount_total != null
          ? (session.amount_total / 100).toFixed(2)
          : null;
      email = session.customer_details?.email ?? null;
      const fullName = session.customer_details?.name ?? null;
      firstName = fullName ? fullName.split(" ")[0] : null;
    } catch {
      // fallback — show success page anyway
    }
  }

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
      {/* scrim */}
      <div style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.22)",
        pointerEvents: "none",
      }} />

      {/* Win95 window */}
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
          background: "linear-gradient(90deg, #000080, #1084d0)",
          padding: "4px 6px",
          gap: "8px",
        }}>
          <span style={{
            fontFamily: "var(--mono)",
            fontSize: "0.7rem",
            color: "#fff",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            flex: 1,
          }}>
            ✓ Commande confirmée — Lil&apos;OG
          </span>
          <div style={{ display: "flex", gap: "3px" }}>
            {["_", "□", "✕"].map((s) => (
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

        {/* Screen body */}
        <div style={{ padding: "12px 14px 14px" }}>

          {/* Sunken inset display */}
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
            <div style={{
              fontFamily: "var(--mono)",
              fontSize: "2.4rem",
              color: "#00ff41",
              marginBottom: "8px",
              textShadow: "0 0 12px #00ff41, 0 0 24px rgba(0,255,65,0.4)",
            }}>✓</div>
            <div style={{
              fontFamily: "var(--mono)",
              fontSize: "0.7rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#fff",
              marginBottom: "4px",
            }}>
              {firstName ? `Merci ${firstName} !` : "Merci !"}
            </div>
            <div style={{
              fontFamily: "var(--mono)",
              fontSize: "0.62rem",
              color: "#a0cfff",
              letterSpacing: "0.1em",
            }}>
              Paiement accepté
            </div>
          </div>

          {/* Info rows */}
          <div style={{
            borderTop: "2px solid #444",
            borderLeft: "2px solid #444",
            borderRight: "2px solid #dfdfdf",
            borderBottom: "2px solid #dfdfdf",
            background: "#fff",
            padding: "10px 12px",
            marginBottom: "12px",
            display: "flex",
            flexDirection: "column",
            gap: "7px",
          }}>
            {email && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <span style={{ fontFamily: "var(--mono)", fontSize: "0.64rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#444" }}>Reçu envoyé à</span>
                <span style={{ fontFamily: "var(--mono)", fontSize: "0.68rem", color: "#000080", fontWeight: 700 }}>{email}</span>
              </div>
            )}
            {total && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <span style={{ fontFamily: "var(--mono)", fontSize: "0.64rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#444" }}>Total payé</span>
                <span style={{ fontFamily: "var(--mono)", fontSize: "0.9rem", color: "#000080", fontWeight: 700 }}>{total} €</span>
              </div>
            )}
          </div>

          {/* Progress bar — "traitement commande" */}
          <div style={{
            marginBottom: "12px",
            display: "flex",
            flexDirection: "column",
            gap: "5px",
          }}>
            <span style={{ fontFamily: "var(--mono)", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "#444" }}>
              Traitement de la commande...
            </span>
            <div style={{
              height: 14,
              borderTop: "2px solid #444",
              borderLeft: "2px solid #444",
              borderRight: "2px solid #dfdfdf",
              borderBottom: "2px solid #dfdfdf",
              background: "#c0c0c0",
              overflow: "hidden",
              position: "relative",
            }}>
              <div style={{
                height: "100%",
                width: "100%",
                background: "repeating-linear-gradient(90deg, #000080 0px, #000080 10px, transparent 10px, transparent 12px)",
              }} />
            </div>
          </div>

          {/* Win95 button */}
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
