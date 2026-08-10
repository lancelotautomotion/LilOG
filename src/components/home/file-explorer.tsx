"use client";

/* ============================================================
   FILE_EXPLORER.SYS — module 03 de l'accueil
   ------------------------------------------------------------
   Les rayons de la boutique ne sont pas présentés en grille de
   produits mais en icônes de bureau : onze dossiers et une
   disquette, posés sur du papier millimétré, dans une fenêtre
   d'explorateur complète (menus, barre d'adresse, barre d'état).

   Au survol, l'icône se soulève, pivote et prend une ombre
   violette ; l'étiquette passe en surbrillance de sélection,
   comme un fichier cliqué sous Windows.

   ⚠ PAREFEU : Tailwind + feuille locale préfixée `lhf-`.
   ============================================================ */

import Link from "next/link";
import { useLanguage } from "@/lib/i18n-context";
import { CATEGORIES } from "@/lib/categories";
import { GRID_BG, MONO, PLASTIC, PLASTIC_FACE, SectionLabel, WindowFrame } from "@/components/home/kit";

/** Nom de fichier affiché sous chaque dossier, par clé de catégorie. */
const FILENAMES: Record<string, string> = {
  tops: "TOPS.EXE",
  outerwear: "VESTES.SYS",
  dresses: "ROBES.DLL",
  skirts: "JUPES.SYS",
  shorts: "SHORTS.BAT",
  trousers: "PANTALONS.INI",
  swimwear: "MAILLOTS.ZIP",
  jeans: "DENIM.BIN",
  bags: "SACS.ZIP",
  shoes: "CHAUSSURES.COM",
  accessories: "ACCESSORIES.ZIP",
};

/** Teintes des dossiers : [clair, médian, foncé]. */
const HUES: [string, string, string][] = [
  ["#ffe9a8", "#ffd166", "#b8862a"], // manille
  ["#ffd0ec", "#ff8ed4", "#b02278"], // rose
  ["#d6c9ff", "#a98bf0", "#4b2a9e"], // violet
  ["#c9f0ff", "#7fd4f5", "#1b6a94"], // cyan
  ["#c9f7d8", "#79e2a4", "#1d7a4a"], // vert
];

const EXPLORER_CSS = `
.lhf-tile .lhf-icon{transition:transform 200ms cubic-bezier(.2,1.2,.4,1), filter 200ms ease}
.lhf-tile:hover .lhf-icon,
.lhf-tile:focus-visible .lhf-icon{
  transform:translateY(-8px) rotate(-4deg) scale(1.09);
  filter:drop-shadow(0 12px 16px rgba(113,71,212,.65))
}
.lhf-tile:active .lhf-icon{transform:translateY(-2px) rotate(-1deg) scale(1.02)}

@media (prefers-reduced-motion: reduce){
  .lhf-tile .lhf-icon{transition:none}
  .lhf-tile:hover .lhf-icon,.lhf-tile:focus-visible .lhf-icon{transform:none}
}
`;

/* ---- Icônes ---- */

function FolderIcon({ uid, hue }: { uid: string; hue: [string, string, string] }) {
  const g = `${uid}-fold`;
  return (
    <svg viewBox="0 0 100 84" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id={g} x1="0.1" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor={hue[0]} />
          <stop offset="52%" stopColor={hue[1]} />
          <stop offset="100%" stopColor={hue[2]} />
        </linearGradient>
      </defs>
      {/* Dos du dossier, avec l'onglet */}
      <path
        d="M5 14 H36 L45 24 H91 A4 4 0 0 1 95 28 V44 H5 Z"
        fill={hue[2]}
        stroke={hue[2]}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* Pochette avant, en perspective */}
      <path
        d="M5 32 H95 L86 76 H14 Z"
        fill={`url(#${g})`}
        stroke={hue[2]}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* Liseré clair : c'est lui qui donne le relief plastique */}
      <path d="M12 38 H88 L86.6 45 H13.4 Z" fill="#fff" opacity="0.4" />
    </svg>
  );
}

function FloppyIcon({ uid }: { uid: string }) {
  const g = `${uid}-flop`;
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id={g} x1="0.1" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#4d4a63" />
          <stop offset="45%" stopColor="#2b2838" />
          <stop offset="100%" stopColor="#16141f" />
        </linearGradient>
      </defs>
      <rect x="6" y="8" width="88" height="84" rx="6" fill={`url(#${g})`} stroke="#0d0c14" strokeWidth="3" />
      {/* Volet métallique */}
      <rect x="28" y="8" width="44" height="32" rx="2" fill="#d5d8e6" stroke="#0d0c14" strokeWidth="2.5" />
      <rect x="52" y="12" width="14" height="24" rx="1.5" fill="#8b8fa6" />
      {/* Étiquette griffonnée */}
      <rect x="18" y="52" width="64" height="34" rx="2" fill="#fdfdf3" stroke="#0d0c14" strokeWidth="2.5" />
      <rect x="25" y="60" width="42" height="4" rx="2" fill="#d3016d" />
      <rect x="25" y="69" width="50" height="3" rx="1.5" fill="#c9c6da" />
      <rect x="25" y="76" width="34" height="3" rx="1.5" fill="#c9c6da" />
    </svg>
  );
}

