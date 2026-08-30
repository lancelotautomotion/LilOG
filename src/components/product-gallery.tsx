"use client";

/* ============================================================
   LIL_OG_PHOTO_VIEWER : galerie de la fiche produit
   ------------------------------------------------------------
   La photo principale vit dans une fenêtre lecteur média façon
   Windows 98 : barre de titre "📷 ITEM_VIEWER_V1.0.RAW", cadre
   gris 3D encastré (`shadow-inner`), et un pupitre de contrôle
   [ ◀ PREV ] [ 🔍 ZOOM ] [ NEXT ▶ ]. En dessous, les miniatures
   sont posées comme des Polaroids miniature, chacune de guingois.

   Mobile : le viewport principal se swipe au doigt, exactement
   comme les boutons PREV/NEXT.

   ⚠ PAREFEU : Tailwind + feuille locale préfixée `lpi-`, partagée
   avec product-detail.tsx. Aucune classe de globals.css.
   ============================================================ */

import { useEffect, useRef, useState } from "react";
import { SmartImg } from "@/components/smart-img";
import { useScrollLock } from "@/hooks/use-scroll-lock";
import { HARD_SHADOW, MONO, NAVY_BAR, PLASTIC, PLASTIC_FACE, PLASTIC_PRESS, WindowControls } from "@/components/y2k/kit";

