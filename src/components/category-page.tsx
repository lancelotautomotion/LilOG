"use client";

import { useState, useMemo } from "react";
import { useLanguage } from "@/lib/i18n-context";
import { Nav } from "@/components/nav";
import { Drawer } from "@/components/drawer";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/product-card";
import type { Product } from "@/lib/shopify/types";

type Sort = "default" | "price-asc" | "price-desc";

// Map of lowercase tag keywords → display label + CSS color value
const COLOR_MAP: Record<string, { label: string; css: string }> = {
  noir:      { label: "Noir",    css: "#111" },
  black:     { label: "Noir",    css: "#111" },
  blanc:     { label: "Blanc",   css: "#f5f5f5" },
  white:     { label: "Blanc",   css: "#f5f5f5" },
  beige:     { label: "Beige",   css: "#d4b896" },
  crème:     { label: "Crème",   css: "#f3ece6" },
  creme:     { label: "Crème",   css: "#f3ece6" },
  cream:     { label: "Crème",   css: "#f3ece6" },
  marron:    { label: "Marron",  css: "#7b4f2e" },
  brown:     { label: "Marron",  css: "#7b4f2e" },
  rouge:     { label: "Rouge",   css: "#c0392b" },
  red:       { label: "Rouge",   css: "#c0392b" },
  rose:      { label: "Rose",    css: "#f7a3c8" },
  pink:      { label: "Rose",    css: "#f7a3c8" },
  fuchsia:   { label: "Fuchsia", css: "#d4006e" },
  violet:    { label: "Violet",  css: "#6c3d8f" },
  purple:    { label: "Violet",  css: "#6c3d8f" },
  bleu:      { label: "Bleu",    css: "#2c5f9e" },
  blue:      { label: "Bleu",    css: "#2c5f9e" },
  vert:      { label: "Vert",    css: "#2d7a4f" },
  green:     { label: "Vert",    css: "#2d7a4f" },
  jaune:     { label: "Jaune",   css: "#f2c94c" },
  yellow:    { label: "Jaune",   css: "#f2c94c" },
  orange:    { label: "Orange",  css: "#e07b2a" },
  gris:      { label: "Gris",    css: "#888" },
  grey:      { label: "Gris",    css: "#888" },
  gray:      { label: "Gris",    css: "#888" },
  argent:    { label: "Argent",  css: "#c0c0c0" },
  silver:    { label: "Argent",  css: "#c0c0c0" },
  or:        { label: "Or",      css: "#c9a84c" },
  gold:      { label: "Or",      css: "#c9a84c" },
  léopard:   { label: "Léopard", css: "linear-gradient(135deg,#c8a060 25%,#3d2000 25%,#3d2000 50%,#c8a060 50%,#c8a060 75%,#3d2000 75%)" },
  leopard:   { label: "Léopard", css: "linear-gradient(135deg,#c8a060 25%,#3d2000 25%,#3d2000 50%,#c8a060 50%,#c8a060 75%,#3d2000 75%)" },
  multicolore: { label: "Multi", css: "conic-gradient(#c0392b,#f2c94c,#2d7a4f,#2c5f9e,#c0392b)" },
  multicolor:  { label: "Multi", css: "conic-gradient(#c0392b,#f2c94c,#2d7a4f,#2c5f9e,#c0392b)" },
};

function extractColors(products: Product[]): { key: string; label: string; css: string }[] {
  const seen = new Map<string, { label: string; css: string }>();
  for (const p of products) {
    for (const tag of p.tags) {
      const key = tag.toLowerCase().trim();
      if (COLOR_MAP[key] && !seen.has(COLOR_MAP[key].label)) {
        seen.set(COLOR_MAP[key].label, { label: COLOR_MAP[key].label, css: COLOR_MAP[key].css });
      }
    }
  }
  return [...seen.entries()].map(([label, v]) => ({ key: label, ...v })).sort((a, b) => a.label.localeCompare(b.label));
}

function productMatchesColor(p: Product, activeColors: Set<string>): boolean {
  if (activeColors.size === 0) return true;
  for (const tag of p.tags) {
    const key = tag.toLowerCase().trim();
    const mapped = COLOR_MAP[key];
    if (mapped && activeColors.has(mapped.label)) return true;
  }
  return false;
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

  const currency = products[0]?.currency ?? "EUR";
  const sym = currency === "GBP" ? "£" : currency === "USD" ? "$" : "€";

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
                title={c.label}
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
        <div className="category-header">
          <h1 className="category-title">{label}</h1>
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

        <div className="category-layout">
          {/* Sidebar desktop */}
          <div className="filter-sidebar">
            <FilterPanel {...filterProps} />
          </div>

          {/* Grid */}
          <div className="category-grid-wrap">
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
