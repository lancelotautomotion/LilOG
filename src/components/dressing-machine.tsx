"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Nav } from "@/components/nav";
import { Drawer } from "@/components/drawer";
import { Footer } from "@/components/footer";
import { SmartImg } from "@/components/smart-img";
import { ChromeStar, GemSticker } from "@/components/contact/stickers";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/hooks/use-wishlist";
import { compareSizes, STANDARD_SHOE_SIZES, STANDARD_SIZES } from "@/lib/sizes";
import type { ClosetItem, ClosetSlot, ClosetVariant } from "@/lib/shopify/types";

/* ================================================================== *
 * Config
 * ================================================================== */

interface ModuleDef {
  slot: ClosetSlot;
  exe: string;
  window: string;
  /** Where the floating window sits before the shopper drags it, px from the
   *  viewport centre. Fixed per module so two windows never stack exactly. */
  offset: { x: number; y: number };
}

const MODULES: ModuleDef[] = [
  { slot: "jewelry",   exe: "AJOUTER_BIJOUX.EXE",      window: "BIJOUX.EXE",      offset: { x: -470, y: -140 } },
  { slot: "bag",       exe: "AJOUTER_SAC.EXE",         window: "SAC.EXE",         offset: { x:  470, y: -180 } },
  { slot: "accessory", exe: "AJOUTER_ACCESSOIRE.EXE",  window: "ACCESSOIRE.EXE",  offset: { x: -420, y:  110 } },
  { slot: "shoes",     exe: "AJOUTER_CHAUSSURES.EXE",  window: "CHAUSSURES.EXE",  offset: { x:  420, y:   80 } },
];

const STYLE_PHRASES = [
  "AS IF!",
  "TOTALLY BUGGIN'",
  "ICONIC",
  "THAT'S SO FETCH",
  "FULL ON MONET",
  "MALL READY",
  "SERVING LOOKS",
  "MAIN CHARACTER",
  "WAY EXISTENTIAL",
  "SUPER CUTE",
] as const;

/* Strass de la maison : mêmes pastilles et mêmes teintes que /faq,
 * /contact, /login et le bas de page. Elles décorent l'arête centrale
 * de part et d'autre de la bulle STYLE_ME. */
const STRASS_STAR: [string, string, string] = ["#FFB3D6", "#F0509A", "#B7175C"];
const STRASS_HEART: [string, string, string] = ["#FFC0DF", "#EE4B96", "#B3155A"];

/* ================================================================== *
 * Helpers
 * ================================================================== */

/** Stable pseudo-random in 84–100 so the same look always scores the same. */
function matchPercent(keys: string[]): number {
  let h = 7;
  for (const k of keys) {
    for (let i = 0; i < k.length; i++) h = (h * 31 + k.charCodeAt(i)) | 0;
  }
  return 84 + (Math.abs(h) % 17);
}

function phraseFor(keys: string[]): string {
  let h = 13;
  for (const k of keys) {
    for (let i = 0; i < k.length; i++) h = (h * 17 + k.charCodeAt(i)) | 0;
  }
  return STYLE_PHRASES[Math.abs(h) % STYLE_PHRASES.length];
}

/** The variant to buy for a piece: one of the shopper's sizes when it exists. */
function variantFor(item: ClosetItem, selected: ReadonlySet<string>): ClosetVariant | null {
  const buyable = item.variants.filter((v) => v.available);
  const pool = buyable.length > 0 ? buyable : item.variants;
  if (selected.size > 0) {
    const exact = pool.find((v) => v.size && selected.has(v.size));
    if (exact) return exact;
  }
  return pool[0] ?? null;
}

function priceOf(item: ClosetItem, selected: ReadonlySet<string>): number {
  return variantFor(item, selected)?.price ?? item.price;
}

/**
 * Narrow a pool to the shopper's sizes: an empty selection means "toutes".
 * `strict` columns (Hauts / Bas) show nothing when nothing fits; the optional
 * modules fall back to the full pool rather than going dark, since a bag or a
 * collier has no morphology to speak of.
 */
function applySizes(
  list: ClosetItem[],
  selected: ReadonlySet<string>,
  strict: boolean,
): ClosetItem[] {
  if (selected.size === 0) return list;
  const matched = list.filter(
    (i) => i.sizes.length === 0 || i.sizes.some((s) => selected.has(s)),
  );
  return strict || matched.length > 0 ? matched : list;
}

function toggleIn(set: ReadonlySet<string>, value: string): Set<string> {
  const next = new Set(set);
  if (!next.delete(value)) next.add(value);
  return next;
}

/** "M, L": for the toolbar tag and the empty-rack message. */
function describe(selected: ReadonlySet<string>): string {
  return selected.size === 0 ? "toutes" : [...selected].join(", ");
}

function euros(n: number): string {
  return n.toFixed(2) + "€";
}

/** Types a string out one character at a time while `active`. */
function useTyped(text: string, active: boolean, speed = 18): string {
  const [count, setCount] = useState(0);

  // Rewind during render (not in an effect) so a new string never flashes
  // fully typed for one frame before the interval restarts.
  const key = `${active}|${text}`;
  const [prevKey, setPrevKey] = useState(key);
  if (prevKey !== key) {
    setPrevKey(key);
    setCount(0);
  }

  useEffect(() => {
    if (!active) return;
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setCount(i);
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, active, speed]);

  return text.slice(0, count);
}

/**
 * Roulette de casino. Deux noms d'animation alternés : rejouer en changeant de
 * classe évite de remonter le DOM, donc l'image ne se recharge pas entre deux
 * tours. `SPIN_SWAP` est le moment où la pièce est échangée : au creux du
 * flou, pour que la substitution ne se voie pas. Doit rester en phase avec la
 * durée des keyframes dmSpinA/dmSpinB (440ms) dans globals.css.
 */
