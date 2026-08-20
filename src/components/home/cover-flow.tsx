"use client";

/* ============================================================
   PLAYLIST_HIGHLIGHTS.EXE : module 02 de l'accueil
   ------------------------------------------------------------
   Cover Flow 3D façon iTunes (2003-2007) pour les pièces mises
   en avant : les pochettes (photos mannequin, format portrait)
   pivotent en perspective autour d'une pochette centrale, avec
   reflet inversé sous l'image active et un bandeau "piste en
   cours de lecture" pour le produit sélectionné.

   L'angle de rotation (±48°) et l'échelle des pochettes latérales
   sont constants quel que soit leur éloignement, comme sur
   l'original iTunes ; seuls l'écart horizontal, la profondeur
   (translateZ) et l'opacité augmentent avec la distance au
   centre, pour donner l'illusion de l'éventail qui s'éloigne.

   ⚠ PAREFEU : Tailwind + feuille locale préfixée `lhh-`.
   ============================================================ */

import { useRef, useState } from "react";
import { useCart } from "@/lib/cart-context";
import { SmartImg } from "@/components/smart-img";
import { MONO, PINK, PLASTIC, PLASTIC_FACE, SectionLabel, WindowFrame } from "@/components/y2k/kit";
import type { Product } from "@/lib/shopify/types";

const COVER_CSS = `
.lhh-stage{ perspective: 1400px; perspective-origin: 50% 42%; }
.lhh-slide{
  transition: transform 500ms cubic-bezier(.22,.61,.36,1), opacity 500ms ease-out, filter 500ms ease-out;
  transform-style: flat;
  backface-visibility: hidden;
}
.lhh-slide:hover:not(.lhh-active),
.lhh-slide:focus-visible:not(.lhh-active){ filter: brightness(1.15); }

.lhh-reflect{
  transition: opacity 500ms ease-out;
  mask-image: linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.08) 55%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.08) 55%, transparent 100%);
}

.lhh-nav{ transition: transform 120ms ease, opacity 200ms ease; }
.lhh-nav:active:not(:disabled){ transform: scale(0.9); }
.lhh-nav:disabled{ opacity: 0.35; cursor: default; }

.lhh-cta{
  box-shadow: 0 6px 0 #7d0f56, 0 14px 22px rgba(20,6,40,.4), inset 0 2px 0 rgba(255,255,255,.9), inset 0 -5px 12px rgba(120,0,80,.42);
  transition: transform 90ms ease, box-shadow 90ms ease, filter 160ms ease;
}
.lhh-cta:hover:not(:disabled){ filter: brightness(1.06); }
.lhh-cta:active:not(:disabled){
  transform: translateY(6px);
  box-shadow: 0 0 0 #7d0f56, 0 3px 8px rgba(20,6,40,.45), inset 0 2px 0 rgba(255,255,255,.55), inset 0 -3px 8px rgba(120,0,80,.5);
}
.lhh-cta:disabled{ filter: grayscale(0.6); cursor: default; }

@media (prefers-reduced-motion: reduce){
  .lhh-slide, .lhh-reflect, .lhh-nav, .lhh-cta{ transition: none !important; }
}
`;

/** Position/rotation/échelle d'une pochette, calculées depuis sa distance au centre. */
function slideStyle(offset: number): React.CSSProperties {
  if (offset === 0) {
    return {
      transform: "translate(-50%, -50%) translateZ(60px) rotateY(0deg) scale(1)",
      zIndex: 60,
      opacity: 1,
    };
  }
  const dist = Math.abs(offset);
  const dir = offset > 0 ? 1 : -1;
  const xPercent = offset * 46;
  const z = -50 - (dist - 1) * 44;
  // Droite → pivotée vers la gauche (-45°). Gauche → pivotée vers la droite (+45°).
  const rotate = dir > 0 ? -48 : 48;
  const scale = Math.max(0.75 - (dist - 1) * 0.09, 0.4);
  const opacity = Math.max(0.6 - (dist - 1) * 0.17, 0);
  return {
    transform: `translate(-50%, -50%) translateX(${xPercent}%) translateZ(${z}px) rotateY(${rotate}deg) scale(${scale})`,
    zIndex: 60 - dist,
    opacity,
    pointerEvents: opacity <= 0.04 ? "none" : "auto",
  };
}

/**
 * Taille du titre de piste, calée sur la longueur du nom du produit : plus le
 * nom est long, plus le corps (et son plancher `vw`, pour les petits écrans)
 * rétrécit, afin que "TRACK 0X : [ NOM ]" tienne toujours sur une seule
 * ligne, crochet fermant compris — jamais renvoyé seul à la ligne suivante.
 */
function trackTitleSize(len: number): string {
  if (len <= 22) return "clamp(0.85rem, 2.4vw, 1.125rem)";
  if (len <= 36) return "clamp(0.72rem, 2vw, 0.95rem)";
  if (len <= 52) return "clamp(0.62rem, 1.7vw, 0.8rem)";
  if (len <= 72) return "clamp(0.52rem, 1.4vw, 0.6875rem)";
  return "clamp(0.44rem, 1.15vw, 0.575rem)";
}

/** Copie inversée de la pochette active : le reflet "Apple 2000". */
function Reflection({ src, alt }: { src: string; alt: string }) {
  return (
    <div
      aria-hidden
      className="lhh-reflect pointer-events-none absolute top-full left-0 h-1/2 w-full overflow-hidden rounded-b-lg opacity-70"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- copie miroir de la pochette, jamais une vraie image de contenu. */}
      <img
        src={src}
        alt={alt}
        className="h-[200%] w-full object-cover blur-[1.5px]"
        style={{ transform: "scaleY(-1)" }}
      />
    </div>
  );
}

