"use client";

/* ============================================================
   RESCUE_MODE_2000.EXE — /durabilite
   ------------------------------------------------------------
   Toute la page vit dans une seule fenêtre applicative Y2K /
   Windows 95, direction "chunky plastic", strictement alignée
   sur le vocabulaire de /contact et de DocCenter (mêmes jetons
   plastique, même quadrillage papier millimétré, mêmes pastilles
   ChromeStar / GemSticker / HoloSmiley).

   ⚠ PAREFEU : tout le style vit ici, via Tailwind + une feuille
   locale entièrement préfixée `durab-`. Aucune classe globale de
   globals.css n'est utilisée : les autres pages ne peuvent pas
   être impactées.
   ============================================================ */

import { useEffect, useRef, useState } from "react";
import { PageShell } from "@/components/page-shell";
import { ChromeStar, GemSticker, HoloSmiley } from "@/components/contact/stickers";

/* ---- Jetons "chunky plastic" — identiques à /contact et DocCenter ---- */
const PLASTIC =
  "shadow-[inset_0_2px_4px_rgba(255,255,255,0.95),inset_0_-2px_5px_rgba(0,0,0,0.25),0_2px_3px_rgba(30,36,48,0.18)]";
const PLASTIC_PRESS =
  "active:shadow-[inset_0_3px_6px_rgba(0,0,0,0.32),inset_0_-1px_0_rgba(255,255,255,0.7)] active:scale-95";

const MONO = "font-[family-name:var(--mono)]";
const LCD = "font-[family-name:var(--font-lcd)]";

/* Le rose maison : tous les petits accents roses passent par lui. */
const PINK = "#d3016d";

/* Quadrillage "papier millimétré" pastel du fond de fenêtre. */
const GRID_BG = {
  backgroundColor: "#f0f0f5",
  backgroundImage:
    "linear-gradient(rgba(113,71,212,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(113,71,212,0.08) 1px, transparent 1px)",
  backgroundSize: "22px 22px",
};

const VIOLET_BAR = "linear-gradient(90deg, #3b1d8f 0%, #7147d4 55%, #a86fe8 100%)";
const DANGER_BAR = "linear-gradient(100deg, #1c1216 0%, #4a1116 45%, #c81e3a 100%)";
const WIN_BAR = "linear-gradient(100deg, #0f5c3d 0%, #1fae6b 45%, #7147d4 100%)";

/* ---- Feuille locale : clignotements, glow, scanline, pastilles ---- */
const RESCUE_CSS = `
@keyframes durabBlinkRed {
  0%, 100% { opacity: 1; filter: brightness(1); }
  50%      { opacity: 0.62; filter: brightness(1.35); }
}
.durab-blink-red { animation: durabBlinkRed 1.3s ease-in-out infinite; }

@keyframes durabGlowGreen {
  0%, 100% { box-shadow: 0 0 8px rgba(90,255,160,0.55), inset 0 0 10px rgba(90,255,160,0.35); }
  50%      { box-shadow: 0 0 20px rgba(90,255,160,0.9), inset 0 0 18px rgba(90,255,160,0.55); }
}
.durab-glow-green { animation: durabGlowGreen 1.7s ease-in-out infinite; }

.durab-text-glow-green { text-shadow: 0 0 6px rgba(38,255,141,0.85), 0 0 18px rgba(38,255,141,0.45); }
.durab-text-glow-pink { text-shadow: 0 0 6px rgba(255,47,151,0.85), 0 0 18px rgba(255,47,151,0.45); }

@keyframes durabScan {
  0%   { transform: translateY(-120%); }
  100% { transform: translateY(220%); }
}
.durab-counter-scan { position: relative; }
.durab-counter-scan::after {
  content: "";
  position: absolute;
  left: 0; right: 0;
  height: 30%;
  background: linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.16) 50%, transparent 100%);
  animation: durabScan 3.4s linear infinite;
  pointer-events: none;
}

@keyframes durabBob {
  0%, 100% { transform: translate3d(0,0,0) rotate(var(--r,0deg)) scale(1); }
  50%      { transform: translate3d(0,-9%,0) rotate(calc(var(--r,0deg) + 6deg)) scale(1.06); }
}
.durab-sticker { animation: durabBob 6.4s ease-in-out infinite; filter: drop-shadow(0 3px 4px rgba(30,36,48,.3)); }

@keyframes durabCursor {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0; }
}
.durab-cursor { animation: durabCursor 800ms step-end infinite; }

@keyframes durabPop {
  0%   { opacity: 0; transform: translateY(6px) scale(0.7) rotate(-6deg); }
  60%  { opacity: 1; transform: translateY(-3px) scale(1.08) rotate(3deg); }
  100% { opacity: 1; transform: translateY(0) scale(1) rotate(-4deg); }
}
.durab-pop { animation: durabPop 320ms cubic-bezier(.2,1.4,.4,1) both; }

@media (prefers-reduced-motion: reduce) {
  .durab-blink-red, .durab-glow-green, .durab-counter-scan::after,
  .durab-sticker, .durab-cursor, .durab-pop { animation: none !important; }
}
`;

