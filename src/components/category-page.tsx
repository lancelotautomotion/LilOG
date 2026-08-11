"use client";

/* ============================================================
   DIRECTORY_EXPLORER.EXE — /category/[handle]
   ------------------------------------------------------------
   Le catalogue vit dans une seule fenêtre applicative, comme
   /histoire, /durabilite et /faq : une barre de titre violette,
   un corps blanc, et à l'intérieur — menus, barre d'adresse, nom
   du rayon, FILTER_CONTROL.SYS et MEDIA_GRID empilés en sections,
   plutôt que des cartes séparées flottant sur le décor.

   En mobile, la colonne de filtres devient un bouton flottant
   [ 🎛️ FILTRES.EXE ] qui ouvre un tiroir (celui-là reste une
   fenêtre autonome, posée par-dessus la page).

   ⚠ PAREFEU : Tailwind + la feuille locale `lde-` ci-dessous,
   servie une seule fois pour toute la page. Aucune classe de
   globals.css — les anciennes règles `.category-*`, `.cat-vibe-*`
   et `.filter-*` ne sont plus utilisées par cette page.
   ============================================================ */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/lib/i18n-context";
import { Nav } from "@/components/nav";
import { Drawer } from "@/components/drawer";
import { Footer } from "@/components/footer";
import { Icon } from "@/components/icons";
import { FilterControl, type FilterState, type Sort } from "@/components/category/filter-control";
import { ProductWindow, type ViewMode } from "@/components/category/product-window";
import {
  BEVEL_IN,
  LCD,
  LeopardBackdrop,
  MONO,
  PLASTIC,
  PLASTIC_FACE,
  PLASTIC_PRESS,
  WindowFrame,
} from "@/components/y2k/kit";
import type { Product } from "@/lib/shopify/types";

const PER_PAGE = 20;

/* Identité éditoriale de chaque rayon — reprise telle quelle, seule la
   présentation change : elle vit désormais dans la fenêtre d'en-tête. */
const CAT_VIBES: Record<string, { tagline: string; desc: string; tags: string[] }> = {
  tops: {
    tagline: "Baby tee era, forever",
    desc: "Crop tops, bustiers, caraco… les pièces qui ont fait de la décennie 2000 une ère iconique. Du mesh, du velours, du strass — porté avec un jean taille basse et c'est réglé.",
    tags: ["Y2K", "Crop Top", "Limited Pieces", "Vintage 2000s"],
  },
  outerwear: {
    tagline: "Fur coat energy all year",
    desc: "Blazers oversize, manteaux en fausse fourrure, vestes en cuir verni… le outerwear qui fait toute la tenue. Enfile, sors, et laisse les gens regarder.",
    tags: ["Statement Piece", "Faux Fur", "Power Jacket", "It Girl"],
  },
  dresses: {
    tagline: "Main character dress-up",
    desc: "Mini, babydoll, slip dress, asymétrique — des robes qui racontent une histoire. Celle d'une fille qui sait exactement ce qu'elle fait.",
    tags: ["Party Ready", "Mini Dress", "Slip Dress", "Y2K Fever"],
  },
  skirts: {
    tagline: "Short skirt, long jacket energy",
    desc: "Mini jupes plissées, jupes en cuir, imprimés logomania… le bas qui transforme n'importe quel top en tenue complète.",
    tags: ["Micro Mini", "Pleated", "It Girl", "2000s Vibes"],
  },
  shorts: {
    tagline: "Hot pants only",
    desc: "Shorts taille basse, bermudas cargo, daisy dukes — l'été Y2K dans toute sa splendeur. À porter avec des mules plateforme, évidemment.",
    tags: ["Low Rise", "Cargo", "Summer Y2K", "2000s"],
  },
  trousers: {
    tagline: "Low rise is not a threat, it's a lifestyle",
    desc: "Pantalons taille basse, bootcut flare, cargos à poches — les silhouettes qui ont défini une époque. Retrouve ce feeling.",
    tags: ["Low Rise", "Bootcut", "Cargo Pants", "Y2K Uniform"],
  },
  swimwear: {
    tagline: "Resort 2002",
    desc: "Maillots bandeau, bikinis imprimés, tankinis Y2K… pour être la fille la plus stylée au bord de la piscine. SPF optionnel, style obligatoire.",
    tags: ["Bikini Season", "Resort Wear", "Print Mix", "Y2K Summer"],
  },
  jeans: {
    tagline: "The original low rise rebellion",
    desc: "Bootcut, flare, ultra low-rise, brodés, délavés, déchirés — tous les jeans qui ont fait de la taille basse une religion. Porte-les comme Paris Hilton en 2003.",
    tags: ["Bootcut", "Ultra Low Rise", "Embroidered", "Vintage Denim"],
  },
  bags: {
    tagline: "Arm candy only",
    desc: "Mini sacs, pochettes logomania, sacs à main en plastique coloré, cabas… l'accessoire qui fait ou défait une tenue. Pick carefully.",
    tags: ["Mini Bag", "Logomania", "It Bag", "Y2K Accessory"],
  },
  shoes: {
    tagline: "Platform or nothing",
    desc: "Mules plateforme, sneakers chunky, bottes à bouts pointus — les chaussures qui ajoutent des centimètres et beaucoup de caractère.",
    tags: ["Platform", "Chunky Sole", "Mules", "Statement Shoes"],
  },
  accessories: {
    tagline: "The more the better",
    desc: "Ceintures à boucle, foulards, lunettes papillon, bijoux strass — l'art du layering à son paroxysme. Superpose, multiplie, exagère.",
    tags: ["Layer Up", "Strass", "Belt Buckle", "Y2K Jewelry"],
  },
};

