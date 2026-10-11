"use client";

/* ============================================================
   LOUNA_PICKS.EXE : premier module de l'accueil
   ------------------------------------------------------------
   Les coups de cœur de Louna (tag Shopify « Louna pick », voir
   getLounaPicks), en rangée de cartes qui défile à l'horizontale
   juste sous le hero : photo, nom, taille, prix et un bouton
   d'achat par pièce, puis un lien vers tout le catalogue.

   Remplace PLAYLIST_HIGHLIGHTS.EXE (Cover Flow façon lecteur
   multimédia) : même sélection, mais toutes les pièces sont
   visibles d'un coup d'œil au lieu d'une seule à la fois.

   Défilement natif (`overflow-x: auto` + scroll-snap) : le doigt
   sur téléphone, la molette / le pavé tactile ou les deux touches
   fléchées sur ordinateur. Aucune bibliothèque de carrousel.

   ⚠ PAREFEU : Tailwind + feuille locale préfixée `lhp-`. Aucune
   classe de globals.css n'est touchée, donc aucune autre page ne
   bouge.
   ============================================================ */

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/hooks/use-wishlist";
import { SmartImg } from "@/components/smart-img";
import { Icon } from "@/components/icons";
import { BEVEL_IN, GRID_BG, MONO, PINK, PLASTIC, PLASTIC_FACE, PLASTIC_PRESS, WindowFrame } from "@/components/y2k/kit";
import type { Product } from "@/lib/shopify/types";

/* Une carte fait `clamp(200px, 62vw, 260px)` de large : décrire la place
   réelle évite de télécharger la variante 1600 px pour une vignette. */
const CARD_SIZES = "(max-width: 640px) 62vw, 260px";

const PICKS_CSS = `
.lhp-track{ scrollbar-width: thin; scrollbar-color: #b9a3ef transparent; }
.lhp-track::-webkit-scrollbar{ height: 8px }
.lhp-track::-webkit-scrollbar-thumb{ background:#b9a3ef; border-radius:8px }

.lhp-card{ transition: transform 180ms ease, box-shadow 180ms ease; }
.lhp-card:hover{ transform: translateY(-3px); box-shadow: 0 8px 0 #2a1370; }
.lhp-card .lhp-img{ transition: transform 400ms ease; }
.lhp-card:hover .lhp-img{ transform: scale(1.04); }

/* Bouton d'achat : le relief rose de l'ancien lecteur, en plus compact. */
.lhp-cta{
  box-shadow:0 4px 0 #7d0f56, 0 8px 14px rgba(20,6,40,.28), inset 0 2px 0 rgba(255,255,255,.9), inset 0 -4px 10px rgba(120,0,80,.42);
  transition:transform 90ms ease, box-shadow 90ms ease, filter 160ms ease;
}
.lhp-cta:hover:not(:disabled){ filter:brightness(1.06) }
.lhp-cta:active:not(:disabled){
  transform:translateY(4px);
  box-shadow:0 0 0 #7d0f56, 0 3px 6px rgba(20,6,40,.4), inset 0 2px 0 rgba(255,255,255,.55), inset 0 -3px 8px rgba(120,0,80,.5);
}
.lhp-cta:disabled{ filter:grayscale(.6); cursor:default }
.lhp-cta-done{
  box-shadow:0 4px 0 #0d4f21, 0 8px 14px rgba(6,40,20,.28), inset 0 2px 0 rgba(255,255,255,.9), inset 0 -4px 10px rgba(0,70,35,.42);
}

@media (prefers-reduced-motion: reduce){
  .lhp-card,.lhp-card .lhp-img,.lhp-cta{ transition:none !important }
  .lhp-card:hover{ transform:none }
  .lhp-card:hover .lhp-img{ transform:none }
  .lhp-track{ scroll-behavior:auto }
}
`;

