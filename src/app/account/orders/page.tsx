import { auth } from "@/auth";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { shopifyGetCustomerOrders } from "@/lib/shopify/customers";

export const metadata: Metadata = { title: "Mes commandes · Lil'OG" };

function fmt(amount: string, currency: string) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency }).format(Number(amount));
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

function statusLabel(s: string) {
  const map: Record<string, string> = {
    FULFILLED: "Expédié",
    UNFULFILLED: "En préparation",
    PARTIALLY_FULFILLED: "Partiel",
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

export default async function OrdersPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const shopifyToken = (session as { shopifyToken?: string | null }).shopifyToken ?? null;
  if (!shopifyToken) redirect("/account");

  const { orders, hasNextPage } = await shopifyGetCustomerOrders(shopifyToken);

  return (
    <main className="account-desktop">
      <div className="account-win95">
        {/* Title bar */}
        <div className="account-win95-bar">
          <span className="account-win95-title">♛ Lil&apos;OG · Historique des commandes</span>
          <div className="account-win95-chrome">
            <span>_</span>
            <span>□</span>
            <a href="/account" title="Fermer">×</a>
          </div>
        </div>

        {/* Toolbar */}
        <div className="account-win95-toolbar">
          <a href="/account" className="account-toolbar-btn">← Retour</a>
          <div className="account-toolbar-sep" />
          <a href="/" className="account-toolbar-btn">🛍 Boutique</a>
        </div>

        {/* Content */}
        <div className="account-win95-full-content">
          <div className="account-panel">
            <div className="account-panel-bar">
              <span className="account-panel-title">
                📦 {orders.length} commande{orders.length !== 1 ? "s" : ""}
                {hasNextPage ? " (20 dernières)" : ""}
              </span>
            </div>
            <div className="account-panel-body" style={{ padding: "8px" }}>
              {orders.length === 0 ? (
                <p className="account-orders-empty">
                  Aucune commande pour le moment.<br />
                  <a href="/" style={{ color: "#d4006e", fontFamily: "var(--mono)", fontSize: "0.68rem" }}>
                    Découvrir la boutique →
                  </a>
                </p>
              ) : (
                <div className="account-order-list">
                  {/* Header row */}
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 100px 100px 90px 80px",
                    gap: "8px",
                    padding: "4px 10px",
                    fontFamily: "var(--mono)",
                    fontSize: "0.58rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "#555",
                    borderBottom: "1px solid #888",
                  }}>
                    <span>Commande</span>
                    <span>Date</span>
                    <span>Statut</span>
                    <span>Total</span>
                    <span></span>
                  </div>
                  {orders.map((order) => (
                    <a
                      key={order.id}
                      href={`/account/orders/${encodeURIComponent(order.id)}`}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 100px 100px 90px 80px",
                        gap: "8px",
                        alignItems: "center",
                      }}
                      className="account-order-item"
                    >
                      <span className="account-order-num">{order.name}</span>
                      <span className="account-order-date">{fmtDate(order.processedAt)}</span>
                      <span className={`account-order-status ${statusClass(order.fulfillmentStatus)}`}>
                        {statusLabel(order.fulfillmentStatus)}
                      </span>
                      <span className="account-order-price">
                        {fmt(order.currentTotalPrice.amount, order.currentTotalPrice.currencyCode)}
                      </span>
                      <span style={{ fontFamily: "var(--mono)", fontSize: "0.6rem", color: "#000080", textDecoration: "underline" }}>
                        Détail →
                      </span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status bar */}
        <div className="account-win95-statusbar">
          <div className="account-status-cell">{orders.length} résultat(s)</div>
          <div className="account-status-cell grow"></div>
          <div className="account-status-cell">♛ Lil&apos;OG © 2025</div>
        </div>
      </div>
    </main>
  );
}
