"use server";

import { shopifyCustomerReset } from "@/lib/shopify/customers";
import { headers } from "next/headers";
import { validatePassword } from "@/lib/validation";
import { clientIp, rateLimited } from "@/lib/rate-limit";

/* Le jeton du lien est la preuve d'identité, mais rien ne bornait les
   tentatives : la règle du pare-feu Vercel ne couvre pas ce chemin, et le
   plan Hobby n'en autorise qu'une seule pour tout le projet. */
const MAX_RESET_ATTEMPTS = 10;

export async function actionResetPassword(customerId: string, token: string, password: string) {
  if (rateLimited(`reset:${clientIp(await headers())}`, MAX_RESET_ATTEMPTS)) {
    return { error: "Trop de tentatives. Réessaie dans quelques minutes." };
  }

  /* Même raison qu'à l'inscription : le `minLength` du formulaire ne
     protège rien, cette action est appelable directement. Le lien de
     réinitialisation reste la preuve d'identité — le contrôle ici ne porte
     que sur la robustesse du nouveau mot de passe. */
  const passwordError = validatePassword(password);
  if (passwordError) return { error: passwordError };

  if (typeof customerId !== "string" || !/^\d+$/.test(customerId)) {
    return { error: "Lien invalide ou expiré" };
  }
  if (typeof token !== "string" || token.length === 0) {
    return { error: "Lien invalide ou expiré" };
  }

  const { error } = await shopifyCustomerReset(
    `gid://shopify/Customer/${customerId}`,
    token,
    password,
  );
  return { error };
}
