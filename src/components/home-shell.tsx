"use client";

/* ============================================================
   LIL_OG_DESKTOP.EXE — page d'accueil
   ------------------------------------------------------------
   L'accueil n'est plus une vitrine e-commerce mais un bureau
   Y2K. Quatre modules, dans cet ordre :

     01  CAMCORDER_OS      hero plein écran, viseur de caméscope
     02  ARCADE_SLOT       la borne qui lance la Dressing Machine
     03  FILE_EXPLORER.SYS les rayons en dossiers, pas en grille
     04  README.TXT        l'histoire de la maison en Bloc-notes

   Aucune grille de produits : la marchandise se découvre par la
   Dressing Machine ou par les dossiers de l'explorateur.

   ⚠ PAREFEU : les modules vivent dans `components/home/` et
   n'utilisent que Tailwind + leurs feuilles locales préfixées.
   Aucune classe de globals.css n'est touchée, donc aucune autre
   page ne bouge.
   ============================================================ */

import { useState } from "react";
import { Nav } from "@/components/nav";
import { Drawer } from "@/components/drawer";
import { Footer } from "@/components/footer";
import { ChromeStar, GemSticker, HoloSmiley } from "@/components/contact/stickers";
import { HeroCamcorder } from "@/components/home/hero-camcorder";
import { ArcadeSlot } from "@/components/home/arcade-slot";
import { FileExplorer } from "@/components/home/file-explorer";
import { ReadmeWindow } from "@/components/home/readme-window";

/**
 * Le fond d'écran du bureau, sur lequel les fenêtres sont posées. Il est
 * calé sur `#a86fe8`, le violet clair qui termine le dégradé des barres de
 * titre : le bureau et ses fenêtres parlent donc la même couleur.
 */
const WALLPAPER: React.CSSProperties = {
  background:
    "radial-gradient(ellipse at 16% -8%, rgba(255,150,222,0.42) 0%, transparent 52%)," +
    "radial-gradient(ellipse at 88% 20%, rgba(255,255,255,0.20) 0%, transparent 46%)," +
    "radial-gradient(ellipse at 50% 106%, rgba(59,29,143,0.30) 0%, transparent 62%)," +
    "linear-gradient(180deg, #9a63e4 0%, #a86fe8 38%, #b98cef 72%, #9d68e6 100%)",
};

/** Quadrillage du fond d'écran — le même pas que le papier millimétré. */
const WALLPAPER_GRID: React.CSSProperties = {
  backgroundImage:
    "linear-gradient(rgba(59,29,143,0.10) 1px, transparent 1px)," +
    "linear-gradient(90deg, rgba(59,29,143,0.10) 1px, transparent 1px)",
  backgroundSize: "44px 44px",
};

const SHELL_CSS = `
@keyframes lhsBob{
  0%,100%{transform:translate3d(0,0,0) rotate(var(--r,0deg)) scale(1)}
  50%{transform:translate3d(0,-9%,0) rotate(calc(var(--r,0deg) + 6deg)) scale(1.06)}
}
.lhs-sticker{animation:lhsBob 7.6s ease-in-out infinite;filter:drop-shadow(0 4px 8px rgba(10,4,30,.55))}
.lhs-s2{animation-duration:9.1s;animation-delay:-3.4s}
.lhs-s3{animation-duration:8.2s;animation-delay:-1.7s}

@media (prefers-reduced-motion: reduce){ .lhs-sticker{animation:none} }
`;

export function HomeShell() {
  const [menu, setMenu] = useState(false);

  return (
    <>
      <Nav onMenu={() => setMenu(true)} />
      <Drawer open={menu} onClose={() => setMenu(false)} />

      <HeroCamcorder />

      <main className="relative overflow-hidden" style={WALLPAPER}>
        <style>{SHELL_CSS}</style>
        <div aria-hidden className="pointer-events-none absolute inset-0" style={WALLPAPER_GRID} />

        {/* Pastilles du bureau — décoratives, jamais cliquables. */}
        <div aria-hidden className="pointer-events-none absolute inset-0 hidden lg:block">
          <span
            className="lhs-sticker absolute top-[7%] left-[3%] h-12 w-12 opacity-80"
            style={{ "--r": "-12deg" } as React.CSSProperties}
          >
            <ChromeStar uid="lhs-star" />
          </span>
          <span
            className="lhs-sticker lhs-s2 absolute top-[43%] right-[2.5%] h-11 w-11 opacity-75"
            style={{ "--r": "10deg" } as React.CSSProperties}
          >
            <GemSticker uid="lhs-gem" shape="heart" hue={["#ffd0ec", "#ff5ec4", "#8c0f56"]} />
          </span>
          <span
            className="lhs-sticker lhs-s3 absolute bottom-[9%] left-[4%] h-10 w-10 opacity-70"
            style={{ "--r": "-6deg" } as React.CSSProperties}
          >
            <HoloSmiley uid="lhs-smile" />
          </span>
        </div>

        <div className="relative">
          <ArcadeSlot />
          <FileExplorer />
          <ReadmeWindow />
        </div>
      </main>

      <Footer />
    </>
  );
}