/** Nom de fichier du rayon, dans le chemin d'accès. */
function exeName(catKey: string, label: string): string {
  const slug = label
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return `${slug || catKey.toUpperCase()}.EXE`;
}

const EXPLORER_CSS = `
/* ---- Visuels des fiches : bascule A/B, contraste au survol ---- */
.lde-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;
  transition:opacity 420ms ease, transform 560ms ease, filter 320ms ease}
.lde-img-b{opacity:0}
.lde-media:hover .lde-img-a{opacity:0}
.lde-media:hover .lde-img-b{opacity:1}
.lde-media:hover .lde-img{transform:scale(1.06);filter:contrast(1.18) saturate(1.06)}

/* ---- La fenêtre-fiche se soulève ---- */
.lde-card{transition:transform 180ms ease, box-shadow 180ms ease}
.lde-card:hover{transform:translateY(-3px);box-shadow:7px 9px 0 rgba(24,12,58,.5)}

/* ---- Faders de l'égaliseur ----
   Deux <input type=range> superposés : la piste est décorative (dessinée
   au-dessous), seules les poignées reçoivent le pointeur. */
.lde-fader{-webkit-appearance:none;appearance:none;position:absolute;inset:0;
  width:100%;height:100%;margin:0;background:transparent;pointer-events:none}
.lde-fader:focus{outline:none}
.lde-fader::-webkit-slider-runnable-track{background:transparent;border:none}
.lde-fader::-moz-range-track{background:transparent;border:none}
.lde-fader::-webkit-slider-thumb{-webkit-appearance:none;pointer-events:auto;
  width:15px;height:26px;border-radius:4px;border:1px solid #6b6785;cursor:grab;
  background:linear-gradient(180deg,#fdfdff 0%,#ebe9f4 48%,#c9c6da 100%);
  box-shadow:inset 0 2px 3px rgba(255,255,255,.95),inset 0 -2px 4px rgba(0,0,0,.28),0 2px 3px rgba(30,36,48,.35)}
.lde-fader::-moz-range-thumb{pointer-events:auto;
  width:15px;height:26px;border-radius:4px;border:1px solid #6b6785;cursor:grab;
  background:linear-gradient(180deg,#fdfdff 0%,#ebe9f4 48%,#c9c6da 100%);
  box-shadow:inset 0 2px 3px rgba(255,255,255,.95),inset 0 -2px 4px rgba(0,0,0,.28),0 2px 3px rgba(30,36,48,.35)}
.lde-fader::-webkit-slider-thumb:active{cursor:grabbing}
.lde-fader:focus-visible::-webkit-slider-thumb{outline:2px solid #3b1d8f;outline-offset:2px}
.lde-fader:focus-visible::-moz-range-thumb{outline:2px solid #3b1d8f;outline-offset:2px}

/* ---- Tiroir des filtres (mobile) ---- */
.lde-sheet{transition:transform 260ms cubic-bezier(.2,1,.3,1)}
.lde-scrim{transition:opacity 220ms ease}

@media (prefers-reduced-motion: reduce){
  .lde-img,.lde-card,.lde-sheet,.lde-scrim{transition:none}
}
`;

