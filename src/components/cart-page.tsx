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
                <div className="account-win95-chrome">
                  <span>_</span>
                  <span>□</span>
                  <span>×</span>
                </div>
              </div>

              <div className="oc-summary-body">
                {total === 0 ? (
                  <div className="oc-summary-empty">
                    <p className="oc-summary-empty-text">Panier vide.</p>
                    {/* Un panier vide ne proposait rien : la fenêtre s'arrêtait
                        sur le constat. Le libellé existait déjà, traduit dans
                        les neuf langues, et n'était utilisé nulle part. */}
                    <Link href="/#drops" className="oc-cta">🛍 {t.pdp.completeLook} →</Link>
                  </div>
                ) : (
                  <ul className="oc-summary-list">
                    {lines.map((line, i) => (
                      <li key={line.id} className={`oc-summary-line${i === current ? " oc-summary-line-active" : ""}`} onClick={() => setCurrent(i)}>
                        <div className="oc-summary-thumb">
                          <SmartImg src={line.image} alt={line.title} />
                        </div>
                        <div className="oc-summary-info">
                          <span className="oc-summary-name">{line.title}</span>
                          <div className="oc-summary-meta">
                            {(line.variantTitle || line.size) && <span className="oc-summary-meta-item">Taille : {line.variantTitle || line.size}</span>}
                            {line.etat && <span className="oc-summary-meta-item">État : {line.etat}</span>}
                            {line.vendor && <span className="oc-summary-meta-item">Marque : {line.vendor}</span>}
                          </div>
                          <span className="oc-summary-price">€{(line.price * line.quantity).toFixed(2)}{line.quantity > 1 && ` ×${line.quantity}`}</span>
                        </div>
                        <button
                          className="oc-summary-remove"
                          onClick={(e) => { e.stopPropagation(); handleRemove(line.id); }}
                          disabled={pending}
                          aria-label="Retirer"
                        >×</button>
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
                  {(cart?.lines?.length ?? 0) > 0 && (
                    <button className="oc-checkout-btn" onClick={handleCheckout} disabled={pending}>
                      {t.cart.checkout} →
                    </button>
                  )}
                  {/* Retour au catalogue sans quitter le panier : une pièce
                      seule n'est pas un look. */}
                  <Link href="/#drops" className="oc-complete-link">
                    🛍 {t.pdp.completeLook} →
                  </Link>
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
            {/* Left wing — marshmallow Y2K (mirror of right) */}
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
