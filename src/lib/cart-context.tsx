"use client";

import { createContext, useContext, useState, useCallback } from "react";
import {
  addLinesToCartAction,
  addToCartAction,
  removeCartLineAction,
  updateCartLineAction,
} from "@/lib/actions/cart-actions";
import type { CartLineInput } from "@/lib/shopify/cart";
import type { Cart } from "@/lib/shopify/types";

interface CartContextValue {
  cart: Cart | null;
  count: number;
  pending: boolean;
  addItem: (variantId: string, quantity?: number) => Promise<void>;
  /** Plusieurs lignes en un seul aller-retour — voir addLinesToCartAction. */
  addItems: (lines: CartLineInput[]) => Promise<void>;
  updateQuantity: (lineId: string, quantity: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({
  children,
  initialCart,
}: {
  children: React.ReactNode;
  initialCart: Cart | null;
}) {
  const [cart, setCart] = useState<Cart | null>(initialCart);
  const [pending, setPending] = useState(false);

  const addItem = useCallback(async (variantId: string, quantity = 1) => {
    setPending(true);
    try {
      setCart(await addToCartAction(variantId, quantity));
    } finally {
      setPending(false);
    }
  }, []);

  const addItems = useCallback(async (lines: CartLineInput[]) => {
    if (lines.length === 0) return;
    setPending(true);
    try {
      setCart(await addLinesToCartAction(lines));
    } finally {
      setPending(false);
    }
  }, []);

  const updateQuantity = useCallback(async (lineId: string, quantity: number) => {
    setPending(true);
    try {
      setCart(await updateCartLineAction(lineId, quantity));
    } finally {
      setPending(false);
    }
  }, []);

  const removeItem = useCallback(async (lineId: string) => {
    setPending(true);
    try {
      setCart(await removeCartLineAction(lineId));
    } finally {
      setPending(false);
    }
  }, []);

  const count = cart?.totalQuantity ?? 0;

  return (
    <CartContext.Provider value={{ cart, count, pending, addItem, addItems, updateQuantity, removeItem }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
