"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { useWishlist } from "@/hooks/use-wishlist";
import type { ShopifyCustomer, ShopifyOrder } from "@/lib/shopify/customers";

function fmt(amount: string, currency: string) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency }).format(Number(amount));
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

const STATUS_MAP: Record<string, { label: string; icon: string; cls: string }> = {
  FULFILLED:           { label: "Livrée",         icon: "♥", cls: "fulfilled" },
  UNFULFILLED:         { label: "En préparation",  icon: "✦", cls: "pending"   },
  PARTIALLY_FULFILLED: { label: "Partiel",         icon: "≈", cls: "partial"   },
  PENDING:             { label: "En attente",      icon: "⟳", cls: "pending"   },
  CANCELLED:           { label: "Annulée",         icon: "✕", cls: "cancelled" },
};

function statusInfo(s: string) {
  return STATUS_MAP[s.toUpperCase()] ?? { label: s, icon: "·", cls: "" };
}

type Tab = "dashboard" | "wishlist";

export function AccountDashboard({
  customer,
  orders,
  email,
  firstName,
  fullName,
  shopifyToken,
}: {
  customer: ShopifyCustomer | null;
  orders: ShopifyOrder[];
  email: string;
  firstName: string;
  fullName: string;
  shopifyToken: string | null;
}) {
  const [tab, setTab] = useState<Tab>("dashboard");
  const { items: wishlist, remove, ready } = useWishlist();

  return (
    <main className="acct-desktop">
      <div className="acct-window">

        {/* Title bar */}
        <div className="account-win95-bar">
          <span className="account-win95-title">♛ Lil&apos;OG — Espace Cliente — {firstName}</span>
          <div className="account-win95-chrome">
            <span>_</span>
            <span>□</span>
            <a href="/" title="Retour à la boutique">×</a>
          </div>
        </div>

        {/* Toolbar */}
        <div className="acct-toolbar">
          <a href="/" className="account-toolbar-btn">Boutique</a>
          <a href="/account/orders" className="account-toolbar-btn">Commandes</a>
          {shopifyToken && <a href="/account/edit" className="account-toolbar-btn">Modifier le profil</a>}
          <div className="account-toolbar-sep" />
          <button
            className="account-toolbar-btn danger"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            Déconnexion
          </button>
        </div>

        {/* Tab bar */}
        <div className="acct-tabbar">
          <button
            className={"acct-tab" + (tab === "dashboard" ? " active" : "")}
            onClick={() => setTab("dashboard")}
          >
            Dashboard
          </button>
          <button
            className={"acct-tab" + (tab === "wishlist" ? " active" : "")}
            onClick={() => setTab("wishlist")}
          >
            ♥ Wishlist{ready && wishlist.length > 0 && ` (${wishlist.length})`}
          </button>
        </div>

        {/* Body */}
        <div className="acct-body">

          {/* Left column */}
          <div className="acct-col">

            {/* Profile panel */}
            <div className="account-panel">
              <div className="account-panel-bar">
                <span className="account-panel-title">👤 Mon profil</span>
              </div>
              <div className="account-panel-body">
                {/* Avatar */}
                <div className="acct-avatar">
                  {firstName.charAt(0).toUpperCase()}
                </div>

                <div className="account-field">
                  <span className="account-field-label">Nom complet</span>
                  <div className="account-field-value">{fullName}</div>
                </div>
                <div className="account-field">
                  <span className="account-field-label">Email</span>
                  <div className="account-field-value">{email}</div>
                </div>
                {customer?.phone && (
                  <div className="account-field">
                    <span className="account-field-label">Téléphone</span>
                    <div className="account-field-value">{customer.phone}</div>
                  </div>
                )}
                {!shopifyToken && (
                  <div className="account-field">
                    <span className="account-field-label">Compte</span>
                    <div className="account-field-value" style={{ color: "#555" }}>Google OAuth</div>
                  </div>
                )}
                {shopifyToken && (
                  <a href="/account/edit" className="account-btn primary" style={{ marginTop: "4px" }}>
                    ✏️ Modifier le profil
                  </a>
                )}
              </div>
            </div>

            {/* HEY BABE! */}
            <div className="acct-hey-babe">
              <div className="acct-hey-babe-icon">💗</div>
              <div className="acct-hey-babe-body">
                <div className="acct-hey-babe-title">Hey babe !</div>
                <p className="acct-hey-babe-text">
                  Ajoute des pièces à ta wishlist avec le ♥ sur les fiches produit.
                  Garde tes infos à jour pour une expérience 100% smooth. ✦
                </p>
              </div>
            </div>

          </div>

          {/* Right column */}
          <div className="acct-col">

            {tab === "dashboard" && (
              <div className="account-panel" style={{ flex: 1 }}>
                <div className="account-panel-bar">
                  <span className="account-panel-title">
                    📦 Dernières commandes
                  </span>
                  {orders.length > 0 && (
                    <a href="/account/orders" style={{ fontFamily: "var(--mono)", fontSize: "0.54rem", color: "#fff", opacity: 0.8, textDecoration: "underline" }}>
                      Voir tout
                    </a>
                  )}
                </div>
                <div className="account-panel-body" style={{ padding: "8px", flex: 1 }}>
                  {!shopifyToken ? (
                    <p className="account-orders-empty">
                      Connexion via Google détectée.<br />
                      L&apos;historique des commandes est disponible<br />
                      avec un compte Lil&apos;OG.
                    </p>
                  ) : orders.length === 0 ? (
                    <p className="account-orders-empty">
                      Aucune commande pour le moment.<br />
                      <a href="/" style={{ color: "#d4006e", fontFamily: "var(--mono)", fontSize: "0.68rem" }}>
                        Découvrir la boutique →
                      </a>
                    </p>
                  ) : (
                    <table className="acct-order-table">
                      <thead>
                        <tr>
                          <th>N° Commande</th>
                          <th>Date</th>
                          <th>Statut</th>
                          <th>Total</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => {
                          const st = statusInfo(order.fulfillmentStatus);
                          return (
                            <tr key={order.id}>
                              <td>
                                <span style={{ fontFamily: "var(--mono)", fontWeight: 700, color: "#000080", fontSize: "0.66rem" }}>
                                  {order.name}
                                </span>
                              </td>
                              <td style={{ color: "#555", fontSize: "0.62rem" }}>{fmtDate(order.processedAt)}</td>
                              <td>
                                <span className={`acct-badge acct-badge-${st.cls}`}>
                                  {st.icon} {st.label}
                                </span>
                              </td>
                              <td style={{ fontWeight: 700, color: "#d4006e", fontFamily: "var(--mono)", fontSize: "0.68rem" }}>
                                {fmt(order.currentTotalPrice.amount, order.currentTotalPrice.currencyCode)}
                              </td>
                              <td>
                                <a
                                  href={`/account/orders/${encodeURIComponent(order.id)}`}
                                  className="acct-see-btn"
                                >
                                  Voir →
                                </a>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                  {orders.length > 0 && (
                    <div style={{ paddingTop: "10px", display: "flex", justifyContent: "center" }}>
                      <a href="/account/orders" className="account-btn">
                        📦 Voir toutes mes commandes →
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {tab === "wishlist" && (
              <div className="account-panel" style={{ flex: 1 }}>
                <div className="account-panel-bar">
                  <span className="account-panel-title">♥ Ma wishlist</span>
                </div>
                {!ready || wishlist.length === 0 ? (
                  <div className="account-orders-empty" style={{ padding: "40px 20px" }}>
                    <div style={{ fontSize: "2rem", marginBottom: "10px" }}>💗</div>
                    Aucune pièce dans ta wishlist.<br />
                    <span style={{ color: "#d4006e" }}>
                      Ajoute des pépites avec ♥ sur les fiches produit.
                    </span>
                  </div>
                ) : (
                  <div className="acct-wishlist-grid">
                    {wishlist.map((item) => (
                      <div key={item.handle} className="acct-wishlist-card">
                        {item.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.image}
                            alt={item.title}
                            className="acct-wishlist-img"
                          />
                        ) : (
                          <div className="acct-wishlist-img-placeholder">🧥</div>
                        )}
                        <div className="acct-wishlist-info">
                          <div className="acct-wishlist-name">{item.title}</div>
                          <div className="acct-wishlist-price">{item.price} €</div>
                          <div className="acct-wishlist-actions">
                            <a
                              href={`/products/${item.handle}`}
                              className="acct-wishlist-view"
                            >
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
            )}

          </div>
        </div>

        {/* Status bar */}
        <div className="account-win95-statusbar">
          <div className="account-status-cell">
            <span className="account-status-pink">●</span> Connecté
          </div>
          <div className="account-status-cell grow">{email}</div>
          {ready && wishlist.length > 0 && (
            <div className="account-status-cell">♥ {wishlist.length} wishlist</div>
          )}
          <div className="account-status-cell">♛ Lil&apos;OG © 2025</div>
        </div>

      </div>
    </main>
  );
}
