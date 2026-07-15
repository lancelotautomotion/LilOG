"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/lib/i18n-context";
import { useCart } from "@/lib/cart-context";
import { LangSwitch } from "@/components/lang-switch";
import { Icon } from "@/components/icons";
import logoWhite from "../../public/logo-white.png";
import logoBlack from "../../public/logo-black.png";

export function Nav({ onMenu, forceSolid }: { onMenu: () => void; forceSolid?: boolean }) {
  const { t } = useLanguage();
  const { count } = useCart();
  const { data: session } = useSession();
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    if (forceSolid) return;
    const onScroll = () => setSolid(window.scrollY > window.innerHeight * 0.72);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [forceSolid]);

  return (
    <nav className={"nav" + (forceSolid || solid ? " solid" : "")}>
      <div className="nav-left">
        <button className="menu-btn" aria-label="Open menu" onClick={onMenu}>
          <span></span><span></span><span></span>
        </button>
        <a className="nav-icon-btn" href="#drops" aria-label={t.nav.search}>
          <Icon.search width={18} height={18} />
        </a>
      </div>
      <a className="nav-brand" href="#top" aria-label="Lil'OG">
        <Image className="brand-logo light" src={logoWhite} alt="Lil'OG" priority />
        <Image className="brand-logo dark" src={logoBlack} alt="Lil'OG" priority />
      </a>
      <div className="nav-right">
        <div className="nav-account">
          <Link className="nav-link" href={session ? "/account" : "/login"}>
            {session ? (session.user?.name?.split(" ")[0] ?? "Mon compte") : t.nav.login}
          </Link>
          <Link className="nav-icon-btn" href="/cart" aria-label={t.nav.bag}>
            <Icon.bag width={18} height={18} />
            {count > 0 && <span className="count">{count}</span>}
          </Link>
          <LangSwitch />
        </div>
      </div>
    </nav>
  );
}
