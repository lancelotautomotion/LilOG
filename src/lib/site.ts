/* ============================================================
   Adresse canonique du site : UNE seule, partout.
   ------------------------------------------------------------
   Le site est servi sur www.lilog.shop. Le plan de site, robots.txt,
   les canoniques et les balises Open Graph déclaraient l'adresse sans
   « www » : Google voit alors deux sites distincts et partage son
   référencement entre les deux. Tout ce qui fabrique une URL absolue
   passe par ici.

   Pour basculer sur l'adresse nue un jour, c'est cette ligne (ou la
   variable NEXT_PUBLIC_SITE_URL dans Vercel) et le réglage de
   redirection du domaine dans Vercel — rien d'autre.
   ============================================================ */
const raw = process.env.NEXT_PUBLIC_SITE_URL;
export const SITE_URL = (raw && /^https:\/\/[a-z0-9.-]+$/i.test(raw) ? raw : "https://www.lilog.shop").replace(/\/$/, "");

export const SITE_NAME = "Lil'OG";

/** Image de partage par défaut (accueil, rayons, pages fixes). */
export const DEFAULT_OG_IMAGE = {
  url: "/hero-cover.png",
  width: 1920,
  height: 900,
  alt: "Lil'OG · Pre-loved Y2K",
};

/* ── Handles ───────────────────────────────────────────────
   Certains handles Shopify commencent par un emoji
   (`/products/👢-bottes-en-cuir`) : une fois copiée, l'adresse devient
   `%F0%9F%91%A2-bottes…`, illisible, et mauvaise pour le référencement.
   `cleanHandle` en donne la version propre ; elle ne change rien à un
   handle déjà propre. */
const NON_SLUG = /[^\p{L}\p{N}-]+/gu;
export function cleanHandle(handle: string): string {
  return handle
    .normalize("NFC")
    .replace(/[\p{Extended_Pictographic}\p{Emoji_Presentation}\p{Emoji_Modifier}\p{Regional_Indicator}︎️​-‍⁠﻿]/gu, "")
    .replace(NON_SLUG, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Le handle porte-t-il autre chose que lettres, chiffres et tirets ? */
export function isDirtyHandle(handle: string): boolean {
  return cleanHandle(handle) !== handle;
}

/** Chemin d'une fiche, avec le handle encodé pour une URL absolue. */
export function productPath(handle: string): string {
  return `/products/${encodeURIComponent(handle)}`;
}
