"use client";

/* ============================================================
   LIL_OG_DESKTOP.EXE : page d'accueil
   ------------------------------------------------------------
   L'accueil n'est plus une vitrine e-commerce mais un bureau
   Y2K. Un bandeau puis quatre modules, dans cet ordre :

     00  FREE_SHIPPING.EXE  la bande défilante de la livraison offerte
     01  CAMCORDER_OS       hero plein écran, viseur de caméscope
     02  PLAYLIST_HIGHLIGHTS.EXE  Cover Flow 3D des pièces mises en avant
     03  ARCADE_SLOT        la borne qui lance la Dressing Machine
     04  FILE_EXPLORER.SYS  les rayons en dossiers, pas en grille
     05  LICENCE_CADEAU.ISO l'encart CD-ROM de la carte cadeau
     06  README.TXT         l'histoire de la maison en Bloc-notes

   Pas de grille de produits classique : hormis le Cover Flow des
   highlights, la marchandise se découvre par la Dressing Machine
   ou par les dossiers de l'explorateur.

   ⚠ PAREFEU : les modules vivent dans `components/home/` et
   n'utilisent que Tailwind + leurs feuilles locales préfixées.
   Aucune classe de globals.css n'est touchée, donc aucune autre
   page ne bouge.
   ============================================================ */

import { useState } from "react";
import { Nav } from "@/components/nav";
import { Drawer } from "@/components/drawer";
import { Footer } from "@/components/footer";
import { ChromeStar, GemSticker, HoloAlien, HoloSmiley } from "@/components/contact/stickers";
import { WALLPAPER } from "@/components/y2k/kit";
import { HeroCamcorder } from "@/components/home/hero-camcorder";
import { ArcadeSlot } from "@/components/home/arcade-slot";
import { GiftCardPromo } from "@/components/home/gift-card-promo";
import { CoverFlow } from "@/components/home/cover-flow";
import { FileExplorer } from "@/components/home/file-explorer";
import { ReadmeWindow } from "@/components/home/readme-window";
import { AnnounceBar } from "@/components/home/announce-bar";
import type { Product } from "@/lib/shopify/types";

const SHELL_CSS = `
@keyframes lhsBob{
  0%,100%{transform:translate3d(0,0,0) rotate(var(--r,0deg)) scale(1)}
  50%{transform:translate3d(0,-9%,0) rotate(calc(var(--r,0deg) + 6deg)) scale(1.06)}
}
.lhs-sticker{animation:lhsBob 7.6s ease-in-out infinite;filter:drop-shadow(0 4px 8px rgba(10,4,30,.55))}
.lhs-s2{animation-duration:9.1s;animation-delay:-3.4s}
.lhs-s3{animation-duration:8.2s;animation-delay:-1.7s}
.lhs-s4{animation-duration:6.9s;animation-delay:-2.1s}
.lhs-s5{animation-duration:8.7s;animation-delay:-4.6s}
.lhs-s6{animation-duration:7.3s;animation-delay:-0.8s}
.lhs-s7{animation-duration:9.5s;animation-delay:-5.2s}
.lhs-s8{animation-duration:6.4s;animation-delay:-3.1s}

@media (prefers-reduced-motion: reduce){ .lhs-sticker{animation:none} }
`;

