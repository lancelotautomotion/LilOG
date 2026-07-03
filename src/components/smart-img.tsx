"use client";

import { placeholder } from "@/lib/placeholder";

interface SmartImgProps {
  src: string;
  alt?: string;
  className?: string;
  tone?: number;
}

// Keeps an <img> element even on failure (swaps to a branded data-URI),
// so CSS hover/opacity transitions keep working without a layout shift.
export function SmartImg({ src, alt, className, tone = 0 }: SmartImgProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- remote/data-URI src swapped on error; next/image can't do that.
    <img
      className={className}
      src={src}
      alt={alt || ""}
      loading="lazy"
      onError={(e) => {
        const target = e.currentTarget;
        if (!target.dataset.fb) {
          target.dataset.fb = "1";
          target.src = placeholder(alt, tone);
        }
      }}
    />
  );
}
