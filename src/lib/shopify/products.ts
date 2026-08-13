import { shopifyFetch } from "./client";
import { compareSizes, normalizeSize } from "@/lib/sizes";
import {
  COLLECTION_BY_HANDLE_QUERY,
  FEATURED_PRODUCTS_QUERY,
  PRODUCT_BY_HANDLE_QUERY,
  SEARCH_PRODUCTS_QUERY,
} from "./queries";
import type {
  CollectionByHandleResponse,
  FeaturedProductsResponse,
  Product,
  ProductByHandleResponse,
  ProductDetail,
  RichMetafield,
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

/**
 * Toutes les valeurs lisibles portées par un champ méta Catégorie, texte
 * simple ou référence (unique ou en liste) à un ou plusieurs metaobjects de
 * taxonomie. Les GID non résolus (`gid://...`) sont écartés : mieux vaut un
 * filtre incomplet qu'une pastille "gid://shopify/Metaobject/123".
 */
function resolveRichMetafieldList(meta: RichMetafield | null | undefined): string[] {
  if (!meta) return [];

  const fromNodes = meta.references?.nodes
    ?.map((n) => n.field?.value)
    .filter((v): v is string => Boolean(v));
  if (fromNodes?.length) return fromNodes;

  if (meta.reference?.field?.value) return [meta.reference.field.value];

  if (meta.value && !meta.value.startsWith("gid://") && !meta.value.startsWith('["gid://')) {
    try {
      const parsed = JSON.parse(meta.value);
      if (Array.isArray(parsed)) {
        return parsed.filter((v): v is string => typeof v === "string" && !v.startsWith("gid://"));
      }
    } catch { /* pas du JSON, valeur texte simple */ }
    return [meta.value];
  }

  return [];
}

function extractColorValues(node: ShopifyProductNode): string[] {
  // Essaie chaque champ méta candidat, dans l'ordre.
  for (const meta of [node.colorMeta, node.colorMeta2, node.colorMeta3, node.colorMeta4]) {
    const vals = resolveRichMetafieldList(meta);
    if (vals.length) return vals;
  }
  // Repli : option de variante « Couleur » / « Color ».
  const colorOption = node.options?.find((o) => /cou?le?ur|colou?r/i.test(o.name));
  if (colorOption?.values?.length) return colorOption.values;
  // Dernier recours : trace de diagnostic, pour vérifier en prod quel champ
  // méta porte réellement la couleur sur ce catalogue.
  if (process.env.NODE_ENV !== "production") {
    console.log("[colors] no color found for", node.handle,
      "options:", node.options?.map((o) => o.name));
  }
  return [];
}

/**
 * Tailles d'une fiche, telles que le catalogue les filtre. La taille des
 * pièces vintage vend souvent sans variante ("Default Title") : elle vit
 * alors dans le champ méta Catégorie « Taille » (shopify.size et ses
 * repères), pas dans une option de variante, même source que la PDP et le
 * dressing. On ne retombe sur l'option « Taille » / « Size » qu'à défaut.
 */
function extractSizeValues(node: ShopifyProductNode): string[] {
  const fromMeta = new Set<string>();
  for (const meta of [node.sizeMeta, node.sizeMeta2, node.sizeMeta3, node.sizeMeta4]) {
    for (const raw of resolveRichMetafieldList(meta)) {
      const size = normalizeSize(raw);
      if (size) fromMeta.add(size);
    }
    if (fromMeta.size > 0) break;
  }
  if (fromMeta.size > 0) return [...fromMeta].sort(compareSizes);

  const sizeOption = node.options?.find((o) => /taille|size/i.test(o.name));
  const raw = sizeOption?.values ?? sizeOption?.optionValues?.map((v) => v.name) ?? [];
  const seen = new Set<string>();
  for (const value of raw) {
    const size = normalizeSize(value);
    if (size) seen.add(size);
  }
  if (seen.size > 0) return [...seen].sort(compareSizes);

  if (process.env.NODE_ENV !== "production") {
    console.log("[sizes] no size found for", node.handle,
      "options:", node.options?.map((o) => o.name));
  }
  return [];
}

/**
 * Matières d'une fiche (« Coton », « Polyester »…), champ méta Catégorie
 * uniquement, il n'existe pas d'équivalent en option de variante à
 * interroger en repli. Une pièce sans matière renseignée reste simplement
 * absente du filtre MATIÈRE, plutôt que d'y afficher une valeur inventée.
 */
function extractMaterialValues(node: ShopifyProductNode): string[] {
  for (const meta of [node.materialMeta, node.materialMeta2, node.materialMeta3]) {
    const vals = resolveRichMetafieldList(meta);
    if (vals.length) return vals;
  }
  if (process.env.NODE_ENV !== "production") {
    console.log("[materials] no material found for", node.handle);
  }
  return [];
}

function stripEmoji(str: string): string {
  return str.replace(/^[\p{Emoji_Presentation}\p{Extended_Pictographic}\s]+/u, "").trim();
}

// Un champ méta Catégorie Shopify (namespace "shopify") peut être du texte
// simple OU référencer un/des metaobject(s) de taxonomie, la vraie valeur
// affichable vit alors dans le champ "label" du/des metaobject(s) référencé(s).
// Fine couche au-dessus de resolveRichMetafieldList : la PDP et le panier
// affichent une chaîne unique ("38, 40"), là où le filtre du catalogue a
// besoin du tableau pour construire une pastille par valeur.
function resolveRichMetafield(meta: RichMetafield | null | undefined): string | null {
  const vals = resolveRichMetafieldList(meta);
  return vals.length ? vals.join(", ") : null;
}

// Ces pièces vintage sont uniques : la taille vit dans le champ méta Catégorie
// "Taille" (shopify.size) ; à défaut on retombe sur les options du variant
// ("Default Title" si le produit n'a qu'une option), même heuristique
// utilisée sur la PDP et le panier.
export function extractSizeValue(
  sizeMeta: RichMetafield | null | undefined,
  options: ShopifyProductNode["options"] | undefined,
  handle?: string,
): string | null {
  const fromMeta = resolveRichMetafield(sizeMeta);
  if (fromMeta) return fromMeta;

  if (process.env.NODE_ENV !== "production" && handle) {
    console.log("[size] no sizeMeta, options for", handle, JSON.stringify(options));
  }
  const sizeOption = options?.find((o) =>
    /taille|size|pointure|dimension/i.test(o.name) ||
    (!/cou?le?ur|colou?r|title/i.test(o.name) && (o.optionValues?.length ?? o.values?.length ?? 0) > 0)
  );
  if (sizeOption?.optionValues?.length) return sizeOption.optionValues.map((v) => v.name).join(", ");
  if (sizeOption?.values?.length) return sizeOption.values.join(", ");
  return null;
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
    sizes: extractSizeValues(node),
    materials: extractMaterialValues(node),
    variantId: variant?.id ?? null,
  };
}

export async function getFeaturedProducts(count = 8): Promise<Product[]> {
  const data = await shopifyFetch<FeaturedProductsResponse>(FEATURED_PRODUCTS_QUERY, { first: count });
  return data.products.edges.map((e) => mapProduct(e.node));
}

/**
 * Recherche texte libre dans le catalogue. Une chaîne vide renvoie tout de
 * suite un tableau vide, inutile d'aller demander à Shopify de « trouver »
 * une chaîne vide, qui renverrait tout le catalogue.
 */
export async function searchProducts(query: string, count = 60): Promise<Product[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const data = await shopifyFetch<FeaturedProductsResponse>(SEARCH_PRODUCTS_QUERY, {
    query: trimmed,
    first: count,
  });
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
    size: extractSizeValue(node.sizeMeta, node.options, node.handle),
  };
}
