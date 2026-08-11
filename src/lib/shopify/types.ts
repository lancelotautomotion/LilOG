export interface ShopifyMoney {
  amount: string;
  currencyCode: string;
}

export interface ShopifyImage {
  url: string;
  altText: string | null;
}

// Champ méta pouvant être du texte brut OU une référence à un metaobject de
// taxonomie Shopify (ex. le champ méta Catégorie "Taille").
export interface RichMetafield {
  value: string;
  type?: string;
  reference?: { field: { value: string } | null } | null;
  references?: { nodes: { field: { value: string } | null }[] } | null;
}

export interface ShopifyProductNode {
  id: string;
  handle: string;
  title: string;
  productType: string;
  tags: string[];
  availableForSale: boolean;
  options?: { name: string; values?: string[]; optionValues?: { name: string }[] }[];
  // Couleur, taille, matière : chacune interrogée sur plusieurs espaces de
  // noms candidats (le champ standard Shopify d'abord, puis les champs
  // méta maison) — les boutiques ne rangent pas toutes ces informations
  // au même endroit. `RichMetafield` couvre les deux formes possibles :
  // texte simple ou référence à un metaobject de taxonomie.
  colorMeta?: RichMetafield | null;
  colorMeta2?: RichMetafield | null;
  colorMeta3?: RichMetafield | null;
  colorMeta4?: RichMetafield | null;
  sizeMeta?: RichMetafield | null;
  sizeMeta2?: RichMetafield | null;
  sizeMeta3?: RichMetafield | null;
  sizeMeta4?: RichMetafield | null;
  materialMeta?: RichMetafield | null;
  materialMeta2?: RichMetafield | null;
  materialMeta3?: RichMetafield | null;
  featuredImage: ShopifyImage | null;
  images: { edges: { node: ShopifyImage }[] };
  priceRange: { minVariantPrice: ShopifyMoney };
  compareAtPriceRange: { minVariantPrice: ShopifyMoney };
  variants: { edges: { node: { id: string; title: string; availableForSale: boolean } }[] };
}

export interface FeaturedProductsResponse {
  products: { edges: { node: ShopifyProductNode }[] };
}

export interface CollectionByHandleResponse {
  collection: { id: string; title: string; products: { edges: { node: ShopifyProductNode }[] } } | null;
}

export interface ShopifyProductDetailNode extends ShopifyProductNode {
  descriptionHtml: string;
  etat: { value: string } | null;
  sizeMeta: RichMetafield | null;
  options: { name: string; values?: string[]; optionValues?: { name: string }[] }[];
  collections: { edges: { node: { handle: string } }[] };
  images: { edges: { node: ShopifyImage }[] };
  variants: {
    edges: {
      node: {
        id: string;
        title: string;
        availableForSale: boolean;
        price: ShopifyMoney;
      };
    }[];
  };
}

export interface ProductByHandleResponse {
  product: ShopifyProductDetailNode | null;
}

export interface ProductVariant {
  id: string;
  title: string;
  price: number;
  availableForSale: boolean;
}

// Richer shape for the PDP — full image set, description, variants.
export interface ProductDetail {
  id: string;
  handle: string;
  name: string;
  descriptionHtml: string;
  tags: string[];
  price: number;
  was: number | null;
  currency: string;
  tag: "NEW" | "1 OF 1" | "SOLD" | null;
  available: boolean;
  etat: string | null;
  collections: string[];
  images: string[];
  // `variants` excludes the synthetic "Default Title" variant Shopify creates
  // for single-variant products (nothing to pick), but that variant's id is
  // still what a cart line needs — kept here as the add-to-cart fallback.
  defaultVariantId: string | null;
  variants: ProductVariant[];
  size: string | null;
}

// Flat shape consumed by <ProductCard> — mirrors the design prototype's data.jsx shape.
export interface Product {
  id: string;
  handle: string;
  name: string;
  meta: string;
  productType: string;
  price: number;
  was: number | null;
  currency: string;
  tag: "NEW" | "1 OF 1" | "SOLD" | null;
  tags: string[];
  colors: string[];
  /** Tailles normalisées ("S", "38", …) — alimente le filtre du catalogue. */
  sizes: string[];
  /** Matières (« Coton », « Polyester »…) — alimente le filtre du catalogue. */
  materials: string[];
  imageA: string;
  imageB: string;
  variantId: string | null;
}

