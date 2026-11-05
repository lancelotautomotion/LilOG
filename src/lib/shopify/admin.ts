import "server-only";

/* ============================================================
   Shopify Admin API : le strict nécessaire, côté serveur
   ------------------------------------------------------------
   Deux usages, et seulement deux :
   1. inscrire une adresse à la newsletter (team Lil'OG / STAR10),
      comme fiche client abonnée au marketing par e-mail ;
   2. retrouver une fiche « dormante » (abonnée, ou cliente passée
      en invitée) pour l'activer quand sa titulaire crée son compte,
      au lieu que Shopify refuse la création (voir dormant-account).

   Le jeton Admin donne la main sur toutes les fiches clients : il
   ne vit que dans la variable SHOPIFY_ADMIN_ACCESS_TOKEN (Vercel),
   `server-only` interdit d'importer ce module dans un composant
   client, et aucune valeur n'est jamais journalisée.

   Sans jeton, `adminConfigured()` vaut false et chaque appelant
   retombe sur son comportement d'avant : rien ne casse.

   Comme pour le Storefront API, une mutation n'est jamais rejouée.
   ============================================================ */

const domain = process.env.SHOPIFY_STORE_DOMAIN;
const apiVersion = process.env.SHOPIFY_ADMIN_API_VERSION || "2025-01";
const TIMEOUT_MS = 8_000;

export function adminConfigured(): boolean {
  return Boolean(domain && process.env.SHOPIFY_ADMIN_ACCESS_TOKEN);
}

async function adminFetch<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const token = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  if (!domain || !token) throw new Error("Shopify Admin API non configurée");

  const res = await fetch(`https://${domain}/admin/api/${apiVersion}/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": token },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`Shopify Admin API error: ${res.status}`);

  const json = (await res.json()) as { data?: T; errors?: { message: string }[] };
  if (json.errors?.length) {
    throw new Error(`Shopify Admin API error: ${json.errors.map((e) => e.message).join(", ")}`);
  }
  if (!json.data) throw new Error("Shopify Admin API error: empty response");
  return json.data;
}

type UserError = { field?: string[] | null; message: string };

/* ── Recherche d'une fiche par e-mail ─────────────────────────────────── */

export interface AdminCustomer {
  id: string;
  email: string | null;
  /** DISABLED / INVITED : fiche sans compte activé. ENABLED : compte avec mot de passe. */
  state: "DISABLED" | "INVITED" | "ENABLED" | "DECLINED";
  numberOfOrders: string;
  defaultAddress: { id: string } | null;
}

const FIND_CUSTOMER = /* GraphQL */ `
  query findCustomer($query: String!) {
    customers(first: 5, query: $query) {
      nodes { id email state numberOfOrders defaultAddress { id } }
    }
  }
`;

/** Échappe une valeur pour la syntaxe de recherche Shopify (entre guillemets). */
function searchLiteral(value: string): string {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

/**
 * La fiche portant EXACTEMENT cet e-mail, ou null. La recherche Shopify
 * étant approximative, le résultat est revérifié à l'égalité stricte.
 */
export async function findCustomerByEmail(email: string): Promise<AdminCustomer | null> {
  const wanted = email.trim().toLowerCase();
  const data = await adminFetch<{ customers: { nodes: AdminCustomer[] } }>(FIND_CUSTOMER, {
    query: `email:${searchLiteral(wanted)}`,
  });
  return data.customers.nodes.find((c) => c.email?.toLowerCase() === wanted) ?? null;
}

/* ── Inscription newsletter ───────────────────────────────────────────── */

const NEWSLETTER_TAG = "star-club";

const CREATE_SUBSCRIBER = /* GraphQL */ `
  mutation createSubscriber($input: CustomerInput!) {
    customerCreate(input: $input) {
      customer { id }
      userErrors { field message }
    }
  }
`;

const UPDATE_CONSENT = /* GraphQL */ `
  mutation updateConsent($input: CustomerEmailMarketingConsentUpdateInput!) {
    customerEmailMarketingConsentUpdate(input: $input) {
      customer { id }
      userErrors { field message }
    }
  }
`;

const ADD_TAGS = /* GraphQL */ `
  mutation addTags($id: ID!, $tags: [String!]!) {
    tagsAdd(id: $id, tags: $tags) {
      node { id }
      userErrors { field message }
    }
  }
`;

/**
 * Abonne l'adresse au marketing par e-mail et l'étiquette `star-club`.
 * - Pas de fiche : on en crée une, sans compte (aucun mot de passe).
 * - Fiche existante : on ne touche qu'au consentement et à l'étiquette,
 *   jamais au compte, au nom ni aux adresses.
 */
export async function subscribeToNewsletter(email: string): Promise<void> {
  const consent = {
    marketingState: "SUBSCRIBED",
    marketingOptInLevel: "SINGLE_OPT_IN",
    consentUpdatedAt: new Date().toISOString(),
  };

  const existing = await findCustomerByEmail(email);

  if (!existing) {
    const data = await adminFetch<{ customerCreate: { userErrors: UserError[] } }>(CREATE_SUBSCRIBER, {
      input: { email, tags: [NEWSLETTER_TAG], emailMarketingConsent: consent },
    });
    if (data.customerCreate.userErrors.length) {
      throw new Error(`customerCreate: ${data.customerCreate.userErrors.map((e) => e.message).join(", ")}`);
    }
    return;
  }

  const consentRes = await adminFetch<{ customerEmailMarketingConsentUpdate: { userErrors: UserError[] } }>(
    UPDATE_CONSENT,
    { input: { customerId: existing.id, emailMarketingConsent: consent } },
  );
  const tagRes = await adminFetch<{ tagsAdd: { userErrors: UserError[] } }>(ADD_TAGS, {
    id: existing.id,
    tags: [NEWSLETTER_TAG],
  });
  const errs = [
    ...consentRes.customerEmailMarketingConsentUpdate.userErrors,
    ...tagRes.tagsAdd.userErrors,
  ];
  if (errs.length) throw new Error(`newsletter update: ${errs.map((e) => e.message).join(", ")}`);
}

/* ── Activation d'une fiche dormante ──────────────────────────────────── */

const ACTIVATION_URL = /* GraphQL */ `
  mutation activationUrl($customerId: ID!) {
    customerGenerateAccountActivationUrl(customerId: $customerId) {
      accountActivationUrl
      userErrors { field message }
    }
  }
`;

/** URL d'activation à usage unique, consommée aussitôt côté serveur. Jamais exposée. */
export async function generateActivationUrl(customerId: string): Promise<string | null> {
  const data = await adminFetch<{
    customerGenerateAccountActivationUrl: { accountActivationUrl: string | null; userErrors: UserError[] };
  }>(ACTIVATION_URL, { customerId });
  const r = data.customerGenerateAccountActivationUrl;
  if (r.userErrors.length || !r.accountActivationUrl) return null;
  return r.accountActivationUrl;
}
