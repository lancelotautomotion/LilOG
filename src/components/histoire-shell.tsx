/* ============================================================
   LOUNA_JOURNAL_2000.EXE : /histoire
   ------------------------------------------------------------
   Toute la page vit dans une seule fenêtre applicative Y2K /
   Windows 95, direction "chunky plastic", alignée sur /contact,
   /durabilite et /cgv (mêmes jetons plastique, même quadrillage
   papier millimétré, mêmes pastilles ChromeStar / GemSticker /
   HoloSmiley).

   ⚠ PAREFEU : tout le style vit ici, via Tailwind + une feuille
   locale entièrement préfixée `lj-`. Aucune classe globale de
   globals.css n'est utilisée : les autres pages ne peuvent pas
   être impactées.
   ============================================================ */

import Image from "next/image";
import { PageShell } from "@/components/page-shell";
import { ChromeStar, GemSticker, HoloSmiley } from "@/components/contact/stickers";

/* ---- Jetons "chunky plastic" : identiques à /contact, /durabilite, /cgv ---- */
const PLASTIC =
  "shadow-[inset_0_2px_4px_rgba(255,255,255,0.95),inset_0_-2px_5px_rgba(0,0,0,0.25),0_2px_3px_rgba(30,36,48,0.18)]";

const MONO = "font-[family-name:var(--mono)]";
const LCD = "font-[family-name:var(--font-lcd)]";

const PINK = "#d3016d";

/* Quadrillage "papier millimétré" pastel du fond de fenêtre. */
const GRID_BG = {
  backgroundColor: "#f0f0f5",
  backgroundImage:
    "linear-gradient(rgba(113,71,212,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(113,71,212,0.08) 1px, transparent 1px)",
  backgroundSize: "22px 22px",
};

const VIOLET_BAR = "linear-gradient(90deg, #3b1d8f 0%, #7147d4 45%, #ff3fb0 100%)";

/* ---- Feuille locale : scotch, bob, glow, blink ---- */
const JOURNAL_CSS = `
@keyframes ljBob {
  0%, 100% { transform: translate3d(0,0,0) rotate(var(--r,0deg)) scale(1); }
  50%      { transform: translate3d(0,-8%,0) rotate(calc(var(--r,0deg) + 5deg)) scale(1.05); }
}
.lj-sticker { animation: ljBob 6.8s ease-in-out infinite; filter: drop-shadow(0 3px 4px rgba(30,36,48,.3)); }

@keyframes ljLed {
  0%, 100% { opacity: 1; box-shadow: 0 0 6px rgba(90,255,140,0.9); }
  50%      { opacity: 0.4; box-shadow: 0 0 2px rgba(90,255,140,0.4); }
}
.lj-led { animation: ljLed 2.4s ease-in-out infinite; }

.lj-polaroid { transition: transform 220ms ease, box-shadow 220ms ease; }
.lj-polaroid:hover { transform: rotate(0deg) scale(1.08) !important; box-shadow: 0 12px 26px rgba(0,0,0,0.28); z-index: 30; }

/* Invite à faire défiler la bande de polaroids mobile. */
@keyframes ljSwipe {
  0%, 100% { transform: translateX(0); opacity: 0.55; }
  50%      { transform: translateX(5px); opacity: 1; }
}
.lj-swipe-hint { animation: ljSwipe 1.6s ease-in-out infinite; }

@media (prefers-reduced-motion: reduce) {
  .lj-sticker, .lj-led, .lj-swipe-hint { animation: none !important; }
}
`;

/* ============================================================
   Briques d'interface
   ============================================================ */

/** Boutons de contrôle de fenêtre  [ _ ] [ 🗖 ] [ × ] */
function WindowButton({ label, glyph }: { label: string; glyph: string }) {
  return (
    <span
      role="presentation"
      aria-label={label}
      title={label}
      className={`grid h-6 w-7 shrink-0 place-items-center rounded-md border border-[#c6c2d8] bg-[linear-gradient(180deg,#f6f5fb_0%,#e7e5f1_48%,#d3d0e1_100%)] text-[0.875rem] leading-none font-bold text-[#262626] select-none ${PLASTIC}`}
    >
      {glyph}
    </span>
  );
}

