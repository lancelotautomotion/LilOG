/* ── Redimensionnement des photos servies par le CDN Shopify ───────────────
 *
 * Shopify stocke les photos à leur taille d'origine — les fiches produit du
 * catalogue montent à 1011 × 1350 et au-delà. Une vignette de grille en
 * affiche 157 × 196 sur téléphone : le navigateur télécharge donc une
 * quarantaine de fois les pixels qu'il montre. Sur l'accueil et le catalogue,
 * cela représentait à soi seul 1,6 Mo de trop par visite mobile.
 *
 * Le CDN accepte un paramètre `width` et renvoie la photo redimensionnée (et
 * convertie en WebP quand le navigateur l'annonce). Il suffit donc de le
 * poser sur l'URL et de décrire au navigateur, via `srcset` / `sizes`, la
 * place réelle qu'occupera l'image — c'est lui qui choisit ensuite la bonne
 * variante en tenant compte de la densité de l'écran.
 *
 * SÉCURITÉ — pourquoi on reconstruit l'URL plutôt que de concaténer
 *
 * Ces URLs viennent de Shopify, donc de l'extérieur. On ne les recopie pas
 * telles quelles avec un `?width=` collé au bout : on les analyse avec
 * `URL`, on vérifie que l'hôte est bien celui du CDN, et on ne réécrit que
 * dans ce cas. Une URL malformée, un `data:` (le repli local de SmartImg) ou
 * n'importe quel autre hôte ressortent inchangés, sans paramètre ajouté.
 * L'hôte autorisé est déjà celui de la directive `img-src` de la CSP
 * (next.config.ts) : ce module ne peut donc pas faire charger une image
 * depuis un domaine que la CSP refuserait.
 */

/** Le seul hôte dont on réécrit les URLs. Aligné sur `img-src` de la CSP. */
const CDN_HOST = "cdn.shopify.com";

/* Palier de largeurs proposées au navigateur.
 *
 * Il est court À DESSEIN. Chaque largeur demandée est une entrée de cache
 * distincte que le CDN doit d'abord fabriquer : mesuré à ~0,5 s au premier
 * appel, puis 0,15 s une fois chaude. Multiplier les paliers, c'est
 * multiplier ces attentes — payées par la première visiteuse de chaque
 * photo, et il arrive une pièce neuve presque tous les jours.
 *
 * Cinq barreaux suffisent à couvrir tous les emplacements du site, densité
 * d'écran comprise (la largeur d'affichage × le DPR donne le besoin réel) :
 *
 *    200   vignette de commande (40px), panier (64px), miniature (96px)
 *    400   vignette de grille sur téléphone et au bureau
 *    640   pochette du Cover Flow, grille en écran dense
 *    900   grille au bureau en retina
 *   1200   lecteur de la fiche produit en retina
 *
 * Les emplacements se partagent ainsi les mêmes variantes au lieu d'en
 * réclamer chacun une : le cache se réchauffe d'autant plus vite. */
const LADDER = [200, 400, 640, 900, 1200];

/** La largeur du `src` de repli, pour les navigateurs qui ignorent `srcset`. */
const FALLBACK_WIDTH = 900;

/** L'URL analysée si — et seulement si — elle pointe sur le CDN Shopify. */
function cdnUrl(src: string): URL | null {
  if (!src.startsWith("https://")) return null;
  try {
    const url = new URL(src);
    return url.hostname === CDN_HOST ? url : null;
  } catch {
    return null;
  }
}

/** La même photo, redimensionnée par le CDN. Inchangée si l'URL n'est pas à lui. */
export function resizedImage(src: string, width: number): string {
  const url = cdnUrl(src);
  if (!url) return src;
  url.searchParams.set("width", String(Math.round(width)));
  return url.toString();
}

/** Le jeu de variantes à proposer au navigateur, ou `undefined` hors CDN. */
export function imageSrcSet(src: string): string | undefined {
  if (!cdnUrl(src)) return undefined;
  /* La virgule sépare les candidats d'un `srcset` : une seule dans un nom de
     fichier Shopify couperait la liste au mauvais endroit. On l'encode —
     c'est la même ressource pour le CDN. */
  return LADDER.map((w) => `${resizedImage(src, w).replaceAll(",", "%2C")} ${w}w`).join(", ");
}

/** Le `src` de repli qui accompagne un `srcset`. */
export function fallbackSrc(src: string): string {
  return resizedImage(src, FALLBACK_WIDTH);
}
