"use client";

/* ============================================================
   FILTER_CONTROL.SYS — le panneau de configuration du catalogue
   ------------------------------------------------------------
   Les filtres ne sont plus une colonne de cases à cocher mais
   une fenêtre « Panneau de configuration » : boutons plastique
   à course 3D pour le tri, le type, la taille et la couleur, et
   un filtre de prix monté comme un égaliseur audio — bandes LED
   à segments (la répartition réelle des prix de la collection)
   et deux curseurs façon faders.

   ⚠ PAREFEU : Tailwind + feuille locale `lde-` servie par la
   page. Aucune classe de globals.css.
   ============================================================ */

import { useMemo } from "react";
import { compareSizes } from "@/lib/sizes";
import {
  BEVEL_IN,
  LCD,
  MONO,
  PLASTIC,
  PLASTIC_FACE,
  PLASTIC_PRESS,
  WindowFrame,
} from "@/components/y2k/kit";
import type { Product } from "@/lib/shopify/types";

export type Sort = "default" | "price-asc" | "price-desc";

const SORT_LABELS: Record<Sort, string> = {
  default: "NOUVEAUTÉS",
  "price-asc": "PRIX ↑",
  "price-desc": "PRIX ↓",
};

/* Palette des pastilles de couleur — liste blanche : une teinte inconnue est
   ignorée plutôt qu'affichée en gris sans signification. */
const COLOR_SWATCH: Record<string, string> = {
  rose: "#f7a3c8",
  rouge: "#c0392b",
  vert: "#2d7a4f",
  bleu: "#2c5f9e",
  noir: "#111111",
  blanc: "#f5f5f5",
  violet: "#6c3d8f",
  orange: "#e07b2a",
  jaune: "#f2c94c",
  marine: "#1a2e5a",
  kaki: "#6b6b3a",
  bordeaux: "#6b1a2b",
  gris: "#888888",
};