const SPIN_SWAP = 190;

function useReel() {
  const [run, setRun] = useState(0);
  const play = useCallback(() => setRun((r) => r + 1), []);
  const className = run === 0 ? "" : run % 2 === 1 ? " spin-a" : " spin-b";
  return { play, className };
}

/* ================================================================== *
 * ÉTAPE 1 : SYSTEM_LOGIN.EXE
 * ================================================================== */

/** One multi-select row of size chips, plus a "toutes" reset. */
function SizeRow({
  label,
  hint,
  name,
  options,
  selected,
  onToggle,
  onClear,
}: {
  label: string;
  hint?: string;
  name: string;
  options: string[];
  selected: ReadonlySet<string>;
  onToggle: (value: string) => void;
  onClear: () => void;
}) {
  return (
    <div className="dm-gate-field">
      <span className="dm-gate-label">
        {label}
        <em className="dm-gate-hint">plusieurs choix possibles</em>
      </span>
      <div className="dm-size-grid">
        {options.map((s) => (
          <label key={s} className={"dm-size" + (selected.has(s) ? " on" : "")}>
            <input
              type="checkbox"
              name={name}
              value={s}
              checked={selected.has(s)}
              onChange={() => onToggle(s)}
            />
            {s}
          </label>
        ))}
        <label className={"dm-size dm-size-all" + (selected.size === 0 ? " on" : "")}>
          <input
            type="checkbox"
            name={`${name}-all`}
            checked={selected.size === 0}
            onChange={onClear}
          />
          TOUTES
        </label>
      </div>
      {hint && <p className="dm-gate-note">{hint}</p>}
    </div>
  );
}

