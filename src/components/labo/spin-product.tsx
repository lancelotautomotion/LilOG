"use client";

/* ============================================================
   LABO : SPIN_VIEWER.EXE — brouillon de fiche produit
   ------------------------------------------------------------
   Reprise du principe « spin product hero » : la pièce occupe le
   centre de l'écran et pivote quand on la fait glisser, un
   compteur de degrés en dessous, deux fenêtres flottantes de part
   et d'autre (infos à gauche, achat à droite), reliées à la pièce
   par un trait pointillé.

   Version simple : la « rotation » fait défiler les photos Shopify
   de la pièce (face, dos, détails…), réparties sur 360°. Avec une
   vraie séquence tournante (24 à 36 vues) le même composant
   donnerait un 360° fluide, sans rien changer d'autre.

   Habillage Lil'OG : fenêtres WindowFrame à barre violet → fuchsia,
   boutons plastique, afficheur LCD, typo mono. Rien de globals.css
   n'est modifié, la feuille locale est préfixée `lab-`.
   ============================================================ */

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n-context";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/hooks/use-wishlist";
import { Nav } from "@/components/nav";
import { Drawer } from "@/components/drawer";
import { Icon } from "@/components/icons";
import { parseDescription } from "@/components/product-detail";
import { fallbackSrc, imageSrcSet } from "@/lib/shopify/image-url";
import { stripEtatWord } from "@/lib/etat";
import { BEVEL_IN, GRID_BG, LCD, MONO, PLASTIC, PLASTIC_FACE, PLASTIC_PRESS, WindowFrame } from "@/components/y2k/kit";
import type { ProductDetail } from "@/lib/shopify/types";

/** Pixels de glisser pour passer à la vue suivante. */
const STEP_PX = 70;
/** Cadence du tour de présentation joué à l'ouverture. */
const INTRO_MS = 520;
const STAGE_SIZES = "(max-width: 1023px) 92vw, 640px";

const LAB_CSS = `
@keyframes lab-blink{0%,49%{opacity:1}50%,100%{opacity:.25}}
.lab-blink{animation:lab-blink 1.15s step-end infinite}
@keyframes lab-nudge{0%,100%{transform:translateX(0)}50%{transform:translateX(6px)}}
.lab-nudge{animation:lab-nudge 1.4s ease-in-out infinite}
.lab-crt::after{content:"";position:absolute;inset:0;pointer-events:none;
  background:repeating-linear-gradient(to bottom,rgba(0,0,0,.32) 0 1px,rgba(0,0,0,0) 1px 3px)}
.lab-desc p{margin:0 0 1em}
.lab-desc p:last-child{margin-bottom:0}
.lab-desc strong,.lab-desc b{font-weight:700}
.lab-desc ul,.lab-desc ol{margin:0 0 1em;padding-left:1.3em}
.lab-desc br+br{display:none}
@media (prefers-reduced-motion: reduce){ .lab-blink,.lab-nudge{animation:none} }
`;

const mod = (a: number, n: number) => ((a % n) + n) % n;

/* ============================================================
   Accordéon façon « [+] » de la vidéo, un seul ouvert à la fois
   ============================================================ */
