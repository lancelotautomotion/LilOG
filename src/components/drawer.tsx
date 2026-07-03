"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n-context";
import { Icon } from "@/components/icons";

const LINKS: { key: string; sub?: string[] }[] = [
  { key: "newin" },
  { key: "clothing", sub: ["tops", "shirts", "cardigans", "sweatshirts", "dresses", "skirts", "shorts", "jumpsuits", "jeans", "trousers", "leather", "lingerie", "swimwear"] },
  { key: "accessories", sub: ["jewelry", "scarves", "hats", "bags", "wallets", "sunglasses", "gloves", "belts"] },
  { key: "shoes", sub: ["sneakers", "heels", "flats", "ballet", "boots", "open"] },
  { key: "luxe" },
];

export function Drawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState<number | null>(null);

  // Reset the expanded sub-menu when the drawer closes — adjusted during
  // render (per React's "you might not need an effect" guidance) rather
  // than in a useEffect, to avoid an extra commit.
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (!open) setExpanded(null);
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
        <div className="drawer-top">
          <span className="mono-label">{t.menu.title}</span>
          <button className="drawer-close" onClick={onClose}>
            <Icon.x /> {t.menu.close}
          </button>
        </div>
        <nav className="drawer-nav">
          {LINKS.map((l, i) => (
            <div className={"drawer-item" + (l.sub && expanded === i ? " open" : "")} key={l.key}>
              {l.sub ? (
                <button
                  className="drawer-parent"
                  aria-expanded={expanded === i}
                  onClick={() => setExpanded(expanded === i ? null : i)}
                >
                  {t.cat[l.key]}
                  <Icon.chevD className="caret" />
                </button>
              ) : (
                <a className="drawer-link" href="#drops" onClick={onClose}>
                  {t.cat[l.key]}
                  <span className="idx">{String(i + 1).padStart(2, "0")}</span>
                </a>
              )}
              {l.sub && (
                <div className="drawer-sub">
                  <div className="drawer-sub-inner">
                    {l.sub.map((s) => (
                      <a key={s} href="#drops" onClick={onClose}>{t.cat[s]}</a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>
        <div className="drawer-foot">
          <div className="row">
            <a className="mono-label" href="#">{t.nav.search}</a>
            <a className="mono-label" href="#">{t.nav.login}</a>
            <a className="mono-label" href="#">{t.nav.bag}</a>
          </div>
          <div className="row">
            <a className="mono-label" href="#">Instagram</a>
            <a className="mono-label" href="#">TikTok</a>
            <a className="mono-label" href="#">{t.foot.selltous}</a>
          </div>
          <span className="mono-label" style={{ opacity: 0.5 }}>{t.foot.tagline}</span>
        </div>
      </aside>
    </>
  );
}
