import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { shopifyGetCustomerWithOrders } from "@/lib/shopify/customers";

export const metadata: Metadata = { title: "Mon compte — Lil'OG" };

function fmt(amount: string, currency: string) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency }).format(Number(amount));
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

function statusClass(s: string) {
  const l = s.toLowerCase();
  if (l === "fulfilled") return "fulfilled";
  if (l === "pending" || l === "unfulfilled") return "pending";
  if (l === "cancelled") return "cancelled";
  return "";
}

export default async function AccountPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const shopifyToken = (session as { shopifyToken?: string | null }).shopifyToken ?? null;

  const displayName = session.user?.name ?? session.user?.email ?? "Cliente";
  const firstName = displayName.split(" ")[0];
  const email = session.user?.email ?? "";

  const { customer, orders } = shopifyToken
    ? await shopifyGetCustomerWithOrders(shopifyToken)
    : { customer: null, orders: [] };

  const fullName = customer
    ? [customer.firstName, customer.lastName].filter(Boolean).join(" ") || displayName
    : displayName;

  return (
    <main className="account-desktop">
      <div className="account-win95">
        {/* Title bar */}
        <div className="account-win95-bar">
          <span className="account-win95-title">♛ Lil&apos;OG — Espace Client — {firstName}</span>
          <div className="account-win95-chrome">
            <span>_</span>
            <span>□</span>
            <a href="/" title="Retour à la boutique">×</a>
          </div>
        </div>

        {/* Toolbar */}
        <div className="account-win95-toolbar">
          <a href="/" className="account-toolbar-btn">🛍 Boutique</a>
          <a href="/account/orders" className="account-toolbar-btn">📦 Commandes</a>
          <a href="/account/edit" className="account-toolbar-btn">✏️ Modifier le profil</a>
          <div className="account-toolbar-sep" />
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button className="account-toolbar-btn danger" type="submit">🚪 Déconnexion</button>
          </form>
        </div>

        {/* Content */}
        <div className="account-win95-content">
          {/* Left — Profile */}
          <div className="account-panel">
            <div className="account-panel-bar">
              <span className="account-panel-title">👤 Mon profil</span>
            </div>
            <div className="account-panel-body">
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
                  <div className="account-field-value">Google OAuth</div>
                </div>
              )}
              <div style={{ marginTop: "auto", paddingTop: "8px", display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {shopifyToken && (
                  <a href="/account/edit" className="account-btn primary">✏️ Modifier</a>
                )}
                <a href="/account/orders" className="account-btn">📦 Commandes</a>
              </div>
            </div>
          </div>

          {/* Right — Orders */}
          <div className="account-panel">
            <div className="account-panel-bar">
              <span className="account-panel-title">📦 Dernières commandes</span>
              {orders.length > 0 && (
                <a href="/account/orders" style={{ fontFamily: "var(--mono)", fontSize: "0.56rem", color: "#fff", opacity: 0.8, textDecoration: "underline" }}>
                  Voir tout
                </a>
              )}
            </div>
            <div className="account-panel-body" style={{ padding: "8px" }}>
              {!shopifyToken ? (
                <p className="account-orders-empty">
                  Connexion via Google détectée.<br />
                  L&apos;historique des commandes nécessite<br />
                  un compte Lil&apos;OG.
                </p>
              ) : orders.length === 0 ? (
                <p className="account-orders-empty">
                  Aucune commande pour le moment.<br />
                  <a href="/" style={{ color: "#d4006e", fontFamily: "var(--mono)", fontSize: "0.68rem" }}>
                    Découvrir la boutique →
                  </a>
                </p>
              ) : (
                <div className="account-order-list">
                  {orders.map((order) => (
                    <a key={order.id} href={`/account/orders/${encodeURIComponent(order.id)}`} className="account-order-item">
                      <span className="account-order-num">{order.name}</span>
                      <span className="account-order-date">{fmtDate(order.processedAt)}</span>
                      <span className={`account-order-status ${statusClass(order.fulfillmentStatus)}`}>
                        {order.fulfillmentStatus}
                      </span>
                      <span className="account-order-price">
                        {fmt(order.currentTotalPrice.amount, order.currentTotalPrice.currencyCode)}
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
