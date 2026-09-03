import type { Metadata } from "next";
import { ResetPasswordShell } from "./reset-password-shell";

export const metadata: Metadata = { title: "Réinitialiser mon mot de passe · Lil'OG" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; token?: string }>;
}) {
  const { id, token } = await searchParams;
  return <ResetPasswordShell customerId={id ?? null} token={token ?? null} />;
}
