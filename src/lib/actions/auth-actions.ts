"use server";

import { shopifyCustomerCreate, type ShopifyCustomer } from "@/lib/shopify/customers";
import { EMAIL_RE, MAX_NAME, validatePassword } from "@/lib/validation";

export async function actionSignup(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
): Promise<{ customer: ShopifyCustomer | null; error: string | null }> {
  /* Le `minLength={8}` du formulaire est une aide à la saisie : cette action
     est un endpoint public, appelable sans passer par lui. */
  const passwordError = validatePassword(password);
  if (passwordError) return { customer: null, error: passwordError };

  if (typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
    return { customer: null, error: "Adresse email invalide." };
  }

  return shopifyCustomerCreate(
    email.trim(),
    password,
    String(firstName ?? "").trim().slice(0, MAX_NAME),
    String(lastName ?? "").trim().slice(0, MAX_NAME),
  );
}
