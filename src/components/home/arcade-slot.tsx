"use client";

/* ============================================================
   ARCADE_SLOT — module 02 de l'accueil
   ------------------------------------------------------------
   La borne d'arcade qui envoie sur /dressing-machine : coque de
   plastique gris biseautée, fronton lumineux, écran cathodique
   encastré (bordure noire épaisse + ombre intérieure) avec ses
   trois rouleaux, et un bouton « chunky plastic » géant à
   course 3D.

   ⚠ PAREFEU : Tailwind + feuille locale préfixée `lha-`.
   ============================================================ */

import Link from "next/link";
import { useLanguage } from "@/lib/i18n-context";
import { LCD, MONO, PLASTIC, SectionLabel } from "@/components/y2k/kit";

/** Les symboles qui défilent dans les rouleaux. */
const REEL = ["👗", "👠", "👜", "🕶️", "💍", "👖", "🎀", "💄"];

/** Chaque rouleau tourne à sa propre vitesse — sinon l'illusion tombe. */
const REEL_SPEEDS = ["2.1s", "2.8s", "3.4s"];

const ARCADE_CSS = `
/* Rouleaux : la bande contient deux fois la liste, on la remonte d'une moitié. */
@keyframes lhaReel{from{transform:translateY(0)}to{transform:translateY(-50%)}}
.lha-reel{animation-name:lhaReel;animation-timing-function:linear;animation-iteration-count:infinite}

/* Ampoules du fronton. */
@keyframes lhaBulb{0%,100%{opacity:1;box-shadow:0 0 9px rgba(255,215,240,.95)}50%{opacity:.3;box-shadow:none}}
.lha-bulb{animation:lhaBulb 1.6s ease-in-out infinite}

/* Battement de balayage du tube cathodique. */
@keyframes lhaFlicker{0%,100%{opacity:.42}50%{opacity:.28}}
.lha-crt{
  background-image:repeating-linear-gradient(to bottom,rgba(0,0,0,.55) 0 1px,rgba(0,0,0,0) 1px 3px);
  animation:lhaFlicker 3.4s ease-in-out infinite
}

/* Titre de l'écran : légère pulsation néon. */
@keyframes lhaGlow{0%,100%{text-shadow:0 0 10px rgba(255,94,196,.75),0 0 34px rgba(255,94,196,.4)}
  50%{text-shadow:0 0 16px rgba(255,94,196,.95),0 0 46px rgba(255,94,196,.55)}}
.lha-glow{animation:lhaGlow 2.6s ease-in-out infinite}

/* Bouton géant : course de 7 px, la pile d'ombres se referme à l'appui. */
.lha-cta{
  box-shadow:0 7px 0 #7d0f56, 0 16px 24px rgba(20,6,40,.45), inset 0 2px 0 rgba(255,255,255,.9), inset 0 -6px 14px rgba(120,0,80,.45);
  transition:transform 90ms ease, box-shadow 90ms ease, filter 160ms ease;
}
.lha-cta:hover{filter:brightness(1.06)}
.lha-cta:active{
  transform:translateY(7px);
  box-shadow:0 0 0 #7d0f56, 0 4px 10px rgba(20,6,40,.5), inset 0 2px 0 rgba(255,255,255,.55), inset 0 -3px 10px rgba(120,0,80,.5);
}

@media (prefers-reduced-motion: reduce){
  .lha-reel,.lha-bulb,.lha-crt,.lha-glow{animation:none!important}
}
`;

