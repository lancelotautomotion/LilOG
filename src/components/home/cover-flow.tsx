"use client";

/* ============================================================
   PLAYLIST_HIGHLIGHTS.EXE : module 02 de l'accueil
   ------------------------------------------------------------
   Cover Flow 3D façon iTunes (2003-2007) pour les pièces mises
   en avant, monté dans un vrai lecteur multimédia Y2K façon
   Winamp : coque de plastique gris biseautée, écran cathodique
   encastré pour les pochettes, afficheur LCD vert « piste en
   cours de lecture », et une console de transport en bas
   (⏪ / ADD TO CART / ⏩) dont les touches s'enfoncent.

   L'angle de rotation (±48°) et l'échelle des pochettes latérales
   sont constants quel que soit leur éloignement, comme sur
   l'original iTunes ; seuls l'écart horizontal, la profondeur
   (translateZ), l'opacité et l'assombrissement augmentent avec la
   distance au centre, pour donner l'illusion de l'éventail qui
   s'éloigne et pour concentrer l'œil sur la pochette active.

   ⚠ PAREFEU : Tailwind + feuille locale préfixée `lhh-`. La coque
   reprend exactement les valeurs de plastique et d'écran de la
   borne ARCADE_SLOT, aucune nouvelle couleur n'est inventée.
   ============================================================ */

