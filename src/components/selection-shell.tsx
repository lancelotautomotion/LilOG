"use client";

/* ============================================================
   SELECTION.EXE : la vitrine privée d'une sélection
   ------------------------------------------------------------
   Même grammaire visuelle que le catalogue (fenêtre violette,
   barre d'adresse, MEDIA_GRID), volontairement dépouillée : pas
   de filtres, pas de pagination, pas de fil d'Ariane. Une
   sélection se parcourt d'un bout à l'autre, elle ne se trie pas.

   Les fiches sont les <ProductWindow> du catalogue, et mènent aux
   pages produit ordinaires : la personne qui reçoit le lien
   achète par le circuit habituel.

   ⚠ PAREFEU : Tailwind + PRODUCT_WINDOW_CSS, servie une fois pour
   toute la page. Aucune classe de globals.css.
   ============================================================ */

import { useState } from "react";
import { Nav } from "@/components/nav";
import { Drawer } from "@/components/drawer";
import { Footer } from "@/components/footer";
import { Icon } from "@/components/icons";
import { PRODUCT_WINDOW_CSS, ProductWindow } from "@/components/category/product-window";
import {
  BEVEL_IN,
  LCD,
  LeopardBackdrop,
  MONO,
  PLASTIC,
  PLASTIC_FACE,
  WindowFrame,
} from "@/components/y2k/kit";
import type { Product } from "@/lib/shopify/types";

/** Nom de fichier de la sélection, pour la barre d'adresse. */
function exeName(title: string): string {
  const slug = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return `${slug || "SELECTION"}.EXE`;
}

export function SelectionShell({ title, products }: { title: string; products: Product[] }) {
  const [menu, setMenu] = useState(false);
  const path = `C:\\LIL_OG\\PRIVE\\${exeName(title)}`;

  return (
    <>
      <Nav onMenu={() => setMenu(true)} forceSolid />
      <Drawer open={menu} onClose={() => setMenu(false)} />

      <main className="relative">
        <style>{PRODUCT_WINDOW_CSS}</style>
        <LeopardBackdrop />

        {/* La barre de navigation est fixe et opaque : la fenêtre commence en
            dessous, sinon elle mangerait sa barre de titre. */}
        <div className="relative z-[1] mx-auto w-full max-w-[1400px] px-4 pt-[calc(72px+clamp(8px,1vw,12px))] pb-[clamp(24px,4vw,48px)] sm:px-6">
          <WindowFrame
            title={`C:\\ LIL_OG \\ PRIVE \\ ${exeName(title)}`}
            icon={<Icon.folderOpen width={15} height={12} />}
            bodyClassName="rounded-b-2xl"
            bodyStyle={{ backgroundColor: "#ffffff" }}
          >
            {/* Barre d'adresse */}
            <div className="flex items-center gap-2 border-b border-[#c6c2d8] bg-[#f0eef7] px-3 py-1.5">
              <span className={`${MONO} shrink-0 text-[0.8125rem] tracking-[0.14em] text-[#6B7280] uppercase`}>
                Adresse
              </span>
              <span
                className={`${MONO} flex min-w-0 flex-1 items-center gap-1.5 rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-[0.8125rem] tracking-[0.04em] text-[#1E2430] ${BEVEL_IN}`}
              >
                <Icon.folder width={14} height={12} className="shrink-0" />
                <span className="truncate">{path}</span>
              </span>
              <span
                className={`${MONO} shrink-0 rounded-full border border-[#c6c2d8] ${PLASTIC_FACE} px-3 py-1.5 text-[0.8125rem] font-bold text-[#262626] ${PLASTIC}`}
              >
                [ OK ]
              </span>
            </div>

            {/* En-tête : le titre vient de Shopify, renommer la collection
                renomme la page. La mention « accès privé » est là pour la
                personne qui reçoit le lien : elle explique pourquoi cette
                page n'est nulle part dans le menu. */}
            <div className="border-b border-[#d8d5e6] px-4 pt-4 pb-3 text-center sm:px-6">
              <p className={`${MONO} text-[0.8125rem] tracking-[0.18em] text-[#5b2fb8] uppercase`}>
                🔒 Accès privé · lien personnel
              </p>
              <h1
                className={`${LCD} mt-1 text-[clamp(1.7rem,4.4vw,2.5rem)] leading-[1.02] tracking-[0.02em] text-[#2a1266] uppercase`}
              >
                {title}
              </h1>
              <p className={`${MONO} mt-1.5 text-[0.9375rem] tracking-[0.04em] text-[#5b2fb8] italic`}>
                Une sélection rien que pour toi, choisie à la main.
              </p>
            </div>

            {/* Sous-en-tête : nom du bloc grille */}
            <div className="border-b border-[#d8d5e6] px-4 py-2 sm:px-6">
              <h2 className={`${MONO} text-[1rem] font-bold tracking-[0.08em] text-[#3b1d8f] uppercase`}>
                MEDIA_GRID · {products.length} FICHIER(S)
              </h2>
            </div>

            <div className="px-4 py-3 sm:px-6">
              {products.length === 0 ? (
                <div
                  className={`${MONO} mx-auto flex max-w-[420px] flex-col items-center gap-3 rounded-lg border-2 border-[#d8d5e6] bg-[#f7f6fc] px-4 py-16 text-center text-[0.875rem] text-[#3b3550]`}
                >
                  <span aria-hidden className="text-[2rem]">
                    🗑️
                  </span>
                  <p>Cette sélection est vide pour le moment.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-[clamp(8px,1.4vw,14px)] md:grid-cols-3 xl:grid-cols-4">
                  {products.map((p, idx) => (
                    <ProductWindow key={p.id} product={p} idx={idx} />
                  ))}
                </div>
              )}
            </div>

            {/* Barre d'état : rounded-b-2xl ferme le bas du cadre, comme sur
                le catalogue. */}
            <div className="flex items-center justify-end overflow-hidden rounded-b-2xl border-t-2 border-[#c6c2d8] bg-[#e9e7f2] px-4 py-2.5 sm:px-6">
              <span className={`${MONO} text-[0.8125rem] tracking-[0.1em] text-[#3b3550] uppercase`}>
                {products.length} objet(s)
              </span>
            </div>
          </WindowFrame>
        </div>
      </main>

      <Footer />
    </>
  );
}
