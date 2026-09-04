const domain = process.env.SHOPIFY_STORE_DOMAIN;
const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const apiVersion = process.env.SHOPIFY_STOREFRONT_API_VERSION || "2025-01";

interface StorefrontResponse<T> {
  data?: T;
  errors?: { message: string }[];
}

/* ── Tenue à la charge ─────────────────────────────────────────────────────
 *
 * Deux garde-fous qui manquaient, et qui comptent surtout au pire moment :
 * un pic de trafic.
 *
 * 1. UNE LIMITE DE TEMPS. Sans elle, un Shopify lent tient la fonction
 *    serverless ouverte jusqu'au délai maximal de Vercel. Sous charge, les
 *    requêtes s'empilent et c'est la plateforme entière qui tombe — pas
 *    seulement la page concernée. Mieux vaut renoncer vite.
 *
 * 2. UN RÉESSAI. Le Storefront API applique ses quotas par token
 *    d'application, donc partagés par toutes les visiteuses : un pic fait
 *    répondre 429 à des requêtes parfaitement légitimes. Une seconde
 *    tentative après une courte pause les récupère, là où l'échec sec
 *    vidait la page.
 */
const TIMEOUT_MS = 8_000;
const MAX_ATTEMPTS = 3;
const BACKOFF_MS = [300, 900];
/* Shopify peut demander d'attendre bien plus longtemps que ce qu'une page en
   cours de rendu peut se permettre : on plafonne, quitte à échouer. */
const MAX_RETRY_AFTER_MS = 2_000;

/** Erreur HTTP qui a une chance d'être passagère. */
class TransientHttpError extends Error {
  constructor(message: string, readonly retryAfterMs: number | null) {
    super(message);
    this.name = "TransientHttpError";
  }
}

function retryAfterMs(res: Response): number | null {
  const raw = res.headers.get("retry-after");
  if (!raw) return null;
  const seconds = Number(raw);
  if (!Number.isFinite(seconds) || seconds < 0) return null;
  return Math.min(seconds * 1000, MAX_RETRY_AFTER_MS);
}

/* 429 = quota dépassé, 408 = délai dépassé, 5xx = incident côté Shopify.
   Tout le reste (401, 404, 422…) vient de la requête elle-même : la rejouer
   à l'identique redonnerait la même erreur. */
function isTransientStatus(status: number): boolean {
  return status === 429 || status === 408 || status >= 500;
}

/* Panne de transport : délai dépassé (DOMException TimeoutError) ou échec
   réseau (TypeError levé par fetch). Les erreurs applicatives, elles, sont
   des Error ordinaires qu'on laisse remonter. */
function isTransportFailure(err: unknown): boolean {
  return err instanceof DOMException || err instanceof TypeError;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function attempt<T>(
  query: string,
  variables: Record<string, unknown> | undefined,
  revalidate: number,
): Promise<T> {
  const res = await fetch(`https://${domain}/api/${apiVersion}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token as string,
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!res.ok) {
    const message = `Shopify Storefront API error: ${res.status} ${res.statusText}`;
    if (isTransientStatus(res.status)) throw new TransientHttpError(message, retryAfterMs(res));
    throw new Error(message);
  }

  const json: StorefrontResponse<T> = await res.json();

  if (json.errors?.length) {
    throw new Error(`Shopify Storefront API error: ${json.errors.map((e) => e.message).join(", ")}`);
  }
  if (!json.data) {
    throw new Error("Shopify Storefront API error: empty response");
  }

  return json.data;
}

export async function shopifyFetch<T>(
  query: string,
  variables?: Record<string, unknown>,
  revalidate = 60
): Promise<T> {
  if (!domain || !token) {
    throw new Error(
      "Missing Shopify env vars: SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_ACCESS_TOKEN must be set."
    );
  }

  /* Une mutation ne se rejoue JAMAIS. Un `cartLinesAdd` relancé après un
     délai dépassé ajouterait la pièce une deuxième fois : le premier appel
     a très bien pu aboutir côté Shopify sans que la réponse nous revienne.
     Seules les lectures sont rejouables sans risque. */
  const isMutation = /^\s*mutation\b/.test(query);
  const maxAttempts = isMutation ? 1 : MAX_ATTEMPTS;

  for (let n = 1; ; n++) {
    try {
      return await attempt<T>(query, variables, revalidate);
    } catch (err) {
      const transient = err instanceof TransientHttpError || isTransportFailure(err);
      if (!transient || n >= maxAttempts) {
        // Un échec de transport n'est pas une Error exploitable en amont
        // (DOMException « signal timed out ») : on la traduit.
        if (isTransportFailure(err)) {
          throw new Error(
            `Shopify Storefront API unreachable (${n} tentative${n > 1 ? "s" : ""}): ${
              err instanceof Error ? err.message : String(err)
            }`,
          );
        }
        throw err;
      }

      const wait =
        (err instanceof TransientHttpError ? err.retryAfterMs : null) ??
        BACKOFF_MS[n - 1] ??
        BACKOFF_MS[BACKOFF_MS.length - 1];
      await sleep(wait);
    }
  }
}
