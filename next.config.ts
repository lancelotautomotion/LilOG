import type { NextConfig } from "next";

/* ── En-têtes de sécurité ──────────────────────────────────────────────────
 *
 * La CSP est désormais BLOQUANTE. Elle a d'abord vécu en Report-Only, le
 * temps d'inventorier ce que les pages chargent réellement en production :
 *
 *   - scripts : uniquement /_next/static (même origine) + le gtag de Google
 *   - images  : cdn.shopify.com, plus les data: URI des vignettes de repli
 *   - polices : auto-hébergées par next/font, aucune requête à Google
 *   - médias  : /hero/camcorder.mp4 et /sounds/key.mp3, même origine
 *   - Instagram et TikTok n'apparaissent QUE dans des <a href> : la CSP ne
 *     gouverne pas la navigation, seulement le chargement de ressources.
 *
 * C'est le dernier verrou contre les XSS, et celui qui compte le plus ici :
 * les descriptions produit sont générées par un modèle de langage à partir
 * des photos, puis injectées en dangerouslySetInnerHTML. L'assainissement
 * les nettoie déjà ; la CSP est le filet en dessous.
 *
 * `unsafe-inline` sur script-src reste nécessaire tant que Next.js pose ses
 * propres scripts inline (ainsi que les extraits GA et Meta). S'en passer
 * suppose une CSP à nonce via middleware — chantier séparé, qui obligerait
 * d'ailleurs à repasser toutes les routes en rendu dynamique.
 *
 * POUR REVENIR EN ARRIÈRE en cas de casse : renommer la clé plus bas en
 * "Content-Security-Policy-Report-Only". La directive redevient une simple
 * observation, sans rien bloquer.
 */
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://connect.facebook.net",
  "style-src 'self' 'unsafe-inline'",
  /* Les jokers sur les domaines de Google Analytics ne sont pas de la
     paresse : GA4 émet vers un point d'entrée régionalisé (region1, region2…)
     choisi selon la localisation de la visiteuse. Les énumérer un par un
     laisserait tomber la mesure pour une partie du monde, en silence. */
  "img-src 'self' data: blob: https://cdn.shopify.com https://www.googletagmanager.com https://*.google-analytics.com https://www.facebook.com",
  "font-src 'self' data:",
  "connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com https://connect.facebook.net https://www.facebook.com",
  // Vidéo de l'accueil et son du téléphone Y2K, tous deux servis par le site.
  "media-src 'self'",
  /* Next sert certains travailleurs depuis une URL blob: ; l'omettre est un
     grand classique des CSP qui cassent après coup. */
  "worker-src 'self' blob:",
  /* Le tunnel de paiement est un sous-domaine à part (checkout.lilog.shop),
     distinct du site : il manquait, et l'oubli ne se serait vu qu'au moment
     de payer. */
  "form-action 'self' https://checkout.lilog.shop https://shop.app https://checkout.shopify.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: CSP },

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
