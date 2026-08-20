import { auth } from "@/auth";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { shopifyGetCustomer, shopifyUpdateCustomer } from "@/lib/shopify/customers";
import { EditProfileShell } from "./edit-profile-shell";

export const metadata: Metadata = { title: "Modifier le profil · Lil'OG" };

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

  return <EditProfileShell customer={customer} updateAction={updateProfile} />;
}
