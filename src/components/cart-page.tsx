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
  const [mode, setMode] = useState<"clueless" | "classic">("clueless");

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

      <main className={`oc-root${mode === "classic" ? " oc-classic-mode" : ""}`}>

        {/* ── CLUELESS VIEW ── */}
        <div className="oc-clueless">
          {/* Left leopard panel */}
          <div className="oc-panel oc-panel-left" />

          {/* Center */}
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

                <button
                  className="oc-nav-btn oc-nav-checkout"
                  onClick={() => setMode("classic")}
                  aria-label="Voir panier"
                >
                  <span className="oc-btn-face oc-btn-face-wide">
                    <svg viewBox="0 0 20 20" width="16" height="16" fill="none">
                      <path d="M3 5h14M5 5V4a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v1M6 9v6M10 9v6M14 9v6M4 5l1 12h10L16 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                    </svg>
                    PANIER
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

          {/* Right leopard panel */}
          <div className="oc-panel oc-panel-right" />
        </div>

        {/* ── CLASSIC VIEW ── */}
        <div className="oc-classic">
          <div className="oc-classic-inner">
            <div className="oc-classic-header">
              <h1 className="oc-classic-title">Mon panier</h1>
              <button className="oc-back-btn" onClick={() => setMode("clueless")}>
                ← Retour au dressing
              </button>
            </div>

            {lines.length === 0 ? (
              <div className="cart-empty">
                <p>{t.cart.empty}</p>
                <Link className="link-arrow" href="/">{t.cart.emptyCta} →</Link>
              </div>
            ) : (
              <div className="cart-layout">
                <ul className="cart-lines">
                  {lines.map((line) => (
                    <li key={line.id}>
                      <div className="cart-line">
                        <Link href={`/products/${line.handle}`} className="cart-line-img">
                          <SmartImg src={line.image} alt={line.title} />
                        </Link>
                        <div className="cart-line-body">
                          <div className="cart-line-info">
                            <Link href={`/products/${line.handle}`} className="cart-line-name">{line.title}</Link>
                            {line.variantTitle && <div className="cart-line-variant">{line.variantTitle}</div>}
                            <div className="cart-line-unit">£{line.price} {t.cart.each}</div>
                          </div>
                          <div className="cart-line-actions">
                            <div className="cart-line-price">£{(line.price * line.quantity).toFixed(2)}</div>
                            {line.quantity > 1 && <div className="cart-qty-static">×{line.quantity}</div>}
                            <button className="cart-line-remove" disabled={pending} onClick={() => removeItem(line.id)}>
                              {t.cart.remove}
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                <aside className="cart-summary">
                  <div className="cart-summary-row">
                    <span>{t.cart.subtotal}</span>
                    <span>£{cart?.subtotal.toFixed(2)}</span>
                  </div>
                  <p className="cart-summary-note">{t.cart.subtotalNote}</p>
                  {cart?.checkoutUrl && (
                    <a className="cart-checkout" href={cart.checkoutUrl}>{t.cart.checkout}</a>
                  )}
                </aside>
              </div>
            )}
          </div>
        </div>

      </main>
      <Footer />
    </>
  );
}
