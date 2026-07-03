import { shopifyFetch } from "./client";
import { FEATURED_PRODUCTS_QUERY } from "./queries";
import type { FeaturedProductsResponse, Product, ShopifyProductNode } from "./types";

function mapProduct(node: ShopifyProductNode): Product {
  const price = Number(node.priceRange.minVariantPrice.amount);
  const compareAt = Number(node.compareAtPriceRange.minVariantPrice.amount);
  const tags = node.tags.map((t) => t.toLowerCase());

  const tag: Product["tag"] = !node.availableForSale
    ? "SOLD"
    : tags.includes("new")
      ? "NEW"
      : tags.includes("one-of-one") || tags.includes("1-of-1")
        ? "1 OF 1"
        : null;

  const images = node.images.edges.map((e) => e.node.url);
  const imageA = node.featuredImage?.url ?? images[0] ?? "";
  const imageB = images[1] ?? imageA;

  const variant = node.variants.edges[0]?.node;
  const meta = variant && variant.title !== "Default Title" ? variant.title : "";

  return {
    id: node.id,
    handle: node.handle,
    name: node.title,
    meta,
    price,
    was: compareAt > price ? compareAt : null,
    currency: node.priceRange.minVariantPrice.currencyCode,
    tag,
    imageA,
    imageB,
    variantId: variant?.id ?? null,
  };
}

export async function getFeaturedProducts(count = 8): Promise<Product[]> {
  const data = await shopifyFetch<FeaturedProductsResponse>(FEATURED_PRODUCTS_QUERY, { first: count });
  return data.products.edges.map((e) => mapProduct(e.node));
}
