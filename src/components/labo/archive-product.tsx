"use client";

/* ============================================================
   LABO : PIECE_UNIQUE.EXE — brouillon de fiche produit (v2)
   ------------------------------------------------------------
   Remplace le brouillon « spin ». Même univers que la fiche
   officielle (fenêtre Win98, écran LCD, plastique chunky), mais
   réordonné pour le téléphone :

   1. la photo d'abord, en grand, sans aucun filtre ni calque
      posé dessus : la pièce se voit telle qu'elle est ;
   2. sous la photo, la barre de progression Win98 qui sert de
      pagination, puis titre, prix, taille / état, achat ;
   3. le sticker « 1/1 PIÈCE UNIQUE » (React Bits · StickerPeel)
      remplace l'alerte clignotante : on peut le décoller ;
   4. un bouton d'achat collant en bas d'écran sur téléphone, tant
      que le vrai bouton n'est pas visible ;
   5. le décor assumé (barres de menus, adresse C:\…, fichiers
      système) descend sous l'achat, là où il ne coûte rien.

   Données : 100 % celles de Shopify, textes inchangés. Le HTML de
   la description arrive déjà assaini (sanitizeDescription, dans
   products.ts) ; on ne fait que le découper en sections.

   Son : muet par défaut. Rien ne joue sans un clic sur le bouton
   SON. Synthétisé en direct (Web Audio), aucun fichier chargé.

   ⚠ PAREFEU : Tailwind + feuille locale préfixée `lab-`. Aucune
   classe de globals.css, aucun fichier partagé modifié.
   ============================================================ */

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n-context";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/hooks/use-wishlist";
import { useScrollLock } from "@/hooks/use-scroll-lock";
import { Nav } from "@/components/nav";
import { Drawer } from "@/components/drawer";
import { Footer } from "@/components/footer";
import { Icon } from "@/components/icons";
import { SmartImg } from "@/components/smart-img";
import { parseDescription } from "@/components/product-detail";
import ClickSpark from "@/components/labo/react-bits/ClickSpark";
import { categoryForProduct } from "@/lib/categories";
import { stripEtatWord } from "@/lib/etat";
import {
  BEVEL_IN,
  LCD,
  MATRIX,
  MONO,
  PLASTIC,
  PLASTIC_FACE,
  PLASTIC_PRESS,
  WALLPAPER,
  WindowFrame,
} from "@/components/y2k/kit";
import type { ProductDetail } from "@/lib/shopify/types";
import { LAB_STAGE_SIZES } from "@/components/labo/stage-sizes";

/* Le sticker est du WebGL : chargé à part, après le reste, et jamais
   côté serveur. La page s'affiche et s'achète sans lui. */
const StickerPeel = dynamic(() => import("@/components/labo/react-bits/StickerPeel"), { ssr: false });


const STICKER_SRC = "/labo/sticker-1of1.svg";
const SOUND_KEY = "lilog-lab-sound";

const LAB_CSS = `
.lab-track{scrollbar-width:none;-ms-overflow-style:none;overscroll-behavior-x:contain}
.lab-track::-webkit-scrollbar{display:none}

/* Mise sous tension de l'afficheur de prix : une ligne qui s'ouvre
   en écran, une seule fois, comme un vieux moniteur. */
@keyframes lab-power{0%{transform:scaleY(.04);filter:brightness(3)}55%{transform:scaleY(1.04);filter:brightness(1.6)}100%{transform:scaleY(1);filter:none}}
.lab-power{animation:lab-power .5s cubic-bezier(.2,.9,.3,1) both;transform-origin:50% 50%}

.lab-crt::after{content:"";position:absolute;inset:0;pointer-events:none;
  background:repeating-linear-gradient(to bottom,rgba(0,0,0,.32) 0 1px,rgba(0,0,0,0) 1px 3px)}

/* Bouton collant : glisse depuis le bas. */
.lab-dock{transition:transform .28s cubic-bezier(.2,.9,.3,1),opacity .2s ease}

.lab-desc p{margin:0 0 1.05em}
.lab-desc p:last-child{margin-bottom:0}
.lab-desc strong,.lab-desc b{font-weight:700}
.lab-desc em,.lab-desc i{font-style:italic}
.lab-desc ul,.lab-desc ol{margin:0 0 1.05em;padding-left:1.3em}
.lab-desc li{margin-bottom:.35em}
.lab-desc a{text-decoration:underline;text-underline-offset:2px}
.lab-desc br+br{display:none}

.lab-log summary{list-style:none;cursor:pointer}
.lab-log summary::-webkit-details-marker{display:none}
.lab-log[open] .lab-sign::before{content:"[ − ]"}
.lab-log:not([open]) .lab-sign::before{content:"[ + ]"}

@media (prefers-reduced-motion: reduce){
  .lab-power{animation:none}
  .lab-dock{transition:none}
  .lab-track{scroll-behavior:auto !important}
}
`;

