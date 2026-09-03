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
      id email firstName lastName phone
    }
  }
`;

const CUSTOMER_WITH_ORDERS_QUERY = /* GraphQL */ `
  query CustomerWithOrders($token: String!) {
    customer(customerAccessToken: $token) {
      id email firstName lastName phone
      orders(first: 5, sortKey: PROCESSED_AT, reverse: true) {
        edges {
          node {
            id
            name
            orderNumber
            processedAt
            fulfillmentStatus
            financialStatus
            currentTotalPrice { amount currencyCode }
            lineItems(first: 3) {
              edges {
                node {
                  title
                  quantity
                  variant { image { url altText } price { amount currencyCode } }
                }
              }
            }
          }
        }
      }
    }
  }
`;

/* ⚠ Le Storefront API n'expose PAS de `customer.order(id:)` : le type
   Customer n'a qu'une connexion `orders`. L'ancienne requête interrogeait
   ce champ inexistant, la validation GraphQL échouait et CHAQUE page de
   détail répondait 404. On pagine donc la liste des commandes du client et
   on retient celle qui porte l'id demandé (voir shopifyGetCustomerOrder). */
const CUSTOMER_ORDER_QUERY = /* GraphQL */ `
  query CustomerOrder($token: String!, $cursor: String) {
    customer(customerAccessToken: $token) {
      orders(first: 30, after: $cursor, sortKey: PROCESSED_AT, reverse: true) {
        edges {
          node {
            id
            name
            orderNumber
            processedAt
            fulfillmentStatus
            financialStatus
            currentTotalPrice { amount currencyCode }
            subtotalPrice { amount currencyCode }
            totalShippingPrice { amount currencyCode }
            shippingAddress {
              firstName lastName address1 address2 city province zip country
            }
            # Suivi du colis : le transporteur et son lien de tracking une
            # fois la commande expédiée. statusUrl (page de suivi Shopify)
            # sert de repli quand le transporteur ne fournit pas d'URL.
            # NB : dans une requête, seul le commentaire « # » est valide.
            # Un commentaire de style JS casse le parsing du document
            # entier — la requête part quand même, Shopify la rejette, et
            # la page finit en 404 silencieux (déjà arrivé ici).
            statusUrl
            successfulFulfillments(first: 10) {
              trackingCompany
              trackingInfo(first: 10) { number url }
            }
            lineItems(first: 50) {
              edges {
                node {
                  title
                  quantity
                  variant {
                    title
                    price { amount currencyCode }
                    image { url altText }
                  }
                  originalTotalPrice { amount currencyCode }
                }
              }
            }
          }
        }
        pageInfo { hasNextPage endCursor }
      }
    }
  }
`;

const CUSTOMER_RECOVER = /* GraphQL */ `
  mutation customerRecover($email: String!) {
    customerRecover(email: $email) {
      customerUserErrors { code field message }
    }
  }
`;

const CUSTOMER_RESET = /* GraphQL */ `
  mutation customerReset($id: ID!, $input: CustomerResetInput!) {
    customerReset(id: $id, input: $input) {
      customerAccessToken { accessToken expiresAt }
      customerUserErrors { code field message }
    }
  }
`;

const CUSTOMER_UPDATE = /* GraphQL */ `
  mutation customerUpdate($token: String!, $customer: CustomerUpdateInput!) {
    customerUpdate(customerAccessToken: $token, customer: $customer) {
      customer { id email firstName lastName phone }
      customerUserErrors { code field message }
    }
  }