function PickCard({ product, idx }: { product: Product; idx: number }) {
  const { addItem, hasVariant } = useCart();
  const { has, toggle } = useWishlist();
  const router = useRouter();
  const [added, setAdded] = useState(false);
  const sold = product.tag === "SOLD" || !product.variantId;
  /* Pièces uniques : une fois au panier, le bouton n'ajoute plus, il y mène.
     Voir `hasVariant` dans cart-context. */
  const inCart = hasVariant(product.variantId);
  const fav = has(product.handle);
  const sizeLabel = product.sizes.length ? product.sizes.join(" / ") : product.meta || "One size";
  const done = added || inCart;

  const add = async () => {
    if (sold || !product.variantId || added) return;
    if (inCart) {
      router.push("/cart");
      return;
    }
    setAdded(true);
    await addItem(product.variantId, 1);
    setTimeout(() => setAdded(false), 1400);
  };

  const toggleFav = () => {
    if (sold) return;
    toggle({ handle: product.handle, title: product.name, price: product.price, image: product.imageA, variantId: product.variantId });
  };

  return (
    <li className="w-[clamp(200px,62vw,260px)] shrink-0 snap-start">
      <article className="lhp-card relative flex h-full flex-col rounded-2xl border-2 border-[#b8b4cc] bg-white p-2.5 shadow-[0_5px_0_#2a1370]">
        {/* Le cœur est un bouton à part, posé par-dessus le lien et non dedans :
            aucun élément interactif ne s'imbrique dans un autre. */}
        <button
          type="button"
          onClick={toggleFav}
          disabled={sold}
          aria-label={fav ? `Retirer ${product.name} des favoris` : `Ajouter ${product.name} aux favoris`}
          aria-pressed={fav}
          className={`absolute top-4 right-4 z-10 grid h-9 w-9 place-items-center rounded-full border-2 border-[#b8b4cc] ${PLASTIC_FACE} ${PLASTIC} ${PLASTIC_PRESS} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff5ec4]`}
          style={{ color: PINK }}
        >
          {fav ? <Icon.heart /> : <Icon.heartO />}
        </button>

        <Link
          href={`/products/${product.handle}`}
          className="flex flex-1 flex-col rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff5ec4]"
        >
          <div className={`relative aspect-[3/4] overflow-hidden rounded-xl border-2 border-[#9b97b3] bg-[#f0f0f5] ${BEVEL_IN}`}>
            <SmartImg className="lhp-img h-full w-full object-cover" src={product.imageA} alt={product.name} tone={idx} sizes={CARD_SIZES} />
          </div>

          <h3
            className={`${MONO} mt-3 line-clamp-2 min-h-[2.6em] px-1 text-center text-[0.8125rem] leading-snug font-extrabold tracking-[0.08em] uppercase`}
            style={{ color: PINK }}
          >
            {product.name}
          </h3>

          <div className={`${MONO} mt-2 flex items-baseline justify-between gap-2 px-1 text-[0.75rem] tracking-[0.06em] uppercase`}>
            <span className="truncate font-bold text-[#5b2fb8]">{sizeLabel}</span>
            <span className="shrink-0 font-bold text-[#2b0f6b]">
              {product.was && <s className="mr-1 font-normal opacity-60">{product.was}€</s>}
              {product.price}€
            </span>
          </div>
        </Link>

        <button
          type="button"
          onClick={add}
          disabled={sold}
          className={`${MONO} lhp-cta mt-3 mb-1 w-full rounded-xl border-2 px-3 py-2.5 text-[0.75rem] font-bold tracking-[0.1em] text-white uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff5ec4] ${
            done ? "lhp-cta-done border-[#0f5c26]" : "border-[#5d0b46]"
          }`}
          style={{
            background: done
              ? "linear-gradient(180deg,#8ce8b4 0%,#4fbe84 42%,#1B8A3C 74%,#0f5c26 100%)"
              : "linear-gradient(180deg,#ff9ee4 0%,#ff45b4 42%,#d61f8f 74%,#a6106b 100%)",
            textShadow: done ? "0 2px 0 rgba(0,60,25,.55)" : "0 2px 0 rgba(90,0,60,.55)",
          }}
          aria-label={inCart && !added ? `${product.name} est déjà dans le panier — voir le panier` : undefined}
        >
          {sold ? "[ ✕ Sold out ]" : added ? "[ ✓ Added ]" : inCart ? "[ ✓ In cart ]" : "[ ♡ I want it ♡ ]"}
        </button>
      </article>
    </li>
  );
}

function ScrollKey({ dir, onClick }: { dir: -1 | 1; onClick: () => void }) {
  const label = dir < 0 ? "Pièces précédentes" : "Pièces suivantes";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`hidden h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-[#9b97b3] text-[#7147d4] sm:grid ${PLASTIC_FACE} ${PLASTIC} ${PLASTIC_PRESS} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7147d4]`}
    >
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden>
        <polygon points={dir < 0 ? "16,4 6,12 16,20" : "8,4 18,12 8,20"} />
      </svg>
    </button>
  );
}

export function LounaPicks({ products }: { products: Product[] }) {
  const track = useRef<HTMLUListElement>(null);

  if (products.length === 0) return null;

  /** Fait défiler d'environ une largeur visible, carte entière par carte entière grâce au snap. */
  const scroll = (dir: -1 | 1) => {
    const el = track.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    /* Padding bas seul, comme tous les modules de l'accueil : le retrait
       d'après le hero est porté par le conteneur des modules dans
       `home-shell`, ce bloc ne rendant rien sans coup de cœur. */
    <section id="highlights" className="px-4 pb-[clamp(24px,min(8vw,5svh),96px)] sm:px-6">
      <div className="mx-auto w-full max-w-[1296px]">
        <style>{PICKS_CSS}</style>

        <WindowFrame title="Louna_picks.exe" icon="💘" bodyClassName="py-[clamp(18px,3vw,32px)]" bodyStyle={GRID_BG}>
          <div className="flex items-center justify-center gap-3 px-4">
            <ScrollKey dir={-1} onClick={() => scroll(-1)} />
            <h2
              className={`${MONO} min-w-0 flex-1 text-center text-[clamp(1rem,2.6vw,1.5rem)] font-extrabold tracking-[0.12em] uppercase`}
              style={{ color: PINK }}
            >
              <span aria-hidden>♡ </span>Les coups de cœur<span aria-hidden> ♡</span>
            </h2>
            <ScrollKey dir={1} onClick={() => scroll(1)} />
          </div>

          <ul
            ref={track}
            aria-label="Pièces choisies par Louna"
            className="lhp-track mt-[clamp(14px,2.4vw,24px)] flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto scroll-smooth px-4 pt-1 pb-5 sm:scroll-px-6 sm:px-6"
          >
            {products.map((p, i) => (
              <PickCard key={p.id} product={p} idx={i} />
            ))}
          </ul>

          <div className="mt-[clamp(10px,2vw,18px)] flex justify-center px-4">
            <Link
              href="/catalogue"
              className={`${MONO} rounded-full border-2 border-[#9b97b3] px-6 py-3 text-[0.8125rem] font-bold tracking-[0.12em] text-[#5b2fb8] uppercase ${PLASTIC_FACE} ${PLASTIC} ${PLASTIC_PRESS} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7147d4]`}
            >
              [ ▶ Voir tous nos trésors ]
            </Link>
          </div>
        </WindowFrame>
      </div>
    </section>
  );
}
