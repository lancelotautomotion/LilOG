import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { SetupWizard, type Capacity } from "@/components/gift-card/setup-wizard";
import { getGiftCardProduct } from "@/lib/shopify/products";
import type { ProductDetail } from "@/lib/shopify/types";

export const metadata: Metadata = {
  title: "Carte cadeau · Lil'OG",
  description:
    "Grave un disque de crédit Lil'OG : la carte cadeau digitale, livrée par e-mail au bénéficiaire.",
};

/**
 * Les variantes du produit Shopify deviennent les capacités du graveur,
 * triées du plus petit disque au plus gros — la dernière est présentée
 * comme la « capacité max ».
 *
 * Un produit à variante unique (une carte à montant fixe) n'expose rien
 * dans `variants` : Shopify lui invente une variante « Default Title » que
 * le mapping écarte. C'est alors `defaultVariantId` qui porte l'identifiant
 * de ligne, avec le prix du produit.
 */
function toCapacities(product: ProductDetail | null): Capacity[] {
  if (!product) return [];

  if (product.variants.length > 0) {
    return product.variants
      .map((v) => ({
        variantId: v.id,
        amount: v.price,
        available: v.availableForSale,
      }))
      .sort((a, b) => a.amount - b.amount);
  }

  if (product.defaultVariantId) {
    return [
      {
        variantId: product.defaultVariantId,
        amount: product.price,
        available: product.available,
      },
    ];
  }

  return [];
}

export default async function GiftCardPage() {
  /* Shopify injoignable ou carte cadeau non publiée : l'assistant s'affiche
     quand même, en annonçant qu'aucun disque n'est chargé. Une page 404
     n'apprendrait rien à personne. */
  const product = await getGiftCardProduct().catch(() => null);

  return (
    <PageShell>
      <SetupWizard capacities={toCapacities(product)} productName={product?.name ?? null} />
    </PageShell>
  );
}