/* ============================================================
   Briques d'en-tête
   ============================================================ */

/** Bascule d'affichage — le mode actif reste enfoncé. */
function ViewToggle({ view, setView }: { view: ViewMode; setView: (v: ViewMode) => void }) {
  const modes: [ViewMode, string][] = [
    ["grid", "🗔 GRILLE"],
    ["list", "☰ LISTE"],
  ];
  return (
    <div className="flex shrink-0 gap-1.5">
      {modes.map(([mode, label]) => {
        const on = view === mode;
        return (
          <button
            key={mode}
            type="button"
            onClick={() => setView(mode)}
            aria-pressed={on}
            className={`${MONO} rounded-md border px-2.5 py-2 text-[0.5rem] font-bold tracking-[0.06em] whitespace-nowrap uppercase transition active:translate-y-0.5 sm:text-[0.56rem] ${
              on
                ? "border-[#3b1d8f] bg-[linear-gradient(180deg,#a86fe8_0%,#7147d4_48%,#4b2a9e_100%)] text-white shadow-[inset_0_2px_5px_rgba(0,0,0,0.4)]"
                : `border-[#c6c2d8] ${PLASTIC_FACE} text-[#3b3550] hover:brightness-105 ${PLASTIC} ${PLASTIC_PRESS}`
            }`}
          >
            [ {label} ]
          </button>
        );
      })}
    </div>
  );
}

/* ============================================================
   Page
   ============================================================ */

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
  const router = useRouter();
  const searchParams = useSearchParams();

  const [menu, setMenu] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [view, setView] = useState<ViewMode>("grid");

  const label = t.cat[catKey] ?? catKey;
  const vibe = CAT_VIBES[catKey];

  /* ---- Bornes de prix de la collection ---- */
  const prices = products.map((p) => p.price);
  const globalMin = products.length ? Math.floor(Math.min(...prices)) : 0;
  const globalMax = products.length ? Math.ceil(Math.max(...prices)) : 9999;

  const [sort, setSortRaw] = useState<Sort>("default");
  const [priceMin, setPriceMinRaw] = useState(globalMin);
  const [priceMax, setPriceMaxRaw] = useState(globalMax);
  const [activeColors, setActiveColors] = useState<Set<string>>(new Set());
  const [activeTypes, setActiveTypes] = useState<Set<string>>(new Set());
  const [activeSizes, setActiveSizes] = useState<Set<string>>(new Set());
  const [activeMaterials, setActiveMaterials] = useState<Set<string>>(new Set());

  /* Toucher un filtre renvoie à la première page : le paramètre `?page`
     devenu caduc quitte l'URL. C'est fait dans le gestionnaire d'événement,
     pas dans un effet — la pagination est déjà bornée plus bas, donc rien ne
     casse si le paramètre traîne le temps d'une navigation. */
  const clearPage = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.has("page")) return;
    params.delete("page");
    const qs = params.toString();
    router.replace(window.location.pathname + (qs ? "?" + qs : ""), { scroll: false });
  }, [router]);

  const setSort = (s: Sort) => {
    setSortRaw(s);
    clearPage();
  };
  const setPriceMin = (n: number) => {
    setPriceMinRaw(n);
    clearPage();
  };
  const setPriceMax = (n: number) => {
    setPriceMaxRaw(n);
    clearPage();
  };

  const toggleIn =
    (setter: (fn: (prev: Set<string>) => Set<string>) => void) => (value: string) => {
      setter((prev) => {
        const next = new Set(prev);
        if (!next.delete(value)) next.add(value);
        return next;
      });
      clearPage();
    };

  const toggleColor = toggleIn(setActiveColors);
  const toggleType = toggleIn(setActiveTypes);
  const toggleSize = toggleIn(setActiveSizes);
  const toggleMaterial = toggleIn(setActiveMaterials);

  const reset = useCallback(() => {
    setSortRaw("default");
    setPriceMinRaw(globalMin);
    setPriceMaxRaw(globalMax);
    setActiveColors(new Set());
    setActiveTypes(new Set());
    setActiveSizes(new Set());
    setActiveMaterials(new Set());
    clearPage();
  }, [globalMin, globalMax, clearPage]);

  const activeCount =
    (sort !== "default" ? 1 : 0) +
    (priceMin > globalMin || priceMax < globalMax ? 1 : 0) +
    activeColors.size +
    activeTypes.size +
    activeSizes.size +
    activeMaterials.size;

  /* ---- Application des filtres ---- */
  const filtered = useMemo(() => {
    let list = sub
      ? products.filter((p) => p.productType.toLowerCase() === sub.toLowerCase())
      : products;

    list = list.filter((p) => p.price >= priceMin && p.price <= priceMax);
    if (activeColors.size > 0) list = list.filter((p) => p.colors.some((c) => activeColors.has(c)));
    if (activeTypes.size > 0) list = list.filter((p) => activeTypes.has(p.productType));
    if (activeSizes.size > 0) list = list.filter((p) => p.sizes.some((s) => activeSizes.has(s)));
    if (activeMaterials.size > 0) list = list.filter((p) => p.materials.some((m) => activeMaterials.has(m)));

    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);

    return list;
  }, [products, sub, sort, priceMin, priceMax, activeColors, activeTypes, activeSizes, activeMaterials]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageFromUrl = Math.max(0, parseInt(searchParams.get("page") ?? "1", 10) - 1);
  const safePage = Math.min(pageFromUrl, totalPages - 1);
  const pageProducts = filtered.slice(safePage * PER_PAGE, (safePage + 1) * PER_PAGE);

  const setPage = useCallback(
    (p: number) => {
      const params = new URLSearchParams(window.location.search);
      if (p === 0) params.delete("page");
      else params.set("page", String(p + 1));
      const qs = params.toString();
      router.push(window.location.pathname + (qs ? "?" + qs : ""), { scroll: false });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [router],
  );

  /* Le tiroir mobile se ferme à l'Échap, comme le menu latéral. */
  useEffect(() => {
    if (!filterOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setFilterOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [filterOpen]);

  const filterState: FilterState = {
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
  };

  return (
    <>
      <Nav onMenu={() => setMenu(true)} forceSolid />
      <Drawer open={menu} onClose={() => setMenu(false)} />

      {/* Pas de overflow-hidden ici : FILTER_CONTROL.SYS a besoin d'un
          panneau `sticky`, qui ne fonctionne sous aucun ancêtre en
          overflow non-visible — voir la note sur `clip` de WindowFrame. */}
      <main className="relative">
        <style>{EXPLORER_CSS}</style>
        <LeopardBackdrop />

        {/* La barre de navigation est fixe et opaque : la fenêtre commence en
            dessous, sinon elle mangerait sa barre de titre. */}
        <div className="relative z-[1] mx-auto w-full max-w-[1180px] px-4 pt-[calc(72px+clamp(16px,2.4vw,28px))] pb-[clamp(48px,8vw,96px)] sm:px-6">
          {/* ================= FENÊTRE UNIQUE ================= */}
          {/* clip=false : FILTER_CONTROL.SYS doit rester figé au scroll
              (position: sticky), ce qui ne fonctionne sous aucun ancêtre en
              overflow-hidden. La barre d'état, dernier bloc du corps, reçoit
              donc elle-même `rounded-b-2xl` pour garder le bas du cadre net. */}
          <WindowFrame
            title={`C:\\ LIL_OG \\ CATALOG \\ ${exeName(catKey, label)}`}
            icon={<Icon.folderOpen width={15} height={12} />}
            bodyStyle={{ backgroundColor: "#ffffff" }}
            clip={false}
          >
            {/* Barre de menus */}
            <div className="flex flex-wrap items-center gap-4 border-b border-[#c6c2d8] bg-[#e9e7f2] px-3 py-1.5">
              {["Fichier", "Édition", "Affichage", "Favoris", "?"].map((m) => (
                <span key={m} className={`${MONO} text-[0.54rem] tracking-[0.06em] text-[#3b3550] uppercase`}>
                  {m}
                </span>
              ))}
            </div>

            {/* Barre d'adresse */}
            <div className="flex items-center gap-2 border-b border-[#c6c2d8] bg-[#f0eef7] px-3 py-2">
              <span className={`${MONO} shrink-0 text-[0.52rem] tracking-[0.14em] text-[#6B7280] uppercase`}>
                Adresse
              </span>
              <span
                className={`${MONO} flex min-w-0 flex-1 items-center gap-1.5 rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-[0.54rem] tracking-[0.04em] text-[#1E2430] ${BEVEL_IN}`}
              >
                <Icon.folder width={14} height={12} className="shrink-0" />
                <span className="truncate">{`C:\\LIL_OG\\CATALOG\\${exeName(catKey, label)}`}</span>
              </span>
              <span
                className={`${MONO} shrink-0 rounded-full border border-[#c6c2d8] ${PLASTIC_FACE} px-3 py-1.5 text-[0.52rem] font-bold text-[#262626] ${PLASTIC}`}
              >
                [ OK ]
              </span>
            </div>

            {/* En-tête : nom du rayon, même typo/couleur que les titres de
                /histoire, /durabilite et /faq (police LCD, encre #2a1266,
                centré) plutôt qu'un style propre à cette page. */}
            <div className="border-b border-[#d8d5e6] px-4 pt-5 pb-4 text-center sm:px-6">
              <h1
                className={`${LCD} text-[clamp(1.9rem,6vw,3.2rem)] leading-[1.02] tracking-[0.02em] text-[#2a1266] uppercase`}
              >
                {label}
              </h1>
              {vibe && (
                <p className={`${MONO} mt-2 text-[0.6rem] tracking-[0.04em] text-[#5b2fb8] italic`}>
                  {vibe.tagline}
                </p>
              )}

              {vibe && (
                <div className="mt-4 rounded-xl border border-[#d8d5e6] bg-[#f7f6fc] p-[clamp(12px,2.2vw,20px)] text-left">
                  <p className={`${MONO} max-w-[70ch] text-[0.62rem] leading-[1.85] text-[#3b3550]`}>
                    {vibe.desc}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {vibe.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`${MONO} rounded-sm border border-[#c6c2d8] ${PLASTIC_FACE} px-2 py-1 text-[0.48rem] font-bold tracking-[0.04em] text-[#5b2fb8] uppercase ${PLASTIC}`}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sous-en-tête : nom du bloc grille + bascule d'affichage */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d8d5e6] px-4 py-3 sm:px-6">
              <h2 className={`${MONO} text-[0.66rem] font-bold tracking-[0.08em] text-[#3b1d8f] uppercase`}>
                MEDIA_GRID — {filtered.length} FICHIER(S)
              </h2>
              <ViewToggle view={view} setView={setView} />
            </div>

            {/* Corps : panneau de filtres + grille, dans le même bloc blanc.
                `items-start` retiré : un panneau `sticky` ne peut flotter que
                dans la hauteur de son propre parent, qui doit donc être
                étiré (par défaut, `items-stretch`) sur toute la hauteur de
                la grille pour lui laisser la place de rester figé. */}
            <div className="flex gap-5 px-4 py-4 sm:px-6">
              {/* FILTER_CONTROL.SYS — colonne collante à partir de lg, sans
                  chrome de fenêtre propre : elle vit dans ce même conteneur. */}
              <div className="hidden w-[270px] shrink-0 lg:block">
                <div className="sticky top-[86px]">
                  <FilterControl state={filterState} bare />
                </div>
              </div>

              <div className="min-w-0 flex-1">
                {filtered.length === 0 ? (
                  <div
                    className={`${MONO} mx-auto flex max-w-[420px] flex-col items-center gap-3 rounded-lg border-2 border-[#d8d5e6] bg-[#f7f6fc] px-4 py-16 text-center text-[0.62rem] text-[#3b3550]`}
                  >
                    <span aria-hidden className="text-[2rem]">
                      🗑️
                    </span>
                    <p>{t.category.empty}</p>
                    {activeCount > 0 && (
                      <button
                        type="button"
                        onClick={reset}
                        className={`${MONO} rounded-md border border-[#c6c2d8] ${PLASTIC_FACE} px-3 py-2 text-[0.52rem] font-bold text-[#262626] uppercase transition hover:brightness-105 ${PLASTIC} ${PLASTIC_PRESS}`}
                      >
                        [ ⟲ RÉINITIALISER LES FILTRES ]
                      </button>
                    )}
                  </div>
                ) : (
                  <div
                    className={
                      view === "grid"
                        ? "grid grid-cols-2 gap-[clamp(8px,1.4vw,14px)] md:grid-cols-3 xl:grid-cols-4"
                        : "flex flex-col gap-2.5"
                    }
                  >
                    {pageProducts.map((p, idx) => (
                      <ProductWindow key={p.id} product={p} idx={idx} view={view} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Barre d'état + pagination, au pied de la fenêtre unique —
                rounded-b-2xl : clip=false oblige, c'est elle qui ferme
                proprement le bas du cadre. */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-b-2xl border-t-2 border-[#c6c2d8] bg-[#e9e7f2] px-3 py-2">
              <span className={`${MONO} text-[0.5rem] tracking-[0.1em] text-[#3b3550] uppercase`}>
                {filtered.length} objet(s) · {pageProducts.length} affiché(s)
              </span>

              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={safePage === 0}
                    onClick={() => setPage(safePage - 1)}
                    className={`${MONO} rounded-md border border-[#c6c2d8] ${PLASTIC_FACE} px-2.5 py-1.5 text-[0.5rem] font-bold text-[#262626] uppercase transition hover:brightness-105 disabled:opacity-40 ${PLASTIC} ${PLASTIC_PRESS}`}
                  >
                    [ ◀ ]
                  </button>
                  <span
                    className={`${LCD} rounded border-2 border-[#2b2b3d] bg-black px-2 py-0.5 text-[1.05rem] leading-none text-green-400 ${BEVEL_IN}`}
                    style={{ textShadow: "0 0 8px rgba(74,222,128,.5)" }}
                  >
                    {safePage + 1}/{totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={safePage >= totalPages - 1}
                    onClick={() => setPage(safePage + 1)}
                    className={`${MONO} rounded-md border border-[#c6c2d8] ${PLASTIC_FACE} px-2.5 py-1.5 text-[0.5rem] font-bold text-[#262626] uppercase transition hover:brightness-105 disabled:opacity-40 ${PLASTIC} ${PLASTIC_PRESS}`}
                  >
                    [ ▶ ]
                  </button>
                </div>
              )}
            </div>
          </WindowFrame>
        </div>
      </main>

      {/* ---- Bouton flottant + tiroir des filtres (sous lg) ---- */}
      <button
        type="button"
        onClick={() => setFilterOpen(true)}
        className={`${MONO} fixed bottom-5 left-1/2 z-[70] -translate-x-1/2 rounded-full border-2 border-[#3b1d8f] px-5 py-3 text-[0.58rem] font-bold tracking-[0.08em] text-white uppercase transition active:translate-y-0.5 lg:hidden`}
        style={{
          background: "linear-gradient(180deg,#a86fe8 0%,#7147d4 48%,#3b1d8f 100%)",
          boxShadow:
            "0 5px 0 #2a1370, 0 12px 20px rgba(20,6,40,.45), inset 0 2px 0 rgba(255,255,255,.55)",
        }}
      >
        [ 🎛️ FILTRES.EXE ]
        {activeCount > 0 && (
          <span className="ml-2 rounded-full bg-[#ff45b4] px-1.5 py-0.5 text-[0.5rem] text-white">
            {activeCount}
          </span>
        )}
      </button>

      <div
        className={`lde-scrim fixed inset-0 z-[80] bg-[rgba(24,12,58,0.55)] lg:hidden ${
          filterOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setFilterOpen(false)}
        aria-hidden
      />
      <aside
        aria-hidden={!filterOpen}
        className={`lde-sheet fixed inset-x-0 bottom-0 z-[85] max-h-[86vh] overflow-y-auto overscroll-contain p-3 lg:hidden ${
          filterOpen ? "translate-y-0" : "pointer-events-none translate-y-full"
        }`}
      >
        <FilterControl state={filterState} onClose={() => setFilterOpen(false)} />
      </aside>

      <Footer />
    </>
  );
}
