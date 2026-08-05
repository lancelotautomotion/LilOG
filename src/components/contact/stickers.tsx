"use client";

/* ============================================================
   Stickers décoratifs Y2K — vocabulaire commun de /contact
   ------------------------------------------------------------
   Ces pastilles vectorielles sont partagées par les disquettes
   d'INFOS_PRATIQUES et par le clapet : c'est ce qui garantit que
   le téléphone et le bas de page portent exactement les mêmes
   bijoux. Style volontairement « plat » (aplats + facettes + un
   liseré clair), à l'opposé des strass photoréalistes.

   ⚠ PAREFEU : aucune classe globale, rien qui sorte de /contact.
   ============================================================ */

/* Étoile à 5 branches, boîte 100 × 100. */
export const STAR_PATH =
  "M50 3 L62.3 33 L94.7 35.5 L70 56.5 L77.6 88 L50 71 L22.4 88 L30 56.5 L5.3 35.5 L37.7 33 Z";

export const HEART_PATH =
  "M50 90 C18 68 6 49 6 33 C6 17 18 8 31 8 C40 8 47 13 50 20 C53 13 60 8 69 8 C82 8 94 17 94 33 C94 49 82 68 50 90 Z";

export const ALIEN_PATH =
  "M50 3 C76 3 94 22 94 44 C94 65 74 96 50 96 C26 96 6 65 6 44 C6 22 24 3 50 3 Z";

/* ---- Pastilles décoratives (gemme / chrome / holographique) ---- */

export function GemSticker({
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

export function ChromeStar({ uid, className = "" }: { uid: string; className?: string }) {
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

export function HoloSmiley({ uid }: { uid: string }) {
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

export function HoloAlien({ uid }: { uid: string }) {
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