/** Un rouleau : fenêtre encastrée + bande d'icônes qui défile. */
function Reel({ duration, offset }: { duration: string; offset: number }) {
  const strip = [...REEL.slice(offset), ...REEL.slice(0, offset)];
  return (
    <div className="h-[74px] w-[58px] overflow-hidden rounded-md border-2 border-[#2b2b3d] bg-[#0d0d15] shadow-[inset_0_4px_10px_rgba(0,0,0,0.9)] sm:h-[92px] sm:w-[72px]">
      <div className="lha-reel" style={{ animationDuration: duration }}>
        {[...strip, ...strip].map((glyph, i) => (
          <div
            key={i}
            className="grid h-[74px] w-full place-items-center text-[1.7rem] select-none sm:h-[92px] sm:text-[2.1rem]"
          >
            <span aria-hidden>{glyph}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Ampoule du fronton. */
function Bulb({ delay, className = "" }: { delay: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={`lha-bulb h-2 w-2 shrink-0 rounded-full bg-[#fff0fa] ${className}`}
      style={{ animationDelay: delay }}
    />
  );
}

export function ArcadeSlot() {
  const { t } = useLanguage();

  return (
    <section id="slot" className="px-4 py-[clamp(48px,8vw,96px)] sm:px-6">
      <div className="mx-auto w-full max-w-[880px]">
        <SectionLabel n="02" file="ARCADE_SLOT.EXE" tone="wallpaper" />

        <style>{ARCADE_CSS}</style>

        {/* ---- Coque de la borne ---- */}
        <div
          className="relative rounded-[26px] border-2 border-[#9b97b3] p-[clamp(14px,2.6vw,26px)]"
          style={{
            background: "linear-gradient(180deg,#f6f5fb 0%,#e2e0ee 34%,#c6c2d8 72%,#a9a5bd 100%)",
            boxShadow:
              "inset 0 3px 0 rgba(255,255,255,0.95), inset 0 -6px 14px rgba(60,40,110,0.28), 10px 10px 0 rgba(24,12,58,0.55)",
          }}
        >
          {/* Fronton lumineux */}
          <div
            className="mb-[clamp(12px,2vw,20px)] flex items-center gap-2 rounded-xl border-2 border-[#3b1d8f] px-3 py-2"
            style={{ background: "linear-gradient(90deg,#3b1d8f 0%,#7147d4 45%,#ff3fb0 100%)" }}
          >
            {/* La 3e ampoule de chaque côté ne sort qu'à partir de sm :
                en dessous, la place revient au nom de la borne. */}
            <span className="flex shrink-0 gap-1.5">
              <Bulb delay="0ms" />
              <Bulb delay="200ms" />
              <Bulb delay="400ms" className="hidden sm:block" />
            </span>
            <span
              className={`${MONO} min-w-0 flex-1 truncate text-center text-[0.46rem] font-bold tracking-[0.1em] text-white uppercase sm:text-[0.62rem] sm:tracking-[0.18em]`}
            >
              ★ LIL&apos;OG DRESSING MACHINE ★
            </span>
            <span className="flex shrink-0 gap-1.5">
              <Bulb delay="400ms" className="hidden sm:block" />
              <Bulb delay="200ms" />
              <Bulb delay="0ms" />
            </span>
          </div>

          {/* ---- Écran cathodique encastré ---- */}
          <div className="relative overflow-hidden rounded-xl border-4 border-gray-800 bg-[#07060e] px-4 py-[clamp(20px,4vw,36px)] shadow-[inset_0_0_0_2px_rgba(255,255,255,0.05),inset_0_6px_22px_rgba(0,0,0,0.95)]">
            <div aria-hidden className="lha-crt pointer-events-none absolute inset-0 z-10" />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 z-10"
              style={{ background: "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.75) 100%)" }}
            />

            <div className="relative z-20 text-center">
              <p
                className={`${MONO} text-[0.52rem] font-bold tracking-[0.3em] text-[#5affa0] uppercase sm:text-[0.6rem]`}
                style={{ textShadow: "0 0 10px rgba(90,255,160,.6)" }}
              >
                ▸ INSERT COIN ▸ PULL LEVER ▸ GET DRESSED
              </p>

              <h2
                className={`${LCD} lha-glow mt-3 leading-[0.92] text-[#ff5ec4] uppercase`}
                style={{ fontSize: "clamp(1.9rem,7vw,4rem)" }}
              >
                Generate your next
                <br />
                <span className="text-[#fff0fa]" style={{ textShadow: "0 0 14px rgba(255,255,255,.7)" }}>
                  Y2K obsession
                </span>
              </h2>

              {/* Les trois rouleaux */}
              <div className="mt-[clamp(16px,3vw,26px)] flex items-center justify-center gap-2.5 sm:gap-4">
                {REEL_SPEEDS.map((d, i) => (
                  <Reel key={d} duration={d} offset={i * 3} />
                ))}
              </div>

              <p
                className={`${MONO} mt-[clamp(14px,2.4vw,22px)] text-[0.58rem] leading-[1.7] tracking-[0.06em] text-white/75 sm:text-[0.66rem]`}
              >
                {t.home.slotSub}
              </p>
            </div>
          </div>

          {/* ---- Panneau de commande ---- */}
          <div className="mt-[clamp(14px,2.4vw,22px)]">
            <Link
              href="/dressing-machine"
              className={`${MONO} lha-cta block w-full rounded-2xl border-2 border-[#5d0b46] px-4 py-[clamp(14px,2.6vw,22px)] text-center text-[clamp(0.66rem,2.6vw,1.05rem)] font-bold tracking-[0.1em] text-white uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff5ec4]`}
              style={{
                background: "linear-gradient(180deg,#ff9ee4 0%,#ff45b4 42%,#d61f8f 74%,#a6106b 100%)",
                textShadow: "0 2px 0 rgba(90,0,60,.55)",
              }}
            >
              [ 🎰 {t.home.slotCta} ]
            </Link>

            {/* Fente à jetons + joystick + boutons, pour finir la borne */}
            <div className="mt-[clamp(12px,2vw,18px)] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span
                  aria-hidden
                  className="h-7 w-3 rounded-full border border-[#7b7792] bg-[#2b2838] shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)]"
                />
                <span
                  className={`${MONO} text-[0.5rem] font-bold tracking-[0.16em] text-[#4b3d7a] uppercase sm:text-[0.56rem]`}
                >
                  {t.home.slotCoin}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <span
                  aria-hidden
                  title="Joystick"
                  className={`h-6 w-6 rounded-full ${PLASTIC}`}
                  style={{ background: "radial-gradient(circle at 32% 28%, #ff9ee4 0%, #d61f8f 60%, #7d0f56 100%)" }}
                />
                <span
                  aria-hidden
                  className={`h-6 w-6 rounded-full ${PLASTIC}`}
                  style={{ background: "radial-gradient(circle at 32% 28%, #bda3ff 0%, #7147d4 60%, #3b1d8f 100%)" }}
                />
                <span
                  aria-hidden
                  className={`h-6 w-6 rounded-full ${PLASTIC}`}
                  style={{ background: "radial-gradient(circle at 32% 28%, #b8ffd8 0%, #34d68a 60%, #12703f 100%)" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
