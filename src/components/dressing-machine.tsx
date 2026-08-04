"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Nav } from "@/components/nav";
import { Drawer } from "@/components/drawer";
import { SmartImg } from "@/components/smart-img";
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
 * Narrow a pool to the shopper's sizes — an empty selection means "toutes".
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

/** "M, L" — for the toolbar tag and the empty-rack message. */
function describe(selected: ReadonlySet<string>): string {
  return selected.size === 0 ? "toutes" : [...selected].join(", ");
}

function euros(n: number): string {
  return "€" + n.toFixed(2);
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

/* ================================================================== *
 * ÉTAPE 1 — SYSTEM_LOGIN.EXE
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
  /** Empty when the catalogue holds no shoes — the row is then hidden. */
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
            <Link className="dm-chrome-btn" href="/" aria-label="Fermer">✕</Link>
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
            className="dm-btn dm-btn-primary dm-gate-launch"
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
 * ÉTAPE 3 — Colonnes Hauts / Bas
 * ================================================================== */

function Rack({
  label,
  items,
  index,
  selected,
  onPrev,
  onNext,
  onChangeSize,
}: {
  label: string;
  items: ClosetItem[];
  index: number;
  selected: ReadonlySet<string>;
  onPrev: () => void;
  onNext: () => void;
  onChangeSize: () => void;
}) {
  const item = items[index];

  return (
    <section className="dm-rack">
      <header className="dm-panel-bar">
        <span className="dm-panel-title">{label}</span>
        <span className="dm-panel-count">
          {items.length === 0
            ? "00/00"
            : `${String(index + 1).padStart(2, "0")}/${String(items.length).padStart(2, "0")}`}
        </span>
      </header>

      <div className="dm-rack-body">
        <div className="dm-frame">
          {item ? (
            <Link href={`/products/${item.handle}`} className="dm-frame-img" title={item.name}>
              <SmartImg src={item.image} alt={item.name} />
            </Link>
          ) : (
            <div className="dm-frame-empty">
              <p>
                AUCUNE PIÈCE{selected.size > 0 ? ` EN ${describe(selected)}` : ""}
                <br />
                DANS CE RAYON.
              </p>
              <button className="dm-btn dm-btn-sm" onClick={onChangeSize}>
                CHANGER DE TAILLE
              </button>
            </div>
          )}
        </div>

        <div className="dm-arrows">
          <button
            className="dm-arrow"
            onClick={onPrev}
            disabled={items.length < 2}
            aria-label={`${label} précédent`}
          >
            ◄
          </button>
          <button
            className="dm-arrow"
            onClick={onNext}
            disabled={items.length < 2}
            aria-label={`${label} suivant`}
          >
            ►
          </button>
        </div>

        <div className="dm-caption">
          <span className="dm-caption-name">{item ? item.name : "—"}</span>
          <span className="dm-caption-price">{item ? euros(priceOf(item, selected)) : "—"}</span>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== *
 * ÉTAPE 4 — Le terminal .EXE
 * ================================================================== */

function LogLine({ exe, failed }: { exe: string; failed: boolean }) {
  const head = `> Exécution de ${exe}...`;
  const typed = useTyped(head, true, 14);
  const done = typed.length === head.length;

  return (
    <p className="dm-term-log">
      {typed}
      {done && (
        <span className={failed ? "dm-term-err" : "dm-term-ok"}>
          {failed ? " [ERREUR — RAYON VIDE]" : " [OK]"}
        </span>
      )}
    </p>
  );
}

function ModuleTerminal({
  open,
  onOpen,
  active,
  counts,
  logs,
  onLaunch,
}: {
  open: boolean;
  onOpen: () => void;
  active: Set<ClosetSlot>;
  counts: Record<string, number>;
  logs: { id: number; exe: string; failed: boolean }[];
  onLaunch: (mod: ModuleDef) => void;
}) {
  const boot = "> SYSTÈME PRÊT. SÉLECTIONNEZ UN MODULE :";
  const typed = useTyped(boot, open, 16);
  const booted = open && typed.length === boot.length;

  const [revealed, setRevealed] = useState(0);
  const [prevBooted, setPrevBooted] = useState(booted);
  if (prevBooted !== booted) {
    setPrevBooted(booted);
    setRevealed(0);
  }

  useEffect(() => {
    if (!booted) return;
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setRevealed(i);
      if (i >= MODULES.length) clearInterval(id);
    }, 80);
    return () => clearInterval(id);
  }, [booted]);

  if (!open) {
    return (
      <div className="dm-module-bar">
        <button className="dm-add-module" onClick={onOpen}>
          [ + ] AJOUTER UN MODULE
        </button>
      </div>
    );
  }

  return (
    <div className="dm-terminal" role="region" aria-label="Terminal modules">
      <div className="dm-panel-bar">
        <span className="dm-panel-title">MODULES.EXE</span>
        <span className="dm-panel-count">
          {active.size}/{MODULES.length} CHARGÉ{active.size > 1 ? "S" : ""}
        </span>
      </div>

      <div className="dm-term-screen">
        <p className="dm-term-boot">
          {typed}
          {!booted && <span className="dm-caret">_</span>}
        </p>

        <div className="dm-term-options">
          {MODULES.map((mod, i) => {
            const on = active.has(mod.slot);
            const empty = (counts[mod.slot] ?? 0) === 0;
            return (
              <button
                key={mod.slot}
                className={
                  "dm-term-opt" +
                  (revealed > i ? " in" : "") +
                  (on ? " on" : "") +
                  (empty ? " out" : "")
                }
                onClick={() => onLaunch(mod)}
                disabled={revealed <= i}
                aria-pressed={on}
              >
                <span className="dm-term-box">[{on ? "x" : " "}]</span>
                <span className="dm-term-exe">{mod.exe}</span>
                <span className="dm-term-cursor">_</span>
              </button>
            );
          })}
        </div>

        {logs.length > 0 && (
          <div className="dm-term-logs">
            {logs.map((l) => (
              <LogLine key={l.id} exe={l.exe} failed={l.failed} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ================================================================== *
 * ÉTAPE 4 — Fenêtre flottante d'un module
 * ================================================================== */

function ModuleWindow({
  mod,
  items,
  index,
  selected,
  z,
  onFocus,
  onPrev,
  onNext,
  onClose,
}: {
  mod: ModuleDef;
  items: ClosetItem[];
  index: number;
  selected: ReadonlySet<string>;
  z: number;
  onFocus: () => void;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
}) {
  // The window only ever mounts after a click, so `window` is safe here —
  // clamp the cascade so a narrow desktop never opens a module off-screen.
  const [pos, setPos] = useState(() => {
    if (typeof window === "undefined") return mod.offset;
    const maxX = Math.max(90, window.innerWidth / 2 - 120);
    const maxY = Math.max(60, window.innerHeight / 2 - 130);
    return {
      x: Math.max(-maxX, Math.min(maxX, mod.offset.x)),
      y: Math.max(-maxY, Math.min(maxY, mod.offset.y)),
    };
  });
  const drag = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null);
  const item = items[index];

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    onFocus();
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
      className="dm-win dm-float"
      style={{ zIndex: z, transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))` }}
      onPointerDown={onFocus}
    >
      <div
        className="dm-panel-bar dm-float-bar"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <span className="dm-panel-title">{mod.window}</span>
        <div className="dm-chrome">
          <button className="dm-chrome-btn" onClick={onClose} aria-label={`Fermer ${mod.window}`}>
            ✕
          </button>
        </div>
      </div>

      <div className="dm-float-body">
        <Link href={`/products/${item.handle}`} className="dm-float-img" title={item.name}>
          <SmartImg src={item.image} alt={item.name} />
        </Link>

        <div className="dm-float-arrows">
          <button className="dm-arrow dm-arrow-sm" onClick={onPrev} disabled={items.length < 2} aria-label="Précédent">
            ◄
          </button>
          <span className="dm-float-count">
            {String(index + 1).padStart(2, "0")}/{String(items.length).padStart(2, "0")}
          </span>
          <button className="dm-arrow dm-arrow-sm" onClick={onNext} disabled={items.length < 2} aria-label="Suivant">
            ►
          </button>
        </div>

        <div className="dm-caption dm-caption-sm">
          <span className="dm-caption-name">{item.name}</span>
          <span className="dm-caption-price">{euros(priceOf(item, selected))}</span>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== *
 * ÉTAPE 5 — Scanner
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
        {scanning ? "SCANNING…" : <>MATCH DETECTED : <strong>{target}%</strong></>}
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
 * ÉTAPE 2 — VIRTUAL_CLOSET.EXE
 * ================================================================== */

export function DressingMachine({ items }: { items: ClosetItem[] }) {
  const router = useRouter();
  const { addItem, pending } = useCart();
  const wishlist = useWishlist();

  const [menu, setMenu] = useState(false);
  const [sizes, setSizes] = useState<ReadonlySet<string>>(() => new Set());
  const [shoeSizes, setShoeSizes] = useState<ReadonlySet<string>>(() => new Set());
  const [gateOpen, setGateOpen] = useState(true);
  const [topIdx, setTopIdx] = useState(0);
  const [bottomIdx, setBottomIdx] = useState(0);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [openSlots, setOpenSlots] = useState<ClosetSlot[]>([]);
  const [moduleIdx, setModuleIdx] = useState<Record<string, number>>({});
  const [logs, setLogs] = useState<{ id: number; exe: string; failed: boolean }[]>([]);
  const [topZ, setTopZ] = useState<Record<string, number>>({});
  const [status, setStatus] = useState("PRÊT.");
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

  // A single size across the whole catalogue isn't a choice — fall back to the
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

  /* ---- actions ---- */

  const shuffle = useCallback((chosen: ReadonlySet<string>) => {
    const tops = applySizes(bySlot.top, chosen, true);
    const bottoms = applySizes(bySlot.bottom, chosen, true);
    setTopIdx(tops.length ? Math.floor(Math.random() * tops.length) : 0);
    setBottomIdx(bottoms.length ? Math.floor(Math.random() * bottoms.length) : 0);
  }, [bySlot]);

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

    const empty = (counts[mod.slot] ?? 0) === 0;
    const id = Date.now() + Math.random();
    // Deux lignes de log max : au-delà le terminal pousse la fenêtre
    // au-delà du viewport et le corps se met à scroller.
    setLogs((l) => [...l.slice(-1), { id, exe: mod.exe, failed: empty }]);
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
    setStatus(`LOOK SAUVEGARDÉ — ${look.length} PIÈCE${look.length > 1 ? "S" : ""} 💋`);
  };

  const copTheLook = async () => {
    if (look.length === 0 || copping) return;
    setCopping(true);
    setStatus("COP_THE_LOOK.EXE — AJOUT AU PANIER…");
    try {
      for (const piece of look) {
        const variant = variantFor(piece, selectedFor(piece.slot));
        if (variant) await addItem(variant.id, 1);
      }
      router.push("/cart");
    } catch {
      setStatus("[ERREUR] AJOUT AU PANIER IMPOSSIBLE.");
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
            <span className="dm-titlebar-text">VIRTUAL_CLOSET.EXE</span>
            <div className="dm-chrome">
              <span className="dm-chrome-btn" aria-hidden>_</span>
              <span className="dm-chrome-btn" aria-hidden>□</span>
              <Link className="dm-chrome-btn" href="/" aria-label="Fermer">✕</Link>
            </div>
          </div>

          <div className="dm-toolbar">
            <button className="dm-toolbar-btn" onClick={() => setGateOpen(true)}>
              ⚙ Morphologie
            </button>
            <span className="dm-toolbar-sep" />
            <button className="dm-toolbar-btn" onClick={() => shuffle(sizes)}>
              ⟳ Mélanger
            </button>
            <span className="dm-toolbar-sep" />
            <Link className="dm-toolbar-btn" href="/wishlist">
              ♡ Mes looks
            </Link>
            <span className="dm-toolbar-tag">
              Taille <strong>{describe(sizes)}</strong>
              {gateOptions.gateShoeSizes.length > 0 && (
                <> · Pointure <strong>{describe(shoeSizes)}</strong></>
              )}
            </span>
          </div>

          {/* ---- ÉTAPE 3 : les deux rayons ---- */}
          <div className="dm-body">
            <div className="dm-racks">
              <Rack
                label="HAUTS"
                items={pools.top}
                index={Math.min(topIdx, Math.max(0, pools.top.length - 1))}
                selected={sizes}
                onPrev={() => step("top", -1)}
                onNext={() => step("top", 1)}
                onChangeSize={() => setGateOpen(true)}
              />
              <Rack
                label="BAS"
                items={pools.bottom}
                index={Math.min(bottomIdx, Math.max(0, pools.bottom.length - 1))}
                selected={sizes}
                onPrev={() => step("bottom", -1)}
                onNext={() => step("bottom", 1)}
                onChangeSize={() => setGateOpen(true)}
              />
            </div>

            {/* ---- ÉTAPE 4 : le module .EXE ---- */}
            <ModuleTerminal
              open={terminalOpen}
              onOpen={() => setTerminalOpen(true)}
              active={new Set(openSlots)}
              counts={counts}
              logs={logs}
              onLaunch={launchModule}
            />
          </div>

          {/* ---- ÉTAPE 5 : barre d'actions ---- */}
          <div className="dm-actionbar">
            <MatchScanner keys={lookKeys} />

            <button className="dm-btn dm-btn-save" onClick={saveLook} disabled={look.length === 0}>
              SAUVEGARDER LE LOOK <span aria-hidden>💋</span>
            </button>

            <div className="dm-cop">
              <span className="dm-cop-total">
                TOTAL : <strong>{euros(total)}</strong>
                <span className="dm-cop-count">
                  {look.length} PIÈCE{look.length > 1 ? "S" : ""}
                </span>
              </span>
              <button
                className="dm-btn dm-btn-primary dm-cop-btn"
                onClick={copTheLook}
                disabled={look.length === 0 || busy}
              >
                {busy ? "CHARGEMENT…" : "COP_THE_LOOK.EXE →"}
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
          return (
            <ModuleWindow
              key={slot}
              mod={mod}
              items={pool}
              index={Math.min(moduleIdx[slot] ?? 0, Math.max(0, pool.length - 1))}
              selected={selectedFor(slot)}
              z={topZ[slot] ?? 60}
              onFocus={() => focusWindow(slot)}
              onPrev={() => step(slot, -1)}
              onNext={() => step(slot, 1)}
              onClose={() => setOpenSlots((s) => s.filter((x) => x !== slot))}
            />
          );
        })}
      </main>

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
    </>
  );
}
