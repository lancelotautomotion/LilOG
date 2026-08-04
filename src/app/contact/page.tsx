"use client";

/* ============================================================
   /contact — LIL_OG_SUPPORT_CENTER.EXE
   Direction artistique Y2K / Windows 95 / Chunky Plastic.

   ⚠ PAREFEU : cette page est 100 % autonome.
   Tout le style vit dans ce fichier via Tailwind (+ quelques
   `style` inline pour les dégradés multiples). AUCUNE classe
   globale de `globals.css` n'est utilisée ni modifiée ici, donc
   aucune autre page du site ne peut être impactée.
   ============================================================ */

import { useState, useTransition } from "react";
import { PageShell } from "@/components/page-shell";
import Y2KPhone from "@/components/contact/Y2KPhone";

/* ---- Jetons « chunky plastic » ----------------------------
   Gardés en constantes pour rester cohérents d'un élément à
   l'autre. Tailwind scanne le texte brut du fichier : les
   classes ci-dessous sont donc bien détectées à la compilation. */
const PLASTIC =
  "shadow-[inset_0_2px_4px_rgba(255,255,255,0.95),inset_0_-2px_5px_rgba(0,0,0,0.25),0_2px_3px_rgba(30,36,48,0.18)]";
const PLASTIC_PRESS =
  "active:shadow-[inset_0_3px_6px_rgba(0,0,0,0.32),inset_0_-1px_0_rgba(255,255,255,0.7)] active:scale-95";
const INSET_FIELD =
  "shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2)] bg-white border border-gray-300 rounded-lg p-3";

const MONO = "font-[family-name:var(--mono)]";

/* Quadrillage discret « papier millimétré » du fond de fenêtre. */
const GRID_BG = {
  backgroundColor: "#f0f0f5",
  backgroundImage:
    "linear-gradient(rgba(113,71,212,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(113,71,212,0.08) 1px, transparent 1px)",
  backgroundSize: "22px 22px",
};

/* ============================================================
   Boutons de contrôle de fenêtre  [ _ ] [ 🗖 ] [ ✖ ]
   ============================================================ */
function WindowButton({ label, glyph }: { label: string; glyph: string }) {
  return (
    <span
      role="presentation"
      aria-label={label}
      title={label}
      className={`grid h-6 w-7 place-items-center rounded-md border border-[#c6c2d8] bg-[linear-gradient(180deg,#f6f5fb_0%,#e7e5f1_48%,#d3d0e1_100%)] text-[0.7rem] leading-none font-bold text-[#262626] select-none ${PLASTIC}`}
    >
      {glyph}
    </span>
  );
}

/* ============================================================
   Colonne « hotline » : le clapet interactif + les raccourcis
   ------------------------------------------------------------
   Le téléphone lui-même vit dans components/contact/Y2KPhone :
   il est construit par-dessus le visuel public/téléphone.png,
   avec une couche de zones cliquables invisibles.
   ============================================================ */

const SHORTCUTS = [
  { icon: "📁", label: "FAQ.DOC", href: "/faq", external: false },
  { icon: "📦", label: "SUIVI_COLIS.EXE", href: "/livraison", external: false },
  {
    icon: "📸",
    label: "INSTAGRAM.LNK",
    href: "https://www.instagram.com/",
    external: true,
  },
];