`;

export interface ShopifyCustomer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface ShopifyLineItem {
  title: string;
  quantity: number;
  variant: {
    title?: string;
    price?: { amount: string; currencyCode: string };
    image?: { url: string; altText: string | null } | null;
  } | null;
  originalTotalPrice?: { amount: string; currencyCode: string };
}

export interface ShopifyFulfillment {
  trackingCompany: string | null;
  trackingInfo: { number: string | null; url: string | null }[];
}

export interface ShopifyOrder {
  id: string;
  name: string;
  orderNumber: number;
  processedAt: string;
  fulfillmentStatus: string;
  financialStatus: string;
  currentTotalPrice: { amount: string; currencyCode: string };
  /* Optionnels : seule la requête de détail les demande, la liste des
     dernières commandes de /account ne les remonte pas. */
  statusUrl?: string;
  successfulFulfillments?: ShopifyFulfillment[] | null;
  subtotalPrice?: { amount: string; currencyCode: string };
  totalShippingPrice?: { amount: string; currencyCode: string };
  shippingAddress?: {
    firstName: string; lastName: string;
    address1: string; address2?: string;
    city: string; province?: string; zip: string; country: string;
  } | null;
  lineItems: { edges: { node: ShopifyLineItem }[] };
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
  }>(CUSTOMER_CREATE, { input: { email, password, firstName, lastName } }, 0).catch(() => null);

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
  }>(CUSTOMER_LOGIN, { input: { email, password } }, 0).catch(() => null);

  if (!data) return { token: null, error: "Erreur réseau" };
  const errs = data.customerAccessTokenCreate.customerUserErrors;
  if (errs.length > 0) return { token: null, error: errs[0].message };
  const token = data.customerAccessTokenCreate.customerAccessToken?.accessToken ?? null;
  return { token, error: token ? null : "Identifiants incorrects" };
}

/* Toujours "succès" côté appelant, qu'un compte existe ou non pour cet
   email : sans ça, ce formulaire deviendrait un moyen de vérifier quels
   emails ont un compte Lil'OG. */
export async function shopifyCustomerRecover(email: string): Promise<{ error: string | null }> {
  const data = await shopifyFetch<{
    customerRecover: { customerUserErrors: { message: string }[] };
  }>(CUSTOMER_RECOVER, { email }, 0).catch(() => null);

  if (!data) return { error: "Erreur réseau" };
  const errs = data.customerRecover.customerUserErrors;
  if (errs.length > 0) return { error: errs[0].message };
  return { error: null };
}

/* `id` est le GID complet (gid://shopify/Customer/<id>), reconstruit à
   partir de l'identifiant brut porté par le lien de l'email. */
export async function shopifyCustomerReset(
  id: string,
  resetToken: string,
  password: string,
): Promise<{ token: string | null; error: string | null }> {
  const data = await shopifyFetch<{
    customerReset: {
      customerAccessToken: { accessToken: string; expiresAt: string } | null;
      customerUserErrors: { message: string }[];
    };
  }>(CUSTOMER_RESET, { id, input: { resetToken, password } }, 0).catch(() => null);

  if (!data) return { token: null, error: "Erreur réseau" };
  const errs = data.customerReset.customerUserErrors;
  if (errs.length > 0) return { token: null, error: errs[0].message };
  const token = data.customerReset.customerAccessToken?.accessToken ?? null;
  return { token, error: token ? null : "Lien invalide ou expiré" };
}

export async function shopifyGetCustomer(token: string): Promise<ShopifyCustomer | null> {
  const data = await shopifyFetch<{ customer: ShopifyCustomer | null }>(
    CUSTOMER_QUERY,
    { token },
    0,
  ).catch(() => null);
  return data?.customer ?? null;
}

export async function shopifyGetCustomerWithOrders(token: string): Promise<{
  customer: ShopifyCustomer | null;
  orders: ShopifyOrder[];
}> {
  const data = await shopifyFetch<{
    customer: (ShopifyCustomer & {
      orders: { edges: { node: ShopifyOrder }[] };
    }) | null;
  }>(CUSTOMER_WITH_ORDERS_QUERY, { token }, 0).catch(() => null);

  if (!data?.customer) return { customer: null, orders: [] };
  const { orders, ...customer } = data.customer;
  return {
    customer,
    orders: orders.edges.map((e) => e.node),
  };
}

/* L'id Storefront d'une commande porte une signature en query string
   (`gid://shopify/Order/123?key=…`). On compare donc sur le GID nu, pour
   que le lien reste valable même si la signature change d'une requête à
   l'autre. */
