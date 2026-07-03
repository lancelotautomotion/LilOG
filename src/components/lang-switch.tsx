"use client";

import { useEffect, useRef, useState } from "react";
import { LANGS } from "@/lib/i18n";
import { useLanguage } from "@/lib/i18n-context";
import { Icon } from "@/components/icons";

export function LangSwitch() {
  const { lang, setLang } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  const cur = LANGS.find((l) => l.code === lang) || LANGS[0];

  return (
    <div className={"lang-switch" + (open ? " open" : "")} ref={ref}>
      <button
        className="nav-link lang-btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {cur.label} <Icon.chevD className="lang-caret" />
      </button>
      <div className="lang-menu" role="listbox">
        {LANGS.map((l) => (
          <button
            key={l.code}
            role="option"
            aria-selected={l.code === lang}
            className={"lang-opt" + (l.code === lang ? " on" : "")}
            onClick={() => {
              setLang(l.code);
              setOpen(false);
            }}
          >
            <span className="lang-code">{l.label}</span>
            <span className="lang-native">{l.native}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
