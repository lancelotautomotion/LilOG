import { shopifyFetch } from "./client";
import { ALL_PRODUCTS_QUERY } from "./queries";
import { CATEGORIES } from "@/lib/categories";
import { compareSizes, looksLikeSize, normalizeSize, sizeFromTag } from "@/lib/sizes";
import type {
  AllProductsResponse,
  ClosetItem,
  ClosetSlot,
  ClosetVariant,
  ShopifyClosetNode,
  ShopifySizeMetafield,
} from "./types";

// Storefront API caps `first` at 250: page through until the catalogue is
// exhausted (bounded, so a runaway store can't stall the render).
const PAGE_SIZE = 250;
const MAX_PAGES = 4;

/* ------------------------------------------------------------------ *
 * Slot classification
 * ------------------------------------------------------------------ */

// Ordered: the first collection a product belongs to wins, so a piece filed
// under both "tops" and "accessoires" lands in the column that makes sense.
const SLOT_PRIORITY: [handle: string, slot: ClosetSlot][] = [
  ["tops", "top"],
  ["manteaux-et-vestes", "top"],
  ["pantalons", "bottom"],
  ["jeans", "bottom"],
  ["jupes", "bottom"],
  ["shorts-bermudas", "bottom"],
  ["chaussures", "shoes"],
  ["sacs", "bag"],
  ["accessoires", "accessory"],
];

// Bijoux live inside the "accessoires" collection but get their own module.
const JEWELRY_TYPES = new Set([
  "bijou",
  "collier",
  "boucle-oreille",
  "bracelet",
  "bague",
  "bijou-de-corps",
]);

// productType -> collection handle, derived from CATEGORIES so adding a
// sub-category there is enough to keep the closet in sync.
const HANDLE_BY_TYPE: Map<string, string> = (() => {
  const map = new Map<string, string>();
  for (const cat of CATEGORIES) {
    for (const sub of cat.sub ?? []) {
      if (sub.type) map.set(sub.type, cat.handle);
      for (const subsub of sub.sub ?? []) map.set(subsub.type, cat.handle);
    }
  }
  return map;
})();

function norm(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
}

function classify(node: ShopifyClosetNode): ClosetSlot | null {
  const type = norm(node.productType ?? "");
  if (JEWELRY_TYPES.has(type)) return "jewelry";

  const handles = new Set(node.collections.edges.map((e) => e.node.handle));
  for (const [handle, slot] of SLOT_PRIORITY) {
    if (handles.has(handle)) return slot;
  }

  // No collection match (product not merchandised into a category), fall back
  // to the product type's home category.
  const fromType = HANDLE_BY_TYPE.get(type);
  if (fromType) return SLOT_PRIORITY.find(([h]) => h === fromType)?.[1] ?? null;
  return null;
}

/* ------------------------------------------------------------------ *
 * Sizes
 * ------------------------------------------------------------------ */

const SIZE_OPTION_RE = /taille|size|pointure/i;

function variantSize(variant: ShopifyClosetNode["variants"]["edges"][number]["node"]): string | null {
  // An option the merchant explicitly named "Taille" is authoritative.
  const named = variant.selectedOptions?.find((o) => SIZE_OPTION_RE.test(o.name));
  if (named) return normalizeSize(named.value);

  // Otherwise only accept a value that is actually size-shaped: shops also
  // file brand, era or condition as variant options, and those must never
  // end up in the morphology picker.
  const shaped = variant.selectedOptions?.find((o) => looksLikeSize(o.value));
  if (shaped) return normalizeSize(shaped.value);

  // Single-option products expose the value as the bare variant title.
  return looksLikeSize(variant.title) ? normalizeSize(variant.title) : null;
}

function stripEmoji(str: string): string {
  return str.replace(/^[\p{Emoji_Presentation}\p{Extended_Pictographic}\s]+/u, "").trim();
}

/* ------------------------------------------------------------------ *
 * Mapping
 * ------------------------------------------------------------------ */

function parseMetaList(raw: string): string[] {
  if (!raw?.trim()) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map(String);
    if (typeof parsed === "string") return [parsed];
  } catch { /* not JSON */ }
  return raw.split(/[,;|]/).map((s) => s.trim()).filter(Boolean);
}

