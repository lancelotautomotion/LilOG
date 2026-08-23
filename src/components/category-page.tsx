"use client";

/* ============================================================
   DIRECTORY_EXPLORER.EXE : /category/[handle]
   ------------------------------------------------------------
   Le catalogue vit dans une seule fenêtre applicative, comme
   /histoire, /durabilite et /faq : une barre de titre violette,
   un corps blanc, et à l'intérieur : menus, barre d'adresse, nom
   du rayon, FILTER_CONTROL.SYS et MEDIA_GRID empilés en sections,
   plutôt que des cartes séparées flottant sur le décor.

   En mobile, la colonne de filtres devient un bouton flottant
   [ 🎛️ FILTRES.EXE ] qui ouvre un tiroir (celui-là reste une
   fenêtre autonome, posée par-dessus la page).

   ⚠ PAREFEU : Tailwind + la feuille locale `lde-` ci-dessous,
   servie une seule fois pour toute la page. Aucune classe de
   globals.css : les anciennes règles `.category-*`, `.cat-vibe-*`
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
import { ProductWindow } from "@/components/category/product-window";
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
import { CAT_VIBES } from "@/lib/categories";

const PER_PAGE = 20;

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

/* ---- Strass de la rubrique COULEUR ----
   Les pastilles rondes sont devenues des pierres taillées (voir
   filter-control.tsx). Le bouton ne porte plus ni fond ni bordure : c'est
   la pierre qui est la cible, elle se soulève au survol et brille une fois
   retenue. Les non-retenues s'effacent dès qu'un choix est fait. */
.lde-gem{padding:0;border:none;background:none;cursor:pointer;line-height:0;
  filter:drop-shadow(0 2px 2px rgba(30,20,60,.35));
  transition:transform 150ms ease, filter 150ms ease, opacity 150ms ease}
