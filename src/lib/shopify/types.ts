export interface ShopifyMoney {
  amount: string;
  currencyCode: string;
}

export interface ShopifyImage {
  url: string;
  altText: string | null;
}

export interface ShopifyProductNode {
  id: string;
  handle: string;
  title: string;
  productType: string;
  tags: string[];
  availableForSale: boolean;
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
  collections: string[];
  images: string[];
  // `variants` excludes the synthetic "Default Title" variant Shopify creates
  // for single-variant products (nothing to pick), but that variant's id is
  // still what a cart line needs — kept here as the add-to-cart fallback.
  defaultVariantId: string | null;
  variants: ProductVariant[];
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
  imageA: string;
  imageB: string;
  variantId: string | null;
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
    product: { title: string; handle: string };
  };
}

export interface ShopifyCartNode {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
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
}

export interface Cart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  subtotal: number;
  currency: string;
  lines: CartLine[];
}
