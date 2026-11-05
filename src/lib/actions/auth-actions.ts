"use server";

import { shopifyCustomerCreate, shopifyUpdateCustomer, type ShopifyCustomer } from "@/lib/shopify/customers";
import { activateDormantCustomer } from "@/lib/shopify/dormant-account";
import { headers } from "next/headers";
import { EMAIL_RE, MAX_NAME, validatePassword } from "@/lib/validation";
import { clientIp, rateLimited } from "@/lib/rate-limit";

/* Chaque création interroge Shopify (Storefront, et Admin pour les fiches
   dormantes) : on plafonne par IP, comme les autres Server Actions. */
const MAX_SIGNUPS_PER_IP = 10;

export async function actionSignup(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
): Promise<{ customer: ShopifyCustomer | null; error: string | null }> {
  /* Le `minLength={8}` du formulaire est une aide à la saisie : cette action
     est un endpoint public, appelable sans passer par lui. */
  if (rateLimited(`signup:ip:${clientIp(await headers())}`, MAX_SIGNUPS_PER_IP)) {
    return { customer: null, error: "Trop de tentatives. Réessaie dans quelques minutes." };
  }

  const passwordError = validatePassword(password);
  if (passwordError) return { customer: null, error: passwordError };

  if (typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
    return { customer: null, error: "Adresse email invalide." };
  }

  const cleanEmail = email.trim();
  const first = String(firstName ?? "").trim().slice(0, MAX_NAME);
  const last = String(lastName ?? "").trim().slice(0, MAX_NAME);

  /* Adresse déjà connue de Shopify sans compte (inscrite à la newsletter
     -10 %) : on active cette fiche plutôt que de laisser Shopify refuser la
     création. Uniquement si la fiche est vide — voir dormant-account. */
  const activated = await activateDormantCustomer(cleanEmail, password, { ownershipProven: false });
  if (activated) {
    const { customer } = await shopifyUpdateCustomer(activated, { firstName: first, lastName: last });
    return {
      customer: customer ?? { id: "", email: cleanEmail, firstName: first, lastName: last },
      error: null,
    };
  }

  return shopifyCustomerCreate(cleanEmail, password, first, last);
}
