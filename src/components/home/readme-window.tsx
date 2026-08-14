"use client";

/* ============================================================
   README.TXT : module 04 de l'accueil
   ------------------------------------------------------------
   « Notre histoire » n'est plus un bloc texte + photo : c'est un
   Bloc-notes ouvert sur le bureau. Barre de titre bleue avec
   [ _ ] [ 🗖 ] [ × ], menus, fond blanc crème, texte en
   monospace, et les chiffres de la maison affichés en bas
   comme des statistiques système sur fond noir.

   La photo est un polaroid scotché en travers de la fenêtre :
   posé à cheval sur le bord droit en desktop, recentré sous la
   fenêtre en mobile, même élément, jamais dupliqué.

   ⚠ PAREFEU : Tailwind + feuille locale préfixée `lhr-`.
   ============================================================ */

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n-context";
import {
  HARD_SHADOW,
  LCD,
  MONO,
  NAVY_BAR,
  PINK,
  PLASTIC,
  PLASTIC_FACE,
  SectionLabel,
  Tape,
  WindowFrame,
} from "@/components/y2k/kit";

/** Photographie maison : la même campagne que /histoire. */
const POLAROID_SRC = "/histoire/look-07.jpg";

const README_CSS = `
/* Curseur de saisie en fin de texte. */
@keyframes lhrCaret{0%,49%{opacity:1}50%,100%{opacity:0}}
.lhr-caret{animation:lhrCaret 1s step-end infinite}

/* Le polaroid se redresse quand on le survole, comme sur /histoire. */
/* Le style en ligne porte la rotation : le survol doit donc forcer la sienne. */
.lhr-polaroid{transition:transform 240ms ease, box-shadow 240ms ease}
.lhr-polaroid:hover{transform:rotate(0deg) scale(1.04)!important;box-shadow:0 16px 32px rgba(20,6,40,.42);z-index:30}

@media (prefers-reduced-motion: reduce){
  .lhr-caret{animation:none}
  .lhr-polaroid,.lhr-polaroid:hover{transition:none;transform:rotate(-3deg)!important}
}
`;

/** Barre de défilement décorative, pour finir la fenêtre. */
function Scrollbar() {
  const arrow =
    `grid h-[15px] w-[15px] place-items-center rounded-[3px] border border-[#c6c2d8] ${PLASTIC_FACE} text-[0.8125rem] leading-none text-[#3b3550] ${PLASTIC}`;
  return (
    <div
      aria-hidden
      className="hidden w-[19px] shrink-0 flex-col items-center gap-1 border-l border-[#d8d5e6] bg-[#e9e7f2] py-1.5 md:flex"
    >
      <span className={arrow}>▲</span>
      <span className={`w-[13px] flex-1 rounded-[3px] border border-[#c6c2d8] ${PLASTIC_FACE} ${PLASTIC}`} />
      <span className={arrow}>▼</span>
    </div>
  );
}

