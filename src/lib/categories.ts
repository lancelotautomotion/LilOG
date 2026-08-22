export interface SubSubCategory {
  label: string;
  type: string;
}

export interface SubCategory {
  label: string;
  type: string; // matches Shopify product type; empty = "Tout voir"
  sub?: SubSubCategory[];
}

export interface Category {
  handle: string;
  catKey: string;
  sub?: SubCategory[];
}

export interface CategoryVibe {
  tagline: string;
  desc: string;
  tags: string[];
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
  {
    handle: "sacs",
    catKey: "bags",
    sub: [
      { label: "Tout voir", type: "" },
      { label: "Sacs", type: "sac" },
      { label: "Portefeuilles", type: "portefeuille" },
    ],
  },
  {
    handle: "chaussures",
    catKey: "shoes",
    sub: [
      { label: "Tout voir", type: "" },
      { label: "Talons", type: "talon" },
      { label: "Plates", type: "plate" },
      { label: "Bottes", type: "botte" },
      { label: "Sandales", type: "sandale" },
      { label: "Baskets", type: "basket" },
    ],
  },
  {
    handle: "accessoires",
    catKey: "accessories",
    sub: [
      { label: "Tout voir", type: "" },
      {
        label: "Bijoux",
        type: "bijou",
        sub: [
          { label: "Colliers", type: "collier" },
          { label: "Boucles d'oreilles", type: "boucle-oreille" },
          { label: "Bracelets", type: "bracelet" },
          { label: "Bagues", type: "bague" },
          { label: "Bijoux de corps", type: "bijou-de-corps" },
        ],
      },
      { label: "Foulards & Écharpes", type: "foulard" },
      { label: "Ceintures", type: "ceinture" },
      { label: "Chapeaux", type: "chapeau" },
      { label: "Lunettes", type: "lunettes" },
    ],
  },
];

/* Identité éditoriale de chaque rayon : sert à la fois de contenu affiché
   en en-tête de page (CategoryPage) et de meta description / OG pour le
   référencement (generateMetadata dans app/category/[handle]/page.tsx). */
export const CAT_VIBES: Record<string, CategoryVibe> = {
  tops: {
    tagline: "Baby tee era, forever",
    desc: "Crop tops, bustiers, caraco… les pièces qui ont fait de la décennie 2000 une ère iconique. Du mesh, du velours, du strass, porté avec un jean taille basse et c'est réglé.",
    tags: ["Y2K", "Crop Top", "Limited Pieces", "Vintage 2000s"],
  },
  outerwear: {
    tagline: "Fur coat energy all year",
    desc: "Blazers oversize, manteaux en fausse fourrure, vestes en cuir verni… le outerwear qui fait toute la tenue. Enfile, sors, et laisse les gens regarder.",
    tags: ["Statement Piece", "Faux Fur", "Power Jacket", "It Girl"],
  },
  dresses: {
    tagline: "Main character dress-up",
    desc: "Mini, babydoll, slip dress, asymétrique : des robes qui racontent une histoire. Celle d'une fille qui sait exactement ce qu'elle fait.",
    tags: ["Party Ready", "Mini Dress", "Slip Dress", "Y2K Fever"],
  },
  skirts: {
    tagline: "Short skirt, long jacket energy",
    desc: "Mini jupes plissées, jupes en cuir, imprimés logomania… le bas qui transforme n'importe quel top en tenue complète.",
    tags: ["Micro Mini", "Pleated", "It Girl", "2000s Vibes"],
  },
  shorts: {
    tagline: "Hot pants only",
    desc: "Shorts taille basse, bermudas cargo, daisy dukes : l'été Y2K dans toute sa splendeur. À porter avec des mules plateforme, évidemment.",
    tags: ["Low Rise", "Cargo", "Summer Y2K", "2000s"],
  },
  trousers: {
    tagline: "Low rise is not a threat, it's a lifestyle",
    desc: "Pantalons taille basse, bootcut flare, cargos à poches : les silhouettes qui ont défini une époque. Retrouve ce feeling.",
    tags: ["Low Rise", "Bootcut", "Cargo Pants", "Y2K Uniform"],
  },
  swimwear: {
    tagline: "Resort 2002",
    desc: "Maillots bandeau, bikinis imprimés, tankinis Y2K… pour être la fille la plus stylée au bord de la piscine. SPF optionnel, style obligatoire.",
    tags: ["Bikini Season", "Resort Wear", "Print Mix", "Y2K Summer"],
  },
  jeans: {
    tagline: "The original low rise rebellion",
    desc: "Bootcut, flare, ultra low-rise, brodés, délavés, déchirés : tous les jeans qui ont fait de la taille basse une religion. Porte-les comme Paris Hilton en 2003.",
    tags: ["Bootcut", "Ultra Low Rise", "Embroidered", "Vintage Denim"],
  },
  bags: {
    tagline: "Arm candy only",
    desc: "Mini sacs, pochettes logomania, sacs à main en plastique coloré, cabas… l'accessoire qui fait ou défait une tenue. Pick carefully.",
    tags: ["Mini Bag", "Logomania", "It Bag", "Y2K Accessory"],
  },
  shoes: {
    tagline: "Platform or nothing",
    desc: "Mules plateforme, sneakers chunky, bottes à bouts pointus : les chaussures qui ajoutent des centimètres et beaucoup de caractère.",
    tags: ["Platform", "Chunky Sole", "Mules", "Statement Shoes"],
  },
  accessories: {
    tagline: "The more the better",
    desc: "Ceintures à boucle, foulards, lunettes papillon, bijoux strass : l'art du layering à son paroxysme. Superpose, multiplie, exagère.",
    tags: ["Layer Up", "Strass", "Belt Buckle", "Y2K Jewelry"],
  },
};
