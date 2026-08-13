import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import type { Metadata } from "next";
import { shopifyGetCustomerOrder } from "@/lib/shopify/customers";
import Image from "next/image";

export const metadata: Metadata = { title: "Détail commande · Lil'OG" };

function fmt(amount: string, currency: string) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency }).format(Number(amount));
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    weekday: "long", day: "2-digit", month: "long", year: "numeric",
  });
}

function statusLabel(s: string) {
  const map: Record<string, string> = {
    FULFILLED: "Expédié",
    UNFULFILLED: "En préparation",
    PARTIALLY_FULFILLED: "Partiellement expédié",
    PENDING: "En attente",
    CANCELLED: "Annulé",
  };
  return map[s.toUpperCase()] ?? s;
}

function statusClass(s: string) {
  const l = s.toLowerCase();
  if (l === "fulfilled") return "fulfilled";
  if (l === "pending" || l === "unfulfilled") return "pending";
  if (l === "cancelled") return "cancelled";
  return "";
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) redirect("/login");

  const shopifyToken = (session as { shopifyToken?: string | null }).shopifyToken ?? null;
  if (!shopifyToken) redirect("/account");

  const { id } = await params;
  const order = await shopifyGetCustomerOrder(shopifyToken, decodeURIComponent(id));
  if (!order) notFound();

  const items = order.lineItems.edges.map((e) => e.node);

  return (
    <main className="account-desktop">
      <div className="account-win95">
        {/* Title bar */}
        <div className="account-win95-bar">
          <span className="account-win95-title">♛ Lil&apos;OG · Commande {order.name}</span>
          <div className="account-win95-chrome">
            <span>_</span>
            <span>□</span>
            <a href="/account/orders" title="Fermer">×</a>
          </div>
        </div>

        {/* Toolbar */}
        <div className="account-win95-toolbar">
          <a href="/account/orders" className="account-toolbar-btn">← Retour</a>
          <div className="account-toolbar-sep" />
          <a href="/account" className="account-toolbar-btn">Mon compte</a>
        </div>

        {/* Content */}
        <div className="account-win95-full-content">
          {/* Summary panel */}
          <div className="account-panel">
            <div className="account-panel-bar">
              <span className="account-panel-title">ℹ️ Récapitulatif</span>
            </div>
            <div className="account-panel-body">
              <div className="account-info-grid">
                <div className="account-field">
                  <span className="account-field-label">Numéro</span>
                  <div className="account-field-value">{order.name}</div>
                </div>
                <div className="account-field">
                  <span className="account-field-label">Date</span>
                  <div className="account-field-value">{fmtDate(order.processedAt)}</div>
                </div>
                <div className="account-field">
                  <span className="account-field-label">Statut livraison</span>
                  <div className="account-field-value">
                    <span className={`account-order-status ${statusClass(order.fulfillmentStatus)}`} style={{ fontSize: "0.6rem" }}>
                      {statusLabel(order.fulfillmentStatus)}
                    </span>
                  </div>
                </div>
                <div className="account-field">
                  <span className="account-field-label">Statut paiement</span>
                  <div className="account-field-value">{order.financialStatus}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Articles */}
          <div className="account-panel">
            <div className="account-panel-bar">
              <span className="account-panel-title">🛍 Articles commandés ({items.length})</span>
            </div>
            <div style={{ padding: "0" }}>
              {items.map((item, i) => (
                <div key={i} className="account-detail-row">
                  {item.variant?.image?.url ? (
                    <Image
                      src={item.variant.image.url}
                      alt={item.variant.image.altText ?? item.title}
                      width={40}
                      height={52}
                      className="account-detail-img"
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    <div className="account-detail-img" style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>
                      🧥
                    </div>
                  )}
                  <div className="account-detail-name">
                    {item.title}
                    {item.variant?.title && item.variant.title !== "Default Title" && (
                      <div style={{ fontSize: "0.62rem", color: "#555", marginTop: "2px" }}>
                        {item.variant.title}
                      </div>
                    )}
                  </div>
                  <span className="account-detail-qty">×{item.quantity}</span>
                  {item.originalTotalPrice && (
                    <span className="account-detail-price">
                      {fmt(item.originalTotalPrice.amount, item.originalTotalPrice.currencyCode)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Totals + address */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            {/* Totals */}
            <div className="account-panel">
              <div className="account-panel-bar">
                <span className="account-panel-title">💰 Montants</span>
              </div>
              <div className="account-panel-body">
                {order.subtotalPrice && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--mono)", fontSize: "0.7rem" }}>
                    <span style={{ color: "#555" }}>Sous-total</span>
                    <span>{fmt(order.subtotalPrice.amount, order.subtotalPrice.currencyCode)}</span>
                  </div>
                )}
                {order.totalShippingPrice && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--mono)", fontSize: "0.7rem" }}>
                    <span style={{ color: "#555" }}>Livraison</span>
                    <span>{fmt(order.totalShippingPrice.amount, order.totalShippingPrice.currencyCode)}</span>
                  </div>
                )}
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  fontFamily: "var(--mono)", fontSize: "0.78rem", fontWeight: 700,
                  paddingTop: "6px", borderTop: "1px solid #888", marginTop: "4px",
                }}>
                  <span>Total</span>
                  <span style={{ color: "#d4006e" }}>
                    {fmt(order.currentTotalPrice.amount, order.currentTotalPrice.currencyCode)}
                  </span>
                </div>
              </div>
            </div>

            {/* Address */}
            {order.shippingAddress && (
              <div className="account-panel">
                <div className="account-panel-bar">
                  <span className="account-panel-title">📍 Livraison</span>
                </div>
                <div className="account-panel-body" style={{ fontFamily: "var(--mono)", fontSize: "0.7rem", lineHeight: 1.6, color: "#000" }}>
                  <div>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</div>
                  <div>{order.shippingAddress.address1}</div>
                  {order.shippingAddress.address2 && <div>{order.shippingAddress.address2}</div>}
                  <div>{order.shippingAddress.zip} {order.shippingAddress.city}</div>
                  <div>{order.shippingAddress.country}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Status bar */}
        <div className="account-win95-statusbar">
          <div className="account-status-cell">{order.name}</div>
          <div className="account-status-cell grow">{statusLabel(order.fulfillmentStatus)}</div>
          <div className="account-status-cell">♛ Lil&apos;OG © 2025</div>
        </div>
      </div>
    </main>
  );
}
