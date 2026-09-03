"use client";

/* ============================================================
   FILTER_CONTROL.SYS : le panneau de configuration du catalogue
   ------------------------------------------------------------
   Les filtres ne sont plus une colonne de cases à cocher mais
   une fenêtre « Panneau de configuration » : boutons plastique
   à course 3D pour le tri, le type, la taille et la couleur, et
   un filtre de prix monté comme un égaliseur audio : bandes LED
   à segments (la répartition réelle des prix de la collection)
   et deux curseurs façon faders.

   ⚠ PAREFEU : Tailwind + feuille locale `lde-` servie par la
   page. Aucune classe de globals.css.
   ============================================================ */

import { useMemo, useState } from "react";
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

/* ============================================================
   Les pastilles de couleur : des strass, pas des ronds
   ------------------------------------------------------------
   Chaque teinte du catalogue est une étoile taillée (le même
   tracé que les strass de /contact) dans une rampe de trois
   tons : éclat, teinte, tranche. La palette est franchement Y2K
   (bonbon, néon, givré, chrome) plutôt que les aplats sourds
   d'origine.

   Même recette de taille que les strass de la maison : aplat en
   dégradé, facettes par branche, voile de relief, liseré clair et
   éclat spéculaire.
   ============================================================ */

const STAR_PATH =
  "M50 3 L62.3 33 L94.7 35.5 L70 56.5 L77.6 88 L50 71 L22.4 88 L30 56.5 L5.3 35.5 L37.7 33 Z";

/** Éclat, teinte, tranche. `holo` remplace l'aplat par le nuancier irisé. */
interface Gem {
  tones: [string, string, string];
  holo?: boolean;
}

const HOLO_STOPS: [string, string][] = [
  ["0%", "#cfe0ff"],
  ["18%", "#e8d6ff"],
  ["36%", "#ffdff0"],
  ["54%", "#fdf7dd"],
  ["72%", "#d6fbef"],
  ["88%", "#d8e2ff"],
  ["100%", "#efe4ff"],
];

/* Liste blanche : une teinte inconnue est ignorée plutôt qu'affichée en gris
   sans signification. Elle couvre les libellés officiels Shopify remontés par
   les champs méta Catégorie ("Multicolore", "Écru", "Doré"…), pas seulement
   les noms de couleur les plus simples. */
const COLOR_GEM: Record<string, Gem> = {
  rose:      { tones: ["#FFE1F2", "#FF8FD2", "#C42E8E"] },
  fuchsia:   { tones: ["#FFD1F0", "#FF3DAF", "#9E0F6C"] },
  rouge:     { tones: ["#FFC9C4", "#FF3B4E", "#9E0E28"] },
  corail:    { tones: ["#FFDCC8", "#FF7857", "#BA3418"] },
  vert:      { tones: ["#D9FFE7", "#2FE07C", "#0B7A44"] },
  kaki:      { tones: ["#EEF2C0", "#9AA33F", "#4C5117"] },
  bleu:      { tones: ["#D6E9FF", "#3E8BFF", "#0F3DA6"] },
  marine:    { tones: ["#C2CFF2", "#2B3F8C", "#0A1745"] },
  turquoise: { tones: ["#D2FFF7", "#25DCCE", "#067C78"] },
  violet:    { tones: ["#EBDBFF", "#9B5CFF", "#4A1FA6"] },
  noir:      { tones: ["#9FA0BC", "#33333F", "#050509"] },
  blanc:     { tones: ["#FFFFFF", "#EEF1FB", "#98A0BC"] },
  ecru:      { tones: ["#FFFCF2", "#F0E5CC", "#A08B63"] },
  ivoire:    { tones: ["#FFFDF7", "#F5EDD8", "#AD9A6D"] },
  beige:     { tones: ["#FFF1DD", "#E7CFA6", "#A5825A"] },
  camel:     { tones: ["#FFDDBA", "#D59253", "#87501F"] },
  taupe:     { tones: ["#EADFD8", "#A08D80", "#5B4940"] },
  orange:    { tones: ["#FFE3C2", "#FF8A22", "#B24A02"] },
  jaune:     { tones: ["#FFFAC8", "#FFD429", "#B08400"] },
  bordeaux:  { tones: ["#F5BECB", "#8C1F3D", "#49091C"] },
  gris:      { tones: ["#F2F3FA", "#A9ACC0", "#5C5F75"] },
  argente:   { tones: ["#FFFFFF", "#D6DCEE", "#878DA6"] },
  dore:      { tones: ["#FFF4C6", "#E9B93A", "#94670E"] },
  or:        { tones: ["#FFF4C6", "#E9B93A", "#94670E"] },
  multicolore: { tones: ["#EAF2FF", "#FFE1F5", "#8E8ABE"], holo: true },
  imprime:     { tones: ["#EAF2FF", "#FFE1F5", "#8E8ABE"], holo: true },
};

