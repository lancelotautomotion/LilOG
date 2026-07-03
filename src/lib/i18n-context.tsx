"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { DICT, type LangCode, type Dict } from "@/lib/i18n";

const STORAGE_KEY = "lilog-lang";

const LanguageContext = createContext<{
  lang: LangCode;
  setLang: (l: LangCode) => void;
  t: Dict;
} | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<LangCode>("fr");

  useEffect(() => {
    // Reads localStorage (unavailable during SSR), so this can only run
    // client-side post-mount — the brief default-locale flash is intentional.
    const stored = localStorage.getItem(STORAGE_KEY) as LangCode | null;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored && DICT[stored]) setLang(stored);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: DICT[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}
