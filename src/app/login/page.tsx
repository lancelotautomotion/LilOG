import { AuthForm } from "@/components/auth-form";
import Image from "next/image";
import type { Metadata } from "next";
import logoBlack from "../../../public/logo-black.png";

export const metadata: Metadata = { title: "Connexion — Lil'OG" };

export default function LoginPage() {
  return (
    <main className="auth-desktop">
      <a className="auth-desktop-back" href="/">← Retour</a>
      <AuthForm />
      <Image
        className="auth-desktop-logo"
        src={logoBlack}
        alt=""
        aria-hidden
        priority
      />
    </main>
  );
}
