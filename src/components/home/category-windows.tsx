"use client";

/* ============================================================
   CATEGORIES.EXE : module 02 de l'accueil
   ------------------------------------------------------------
   Trois raccourcis de rayon, posés côte à côte juste sous le
   hero : ROBES, VESTES, TOPS. Chacun est une mini-fenêtre du
   système — barre de titre violette avec [ _ ] [ 🗖 ] [ × ],
   photo encastrée dans un cadre creusé façon Windows, barre
   d'état en bas avec le nom du rayon et son bouton
   [ OPEN_CATALOG ].

   La fenêtre entière est le lien : le `<Link>` enveloppe la
   fenêtre, et les boutons de titre restent des `<span
   role="presentation">` (voir `WindowControls` dans y2k/kit),
   donc aucun élément interactif ne s'imbrique dans un autre.

   Au survol : la fenêtre se soulève de 2px, son ombre dure
   s'allonge d'autant (l'ombre reste « collée » au même point du
   fond, comme une vraie ombre portée pixelisée), la photo
   grossit de 5 % derrière son cadre et un voile de lignes de
   balayage CRT passe dessus. Tout est neutralisé sous
   `prefers-reduced-motion`.

   Ce module ne remplace pas FILE_EXPLORER.SYS, qui reste
   l'index complet des onze rayons : il en met trois en avant
   là où l'œil arrive en premier.

   ⚠ PAREFEU : Tailwind + feuille locale préfixée `lhc-`. Aucune
   classe de globals.css n'est touchée, donc aucune autre page ne
   bouge.
   ============================================================ */

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n-context";
import { Icon } from "@/components/icons";
import { MONO, PLASTIC, PLASTIC_FACE, SectionLabel, WindowFrame } from "@/components/y2k/kit";

/**
 * Les trois rayons mis en avant.
 *
 * `href` pointe sur `/category/<handle>`, la seule route de rayon du site
 * (voir `src/app/category/[handle]`) : il n'existe pas de `/collections/…`
 * ici, un tel lien tomberait sur la page 404.
 *
 * `catKey` désigne l'entrée de `t.cat` : le nom lisible du rayon est déjà
 * traduit dans les neuf langues du dictionnaire, inutile d'en ajouter.
 * Le nom de fichier affiché dans la barre de titre, lui, ne se traduit
 * pas — c'est un nom de fichier, comme partout ailleurs sur le site.
 */
const WINDOWS: {
  file: string;
  catKey: string;
  href: string;
  src: string;
  alt: string;
}[] = [
  {
    file: "ROBES.EXE",
    catKey: "dresses",
    href: "/category/robes",
    src: "/categories/robes.jpg",
    alt: "Robe courte à carreaux violets portée avec des mocassins blancs",
  },
  {
    file: "VESTES.EXE",
    catKey: "outerwear",
    href: "/category/manteaux-et-vestes",
    src: "/categories/vestes.jpg",
    alt: "Veste en jean courte et délavée portée avec un pantalon en cuir noir",
  },
  {
    file: "TOPS.EXE",
    catKey: "tops",
    href: "/category/tops",
    src: "/categories/tops.jpg",
    alt: "Boléro court en mesh gris porté avec une mini-jupe en jean",
  },
];

const CATEGORY_CSS = `
/* Soulèvement au survol.
 *
 * L'ombre dure du site (--y2k-win-shadow) est portée par la fenêtre
 * elle-même. Si l'on soulève la fenêtre sans toucher à l'ombre, l'ombre
 * monte avec elle et le décalage reste identique : rien ne semble décoller.
 * On translate donc la fenêtre de -2px et on allonge l'ombre de +2px, si
 * bien que son bord extérieur ne bouge pas d'un pixel — c'est le rendu d'une
 * vraie ombre portée quand l'objet s'éloigne du fond.
 */
.lhc-win{
  transition: transform 200ms cubic-bezier(.2,1,.4,1), box-shadow 200ms ease-out;
  will-change: transform;
}
.lhc-link:hover .lhc-win,
.lhc-link:focus-visible .lhc-win{
  transform: translate3d(-2px,-2px,0);
  box-shadow: calc(var(--y2k-win-shadow-x, 6px) + 2px) calc(var(--y2k-win-shadow-x, 6px) + 2px) 0 rgba(24,12,58,.62);
}
.lhc-link:active .lhc-win{
  transform: translate3d(1px,1px,0);
  box-shadow: calc(var(--y2k-win-shadow-x, 6px) - 1px) calc(var(--y2k-win-shadow-x, 6px) - 1px) 0 rgba(24,12,58,.5);
}

/* Le décalage de repos de l'ombre suit celui de globals.css : 6px sur
   téléphone, 10px à partir de 1024px. Repris ici en variable pour que le
   survol s'y adosse au lieu de réécrire une valeur en dur qui décrocherait
   du reste des fenêtres du site sur grand écran. */
@media (min-width: 1024px){ .lhc-win{ --y2k-win-shadow-x: 10px } }

/* Zoom de la photo derrière son cadre creusé. */
.lhc-photo{ transition: transform 300ms ease-out }
.lhc-link:hover .lhc-photo,
.lhc-link:focus-visible .lhc-photo{ transform: scale(1.05) }

/* Voile CRT : mêmes lignes de balayage que les écrans du lecteur
   PLAYLIST_HIGHLIGHTS.EXE et de la borne, en beaucoup plus discret —
   la photo doit rester une photo, pas un moniteur. */
.lhc-scan{
  background-image: repeating-linear-gradient(to bottom, rgba(0,0,0,.34) 0 1px, rgba(0,0,0,0) 1px 3px);
  opacity: 0;
  transition: opacity 260ms ease-out;
}
.lhc-link:hover .lhc-scan,
.lhc-link:focus-visible .lhc-scan{ opacity: .55 }

@media (prefers-reduced-motion: reduce){
  .lhc-win,.lhc-photo,.lhc-scan{ transition: none; will-change: auto }
  .lhc-link:hover .lhc-win,.lhc-link:focus-visible .lhc-win,.lhc-link:active .lhc-win{ transform: none }
  .lhc-link:hover .lhc-photo,.lhc-link:focus-visible .lhc-photo{ transform: none }
}
`;

