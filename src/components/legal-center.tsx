"use client";

/* ============================================================
   LEGAL_CENTER.EXE — coque commune aux pages légales
   (/cgv, /cookies, /mentions-legales, /confidentialite)

   Direction artistique Y2K / Windows OS / Chunky Plastic,
   strictement alignée sur /contact : mêmes jetons plastique,
   même quadrillage « papier millimétré », même fond leo.jpeg,
   mêmes pastilles.

   ⚠ PAREFEU : tout le style vit ici, via Tailwind et une feuille
   locale entièrement préfixée `lilcgv-`. AUCUNE classe globale de
   `globals.css` n'est utilisée : les autres pages du site ne
   peuvent pas être impactées.
   ============================================================ */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { ChromeStar, GemSticker, HoloSmiley } from "@/components/contact/stickers";

/* ---- Jetons « chunky plastic » — identiques à /contact ---- */
const PLASTIC =
  "shadow-[inset_0_2px_4px_rgba(255,255,255,0.95),inset_0_-2px_5px_rgba(0,0,0,0.25),0_2px_3px_rgba(30,36,48,0.18)]";
const PLASTIC_PRESS =
  "active:shadow-[inset_0_3px_6px_rgba(0,0,0,0.32),inset_0_-1px_0_rgba(255,255,255,0.7)] active:scale-95";
const PLASTIC_ON =
  "shadow-[inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-2px_5px_rgba(0,0,0,0.3),0_2px_4px_rgba(80,30,140,0.35)]";

const MONO = "font-[family-name:var(--mono)]";
const LCD = "font-[family-name:var(--font-lcd)]";

/* Le rose de la maison : TOUS les petits détails roses passent par lui. */
export const PINK = "#d3016d";

/* Quadrillage « papier millimétré » du fond de fenêtre (idem /contact). */
const GRID_BG = {
  backgroundColor: "#f0f0f5",
  backgroundImage:
    "linear-gradient(rgba(113,71,212,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(113,71,212,0.08) 1px, transparent 1px)",
  backgroundSize: "22px 22px",
};

/* ---- Feuille locale : pastilles, colle du sommaire, impression ---- */
const CGV_CSS = `
@keyframes lilcgv-bob{
  0%,100%{transform:translate3d(0,0,0) rotate(var(--r,0deg)) scale(1)}
  50%{transform:translate3d(0,-7%,0) rotate(calc(var(--r,0deg) + 6deg)) scale(1.05)}
}
.lilcgv-sticker{animation:lilcgv-bob 7s ease-in-out infinite;
  filter:drop-shadow(0 3px 4px rgba(30,36,48,.3))}
.lilcgv-s2{animation-duration:8.4s;animation-delay:-2.2s}
.lilcgv-s3{animation-duration:6.2s;animation-delay:-3.7s}
.lilcgv-s4{animation-duration:9s;animation-delay:-5.1s}

@media (prefers-reduced-motion: reduce){
  .lilcgv-sticker{animation:none}
}

/* overflow-x:hidden sur body (globals.css) ferait du body un conteneur de
   défilement, ce qui neutralise position:sticky. La valeur clip rogne
   exactement pareil sans créer de scrollport : le sommaire peut donc se
   figer. Règle locale, active tant qu'une page légale est montée. */
body{overflow-x:clip}

/* ---- Impression : on ne garde que le document ---- */
@media print{
  nav.nav, footer.footer, .lilcgv-noprint{display:none !important}
  .lilcgv-main{padding:0 !important; background:#fff !important}
  .lilcgv-window{max-width:none !important; border:none !important;
    border-radius:0 !important; box-shadow:none !important; background:#fff !important}
  .lilcgv-body{background:#fff !important; background-image:none !important; padding:0 !important}
  .lilcgv-reader{border:none !important; box-shadow:none !important; padding:0 !important}
  .lilcgv-section{break-inside:avoid; page-break-inside:avoid}
}
`;

/* ============================================================
   Briques de mise en page du « Notepad »
   ============================================================ */

/* Boutons de contrôle de fenêtre  [ _ ] [ 🗖 ] [ ✖ ] */
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

/** Paragraphe du lecteur. */
export function P({ children }: { children: React.ReactNode }) {
  return (
    <p className={`${MONO} mb-3.5 text-[clamp(0.7rem,1.5vw,0.78rem)] leading-[1.95] text-[#2b2b33] last:mb-0`}>
      {children}
    </p>
  );
}

