"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n-context";
import { useCart } from "@/lib/cart-context";
import { Nav } from "@/components/nav";
import { Drawer } from "@/components/drawer";
import { Footer } from "@/components/footer";
import { SmartImg } from "@/components/smart-img";
import type { CartLine } from "@/lib/shopify/types";

/* ---- Jetons « chunky plastic » : identiques à /contact, /faq et au footer ---- */
const PLASTIC =
  "shadow-[inset_0_2px_4px_rgba(255,255,255,0.95),inset_0_-2px_5px_rgba(0,0,0,0.25),0_2px_3px_rgba(30,36,48,0.18)]";
const PLASTIC_PRESS =
  "active:shadow-[inset_0_3px_6px_rgba(0,0,0,0.32),inset_0_-1px_0_rgba(255,255,255,0.7)] active:scale-95";
const PLASTIC_FACE = "bg-[linear-gradient(180deg,#fdfdff_0%,#ebe9f4_48%,#d3d0e1_100%)]";

const MONO = "font-[family-name:var(--mono)]";
const LCD = "font-[family-name:var(--font-lcd)]";

/* ============================================================
   Seuil de livraison offerte
   ------------------------------------------------------------
   ⚠ Valeur commerciale, pas un réglage graphique : elle doit
   rester alignée sur /livraison (03_FRAIS.SYS), qui annonce la
   livraison offerte dès 150 € en France métropolitaine. Changer
   l'une sans l'autre affiche deux promesses différentes au même
   client. Un seul endroit à modifier ici.
   ============================================================ */
const FREE_SHIPPING_TARGET = 150;

/** Nombre de blocs de la barre de transfert ████░░░░░░. */
const PROGRESS_BLOCKS = 10;

const MSN_MESSAGES = [
  "♥ Thanks Queen!",
  "♥ Slay.",
  "♥ Main Character Energy.",
  "♥ Serving.",
  "♥ Outfit secured.",
  "♥ You're gonna break hearts.",
  "♥ Closet upgraded.",
  "♥ Fashion mission complete.",
  "♥ See you at the mall!",
  "♥ You're so fetch.",
] as const;

const STYLE_PHRASES = [
  "As if!",
  "Totally buggin'",
  "Iconic!",
  "That's so fetch",
  "Loves it",
  "So hot right now",
  "100% Mall ready",
  "Girl, period !",
  "That's amazing",
  "O.M.G slay",
  "I.C.O.N.I.C",
  "Yes mama",
] as const;

function randomPhrase(): string {
  return STYLE_PHRASES[Math.floor(Math.random() * STYLE_PHRASES.length)];
}

/* ============================================================
   Icône de bureau
   ------------------------------------------------------------
   Le vocabulaire des raccourcis du footer (emoji + libellé
   .EXE / .SYS), mais posé sur le bureau : pictogramme large,
   libellé sur pastille violette, halo de sélection au survol.
   Rendu en <Link> quand la cible est une page, en <button>
   quand l'icône ouvre une fenêtre (la corbeille).
   ============================================================ */
function DesktopIcon({
  icon,
  label,
  href,
  onClick,
  badge,
}: {
  icon: string;
  label: string;
  href?: string;
  onClick?: () => void;
  badge?: number;
}) {
  /* 148px : le plus long libellé (MES_FAVORIS.SYS) mesure 118px en MONO 13px,
     plus les 12px de la pastille et les 12px du cadre. En dessous, la fin du
     libellé est rognée : les underscores n'offrent aucun point de césure, donc
     rien ne peut passer à la ligne. */
  const shell =
    "group flex w-[148px] flex-col items-center gap-1.5 rounded-lg border border-transparent p-1.5 no-underline transition hover:border-white/70 hover:bg-white/45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7147d4]";

  const inner = (
    <>
      <span className="relative">
        <span
          aria-hidden
          className="block text-[34px] leading-none drop-shadow-[2px_2px_0_rgba(59,29,143,0.28)] transition group-hover:scale-110 group-active:scale-95"
        >
          {icon}
        </span>
        {badge !== undefined && badge > 0 && (
          <span
            className={`${MONO} absolute -top-1.5 -right-2 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-[#d3016d] px-1 text-[0.8125rem] leading-none font-bold text-white`}
          >
            {badge}
          </span>
        )}
      </span>
      <span
        className={`${MONO} max-w-full rounded-[3px] bg-[#3b1d8f]/85 px-1.5 py-0.5 text-center text-[0.8125rem] leading-tight font-bold tracking-[0.02em] whitespace-nowrap text-white uppercase`}
      >
        {label}
      </span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={shell}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={`${shell} cursor-pointer bg-transparent`}>
      {inner}
    </button>
  );
}