/** Étiquette de module : cohérente avec /durabilite. */
function SectionLabel({ n, file }: { n: string; file: string }) {
  return (
    <p className={`${MONO} mb-3 text-[0.8125rem] font-bold uppercase tracking-[0.14em] text-[#5b2fb8]`}>
      <span style={{ color: PINK }}>▶</span> {n} · {file}
    </p>
  );
}

/** Bandelette de scotch, façon /wishlist mais en jeton local. */
function Tape({ rotate = "-2deg", className = "" }: { rotate?: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute z-20 h-[18px] w-[46px] border border-[rgba(90,88,80,0.28)] opacity-80 ${className}`}
      style={{
        transform: `translateX(-50%) rotate(${rotate})`,
        background:
          "repeating-linear-gradient(115deg, rgba(255,255,255,0.16) 0 2px, rgba(0,0,0,0.03) 2px 4px), linear-gradient(100deg, #cfccc2 0%, #dedad0 45%, #c4c1b7 100%)",
        boxShadow: "0 1px 2px rgba(0,0,0,0.18), inset 0 0 3px rgba(255,255,255,0.25)",
      }}
    />
  );
}

/* ============================================================
   WIDGET APPAREIL PHOTO : Canon digicam + polaroids scotchés
   ============================================================ */

type Polaroid = { src: string; rot: string };

const POLAROIDS: Polaroid[] = [
  { src: "/histoire/look-04.jpg", rot: "-7deg" },
  { src: "/histoire/look-06.jpg", rot: "5deg" },
  { src: "/histoire/look-07.jpg", rot: "-4deg" },
  { src: "/histoire/look-09.jpg", rot: "6deg" },
  { src: "/histoire/look-11.jpg", rot: "-6deg" },
  { src: "/histoire/look-12.jpg", rot: "8deg" },
  { src: "/histoire/look-13.jpg", rot: "-5deg" },
  { src: "/histoire/look-14.jpeg", rot: "4deg" },
  { src: "/histoire/look-15.jpeg", rot: "-7deg" },
  { src: "/histoire/look-16.jpeg", rot: "6deg" },
];

/* Coordonnées de dispersion desktop, en % du conteneur large (960px) :
   un mur de polaroids sur toute la largeur, deux profondeurs par côté
   pour combler l'espace jusqu'au boîtier, qui reste seul au centre. */
const SCATTER: React.CSSProperties[] = [
  { top: "-4%", left: "5%" },
  { top: "16%", left: "-5%" },
  { top: "35%", left: "17%" },
  { top: "54%", left: "-3%" },
  { top: "73%", left: "13%" },
  { top: "-2%", right: "3%" },
  { top: "18%", right: "-6%" },
  { top: "37%", right: "16%" },
  { top: "56%", right: "-4%" },
  { top: "75%", right: "11%" },
];

function PolaroidCard({ p, style, mobile = false }: { p: Polaroid; style?: React.CSSProperties; mobile?: boolean }) {
  return (
    <div
      className={`lj-polaroid ${mobile ? "relative w-[100px] shrink-0" : "absolute w-[124px]"} bg-[#fafafa] p-1.5 pb-3`}
      style={{
        ...style,
        transform: `rotate(${p.rot})`,
        boxShadow: "0 4px 14px rgba(0,0,0,0.22)",
        border: "1px solid #e5e7eb",
      }}
    >
      <Tape rotate={p.rot} className="top-[-9px] left-1/2" />
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#e7e5f1]">
        <Image src={p.src} alt="" fill sizes="120px" className="object-cover" />
      </div>
    </div>
  );
}

function SocialButton({ href, label, hue, children }: { href: string; label: string; hue: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border border-black/10 transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7147d4] ${PLASTIC}`}
      style={{ background: hue, color: "#fff" }}
    >
      {children}
    </a>
  );
}

function PinterestGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden>
      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.995-.285 1.203.6 2.183 1.79 2.183 2.147 0 3.802-2.269 3.802-5.554 0-2.897-2.081-4.925-5.019-4.925-3.421 0-5.428 2.567-5.428 5.222 0 1.024.395 2.128.885 2.729.098.121.112.226.083.343-.09.375-.293 1.197-.334 1.362-.053.219-.174.264-.402.159-1.499-.699-2.436-2.892-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.003 2.35-1.494 3.146 1.126.346 2.317.535 3.55.535 6.625 0 11.99-5.367 11.99-11.987C23.997 5.367 18.632.001 12.017.001Z" />
    </svg>
  );
}

function InstagramGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5.5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="1.05" fill="currentColor" stroke="none" />
    </svg>
  );
}

function CameraWidget() {
  return (
    <section>
      <SectionLabel n="00" file="CANON_DIGICAM.SYS" />
      <div className="relative mx-auto flex flex-col items-center py-[clamp(14px,2.6vw,24px)]">
        {/* Mur de polaroids desktop : couvre toute la largeur de la zone.
            Grille à 3 rangées (libre / boîtier / libre) : la plaque et les
            boutons sociaux se centrent chacun dans leur canal vide, au-dessus
            et en dessous du boîtier, qui reste seul et lisible au centre. */}
        <div className="relative flex w-full max-w-[960px] flex-col items-center gap-3 md:grid md:grid-rows-[1fr_auto_1fr] md:justify-items-center md:gap-0 md:min-h-[clamp(460px,58vw,640px)]">
          <div aria-hidden className="pointer-events-none absolute inset-0 z-20 hidden md:block">
            {POLAROIDS.map((p, i) => (
              <PolaroidCard key={p.src} p={p} style={SCATTER[i]} />
            ))}
          </div>

          {/* Plaque signalétique + LED : centrée dans l'espace libre au-dessus du boîtier. */}
          <div className="relative z-10 flex w-[clamp(220px,26vw,300px)] items-center justify-center md:h-full">
            <div className="flex w-full items-center justify-between rounded-full border border-[#c6c2d8] bg-white/90 px-4 py-1.5 backdrop-blur-[1px]" style={{ boxShadow: "inset 0 1px 2px rgba(255,255,255,0.9), 0 2px 6px rgba(30,36,48,0.16)" }}>
              <span className={`${LCD} text-[1rem] leading-none tracking-[0.06em] text-[#3b1d8f]`}>
                LOUNA.RAW
              </span>
              <span className="flex items-center gap-1.5">
                <span className="lj-led h-1.5 w-1.5 rounded-full bg-[#5aff8c]" aria-hidden />
                <span className={`${MONO} text-[0.8125rem] tracking-[0.1em] text-[#6b6480]`}>REC</span>
              </span>
            </div>
          </div>

          {/* ---- Boîtier plastique bombé 3D ---- */}
          <div
            className={`relative z-10 w-[clamp(220px,26vw,300px)] rounded-[28px] border-2 border-[#b8b4cc] bg-[linear-gradient(160deg,#f4f3fa_0%,#dcd9ea_55%,#c3bfd8_100%)] p-3 ${PLASTIC}`}
          >
            <div
              className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-white"
              style={{ boxShadow: "inset 0 2px 6px rgba(0,0,0,0.18), inset 0 -1px 0 rgba(255,255,255,0.8)" }}
            >
              <Image
                src="/Lou.png"
                alt="Louna Lili Guitton, fondatrice de Lil'OG"
                fill
                sizes="(max-width: 768px) 70vw, 300px"
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Réseaux sociaux : centrés dans l'espace libre en dessous du boîtier. */}
          <div className="relative z-10 flex items-center justify-center gap-4 md:h-full">
            <SocialButton href="https://fr.pinterest.com/lounaliliguitton/" label="Pinterest de Louna" hue="linear-gradient(160deg,#ff2f5e 0%,#c8102e 100%)">
              <PinterestGlyph />
            </SocialButton>
            <SocialButton href="https://www.instagram.com/lounaliliguitton/" label="Instagram de Louna" hue="linear-gradient(160deg,#f9ce34 0%,#ee2a7b 55%,#6228d7 100%)">
              <InstagramGlyph />
            </SocialButton>
          </div>
        </div>

        {/* Bande mobile : les mêmes polaroids en scroll horizontal.
            `pt-5` (au lieu de `pt-2`) : posant `overflow-x: auto`, le
            navigateur force aussi `overflow-y` à se comporter en `auto`
            (les deux axes ne peuvent pas rester dépareillés) — le scotch de
            chaque polaroid, qui déborde de ~9px au-dessus de la carte (plus
            encore une fois tourné), se faisait donc rogner faute de place
            au-dessus. */}
        <div className="mt-6 flex w-full max-w-full gap-4 overflow-x-auto px-2 pt-5 pb-3 md:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {POLAROIDS.map((p) => (
            <PolaroidCard key={p.src} p={p} mobile />
          ))}
        </div>

        {/* Invite à faire défiler, mobile uniquement : sans elle, rien ne
            signale que la bande continue au-delà du bord de l'écran. */}
        <p
          className={`${MONO} lj-swipe-hint mt-1 flex items-center justify-center gap-1.5 text-[0.75rem] font-bold tracking-[0.14em] text-[#6b6480] uppercase md:hidden`}
        >
          Glisse pour voir plus <span aria-hidden>▶</span>
        </p>
      </div>
    </section>
  );
}

