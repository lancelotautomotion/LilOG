"use client";

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

/* ── Persistance localStorage ──
   Remontée dans `stored.ts` pour être partagée avec le bandeau de
   cookies. Ré-exportée ici : les imports `from "@/lib/msn"` déjà en
   place continuent de fonctionner. */
export { readStored, writeStored, useStored } from "@/lib/stored";
