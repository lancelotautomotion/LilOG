"use client";

import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n-context";
import { useCart } from "@/lib/cart-context";
import { Nav } from "@/components/nav";
import { Drawer } from "@/components/drawer";
import { Footer } from "@/components/footer";
import { SmartImg } from "@/components/smart-img";
import { CheckoutModal } from "@/components/checkout-modal";
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
   rester alignée sur /livraison (03_FRAIS.SYS). Changer l'une
   sans l'autre affiche deux promesses différentes au même
   client. Un seul endroit à modifier ici.
   ============================================================ */
const FREE_SHIPPING_TARGET = 90;

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

  /* Alignement des deux fenêtres : DRESSING sert de référence, MON_PANIER
     doit se caler EXACTEMENT sur sa hauteur, quel que soit le nombre
     d'articles. Le CSS seul ne peut pas garantir ça (voir le commentaire
     sur .oc-summary dans globals.css) : on mesure donc la hauteur réelle
     de DRESSING et on la repose en style inline sur MON_PANIER, qui gère
     ensuite en interne le header/scroll-body/footer via flex. */
  const dressingWinRef = useRef<HTMLDivElement>(null);
  const [panierHeight, setPanierHeight] = useState<number | null>(null);
  useLayoutEffect(() => {
    const el = dressingWinRef.current;
    if (!el) return;
    const update = () => setPanierHeight(el.getBoundingClientRect().height);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* Départ vers le paiement Shopify. Le minuteur est purgé au passage :
     que le client clique « continuer » ou laisse filer les 3 secondes, la
     redirection ne part qu'une fois. */
  const goToCheckout = () => {
    if (!cart?.checkoutUrl) return;
    if (heartTimer.current) clearTimeout(heartTimer.current);
    window.location.href = cart.checkoutUrl;
  };

  const handleCheckout = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    e.preventDefault();
    if (!cart?.checkoutUrl) return;
    if (heartTimer.current) clearTimeout(heartTimer.current);
    setHeartMsg(MSN_MESSAGES[Math.floor(Math.random() * MSN_MESSAGES.length)]);
    setShowHeart(true);
    /* 3 s : le temps de voir l'insigne apparaître et le ticket sortir de
       l'imprimante avant de partir sur le paiement Shopify. */
    heartTimer.current = setTimeout(goToCheckout, 3000);
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

  /* ---- Jauge « livraison offerte » ----
     Le remplissage est animé en CSS (voir .oc-ship-bar-fill) : rien à
     cadencer côté React, la largeur posée en style inline suffit. */
  const subtotal = cart?.subtotal ?? 0;
  const ratio = Math.min(1, subtotal / FREE_SHIPPING_TARGET);
  const pct = Math.round(ratio * 100);
  const remaining = Math.max(0, FREE_SHIPPING_TARGET - subtotal);
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

  /* Icônes de bureau : 4 raccourcis en colonne le long du bord gauche. */
  const desktopIcons = [
    { key: "favoris", icon: "📂", label: "MES_FAVORIS.SYS", href: "/wishlist" },
    { key: "dressing", icon: "👗", label: "DRESSING.EXE", href: "/dressing-machine" },
    { key: "drive", icon: "💾", label: "LIL_OG_DRIVE", href: "/catalogue" },
    { key: "corbeille", icon: "🗑️", label: "CORBEILLE.EXE", onClick: () => setTrashOpen((o) => !o), badge: trash.length },
  ];

  return (
    <>
      <Nav onMenu={() => setMenu(true)} forceSolid />
      <Drawer open={menu} onClose={() => setMenu(false)} />

      <main className="oc-root bg-grid-pattern">

        <div className="oc-page">
        <div className="oc-row">

          {/* ── Win95 machine ── */}
          <div className="oc-center">
            <div className="oc-win95-outer" ref={dressingWinRef}>
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
                    {/* Le catalogue complet, le « Tout voir » du menu, et non
                        l'accueil : depuis un panier vide on veut des pièces à
                        parcourir tout de suite, pas la page d'entrée. */}
                    <Link href="/catalogue" className="oc-link">Shopper maintenant →</Link>
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
          <div className="oc-summary" style={panierHeight != null ? { height: panierHeight } : undefined}>
            <div className="oc-win95-outer oc-summary-win">
              <div className="oc-win95-titlebar">
                <span className="oc-win95-title">MON PANIER · {total} article{total !== 1 ? "s" : ""}</span>
                <div className="account-win95-chrome">
                  <span>_</span>
                  <span>□</span>
                  <span>×</span>
                </div>
              </div>

              {/* ---- Jauge de livraison offerte ----
                  Même instrument que le STYLE SCAN de la fenêtre de gauche :
                  en-tête LCD, piste à blocs bleus, verdict en grandes lettres.
                  Le seuil vient de FREE_SHIPPING_TARGET. */}
              {total > 0 && (
                <div className="oc-ship-meter" role="status">
                  <span className="oc-scan-header">Livraison offerte</span>

                  <div className="oc-scan-bar-track">
                    <div
                      key={pct}
                      className={`oc-ship-bar-fill${shippingFree ? " oc-ship-bar-full" : ""}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <span className={`oc-ship-status${shippingFree ? " oc-ship-status-done" : ""}`}>
                    {shippingFree ? "Livraison offerte ♥" : `Plus que ${remaining.toFixed(2)}€`}
                  </span>
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
                                  <span className={`${MONO} max-w-full rounded border border-[#c6c2d8] bg-[#f0eefa] px-1.5 py-0.5 text-[0.8125rem] text-[#6b6480] [overflow-wrap:anywhere]`}>
                                    Taille : {line.variantTitle || line.size}
                                  </span>
                                )}
                                {line.etat && (
                                  <span className={`${MONO} max-w-full rounded border border-[#c6c2d8] bg-[#f0eefa] px-1.5 py-0.5 text-[0.8125rem] text-[#6b6480] [overflow-wrap:anywhere]`}>
                                    État : {line.etat}
                                  </span>
                                )}
                                {line.vendor && (
                                  <span className={`${MONO} max-w-full rounded border border-[#c6c2d8] bg-[#f0eefa] px-1.5 py-0.5 text-[0.8125rem] text-[#6b6480] [overflow-wrap:anywhere]`}>
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

          {/* ── Bureau : les quatre raccourcis de sortie de page.
              Rendus après les fenêtres, donc posés SOUS elles au téléphone,
              où l'on veut voir son panier d'abord et pas quatre boutons qui
              en font sortir. Au bureau, `order: -1` les ramène en colonne
              le long du bord gauche (voir .oc-desktop-icons). ── */}
          <div className="oc-desktop-icons">
            {desktopIcons.map((ic) => (
              <DesktopIcon key={ic.key} icon={ic.icon} label={ic.label} href={ic.href} onClick={ic.onClick} badge={ic.badge} />
            ))}
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
            className="fixed right-4 bottom-4 left-4 z-[60] mx-auto w-auto max-w-[380px] rounded-xl border border-[#b8b4cc] bg-white shadow-[var(--ldl-shadow-window)] sm:left-auto sm:w-[380px]"
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
        <CheckoutModal
          lines={lines}
          subtotal={subtotal}
          message={heartMsg}
          onContinue={goToCheckout}
        />
      )}
    </>
  );
}
