"use client";

/* ============================================================
   BLACK_FRIDAY.EXE : fenêtre d'accueil de la promo
   ------------------------------------------------------------
   S'ouvre à l'arrivée sur le site, quelle que soit la page
   d'entrée (les publicités Instagram peuvent pointer vers une
   fiche produit), pendant la fenêtre de `@/lib/promo`.
   Une fois fermée, elle ne revient pas de la visite : le choix
   est noté en sessionStorage, pas en localStorage, si bien
   qu'elle se rouvre à la visite suivante.

   Même habillage que les autres fenêtres du site : cadre
   #b8b4cc, barre de titre violette, papier millimétré, VT323
   pour l'afficheur. Le « × » ferme pour de vrai, comme Échap
   et un clic sur le voile.
   ============================================================ */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/lib/i18n-context";
import { isPromoLive, PROMO_CODE } from "@/lib/promo";
import { ChromeStar, GemSticker } from "@/components/contact/stickers";
import {
  GRID_BG,
  HARD_SHADOW,
  LCD,
  MONO,
  PINK,
  PLASTIC,
  PLASTIC_FACE,
  PLASTIC_PRESS,
  VIOLET_BAR,
} from "@/components/y2k/kit";

const SEEN_KEY = "lilog-bf-popup-closed";

/** Pages où la fenêtre gênerait un parcours en cours. */
const QUIET_PATHS = ["/checkout"];

const STAR: [string, string, string] = ["#FFB3D6", "#F0509A", "#B7175C"];
const HEART: [string, string, string] = ["#FFC0DF", "#EE4B96", "#B3155A"];

const POP_CSS = `
@keyframes lbfBob{
  0%,100%{transform:translate3d(0,0,0) rotate(var(--r,0deg)) scale(1)}
  50%{transform:translate3d(0,-7%,0) rotate(calc(var(--r,0deg) + 6deg)) scale(1.05)}
}
.lbf-strass{position:absolute;pointer-events:none;animation:lbfBob 7s ease-in-out infinite;filter:drop-shadow(0 3px 4px rgba(30,36,48,.35))}
@keyframes lbfIn{from{opacity:0;transform:translateY(14px) scale(.97)}to{opacity:1;transform:none}}
.lbf-in{animation:lbfIn 260ms ease-out both}
@keyframes lbfVeil{from{opacity:0}to{opacity:1}}
.lbf-veil{animation:lbfVeil 200ms ease-out both}
@media (prefers-reduced-motion: reduce){
  .lbf-strass{animation:none;transform:rotate(var(--r,0deg))}
  .lbf-in,.lbf-veil{animation:none}
}
`;

/** Strass collés sur les coins de la fenêtre, jamais sur ses commandes. */
const STRASS = [
  { cls: "-top-5 -left-4 h-11 w-11", r: "-14deg", d: "7s", node: <ChromeStar uid="bfp-chrome" /> },
  { cls: "-top-3 left-[38%] h-7 w-7", r: "10deg", d: "8.2s", node: <GemSticker uid="bfp-heart-a" shape="heart" hue={HEART} /> },
  { cls: "top-[42%] -right-4 h-8 w-8", r: "14deg", d: "6.4s", node: <GemSticker uid="bfp-star-a" shape="star" hue={STAR} /> },
  { cls: "top-[55%] -left-4 h-7 w-7", r: "-8deg", d: "9s", node: <GemSticker uid="bfp-star-b" shape="star" hue={STAR} /> },
  { cls: "-bottom-4 left-[22%] h-8 w-8", r: "12deg", d: "7.6s", node: <GemSticker uid="bfp-heart-b" shape="heart" hue={HEART} /> },
  { cls: "-right-4 -bottom-5 h-11 w-11", r: "-12deg", d: "8.6s", node: <GemSticker uid="bfp-star-c" shape="star" hue={STAR} /> },
];

