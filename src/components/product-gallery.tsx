"use client";

import { useState } from "react";
import { SmartImg } from "@/components/smart-img";
import { Icon } from "@/components/icons";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const count = images.length;

  const prev = () => setActive((i) => (i - 1 + count) % count);
  const next = () => setActive((i) => (i + 1) % count);

  return (
    <div className="pdp-gallery">
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
  );
}
