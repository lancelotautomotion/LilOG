"use server";

import { auth } from "@/auth";
import {
  shopifyCreateAddress,
  shopifyUpdateAddress,
  shopifyDeleteAddress,
  shopifySetDefaultAddress,
  type AddressInput,
} from "@/lib/shopify/customers";

function getToken(session: Awaited<ReturnType<typeof auth>>): string | null {
  return (session as { shopifyToken?: string | null })?.shopifyToken ?? null;
}

export async function actionCreateAddress(input: AddressInput) {
  const session = await auth();
  const token = getToken(session);
  if (!token) return { address: null, error: "Non autorisé" };
  return shopifyCreateAddress(token, input);
}

export async function actionUpdateAddress(id: string, input: AddressInput) {
  const session = await auth();
  const token = getToken(session);
  if (!token) return { address: null, error: "Non autorisé" };
  return shopifyUpdateAddress(token, id, input);
}

export async function actionDeleteAddress(id: string) {
  const session = await auth();
  const token = getToken(session);
  if (!token) return { error: "Non autorisé" };
  return shopifyDeleteAddress(token, id);
}

export async function actionSetDefaultAddress(id: string) {
  const session = await auth();
  const token = getToken(session);
  if (!token) return { error: "Non autorisé" };
  return shopifySetDefaultAddress(token, id);
}
