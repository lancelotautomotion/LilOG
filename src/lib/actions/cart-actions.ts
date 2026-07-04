"use server";

import { cookies } from "next/headers";
import { addCartLine, createCart, getCart, removeCartLine, updateCartLine } from "@/lib/shopify/cart";
import type { Cart } from "@/lib/shopify/types";

const CART_COOKIE = "lilog_cart_id";

export async function getCartAction(): Promise<Cart | null> {
  const cartId = (await cookies()).get(CART_COOKIE)?.value;
  if (!cartId) return null;
  try {
    return await getCart(cartId);
  } catch {
    return null;
  }
}

export async function addToCartAction(variantId: string, quantity = 1): Promise<Cart> {
  const jar = await cookies();
  const cartId = jar.get(CART_COOKIE)?.value;

  if (!cartId) {
    const cart = await createCart(variantId, quantity);
    jar.set(CART_COOKIE, cart.id, { sameSite: "lax", secure: true, maxAge: 60 * 60 * 24 * 30 });
    return cart;
  }

  try {
    return await addCartLine(cartId, variantId, quantity);
  } catch {
    // The stored cart id is stale (e.g. an old/expired cart) — start a fresh one.
    const cart = await createCart(variantId, quantity);
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
