"use server";

import { auth } from "@/auth";
import { getShopifyToken } from "@/lib/shopify/session-token";
import { MAX_NAME } from "@/lib/validation";
import {
  shopifyCreateAddress,
  shopifyUpdateAddress,
  shopifyDeleteAddress,
  shopifySetDefaultAddress,
  type AddressInput,
} from "@/lib/shopify/customers";

/* Chaque action revérifie la session ET relit le token côté serveur : ce
   sont des endpoints publics, appelables hors de la page qui les rend. */
async function requireToken(): Promise<string | null> {
  if (!(await auth())) return null;
  return getShopifyToken();
}

/* Shopify fait autorité sur la validité d'une adresse, mais rien ne bornait
   ce qui lui était envoyé : ces actions sont des endpoints publics, et une
   adresse d'un mégaoctet part en base et se retrouve sur les étiquettes
   d'expédition. On coupe à une longueur qui reste très au-dessus de toute
   adresse réelle. */
function boundAddress(input: AddressInput): AddressInput {
  const cut = (v: string | undefined) =>
    typeof v === "string" ? v.trim().slice(0, MAX_NAME) : v;
  return {
    firstName: cut(input?.firstName) ?? "",
    lastName: cut(input?.lastName) ?? "",
    address1: cut(input?.address1) ?? "",
    address2: cut(input?.address2),
    city: cut(input?.city) ?? "",
    province: cut(input?.province),
    zip: cut(input?.zip) ?? "",
    country: cut(input?.country) ?? "",
    phone: cut(input?.phone),
  };
}

export async function actionCreateAddress(input: AddressInput) {
  const token = await requireToken();
  if (!token) return { address: null, error: "Non autorisé" };
  return shopifyCreateAddress(token, boundAddress(input));
}

export async function actionUpdateAddress(id: string, input: AddressInput) {
  const token = await requireToken();
  if (!token) return { address: null, error: "Non autorisé" };
  return shopifyUpdateAddress(token, id, boundAddress(input));
}

export async function actionDeleteAddress(id: string) {
  const token = await requireToken();
  if (!token) return { error: "Non autorisé" };
  return shopifyDeleteAddress(token, id);
}

export async function actionSetDefaultAddress(id: string) {
  const token = await requireToken();
  if (!token) return { error: "Non autorisé" };
  return shopifySetDefaultAddress(token, id);
}