/** Lien inline, souligné dans le rose maison. */
export function A({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="font-bold underline decoration-2 underline-offset-2" style={{ color: PINK }}>
      {children}
    </Link>
  );
}

/** Une puce : texte simple, ou intitulé en gras suivi de son explication. */
export type BulletItem = string | { label: string; text: string };

/** Liste à puces « étoile pixel » — le marqueur natif est remplacé.
    Les puces sont décrites en données (et non en JSX) pour que les pages
    restent lisibles et que React n'ait pas de tableau d'éléments à cléer. */
export function Bullets({ items }: { items: BulletItem[] }) {
  return (
    <ul className="mb-3.5 flex list-none flex-col gap-2 p-0">
      {items.map((item) => {
        const simple = typeof item === "string";
        return (
          <li key={simple ? item : item.label} className="flex items-start gap-2.5">
            <span className={`${LCD} mt-[1px] shrink-0 text-[0.95rem] leading-none`} style={{ color: PINK }}>
              ✦
            </span>
            <span className={`${MONO} text-[clamp(0.7rem,1.5vw,0.78rem)] leading-[1.8] text-[#2b2b33]`}>
              {simple ? item : <><strong>{item.label}</strong> {item.text}</>}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/** Résumé rapide — petite étiquette collée dans le texte. */
export function Tldr({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="mb-4 flex items-start gap-3 rounded-xl border px-3.5 py-3"
      style={{
        borderColor: "#f3b6d3",
        background: "linear-gradient(180deg,#fff4f9 0%,#ffe5f1 100%)",
        boxShadow: "inset 0 2px 3px rgba(255,255,255,0.9), 0 2px 4px rgba(190,80,150,0.15)",
      }}
    >
      <span className={`${LCD} shrink-0 text-[1.05rem] leading-none`} style={{ color: PINK }}>
        ✦
      </span>
      <p className={`${MONO} text-[clamp(0.66rem,1.4vw,0.72rem)] leading-[1.8]`} style={{ color: "#7a0f4b" }}>
        <span className="font-bold tracking-[0.06em]" style={{ color: PINK }}>
          EN BREF —{" "}
        </span>
        {children}
      </p>
    </div>
  );
}

/** Boîte de dialogue système : l'avertissement qui compte. */
export function Notice({
  title = "SYSTEM_NOTICE.DLG",
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="my-4 overflow-hidden rounded-xl border-2 border-[#b8b4cc] bg-[#eeecf6]"
      style={{
        boxShadow:
          "inset 0 2px 3px rgba(255,255,255,0.9), inset 0 -3px 6px rgba(0,0,0,0.14), 0 5px 12px rgba(30,36,48,0.18)",
      }}
    >
      <div
        className="flex items-center justify-between gap-2 px-2.5 py-1.5"
        style={{ background: "linear-gradient(90deg, #3b1d8f 0%, #7147d4 60%, #a86fe8 100%)" }}
      >
        <span
          className={`${MONO} truncate text-[0.55rem] font-bold tracking-[0.06em] text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.45)]`}
        >
          ⚠️ {title}
        </span>
        <span className="grid h-4 w-5 shrink-0 place-items-center rounded-[3px] border border-[#c6c2d8] bg-[linear-gradient(180deg,#f6f5fb_0%,#d3d0e1_100%)] text-[0.5rem] font-bold text-[#262626]">
          ✖
        </span>
      </div>
      <div className="flex items-start gap-3 px-3.5 py-3">
        <span className="text-[1.4rem] leading-none drop-shadow-[0_2px_2px_rgba(0,0,0,0.2)]">⚠️</span>
        <p className={`${MONO} text-[clamp(0.66rem,1.4vw,0.72rem)] leading-[1.85] text-[#2b2b33]`}>{children}</p>
      </div>
      <div className="flex justify-end px-3.5 pb-3">
        <span
          className={`${MONO} rounded-md border border-[#c6c2d8] bg-[linear-gradient(180deg,#fdfdff_0%,#ebe9f4_48%,#d3d0e1_100%)] px-5 py-1 text-[0.6rem] font-bold text-[#262626] ${PLASTIC}`}
        >
          OK
        </span>
      </div>
    </div>
  );
}

/* ============================================================
   Coque
   ============================================================ */

export type LegalSectionY2K = {
  id: string;
  num: string;
  /** Nom de fichier affiché dans l'arborescence et sur le scotch. */
  file: string;
  title: string;
  content: React.ReactNode;
};

/* Onglets de navigation rapide entre les pages légales. */
const TABS = [
  { href: "/cgv", icon: "📜", label: "CGV" },
  { href: "/cookies", icon: "📄", label: "COOKIES" },
  { href: "/mentions-legales", icon: "💬", label: "MENTIONS LÉGALES" },
  { href: "/confidentialite", icon: "🔒", label: "CONFIDENTIALITÉ" },
];

export function LegalCenter({
  activeHref,
  icon,
  title,
  subtitle,
  folder,
  date,
  sections,
}: {
  /** Onglet à afficher enfoncé — doit correspondre à une entrée de TABS. */
  activeHref: string;
  /** Pictogramme du document (badge de l'en-tête). */
  icon: string;
  title: string;
  subtitle: string;
  /** Dossier affiché dans le chemin C:\LILOG\LEGAL\…\ */
  folder: string;
  date: string;
  sections: LegalSectionY2K[];
}) {
  const [active, setActive] = useState(sections[0]?.id ?? "");
  const [treeOpen, setTreeOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  /* Scrollspy : le dossier ouvert dans l'arborescence suit la lecture. */
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    );
    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observerRef.current?.observe(el);
    });
    return () => observerRef.current?.disconnect();
  }, [sections]);

  const openFile = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    setTreeOpen(false);
    const top = el.getBoundingClientRect().top + window.scrollY - 100;
    window.scrollTo({ top, behavior: "smooth" });
  };

  /* « Télécharger le PDF » passe par la boîte d'impression du navigateur
     (option « Enregistrer au format PDF ») : pas de dépendance en plus. */
  const print = () => window.print();

  return (
    <PageShell>
      <main className="lilcgv-main relative px-[clamp(12px,4vw,48px)] pt-[clamp(92px,11vw,132px)] pb-[clamp(48px,8vw,100px)]">
        <style>{CGV_CSS}</style>

        {/* Décor photo, comme /contact et le panier : calé sur le viewport
            (et non sur la hauteur du document) pour rester net. */}
        <span
          aria-hidden
          className="lilcgv-noprint pointer-events-none fixed inset-0 z-0"
          style={{
            backgroundImage: "url('/leo.jpeg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
        <span aria-hidden className="lilcgv-noprint pointer-events-none fixed inset-0 z-0 bg-black/25" />

        {/* Le conteneur relatif porte les pastilles : elles peuvent ainsi
            déborder de la fenêtre, qui elle reste rognée. */}
        <div className="relative z-[1] mx-auto max-w-[1180px]">

          {/* ---- Pastilles décoratives (mêmes bijoux que /contact) ---- */}
          <span aria-hidden className="lilcgv-noprint pointer-events-none absolute inset-0 z-20">
            <span
              className="lilcgv-sticker absolute h-[clamp(34px,5vw,58px)] w-[clamp(34px,5vw,58px)] -left-[10px] -top-[18px]"
              style={{ ["--r" as string]: "-16deg" }}
            >
              <ChromeStar uid="lc-star-a" />
            </span>
            {/* Volontairement calée sur le flanc gauche, sous les onglets :
                elle ne doit jamais recouvrir les boutons de fenêtre. */}
            <span
              className="lilcgv-sticker lilcgv-s2 absolute h-[clamp(26px,3.6vw,42px)] w-[clamp(26px,3.6vw,42px)] -left-[16px] top-[70px]"
              style={{ ["--r" as string]: "12deg" }}
            >
              <GemSticker uid="lc-star-b" shape="star" hue={["#FFB3D6", "#F0509A", "#B7175C"]} />
            </span>
            <span
              className="lilcgv-sticker lilcgv-s3 absolute h-[clamp(30px,4.2vw,50px)] w-[clamp(30px,4.2vw,50px)] -bottom-[16px] -left-[6px]"
              style={{ ["--r" as string]: "10deg" }}
            >
              <HoloSmiley uid="lc-smiley" />
            </span>
            <span
              className="lilcgv-sticker lilcgv-s4 absolute h-[clamp(26px,3.6vw,42px)] w-[clamp(26px,3.6vw,42px)] -right-[6px] -bottom-[18px]"
              style={{ ["--r" as string]: "-12deg" }}
            >
              <GemSticker uid="lc-heart" shape="heart" hue={["#FFC0DF", "#EE4B96", "#B3155A"]} />
            </span>
          </span>

          {/* ================= FENÊTRE WINDOWS 95 ================= */}
          {/* `overflow-clip` et non `hidden` : le rognage est identique mais
              n'ouvre pas de conteneur de défilement, sans quoi le sommaire
              en `sticky` resterait figé en haut de la fenêtre. */}
          <div
            className="lilcgv-window relative z-[1] overflow-clip rounded-xl border-2 border-[#b8b4cc] bg-[#e7e5f1]"
            style={{
              boxShadow:
                "inset 0 2px 3px rgba(255,255,255,0.9), inset 0 -3px 6px rgba(0,0,0,0.18), 0 14px 30px rgba(30,36,48,0.28)",
            }}
          >
            {/* ---- Barre de titre ---- */}
            <div
              className="flex items-center justify-between gap-3 px-3 py-2"
              style={{ background: "linear-gradient(90deg, #3b1d8f 0%, #7147d4 55%, #a86fe8 100%)" }}
            >
              <div className="flex min-w-0 items-center gap-2">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-[4px] bg-white/85 text-[0.65rem] shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.3)]">
                  {icon}
                </span>
                <h1
                  className={`${MONO} truncate text-[clamp(0.62rem,2.1vw,0.9rem)] font-bold tracking-[0.05em] text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.45)]`}
                >
                  LEGAL_CENTER.EXE
                </h1>
              </div>
              <div className="lilcgv-noprint flex shrink-0 items-center gap-1.5">
                <WindowButton label="Réduire" glyph="_" />
                <WindowButton label="Agrandir" glyph="🗖" />
                <WindowButton label="Fermer" glyph="✖" />
              </div>
            </div>

            {/* ---- Sous-barre d'onglets légaux ---- */}
            <nav
              aria-label="Pages légales"
              className="lilcgv-noprint flex gap-1 overflow-x-auto border-b-2 border-[#b8b4cc] bg-[#ded9ee] px-2 pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {TABS.map(({ href, icon: tabIcon, label }) => {
                const on = href === activeHref;
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={on ? "page" : undefined}
                    className={`${MONO} shrink-0 rounded-t-lg border border-b-0 px-3 py-2 text-[clamp(0.5rem,1.5vw,0.62rem)] font-bold tracking-[0.04em] whitespace-nowrap no-underline transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7147d4] ${
                      on
                        ? "relative top-px border-[#b8b4cc] bg-white text-[#3b1d8f] shadow-[inset_0_3px_7px_rgba(0,0,0,0.16)]"
                        : `border-[#c6c2d8] bg-[linear-gradient(180deg,#fdfdff_0%,#ebe9f4_48%,#d3d0e1_100%)] text-[#4a4560] hover:bg-purple-100 hover:brightness-105 ${PLASTIC} ${PLASTIC_PRESS}`
                    }`}
                  >
                    {tabIcon} {label}
                  </Link>
                );
              })}
            </nav>

            {/* ---- Corps de la fenêtre : papier millimétré ---- */}
            <div className="lilcgv-body p-[clamp(14px,3vw,32px)]" style={GRID_BG}>

              {/* ============ EN-TÊTE DU DOCUMENT ============ */}
              <header
                className="mb-[clamp(18px,3vw,28px)] flex flex-wrap items-center gap-[clamp(12px,2.4vw,20px)] rounded-2xl border border-[#c6c2d8] bg-white/85 p-[clamp(14px,2.4vw,22px)] backdrop-blur-[1px]"
                style={{ boxShadow: "inset 0 2px 3px rgba(255,255,255,0.9), 0 6px 14px rgba(30,36,48,0.14)" }}
              >
                <span
                  className={`grid h-[clamp(48px,7vw,62px)] w-[clamp(48px,7vw,62px)] shrink-0 place-items-center rounded-2xl border border-[#8f6ae0] text-[clamp(1.5rem,3.6vw,2rem)] ${PLASTIC}`}
                  style={{ background: "linear-gradient(180deg, #b58cf5 0%, #7147d4 55%, #5b2fb8 100%)" }}
                >
                  {icon}
                </span>
                <div className="min-w-[180px] flex-1">
                  <p className={`${MONO} mb-1 text-[0.55rem] font-bold tracking-[0.14em] text-[#5b2fb8]`}>
                    C:\LILOG\LEGAL\ <span style={{ color: PINK }}>★</span> DOCUMENT_OFFICIEL
                  </p>
                  <h2
                    className={`${LCD} text-[clamp(1.5rem,5vw,2.4rem)] leading-[1.05] tracking-[0.02em] text-[#2a1266] uppercase`}
                  >
                    {title}
                  </h2>
                  <p className={`${MONO} mt-1.5 text-[clamp(0.62rem,1.5vw,0.7rem)] leading-relaxed text-[#4a4560]`}>
                    {subtitle}
                  </p>
                </div>
                <div
                  className={`${MONO} w-full shrink-0 basis-full rounded-lg border border-[#c6c2d8] bg-[linear-gradient(180deg,#fdfdff_0%,#ebe9f4_100%)] px-3 py-2 text-[0.55rem] leading-relaxed font-bold tracking-[0.06em] text-[#4a4560] sm:w-auto sm:basis-auto ${PLASTIC}`}
                >
                  VERSION : {date}
                  <br />
                  {sections.length} FICHIER(S) — 1.44 Mo
                </div>
              </header>

              {/* ============ 2 COLONNES : EXPLORATEUR + LECTEUR ============ */}
              <div className="grid grid-cols-1 gap-[clamp(16px,2.6vw,28px)] lg:grid-cols-[minmax(0,286px)_minmax(0,1fr)]">

                {/* ---------- COLONNE GAUCHE : ARBORESCENCE ---------- */}
                {/* Figée au défilement dès le format deux colonnes. */}
                <aside
                  aria-label="Sommaire"
                  className="lilcgv-noprint lg:sticky lg:top-[96px] lg:max-h-[calc(100dvh-120px)] lg:self-start lg:overflow-y-auto lg:pr-1"
                >
                  <div
                    className="overflow-hidden rounded-xl border border-[#c6c2d8] bg-white/85 backdrop-blur-[1px]"
                    style={{ boxShadow: "inset 0 2px 3px rgba(255,255,255,0.9), 0 6px 14px rgba(30,36,48,0.14)" }}
                  >
                    <div
                      className="px-3 py-2"
                      style={{ background: "linear-gradient(90deg, #5b2fb8 0%, #7147d4 60%, #b184ee 100%)" }}
                    >
                      <h3
                        className={`${MONO} text-[0.66rem] font-bold tracking-[0.05em] text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.4)]`}
                      >
                        📂 SOMMAIRE.DIR ★
                      </h3>
                    </div>

                    {/* Accordéon mobile : l'arborescence se replie sous ce bouton. */}
                    <button
                      type="button"
                      onClick={() => setTreeOpen((v) => !v)}
                      aria-expanded={treeOpen}
                      className={`${MONO} flex w-full items-center justify-between gap-2 border-b border-[#e2dff0] px-3 py-2.5 text-[0.62rem] font-bold tracking-[0.05em] text-[#3b1d8f] lg:hidden`}
                    >
                      <span>
                        {treeOpen ? "▼" : "▶"} PARCOURIR ({sections.length})
                      </span>
                      <span className="text-[0.55rem]" style={{ color: PINK }}>
                        {treeOpen ? "REPLIER" : "DÉPLIER"}
                      </span>
                    </button>

                    <div className={`${treeOpen ? "block" : "hidden"} p-2.5 lg:block`}>
                      <p className={`${MONO} mb-2 truncate px-1 text-[0.5rem] tracking-[0.08em] text-[#8b86a3]`}>
                        C:\LILOG\LEGAL\{folder}\
                      </p>
                      <div className="flex flex-col gap-1.5">
                        {sections.map(({ id, file }, i) => {
                          const on = active === id;
                          const last = i === sections.length - 1;
                          return (
                            <button
                              key={id}
                              type="button"
                              onClick={() => openFile(id)}
                              aria-current={on ? "true" : undefined}
                              className={`${MONO} flex w-full items-center gap-1.5 rounded-xl border px-2.5 py-2 text-left text-[clamp(0.55rem,1.4vw,0.63rem)] font-bold tracking-[0.02em] transition ${PLASTIC_PRESS} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7147d4] ${
                                on
                                  ? `border-purple-700 bg-purple-600 text-white ${PLASTIC_ON}`
                                  : `border-[#c6c2d8] bg-white/80 text-[#3a3550] shadow-md hover:bg-purple-100 ${PLASTIC}`
                              }`}
                            >
                              <span className={`shrink-0 opacity-60 ${on ? "text-white" : "text-[#8b86a3]"}`}>
                                {last ? "└─" : "├─"}
                              </span>
                              <span className="shrink-0 text-[0.8rem] leading-none">{on ? "📂" : "📁"}</span>
                              <span className="truncate">{file}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* ---- Boutons d'action chunky plastic ---- */}
                  <div className="mt-3 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={print}
                      className={`${MONO} w-full rounded-full bg-purple-600 px-3 py-3 text-[clamp(0.58rem,1.5vw,0.68rem)] font-bold tracking-[0.04em] text-white shadow-[inset_0_2px_4px_rgba(255,255,255,0.7),0_4px_6px_rgba(0,0,0,0.15)] transition hover:brightness-110 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7147d4]`}
                    >
                      [ 🖨️ IMPRIMER_DOC.EXE ]
                    </button>
                    <button
                      type="button"
                      onClick={print}
                      title="Ouvre la boîte d'impression : choisis « Enregistrer au format PDF »."
                      className={`${MONO} w-full rounded-full border border-[#c6c2d8] bg-[linear-gradient(180deg,#fdfdff_0%,#ebe9f4_48%,#d3d0e1_100%)] px-3 py-3 text-[clamp(0.58rem,1.5vw,0.68rem)] font-bold tracking-[0.04em] text-[#262626] transition hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7147d4] ${PLASTIC} ${PLASTIC_PRESS}`}
                    >
                      [ 💾 TÉLÉCHARGER_PDF.EXE ]
                    </button>
                    <Link
                      href="/contact"
                      className={`${MONO} w-full rounded-full border border-[#c6c2d8] bg-[linear-gradient(180deg,#fdfdff_0%,#ebe9f4_48%,#d3d0e1_100%)] px-3 py-3 text-center text-[clamp(0.58rem,1.5vw,0.68rem)] font-bold tracking-[0.04em] text-[#262626] no-underline transition hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7147d4] ${PLASTIC} ${PLASTIC_PRESS}`}
                    >
                      [ ☎ UNE_QUESTION.LNK ]
                    </Link>
                  </div>
                </aside>

                {/* ---------- COLONNE DROITE : LECTEUR « NOTEPAD » ---------- */}
                <section aria-label={title} className="min-w-0">
                  <div
                    className="lilcgv-reader rounded-2xl border border-gray-200 bg-white p-[clamp(16px,3.4vw,32px)]"
                    style={{ boxShadow: "inset 2px 2px 6px rgba(0,0,0,0.15)" }}
                  >
                    {sections.map(({ id, num, file, title: t, content }, i) => (
                      <article
                        key={id}
                        id={id}
                        className={`lilcgv-section scroll-mt-[110px] ${i > 0 ? "mt-[clamp(30px,5vw,48px)]" : ""}`}
                      >
                        {/* Scotch adhésif + titre rétro */}
                        <div className="mb-3">
                          <span
                            className={`${MONO} inline-block -rotate-1 border border-yellow-200/70 bg-yellow-100/80 px-3 py-1 text-[0.52rem] font-bold tracking-[0.1em] text-[#7a6412] shadow-sm`}
                          >
                            📎 {file}
                          </span>
                          <h3
                            className={`${LCD} mt-2 text-[clamp(1.35rem,4.4vw,2rem)] leading-none tracking-[0.03em] text-[#2a1266] uppercase`}
                          >
                            <span style={{ color: PINK }}>{num}.</span> {t}
                          </h3>
                          <div
                            className="mt-2 h-[3px] w-full opacity-45"
                            style={{
                              backgroundImage: "repeating-linear-gradient(90deg,#7147d4 0 6px,transparent 6px 12px)",
                            }}
                          />
                        </div>
                        {content}
                      </article>
                    ))}

                    <p
                      className={`${MONO} mt-[clamp(26px,4vw,40px)] border-t border-dashed border-[#d8d5e6] pt-4 text-[0.55rem] tracking-[0.08em] text-[#8b86a3]`}
                    >
                      <span style={{ color: PINK }}>✦</span> FIN_DU_DOCUMENT — Version en vigueur : {date} — Lil&apos;OG
                      © 2026
                    </p>
                  </div>
                </section>
              </div>
            </div>

            {/* ---- Barre de statut ---- */}
            <div className="lilcgv-noprint flex items-center justify-between gap-3 border-t-2 border-[#b8b4cc] bg-[#e7e5f1] px-3 py-1.5">
              <span className={`${MONO} truncate text-[0.5rem] tracking-wider text-[#5a5670]`}>
                <span style={{ color: PINK }}>✦</span> lilog.shop@gmail.com — SIRET 98014870400011
              </span>
              <span className={`${MONO} shrink-0 text-[0.5rem] tracking-wider text-[#5a5670]`}>
                {sections.length} objet(s) — 1.44 Mo
              </span>
            </div>
          </div>
        </div>
      </main>
    </PageShell>
  );
}
