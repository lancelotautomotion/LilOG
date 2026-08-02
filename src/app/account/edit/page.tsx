import { auth } from "@/auth";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { shopifyGetCustomer, shopifyUpdateCustomer } from "@/lib/shopify/customers";
import { EditProfileForm } from "./edit-form";

export const metadata: Metadata = { title: "Modifier le profil — Lil'OG" };

export default async function EditProfilePage() {
  const session = await auth();
  if (!session) redirect("/login");

  const shopifyToken = (session as { shopifyToken?: string | null }).shopifyToken ?? null;
  if (!shopifyToken) redirect("/account");

  const customer = await shopifyGetCustomer(shopifyToken);
  if (!customer) redirect("/account");

  async function updateProfile(formData: FormData) {
    "use server";
    const s = await auth();
    const token = (s as { shopifyToken?: string | null })?.shopifyToken;
    if (!token) return { error: "Session expirée" };

    const firstName = (formData.get("firstName") as string | null)?.trim() || undefined;
    const lastName = (formData.get("lastName") as string | null)?.trim() || undefined;
    const email = (formData.get("email") as string | null)?.trim() || undefined;
    const phone = (formData.get("phone") as string | null)?.trim() || undefined;
    const password = (formData.get("password") as string | null)?.trim() || undefined;

    const { error } = await shopifyUpdateCustomer(token, {
      firstName, lastName, email, phone,
      ...(password && password.length >= 8 ? { password } : {}),
    });

    return { error };
  }

  return (
    <main className="account-desktop">
      <div className="account-win95">
        {/* Title bar */}
        <div className="account-win95-bar">
          <span className="account-win95-title">♛ Lil&apos;OG — Modifier le profil</span>
          <div className="account-win95-chrome">
            <span>_</span>
            <span>□</span>
            <a href="/account" title="Fermer">×</a>
          </div>
        </div>

        {/* Toolbar */}
        <div className="account-win95-toolbar">
          <a href="/account" className="account-toolbar-btn">← Retour</a>
          <div className="account-toolbar-sep" />
          <a href="/account/orders" className="account-toolbar-btn">📦 Commandes</a>
        </div>

        {/* Content */}
        <div className="account-win95-full-content">
          <EditProfileForm customer={customer} updateAction={updateProfile} />
        </div>

        {/* Status bar */}
        <div className="account-win95-statusbar">
          <div className="account-status-cell">Modifications sécurisées</div>
          <div className="account-status-cell grow"></div>
          <div className="account-status-cell">♛ Lil&apos;OG © 2025</div>
        </div>
      </div>
    </main>
  );
}
