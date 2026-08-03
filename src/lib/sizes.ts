// Size vocabulary shared by the Shopify mapper (server) and the Virtual
// Closet UI (client) — kept out of the shopify/ folder so importing it from a
// client component doesn't drag the Storefront client into the bundle.

// Values that mean "fits everyone" — treated as *no* size so the piece stays
// visible whatever the shopper picked at the gate.
const ONE_SIZE = new Set([
  "TU", "U", "UNI", "UNIQUE", "TAILLE UNIQUE", "ONE SIZE", "OS", "ONESIZE", "DEFAULT TITLE", "-", "",
]);

const WORD_SIZES: Record<string, string> = {
  "EXTRA SMALL": "XS",
  "SMALL": "S",
  "MEDIUM": "M",
  "LARGE": "L",
  "EXTRA LARGE": "XL",
  "PETIT": "S",
  "MOYEN": "M",
  "GRAND": "L",
};

/** Canonical size label, or `null` when the value carries no size information. */
export function normalizeSize(raw: string): string | null {
  const upper = raw.trim().toUpperCase().replace(/\s+/g, " ");
  if (ONE_SIZE.has(upper)) return null;
  const mapped = WORD_SIZES[upper] ?? upper;
  return ONE_SIZE.has(mapped) ? null : mapped;
}

const SIZE_RANK = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"];

/** Letter sizes first (in wearing order), then numeric, then everything else. */
export function compareSizes(a: string, b: string): number {
  const ra = SIZE_RANK.indexOf(a);
  const rb = SIZE_RANK.indexOf(b);
  if (ra !== -1 || rb !== -1) {
    if (ra === -1) return 1;
    if (rb === -1) return -1;
    return ra - rb;
  }
  const na = Number(a);
  const nb = Number(b);
  const aNum = a !== "" && !Number.isNaN(na);
  const bNum = b !== "" && !Number.isNaN(nb);
  if (aNum && bNum) return na - nb;
  if (aNum) return -1;
  if (bNum) return 1;
  return a.localeCompare(b);
}
