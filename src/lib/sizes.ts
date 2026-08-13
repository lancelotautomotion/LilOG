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
  const upper = raw
    .trim()
    .toUpperCase()
    .replace(/\s+/g, " ")
    // "38 / 40" and "38/40" are the same combined size — one chip, not two.
    .replace(/\s*([/-])\s*/g, "$1");
  if (ONE_SIZE.has(upper)) return null;
  const mapped = WORD_SIZES[upper] ?? upper;
  return ONE_SIZE.has(mapped) ? null : mapped;
}

const LETTER_SIZES = new Set(["XXXS", "XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL", "XXXXL"]);

/**
 * Does this value actually look like a size?
 *
 * Shopify options aren't named consistently — a shop may file the brand, the
 * era or the condition as a variant option. Without this guard the closet
 * offered "BLANCHEPORTE" and "PHILDAR" as morphologies. Only applied to
 * options we *couldn't* identify by name; an option explicitly called
 * "Taille" is trusted whatever the merchant typed in it.
 */
export function looksLikeSize(value: string): boolean {
  const v = value.trim().toUpperCase();
  if (LETTER_SIZES.has(v)) return true;
  if (/^\d{1,2}$/.test(v)) {
    const n = Number(v);
    return n >= 24 && n <= 60; // tailles FR vêtement + pointures
  }
  if (/^\d{2}\s?[/-]\s?\d{2}$/.test(v)) return true;   // 38/40
  if (/^T\.?\s?\d{1,2}$/.test(v)) return true;         // T2, T.38
  if (/^(EU|FR|UK|US|IT)\s?\d{1,2}$/.test(v)) return true;
  return false;
}

/**
 * Size hidden in a product tag — `taille-m`, `Taille 38`, `T38`, `size-L`,
 * or a bare letter size. Numerics need an explicit prefix: a lone `40` tag is
 * as likely to be a decade as a size.
 */
export function sizeFromTag(tag: string): string | null {
  const t = tag.trim().toUpperCase().replace(/\s+/g, " ");
  const prefixed = t.match(/^(?:TAILLE|SIZE|POINTURE|T)[\s._-]*(.+)$/);
  if (prefixed) {
    const value = prefixed[1].trim();
    return looksLikeSize(value) ? normalizeSize(value) : null;
  }
  return LETTER_SIZES.has(t) ? t : null;
}

/** Shown in the gate when the catalogue carries no size data of its own. */
export const STANDARD_SIZES = ["XS", "S", "M", "L", "XL"];

/** Same idea for footwear — EU sizes, the range Lil'OG actually stocks. */
export const STANDARD_SHOE_SIZES = ["35", "36", "37", "38", "39", "40", "41", "42"];

/**
 * Correspondance lettre ↔ taille FR (femme). Le catalogue mélange les deux
 * barèmes — un haut est étiqueté « S », une jupe « 36 » — et deux pièces de
 * la même taille ne se ressemblent donc pas du tout, chaîne pour chaîne.
 * Sert à rapprocher un haut d'un bas dans la même taille.
 */
const LETTER_TO_FR: Record<string, string> = {
  XXS: "32",
  XS: "34",
  S: "36",
  M: "38",
  L: "40",
  XL: "42",
  XXL: "44",
  XXXL: "46",
};

const FR_TO_LETTER: Record<string, string> = Object.fromEntries(
  Object.entries(LETTER_TO_FR).map(([letter, fr]) => [fr, letter]),
);

/**
 * Toutes les écritures d'une même taille : « S » donne `["S", "36"]`, « 38 »
 * donne `["38", "M"]`, et une taille combinée « 38/40 » se déplie en ses deux
 * tailles. Deux pièces sont de la même taille dès que ces listes se croisent.
 *
 * ⚠ Barème vêtement uniquement. Les pointures partagent les mêmes nombres
 * (38 se porte au pied comme à la taille) : ne pas s'en servir pour comparer
 * une chaussure à un vêtement.
 */
export function sizeEquivalents(raw: string): string[] {
  const canonical = normalizeSize(raw);
  if (!canonical) return [];
  const out = new Set<string>();
  for (const part of canonical.split(/[/-]/)) {
    const value = part.trim();
    if (!value) continue;
    out.add(value);
    /* « T.38 », « T 38 » et « FR 38 » désignent le 38. On ne touche pas aux
       préfixes UK / US / IT, qui sont eux d'autres barèmes. */
    const bare = value.replace(/^(?:T\.?|FR)\s*(?=\d)/, "");
    if (bare !== value) out.add(bare);
    for (const v of [value, bare]) {
      const fr = LETTER_TO_FR[v];
      if (fr) out.add(fr);
      const letter = FR_TO_LETTER[v];
      if (letter) out.add(letter);
    }
  }
  return [...out];
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
