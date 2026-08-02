"use client";

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
  return (
    <main className="acct-desktop">
      <div className="acct-window">

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
                  <div className="account-orders-empty">
                    <p style={{ marginBottom: "16px" }}>
                      Connexion via Google détectée.<br />
                      L&apos;historique des commandes est disponible<br />
                      avec un compte Lil&apos;OG.
                    </p>
                    <a href="/#drops" className="account-btn primary">
                      Voir le dernier drop →
                    </a>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="account-orders-empty">
                    <p style={{ marginBottom: "16px" }}>
                      Aucune commande pour le moment.<br />
                      Découvre nos dernières pièces.
                    </p>
                    <a href="/#drops" className="account-btn primary">
                      Voir le dernier drop →
                    </a>
                  </div>
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
          </div>
        </div>

        {/* Status bar */}
        <div className="account-win95-statusbar">
          <div className="account-status-cell">
            <span className="account-status-pink">●</span> Connecté
          </div>
          <div className="account-status-cell grow">{email}</div>
          <div className="account-status-cell">♛ Lil&apos;OG © 2025</div>
        </div>

      </div>
    </main>
  );
}
