"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
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
  const [pinStyle, setPinStyle] = useState<CSSProperties>({});
  const [wrapperHeight, setWrapperHeight] = useState<number>();

  // Pins the gallery to the viewport while the (much longer) info column
  // scrolls past, then docks it at the bottom of the row once its companion
  // column runs out — plain CSS `position: sticky` can't do this because its
  // containing block is the whole grid, not just this row (see git history).
  useEffect(() => {
    const wrapper = wrapperRef.current;
    const inner = innerRef.current;
    if (!wrapper || !inner) return;
    // The release point is governed by the whole row's height (i.e. the
    // taller info column), not the gallery's own — otherwise it "docks"
    // the instant it would start pinning.
    const row = wrapper.closest(".pdp-row") as HTMLElement | null;

    let raf = 0;
    const update = () => {
      raf = 0;
      // Stretch the wrapper to the full row height (matching the taller info
      // column) so "dock at wrapper bottom" lands at the row's actual bottom
      // instead of the gallery's own (shorter) natural height.
      setWrapperHeight((row ?? wrapper).offsetHeight);

      if (window.innerWidth < 1000) {
        setPinStyle({});
        return;
      }

      const colRect = wrapper.getBoundingClientRect();
      const offset = topOffset();

      if (colRect.top > offset) {
        setPinStyle({});
      } else if (colRect.bottom - inner.offsetHeight < offset) {
        setPinStyle({ position: "absolute", left: 0, right: 0, bottom: 0 });
      } else {
        setPinStyle({ position: "fixed", top: offset, left: colRect.left, width: colRect.width });
      }
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
      <div className="pdp-gallery-inner" ref={innerRef} style={pinStyle}>
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
