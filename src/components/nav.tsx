"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useLanguage } from "@/lib/i18n-context";
import { useCart } from "@/lib/cart-context";
import { LangSwitch } from "@/components/lang-switch";
import logoWhite from "../../public/logo-white.png";
import logoBlack from "../../public/logo-black.png";

export function Nav({ onMenu, forceSolid }: { onMenu: () => void; forceSolid?: boolean }) {
  const { t } = useLanguage();
  const { count } = useCart();
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    if (forceSolid) return;
    const onScroll = () => setSolid(window.scrollY > window.innerHeight * 0.72);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [forceSolid]);

  return (
    <nav className={"nav" + (forceSolid || solid ? " solid" : "")}>
      <button className="menu-btn" aria-label="Open menu" onClick={onMenu}>
        <span></span><span></span><span></span>
      </button>
      <a className="nav-brand" href="#top" aria-label="Lil'OG">
        <Image className="brand-logo light" src={logoWhite} alt="Lil'OG" priority />
        <Image className="brand-logo dark" src={logoBlack} alt="Lil'OG" priority />
      </a>
      <div className="nav-right">
        <a className="nav-link nav-search" href="#drops">{t.nav.search}</a>
        <div className="nav-account">
          <a className="nav-link" href="#">{t.nav.bag} <span className="count">{count}</span></a>
          <a className="nav-link" href="#">{t.nav.login}</a>
          <LangSwitch />
        </div>
      </div>
    </nav>
  );
}
