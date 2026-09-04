"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import {
  addLinesToCartAction,
  addToCartAction,
  getCartAction,
  removeCartLineAction,
  updateCartLineAction,
} from "@/lib/actions/cart-actions";
import { useStored, writeStored } from "@/lib/stored";
import type { CartLineInput } from "@/lib/shopify/cart";
import type { Cart } from "@/lib/shopify/types";

interface CartContextValue {
  cart: Cart | null;
  count: number;
  pending: boolean;
  /** Le panier réel est arrivé du serveur. Avant, `cart` vaut null et
   *  `count` n'est qu'une estimation locale : une page qui distingue
   *  « vide » de « pas encore chargé » doit lire ce drapeau. */
  loaded: boolean;
  addItem: (variantId: string, quantity?: number) => Promise<void>;
  /** Plusieurs lignes en un seul aller-retour, voir addLinesToCartAction. */
  addItems: (lines: CartLineInput[]) => Promise<void>;
  updateQuantity: (lineId: string, quantity: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

/* Dernier nombre d'articles connu. Sert uniquement à afficher la pastille
   du panier dès l'hydratation, sans attendre l'aller-retour serveur : sans
   lui, la pastille apparaîtrait après coup sur chaque chargement de page.
   C'est un affichage, jamais une source de vérité — la réponse du serveur
   la remplace systématiquement. */
const COUNT_KEY = "lilog_cart_count";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [pending, setPending] = useState(false);
  const [loaded, setLoaded] = useState(false);

  /* `useStored` plutôt qu'un useState arrosé depuis un effet : son snapshot
     serveur vaut null, donc pas de divergence d'hydratation, et React
     interdit désormais d'appeler setState directement dans un effet.
     Bénéfice supplémentaire : l'abonnement écoute l'événement `storage`,
     la pastille reste donc cohérente entre les onglets ouverts. */
  const storedRaw = useStored(COUNT_KEY);
  const hintCount = (() => {
    const n = storedRaw ? Number(storedRaw) : 0;
    return Number.isFinite(n) && n > 0 ? n : 0;
  })();

  /* Le panier était chargé dans le layout racine, ce qui appelait
     `cookies()` et basculait TOUT le site en rendu dynamique : plus aucune
     page mise en cache, un rendu serveur complet à chaque visite, et un
     appel Shopify non caché par page vue pour qui avait un panier. Le
     charger ici, après hydratation, rend les pages de contenu cachables. */
  useEffect(() => {
    let cancelled = false;
    getCartAction()
      .then((c) => {
        if (cancelled) return;
        setCart(c);
        setLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const addItem = useCallback(async (variantId: string, quantity = 1) => {
    setPending(true);
    try {
      const { cart, error } = await addToCartAction(variantId, quantity);
      // Levée ici, côté client : contrairement à un throw dans la Server
      // Action elle-même, ce message n'est pas assaini par Next.js en
      // production (voir AddToCartResult dans cart-actions.ts).
      if (error) throw new Error(error);
      setCart(cart);
    } finally {
      setPending(false);
    }
  }, []);

  const addItems = useCallback(async (lines: CartLineInput[]) => {
    if (lines.length === 0) return;
    setPending(true);
    try {
      const { cart, error } = await addLinesToCartAction(lines);
      if (error) throw new Error(error);
      setCart(cart);
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

  /* Avant la réponse du serveur, on affiche le dernier compte connu plutôt
     que zéro : la pastille est là dès l'hydratation, à sa bonne valeur dans
     l'immense majorité des cas. Dès que le panier réel arrive, il fait foi —
     y compris pour retomber à zéro si la visiteuse a vidé son panier
     ailleurs. */
  const count = loaded ? (cart?.totalQuantity ?? 0) : hintCount;

  useEffect(() => {
    if (!loaded) return;
    const n = cart?.totalQuantity ?? 0;
    writeStored(COUNT_KEY, n > 0 ? String(n) : null);
  }, [loaded, cart]);

  return (
    <CartContext.Provider
      value={{ cart, count, pending, loaded, addItem, addItems, updateQuantity, removeItem }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