.lde-gem:hover{transform:translateY(-2px) rotate(-5deg) scale(1.1)}
.lde-gem:active{transform:translateY(1px) scale(1.02)}
.lde-gem:focus-visible{outline:2px solid #3b1d8f;outline-offset:3px;border-radius:6px}
.lde-gem-on{transform:scale(1.16);
  filter:drop-shadow(0 0 5px rgba(255,69,180,.95)) drop-shadow(0 2px 2px rgba(30,20,60,.4))}
.lde-gem-on:hover{transform:translateY(-2px) scale(1.16)}
.lde-gems-narrowed .lde-gem:not(.lde-gem-on){opacity:.4;filter:grayscale(.4) drop-shadow(0 1px 1px rgba(30,20,60,.3))}
.lde-gems-narrowed .lde-gem:not(.lde-gem-on):hover{opacity:1;filter:drop-shadow(0 2px 2px rgba(30,20,60,.35))}

/* ---- Tiroir des filtres (mobile) ---- */
.lde-sheet{transition:transform 260ms cubic-bezier(.2,1,.3,1)}
.lde-scrim{transition:opacity 220ms ease}

/* ---- Ascenseur du panneau de filtres (bureau) ----
   Même plastique biseauté que l'ascenseur du Notepad de la fiche produit.
   scrollbar-gutter:stable réserve la gouttière en permanence : sans elle
   Chrome n'affiche l'ascenseur qu'au survol et rien n'indique que les
   rubriques continuent plus bas. On ne déclare pas scrollbar-width /
   scrollbar-color, qui désactiveraient les pseudo-éléments -webkit-. */
.lde-filters-scroll{scrollbar-gutter:stable}
.lde-filters-scroll::-webkit-scrollbar{width:12px}
.lde-filters-scroll::-webkit-scrollbar-track{background:#eceafa;border-left:1px solid #d8d5e6}
.lde-filters-scroll::-webkit-scrollbar-thumb{border:1px solid #a5a1bd;
  background:linear-gradient(180deg,#fdfdff 0%,#ebe9f4 48%,#c9c6da 100%);
  box-shadow:inset 1px 1px 0 rgba(255,255,255,.95),inset -1px -1px 0 rgba(90,86,120,.55)}

@media (prefers-reduced-motion: reduce){
  .lde-img,.lde-card,.lde-sheet,.lde-scrim,.lde-gem{transition:none}
  .lde-gem:hover{transform:none}
}
`;

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
     pas dans un effet : la pagination est déjà bornée plus bas, donc rien ne
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
          overflow non-visible : voir la note sur `clip` de WindowFrame. */}
      <main className="relative">
        <style>{EXPLORER_CSS}</style>
        <LeopardBackdrop />

        {/* La barre de navigation est fixe et opaque : la fenêtre commence en
            dessous, sinon elle mangerait sa barre de titre. */}
        <div className="relative z-[1] mx-auto w-full max-w-[1400px] px-4 pt-[calc(72px+clamp(8px,1vw,12px))] pb-[clamp(24px,4vw,48px)] sm:px-6">
          {/* ================= FENÊTRE UNIQUE ================= */}
          {/* clip=false : FILTER_CONTROL.SYS doit rester figé au scroll
              (position: sticky), ce qui ne fonctionne sous aucun ancêtre en
              overflow-hidden. La barre d'état, dernier bloc du corps, reçoit
              donc elle-même `rounded-b-2xl` pour garder le bas du cadre net —
              et le corps de la fenêtre (bodyClassName) aussi : sans quoi son
              propre coin carré, blanc, dépasse derrière l'arrondi de la
              barre d'état et y laissait un fin croissant visible. */}
          <WindowFrame
            title={`C:\\ LIL_OG \\ CATALOG \\ ${exeName(catKey, label)}`}
            icon={<Icon.folderOpen width={15} height={12} />}
            bodyClassName="rounded-b-2xl"
            bodyStyle={{ backgroundColor: "#ffffff" }}
            clip={false}
          >
            {/* Barre de menus */}
            <div className="flex flex-wrap items-center gap-2.5 border-b border-[#c6c2d8] bg-[#e9e7f2] px-3 py-1 sm:gap-4">
              {["Fichier", "Édition", "Affichage", "Favoris", "?"].map((m) => (
                <span key={m} className={`${MONO} text-[0.8125rem] tracking-[0.06em] text-[#3b3550] uppercase`}>
                  {m}
                </span>
              ))}
            </div>

            {/* Barre d'adresse */}
            <div className="flex items-center gap-2 border-b border-[#c6c2d8] bg-[#f0eef7] px-3 py-1.5">
              <span className={`${MONO} shrink-0 text-[0.8125rem] tracking-[0.14em] text-[#6B7280] uppercase`}>
                Adresse
              </span>
              <span
                className={`${MONO} flex min-w-0 flex-1 items-center gap-1.5 rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-[0.8125rem] tracking-[0.04em] text-[#1E2430] ${BEVEL_IN}`}
              >
                <Icon.folder width={14} height={12} className="shrink-0" />
                <span className="truncate">{`C:\\LIL_OG\\CATALOG\\${exeName(catKey, label)}`}</span>
              </span>
              <span
                className={`${MONO} shrink-0 rounded-full border border-[#c6c2d8] ${PLASTIC_FACE} px-3 py-1.5 text-[0.8125rem] font-bold text-[#262626] ${PLASTIC}`}
              >
                [ OK ]
              </span>
            </div>

            {/* En-tête : nom du rayon, même typo/couleur que les titres de
                /histoire, /durabilite et /faq (police LCD, encre #2a1266,
                centré) plutôt qu'un style propre à cette page.

                ⚠ Hauteurs comptées : cet en-tête, additionné au chrome de la
                fenêtre au-dessus, décide de ce qu'on voit des vêtements en
                arrivant sur la page. Il a été resserré (marges, corps du
                titre, colonne de texte élargie à 130ch pour tenir en deux
                lignes) pour que la première rangée de la grille tienne dans
                l'écran d'un portable. Le rallonger la repousse en dessous. */}
            <div className="border-b border-[#d8d5e6] px-4 pt-4 pb-3 text-center sm:px-6">
              <h1
                className={`${LCD} text-[clamp(1.7rem,4.4vw,2.5rem)] leading-[1.02] tracking-[0.02em] text-[#2a1266] uppercase`}
              >
                {label}
              </h1>
              {vibe && (
                <p className={`${MONO} mt-1.5 text-[0.9375rem] tracking-[0.04em] text-[#5b2fb8] italic`}>
                  {vibe.tagline}
                </p>
              )}

              {vibe && (
                <div className="mt-3 rounded-xl border border-[#d8d5e6] bg-[#f7f6fc] p-[clamp(10px,1.6vw,15px)] text-left">
                  <p className={`${MONO} max-w-[130ch] text-[0.9375rem] leading-[1.85] text-[#3b3550]`}>
                    {vibe.desc}
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {vibe.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`${MONO} rounded-sm border border-[#c6c2d8] ${PLASTIC_FACE} px-2.5 py-1 text-[0.8125rem] font-bold tracking-[0.04em] text-[#5b2fb8] uppercase ${PLASTIC}`}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sous-en-tête : nom du bloc grille + bascule d'affichage */}
            <div className="border-b border-[#d8d5e6] px-4 py-2 sm:px-6">
              <h2 className={`${MONO} text-[1rem] font-bold tracking-[0.08em] text-[#3b1d8f] uppercase`}>
                MEDIA_GRID · {filtered.length} FICHIER(S)
              </h2>
            </div>

            {/* Corps : panneau de filtres + grille, dans le même bloc blanc.
                `items-start` retiré : un panneau `sticky` ne peut flotter que
                dans la hauteur de son propre parent, qui doit donc être
                étiré (par défaut, `items-stretch`) sur toute la hauteur de
                la grille pour lui laisser la place de rester figé. */}
            <div className="flex gap-5 px-4 py-3 sm:px-6">
              {/* FILTER_CONTROL.SYS : colonne collante à partir de lg, sans
                  chrome de fenêtre propre : elle vit dans ce même conteneur.
                  Le panneau plafonne lui-même sa hauteur à l'écran visible et
                  fait défiler ses rubriques à l'intérieur (voir `bare` dans
                  filter-control.tsx) : le pointeur posé dessus fait défiler
                  les filtres, pas la page, et ce dès le haut du catalogue. */}
              <div className="hidden w-[270px] shrink-0 lg:block">
                <div className="sticky top-[86px]">
                  <FilterControl state={filterState} bare />
                </div>
              </div>

              <div className="min-w-0 flex-1">
                {filtered.length === 0 ? (
                  <div
                    className={`${MONO} mx-auto flex max-w-[420px] flex-col items-center gap-3 rounded-lg border-2 border-[#d8d5e6] bg-[#f7f6fc] px-4 py-16 text-center text-[0.875rem] text-[#3b3550]`}
                  >
                    <span aria-hidden className="text-[2rem]">
                      🗑️
                    </span>
                    <p>{t.category.empty}</p>
                    {activeCount > 0 && (
                      <button
                        type="button"
                        onClick={reset}
                        className={`${MONO} rounded-md border border-[#c6c2d8] ${PLASTIC_FACE} px-3 py-2 text-[1rem] font-bold text-[#262626] uppercase transition hover:brightness-105 ${PLASTIC} ${PLASTIC_PRESS}`}
                      >
                        [ ⟲ RÉINITIALISER LES FILTRES ]
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-[clamp(8px,1.4vw,14px)] md:grid-cols-3 xl:grid-cols-4">
                    {pageProducts.map((p, idx) => (
                      <ProductWindow key={p.id} product={p} idx={idx} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Barre d'état + pagination, au pied de la fenêtre unique,
                rounded-b-2xl : clip=false oblige, c'est elle qui ferme
                proprement le bas du cadre (voir aussi bodyClassName plus
                haut, sur WindowFrame, sans quoi le coin carré du corps de
                la fenêtre dépasse derrière l'arrondi de cette barre).

                Le rembourrage (gap-5, px-4 sm:px-6) et le faux rail
                w-[270px] reproduisent exactement ceux de la rangée
                filtres+grille juste au-dessus : sans ce rail fantôme, le
                centrage 1fr/auto/1fr portait sur toute la largeur de la
                barre, colonne de filtres comprise, et la pagination
                tombait décalée vers la gauche par rapport aux fiches. */}
            <div className="flex items-center gap-5 overflow-hidden rounded-b-2xl border-t-2 border-[#c6c2d8] bg-[#e9e7f2] px-4 py-2.5 sm:px-6">
              <div aria-hidden className="hidden w-[270px] shrink-0 lg:block" />

              {/* Emplacement de la pagination fixé en colonne 2 (`col-start-2`)
                  et le compte de pièces en colonne 3 (`col-start-3`, à
                  droite), plutôt que de suivre l'ordre du DOM : la pagination
                  reste centrée que le texte soit affiché ou non. */}
              <div className="flex min-w-0 flex-1 flex-col items-center gap-2.5 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-3">
                <span className={`${MONO} text-[0.8125rem] tracking-[0.1em] text-[#3b3550] uppercase sm:col-start-3 sm:justify-self-end`}>
                  {filtered.length} objet(s) · {pageProducts.length} affiché(s)
                </span>

                {totalPages > 1 && (
                  <div className="flex items-center gap-3 sm:col-start-2 sm:justify-self-center">
                    <button
                      type="button"
                      disabled={safePage === 0}
                      onClick={() => setPage(safePage - 1)}
                      className={`${MONO} rounded-md border border-[#c6c2d8] ${PLASTIC_FACE} px-4 py-2.5 text-[1rem] font-bold text-[#262626] uppercase transition hover:brightness-105 disabled:opacity-40 ${PLASTIC} ${PLASTIC_PRESS}`}
                    >
                      [ ◀ ]
                    </button>
                    <span
                      className={`${LCD} rounded border-2 border-[#2b2b3d] bg-black px-3 py-1 text-[1.375rem] leading-none text-green-400 ${BEVEL_IN}`}
                      style={{ textShadow: "0 0 8px rgba(74,222,128,.5)" }}
                    >
                      {safePage + 1}/{totalPages}
                    </span>
                    <button
                      type="button"
                      disabled={safePage >= totalPages - 1}
                      onClick={() => setPage(safePage + 1)}
                      className={`${MONO} rounded-md border border-[#c6c2d8] ${PLASTIC_FACE} px-4 py-2.5 text-[1rem] font-bold text-[#262626] uppercase transition hover:brightness-105 disabled:opacity-40 ${PLASTIC} ${PLASTIC_PRESS}`}
                    >
                      [ ▶ ]
                    </button>
                  </div>
                )}
              </div>
            </div>
          </WindowFrame>
        </div>
      </main>

      {/* ---- Bouton flottant + tiroir des filtres (sous lg) ---- */}
      <button
        type="button"
        onClick={() => setFilterOpen(true)}
        className={`${MONO} fixed bottom-5 left-1/2 z-[70] -translate-x-1/2 rounded-full border-2 border-[#3b1d8f] px-5 py-3 text-[0.8125rem] font-bold tracking-[0.08em] text-white uppercase transition active:translate-y-0.5 lg:hidden`}
        style={{
          background: "linear-gradient(180deg,#a86fe8 0%,#7147d4 48%,#3b1d8f 100%)",
          boxShadow:
            "0 5px 0 #2a1370, 0 12px 20px rgba(20,6,40,.45), inset 0 2px 0 rgba(255,255,255,.55)",
        }}
      >
        [ 🎛️ FILTRES.EXE ]
        {activeCount > 0 && (
          <span className="ml-2 rounded-full bg-[#ff45b4] px-1.5 py-0.5 text-[0.8125rem] text-white">
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
