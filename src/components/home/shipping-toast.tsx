"use client";

/* ============================================================
   NOUVEAU MESSAGE_ : la notification système de l'accueil
   ------------------------------------------------------------
   La petite fenêtre MSN Messenger qui monte du coin bas droit
   quelques secondes après l'arrivée sur le bureau, pour annoncer
   la livraison offerte dès 90 €.

   Habillage Windows 95 : gris beige système, double biseau
   (lumière en haut à gauche, tranche sombre en bas à droite),
   barre de titre du site (le dégradé indigo → fuchsia que
   portent toutes les fenêtres de Lil'OG) et un [ X ] qui ferme
   pour de bon.

   La fermeture est mémorisée pour la session : on ne se fait pas
   klaxonner par la même popup à chaque retour sur l'accueil.

   ⚠ PAREFEU : Tailwind + une feuille locale préfixée `lht-`.
   Aucune classe de globals.css n'est touchée.
   ============================================================ */

import { useEffect, useState } from "react";
import { MONO, PLASTIC, PLASTIC_FACE, PLASTIC_PRESS, VIOLET_BAR } from "@/components/y2k/kit";

/** Délai avant l'apparition : le temps de poser les yeux sur le hero. */
const DELAY_MS = 3200;

/** Mémoire de fermeture, à l'échelle de l'onglet. */
const STORAGE_KEY = "lilog:free-shipping-toast";

const TOAST_CSS = `
/* Montée depuis le bas avec un léger dépassement, puis retour : le rebond. */
@keyframes lhtPop{
  0%{   transform:translate3d(0,150%,0); opacity:0 }
  55%{  transform:translate3d(0,-9%,0);  opacity:1 }
  76%{  transform:translate3d(0,4%,0) }
  90%{  transform:translate3d(0,-2%,0) }
  100%{ transform:translate3d(0,0,0);    opacity:1 }
}
.lht-pop{ animation:lhtPop 700ms cubic-bezier(.22,.9,.24,1) both }

/* Le liseré intérieur du double biseau Win95, sous le bord extérieur. */
.lht-frame{ box-shadow:
  inset 1px 1px 0 #ffffff,
  inset -1px -1px 0 #86826f,
  4px 4px 0 rgba(24,12,58,.45) }

/* Vignette du colis : une case encastrée, comme une icône de barre d'état. */
.lht-icon{ box-shadow:
  inset 1px 1px 0 rgba(0,0,0,.35),
  inset -1px -1px 0 rgba(255,255,255,.95) }

@media (prefers-reduced-motion: reduce){
  .lht-pop{ animation:lhtFade 220ms ease-out both }
  @keyframes lhtFade{ from{opacity:0} to{opacity:1} }
}
`;

export function ShippingToast() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    /* sessionStorage est indisponible en navigation privée verrouillée ou
       si le stockage est bloqué : dans ce cas la popup s'affiche, c'est le
       moindre mal. */
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === "1") return;
    } catch {}

    const id = setTimeout(() => setOpen(true), DELAY_MS);
    return () => clearTimeout(id);
  }, []);

  function close() {
    setOpen(false);
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {}
  }

  if (!open) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="lht-pop fixed right-4 bottom-4 z-[70] w-[min(21rem,calc(100vw-2rem))]"
    >
      <style>{TOAST_CSS}</style>

      <div
        className="lht-frame border-2 border-t-white border-r-[#3f3d34] border-b-[#3f3d34] border-l-white bg-[#ece9d8]"
      >
        {/* ---- Barre de titre ---- */}
        <div
          className="flex items-center gap-2 border-b-2 border-[#2a1370] px-2 py-1.5"
          style={{ background: VIOLET_BAR }}
        >
          <span aria-hidden className="shrink-0 text-[1rem] leading-none">
            💬
          </span>
          <span
            className={`${MONO} min-w-0 flex-1 truncate text-[0.875rem] font-bold tracking-[0.1em] text-white uppercase`}
          >
            Nouveau message_
          </span>
          <button
            type="button"
            onClick={close}
            aria-label="Fermer la notification"
            className={`${MONO} ${PLASTIC_FACE} ${PLASTIC} ${PLASTIC_PRESS} shrink-0 cursor-pointer rounded-md border border-[#c6c2d8] px-1.5 py-0.5 text-[0.8125rem] leading-none font-bold text-[#262626] transition-[filter] hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white`}
          >
            [ X ]
          </button>
        </div>

        {/* ---- Corps du message ---- */}
        <div className="flex items-start gap-3 px-3 py-3">
          <span
            aria-hidden
            className="lht-icon grid h-11 w-11 shrink-0 place-items-center bg-[#f6f4e8] text-[1.5rem] leading-none"
          >
            🚚
          </span>
          <p className="min-w-0 text-[0.9375rem] leading-snug text-[#1e2430]">
            Psst… La livraison est totalement{" "}
            <strong className="font-bold text-[#d3016d]">GRATUITE</strong>
            {" à partir de 90€ d'achat ! ✨"}
          </p>
        </div>
      </div>
    </div>
  );
}
