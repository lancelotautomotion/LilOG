import { shopifyFetch } from "./client";
import { COLLECTION_BY_HANDLE_QUERY, FEATURED_PRODUCTS_QUERY, PRODUCT_BY_HANDLE_QUERY } from "./queries";
import type {
  CollectionByHandleResponse,
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

function parseMetaColors(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
  } catch { /* not JSON */ }
  if (raw.trim()) return raw.split(/[,;|]/).map((s) => s.trim()).filter(Boolean);
  return [];
}

function extractColorValues(node: ShopifyProductNode): string[] {
  // Try all metafield candidates in order
  for (const meta of [node.colorMeta, node.colorMeta2, node.colorMeta3, node.colorMeta4]) {
    if (meta?.value) {
      const vals = parseMetaColors(meta.value);
      if (vals.length) return vals;
    }
  }
  // Fallback: product option named "Couleur" / "Color"
  const colorOption = node.options?.find((o) => /cou?le?ur|colou?r/i.test(o.name));
  if (colorOption?.values?.length) return colorOption.values;
  // Last resort: log what options/metafields are available for diagnosis
  if (process.env.NODE_ENV !== "production") {
    console.log("[colors] no color found for", node.handle,
      "options:", node.options?.map((o) => o.name));
  }
  return [];
}

function stripEmoji(str: string): string {
  return str.replace(/^[\p{Emoji_Presentation}\p{Extended_Pictographic}\s]+/u, "").trim();
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
    name: stripEmoji(node.title),
    meta,
    productType: node.productType ?? "",
    price,
    was: compareAt > price ? compareAt : null,
    currency: node.priceRange.minVariantPrice.currencyCode,
    tag,
    imageA,
    imageB,
    tags: node.tags,
    colors: extractColorValues(node),
    variantId: variant?.id ?? null,
  };
}

export async function getFeaturedProducts(count = 8): Promise<Product[]> {
  const data = await shopifyFetch<FeaturedProductsResponse>(FEATURED_PRODUCTS_QUERY, { first: count });
  return data.products.edges.map((e) => mapProduct(e.node));
}

export async function getCollectionProducts(
  handle: string,
  count = 100,
): Promise<{ title: string; products: Product[] } | null> {
  const data = await shopifyFetch<CollectionByHandleResponse>(COLLECTION_BY_HANDLE_QUERY, { handle, first: count });
  const collection = data.collection;
  if (!collection) return null;
  return {
    title: collection.title,
    products: collection.products.edges.map((e) => mapProduct(e.node)),
  };
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
    name: stripEmoji(node.title),
    descriptionHtml: node.descriptionHtml,
    tags: node.tags,
    price,
    was: compareAt > price ? compareAt : null,
    currency: node.priceRange.minVariantPrice.currencyCode,
    tag: computeTag(node.tags, node.availableForSale),
    available: node.availableForSale,
    etat: node.etat?.value ?? null,
    collections: node.collections.edges.map((e) => e.node.handle),
    images: images.length > 0 ? images : node.featuredImage ? [node.featuredImage.url] : [],
    defaultVariantId: node.variants.edges[0]?.node.id ?? null,
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
