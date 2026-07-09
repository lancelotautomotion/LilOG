export interface SubCategory {
  label: string;
  type: string; // matches Shopify product type; empty = "Tout voir"
}

export interface Category {
  handle: string;
  catKey: string;
  sub?: SubCategory[];
}

export const CATEGORIES: Category[] = [
  {
    handle: "tops",
    catKey: "tops",
    sub: [
      { label: "Tout voir", type: "" },
      { label: "T-Shirts", type: "t-shirt" },
      { label: "Pulls & Cardigans", type: "pull" },
      { label: "Boléros", type: "bolero" },
      { label: "Chemises & Blouses", type: "chemise" },
      { label: "Body", type: "body" },
    ],
  },
  {
    handle: "manteaux-et-vestes",
    catKey: "outerwear",
    sub: [
      { label: "Tout voir", type: "" },
      { label: "Vestes", type: "veste" },
      { label: "Blazers", type: "blazer" },
      { label: "Manteaux", type: "manteau" },
    ],
  },
  {
    handle: "robes",
    catKey: "dresses",
    sub: [
      { label: "Tout voir", type: "" },
      { label: "Mini", type: "robe-mini" },
      { label: "Midi", type: "robe-midi" },
      { label: "Mi-longues", type: "robe-mi-longue" },
    ],
  },
  {
    handle: "jupes",
    catKey: "skirts",
    sub: [
      { label: "Tout voir", type: "" },
      { label: "Courtes", type: "jupe-courte" },
      { label: "Mi-longues", type: "jupe-mi-longue" },
      { label: "Longues", type: "jupe-longue" },
    ],
  },
  {
    handle: "shorts-bermudas",
    catKey: "shorts",
    sub: [
      { label: "Tout voir", type: "" },
      { label: "Shorts", type: "short" },
      { label: "Bermudas", type: "bermuda" },
      { label: "Capris", type: "capri" },
    ],
  },
  {
    handle: "pantalons",
    catKey: "trousers",
    sub: [
      { label: "Tout voir", type: "" },
      { label: "Taille basses", type: "pantalon-taille-basse" },
      { label: "Taille hautes", type: "pantalon-taille-haute" },
      { label: "Cargos", type: "cargo" },
      { label: "Pantacourts", type: "pantacourt" },
    ],
  },
  {
    handle: "maillots-de-bain",
    catKey: "swimwear",
  },
  {
    handle: "jeans",
    catKey: "jeans",
    sub: [
      { label: "Tout voir", type: "" },
      { label: "Slim", type: "jean-slim" },
      { label: "Droit", type: "jean-droit" },
      { label: "Large", type: "jean-large" },
    ],
  },
];
