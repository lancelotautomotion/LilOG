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
import { Icon } from "@/components/icons";
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

/**
 * Disquette au format icône. Le grand boîtier de /contact
 * (components/contact/floppy) ne descend pas à 70 px : on reprend donc sa
 * peau rose — coque F781B4→E24B85, volet clair, étiquette papier — plutôt
 * que d'inventer une troisième couleur de disquette.
 */
function FloppyIcon({ uid }: { uid: string }) {
  const g = `${uid}-flop`;
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id={g} x1="0.1" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#F781B4" />
          <stop offset="45%" stopColor="#ED5D93" />
          <stop offset="100%" stopColor="#E24B85" />
        </linearGradient>
      </defs>
      <rect x="6" y="8" width="88" height="84" rx="6" fill={`url(#${g})`} stroke="#8c1247" strokeWidth="3" />
      {/* Volet métallique */}
      <rect x="28" y="8" width="44" height="32" rx="2" fill="#EBDCDF" stroke="#8c1247" strokeWidth="2.5" />
      <rect x="52" y="12" width="14" height="24" rx="1.5" fill="#c69aa8" />
      {/* Étiquette papier */}
      <rect x="18" y="52" width="64" height="34" rx="2" fill="#EDECEC" stroke="#8c1247" strokeWidth="2.5" />
      <rect x="25" y="60" width="42" height="4" rx="2" fill="#FF3D8E" />
      <rect x="25" y="69" width="50" height="3" rx="1.5" fill="#c4bfc4" />
      <rect x="25" y="76" width="34" height="3" rx="1.5" fill="#c4bfc4" />
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

  const folders = CATEGORIES.map((c) => ({
    href: `/category/${c.handle}`,
    filename: FILENAMES[c.catKey] ?? `${c.catKey.toUpperCase()}.EXE`,
    caption: t.cat[c.catKey] ?? c.catKey,
  }));

  const count = folders.length + 1;

  return (
    /* `#drops` : ancre historique de la boutique, gardée pour que les liens
       du pied de page, de la nav et de l'espace client continuent d'atterrir
       ici — l'explorateur de rayons a remplacé la grille de produits. */
    <section id="drops" className="px-4 pb-[clamp(48px,8vw,96px)] sm:px-6">
      <div className="mx-auto w-full max-w-[980px]">
        <SectionLabel n="03" file="FILE_EXPLORER.SYS" tone="wallpaper" />

        <style>{EXPLORER_CSS}</style>

        <WindowFrame title="C:\\ LIL_OG \\ CATEGORIES" icon={<Icon.folderOpen width={16} height={13} />}>
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
              <Icon.folder width={14} height={12} className="shrink-0" />
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
                {/* Le dossier du site, agrandi — jamais un dessin propre à
                    cette page : c'est celui du menu latéral et de /contact. */}
                <Icon.folder className="h-full w-full drop-shadow-[0_3px_3px_rgba(30,20,70,0.28)]" />
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