function HotlineColumn() {
  return (
    <div className="flex w-full flex-col items-center">
      <Y2KPhone />

      {/* ---- Raccourcis « icônes de bureau » ---- */}
      <div className="mt-6 grid w-full max-w-[320px] grid-cols-3 gap-3">
        {SHORTCUTS.map(({ icon, label, href, external }) => (
          <a
            key={label}
            href={href}
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className={`flex flex-col items-center gap-1.5 rounded-xl border border-[#c6c2d8] bg-[linear-gradient(180deg,#fdfdff_0%,#eeecf6_48%,#d8d5e6_100%)] px-1.5 py-3 text-center no-underline transition ${PLASTIC} ${PLASTIC_PRESS} hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7147d4]`}
          >
            <span className="text-[1.5rem] leading-none drop-shadow-[0_2px_2px_rgba(0,0,0,0.25)]">
              {icon}
            </span>
            <span className={`${MONO} text-[0.47rem] leading-tight font-bold break-all text-[#262626]`}>
              {label}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   Disquette 3.5" — réplique fidèle de public/disquettes.png
   ------------------------------------------------------------
   Le boîtier est dessiné en SVG dans un viewBox calqué au pixel
   près sur le visuel de référence (corps 494 × 522, soit les
   proportions réelles d'une 3.5" : 90 × 94 mm). Toutes les cotes
   ci-dessous — rainures de moulage, encoches, obturateur, lucarne,
   flèche d'insertion, logo HD, trous de protection — sont relevées
   sur l'image source.

   L'étiquette reste du HTML posé par-dessus (positionné en %) :
   le texte demeure ainsi sélectionnable, traduisible et il se
   remet en page tout seul quelle que soit sa longueur.

   Les tailles typographiques internes sont exprimées en `cqw`
   (1 % de la largeur du conteneur) : la disquette est donc
   parfaitement homothétique à toutes les tailles d'écran.
   ============================================================ */

type FloppyVariant = "pink" | "purple" | "black";

type FloppySkin = {
  shellTop: string; // dégradé du plastique
  shellMid: string;
  shellBot: string;
  bevel: string; // liseré clair du chant supérieur
  groove: string; // fond sombre des rainures moulées
  window: string; // plastique vu à travers la lucarne de l'obturateur
  ink: string; // flèche + logo HD embossés
  header: string; // bandeau haut de l'étiquette
  rule: string; // filet du bandeau
  title: string;
  paper: string;
  bodyInk: string;
  grain: number; // opacité du grain plastique
  seed: number; // graine de turbulence (grain différent par disquette)
};

const FLOPPY_SKIN: Record<FloppyVariant, FloppySkin> = {
  pink: {
    shellTop: "#F781B4",
    shellMid: "#ED5D93",
    shellBot: "#E24B85",
    bevel: "rgba(255,255,255,0.55)",
    groove: "rgba(105,6,42,0.62)",
    window: "#E85C92",
    ink: "#1B0710",
    header: "#EBDCDF",
    rule: "rgba(0,0,0,0.12)",
    title: "#FF3D8E",
    paper: "#EDECEC",
    bodyInk: "#2B2B2B",
    grain: 0.17,
    seed: 3,
  },
  purple: {
    shellTop: "#A180DF",
    shellMid: "#8765C4",
    shellBot: "#7A55B8",
    bevel: "rgba(255,255,255,0.5)",
    groove: "rgba(40,10,90,0.6)",
    window: "#8967C9",
    ink: "#3D1C8A",
    header: "#DCD6E1",
    rule: "rgba(0,0,0,0.12)",
    title: "#7B4BD6",
    paper: "#EDECEC",
    bodyInk: "#2B2B2B",
    grain: 0.18,
    seed: 11,
  },
  black: {
    shellTop: "#3A3A3A",
    shellMid: "#262626",
    shellBot: "#1B1B1B",
    bevel: "rgba(255,255,255,0.3)",
    groove: "rgba(0,0,0,0.85)",
    window: "#1D1D1E",
    ink: "#131313",
    header: "#262626",
    rule: "rgba(255,255,255,0.14)",
    title: "#FFFFFF",
    paper: "#EDECEC",
    bodyInk: "#2B2B2B",
    grain: 0.15,
    seed: 23,
  },
};

/* Silhouette du boîtier : coins arrondis + biseau haut-droit
   (le détrompeur anti-insertion à l'envers). */
const SHELL_PATH =
  "M12 0 H468 L494 29 V510 Q494 522 482 522 H12 Q0 522 0 510 V12 Q0 0 12 0 Z";

/* Flèche d'insertion (boîte 24 × 39.5, relevée sur la référence). */
const ARROW_PATH =
  "M12 0 L24 28 L18.5 28 L18.5 37.5 Q18.5 39.5 16.5 39.5 L8 39.5 Q6 39.5 6 37.5 L6 28 L0 28 Z";

/* Logo HD : quatre montants + la panse du « D » en anneau (boîte 37 × 37). */
const HD_BARS_PATH =
  "M0 0 H5 V37 H0 Z M6.5 0 H11.5 V37 H6.5 Z" +
  " M13 0 H18 V37 H13 Z M19.5 0 H24.5 V37 H19.5 Z" +
  " M0 15 H24.5 V20 H0 Z";
const HD_BOWL_PATH =
  "M24.5 0 H27.5 A11 18.5 0 0 1 27.5 37 H24.5 Z" +
  " M24.5 6 H27 A6.5 12.5 0 0 1 27 31 H24.5 Z";

/* Étoile à 5 branches, boîte 100 × 100. */
const STAR_PATH =
  "M50 3 L62.3 33 L94.7 35.5 L70 56.5 L77.6 88 L50 71 L22.4 88 L30 56.5 L5.3 35.5 L37.7 33 Z";

const HEART_PATH =
  "M50 90 C18 68 6 49 6 33 C6 17 18 8 31 8 C40 8 47 13 50 20 C53 13 60 8 69 8 C82 8 94 17 94 33 C94 49 82 68 50 90 Z";

const ALIEN_PATH =
  "M50 3 C76 3 94 22 94 44 C94 65 74 96 50 96 C26 96 6 65 6 44 C6 22 24 3 50 3 Z";

/* ---- Pastilles décoratives (gemme / chrome / holographique) ---- */

function GemSticker({
  uid,
  shape,
  hue,
}: {
  uid: string;
  shape: "star" | "heart";
  hue: [string, string, string];
}) {
  const g = `${uid}-gem`;
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <defs>
        <linearGradient id={g} x1="0.15" y1="0" x2="0.85" y2="1">
          <stop offset="0%" stopColor={hue[0]} />
          <stop offset="45%" stopColor={hue[1]} />
          <stop offset="100%" stopColor={hue[2]} />
        </linearGradient>
      </defs>
      <path
        d={shape === "star" ? STAR_PATH : HEART_PATH}
        fill={`url(#${g})`}
        stroke={hue[2]}
        strokeWidth="6"
        strokeLinejoin="round"
      />
      {shape === "star" ? (
        <StarFacets light="#ffd7ea" dark="#5c0026" />
      ) : (
        <g>
          <path
            d="M50 20 C47 13 40 8 31 8 C18 8 6 17 6 33 C6 49 18 68 50 90 Z"
            fill="#fff"
            opacity="0.3"
          />
          <path
            d="M50 20 C53 13 60 8 69 8 C82 8 94 17 94 33 C94 49 82 68 50 90 Z"
            fill="#5c0026"
            opacity="0.22"
          />
          <path
            d="M50 24 C48 18 42 14 34 14 C23 14 13 22 13 34 C13 46 24 62 50 82 Z"
            fill="#fff"
            opacity="0.22"
          />
        </g>
      )}
      {/* Liseré clair : c'est lui qui donne l'effet « plastique bombé ». */}
      <path
        d={shape === "star" ? STAR_PATH : HEART_PATH}
        fill="none"
        stroke="#fff"
        strokeWidth="2.2"
        strokeLinejoin="round"
        opacity="0.5"
      />
      <ellipse cx="36" cy="30" rx="7.5" ry="3.4" fill="#fff" opacity="0.55" transform="rotate(-34 36 30)" />
      <ellipse cx="67" cy="63" rx="4.5" ry="2" fill="#fff" opacity="0.32" transform="rotate(-34 67 63)" />
    </svg>
  );
}

/* Étoile chrome bombée : le volume vient des facettes — pour chaque
   branche, une moitié éclairée et une moitié à l'ombre partant du
   centre — plus un liseré clair sur tout le pourtour. */
const STAR_TIPS: [number, number][] = [
  [50, 3],
  [94.7, 35.5],
  [77.6, 88],
  [22.4, 88],
  [5.3, 35.5],
];
const STAR_NOTCHES: [number, number][] = [
  [62.3, 33],
  [70, 56.5],
  [50, 71],
  [30, 56.5],
  [37.7, 33],
];

function StarFacets({ light, dark }: { light: string; dark: string }) {
  return (
    <g>
      {STAR_TIPS.map(([tx, ty], i) => {
        const [ax, ay] = STAR_NOTCHES[(i + 4) % 5];
        const [bx, by] = STAR_NOTCHES[i];
        return (
          <g key={i}>
            <path d={`M50 50 L${ax} ${ay} L${tx} ${ty} Z`} fill={light} opacity={0.55 - i * 0.07} />
            <path d={`M50 50 L${tx} ${ty} L${bx} ${by} Z`} fill={dark} opacity={0.14 + i * 0.05} />
          </g>
        );
      })}
    </g>
  );
}

function ChromeStar({ uid, className = "" }: { uid: string; className?: string }) {
  const g = `${uid}-chrome`;
  return (
    <svg viewBox="0 0 100 100" className={`h-full w-full ${className}`}>
      <defs>
        <linearGradient id={g} x1="0.12" y1="0" x2="0.88" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="20%" stopColor="#dfe4f4" />
          <stop offset="40%" stopColor="#ffffff" />
          <stop offset="58%" stopColor="#b6b6cc" />
          <stop offset="74%" stopColor="#efe8fb" />
          <stop offset="88%" stopColor="#cfd8ee" />
          <stop offset="100%" stopColor="#a8a8be" />
        </linearGradient>
      </defs>
      <path
        d={STAR_PATH}
        fill={`url(#${g})`}
        stroke="#cbcbdd"
        strokeWidth="6"
        strokeLinejoin="round"
      />
      <StarFacets light="#ffffff" dark="#6f6f8c" />
      <path
        d={STAR_PATH}
        fill="none"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinejoin="round"
        opacity="0.75"
      />
      <ellipse cx="40" cy="30" rx="9" ry="4.5" fill="#fff" opacity="0.85" transform="rotate(-38 40 30)" />
    </svg>
  );
}

function HoloDefs({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={id} x1="0.05" y1="0.1" x2="0.95" y2="0.9">
        <stop offset="0%" stopColor="#cfe0ff" />
        <stop offset="18%" stopColor="#e8d6ff" />
        <stop offset="36%" stopColor="#ffdff0" />
        <stop offset="54%" stopColor="#fdf7dd" />
        <stop offset="72%" stopColor="#d6fbef" />
        <stop offset="88%" stopColor="#d8e2ff" />
        <stop offset="100%" stopColor="#efe4ff" />
      </linearGradient>
      <radialGradient id={`${id}-sheen`} cx="0.32" cy="0.26" r="0.62">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
      </radialGradient>
    </defs>
  );
}

function HoloSmiley({ uid }: { uid: string }) {
  const g = `${uid}-holo`;
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <HoloDefs id={g} />
      <circle cx="50" cy="50" r="46" fill={`url(#${g})`} stroke="#c9c9dd" strokeWidth="2" />
      <circle cx="50" cy="50" r="46" fill={`url(#${g}-sheen)`} />
      <ellipse cx="34" cy="38" rx="7" ry="10.5" fill="#12121a" />
      <ellipse cx="66" cy="38" rx="7" ry="10.5" fill="#12121a" />
      <path
        d="M23 56 Q50 84 77 56"
        fill="none"
        stroke="#12121a"
        strokeWidth="7.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function HoloAlien({ uid }: { uid: string }) {
  const g = `${uid}-holo`;
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <HoloDefs id={g} />
      <path d={ALIEN_PATH} fill={`url(#${g})`} stroke="#c9c9dd" strokeWidth="2" />
      <path d={ALIEN_PATH} fill={`url(#${g}-sheen)`} />
      <ellipse cx="30" cy="54" rx="16" ry="11" fill="#141419" transform="rotate(-26 30 54)" />
      <ellipse cx="70" cy="54" rx="16" ry="11" fill="#141419" transform="rotate(26 70 54)" />
      <ellipse cx="24" cy="48" rx="4.2" ry="2.4" fill="#fff" opacity="0.6" transform="rotate(-26 24 48)" />
      <ellipse cx="64" cy="46" rx="4.2" ry="2.4" fill="#fff" opacity="0.6" transform="rotate(26 64 46)" />
      <path d="M42 78 Q50 84 58 78" fill="none" stroke="#2a2a33" strokeWidth="3.2" strokeLinecap="round" />
    </svg>
  );
}

/* ---- Animations des disquettes ----------------------------
   Injectées via une balise <style> locale et toutes préfixées
   `lilfd-` : rien ne fuit vers globals.css ni vers le reste du
   site. Tout est désactivé si l'utilisateur a demandé moins
   d'animations. */
const FLOPPY_CSS = `
.lilfd{transition:transform .38s cubic-bezier(.2,.8,.3,1),filter .38s ease;
  filter:drop-shadow(0 7px 11px rgba(30,36,48,.26))}
.lilfd:hover{transform:translateY(-9px) rotate(-.5deg);
  filter:drop-shadow(0 20px 24px rgba(30,36,48,.3))}
.lilfd-label{transition:box-shadow .38s ease}
.lilfd:hover .lilfd-label{box-shadow:0 3px 8px rgba(0,0,0,.32),inset 0 1px 0 rgba(255,255,255,.7)}

@keyframes lilfd-bob{
  0%,100%{transform:translate3d(0,0,0) rotate(var(--r,0deg)) scale(1)}
  50%{transform:translate3d(0,-4%,0) rotate(calc(var(--r,0deg) + 5deg)) scale(1.04)}
}
.lilfd-sticker{animation:lilfd-bob 6s ease-in-out infinite;
  filter:drop-shadow(0 2px 3px rgba(0,0,0,.32));
  transition:transform .35s cubic-bezier(.2,.8,.3,1)}
.lilfd-d2{animation-duration:7.2s;animation-delay:-1.6s}
.lilfd-d3{animation-duration:5.4s;animation-delay:-3.1s}
.lilfd-d4{animation-duration:8s;animation-delay:-4.4s}
.lilfd:hover .lilfd-sticker{animation-play-state:paused;
  transform:rotate(var(--r,0deg)) scale(1.16)}

@keyframes lilfd-gleam{from{transform:rotate(14deg) translateX(0)}
  to{transform:rotate(14deg) translateX(900px)}}
.lilfd:hover .lilfd-gleam{opacity:.55;animation:lilfd-gleam 1.05s ease-out}

@media (prefers-reduced-motion: reduce){
  .lilfd,.lilfd-sticker,.lilfd-label{transition:none}
  .lilfd:hover{transform:none}
  .lilfd-sticker,.lilfd:hover .lilfd-gleam{animation:none}
  .lilfd:hover .lilfd-sticker{transform:rotate(var(--r,0deg))}
}
`;

/* ---- Disquette ---- */

function Floppy({
  variant,
  name,
  text,
}: {
  variant: FloppyVariant;
  name: string;
  text: string;
}) {
  const s = FLOPPY_SKIN[variant];
  const uid = `fd-${variant}`;

  return (
    <div
      className="lilfd group relative mx-auto w-full max-w-[340px]"
      style={{ containerType: "inline-size" }}
    >
      {/* ---------- Boîtier ---------- */}
      <svg
        viewBox="0 0 494 522"
        className="lilfd-shell block w-full"
        role="presentation"
        aria-hidden="true"
      >
        <defs>
          <clipPath id={`${uid}-clip`}>
            <path d={SHELL_PATH} />
          </clipPath>

          <linearGradient id={`${uid}-shell`} x1="0.1" y1="0" x2="0.55" y2="1">
            <stop offset="0%" stopColor={s.shellTop} />
            <stop offset="28%" stopColor={s.shellMid} />
            <stop offset="100%" stopColor={s.shellBot} />
          </linearGradient>

          {/* Obturateur métal : dégradé relevé sur la référence (233 → 198). */}
          <linearGradient id={`${uid}-metal`} x1="0" y1="0" x2="0.25" y2="1">
            <stop offset="0%" stopColor="#EDEDEC" />
            <stop offset="22%" stopColor="#E1E1E0" />
            <stop offset="58%" stopColor="#CFCFCE" />
            <stop offset="100%" stopColor="#C4C4C3" />
          </linearGradient>

          {/* Grain « plastique moulé » : turbulence + seuillage en bandes,
              ce qui recrée les volutes gravées du visuel d'origine. */}
          <filter id={`${uid}-grain`} x="0" y="0" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.085"
              numOctaves="2"
              seed={s.seed}
              result="t"
            />
            <feColorMatrix
              in="t"
              type="matrix"
              values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  1 0 0 0 0"
              result="a"
            />
            <feComponentTransfer in="a">
              <feFuncA type="table" tableValues="0 1 0 1 0 1 0" />
            </feComponentTransfer>
          </filter>

          <filter id={`${uid}-brushed`} x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9 0.14" numOctaves="2" seed="5" result="t" />
            <feColorMatrix
              in="t"
              type="matrix"
              values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0.5 0 0 0 0"
            />
          </filter>

          <linearGradient id={`${uid}-sweep`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#fff" stopOpacity="0" />
            <stop offset="50%" stopColor="#fff" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>

        <g clipPath={`url(#${uid}-clip)`}>
          {/* Plastique */}
          <rect width="494" height="522" fill={`url(#${uid}-shell)`} />

          {/* Volutes gravées : une passe creuse + une passe en relief. */}
          <g style={{ mixBlendMode: "multiply" }} opacity={s.grain}>
            <rect width="494" height="522" filter={`url(#${uid}-grain)`} />
          </g>
          <g style={{ mixBlendMode: "screen" }} opacity={s.grain * 0.55} transform="translate(-1.2,-1.2)">
            <rect width="494" height="522" filter={`url(#${uid}-grain)`} />
          </g>

          {/* Rainures de moulage verticales (relevées à x = 50 et x = 445) */}
          <rect x="47.5" y="0" width="3" height="522" fill={s.groove} opacity="0.75" />
          <rect x="50.5" y="0" width="1.6" height="522" fill="#fff" opacity="0.3" />
          <rect x="443.5" y="0" width="2.6" height="522" fill={s.groove} opacity="0.7" />
          <rect x="446" y="0" width="1.6" height="522" fill="#fff" opacity="0.28" />

          {/* Contour du logement d'obturateur (rainure en L) */}
          <path
            d="M49 0 V152 Q49 168 65 168 H385"
            fill="none"
            stroke={s.groove}
            strokeWidth="2.6"
            opacity="0.7"
          />
          <path
            d="M52 0 V152 Q52 171 68 171 H385"
            fill="none"
            stroke="#fff"
            strokeWidth="1.6"
            opacity="0.26"
          />

          {/* Petites encoches du chant supérieur */}
          <rect x="52" y="0" width="19" height="6" fill="#fff" opacity="0.28" />
          <rect x="52" y="5.4" width="19" height="1.4" fill={s.groove} opacity="0.55" />
          <rect x="390" y="0" width="50" height="6" fill="#fff" opacity="0.24" />
          <rect x="390" y="5.4" width="50" height="1.4" fill={s.groove} opacity="0.5" />

          {/* Flèche d'insertion embossée
              (relevé : pointe à 25.5/31.5, base de tête à y=59.5,
              hampe de 12.5 de large jusqu'à y=71) */}
          <g transform="translate(13.5,31.5)">
            <path
              d={ARROW_PATH}
              fill="none"
              stroke="#fff"
              strokeWidth="2"
              opacity="0.34"
              transform="translate(0.8,1.6)"
            />
            <path d={ARROW_PATH} fill={s.ink} opacity="0.94" />
          </g>

          {/* Logo « HD » haute densité, embossé dans le plastique */}
          <g transform="translate(413.5,37.5)">
            <g transform="translate(0.8,1.6)" fill="none" stroke="#fff" opacity="0.3">
              <path d={HD_BARS_PATH} fill="#fff" stroke="none" />
              <path d={HD_BOWL_PATH} fill="#fff" fillRule="evenodd" stroke="none" />
            </g>
            <g fill={s.ink} opacity="0.94">
              <path d={HD_BARS_PATH} />
              <path d={HD_BOWL_PATH} fillRule="evenodd" />
            </g>
          </g>

          {/* ---------- Obturateur métallique ---------- */}
          <g>
            <path
              d="M122 -4 H383 V158 Q383 168 373 168 H132 Q122 168 122 158 Z"
              fill={`url(#${uid}-metal)`}
            />
            <g clipPath={`url(#${uid}-clip)`} opacity="0.5" style={{ mixBlendMode: "overlay" }}>
              <path
                d="M122 -4 H383 V158 Q383 168 373 168 H132 Q122 168 122 158 Z"
                filter={`url(#${uid}-brushed)`}
              />
            </g>
            {/* chants */}
            <rect x="122" y="0" width="261" height="1.6" fill="#fff" opacity="0.75" />
            <rect x="122" y="0" width="1.6" height="166" fill="#fff" opacity="0.5" />
            <path
              d="M122 166 H383"
              stroke="rgba(0,0,0,0.35)"
              strokeWidth="3"
              fill="none"
            />
            <path
              d="M122 169.5 H385"
              stroke="rgba(0,0,0,0.22)"
              strokeWidth="3"
              fill="none"
            />

            {/* Lucarne : on voit le plastique du boîtier au travers */}
            <g>
              <rect x="275" y="18" width="67" height="140" rx="7" fill={s.window} />
              <rect
                x="275"
                y="18"
                width="67"
                height="140"
                rx="7"
                fill="none"
                stroke="rgba(0,0,0,0.45)"
                strokeWidth="2.4"
              />
              <rect x="277" y="20" width="63" height="11" rx="5" fill="rgba(0,0,0,0.13)" />
            </g>

            {/* Sérigraphie technique */}
            <g fill="#111" fontFamily="Arial, Helvetica, sans-serif" fontWeight="700">
              <text x="136" y="72" fontSize="13" textLength="80" lengthAdjust="spacingAndGlyphs">
                FORMATTED
              </text>
              <text x="136" y="103" fontSize="12" textLength="45" lengthAdjust="spacingAndGlyphs">
                1.44MB
              </text>
              <text x="136" y="127" fontSize="14" textLength="91.5" lengthAdjust="spacingAndGlyphs">
                HIGH DENSITY
              </text>
              <text x="136" y="149" fontSize="25" textLength="122.5" lengthAdjust="spacingAndGlyphs">
                MFD-2HD
              </text>
            </g>
          </g>

          {/* Trous de protection en écriture / haute densité */}
          {[16, 458].map((x) => (
            <g key={x}>
              <rect x={x} y="466" width="20" height="20" rx="1.5" fill="#DCDBE0" />
              <path
                d={`M${x} 486 V466 H${x + 20}`}
                fill="none"
                stroke="rgba(0,0,0,0.45)"
                strokeWidth="2.4"
              />
              <path
                d={`M${x} 486 H${x + 20} V466`}
                fill="none"
                stroke="rgba(255,255,255,0.5)"
                strokeWidth="1.6"
              />
            </g>
          ))}

          {/* Logement de l'étiquette (l'étiquette elle-même est en HTML) */}
          <rect
            x="49"
            y="210"
            width="397"
            height="300"
            rx="13"
            fill="none"
            stroke={s.groove}
            strokeWidth="2.6"
            opacity="0.6"
          />

          {/* Chant supérieur + ombrage interne du boîtier */}
          <path d={SHELL_PATH} fill="none" stroke={s.bevel} strokeWidth="2" />
          <path
            d={SHELL_PATH}
            fill="none"
            stroke="rgba(0,0,0,0.28)"
            strokeWidth="2.4"
            transform="translate(0,3)"
          />

          {/* Éclat qui balaie le plastique au survol */}
          <rect
            className="lilfd-gleam"
            x="-260"
            y="-120"
            width="150"
            height="780"
            fill={`url(#${uid}-sweep)`}
            opacity="0"
            transform="rotate(14 247 261)"
          />
        </g>
      </svg>

      {/* ---------- Étiquette (HTML) ---------- */}
      <div
        className="lilfd-label absolute flex flex-col overflow-hidden"
        style={{
          left: "10.53%",
          right: "9.92%",
          top: "40.8%",
          bottom: "2.68%",
          borderRadius: "clamp(3px,1.7cqw,9px)",
          background: s.paper,
          boxShadow:
            "0 1px 3px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.65)",
        }}
      >
        <div className="relative shrink-0" style={{ height: "24.4%", background: s.header }}>
          <div
            className="absolute inset-x-0"
            style={{ top: "30%", height: 1, background: s.rule }}
          />
          <div
            className={`${MONO} absolute inset-x-0 bottom-0 top-[30%] flex items-center justify-center px-[6%] text-center font-bold`}
            style={{ color: s.title, fontSize: "4.55cqw", letterSpacing: "0.085em" }}
          >
            {name}
          </div>
        </div>
        <div className="flex flex-1 items-center px-[7.5%]">
          <p
            className={MONO}
            style={{ color: s.bodyInk, fontSize: "3.85cqw", lineHeight: 1.78 }}
          >
            {text}
          </p>
        </div>
      </div>

      {/* ---------- Pastilles ---------- */}
      {variant === "pink" && (
        <>
          <div
            className="lilfd-sticker absolute"
            style={{ left: "2.6%", top: "32.2%", width: "15.6%", aspectRatio: "1", ["--r" as string]: "-14deg" }}
          >
            <GemSticker uid={`${uid}-a`} shape="star" hue={["#FFB3D6", "#F0509A", "#B7175C"]} />
          </div>
          <div
            className="lilfd-sticker lilfd-d2 absolute"
            style={{ left: "76.5%", top: "81%", width: "16.2%", aspectRatio: "1", ["--r" as string]: "10deg" }}
          >
            <GemSticker uid={`${uid}-b`} shape="heart" hue={["#FFC0DF", "#EE4B96", "#B3155A"]} />
          </div>
        </>
      )}

      {variant === "purple" && (
        <>
          {/* Grappe d'étoiles chrome — positions relevées sur la référence */}
          <div
            className="absolute"
            style={{ left: "80.5%", top: "22.9%", width: "17.7%", aspectRatio: "0.847" }}
          >
            <div className="lilfd-sticker absolute" style={{ left: "22.9%", top: "0%", width: "55.2%", aspectRatio: "1", ["--r" as string]: "14deg" }}>
              <ChromeStar uid={`${uid}-s1`} />
            </div>
            <div className="lilfd-sticker lilfd-d2 absolute" style={{ left: "0%", top: "39.5%", width: "34.9%", aspectRatio: "1", ["--r" as string]: "-20deg" }}>
              <ChromeStar uid={`${uid}-s2`} />
            </div>
            <div className="lilfd-sticker lilfd-d3 absolute" style={{ left: "46.3%", top: "53.2%", width: "53.7%", aspectRatio: "1", ["--r" as string]: "-6deg" }}>
              <ChromeStar uid={`${uid}-s3`} />
            </div>
            <div className="lilfd-sticker lilfd-d4 absolute" style={{ left: "2.9%", top: "72.6%", width: "36.2%", aspectRatio: "1", ["--r" as string]: "10deg" }}>
              <ChromeStar uid={`${uid}-s4`} />
            </div>
          </div>
          <div
            className="lilfd-sticker lilfd-d3 absolute"
            style={{ left: "3.4%", top: "83%", width: "16.2%", aspectRatio: "1", ["--r" as string]: "-10deg" }}
          >
            <HoloSmiley uid={`${uid}-sm`} />
          </div>
        </>
      )}

      {variant === "black" && (
        <>
          <div
            className="lilfd-sticker absolute"
            style={{ left: "83%", top: "24.5%", width: "19.2%", aspectRatio: "1", ["--r" as string]: "8deg" }}
          >
            <HoloAlien uid={`${uid}-al`} />
          </div>
          <div
            className="lilfd-sticker lilfd-d2 absolute"
            style={{ left: "8.1%", top: "84.9%", width: "12.6%", aspectRatio: "1", ["--r" as string]: "-16deg" }}
          >
            <ChromeStar uid={`${uid}-cs`} />
          </div>
        </>
      )}
    </div>
  );
}

/* ============================================================
   Page
   ============================================================ */

const SUBJECTS = [
  { id: "commande", label: "🎰 Commande" },
  { id: "taille", label: "📏 Conseil Taille" },
  { id: "papotage", label: "💌 Papotage" },
];

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [subjectError, setSubjectError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Les pastilles ne sont pas un <input> : on valide l'objet à la main
    // plutôt que via un champ caché `required`, dont la bulle de validation
    // native serait ancrée à un élément invisible (donc jamais affichée).
    if (!subject) {
      setSubjectError(true);
      return;
    }
    setSubjectError(false);
    startTransition(async () => {
      await new Promise((r) => setTimeout(r, 600));
      setSent(true);
    });
  };

  return (
    <PageShell>
      <main className="px-[clamp(12px,4vw,48px)] pt-[clamp(92px,11vw,132px)] pb-[clamp(48px,8vw,100px)]">
        {/* ================= FENÊTRE WINDOWS 95 ================= */}
        <div
          className="mx-auto max-w-[1180px] overflow-hidden rounded-xl border-2 border-[#b8b4cc] bg-[#e7e5f1]"
          style={{
            boxShadow:
              "inset 0 2px 3px rgba(255,255,255,0.9), inset 0 -3px 6px rgba(0,0,0,0.18), 0 14px 30px rgba(30,36,48,0.28)",
          }}
        >
          {/* ---- Barre de titre ---- */}
          <div
            className="flex items-center justify-between gap-3 px-3 py-2"
            style={{
              background:
                "linear-gradient(90deg, #3b1d8f 0%, #7147d4 55%, #a86fe8 100%)",
            }}
          >
            <div className="flex min-w-0 items-center gap-2">
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-[4px] bg-white/85 text-[0.65rem] shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.3)]">
                ☎
              </span>
              <h1
                className={`${MONO} truncate text-[clamp(0.62rem,2.1vw,0.9rem)] font-bold tracking-[0.05em] text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.45)]`}
              >
                LIL_OG_SUPPORT_CENTER.EXE
              </h1>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <WindowButton label="Réduire" glyph="_" />
              <WindowButton label="Agrandir" glyph="🗖" />
              <WindowButton label="Fermer" glyph="✖" />
            </div>
          </div>

          {/* ---- Corps de la fenêtre ---- */}
          <div
            className="p-[clamp(14px,3vw,32px)]"
            style={GRID_BG}
          >
            {/* ============ 2 COLONNES ============ */}
            <div className="grid grid-cols-1 items-start gap-[clamp(20px,3vw,32px)] lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">

              {/* ---------- COLONNE GAUCHE ---------- */}
              <section aria-label="Hotline Lil'OG" className="w-full justify-self-center lg:justify-self-start">
                <HotlineColumn />
              </section>

              {/* ---------- COLONNE DROITE ---------- */}
              <section
                aria-label="Formulaire de contact"
                className="overflow-hidden rounded-xl border border-[#c6c2d8] bg-white/85 backdrop-blur-[1px]"
                style={{
                  boxShadow:
                    "inset 0 2px 3px rgba(255,255,255,0.9), 0 6px 14px rgba(30,36,48,0.14)",
                }}
              >
                <div
                  className="px-3 py-2"
                  style={{
                    background:
                      "linear-gradient(90deg, #5b2fb8 0%, #7147d4 60%, #b184ee 100%)",
                  }}
                >
                  <h2
                    className={`${MONO} text-[0.72rem] font-bold tracking-[0.05em] text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.4)]`}
                  >
                    SEND_MESSAGE.SYS ★
                  </h2>
                </div>

                <div className="p-[clamp(14px,2.4vw,24px)]">
                  {sent ? (
                    <div
                      className={`${MONO} rounded-lg border border-purple-200 bg-purple-50 px-4 py-8 text-center text-[0.75rem] leading-relaxed text-purple-800`}
                    >
                      <div className="mb-2 text-[1.6rem]">💌</div>
                      ★ MESSAGE TRANSMIS !<br />
                      On te répond très vite. ♡
                    </div>
                  ) : (
                    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="flex flex-col gap-1.5">
                          <label
                            className={`${MONO} text-[0.55rem] font-bold tracking-[0.08em] text-[#5b2fb8]`}
                            htmlFor="contact-name"
                          >
                            NOM / PRÉNOM
                          </label>
                          <input
                            id="contact-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            placeholder="Ton petit nom"
                            className={`${INSET_FIELD} ${MONO} w-full text-[0.72rem] text-[#1E2430] outline-none placeholder:text-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-300/50`}
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label
                            className={`${MONO} text-[0.55rem] font-bold tracking-[0.08em] text-[#5b2fb8]`}
                            htmlFor="contact-email"
                          >
                            EMAIL
                          </label>
                          <input
                            id="contact-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="toi@mail.com"
                            className={`${INSET_FIELD} ${MONO} w-full text-[0.72rem] text-[#1E2430] outline-none placeholder:text-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-300/50`}
                          />
                        </div>
                      </div>

                      {/* ---- Sélecteur d'objet : pastilles plastique ---- */}
                      <fieldset className="flex flex-col gap-2">
                        <legend
                          className={`${MONO} mb-1 text-[0.55rem] font-bold tracking-[0.08em] text-[#5b2fb8]`}
                        >
                          OBJET DU MESSAGE
                        </legend>
                        <div className="flex flex-wrap gap-2">
                          {SUBJECTS.map(({ id, label }) => {
                            const on = subject === id;
                            return (
                              <button
                                key={id}
                                type="button"
                                aria-pressed={on}
                                onClick={() => {
                                  setSubject(id);
                                  setSubjectError(false);
                                }}
                                className={`${MONO} rounded-full border px-4 py-2 text-[0.62rem] font-bold transition ${PLASTIC_PRESS} hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7147d4] ${
                                  on
                                    ? "border-purple-700 bg-purple-600 text-white shadow-[inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-2px_5px_rgba(0,0,0,0.3),0_2px_4px_rgba(80,30,140,0.35)]"
                                    : `border-[#c6c2d8] bg-[linear-gradient(180deg,#fdfdff_0%,#ebe9f4_48%,#d3d0e1_100%)] text-[#262626] ${PLASTIC}`
                                }`}
                              >
                                {on ? "◉" : "○"} {label}
                              </button>
                            );
                          })}
                        </div>
                        {subjectError && (
                          <p
                            role="alert"
                            className={`${MONO} mt-0.5 text-[0.55rem] font-bold tracking-wide text-rose-600`}
                          >
                            ⚠ CHOISIS UN OBJET POUR CONTINUER
                          </p>
                        )}
                      </fieldset>

                      <div className="flex flex-col gap-1.5">
                        <label
                          className={`${MONO} text-[0.55rem] font-bold tracking-[0.08em] text-[#5b2fb8]`}
                          htmlFor="contact-msg"
                        >
                          TON MESSAGE
                        </label>
                        <textarea
                          id="contact-msg"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          required
                          rows={6}
                          placeholder="Raconte-nous tout…"
                          className={`${INSET_FIELD} ${MONO} w-full resize-y text-[0.72rem] leading-relaxed text-[#1E2430] outline-none placeholder:text-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-300/50`}
                        />
                      </div>

                      {/* ---- Bouton chunky plastic ---- */}
                      <button
                        type="submit"
                        disabled={isPending}
                        className={`${MONO} mt-1 w-full rounded-full bg-purple-600 p-4 text-[0.7rem] font-bold tracking-[0.04em] text-white shadow-[inset_0_2px_4px_rgba(255,255,255,0.7),0_4px_6px_rgba(0,0,0,0.15)] transition hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7147d4]`}
                      >
                        {isPending
                          ? "[ ⏳ TRANSMISSION_EN_COURS… ]"
                          : "[ ✉️ TRANSMETTRE_LE_MESSAGE.EXE ]"}
                      </button>
                    </form>
                  )}
                </div>
              </section>
            </div>

            {/* ============ DISQUETTES 3.5" ============ */}
            <div className="mt-[clamp(24px,4vw,40px)]">
              <style>{FLOPPY_CSS}</style>
              <div className={`${MONO} mb-3 flex items-center gap-2 text-[0.58rem] font-bold tracking-[0.08em] text-[#5b2fb8]`}>
                <span className="h-px flex-1 bg-[#5b2fb8]/20" />
                💾 INFOS_PRATIQUES
                <span className="h-px flex-1 bg-[#5b2fb8]/20" />
              </div>
              <div className="grid grid-cols-1 gap-[clamp(14px,2.4vw,26px)] sm:grid-cols-2 lg:grid-cols-3">
                <Floppy
                  variant="pink"
                  name="LIVRAISON.DOC"
                  text="Expédition sous 24/48h. Numéro de suivi envoyé par email dès le départ du colis."
                />
                <Floppy
                  variant="purple"
                  name="RETOURS.SYS"
                  text="14 jours pour changer d'avis. Article non porté, non lavé, étiquette d'origine."
                />
                <Floppy
                  variant="black"
                  name="PAIEMENT.EXE"
                  text="Transactions 100% cryptées. CB, Apple Pay et PayPal acceptés en toute sécurité."
                />
              </div>
            </div>
          </div>

          {/* ---- Barre de statut ---- */}
          <div className="flex items-center justify-between gap-3 border-t-2 border-[#b8b4cc] bg-[#e7e5f1] px-3 py-1.5">
            <span className={`${MONO} truncate text-[0.5rem] tracking-wider text-[#5a5670]`}>
              ✦ hellolilG@gmail.com — Lun-Ven 10h/18h
            </span>
            <span className={`${MONO} shrink-0 text-[0.5rem] tracking-wider text-[#5a5670]`}>
              3 objet(s) — 1.44 Mo
            </span>
          </div>
        </div>
      </main>
    </PageShell>
  );
}