/* ============================================================
   Briques d'interface
   ============================================================ */

/** Boutons de contrôle de fenêtre  [ _ ] [ 🗖 ] [ ✖ ] */
function WindowButton({ label, glyph }: { label: string; glyph: string }) {
  return (
    <span
      role="presentation"
      aria-label={label}
      title={label}
      className={`grid h-6 w-7 shrink-0 place-items-center rounded-md border border-[#c6c2d8] bg-[linear-gradient(180deg,#f6f5fb_0%,#e7e5f1_48%,#d3d0e1_100%)] text-[0.7rem] leading-none font-bold text-[#262626] select-none ${PLASTIC}`}
    >
      {glyph}
    </span>
  );
}

/** Icône pixel art planète + recyclage, dessinée en <rect> (pas de raster). */
const PX_SIZE = 12;
const PX_CENTER = 5.5;
const PX_RADIUS = 5.5;
const PX_LAND = new Set([
  "4,2", "5,2", "6,2", "3,3", "4,3", "7,4", "8,4", "9,5",
  "3,7", "4,7", "5,8", "6,8", "3,8",
]);

function PixelPlanet({ className = "" }: { className?: string }) {
  const cells: React.ReactNode[] = [];
  for (let y = 0; y < PX_SIZE; y++) {
    for (let x = 0; x < PX_SIZE; x++) {
      const dx = x - PX_CENTER;
      const dy = y - PX_CENTER;
      const d = Math.hypot(dx, dy);
      if (d > PX_RADIUS) continue;
      const isLand = PX_LAND.has(`${x},${y}`);
      const isHi = d < PX_RADIUS - 3.4 && x <= PX_CENTER - 1 && y <= PX_CENTER - 1;
      cells.push(
        <rect
          key={`${x}-${y}`}
          x={x}
          y={y}
          width={1.02}
          height={1.02}
          fill={isLand ? "#2fae62" : isHi ? "#8fe2ff" : "#1e6fd9"}
        />
      );
    }
  }
  return (
    <svg viewBox={`0 0 ${PX_SIZE} ${PX_SIZE}`} shapeRendering="crispEdges" className={className} aria-hidden>
      {cells}
    </svg>
  );
}

function TitleIcon() {
  return (
    <span className="relative grid h-6 w-6 shrink-0 place-items-center rounded-[4px] bg-white/90 shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.3)]">
      <PixelPlanet className="h-4 w-4" />
      <span className="absolute -bottom-1.5 -right-1.5 text-[0.6rem] leading-none">♻️</span>
    </span>
  );
}

/** Ligne de boot tapée caractère par caractère, une seule fois au montage. */
function useTypeOnce(text: string, speed = 20): { shown: string; done: boolean } {
  const [n, setN] = useState(0);
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setN(i);
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  return { shown: text.slice(0, n), done: n >= text.length };
}