/**
 * Sizes out of a Shopify category (taxonomy) metafield.
 *
 * Their `value` is a `gid://shopify/Metaobject/…` reference, so the readable
 * size sits on the referenced object's `label` field. Falls back to the
 * metaobject handle, then to a plain-text value for shops that use a custom
 * text metafield instead of the taxonomy one.
 */
function sizesFromMetafield(meta: ShopifySizeMetafield | null | undefined): string[] {
  if (!meta) return [];

  const nodes = [
    ...(meta.reference ? [meta.reference] : []),
    ...(meta.references?.edges.map((e) => e.node) ?? []),
  ];
  const labels = nodes.flatMap((n) => {
    const label = n.field?.value?.trim();
    if (label) return [label];
    return n.handle ? [n.handle.replace(/[-_]+/g, " ")] : [];
  });

  const raw = labels.length > 0 ? labels : parseMetaList(meta.value);

  return raw.flatMap((v) => {
    if (v.startsWith("gid://")) return []; // unresolved reference, not a size
    const s = normalizeSize(v);
    return s ? [s] : [];
  });
}

/**
 * Every size a piece is available in, looked up in four places, shops file
 * sizing inconsistently, and a closet with no sizes is a closet with no gate.
 * Empty = one-size / unsized, which the gate treats as matching any morphology.
 */
function collectSizes(node: ShopifyClosetNode, variants: ClosetVariant[]): string[] {
  const set = new Set<string>();

  // 1. Buyable variants, the most reliable source when the shop uses them.
  for (const v of variants) {
    if (v.available && v.size) set.add(v.size);
  }

  // 2. Category metafield, where the size lives for a product sold without
  //    variants, which is the norm for one-of-one vintage.
  if (set.size === 0) {
    for (const meta of [node.sizeMeta, node.sizeMeta2, node.sizeMeta3, node.sizeMeta4]) {
      for (const s of sizesFromMetafield(meta)) set.add(s);
      if (set.size > 0) break;
    }
  }

  // 3. Product-level options, for listings that declare the sizes they were
  //    cut in without splitting them into variants.
  if (set.size === 0) {
    for (const opt of node.options ?? []) {
      const named = SIZE_OPTION_RE.test(opt.name);
      for (const raw of opt.values ?? []) {
        if (!named && !looksLikeSize(raw)) continue;
        const s = normalizeSize(raw);
        if (s) set.add(s);
      }
    }
  }

  // 4. Tags, last resort for shops that only tag their sizing.
  if (set.size === 0) {
    for (const tag of node.tags) {
      const s = sizeFromTag(tag);
      if (s) set.add(s);
    }
  }

  return [...set].sort(compareSizes);
}

function mapClosetItem(node: ShopifyClosetNode, slot: ClosetSlot): ClosetItem {
  const variants: ClosetVariant[] = node.variants.edges.map((e) => ({
    id: e.node.id,
    title: e.node.title,
    available: e.node.availableForSale,
    price: Number(e.node.price.amount),
    size: variantSize(e.node),
  }));

  const sizes = collectSizes(node, variants);

  const images = node.images.edges.map((e) => e.node.url);

  return {
    id: node.id,
    handle: node.handle,
    name: stripEmoji(node.title),
    slot,
    productType: node.productType ?? "",
    price: Number(node.priceRange.minVariantPrice.amount),
    currency: node.priceRange.minVariantPrice.currencyCode,
    image: node.featuredImage?.url ?? images[0] ?? "",
    sizes,
    variants,
  };
}

/**
 * Every buyable piece of the catalogue, tagged with the closet slot it can
 * fill. Feeds /dressing-machine, the two clothing columns plus the four
 * optional accessory modules.
 */
export async function getClosetCatalogue(): Promise<ClosetItem[]> {
  const items: ClosetItem[] = [];
  let cursor: string | null = null;

  for (let page = 0; page < MAX_PAGES; page++) {
    const data: AllProductsResponse = await shopifyFetch<AllProductsResponse>(
      ALL_PRODUCTS_QUERY,
      { first: PAGE_SIZE, after: cursor },
    );

    for (const edge of data.products.edges) {
      const node = edge.node;
      if (!node.availableForSale) continue;
      const slot = classify(node);
      if (!slot) continue;
      const item = mapClosetItem(node, slot);
      if (!item.image) continue; // a closet without a photo is not a closet
      items.push(item);
    }

    if (!data.products.pageInfo.hasNextPage) break;
    cursor = data.products.pageInfo.endCursor;
  }

  return items;
}
