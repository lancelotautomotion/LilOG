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

export interface ShopifyProductDetailNode extends ShopifyProductNode {
  descriptionHtml: string;
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
  images: string[];
  variants: ProductVariant[];
}

// Flat shape consumed by <ProductCard> — mirrors the design prototype's data.jsx shape.
export interface Product {
  id: string;
  handle: string;
  name: string;
  meta: string;
  price: number;
  was: number | null;
  currency: string;
  tag: "NEW" | "1 OF 1" | "SOLD" | null;
  imageA: string;
  imageB: string;
  variantId: string | null;
}