function BootLine({ text, delay = 0 }: { text: string; delay?: number }) {
  const [start, setStart] = useState(delay === 0);
  useEffect(() => {
    if (delay === 0) return;
    const t = setTimeout(() => setStart(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  const { shown, done } = useTypeOnce(start ? text : "");
  return (
    <p className={`${MONO} text-[0.62rem] leading-relaxed text-emerald-700`}>
      &gt; {shown}
      {start && !done && <span className="durab-cursor">▌</span>}
    </p>
  );
}

/** Étiquette de module — donne l'impression que chaque section est un
 *  fichier chargé par RESCUE_MODE_2000.EXE. */
function SectionLabel({ n, file }: { n: string; file: string }) {
  return (
    <p className={`${MONO} mb-3 text-[0.58rem] font-bold uppercase tracking-[0.14em] text-[#5b2fb8]`}>
      <span style={{ color: PINK }}>▶</span> MODULE_{n} — {file}
    </p>
  );
}

/* ============================================================
   SECTION 1 — VS MODE
   ============================================================ */

type Stat = { value: string; label: string };

const FAST_FASHION_STATS: Stat[] = [
  { value: "92M T", label: "de déchets textiles / an" },
  { value: "7 500 L", label: "d'eau pour produire 1 jean" },
  { value: "200 ANS", label: "de pollution pour 1 pièce polyester" },
];

const LILOG_STATS: Stat[] = [
  { value: "3,6 KG", label: "de CO₂ évités par article" },
  { value: "3 700 L", label: "d'eau sauvés par pièce" },
  { value: "0", label: "nouvelle fibre produite" },
];

function Meter({ tone }: { tone: "danger" | "win" }) {
  const danger = tone === "danger";
  return (
    <div
      className={`h-4 w-full overflow-hidden rounded-full border ${
        danger ? "border-red-900/60 bg-[#2a0a0d]" : "border-emerald-900/50 bg-[#04150d]"
      }`}
    >
      <div
        className={`h-full w-full rounded-full ${
          danger
            ? "durab-blink-red bg-[repeating-linear-gradient(90deg,#ff3b4e_0px,#ff3b4e_10px,#c81e3a_10px,#c81e3a_20px)]"
            : "durab-glow-green bg-[repeating-linear-gradient(90deg,#5cff9d_0px,#5cff9d_10px,#1fae6b_10px,#1fae6b_20px)]"
        }`}
      />
    </div>
  );
}

function StatRow({ value, label, tone }: Stat & { tone: "danger" | "win" }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-t border-dashed border-white/15 py-2 first:border-t-0">
      <span
        className={`${LCD} shrink-0 text-[clamp(1.3rem,4vw,1.7rem)] leading-none ${
          tone === "danger" ? "text-[#ff5468]" : "text-[#6dffb0]"
        }`}
      >
        {value}
      </span>
      <span className={`${MONO} text-right text-[0.6rem] uppercase leading-tight tracking-[0.05em] text-white/75`}>
        {label}
      </span>
    </div>
  );
}

function VsColumn({
  tone,
  badgeIcon,
  badgeLabel,
  headerGradient,
  name,
  stats,
}: {
  tone: "danger" | "win";
  badgeIcon: string;
  badgeLabel: string;
  headerGradient: string;
  name: string;
  stats: Stat[];
}) {
  const danger = tone === "danger";
  return (
    <div
      className={`flex flex-col overflow-hidden rounded-2xl border-2 ${
        danger ? "border-red-950/70" : "border-emerald-950/60"
      } bg-[#101014] ${PLASTIC}`}
    >
      <div className="px-4 py-3" style={{ background: headerGradient }}>
        <p className={`${MONO} text-[0.58rem] font-bold uppercase tracking-[0.18em] text-white/80`}>
          {danger ? "THE PROBLEM" : "THE SOLUTION"}
        </p>
        <p className={`${LCD} text-[clamp(1.1rem,3.4vw,1.5rem)] leading-none tracking-[0.03em] text-white`}>
          {badgeIcon} {badgeLabel}
        </p>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <p className={`${MONO} text-[0.6rem] font-bold uppercase tracking-[0.08em] text-white/60`}>{name}</p>
        <Meter tone={tone} />
        <div className="mt-1">
          {stats.map((s) => (
            <StatRow key={s.label} {...s} tone={tone} />
          ))}
        </div>
      </div>
    </div>
  );
}

function VsMode() {
  return (
    <section>
      <SectionLabel n="01" file="VS_MODE.BAT" />
      <div className="mb-5 text-center">
        <p className={`${LCD} text-[clamp(1.9rem,5.4vw,2.7rem)] uppercase leading-none tracking-[0.06em] text-[#2a1266]`}>
          Round 1 — Fight!
        </p>
        <p className={`${MONO} mt-1 text-[0.58rem] uppercase tracking-[0.24em] text-[#8b86a3]`}>
          Sélectionne ton camp
        </p>
      </div>

      <div className="relative grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
        <VsColumn
          tone="danger"
          badgeIcon="⚠️"
          badgeLabel="DANGER.SYS"
          headerGradient={DANGER_BAR}
          name="FAST FASHION"
          stats={FAST_FASHION_STATS}
        />

        <span
          className={`${LCD} static mx-auto -my-2 grid h-14 w-14 place-items-center rounded-full border-2 border-[#2a1266] bg-[radial-gradient(circle_at_35%_30%,#fff2fa_0%,#ff9fd6_35%,#d3016d_100%)] text-[1.1rem] text-white md:absolute md:top-1/2 md:left-1/2 md:my-0 md:h-16 md:w-16 md:-translate-x-1/2 md:-translate-y-1/2 md:text-[1.3rem] ${PLASTIC}`}
          style={{ zIndex: 5 }}
          aria-hidden
        >
          VS
        </span>

        <VsColumn
          tone="win"
          badgeIcon="✨"
          badgeLabel="PLAYER_1_WIN"
          headerGradient={WIN_BAR}
          name="LIL'OG VINTAGE"
          stats={LILOG_STATS}
        />
      </div>
    </section>
  );
}

/* ============================================================
   SECTION 2 — IMPACT_COUNTER.EXE
   ============================================================ */

function CounterBox({
  value,
  decimals = 0,
  prefix = "",
  suffix,
  label,
  tone,
}: {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix: string;
  label: string;
  tone: "matrix" | "pink";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [n, setN] = useState(0);
  const [go, setGo] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setGo(true)),
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!go) return;
    const start = performance.now();
    const duration = 1300;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setN(value * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [go, value]);

  const shown = decimals > 0 ? n.toFixed(decimals) : Math.round(n).toLocaleString("fr-FR");
  const pink = tone === "pink";

  return (
    <div
      ref={ref}
      className={`durab-counter-scan overflow-hidden rounded-2xl border-2 bg-black px-4 py-6 text-center ${
        pink ? "border-[#ff2f97]/70" : "border-[#26ff8d]/60"
      } ${PLASTIC}`}
    >
      <p className={`${MONO} mb-2 text-[0.56rem] font-bold uppercase tracking-[0.16em] ${pink ? "text-[#ff8fca]" : "text-[#7fffb3]"}`}>
        {label}
      </p>
      <p
        className={`${LCD} text-[clamp(2.1rem,6.4vw,3.1rem)] leading-none ${
          pink ? "text-[#ff2f97] durab-text-glow-pink" : "text-[#26ff8d] durab-text-glow-green"
        }`}
      >
        [ {prefix}
        {shown}
        {suffix} ]
      </p>
    </div>
  );
}

function ImpactCounters() {
  return (
    <section>
      <SectionLabel n="02" file="IMPACT_COUNTER.EXE" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <CounterBox value={3700} suffix=" L" label="Eau préservée / vêtement" tone="matrix" />
        <CounterBox value={3.6} decimals={1} prefix="-" suffix=" KG" label="Émissions CO₂ évitées" tone="pink" />
        <CounterBox value={100} suffix=" %" label="Pièces sauvées du landfill" tone="matrix" />
      </div>
    </section>
  );
}

/* ============================================================
   SECTION 3 — RECYCLE_BIN.EXE
   ============================================================ */

function RecycleBin() {
  return (
    <section>
      <SectionLabel n="03" file="RECYCLE_BIN.EXE" />
      <div
        className="overflow-hidden rounded-2xl border-2 border-[#b8b4cc] bg-[#eeecf6]"
        style={{
          boxShadow: "inset 0 2px 3px rgba(255,255,255,0.9), inset 0 -3px 6px rgba(0,0,0,0.14), 0 8px 20px rgba(30,36,48,0.2)",
        }}
      >
        <div className="flex items-center justify-between gap-2 px-3 py-2" style={{ background: VIOLET_BAR }}>
          <span className={`${MONO} truncate text-[0.6rem] font-bold tracking-[0.03em] text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.45)]`}>
            🗑️ C:\LILOG\RESCUE_MISSION.TXT
          </span>
          <div className="flex shrink-0 items-center gap-1.5">
            <WindowButton label="Réduire" glyph="_" />
            <WindowButton label="Agrandir" glyph="🗖" />
            <WindowButton label="Fermer" glyph="✖" />
          </div>
        </div>

        <div className="flex flex-col gap-5 p-4 sm:flex-row sm:items-start sm:p-6" style={GRID_BG}>
          {/* Icône : corbeille Win95 d'où sortent des vêtements étincelants */}
          <div className="relative mx-auto h-28 w-28 shrink-0 sm:mx-0" aria-hidden>
            <span className="absolute inset-0 grid place-items-center text-[4rem]">🗑️</span>
            <span className="durab-sticker absolute -top-1 left-2 text-2xl" style={{ ["--r" as string]: "-12deg" }}>
              👗
            </span>
            <span
              className="durab-sticker absolute -top-3 right-1 text-xl"
              style={{ ["--r" as string]: "10deg", animationDelay: "-2.3s" }}
            >
              👖
            </span>
            <span
              className="durab-sticker absolute top-2 right-8 text-lg"
              style={{ ["--r" as string]: "6deg", animationDelay: "-4.1s" }}
            >
              ✨
            </span>
            <span
              className="durab-sticker absolute -left-3 top-6 text-lg"
              style={{ ["--r" as string]: "-8deg", animationDelay: "-1.4s" }}
            >
              ✨
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="rounded-xl border border-gray-300 bg-white p-4" style={{ boxShadow: "inset 2px 2px 6px rgba(0,0,0,0.15)" }}>
              <div className="mb-3 flex flex-col gap-0.5">
                <BootLine text="SCAN DÉCENNIE 2000... OK" />
                <BootLine text="PÉPITES VINTAGE DÉTECTÉES... 1 247" delay={900} />
                <BootLine text="CHARGEMENT DU MANIFESTE..." delay={1900} />
              </div>
              <p className={`${MONO} mb-3 text-[clamp(0.86rem,2.4vw,1.05rem)] font-bold uppercase leading-snug text-[#2a1266]`}>
                On n&apos;a rien inventé.
                <br />
                On a juste refusé de jeter.
              </p>
              <p className={`${MONO} mb-3 text-[0.72rem] leading-[1.9] text-[#2b2b33]`}>
                Taille basse, fits qui claquent, matières qui ont du répondant — tout ça existe déjà, planqué
                dans une penderie oubliée. On les retrouve. On les lave. On les remet en scène.
              </p>
              <p className={`${MONO} text-[0.72rem] leading-[1.9] text-[#2b2b33]`}>
                Du style, du caractère, zéro fibre neuve produite : <strong>c&apos;est toute la mission de
                RESCUE_MODE_2000.</strong>
              </p>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <div className="h-3 flex-1 overflow-hidden rounded-full border border-[#c6c2d8] bg-white">
                <div className="h-full w-full rounded-full bg-[repeating-linear-gradient(45deg,#7147d4_0px,#7147d4_8px,#a86fe8_8px,#a86fe8_16px)]" />
              </div>
              <span className={`${MONO} shrink-0 text-[0.55rem] font-bold tracking-[0.05em] text-[#3b1d8f]`}>100%</span>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <span className={`${MONO} text-[0.55rem] font-bold tracking-[0.08em] text-[#5b2fb8]`}>
                STATUT : MISSION ACCOMPLIE ✔
              </span>
              <span
                className={`${MONO} rounded-md border border-[#c6c2d8] bg-[linear-gradient(180deg,#fdfdff_0%,#ebe9f4_48%,#d3d0e1_100%)] px-6 py-1.5 text-[0.62rem] font-bold text-[#262626] ${PLASTIC}`}
              >
                OK
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   SECTION 4 — ENGAGEMENTS (badges de succès)
   ============================================================ */

type Achievement = { icon: string; title: string; desc: string };

const ACHIEVEMENTS: Achievement[] = [
  { icon: "♻️", title: "100% SECONDE MAIN", desc: "Aucune production neuve, jamais." },
  { icon: "🔍", title: "SHARP SELECTION", desc: "Pièces contrôlées et lavées une à une." },
  { icon: "🦄", title: "PIÈCE UNIQUE", desc: "Pas de surproduction, pas de doublon." },
  { icon: "📦", title: "GREEN PACKAGING", desc: "Emballages réduits au strict minimum." },
];

function Achievements() {
  const [popped, setPopped] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fire = (i: number) => {
    setPopped(i);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setPopped(null), 1500);
  };

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  return (
    <section>
      <SectionLabel n="04" file="ENGAGEMENTS.CFG" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ACHIEVEMENTS.map((a, i) => (
          <button
            key={a.title}
            type="button"
            onClick={() => fire(i)}
            className={`group relative rounded-2xl border-2 border-[#c6c2d8] bg-[linear-gradient(160deg,#ffffff_0%,#f3f1fa_60%,#e2ddf2_100%)] p-4 text-left transition duration-200 hover:-translate-y-1.5 hover:-rotate-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7147d4] ${PLASTIC} ${PLASTIC_PRESS}`}
          >
            {popped === i && (
              <span
                className={`${MONO} durab-pop absolute -top-3 right-2 rounded-full border border-yellow-300 bg-yellow-100 px-2 py-1 text-[0.5rem] font-bold whitespace-nowrap text-yellow-800 shadow-md`}
              >
                🏆 UNLOCKED
              </span>
            )}
            <span
              className="mb-3 grid h-12 w-12 place-items-center rounded-xl border border-[#8f6ae0] text-2xl shadow-[inset_0_2px_3px_rgba(255,255,255,0.8)] transition group-hover:scale-110"
              style={{ background: "linear-gradient(180deg,#b58cf5 0%,#7147d4 55%,#5b2fb8 100%)" }}
            >
              {a.icon}
            </span>
            <p className={`${MONO} mb-1 text-[0.66rem] font-bold uppercase tracking-[0.03em] text-[#2a1266]`}>
              [ {a.icon} {a.title} ]
            </p>
            <p className={`${MONO} text-[0.6rem] leading-relaxed text-[#5a5670]`}>{a.desc}</p>
          </button>
        ))}
      </div>
    </section>
  );
}

/* ============================================================
   Coque principale
   ============================================================ */

export function DurabiliteShell() {
  return (
    <PageShell>
      <main className="relative px-[clamp(12px,4vw,48px)] pt-[clamp(92px,11vw,132px)] pb-[clamp(48px,8vw,100px)]">
        <style>{RESCUE_CSS}</style>

        {/* Décor photo, calé sur le viewport (comme /contact et DocCenter). */}
        <span
          aria-hidden
          className="pointer-events-none fixed inset-0 z-0"
          style={{ backgroundImage: "url('/leo.jpeg')", backgroundSize: "cover", backgroundPosition: "center" }}
        />
        <span aria-hidden className="pointer-events-none fixed inset-0 z-0 bg-black/30" />

        <div className="relative z-[1] mx-auto max-w-[1180px]">
          {/* ---- Pastilles décoratives dans les angles ---- */}
          <span aria-hidden className="pointer-events-none absolute inset-0 z-20">
            <span
              className="durab-sticker absolute -top-[18px] -left-[10px] h-[clamp(34px,5vw,58px)] w-[clamp(34px,5vw,58px)]"
              style={{ ["--r" as string]: "-16deg" }}
            >
              <ChromeStar uid="durab-star-a" />
            </span>
            <span
              className="durab-sticker absolute -top-[16px] -right-[10px] h-[clamp(30px,4.4vw,50px)] w-[clamp(30px,4.4vw,50px)]"
              style={{ ["--r" as string]: "14deg", animationDelay: "-2.6s" }}
            >
              <HoloSmiley uid="durab-smiley-a" />
            </span>
            <span
              className="durab-sticker absolute -bottom-[16px] -left-[8px] h-[clamp(28px,4vw,46px)] w-[clamp(28px,4vw,46px)]"
              style={{ ["--r" as string]: "10deg", animationDelay: "-4.2s" }}
            >
              <GemSticker uid="durab-heart" shape="heart" hue={["#FFC0DF", "#EE4B96", "#B3155A"]} />
            </span>
            <span
              className="durab-sticker absolute -right-[8px] -bottom-[18px] h-[clamp(28px,4vw,46px)] w-[clamp(28px,4vw,46px)]"
              style={{ ["--r" as string]: "-12deg", animationDelay: "-1.1s" }}
            >
              <GemSticker uid="durab-star-b" shape="star" hue={["#B9FFDD", "#38D68C", "#0F6B3E"]} />
            </span>
          </span>

          {/* ================= FENÊTRE PRINCIPALE ================= */}
          <div
            className="relative z-[1] overflow-clip rounded-xl border-2 border-[#b8b4cc] bg-[#e7e5f1]"
            style={{
              boxShadow: "inset 0 2px 3px rgba(255,255,255,0.9), inset 0 -3px 6px rgba(0,0,0,0.18), 0 14px 30px rgba(30,36,48,0.28)",
            }}
          >
            {/* ---- Barre de titre ---- */}
            <div className="flex items-center justify-between gap-3 px-3 py-2" style={{ background: VIOLET_BAR }}>
              <div className="flex min-w-0 items-center gap-2">
                <TitleIcon />
                <h1
                  className={`${MONO} truncate text-[clamp(0.66rem,2.2vw,0.95rem)] font-bold tracking-[0.05em] text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.45)]`}
                >
                  RESCUE_MODE_2000.EXE
                </h1>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <WindowButton label="Réduire" glyph="_" />
                <WindowButton label="Agrandir" glyph="🗖" />
                <WindowButton label="Fermer" glyph="✖" />
              </div>
            </div>

            {/* ---- Corps de la fenêtre : papier millimétré pastel ---- */}
            <div className="p-[clamp(14px,3.4vw,34px)]" style={GRID_BG}>
              {/* ---- Intro ---- */}
              <header
                className="mb-[clamp(24px,4vw,40px)] rounded-2xl border border-[#c6c2d8] bg-white/85 p-[clamp(14px,2.6vw,24px)] backdrop-blur-[1px]"
                style={{ boxShadow: "inset 0 2px 3px rgba(255,255,255,0.9), 0 6px 14px rgba(30,36,48,0.14)" }}
              >
                <p className={`${MONO} mb-1 text-[0.56rem] font-bold tracking-[0.14em] text-[#5b2fb8]`}>
                  C:\LILOG\DURABILITE\ <span style={{ color: PINK }}>★</span> MISSION SAUVETAGE
                </p>
                <h2 className={`${LCD} text-[clamp(1.9rem,6vw,3.2rem)] leading-[1.02] tracking-[0.02em] text-[#2a1266] uppercase`}>
                  La mode qui respecte la planète.
                </h2>
                <p className={`${MONO} mt-2 max-w-[62ch] text-[clamp(0.68rem,1.6vw,0.78rem)] leading-relaxed text-[#4a4560]`}>
                  Fast fashion vs. Lil&apos;OG : charge le module, compare les scores, et découvre pourquoi la
                  seconde main gagne à tous les rounds.
                </p>
              </header>

              <div className="flex flex-col gap-[clamp(30px,5vw,52px)]">
                <VsMode />
                <ImpactCounters />
                <RecycleBin />
                <Achievements />
              </div>
            </div>

            {/* ---- Barre de statut ---- */}
            <div className="flex items-center justify-between gap-3 border-t-2 border-[#b8b4cc] bg-[#e7e5f1] px-3 py-1.5">
              <span className={`${MONO} truncate text-[0.5rem] tracking-wider text-[#5a5670]`}>
                <span style={{ color: PINK }}>✦</span> lilog.shop@gmail.com — SIRET 98014870400011
              </span>
              <span className={`${MONO} shrink-0 text-[0.5rem] tracking-wider text-[#5a5670]`}>
                4 module(s) chargé(s)
              </span>
            </div>
          </div>
        </div>
      </main>
    </PageShell>
  );
}