function norm(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export function extractColors(products: Product[]): { key: string; gem: Gem }[] {
  const seen = new Set<string>();
  for (const p of products) for (const c of p.colors) seen.add(c);
  return [...seen].sort().flatMap((key) => {
    const gem = COLOR_GEM[norm(key)];
    return gem ? [{ key, gem }] : [];
  });
}

/* Facettes de la taille : pour chaque branche, une moitié éclairée et une
   moitié à l'ombre partant du centre : le même découpage que les strass de
   /contact, mais en blanc et noir translucides plutôt qu'en rose, pour que
   la même taille tienne sur toutes les teintes, du blanc au noir. */
const STAR_TIPS: [number, number][] = [
  [50, 3],
  [94.7, 35.5],
  [77.6, 88],
  [22.4, 88],
  [5.3, 35.5],
];
const STAR_NOTCHES: [number, number][] = [
  [62.3, 33],
  [70, 56.5],
  [50, 71],
  [30, 56.5],
  [37.7, 33],
];

/** Un strass taillé. `uid` isole les dégradés : deux pastilles sur la même
 *  page ne peuvent pas se voler leur `id`. La boîte déborde de 6 unités de
 *  chaque côté pour que le liseré des pointes ne soit jamais rogné. */
function ColorGem({ uid, gem }: { uid: string; gem: Gem }) {
  const face = `${uid}-face`;
  const relief = `${uid}-relief`;
  const clip = `${uid}-clip`;
  return (
    <svg viewBox="-6 -6 112 112" className="h-full w-full">
      <defs>
        <linearGradient id={face} x1="0.15" y1="0" x2="0.85" y2="1">
          {gem.holo ? (
            HOLO_STOPS.map(([offset, color]) => (
              <stop key={offset} offset={offset} stopColor={color} />
            ))
          ) : (
            <>
              <stop offset="0%" stopColor={gem.tones[0]} />
              <stop offset="46%" stopColor={gem.tones[1]} />
              <stop offset="100%" stopColor={gem.tones[2]} />
            </>
          )}
        </linearGradient>
        {/* Voile de relief : lumière en haut à gauche, ombre en bas à droite. */}
        <linearGradient id={relief} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.34" />
          <stop offset="52%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.24" />
        </linearGradient>
        {/* L'éclat spéculaire chevauche un creux entre deux branches : sans
            cette découpe, il déborde de la pierre en éclat flottant. */}
        <clipPath id={clip}>
          <path d={STAR_PATH} />
        </clipPath>
      </defs>
      <path d={STAR_PATH} fill={`url(#${face})`} stroke={gem.tones[2]} strokeWidth="6" strokeLinejoin="round" />
      {STAR_TIPS.map(([tx, ty], i) => {
        const [ax, ay] = STAR_NOTCHES[(i + 4) % 5];
        const [bx, by] = STAR_NOTCHES[i];
        return (
          <g key={i}>
            <path d={`M50 50 L${ax} ${ay} L${tx} ${ty} Z`} fill="#ffffff" opacity={0.42 - i * 0.06} />
            <path d={`M50 50 L${tx} ${ty} L${bx} ${by} Z`} fill="#000000" opacity={0.08 + i * 0.035} />
          </g>
        );
      })}
      <path d={STAR_PATH} fill={`url(#${relief})`} />
      {/* Liseré clair : l'effet « plastique bombé » des strass de /contact. */}
      <path d={STAR_PATH} fill="none" stroke="#ffffff" strokeWidth="2.4" strokeLinejoin="round" opacity="0.55" />
      <ellipse
        cx="38"
        cy="29"
        rx="8"
        ry="3.6"
        fill="#fff"
        opacity="0.75"
        transform="rotate(-36 38 29)"
        clipPath={`url(#${clip})`}
      />
    </svg>
  );
}

/* ============================================================
   Briques
   ============================================================ */

/** Bouton « chunky plastic » à deux états, avec sa course à l'appui. */
function Chip({
  on,
  onClick,
  title,
  compact = false,
  dense = false,
  children,
}: {
  on: boolean;
  onClick: () => void;
  title?: string;
  /** Rubriques à longue liste (matières, types) : un cran plus bas. */
  compact?: boolean;
  /** TRIER PAR : un cran de plus que `compact`, pour que ses trois jetons
   *  tiennent sur une seule ligne dans les 270px de la colonne filtres. */
  dense?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      title={title}
      className={`${MONO} rounded-md border font-bold tracking-[0.04em] whitespace-nowrap uppercase transition active:translate-y-0.5 ${
        dense ? "px-1.5 py-1 text-[0.8125rem]" : compact ? "px-2 py-1 text-[0.8125rem]" : "px-2.5 py-1.5 text-[0.875rem]"
      } ${
        on
          ? "border-[#3b1d8f] bg-[linear-gradient(180deg,#a86fe8_0%,#7147d4_48%,#4b2a9e_100%)] text-white shadow-[inset_0_2px_5px_rgba(0,0,0,0.4),inset_0_-1px_0_rgba(255,255,255,0.25)]"
          : `border-[#c6c2d8] ${PLASTIC_FACE} text-[#3b3550] hover:brightness-105 ${PLASTIC} ${PLASTIC_PRESS}`
      }`}
    >
      {children}
    </button>
  );
}

const SECTION_HEAD = "text-[0.8125rem] font-bold tracking-[0.16em] text-[#5b2fb8] uppercase";

/** Bandeau de section, façon en-tête de rubrique du panneau.
 *
 *  `collapsible` replie la rubrique : matières et types alignent à eux deux
 *  une trentaine de jetons, qui repoussaient le reste du panneau hors de
 *  l'écran. Le chevron dit l'état, ▸ fermé et ▾ ouvert, et la pastille
 *  rappelle les choix retenus quand la rubrique est repliée. */
function Section({
  n,
  label,
  collapsible = false,
  activeCount = 0,
  children,
}: {
  n: string;
  label: string;
  collapsible?: boolean;
  activeCount?: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  if (!collapsible) {
    return (
      <div className="border-b border-[#d8d5e6] px-3 py-3 last:border-b-0">
        <p className={`${MONO} mb-2.5 ${SECTION_HEAD}`}>
          <span className="text-[#d3016d]">▸</span> {n} · {label}
        </p>
        {children}
      </div>
    );
  }

  return (
    <div className="border-b border-[#d8d5e6] px-3 py-3 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`${MONO} flex w-full items-center gap-1.5 text-left ${SECTION_HEAD} transition hover:text-[#3b1d8f]`}
      >
        <span className="text-[#d3016d]">{open ? "▾" : "▸"}</span>
        {n} · {label}
        {activeCount > 0 && (
          <span className="rounded-full bg-[#7147d4] px-1.5 py-px text-[0.8125rem] leading-none text-white">
            {activeCount}
          </span>
        )}
      </button>
      {open && <div className="mt-2.5">{children}</div>}
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
            <span className={`${MONO} text-[0.8125rem] font-bold tracking-[0.1em] text-white/40`}>{label}</span>
            <span
              className={`${LCD} text-[1.125rem] leading-none text-green-400`}
              style={{ textShadow: "0 0 8px rgba(74,222,128,.5)" }}
            >
              {value}€
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
  activeMaterials: Set<string>;
  toggleMaterial: (m: string) => void;
  reset: () => void;
  activeCount: number;
}

export function FilterControl({
  state,
  onClose,
  bare = false,
}: {
  state: FilterState;
  onClose?: () => void;
  /** Sans le chrome de fenêtre (barre de titre violette, bordure, ombre),
   * pour s'intégrer dans le conteneur unique du catalogue plutôt que d'y
   * imbriquer une seconde fenêtre. Le tiroir mobile garde le chrome complet,
   * lui reste un panneau autonome posé par-dessus la page. */
  bare?: boolean;
}) {
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
    activeMaterials,
    toggleMaterial,
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

  const materials = useMemo(() => {
    const set = new Set<string>();
    for (const p of products) for (const m of p.materials) set.add(m);
    return [...set].sort();
  }, [products]);

  /* Numérotation des rubriques : un compteur plutôt que des indices écrits
     en dur, parce que TAILLE, TYPE, COULEUR et MATIÈRE n'apparaissent que si
     la collection en a : un numéro figé (« 04 » pour TYPE) se serait décalé
     à chaque fois qu'une rubrique au-dessus se vide ou s'ajoute. */
  let sectionN = 2;
  const nextN = () => String(++sectionN).padStart(2, "0");

  /* Barre d'état : séparée du corps parce qu'en mode `bare` elle reste
     figée en haut du panneau pendant que les rubriques défilent : le
     bouton RESET doit rester à portée de clic. */
  const statusBar = (
    <div className="flex shrink-0 items-center justify-between gap-2 border-b border-[#c6c2d8] bg-[#e9e7f2] px-3 py-1.5">
        <span className={`${MONO} min-w-0 flex-1 truncate text-[0.8125rem] tracking-[0.1em] text-[#3b3550] uppercase`}>
          {activeCount > 0 ? `${activeCount} filtre(s) actif(s)` : "Aucun filtre"}
        </span>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={reset}
            disabled={activeCount === 0}
            className={`${MONO} shrink-0 rounded-md border border-[#c6c2d8] ${PLASTIC_FACE} px-2 py-1 text-[0.8125rem] font-bold whitespace-nowrap text-[#262626] uppercase transition hover:brightness-105 disabled:opacity-40 ${PLASTIC} ${PLASTIC_PRESS}`}
          >
            [ ⟲ RESET ]
          </button>
      </div>
    </div>
  );

  const sections = (
    <>
      <Section n="01" label="TRIER PAR">
        <div className="flex flex-nowrap gap-1">
          {(Object.keys(SORT_LABELS) as Sort[]).map((s) => (
            <Chip key={s} on={sort === s} onClick={() => setSort(s)} dense>
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
        <Section n={nextN()} label="TAILLE">
          <div className="flex flex-wrap gap-1.5">
            {sizes.map((s) => (
              <Chip key={s} on={activeSizes.has(s)} onClick={() => toggleSize(s)}>
                {s}
              </Chip>
            ))}
          </div>
        </Section>
      )}

      {colors.length > 0 && (
        <Section n={nextN()} label="COULEUR">
          {/* Dès qu'un strass est retenu, les autres s'estompent : le choix
              actif se lit sans avoir à comparer les halos un par un. */}
          <div className={`flex flex-wrap gap-1.5${activeColors.size > 0 ? " lde-gems-narrowed" : ""}`}>
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
                  className={`lde-gem h-8 w-8${on ? " lde-gem-on" : ""}`}
                >
                  <ColorGem uid={`lde-gem-${bare ? "d" : "m"}-${norm(c.key)}`} gem={c.gem} />
                </button>
              );
            })}
          </div>
        </Section>
      )}

      {materials.length > 0 && (
        <Section n={nextN()} label="MATIÈRE" collapsible activeCount={activeMaterials.size}>
          <div className="flex flex-wrap gap-1">
            {materials.map((m) => (
              <Chip key={m} compact on={activeMaterials.has(m)} onClick={() => toggleMaterial(m)}>
                {m}
              </Chip>
            ))}
          </div>
        </Section>
      )}

      {types.length > 0 && (
        <Section n={nextN()} label="TYPE" collapsible activeCount={activeTypes.size}>
          <div className="flex flex-wrap gap-1">
            {types.map((type) => (
              <Chip key={type} compact on={activeTypes.has(type)} onClick={() => toggleType(type)}>
                {type}
              </Chip>
            ))}
          </div>
        </Section>
      )}
    </>
  );

  if (bare) {
    /* Colonne de bureau : le panneau ne dépasse jamais la hauteur visible
       (86px de barre de navigation collante + 16px de marge basse), et ce
       sont ses rubriques qui défilent à l'intérieur. Sans ce plafond, un
       panneau plus haut que l'écran restait figé par `sticky` avec son bas
       hors cadre : les dernières rubriques n'étaient atteignables qu'en
       arrivant au pied de la page. */
    return (
      <div className="flex max-h-[calc(100dvh-102px)] flex-col overflow-hidden rounded-lg border border-[#d8d5e6] bg-white">
        {statusBar}
        {/* min-h-0 : sans lui, un enfant flex refuse de se réduire sous la
            hauteur de son contenu et le débordement repart sur la page. */}
        <div className="lde-filters-scroll min-h-0 flex-1 overflow-y-auto">{sections}</div>
      </div>
    );
  }

  return (
    <WindowFrame title="FILTER_CONTROL.SYS" icon="🎛️" className="w-full" onClose={onClose}>
      {statusBar}
      {sections}
    </WindowFrame>
  );
}