/* ============================================================
   BADGES PRESSE : "Backstage Pass" (texte seul, aucun visuel tiers)
   ============================================================ */

type Pass = { icon: string; label: string; hue: string };

const PASSES: Pass[] = [
  { icon: "🏷️", label: "VOGUE_EDITO.PDF", hue: "linear-gradient(135deg,#7147d4 0%,#3b1d8f 100%)" },
  { icon: "🏷️", label: "ELLE_ARABIA.RAW", hue: "linear-gradient(135deg,#d3016d 0%,#8f0148 100%)" },
  { icon: "🏷️", label: "VANITY_FAIR.JPG", hue: "linear-gradient(135deg,#1B48CE 0%,#0c2670 100%)" },
];

function PressPin({ icon, label, hue }: Pass) {
  return (
    <div
      className={`relative flex items-center gap-3 rounded-full border border-black/15 py-2 pr-5 pl-6 ${PLASTIC}`}
      style={{ background: hue }}
    >
      <span
        aria-hidden
        className="absolute top-1/2 -left-1.5 h-3.5 w-3.5 -translate-y-1/2 rounded-full border border-[#c6c2d8] bg-[radial-gradient(circle_at_35%_30%,#fff_0%,#cfccdc_60%,#9d99b3_100%)]"
        style={{ boxShadow: "inset 0 1px 1px rgba(0,0,0,0.3)" }}
      />
      <span className="text-sm leading-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]">{icon}</span>
      <span className={`${MONO} text-[0.875rem] font-bold tracking-[0.06em] whitespace-nowrap text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.4)]`}>
        {label}
      </span>
    </div>
  );
}