function sameOrderId(a: string, b: string): boolean {
  return a.split("?")[0] === b.split("?")[0];
}

/* Nombre de pages parcourues au maximum : 30 commandes par page, soit les
   300 dernières. Au-delà, la commande est considérée introuvable plutôt
   que d'enchaîner les allers-retours à l'infini. */
const ORDER_LOOKUP_MAX_PAGES = 10;

interface CustomerOrdersPage {
  customer: {
    orders: {
      edges: { node: ShopifyOrder }[];
      pageInfo: { hasNextPage: boolean; endCursor: string | null };
    };
  } | null;
}

/* Une page de commandes. Fonction séparée, au type de retour explicite :
   dans la boucle ci-dessous, `cursor` est réassigné depuis la réponse, et
   inférer le tout sur place rendrait `cursor` et la réponse mutuellement
   dépendants — TS abandonne alors sur un `any` implicite. */
function fetchOrdersPage(
  token: string,
  cursor: string | null,
): Promise<CustomerOrdersPage | null> {
  return shopifyFetch<CustomerOrdersPage>(
    CUSTOMER_ORDER_QUERY,
    { token, cursor },
    0,
  ).catch(() => null);
}

export async function shopifyGetCustomerOrder(
  token: string,
  orderId: string,
): Promise<ShopifyOrder | null> {
  let cursor: string | null = null;

  for (let page = 0; page < ORDER_LOOKUP_MAX_PAGES; page++) {
    const data = await fetchOrdersPage(token, cursor);
    if (!data?.customer) return null;

    const { edges, pageInfo } = data.customer.orders;
    const match = edges.find((e) => sameOrderId(e.node.id, orderId));
    if (match) return match.node;

    if (!pageInfo.hasNextPage) return null;
    cursor = pageInfo.endCursor;
  }

  return null;
}

/* ── Addresses ─────────────────────────────────────────────────────────── */

const CUSTOMER_ADDRESSES_QUERY = /* GraphQL */ `
  query CustomerAddresses($token: String!) {
    customer(customerAccessToken: $token) {
      defaultAddress { id }
      addresses(first: 20) {
        edges {
          node { id firstName lastName address1 address2 city province zip country phone }
        }
      }
    }
  }
`;

const ADDRESS_CREATE = /* GraphQL */ `
  mutation customerAddressCreate($token: String!, $address: MailingAddressInput!) {
    customerAddressCreate(customerAccessToken: $token, address: $address) {
      customerAddress { id firstName lastName address1 address2 city province zip country phone }
      customerUserErrors { code field message }
    }
  }
`;

const ADDRESS_UPDATE = /* GraphQL */ `
  mutation customerAddressUpdate($token: String!, $id: ID!, $address: MailingAddressInput!) {
    customerAddressUpdate(customerAccessToken: $token, id: $id, address: $address) {
      customerAddress { id firstName lastName address1 address2 city province zip country phone }
      customerUserErrors { code field message }
    }
  }
`;

const ADDRESS_DELETE = /* GraphQL */ `
  mutation customerAddressDelete($token: String!, $id: ID!) {
    customerAddressDelete(customerAccessToken: $token, id: $id) {
      deletedCustomerAddressId
      customerUserErrors { code field message }
    }
  }
`;

const ADDRESS_DEFAULT = /* GraphQL */ `
  mutation customerDefaultAddressUpdate($token: String!, $addressId: ID!) {
    customerDefaultAddressUpdate(customerAccessToken: $token, addressId: $addressId) {
      customer { id }
      customerUserErrors { code field message }
    }
  }
`;

export interface ShopifyAddress {
  id: string;
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  province?: string;
  zip: string;
  country: string;
  phone?: string;
}

export interface AddressInput {
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  province?: string;
  zip: string;
  country: string;
  phone?: string;
}