export function HomeShell({ highlights = [] }: { highlights?: Product[] }) {
  const [menu, setMenu] = useState(false);

  return (
    <>
      {/* Le bandeau et la navigation partagent un hôte : c'est lui qui
          autorise le bandeau à descendre `.nav` de sa propre hauteur, sans
          qu'aucune autre page n'en subisse l'effet. */}
      <div className="lhb-host">
        <AnnounceBar />
        <Nav onMenu={() => setMenu(true)} />
      </div>
      <Drawer open={menu} onClose={() => setMenu(false)} />

      <HeroCamcorder />

      <main className="relative overflow-hidden" style={WALLPAPER}>
        <style>{SHELL_CSS}</style>

        {/* Pastilles du bureau : décoratives, jamais cliquables. Réparties sur
            toute la hauteur de la page (`<main>` couvre les six modules), en
            marge du contenu centré, jamais dessus. */}
        <div aria-hidden className="pointer-events-none absolute inset-0 hidden lg:block">
          <span
            className="lhs-sticker absolute top-[7%] left-[3%] h-12 w-12 opacity-80"
            style={{ "--r": "-12deg" } as React.CSSProperties}
          >
            <ChromeStar uid="lhs-star" />
          </span>
          <span
            className="lhs-sticker lhs-s4 absolute top-[17%] right-[3.5%] h-9 w-9 opacity-70"
            style={{ "--r": "16deg" } as React.CSSProperties}
          >
            <GemSticker uid="lhs-gem2" shape="star" hue={["#fff5b0", "#ffd23f", "#a86c00"]} />
          </span>
          <span
            className="lhs-sticker lhs-s5 absolute top-[28%] left-[2.5%] h-10 w-10 opacity-75"
            style={{ "--r": "-8deg" } as React.CSSProperties}
          >
            <HoloAlien uid="lhs-alien" />
          </span>
          <span
            className="lhs-sticker lhs-s2 absolute top-[43%] right-[2.5%] h-11 w-11 opacity-75"
            style={{ "--r": "10deg" } as React.CSSProperties}
          >
            <GemSticker uid="lhs-gem" shape="heart" hue={["#ffd0ec", "#ff5ec4", "#8c0f56"]} />
          </span>
          <span
            className="lhs-sticker lhs-s6 absolute top-[54%] left-[3.5%] h-9 w-9 opacity-70"
            style={{ "--r": "14deg" } as React.CSSProperties}
          >
            <ChromeStar uid="lhs-star2" />
          </span>
          <span
            className="lhs-sticker lhs-s7 absolute top-[65%] right-[3%] h-12 w-12 opacity-80"
            style={{ "--r": "-10deg" } as React.CSSProperties}
          >
            <GemSticker uid="lhs-gem3" shape="heart" hue={["#e4d4ff", "#a06bff", "#4a1f8f"]} />
          </span>
          <span
            className="lhs-sticker lhs-s8 absolute top-[77%] left-[2.5%] h-10 w-10 opacity-75"
            style={{ "--r": "-14deg" } as React.CSSProperties}
          >
            <GemSticker uid="lhs-gem4" shape="star" hue={["#ffd0ec", "#ff5ec4", "#8c0f56"]} />
          </span>
          <span
            className="lhs-sticker lhs-s3 absolute bottom-[9%] left-[4%] h-10 w-10 opacity-70"
            style={{ "--r": "-6deg" } as React.CSSProperties}
          >
            <HoloSmiley uid="lhs-smile" />
          </span>
          <span
            className="lhs-sticker lhs-s5 absolute bottom-[16%] right-[4%] h-9 w-9 opacity-70"
            style={{ "--r": "9deg" } as React.CSSProperties}
          >
            <GemSticker uid="lhs-gem5" shape="star" hue={["#e4d4ff", "#a06bff", "#4a1f8f"]} />
          </span>
        </div>

        <div className="relative">
          <CoverFlow products={highlights} />
          <ArcadeSlot />
          <FileExplorer />
          <GiftCardPromo />
          <ReadmeWindow />
        </div>

        {/* Pied de page à l'intérieur de `<main>` : le fond WALLPAPER est
            posé sur cet élément, pas en décor `fixed` plein viewport (voir
            le commentaire sur WALLPAPER dans y2k/kit.tsx). Un `<Footer>`
            resté sibling s'arrêtait donc à la même hauteur que `<main>` et
            retombait sur son propre fond gris opaque, pas de continuité
            possible avec le bureau. */}
        <Footer />
      </main>
    </>
  );
}
