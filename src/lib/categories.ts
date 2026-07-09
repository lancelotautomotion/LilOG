// Top-level clothing categories, backed by real Shopify collections.
// `handle` must match the collection's handle in Shopify admin exactly.
// `catKey` looks up the translated label in i18n's `cat` dictionary.
export const CATEGORIES: { handle: string; catKey: string }[] = [
  { handle: "tops", catKey: "tops" },
  { handle: "manteaux-et-vestes", catKey: "outerwear" },
  { handle: "robes", catKey: "dresses" },
  { handle: "jupes", catKey: "skirts" },
  { handle: "shorts-bermudas", catKey: "shorts" },
  { handle: "pantalons", catKey: "trousers" },
  { handle: "maillots-de-bain", catKey: "swimwear" },
  { handle: "jeans", catKey: "jeans" },
];
