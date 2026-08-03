"use client";

import { useState } from "react";
import Link from "next/link";
import { Nav } from "@/components/nav";
import { Drawer } from "@/components/drawer";
import { Footer } from "@/components/footer";
import { useWishlist } from "@/hooks/use-wishlist";

export function WishlistShell() {
  const [menu, setMenu] = useState(false);
  const { items, ready, remove } = useWishlist();

  return (
    <>
      <Nav onMenu={() => setMenu(true)} forceSolid />
      <Drawer open={menu} onClose={() => setMenu(false)} />
      <main className="acct-desktop">
        <div className="acct-window">
          <div className="account-win95-bar">
            <span className="account-win95-title">♥ Lil&apos;OG — Ma Wishlist</span>
            <div className="account-win95-chrome">
              <span>_</span>
              <span>□</span>
              <a href="/" title="Retour à la boutique">×</a>
            </div>
          </div>
          <div className="acct-toolbar">
            <a href="/" className="account-toolbar-btn">Boutique</a>
            <a href="/account" className="account-toolbar-btn">Mon compte</a>
            <a href="/cart" className="account-toolbar-btn">Panier</a>
          </div>
          <div style={{ padding: "20px" }}>
            {!ready ? null : items.length === 0 ? (
              <div className="account-orders-empty" style={{ padding: "60px 20px", textAlign: "center" }}>
                <div style={{ fontSize: "2rem", marginBottom: "12px" }}>💗</div>
                Aucune pièce dans ta wishlist.<br />
                <Link href="/" style={{ color: "#d4006e", fontFamily: "var(--mono)", fontSize: "0.68rem" }}>
                  Découvrir la boutique →
                </Link>
              </div>
            ) : (
              <div className="acct-wishlist-grid">
                {items.map((item) => (
                  <div key={item.handle} className="acct-wishlist-card">
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image} alt={item.title} className="acct-wishlist-img" />
                    ) : (
                      <div className="acct-wishlist-img-placeholder">🧥</div>
                    )}
                    <div className="acct-wishlist-info">
                      <div className="acct-wishlist-name">{item.title}</div>
                      <div className="acct-wishlist-price">{item.price} €</div>
                      <div className="acct-wishlist-actions">
                        <a href={`/products/${item.handle}`} className="acct-wishlist-view">
                          Voir →
                        </a>
                        <button
                          className="acct-wishlist-remove"
                          onClick={() => remove(item.handle)}
                          title="Retirer de la wishlist"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="account-win95-statusbar">
            <div className="account-status-cell">
              <span className="account-status-pink">●</span> Wishlist
            </div>
            {ready && items.length > 0 && (
              <div className="account-status-cell grow">♥ {items.length} pièce{items.length > 1 ? "s" : ""}</div>
            )}
            <div className="account-status-cell">♛ Lil&apos;OG © 2025</div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
