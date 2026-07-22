"use client";

import { useState } from "react";
import { SmartImg } from "@/components/smart-img";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [lightbox, setLightbox] = useState<number | null>(null);

  // Build exactly 4 slots — repeat images if fewer than 4
  const slots: string[] = Array.from({ length: 4 }, (_, i) => images[i % Math.max(images.length, 1)] ?? "");

  return (
    <>
      <div className="pdp-gallery">
        <div className="pdp-grid2x2">
          {slots.map((src, i) => (
            <button key={i} className="pdp-grid-cell" onClick={() => setLightbox(i)} aria-label={`Voir photo ${i + 1}`}>
              <SmartImg src={src} alt={`${name} — vue ${i + 1}`} tone={i} />
            </button>
          ))}
        </div>
      </div>

      {lightbox !== null && (
        <div className="pdp-lightbox" onClick={() => setLightbox(null)}>
          <button className="pdp-lightbox-close" aria-label="Fermer">✕</button>
          <div className="pdp-lightbox-nav">
            <button onClick={(e) => { e.stopPropagation(); setLightbox((lightbox - 1 + images.length) % images.length); }}>←</button>
            <img src={images[lightbox % images.length]} alt={name} />
            <button onClick={(e) => { e.stopPropagation(); setLightbox((lightbox + 1) % images.length); }}>→</button>
          </div>
        </div>
      )}
    </>
  );
}