export function CartPage() {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const { cart, pending, removeItem, addItem } = useCart();
  const firstName = session?.user?.name?.split(" ")[0] ?? null;
  const [menu, setMenu] = useState(false);
  const [current, setCurrent] = useState(0);
  const [scanPhase, setScanPhase] = useState<'scan' | 'filling' | 'phrase'>('scan');
  const [phrase, setPhrase] = useState(() => randomPhrase());
  const [showHeart, setShowHeart] = useState(false);
  const [heartMsg, setHeartMsg] = useState('');
  const heartTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  /* Corbeille : les lignes retirées du panier pendant la session, pour
     pouvoir les restaurer. Rien n'est persisté, c'est un filet de
     sécurité sur la page, pas un stockage. */
  const [trash, setTrash] = useState<CartLine[]>([]);
  const [trashOpen, setTrashOpen] = useState(false);

  const handleCheckout = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    e.preventDefault();
    if (!cart?.checkoutUrl) return;
    if (heartTimer.current) clearTimeout(heartTimer.current);
    setHeartMsg(MSN_MESSAGES[Math.floor(Math.random() * MSN_MESSAGES.length)]);
    setShowHeart(true);
    heartTimer.current = setTimeout(() => { window.location.href = cart.checkoutUrl; }, 2000);
  };

  useEffect(() => () => { if (heartTimer.current) clearTimeout(heartTimer.current); }, []);

  useEffect(() => {
    setPhrase(randomPhrase());   // nouvelle phrase à chaque changement d'article
    setScanPhase('scan');
    const t1 = setTimeout(() => setScanPhase('filling'), 20);
    const t2 = setTimeout(() => setScanPhase('phrase'),  400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [current]);

  const lines = cart?.lines ?? [];
  const total = lines.length;
  const item = lines[Math.min(current, Math.max(0, total - 1))];

  /* ---- Transfert « livraison gratuite » ---- */
  const subtotal = cart?.subtotal ?? 0;
  const ratio = Math.min(1, subtotal / FREE_SHIPPING_TARGET);
  const pct = Math.round(ratio * 100);
  const targetBlocks = Math.round(ratio * PROGRESS_BLOCKS);
  const remaining = Math.max(0, FREE_SHIPPING_TARGET - subtotal);
  const [filledBlocks, setFilledBlocks] = useState(0);

  /* Les blocs se remplissent un par un, comme un téléchargement 90s,
     à chaque fois que le sous-total change. La remise à zéro passe par un
     timer plutôt que par un setState synchrone : appeler setState dans le
     corps d'un effet déclenche des rendus en cascade (la règle
     react-hooks/set-state-in-effect du lint le refuse). */
  useEffect(() => {
    const reset = setTimeout(() => setFilledBlocks(0), 0);
    if (targetBlocks <= 0) return () => clearTimeout(reset);
    let n = 0;
    const id = setInterval(() => {
      n += 1;
      setFilledBlocks(n);
      if (n >= targetBlocks) clearInterval(id);
    }, 70);
    return () => { clearTimeout(reset); clearInterval(id); };
  }, [targetBlocks]);

  /* Le compteur peut dépasser d'un cran le temps que la remise à zéro
     s'applique : on borne à la cible pour que la barre ne montre jamais
     plus de blocs que le panier n'en a gagné. */
  const shownBlocks = Math.min(filledBlocks, targetBlocks);
  const transferDone = shownBlocks >= targetBlocks;
  const shownPct = transferDone ? pct : Math.round((shownBlocks / PROGRESS_BLOCKS) * 100);
  const bar = "█".repeat(shownBlocks) + "░".repeat(Math.max(0, PROGRESS_BLOCKS - shownBlocks));
  const shippingFree = subtotal >= FREE_SHIPPING_TARGET;

  const prev = () => setCurrent((i) => (i - 1 + total) % total);
  const next = () => setCurrent((i) => (i + 1) % total);

  const handleRemove = (id: string) => {
    const line = lines.find((l) => l.id === id);
    if (line) setTrash((prevTrash) => [line, ...prevTrash.filter((l) => l.id !== id)].slice(0, 8));
    removeItem(id);
    setCurrent((i) => Math.max(0, Math.min(i, total - 2)));
  };

  const handleRestore = async (line: CartLine) => {
    setTrash((prevTrash) => prevTrash.filter((l) => l.id !== line.id));
    await addItem(line.variantId, line.quantity);
  };

  /* Icônes de bureau : 4 raccourcis posés autour des fenêtres. */
  const desktopIcons = [
    { key: "favoris", icon: "📂", label: "MES_FAVORIS.SYS", href: "/wishlist", pos: "top-[130px] left-3" },
    { key: "dressing", icon: "👗", label: "DRESSING.EXE", href: "/dressing-machine", pos: "top-[130px] right-3" },
    { key: "drive", icon: "💾", label: "LIL_OG_DRIVE", href: "/catalogue", pos: "bottom-8 left-3" },
    { key: "corbeille", icon: "🗑️", label: "CORBEILLE.EXE", onClick: () => setTrashOpen((o) => !o), badge: trash.length, pos: "bottom-8 right-3" },
  ];

  return (
    <>
      <Nav onMenu={() => setMenu(true)} forceSolid />
      <Drawer open={menu} onClose={() => setMenu(false)} />

      <main className="oc-root bg-grid-pattern">

        {/* ── Bureau : icônes posées autour des fenêtres (grands écrans) ── */}
        <div aria-hidden={false} className="pointer-events-none absolute inset-0 z-[2] hidden 2xl:block">
          {desktopIcons.map((ic) => (
            <div key={ic.key} className={`pointer-events-auto absolute ${ic.pos}`}>
              <DesktopIcon icon={ic.icon} label={ic.label} href={ic.href} onClick={ic.onClick} badge={ic.badge} />
            </div>
          ))}
        </div>

        <div className="oc-page">

          {/* Sous 2xl, les mêmes raccourcis passent en barre au-dessus des
              fenêtres : les marges du bureau sont alors plus étroites qu'une
              icône, qui se ferait rogner par l'overflow de .oc-root. */}
          <div className="flex w-full basis-full flex-wrap items-start justify-center gap-1 2xl:hidden">
            {desktopIcons.map((ic) => (
              <DesktopIcon key={ic.key} icon={ic.icon} label={ic.label} href={ic.href} onClick={ic.onClick} badge={ic.badge} />
            ))}
          </div>
          {/* ── Win95 machine ── */}
          <div className="oc-center">
            <div className="oc-win95-outer">
              <div className="oc-win95-titlebar">
                <span className="oc-win95-title">
                  {firstName ? `Dressing de ${firstName}` : "Dressing"}
                </span>
                {total > 0 && <span className="oc-counter">{current + 1}/{total}</span>}
                <div className="account-win95-chrome">
                  <span>_</span>
                  <span>□</span>
                  <span>×</span>
                </div>
              </div>

              <div className="oc-win95-screen">
                {total === 0 ? (
                  <div className="oc-screen-empty">
                    <p>Votre dressing est vide.</p>
                    <Link href="/" className="oc-link">Shopper maintenant →</Link>
                  </div>
                ) : (
                  <div className="oc-screen-item">
                    <div className="oc-screen-bg">
                      <Link href={`/products/${item.handle}`} className="oc-img-wrap">
                        <SmartImg src={item.image} alt={item.title} />
                      </Link>
                      {/* Scan beam : monté uniquement pendant la phase filling, en sync avec la barre */}
                      {scanPhase === 'filling' && (
                        <div key={current} className="oc-scan-overlay" aria-hidden="true" />
                      )}
                    </div>
                    <div className="oc-item-label">
                      <span className="oc-item-name">{item.title}</span>
                      <span className="oc-item-price">{(item.price * item.quantity).toFixed(2)}€</span>
                    </div>

                    {/* ── Style Scanner ── */}
                    <div className="oc-style-meter">
                      <span className="oc-scan-header">STYLE SCAN</span>
                      <div className="oc-scan-bar-track">
                        <div className={`oc-scan-bar-fill${scanPhase !== 'scan' ? ' oc-bar-active' : ''}${scanPhase === 'phrase' ? ' oc-bar-glow' : ''}`} />
                      </div>
                      <div className="oc-scan-result">
                        {(scanPhase === 'scan' || scanPhase === 'filling') && (
                          <span className="oc-scan-cursor">_</span>
                        )}
                        {scanPhase === 'phrase' && (
                          <span key={current} className="oc-scan-phrase">{phrase}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation buttons */}
              <div className="oc-nav-row">
                <button className="oc-nav-btn" onClick={prev} disabled={total < 2} aria-label="Précédent">
                  <span className="oc-btn-face">
                    <svg viewBox="0 0 28 18" width="28" height="18" fill="none">
                      <path d="M18 9H4M4 9l6-5M4 9l6 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                      <rect x="20" y="3" width="6" height="12" rx="1" fill="currentColor" opacity=".5"/>
                    </svg>
                  </span>
                </button>

                <button
                  className="oc-nav-btn oc-nav-remove"
                  onClick={() => item && handleRemove(item.id)}
                  disabled={pending || total === 0}
                  aria-label="Retirer"
                >
                  <span className="oc-btn-face">
                    <svg viewBox="0 0 20 20" width="20" height="20" fill="none">
                      <path d="M5 5l10 10M15 5 5 15" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
                    </svg>
                  </span>
                </button>


<button className="oc-nav-btn" onClick={next} disabled={total < 2} aria-label="Suivant">
                  <span className="oc-btn-face">
                    <svg viewBox="0 0 28 18" width="28" height="18" fill="none">
                      <path d="M10 9h14M24 9l-6-5M24 9l-6 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                      <rect x="2" y="3" width="6" height="12" rx="1" fill="currentColor" opacity=".5"/>
                    </svg>
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* ── MON_PANIER.EXE ── */}
          <div className="oc-summary">
            <div className="oc-win95-outer oc-summary-win">
              <div className="oc-win95-titlebar">
                <span className="oc-win95-title">MON PANIER · {total} article{total !== 1 ? "s" : ""}</span>
                <div className="account-win95-chrome">
                  <span>_</span>
                  <span>□</span>
                  <span>×</span>
                </div>
              </div>

              {/* ---- Écran de transfert : progression vers la livraison offerte ----
                  Terminal 90s : blocs pleins qui se remplissent un par un dès que
                  le sous-total change. Le seuil vient de FREE_SHIPPING_TARGET. */}
              {total > 0 && (
                <div className="shrink-0 border-b-2 border-[#b8b4cc] bg-[#e7e5f1] p-2">
                  <div
                    role="status"
                    className={`${MONO} border-2 border-gray-400 bg-black p-2 text-[0.8125rem] text-green-400`}
                  >
                    <p className="m-0 tracking-[0.04em]">
                      TRANSFERT LIVRAISON GRATUITE : {subtotal.toFixed(2)}€ / {FREE_SHIPPING_TARGET.toFixed(2)}€
                    </p>
                    <p className="m-0 mt-1.5 flex items-center gap-2" aria-hidden>
                      <span className="tracking-[0.06em] text-[1rem] leading-none text-[#3bff88]">{bar}</span>
                      <span className="text-[0.8125rem] font-bold">{shownPct}%</span>
                      {!transferDone && <span className="oc-term-caret">_</span>}
                    </p>
                    <p className={`m-0 mt-1.5 tracking-[0.02em] ${shippingFree ? "text-[#7cff9e]" : "text-green-400/80"}`}>
                      {shippingFree
                        ? "> TRANSFERT TERMINÉ · LIVRAISON OFFERTE ✓"
                        : `> PLUS QUE ${remaining.toFixed(2)}€ POUR DÉBLOQUER LA LIVRAISON OFFERTE`}
                    </p>
                  </div>
                </div>
              )}

              <div className="oc-summary-body">
                {total === 0 ? (
                  <p className="oc-summary-empty">Panier vide.</p>
                ) : (
                  <ul className="m-0 flex list-none flex-col gap-2 p-0">
                    {lines.map((line, i) => {
                      const active = i === current;
                      return (
                        <li key={line.id}>
                          {/* Fichier sélectionné : liseré pointillé bleu + fond bleu ciel,
                              à la place de l'ancien pavé bleu roi plein. */}
                          {/* La carte entière reste cliquable à la souris ; la
                              sélection au clavier passe par le bouton du nom,
                              pour ne pas imbriquer deux rôles « button ». */}
                          <div
                            onClick={() => setCurrent(i)}
                            className={`flex cursor-pointer items-center gap-3 rounded-md p-2.5 transition ${
                              active
                                ? "border-2 border-dashed border-blue-600 bg-blue-50/50"
                                : "border-2 border-[#dcd8ea] bg-white hover:border-[#b8b4cc] hover:bg-[#f6f4fd]"
                            }`}
                          >
                            <div className="oc-summary-thumb">
                              <SmartImg src={line.image} alt={line.title} />
                            </div>

                            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                              <button
                                type="button"
                                aria-pressed={active}
                                onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
                                className={`${MONO} flex min-w-0 cursor-pointer items-center gap-1.5 rounded-sm text-left text-[1rem] font-bold tracking-[0.02em] text-[#1E2430] uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B48CE]`}
                              >
                                <span aria-hidden className="shrink-0 leading-none">📄</span>
                                <span className="line-clamp-2 [overflow-wrap:anywhere]">{line.title}</span>
                              </button>

                              <div className="flex flex-wrap gap-1.5">
                                {(line.variantTitle || line.size) && (
                                  <span className={`${MONO} rounded border border-[#c6c2d8] bg-[#f0eefa] px-1.5 py-0.5 text-[0.8125rem] whitespace-nowrap text-[#6b6480]`}>
                                    Taille : {line.variantTitle || line.size}
                                  </span>
                                )}
                                {line.etat && (
                                  <span className={`${MONO} rounded border border-[#c6c2d8] bg-[#f0eefa] px-1.5 py-0.5 text-[0.8125rem] whitespace-nowrap text-[#6b6480]`}>
                                    État : {line.etat}
                                  </span>
                                )}
                                {line.vendor && (
                                  <span className={`${MONO} rounded border border-[#c6c2d8] bg-[#f0eefa] px-1.5 py-0.5 text-[0.8125rem] whitespace-nowrap text-[#6b6480]`}>
                                    Marque : {line.vendor}
                                  </span>
                                )}
                              </div>

                              {/* Prix et poubelle sur la même ligne : la colonne
                                  d'infos garde ainsi toute la largeur pour le nom
                                  du fichier, qui se faisait couper à trois lettres
                                  quand le bouton occupait sa propre colonne. */}
                              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                                <span className={`${LCD} text-[1.375rem] leading-none tracking-[0.02em] text-[#1B48CE]`}>
                                  {(line.price * line.quantity).toFixed(2)}€{line.quantity > 1 && ` ×${line.quantity}`}
                                </span>

                                {/* Poubelle 3D rétro */}
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); handleRemove(line.id); }}
                                  disabled={pending}
                                  aria-label={`Retirer ${line.title} du panier`}
                                  className={`${MONO} ${PLASTIC_FACE} ${PLASTIC} ${PLASTIC_PRESS} shrink-0 cursor-pointer rounded-md border border-[#b8859f] px-2 py-1.5 text-[0.8125rem] font-bold tracking-[0.02em] whitespace-nowrap text-[#8c1046] uppercase transition hover:bg-[linear-gradient(180deg,#ffe6f2_0%,#ffc9e2_100%)] disabled:cursor-not-allowed disabled:opacity-45`}
                                >
                                  [ 🗑️ DELETE.SYS ]
                                </button>
                              </div>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {total > 0 && (
                <div className="flex shrink-0 flex-col gap-2.5 border-t-2 border-[#b8b4cc] bg-[#e7e5f1] px-3 pt-3 pb-3.5">
                  {/* Afficheur de caisse : encadré gris, chiffres LCD */}
                  <div
                    className={`${MONO} border-2 border-gray-400 bg-gray-100 p-3 shadow-[inset_0_2px_5px_rgba(0,0,0,0.16),inset_0_-1px_0_rgba(255,255,255,0.9)]`}
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-[1rem] font-bold tracking-[0.08em] text-[#3b3550] uppercase">Total</span>
                      <span className={`${LCD} text-[2.25rem] leading-[0.9] tracking-[0.02em] text-[#1B48CE]`}>
                        {subtotal.toFixed(2)}€
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-3 border-t border-dashed border-gray-400 pt-2 text-[0.8125rem] tracking-[0.04em] text-[#6b6480] uppercase">
                      <span>{cart?.totalQuantity ?? 0} article{(cart?.totalQuantity ?? 0) !== 1 ? "s" : ""}</span>
                      <span>{shippingFree ? "LIVRAISON : 0.00€" : "LIVRAISON : AU CHECKOUT"}</span>
                    </div>
                  </div>

                  <p className={`${MONO} m-0 text-[0.8125rem] leading-snug text-[#6b6480]`}>{t.cart.subtotalNote}</p>

                  {/* CHECKOUT_PROTOCOL : gros bouton chunky 3D violet / rose néon */}
                  <button
                    type="button"
                    onClick={handleCheckout}
                    disabled={pending}
                    className={`${MONO} w-full rounded-lg border-b-4 border-[#4a1180] bg-[linear-gradient(180deg,#a05cff_0%,#7b2bf0_52%,#ff3fb0_100%)] px-4 py-4 text-[1rem] leading-tight font-black tracking-[0.05em] text-white uppercase transition hover:brightness-110 active:translate-y-1 active:border-b-0 active:shadow-none disabled:cursor-not-allowed disabled:opacity-50 disabled:active:translate-y-0`}
                    style={{ boxShadow: "0 5px 0 rgba(24,12,58,0.35)" }}
                  >
                    [ ⚡ DÉMARRER LE TRANSFERT (PAYER {subtotal.toFixed(2)}€) ]
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* ── CORBEILLE.EXE : petite fenêtre de restauration ──
            Les articles retirés du panier pendant la session y atterrissent
            et peuvent être remis en un clic. Rien n'est persisté. */}
        {trashOpen && (
          <div
            role="dialog"
            aria-label="Corbeille"
            className="fixed right-4 bottom-4 left-4 z-[60] mx-auto w-auto max-w-[380px] rounded-xl border border-[#b8b4cc] bg-white shadow-[var(--ldl-shadow-window)] sm:left-auto sm:w-[380px] 2xl:bottom-[132px]"
          >
            <div className="oc-win95-titlebar rounded-t-xl">
              <span className="oc-win95-title">🗑️ CORBEILLE.EXE</span>
              <button
                type="button"
                onClick={() => setTrashOpen(false)}
                aria-label="Fermer la corbeille"
                className={`${MONO} cursor-pointer rounded border border-white/40 bg-white/15 px-2 py-0.5 text-[0.8125rem] leading-none font-bold text-white`}
              >
                ×
              </button>
            </div>

            <div className="max-h-[46vh] overflow-y-auto p-3">
              {trash.length === 0 ? (
                <p className={`${MONO} m-0 py-3 text-center text-[1rem] text-[#6b6480]`}>
                  La corbeille est vide.
                </p>
              ) : (
                <ul className="m-0 flex list-none flex-col gap-2 p-0">
                  {trash.map((line) => (
                    <li
                      key={line.id}
                      className="flex items-center gap-2.5 rounded-md border-2 border-dashed border-[#c6c2d8] bg-[#f6f4fd] p-2"
                    >
                      <span aria-hidden className="shrink-0 text-[1.125rem] leading-none">📄</span>
                      <span className={`${MONO} min-w-0 flex-1 truncate text-[1rem] text-[#1E2430] uppercase`}>
                        {line.title}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRestore(line)}
                        disabled={pending}
                        className={`${MONO} ${PLASTIC_FACE} ${PLASTIC} ${PLASTIC_PRESS} shrink-0 cursor-pointer rounded-md border border-[#8b87a3] px-2 py-1.5 text-[0.8125rem] font-bold whitespace-nowrap text-[#3b1d8f] uppercase disabled:cursor-not-allowed disabled:opacity-45`}
                      >
                        ↩ RESTAURER
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {trash.length > 0 && (
              <div className="flex justify-end border-t-2 border-[#b8b4cc] bg-[#e7e5f1] px-3 py-2">
                <button
                  type="button"
                  onClick={() => setTrash([])}
                  className={`${MONO} ${PLASTIC_FACE} ${PLASTIC} ${PLASTIC_PRESS} cursor-pointer rounded-md border border-[#8b87a3] px-2.5 py-1.5 text-[0.8125rem] font-bold text-[#6b6480] uppercase`}
                >
                  VIDER LA CORBEILLE
                </button>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />

      {showHeart && (
        <div className="ch-overlay" aria-live="polite">
          <div className="ch-scene">
            {/* Left wing : marshmallow Y2K (mirror of right) */}
            <svg className="ch-wing ch-wing-l" viewBox="0 0 440 400" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <defs>
                <radialGradient id="wLG" cx="350" cy="80" r="310" gradientUnits="userSpaceOnUse">
                  <stop offset="0%"   stopColor="#ffffff"/>
                  <stop offset="35%"  stopColor="#f4f3f8"/>
                  <stop offset="68%"  stopColor="#e4e2ee"/>
                  <stop offset="100%" stopColor="#d0cedd"/>
                </radialGradient>
                <radialGradient id="wLHi" cx="330" cy="85" r="132" gradientUnits="userSpaceOnUse">
                  <stop offset="0%"   stopColor="rgba(255,255,255,0.94)"/>
                  <stop offset="55%"  stopColor="rgba(255,255,255,0.38)"/>
                  <stop offset="100%" stopColor="rgba(255,255,255,0)"/>
                </radialGradient>
                <radialGradient id="wLSh" cx="85" cy="322" r="195" gradientUnits="userSpaceOnUse">
                  <stop offset="0%"   stopColor="rgba(135,130,158,0.5)"/>
                  <stop offset="100%" stopColor="rgba(135,130,158,0)"/>
                </radialGradient>
                <radialGradient id="wLSp" cx="340" cy="295" r="88" gradientUnits="userSpaceOnUse">
                  <stop offset="0%"   stopColor="rgba(150,146,170,0.45)"/>
                  <stop offset="60%"  stopColor="rgba(150,146,170,0.12)"/>
                  <stop offset="100%" stopColor="rgba(150,146,170,0)"/>
                </radialGradient>
                <radialGradient id="wLID" cx="95" cy="200" r="58" gradientUnits="userSpaceOnUse">
                  <stop offset="0%"   stopColor="rgba(138,134,160,0.44)"/>
                  <stop offset="100%" stopColor="rgba(138,134,160,0)"/>
                </radialGradient>
                <radialGradient id="wLID2" cx="72" cy="108" r="55" gradientUnits="userSpaceOnUse">
                  <stop offset="0%"   stopColor="rgba(138,134,160,0.38)"/>
                  <stop offset="100%" stopColor="rgba(138,134,160,0)"/>
                </radialGradient>
                <filter id="wLDrop" x="-18%" y="-18%" width="140%" height="140%">
                  <feDropShadow dx="-3" dy="7" stdDeviation="10" floodColor="rgba(78,72,108,0.32)"/>
                </filter>
                <clipPath id="wLClip">
                  <path d="M 265,16 C 212,6 130,22 88,58 C 52,90 38,118 40,142 C 42,162 62,180 86,190 C 102,198 115,208 120,222 C 124,238 80,260 68,278 C 60,295 65,320 85,332 C 106,344 135,355 168,362 C 202,368 238,372 272,368 C 305,364 335,355 358,340 C 382,325 402,298 402,270 C 402,242 388,218 372,206 C 362,196 355,182 355,162 C 355,138 368,106 375,80 C 382,52 355,18 265,16 Z"/>
                </clipPath>
              </defs>
              <g filter="url(#wLDrop)">
                <g clipPath="url(#wLClip)">
                  <rect x="0" y="0" width="440" height="400" fill="url(#wLG)"/>
                  <ellipse cx="330" cy="85"  rx="135" ry="102" fill="url(#wLHi)"/>
                  <ellipse cx="85"  cy="322" rx="195" ry="125" transform="rotate(-12 85 322)" fill="url(#wLSh)"/>
                  <ellipse cx="340" cy="295" rx="92"  ry="85"  fill="url(#wLSp)"/>
                  <ellipse cx="95"  cy="200" rx="58"  ry="28"  fill="url(#wLID)"/>
                  <ellipse cx="72"  cy="108" rx="55"  ry="32"  fill="url(#wLID2)"/>
                  <path d="M 340,235 C 298,235 258,268 265,305 C 272,342 305,368 340,365 C 375,362 400,335 398,305 C 396,275 372,255 344,258 C 316,261 298,282 304,308 C 310,334 330,348 350,344 C 368,340 378,322 373,305 C 368,290 352,282 338,286" stroke="rgba(130,126,152,0.36)" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
                </g>
              </g>
            </svg>

            {/* Heart : glossy Y2K */}
            <div className="ch-heart">
              <svg viewBox="0 0 200 188" className="ch-heart-svg" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <radialGradient id="chHG" cx="52%" cy="42%" r="57%">
                    <stop offset="0%"   stopColor="#FFB8D8"/>
                    <stop offset="48%"  stopColor="#F040A0"/>
                    <stop offset="100%" stopColor="#C41870"/>
                  </radialGradient>
                  <radialGradient id="chGlow" cx="36%" cy="36%" r="52%">
                    <stop offset="0%"   stopColor="rgba(255,210,235,0.45)"/>
                    <stop offset="100%" stopColor="rgba(255,100,175,0)"/>
                  </radialGradient>
                </defs>
                <path d="M100,174 C54,143 8,112 8,62 C8,31 32,7 62,7 C77,7 91,15 100,27 C109,15 123,7 138,7 C168,7 192,31 192,62 C192,112 146,143 100,174Z"
                      fill="url(#chHG)" stroke="#A8166A" strokeWidth="4" strokeLinejoin="round"/>
                <path d="M100,174 C54,143 8,112 8,62 C8,31 32,7 62,7 C77,7 91,15 100,27 C109,15 123,7 138,7 C168,7 192,31 192,62 C192,112 146,143 100,174Z"
                      fill="url(#chGlow)"/>
                {/* Main Y2K gloss bubble : upper right */}
                <ellipse cx="134" cy="52" rx="30" ry="26" fill="rgba(255,255,255,0.88)" transform="rotate(-12 134 52)"/>
                {/* Secondary shimmer dot */}
                <ellipse cx="150" cy="76" rx="11" ry="9"  fill="rgba(255,255,255,0.55)" transform="rotate(-8 150 76)"/>
              </svg>
              <p className="ch-heart-msg">{heartMsg}</p>
            </div>

            {/* Right wing : marshmallow Y2K */}
            <svg className="ch-wing ch-wing-r" viewBox="0 0 440 400" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <defs>
                <radialGradient id="wRG" cx="90" cy="80" r="310" gradientUnits="userSpaceOnUse">
                  <stop offset="0%"   stopColor="#ffffff"/>
                  <stop offset="35%"  stopColor="#f4f3f8"/>
                  <stop offset="68%"  stopColor="#e4e2ee"/>
                  <stop offset="100%" stopColor="#d0cedd"/>
                </radialGradient>
                <radialGradient id="wRHi" cx="110" cy="85" r="132" gradientUnits="userSpaceOnUse">
                  <stop offset="0%"   stopColor="rgba(255,255,255,0.94)"/>
                  <stop offset="55%"  stopColor="rgba(255,255,255,0.38)"/>
                  <stop offset="100%" stopColor="rgba(255,255,255,0)"/>
                </radialGradient>
                <radialGradient id="wRSh" cx="355" cy="322" r="195" gradientUnits="userSpaceOnUse">
                  <stop offset="0%"   stopColor="rgba(135,130,158,0.5)"/>
                  <stop offset="100%" stopColor="rgba(135,130,158,0)"/>
                </radialGradient>
                <radialGradient id="wRSp" cx="100" cy="295" r="88" gradientUnits="userSpaceOnUse">
                  <stop offset="0%"   stopColor="rgba(150,146,170,0.45)"/>
                  <stop offset="60%"  stopColor="rgba(150,146,170,0.12)"/>
                  <stop offset="100%" stopColor="rgba(150,146,170,0)"/>
                </radialGradient>
                <radialGradient id="wRID" cx="345" cy="200" r="58" gradientUnits="userSpaceOnUse">
                  <stop offset="0%"   stopColor="rgba(138,134,160,0.44)"/>
                  <stop offset="100%" stopColor="rgba(138,134,160,0)"/>
                </radialGradient>
                <radialGradient id="wRID2" cx="368" cy="108" r="55" gradientUnits="userSpaceOnUse">
                  <stop offset="0%"   stopColor="rgba(138,134,160,0.38)"/>
                  <stop offset="100%" stopColor="rgba(138,134,160,0)"/>
                </radialGradient>
                <filter id="wRDrop" x="-18%" y="-18%" width="140%" height="140%">
                  <feDropShadow dx="3" dy="7" stdDeviation="10" floodColor="rgba(78,72,108,0.32)"/>
                </filter>
                <clipPath id="wRClip">
                  <path d="M 175,16 C 228,6 310,22 352,58 C 388,90 402,118 400,142 C 398,162 378,180 354,190 C 338,198 325,208 320,222 C 316,238 360,260 372,278 C 380,295 375,320 355,332 C 334,344 305,355 272,362 C 238,368 202,372 168,368 C 135,364 105,355 82,340 C 58,325 38,298 38,270 C 38,242 52,218 68,206 C 78,196 85,182 85,162 C 85,138 72,106 65,80 C 58,52 85,18 175,16 Z"/>
                </clipPath>
              </defs>
              <g filter="url(#wRDrop)">
                <g clipPath="url(#wRClip)">
                  <rect x="0" y="0" width="440" height="400" fill="url(#wRG)"/>
                  <ellipse cx="110" cy="85"  rx="135" ry="102" fill="url(#wRHi)"/>
                  <ellipse cx="355" cy="322" rx="195" ry="125" transform="rotate(12 355 322)" fill="url(#wRSh)"/>
                  <ellipse cx="100" cy="295" rx="92"  ry="85"  fill="url(#wRSp)"/>
                  <ellipse cx="345" cy="200" rx="58"  ry="28"  fill="url(#wRID)"/>
                  <ellipse cx="368" cy="108" rx="55"  ry="32"  fill="url(#wRID2)"/>
                  <path d="M 100,235 C 142,235 182,268 175,305 C 168,342 135,368 100,365 C 65,362 40,335 42,305 C 44,275 68,255 96,258 C 124,261 142,282 136,308 C 130,334 110,348 90,344 C 72,340 62,322 67,305 C 72,290 88,282 102,286" stroke="rgba(130,126,152,0.36)" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
                </g>
              </g>
            </svg>
          </div>
        </div>
      )}
    </>
  );
}