/* ============================================================
   Son : deux bruitages 8 bits, synthétisés à la demande
   ============================================================ */

type Blip = "tick" | "add";

/* Préférence son : lue dans le stockage du navigateur, « muet » côté
   serveur et à défaut. Un petit magasin externe plutôt qu'un effet. */
const soundListeners = new Set<() => void>();
function readSound(): boolean {
  try {
    return window.localStorage.getItem(SOUND_KEY) === "on";
  } catch {
    return false;
  }
}
function writeSound(on: boolean) {
  try {
    window.localStorage.setItem(SOUND_KEY, on ? "on" : "off");
  } catch {
    /* préférence non mémorisée : le magasin garde la valeur en mémoire */
  }
  memorySound = on;
  soundListeners.forEach((l) => l());
}
let memorySound: boolean | null = null;
const subscribeSound = (l: () => void) => {
  soundListeners.add(l);
  return () => soundListeners.delete(l);
};

function useRetroSound() {
  const on = useSyncExternalStore(subscribeSound, () => memorySound ?? readSound(), () => false);
  const ctxRef = useRef<AudioContext | null>(null);

  const ctx = useCallback(() => {
    if (!ctxRef.current) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      ctxRef.current = new AC();
    }
    if (ctxRef.current.state === "suspended") void ctxRef.current.resume();
    return ctxRef.current;
  }, []);

  const tone = (ac: AudioContext, freq: number, start: number, dur: number, gain: number) => {
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(freq, start);
    g.gain.setValueAtTime(gain, start);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(g).connect(ac.destination);
    osc.start(start);
    osc.stop(start + dur + 0.02);
  };

  const play = useCallback(
    (kind: Blip, force = false) => {
      if (!on && !force) return;
      const ac = ctx();
      if (!ac) return;
      const t = ac.currentTime;
      if (kind === "tick") {
        tone(ac, 1760, t, 0.03, 0.035);
      } else {
        [660, 880, 1320].forEach((f, i) => tone(ac, f, t + i * 0.07, 0.09, 0.045));
      }
    },
    [on, ctx],
  );

  const toggle = useCallback(() => {
    const next = !on;
    writeSound(next);
    /* Le clic qui allume le son est aussi le geste qui débloque l'audio
       du navigateur : on confirme d'un petit bip. */
    if (next) play("tick", true);
  }, [on, play]);

  return { on, toggle, play };
}

/* ============================================================
   Le sticker « 1/1 » : décollable si le navigateur sait faire
   ============================================================ */

/* WebGL2 et animations autorisées ? Lu une seule fois, côté client ;
   le rendu serveur (et l'hydratation) partent toujours du sticker à plat. */
let peelSupport: boolean | null = null;
function canPeel(): boolean {
  if (peelSupport !== null) return peelSupport;
  peelSupport = false;
  try {
    if (!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      const gl = document.createElement("canvas").getContext("webgl2");
      if (gl) {
        gl.getExtension("WEBGL_lose_context")?.loseContext();
        peelSupport = true;
      }
    }
  } catch {
    /* reste statique */
  }
  return peelSupport;
}
const noop = () => () => {};

