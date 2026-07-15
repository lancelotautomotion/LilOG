"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n-context";
import { Icon } from "@/components/icons";
import { CATEGORIES } from "@/lib/categories";

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
  const { t } = useLanguage();
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
                <>
                  <button
                    className="drawer-parent"
                    aria-expanded={expanded === i}
                    onClick={() => { setExpanded(expanded === i ? null : i); setExpandedSub(null); }}
                  >
                    {t.cat[l.key]}
                    <Icon.chevD className="caret" />
                  </button>
                  <div className="drawer-sub">
                    <div className="drawer-sub-inner">
                      {l.sub.map((s) =>
                        s.sub ? (
                          <div key={s.href} className={"drawer-subsub-wrap" + (expandedSub === s.href ? " open" : "")}>
                            <button
                              className="drawer-subsub-toggle"
                              onClick={() => setExpandedSub(expandedSub === s.href ? null : s.href)}
                            >
                              {s.label}
                              <Icon.chevD className="caret-sm" />
                            </button>
                            <div className="drawer-subsub">
                              <a href={s.href} onClick={onClose} className="drawer-subsub-all">Tout voir</a>
                              {s.sub.map((ss) => (
                                <a key={ss.href} href={ss.href} onClick={onClose}>{ss.label}</a>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <a key={s.href} href={s.href} onClick={onClose}>{s.label}</a>
                        )
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <a className="drawer-link" href={l.href} onClick={onClose}>
                  {t.cat[l.key]}
                </a>
              )}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
