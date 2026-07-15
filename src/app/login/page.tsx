import { AuthForm } from "@/components/auth-form";
import Image from "next/image";
import type { Metadata } from "next";
import logoWhite from "../../../public/logo-white.png";
import { PageShell } from "@/components/page-shell";

export const metadata: Metadata = { title: "Connexion — Lil'OG" };

export default async function LoginPage() {

  return (
    <PageShell>
    <main className="auth-split" style={{ paddingTop: "64px" }}>
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
          style={{ width: "min(420px, 85%)", height: "auto" }}
          priority
        />
      </div>
    </main>
    </PageShell>
  );
}
