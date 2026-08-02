"use client";
import { useState, useEffect, useCallback } from "react";

export interface WishlistItem {
  handle: string;
  title: string;
  price: number;
  image?: string;
}

const KEY = "lilog_wishlist";

function read(): WishlistItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as WishlistItem[]) : [];
  } catch {
    return [];
  }
}

function write(items: WishlistItem[]) {
  try { localStorage.setItem(KEY, JSON.stringify(items)); } catch {}
}

export function useWishlist() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(read());
    setReady(true);
  }, []);

  const add = useCallback((item: WishlistItem) => {
    setItems((prev) => {
      if (prev.some((i) => i.handle === item.handle)) return prev;
      const next = [...prev, item];
      write(next);
      return next;
    });
  }, []);

  const remove = useCallback((handle: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.handle !== handle);
      write(next);
      return next;
    });
  }, []);

  const has = useCallback((handle: string) => items.some((i) => i.handle === handle), [items]);

  const toggle = useCallback((item: WishlistItem) => {
    setItems((prev) => {
      const exists = prev.some((i) => i.handle === item.handle);
      const next = exists ? prev.filter((i) => i.handle !== item.handle) : [...prev, item];
      write(next);
      return next;
    });
  }, []);

  return { items, ready, has, add, remove, toggle };
}
