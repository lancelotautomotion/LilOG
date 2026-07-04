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
  const [translateY, setTranslateY] = useState(0);
  const [wrapperHeight, setWrapperHeight] = useState<number>();

  // Keeps the gallery pinned to the viewport while the (much longer) info
  // column scrolls past, then lets it travel down with the page once its
  // companion column runs out — plain CSS `position: sticky` can't do this
  // because its containing block is the whole grid, not just this row.
  // Driven purely by `transform: translateY`, so it's compositor-only work
  // (no layout thrash from toggling position/top on every scroll frame).
  useEffect(() => {
    const wrapper = wrapperRef.current;
    const inner = innerRef.current;
    if (!wrapper || !inner) return;
    const row = (wrapper.closest(".pdp-row") as HTMLElement) ?? wrapper;

    let raf = 0;
    const update = () => {
      raf = 0;

      if (window.innerWidth < 1000) {
        setWrapperHeight(undefined);
        setTranslateY(0);
        return;
      }

      const rowHeight = row.offsetHeight;
      setWrapperHeight(rowHeight);

      const innerHeight = inner.offsetHeight;
      const rowTopPage = row.getBoundingClientRect().top + window.scrollY;
      const maxTranslate = Math.max(0, rowHeight - innerHeight);
      const desiredPageY = window.scrollY + topOffset();

      setTranslateY(Math.min(Math.max(desiredPageY - rowTopPage, 0), maxTranslate));
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const prev = () => setActive((i) => (i - 1 + count) % count);
  const next = () => setActive((i) => (i + 1) % count);

  return (
    <div className="pdp-gallery" ref={wrapperRef} style={{ height: wrapperHeight }}>
      <div
        className="pdp-gallery-inner"
        ref={innerRef}
        style={{ transform: `translateY(${translateY}px)` }}
      >
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
