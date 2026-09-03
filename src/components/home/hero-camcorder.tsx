"use client";

/* ============================================================
   CAMCORDER_OS : module 01 de l'accueil
   ------------------------------------------------------------
   Plein écran (100svh), pensé pour accueillir une vidéo de fond.
   Tant qu'aucune vidéo n'est déposée dans /public/hero, le fond
   reste le still de la marque : le <video> ne se révèle que
   lorsqu'il est réellement lisible, donc un fichier absent ne
   laisse jamais de trou noir.

   Par-dessus : l'habillage d'un caméscope des années 2000,
   témoin [REC] clignotant, timecode, jauge de batterie, date,
   repères de cadre, puis le texte de marque en machine à
   écrire, typo mono néon.
   ============================================================ */

import { useEffect, useState } from "react";
import Image from "next/image";
import { useLanguage } from "@/lib/i18n-context";
import { Typewriter } from "@/components/typewriter";
import { MONO, NEON } from "@/components/y2k/kit";

/**
 * Vidéo de fond. Le fichier n'est pas versionné (poids) : dépose
 * `camcorder.mp4` dans `public/hero/` et il est pris en compte
 * automatiquement, sinon le still ci-dessous tient le rôle.
 */
const HERO_VIDEO = "/hero/camcorder.mp4";

/** Still de repli : photographie maison, pas de banque d'images. */
const HERO_STILL = "/Design sans titre (1).png";

/** Still dédié au mobile : cadrage portrait qui montre le sujet en entier. */
const HERO_STILL_MOBILE = "/mobile-hero.jpg";

const HERO_CSS = `
/* Lignes de balayage du viseur. */
.lhz-scan{
  background-image:repeating-linear-gradient(to bottom,rgba(0,0,0,.26) 0 1px,rgba(0,0,0,0) 1px 3px);
  mix-blend-mode:multiply;opacity:.34
}

/* Défaut de piste : une bande claire descend de temps en temps. */
@keyframes lhzTrack{
  0%{transform:translateY(-12%);opacity:0}
  3%{opacity:.55}
  9%{opacity:0}
  100%{transform:translateY(112%);opacity:0}
}
.lhz-track{animation:lhzTrack 9.5s linear infinite}

/* Témoin d'enregistrement. */
@keyframes lhzRec{0%,49%{opacity:1}50%,100%{opacity:.15}}
.lhz-rec{animation:lhzRec 1.1s step-end infinite}

/* Curseur de la machine à écrire. */
@keyframes lhzCaret{0%,49%{opacity:1}50%,100%{opacity:0}}
.lhz-caret{animation:lhzCaret 900ms step-end infinite;margin-left:.06em}

/* Invite de défilement. */
@keyframes lhzBounce{0%,100%{transform:translateY(0)}50%{transform:translateY(6px)}}
.lhz-bounce{animation:lhzBounce 2.2s ease-in-out infinite}

/* Décalages du haut du viseur. Ils tiennent compte de --lhb-h, la hauteur
   du bandeau FREE_SHIPPING.EXE qui descend la navigation d'autant ; la
   variable vaut 0 si le bandeau n'est pas monté. */
.lhz-frame{top:calc(76px + var(--lhb-h, 0px))}
.lhz-toprow{top:calc(84px + var(--lhb-h, 0px) + env(safe-area-inset-top))}
@media (min-width:768px){
  .lhz-frame{top:calc(96px + var(--lhb-h, 0px))}
  .lhz-toprow{top:calc(112px + var(--lhb-h, 0px))}
}

@media (prefers-reduced-motion: reduce){
  .lhz-track,.lhz-rec,.lhz-caret,.lhz-bounce{animation:none!important}
}
`;

/* ============================================================
   Afficheurs du caméscope
   ============================================================ */

/** Timecode HH:MM:SS:FF : il démarre au montage, jamais au build. */
function Timecode() {
  const [ticks, setTicks] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTicks((n) => n + 1), 200);
    return () => clearInterval(id);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");
  const total = Math.floor(ticks / 5);

  return (
    <span suppressHydrationWarning>
      {pad(Math.floor(total / 3600))}:{pad(Math.floor(total / 60) % 60)}:{pad(total % 60)}:
      {pad((ticks % 5) * 5)}
    </span>
  );
}

