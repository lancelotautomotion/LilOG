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
