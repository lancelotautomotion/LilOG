import type { DefaultSession } from "next-auth";

/* ── Frontière serveur / client de la session ──────────────────────────────
 *
 * Ces deux augmentations de type disent, au niveau du compilateur, ce qui a
 * le droit de franchir la frontière — et le code ne pouvait pas le dire
 * jusqu'ici, parce qu'il accédait au token par des casts `as` disséminés
 * dans neuf fichiers.
 *
 * `Session` est ce que reçoit le NAVIGATEUR : elle est sérialisée en clair
 * par GET /api/auth/session et injectée dans le SessionProvider. Le
 * customerAccessToken Shopify n'y figure donc pas — il donne accès à
 * l'historique de commandes, aux adresses, et à customerUpdate, qui accepte
 * `password` (prise de contrôle du compte). Le client n'a besoin que de
 * savoir si un compte Shopify est relié, pour afficher ou non le bouton
 * « Modifier le profil ».
 *
 * `JWT` est le cookie de session : httpOnly, chiffré, illisible côté client.
 * C'est là que vit le token, et `getShopifyToken()` (@/lib/shopify/session-token)
 * est le seul point d'entrée pour le relire, côté serveur uniquement.
 */

/** Pourquoi la connexion Google n'a pas abouti à un compte Shopify.
 *  Défini dans @/lib/shopify/shadow-account. */
type ShopifyLinkStatus = "linked" | "email-taken" | "unavailable";

declare module "next-auth" {
  interface Session extends DefaultSession {
    /** Un compte Shopify est relié à cette session. Jamais le token lui-même. */
    hasShopifyAccount?: boolean;
    /** Le motif, quand il ne l'est pas : sert à expliquer plutôt qu'à
     *  laisser la cliente devant un espace vide. Ce n'est pas un secret. */
    shopifyLinkStatus?: ShopifyLinkStatus | null;
    /** « google » ou « credentials ». Détermine notamment si l'e-mail du
     *  compte Shopify peut être modifié depuis le profil. */
    authProvider?: string | null;
  }

  interface User {
    /** Posé par le provider Credentials, recopié dans le JWT, jamais dans la Session. */
    shopifyToken?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    /** Le customerAccessToken Shopify. Reste dans le cookie chiffré. */
    shopifyToken?: string | null;
    shopifyLinkStatus?: ShopifyLinkStatus | null;
    authProvider?: string | null;
  }
}

export {};
