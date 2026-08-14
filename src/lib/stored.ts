"use client";

import { useSyncExternalStore } from "react";

/* ──────────────────────────────────────────────────────────────
   Persistance localStorage, lue via useSyncExternalStore.

   Ces trois helpers vivaient dans `msn.ts`, où ils ne servaient
   qu'aux avatars et aux statuts. Le bandeau de cookies a besoin
   du même mécanisme : ils sont remontés ici pour que tout le site
   partage un seul jeu d'abonnés — sans quoi deux modules qui
   écrivent chacun de leur côté ne se préviennent pas. `msn.ts`
   les ré-exporte, donc les imports existants restent valides.

   Le snapshot serveur vaut null : pas de mismatch d'hydratation,
   React re-rend avec la valeur stockée une fois monté.
   ────────────────────────────────────────────────────────────── */

const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb); // synchro entre onglets
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

export function readStored(key: string) {
  try { return localStorage.getItem(key); } catch { return null; }
}

export function writeStored(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else                localStorage.setItem(key, value);
  } catch {/* navigation privée */}
  listeners.forEach(cb => cb());
}

export function useStored(key: string) {
  return useSyncExternalStore(subscribe, () => readStored(key), () => null);
}

/* ── Hydratation ──
   `false` pendant le rendu serveur et l'hydratation, `true` ensuite.

   Sert aux composants qui ne peuvent rien afficher de juste tant que
   localStorage n'a pas été lu. Passer par useSyncExternalStore plutôt
   que par un `useState` + `useEffect` : React interdit désormais
   d'appeler setState directement dans un effet, et le store ne change
   jamais, donc l'abonnement n'a rien à écouter. */
const neverChanges = () => () => {};

export function useHydrated() {
  return useSyncExternalStore(neverChanges, () => true, () => false);
}