// ---- Virtual Closet (/dressing-machine) ----

/** Taxonomy metaobject holding one taxonomy value ("M", "Rouge", …). */
export interface ShopifyTaxonomyValue {
  handle: string | null;
  field: { value: string } | null;
}

export interface ShopifySizeMetafield {
  type: string;
  value: string;
  /** Set for single-value metafields. */
  reference: ShopifyTaxonomyValue | null;
  /** Set for list metafields. */
  references: { edges: { node: ShopifyTaxonomyValue }[] } | null;
}

export interface ShopifyClosetNode {
  id: string;
  handle: string;
  title: string;
  productType: string;
  tags: string[];
  availableForSale: boolean;
  featuredImage: ShopifyImage | null;
  images: { edges: { node: ShopifyImage }[] };
  priceRange: { minVariantPrice: ShopifyMoney };
  collections: { edges: { node: { handle: string } }[] };
  options?: { name: string; values?: string[] }[];
  sizeMeta?: ShopifySizeMetafield | null;
  sizeMeta2?: ShopifySizeMetafield | null;
  sizeMeta3?: ShopifySizeMetafield | null;
  sizeMeta4?: ShopifySizeMetafield | null;
  variants: {
    edges: {
      node: {
        id: string;
        title: string;
        availableForSale: boolean;
        price: ShopifyMoney;
        selectedOptions: { name: string; value: string }[];
      };
    }[];
  };
}

export interface AllProductsResponse {
  products: {
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
    edges: { node: ShopifyClosetNode }[];
  };
}

/** Where a catalogue piece hangs in the Virtual Closet. */
export type ClosetSlot = "top" | "bottom" | "jewelry" | "bag" | "accessory" | "shoes";

export interface ClosetVariant {
  id: string;
  title: string;
  available: boolean;
  price: number;
  /** Canonical size, or null for one-size / unsized variants. */
  size: string | null;
}

export interface ClosetItem {
  id: string;
  handle: string;
  name: string;
  slot: ClosetSlot;
  productType: string;
  price: number;
  currency: string;
  image: string;
  /** Buyable sizes. Empty = one-size, matches whatever the shopper picked. */
  sizes: string[];
  variants: ClosetVariant[];
}

// ---- Cart (Storefront Cart API) ----

export interface ShopifyCartLineNode {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    availableForSale: boolean;
    price: ShopifyMoney;
    image: ShopifyImage | null;
    product: {
      title: string;
      handle: string;
      vendor: string;
      etat: { value: string } | null;
      sizeMeta: RichMetafield | null;
      options?: { name: string; optionValues?: { name: string }[] }[];
    };
  };
}

export interface ShopifyCartNode {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  buyerIdentity?: { email: string | null; customer: { id: string } | null };
  cost: { subtotalAmount: ShopifyMoney };
  lines: { edges: { node: ShopifyCartLineNode }[] };
}

export interface CartResponse {
  cart: ShopifyCartNode | null;
}
export interface CartCreateResponse {
  cartCreate: { cart: ShopifyCartNode | null; userErrors: { message: string }[] };
}
export interface CartLinesAddResponse {
  cartLinesAdd: { cart: ShopifyCartNode | null; userErrors: { message: string }[] };
}
export interface CartLinesUpdateResponse {
  cartLinesUpdate: { cart: ShopifyCartNode | null; userErrors: { message: string }[] };
}
export interface CartLinesRemoveResponse {
  cartLinesRemove: { cart: ShopifyCartNode | null; userErrors: { message: string }[] };
}
export interface CartBuyerIdentityUpdateResponse {
  cartBuyerIdentityUpdate: { cart: ShopifyCartNode | null; userErrors: { message: string }[] };
}

export interface CartLine {
  id: string;
  variantId: string;
  quantity: number;
  title: string;
  variantTitle: string;
  handle: string;
  price: number;
  image: string;
  available: boolean;
  vendor: string;
  etat: string | null;
  size: string | null;
}

export interface Cart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  subtotal: number;
  currency: string;
  lines: CartLine[];
}
