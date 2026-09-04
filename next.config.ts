import type { NextConfig } from "next";

/* ── En-têtes de sécurité ──────────────────────────────────────────────────
 *
 * Le site était servi sans aucun de ces en-têtes.
 *
 * La CSP est posée en Report-Only À DESSEIN : en mode bloquant, une
 * directive trop stricte casse silencieusement Google Analytics, le pixel
 * Meta, les images Shopify ou la redirection vers le checkout — sans erreur
 * visible, juste une fonctionnalité qui ne marche plus. En Report-Only, le
 * navigateur journalise les violations dans la console SANS RIEN BLOQUER :
 * le rendu et la navigation sont strictement inchangés.
 *
 * POUR PASSER EN MODE BLOQUANT (à faire après vérification) :
 *   1. Naviguer sur la preview Vercel — accueil, une fiche produit, le
 *      catalogue, le panier, /account, /contact, /gift-card — avec la
 *      console ouverte, en acceptant les cookies (pour charger GA et Meta).
 *   2. Relever les lignes « Content-Security-Policy-Report-Only … would
 *      have been blocked » et ajouter les domaines légitimes ci-dessous.
 *   3. Renommer la clé en "Content-Security-Policy" et redéployer.
 *
 * `unsafe-inline` sur script-src reste nécessaire tant que Next.js pose ses
 * propres scripts inline (ainsi que les extraits GA et Meta). S'en passer
 * suppose une CSP à nonce via middleware — chantier séparé.
 */
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://connect.facebook.net",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://cdn.shopify.com https://www.googletagmanager.com https://www.google-analytics.com https://www.facebook.com",
  "font-src 'self' data:",
  "connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com https://connect.facebook.net https://www.facebook.com",
  // Le tunnel de paiement est hébergé par Shopify : le formulaire doit
  // pouvoir y poster.
  "form-action 'self' https://shop.app https://checkout.shopify.com https://lilog.shop",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  /* Observation seule. Voir le commentaire ci-dessus pour l'activation. */
  { key: "Content-Security-Policy-Report-Only", value: CSP },

  /* Ceux-ci sont sans effet sur le rendu et peuvent être posés d'emblée. */

  // Interdit le rendu du site dans une iframe tierce (clickjacking : un
  // ajout au panier ou une validation déclenchés à l'insu de la visiteuse).
  { key: "X-Frame-Options", value: "DENY" },
  // Empêche le navigateur de deviner un type MIME et d'exécuter comme
  // script un fichier servi autrement.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Sans ça, l'URL complète part en Referer vers les domaines tiers — dont
  // /account/orders/<id>, qui porte un identifiant de commande.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Le site n'utilise ni caméra, ni micro, ni géolocalisation.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  // Impose HTTPS pour deux ans. `preload` n'a d'effet qu'après inscription
  // sur hstspreload.org — à ne faire qu'une fois le domaine stabilisé.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
