"use client";

import { useLanguage } from "@/lib/i18n-context";
import { SmartImg } from "@/components/smart-img";
import { EDITORIAL_IMG } from "@/data/editorial-images";

export function Editorial() {
  const { t } = useLanguage();

  return (
    <section className="section editorial" id="story">
      <div className="editorial-grid">
        <div className="editorial-media">
          <SmartImg src={EDITORIAL_IMG} alt={t.ed.eyebrow} tone={1} />
        </div>
        <div className="editorial-body">
          <div className="eyebrow">{t.ed.eyebrow}</div>
          <h2>
            {t.ed.title.map((s, i) => (typeof s === "string" ? s : <em key={i}>{s.em}</em>))}
          </h2>
          <p>{t.ed.p1}</p>
          <p>{t.ed.p2}</p>
          <div className="editorial-stats">
            {t.ed.stats.map(([n, l], i) => (
              <div className="stat" key={i}>
                <div className="n">{n}</div>
                <div className="l">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
