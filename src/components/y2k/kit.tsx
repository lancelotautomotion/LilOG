/* ============================================================
   Vocabulaire Y2K commun — fenêtres, plastique, scotch
   ------------------------------------------------------------
   Les jetons et briques de fenêtre partagés par les modules de
   l'accueil (CAMCORDER_OS, ARCADE_SLOT, FILE_EXPLORER.SYS,
   README.TXT) et par le catalogue (DIRECTORY_EXPLORER.EXE). Ce
   sont exactement les mêmes
   valeurs que /contact, /faq, /histoire et le pied de page :
   fenêtres bordées #b8b4cc, barre de titre violette avec
   [ _ ] [ 🗖 ] [ ✖ ], jetons « chunky plastic », papier
   millimétré pastel, MONO pour les libellés, LCD pour les
   afficheurs.

   ⚠ PAREFEU : tout est en Tailwind + feuilles locales préfixées
   `lhz-` / `lha-` / `lhf-` / `lhr-`. Aucune classe globale de
   globals.css n'est utilisée, donc aucune autre page ne peut
   être impactée par cette refonte.
   ============================================================ */

/* ---- Jetons « chunky plastic » ---- */
export const PLASTIC =
  "shadow-[inset_0_2px_4px_rgba(255,255,255,0.95),inset_0_-2px_5px_rgba(0,0,0,0.25),0_2px_3px_rgba(30,36,48,0.18)]";
export const PLASTIC_PRESS =
  "active:shadow-[inset_0_3px_6px_rgba(0,0,0,0.32),inset_0_-1px_0_rgba(255,255,255,0.7)] active:scale-95";

/** Surface plastique claire des boutons, reprise telle quelle du reste du site. */
export const PLASTIC_FACE = "bg-[linear-gradient(180deg,#fdfdff_0%,#ebe9f4_48%,#d3d0e1_100%)]";

export const MONO = "font-[family-name:var(--mono)]";
export const LCD = "font-[family-name:var(--font-lcd)]";

/** Le rose de la maison. */
export const PINK = "#d3016d";
/** Sa version néon, réservée aux écrans allumés (hero, CRT de la borne). */
export const NEON = "#ff5ec4";
/** Vert « moniteur » des afficheurs système. */
export const MATRIX = "#5affa0";

export const VIOLET_BAR = "linear-gradient(90deg, #3b1d8f 0%, #7147d4 55%, #a86fe8 100%)";
/** Barre de titre « Notepad » : le navy Windows glisse vers le violet maison. */
export const NAVY_BAR = "linear-gradient(90deg, #000080 0%, #1B48CE 55%, #7147d4 100%)";

/** Quadrillage « papier millimétré » pastel du fond des fenêtres. */
export const GRID_BG: React.CSSProperties = {
  backgroundColor: "#f0f0f5",
  backgroundImage:
    "linear-gradient(rgba(113,71,212,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(113,71,212,0.08) 1px, transparent 1px)",
  backgroundSize: "22px 22px",
};

/** Ombre dure Y2K / web brutalism portée par toutes les fenêtres du site. */
export const HARD_SHADOW = "shadow-[6px_6px_0_rgba(24,12,58,0.55)] md:shadow-[10px_10px_0_rgba(24,12,58,0.55)]";

/**
 * Le décor de fond commun à tout le site — /histoire, /durabilite, /faq,
 * /contact : le léopard rose de la maison en plein cadre, assombri d'un
 * voile noir pour que les fenêtres qui se posent dessus restent lisibles.
 * `fixed` : le décor ne défile pas avec la page, comme sur ces mêmes pages.
 *
 * L'accueil et le catalogue reprennent ce même décor plutôt qu'un fond
 * propre, pour que toutes les pages du site parlent le même langage.
 */
export function LeopardBackdrop() {
  return (
    <>
      <span
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage: "url('/leo.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      <span aria-hidden className="pointer-events-none fixed inset-0 z-0 bg-black/30" />
    </>
  );
}

/**
 * Biseau 3D façon Windows 95 : arête claire en haut à gauche, arête sombre en
 * bas à droite. C'est ce liseré qui fait la barre d'outils « en relief ».
 */
export const BEVEL_OUT =
  "shadow-[inset_1px_1px_0_rgba(255,255,255,0.95),inset_-1px_-1px_0_rgba(90,86,120,0.75),inset_2px_2px_0_rgba(255,255,255,0.55),inset_-2px_-2px_0_rgba(140,136,170,0.5)]";

/** Le même biseau, creusé — pour les zones encastrées (champs, écrans). */
export const BEVEL_IN =
  "shadow-[inset_1px_1px_0_rgba(90,86,120,0.75),inset_-1px_-1px_0_rgba(255,255,255,0.9),inset_2px_2px_4px_rgba(0,0,0,0.18)]";

/* ============================================================
   Briques d'interface
   ============================================================ */

