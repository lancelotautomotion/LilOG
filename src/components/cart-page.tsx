"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n-context";
import { useCart } from "@/lib/cart-context";
import { Nav } from "@/components/nav";
import { Drawer } from "@/components/drawer";
import { Footer } from "@/components/footer";
import { SmartImg } from "@/components/smart-img";

export function CartPage() {
  const { t } = useLanguage();
  const { cart, pending, removeItem } = useCart();
  const [menu, setMenu] = useState(false);
  const [current, setCurrent] = useState(0);
  const [viewAll, setViewAll] = useState(false);

  const lines = cart?.lines ?? [];
  const total = lines.length;
  const item = lines[current];

  const prev = () => setCurrent((i) => (i - 1 + total) % total);
  const next = () => setCurrent((i) => (i + 1) % total);

  return (
    <>
      <Nav onMenu={() => setMenu(true)} forceSolid />
      <Drawer open={menu} onClose={() => setMenu(false)} />

      <main className="clueless-page">
        {/* Leopard background */}
        <div className="clueless-bg" />

        <div className="clueless-wrap">
          <h1 className="clueless-title">MON DRESSING</h1>

          {lines.length === 0 ? (
            <div className="clueless-empty">
              <p>Votre dressing est vide.</p>
              <Link href="/" className="clueless-empty-cta">Shopper maintenant →</Link>
            </div>
          ) : (
            <>
              {/* Machine */}
              <div className="clueless-machine">

                {/* Screen */}
                {!viewAll ? (
                  <div className="clueless-screen">
                    <div className="clueless-screen-inner">
                      <Link href={`/products/${item.handle}`}>
                        <SmartImg src={item.image} alt={item.title} />
                      </Link>
                    </div>
                    <div className="clueless-counter">
                      {current + 1} / {total}
                    </div>
                  </div>
                ) : (
                  <div className="clueless-grid-screen">
                    {lines.map((line, i) => (
                      <button
                        key={line.id}
                        className={"clueless-thumb" + (i === current ? " active" : "")}
                        onClick={() => { setCurrent(i); setViewAll(false); }}
                      >
                        <SmartImg src={line.image} alt={line.title} />
                      </button>
                    ))}
                  </div>
                )}

                {/* Info bar */}
                <div className="clueless-info">
                  {!viewAll && (
                    <>
                      <span className="clueless-item-name">{item.title}</span>
                      <span className="clueless-item-price">
                        {item.currency === "GBP" ? "£" : "€"}{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </>
                  )}
                </div>

                {/* Controls */}
                <div className="clueless-controls">
                  <button
                    className="clueless-btn clueless-btn-nav"
                    onClick={prev}
                    aria-label="Précédent"
                    disabled={viewAll}
                  >
                    <CluelessArrowL />
                  </button>

                  <button
                    className={"clueless-btn clueless-btn-all" + (viewAll ? " active" : "")}
                    onClick={() => setViewAll((v) => !v)}
                    aria-label="Voir tout"
                  >
                    <CluelessGrid />
                  </button>

                  <button
                    className="clueless-btn clueless-btn-remove"
                    onClick={() => { removeItem(item.id); if (current >= total - 1) setCurrent(Math.max(0, total - 2)); }}
                    disabled={pending || viewAll}
                    aria-label="Retirer"
                  >
                    <CluelessTrash />
                  </button>

                  <button
                    className="clueless-btn clueless-btn-nav"
                    onClick={next}
                    aria-label="Suivant"
                    disabled={viewAll}
                  >
                    <CluelessArrowR />
                  </button>
                </div>
              </div>

              {/* Summary */}
              <div className="clueless-summary">
                <div className="clueless-summary-row">
                  <span>SOUS-TOTAL</span>
                  <span>£{cart?.subtotal.toFixed(2)}</span>
                </div>
                <p className="clueless-summary-note">{t.cart.subtotalNote}</p>
                {cart?.checkoutUrl && (
                  <a className="clueless-checkout" href={cart.checkoutUrl}>
                    PASSER COMMANDE
                  </a>
                )}
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}

function CluelessArrowL() {
  return (
    <svg viewBox="0 0 40 24" width="36" height="22" fill="none" aria-hidden>
      <rect x="1" y="1" width="38" height="22" rx="3" stroke="currentColor" strokeWidth="2"/>
      <path d="M24 12H10m0 0 5-5m-5 5 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <rect x="28" y="8" width="8" height="8" rx="1" fill="currentColor" opacity=".25"/>
    </svg>
  );
}

function CluelessArrowR() {
  return (
    <svg viewBox="0 0 40 24" width="36" height="22" fill="none" aria-hidden>
      <rect x="1" y="1" width="38" height="22" rx="3" stroke="currentColor" strokeWidth="2"/>
      <path d="M16 12h14m0 0-5-5m5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <rect x="4" y="8" width="8" height="8" rx="1" fill="currentColor" opacity=".25"/>
    </svg>
  );
}

function CluelessGrid() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden>
      <rect x="2" y="2" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.8"/>
      <rect x="13" y="2" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.8"/>
      <rect x="2" y="13" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.8"/>
      <rect x="13" y="13" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.8"/>
    </svg>
  );
}

function CluelessTrash() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden>
      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M10 11v5M14 11v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}
