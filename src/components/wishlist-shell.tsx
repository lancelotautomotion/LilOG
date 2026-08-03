"use client";

import { useState } from "react";
import Link from "next/link";
import { Nav } from "@/components/nav";
import { Drawer } from "@/components/drawer";
import { Footer } from "@/components/footer";
import { useWishlist } from "@/hooks/use-wishlist";

const ROTATIONS = ["rotate-2", "-rotate-2", "rotate-1", "-rotate-3", "-rotate-1", "rotate-3"];
const TAPE_ROT = ["-3deg", "2deg", "-1.5deg", "3deg", "1deg", "-2.5deg"];

const NOTES = [
  { text: "So fetch! →", rot: "-rotate-12" },
  { text: "★ Luv it <3", rot: "rotate-6" },
  { text: "Need !!! ♡", rot: "rotate-3" },
  { text: "✦ Obsessed.", rot: "-rotate-6" },
];

export function WishlistShell() {
  const [menu, setMenu] = useState(false);
  const { items, ready, remove } = useWishlist();

  return (
    <>
      <Nav onMenu={() => setMenu(true)} forceSolid />
      <Drawer open={menu} onClose={() => setMenu(false)} />
      <main className="acct-desktop">
        <div className="acct-window">
          <div className="account-win95-bar burnbook-bar">
            <span className="account-win95-title">DOSSIER_CRUSH.EXE</span>
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
          <div className="burnbook-body">
            {!ready ? null : items.length === 0 ? (
              <div className="burnbook-empty">
                <p className="burnbook-empty-text">
                  ⚠️ Erreur 404 : Ugh, as if! Ta wishlist est aussi vide que le cœur de Regina George.
                </p>
                <Link href="/" className="account-btn primary acct-orders-cta-btn">
                  RETOURNER_SHOPPER.EXE →
                </Link>
              </div>
            ) : (
              <div className="burnbook-grid">
                {items.map((item, i) => {
                  const note = NOTES[i % NOTES.length];
                  return (
                    <div key={item.handle} className={`burnbook-polaroid ${ROTATIONS[i % ROTATIONS.length]}`}>
                      <div
                        className="burnbook-tape"
                        style={{ "--tape-rot": TAPE_ROT[i % TAPE_ROT.length] } as React.CSSProperties}
                      />
                      <span className={`burnbook-note ${note.rot}`}>{note.text}</span>
                      <button
                        className="burnbook-remove"
                        onClick={() => remove(item.handle)}
                        title="Retirer de la wishlist"
                        aria-label="Retirer de la wishlist"
                      >
                        💔
                      </button>
                      <Link href={`/products/${item.handle}`} className="burnbook-img-wrap">
                        {item.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.image} alt={item.title} className="burnbook-img" />
                        ) : (
                          <div className="burnbook-img-placeholder">🧥</div>
                        )}
                      </Link>
                      <div className="burnbook-title">{item.title}</div>
                      <div className="burnbook-price">{item.price} €</div>
                      <Link
                        href={`/products/${item.handle}`}
                        className="account-btn primary burnbook-cart-btn"
                      >
                        GET IN LOSER →
                      </Link>
                    </div>
                  );
                })}
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