import { useRef, useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { SmartImg } from "@/components/smart-img";
import { MATRIX, MONO, PLASTIC_FACE, SectionLabel, WindowFrame } from "@/components/y2k/kit";
import type { Product } from "@/lib/shopify/types";

/** Lueur verte des afficheurs, commune à l'écran LCD et à ses libellés. */
const GLOW = "0 0 10px rgba(90,255,160,.55)";

const COVER_CSS = `
.lhh-stage{ perspective: 1400px; perspective-origin: 50% 42%; }

/* L'assombrissement des pochettes passe par une variable : le style en ligne
   pose la valeur de repos (calculée depuis la distance au centre) et le survol
   n'a qu'à la relever, sans avoir à lutter contre la spécificité du inline. */
.lhh-slide{
  filter: brightness(var(--b,1));
  transition: transform 500ms cubic-bezier(.22,.61,.36,1), opacity 500ms ease-out, filter 300ms ease-out;
  transform-style: flat;
  backface-visibility: hidden;
}
.lhh-slide:hover:not(.lhh-active),
.lhh-slide:focus-visible:not(.lhh-active){ --b: .92 }

.lhh-reflect{
  mask-image: linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.09) 55%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.09) 55%, transparent 100%);
}

/* Battement de balayage des deux écrans (pochettes + LCD). */
@keyframes lhhFlicker{0%,100%{opacity:.4}50%{opacity:.26}}
.lhh-crt{
  background-image:repeating-linear-gradient(to bottom,rgba(0,0,0,.55) 0 1px,rgba(0,0,0,0) 1px 3px);
  animation:lhhFlicker 3.4s ease-in-out infinite
}
.lhh-scan{ background-image:repeating-linear-gradient(to bottom,rgba(0,0,0,.35) 0 1px,rgba(0,0,0,0) 1px 3px) }

/* Touches de transport : course de 5 px, la pile d'ombres se referme. */
.lhh-key{
  box-shadow:0 5px 0 #6f6b86, 0 11px 16px rgba(20,6,40,.42), inset 0 2px 0 rgba(255,255,255,.95), inset 0 -4px 10px rgba(60,40,110,.28);
  transition:transform 90ms ease, box-shadow 90ms ease, filter 160ms ease;
}
.lhh-key:hover{ filter:brightness(1.05) }
.lhh-key:active{
  transform:translateY(5px);
  box-shadow:0 0 0 #6f6b86, 0 3px 7px rgba(20,6,40,.45), inset 0 2px 0 rgba(255,255,255,.55), inset 0 -3px 8px rgba(60,40,110,.35);
}

/* Bouton d'achat : même course, mais en rose maison. */
.lhh-cta{
  box-shadow:0 5px 0 #7d0f56, 0 12px 20px rgba(20,6,40,.4), inset 0 2px 0 rgba(255,255,255,.9), inset 0 -5px 12px rgba(120,0,80,.42);
  transition:transform 90ms ease, box-shadow 90ms ease, filter 160ms ease;
}
.lhh-cta:hover:not(:disabled){ filter:brightness(1.06) }
.lhh-cta:active:not(:disabled){
  transform:translateY(5px);
  box-shadow:0 0 0 #7d0f56, 0 3px 8px rgba(20,6,40,.45), inset 0 2px 0 rgba(255,255,255,.55), inset 0 -3px 8px rgba(120,0,80,.5);
}
.lhh-cta:disabled{ filter:grayscale(.6); cursor:default }

@media (prefers-reduced-motion: reduce){
  .lhh-slide,.lhh-key,.lhh-cta{ transition:none !important }
  .lhh-crt{ animation:none }
}
`;

/**
 * Écart circulaire entre la pochette `i` et la pochette active : le chemin le
 * plus court autour de la boucle plutôt que la simple soustraction. Sans ça,
 * au démarrage (active = 0), la dernière pochette se retrouverait tout à
 * droite au lieu d'apparaître juste à gauche du centre — l'éventail ne
 * boucle pas, il se contente de recommencer.
 */
function loopOffset(i: number, active: number, count: number): number {
  let offset = i - active;
  if (offset > count / 2) offset -= count;
  else if (offset < -count / 2) offset += count;
  return offset;
}

/** Position, rotation, échelle et assombrissement d'une pochette. */
function slideStyle(offset: number): React.CSSProperties {
  if (offset === 0) {
    return {
      transform: "translate(-50%, -50%) translateZ(60px) rotateY(0deg) scale(1)",
      zIndex: 60,
      opacity: 1,
      ["--b" as string]: "1",
    } as React.CSSProperties;
  }
  const dist = Math.abs(offset);
  const dir = offset > 0 ? 1 : -1;
  const xPercent = offset * 46;
  const z = -50 - (dist - 1) * 44;
  // Droite → pivotée vers la gauche (-48°). Gauche → pivotée vers la droite (+48°).
  const rotate = dir > 0 ? -48 : 48;
  const scale = Math.max(0.75 - (dist - 1) * 0.09, 0.4);
  const opacity = Math.max(0.62 - (dist - 1) * 0.17, 0);
  // Les voisines sont nettement assombries : sur l'écran noir, c'est ce
  // contraste qui fait ressortir la pochette centrale, pas seulement sa taille.
  const brightness = Math.max(0.62 - (dist - 1) * 0.12, 0.3);
  return {
    transform: `translate(-50%, -50%) translateX(${xPercent}%) translateZ(${z}px) rotateY(${rotate}deg) scale(${scale})`,
    zIndex: 60 - dist,
    opacity,
    pointerEvents: opacity <= 0.04 ? "none" : "auto",
    ["--b" as string]: String(brightness),
  } as React.CSSProperties;
}

/**
 * Taille du titre de piste, commune à TOUTES les pièces du lecteur : elle est
 * calée une fois pour toutes sur le nom le plus long de la sélection, jamais
 * sur celui de la pièce affichée. Sinon l'afficheur changerait de corps à
 * chaque changement de piste, ce qui saute aux yeux d'un produit à l'autre.
 *
 * Le calcul : "TRACK 0X : [ " + nom + " ]" tient sur une ligne tant que sa
 * largeur reste sous celle de l'écran. En monospace, une chasse vaut ~0,62 em,
 * et la largeur utile de l'afficheur vaut ~82 vw une fois retirées les
 * gouttières de la page, de la coque et de l'écran. Le corps qui remplit
 * exactement cette largeur vaut donc `82vw / (nb de caractères × 0,62)`,
 * borné en haut pour ne pas devenir énorme sur grand écran, et en bas pour
 * rester lisible sur mobile — au-delà, `truncate` prend le relais.
 */
function trackTitleSize(longestName: number): string {
  const chars = longestName + 15; // "Track 07 : [ " et " ]", de longueur fixe.
  return `clamp(0.6rem, calc(82vw / ${(chars * 0.62).toFixed(1)}), 1.05rem)`;
}

/**
 * Copie inversée de la pochette active : le reflet « Apple 2000 ».
 * Un vrai élément miroir plutôt que `-webkit-box-reflect`, qui n'existe
 * toujours pas dans Firefox : rendu identique, mais visible partout.
 */
function Reflection({ src }: { src: string }) {
  return (
    <div
      aria-hidden
      className="lhh-reflect pointer-events-none absolute top-full left-0 h-1/2 w-full overflow-hidden rounded-b-lg opacity-70"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- copie miroir de la pochette, jamais une vraie image de contenu. */}
      <img
        src={src}
        alt=""
        className="h-[200%] w-full object-cover blur-[1.5px]"
        style={{ transform: "scaleY(-1)" }}
      />
    </div>
  );
}

/** Touche de transport biseautée de la console (⏪ / ⏩) : jamais désactivée,
 *  la navigation boucle d'un bout à l'autre de la sélection. */
function TransportKey({
  glyph,
  label,
  onClick,
}: {
  glyph: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`${MONO} lhh-key shrink-0 rounded-lg border-2 border-[#9b97b3] ${PLASTIC_FACE} px-[clamp(12px,2.4vw,20px)] py-[clamp(8px,1.6vw,13px)] text-[clamp(0.8rem,2vw,1rem)] leading-none font-bold text-[#262626] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7147d4]`}
    >
      {glyph}
    </button>
  );
}