function UniqueSticker() {
  const mode = useSyncExternalStore(noop, () => (canPeel() ? "peel" : "static"), () => "static");

  return (
    <div className="relative h-[104px] w-[104px] sm:h-[124px] sm:w-[124px]" title="Pièce unique : un seul exemplaire">
      <span className="sr-only">Pièce unique, exemplaire 1/1</span>
      {mode === "peel" ? (
        <StickerPeel
          imageSrc={STICKER_SRC}
          width={96}
          rotate={-8}
          finish="holo"
          draggable={false}
          peelBackHoverPct={28}
          peelBackActivePct={46}
          lightingIntensity={0.55}
          shadowIntensity={0.45}
          className="h-full w-full"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- petit SVG local, rien à optimiser
        <img
          src={STICKER_SRC}
          alt=""
          aria-hidden
          width={96}
          height={96}
          className="absolute top-1/2 left-1/2 h-[96px] w-[96px] -translate-x-1/2 -translate-y-1/2 -rotate-[8deg] drop-shadow-[2px_3px_0_rgba(24,12,58,0.35)]"
        />
      )}
    </div>
  );
}

/* ============================================================
   PHOTO_ROLL : la galerie
   ------------------------------------------------------------
   Défilement natif à aimantation (scroll-snap) : le geste du
   pouce est celui du téléphone, sans bibliothèque. Photo entière
   (`contain`) sur le passe-partout gris de la fiche officielle.
   Rien ne se superpose à l'image : compteur et commandes vivent
   dans la barre du dessous.
   ============================================================ */

