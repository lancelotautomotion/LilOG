"use client";
import { useCallback, useSyncExternalStore } from "react";

export interface WishlistItem {
  handle: string;
  title: string;
  price: number;
  image?: string;
  variantId?: string | null;
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

// Shared module-level store: every useWishlist() instance (one per ProductCard,
// the nav badge, the wishlist page, ...) reads/writes this single cache instead of
// its own stale per-component snapshot, so liking several items in a row can't
// clobber each other's writes.
let cache: WishlistItem[] | null = null;
const listeners = new Set<() => void>();

function getSnapshot(): WishlistItem[] {
  if (cache === null) cache = read();
  return cache;
}

function getServerSnapshot(): WishlistItem[] {
  return [];
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function commit(next: WishlistItem[]) {
  cache = next;
  write(next);
  listeners.forEach((l) => l());
}

export function useWishlist() {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const ready = useSyncExternalStore(subscribe, () => true, () => false);

  const add = useCallback((item: WishlistItem) => {
    const prev = getSnapshot();
    if (prev.some((i) => i.handle === item.handle)) return;
    commit([...prev, item]);
  }, []);

  const remove = useCallback((handle: string) => {
    commit(getSnapshot().filter((i) => i.handle !== handle));
  }, []);

  const has = useCallback((handle: string) => items.some((i) => i.handle === handle), [items]);

  const toggle = useCallback((item: WishlistItem) => {
    const prev = getSnapshot();
    const exists = prev.some((i) => i.handle === item.handle);
    commit(exists ? prev.filter((i) => i.handle !== item.handle) : [...prev, item]);
  }, []);

  return { items, ready, has, add, remove, toggle };
}
