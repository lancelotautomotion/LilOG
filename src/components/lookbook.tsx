"use client";

import { useLanguage } from "@/lib/i18n-context";
import { SmartImg } from "@/components/smart-img";
import { Icon } from "@/components/icons";
import { LOOKBOOK } from "@/data/editorial-images";
import { CATEGORIES } from "@/lib/categories";

// Lookbook tile keys that correspond to a real category page — "skirts"
// covers the merged "Robes & Jupes" collection. Tiles without an entry here
// (newin, ogdresses, luxe) keep pointing at the homepage's Featured Drops.
const TILE_HREF: Record<string, string> = {
  tops: `/category/${CATEGORIES.find((c) => c.catKey === "tops")!.handle}`,
  skirts: `/category/${CATEGORIES.find((c) => c.catKey === "skirts")!.handle}`,
  accessories: "#drops",
  shoes: "#drops",
};

export function Lookbook() {
  const { t } = useLanguage();

  const nameOf = (k: string) => (k === "ogdresses" ? t.lb.ogdresses : (t.cat[k] || k));
  const ctaOf = (k: string) => (k === "view" ? t.lb.view : (t.lb.shop + " " + (t.cat[k] || k)));

  return (
    <section className="lookbook" id="lookbook">
      {LOOKBOOK.map((p, idx) =>
        p.type === "split" ? (
          <div className="lb-split" key={idx}>
            {p.items.map((c, j) => (
              <a className="lb-cell" href={TILE_HREF[c.key] ?? "#drops"} key={j}>
                <SmartImg src={c.img} alt={nameOf(c.key)} tone={c.tone} />
                <div className="lb-cap">
                  <h2 className="lb-name">{nameOf(c.key)}</h2>
                  <span className="lb-link">{t.lb.shop + " " + nameOf(c.key)} <Icon.upRight /></span>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <a className={"lb-full align-" + p.align} href={TILE_HREF[p.name] ?? "#drops"} key={idx}>
            <SmartImg src={p.img} alt={nameOf(p.name)} tone={p.tone} />
            <div className="lb-cap">
              {p.kicker && <span className="lb-kicker">{t.lb[p.kicker]}</span>}
              <h2 className="lb-name">{nameOf(p.name)}</h2>
              {p.cta && <span className="lb-link">{ctaOf(p.cta)} <Icon.upRight /></span>}
            </div>
          </a>
        )
      )}
    </section>
  );
}