function BackstagePass() {
  return (
    <section>
      <SectionLabel n="PRESS" file="BACKSTAGE_PASS.SYS" />
      <div className="flex flex-wrap justify-center gap-4 rounded-2xl border border-[#c6c2d8] bg-white/70 p-[clamp(14px,2.6vw,22px)] backdrop-blur-[1px]">
        {PASSES.map((p) => (
          <PressPin key={p.label} {...p} />
        ))}
      </div>
    </section>
  );
}

/* ============================================================
   SYSTEM_LOGS : parcours narratif en 4 cartes reliées
   ============================================================ */

type LogEntry = {
  n: string;
  file: string;
  era: string;
  paragraphs: React.ReactNode[];
};

function Hi({ children, tone = "pink" }: { children: React.ReactNode; tone?: "pink" | "blue" }) {
  return (
    <mark
      className="rounded-[3px] px-1 py-0.5 font-bold text-inherit"
      style={{ background: tone === "pink" ? "rgba(255,47,151,0.18)" : "rgba(38,163,255,0.18)" }}
    >
      {children}
    </mark>
  );
}

const LOGS: LogEntry[] = [
  {
    n: "01",
    file: "DE LA NORMANDIE AUX PLATEAUX",
    era: "L'ORNE → PARIS",
    paragraphs: [
      <>
        Je m&apos;appelle Louna Lili Guitton. Je suis originaire de <Hi>l&apos;Orne</Hi>, le genre d&apos;endroit où
        tu apprends vite que le style, c&apos;est ce que tu construis toi-même, pas ce que tu trouves au centre
        commercial du coin. Adolescente, la mode était ma fenêtre sur autre chose. Une façon de dire quelque chose
        sans parler.
      </>,
      <>
        Alors j&apos;ai fait mes valises pour <Hi tone="blue">Paris</Hi>.
      </>,
    ],
  },
  {
    n: "02",
    file: "LE LOOKBOOK PRO",
    era: "SHOOTINGS & ÉDITOS",
    paragraphs: [
      <>
        J&apos;ai étudié la mode, j&apos;ai appris le métier, et j&apos;ai eu la chance de travailler avec des
        stars, de signer des éditos pour <Hi>Vogue, Elle Arabia, Vanity Fair</Hi>… J&apos;ai été de l&apos;autre côté
        de l&apos;objectif aussi, photographe pour une marque de prêt-à-porter, parce que la mode, c&apos;est une
        image, un geste, une histoire entière.
      </>,
    ],
  },
  {
    n: "03",
    file: "LE TOURNANT OMAJ",
    era: "OMAJ · 2 ANS",
    paragraphs: [
      <>
        Avant d&apos;embrasser pleinement le métier de styliste, j&apos;ai passé deux ans chez <Hi tone="blue">OMAJ</Hi> à
        plonger dans les coulisses d&apos;une plateforme de seconde main : à expertiser, trier, valoriser des pièces.
        J&apos;y ai vu ce qu&apos;une plateforme peut rater : la curation, le goût, l&apos;exigence éditoriale. Et
        j&apos;y ai surtout compris ce que la seconde main peut être quand elle est traitée avec le même sérieux que
        le neuf.
      </>,
      <>
        Un terrain de jeu incroyable pour qui aime vraiment la mode. Des pièces avec une histoire. Des matières
        qu&apos;on ne fait plus. Des silhouettes que les années 2000 ont inventées et que personne n&apos;a voulu
        oublier.
      </>,
    ],
  },
  {
    n: "04",
    file: "LIL'OG : COMBLER LE VIDE",
    era: "LIL'OG · AUJOURD'HUI",
    paragraphs: [
      <>
        Je cherchais une plateforme qui proposerait une vraie sélection mode : pas des lots, pas du tout-venant, mais
        des pièces choisies avec un œil formé. Des pièces qui ont de la gueule. Qui racontent quelque chose. Qui
        méritent qu&apos;on les remarque.
      </>,
      <>Je ne l&apos;ai pas trouvée. Alors je l&apos;ai créée.</>,
      <>
        <Hi>Lil&apos;OG, c&apos;est la conviction que style et seconde main ne s&apos;opposent pas.</Hi> Que consommer
        mieux ne veut pas dire renoncer à son identité. Et que nous, acteurs de la mode, avons une responsabilité,
        et une chance unique, de montrer que c&apos;est possible. <Hi tone="blue">Une pièce à la fois.</Hi>
      </>,
    ],
  },
];

