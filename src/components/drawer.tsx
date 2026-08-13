"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n-context";
import { Icon } from "@/components/icons";
import { CATEGORIES } from "@/lib/categories";
import type { LangCode } from "@/lib/i18n";

/* Wording Y2K / file-explorer — propre au menu latéral, il ne remplace pas les
   traductions partagées (t.cat) utilisées ailleurs (lookbook, pages catégorie).
   Une entrée par langue : ces libellés étaient les mêmes en anglais quelle que
   soit la langue choisie, y compris sur un site qui s'ouvre en français.
   Les langues absentes de cette table retombent sur t.cat, qui est traduit
   partout — jamais sur de l'anglais. La numérotation, elle, est calculée à
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

const LINKS = CATEGORIES.map((c) => ({
  key: c.catKey,
  href: `/category/${c.handle}`,
  sub: c.sub?.map((s) => ({
    label: s.label,
    href: s.type ? `/category/${c.handle}?sub=${s.type}` : `/category/${c.handle}`,
    sub: s.sub?.map((ss) => ({
      label: ss.label,
      href: `/category/${c.handle}?sub=${ss.type}`,
    })),
  })),
}));

export function Drawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, lang } = useLanguage();

  /** « 01. Tops & t-shirts » — le numéro suit la position dans CATEGORIES. */
  const fileLabel = (key: string, i: number) =>
    `${String(i + 1).padStart(2, "0")}. ${DRAWER_LABELS[lang]?.[key] ?? t.cat[key] ?? key}`;

  const [expanded, setExpanded] = useState<number | null>(null);
  const [expandedSub, setExpandedSub] = useState<string | null>(null);

  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (!open) { setExpanded(null); setExpandedSub(null); }
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
              donc place au joystick, et la ligne d'attente reprend le jeton
              d'ARCADE_SLOT.EXE — déjà traduit dans les neuf langues. */}
          <div className="drawer-item drawer-item-closet">
            <a className="drawer-link drawer-link-closet" href="/dressing-machine" onClick={onClose}>
              <span className="dm-tile-marquee" aria-hidden="true">
                <span className="dm-tile-bulb" />
                <span className="dm-tile-bulb" />
                <span className="dm-tile-bulb" />
              </span>
              <span className="dm-tile-icon" aria-hidden="true">🕹️</span>
              <span className="dm-tile-text">
                <span className="dm-tile-title">00. Dressing Machine</span>
                <span className="dm-tile-sub">{t.home.slotCoin}</span>
              </span>
              <span className="dm-tile-play" aria-hidden="true">▶ PLAY</span>
            </a>
          </div>
          {LINKS.map((l, i) => (
            <div className={"drawer-item" + (l.sub && expanded === i ? " open" : "")} key={l.key}>
              {l.sub ? (
                <>
                  <div className="drawer-parent">
                    <a href={l.href} onClick={onClose} className="drawer-parent-link">
                      <Icon.folder className="drawer-folder-icon" aria-hidden="true" />
                      {fileLabel(l.key, i)}
                    </a>
                    <button
                      className="drawer-parent-toggle"
                      aria-expanded={expanded === i}
                      onClick={() => { setExpanded(expanded === i ? null : i); setExpandedSub(null); }}
                      aria-label="Ouvrir le sous-menu"
                    >
                      <Icon.chevD className="caret" />
                    </button>
                  </div>
                  <div className="drawer-sub">
                    <div className="drawer-sub-inner">
                      {l.sub.map((s) =>
                        s.sub ? (
                          <div key={s.href} className={"drawer-subsub-wrap" + (expandedSub === s.href ? " open" : "")}>
                            <button
                              className="drawer-subsub-toggle"
                              onClick={() => setExpandedSub(expandedSub === s.href ? null : s.href)}
                            >
                              <span className="drawer-file-icon" aria-hidden="true">📄</span>
                              {s.label}
                              <Icon.chevD className="caret-sm" />
                            </button>
                            <div className="drawer-subsub">
                              <a href={s.href} onClick={onClose} className="drawer-subsub-all">
                                <span className="drawer-file-icon" aria-hidden="true">📄</span>
                                Tout voir
                              </a>
                              {s.sub.map((ss) => (
                                <a key={ss.href} href={ss.href} onClick={onClose}>
                                  <span className="drawer-file-icon" aria-hidden="true">📄</span>
                                  {ss.label}
                                </a>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <a key={s.href} href={s.href} onClick={onClose}>
                            <span className="drawer-file-icon" aria-hidden="true">📄</span>
                            {s.label}
                          </a>
                        )
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <a className="drawer-link" href={l.href} onClick={onClose}>
                  <Icon.folder className="drawer-folder-icon" aria-hidden="true" />
                  {fileLabel(l.key, i)}
                </a>
              )}
            </div>
          ))}
          <div className="drawer-item drawer-item-contact">
            <a className="drawer-link drawer-link-contact" href="/contact" onClick={onClose}>
              <span aria-hidden="true">📞</span> Contact
            </a>
          </div>
        </nav>
      </aside>
    </>
  );
}
