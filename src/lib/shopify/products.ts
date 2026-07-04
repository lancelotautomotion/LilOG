import { shopifyFetch } from "./client";
import { FEATURED_PRODUCTS_QUERY, PRODUCT_BY_HANDLE_QUERY } from "./queries";
import type {
  FeaturedProductsResponse,
  Product,
  ProductByHandleResponse,
  ProductDetail,
  ShopifyProductNode,
} from "./types";

function computeTag(tags: string[], availableForSale: boolean): Product["tag"] {
  const lower = tags.map((t) => t.toLowerCase());
  return !availableForSale
    ? "SOLD"
    : lower.includes("new")
      ? "NEW"
      : lower.includes("one-of-one") || lower.includes("1-of-1")
        ? "1 OF 1"
        : null;
}

function mapProduct(node: ShopifyProductNode): Product {
  const price = Number(node.priceRange.minVariantPrice.amount);
  const compareAt = Number(node.compareAtPriceRange.minVariantPrice.amount);
  const tag = computeTag(node.tags, node.availableForSale);

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

export async function getProductByHandle(handle: string): Promise<ProductDetail | null> {
  const data = await shopifyFetch<ProductByHandleResponse>(PRODUCT_BY_HANDLE_QUERY, { handle });
  const node = data.product;
  if (!node) return null;

  const price = Number(node.priceRange.minVariantPrice.amount);
  const compareAt = Number(node.compareAtPriceRange.minVariantPrice.amount);
  const images = node.images.edges.map((e) => e.node.url);

  return {
    id: node.id,
    handle: node.handle,
    name: node.title,
    descriptionHtml: node.descriptionHtml,
    tags: node.tags,
    price,
    was: compareAt > price ? compareAt : null,
    currency: node.priceRange.minVariantPrice.currencyCode,
    tag: computeTag(node.tags, node.availableForSale),
    available: node.availableForSale,
    images: images.length > 0 ? images : node.featuredImage ? [node.featuredImage.url] : [],
    variants: node.variants.edges
      .map((e) => ({
        id: e.node.id,
        title: e.node.title,
        price: Number(e.node.price.amount),
        availableForSale: e.node.availableForSale,
      }))
      .filter((v) => v.title !== "Default Title"),
  };
}
