// "Taille" vit dans les champs méta Catégorie de Shopify (namespace "shopify",
// clé "size"), un champ de taxonomie standard qui référence des metaobjects
// ("label") plutôt que de stocker directement du texte. On récupère la
// référence (valeur unique) et les références (valeur liste) en plus de la
// valeur brute, pour couvrir les deux formes possibles.
// Sélection de champs partagée par toute donnée pouvant être soit du texte
// simple soit une référence (ou liste de références) à un metaobject de
// taxonomie Shopify, c'est la forme exacte des champs méta Catégorie
// (Taille, Couleur, Matière…). Un seul jeu de champs pour les trois plutôt
// que trois fragments identiques.
const RICH_METAFIELD_FIELDS = /* GraphQL */ `
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
          etat: metafield(namespace: "custom", key: "etat") {
            value
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

// Le catalogue entier ("Tout voir"), même sélection de champs que
// COLLECTION_BY_HANDLE_QUERY mais interrogée à la racine (pas de collection
// à traverser) : sans les champs méta Couleur/Taille/Matière et les options
// de variante, FILTER_CONTROL.SYS et la pastille de taille de ProductWindow
// n'ont rien à afficher, comme pour FEATURED_PRODUCTS_QUERY plus haut.
export const CATALOG_PRODUCTS_QUERY = /* GraphQL */ `
  query CatalogProducts($first: Int!) {
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
          options {
            name
            values
          }
          colorMeta: metafield(namespace: "shopify", key: "color-pattern") { ${RICH_METAFIELD_FIELDS} }
          colorMeta2: metafield(namespace: "custom", key: "couleur") { ${RICH_METAFIELD_FIELDS} }
          colorMeta3: metafield(namespace: "shopify", key: "colors") { ${RICH_METAFIELD_FIELDS} }
          colorMeta4: metafield(namespace: "descriptors", key: "color") { ${RICH_METAFIELD_FIELDS} }
          sizeMeta: metafield(namespace: "shopify", key: "size") { ${RICH_METAFIELD_FIELDS} }
          sizeMeta2: metafield(namespace: "custom", key: "taille") { ${RICH_METAFIELD_FIELDS} }
          sizeMeta3: metafield(namespace: "shopify", key: "clothing-size") { ${RICH_METAFIELD_FIELDS} }
          sizeMeta4: metafield(namespace: "shopify", key: "shoe-size") { ${RICH_METAFIELD_FIELDS} }
          materialMeta: metafield(namespace: "shopify", key: "fabric") { ${RICH_METAFIELD_FIELDS} }
          materialMeta2: metafield(namespace: "custom", key: "matiere") { ${RICH_METAFIELD_FIELDS} }
          materialMeta3: metafield(namespace: "custom", key: "composition") { ${RICH_METAFIELD_FIELDS} }
          etat: metafield(namespace: "custom", key: "etat") {
            value
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

// Les pièces portant un tag Shopify donné ("tag:louna-pick" pour les coups de
// cœur de la maison, qui alimentent PLAYLIST_HIGHLIGHTS.EXE sur l'accueil).
// Même sélection de champs que CATALOG_PRODUCTS_QUERY, champs méta Taille
// compris : sans eux, l'afficheur du lecteur retomberait sur "ONE SIZE" pour
// toutes les pièces, alors que la taille est justement l'information que le
// visiteur cherche. `query` accepte la syntaxe de recherche Storefront, donc
// `tag:'...'` filtre côté Shopify, sans rapatrier tout le catalogue.
export const TAGGED_PRODUCTS_QUERY = /* GraphQL */ `
  query TaggedProducts($query: String!, $first: Int!) {
    products(first: $first, query: $query, sortKey: CREATED_AT, reverse: true) {
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
          sizeMeta: metafield(namespace: "shopify", key: "size") { ${RICH_METAFIELD_FIELDS} }
          sizeMeta2: metafield(namespace: "custom", key: "taille") { ${RICH_METAFIELD_FIELDS} }
          sizeMeta3: metafield(namespace: "shopify", key: "clothing-size") { ${RICH_METAFIELD_FIELDS} }
          sizeMeta4: metafield(namespace: "shopify", key: "shoe-size") { ${RICH_METAFIELD_FIELDS} }
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
// without variants, the case for one-of-one vintage. Their value is a
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
// Recherche texte libre : `query` accepte la syntaxe de recherche standard
// Storefront et, laissé en texte brut (sans préfixe de champ), fait déjà une
// recherche plein texte sur le titre, le type de produit, le vendeur et les
// tags, pas besoin de construire un filtre `title:*...*` à la main. Le
// résultat passe par le même mapProduct() et rend avec les mêmes
// ProductWindow que le catalogue : même sélection de champs méta Taille/État
// que TAGGED_PRODUCTS_QUERY, sans quoi la pastille de taille retomberait sur
// les options de variante (souvent vide sur ces pièces vintage vendues en
// "Default Title") et la pastille État n'aurait tout simplement rien à
// afficher.
export const SEARCH_PRODUCTS_QUERY = /* GraphQL */ `
  query SearchProducts($query: String!, $first: Int!) {
    products(first: $first, query: $query, sortKey: RELEVANCE) {
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
          sizeMeta: metafield(namespace: "shopify", key: "size") { ${RICH_METAFIELD_FIELDS} }
          sizeMeta2: metafield(namespace: "custom", key: "taille") { ${RICH_METAFIELD_FIELDS} }
          sizeMeta3: metafield(namespace: "shopify", key: "clothing-size") { ${RICH_METAFIELD_FIELDS} }
          sizeMeta4: metafield(namespace: "shopify", key: "shoe-size") { ${RICH_METAFIELD_FIELDS} }
          etat: metafield(namespace: "custom", key: "etat") {
            value
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
        ${RICH_METAFIELD_FIELDS}
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
            colorMeta: metafield(namespace: "shopify", key: "color-pattern") { ${RICH_METAFIELD_FIELDS} }
            colorMeta2: metafield(namespace: "custom", key: "couleur") { ${RICH_METAFIELD_FIELDS} }
            colorMeta3: metafield(namespace: "shopify", key: "colors") { ${RICH_METAFIELD_FIELDS} }
            colorMeta4: metafield(namespace: "descriptors", key: "color") { ${RICH_METAFIELD_FIELDS} }
            sizeMeta: metafield(namespace: "shopify", key: "size") { ${RICH_METAFIELD_FIELDS} }
            sizeMeta2: metafield(namespace: "custom", key: "taille") { ${RICH_METAFIELD_FIELDS} }
            sizeMeta3: metafield(namespace: "shopify", key: "clothing-size") { ${RICH_METAFIELD_FIELDS} }
            sizeMeta4: metafield(namespace: "shopify", key: "shoe-size") { ${RICH_METAFIELD_FIELDS} }
            materialMeta: metafield(namespace: "shopify", key: "fabric") { ${RICH_METAFIELD_FIELDS} }
            materialMeta2: metafield(namespace: "custom", key: "matiere") { ${RICH_METAFIELD_FIELDS} }
            materialMeta3: metafield(namespace: "custom", key: "composition") { ${RICH_METAFIELD_FIELDS} }
            etat: metafield(namespace: "custom", key: "etat") {
              value
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
                  ${RICH_METAFIELD_FIELDS}
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

export const ALL_COLLECTIONS_QUERY = /* GraphQL */ `
  query AllCollections($first: Int!, $after: String) {
    collections(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          id
          handle
          title
          updatedAt
        }
      }
    }
  }
`;
