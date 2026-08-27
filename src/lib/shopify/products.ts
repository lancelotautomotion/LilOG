import { shopifyFetch } from "./client";
import { compareSizes, normalizeSize } from "@/lib/sizes";
import {
  CATALOG_PRODUCTS_QUERY,
  COLLECTION_BY_HANDLE_QUERY,
  FEATURED_PRODUCTS_QUERY,
  PRODUCT_BY_HANDLE_QUERY,
  SEARCH_PRODUCTS_QUERY,
  TAGGED_PRODUCTS_QUERY,
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
    etat: node.etat?.value ?? null,
    variantId: variant?.id ?? null,
  };
}

export async function getFeaturedProducts(count = 8): Promise<Product[]> {
  const data = await shopifyFetch<FeaturedProductsResponse>(FEATURED_PRODUCTS_QUERY, { first: count });
  return data.products.edges.map((e) => mapProduct(e.node));
}

/* ============================================================
   LOUNA_PICKS : la sélection hebdomadaire de l'accueil
   ============================================================ */

/** Le tag Shopify qui désigne un coup de cœur de Louna. */
const LOUNA_PICK_TAG = "louna-pick";

/**
 * Identifiant de la semaine ISO 8601 en cours (`AAAASS`), qui sert de graine
 * au tirage. Le découpage ISO est celui du calendrier français : la semaine
 * commence le lundi, et c'est le jeudi qui décide de l'année à laquelle une
 * semaine à cheval sur deux années appartient.
 */
function isoWeekSeed(now: Date): number {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const isoDay = d.getUTCDay() || 7; // dimanche vaut 7, pas 0.
  d.setUTCDate(d.getUTCDate() + 4 - isoDay); // On se place sur le jeudi.
  const yearStart = Date.UTC(d.getUTCFullYear(), 0, 1);
  const week = Math.ceil(((d.getTime() - yearStart) / 86_400_000 + 1) / 7);
  return d.getUTCFullYear() * 100 + week;
}

/**
 * Générateur pseudo-aléatoire déterministe (mulberry32) : à graine égale, même
 * suite de nombres. C'est ce qui garantit que tous les visiteurs d'une même
 * semaine voient exactement la même sélection — `Math.random()` en donnerait
 * une différente à chaque rendu, et donc une à chaque instance serveur.
 */
function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
}

/**
 * Tire `count` pièces au hasard dans `pool`, de façon stable sur toute la
 * semaine : mélange de Fisher-Yates alimenté par la graine hebdomadaire. La
 * sélection bascule d'elle-même le lundi à 00 h 00 UTC, sans tâche planifiée.
 */
function weeklySample<T>(pool: T[], count: number, now = new Date()): T[] {
  if (pool.length <= count) return pool;

  const rand = seededRandom(isoWeekSeed(now));
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

/**
 * Les coups de cœur de Louna qui alimentent PLAYLIST_HIGHLIGHTS.EXE : les
 * pièces tagguées `louna-pick` dans Shopify **et encore disponibles**, dont
 * `count` sont tirées au sort pour la semaine en cours.
 *
 * Le filtre de disponibilité est posé deux fois, et ce n'est pas un oubli :
 * `available_for_sale:true` évite de rapatrier les pièces vendues, et le
 * second passage en JavaScript écarte en plus celles dont Shopify ne renvoie
 * aucune variante achetable — un cas que la recherche ne couvre pas, et que
 * le lecteur afficherait sinon en « SOLD OUT ». C'est exactement la règle
 * qu'applique <CoverFlow> pour griser son bouton d'achat.
 *
 * Aucun repli sur le reste du catalogue : si rien n'est taggué (ou si tout
 * est vendu), la section ne s'affiche pas, plutôt que de mettre en avant des
 * pièces qui n'ont pas été choisies.
 */
export async function getLounaPicks(count = 10): Promise<Product[]> {
  const data = await shopifyFetch<FeaturedProductsResponse>(TAGGED_PRODUCTS_QUERY, {
    query: `tag:'${LOUNA_PICK_TAG}' AND available_for_sale:true`,
    first: 250,
  });
  const available = data.products.edges
    .map((e) => mapProduct(e.node))
    .filter((p) => p.tag !== "SOLD" && p.variantId);

  return weeklySample(available, count);
}

/**
 * Le catalogue entier, toutes catégories confondues, pour le bouton
 * "Tout voir" du menu. Aucun filtre de collection côté Shopify, mais
 * CATALOG_PRODUCTS_QUERY reste sur la même sélection de champs que
 * COLLECTION_BY_HANDLE_QUERY (couleur/taille/matière/options) : sans elle,
 * FILTER_CONTROL.SYS et la pastille de taille des fiches n'ont rien à
 * afficher, contrairement à FEATURED_PRODUCTS_QUERY, allégée pour l'accueil.
 */
export async function getAllProducts(count = 250): Promise<Product[]> {
  const data = await shopifyFetch<FeaturedProductsResponse>(CATALOG_PRODUCTS_QUERY, { first: count });
  return data.products.edges
    .map((e) => mapProduct(e.node))
    .filter((p) => !(GIFT_CARD_HANDLES as readonly string[]).includes(p.handle));
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

/**
 * Écritures possibles du handle de la carte cadeau. L'API Storefront
 * n'expose pas de type dédié : une carte cadeau est un produit ordinaire,
 * dont le handle dépend de la langue et du titre choisis à sa création. On
 * essaie les écritures courantes, la première qui répond gagne.
 */
export const GIFT_CARD_HANDLES = [
  // Handle confirmé du produit "Carte-Cadeau Lil'OG" créé dans Shopify
  // (Admin → Produits → aperçu moteurs de recherche → /products/carte-cadeau-lilog).
  "carte-cadeau-lilog",
  "carte-cadeau-lil-og",
  "carte-cadeau",
  "gift-card",
  "carte-cadeau-digitale",
  "digital-gift-card",
] as const;

/**
 * Le produit carte cadeau du magasin, ou `null` s'il n'est pas publié — ou
 * si Shopify est injoignable. L'assistant /gift-card sait se rendre dans cet
 * état-là : il s'affiche, mais sans graver quoi que ce soit.
 *
 * Les handles sont essayés l'un après l'autre, et non en parallèle : au
 * premier trouvé, les suivants n'ont plus lieu d'être demandés. Les réponses
 * sont mises en cache 60 s par `shopifyFetch`, la boucle ne coûte donc rien
 * en régime établi.
 */
export async function getGiftCardProduct(): Promise<ProductDetail | null> {
  for (const handle of GIFT_CARD_HANDLES) {
    const product = await getProductByHandle(handle).catch(() => null);
    if (product) return product;
  }
  return null;
}
