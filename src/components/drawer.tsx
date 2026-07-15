"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n-context";
import { Icon } from "@/components/icons";
import { CATEGORIES } from "@/lib/categories";

const LINKS = CATEGORIES.map((c) => ({
  key: c.catKey,
  href: `/category/${c.handle}`,
}));

export function Drawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useLanguage();

  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) setPrevOpen(open);

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
          {LINKS.map((l) => (
            <div className="drawer-item" key={l.key}>
              <a className="drawer-link" href={l.href} onClick={onClose}>
                {t.cat[l.key]}
              </a>
            </div>
          ))}
        </nav>
        <div className="drawer-foot">
          <div className="row">
            <a className="mono-label" href="#">{t.nav.search}</a>
            <a className="mono-label" href="#">{t.nav.login}</a>
            <a className="mono-label" href="/cart">{t.nav.bag}</a>
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