function PhotoRoll({
  images,
  name,
  onTick,
  soundOn,
  onToggleSound,
}: {
  images: string[];
  name: string;
  onTick: () => void;
  soundOn: boolean;
  onToggleSound: () => void;
}) {
  const pics = images.length > 0 ? images : [""];
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState<number | null>(null);
  useScrollLock(zoom !== null);

  const onScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / Math.max(1, el.clientWidth));
    if (i !== index) {
      setIndex(i);
      onTick();
    }
  };

  const goTo = (i: number) => {
    const el = trackRef.current;
    if (!el) return;
    const n = (i + pics.length) % pics.length;
    const smooth = !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: n * el.clientWidth, behavior: smooth ? "smooth" : "auto" });
  };

  useEffect(() => {
    if (zoom === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoom(null);
      if (e.key === "ArrowLeft") setZoom((z) => (z === null ? z : (z - 1 + pics.length) % pics.length));
      if (e.key === "ArrowRight") setZoom((z) => (z === null ? z : (z + 1) % pics.length));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoom, pics.length]);

  const ctrl = `${MONO} flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[#c6c2d8] ${PLASTIC_FACE} text-[0.875rem] font-bold text-[#262626] transition hover:brightness-105 disabled:opacity-40 ${PLASTIC} ${PLASTIC_PRESS}`;
  const many = pics.length > 1;

  return (
    <div className="min-w-0">
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="lab-track flex h-[min(56svh,520px)] snap-x snap-mandatory overflow-x-auto bg-[#d6d3e2] shadow-inner lg:h-auto lg:aspect-[4/5] lg:max-h-[78vh] lg:rounded-xl lg:border-2 lg:border-[#b8b4cc]"
        role="region"
        aria-roledescription="carrousel"
        aria-label={`Photos de ${name}`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") { e.preventDefault(); goTo(index + 1); }
          if (e.key === "ArrowLeft") { e.preventDefault(); goTo(index - 1); }
        }}
      >
        {pics.map((src, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setZoom(i)}
            className="relative h-full w-full shrink-0 snap-center snap-always cursor-zoom-in"
            aria-label={`Agrandir la vue ${i + 1}`}
          >
            <SmartImg
              className="absolute inset-0 h-full w-full object-contain"
              src={src}
              alt={`${name}, vue ${i + 1}`}
              tone={i}
              sizes={LAB_STAGE_SIZES}
              priority={i === 0}
            />
          </button>
        ))}
      </div>

      {/* Pupitre : ◀  barre de progression Win98  ▶  SON */}
      <div className="flex items-center gap-2 border-y-2 border-[#c6c2d8] bg-[#e9e7f2] px-3 py-2 lg:mt-3 lg:rounded-xl lg:border-2">
        <button type="button" className={ctrl} onClick={() => goTo(index - 1)} disabled={!many} aria-label="Photo précédente">
          ◀
        </button>

        <div className="min-w-0 flex-1">
          <div className={`flex h-5 items-stretch gap-[3px] rounded-sm border border-[#8b87a3] bg-white p-[3px] ${BEVEL_IN}`}>
            {pics.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Voir photo ${i + 1}`}
                aria-current={i === index ? "true" : undefined}
                className={`min-w-0 flex-1 rounded-[1px] transition-colors ${
                  i <= index ? "bg-gradient-to-b from-[#ff5ec4] to-[#c3128a]" : "bg-[#e3e0ee] hover:bg-[#d3cfe4]"
                }`}
              />
            ))}
          </div>
          <div className={`${MONO} mt-1 flex justify-between text-[0.75rem] font-bold tracking-[0.12em] text-[#3b3550] uppercase`}>
            <span aria-live="polite">
              VUE {String(index + 1).padStart(2, "0")}/{String(pics.length).padStart(2, "0")}
            </span>
            <span className="text-[#6B7280]">Toucher = zoom</span>
          </div>
        </div>

        <button type="button" className={ctrl} onClick={() => goTo(index + 1)} disabled={!many} aria-label="Photo suivante">
          ▶
        </button>
        <button
          type="button"
          className={`${ctrl} w-auto px-2 text-[0.75rem]`}
          onClick={onToggleSound}
          aria-pressed={soundOn}
          aria-label={soundOn ? "Couper les sons" : "Activer les sons"}
        >
          {soundOn ? "🔊" : "🔇"}
        </button>
      </div>

      {/* Planche contact, au bureau seulement : sur téléphone, la barre
          de progression joue ce rôle sans prendre de hauteur. */}
      {many && (
        <div className="mt-4 hidden flex-wrap justify-center gap-3 lg:flex">
          {pics.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Voir photo ${i + 1}`}
              className={`rounded-[2px] border border-black/10 bg-white p-1 pb-2.5 transition hover:-translate-y-1 ${
                i === index ? "shadow-[0_0_0_2px_#d3016d,3px_4px_0_rgba(24,12,58,0.4)]" : "shadow-[3px_4px_0_rgba(24,12,58,0.25)]"
              }`}
              style={{ transform: `rotate(${i === index ? 0 : (i % 2 ? 1 : -1) * (2 + (i % 3))}deg)` }}
            >
              <span className="block h-16 w-16 overflow-hidden bg-[#e7e5f1]">
                <SmartImg className="h-full w-full object-cover" src={src} alt="" tone={i} sizes="64px" />
              </span>
            </button>
          ))}
        </div>
      )}

      {zoom !== null && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setZoom(null)}
          role="dialog"
          aria-modal
          aria-label={name}
        >
          <button
            type="button"
            onClick={() => setZoom(null)}
            className={`${MONO} absolute top-4 right-4 z-10 rounded-md border border-[#c6c2d8] ${PLASTIC_FACE} px-3 py-2 text-[0.8125rem] font-bold text-[#262626] uppercase ${PLASTIC} ${PLASTIC_PRESS}`}
          >
            [ × CLOSE ]
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element -- photo Shopify pleine résolution, déjà servie par le CDN */}
          <img
            src={pics[zoom]}
            alt={`${name}, vue ${zoom + 1}`}
            className="max-h-[86vh] max-w-[94vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          {many && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setZoom((zoom - 1 + pics.length) % pics.length); }}
                aria-label="Photo précédente"
                className={`${MONO} absolute left-3 rounded-md border border-[#c6c2d8] ${PLASTIC_FACE} px-3 py-3 font-bold text-[#262626] ${PLASTIC} ${PLASTIC_PRESS}`}
              >
                ◀
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setZoom((zoom + 1) % pics.length); }}
                aria-label="Photo suivante"
                className={`${MONO} absolute right-3 rounded-md border border-[#c6c2d8] ${PLASTIC_FACE} px-3 py-3 font-bold text-[#262626] ${PLASTIC} ${PLASTIC_PRESS}`}
              >
                ▶
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   Pastille de caractéristique (taille, état, rayon)
   ============================================================ */

function Chip({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className={`flex min-w-0 items-center gap-2 rounded-md border border-[#c6c2d8] bg-[#f7f6fc] px-2.5 py-1.5 ${BEVEL_IN}`}>
      <span aria-hidden className="shrink-0 text-[1rem] leading-none">{icon}</span>
      <span className="min-w-0">
        <span className={`${MONO} block text-[0.6875rem] font-bold tracking-[0.14em] text-[#6B7280] uppercase`}>{label}</span>
        <span className={`${MONO} block text-[0.9375rem] leading-tight font-bold text-[#1E2430] uppercase`}>{value}</span>
      </span>
    </div>
  );
}

/* ============================================================
   La fiche
   ============================================================ */

export function ArchiveProduct({ product }: { product: ProductDetail }) {
  const { t } = useLanguage();
  const { addItem, hasVariant } = useCart();
  const { has, toggle } = useWishlist();
  const router = useRouter();
  const sound = useRetroSound();

  const [menu, setMenu] = useState(false);
  const [added, setAdded] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const hasVariants = product.variants.length > 0;
  const [variant, setVariant] = useState(() => product.variants.find((v) => v.availableForSale) ?? product.variants[0]);
  const sold = hasVariants ? !variant?.availableForSale : !product.available;
  const variantId = hasVariants ? (variant?.id ?? null) : product.defaultVariantId;
  const inCart = hasVariant(variantId);
  const liked = has(product.handle);
  const discount = product.was ? Math.round((1 - product.price / product.was) * 100) : null;

  /* Mêmes valeurs que la fiche officielle. */
  const size = variant?.title ?? product.size ?? "UNIQUE";
  const etat = (product.etat && stripEtatWord(product.etat)) || "Non renseigné";
  const deptKey = categoryForProduct(product.collections, product.productType)?.catKey;
  const dept = deptKey ? (t.cat[deptKey] ?? deptKey) : (product.collections[0] ?? null);
  const badge = product.tag === "NEW" ? "🔥 NEW IN" : null;

  /* Bouton collant : visible tant que le vrai bouton est hors de l'écran. */
  const ctaRef = useRef<HTMLDivElement>(null);
  const [ctaVisible, setCtaVisible] = useState(true);
  useEffect(() => {
    const el = ctaRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setCtaVisible(entry.isIntersecting), { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const add = async () => {
    if (sold || !variantId || added) return;
    if (inCart) {
      router.push("/cart");
      return;
    }
    setAdded(true);
    setAddError(null);
    sound.play("add");
    try {
      await addItem(variantId, 1);
      setTimeout(() => setAdded(false), 1400);
    } catch (err) {
      setAdded(false);
      setAddError(err instanceof Error ? err.message : "Erreur lors de l'ajout au panier");
    }
  };

  const ctaLabel = sold
    ? "[ × SOLD_OUT.SYS ]"
    : added
      ? "[ ✓ ADDED.OK ]"
      : inCart
        ? "[ ✓ IN_CART.SYS ]"
        : "[ 🛒 ADD_TO_CART.EXE ]";
  const ctaTone =
    added || inCart
      ? "border-[#0f5c26] bg-gradient-to-b from-[#4fbe84] to-[#1B8A3C]"
      : "border-[#7a0a52] bg-gradient-to-b from-[#ff5ec4] to-[#c3128a]";

  /* Description découpée comme sur la fiche officielle. */
  const { sections } = product.descriptionHtml ? parseDescription(product.descriptionHtml) : { sections: [] };
  const detailsHtml = sections.find((s) => s.label === "Les détails de la pépite")?.content ?? "";
  const moodHtml = sections
    .filter((s) => s.label !== "Info Mannequin & Fit" && s.label !== "Les détails de la pépite")
    .map((s) => s.content)
    .join("");
  const fitHtml = sections.find((s) => s.label === "Info Mannequin & Fit")?.content ?? "";

  const logs = [
    {
      id: "details",
      file: "DETAILS_&_PEPITE.SYS",
      body: detailsHtml ? <div dangerouslySetInnerHTML={{ __html: detailsHtml }} /> : <p>Aucun détail renseigné pour cette pièce.</p>,
    },
    {
      id: "mood",
      file: "DESCRIPTION_&_MOOD.TXT",
      body: moodHtml ? <div dangerouslySetInnerHTML={{ __html: moodHtml }} /> : <p>Aucune description renseignée pour cette pièce.</p>,
    },
    {
      id: "fit",
      file: "FIT_&_MEASUREMENTS.SYS",
      body: (
        <>
          {fitHtml && <div dangerouslySetInnerHTML={{ __html: fitHtml }} />}
          <p className={fitHtml ? "mt-4" : ""}>
            <strong>{t.pdp.detailsH}</strong>
            <br />
            {t.pdp.detailsBody}
          </p>
        </>
      ),
    },
    {
      id: "shipping",
      file: "SHIPPING_&_RETURNS.EXE",
      body: (
        <p>
          <strong>{t.pdp.shippingH}</strong>
          <br />
          {t.pdp.shippingBody}
        </p>
      ),
    },
  ];

  const openShipping = () => {
    const el = document.getElementById("lab-log-shipping") as HTMLDetailsElement | null;
    if (!el) return;
    el.open = true;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <>
      <Nav onMenu={() => setMenu(true)} forceSolid />
      <Drawer open={menu} onClose={() => setMenu(false)} />

      <main className="relative pb-28 lg:pb-0" style={WALLPAPER}>
        <style>{LAB_CSS}</style>

        <div className="mx-auto w-full max-w-[1280px] px-0 pt-[72px] pb-[clamp(24px,4vw,48px)] sm:px-6 sm:pt-[calc(72px+24px)]">
          <WindowFrame
            title="PIECE_UNIQUE.EXE"
            icon={<Icon.folderOpen width={15} height={12} />}
            className="max-sm:rounded-none max-sm:border-x-0"
            bodyStyle={{ backgroundColor: "#ffffff" }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:grid-rows-[auto_1fr] lg:gap-x-10 lg:gap-y-6 lg:p-6">
              <div className="min-w-0 lg:row-span-2">
              <PhotoRoll
                images={product.images}
                name={product.name}
                onTick={() => sound.play("tick")}
                soundOn={sound.on}
                onToggleSound={sound.toggle}
              />
              </div>

              {/* ITEM_STATS */}
              <div className="min-w-0 px-4 pt-4 pb-6 lg:px-0 lg:pt-2 lg:pb-0">
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1 pt-1">
                    <div className={`${MONO} text-[0.75rem] font-bold tracking-[0.16em] text-[#5b2fb8] uppercase`}>
                      ▶ ITEM_STATS.SYS
                    </div>
                    {badge && (
                      <span
                        className={`${MONO} mt-1.5 inline-block rounded-sm border border-[#c6c2d8] ${PLASTIC_FACE} px-2 py-0.5 text-[0.75rem] font-bold tracking-[0.06em] text-[#5b2fb8] uppercase ${PLASTIC}`}
                      >
                        {badge}
                      </span>
                    )}
                    <h1
                      className={`${LCD} mt-1.5 text-[clamp(1.55rem,6.4vw,2.6rem)] leading-[1.02] tracking-[0.02em] text-[#2a1266] uppercase lg:text-[clamp(1.8rem,2.8vw,2.6rem)]`}
                    >
                      {product.name}
                    </h1>
                  </div>
                  <div className="-mt-2 -mr-2 shrink-0">
                    <UniqueSticker />
                  </div>
                </div>

                {/* Prix + pastilles */}
                <div className="mt-3 flex flex-wrap items-stretch gap-2">
                  <div className={`lab-crt lab-power relative shrink-0 overflow-hidden rounded-lg border-2 border-[#2b2b3d] bg-black px-3.5 py-2 ${BEVEL_IN}`}>
                    <span className={`${MONO} relative z-[2] block text-[0.6875rem] font-bold tracking-[0.22em] text-white/70 uppercase`}>
                      PRICE_TAG.SYS
                    </span>
                    <span className="relative z-[2] flex items-baseline gap-2.5">
                      <span
                        className={`${LCD} text-[2.4rem] leading-[0.95] tracking-[0.02em] text-green-400`}
                        style={{ textShadow: "0 0 14px rgba(74,222,128,.7), 0 0 34px rgba(74,222,128,.35)" }}
                      >
                        {product.price}€
                      </span>
                      {product.was && <s className={`${MONO} text-[0.9375rem] text-white/40`}>{product.was}€</s>}
                      {discount !== null && (
                        <span
                          className={`${LCD} rounded border border-[#5affa0]/50 px-1.5 py-0.5 text-[1.1rem] leading-none`}
                          style={{ color: MATRIX, textShadow: `0 0 10px ${MATRIX}8c`, background: "rgba(90,255,160,0.08)" }}
                        >
                          -{discount}%
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="grid min-w-0 flex-1 basis-[180px] grid-cols-2 gap-2">
                    <Chip icon="📏" label="Taille" value={size} />
                    <Chip icon="💎" label="État" value={etat} />
                  </div>
                </div>

                {hasVariants && product.variants.length > 1 && (
                  <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label="Taille">
                    {product.variants.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        disabled={!v.availableForSale}
                        onClick={() => setVariant(v)}
                        aria-pressed={variant?.id === v.id}
                        className={`${MONO} rounded-md border px-3 py-1.5 text-[0.8125rem] font-bold uppercase transition disabled:cursor-not-allowed disabled:line-through disabled:opacity-35 ${
                          variant?.id === v.id
                            ? "border-[#1E2430] bg-[#1E2430] text-white"
                            : `border-[#c6c2d8] ${PLASTIC_FACE} text-[#262626] ${PLASTIC} ${PLASTIC_PRESS}`
                        }`}
                      >
                        {v.title}
                      </button>
                    ))}
                  </div>
                )}

                {/* Achat */}
                <div ref={ctaRef} className="mt-4 flex items-stretch gap-3">
                  <div className="min-w-0 flex-1">
                    <ClickSpark
                      sparkColor={["#ff5ec4", "#7147d4", MATRIX]}
                      shape="star"
                      sparkCount={10}
                      sparkSize={11}
                      sparkRadius={34}
                      duration={520}
                      disabled={sold}
                    >
                      <button
                        type="button"
                        onClick={add}
                        disabled={sold || !variantId}
                        className={`${MONO} w-full rounded-lg border-b-4 px-4 py-3.5 text-[1rem] font-black tracking-[0.06em] text-white uppercase transition active:translate-y-1 active:border-b-0 disabled:cursor-not-allowed disabled:opacity-45 ${ctaTone}`}
                        style={{ boxShadow: "0 5px 0 rgba(0,0,0,0.18)" }}
                        aria-label={inCart && !added ? "Déjà dans le panier — voir le panier" : undefined}
                      >
                        {ctaLabel}
                      </button>
                    </ClickSpark>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      toggle({ handle: product.handle, title: product.name, price: product.price, image: product.images[0], variantId })
                    }
                    aria-label="Ajouter aux favoris"
                    aria-pressed={liked}
                    className={`flex w-14 shrink-0 items-center justify-center rounded-lg border-b-4 transition active:translate-y-1 active:border-b-0 ${
                      liked ? "border-[#7a0a52] bg-gradient-to-b from-[#ff9ee4] to-[#d3016d] text-white" : `border-[#8b87a3] ${PLASTIC_FACE} text-[#6B7280]`
                    }`}
                    style={{ boxShadow: "0 5px 0 rgba(0,0,0,0.18)" }}
                  >
                    {liked ? <Icon.heart width={20} height={20} /> : <Icon.heartO width={20} height={20} />}
                  </button>
                </div>

                {addError && <p className={`${MONO} mt-2.5 text-[0.8125rem] text-[#d4006e]`}>⚠ {addError}</p>}

                {/* Réassurance : renvoie au fichier livraison plus bas. */}
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
                  <button
                    type="button"
                    onClick={openShipping}
                    className={`${MONO} text-[0.8125rem] font-bold tracking-[0.04em] text-[#3b3550] uppercase underline decoration-[#c6c2d8] decoration-2 underline-offset-4 hover:text-[#d3016d]`}
                  >
                    📦 {t.pdp.shippingH} →
                  </button>
                  {dept && (
                    <span className={`${MONO} text-[0.8125rem] tracking-[0.06em] text-[#6B7280] uppercase`}>🗂️ {dept}</span>
                  )}
                </div>
              </div>

            {/* ---- Sous l'achat : le décor assumé. Pleine largeur sur
                téléphone ; au bureau, il occupe la colonne de droite sous
                l'achat au lieu de laisser un grand vide à côté de la photo. */}
            <div className="min-w-0 border-t-2 border-[#c6c2d8] lg:col-start-2 lg:self-start lg:overflow-hidden lg:rounded-xl lg:border-2">
              <div className="flex flex-wrap items-center gap-4 bg-[#e9e7f2] px-3 py-1.5">
                {["Fichier", "Édition", "Affichage", "Favoris", "?"].map((m) => (
                  <span key={m} className={`${MONO} text-[0.75rem] tracking-[0.06em] text-[#3b3550] uppercase`}>
                    {m}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 border-y border-[#c6c2d8] bg-[#f0eef7] px-3 py-2">
                <span className={`${MONO} shrink-0 text-[0.75rem] tracking-[0.14em] text-[#6B7280] uppercase`}>Adresse</span>
                <span
                  className={`${MONO} flex min-w-0 flex-1 items-center gap-1.5 rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-[0.8125rem] text-[#1E2430] ${BEVEL_IN}`}
                >
                  <Icon.folder width={14} height={12} className="shrink-0" />
                  <span className="truncate">{`C:\\LIL_OG\\ITEMS\\${product.handle}`}</span>
                </span>
              </div>

              <div className="px-4 py-5">
                <div className={`${MONO} mb-2 text-[0.75rem] font-bold tracking-[0.16em] text-[#5b2fb8] uppercase`}>▶ SYSTEM_LOGS</div>
                <div className="flex flex-col gap-1.5">
                  {logs.map((log, i) => (
                    <details
                      key={log.id}
                      id={`lab-log-${log.id}`}
                      name="lab-logs"
                      open={i === 0}
                      className="lab-log overflow-hidden rounded-md border border-[#c6c2d8]"
                    >
                      <summary
                        className={`${MONO} flex items-center gap-2 px-3 py-3 text-[0.8125rem] font-bold uppercase ${PLASTIC_FACE} text-[#3b3550] ${PLASTIC}`}
                      >
                        <span aria-hidden>📂</span>
                        <span className="min-w-0 flex-1 truncate">{log.file}</span>
                        <span aria-hidden className="lab-sign shrink-0 text-[#5b2fb8]" />
                      </summary>
                      <div className={`bg-white p-3.5 ${BEVEL_IN}`}>
                        <div className={`${MONO} lab-desc text-[0.9375rem] leading-[1.8] text-[#3b3550]`}>{log.body}</div>
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            </div>
            </div>
          </WindowFrame>
        </div>

        {/* Bouton collant (téléphone) */}
        <div
          className={`lab-dock fixed inset-x-0 bottom-0 z-40 border-t-2 border-[#2a1370] bg-[#f0f0f5]/95 px-3 pt-2 pb-[calc(8px+env(safe-area-inset-bottom))] backdrop-blur lg:hidden ${
            ctaVisible || sold ? "pointer-events-none translate-y-full opacity-0" : "translate-y-0 opacity-100"
          }`}
          aria-hidden={ctaVisible || sold}
        >
          <div className="flex items-center gap-2.5">
            <div className={`lab-crt relative shrink-0 overflow-hidden rounded-md border-2 border-[#2b2b3d] bg-black px-2.5 py-1 ${BEVEL_IN}`}>
              <span
                className={`${LCD} relative z-[2] text-[1.5rem] leading-none text-green-400`}
                style={{ textShadow: "0 0 10px rgba(74,222,128,.6)" }}
              >
                {product.price}€
              </span>
            </div>
            <button
              type="button"
              onClick={add}
              tabIndex={ctaVisible ? -1 : 0}
              disabled={sold || !variantId}
              className={`${MONO} min-w-0 flex-1 truncate rounded-lg border-b-4 px-3 py-3 text-[0.875rem] font-black tracking-[0.05em] text-white uppercase active:translate-y-1 active:border-b-0 ${ctaTone}`}
            >
              {ctaLabel}
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
