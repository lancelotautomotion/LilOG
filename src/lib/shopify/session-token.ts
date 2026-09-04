import "server-only";
import { headers } from "next/headers";
import { getToken } from "next-auth/jwt";

/* ── Lecture serveur du customerAccessToken Shopify ────────────────────────
 *
 * Le token ne transite plus par l'objet Session : le callback `session` de
 * `@/auth` n'expose qu'un booléen, parce que tout ce qu'on y pose est servi
 * en clair au navigateur par GET /api/auth/session. Il reste dans le JWT,
 * c'est-à-dire dans le cookie de session — httpOnly, chiffré, illisible
 * côté client — et c'est ce module qui l'en ressort.
 *
 * `server-only` fait échouer le build si un composant client importe ce
 * fichier par mégarde : c'est le garde-fou qui manquait quand le token
 * circulait en prop de composant.
 */

/* Auth.js dérive la clé de déchiffrement du JWT à partir du secret ET du
   nom du cookie, passé en `salt`. Ce nom change selon le protocole : le
   préfixe `__Secure-` n'existe qu'en HTTPS. Un salt qui ne correspond pas
   ne lève pas d'erreur — `getToken` renvoie simplement `null`, et le compte
   client se viderait sans un message. On essaie donc les deux, en
   commençant par celui de la production. */
const COOKIE_NAMES = [
  "__Secure-authjs.session-token",
  "authjs.session-token",
] as const;

/**
 * Le customerAccessToken Shopify de la session en cours, ou `null` si la
 * visiteuse n'est pas connectée / n'a pas de compte Shopify relié.
 *
 * Remplace les `(session as { shopifyToken?: string }).shopifyToken` qui
 * étaient disséminés dans les pages et les Server Actions.
 */
export async function getShopifyToken(): Promise<string | null> {
  /* `getToken` lit les cookies dans l'en-tête `cookie`, pas dans un jar :
     lui passer celui de `cookies()` le laisse repartir les mains vides.
     Passer l'en-tête brut a un second mérite — Auth.js fragmente le cookie
     de session en `…session-token.0`, `.1`… quand le JWT dépasse la taille
     limite, et son SessionStore les recolle depuis cet en-tête. */
  const cookieHeader = (await headers()).get("cookie");
  if (!cookieHeader) return null;

  for (const cookieName of COOKIE_NAMES) {
    // Sauter les noms absents évite un déchiffrement inutile. Le `.0` couvre
    // le cas fragmenté, où le cookie non suffixé n'existe pas.
    if (!cookieHeader.includes(`${cookieName}=`) && !cookieHeader.includes(`${cookieName}.0=`)) {
      continue;
    }

    const token = await getToken({
      req: { headers: new Headers({ cookie: cookieHeader }) } as never,
      secret: process.env.AUTH_SECRET,
      salt: cookieName,
      secureCookie: cookieName.startsWith("__Secure-"),
      cookieName,
    }).catch(() => null);

    if (token?.shopifyToken) return token.shopifyToken;
  }

  return null;
}