/** Boutons de contrôle de fenêtre  [ _ ] [ 🗖 ] [ ✖ ] */
export function WindowButton({ label, glyph }: { label: string; glyph: string }) {
  return (
    <span
      role="presentation"
      aria-label={label}
      title={label}
      className={`grid h-6 w-7 shrink-0 place-items-center rounded-md border border-[#c6c2d8] ${PLASTIC_FACE} text-[0.7rem] leading-none font-bold text-[#262626] select-none ${PLASTIC}`}
    >
      {glyph}
    </span>
  );
}

/** Le trio complet, aligné à droite de chaque barre de titre. */
export function WindowControls() {
  return (
    <div className="flex shrink-0 items-center gap-1">
      <WindowButton label="Réduire" glyph="_" />
      <WindowButton label="Agrandir" glyph="🗖" />
      <WindowButton label="Fermer" glyph="✖" />
    </div>
  );
}

/**
 * Fenêtre applicative Y2K complète : barre de titre + corps.
 * `bar` permet de passer du violet maison au navy « Notepad ».
 */
export function WindowFrame({
  title,
  icon,
  bar = VIOLET_BAR,
  className = "",
  bodyClassName = "",
  bodyStyle,
  children,
  clip = true,
}: {
  title: string;
  icon?: React.ReactNode;
  bar?: string;
  className?: string;
  bodyClassName?: string;
  bodyStyle?: React.CSSProperties;
  children: React.ReactNode;
  /**
   * `overflow-hidden` sur le cadre — nécessaire pour que la barre de titre
   * (coins carrés) épouse les coins arrondis du cadre. Passe à `false`
   * uniquement si un enfant a besoin d'échapper au cadrage, par exemple un
   * panneau `sticky` : `position: sticky` ne fonctionne pas sous un ancêtre
   * en overflow non-visible, quel qu'il soit. Dans ce cas, la barre de
   * titre est arrondie explicitement (ci-dessous) pour garder le même
   * rendu ; c'est alors à l'appelant d'arrondir de même le dernier bloc de
   * son corps (`rounded-b-2xl`) pour que le bas du cadre reste net.
   */
  clip?: boolean;
}) {
  return (
    <div
      className={`${clip ? "overflow-hidden" : ""} rounded-2xl border-2 border-[#b8b4cc] bg-[#f0f0f5] ${HARD_SHADOW} ${className}`}
    >
      {/* Barre de titre */}
      <div
        className={`flex items-center gap-2 border-b-2 border-[#2a1370] px-2.5 py-2 ${clip ? "" : "rounded-t-2xl"}`}
        style={{ background: bar }}
      >
        {icon && (
          <span aria-hidden className="flex shrink-0 items-center text-[0.9rem] leading-none">
            {icon}
          </span>
        )}
        <span
          className={`${MONO} min-w-0 flex-1 truncate text-[0.62rem] font-bold tracking-[0.12em] text-white uppercase`}
        >
          {title}
        </span>
        <WindowControls />
      </div>

      <div className={bodyClassName} style={bodyStyle}>
        {children}
      </div>
    </div>
  );
}

/** Bandelette de scotch semi-transparente, façon /histoire. */
export function Tape({
  rotate = "-2deg",
  className = "",
  wide = false,
}: {
  rotate?: string;
  className?: string;
  wide?: boolean;
}) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute z-20 border border-[rgba(90,88,80,0.28)] opacity-80 ${
        wide ? "h-[26px] w-[92px]" : "h-[18px] w-[46px]"
      } ${className}`}
      style={{
        transform: `translateX(-50%) rotate(${rotate})`,
        background:
          "repeating-linear-gradient(115deg, rgba(255,255,255,0.16) 0 2px, rgba(0,0,0,0.03) 2px 4px), linear-gradient(100deg, rgba(207,204,194,0.82) 0%, rgba(222,218,208,0.78) 45%, rgba(196,193,183,0.82) 100%)",
        boxShadow: "0 1px 2px rgba(0,0,0,0.18), inset 0 0 3px rgba(255,255,255,0.25)",
      }}
    />
  );
}

/**
 * Étiquette de module — cohérente avec /durabilite et /histoire.
 * `paper` : posée sur une surface claire (papier millimétré, fenêtre).
 * `wallpaper` : posée à même le décor léopard du bureau — texte blanc et
 * ombre dure, comme les titres qui flottent sur les photos du hero.
 */
export function SectionLabel({
  n,
  file,
  tone = "paper",
}: {
  n: string;
  file: string;
  tone?: "paper" | "wallpaper";
}) {
  const wall = tone === "wallpaper";
  return (
    <p
      className={`${MONO} mb-3 text-[0.58rem] font-bold tracking-[0.14em] uppercase ${
        wall ? "text-white" : "text-[#5b2fb8]"
      }`}
      style={wall ? { textShadow: "0 2px 6px rgba(0,0,0,0.85)" } : undefined}
    >
      <span style={{ color: wall ? "#ff9ee4" : PINK }}>▶</span> {n} — {file}
    </p>
  );
}
