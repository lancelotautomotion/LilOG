import { createHmac } from "crypto";
import { shopifyCustomerCreate, shopifyCustomerLogin } from "./customers";

/* ── Compte Shopify miroir pour les connexions Google ──
   Le Storefront API n'a pas de notion de client "sans mot de passe" : pour
   qu'une commande apparaisse dans l'historique, elle doit être associée à
   un vrai client Shopify via un customerAccessToken. Les comptes Google
   n'ont pas de mot de passe Shopify, donc on en dérive un de façon
   déterministe à partir de l'email (HMAC avec AUTH_SECRET, déjà requis par
   NextAuth) : aucun stockage supplémentaire n'est nécessaire, le même
   email reproduit toujours le même mot de passe côté serveur. */

/* Le secret de dérivation est volontairement DISTINCT d'AUTH_SECRET.
   Les deux n'ont ni le même cycle de vie ni le même rayon d'explosion :
   AUTH_SECRET signe les sessions et doit pouvoir tourner à tout moment
   (rotation d'hygiène, fuite suspectée) ; ce secret-ci commande le mot de
   passe Shopify de chaque cliente connectée via Google, et le faire tourner
   les prive TOUTES de leur historique de commandes et de leur carnet
   d'adresses, sans message d'erreur.

   Les avoir confondus rendait la rotation d'AUTH_SECRET impossible en
   pratique. Le repli sur AUTH_SECRET assure la continuité des comptes déjà
   créés : tant que SHOPIFY_SHADOW_SECRET n'est pas posé, le comportement
   est identique à l'existant.

   À poser dans Vercel (Settings → Environment Variables) :
     SHOPIFY_SHADOW_SECRET = la valeur ACTUELLE d'AUTH_SECRET
   puis seulement, faire tourner AUTH_SECRET. */
function derivePassword(email: string): string {
  const secret = process.env.SHOPIFY_SHADOW_SECRET || process.env.AUTH_SECRET;
  if (!secret) throw new Error("SHOPIFY_SHADOW_SECRET (or AUTH_SECRET) must be set");
  const hash = createHmac("sha256", secret)
    .update(email.trim().toLowerCase())
    .digest("hex");
  // Préfixe/suffixe fixes pour satisfaire toute règle de complexité (maj + chiffre + symbole)
  return `Lg${hash.slice(0, 28)}!9`;
}

/* Le mot de passe dérivé de cet email, pour aligner un compte existant
   dessus une fois que la cliente a prouvé qu'il est bien le sien.
   Voir actionLinkGoogleAccount (@/app/account/link-actions). */
export function shadowPasswordFor(email: string): string {
  return derivePassword(email);
}

/**
 * Pourquoi la connexion Google n'a pas abouti à un compte Shopify.
 *
 * Le `null` qui servait de réponse à tout confondait trois situations très
 * différentes, et la cliente se retrouvait devant un espace compte vide
 * sans la moindre explication :
 *
 * - `linked`      tout va bien, le compte miroir répond.
 * - `email-taken` un compte Lil'OG existe déjà avec cet email, avec un mot
 *                 de passe que la cliente a choisi elle-même. On ne peut
 *                 pas le deviner — mais elle, elle le connaît : c'est le
 *                 cas qui se répare, en le lui demandant une fois.
 * - `unavailable` Shopify n'a pas répondu. Rien à réparer, ça repassera.
 */
export type ShadowAccountResult =
  | { status: "linked"; token: string }
  | { status: "email-taken"; token: null }
  | { status: "unavailable"; token: null };

export async function getOrCreateShopifyTokenForEmail(
  email: string,
  firstName: string,
  lastName: string,
): Promise<ShadowAccountResult> {
  const password = derivePassword(email);

  const first = await shopifyCustomerLogin(email, password);
  if (first.token) return { status: "linked", token: first.token };

  // Pas de compte miroir joignable : on tente de le créer.
  const { error } = await shopifyCustomerCreate(email, password, firstName, lastName);

  if (error) {
    /* On ne compare PAS le texte du message : Shopify le traduit selon la
       langue de la boutique, et s'y fier a déjà coûté un bug ici (voir
       addLinesToCartAction). Seul « Erreur réseau » est produit par notre
       propre code, il est donc fiable. Tout autre refus sur un email
       valide et un mot de passe fort signifie en pratique une seule chose :
       l'adresse est déjà prise. */
    if (error === "Erreur réseau") return { status: "unavailable", token: null };
    return { status: "email-taken", token: null };
  }

  const retry = await shopifyCustomerLogin(email, password);
  return retry.token
    ? { status: "linked", token: retry.token }
    : { status: "unavailable", token: null };
}
