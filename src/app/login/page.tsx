import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import Image from "next/image";
import type { Metadata } from "next";
import logoWhite from "../../../public/logo-white.png";

export const metadata: Metadata = { title: "Connexion — Lil'OG" };

export default async function LoginPage() {
  const session = await auth();
  if (session) redirect("/account");

  return (
    <main className="auth-split">
      {/* Left — form */}
      <div className="auth-left">
        <a className="auth-back" href="/">← Retour</a>
        <div className="auth-left-inner">
          <h1 className="auth-welcome">Bienvenue,<br /><em>disciple de Regina George</em></h1>
          <AuthForm />
        </div>
      </div>

      {/* Right — logo */}
      <div className="auth-right">
        <Image
          src={logoWhite}
          alt="Lil'OG"
          className="auth-right-logo"
          priority
        />
      </div>
    </main>
  );
}
