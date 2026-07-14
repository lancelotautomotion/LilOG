"use client";

import Image from "next/image";
import { useLanguage } from "@/lib/i18n-context";
import logoWhite from "../../public/logo-white.png";

export function Footer() {
  const { t } = useLanguage();

  const cols = [
    { h: t.footer.shop, links: ["newin", "clothing", "accessories", "shoes", "luxe"].map((k) => t.cat[k]) },
    { h: t.footer.help, links: t.footer.helpLinks },
    { h: t.footer.about, links: t.footer.aboutLinks },
  ];

  return (
    <footer className="footer">
      <div className="footer-brand">
        <Image className="footer-logo" src={logoWhite} alt="Lil'OG" />
      </div>
      <div className="footer-cols">
        <div className="footer-news">
          <h4>{t.footer.newsH}</h4>
          <p>{t.footer.newsP}</p>
          <form onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder={t.footer.email} aria-label="Email" />
            <button type="submit">{t.footer.join}</button>
          </form>
        </div>
        {cols.map((c) => (
          <div key={c.h}>
            <h4>{c.h}</h4>
            <ul>{c.links.map((l) => (
              <li key={l}>
                <a href={l === t.footer.aboutLinks[1] ? "/durabilite" : l === t.footer.aboutLinks[0] ? "/histoire" : "#"}>{l}</a>
              </li>
            ))}</ul>
          </div>
        ))}
      </div>
      <div className="footer-bottom">
        <span>{t.footer.copy}</span>
        <span>{t.footer.legal}</span>
      </div>
    </footer>
  );
}
