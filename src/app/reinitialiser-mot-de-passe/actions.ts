"use server";

import { shopifyCustomerReset } from "@/lib/shopify/customers";
import { validatePassword } from "@/lib/validation";

export async function actionResetPassword(customerId: string, token: string, password: string) {
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
