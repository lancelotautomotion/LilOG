import { shopifyFetch } from "./client";

const CUSTOMER_CREATE = /* GraphQL */ `
  mutation customerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer { id email firstName lastName }
      customerUserErrors { code field message }
    }
  }
`;

const CUSTOMER_LOGIN = /* GraphQL */ `
  mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
    customerAccessTokenCreate(input: $input) {
      customerAccessToken { accessToken expiresAt }
      customerUserErrors { code field message }
    }
  }
`;

const CUSTOMER_QUERY = /* GraphQL */ `
  query customer($token: String!) {
    customer(customerAccessToken: $token) {
      id email firstName lastName
    }
  }
`;

export interface ShopifyCustomer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export async function shopifyCustomerCreate(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
): Promise<{ customer: ShopifyCustomer | null; error: string | null }> {
  const data = await shopifyFetch<{
    customerCreate: {
      customer: ShopifyCustomer | null;
      customerUserErrors: { message: string }[];
    };
  }>(CUSTOMER_CREATE, { input: { email, password, firstName, lastName } }).catch(() => null);

  if (!data) return { customer: null, error: "Erreur réseau" };
  const errs = data.customerCreate.customerUserErrors;
  if (errs.length > 0) return { customer: null, error: errs[0].message };
  return { customer: data.customerCreate.customer, error: null };
}

export async function shopifyCustomerLogin(
  email: string,
  password: string,
): Promise<{ token: string | null; error: string | null }> {
  const data = await shopifyFetch<{
    customerAccessTokenCreate: {
      customerAccessToken: { accessToken: string; expiresAt: string } | null;
      customerUserErrors: { message: string }[];
    };
  }>(CUSTOMER_LOGIN, { input: { email, password } }).catch(() => null);

  if (!data) return { token: null, error: "Erreur réseau" };
  const errs = data.customerAccessTokenCreate.customerUserErrors;
  if (errs.length > 0) return { token: null, error: errs[0].message };
  const token = data.customerAccessTokenCreate.customerAccessToken?.accessToken ?? null;
  return { token, error: token ? null : "Identifiants incorrects" };
}

export async function shopifyGetCustomer(token: string): Promise<ShopifyCustomer | null> {
  const data = await shopifyFetch<{ customer: ShopifyCustomer | null }>(
    CUSTOMER_QUERY,
    { token },
  ).catch(() => null);
  return data?.customer ?? null;
}
