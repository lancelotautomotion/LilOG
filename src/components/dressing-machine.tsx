"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Nav } from "@/components/nav";
import { Drawer } from "@/components/drawer";
import { SmartImg } from "@/components/smart-img";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/hooks/use-wishlist";
import { compareSizes } from "@/lib/sizes";
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

/** The variant to buy for a piece: the shopper's size when it exists. */
function variantFor(item: ClosetItem, size: string | null): ClosetVariant | null {
  const buyable = item.variants.filter((v) => v.available);
  const pool = buyable.length > 0 ? buyable : item.variants;
  if (size) {
    const exact = pool.find((v) => v.size === size);
    if (exact) return exact;
  }
  return pool[0] ?? null;
}

function priceOf(item: ClosetItem, size: string | null): number {
  return variantFor(item, size)?.price ?? item.price;
}

/**
 * Narrow a pool to the shopper's size. `strict` columns (Hauts / Bas) show
 * nothing when nothing fits; the optional modules fall back to the full pool
 * rather than going dark — bags and bijoux don't have a morphology.
 */
function applySize(list: ClosetItem[], size: string | null, strict: boolean): ClosetItem[] {
  if (!size) return list;
  const matched = list.filter((i) => i.sizes.length === 0 || i.sizes.includes(size));
  return strict || matched.length > 0 ? matched : list;
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

function SizeGate({
  sizes,
  onLaunch,
  onSkip,
}: {
  sizes: string[];
  onLaunch: (size: string) => void;
  onSkip: () => void;
}) {
  const [picked, setPicked] = useState<string | null>(sizes[0] ?? null);
  const intro = "Veuillez entrer vos paramètres morphologiques pour initialiser la machine.";
  const typed = useTyped(intro, true, 16);

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
            <span className="dm-gate-glyph" aria-hidden>▓</span>
            <p className="dm-gate-text">
              {typed}
              <span className="dm-caret">_</span>
            </p>
          </div>

          <fieldset className="dm-fieldset">
            <legend className="dm-legend">TAILLE</legend>
            {sizes.length === 0 ? (
              <p className="dm-gate-note">Aucune taille détectée dans le catalogue.</p>
            ) : (
              <div className="dm-radio-grid">
                {sizes.map((s) => (
                  <label key={s} className={"dm-radio" + (picked === s ? " on" : "")}>
                    <input
                      type="radio"
                      name="dm-size"
                      value={s}
                      checked={picked === s}
                      onChange={() => setPicked(s)}
                    />
                    <span className="dm-radio-dot" aria-hidden />
                    <span className="dm-radio-label">{s}</span>
                  </label>
                ))}
              </div>
            )}
          </fieldset>

          <button
            className="dm-btn dm-btn-primary dm-gate-launch"
            onClick={() => picked && onLaunch(picked)}
            disabled={!picked}
          >
            LANCER_LA_MACHINE.EXE →
          </button>

          <button className="dm-gate-skip" onClick={onSkip}>
            ignorer — voir tout le catalogue
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
  size,
  onPrev,
  onNext,
  onChangeSize,
}: {
  label: string;
  items: ClosetItem[];
  index: number;
  size: string | null;
  onPrev: () => void;
  onNext: () => void;
  onChangeSize: () => void;
}) {
  const item = items[index];

  return (
    <section className="dm-rack">
      <header className="dm-rack-head">
        <span className="dm-rack-label">{label}</span>
        <span className="dm-rack-count">
          {items.length === 0
            ? "00/00"
            : `${String(index + 1).padStart(2, "0")}/${String(items.length).padStart(2, "0")}`}
        </span>
      </header>

      <div className="dm-frame">
        {item ? (
          <Link href={`/products/${item.handle}`} className="dm-frame-img" title={item.name}>
            <SmartImg src={item.image} alt={item.name} />
          </Link>
        ) : (
          <div className="dm-frame-empty">
            <p>
              AUCUNE PIÈCE{size ? ` EN ${size}` : ""}
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
        <span className="dm-caption-price">{item ? euros(priceOf(item, size)) : "—"}</span>
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
  );
}

/* ================================================================== *
 * ÉTAPE 4 — Fenêtre flottante d'un module
 * ================================================================== */

function ModuleWindow({
  mod,
  items,
  index,
  size,
  z,
  onFocus,
  onPrev,
  onNext,
  onClose,
}: {
  mod: ModuleDef;
  items: ClosetItem[];
  index: number;
  size: string | null;
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
        className="dm-titlebar dm-float-bar"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <span className="dm-titlebar-text">{mod.window}</span>
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
          <span className="dm-caption-price">{euros(priceOf(item, size))}</span>
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
        {scanning ? "SCANNING…" : `MATCH DETECTED: ${target}%`}
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
  const [size, setSize] = useState<string | null>(null);
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

  const allSizes = useMemo(() => {
    const set = new Set<string>();
    for (const it of [...bySlot.top, ...bySlot.bottom]) for (const s of it.sizes) set.add(s);
    return [...set].sort(compareSizes);
  }, [bySlot]);

  const pools = useMemo(() => ({
    top: applySize(bySlot.top, size, true),
    bottom: applySize(bySlot.bottom, size, true),
    jewelry: applySize(bySlot.jewelry, size, false),
    bag: applySize(bySlot.bag, size, false),
    accessory: applySize(bySlot.accessory, size, false),
    shoes: applySize(bySlot.shoes, size, false),
  }), [bySlot, size]);

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

  const total = look.reduce((sum, p) => sum + priceOf(p, size), 0);
  const lookKeys = look.map((p) => p.handle);

  /* ---- actions ---- */

  const shuffle = useCallback((chosen: string | null) => {
    const tops = applySize(bySlot.top, chosen, true);
    const bottoms = applySize(bySlot.bottom, chosen, true);
    setTopIdx(tops.length ? Math.floor(Math.random() * tops.length) : 0);
    setBottomIdx(bottoms.length ? Math.floor(Math.random() * bottoms.length) : 0);
  }, [bySlot]);

  const launch = (chosen: string | null) => {
    setSize(chosen);
    setGateOpen(false);
    shuffle(chosen);
    setStatus(chosen ? `MORPHOLOGIE ${chosen} CHARGÉE.` : "CATALOGUE COMPLET CHARGÉ.");
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
    setLogs((l) => [...l.slice(-3), { id, exe: mod.exe, failed: empty }]);
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
        price: priceOf(piece, size),
        image: piece.image,
        variantId: variantFor(piece, size)?.id ?? null,
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
        const variant = variantFor(piece, size);
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

          <div className="dm-menubar">
            <span>Fichier</span>
            <span>Édition</span>
            <span>Affichage</span>
            <button className="dm-menubar-btn" onClick={() => setGateOpen(true)}>
              Taille : {size ?? "toutes"}
            </button>
            <button className="dm-menubar-btn" onClick={() => shuffle(size)}>
              Mélanger
            </button>
          </div>

          {/* ---- ÉTAPE 3 : les deux rayons ---- */}
          <div className="dm-body">
            <div className="dm-racks">
              <Rack
                label="HAUTS"
                items={pools.top}
                index={Math.min(topIdx, Math.max(0, pools.top.length - 1))}
                size={size}
                onPrev={() => step("top", -1)}
                onNext={() => step("top", 1)}
                onChangeSize={() => setGateOpen(true)}
              />
              <Rack
                label="BAS"
                items={pools.bottom}
                index={Math.min(bottomIdx, Math.max(0, pools.bottom.length - 1))}
                size={size}
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
            <span className="dm-status-cell">{status}</span>
            <span className="dm-status-cell dm-status-grow">
              CATALOGUE : {items.length} PIÈCES
            </span>
            <span className="dm-status-cell">TAILLE : {size ?? "TOUTES"}</span>
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
              size={size}
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
          sizes={allSizes}
          onLaunch={(s) => launch(s)}
          onSkip={() => launch(null)}
        />
      )}
    </>
  );
}