/** Jauge de batterie : trois barres, la dernière en réserve. */
function Battery() {
  return (
    <svg viewBox="0 0 34 16" width="30" height="14" aria-hidden shapeRendering="crispEdges">
      <rect x="0.5" y="0.5" width="29" height="15" fill="none" stroke="#fff" strokeWidth="1.4" />
      <rect x="30" y="5" width="3.5" height="6" fill="#fff" />
      <rect x="3" y="3" width="7" height="10" fill="#5affa0" />
      <rect x="11.5" y="3" width="7" height="10" fill="#5affa0" />
      <rect x="20" y="3" width="7" height="10" fill="#ff5ec4" />
    </svg>
  );
}

/**
 * Repères de cadre du viseur, aux quatre coins.
 *
 * Deux pièges, qui coupaient les repères dans la première version :
 * · en haut, la barre de navigation est opaque et recouvre les 72 premiers
 *   pixels du hero, donc le cadre démarre en dessous ;
 * · les pastilles d'habillage (REC, batterie, date, PLAY) partageaient la
 *   même marge latérale que les repères et passaient par-dessus leurs
 *   traits. Elles sont désormais rentrées plus au centre (`inset-x` des
 *   deux rangées), de sorte qu'aucune ne croise un coin.
 */
function Brackets() {
  const base = "pointer-events-none absolute h-6 w-6 border-white/70 md:h-12 md:w-12";
  return (
    <div
      aria-hidden
      className="lhz-frame pointer-events-none absolute right-2 bottom-2 left-2 z-20 md:right-6 md:bottom-6 md:left-6"
    >
      <span className={`${base} top-0 left-0 border-t-2 border-l-2`} />
      <span className={`${base} top-0 right-0 border-t-2 border-r-2`} />
      <span className={`${base} bottom-0 left-0 border-b-2 border-l-2`} />
      <span className={`${base} right-0 bottom-0 border-r-2 border-b-2`} />
    </div>
  );
}

/* ============================================================
   Module
   ============================================================ */

