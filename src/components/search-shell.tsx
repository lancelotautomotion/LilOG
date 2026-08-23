"use client";

/* ============================================================
   SEARCH_RESULTS.EXE : /search
   ------------------------------------------------------------
   Même fenêtre unique que /category : barre de titre violette,
   barre de menus, barre d'adresse, puis un champ de recherche à
   la place du bloc de filtres, la fiche produit se trouve par
   mot-clé, pas seulement par rayon.

   ⚠ PAREFEU : Tailwind + feuille locale préfixée `lsr-`. Aucune
   classe de globals.css.
   ============================================================ */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Nav } from "@/components/nav";
import { Drawer } from "@/components/drawer";
import { Footer } from "@/components/footer";
import { Icon } from "@/components/icons";
import { ProductWindow } from "@/components/category/product-window";
import { BEVEL_IN, LeopardBackdrop, MONO, PLASTIC, PLASTIC_FACE, PLASTIC_PRESS, WindowFrame } from "@/components/y2k/kit";
import type { Product } from "@/lib/shopify/types";

export function SearchShell({ query, results }: { query: string; results: Product[] }) {
  const router = useRouter();
  const [menu, setMenu] = useState(false);
  const [value, setValue] = useState(query);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = value.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  };

  return (
    <>
      <Nav onMenu={() => setMenu(true)} forceSolid />
      <Drawer open={menu} onClose={() => setMenu(false)} />

      <main className="relative">
        <LeopardBackdrop />

        <div className="relative z-[1] mx-auto w-full max-w-[1400px] px-4 pt-[calc(72px+clamp(16px,2.4vw,28px))] pb-[clamp(24px,4vw,48px)] sm:px-6">
          <WindowFrame
            title="C:\ LIL_OG \ SEARCH_RESULTS.EXE"
            icon={<Icon.search width={13} height={13} />}
            bodyStyle={{ backgroundColor: "#ffffff" }}
          >
            {/* Barre de menus */}
            <div className="flex flex-wrap items-center gap-4 border-b border-[#c6c2d8] bg-[#e9e7f2] px-3 py-1.5">
              {["Fichier", "Édition", "Affichage", "Favoris", "?"].map((m) => (
                <span key={m} className={`${MONO} text-[0.8125rem] tracking-[0.06em] text-[#3b3550] uppercase`}>
                  {m}
                </span>
              ))}
            </div>

            {/* Barre d'adresse */}
            <div className="flex items-center gap-2 border-b border-[#c6c2d8] bg-[#f0eef7] px-3 py-2">
              <span className={`${MONO} shrink-0 text-[0.8125rem] tracking-[0.14em] text-[#6B7280] uppercase`}>
                Adresse
              </span>
              <span
                className={`${MONO} flex min-w-0 flex-1 items-center gap-1.5 rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-[0.8125rem] tracking-[0.04em] text-[#1E2430] ${BEVEL_IN}`}
              >
                <Icon.search width={12} height={12} className="shrink-0" />
                <span className="truncate">{`C:\\LIL_OG\\SEARCH\\${query || "..."}`}</span>
              </span>
              <span
                className={`${MONO} shrink-0 rounded-full border border-[#c6c2d8] ${PLASTIC_FACE} px-3 py-1.5 text-[0.8125rem] font-bold text-[#262626] ${PLASTIC}`}
              >
                [ OK ]
              </span>
            </div>

            {/* Champ de recherche */}
            <div className="border-b border-[#d8d5e6] px-4 py-5 sm:px-6">
              <h1 className={`${MONO} mb-3 text-[1.125rem] font-bold tracking-[0.1em] text-[#3b1d8f] uppercase`}>
                🔍 Rechercher une pièce
              </h1>
              <form onSubmit={submit} className="flex gap-2">
                <label htmlFor="lsr-q" className="sr-only">
                  Rechercher
                </label>
                <input
                  id="lsr-q"
                  type="search"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="Ex. jean taille basse, robe slip, mules…"
                  autoFocus
                  className={`${MONO} min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-[0.875rem] text-[#1E2430] outline-none placeholder:text-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-300/50 ${BEVEL_IN}`}
                />
                <button
                  type="submit"
                  className={`${MONO} shrink-0 rounded-lg border border-[#c6c2d8] ${PLASTIC_FACE} px-4 py-2.5 text-[1rem] font-bold text-[#262626] uppercase transition hover:brightness-105 ${PLASTIC} ${PLASTIC_PRESS}`}
                >
                  [ 🔍 OK ]
                </button>
              </form>
            </div>

            {/* Sous-en-tête */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d8d5e6] px-4 py-3 sm:px-6">
              <h2 className={`${MONO} text-[1rem] font-bold tracking-[0.08em] text-[#3b1d8f] uppercase`}>
                MEDIA_GRID · {results.length} RÉSULTAT{results.length !== 1 ? "S" : ""}
              </h2>
            </div>

            {/* Corps */}
            <div className="px-4 py-4 sm:px-6">
              {!query ? (
                <div
                  className={`${MONO} mx-auto flex max-w-[420px] flex-col items-center gap-3 rounded-lg border-2 border-[#d8d5e6] bg-[#f7f6fc] px-4 py-16 text-center text-[0.875rem] text-[#3b3550]`}
                >
                  <span aria-hidden className="text-[2rem]">
                    🔍
                  </span>
                  <p>Tape un mot-clé pour fouiller l&apos;archive : nom, matière, couleur, style…</p>
                </div>
              ) : results.length === 0 ? (
                <div
                  className={`${MONO} mx-auto flex max-w-[420px] flex-col items-center gap-3 rounded-lg border-2 border-[#d8d5e6] bg-[#f7f6fc] px-4 py-16 text-center text-[0.875rem] text-[#3b3550]`}
                >
                  <span aria-hidden className="text-[2rem]">
                    🗑️
                  </span>
                  <p>
                    Aucune pièce pour « {query} ». Essaie un mot plus court ou une autre orthographe.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-[clamp(8px,1.4vw,14px)] md:grid-cols-3 xl:grid-cols-4">
                  {results.map((p, idx) => (
                    <ProductWindow key={p.id} product={p} idx={idx} />
                  ))}
                </div>
              )}
            </div>

            {/* Barre d'état */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-b-2xl border-t-2 border-[#c6c2d8] bg-[#e9e7f2] px-3 py-2">
              <span className={`${MONO} text-[0.8125rem] tracking-[0.1em] text-[#3b3550] uppercase`}>
                {query ? `${results.length} objet(s) trouvé(s)` : "En attente d'une recherche"}
              </span>
            </div>
          </WindowFrame>
        </div>
      </main>
      <Footer />
    </>
  );
}
