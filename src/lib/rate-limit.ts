import "server-only";

/* ── Garde-fou de débit en mémoire ─────────────────────────────────────────
 *
 * Ce n'est PAS un rate limiting distribué : chaque instance serverless a son
 * propre compteur, donc la limite réelle est un multiple du nombre
 * d'instances chaudes. La protection de fond est la règle du pare-feu
 * Vercel, qui voit toutes les requêtes.
 *
 * Ce qu'il apporte quand même, et pourquoi il existe :
 *
 * - Le plan Hobby n'autorise QU'UNE règle de limitation de débit pour tout
 *   le projet. Les points d'entrée qu'elle ne couvre pas — les Server
 *   Actions, qui ne sont pas des chemins d'URL distincts — n'ont que ça.
 * - Il plafonne le coût d'une instance chaude et absorbe les rafales.
 * - Il survit à une règle de pare-feu désactivée par erreur.
 */

const WINDOW_MS = 10 * 60 * 1000;
const MAX_TRACKED = 5_000;

const hits = new Map<string, number[]>();

/**
 * Enregistre une tentative pour `key` et dit si le plafond est atteint.
 *
 * `key` doit inclure ce qu'on protège ET contre qui : une IP seule laisse
 * passer une attaque distribuée sur un même compte, un identifiant de compte
 * seul laisse une IP balayer tous les comptes.
 */
export function rateLimited(key: string, max: number, windowMs = WINDOW_MS): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);

  if (recent.length >= max) return true;

  recent.push(now);
  hits.set(key, recent);

  /* Borne mémoire : sans elle, une instance de longue vie accumulerait une
     entrée par clé vue. Purge grossière — le compteur est de toute façon
     approximatif par nature. */
  if (hits.size > MAX_TRACKED) hits.clear();

  return false;
}

/** L'IP de l'appelant, telle que Vercel la transmet. */
export function clientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}