export function CoverFlow({ products }: { products: Product[] }) {
  const { addItem } = useCart();
  const [active, setActive] = useState(0);
  const [added, setAdded] = useState(false);
  const touchX = useRef<number | null>(null);
  const swiped = useRef(false);

  if (products.length === 0) return null;

  const current = products[active];
  const sold = current.tag === "SOLD" || !current.variantId;
  const sizeLabel = current.sizes.length ? current.sizes.join(" / ") : current.meta || "ONE SIZE";

  // Une seule taille de titre pour tout le lecteur, dictée par le nom le plus
  // long : l'afficheur garde le même corps quelle que soit la piste en cours.
  const titleSize = trackTitleSize(products.reduce((max, p) => Math.max(max, p.name.length), 0));

  // Modulo qui reste positif même pour `next` négatif (JS renvoie un reste
  // du signe du dividende) : c'est ce qui boucle de la première pièce vers
  // la dernière, et inversement, plutôt que de s'arrêter aux bords.
  const go = (next: number) => setActive(((next % products.length) + products.length) % products.length);

  const add = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (sold || !current.variantId) return;
    setAdded(true);
    await addItem(current.variantId, 1);
    setTimeout(() => setAdded(false), 1400);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchX.current = e.touches[0].clientX;
    swiped.current = false;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(delta) <= 40) return;
    swiped.current = true;
    go(delta > 0 ? active - 1 : active + 1);
  };

  /**
   * Un balayage qui part de la pochette centrale ne doit pas ouvrir la fiche
   * produit : les navigateurs n'émettent en principe pas de `click` après un
   * glissement, mais le garde-fou ne coûte rien et évite une navigation subie
   * sur mobile. Le drapeau est remis à zéro au contact suivant.
   */
  const onCoverClick = (e: React.MouseEvent) => {
    if (!swiped.current) return;
    e.preventDefault();
    swiped.current = false;
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") go(active - 1);
    else if (e.key === "ArrowRight") go(active + 1);
  };

  return (
    /* Padding haut ET bas : premier module de la page, il porte seul le
       retrait d'après le hero (les suivants n'ont qu'un padding bas). */
    <section id="highlights" className="px-4 py-[clamp(48px,8vw,96px)] sm:px-6">
      <div className="mx-auto w-full max-w-[1200px]">
        <SectionLabel n="02" file="PLAYLIST_HIGHLIGHTS.EXE // LATEST_DROPS" tone="wallpaper" />

        <style>{COVER_CSS}</style>

        {/* La fenêtre garde la barre de titre commune du site ; c'est son corps
            qui devient la coque du lecteur, en plastique gris biseauté. */}
        <WindowFrame
          title="LIL_OG_MEDIA_PLAYER.EXE"
          icon="🎵"
          bodyClassName="p-[clamp(10px,2.2vw,22px)]"
          bodyStyle={{
            background: "linear-gradient(180deg,#f6f5fb 0%,#e2e0ee 34%,#c6c2d8 72%,#a9a5bd 100%)",
            boxShadow: "inset 0 3px 0 rgba(255,255,255,0.95), inset 0 -6px 14px rgba(60,40,110,0.28)",
          }}
        >
          {/* ---- Écran cathodique : la scène 3D ---- */}
          <div
            className="lhh-stage relative overflow-hidden rounded-xl border-4 border-gray-800 bg-[#07060e] shadow-[inset_0_0_0_2px_rgba(255,255,255,0.05),inset_0_6px_22px_rgba(0,0,0,0.95)]"
            tabIndex={0}
            role="group"
            aria-roledescription="carousel"
            aria-label="Pièces mises en avant"
            onKeyDown={onKeyDown}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <div aria-hidden className="lhh-crt pointer-events-none absolute inset-0 z-[65]" />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 z-[64]"
              style={{ background: "radial-gradient(ellipse at center, transparent 48%, rgba(0,0,0,0.8) 100%)" }}
            />

            <div className="relative h-[clamp(300px,46vw,480px)] w-full">
              {products.map((p, i) => {
                const offset = loopOffset(i, active, products.length);
                const isActive = offset === 0;

                // Habillage commun aux deux formes de pochette : seul l'élément
                // change (lien ou bouton), jamais l'aspect.
                const skin = {
                  className: `lhh-slide absolute top-1/2 left-1/2 aspect-[3/4] w-[clamp(190px,24vw,300px)] overflow-hidden rounded-lg border-2 ${
                    isActive ? "lhh-active border-white" : "border-[#4a4560]"
                  } bg-[#0d0d15] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff5ec4]`,
                  style: {
                    ...slideStyle(offset),
                    boxShadow: isActive
                      ? "0 30px 50px -14px rgba(0,0,0,.85), 0 14px 30px rgba(211,1,109,.4)"
                      : "0 10px 20px rgba(0,0,0,.6)",
                  } as React.CSSProperties,
                };

                const cover = (
                  <>
                    <SmartImg className="h-full w-full object-cover" src={p.imageA} alt={p.name} tone={i} />
                    {isActive && <Reflection src={p.imageA} />}
                  </>
                );

                // La pochette au centre ouvre la fiche produit ; les latérales
                // se contentent de venir au centre. Un clic ne peut donc jamais
                // emmener le visiteur sur une pièce qu'il n'était pas en train
                // de regarder.
                return isActive ? (
                  <Link
                    key={p.id}
                    href={`/products/${p.handle}`}
                    aria-current="true"
                    aria-label={`${p.name} — voir la fiche produit`}
                    onClick={onCoverClick}
                    {...skin}
                  >
                    {cover}
                  </Link>
                ) : (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => go(i)}
                    aria-label={`${p.name} — mettre au centre`}
                    {...skin}
                  >
                    {cover}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ---- Afficheur LCD : la piste en cours de lecture ---- */}
          <div className="relative mt-[clamp(10px,2vw,18px)] overflow-hidden rounded-lg border-2 border-[#0c2a1b] bg-[#04140c] px-[clamp(10px,2.4vw,22px)] py-[clamp(10px,2vw,16px)] text-center shadow-[inset_0_0_0_2px_rgba(90,255,160,0.06),inset_0_4px_16px_rgba(0,0,0,0.95)]">
            <div aria-hidden className="lhh-scan pointer-events-none absolute inset-0 z-10" />

            <div className="relative z-20">
              <p
                className={`${MONO} text-[0.6875rem] font-bold tracking-[0.18em] uppercase`}
                style={{ color: MATRIX, textShadow: GLOW }}
              >
                ▶ Now playing · {String(active + 1).padStart(2, "0")}/
                {String(products.length).padStart(2, "0")}
              </p>

              {/* `truncate` : dernier filet de sécurité pour un nom
                  exceptionnellement long sur un écran étroit — le titre reste
                  sur sa ligne et se termine en points de suspension, plutôt
                  que de descendre son crochet fermant à la ligne suivante. */}
              <h3
                className={`${MONO} mt-1.5 truncate leading-tight font-extrabold uppercase`}
                style={{
                  fontSize: titleSize,
                  color: "#c9ffe2",
                  textShadow: "0 0 12px rgba(90,255,160,.75)",
                }}
              >
                Track {String(active + 1).padStart(2, "0")} : [ {current.name} ]
              </h3>

              <p
                className={`${MONO} mt-1 text-[0.75rem] tracking-[0.06em] uppercase`}
                style={{ color: "rgba(90,255,160,.72)", textShadow: GLOW }}
              >
                Price : {current.was && <s className="mr-1 opacity-70">{current.was}€</s>}
                {current.price}€ // Size : {sizeLabel}
              </p>
            </div>
          </div>

          {/* ---- Console de transport ---- */}
          <div className="mt-[clamp(10px,2vw,18px)] flex items-center justify-center gap-[clamp(8px,2vw,18px)] rounded-lg border border-[#b0acc4] bg-[#d8d5e6] px-[clamp(8px,2vw,18px)] py-[clamp(10px,2vw,16px)] shadow-[inset_1px_1px_0_rgba(90,86,120,0.55),inset_-1px_-1px_0_rgba(255,255,255,0.9),inset_2px_2px_5px_rgba(0,0,0,0.16)]">
            <TransportKey glyph="⏪" label="Pièce précédente" onClick={() => go(active - 1)} />

            <button
              type="button"
              onClick={add}
              disabled={sold}
              className={`${MONO} lhh-cta min-w-0 rounded-xl border-2 border-[#5d0b46] px-[clamp(12px,3vw,28px)] py-[clamp(9px,1.8vw,14px)] text-[clamp(0.65rem,1.8vw,0.8125rem)] font-bold tracking-[0.1em] text-white uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff5ec4]`}
              style={{
                background: "linear-gradient(180deg,#ff9ee4 0%,#ff45b4 42%,#d61f8f 74%,#a6106b 100%)",
                textShadow: "0 2px 0 rgba(90,0,60,.55)",
              }}
            >
              {sold ? "[ ✕ SOLD OUT ]" : added ? "[ ✓ ADDED ]" : "[ ▶ ADD TO CART ]"}
            </button>

            <TransportKey glyph="⏩" label="Pièce suivante" onClick={() => go(active + 1)} />
          </div>
        </WindowFrame>
      </div>
    </section>
  );
}
