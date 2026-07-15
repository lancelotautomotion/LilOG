"use client";

import { useState, useMemo } from "react";
import { useLanguage } from "@/lib/i18n-context";
import { Nav } from "@/components/nav";
import { Drawer } from "@/components/drawer";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/product-card";
import type { Product } from "@/lib/shopify/types";

type Sort = "default" | "price-asc" | "price-desc";

const CAT_VIBES: Record<string, { tagline: string; desc: string; tags: string[] }> = {
  tops: {
    tagline: "Baby tee era, forever ✦",
    desc: "Crop tops, bustiers, caraco… les pièces qui ont fait de la décennie 2000 une ère iconique. Du mesh, du velours, du strass — port avec un jean taille basse et c'est réglé.",
    tags: ["Y2K", "Crop Top", "Limited Pieces", "Vintage 2000s"],
  },
  outerwear: {
    tagline: "Fur coat energy all year ✦",
    desc: "Blazers oversize, manteaux en fausse fourrure, vestes en cuir verni… le outerwear qui fait toute la tenue. Enfile, sors, et laisse les gens regarder.",
    tags: ["Statement Piece", "Faux Fur", "Power Jacket", "It Girl"],
  },
  dresses: {
    tagline: "Main character dress-up ✦",
    desc: "Mini, babydoll, slip dress, asymétrique — des robes qui racontent une histoire. Celle d'une fille qui sait exactement ce qu'elle fait.",
    tags: ["Party Ready", "Mini Dress", "Slip Dress", "Y2K Fever"],
  },
  skirts: {
    tagline: "Short skirt, long jacket energy ✦",
    desc: "Mini jupes plissées, jupes en cuir, imprimés logomania… le bas qui transforme n'importe quel top en tenue complète.",
    tags: ["Micro Mini", "Pleated", "It Girl", "2000s Vibes"],
  },
  shorts: {
    tagline: "Hot pants only ✦",
    desc: "Shorts taille basse, bermudas cargo, daisy dukes — l'été Y2K dans toute sa splendeur. À porter avec des mules plateforme, évidemment.",
    tags: ["Low Rise", "Cargo", "Summer Y2K", "2000s"],
  },
  trousers: {
    tagline: "Low rise is not a threat, it's a lifestyle ✦",
    desc: "Pantalons taille basse, bootcut flare, cargos à poches — les silhouettes qui ont défini une époque. Retrouve ce feeling.",
    tags: ["Low Rise", "Bootcut", "Cargo Pants", "Y2K Uniform"],
  },
  swimwear: {
    tagline: "Resort 2002 ✦",
    desc: "Maillots bandeau, bikinis imprimés, tankinis Y2K… pour être la fille la plus stylée au bord de la piscine. SPF optionnel, style obligatoire.",
    tags: ["Bikini Season", "Resort Wear", "Print Mix", "Y2K Summer"],
  },
  jeans: {
    tagline: "The original low rise rebellion ✦",
    desc: "Bootcut, flare, ultra low-rise, brodés, délavés, déchirés — tous les jeans qui ont fait de la taille basse une religion. Porte-les comme Paris Hilton en 2003.",
    tags: ["Bootcut", "Ultra Low Rise", "Embroidered", "Vintage Denim"],
  },
  bags: {
    tagline: "Arm candy only ✦",
    desc: "Mini sacs, pochettes logomania, sacs à main en plastique coloré, cabarets… l'accessoire qui fait ou défait une tenue. Pick carefully.",
    tags: ["Mini Bag", "Logomania", "It Bag", "Y2K Accessory"],
  },
  shoes: {
    tagline: "Platform or nothing ✦",
    desc: "Mules plateforme, sneakers chunky, bottes à bouts pointus — les chaussures qui ajoutent des centimètres et beaucoup de caractère.",
    tags: ["Platform", "Chunky Sole", "Mules", "Statement Shoes"],
  },
  accessories: {
    tagline: "The more the better ✦",
    desc: "Ceintures à boucle, foulards, lunettes papillon, bijoux strass — l'art du layering à son paroxysme. Superpose, multiplie, exagère.",
    tags: ["Layer Up", "Strass", "Belt Buckle", "Y2K Jewelry"],
  },
};

