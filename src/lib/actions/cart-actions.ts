"use server";

import { cookies } from "next/headers";
import { auth } from "@/auth";
import {
  addCartLine,
  cartBuyerIdentityUpdate,
  createCart,
  getCartNode,
  mapCart,
  removeCartLine,
  updateCartLine,
} from "@/lib/shopify/cart";
import type { Cart } from "@/lib/shopify/types";

const CART_COOKIE = "lilog_cart_id";

async function getShopifyToken(): Promise<string | null> {
  const session = await auth();
  return (session as { shopifyToken?: string | null } | null)?.shopifyToken ?? null;
}

/* Lie le panier au client Shopify connecté s'il ne l'est pas déjà —
   condition pour que la commande finale apparaisse dans son historique. */
async function ensureLinkedToCustomer(cartId: string, token: string | null): Promise<Cart | null> {
  if (!token) return null;
  return cartBuyerIdentityUpdate(cartId, token).catch((err) => {
    console.error("[cart] échec de l'association panier ↔ client:", err instanceof Error ? err.message : err);
    return null;
  });
}

export async function getCartAction(): Promise<Cart | null> {
  const cartId = (await cookies()).get(CART_COOKIE)?.value;
  if (!cartId) return null;
  try {
    const node = await getCartNode(cartId);
    if (!node) return null;
    const token = await getShopifyToken();
    if (token && node.buyerIdentity?.customer?.id == null) {
      const linked = await ensureLinkedToCustomer(cartId, token);
      if (linked) return linked;
    }
    return mapCart(node);
  } catch {
    return null;
  }
}

export async function addToCartAction(variantId: string, quantity = 1): Promise<Cart> {
  const jar = await cookies();
  const cartId = jar.get(CART_COOKIE)?.value;
  const token = await getShopifyToken();

  if (!cartId) {
    const cart = await createCart(variantId, quantity, token);
    jar.set(CART_COOKIE, cart.id, { sameSite: "lax", secure: true, maxAge: 60 * 60 * 24 * 30 });
    return cart;
  }

  try {
    const cart = await addCartLine(cartId, variantId, quantity);
    return (await ensureLinkedToCustomer(cartId, token)) ?? cart;
  } catch {
    // The stored cart id is stale (e.g. an old/expired cart) — start a fresh one.
    const cart = await createCart(variantId, quantity, token);
    jar.set(CART_COOKIE, cart.id, { sameSite: "lax", secure: true, maxAge: 60 * 60 * 24 * 30 });
    return cart;
  }
}

export async function updateCartLineAction(lineId: string, quantity: number): Promise<Cart | null> {
  const cartId = (await cookies()).get(CART_COOKIE)?.value;
  if (!cartId) return null;
  return updateCartLine(cartId, lineId, quantity);
}

export async function removeCartLineAction(lineId: string): Promise<Cart | null> {
  const cartId = (await cookies()).get(CART_COOKIE)?.value;
  if (!cartId) return null;
  return removeCartLine(cartId, lineId);
}