/* ---- Tuile ---- */

function Tile({
  href,
  filename,
  caption,
  children,
}: {
  href: string;
  filename: string;
  caption: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="lhf-tile group flex flex-col items-center gap-2 rounded-lg p-2 text-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7147d4]"
    >
      <span className="lhf-icon block h-[62px] w-[70px] sm:h-[76px] sm:w-[88px]">{children}</span>

      <span
        className={`${MONO} rounded-[3px] border border-transparent px-1.5 py-0.5 text-[0.52rem] font-bold tracking-[0.06em] text-[#1E2430] uppercase transition group-hover:border-dotted group-hover:border-white group-hover:bg-[#1B48CE] group-hover:text-white group-focus-visible:bg-[#1B48CE] group-focus-visible:text-white sm:text-[0.58rem]`}
      >
        {filename}
      </span>
      <span className={`${MONO} text-[0.5rem] tracking-[0.08em] text-[#6B7280] uppercase`}>{caption}</span>
    </Link>
  );
}

/* ---- Module ---- */

export function FileExplorer() {
  const { t } = useLanguage();

  const folders = CATEGORIES.map((c, i) => ({
    href: `/category/${c.handle}`,
    filename: FILENAMES[c.catKey] ?? `${c.catKey.toUpperCase()}.EXE`,
    caption: t.cat[c.catKey] ?? c.catKey,
    hue: HUES[i % HUES.length],
    uid: `lhf-${c.catKey}`,
  }));

  const count = folders.length + 1;

  return (
    /* `#drops` : ancre historique de la boutique, gardée pour que les liens
       du pied de page, de la nav et de l'espace client continuent d'atterrir
       ici — l'explorateur de rayons a remplacé la grille de produits. */
    <section id="drops" className="px-4 pb-[clamp(48px,8vw,96px)] sm:px-6">
      <div className="mx-auto w-full max-w-[980px]">
        <SectionLabel n="03" file="FILE_EXPLORER.SYS" tone="light" />

        <style>{EXPLORER_CSS}</style>

        <WindowFrame title="C:\\ LIL_OG \\ CATEGORIES" icon="🗂️">
          {/* Barre de menus */}
          <div className="flex flex-wrap items-center gap-4 border-b border-[#c6c2d8] bg-[#e9e7f2] px-3 py-1.5">
            {["Fichier", "Édition", "Affichage", "Favoris", "?"].map((m) => (
              <span
                key={m}
                className={`${MONO} text-[0.54rem] tracking-[0.06em] text-[#3b3550] uppercase`}
              >
                {m}
              </span>
            ))}
          </div>

          {/* Barre d'adresse */}
          <div className="flex items-center gap-2 border-b border-[#c6c2d8] bg-[#f0eef7] px-3 py-2">
            <span className={`${MONO} shrink-0 text-[0.52rem] tracking-[0.14em] text-[#6B7280] uppercase`}>
              Adresse
            </span>
            <span
              className={`${MONO} flex min-w-0 flex-1 items-center gap-1.5 rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-[0.54rem] tracking-[0.04em] text-[#1E2430] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.18)]`}
            >
              <span aria-hidden>📁</span>
              <span className="truncate">C:\LIL_OG\CATEGORIES\</span>
            </span>
            <span
              className={`${MONO} shrink-0 rounded-full border border-[#c6c2d8] ${PLASTIC_FACE} px-3 py-1.5 text-[0.52rem] font-bold text-[#262626] ${PLASTIC}`}
            >
              [ OK ]
            </span>
          </div>

          {/* En-tête de contenu */}
          <div className="border-b border-[#d8d5e6] px-4 pt-4 pb-3" style={GRID_BG}>
            <h2 className={`${MONO} text-[0.86rem] font-bold tracking-[0.1em] text-[#3b1d8f] uppercase`}>
              {t.home.filesTitle}
            </h2>
            <p className={`${MONO} mt-1 text-[0.56rem] tracking-[0.04em] text-[#6B7280]`}>
              {t.home.filesSub}
            </p>
          </div>

          {/* Le bureau : dossiers + disquette */}
          <div
            className="grid grid-cols-2 gap-x-3 gap-y-6 p-[clamp(16px,3vw,30px)] sm:grid-cols-3 sm:gap-y-8 lg:grid-cols-4"
            style={GRID_BG}
          >
            {folders.map((f) => (
              <Tile key={f.href} href={f.href} filename={f.filename} caption={f.caption}>
                <FolderIcon uid={f.uid} hue={f.hue} />
              </Tile>
            ))}

            <Tile href="/wishlist" filename="WISHLIST.LNK" caption="♡">
              <FloppyIcon uid="lhf-wish" />
            </Tile>
          </div>

          {/* Barre d'état */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t-2 border-[#c6c2d8] bg-[#e9e7f2] px-3 py-2">
            <span className={`${MONO} text-[0.52rem] tracking-[0.1em] text-[#3b3550] uppercase`}>
              {count} {t.home.filesObjects}
            </span>
            <span className={`${MONO} text-[0.52rem] tracking-[0.1em] text-[#6B7280] uppercase`}>
              2,3 Go — 100% one of one
            </span>
          </div>
        </WindowFrame>
      </div>
    </section>
  );
}
