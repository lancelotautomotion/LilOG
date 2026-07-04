"use client";

import { useEffect, useRef, useState } from "react";
import { SmartImg } from "@/components/smart-img";
import { Icon } from "@/components/icons";

// How far from the viewport top the gallery pins while scrolling — mirrors
// the nav's clamp(96px, 11vw, 130px) height so it never sits under it.
function topOffset() {
  return Math.min(130, Math.max(96, window.innerWidth * 0.11));
}

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const count = images.length;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  // Keeps the gallery pinned to the viewport while the (much longer) info
  // column scrolls past, then lets it travel down with the page once its
  // companion column runs out — plain CSS `position: sticky` can't do this
  // because its containing block is the whole grid, not just this row.
  // Driven purely by `transform: translateY`, so it's compositor-only work
  // (no layout thrash from toggling position/top on every scroll frame).
  // The transform is written straight to the DOM via the ref on every scroll
  // frame instead of through React state — a state update would re-render
  // (and re-run this effect's callers) 60+ times a second, which is enough
  // overhead on some machines to show up as a stutter.
  useEffect(() => {
    const wrapper = wrapperRef.current;
    const inner = innerRef.current;
    if (!wrapper || !inner) return;
    const row = (wrapper.closest(".pdp-row") as HTMLElement) ?? wrapper;

    // Row/inner height only change on resize (or content/image load), so
    // they're measured separately from the per-scroll-frame hot path below.
    let rowHeight = 0;
    let innerHeight = 0;
    const measure = () => {
      rowHeight = row.offsetHeight;
      innerHeight = inner.offsetHeight;
      applyForScroll();
    };

    let raf = 0;
    const applyForScroll = () => {
      raf = 0;

      if (window.innerWidth < 1000) {
        inner.style.transform = "";
        return;
      }

      const rowTopPage = row.getBoundingClientRect().top + window.scrollY;
      const maxTranslate = Math.max(0, rowHeight - innerHeight);
      const desiredPageY = window.scrollY + topOffset();
      const translateY = Math.min(Math.max(desiredPageY - rowTopPage, 0), maxTranslate);

      inner.style.transform = `translateY(${translateY}px)`;
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(applyForScroll);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const prev = () => setActive((i) => (i - 1 + count) % count);
  const next = () => setActive((i) => (i + 1) % count);

  return (
    <div className="pdp-gallery" ref={wrapperRef}>
      <div className="pdp-gallery-inner" ref={innerRef}>
        <div className="pdp-frame">
          {images.map((src, i) => (
            <SmartImg key={src + i} className={i === active ? "on" : ""} src={src} alt={name} tone={i} />
          ))}
          {count > 1 && (
            <>
              <button className="pdp-arrow prev" aria-label="Previous photo" onClick={prev}>
                <Icon.arrowL />
              </button>
              <button className="pdp-arrow next" aria-label="Next photo" onClick={next}>
                <Icon.arrowR />
              </button>
            </>
          )}
        </div>
        {count > 1 && (
          <div className="pdp-dots">
            {images.map((_, i) => (
              <button
                key={i}
                className={i === active ? "on" : ""}
                aria-label={`Photo ${i + 1}`}
                onClick={() => setActive(i)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