function LogCard({ log }: { log: LogEntry }) {
  return (
    <div
      className="overflow-hidden rounded-2xl border-2 border-[#b8b4cc] bg-[#eeecf6] shadow-[var(--y2k-win-shadow)]"
      style={{ boxShadow: "inset 0 2px 3px rgba(255,255,255,0.9), inset 0 -3px 6px rgba(0,0,0,0.12), var(--y2k-win-shadow)" }}
    >
      <div className="flex items-center justify-between gap-2 px-4 py-2.5" style={{ background: VIOLET_BAR }}>
        <span className={`${MONO} text-[0.8125rem] font-bold tracking-[0.06em] text-white/85`}>LOG_{log.n}.DAT</span>
        <span className={`${MONO} rounded-full border border-white/40 bg-white/10 px-2 py-0.5 text-[0.8125rem] font-bold tracking-[0.08em] text-white`}>
          {log.era}
        </span>
      </div>
      <div className="p-[clamp(16px,3vw,26px)]" style={GRID_BG}>
        <h3 className={`${LCD} mb-3 text-[clamp(1.3rem,3.4vw,1.8rem)] leading-none tracking-[0.02em] text-[#2a1266] uppercase`}>
          {log.n}. {log.file}
        </h3>
        <div
          className="rounded-xl border border-gray-300 bg-white p-4"
          style={{ boxShadow: "inset 2px 2px 6px rgba(0,0,0,0.14)" }}
        >
          {log.paragraphs.map((p, i) => (
            <p key={i} className={`${MONO} text-[0.9375rem] leading-[1.9] text-[#2b2b33] ${i > 0 ? "mt-3" : ""}`}>
              {p}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

function SystemLogs() {
  return (
    <section>
      <SectionLabel n="01–04" file="SYSTEM_LOGS.DIR" />
      <div className="flex flex-col gap-0">
        {LOGS.map((log, i) => (
          <div key={log.n}>
            {i > 0 && (
              <div className="mx-auto h-7 w-0 border-l-2 border-dashed border-[#7147d4]/45" aria-hidden />
            )}
            <LogCard log={log} />
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============================================================
   Coque principale
   ============================================================ */

export function HistoireShell() {
  return (
    <PageShell>
      <main className="relative px-[clamp(12px,4vw,48px)] pt-[clamp(92px,11vw,132px)] pb-[clamp(24px,4vw,48px)]">
        <style>{JOURNAL_CSS}</style>

        {/* Décor photo, calé sur le viewport (comme /contact, /durabilite). */}
        <span
          aria-hidden
          className="pointer-events-none fixed inset-0 z-0"
          style={{ backgroundImage: "url('/leo.jpeg')", backgroundSize: "cover", backgroundPosition: "center" }}
        />
        <span aria-hidden className="pointer-events-none fixed inset-0 z-0 bg-black/30" />

        <div className="relative z-[1] mx-auto max-w-[1280px]">
          {/* ---- Pastilles décoratives dans les angles ---- */}
          {/* Au premier plan (z-20), mais décalées assez loin verticalement
              pour dégager toute la hauteur de la barre de titre / barre de
              statut : elles chevauchent le bord de la fenêtre, jamais son
              icône ni ses boutons [_][🗖][×]. */}
          <span aria-hidden className="pointer-events-none absolute inset-0 z-20">
            <span
              className="lj-sticker absolute -left-[10px] h-[clamp(34px,5vw,58px)] w-[clamp(34px,5vw,58px)]"
              style={{ ["--r" as string]: "-16deg", top: "calc(-1 * clamp(34px, 5vw, 58px))" }}
            >
              <ChromeStar uid="lj-star-a" />
            </span>
            <span
              className="lj-sticker absolute -right-[10px] h-[clamp(30px,4.4vw,50px)] w-[clamp(30px,4.4vw,50px)]"
              style={{ ["--r" as string]: "14deg", animationDelay: "-2.6s", top: "calc(-1 * clamp(30px, 4.4vw, 50px))" }}
            >
              <HoloSmiley uid="lj-smiley-a" />
            </span>
            <span
              className="lj-sticker absolute -left-[8px] h-[clamp(28px,4vw,46px)] w-[clamp(28px,4vw,46px)]"
              style={{ ["--r" as string]: "10deg", animationDelay: "-4.2s", bottom: "calc(-1 * clamp(28px, 4vw, 46px))" }}
            >
              <GemSticker uid="lj-heart" shape="heart" hue={["#FFC0DF", "#EE4B96", "#B3155A"]} />
            </span>
            <span
              className="lj-sticker absolute -right-[8px] h-[clamp(28px,4vw,46px)] w-[clamp(28px,4vw,46px)]"
              style={{ ["--r" as string]: "-12deg", animationDelay: "-1.1s", bottom: "calc(-1 * clamp(28px, 4vw, 46px))" }}
            >
              <GemSticker uid="lj-star-b" shape="star" hue={["#CFE0FF", "#5C9BFF", "#1B48CE"]} />
            </span>
          </span>

          {/* ================= FENÊTRE PRINCIPALE ================= */}
          <div
            className="relative z-[1] overflow-clip rounded-xl border-2 border-[#b8b4cc] bg-[#e7e5f1] shadow-[var(--y2k-win-shadow)]"
            style={{
              boxShadow: "inset 0 2px 3px rgba(255,255,255,0.9), inset 0 -3px 6px rgba(0,0,0,0.18), var(--y2k-win-shadow)",
            }}
          >
            {/* ---- Barre de titre ---- */}
            <div className="flex items-center justify-between gap-3 px-3 py-2" style={{ background: VIOLET_BAR }}>
              <div className="flex min-w-0 items-center gap-2">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-[4px] bg-white/90 text-[0.875rem] shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.3)]">
                  📓
                </span>
                <h1
                  className={`${MONO} truncate text-[clamp(0.875rem,2.2vw,1rem)] font-bold tracking-[0.05em] text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.45)]`}
                >
                  LOUNA_JOURNAL_2000.EXE
                </h1>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <WindowButton label="Réduire" glyph="_" />
                <WindowButton label="Agrandir" glyph="🗖" />
                <WindowButton label="Fermer" glyph="×" />
              </div>
            </div>

            {/* ---- Corps de la fenêtre : papier millimétré pastel ---- */}
            <div className="p-[clamp(14px,3.4vw,34px)]" style={GRID_BG}>
              {/* ---- Intro ---- */}
              <header
                className="mb-[clamp(16px,2.8vw,26px)] rounded-2xl border border-[#c6c2d8] bg-white/85 p-[clamp(14px,2.6vw,24px)] text-center backdrop-blur-[1px]"
                style={{ boxShadow: "inset 0 2px 3px rgba(255,255,255,0.9), var(--y2k-win-shadow)" }}
              >
                <p className={`${MONO} mb-1 text-[0.8125rem] font-bold tracking-[0.14em] text-[#5b2fb8]`}>
                  C:\LILOG\HISTOIRE\ <span style={{ color: PINK }}>★</span> JOURNAL PERSONNEL
                </p>
                <h2 className={`${LCD} text-[clamp(1.9rem,6vw,3.2rem)] leading-[1.02] tracking-[0.02em] text-[#2a1266] uppercase`}>
                  La mode autrement.
                </h2>
                <p className={`${MONO} mx-auto mt-2 max-w-[62ch] text-[clamp(0.875rem,1.6vw,0.9375rem)] leading-relaxed text-[#4a4560]`}>
                  De l&apos;Orne aux podiums, des plateaux de tournage à la seconde main : le journal de Louna,
                  fondatrice de Lil&apos;OG.
                </p>
              </header>

              <div className="flex flex-col gap-[clamp(18px,3.2vw,32px)]">
                <CameraWidget />
                <BackstagePass />
                <SystemLogs />
              </div>
            </div>

            {/* ---- Barre de statut ---- */}
            <div className="flex items-center justify-between gap-3 border-t-2 border-[#b8b4cc] bg-[#e7e5f1] px-3 py-1.5">
              <span className={`${MONO} truncate text-[0.8125rem] tracking-wider text-[#5a5670]`}>
                <span style={{ color: PINK }}>✦</span> lilog.shop@gmail.com · SIRET 98014870400011
              </span>
              <span className={`${MONO} shrink-0 text-[0.8125rem] tracking-wider text-[#5a5670]`}>
                4 log(s) chargé(s)
              </span>
            </div>
          </div>
        </div>
      </main>
    </PageShell>
  );
}
