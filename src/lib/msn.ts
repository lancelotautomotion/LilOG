"use client";

import { useSyncExternalStore } from "react";

/* ──────────────────────────────────────────────────────────────
   Identité MSN partagée entre la fenêtre de connexion et le
   compte : même liste d'avatars, mêmes statuts, même stockage.
   Le choix fait sur /login se retrouve donc dans /account.
   ────────────────────────────────────────────────────────────── */

export const LS_AVATAR_KEY = "lilog_msn_avatar";
export const LS_STATUS_KEY = "lilog_msn_status";

export const MSN_AVATARS = [
  { name: "Carrie Bradshaw",  src: "/MSN/Carrie Bradshaw.png"  },
  { name: "Cher Horowitz",    src: "/MSN/Cher Horowitz.png"    },
  { name: "Elle Woods",       src: "/MSN/Elle Woods.png"        },
  { name: "Gabriella Montez", src: "/MSN/Gabriella Montez.png" },
  { name: "Regina George",    src: "/MSN/Regina George.png"     },
  { name: "Sharpay Evans",    src: "/MSN/Sharpay Evans.png"     },
];

/* `label` sert au compte, `loginLabel` à la fenêtre de connexion,
   les identifiants restent communs pour que le statut suive. */
export const MSN_STATUSES = [
  { id: "online",   emoji: "🟢", label: "En ligne",        loginLabel: "EN LIGNE (PRÊTE À SHOPPER)" },
  { id: "shopping", emoji: "🛍️", label: "Shopping",        loginLabel: "OCCUPÉE (PANIER PLEIN)"     },
  { id: "britney",  emoji: "🎧", label: "Écoute Britney",  loginLabel: "J'ÉCOUTE BRITNEY EN BOUCLE" },
  { id: "busy",     emoji: "📵", label: "Ne pas déranger", loginLabel: "NE PAS DÉRANGER"            },
  { id: "away",     emoji: "💤", label: "Absente",         loginLabel: "ABSENTE (EN CABINE)"        },
  { id: "later",    emoji: "✨", label: "À plus tard",     loginLabel: "À PLUS TARD ✧･ﾟ"            },
];

/* ── Persistance localStorage, lue via useSyncExternalStore ──
   Le snapshot serveur vaut null : pas de mismatch d'hydratation, React
   re-rend avec la valeur stockée une fois monté. */
const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);   // synchro entre onglets
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
