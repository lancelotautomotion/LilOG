"use client";

import { useState, useEffect, useRef } from "react";
import { Nav } from "@/components/nav";
import { Drawer } from "@/components/drawer";
import { Footer } from "@/components/footer";

export interface LegalSection {
  id: string;
  title: string;
  num: string;
  content: React.ReactNode;
}

interface LegalShellProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  date: string;
  sections: LegalSection[];
}

export function LegalShell({ eyebrow, title, subtitle, date, sections }: LegalShellProps) {
  const [menu, setMenu] = useState(false);
  const [active, setActive] = useState(sections[0]?.id ?? "");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    );
    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observerRef.current?.observe(el);
    });
    return () => observerRef.current?.disconnect();
  }, [sections]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const offset = 100;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <>
      <Nav onMenu={() => setMenu(true)} forceSolid />
      <Drawer open={menu} onClose={() => setMenu(false)} />
      <main className="legal-page">

        {/* ── Win95 hero window ── */}
        <div className="legal-win95-hero">
          <div className="w95-bar">
            <span className="w95-title">{eyebrow} — {title}</span>
            <div className="w95-dots"><span /><span /><span /></div>
          </div>
          <div className="legal-win95-hero-body">
            <p className="static-eyebrow">{eyebrow}</p>
            <h1 className="static-title">{title}</h1>
            {subtitle && <p className="legal-win95-subtitle">{subtitle}</p>}
            <p className="legal-date">Version en vigueur : {date}</p>
          </div>
        </div>

        {/* ── Win95 content window ── */}
        <div className="legal-win95-main">
          <div className="w95-bar">
            <span className="w95-title">Contenu</span>
            <div className="w95-dots"><span /><span /><span /></div>
          </div>
          <div className="legal-body">
            <aside className="legal-sidebar">
              <p className="legal-sidebar-label">Sommaire</p>
              <nav>
                {sections.map(({ id, num, title: t }) => (
                  <button
                    key={id}
                    className={`legal-nav-item${active === id ? " legal-nav-item--active" : ""}`}
                    onClick={() => scrollTo(id)}
                  >
                    <span className="legal-nav-num">{num}.</span>
                    <span>{t}</span>
                  </button>
                ))}
              </nav>
            </aside>

            <div className="legal-content">
              {sections.map(({ id, num, title: t, content }) => (
                <section key={id} id={id} className="legal-section">
                  <h2 className="legal-section-title">
                    <span className="legal-section-num">{num}.</span> {t}
                  </h2>
                  <div className="legal-section-body">{content}</div>
                </section>
              ))}
            </div>
          </div>
        </div>

      </main>
      <Footer />
    </>
  );
}
