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

/* Liens système secondaires : mêmes destinations que les raccourcis du
   footer (LIVRAISON.DOC, FAQ), sous un habillage "fichier système" plus
   discret que les gros boutons du menu, pour combler la fin de la liste
   sans reproduire les mêmes cartes qu'au-dessus. */
const UTILITY_LINKS = [
  { href: "/histoire", icon: "📄", label: "README.TXT" },
  { href: "/faq", icon: "❓", label: "HELP_DESK.EXE" },
  { href: "/livraison", icon: "📦", label: "SHIPPING_PROTOCOL.SYS" },
];

/* Réseaux sociaux : mêmes comptes que le footer (LIL_OG_TASKBAR.EXE). */
const SOCIAL_LINKS = [
  { href: "https://www.instagram.com/lounaliliguitton/", icon: "📸", label: "[ CONNECT TO INSTA ]" },
  { href: "https://www.tiktok.com/", icon: "🎵", label: "[ CONNECT TO TIKTOK ]" },
];

/**
 * Horloge locale du system tray. Ne peut pas être rendue côté serveur (le
 * HTML livré figerait l'heure du build), donc cadran vide jusqu'au montage,
 * puis recalage sur la minute pleine — même logique que la Tray du footer.
 */
function useDrawerClock(): string | null {
  const [clock, setClock] = useState<string | null>(null);

  useEffect(() => {
    const render = () =>
      setClock(new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }));
    render();

    let interval: ReturnType<typeof setInterval> | undefined;
    const timeout = setTimeout(() => {
      render();
      interval = setInterval(render, 60_000);
    }, 60_000 - (Date.now() % 60_000));

    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, []);

  return clock;
}

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
  const clock = useDrawerClock();

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

          {/* Liens système secondaires : discrets, fond transparent, pour
              ne pas rivaliser avec les gros boutons du dessus. Même bleu de
              survol que .drawer-link ailleurs dans ce menu, même gris violacé
              que les taglines du footer (#6b6480), plutôt qu'un gris neutre
              étranger à la palette du site. */}
          <div className="mt-1 flex flex-col gap-0.5">
            {UTILITY_LINKS.map((u) => (
              <a
                key={u.href}
                href={u.href}
                onClick={onClose}
                className="flex items-center gap-2 rounded px-2 py-1.5 font-[family-name:var(--mono)] text-[12px] font-bold tracking-tight text-[#6b6480] uppercase transition-colors duration-150 hover:text-[#1D35D9] hover:underline"
              >
                <span aria-hidden className="shrink-0 text-[13px] leading-none">{u.icon}</span>
                {u.label}
              </a>
            ))}
          </div>

          {/* Réseaux sociaux : même plastique chromé que les boutons du
              footer (dégradé + relief PLASTIC/PLASTIC_PRESS), pas un bevel
              Windows gris qui jurerait avec le reste du menu. */}
          <div className="mt-2 grid grid-cols-2 gap-2">
            {SOCIAL_LINKS.map((s) => (
              <a
                key={s.href}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 rounded-lg border border-[#c6c2d8] bg-[linear-gradient(180deg,#fdfdff_0%,#ebe9f4_48%,#d3d0e1_100%)] px-2 py-2.5 font-[family-name:var(--mono)] text-[10px] font-bold tracking-tight text-[#3b1d8f] uppercase shadow-[inset_0_2px_4px_rgba(255,255,255,0.95),inset_0_-2px_5px_rgba(0,0,0,0.25),0_2px_3px_rgba(30,36,48,0.18)] transition hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7147d4] active:scale-95 active:shadow-[inset_0_3px_6px_rgba(0,0,0,0.32),inset_0_-1px_0_rgba(255,255,255,0.7)]"
              >
                <span aria-hidden>{s.icon}</span>
                <span className="truncate">{s.label}</span>
              </a>
            ))}
          </div>

          {/* System tray : ancré en bas du menu (mt-auto), même quand la
              liste au-dessus est courte. Même coque plastique que le reste
              du site (dégradé lilas + relief), l'écran LCD noir/vert du
              compteur ressort dessus comme un vrai boîtier rétro plutôt que
              de flotter sur un gris plat Windows 95. */}
          <div className="mt-auto flex items-center justify-between gap-2 rounded-xl border border-[#c6c2d8] bg-[linear-gradient(180deg,#fdfdff_0%,#ebe9f4_48%,#d3d0e1_100%)] px-2.5 py-2 shadow-[inset_0_2px_4px_rgba(255,255,255,0.95),inset_0_-2px_5px_rgba(0,0,0,0.25),0_2px_3px_rgba(30,36,48,0.18)]">
            <div className="rounded-md border border-black/50 bg-black px-2 py-1 font-[family-name:var(--font-lcd)] text-[13px] tracking-[0.08em] text-[#39ff6a] shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)]">
              VISITEURS : 012458
            </div>
            <div className="flex items-center gap-1.5 font-[family-name:var(--mono)] text-[11px] font-bold text-[#3b1d8f]">
              <span aria-hidden>🌐</span>
              <time suppressHydrationWarning>{clock ?? "--:--"}</time>
            </div>
          </div>
        </nav>
      </aside>
    </>
  );
}
