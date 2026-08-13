import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductDetail } from "@/components/product-detail";
import { getProductByHandle, getFeaturedProducts, getCollectionProducts } from "@/lib/shopify/products";
import { looksLikeSize, sizeEquivalents } from "@/lib/sizes";
import type { Product, ProductDetail as ProductDetailType } from "@/lib/shopify/types";

const TOPS_HANDLES = ["tops"];
const BOTTOMS_HANDLES = ["jupes", "shorts-bermudas", "pantalons", "jeans"];

/* Repli quand le rayon complémentaire n'a pas assez de pièces à la bonne
   taille. Les vestes sont un vêtement : elles restent filtrées par taille.
   Les sacs, bijoux, accessoires et chaussures ne se portent pas à la taille
   du haut regardé — les filtrer sur elle ne ferait que vider la sélection,
   d'où deux listes séparées. */
const FALLBACK_SIZED_HANDLES = ["manteaux-et-vestes"];
const FALLBACK_ANY_SIZE_HANDLES = ["accessoires", "sacs", "chaussures"];

const RELATED_COUNT = 4;
/* De quoi avoir encore du choix une fois le filtre de taille passé : sur un
   rayon donné, une taille précise ne représente qu'une poignée de pièces. */
const POOL_PER_COLLECTION = 40;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProductByHandle(decodeURIComponent(handle)).catch(() => null);
  if (!product) return { title: "Lil'OG" };
  const plainDescription = product.descriptionHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return {
    title: `${product.name} — Lil'OG`,
    description: plainDescription || undefined,
  };
}

/**
 * Toutes les écritures de la taille de la pièce regardée — « S » ramène
 * aussi « 36 », pour retrouver les bas étiquetés en taille FR quand le haut
 * l'est en lettre.
 *
 * `looksLikeSize` fait le tri : le champ méta Taille et les titres de
 * variantes contiennent parfois autre chose qu'une taille (une couleur, une
 * mention libre). Sans ce garde-fou, une valeur fantaisie passerait dans le
 * filtre et ne correspondrait à rien — la sélection reviendrait vide au lieu
 * de simplement ignorer la taille.
 */
function viewedSizes(detail: ProductDetailType): Set<string> {
  const out = new Set<string>();
  const raw = [
    // Une pièce peut déclarer « 38, 40 » ; « 38/40 » en revanche est une
    // taille combinée, que sizeEquivalents déplie lui-même.
    ...(detail.size ? detail.size.split(",") : []),
    ...detail.variants.map((v) => v.title),
  ];
  for (const value of raw) {
    const trimmed = value.trim();
    if (!looksLikeSize(trimmed)) continue;
    for (const equivalent of sizeEquivalents(trimmed)) out.add(equivalent);
  }
  return out;
}

/** La pièce est-elle proposée dans (une écriture de) l'une de ces tailles ? */
function fitsSize(product: Product, wanted: ReadonlySet<string>): boolean {
  return product.sizes.some((s) => sizeEquivalents(s).some((e) => wanted.has(e)));
}

async function poolFrom(handles: string[]): Promise<Product[]> {
  const results = await Promise.all(handles.map((h) => getCollectionProducts(h, POOL_PER_COLLECTION)));
  return shuffle(results.flatMap((r) => r?.products ?? []));
}

function shuffle<T>(list: T[]): T[] {
  return [...list].sort(() => Math.random() - 0.5);
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle: rawHandle } = await params;
  const handle = decodeURIComponent(rawHandle);
  const product = await getProductByHandle(handle).catch(() => null);
  if (!product) notFound();

  const isTops = product.collections.some((h) => TOPS_HANDLES.includes(h));
  const isBottoms = product.collections.some((h) => BOTTOMS_HANDLES.includes(h));
  const sizes = viewedSizes(product);

  /* Remplissage par paliers : on ne descend au palier suivant que s'il manque
     des pièces. La pièce regardée et les doublons sont écartés au passage. */
  const related: Product[] = [];
  const seen = new Set<string>([handle]);
  const take = (candidates: Product[]) => {
    for (const p of candidates) {
      if (related.length >= RELATED_COUNT) return;
      if (seen.has(p.handle)) continue;
      seen.add(p.handle);
      related.push(p);
    }
  };
  const missing = () => related.length < RELATED_COUNT;

  /* 1. Le rayon complémentaire — des bas pour un haut, des hauts pour un bas
        — d'abord dans la taille exacte, puis les pièces dont la taille n'est
        pas renseignée, qui peuvent tomber juste. */
  const complementary = isTops ? BOTTOMS_HANDLES : isBottoms ? TOPS_HANDLES : [];
  if (complementary.length > 0) {
    const pool = await poolFrom(complementary);
    if (sizes.size > 0) {
      take(pool.filter((p) => fitsSize(p, sizes)));
      if (missing()) take(pool.filter((p) => p.sizes.length === 0));
    } else {
      take(pool);
    }
  }

  // 2. Les vestes, toujours à la bonne taille.
  if (missing()) {
    const pool = await poolFrom(FALLBACK_SIZED_HANDLES);
    take(sizes.size > 0 ? pool.filter((p) => fitsSize(p, sizes)) : pool);
  }

  // 3. Bijoux, accessoires, sacs, chaussures — hors barème de taille.
  if (missing()) take(await poolFrom(FALLBACK_ANY_SIZE_HANDLES));

  // 4. Dernier recours : la sélection du moment, pour ne jamais afficher une
  //    fenêtre de suggestions vide sur une pièce hors rayon.
  if (missing()) take(await getFeaturedProducts(12));

  return <ProductDetail product={product} related={related} />;
}
