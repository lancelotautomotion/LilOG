import { auth } from "@/auth";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { shopifyGetCustomer, shopifyUpdateCustomer } from "@/lib/shopify/customers";
import { getShopifyToken } from "@/lib/shopify/session-token";
import { EMAIL_RE, MAX_NAME, validatePassword } from "@/lib/validation";
import { EditProfileShell } from "./edit-profile-shell";

export const metadata: Metadata = { title: "Modifier le profil · Lil'OG" };

export default async function EditProfilePage() {
  const session = await auth();
  if (!session) redirect("/login");

  const shopifyToken = await getShopifyToken();
  if (!shopifyToken) redirect("/account");

  const customer = await shopifyGetCustomer(shopifyToken);
  if (!customer) redirect("/account");
  const customerEmail = customer.email;
  const isGoogleAccount = session.authProvider === "google";

  async function updateProfile(formData: FormData) {
    "use server";
    /* La session est revérifiée à chaque appel : cette Server Action est
       un endpoint public, l'avoir rendue depuis une page authentifiée ne
       prouve rien sur l'appelant. */
    const s = await auth();
    if (!s) return { error: "Session expirée" };
    const token = await getShopifyToken();
    if (!token) return { error: "Session expirée" };

    const field = (name: string) =>
      (formData.get(name) as string | null)?.trim().slice(0, MAX_NAME) || undefined;

    const firstName = field("firstName");
    const lastName = field("lastName");
    const phone = field("phone");
    const password = (formData.get("password") as string | null)?.trim() || undefined;
    const email = (formData.get("email") as string | null)?.trim().slice(0, MAX_NAME) || undefined;

    /* Un mot de passe trop court était SILENCIEUSEMENT ignoré : la cliente
       lisait « enregistré » et croyait l'avoir changé. Gênant quand elle le
       fait justement parce qu'elle soupçonne une compromission. */
    if (password) {
      const passwordError = validatePassword(password);
      if (passwordError) return { error: passwordError };
    }

    if (email && !EMAIL_RE.test(email)) return { error: "Adresse email invalide." };

    /* L'e-mail d'un compte relié à Google ne peut pas changer ici. Le compte
       miroir Shopify est retrouvé à chaque connexion PAR l'e-mail Google : si
       l'e-mail Shopify en diverge, la recherche échoue, la création réussit,
       et Shopify se retrouve avec deux clientes pour une seule personne —
       l'historique de commandes disparaissant avec l'ancienne. */
    const isGoogle = s?.authProvider === "google";
    if (isGoogle && email && email.toLowerCase() !== customerEmail.toLowerCase()) {
      return {
        error:
          "Ton compte est relié à Google : ton adresse e-mail est celle de ton compte Google et ne peut pas être modifiée ici.",
      };
    }

    const { error } = await shopifyUpdateCustomer(token, {
      firstName,
      lastName,
      phone,
      ...(isGoogle ? {} : { email }),
      ...(password ? { password } : {}),
    });

    return { error };
  }

  return (
    <EditProfileShell
      customer={customer}
      updateAction={updateProfile}
      emailLocked={isGoogleAccount}
    />
  );
}
