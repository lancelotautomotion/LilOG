"use client";

/* ============================================================
   FREE_SHIPPING.EXE : bandeau d'alerte système
   ------------------------------------------------------------
   La bande noire tout en haut de l'accueil, au-dessus de la
   barre de navigation : fond noir absolu, texte mono vert
   « moniteur » ponctué de rose néon, arête basse en relief. Le
   texte défile de droite à gauche comme une vieille <marquee>,
   mais en `transform` : aucun reflow, aucun débordement.

   Défilement sans couture : la piste contient DEUX séquences
   identiques posées côte à côte et l'animation la translate de
   -50 %, c'est-à-dire exactement la largeur d'une séquence. En
   fin de cycle la seconde occupe la place qu'avait la première :
   le raccord est invisible.

   Sous le ruban, la bande STAR_CLUB : « Première commande ? -10 % »
   et un bouton qui ouvre la fenêtre d'inscription (WelcomePopup).

   L'ensemble est `fixed`, donc hors flux : il publie sa hauteur
   totale (ruban + bande) dans `--lhb-h`, dont se servent la
   navigation (décalée d'autant par `.lhb-host .nav`) et les
   repères du hero.

   ⚠ PAREFEU : Tailwind + une feuille locale préfixée `lhb-`. La
   seule règle qui sorte du composant vise `.lhb-host .nav`,
   c'est-à-dire la navigation rendue à l'intérieur de l'hôte de ce
   bandeau — l'accueil seule. Aucune autre page ne bouge.
   ============================================================ */

import { MATRIX, MONO, NEON, PLASTIC, PLASTIC_FACE, PLASTIC_PRESS, VIOLET_BAR } from "@/components/y2k/kit";
import { useLanguage } from "@/lib/i18n-context";
import { openWelcome } from "@/components/welcome-popup";

/** Motifs par séquence ; deux séquences sont rendues, soit le double. */
const PER_SEQUENCE = 3;

const BAR_CSS = `
:root{ --lhb-m: 30px; --lhb-o: 34px; --lhb-h: calc(var(--lhb-m) + var(--lhb-o)) }
@media (min-width: 768px){ :root{ --lhb-m: 34px; --lhb-o: 36px } }

/* La navigation principale descend sous le bandeau. Le sélecteur est
   volontairement porté par l'hôte : hors de l'accueil, .nav garde le
   top: 0 que lui donne globals.css. */
.lhb-host .nav{ top: var(--lhb-h) }

.lhb-track{ display:flex; width:max-content; animation:lhbScroll 38s linear infinite; will-change:transform }
.lhb-seq{ display:flex; flex:0 0 auto; align-items:center }
.lhb-item{ flex:0 0 auto; padding-right:3rem; white-space:nowrap }

@keyframes lhbScroll{
  from{ transform:translate3d(0,0,0) }
  to{ transform:translate3d(-50%,0,0) }
}

/* Survol : le défilement s'arrête, le message se lit tranquillement. */
.lhb-bar:hover .lhb-track{ animation-play-state:paused }

/* Lignes de balayage : un afficheur, pas un ruban de papier. */
.lhb-scan{ background-image:repeating-linear-gradient(to bottom, rgba(255,255,255,.07) 0 1px, transparent 1px 3px) }

@media (prefers-reduced-motion: reduce){
  .lhb-track{ animation:none }
}
`;

/** Un motif complet, tel qu'il défile. */
function Item() {
  const alert = { color: NEON };
  return (
    <span className="lhb-item">
      <span style={alert}>[ SYS.ALERT ]</span>
      {" 🚚 ACTIVATION DU PROTOCOLE FREE_SHIPPING.EXE "}
      <span style={alert}>{"///"}</span>
      {" LIVRAISON OFFERTE DÈS 90€ D'ACHAT "}
      <span style={alert}>{"///"}</span> <span style={alert}>[ SYS.ALERT ]</span>
    </span>
  );
}

/** Une séquence : le motif répété, pour que la piste dépasse l'écran. */
function Sequence() {
  return (
    <span className="lhb-seq">
      {Array.from({ length: PER_SEQUENCE }, (_, i) => (
        <Item key={i} />
      ))}
    </span>
  );
}

export function AnnounceBar() {
  const { t } = useLanguage();

  return (
    <div className="fixed inset-x-0 top-0 z-[60] flex flex-col" style={{ height: "var(--lhb-h)" }}>
      <style>{BAR_CSS}</style>

      <div
        className="lhb-bar relative flex shrink-0 items-center overflow-hidden border-b-2 border-[#4b4b57] bg-black"
        style={{
          height: "var(--lhb-m)",
          /* Arête haute claire, tranche portée en bas : le liseré 3D. */
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.22), 0 2px 0 rgba(0,0,0,0.55)",
        }}
      >
        {/* Le ruban est décoratif pour les lecteurs d'écran : il est dupliqué
            et en mouvement. L'information est donnée une fois en clair juste
            après, hors écran. */}
        <div
          aria-hidden
          className={`lhb-track ${MONO} text-[0.875rem] font-bold tracking-[0.1em] uppercase`}
          style={{ color: MATRIX, textShadow: "0 0 8px rgba(90,255,160,.45)" }}
        >
          <Sequence />
          <Sequence />
        </div>

        <p className="sr-only">Livraison offerte dès 90 € d&apos;achat.</p>

        <span aria-hidden className="lhb-scan pointer-events-none absolute inset-0" />
      </div>

      {/* ── Bande STAR_CLUB : -10 % sur la première commande ── */}
      <div
        className="flex min-w-0 shrink-0 items-center justify-center gap-2.5 border-b-2 border-[#2a1370] px-3 md:gap-4"
        style={{ height: "var(--lhb-o)", background: VIOLET_BAR }}
      >
        <span
          className={`${MONO} min-w-0 truncate text-[0.75rem] font-bold tracking-[0.08em] text-white uppercase md:text-[0.875rem] md:tracking-[0.14em] [text-shadow:0_1px_2px_rgba(0,0,0,0.45)]`}
        >
          <span aria-hidden>⭐ </span>
          <span className="md:hidden">{t.welcome.bandShort}</span>
          <span className="hidden md:inline">{t.welcome.band}</span>
        </span>
        <button
          type="button"
          onClick={openWelcome}
          className={`${MONO} shrink-0 rounded-full border border-[#c6c2d8] px-3 py-[3px] text-[0.6875rem] font-bold tracking-[0.1em] whitespace-nowrap text-[#262626] uppercase md:px-4 md:py-1 md:text-[0.75rem] ${PLASTIC_FACE} ${PLASTIC} ${PLASTIC_PRESS}`}
        >
          {t.welcome.bandCta} →
        </button>
      </div>
    </div>
  );
}
