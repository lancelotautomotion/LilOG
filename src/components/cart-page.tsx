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
            {/* Left wing — marshmallow Y2K */}
            <svg className="ch-wing ch-wing-l" viewBox="0 0 290 248" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <defs>
                <radialGradient id="wLG" cx="255" cy="55" r="200" gradientUnits="userSpaceOnUse">
                  <stop offset="0%"   stopColor="#ffffff"/>
                  <stop offset="40%"  stopColor="#f0eff5"/>
                  <stop offset="76%"  stopColor="#e1dfe9"/>
                  <stop offset="100%" stopColor="#c8c5d3"/>
                </radialGradient>
                <radialGradient id="wLHi" cx="250" cy="45" r="105" gradientUnits="userSpaceOnUse">
                  <stop offset="0%"   stopColor="rgba(255,255,255,0.9)"/>
                  <stop offset="100%" stopColor="rgba(255,255,255,0)"/>
                </radialGradient>
                <radialGradient id="wLSh" cx="85" cy="198" r="118" gradientUnits="userSpaceOnUse">
                  <stop offset="0%"   stopColor="rgba(142,138,165,0.52)"/>
                  <stop offset="100%" stopColor="rgba(142,138,165,0)"/>
                </radialGradient>
                <filter id="wLDrop" x="-18%" y="-18%" width="140%" height="140%">
                  <feDropShadow dx="-2" dy="6" stdDeviation="9" floodColor="rgba(88,85,118,0.34)"/>
                </filter>
                <clipPath id="wLClip">
                  <path d="M 268,105 C 284,80 284,44 234,20 C 196,3 120,6 72,44 C 40,66 42,102 62,118 C 70,124 85,118 95,126 C 90,152 85,178 104,200 C 125,218 158,226 192,222 C 222,218 244,202 250,192 C 260,180 262,162 262,148 C 262,128 266,113 268,105 Z"/>
                  <ellipse cx="52"  cy="52"  rx="48" ry="36" transform="rotate(15 52 52)"/>
                  <ellipse cx="26"  cy="120" rx="46" ry="36"/>
                  <ellipse cx="52"  cy="192" rx="48" ry="34" transform="rotate(-8 52 192)"/>
                  <ellipse cx="230" cy="182" rx="56" ry="50"/>
                </clipPath>
              </defs>
              <g filter="url(#wLDrop)">
                <g clipPath="url(#wLClip)">
                  <rect x="-5" y="-5" width="300" height="258" fill="url(#wLG)"/>
                  <ellipse cx="214" cy="68"  rx="108" ry="70" transform="rotate(20 214 68)"  fill="url(#wLHi)"/>
                  <ellipse cx="85"  cy="200" rx="95"  ry="60" transform="rotate(-15 85 200)" fill="url(#wLSh)"/>
                  <path d="M 230,147 C 206,147 195,165 195,182 C 195,200 210,217 230,217 C 250,217 265,202 265,182 C 265,162 252,148 232,148 C 214,150 202,164 202,182 C 202,198 214,212 230,212 C 246,212 258,200 258,182 C 258,166 248,154 234,153" stroke="rgba(135,132,158,0.38)" strokeWidth="2" strokeLinecap="round" fill="none"/>
                </g>
              </g>
            </svg>

            {/* Heart — glossy Y2K */}
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
                {/* Main Y2K gloss bubble — upper right */}
                <ellipse cx="134" cy="52" rx="30" ry="26" fill="rgba(255,255,255,0.88)" transform="rotate(-12 134 52)"/>
                {/* Secondary shimmer dot */}
                <ellipse cx="150" cy="76" rx="11" ry="9"  fill="rgba(255,255,255,0.55)" transform="rotate(-8 150 76)"/>
              </svg>
              <p className="ch-heart-msg">{heartMsg}</p>
            </div>

            {/* Right wing — marshmallow Y2K */}
            <svg className="ch-wing ch-wing-r" viewBox="0 0 290 248" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <defs>
                <radialGradient id="wRG" cx="35" cy="55" r="200" gradientUnits="userSpaceOnUse">
                  <stop offset="0%"   stopColor="#ffffff"/>
                  <stop offset="40%"  stopColor="#f0eff5"/>
                  <stop offset="76%"  stopColor="#e1dfe9"/>
                  <stop offset="100%" stopColor="#c8c5d3"/>
                </radialGradient>
                <radialGradient id="wRHi" cx="40" cy="45" r="105" gradientUnits="userSpaceOnUse">
                  <stop offset="0%"   stopColor="rgba(255,255,255,0.9)"/>
                  <stop offset="100%" stopColor="rgba(255,255,255,0)"/>
                </radialGradient>
                <radialGradient id="wRSh" cx="205" cy="198" r="118" gradientUnits="userSpaceOnUse">
                  <stop offset="0%"   stopColor="rgba(142,138,165,0.52)"/>
                  <stop offset="100%" stopColor="rgba(142,138,165,0)"/>
                </radialGradient>
                <filter id="wRDrop" x="-18%" y="-18%" width="140%" height="140%">
                  <feDropShadow dx="2" dy="6" stdDeviation="9" floodColor="rgba(88,85,118,0.34)"/>
                </filter>
                <clipPath id="wRClip">
                  <path d="M 22,105 C 6,80 6,44 56,20 C 94,3 170,6 218,44 C 250,66 248,102 228,118 C 220,124 205,118 195,126 C 200,152 205,178 186,200 C 165,218 132,226 98,222 C 68,218 46,202 40,192 C 30,180 28,162 28,148 C 28,128 24,113 22,105 Z"/>
                  <ellipse cx="238" cy="52"  rx="48" ry="36" transform="rotate(-15 238 52)"/>
                  <ellipse cx="264" cy="120" rx="46" ry="36"/>
                  <ellipse cx="238" cy="192" rx="48" ry="34" transform="rotate(8 238 192)"/>
                  <ellipse cx="60"  cy="182" rx="56" ry="50"/>
                </clipPath>
              </defs>
              <g filter="url(#wRDrop)">
                <g clipPath="url(#wRClip)">
                  <rect x="-5" y="-5" width="300" height="258" fill="url(#wRG)"/>
                  <ellipse cx="76"  cy="68"  rx="108" ry="70" transform="rotate(-20 76 68)"  fill="url(#wRHi)"/>
                  <ellipse cx="205" cy="200" rx="95"  ry="60" transform="rotate(15 205 200)"  fill="url(#wRSh)"/>
                  <path d="M 60,147 C 84,147 95,165 95,182 C 95,200 80,217 60,217 C 40,217 25,202 25,182 C 25,162 38,148 58,148 C 76,150 88,164 88,182 C 88,198 76,212 60,212 C 44,212 32,200 32,182 C 32,166 42,154 56,153" stroke="rgba(135,132,158,0.38)" strokeWidth="2" strokeLinecap="round" fill="none"/>
                </g>
              </g>
            </svg>
          </div>
        </div>
      )}
    </>
  );
}
