"use client";

/* ============================================================
   FILE_EXPLORER.SYS : module 04 de l'accueil
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

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n-context";
import { Icon } from "@/components/icons";
import { CATEGORIES } from "@/lib/categories";
import { GRID_BG, HARD_SHADOW, MONO, PLASTIC, PLASTIC_FACE, WindowFrame } from "@/components/y2k/kit";

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
 * peau rose (coque F781B4→E24B85, volet clair, étiquette papier) plutôt
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
        className={`${MONO} rounded-[3px] border border-transparent px-1.5 py-0.5 text-[0.8125rem] font-bold tracking-[0.06em] text-[#1E2430] uppercase transition group-hover:border-dotted group-hover:border-white group-hover:bg-[#1B48CE] group-hover:text-white group-focus-visible:bg-[#1B48CE] group-focus-visible:text-white sm:text-[0.8125rem]`}
      >
        {filename}
      </span>
      <span className={`${MONO} text-[0.8125rem] tracking-[0.08em] text-[#6B7280] uppercase`}>{caption}</span>
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
       ici : l'explorateur de rayons a remplacé la grille de produits.

       Bloc plein viewport comme CAMCORDER_OS au-dessus : plus de conteneur
       `max-w` centré, la ligne s'étire d'un bord à l'autre de l'écran et se
       coupe en deux : l'explorateur d'un côté, une photo de la marchandise
       de l'autre. Sur mobile, la photo passe en bandeau au-dessus (`order`)
       plutôt que serrée entre deux blocs de texte. */
    <section id="drops" className="pb-[clamp(48px,8vw,96px)]">
      <style>{EXPLORER_CSS}</style>

      {/* `px-4 sm:px-6` sur la ligne elle-même : la photo touchait le bord
          droit de l'écran à zéro alors que la fenêtre gardait la marge du
          reste du site à gauche. Même gouttière posée des deux côtés,
          `gap` entre les deux colonnes pour ne pas les souder au milieu.

          `lg:h-[...]` borne les deux colonnes à la hauteur de l'écran moins
          la navigation fixe (~72px) et un peu d'air : en desktop, tout le
          module (fenêtre + photo) tient donc dans un seul écran plutôt que
          de couper une rangée de dossiers au ras du bord de la fenêtre du
          navigateur. En dessous de `lg:`, les colonnes s'empilent et
          gardent leur hauteur naturelle : rien à contraindre, la grille de
          dossiers défile avec la page comme le reste.

          `flex` plutôt que `grid` pour ces deux colonnes : une piste de
          grille implicite (`grid-auto-rows: auto`) ignore la hauteur
          explicite posée sur le conteneur, ses cellules restent calées sur
          la hauteur de contenu de la fenêtre au lieu de s'y borner — c'est
          `align-items: stretch` d'un `flex` qui respecte une hauteur
          explicite du conteneur.

          `max-w-[1400px] mx-auto` : ce module n'avait aucun plafond de
          largeur, contrairement aux autres fenêtres du site — sur un grand
          écran, la marge aux bords rétrécissait au lieu de rester celle
          d'ARCADE_SLOT et du reste de l'accueil. */}
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-4 px-4 sm:gap-6 sm:px-6 lg:h-[calc(100svh-104px)] lg:flex-row lg:items-stretch">
        {/* Même retrait vertical que la colonne fenêtre : sans lui, l'image
            remplissait toute la cellule de grille pendant que la fenêtre,
            elle, était rentrée de son `py`, et dépassait donc en haut comme
            en bas. Le cadre photo est un enfant du bloc rembourré (et non
            le bloc lui-même) : `fill` se positionne sur l'ancêtre `relative`
            le plus proche et ignorerait un padding posé au même niveau. */}
        {/* Aucun padding vertical sur les colonnes. En haut, il s'ajoutait au
            `mb-3` de l'étiquette et la laissait flotter à 44px du bloc, là où
            ARCADE_SLOT et README.TXT collent la leur à 12px. En bas, il
            s'ajoutait au `pb` de la section et creusait avant README.TXT un
            écart plus grand qu'entre les autres modules : c'est la section
            seule qui réserve l'espace qui la suit, comme partout ailleurs sur
            l'accueil. Les deux colonnes restent alignées puisqu'elles sont
            traitées à l'identique. */}
        <div className="order-1 lg:order-2 lg:min-w-0 lg:flex-1">
          {/* Même ombre dure que la fenêtre d'à côté : sans elle, les deux
              boîtes avaient bien la même hauteur mais la fenêtre, seule à
              porter son ombre décalée de 10px vers le bas, semblait
              descendre plus bas que la photo. */}
          <div
            className={`relative aspect-[3/4] overflow-hidden rounded-xl border-2 border-[#b8b4cc] lg:aspect-auto lg:h-full ${HARD_SHADOW}`}
          >
            <Image
              src="/5.png"
              alt="Look Lil'OG porté, sac à main en avant"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
            <span
              className={`${MONO} absolute bottom-3 left-3 rounded-sm border border-black/30 bg-black/55 px-2 py-1 text-[0.8125rem] font-bold tracking-[0.08em] text-white uppercase backdrop-blur-[2px]`}
            >
              ▶ LOOK_05.PNG
            </span>
          </div>
        </div>

        <div className="order-2 flex lg:order-1 lg:h-full lg:min-w-0 lg:flex-1">
          <WindowFrame
            title="Catégories.TXT"
            icon={<Icon.folderOpen width={16} height={13} />}
            className="w-full lg:flex lg:h-full lg:flex-col"
            bodyClassName="lg:flex lg:min-h-0 lg:flex-1 lg:flex-col"
          >
            {/* Barre de menus */}
            <div className="flex flex-wrap items-center gap-4 border-b border-[#c6c2d8] bg-[#e9e7f2] px-3 py-1.5 lg:shrink-0">
              {["Fichier", "Édition", "Affichage", "Favoris", "?"].map((m) => (
                <span
                  key={m}
                  className={`${MONO} text-[0.8125rem] tracking-[0.06em] text-[#3b3550] uppercase`}
                >
                  {m}
                </span>
              ))}
            </div>

            {/* Barre d'adresse */}
            <div className="flex items-center gap-2 border-b border-[#c6c2d8] bg-[#f0eef7] px-3 py-2 lg:shrink-0">
              <span className={`${MONO} shrink-0 text-[0.8125rem] tracking-[0.14em] text-[#6B7280] uppercase`}>
                Adresse
              </span>
              <span
                className={`${MONO} flex min-w-0 flex-1 items-center gap-1.5 rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-[0.8125rem] tracking-[0.04em] text-[#1E2430] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.18)]`}
              >
                <Icon.folder width={14} height={12} className="shrink-0" />
                <span className="truncate">C:\LIL_OG\CATEGORIES\</span>
              </span>
              <span
                className={`${MONO} shrink-0 rounded-full border border-[#c6c2d8] ${PLASTIC_FACE} px-3 py-1.5 text-[0.8125rem] font-bold text-[#262626] ${PLASTIC}`}
              >
                [ OK ]
              </span>
            </div>

            {/* En-tête de contenu */}
            <div className="border-b border-[#d8d5e6] px-4 pt-4 pb-3 lg:shrink-0" style={GRID_BG}>
              <h2 className={`${MONO} text-[1.25rem] font-bold tracking-[0.1em] text-[#3b1d8f] uppercase`}>
                {t.home.filesTitle}
              </h2>
              <p className={`${MONO} mt-1 text-[0.8125rem] tracking-[0.04em] text-[#6B7280]`}>
                {t.home.filesSub}
              </p>
            </div>

            {/* Le bureau : dossiers + disquette. Seule zone qui défile en
                interne (`lg:overflow-y-auto`) si les 12 tuiles ne tiennent
                pas dans la hauteur restante : les barres autour d'elle
                (menus, adresse, en-tête, état) restent toujours visibles. */}
            <div
              className="grid grid-cols-2 gap-x-3 gap-y-6 p-[clamp(16px,3vw,30px)] sm:grid-cols-3 sm:gap-y-8 lg:min-h-0 lg:flex-1 lg:content-start lg:overflow-y-auto xl:grid-cols-4"
              style={GRID_BG}
            >
              {folders.map((f) => (
                <Tile key={f.href} href={f.href} filename={f.filename} caption={f.caption}>
                  {/* Le dossier du site, agrandi : jamais un dessin propre à
                      cette page : c'est celui du menu latéral et de /contact. */}
                  <Icon.folder className="h-full w-full drop-shadow-[0_3px_3px_rgba(30,20,70,0.28)]" />
                </Tile>
              ))}

              <Tile href="/wishlist" filename="WISHLIST.LNK" caption="♡">
                <FloppyIcon uid="lhf-wish" />
              </Tile>
            </div>

            {/* Barre d'état */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t-2 border-[#c6c2d8] bg-[#e9e7f2] px-3 py-2 lg:shrink-0">
              <span className={`${MONO} text-[0.8125rem] tracking-[0.1em] text-[#3b3550] uppercase`}>
                {count} {t.home.filesObjects}
              </span>
              <span className={`${MONO} text-[0.8125rem] tracking-[0.1em] text-[#6B7280] uppercase`}>
                2,3 Go · 100% one of one
              </span>
            </div>
          </WindowFrame>
        </div>
      </div>
    </section>
  );
}