export function BlackFridayPopup() {
  const { t } = useLanguage();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(PROMO_CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* Presse-papiers refusé : le code reste lisible et sélectionnable. */
    }
  };
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const check = () => {
      if (QUIET_PATHS.some((p) => pathname?.startsWith(p))) return;
      if (!isPromoLive()) return;
      let closed = false;
      try {
        closed = sessionStorage.getItem(SEEN_KEY) === "1";
      } catch {
        /* Stockage bloqué (navigation privée stricte) : on montre la fenêtre. */
      }
      if (!closed) setOpen(true);
    };
    check();
    /* Une seule fois, à l'arrivée : la navigation interne ne la rouvre pas. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const close = () => {
    setOpen(false);
    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* Rien à faire : elle reviendra au prochain chargement complet. */
    }
  };

  useEffect(() => {
    if (!open) return;
    /* Le focus entre dans la fenêtre (lecteurs d'écran, clavier) sans
       poser d'anneau sur le « × » à chaque arrivée. */
    dialogRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-6">
      <style>{POP_CSS}</style>

      {/* Voile : un clic à côté ferme la fenêtre. */}
      <div aria-hidden className="lbf-veil absolute inset-0 bg-[#1a0f3a]/55 backdrop-blur-[2px]" onClick={close} />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="lbf-title"
        ref={dialogRef}
        tabIndex={-1}
        className="lbf-in relative w-full max-w-[25rem] outline-none"
      >
        <div className={`overflow-hidden rounded-2xl border-2 border-[#b8b4cc] bg-[#f0f0f5] ${HARD_SHADOW}`}>
          {/* ── Barre de titre ── */}
          <div
            className="flex items-center gap-2 border-b-2 border-[#2a1370] px-2.5 py-2 select-none"
            style={{ background: VIOLET_BAR }}
          >
            <span
              className={`${MONO} min-w-0 flex-1 truncate text-[0.875rem] font-bold tracking-[0.1em] text-white uppercase [text-shadow:0_1px_2px_rgba(0,0,0,0.45)]`}
            >
              <span aria-hidden>🛍️ </span>BLACK_FRIDAY.EXE
            </span>
            <button
              type="button"
              onClick={close}
              aria-label={t.bf.close}
              title={t.bf.close}
              className={`grid h-6 w-7 shrink-0 place-items-center rounded-md border border-[#c6c2d8] ${PLASTIC_FACE} text-[0.875rem] leading-none font-bold text-[#262626] ${PLASTIC} ${PLASTIC_PRESS}`}
            >
              ×
            </button>
          </div>

          {/* ── Corps ── */}
          <div className="px-5 pt-6 pb-5 text-center" style={GRID_BG}>
            {/* Afficheur : encre noire sur écran clair encastré. */}
            <div className="rounded-lg border-2 border-t-[#8f8aa6] border-r-white border-b-white border-l-[#8f8aa6] bg-white/80 px-3 pt-3 pb-2">
              <h2
                id="lbf-title"
                className={`${LCD} text-[1.75rem] leading-[0.9] tracking-[0.04em] whitespace-nowrap text-black uppercase sm:text-[2.25rem] sm:tracking-[0.08em]`}
              >
                Black Friday Month
              </h2>
              <p
                className={`${LCD} mt-1 text-[5rem] leading-[0.85] sm:text-[5.75rem]`}
                style={{ color: PINK }}
              >
                -20%
              </p>
            </div>

            <p className={`${MONO} mt-4 text-[0.9375rem] leading-snug font-bold text-[#2b2340]`}>{t.bf.body}</p>

            {/* Ticket du code : un clic le copie, et il reste sélectionnable
                à la main si le presse-papiers est refusé. */}
            <p className={`${MONO} mt-4 text-[0.75rem] font-bold tracking-[0.14em] text-[#5b5370] uppercase`}>
              {t.bf.code}
            </p>
            <button
              type="button"
              onClick={copyCode}
              aria-label={`${t.bf.copy} ${PROMO_CODE}`}
              className="mt-1.5 inline-flex items-center gap-3 rounded-lg border-2 border-dashed bg-white px-4 py-2 transition hover:bg-[#fff0f8]"
              style={{ borderColor: PINK }}
            >
              <span className={`${LCD} text-[1.75rem] leading-none tracking-[0.08em] text-black select-all`}>
                {PROMO_CODE}
              </span>
              <span
                className={`${MONO} rounded-md px-2 py-1 text-[0.6875rem] font-bold tracking-[0.1em] uppercase`}
                style={{ color: "#fff", background: copied ? "#1f9d55" : PINK }}
                aria-live="polite"
              >
                {copied ? t.bf.copied : t.bf.copy}
              </span>
            </button>

            <Link
              href="/catalogue"
              onClick={close}
              className={`${MONO} mt-5 inline-flex items-center gap-2 rounded-full border border-[#a8004f] px-6 py-2.5 text-[0.875rem] font-bold tracking-[0.12em] text-white uppercase ${PLASTIC} ${PLASTIC_PRESS}`}
              style={{ color: "#fff", background: `linear-gradient(180deg, #ff5ec4 0%, ${PINK} 100%)` }}
            >
              {t.bf.cta} →
            </Link>
          </div>
        </div>

        {STRASS.map((s, i) => (
          <span
            key={i}
            aria-hidden
            className={`lbf-strass z-10 ${s.cls}`}
            style={{ ["--r" as string]: s.r, animationDuration: s.d, animationDelay: `${-i * 1.3}s` }}
          >
            {s.node}
          </span>
        ))}
      </div>
    </div>
  );
}
