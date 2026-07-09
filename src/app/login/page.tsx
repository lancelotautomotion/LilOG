import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Connexion — Lil'OG" };

export default async function LoginPage() {
  const session = await auth();
  if (session) redirect("/account");

  return (
    <main className="auth-page" style={{ position: "relative", background: "none" }}>
      <Image
        src="/login-bg.jpeg"
        alt=""
        fill
        priority
        style={{ objectFit: "cover", zIndex: 0 }}
      />
      <a className="auth-back" href="/" style={{ position: "relative", zIndex: 1, color: "#fff", textShadow: "0 1px 4px rgba(0,0,0,0.6)" }}>← Retour</a>
      <div className="auth-brand" style={{ position: "relative", zIndex: 1, color: "#fff", textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>Lil&#39;OG</div>
      <h1 className="auth-title" style={{ position: "relative", zIndex: 1, color: "#fff", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>Mon compte</h1>
      <div style={{ position: "relative", zIndex: 1, width: "100%" }}>
        <AuthForm />
      </div>
    </main>
  );
}
