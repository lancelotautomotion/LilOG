"use client";

/* ============================================================
   Le disque et son boîtier — 100 % CSS, aucune image
   ------------------------------------------------------------
   Un CD-ROM dans son jewel case, empilé en couches absolues :

     1  la galette argentée      bg-gradient-to-tr
     2  l'irisation              conic-gradient en mix-blend-overlay
     3  les sillons              repeating-radial-gradient
     4  le titre incurvé         SVG <textPath> sur un arc
     5  la capacité gravée       au marqueur, sous le moyeu
     6  le moyeu et le trou      deux cercles centrés

   Le disque tourne pendant la gravure, jamais au repos : une
   rotation permanente attire l'œil pour rien.
   ============================================================ */

import { MONO } from "@/components/y2k/kit";

const CD_CSS = `
@keyframes gcSpin{ from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
.gc-disc.spin{ animation:gcSpin 1.1s linear infinite }

/* Le reflet balaie le boîtier quand le graveur travaille. */
@keyframes gcGlare{ 0%{transform:translateX(-120%)} 100%{transform:translateX(120%)} }
.gc-glare.spin{ animation:gcGlare 1.8s ease-in-out infinite }

@media (prefers-reduced-motion: reduce){
  .gc-disc.spin, .gc-glare.spin{ animation:none }
}
`;

/** Irisation du polycarbonate : le halo arc-en-ciel des CD gravés. */
const IRIDESCENCE =
  "conic-gradient(from 200deg at 50% 50%," +
  "rgba(255,110,196,.55) 0deg, rgba(120,115,245,.5) 60deg, rgba(90,255,160,.5) 130deg," +
  "rgba(253,224,71,.55) 200deg, rgba(255,110,196,.5) 275deg, rgba(120,115,245,.5) 330deg," +
  "rgba(255,110,196,.55) 360deg)";

/** Les sillons de données, concentriques et très serrés. */
const GROOVES =
  "repeating-radial-gradient(circle at 50% 50%," +
  "rgba(255,255,255,.5) 0 1px, rgba(30,20,60,.07) 1px 3px)";

