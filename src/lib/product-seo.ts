import { SITE_NAME, SITE_URL, productPath } from "@/lib/site";
import { stripEtatWord } from "@/lib/etat";
import { looksLikeSize } from "@/lib/sizes";
import type { ProductDetail } from "@/lib/shopify/types";

const MAX_DESCRIPTION = 155;

/** Retire emojis et pictogrammes, que Google affiche tels quels (ou pas). */
function noEmoji(text: string): string {
  return text
    .replace(/[\p{Extended_Pictographic}\p{Emoji_Presentation}\p{Emoji_Modifier}\p{Regional_Indicator}︎️​-‍⁠﻿]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function formatPrice(price: number): string {
  return `${Number.isInteger(price) ? price : price.toFixed(2).replace(".", ",")} €`;
}

/** Coupe à la limite d'un mot, sans laisser de ponctuation pendante. */
function clip(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const at = cut.lastIndexOf(" ");
  return `${(at > 60 ? cut.slice(0, at) : cut).replace(/[\s,;:·.-]+$/, "")}…`;
}

/**
 * Une phrase d'environ 150 caractères : pièce, marque, taille, état, prix.
 * C'est ce que lit Google sous le titre, et ce qui s'affiche dans l'aperçu
 * d'un lien partagé : la description complète de la fiche (rédigée par un
 * modèle, pleine d'emojis) n'y a pas sa place.
 */
export function productDescription(product: ProductDetail): string {
  const size = product.size && looksLikeSize(product.size.split(",")[0].trim()) ? product.size.trim() : null;
  const etat = product.etat ? stripEtatWord(noEmoji(product.etat)) : "";

  const facts = [
    product.vendor && product.vendor.toLowerCase() !== "lil'og" ? product.vendor : null,
    size ? `taille ${size}` : null,
    etat ? `état ${etat.toLowerCase()}` : null,
    formatPrice(product.price),
  ].filter(Boolean);

  const sentence = `${noEmoji(product.name)} · ${facts.join(" · ")}. Pièce unique seconde main Y2K, ${SITE_NAME} Paris.`;
  return clip(sentence, MAX_DESCRIPTION);
}

/** Données structurées schema.org « Product » : prix et disponibilité. */
export function productJsonLd(product: ProductDetail) {
  const url = `${SITE_URL}${productPath(product.handle)}`;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: noEmoji(product.name),
    description: productDescription(product),
    sku: product.id.split("/").pop(),
    ...(product.images.length > 0 && { image: product.images.slice(0, 4) }),
    ...(product.vendor && { brand: { "@type": "Brand", name: product.vendor } }),
    ...(product.size && { size: product.size }),
    url,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: product.currency,
      price: product.price.toFixed(2),
      availability: product.available ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
      /* Toutes les pièces sont de la seconde main. */
      itemCondition: "https://schema.org/UsedCondition",
      seller: { "@type": "Organization", name: SITE_NAME },
    },
  };
}

/** Sérialisation sûre pour un <script> : `<` ne doit jamais fermer la balise. */
export function jsonLdString(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
