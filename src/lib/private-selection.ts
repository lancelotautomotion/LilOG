import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";

/* ============================================================
   Sélection privée : une vitrine partagée par lien, hors du site
   ------------------------------------------------------------
   La page /selection/<clé> montre une collection Shopify à des
   personnes à qui on a donné le lien (influenceuses), sans que la
   page existe pour le reste du monde : aucun lien depuis le site,
   aucune entrée dans le plan de site, `noindex` sur la page ET en
   en-tête HTTP, et `/selection/` refusé dans robots.txt.

   ⚠ LA CLÉ N'EST PAS DANS LE CODE, ET NE DOIT JAMAIS Y ÊTRE.
   Le dépôt est public : une clé écrite ici serait lisible par
   n'importe qui sur GitHub, et le lien cesserait d'être privé le
   jour de son commit. Elle vit dans la variable d'environnement
   PRIVATE_SELECTION_KEY, posée dans Vercel.

   Sans cette variable, la page n'existe pas (404). C'est voulu :
   une configuration incomplète ne doit jamais ouvrir la vitrine à
   tout le monde, elle doit la fermer.
   ============================================================ */

/**
 * Handles candidats de la collection Shopify, essayés dans l'ordre. Shopify
 * fabrique le handle à partir du titre de la collection, mais le laisse
 * modifier après coup : on interroge les écritures plausibles de
 * « Vyvysocoollio selection », plutôt que de parier sur une seule.
 *
 * PRIVATE_SELECTION_COLLECTION passe devant toutes : c'est la porte de
 * sortie si la collection est renommée ou remplacée, sans nouveau
 * déploiement de code.
 */
export const SELECTION_COLLECTION_HANDLES = [
  "vyvysocoollio-selection",
  "vyvysocoollio",
  "selection-vyvysocoollio",
  "vyvysocoollio-s-selection",
] as const;

export function selectionCollectionHandles(): string[] {
  const override = process.env.PRIVATE_SELECTION_COLLECTION?.trim();
  return override ? [override] : [...SELECTION_COLLECTION_HANDLES];
}

/**
 * Comparaison à durée constante de deux chaînes de longueurs quelconques.
 * `timingSafeEqual` exige des tampons de même taille et lève sinon : on
 * compare les empreintes SHA-256, toujours longues de 32 octets, ce qui
 * neutralise au passage la fuite de longueur.
 *
 * Le gain est modeste face à une clé de 128 bits — mais il est gratuit, et
 * un `===` sur un secret est exactement le genre de détail qu'on ne repère
 * plus une fois écrit.
 */
function secretEquals(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

/**
 * `true` si ce segment d'URL est bien la clé de la sélection privée.
 *
 * Renvoie `false` dès que PRIVATE_SELECTION_KEY est absente, vide ou trop
 * courte : une clé devinable en quelques essais ne protège rien, et une
 * page ouverte par erreur de configuration serait pire que pas de page.
 */
export function isSelectionKey(key: string): boolean {
  const expected = process.env.PRIVATE_SELECTION_KEY?.trim();
  if (!expected || expected.length < 16) return false;
  return secretEquals(key, expected);
}
