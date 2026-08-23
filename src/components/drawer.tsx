"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n-context";
import { Icon } from "@/components/icons";
import { CATEGORIES } from "@/lib/categories";
import type { LangCode } from "@/lib/i18n";

/* Wording Y2K / file-explorer : propre au menu latéral, il ne remplace pas les
   traductions partagées (t.cat) utilisées ailleurs (lookbook, pages catégorie).
   Une entrée par langue : ces libellés étaient les mêmes en anglais quelle que
   soit la langue choisie, y compris sur un site qui s'ouvre en français.
   Les langues absentes de cette table retombent sur t.cat, qui est traduit
   partout, jamais sur de l'anglais. La numérotation, elle, est calculée à
   l'affichage : identique dans toutes les langues, et elle se réordonne toute
   seule si CATEGORIES change. */
const DRAWER_LABELS: Partial<Record<LangCode, Record<string, string>>> = {
  fr: {
    tops: "Top & Baby tee",
    outerwear: "Vestes & manteaux",
    dresses: "Robes & nuisettes",
    skirts: "Minijupes & jupes",
    shorts: "Shorts",
    trousers: "Pantalons & pantacourts",
    swimwear: "Maillots & bikinis",
    jeans: "Jeans & pattes d'eph",
    bags: "Sacs & pochettes",
    shoes: "Baskets & talons",
    accessories: "Bijoux & accessoires",
  },
  en: {
    tops: "Tops & baby tees",
    outerwear: "Outerwear / coats",
    dresses: "Slip dresses & co",
    skirts: "Micro & mini skirts",
    shorts: "Shorts",
    trousers: "Low-rise & bottoms",
    swimwear: "Swimwear / bikinis",
    jeans: "Denim & flares",
    bags: "It-bags & purses",
    shoes: "Chunky kicks & heels",
    accessories: "Bling & accessories",
  },
};

const LINKS = CATEGORIES.map((c) => ({ key: c.catKey, href: `/category/${c.handle}` }));

/**
 * Une pastille de la grille "Catégories" : dossier système sélectionnable,
 * façon explorateur Windows. `min-h-11` plutôt qu'une hauteur figée : un
 * libellé long (« Pantalons & pantacourts ») passe sur deux lignes au lieu
 * d'être coupé, et l'étirement par défaut des grilles CSS aligne quand même
 * sa voisine de rangée sur la même hauteur — la régularité vient de la
 * grille, pas d'une troncature qui aurait mangé le nom du rayon.
 *
 * L'icône reste le dossier jaune vintage au repos ; au survol elle bascule
 * sur sa variante blanche (fills figés dans le SVG, `currentColor` n'aurait
 * aucun effet dessus) pendant que le fond passe au rose néon de la maison.
 */
function DrawerCategoryLink({
  href,
  open,
  onClick,
  children,
}: {
  href: string;
  open?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  const FolderIcon = open ? Icon.folderOpen : Icon.folder;
  return (
    <a
      href={href}
      onClick={onClick}
      className="group flex min-h-11 items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 font-[family-name:var(--mono)] text-[11px] font-bold tracking-tight text-gray-800 uppercase transition-all duration-150 hover:border-dashed hover:border-white/50 hover:bg-pink-500 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7147d4]"
    >
      <span aria-hidden className="relative mt-0.5 grid h-3.5 w-4 shrink-0 place-items-center self-start">
        <FolderIcon className="absolute inset-0 h-full w-full transition-opacity duration-150 group-hover:opacity-0" />
        <FolderIcon className="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-150 group-hover:opacity-100 [&_path]:!fill-white [&_path]:!stroke-white" />
      </span>
      <span className="min-w-0 flex-1 leading-snug break-words">{children}</span>
    </a>
  );
}

export function Drawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, lang } = useLanguage();

  /** « 01. Tops & t-shirts » : le numéro suit la position dans CATEGORIES. */
  const fileLabel = (key: string, i: number) =>
    `${String(i + 1).padStart(2, "0")}. ${DRAWER_LABELS[lang]?.[key] ?? t.cat[key] ?? key}`;

  const [categoriesOpen, setCategoriesOpen] = useState(false);

  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (!open) setCategoriesOpen(false);
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <>
      <div className={"drawer-scrim" + (open ? " open" : "")} onClick={onClose}></div>
      <aside className={"drawer" + (open ? " open" : "")} aria-hidden={!open}>
        {/* Win95 title bar */}
        <div className="drawer-w95-bar">
          <span className="drawer-w95-title">{t.menu.title}</span>
          <div className="drawer-w95-dots">
            <span>_</span>
            <span>□</span>
            <button className="drawer-w95-close" onClick={onClose} aria-label={t.menu.close}>×</button>
          </div>
        </div>
        <nav className="drawer-nav">
          {/* La Dressing Machine n'est pas un rayon : c'est la borne d'arcade
              de l'accueil, réduite à une ligne de menu. Le dossier jaune laisse
              donc place au joystick, avec sa propre accroche (dmTagline),
              traduite dans les neuf langues. */}
          <div className="drawer-item">
            <a className="drawer-link drawer-link-closet" href="/dressing-machine" onClick={onClose}>
              <span className="dm-tile-marquee" aria-hidden="true">
                <span className="dm-tile-bulb" />
                <span className="dm-tile-bulb" />
                <span className="dm-tile-bulb" />
              </span>
              <span className="dm-tile-icon" aria-hidden="true">🕹️</span>
              <span className="dm-tile-text">
                <span className="dm-tile-title">00. Dressing Machine</span>
                <span className="dm-tile-sub">{t.menu.dmTagline}</span>
              </span>
              <span className="dm-tile-play" aria-hidden="true">▶ PLAY</span>
            </a>
          </div>
          {/* Catégories : un seul accordéon qui regroupe "Tout voir" et les
              rayons, là où chaque rayon dépliait auparavant ses propres
              sous-catégories. Plus dense à refermé, plus simple à parcourir
              une fois ouvert. */}
          <div className={"drawer-item" + (categoriesOpen ? " open" : "")}>
            <button
              type="button"
              className="drawer-link drawer-parent"
              aria-expanded={categoriesOpen}
              onClick={() => setCategoriesOpen((o) => !o)}
            >
              <Icon.folder className="drawer-folder-icon" aria-hidden="true" />
              Catégories
              <Icon.chevD className="caret" />
            </button>
            <div className="drawer-sub">
              <div className="mt-1.5 grid grid-cols-2 gap-2.5 rounded-lg border border-gray-200 bg-gray-100/60 p-2.5 max-[360px]:grid-cols-1">
                <DrawerCategoryLink href="/catalogue" onClick={onClose} open>
                  Tout voir
                </DrawerCategoryLink>
                {LINKS.map((l, i) => (
                  <DrawerCategoryLink key={l.key} href={l.href} onClick={onClose}>
                    {fileLabel(l.key, i)}
                  </DrawerCategoryLink>
                ))}
              </div>
            </div>
          </div>
          <div className="drawer-item">
            <a className="drawer-link" href="/gift-card" onClick={onClose}>
              <span aria-hidden="true">💳</span> Carte cadeau
            </a>
          </div>
          <div className="drawer-item">
            <a className="drawer-link drawer-link-contact" href="/contact" onClick={onClose}>
              <span aria-hidden="true">📞</span> Contact
            </a>
          </div>
        </nav>
      </aside>
    </>
  );
}