export function ReadmeWindow() {
  const { t } = useLanguage();

  return (
    <section id="story" className="px-4 pb-[clamp(24px,4vw,48px)] sm:px-6">
      <div className="mx-auto w-full max-w-[1120px]">
        <SectionLabel n="04" file="README.TXT" tone="wallpaper" />

        <style>{README_CSS}</style>

        {/* En desktop, la colonne de droite est réservée au polaroid :
            la fenêtre s'arrête avant, la photo la chevauche. */}
        <div className="relative md:pr-[168px]">
          <WindowFrame title="README.TXT · Bloc-notes" icon="📝" bar={NAVY_BAR}>
            {/* Menus */}
            <div className="flex flex-wrap items-center gap-4 border-b border-[#c6c2d8] bg-[#e9e7f2] px-3 py-1.5">
              {["Fichier", "Édition", "Format", "Affichage", "?"].map((m) => (
                <span key={m} className={`${MONO} text-[0.8125rem] tracking-[0.06em] text-[#3b3550] uppercase`}>
                  {m}
                </span>
              ))}
            </div>

            {/* Feuille */}
            <div className="flex bg-[#FFFEF2]">
              {/* En desktop, la colonne s'arrête avant la zone que le polaroid
                  recouvre : la photo mord sur le cadre de la fenêtre, jamais
                  sur une fin de ligne. */}
              <div className="min-w-0 flex-1 px-[clamp(16px,3.4vw,38px)] py-[clamp(20px,3.6vw,40px)] md:pr-[96px]">
                <p className={`${MONO} text-[0.8125rem] tracking-[0.16em] text-[#9a94b5] uppercase`}>
                  · {t.ed.eyebrow} ·
                </p>

                <h2
                  className={`${MONO} mt-3 text-[clamp(1.25rem,3.4vw,2rem)] leading-[1.3] font-bold text-[#1E2430]`}
                >
                  {t.ed.title.map((s, i) =>
                    typeof s === "string" ? (
                      s
                    ) : (
                      <em key={i} className="not-italic" style={{ color: PINK }}>
                        {s.em}
                      </em>
                    ),
                  )}
                </h2>

                <p className={`${MONO} mt-5 text-[0.875rem] leading-[1.95] text-[#3b3550] sm:text-[0.9375rem]`}>
                  {t.ed.p1}
                </p>
                <p className={`${MONO} mt-4 text-[0.875rem] leading-[1.95] text-[#3b3550] sm:text-[0.9375rem]`}>
                  {t.ed.p2}
                  <span className="lhr-caret ml-1 inline-block align-[-0.05em] text-[#1B48CE]">▌</span>
                </p>

                <Link
                  href="/histoire"
                  className={`${MONO} mt-7 inline-block rounded-full border border-[#c6c2d8] ${PLASTIC_FACE} px-4 py-2 text-[0.8125rem] font-bold tracking-[0.1em] text-[#262626] uppercase transition hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7147d4] ${PLASTIC}`}
                >
                  [ {t.hero.story}.TXT → ]
                </Link>
              </div>

              <Scrollbar />
            </div>

            {/* Statistiques système. En mobile, la marge basse supplémentaire
                est la place où vient se poser le polaroid : il chevauche le
                bas de la fenêtre sans jamais recouvrir un chiffre. */}
            <div className="border-t-2 border-[#2b2838] bg-[#0d0d15] px-[clamp(16px,3.4vw,38px)] pt-4 pb-[76px] md:pb-4">
              <p
                className={`${MONO} text-[0.8125rem] font-bold tracking-[0.22em] text-[#5affa0] uppercase`}
                style={{ textShadow: "0 0 8px rgba(90,255,160,.55)" }}
              >
                ▸ {t.home.sysStats}
              </p>

              <div className="mt-3 grid grid-cols-3 gap-2 sm:gap-5">
                {t.ed.stats.map(([n, l], i) => (
                  <div key={i} className="min-w-0">
                    <div
                      className={`${LCD} text-[clamp(1.5rem,5vw,2.4rem)] leading-[1] text-[#5affa0]`}
                      style={{ textShadow: "0 0 12px rgba(90,255,160,.5)" }}
                    >
                      {n}
                    </div>
                    <div
                      className={`${MONO} mt-1 text-[0.8125rem] leading-[1.5] tracking-[0.08em] text-white/60 uppercase sm:text-[0.8125rem]`}
                    >
                      {l}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </WindowFrame>

          {/* ---- Polaroid scotché ---- */}
          <div
            className={`lhr-polaroid relative z-20 mx-auto -mt-[58px] w-[190px] bg-[#fafafa] p-2 pb-7 sm:w-[210px] md:absolute md:top-16 md:right-0 md:mt-0 md:w-[262px] ${HARD_SHADOW}`}
            style={{ transform: "rotate(-3deg)", border: "1px solid #e5e7eb" }}
          >
            <Tape rotate="-6deg" className="top-[-11px] left-[38%]" wide />
            <Tape rotate="72deg" className="bottom-[24%] left-[3px]" />

            <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#e7e5f1]">
              <Image
                src={POLAROID_SRC}
                alt=""
                fill
                sizes="(max-width: 768px) 210px, 262px"
                className="object-cover"
              />
            </div>

            <p className="mt-2 text-center text-[1rem] leading-none text-[#3b3550] font-[family-name:var(--font-hand)]">
              Lil&apos;OG archive · vol. 001
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
