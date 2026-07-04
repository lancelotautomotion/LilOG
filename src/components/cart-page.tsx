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

  const lines = cart?.lines ?? [];

  return (
    <>
      <Nav onMenu={() => setMenu(true)} forceSolid />
      <Drawer open={menu} onClose={() => setMenu(false)} />
      <main className="cart-page">
        <h1 className="cart-title">{t.cart.title}</h1>

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
      </main>
      <Footer />
    </>
  );
}
