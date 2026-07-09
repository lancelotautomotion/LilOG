import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Connexion — Lil'OG" };

export default async function LoginPage() {
  const session = await auth();
  if (session) redirect("/account");

  return (
    <main className="auth-page">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="auth-flower" src="/logo-black.png" alt="" aria-hidden />
      <a className="auth-back" href="/">← Retour</a>
      <div className="auth-brand">Lil&#39;OG</div>
      <h1 className="auth-title">Mon compte</h1>
      <AuthForm />
    </main>
  );
}
