"use client";

import Image from "next/image";
import { useLanguage } from "@/lib/i18n-context";
import logoWhite from "../../public/logo-white.png";

const LEGAL_HREFS: Record<string, string> = {
  "CGV": "/cgv",
  "Mentions légales": "/mentions-legales",
  "Confidentialité": "/confidentialite",
  "Cookies": "/cookies",
  "Legal notices": "/mentions-legales",
  "Privacy": "/confidentialite",
  "Aviso legal": "/mentions-legales",
  "Privacidad": "/confidentialite",
  "Note legali": "/mentions-legales",
  "Impressum": "/mentions-legales",
  "Datenschutz": "/confidentialite",
  "AGB": "/cgv",
  "Реквизиты": "/mentions-legales",
  "Конфиденциальность": "/confidentialite",
  "Условия": "/cgv",
  "法律声明": "/mentions-legales",
  "隐私": "/confidentialite",
  "条款": "/cgv",
  "法的通知": "/mentions-legales",
  "プライバシー": "/confidentialite",
  "利用規約": "/cgv",
  "법적고지": "/mentions-legales",
  "개인정보": "/confidentialite",
  "이용약관": "/cgv",
};

export function Footer() {
  const { t } = useLanguage();

  const helpHref = (l: string) => {
    if (l === t.footer.helpLinks[0]) return "/livraison";
    if (l === t.footer.helpLinks[1]) return "/retours";
    if (l === "FAQ") return "/faq";
    return "#";
  };

  const aboutHref = (l: string) => {
    if (l === t.footer.aboutLinks[0]) return "/histoire";
    if (l === t.footer.aboutLinks[1]) return "/durabilite";
    return "#";
  };

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

        <div>
          <h4>{t.footer.shop}</h4>
          <ul>{["newin", "clothing", "accessories", "shoes", "luxe"].map((k) => (
            <li key={k}><a href="#">{t.cat[k]}</a></li>
          ))}</ul>
        </div>

        <div>
          <h4>{t.footer.help}</h4>
          <ul>{t.footer.helpLinks.map((l) => (
            <li key={l}><a href={helpHref(l)}>{l}</a></li>
          ))}</ul>
        </div>

        <div>
          <h4>{t.footer.about}</h4>
          <ul>{t.footer.aboutLinks.map((l) => (
            <li key={l}><a href={aboutHref(l)}>{l}</a></li>
          ))}</ul>
        </div>

        <div>
          <h4>{t.footer.legalH}</h4>
          <ul>{t.footer.legalLinks.map((l) => (
            <li key={l}><a href={LEGAL_HREFS[l] ?? "#"}>{l}</a></li>
          ))}</ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span>{t.footer.copy}</span>
        <span>{t.footer.legal}</span>
      </div>
    </footer>
  );
}
