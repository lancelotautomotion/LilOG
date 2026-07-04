// The 6 top-level clothing categories, backed by real Shopify collections.
// `handle` must match the collection's handle in Shopify admin exactly.
// `catKey` looks up the translated label in i18n's `cat` dictionary.
export const CATEGORIES: { handle: string; catKey: string }[] = [
  { handle: "tops", catKey: "tops" },
  { handle: "vestes-manteaux", catKey: "outerwear" },
  { handle: "robes-jupes", catKey: "dressesSkirts" },
  { handle: "pantalons-jeans", catKey: "bottoms" },
  { handle: "accessoires", catKey: "accessories" },
  { handle: "chaussures", catKey: "shoes" },
];
