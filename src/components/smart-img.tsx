"use client";

import { placeholder } from "@/lib/placeholder";
import { fallbackSrc, imageSrcSet } from "@/lib/shopify/image-url";

interface SmartImgProps {
  src: string;
  alt?: string;
  className?: string;
  tone?: number;
  /** La place que l'image occupe à l'écran, en syntaxe `sizes`. Sans elle,
   *  le navigateur suppose 100 % de la largeur du viewport et choisit donc
   *  systématiquement la plus grande variante — ce qui annulerait tout le
   *  bénéfice du `srcset`. À renseigner à chaque emplacement. */
  sizes?: string;
  /** Image visible sans défilement : on la charge tout de suite, en priorité,
   *  au lieu de la différer. Réservé à ce qui est réellement au-dessus de la
   *  ligne de flottaison — au-delà, cela retarde le reste. */
  priority?: boolean;
}

// Keeps an <img> element even on failure (swaps to a branded data-URI),
// so CSS hover/opacity transitions keep working without a layout shift.
export function SmartImg({ src, alt, className, tone = 0, sizes, priority = false }: SmartImgProps) {
  /* Absent hors CDN Shopify (photo locale, data-URI du repli) : on laisse
     alors passer l'URL telle quelle. */
  const srcSet = imageSrcSet(src);

  return (
    // eslint-disable-next-line @next/next/no-img-element -- remote/data-URI src swapped on error; next/image can't do that.
    <img
      className={className}
      src={srcSet ? fallbackSrc(src) : src}
      srcSet={srcSet}
      sizes={srcSet ? (sizes ?? "100vw") : undefined}
      alt={alt || ""}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      onError={(e) => {
        const target = e.currentTarget;
        if (!target.dataset.fb) {
          target.dataset.fb = "1";
          /* Le repli est un data-URI unique : tant que `srcset` reste posé,
             le navigateur continue d'y puiser et le `src` n'est jamais lu. */
          target.removeAttribute("srcset");
          target.removeAttribute("sizes");
          target.src = placeholder(alt, tone);
        }
      }}
    />
  );
}