export async function shopifyGetAddresses(token: string): Promise<{
  addresses: ShopifyAddress[];
  defaultAddressId: string | null;
}> {
  const data = await shopifyFetch<{
    customer: {
      defaultAddress: { id: string } | null;
      addresses: { edges: { node: ShopifyAddress }[] };
    } | null;
  }>(CUSTOMER_ADDRESSES_QUERY, { token }, 0).catch(() => null);

  if (!data?.customer) return { addresses: [], defaultAddressId: null };
  return {
    addresses: data.customer.addresses.edges.map((e) => e.node),
    defaultAddressId: data.customer.defaultAddress?.id ?? null,
  };
}

export async function shopifyCreateAddress(
  token: string,
  address: AddressInput,
): Promise<{ address: ShopifyAddress | null; error: string | null }> {
  const data = await shopifyFetch<{
    customerAddressCreate: {
      customerAddress: ShopifyAddress | null;
      customerUserErrors: { message: string }[];
    };
  }>(ADDRESS_CREATE, { token, address }, 0).catch(() => null);

  if (!data) return { address: null, error: "Erreur réseau" };
  const errs = data.customerAddressCreate.customerUserErrors;
  if (errs.length > 0) return { address: null, error: errs[0].message };
  return { address: data.customerAddressCreate.customerAddress, error: null };
}

export async function shopifyUpdateAddress(
  token: string,
  id: string,
  address: AddressInput,
): Promise<{ address: ShopifyAddress | null; error: string | null }> {
  const data = await shopifyFetch<{
    customerAddressUpdate: {
      customerAddress: ShopifyAddress | null;
      customerUserErrors: { message: string }[];
    };
  }>(ADDRESS_UPDATE, { token, id, address }, 0).catch(() => null);

  if (!data) return { address: null, error: "Erreur réseau" };
  const errs = data.customerAddressUpdate.customerUserErrors;
  if (errs.length > 0) return { address: null, error: errs[0].message };
  return { address: data.customerAddressUpdate.customerAddress, error: null };
}

export async function shopifyDeleteAddress(
  token: string,
  id: string,
): Promise<{ error: string | null }> {
  const data = await shopifyFetch<{
    customerAddressDelete: {
      deletedCustomerAddressId: string | null;
      customerUserErrors: { message: string }[];
    };
  }>(ADDRESS_DELETE, { token, id }, 0).catch(() => null);

  if (!data) return { error: "Erreur réseau" };
  const errs = data.customerAddressDelete.customerUserErrors;
  if (errs.length > 0) return { error: errs[0].message };
  return { error: null };
}

export async function shopifySetDefaultAddress(
  token: string,
  addressId: string,
): Promise<{ error: string | null }> {
  const data = await shopifyFetch<{
    customerDefaultAddressUpdate: {
      customer: { id: string } | null;
      customerUserErrors: { message: string }[];
    };
  }>(ADDRESS_DEFAULT, { token, addressId }, 0).catch(() => null);

  if (!data) return { error: "Erreur réseau" };
  const errs = data.customerDefaultAddressUpdate.customerUserErrors;
  if (errs.length > 0) return { error: errs[0].message };
  return { error: null };
}

export async function shopifyUpdateCustomer(
  token: string,
  input: { firstName?: string; lastName?: string; email?: string; phone?: string; password?: string },
): Promise<{ customer: ShopifyCustomer | null; error: string | null }> {
  const data = await shopifyFetch<{
    customerUpdate: {
      customer: ShopifyCustomer | null;
      customerUserErrors: { message: string }[];
    };
  }>(CUSTOMER_UPDATE, { token, customer: input }, 0).catch(() => null);

  if (!data) return { customer: null, error: "Erreur réseau" };
  const errs = data.customerUpdate.customerUserErrors;
  if (errs.length > 0) return { customer: null, error: errs[0].message };
  return { customer: data.customerUpdate.customer, error: null };
}
