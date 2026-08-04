// "Taille" vit dans les champs méta Catégorie de Shopify (namespace "shopify",
// clé "size") — un champ de taxonomie standard qui référence des metaobjects
// ("label") plutôt que de stocker directement du texte. On récupère la
// référence (valeur unique) et les références (valeur liste) en plus de la
// valeur brute, pour couvrir les deux formes possibles.
const SIZE_META_FIELDS = /* GraphQL */ `
  value
  type
  reference {
    ... on Metaobject {
      field(key: "label") { value }
    }
  }
  references(first: 5) {
    nodes {
      ... on Metaobject {
        field(key: "label") { value }
      }
    }
  }
`;

export const FEATURED_PRODUCTS_QUERY = /* GraphQL */ `
  query FeaturedProducts($first: Int!) {
    products(first: $first, sortKey: CREATED_AT, reverse: true) {
      edges {
        node {
          id
          handle
          title
          productType
          tags
          availableForSale
          featuredImage {
            url
            altText
          }
          images(first: 2) {
            edges {
              node {
                url
                altText
              }
            }
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          compareAtPriceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          variants(first: 1) {
            edges {
              node {
                id
                title
                availableForSale
              }
            }
          }
        }
      }
    }
  }
`;

// Shopify's category (taxonomy) metafields hold the size for products sold
// without variants — the case for one-of-one vintage. Their value is a
// metaobject reference, so the human-readable size lives in the referenced
// object's `label` field, not in `value` (which is a gid://).
const SIZE_METAFIELD_FRAGMENT = /* GraphQL */ `
  fragment SizeMetafield on Metafield {
    type
    value
    reference {
      ... on Metaobject {
        handle
        field(key: "label") {
          value
        }
      }
    }
    references(first: 20) {
      edges {
        node {
          ... on Metaobject {
            handle
            field(key: "label") {
              value
            }
          }
        }
      }
    }
  }
`;

// Whole-catalogue sweep for the Virtual Closet: needs the collection handles
// (to slot a piece into Hauts / Bas / module) and every source of sizing.
export const ALL_PRODUCTS_QUERY = /* GraphQL */ `
  ${SIZE_METAFIELD_FRAGMENT}
  query AllProducts($first: Int!, $after: String) {
    products(first: $first, after: $after, sortKey: CREATED_AT, reverse: true) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          id
          handle
          title
          productType
          tags
          availableForSale
          featuredImage {
            url
            altText
          }
          images(first: 2) {
            edges {
              node {
                url
                altText
              }
            }
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          collections(first: 10) {
            edges {
              node {
                handle
              }
            }
          }
          options {
            name
            values
          }
          sizeMeta: metafield(namespace: "shopify", key: "size") {
            ...SizeMetafield
          }
          sizeMeta2: metafield(namespace: "custom", key: "taille") {
            ...SizeMetafield
          }
          sizeMeta3: metafield(namespace: "shopify", key: "clothing-size") {
            ...SizeMetafield
          }
          sizeMeta4: metafield(namespace: "shopify", key: "shoe-size") {
            ...SizeMetafield
          }
          variants(first: 30) {
            edges {
              node {
                id
                title
                availableForSale
                price {
                  amount
                  currencyCode
                }
                selectedOptions {
                  name
                  value
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const PRODUCT_BY_HANDLE_QUERY = /* GraphQL */ `
  query ProductByHandle($handle: String!) {
    product(handle: $handle) {
      id
      handle
      title
      descriptionHtml
      tags
      availableForSale
      featuredImage {
        url
        altText
      }
      images(first: 8) {
        edges {
          node {
            url
            altText
          }
        }
      }
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      compareAtPriceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      etat: metafield(namespace: "custom", key: "etat") {
        value
      }
      sizeMeta: metafield(namespace: "shopify", key: "size") {
        ${SIZE_META_FIELDS}
      }
      collections(first: 10) {
        edges {
          node {
            handle
          }
        }
      }
      options {
        name
        optionValues {
          name
        }
      }
      variants(first: 10) {
        edges {
          node {
            id
            title
            availableForSale
            price {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`;

export const COLLECTION_BY_HANDLE_QUERY = /* GraphQL */ `
  query CollectionByHandle($handle: String!, $first: Int!) {
    collection(handle: $handle) {
      id
      title
      products(first: $first) {
        edges {
          node {
            id
            handle
            title
            productType
            tags
            availableForSale
            featuredImage {
              url
              altText
            }
            images(first: 2) {
              edges {
                node {
                  url
                  altText
                }
              }
            }
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            compareAtPriceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            options {
              name
              values
            }
            colorMeta: metafield(namespace: "shopify", key: "color-pattern") { value }
            colorMeta2: metafield(namespace: "custom", key: "couleur") { value }
            colorMeta3: metafield(namespace: "shopify", key: "colors") { value }
            colorMeta4: metafield(namespace: "descriptors", key: "color") { value }
            variants(first: 1) {
              edges {
                node {
                  id
                  title
                  availableForSale
                }
              }
            }
          }
        }
      }
    }
  }
`;

const CART_FRAGMENT = /* GraphQL */ `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    buyerIdentity {
      email
      customer {
        id
      }
    }
    cost {
      subtotalAmount {
        amount
        currencyCode
      }
    }
    lines(first: 100) {
      edges {
        node {
          id
          quantity
          merchandise {
            ... on ProductVariant {
              id
              title
              availableForSale
              price {
                amount
                currencyCode
              }
              image {
                url
                altText
              }
              product {
                title
                handle
                vendor
                etat: metafield(namespace: "custom", key: "etat") {
                  value
                }
                sizeMeta: metafield(namespace: "shopify", key: "size") {
                  ${SIZE_META_FIELDS}
                }
                options {
                  name
                  optionValues {
                    name
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const GET_CART_QUERY = /* GraphQL */ `
  ${CART_FRAGMENT}
  query GetCart($cartId: ID!) {
    cart(id: $cartId) {
      ...CartFields
    }
  }
`;

export const CART_CREATE_MUTATION = /* GraphQL */ `
  ${CART_FRAGMENT}
  mutation CartCreate($lines: [CartLineInput!]!, $buyerIdentity: CartBuyerIdentityInput) {
    cartCreate(input: { lines: $lines, buyerIdentity: $buyerIdentity }) {
      cart {
        ...CartFields
      }
      userErrors {
        message
      }
    }
  }
`;

export const CART_BUYER_IDENTITY_UPDATE_MUTATION = /* GraphQL */ `
  ${CART_FRAGMENT}
  mutation CartBuyerIdentityUpdate($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!) {
    cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
      cart {
        ...CartFields
      }
      userErrors {
        message
      }
    }
  }
`;

export const CART_LINES_ADD_MUTATION = /* GraphQL */ `
  ${CART_FRAGMENT}
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFields
      }
      userErrors {
        message
      }
    }
  }
`;

export const CART_LINES_UPDATE_MUTATION = /* GraphQL */ `
  ${CART_FRAGMENT}
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFields
      }
      userErrors {
        message
      }
    }
  }
`;

export const CART_LINES_REMOVE_MUTATION = /* GraphQL */ `
  ${CART_FRAGMENT}
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ...CartFields
      }
      userErrors {
        message
      }
    }
  }
`;
