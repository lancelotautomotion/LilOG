const domain = process.env.SHOPIFY_STORE_DOMAIN;
const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const apiVersion = process.env.SHOPIFY_STOREFRONT_API_VERSION || "2025-01";

interface StorefrontResponse<T> {
  data?: T;
  errors?: { message: string }[];
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

  const res = await fetch(`https://${domain}/api/${apiVersion}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate },
  });

  if (!res.ok) {
    throw new Error(`Shopify Storefront API error: ${res.status} ${res.statusText}`);
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