function CategoryVibe({ catKey }: { catKey: string }) {
  const vibe = CAT_VIBES[catKey];
  if (!vibe) return null;
  return (
    <div className="cat-vibe-card">
      <div className="cat-vibe-w95-bar">
        <span className="cat-vibe-w95-title">{vibe.tagline}</span>
        <div className="w95-dots"><span /><span /><span /></div>
      </div>
      <div className="cat-vibe-body">
        <p className="cat-vibe-desc">{vibe.desc}</p>
        <div className="cat-vibe-tags">
          {vibe.tags.map((tag) => <span key={tag} className="cat-vibe-tag">#{tag}</span>)}
        </div>
      </div>
    </div>
  );
}

// Normalize: lowercase + strip accents
function norm(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

// Only classic colors — anything not in this whitelist is silently ignored
const COLOR_SWATCH: Record<string, string> = {
  rose:     "#f7a3c8",
  rouge:    "#c0392b",
  vert:     "#2d7a4f",
  bleu:     "#2c5f9e",
  noir:     "#111",
  blanc:    "#f5f5f5",
  violet:   "#6c3d8f",
  orange:   "#e07b2a",
  jaune:    "#f2c94c",
  marine:   "#1a2e5a",
  kaki:     "#6b6b3a",
  bordeaux: "#6b1a2b",
  gris:     "#888",
};

function swatchForColor(label: string): string | null {
  return COLOR_SWATCH[norm(label)] ?? null;
}

function extractColors(products: Product[]): { key: string; css: string }[] {
  const seen = new Set<string>();
  for (const p of products) {
    for (const c of p.colors) seen.add(c);
  }
  return [...seen].sort().flatMap((key) => {
    const css = swatchForColor(key);
    return css ? [{ key, css }] : [];
  });
}

function productMatchesColor(p: Product, activeColors: Set<string>): boolean {
  if (activeColors.size === 0) return true;
  return p.colors.some((c) => activeColors.has(c));
}

function FilterPanel({
  products,
  sort, setSort,
  priceMin, setPriceMin,
  priceMax, setPriceMax,
  activeColors, toggleColor,
  activeTypes, toggleType,
  onClose,
}: {
  products: Product[];
  sort: Sort; setSort: (s: Sort) => void;
  priceMin: number; setPriceMin: (n: number) => void;
  priceMax: number; setPriceMax: (n: number) => void;
  activeColors: Set<string>; toggleColor: (c: string) => void;
  activeTypes: Set<string>; toggleType: (t: string) => void;
  onClose?: () => void;
}) {
  const allPrices = products.map((p) => p.price);
  const globalMin = Math.floor(Math.min(...allPrices));
  const globalMax = Math.ceil(Math.max(...allPrices));

  const types = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => { if (p.productType) set.add(p.productType); });
    return [...set].sort();
  }, [products]);

  const colors = useMemo(() => extractColors(products), [products]);

  const sym = "€";

  return (
    <aside className="filter-panel">
      {onClose && (
        <div className="filter-panel-head">
          <span className="mono-label">FILTRES</span>
          <button className="filter-close" onClick={onClose}>✕</button>
        </div>
      )}

      {/* Sort */}
      <div className="filter-section">
        <h3 className="filter-label">TRIER PAR</h3>
        {(["default", "price-asc", "price-desc"] as Sort[]).map((s) => (
          <label key={s} className="filter-radio">
            <input type="radio" name="sort" checked={sort === s} onChange={() => setSort(s)} />
            <span>{s === "default" ? "Nouveautés" : s === "price-asc" ? "Prix croissant" : "Prix décroissant"}</span>
          </label>
        ))}
      </div>

      {/* Price */}
      <div className="filter-section">
        <h3 className="filter-label">PRIX</h3>
        <div className="filter-price-row">
          <div className="filter-price-field">
            <span className="filter-price-sym">{sym}</span>
            <input
              className="filter-price-input"
              type="number"
              min={globalMin}
              max={priceMax}
              value={priceMin}
              onChange={(e) => setPriceMin(Math.min(Number(e.target.value), priceMax))}
            />
          </div>
          <span className="filter-price-sep">–</span>
          <div className="filter-price-field">
            <span className="filter-price-sym">{sym}</span>
            <input
              className="filter-price-input"
              type="number"
              min={priceMin}
              max={globalMax}
              value={priceMax}
              onChange={(e) => setPriceMax(Math.max(Number(e.target.value), priceMin))}
            />
          </div>
        </div>
      </div>

      {/* Colors */}
      {colors.length > 0 && (
        <div className="filter-section">
          <h3 className="filter-label">COULEUR</h3>
          <div className="filter-colors">
            {colors.map((c) => (
              <button
                key={c.key}
                className={"filter-swatch" + (activeColors.has(c.key) ? " active" : "")}
                title={c.key}
                onClick={() => toggleColor(c.key)}
                style={{ background: c.css }}
                aria-pressed={activeColors.has(c.key)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Types */}
      {types.length > 0 && (
        <div className="filter-section">
          <h3 className="filter-label">TYPE</h3>
          {types.map((type) => (
            <label key={type} className="filter-checkbox">
              <input
                type="checkbox"
                checked={activeTypes.has(type)}
                onChange={() => toggleType(type)}
              />
              <span>{type}</span>
            </label>
          ))}
        </div>
      )}
    </aside>
  );
}

export function CategoryPage({
  catKey,
  products,
  sub,
}: {
  catKey: string;
  products: Product[];
  sub?: string;
}) {
  const { t } = useLanguage();
  const [menu, setMenu] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const label = t.cat[catKey] ?? catKey;

  // Filter state
  const allPrices = products.map((p) => p.price);
  const globalMin = products.length ? Math.floor(Math.min(...allPrices)) : 0;
  const globalMax = products.length ? Math.ceil(Math.max(...allPrices)) : 9999;

  const [sort, setSort] = useState<Sort>("default");
  const [priceMin, setPriceMin] = useState(globalMin);
  const [priceMax, setPriceMax] = useState(globalMax);
  const [activeColors, setActiveColors] = useState<Set<string>>(new Set());
  const [activeTypes, setActiveTypes] = useState<Set<string>>(new Set());

  const toggleColor = (color: string) => {
    setActiveColors((prev) => {
      const next = new Set(prev);
      next.has(color) ? next.delete(color) : next.add(color);
      return next;
    });
  };

  const toggleType = (type: string) => {
    setActiveTypes((prev) => {
      const next = new Set(prev);
      next.has(type) ? next.delete(type) : next.add(type);
      return next;
    });
  };

  const activeFilterCount =
    (sort !== "default" ? 1 : 0) +
    (priceMin > globalMin || priceMax < globalMax ? 1 : 0) +
    activeColors.size +
    activeTypes.size;

  const filtered = useMemo(() => {
    let list = sub
      ? products.filter((p) => p.productType.toLowerCase() === sub.toLowerCase())
      : products;

    list = list.filter((p) => p.price >= priceMin && p.price <= priceMax);
    list = list.filter((p) => productMatchesColor(p, activeColors));
    if (activeTypes.size > 0) list = list.filter((p) => activeTypes.has(p.productType));

    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);

    return list;
  }, [products, sub, sort, priceMin, priceMax, activeColors, activeTypes]);

  const filterProps = {
    products,
    sort, setSort,
    priceMin, setPriceMin,
    priceMax, setPriceMax,
    activeColors, toggleColor,
    activeTypes, toggleType,
  };

  return (
    <>
      <Nav onMenu={() => setMenu(true)} forceSolid />
      <Drawer open={menu} onClose={() => setMenu(false)} />

      <main className="category-page">
        {/* Title row: mirrors the grid columns exactly */}
        <div className="category-title-row">
          <h1 className="category-title">{label}</h1>
          <CategoryVibe catKey={catKey} />
        </div>

        <div className="category-layout">
          {/* Sidebar column: filters */}
          <div className="filter-sidebar">
            <FilterPanel {...filterProps} />
          </div>

          {/* Grid column: filter trigger + products */}
          <div className="category-grid-wrap">
            <div className="category-grid-top">
              <button
                className={"filter-trigger" + (activeFilterCount > 0 ? " active" : "")}
                onClick={() => setFilterOpen(true)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                  <path d="M3 6h18M7 12h10M11 18h2" />
                </svg>
                Filtrer
                {activeFilterCount > 0 && <span className="filter-badge">{activeFilterCount}</span>}
              </button>
            </div>
            {filtered.length === 0 ? (
              <p className="category-empty">{t.category.empty}</p>
            ) : (
              <div className="drops-grid">
                {filtered.map((p, idx) => (
                  <ProductCard key={p.id} product={p} idx={idx} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile filter drawer */}
      <div className={"filter-scrim" + (filterOpen ? " open" : "")} onClick={() => setFilterOpen(false)} />
      <div className={"filter-sheet" + (filterOpen ? " open" : "")}>
        <FilterPanel {...filterProps} onClose={() => setFilterOpen(false)} />
      </div>

      <Footer />
    </>
  );
}
