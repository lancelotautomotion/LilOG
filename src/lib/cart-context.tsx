"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { addToCartAction, removeCartLineAction, updateCartLineAction } from "@/lib/actions/cart-actions";
import type { Cart } from "@/lib/shopify/types";

interface CartContextValue {
  cart: Cart | null;
  count: number;
  pending: boolean;
  addItem: (variantId: string, quantity?: number) => Promise<void>;
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
    <CartContext.Provider value={{ cart, count, pending, addItem, updateQuantity, removeItem }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