export function CdRom({
  /** Capacité gravée sur la galette, déjà mise en forme (« 50,00 € »). */
  amount,
  /** Le graveur travaille : le disque tourne. */
  spinning = false,
  /** Identifiant unique du tracé SVG, si jamais deux disques cohabitent. */
  uid = "gc-arc",
}: {
  amount: string | null;
  spinning?: boolean;
  uid?: string;
}) {
  const spin = spinning ? " spin" : "";

  return (
    <div
      className="relative aspect-square w-full max-w-[420px] rounded-[8px] border border-white/70 bg-white/30 p-[6%] backdrop-blur-sm"
      style={{
        boxShadow:
          "inset 0 2px 0 rgba(255,255,255,0.95), inset 0 -2px 0 rgba(40,25,80,0.22)," +
          "inset 2px 0 0 rgba(255,255,255,0.6), inset -2px 0 0 rgba(40,25,80,0.16)," +
          "8px 8px 0 rgba(24,12,58,0.38)",
      }}
    >
      <style>{CD_CSS}</style>

      {/* Charnières du boîtier, sur la tranche gauche. */}
      <span aria-hidden className="absolute top-[12%] left-[1.5%] h-[16%] w-[2.2%] rounded-sm bg-white/70" />
      <span aria-hidden className="absolute bottom-[12%] left-[1.5%] h-[16%] w-[2.2%] rounded-sm bg-white/70" />

      {/* Plateau : le fond mat sur lequel repose la galette. */}
      <div className="relative grid h-full w-full place-items-center rounded-[4px] bg-[#4b3a78]/15">
        {/* Les ergots du plateau, aux quatre coins. */}
        <span aria-hidden className="absolute top-[6%] left-[6%] h-[7%] w-[7%] rounded-full bg-white/25" />
        <span aria-hidden className="absolute top-[6%] right-[6%] h-[7%] w-[7%] rounded-full bg-white/25" />
        <span aria-hidden className="absolute bottom-[6%] left-[6%] h-[7%] w-[7%] rounded-full bg-white/25" />
        <span aria-hidden className="absolute right-[6%] bottom-[6%] h-[7%] w-[7%] rounded-full bg-white/25" />

        {/* ---- La galette ---- */}
        <div
          /* Base argentée volontairement soutenue : sur un gris presque blanc,
             l'irisation posée par-dessus se délave et le disque perd son
             reflet arc-en-ciel. */
          className={`gc-disc relative aspect-square w-[88%] rounded-full bg-gradient-to-tr from-[#9c9cb8] via-[#eeeef6] to-[#a6a6c0]${spin}`}
          style={{ boxShadow: "0 6px 16px rgba(20,10,45,0.4), inset 0 0 0 1px rgba(255,255,255,0.65)" }}
        >
          <span
            aria-hidden
            className="absolute inset-0 rounded-full opacity-75 mix-blend-hard-light"
            style={{ background: IRIDESCENCE }}
          />
          <span
            aria-hidden
            className="absolute inset-[8%] rounded-full opacity-30"
            style={{ background: GROOVES }}
          />

          {/* Anneau de label : la zone imprimée. Translucide, pour que
              l'irisation continue de transparaître au lieu d'être masquée
              par un grand disque blanc. */}
          <span
            aria-hidden
            className="absolute inset-[22%] rounded-full bg-white/55"
            style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.85)" }}
          />

          {/* ---- Titre incurvé ----
              Le tracé court sur le demi-cercle supérieur. Le corps et
              l'interlettrage sont calés pour que la chaîne complète tienne
              sur l'arc : au-delà, `textPath` la tronque aux deux bouts.
              Le liseré blanc (paint-order) la garde lisible sur l'irisation. */}
          <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full" aria-hidden>
            <defs>
              <path id={uid} d="M 100,100 m -80,0 a 80,80 0 1,1 160,0" fill="none" />
            </defs>
            <text
              className={MONO}
              fill="#2b0f6b"
              fontSize="10.5"
              fontWeight="700"
              letterSpacing="1"
              paintOrder="stroke"
              stroke="rgba(255,255,255,0.92)"
              strokeWidth="2.6"
              strokeLinejoin="round"
            >
              <textPath href={`#${uid}`} startOffset="50%" textAnchor="middle">
                LIL_OG_OS /// CRÉDIT PREMIUM
              </textPath>
            </text>
          </svg>

          {/* ---- Capacité gravée au marqueur ---- */}
          <span className="pointer-events-none absolute inset-x-0 bottom-[20%] px-[18%] text-center">
            <span
              className="block text-[clamp(1.1rem,3.4vw,1.6rem)] leading-none font-bold text-[#1e2430]"
              style={{
                fontFamily: "var(--font-hand)",
                transform: "rotate(-3deg)",
                textShadow: "0 0 6px rgba(255,255,255,0.95), 0 0 3px rgba(255,255,255,1)",
              }}
            >
              {amount ?? "— vierge —"}
            </span>
          </span>

          {/* ---- Moyeu ---- */}
          <span
            aria-hidden
            className="absolute top-1/2 left-1/2 aspect-square w-[27%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/60"
            style={{ boxShadow: "inset 0 0 0 1px rgba(90,86,120,0.35), 0 0 0 1px rgba(255,255,255,0.7)" }}
          />

          {/* ---- Trou central ---- */}
          <span
            aria-hidden
            className="absolute top-1/2 left-1/2 aspect-square w-[13%] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-gray-400 bg-gray-200 shadow-inner"
          />
        </div>
      </div>

      {/* Reflet du plastique, par-dessus tout le boîtier. */}
      <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[8px]">
        <span
          className={`gc-glare absolute inset-y-0 -left-1/4 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent${spin}`}
        />
      </span>
    </div>
  );
}
