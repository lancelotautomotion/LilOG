import type { Metadata } from "next";
import { ForgotPasswordShell } from "./forgot-password-shell";

export const metadata: Metadata = { title: "Mot de passe oublié · Lil'OG" };

export default function ForgotPasswordPage() {
  return <ForgotPasswordShell />;
}
