"use client";

import { createContext, useContext, useState } from "react";

// Placeholder cart state (count only) so Nav/ProductCard can wire up quick-add
// before the real Shopify Cart API (cartCreate/cartLinesAdd) is connected.
const CartContext = createContext<{ count: number; addItem: () => void } | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [count, setCount] = useState(0);
  const addItem = () => setCount((c) => c + 1);
  return <CartContext.Provider value={{ count, addItem }}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
