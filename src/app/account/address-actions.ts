"use server";

import { auth } from "@/auth";
import { getShopifyToken } from "@/lib/shopify/session-token";
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

export async function actionCreateAddress(input: AddressInput) {
  const token = await requireToken();
  if (!token) return { address: null, error: "Non autorisé" };
  return shopifyCreateAddress(token, input);
}

export async function actionUpdateAddress(id: string, input: AddressInput) {
  const token = await requireToken();
  if (!token) return { address: null, error: "Non autorisé" };
  return shopifyUpdateAddress(token, id, input);
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