const VIEWER_CSS = `
.lpi-thumb{transition:transform 180ms cubic-bezier(.2,1.2,.4,1), box-shadow 180ms ease}
.lpi-thumb:hover,.lpi-thumb:focus-visible{transform:translateY(-4px) rotate(0deg) scale(1.04) !important}

@keyframes lpi-blink{0%,49%{opacity:1}50%,100%{opacity:.25}}
.lpi-blink{animation:lpi-blink 1.15s step-end infinite}

@media (prefers-reduced-motion: reduce){
  .lpi-thumb{transition:none}
  .lpi-thumb:hover,.lpi-thumb:focus-visible{transform:none !important}
  .lpi-blink{animation:none}
}
`;

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const pics = images.length > 0 ? images : [""];
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(false);

  /* Photo en plein écran : la fiche produit ne défile plus derrière. */
  useScrollLock(zoom);
  const touchX = useRef<number | null>(null);

  const go = (delta: number) => setIndex((i) => (i + delta + pics.length) % pics.length);

  useEffect(() => {
    if (!zoom) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoom(false);
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 40) go(dx > 0 ? -1 : 1);
    touchX.current = null;
  };

  /* `flex-1 min-w-0` sur mobile : les trois boutons se partagent la rangée à
     parts égales plutôt que de garder leur largeur naturelle. Sans ça, sur
     la carte étroite d'un téléphone (288px de large une fois les marges du
     lecteur déduites), les trois libellés réclamaient 324px à eux seuls —
     36px de plus que ce que la rangée pouvait leur offrir — et NEXT
     débordait de 20px hors de l'écran, sa fin coupée par le coin arrondi de
     la fenêtre. Rembourrage et interlettrage resserrés en dessous de `sm`
     pour la même raison ; ils reprennent leur largeur naturelle et leur
     confort au bureau, où la place ne manque pas. */
  const navBtn =
    `${MONO} min-w-0 flex-1 rounded-md border border-[#c6c2d8] ${PLASTIC_FACE} px-1.5 py-2 text-[0.75rem] font-bold ` +
    `tracking-[0.01em] text-[#262626] uppercase transition disabled:cursor-not-allowed disabled:opacity-40 ` +
    `${PLASTIC} ${PLASTIC_PRESS} hover:brightness-105 sm:flex-none sm:px-2.5 sm:text-[0.8125rem] sm:tracking-[0.04em]`;

  return (
    <div>
      <style>{VIEWER_CSS}</style>

      {/* ---- Lecteur ---- */}
      <div className={`overflow-hidden rounded-xl border-2 border-[#b8b4cc] bg-[#f0f0f5] ${HARD_SHADOW}`}>
        <div className="flex items-center gap-2 border-b-2 border-[#2a1370] px-2.5 py-2" style={{ background: NAVY_BAR }}>
          <span aria-hidden className="shrink-0 text-[1rem] leading-none">📷</span>
          <span className={`${MONO} min-w-0 flex-1 truncate text-[0.8125rem] font-bold tracking-[0.1em] text-white uppercase`}>
            ITEM_VIEWER_V1.0.RAW
          </span>
          <WindowControls />
        </div>

        {/* Cadre allongé (2/3) et image en `object-contain` : les photos de
            la boutique sont chinées une à une et n'ont pas toutes le même
            ratio, en `cover`, la plus haute se faisait couper la tête ou
            l'ourlet. En `contain`, la pièce est toujours entière, et le
            fond gris encastré tient lieu de passe-partout, comme dans un
            vrai lecteur d'images. */}
        <div
          className="relative aspect-[2/3] max-h-[clamp(460px,72vh,760px)] w-full touch-pan-y bg-[#d6d3e2] shadow-inner"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <SmartImg
            key={index}
            className="absolute inset-0 h-full w-full object-contain"
            src={pics[index]}
            alt={`${name}, vue ${index + 1}`}
            tone={index}
          />
          {pics.length > 1 && (
            <span
              className={`${MONO} absolute right-2 bottom-2 rounded border border-black/30 bg-black/55 px-1.5 py-0.5 text-[0.8125rem] font-bold tracking-[0.08em] text-white`}
            >
              {index + 1}/{pics.length}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-1 border-t-2 border-[#c6c2d8] bg-[#e9e7f2] px-2 py-2 sm:gap-2">
          {/* Les crochets décoratifs `[ ]` ne reviennent qu'au bureau : sur
              mobile, quatre caractères de plus par bouton, c'est ce qui
              manquait pour tenir sur une rangée sans déborder. */}
          <button type="button" onClick={() => go(-1)} disabled={pics.length < 2} className={navBtn}>
            <span className="hidden sm:inline">[ </span>◀ PREV<span className="hidden sm:inline"> ]</span>
          </button>
          <button type="button" onClick={() => setZoom(true)} className={navBtn}>
            <span className="hidden sm:inline">[ </span>🔍 ZOOM<span className="hidden sm:inline"> ]</span>
          </button>
          <button type="button" onClick={() => go(1)} disabled={pics.length < 2} className={navBtn}>
            <span className="hidden sm:inline">[ </span>NEXT ▶<span className="hidden sm:inline"> ]</span>
          </button>
        </div>
      </div>

      {/* ---- Miniatures : Polaroids de guingois ----
          Centrées et agrandies : le lecteur est plus haut qu'avant (cadre
          2/3), et une rangée de petits timbres alignés à gauche laissait
          un vide sous elle. Elles restent en `flex-wrap` plutôt qu'en
          `overflow-x-auto`, les fiches n'ont jamais plus de 5-6 photos,
          pas besoin de scroll horizontal, et le centrage ne marche que si
          la rangée peut passer à la ligne plutôt que déborder. */}
      {pics.length > 1 && (
        <div className="mt-4 flex flex-wrap justify-center gap-4 px-1 pt-1 pb-2">
          {pics.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Voir photo ${i + 1}`}
              aria-pressed={i === index}
              className={`lpi-thumb shrink-0 rounded-[2px] border border-black/10 bg-white p-1.5 pb-3.5 ${
                i === index ? "shadow-[0_0_0_2px_#1B48CE,3px_4px_0_rgba(24,12,58,0.4)]" : "shadow-[3px_4px_0_rgba(24,12,58,0.28)]"
              }`}
              style={{ transform: `rotate(${i === index ? 0 : (i % 2 ? 1 : -1) * (3 + (i % 3) * 2)}deg)` }}
            >
              <span className="block h-20 w-20 overflow-hidden bg-[#e7e5f1] sm:h-24 sm:w-24">
                <SmartImg className="h-full w-full object-cover" src={src} alt="" tone={i} />
              </span>
            </button>
          ))}
        </div>
      )}

      {/* ---- Zoom plein écran ---- */}
      {zoom && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/88 p-4"
          onClick={() => setZoom(false)}
          role="dialog"
          aria-modal
          aria-label={name}
        >
          <button
            type="button"
            onClick={() => setZoom(false)}
            aria-label="Fermer"
            className={`${MONO} absolute top-4 right-4 z-10 rounded-md border border-[#c6c2d8] ${PLASTIC_FACE} px-3 py-2 text-[0.8125rem] font-bold text-[#262626] uppercase ${PLASTIC} ${PLASTIC_PRESS}`}
          >
            [ × CLOSE ]
          </button>

          <img
            src={pics[index]}
            alt={`${name}, vue ${index + 1}`}
            className="max-h-[82vh] max-w-[92vw] object-contain shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
            onClick={(e) => e.stopPropagation()}
          />

          {pics.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); go(-1); }}
                aria-label="Photo précédente"
                className={`${MONO} absolute left-3 rounded-md border border-[#c6c2d8] ${PLASTIC_FACE} px-3 py-3 text-[0.875rem] font-bold text-[#262626] ${PLASTIC} ${PLASTIC_PRESS} sm:left-6`}
              >
                ◀
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); go(1); }}
                aria-label="Photo suivante"
                className={`${MONO} absolute right-3 rounded-md border border-[#c6c2d8] ${PLASTIC_FACE} px-3 py-3 text-[0.875rem] font-bold text-[#262626] ${PLASTIC} ${PLASTIC_PRESS} sm:right-6`}
              >
                ▶
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