export function HeroCamcorder() {
  const { t } = useLanguage();
  const [videoOn, setVideoOn] = useState(false);
  const [date, setDate] = useState<string | null>(null);

  /* La date du viseur est celle du visiteur, dans sa langue et son fuseau :
     elle ne peut donc pas être rendue côté serveur sans provoquer une
     différence d'hydratation. Même procédé que l'horloge du pied de page,
     le viseur affiche des tirets jusqu'au montage. */
  useEffect(() => {
    const stamp = () =>
      setDate(
        new Date()
          .toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })
          .toUpperCase()
          .replace(/\./g, ""),
      );

    stamp();
  }, []);

  const chip =
    `${MONO} flex items-center gap-2 rounded-sm bg-black/45 px-2.5 py-1.5 text-[0.8125rem] ` +
    "font-bold tracking-[0.14em] text-white uppercase backdrop-blur-[2px] md:text-[0.875rem]";

  return (
    <header
      id="top"
      className="relative flex h-[100svh] min-h-[560px] w-full items-center justify-center overflow-hidden bg-black"
    >
      <style>{HERO_CSS}</style>

      {/* ---- Fond : still de la marque, puis vidéo si elle existe ----
           Deux stills, jamais le même cadrage : le portrait pris pour le
           bureau, recadré au centre sur la photo large, coupait le sujet en
           mobile. `HERO_STILL_MOBILE` est un cadrage dédié (portrait, sujet
           déjà centré) qui garde toute la hauteur de la photo au lieu de la
           rogner. */}
      <div aria-hidden className="absolute inset-0">
        {/* Le toggle mobile/bureau vit sur ces `<div>`, jamais directement sur
            l'`<Image>` : `img{display:block}` (globals.css, hors des layers
            Tailwind) bat "hidden"/"md:block" posées sur un `<img>` quelle que
            soit la largeur d'écran, les deux photos restaient affichées en
            même temps. */}
        <div className="absolute inset-0 block md:hidden">
          <Image
            src={HERO_STILL_MOBILE}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>
        <div className="absolute inset-0 hidden md:block">
          <Image src={HERO_STILL} alt="" fill priority sizes="100vw" className="object-cover object-center" />
        </div>

        <video
          className="absolute inset-0 h-full w-full object-cover object-[64%_center] transition-opacity duration-700 md:object-center"
          style={{ opacity: videoOn ? 1 : 0 }}
          src={HERO_VIDEO}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          onCanPlay={() => setVideoOn(true)}
          onError={() => setVideoOn(false)}
        />
      </div>

      {/* ---- Habillage optique : voile, balayage, défaut de piste ----
           Le voile reste léger : il ne sert qu'à décoller le texte de
           l'image, la vidéo doit garder sa lumière. */}
      <div aria-hidden className="absolute inset-0 bg-black/15" />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse at center, transparent 52%, rgba(0,0,0,0.38) 100%)" }}
      />
      <div aria-hidden className="lhz-scan absolute inset-0" />
      <div
        aria-hidden
        className="lhz-track absolute inset-x-0 h-[7%]"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.14) 40%, rgba(255,94,196,0.10) 60%, transparent 100%)",
        }}
      />
      <Brackets />

      {/* ---- Ligne haute : témoin d'enregistrement / batterie ---- */}
      <div className="lhz-toprow absolute inset-x-10 z-30 flex items-start justify-between gap-3 md:inset-x-24">
        <div className="flex flex-col items-start gap-1.5">
          <span className={chip}>
            <span className="lhz-rec inline-block h-2.5 w-2.5 rounded-full bg-[#ff2d2d] shadow-[0_0_10px_#ff2d2d]" />
            REC <span aria-hidden>🔴</span>
          </span>
          <span className={`${chip} tabular-nums`}>
            <Timecode />
          </span>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <span className={chip}>
            BATT <Battery />
          </span>
          <span className={chip}>SP · 60 MIN</span>
        </div>
      </div>

      {/* ---- Texte de marque ----
           `mt-[11svh]` en mobile : le cadrage dédié au portrait laisse le
           visage dans la moitié basse de l'écran, pile au niveau du bloc de
           texte (centré par le `flex items-center` du header) sans cette
           marge. Le bureau garde le centrage d'origine. */}
      <div className="relative z-30 mt-[20svh] w-full max-w-[min(92vw,1000px)] px-5 text-center md:mt-0">
        <h1 className={`${MONO} leading-[1.15] font-bold text-white`}>
          {/* Voile allégé oblige : la lisibilité tient au halo du texte
              lui-même, pas à un fond assombri. */}
          <span
            className="block text-[clamp(0.9375rem,2.2vw,1.125rem)] tracking-[0.28em] text-white uppercase"
            style={{ textShadow: "0 2px 14px rgba(0,0,0,.85), 0 0 4px rgba(0,0,0,.6)" }}
          >
            {t.hero.line}
          </span>
          <span
            className="mt-4 block text-[clamp(2rem,7.2vw,4.6rem)] tracking-[0.02em] uppercase"
            style={{
              color: NEON,
              /* Halo rose pour le néon, ombre sombre pour tenir aussi sur un
                 plan clair : le voile ne fait plus le travail à sa place. */
              textShadow:
                "0 0 12px rgba(255,94,196,.75), 0 0 38px rgba(255,94,196,.45), 0 3px 18px rgba(0,0,0,.7)",
            }}
          >
            <Typewriter
              text={t.hero.words}
              speed={95}
              deleteSpeed={45}
              waitTime={1500}
              cursorChar="_"
              cursorClassName="lhz-caret"
            />
          </span>
        </h1>

        <p
          className={`${MONO} mt-6 text-[0.8125rem] font-bold tracking-[0.24em] text-[#5affa0] uppercase md:text-[0.875rem]`}
          style={{
            /* Halo vert d'origine gardé tel quel ; le trait sombre serré qui
               l'entoure (au lieu d'un simple flou porté) est ce qui manquait
               pour tenir sur un fond clair (pull, fourrure). */
            textShadow:
              "0 0 1px #000, 0 1px 1px #000, 0 -1px 1px #000, 1px 0 1px #000, -1px 0 1px #000, 0 2px 10px rgba(0,0,0,.85), 0 0 10px rgba(90,255,160,.5)",
          }}
        >
          ▸ LIL_OG_DESKTOP.EXE · {t.hero.avail}
        </p>
      </div>

      {/* ---- Ligne basse : date, mode, invite de défilement ---- */}
      <div className="absolute inset-x-10 bottom-4 z-30 flex items-end justify-between gap-3 md:inset-x-24 md:bottom-9">
        <span className={chip} suppressHydrationWarning>
          <span aria-hidden>📅</span> {date ?? "--- -- ----"}
        </span>

        <a
          href="#slot"
          className={`${MONO} lhz-bounce hidden text-[0.8125rem] font-bold tracking-[0.22em] text-white uppercase transition hover:text-white sm:block`}
          style={{ textShadow: "0 2px 12px rgba(0,0,0,.85)" }}
        >
          {t.home.scroll} ▼
        </a>

        <span className={chip}>
          <span aria-hidden>▶</span> PLAY · AUTO
        </span>
      </div>
    </header>
  );
}