function SizeGate({
  sizes,
  shoeSizes,
  inferred,
  shoeInferred,
  initialSizes,
  initialShoeSizes,
  onLaunch,
}: {
  sizes: string[];
  /** Empty when the catalogue holds no shoes: the row is then hidden. */
  shoeSizes: string[];
  /** true when the catalogue carried no sizing and we fell back to a default. */
  inferred: boolean;
  shoeInferred: boolean;
  initialSizes: ReadonlySet<string>;
  initialShoeSizes: ReadonlySet<string>;
  onLaunch: (sizes: Set<string>, shoeSizes: Set<string>) => void;
}) {
  // Seeded from the current selection so re-opening the gate from the toolbar
  // shows what the shopper already picked rather than resetting it.
  const [picked, setPicked] = useState<ReadonlySet<string>>(() =>
    initialSizes.size > 0
      ? new Set(initialSizes)
      : new Set(sizes[Math.floor(sizes.length / 2)] ? [sizes[Math.floor(sizes.length / 2)]] : []),
  );
  const [pickedShoes, setPickedShoes] = useState<ReadonlySet<string>>(
    () => new Set(initialShoeSizes),
  );

  const intro = "Veuillez entrer vos paramètres morphologiques pour initialiser la machine.";
  const typed = useTyped(intro, true, 16);

  const noSizing = "Le catalogue ne renseigne pas encore les tailles : toutes les pièces resteront affichées quel que soit votre choix.";
  const noPointure = "Aucune pointure n'est renseignée : toutes les chaussures resteront affichées.";

  return (
    <div className="dm-gate-scrim" role="dialog" aria-modal="true" aria-label="SYSTEM_LOGIN.EXE">
      <div className="dm-win dm-gate-win">
        <div className="dm-titlebar">
          <span className="dm-titlebar-text">SYSTEM_LOGIN.EXE</span>
          <div className="dm-chrome">
            <span className="dm-chrome-btn" aria-hidden>_</span>
            <span className="dm-chrome-btn" aria-hidden>□</span>
            <Link className="dm-chrome-btn" href="/" aria-label="Fermer">×</Link>
          </div>
        </div>

        <div className="dm-gate-body">
          <div className="dm-gate-intro">
            <span className="dm-gate-glyph" aria-hidden>◧</span>
            <p className="dm-gate-text">
              {typed}
              <span className="dm-caret">_</span>
            </p>
          </div>

          <SizeRow
            label="Taille"
            hint={inferred ? noSizing : undefined}
            name="dm-size"
            options={sizes}
            selected={picked}
            onToggle={(v) => setPicked((p) => toggleIn(p, v))}
            onClear={() => setPicked(new Set())}
          />

          {shoeSizes.length > 0 && (
            <SizeRow
              label="Pointure"
              hint={shoeInferred ? noPointure : undefined}
              name="dm-shoe-size"
              options={shoeSizes}
              selected={pickedShoes}
              onToggle={(v) => setPickedShoes((p) => toggleIn(p, v))}
              onClear={() => setPickedShoes(new Set())}
            />
          )}

          <button
            className="dm-w95 dm-cop-btn dm-gate-launch"
            onClick={() => onLaunch(new Set(picked), new Set(pickedShoes))}
          >
            LANCER_LA_MACHINE.EXE →
          </button>
        </div>

        <div className="dm-statusbar">
          <span className="dm-status-cell">C:\LILOG\CLOSET&gt;</span>
          <span className="dm-status-cell dm-status-grow">EN ATTENTE…</span>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== *
 * ÉTAPE 3 : Les deux baies plein cadre
 * ================================================================== */

function Bay({
  label,
  items,
  index,
  selected,
  spinSignal,
  col,
  saved,
  onToggleSave,
  onNext,
  locked,
  onToggleLock,
  onChangeSize,
}: {
  label: string;
  items: ClosetItem[];
  index: number;
  selected: ReadonlySet<string>;
  /** Bumped by STYLE_ME so both bays spin together. */
  spinSignal: number;
  /** Grid column of .dm-screen : 1 for HAUTS, 3 for BAS. */
  col: 1 | 3;
  /** This piece alone is in the wishlist: unrelated to the full-look save. */
  saved: boolean;
  onToggleSave: () => void;
  onNext: () => void;
  /** Cadenas fermé : STYLE_ME laisse cette pièce en place. */
  locked: boolean;
  onToggleLock: () => void;
  onChangeSize: () => void;
}) {
  const item = items[index];
  const reel = useReel();
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // Replay during render rather than in an effect, so the animation starts on
  // the same commit as the shuffle instead of one frame later.
  const [prevSignal, setPrevSignal] = useState(spinSignal);
  if (prevSignal !== spinSignal) {
    setPrevSignal(spinSignal);
    // Verrouillée, la baie garde sa pièce : la faire tourner pour rien
    // laisserait croire à un tirage.
    if (!locked) reel.play();
  }

  const pull = () => {
    reel.play();
    timers.current.push(setTimeout(onNext, SPIN_SWAP));
  };

  // Rendered as grid cells rather than a nested column, so both bays share
  // the same four rows and line up whatever their content.
  const cell = { gridColumn: col };

  /* `.dm-bay` est en `display: contents` sur grand écran : la boîte
     disparaît de la mise en page et les quatre éléments retombent
     directement dans la grille de `.dm-screen`, rangée par rangée, comme
     avant son introduction. Sur téléphone, elle redevient une vraie boîte
     — la moitié haute ou basse de l'écran — et sert de repère aux quatre
     éléments, qui s'y superposent au lieu de s'empiler. */
  return (
    <div className={"dm-bay " + (col === 1 ? "dm-bay-up" : "dm-bay-down")}>
      <header className="dm-bay-head" style={cell}>
        <span className="dm-bay-label">{label}</span>
        <span className="dm-bay-count">
          {items.length === 0
            ? "00/00"
            : `${String(index + 1).padStart(2, "0")}/${String(items.length).padStart(2, "0")}`}
        </span>
      </header>

      <div className="dm-viewport" style={cell}>
        {item ? (
          <div className={"dm-reel" + reel.className}>
            <SmartImg className="dm-reel-bg" src={item.image} alt="" />
            <Link href={`/products/${item.handle}`} className="dm-reel-link" title={item.name}>
              <SmartImg className="dm-reel-img" src={item.image} alt={item.name} />
            </Link>
            <span className="dm-reel-shade" aria-hidden />
          </div>
        ) : (
          <div className="dm-bay-empty">
            <p>
              &gt; AUCUNE PIÈCE{selected.size > 0 ? ` EN ${describe(selected)}` : ""}
              <br />
              &gt; DANS CE RAYON.
            </p>
            <button type="button" className="dm-w95" onClick={onChangeSize}>
              CHANGER DE TAILLE
            </button>
          </div>
        )}
      </div>

      <div className="dm-bay-plate" style={cell}>
        <span className="dm-plate-name">{item ? item.name : "···"}</span>
        <span className="dm-plate-price">{item ? euros(priceOf(item, selected)) : "···"}</span>
      </div>

      <div className="dm-bay-actions" style={cell}>
        <button
          type="button"
          className="dm-spin"
          onClick={pull}
          disabled={items.length < 2}
          aria-label={`Faire tourner ${label}`}
        >
          <span className="dm-spin-emoji" aria-hidden>🎰</span>
          [ SPIN ]
        </button>

        <button
          type="button"
          className={"dm-heart" + (saved ? " on" : "")}
          onClick={onToggleSave}
          disabled={!item}
          aria-pressed={saved}
          aria-label={
            item
              ? saved
                ? `Retirer ${item.name} de la wishlist`
                : `Ajouter ${item.name} à la wishlist`
              : "Aucune pièce à enregistrer"
          }
          title={saved ? "Retirer de la wishlist" : "Enregistrer cette pièce seule"}
        >
          {saved ? "♥" : "♡"}
        </button>

        {/* Cadenas : fermé, STYLE_ME laisse la pièce en place et ne fait
            plus tourner cette baie. C'est ce qui remplace les flèches sur
            téléphone — verrouiller un rayon et relancer STYLE_ME revient à
            ne faire défiler que l'autre. */}
        <button
          type="button"
          className={"dm-lock" + (locked ? " on" : "")}
          onClick={onToggleLock}
          aria-pressed={locked}
          title={
            locked
              ? "Pièce verrouillée : STYLE_ME ne la changera pas"
              : "Verrouiller cette pièce pour la garder au prochain STYLE_ME"
          }
          aria-label={
            locked
              ? `Déverrouiller ${label} : STYLE_ME pourra de nouveau changer la pièce`
              : `Verrouiller ${label} : STYLE_ME gardera cette pièce`
          }
        >
          {locked ? "🔒" : "🔓"}
        </button>
      </div>
    </div>
  );
}

/* ================================================================== *
 * ÉTAPE 4 : Le bouton d'ouverture, encastré dans la console
 * ================================================================== */

function ModuleTerminal({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="dm-modules">
      {/* Le libellé long tombe dans le dock de téléphone, où le bouton se
          réduit à son [ + ] : `aria-label` reprend le texte visible, donc
          le nom accessible ne change pas d'une largeur à l'autre. */}
      <button
        type="button"
        className="dm-w95 dm-modules-open"
        onClick={onOpen}
        aria-label="Ajouter un module"
      >
        [ + ]<span className="dm-btn-word">&nbsp;AJOUTER UN MODULE</span>
      </button>
    </div>
  );
}

/* ================================================================== *
 * AJOUTER_MODULE.EXE : fenêtre flottante de sélection des modules
 * ------------------------------------------------------------
 * Remplace l'ancien terminal encastré dans la console (64px de haut,
 * options qui défilaient en interne, difficile à parcourir) : les
 * quatre modules tiennent sans défilement dans une vraie fenêtre,
 * ouverte par-dessus la page comme SYSTEM_LOGIN.EXE. Rester ouverte
 * après un clic permet d'activer plusieurs modules d'affilée.
 * ================================================================== */

function ModulePickerModal({
  active,
  counts,
  onLaunch,
  onClose,
}: {
  active: Set<ClosetSlot>;
  counts: Record<string, number>;
  onLaunch: (mod: ModuleDef) => void;
  onClose: () => void;
}) {
  const boot = "> SYSTÈME PRÊT. SÉLECTIONNEZ UN MODULE :";
  const typed = useTyped(boot, true, 16);
  const booted = typed.length === boot.length;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="dm-gate-scrim"
      role="dialog"
      aria-modal="true"
      aria-label="AJOUTER_MODULE.EXE"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="dm-win dm-modpick-win">
        <div className="dm-titlebar">
          <span className="dm-titlebar-text">AJOUTER_MODULE.EXE</span>
          <div className="dm-chrome">
            <span className="dm-chrome-btn" aria-hidden>_</span>
            <span className="dm-chrome-btn" aria-hidden>□</span>
            <button type="button" className="dm-chrome-btn" onClick={onClose} aria-label="Fermer">
              ×
            </button>
          </div>
        </div>

        <div className="dm-modpick-body">
          <p className="dm-modpick-boot">
            {typed}
            {!booted && <span className="dm-caret">_</span>}
          </p>

          <div className="dm-modpick-options">
            {MODULES.map((mod) => {
              const on = active.has(mod.slot);
              const empty = (counts[mod.slot] ?? 0) === 0;
              return (
                <button
                  key={mod.slot}
                  type="button"
                  className={"dm-modpick-opt" + (on ? " on" : "") + (empty ? " out" : "")}
                  onClick={() => onLaunch(mod)}
                  aria-pressed={on}
                >
                  <span className="dm-modpick-box">[{on ? "x" : " "}]</span>
                  <span className="dm-modpick-exe">{mod.exe}</span>
                  {empty && <span className="dm-modpick-empty">Rayon vide</span>}
                </button>
              );
            })}
          </div>
        </div>

        <div className="dm-statusbar">
          <span className="dm-status-cell">C:\LILOG\CLOSET&gt;</span>
          <span className="dm-status-cell dm-status-grow">
            {active.size} MODULE{active.size !== 1 ? "S" : ""} ACTIF{active.size !== 1 ? "S" : ""}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== *
 * Fenêtre flottante d'un module
 * ================================================================== */

function ModuleWindow({
  mod,
  items,
  index,
  selected,
  z,
  saved,
  onFocus,
  onToggleSave,
  onNext,
  onClose,
}: {
  mod: ModuleDef;
  items: ClosetItem[];
  index: number;
  selected: ReadonlySet<string>;
  z: number;
  /** Cette pièce seule est en wishlist. */
  saved: boolean;
  onFocus: () => void;
  onToggleSave: () => void;
  onNext: () => void;
  onClose: () => void;
}) {
  // The window only ever mounts after a click, so `window` is safe here.
  // Clamp the cascade so a narrow desktop never opens a module off-screen.
  const [pos, setPos] = useState(() => {
    if (typeof window === "undefined") return mod.offset;
    const maxX = Math.max(90, window.innerWidth / 2 - 130);
    const maxY = Math.max(60, window.innerHeight / 2 - 150);
    return {
      x: Math.max(-maxX, Math.min(maxX, mod.offset.x)),
      y: Math.max(-maxY, Math.min(maxY, mod.offset.y)),
    };
  });
  const drag = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null);
  const reel = useReel();
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const item = items[index];

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const pull = () => {
    reel.play();
    timers.current.push(setTimeout(onNext, SPIN_SWAP));
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    onFocus();
    // The × lives inside the drag handle. Capturing the pointer here would
    // retarget the whole gesture, including the click, onto the title bar,
    // so the close button would never fire.
    if ((e.target as HTMLElement).closest("button, a")) return;
    drag.current = { sx: e.clientX, sy: e.clientY, ox: pos.x, oy: pos.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    setPos({ x: d.ox + (e.clientX - d.sx), y: d.oy + (e.clientY - d.sy) });
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    drag.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  if (!item) return null;

  return (
    <div
      className="dm-float"
      style={{ zIndex: z, transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))` }}
      onPointerDown={onFocus}
    >
      <div
        className="dm-float-bar"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <span className="dm-float-title">{mod.window}</span>
        <div className="dm-chrome">
          <button
            type="button"
            className="dm-chrome-btn"
            onClick={onClose}
            aria-label={`Fermer ${mod.window}`}
          >
            ×
          </button>
        </div>
      </div>

      <div className="dm-float-body">
        <div className="dm-float-img">
          <div className={"dm-reel" + reel.className} style={{ position: "relative", inset: "auto", height: "100%" }}>
            <Link href={`/products/${item.handle}`} title={item.name}>
              <SmartImg className="dm-reel-img" src={item.image} alt={item.name} />
            </Link>
          </div>
        </div>

        <span className="dm-float-count">
          {String(index + 1).padStart(2, "0")}/{String(items.length).padStart(2, "0")}
        </span>

        <div className="dm-float-plate">
          <span className="dm-float-name">{item.name}</span>
          <span className="dm-float-price">{euros(priceOf(item, selected))}</span>
        </div>

        <div className="dm-float-actions">
          <button
            type="button"
            className="dm-spin dm-float-spin"
            onClick={pull}
            disabled={items.length < 2}
            aria-label={`Faire tourner ${mod.window}`}
          >
            <span className="dm-spin-emoji" aria-hidden>🎰</span>
            [ SPIN ]
          </button>

          <button
            type="button"
            className={"dm-heart dm-float-heart" + (saved ? " on" : "")}
            onClick={onToggleSave}
            aria-pressed={saved}
            aria-label={
              saved
                ? `Retirer ${item.name} de la wishlist`
                : `Ajouter ${item.name} à la wishlist`
            }
            title={saved ? "Retirer de la wishlist" : "Enregistrer cette pièce seule"}
          >
            {saved ? "♥" : "♡"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== *
 * ÉTAPE 5 : Le scanner de la console
 * ================================================================== */

function MatchScanner({ keys }: { keys: string[] }) {
  const signature = keys.join("|");
  const target = matchPercent(keys);
  const phrase = phraseFor(keys);

  const [pct, setPct] = useState(0);
  const [scanning, setScanning] = useState(true);

  // Re-arm the gauge during render so it visibly restarts from zero whenever
  // the look changes, instead of jumping between two filled states.
  const [prevSignature, setPrevSignature] = useState(signature);
  if (prevSignature !== signature) {
    setPrevSignature(signature);
    setPct(0);
    setScanning(true);
  }

  useEffect(() => {
    const t1 = setTimeout(() => setPct(target), 40);
    const t2 = setTimeout(() => setScanning(false), 620);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [target, signature]);

  return (
    <div className="dm-scanner">
      <span className="dm-scanner-head">
        <span>Match detected</span>
        <span className="dm-scanner-pct">{scanning ? "--" : target}%</span>
      </span>
      <div className="dm-gauge">
        <div className={"dm-gauge-fill" + (scanning ? "" : " full")} style={{ width: `${pct}%` }} />
      </div>
      <span className="dm-scanner-verdict">
        {scanning ? <span className="dm-caret">_</span> : phrase}
      </span>
    </div>
  );
}

/* ================================================================== *
 * ÉTAPE 2 : DRESSING_MACHINE.EXE
 * ================================================================== */

export function DressingMachine({ items }: { items: ClosetItem[] }) {
  const router = useRouter();
  const { addItems, pending } = useCart();
  const wishlist = useWishlist();

  const [menu, setMenu] = useState(false);
  const [sizes, setSizes] = useState<ReadonlySet<string>>(() => new Set());
  const [shoeSizes, setShoeSizes] = useState<ReadonlySet<string>>(() => new Set());
  const [gateOpen, setGateOpen] = useState(true);
  const [topIdx, setTopIdx] = useState(0);
  const [bottomIdx, setBottomIdx] = useState(0);
  /* Rayons dont le cadenas est fermé : STYLE_ME les saute. */
  const [lockedSlots, setLockedSlots] = useState<ReadonlySet<ClosetSlot>>(() => new Set());
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [openSlots, setOpenSlots] = useState<ClosetSlot[]>([]);
  const [moduleIdx, setModuleIdx] = useState<Record<string, number>>({});
  const [topZ, setTopZ] = useState<Record<string, number>>({});
  const [status, setStatus] = useState("PRÊT.");
  // Bumped by STYLE_ME so every bay plays its reel on the same commit.
  const [spinSignal, setSpinSignal] = useState(0);
  const [copping, setCopping] = useState(false);
  const zRef = useRef(60);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  }, []);

  /* ---- pools ---- */

  const bySlot = useMemo(() => {
    const acc: Record<string, ClosetItem[]> = {
      top: [], bottom: [], jewelry: [], bag: [], accessory: [], shoes: [],
    };
    for (const it of items) acc[it.slot].push(it);
    return acc;
  }, [items]);

  // A single size across the whole catalogue isn't a choice: fall back to the
  // standard range so the gate always has something to pick from. The machine
  // still works: pieces with no size data match every morphology.
  const gateOptions = useMemo(() => {
    const collect = (lists: ClosetItem[][]) => {
      const set = new Set<string>();
      for (const list of lists) for (const it of list) for (const s of it.sizes) set.add(s);
      return [...set].sort(compareSizes);
    };

    const clothes = collect([bySlot.top, bySlot.bottom, bySlot.accessory]);
    const shoes = collect([bySlot.shoes]);

    return {
      gateSizes: clothes.length >= 2 ? clothes : STANDARD_SIZES,
      sizesInferred: clothes.length < 2,
      // Hidden entirely when the catalogue holds no shoes at all.
      gateShoeSizes:
        bySlot.shoes.length === 0 ? [] : shoes.length >= 2 ? shoes : STANDARD_SHOE_SIZES,
      shoeSizesInferred: bySlot.shoes.length > 0 && shoes.length < 2,
    };
  }, [bySlot]);

  /** Clothing sizes everywhere, pointures for the shoe module. */
  const selectedFor = useCallback(
    (slot: ClosetSlot): ReadonlySet<string> => (slot === "shoes" ? shoeSizes : sizes),
    [sizes, shoeSizes],
  );

  const pools = useMemo(() => ({
    top: applySizes(bySlot.top, sizes, true),
    bottom: applySizes(bySlot.bottom, sizes, true),
    jewelry: applySizes(bySlot.jewelry, sizes, false),
    bag: applySizes(bySlot.bag, sizes, false),
    accessory: applySizes(bySlot.accessory, sizes, false),
    shoes: applySizes(bySlot.shoes, shoeSizes, false),
  }), [bySlot, sizes, shoeSizes]);

  const counts = useMemo(
    () => Object.fromEntries(Object.entries(pools).map(([k, v]) => [k, v.length])),
    [pools],
  );

  /* ---- selection ---- */

  const top = pools.top[topIdx] ?? null;
  const bottom = pools.bottom[bottomIdx] ?? null;

  const modulePieces = useMemo(
    () =>
      openSlots.flatMap((slot) => {
        const pool = pools[slot as keyof typeof pools];
        const piece = pool[moduleIdx[slot] ?? 0];
        return piece ? [piece] : [];
      }),
    [openSlots, pools, moduleIdx],
  );

  const look = useMemo(
    () => [top, bottom, ...modulePieces].filter((p): p is ClosetItem => p !== null),
    [top, bottom, modulePieces],
  );

  const total = look.reduce((sum, p) => sum + priceOf(p, selectedFor(p.slot)), 0);
  const lookKeys = look.map((p) => p.handle);

  const lookKey = lookKeys.join("|");
  // Le bouton du bas ne réagit qu'à une sauvegarde explicite du look complet :
  // cocher les cœurs un par un ne doit pas l'allumer. On mémorise la signature
  // du look enregistré, et on vérifie que ses pièces y sont toujours, changer
  // une pièce ou décocher son cœur éteint donc le témoin.
  const [savedLookKey, setSavedLookKey] = useState<string | null>(null);
  const lookSaved =
    look.length > 0 &&
    savedLookKey === lookKey &&
    look.every((p) => wishlist.has(p.handle));

  /** Wishlist d'une seule pièce, sans toucher au look complet. */
  const toggleSaveItem = (piece: ClosetItem) => {
    const wasSaved = wishlist.has(piece.handle);
    wishlist.toggle({
      handle: piece.handle,
      title: piece.name,
      price: priceOf(piece, selectedFor(piece.slot)),
      image: piece.image,
      variantId: variantFor(piece, selectedFor(piece.slot))?.id ?? null,
    });
    setStatus(
      wasSaved
        ? `${piece.name.toUpperCase()} : RETIRÉ DE LA WISHLIST.`
        : `${piece.name.toUpperCase()} : AJOUTÉ À LA WISHLIST.`,
    );
  };

  /* ---- actions ---- */

  /** `keep` : rayons à ne pas retirer au sort (cadenas fermé). */
  const shuffle = useCallback(
    (chosen: ReadonlySet<string>, keep?: ReadonlySet<ClosetSlot>) => {
      const tops = applySizes(bySlot.top, chosen, true);
      const bottoms = applySizes(bySlot.bottom, chosen, true);
      if (!keep?.has("top")) {
        setTopIdx(tops.length ? Math.floor(Math.random() * tops.length) : 0);
      }
      if (!keep?.has("bottom")) {
        setBottomIdx(bottoms.length ? Math.floor(Math.random() * bottoms.length) : 0);
      }
    },
    [bySlot],
  );

  /** Full random look: reels roll, pieces swap under the blur. */
  const shuffleAll = useCallback(() => {
    setSpinSignal((n) => n + 1);
    later(() => {
      shuffle(sizes, lockedSlots);
      setModuleIdx((m) => {
        const next = { ...m };
        for (const slot of openSlots) {
          if (lockedSlots.has(slot)) continue;
          const len = pools[slot as keyof typeof pools].length;
          next[slot] = len ? Math.floor(Math.random() * len) : 0;
        }
        return next;
      });
      setStatus(
        lockedSlots.size > 0
          ? `STYLE_ME.EXE : NOUVEAU LOOK TIRÉ (${lockedSlots.size} PIÈCE${lockedSlots.size > 1 ? "S" : ""} VERROUILLÉE${lockedSlots.size > 1 ? "S" : ""}).`
          : "STYLE_ME.EXE : NOUVEAU LOOK TIRÉ.",
      );
    }, SPIN_SWAP);
  }, [later, shuffle, sizes, openSlots, pools, lockedSlots]);

  /* Tout est verrouillé : STYLE_ME n'aurait plus rien à tirer. Le bouton
     s'éteint plutôt que de rester muet — sur téléphone, la barre d'état
     qui l'expliquerait n'est pas affichée. */
  const allLocked =
    lockedSlots.has("top") &&
    lockedSlots.has("bottom") &&
    openSlots.every((slot) => lockedSlots.has(slot));

  const toggleLock = useCallback((slot: ClosetSlot) => {
    setLockedSlots((s) => {
      const next = new Set(s);
      if (!next.delete(slot)) next.add(slot);
      return next;
    });
  }, []);

  const launch = (chosen: Set<string>, chosenShoes: Set<string>) => {
    setSizes(chosen);
    setShoeSizes(chosenShoes);
    setGateOpen(false);
    shuffle(chosen);
    setStatus(
      chosen.size > 0
        ? `MORPHOLOGIE ${describe(chosen)} CHARGÉE.`
        : "CATALOGUE COMPLET CHARGÉ.",
    );
  };

  const step = (slot: ClosetSlot, delta: number) => {
    const len = pools[slot as keyof typeof pools].length;
    if (len === 0) return;
    if (slot === "top") setTopIdx((i) => (i + delta + len) % len);
    else if (slot === "bottom") setBottomIdx((i) => (i + delta + len) % len);
    else setModuleIdx((m) => ({ ...m, [slot]: (((m[slot] ?? 0) + delta) % len + len) % len }));
  };

  const focusWindow = useCallback((slot: ClosetSlot) => {
    zRef.current += 1;
    setTopZ((m) => ({ ...m, [slot]: zRef.current }));
  }, []);

  const launchModule = (mod: ModuleDef) => {
    // Already mounted → the option acts as a toggle and closes the window.
    if (openSlots.includes(mod.slot)) {
      setOpenSlots((s) => s.filter((x) => x !== mod.slot));
      return;
    }

    // Le journal d'exécution part dans la barre d'état plutôt que dans le
    // terminal : celle-ci est à hauteur fixe, la console ne grandit donc plus
    // à chaque module lancé.
    const empty = (counts[mod.slot] ?? 0) === 0;
    setStatus(`${mod.exe} : ${empty ? "[ERREUR] RAYON VIDE." : "[OK]"}`);
    if (empty) return;

    later(() => {
      setModuleIdx((m) => {
        if (m[mod.slot] !== undefined) return m;
        const len = pools[mod.slot as keyof typeof pools].length;
        return { ...m, [mod.slot]: len ? Math.floor(Math.random() * len) : 0 };
      });
      setOpenSlots((s) => (s.includes(mod.slot) ? s : [...s, mod.slot]));
      focusWindow(mod.slot);
    }, 700);
  };

  const saveLook = () => {
    if (look.length === 0) return;
    for (const piece of look) {
      wishlist.add({
        handle: piece.handle,
        title: piece.name,
        price: priceOf(piece, selectedFor(piece.slot)),
        image: piece.image,
        variantId: variantFor(piece, selectedFor(piece.slot))?.id ?? null,
      });
    }
    setSavedLookKey(lookKey);
    setStatus(`LOOK SAUVEGARDÉ : ${look.length} PIÈCE${look.length > 1 ? "S" : ""}.`);
  };

  /** Tout le look au panier, puis droit au panier pour finaliser l'achat. */
  const buyTheLook = async () => {
    if (look.length === 0 || copping) return;

    const lines = look.flatMap((piece) => {
      const variant = variantFor(piece, selectedFor(piece.slot));
      return variant ? [{ variantId: variant.id, quantity: 1 }] : [];
    });

    if (lines.length === 0) {
      setStatus("[ERREUR] AUCUNE PIÈCE ACHETABLE DANS CE LOOK.");
      return;
    }

    setCopping(true);
    setStatus(`BUY_THE_LOOK.EXE : ${lines.length} PIÈCE${lines.length > 1 ? "S" : ""} AU PANIER…`);
    try {
      // Une seule mutation pour tout le look, sinon les appels concurrents se
      // disputent le cookie de panier (cf. addLinesToCartAction).
      await addItems(lines);
      router.push("/cart");
    } catch (err) {
      const detail = err instanceof Error ? err.message : "";
      setStatus(`[ERREUR] AJOUT AU PANIER IMPOSSIBLE.${detail ? ` ${detail.toUpperCase()}` : ""}`);
      setCopping(false);
    }
  };

  const busy = copping || pending;

  return (
    <>
      <Nav onMenu={() => setMenu(true)} forceSolid />
      <Drawer open={menu} onClose={() => setMenu(false)} />

      <main className="dm-desktop">
        <div className="dm-win dm-main">
          {/* ---- Barre de titre ---- */}
          <div className="dm-titlebar">
            <span className="dm-titlebar-text">DRESSING_MACHINE.EXE</span>
            <div className="dm-chrome">
              <span className="dm-chrome-btn" aria-hidden>_</span>
              <span className="dm-chrome-btn" aria-hidden>□</span>
              <Link className="dm-chrome-btn" href="/" aria-label="Fermer">×</Link>
            </div>
          </div>

          <div className="dm-toolbar">
            <button className="dm-toolbar-btn" onClick={() => setGateOpen(true)}>
              ⚙ Morphologie
            </button>
            {/* Écartés de la barre sur téléphone (`dm-mobile-off`), où la
                place manque : MÉLANGER fait double emploi avec la bulle
                STYLE_ME, juste en dessous, et MES LOOKS est déjà dans le
                menu. Seule MORPHOLOGIE, sans autre porte d'entrée, reste. */}
            <span className="dm-toolbar-sep dm-mobile-off" />
            <button className="dm-toolbar-btn dm-mobile-off" onClick={() => shuffle(sizes)}>
              ⟳ Mélanger
            </button>
            <span className="dm-toolbar-sep dm-mobile-off" />
            <Link className="dm-toolbar-btn dm-mobile-off" href="/wishlist">
              ♡ Mes looks
            </Link>
            <span className="dm-toolbar-tag">
              Taille <strong>{describe(sizes)}</strong>
              {gateOptions.gateShoeSizes.length > 0 && (
                <> · Pointure <strong>{describe(shoeSizes)}</strong></>
              )}
            </span>
          </div>

          {/* ---- ÉTAPE 3 : l'écran scindé ---- */}
          <div className="dm-screen">
            <Bay
              label="HAUTS"
              col={1}
              items={pools.top}
              index={Math.min(topIdx, Math.max(0, pools.top.length - 1))}
              selected={sizes}
              spinSignal={spinSignal}
              saved={top ? wishlist.has(top.handle) : false}
              onToggleSave={() => top && toggleSaveItem(top)}
              onNext={() => step("top", 1)}
              locked={lockedSlots.has("top")}
              onToggleLock={() => toggleLock("top")}
              onChangeSize={() => setGateOpen(true)}
            />

            <div className="dm-divider" aria-hidden />

            <div className="dm-style-cell">
              <span className="dm-strass dm-strass-rail dm-strass-1" aria-hidden>
                <ChromeStar uid="dm-strass-1" />
              </span>
              <span className="dm-strass dm-strass-rail dm-strass-4" aria-hidden>
                <ChromeStar uid="dm-strass-4" />
              </span>

              {/* Les cœurs et les étoiles qui encadrent la bulle restent
                  tous dans le flux, avec la bulle : leur espacement vient
                  du même `gap` que le reste de la colonne, donc ne se
                  chevauche jamais, y compris en pile sur mobile où l'arête
                  devient horizontale. */}
              <span className="dm-strass dm-strass-heart dm-strass-heart-up" aria-hidden>
                <GemSticker uid="dm-strass-2" shape="heart" hue={STRASS_HEART} />
              </span>
              <span className="dm-strass dm-strass-cap dm-strass-cap-up" aria-hidden>
                <GemSticker uid="dm-strass-up" shape="star" hue={STRASS_STAR} />
              </span>
              <button
                type="button"
                className="dm-style-me"
                onClick={shuffleAll}
                disabled={allLocked}
                aria-label={
                  allLocked
                    ? "Toutes les pièces sont verrouillées : ouvrez un cadenas pour relancer"
                    : "Composer un look complet au hasard"
                }
              >
                <span className="dm-style-me-label">STYLE_ME</span>
              </button>
              <span className="dm-strass dm-strass-cap dm-strass-cap-down" aria-hidden>
                <GemSticker uid="dm-strass-down" shape="star" hue={STRASS_STAR} />
              </span>
              <span className="dm-strass dm-strass-heart dm-strass-heart-down" aria-hidden>
                <GemSticker uid="dm-strass-3" shape="heart" hue={STRASS_HEART} />
              </span>
            </div>

            <Bay
              label="BAS"
              col={3}
              items={pools.bottom}
              index={Math.min(bottomIdx, Math.max(0, pools.bottom.length - 1))}
              selected={sizes}
              spinSignal={spinSignal}
              saved={bottom ? wishlist.has(bottom.handle) : false}
              onToggleSave={() => bottom && toggleSaveItem(bottom)}
              onNext={() => step("bottom", 1)}
              locked={lockedSlots.has("bottom")}
              onToggleLock={() => toggleLock("bottom")}
              onChangeSize={() => setGateOpen(true)}
            />
          </div>

          {/* ---- ÉTAPES 4 + 5 : la console ---- */}
          <div className="dm-console">
            <MatchScanner keys={lookKeys} />

            <ModuleTerminal onOpen={() => setTerminalOpen(true)} />

            <button
              type="button"
              className={"dm-w95 dm-save" + (lookSaved ? " pressed" : "")}
              onClick={saveLook}
              disabled={look.length === 0}
              aria-label="SAVE_TO_WISHLIST.EXE : enregistrer ce look"
            >
              <span className="dm-save-led" aria-hidden />
              💾<span className="dm-btn-word">&nbsp;SAVE_TO_WISHLIST.EXE</span>
            </button>

            <div className="dm-cop">
              <div className="dm-well dm-cop-readout">
                <span className="dm-cop-label">
                  Total · {look.length} pc{look.length > 1 ? "s" : ""}
                </span>
                <span className="dm-cop-total">{euros(total)}</span>
              </div>
              <button
                type="button"
                className="dm-w95 dm-cop-btn"
                onClick={buyTheLook}
                disabled={look.length === 0 || busy}
              >
                {busy ? "CHARGEMENT…" : "BUY_THE_LOOK.EXE →"}
              </button>
            </div>
          </div>

          <div className="dm-statusbar">
            <span className="dm-status-cell dm-status-grow">{status}</span>
            <span className="dm-status-cell">CATALOGUE : {items.length} PIÈCES</span>
            <span className="dm-status-cell dm-status-pink">
              {look.length} PIÈCE{look.length > 1 ? "S" : ""} DANS LE LOOK
            </span>
          </div>
        </div>

        {/* ---- Fenêtres flottantes des modules ---- */}
        {openSlots.map((slot) => {
          const mod = MODULES.find((m) => m.slot === slot)!;
          const pool = pools[slot as keyof typeof pools];
          const piece = pool[Math.min(moduleIdx[slot] ?? 0, Math.max(0, pool.length - 1))];
          return (
            <ModuleWindow
              key={slot}
              mod={mod}
              items={pool}
              index={Math.min(moduleIdx[slot] ?? 0, Math.max(0, pool.length - 1))}
              selected={selectedFor(slot)}
              z={topZ[slot] ?? 60}
              saved={piece ? wishlist.has(piece.handle) : false}
              onFocus={() => focusWindow(slot)}
              onToggleSave={() => piece && toggleSaveItem(piece)}
              onNext={() => step(slot, 1)}
              onClose={() => setOpenSlots((s) => s.filter((x) => x !== slot))}
            />
          );
        })}
      </main>

      <Footer />

      {gateOpen && (
        <SizeGate
          sizes={gateOptions.gateSizes}
          shoeSizes={gateOptions.gateShoeSizes}
          inferred={gateOptions.sizesInferred}
          shoeInferred={gateOptions.shoeSizesInferred}
          initialSizes={sizes}
          initialShoeSizes={shoeSizes}
          onLaunch={launch}
        />
      )}

      {terminalOpen && (
        <ModulePickerModal
          active={new Set(openSlots)}
          counts={counts}
          onLaunch={launchModule}
          onClose={() => setTerminalOpen(false)}
        />
      )}
    </>
  );
}