function Accordion({ items }: { items: { label: string; body: React.ReactNode }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="divide-y divide-[#d8d5e6] border-y border-[#d8d5e6]">
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={it.label}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              aria-controls={`lab-acc-${i}`}
              className={`${MONO} flex w-full items-center justify-between gap-3 py-2.5 text-left text-[0.8125rem] font-bold tracking-[0.08em] text-[#1E2430] uppercase hover:text-[#5b2fb8]`}
            >
              <span>{it.label}</span>
              <span aria-hidden className="text-[#5b2fb8]">{isOpen ? "[ − ]" : "[ + ]"}</span>
            </button>
            {isOpen && (
              <div
                id={`lab-acc-${i}`}
                className={`${MONO} lab-desc max-h-[32vh] overflow-y-auto pb-3 text-[0.875rem] leading-[1.7] text-[#3b3550]`}
              >
                {it.body}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function SpinProduct({ product }: { product: ProductDetail }) {
  const { t } = useLanguage();
  const router = useRouter();
  const { addItem, hasVariant } = useCart();
  const { has, toggle } = useWishlist();
  const [menu, setMenu] = useState(false);

  /* ---------------- Rotation ---------------- */
  const images = product.images.length > 0 ? product.images : [""];
  const n = images.length;
  const [frame, setFrame] = useState(0);
  const [grabbing, setGrabbing] = useState(false);
  const [touched, setTouched] = useState(false);
  const drag = useRef<{ x: number; start: number } | null>(null);
  const deg = Math.round((frame * 360) / n);

  /* Un tour de présentation à l'ouverture, pour montrer que la pièce
     tourne. S'arrête au premier geste, et n'a pas lieu si l'appareil
     demande moins d'animations. */
  useEffect(() => {
    if (touched || n < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let step = 0;
    const id = window.setInterval(() => {
      step += 1;
      setFrame(mod(step, n));
      if (step >= n) window.clearInterval(id);
    }, INTRO_MS);
    return () => window.clearInterval(id);
  }, [touched, n]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (n < 2) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, start: frame };
    setTouched(true);
    setGrabbing(true);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    const steps = Math.round((e.clientX - drag.current.x) / STEP_PX);
    setFrame(mod(drag.current.start - steps, n));
  };
  const endDrag = () => {
    drag.current = null;
    setGrabbing(false);
  };
  const go = useCallback(
    (to: number) => {
      setTouched(true);
      setFrame(mod(to, n));
    },
    [n],
  );
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(frame + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(frame - 1);
    }
  };

  /* ---------------- Achat ---------------- */
  const hasVariants = product.variants.length > 0;
  const [variant, setVariant] = useState(() => product.variants.find((v) => v.availableForSale) ?? product.variants[0]);
  const sold = hasVariants ? !variant?.availableForSale : !product.available;
  const variantId = hasVariants ? (variant?.id ?? null) : product.defaultVariantId;
  const inCart = hasVariant(variantId);
  const liked = has(product.handle);
  const [added, setAdded] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const add = async () => {
    if (sold || !variantId || added) return;
    if (inCart) {
      router.push("/cart");
      return;
    }
    setAdded(true);
    setAddError(null);
    try {
      await addItem(variantId, 1);
      setTimeout(() => setAdded(false), 1400);
    } catch (err) {
      setAdded(false);
      setAddError(err instanceof Error ? err.message : "Erreur lors de l'ajout au panier");
    }
  };

  const size = variant?.title ?? product.size ?? "UNIQUE";
  const etat = (product.etat && stripEtatWord(product.etat)) || null;
  const badge = product.tag === "1 OF 1" ? "💎 1 OF 1" : product.tag === "NEW" ? "🔥 NEW IN" : null;

  /* ---------------- Textes ---------------- */
  /* HTML déjà assaini par sanitizeDescription (products.ts), à l'entrée
     de la donnée Shopify : ici on ne fait que le découper. */
  const { sections } = product.descriptionHtml ? parseDescription(product.descriptionHtml) : { sections: [] };
  const detailsHtml = sections.find((s) => s.label === "Les détails de la pépite")?.content ?? "";
  const fitHtml = sections.find((s) => s.label === "Info Mannequin & Fit")?.content ?? "";
  const moodHtml = sections
    .filter((s) => s.label !== "Info Mannequin & Fit" && s.label !== "Les détails de la pépite")
    .map((s) => s.content)
    .join("");

  const accordion = [
    {
      label: "Description",
      body: moodHtml ? <div dangerouslySetInnerHTML={{ __html: moodHtml }} /> : <p>Aucune description renseignée.</p>,
    },
    {
      label: "Détails de la pépite",
      body: detailsHtml ? <div dangerouslySetInnerHTML={{ __html: detailsHtml }} /> : <p>Aucun détail renseigné.</p>,
    },
    {
      label: "Fit & mesures",
      body: (
        <>
          {fitHtml && <div dangerouslySetInnerHTML={{ __html: fitHtml }} />}
          <p>
            <strong>{t.pdp.detailsH}</strong>
            <br />
            {t.pdp.detailsBody}
          </p>
        </>
      ),
    },
    {
      label: "Livraison & retours",
      body: (
        <p>
          <strong>{t.pdp.shippingH}</strong>
          <br />
          {t.pdp.shippingBody}
        </p>
      ),
    },
  ];

  /* ---------------- Rendu ---------------- */
  const connector = "pointer-events-none absolute top-1/2 hidden h-px w-[clamp(40px,6vw,110px)] lg:block";
  const connectorStyle: React.CSSProperties = {
    backgroundImage: "linear-gradient(90deg, #7147d4 50%, transparent 50%)",
    backgroundSize: "8px 1px",
  };

  return (
    <>
      <Nav onMenu={() => setMenu(true)} forceSolid />
      <Drawer open={menu} onClose={() => setMenu(false)} />

      <main className="relative min-h-screen overflow-hidden" style={GRID_BG}>
        <style>{LAB_CSS}</style>

        <div className="relative mx-auto w-full max-w-[1500px] px-4 pt-[calc(72px+16px)] pb-10 sm:px-6">
          {/* Fil d'Ariane + mention de brouillon */}
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className={`${MONO} min-w-0 truncate text-[0.8125rem] tracking-[0.06em] text-[#6B7280]`}>
              {`C:\\LIL_OG\\LABO\\${product.handle}`}
            </span>
            <span
              className={`${MONO} rounded-sm border border-amber-500 bg-amber-100 px-2 py-0.5 text-[0.8125rem] font-bold tracking-[0.06em] text-amber-800 uppercase`}
            >
              Brouillon · non indexé
            </span>
            <Link
              href={`/products/${product.handle}`}
              className={`${MONO} ml-auto text-[0.8125rem] tracking-[0.06em] text-[#5b2fb8] uppercase underline underline-offset-2`}
            >
              Fiche classique →
            </Link>
          </div>

          <div className="relative flex flex-col gap-5 lg:block lg:h-[calc(100svh-130px)] lg:min-h-[640px]">
            {/* ======== Scène : la pièce qui pivote ======== */}
            <div className="relative flex flex-col items-center lg:absolute lg:inset-0 lg:justify-center">
              {/* Halo « projecteur » derrière la pièce */}
              <div
                aria-hidden
                className="pointer-events-none absolute top-1/2 left-1/2 h-[min(80vw,620px)] w-[min(80vw,620px)] -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{ background: "radial-gradient(circle, rgba(255,119,200,0.28) 0%, rgba(113,71,212,0.10) 45%, transparent 70%)" }}
              />

              <div
                role="slider"
                tabIndex={0}
                aria-label={`Faire pivoter : ${product.name}`}
                aria-valuemin={0}
                aria-valuemax={359}
                aria-valuenow={deg}
                aria-valuetext={`Vue ${frame + 1} sur ${n}, ${deg} degrés`}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                onKeyDown={onKeyDown}
                className={`relative aspect-[3/4] h-[min(62svh,560px)] max-w-full touch-pan-y outline-none select-none focus-visible:ring-4 focus-visible:ring-[#ff77c8]/50 lg:h-[min(74svh,720px)] ${
                  n > 1 ? (grabbing ? "cursor-grabbing" : "cursor-grab") : ""
                }`}
              >
                {images.map((src, i) =>
                  src ? (
                    // Toutes les vues sont chargées d'entrée : la rotation doit
                    // être instantanée, sans attendre une photo au passage.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={src}
                      src={fallbackSrc(src)}
                      srcSet={imageSrcSet(src)}
                      sizes={STAGE_SIZES}
                      alt={i === 0 ? product.name : ""}
                      aria-hidden={i !== frame}
                      draggable={false}
                      fetchPriority={i === 0 ? "high" : "auto"}
                      className="pointer-events-none absolute inset-0 h-full w-full rounded-xl object-contain mix-blend-multiply"
                      style={{ opacity: i === frame ? 1 : 0 }}
                    />
                  ) : null,
                )}
              </div>

              {/* Ombre au sol */}
              <div
                aria-hidden
                className="pointer-events-none -mt-3 h-4 w-[min(55vw,300px)] rounded-[50%] bg-[#2a1266]/20 blur-md"
              />

              {/* Compteur de degrés */}
              <div className="mt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => go(frame - 1)}
                  aria-label="Vue précédente"
                  disabled={n < 2}
                  className={`${MONO} rounded-md border border-[#c6c2d8] ${PLASTIC_FACE} px-2.5 py-1 text-[0.875rem] font-bold text-[#262626] disabled:opacity-40 ${PLASTIC} ${PLASTIC_PRESS}`}
                >
                  ◀
                </button>
                <span className={`${MONO} text-[0.8125rem] tracking-[0.14em] text-[#3b3550] uppercase`}>
                  {n > 1 ? (
                    <>
                      <span className={touched ? "" : "lab-nudge inline-block"}>⟲</span> Glisser pour pivoter
                    </>
                  ) : (
                    "Vue unique"
                  )}
                </span>
                <span
                  className={`lab-crt relative overflow-hidden rounded-md border-2 border-[#2b2b3d] bg-black px-2 py-0.5 ${BEVEL_IN}`}
                >
                  <span
                    className={`${LCD} relative z-[2] text-[1.25rem] leading-none text-green-400 tabular-nums`}
                    style={{ textShadow: "0 0 8px rgba(74,222,128,.55)" }}
                  >
                    {String(deg).padStart(3, "0")}°
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => go(frame + 1)}
                  aria-label="Vue suivante"
                  disabled={n < 2}
                  className={`${MONO} rounded-md border border-[#c6c2d8] ${PLASTIC_FACE} px-2.5 py-1 text-[0.875rem] font-bold text-[#262626] disabled:opacity-40 ${PLASTIC} ${PLASTIC_PRESS}`}
                >
                  ▶
                </button>
              </div>
            </div>

            {/* ======== Vignettes, en bas à gauche ======== */}
            {n > 1 && (
              <div className="z-[2] flex flex-wrap justify-center gap-2 lg:absolute lg:bottom-2 lg:left-0 lg:justify-start">
                {images.map((src, i) => (
                  <button
                    key={src || i}
                    type="button"
                    onClick={() => go(i)}
                    aria-label={`Voir la vue ${i + 1}`}
                    aria-pressed={i === frame}
                    className={`h-16 w-12 overflow-hidden rounded-md border-2 bg-white transition ${
                      i === frame ? "border-[#ff3fb0] shadow-[3px_3px_0_rgba(24,12,58,0.35)]" : "border-[#c6c2d8] opacity-70 hover:opacity-100"
                    }`}
                  >
                    {src && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={fallbackSrc(src)} alt="" className="h-full w-full object-cover" draggable={false} />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* ======== Fenêtre gauche : infos ======== */}
            <div className="z-[2] w-full lg:absolute lg:top-[6%] lg:left-0 lg:w-[min(360px,28vw)]">
              <span aria-hidden className={`${connector} left-full`} style={connectorStyle} />
              <WindowFrame title="ITEM_INFO.TXT" icon={<Icon.folderOpen width={15} height={12} />} bodyStyle={{ backgroundColor: "#ffffff" }}>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h1 className={`${LCD} text-[clamp(1.4rem,2.2vw,1.9rem)] leading-[1.05] tracking-[0.02em] text-[#2a1266] uppercase`}>
                      {product.name}
                    </h1>
                    {badge && (
                      <span
                        className={`${MONO} shrink-0 rounded-sm border border-[#c6c2d8] ${PLASTIC_FACE} px-1.5 py-1 text-[0.8125rem] font-bold tracking-[0.04em] text-[#5b2fb8] uppercase ${PLASTIC}`}
                      >
                        {badge}
                      </span>
                    )}
                  </div>

                  <div className="mt-3 mb-4 flex items-baseline gap-2.5">
                    <span className={`${LCD} text-[1.9rem] leading-none text-[#d3016d]`}>{product.price}€</span>
                    {product.was && <s className={`${MONO} text-[0.9375rem] text-[#6B7280]`}>{product.was}€</s>}
                  </div>

                  <Accordion items={accordion} />
                </div>
              </WindowFrame>
            </div>

            {/* ======== Fenêtre droite : achat ======== */}
            <div className="z-[2] w-full lg:absolute lg:top-[34%] lg:right-0 lg:w-[min(330px,26vw)]">
              <span aria-hidden className={`${connector} right-full`} style={connectorStyle} />
              <WindowFrame title="CHECKOUT.EXE" icon={<span>🛒</span>} bodyStyle={{ backgroundColor: "#ffffff" }}>
                <div className="p-4">
                  <div className={`${MONO} mb-2 text-[0.8125rem] font-bold tracking-[0.14em] text-[#5b2fb8] uppercase`}>▶ Taille</div>

                  {hasVariants && product.variants.length > 1 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {product.variants.map((v) => (
                        <button
                          key={v.id}
                          type="button"
                          disabled={!v.availableForSale}
                          onClick={() => setVariant(v)}
                          className={`${MONO} flex-1 rounded-md border px-3 py-1.5 text-[0.8125rem] font-bold uppercase transition disabled:cursor-not-allowed disabled:line-through disabled:opacity-35 ${
                            variant?.id === v.id
                              ? "border-[#1E2430] bg-[#1E2430] text-white"
                              : `border-[#c6c2d8] ${PLASTIC_FACE} text-[#262626] ${PLASTIC} ${PLASTIC_PRESS}`
                          }`}
                        >
                          {v.title}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className={`${MONO} rounded-md border border-[#1E2430] bg-[#1E2430] px-3 py-1.5 text-center text-[0.8125rem] font-bold text-white uppercase`}>
                      {size}
                    </div>
                  )}

                  {etat && (
                    <p className={`${MONO} mt-2 text-[0.8125rem] tracking-[0.06em] text-[#6B7280] uppercase`}>💎 État : {etat}</p>
                  )}

                  <div className="mt-4 flex items-stretch gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        toggle({ handle: product.handle, title: product.name, price: product.price, image: product.images[0], variantId })
                      }
                      aria-label={liked ? "Retirer des favoris" : "Ajouter aux favoris"}
                      aria-pressed={liked}
                      className={`flex w-12 shrink-0 items-center justify-center rounded-lg border-b-4 transition active:translate-y-1 active:border-b-0 ${
                        liked ? "border-[#7a0a52] bg-gradient-to-b from-[#ff9ee4] to-[#d3016d] text-white" : `border-[#8b87a3] ${PLASTIC_FACE} text-[#6B7280]`
                      }`}
                    >
                      {liked ? <Icon.heart width={16} height={16} /> : <Icon.heartO width={16} height={16} />}
                    </button>
                    <button
                      type="button"
                      onClick={add}
                      disabled={sold || !variantId}
                      aria-label={inCart && !added ? "Déjà dans le panier — voir le panier" : undefined}
                      className={`${MONO} flex-1 rounded-lg border-b-4 px-3 py-3 text-[0.9375rem] font-black tracking-[0.05em] text-white uppercase transition active:translate-y-1 active:border-b-0 disabled:cursor-not-allowed disabled:opacity-45 ${
                        added || inCart
                          ? "border-[#0f5c26] bg-gradient-to-b from-[#4fbe84] to-[#1B8A3C]"
                          : "border-[#7a0a52] bg-gradient-to-b from-[#ff5ec4] to-[#c3128a]"
                      }`}
                    >
                      {sold ? "[ × SOLD ]" : added ? "[ ✓ ADDED ]" : inCart ? "[ ✓ IN CART ]" : "[ + ADD TO CART ]"}
                    </button>
                  </div>

                  {addError && <p className={`${MONO} mt-2 text-[0.8125rem] text-[#d4006e]`}>⚠ {addError}</p>}

                  {!sold && (
                    <p className={`lab-blink ${MONO} mt-3 text-[0.8125rem] font-bold tracking-[0.04em] text-amber-700 uppercase`}>
                      ⚠ Pièce unique · 1 seul exemplaire
                    </p>
                  )}
                </div>
              </WindowFrame>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