export function CategoryWindows() {
  const { t } = useLanguage();

  return (
    /* Padding bas seul, comme les modules qui suivent : sur cette page chaque
       module ne réserve que l'espace qui vient après lui. Ce bloc est le
       premier de `<main>`, il porte donc aussi le retrait d'après le hero
       (`pt`), rôle qui appartenait à PLAYLIST_HIGHLIGHTS.EXE avant qu'il ne
       passe en deuxième position. */
    <section id="categories" className="px-4 pt-[clamp(24px,min(8vw,5svh),96px)] pb-[clamp(48px,8vw,96px)] sm:px-6">
      <style>{CATEGORY_CSS}</style>

      {/* 1296px, pas `max-w-7xl` (1280px) : c'est le plafond que partagent
          ARCADE_SLOT, FILE_EXPLORER.SYS et le reste de l'accueil. À 1280 le
          bloc se serait décalé de 8px de chaque côté par rapport à ses
          voisins, écart petit mais parfaitement visible sur un grand écran,
          où les bords des fenêtres s'alignent verticalement. */}
      <div className="mx-auto w-full max-w-[1296px]">
        {/* Même étiquette de module que /histoire et /durabilite. Ton
            « paper » (violet + chevron rose) et non « wallpaper » (indigo +
            chevron blanc) : la variante wallpaper est pensée pour le violet
            soutenu du bas de page, mais tout en haut de `<main>`, juste sous
            le hero, les deux halos du fond d'écran ne sont pas encore
            arrivés — le fond y est presque blanc et le chevron blanc y
            disparaissait purement et simplement. */}
        <SectionLabel n="02" file="CATEGORIES.EXE" />

        {/* `items-stretch` (par défaut) plutôt qu'une hauteur imposée : les
            trois fenêtres ont la même photo de 380px et la même barre d'état,
            elles s'égalisent donc d'elles-mêmes. `h-full` sur la fenêtre reste
            là comme filet si un nom de rayon passe un jour sur deux lignes
            dans une langue plus bavarde que le français. */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {WINDOWS.map((w) => (
            <Link
              key={w.href}
              href={w.href}
              /* Nom accessible explicite : sans lui, il serait calculé à
                 partir de tout le contenu du lien, boutons de titre compris
                 (« ROBES.EXE _ × Robes [ OPEN_CATALOG ] »). Composé de deux
                 libellés déjà traduits dans les neuf langues, pour ne pas
                 laisser une phrase française dans un lien coréen. */
              aria-label={`${t.cat[w.catKey] ?? w.file} — ${t.lb.view}`}
              className="lhc-link group block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#7147d4]"
            >
              <WindowFrame
                title={w.file}
                icon={<Icon.folder width={16} height={13} />}
                className="lhc-win flex h-full flex-col"
                bodyClassName="flex flex-1 flex-col"
              >
                {/* Gouttière de fenêtre : la photo ne touche jamais le
                    cadre, comme le contenu d'une vraie fenêtre. */}
                <div className="bg-[#f0f0f5] p-2">
                  {/* Cadre creusé : arête sombre en haut à gauche, arête
                      claire en bas à droite — l'inverse du biseau en relief
                      des boutons. `overflow-hidden` retient le zoom de la
                      photo à l'intérieur du cadre. Fond noir : c'est lui
                      qu'on voit le temps que la photo se charge, pas un
                      rectangle blanc qui clignote. */}
                  <div className="relative h-[380px] w-full overflow-hidden border-2 border-t-[#5a5678] border-r-white border-b-white border-l-[#5a5678] bg-black">
                    <Image
                      src={w.src}
                      alt={w.alt}
                      fill
                      /* Trois colonnes au-delà de 768px, une seule en
                         dessous : sans cette indication le navigateur
                         télécharge la variante « pleine largeur de fenêtre »
                         pour une vignette qui ne fait qu'un tiers d'écran. */
                      sizes="(min-width: 1360px) 420px, (min-width: 768px) 33vw, 100vw"
                      className="lhc-photo object-cover object-center"
                    />
                    <span aria-hidden className="lhc-scan pointer-events-none absolute inset-0" />
                  </div>
                </div>

                {/* Barre d'état : le nom lisible du rayon d'un côté, le
                    bouton d'ouverture de l'autre. `mt-auto` la colle au bas
                    de la fenêtre si les trois cartes s'égalisent sur la plus
                    haute. */}
                <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t-2 border-[#c6c2d8] bg-[#e9e7f2] px-3 py-2.5">
                  <span
                    className={`${MONO} text-[0.9375rem] font-bold tracking-[0.1em] text-[#1E2430] uppercase`}
                  >
                    {t.cat[w.catKey] ?? w.file}
                  </span>
                  <span
                    className={`${MONO} shrink-0 rounded-full border border-[#c6c2d8] ${PLASTIC_FACE} px-3 py-1.5 text-[0.8125rem] font-bold tracking-[0.06em] text-[#262626] uppercase ${PLASTIC} group-hover:text-[#5b2fb8] group-focus-visible:text-[#5b2fb8]`}
                  >
                    [ OPEN_CATALOG ]
                  </span>
                </div>
              </WindowFrame>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