function norm(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export function extractColors(products: Product[]): { key: string; css: string }[] {
  const seen = new Set<string>();
  for (const p of products) for (const c of p.colors) seen.add(c);
  return [...seen].sort().flatMap((key) => {
    const css = COLOR_SWATCH[norm(key)];
    return css ? [{ key, css }] : [];
  });
}

/* ============================================================
   Briques
   ============================================================ */

/** Bouton « chunky plastic » à deux états, avec sa course à l'appui. */
function Chip({
  on,
  onClick,
  title,
  children,
}: {
  on: boolean;
  onClick: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      title={title}
      className={`${MONO} rounded-md border px-2.5 py-1.5 text-[0.52rem] font-bold tracking-[0.04em] whitespace-nowrap uppercase transition active:translate-y-0.5 ${
        on
          ? "border-[#3b1d8f] bg-[linear-gradient(180deg,#a86fe8_0%,#7147d4_48%,#4b2a9e_100%)] text-white shadow-[inset_0_2px_5px_rgba(0,0,0,0.4),inset_0_-1px_0_rgba(255,255,255,0.25)]"
          : `border-[#c6c2d8] ${PLASTIC_FACE} text-[#3b3550] hover:brightness-105 ${PLASTIC} ${PLASTIC_PRESS}`
      }`}
    >
      {children}
    </button>
  );
}

/** Bandeau de section, façon en-tête de rubrique du panneau. */
function Section({ n, label, children }: { n: string; label: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-[#d8d5e6] px-3 py-3 last:border-b-0">
      <p className={`${MONO} mb-2.5 text-[0.5rem] font-bold tracking-[0.16em] text-[#5b2fb8] uppercase`}>
        <span className="text-[#d3016d]">▸</span> {n} — {label}
      </p>
      {children}
    </div>
  );
}

/* ---- Égaliseur de prix ---- */

const BUCKETS = 22;

function PriceEqualizer({
  products,
  globalMin,
  globalMax,
  priceMin,
  priceMax,
  setPriceMin,
  setPriceMax,
}: {
  products: Product[];
  globalMin: number;
  globalMax: number;
  priceMin: number;
  priceMax: number;
  setPriceMin: (n: number) => void;
  setPriceMax: (n: number) => void;
}) {
  const span = Math.max(1, globalMax - globalMin);

  /* Une barre par tranche de prix : la hauteur, c'est le nombre de pièces.
     L'égaliseur affiche donc la vraie forme de la collection. */
  const bars = useMemo(() => {
    const counts = new Array(BUCKETS).fill(0) as number[];
    for (const p of products) {
      const i = Math.min(BUCKETS - 1, Math.max(0, Math.floor(((p.price - globalMin) / span) * BUCKETS)));
      counts[i] += 1;
    }
    const peak = Math.max(1, ...counts);
    return counts.map((c, i) => ({
      height: Math.round((c / peak) * 100),
      from: globalMin + (i / BUCKETS) * span,
      to: globalMin + ((i + 1) / BUCKETS) * span,
      count: c,
    }));
  }, [products, globalMin, span]);

  const pct = (v: number) => ((v - globalMin) / span) * 100;

  return (
    <div>
      {/* Écran de l'égaliseur */}
      <div
        className={`relative h-[76px] overflow-hidden rounded-md border-2 border-[#2b2b3d] bg-[#0b0b12] px-1.5 pt-2 pb-1 ${BEVEL_IN}`}
      >
        {/* Zone retenue, en surbrillance derrière les barres */}
        <span
          aria-hidden
          className="absolute inset-y-0 bg-[rgba(90,255,160,0.09)]"
          style={{ left: `${pct(priceMin)}%`, right: `${100 - pct(priceMax)}%` }}
        />
        <div className="relative flex h-full items-end gap-[2px]">
          {bars.map((b, i) => {
            const inRange = b.to > priceMin && b.from < priceMax;
            return (
              <span
                key={i}
                aria-hidden
                className="lde-eq-bar min-w-0 flex-1 rounded-[1px]"
                style={{
                  height: `${Math.max(b.count > 0 ? 12 : 5, b.height)}%`,
                  opacity: inRange ? 1 : 0.28,
                  background: inRange
                    ? "repeating-linear-gradient(to top,#5affa0 0 3px,rgba(0,0,0,0.85) 3px 5px)"
                    : "repeating-linear-gradient(to top,#4b4a63 0 3px,rgba(0,0,0,0.85) 3px 5px)",
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Les deux faders, superposés sur la même piste */}
      <div className="relative mt-2 h-7">
        <span
          aria-hidden
          className={`absolute top-1/2 right-0 left-0 h-[7px] -translate-y-1/2 rounded-full bg-[#c6c2d8] ${BEVEL_IN}`}
        />
        <span
          aria-hidden
          className="absolute top-1/2 h-[7px] -translate-y-1/2 rounded-full bg-[linear-gradient(90deg,#7147d4,#ff45b4)]"
          style={{ left: `${pct(priceMin)}%`, right: `${100 - pct(priceMax)}%` }}
        />
        <input
          type="range"
          className="lde-fader"
          min={globalMin}
          max={globalMax}
          value={priceMin}
          aria-label="Prix minimum"
          onChange={(e) => setPriceMin(Math.min(Number(e.target.value), priceMax))}
        />
        <input
          type="range"
          className="lde-fader"
          min={globalMin}
          max={globalMax}
          value={priceMax}
          aria-label="Prix maximum"
          onChange={(e) => setPriceMax(Math.max(Number(e.target.value), priceMin))}
        />
      </div>

      {/* Afficheurs */}
      <div className="mt-2 flex items-center gap-2">
        {([
          ["MIN", priceMin],
          ["MAX", priceMax],
        ] as const).map(([label, value]) => (
          <span
            key={label}
            className={`flex flex-1 items-center justify-between rounded border-2 border-[#2b2b3d] bg-black px-2 py-1 ${BEVEL_IN}`}
          >
            <span className={`${MONO} text-[0.44rem] font-bold tracking-[0.1em] text-white/40`}>{label}</span>
            <span
              className={`${LCD} text-[1.15rem] leading-none text-green-400`}
              style={{ textShadow: "0 0 8px rgba(74,222,128,.5)" }}
            >
              €{value}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   Panneau
   ============================================================ */

export interface FilterState {
  products: Product[];
  globalMin: number;
  globalMax: number;
  sort: Sort;
  setSort: (s: Sort) => void;
  priceMin: number;
  setPriceMin: (n: number) => void;
  priceMax: number;
  setPriceMax: (n: number) => void;
  activeColors: Set<string>;
  toggleColor: (c: string) => void;
  activeTypes: Set<string>;
  toggleType: (t: string) => void;
  activeSizes: Set<string>;
  toggleSize: (s: string) => void;
  reset: () => void;
  activeCount: number;
}

export function FilterControl({ state, onClose }: { state: FilterState; onClose?: () => void }) {
  const {
    products,
    globalMin,
    globalMax,
    sort,
    setSort,
    priceMin,
    setPriceMin,
    priceMax,
    setPriceMax,
    activeColors,
    toggleColor,
    activeTypes,
    toggleType,
    activeSizes,
    toggleSize,
    reset,
    activeCount,
  } = state;

  const types = useMemo(() => {
    const set = new Set<string>();
    for (const p of products) if (p.productType) set.add(p.productType);
    return [...set].sort();
  }, [products]);

  const sizes = useMemo(() => {
    const set = new Set<string>();
    for (const p of products) for (const s of p.sizes) set.add(s);
    return [...set].sort(compareSizes);
  }, [products]);

  const colors = useMemo(() => extractColors(products), [products]);

  return (
    <WindowFrame title="FILTER_CONTROL.SYS" icon="🎛️" className="w-full">
      {/* Barre d'état du panneau */}
      <div className="flex items-center justify-between gap-2 border-b border-[#c6c2d8] bg-[#e9e7f2] px-3 py-1.5">
        <span className={`${MONO} text-[0.5rem] tracking-[0.1em] text-[#3b3550] uppercase`}>
          {activeCount > 0 ? `${activeCount} filtre(s) actif(s)` : "Aucun filtre"}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={reset}
            disabled={activeCount === 0}
            className={`${MONO} rounded-md border border-[#c6c2d8] ${PLASTIC_FACE} px-2 py-1 text-[0.48rem] font-bold text-[#262626] uppercase transition hover:brightness-105 disabled:opacity-40 ${PLASTIC} ${PLASTIC_PRESS}`}
          >
            [ ⟲ RESET ]
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer les filtres"
              className={`${MONO} rounded-md border border-[#c6c2d8] ${PLASTIC_FACE} px-2 py-1 text-[0.48rem] font-bold text-[#262626] uppercase transition hover:brightness-105 ${PLASTIC} ${PLASTIC_PRESS}`}
            >
              [ ✖ ]
            </button>
          )}
        </div>
      </div>

      <Section n="01" label="TRIER PAR">
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(SORT_LABELS) as Sort[]).map((s) => (
            <Chip key={s} on={sort === s} onClick={() => setSort(s)}>
              {SORT_LABELS[s]}
            </Chip>
          ))}
        </div>
      </Section>

      <Section n="02" label="PRIX">
        <PriceEqualizer
          products={products}
          globalMin={globalMin}
          globalMax={globalMax}
          priceMin={priceMin}
          priceMax={priceMax}
          setPriceMin={setPriceMin}
          setPriceMax={setPriceMax}
        />
      </Section>

      {sizes.length > 0 && (
        <Section n="03" label="TAILLE">
          <div className="flex flex-wrap gap-1.5">
            {sizes.map((s) => (
              <Chip key={s} on={activeSizes.has(s)} onClick={() => toggleSize(s)}>
                {s}
              </Chip>
            ))}
          </div>
        </Section>
      )}

      {types.length > 0 && (
        <Section n={sizes.length > 0 ? "04" : "03"} label="TYPE">
          <div className="flex flex-wrap gap-1.5">
            {types.map((type) => (
              <Chip key={type} on={activeTypes.has(type)} onClick={() => toggleType(type)}>
                {type}
              </Chip>
            ))}
          </div>
        </Section>
      )}

      {colors.length > 0 && (
        <Section n={sizes.length > 0 ? "05" : "04"} label="COULEUR">
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => {
              const on = activeColors.has(c.key);
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => toggleColor(c.key)}
                  aria-pressed={on}
                  aria-label={c.key}
                  title={c.key}
                  className={`h-7 w-7 rounded-full border-2 transition active:translate-y-0.5 ${PLASTIC} ${
                    on ? "border-[#3b1d8f] ring-2 ring-[#ff45b4] ring-offset-1" : "border-white/70 hover:brightness-110"
                  }`}
                  style={{ background: c.css }}
                />
              );
            })}
          </div>
        </Section>
      )}
    </WindowFrame>
  );
}