export function CoverFlow({ products }: { products: Product[] }) {
  const { addItem } = useCart();
  const [active, setActive] = useState(0);
  const [added, setAdded] = useState(false);
  const touchX = useRef<number | null>(null);

  if (products.length === 0) return null;

  const current = products[active];
  const sold = current.tag === "SOLD" || !current.variantId;
  const sizeLabel = current.sizes.length ? current.sizes.join(" / ") : current.meta || "ONE SIZE";

  const go = (next: number) => setActive(Math.min(Math.max(next, 0), products.length - 1));

  const add = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (sold || !current.variantId) return;
    setAdded(true);
    await addItem(current.variantId, 1);
    setTimeout(() => setAdded(false), 1400);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (delta > 40) go(active - 1);
    else if (delta < -40) go(active + 1);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") go(active - 1);
    else if (e.key === "ArrowRight") go(active + 1);
  };

  return (
    <section id="highlights" className="px-4 py-[clamp(48px,8vw,96px)] sm:px-6">
      <div className="mx-auto w-full max-w-[1200px]">
        <SectionLabel n="02" file="PLAYLIST_HIGHLIGHTS.EXE // LATEST_DROPS" tone="wallpaper" />

        <style>{COVER_CSS}</style>

        <WindowFrame
          title="PLAYLIST_HIGHLIGHTS.EXE"
          icon="▶"
          bodyClassName="bg-white px-[clamp(12px,3vw,32px)] pt-[clamp(24px,4vw,40px)] pb-[clamp(28px,4.5vw,44px)]"
        >
          {/* ---- Scène 3D ---- */}
          <div
            className="lhh-stage relative"
            tabIndex={0}
            role="group"
            aria-roledescription="carousel"
            aria-label="Pièces mises en avant"
            onKeyDown={onKeyDown}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <div className="relative h-[clamp(300px,46vw,480px)] w-full">
              {products.map((p, i) => {
                const offset = i - active;
                const isActive = offset === 0;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => go(i)}
                    aria-current={isActive}
                    aria-label={p.name}
                    className={`lhh-slide absolute top-1/2 left-1/2 aspect-[3/4] w-[clamp(190px,24vw,300px)] overflow-hidden rounded-lg border-2 ${
                      isActive ? "lhh-active border-white" : "border-[#b8b4cc]"
                    } bg-[#0d0d15] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff5ec4]`}
                    style={{
                      ...slideStyle(offset),
                      boxShadow: isActive
                        ? "0 30px 50px -14px rgba(20,6,40,.6), 0 14px 26px rgba(211,1,109,.3)"
                        : "0 10px 20px rgba(20,6,40,.35)",
                    }}
                  >
                    <SmartImg className="h-full w-full object-cover" src={p.imageA} alt={p.name} tone={i} />
                    {isActive && <Reflection src={p.imageA} alt="" />}
                  </button>
                );
              })}
            </div>

            {/* ---- Précédent / Suivant, discrets ---- */}
            <button
              type="button"
              onClick={() => go(active - 1)}
              disabled={active === 0}
              aria-label="Pièce précédente"
              className={`lhh-nav absolute top-1/2 left-1 z-[70] -translate-y-1/2 rounded-full border border-[#c6c2d8] ${PLASTIC_FACE} p-2 text-[#262626] sm:left-3 ${PLASTIC}`}
            >
              ◀
            </button>
            <button
              type="button"
              onClick={() => go(active + 1)}
              disabled={active === products.length - 1}
              aria-label="Pièce suivante"
              className={`lhh-nav absolute top-1/2 right-1 z-[70] -translate-y-1/2 rounded-full border border-[#c6c2d8] ${PLASTIC_FACE} p-2 text-[#262626] sm:right-3 ${PLASTIC}`}
            >
              ▶
            </button>
          </div>

          {/* ---- Piste en cours de lecture ---- */}
          <div className="mx-auto mt-6 max-w-[880px] border-t-2 border-dashed border-[#e4dff2] pt-5 text-center sm:mt-8">
            <p className={`${MONO} text-[0.6875rem] font-bold tracking-[0.18em] text-[#5b2fb8] uppercase`}>
              <span style={{ color: PINK }}>▶</span> Now playing · {String(active + 1).padStart(2, "0")}/
              {String(products.length).padStart(2, "0")}
            </p>
            <h3
              className={`${MONO} mt-1.5 leading-tight font-extrabold text-[#1E2430] uppercase whitespace-nowrap`}
              style={{ fontSize: trackTitleSize(current.name.length) }}
            >
              Track {String(active + 1).padStart(2, "0")} : [ {current.name} ]
            </h3>
            <p className={`${MONO} mt-1 text-[0.75rem] tracking-[0.06em] text-[#6B7280] uppercase`}>
              Price : {current.was && <s className="mr-1 opacity-70">{current.was}€</s>}
              {current.price}€ // Size : {sizeLabel}
            </p>

            <button
              type="button"
              onClick={add}
              disabled={sold}
              className={`${MONO} lhh-cta mt-4 inline-block rounded-2xl border-2 border-[#5d0b46] px-5 py-2.5 text-[0.75rem] font-bold tracking-[0.1em] text-white uppercase`}
              style={{
                background: "linear-gradient(180deg,#ff9ee4 0%,#ff45b4 42%,#d61f8f 74%,#a6106b 100%)",
                textShadow: "0 2px 0 rgba(90,0,60,.55)",
              }}
            >
              {sold ? "[ ✕ SOLD OUT ]" : added ? "[ ✓ ADDED ]" : "[ ▶ ADD TO CART ]"}
            </button>
          </div>
        </WindowFrame>
      </div>
    </section>
  );
}
