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
                <span className="oc-win95-title">DRESSING DE CHER — {total} article{total !== 1 ? "s" : ""}</span>
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
                    </div>
                    <div className="oc-item-label">
                      <span className="oc-item-name">{item.title}</span>
                      <span className="oc-item-price">£{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                    <div className="oc-counter">{current + 1} / {total}</div>
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
                  <>
                    <ul className="oc-summary-list">
                      {lines.map((line, i) => (
                        <li key={line.id} className={`oc-summary-line${i === current ? " oc-summary-line-active" : ""}`}>
                          <button className="oc-summary-thumb" onClick={() => setCurrent(i)}>
                            <SmartImg src={line.image} alt={line.title} />
                          </button>
                          <div className="oc-summary-info">
                            <span className="oc-summary-name">{line.title}</span>
                            {line.variantTitle && <span className="oc-summary-variant">{line.variantTitle}</span>}
                            <span className="oc-summary-price">£{(line.price * line.quantity).toFixed(2)}{line.quantity > 1 && ` ×${line.quantity}`}</span>
                          </div>
                          <button
                            className="oc-summary-remove"
                            onClick={() => handleRemove(line.id)}
                            disabled={pending}
                            aria-label="Retirer"
                          >✕</button>
                        </li>
                      ))}
                    </ul>

                    <div className="oc-summary-footer">
                      <div className="oc-summary-total">
                        <span>TOTAL</span>
                        <span>£{cart?.subtotal.toFixed(2)}</span>
                      </div>
                      <p className="oc-summary-note">{t.cart.subtotalNote}</p>
                      {cart?.checkoutUrl && (
                        <a className="oc-checkout-btn" href={cart.checkoutUrl}>
                          {t.cart.checkout} →
                        </a>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
