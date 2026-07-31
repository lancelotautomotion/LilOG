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

export function CartPage() {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const { cart, pending, removeItem } = useCart();
  const firstName = session?.user?.name?.split(" ")[0] ?? null;
  const [menu, setMenu] = useState(false);
  const [current, setCurrent] = useState(0);
  const [scanPhase, setScanPhase] = useState<'scan' | 'filling' | 'phrase'>('scan');
  const [phrase, setPhrase] = useState(() => randomPhrase());
  const [showHeart, setShowHeart] = useState(false);
  const [heartMsg, setHeartMsg] = useState('');
  const heartTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCheckout = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const url = cart?.checkoutUrl;
    if (!url) return;
    if (heartTimer.current) clearTimeout(heartTimer.current);
    setHeartMsg(MSN_MESSAGES[Math.floor(Math.random() * MSN_MESSAGES.length)]);
    setShowHeart(true);
    heartTimer.current = setTimeout(() => { window.location.href = url; }, 2000);
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

  const prev = () => setCurrent((i) => (i - 1 + total) % total);
  const next = () => setCurrent((i) => (i + 1) % total);

  const handleRemove = (id: string) => {
    removeItem(id);
    setCurrent((i) => Math.max(0, Math.min(i, total - 2)));
  };

  return (
    <>
      <Nav onMenu={() => setMenu(true)} forceSolid />
      <Drawer open={menu} onClose={() => setMenu(false)} />

      <main className="oc-root">
        <div className="oc-page">

          {/* ── Win95 machine ── */}
          <div className="oc-center">
            <div className="oc-win95-outer">
              <div className="oc-win95-titlebar">
                <span className="oc-win95-title">
                  {firstName ? `Dressing de ${firstName}` : "Dressing"}
                </span>
                {total > 0 && <span className="oc-counter">{current + 1}/{total}</span>}
                <div className="oc-win95-dots">
                  <span /><span /><span />
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
                      {/* Scan beam — monté uniquement pendant la phase filling, en sync avec la barre */}
                      {scanPhase === 'filling' && (
                        <div key={current} className="oc-scan-overlay" aria-hidden="true" />
                      )}
                    </div>
                    <div className="oc-item-label">
                      <span className="oc-item-name">{item.title}</span>
                      <span className="oc-item-price">€{(item.price * item.quantity).toFixed(2)}</span>
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

          {/* ── Summary panel ── */}
          <div className="oc-summary">
            <div className="oc-win95-outer oc-summary-win">
              <div className="oc-win95-titlebar">
                <span className="oc-win95-title">MON PANIER — {total} article{total !== 1 ? "s" : ""}</span>
                <div className="oc-win95-dots"><span /><span /><span /></div>
              </div>

              <div className="oc-summary-body">
                {total === 0 ? (
                  <p className="oc-summary-empty">Panier vide.</p>
                ) : (
                  <ul className="oc-summary-list">
                    {lines.map((line, i) => (
                      <li key={line.id} className={`oc-summary-line${i === current ? " oc-summary-line-active" : ""}`} onClick={() => setCurrent(i)}>
                        <div className="oc-summary-thumb">
                          <SmartImg src={line.image} alt={line.title} />
                        </div>
                        <div className="oc-summary-info">
                          <span className="oc-summary-name">{line.title}</span>
                          {line.variantTitle && <span className="oc-summary-variant">{line.variantTitle}</span>}
                          <span className="oc-summary-price">€{(line.price * line.quantity).toFixed(2)}{line.quantity > 1 && ` ×${line.quantity}`}</span>
                        </div>
                        <button
                          className="oc-summary-remove"
                          onClick={(e) => { e.stopPropagation(); handleRemove(line.id); }}
                          disabled={pending}
                          aria-label="Retirer"
                        >✕</button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {total > 0 && (
                <div className="oc-summary-footer">
                  <div className="oc-summary-total">
                    <span>TOTAL</span>
                    <span>€{cart?.subtotal.toFixed(2)}</span>
                  </div>
                  <p className="oc-summary-note">{t.cart.subtotalNote}</p>
                  {cart?.checkoutUrl && (
                    <a className="oc-checkout-btn" href={cart.checkoutUrl} onClick={handleCheckout}>
                      {t.cart.checkout} →
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
      <Footer />

      {showHeart && (
        <div className="ch-overlay" aria-live="polite">
          <div className="ch-scene">
            {/* Left wing */}
            <svg className="ch-wing ch-wing-l" viewBox="0 0 155 125" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M148,58 Q108,4 5,14 Q54,37 148,53 Z" fill="white"/>
              <path d="M148,58 Q106,11 8,21 Q52,43 148,61 Z" fill="rgba(255,255,255,0.7)"/>
              <path d="M147,64 Q103,23 12,33 Q49,51 147,67 Z" fill="#f3f3f9"/>
              <path d="M145,70 Q98,37 18,47 Q47,59 145,73 Z" fill="#ededf5"/>
              <path d="M142,77 Q94,52 26,61 Q46,69 142,79 Z" fill="#e8e8f2"/>
              <path d="M138,83 Q88,66 35,73 Q44,79 138,86 Z" fill="#e3e3ef"/>
              <path d="M132,89 Q82,78 44,84 Q46,89 132,92 Z" fill="#dddded"/>
            </svg>

            {/* Heart + text */}
            <div className="ch-heart">
              <svg viewBox="0 0 200 188" className="ch-heart-svg" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="chHG" x1="0%" y1="0%" x2="45%" y2="100%">
                    <stop offset="0%" stopColor="#FF5CB5"/>
                    <stop offset="100%" stopColor="#E5007A"/>
                  </linearGradient>
                </defs>
                {/* Flat Y2K heart — vivid pink + bold stroke */}
                <path d="M100,174 C54,143 8,112 8,62 C8,31 32,7 62,7 C77,7 91,15 100,27 C109,15 123,7 138,7 C168,7 192,31 192,62 C192,112 146,143 100,174Z"
                      fill="url(#chHG)" stroke="#B8006A" strokeWidth="5" strokeLinejoin="round"/>
                {/* Classic Y2K gloss ellipse — top left */}
                <ellipse cx="72" cy="50" rx="28" ry="17" fill="rgba(255,255,255,0.55)" transform="rotate(-38 72 50)"/>
                {/* Secondary shimmer */}
                <ellipse cx="132" cy="34" rx="12" ry="7" fill="rgba(255,255,255,0.28)" transform="rotate(12 132 34)"/>
              </svg>
              <p className="ch-heart-msg">{heartMsg}</p>
            </div>

            {/* Right wing */}
            <svg className="ch-wing ch-wing-r" viewBox="0 0 155 125" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M7,58 Q47,4 150,14 Q101,37 7,53 Z" fill="white"/>
              <path d="M7,58 Q49,11 147,21 Q103,43 7,61 Z" fill="rgba(255,255,255,0.7)"/>
              <path d="M8,64 Q52,23 143,33 Q106,51 8,67 Z" fill="#f3f3f9"/>
              <path d="M10,70 Q57,37 137,47 Q108,59 10,73 Z" fill="#ededf5"/>
              <path d="M13,77 Q61,52 129,61 Q109,69 13,79 Z" fill="#e8e8f2"/>
              <path d="M17,83 Q67,66 120,73 Q111,79 17,86 Z" fill="#e3e3ef"/>
              <path d="M23,89 Q73,78 111,84 Q109,89 23,92 Z" fill="#dddded"/>
            </svg>
          </div>
        </div>
      )}
    </>
  );
}
