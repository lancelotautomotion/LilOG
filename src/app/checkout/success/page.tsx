import Link from "next/link";
import { stripe } from "@/lib/stripe";

interface Props {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { session_id } = await searchParams;

  let total: string | null = null;
  let email: string | null = null;

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
    } catch {
      // session lookup failed — still show the success page
    }
  }

  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1.25rem",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "2rem", fontWeight: 700 }}>
        Commande confirmée ✓
      </h1>
      {email && (
        <p style={{ opacity: 0.7 }}>Un reçu a été envoyé à {email}.</p>
      )}
      {total && (
        <p style={{ fontSize: "1.25rem", fontWeight: 600 }}>Total : {total} €</p>
      )}
      <Link
        href="/"
        style={{
          marginTop: "1rem",
          padding: "0.75rem 2rem",
          background: "#000",
          color: "#fff",
          borderRadius: "0.5rem",
          textDecoration: "none",
          fontWeight: 600,
        }}
      >
        Retour à la boutique
      </Link>
    </main>
  );
}
