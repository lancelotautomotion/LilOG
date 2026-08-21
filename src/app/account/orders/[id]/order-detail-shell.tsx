"use client";

/* ============================================================
   Coquille client de /account/orders/[id]
   ------------------------------------------------------------
   Même découpage que /account/edit : la page (serveur) récupère
   la commande, cette coquille (client) porte l'état du menu et
   encadre le contenu avec la Nav, le Drawer et le pied de page
   communs au reste du site — absents jusqu'ici de cette page.
   ============================================================ */

import { useState } from "react";
import { Nav } from "@/components/nav";
import { Drawer } from "@/components/drawer";
import { Footer } from "@/components/footer";
import { SmartImg } from "@/components/smart-img";
import type { ShopifyOrder } from "@/lib/shopify/customers";

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

/* Statut de paiement (OrderFinancialStatus). Les 7 valeurs de l'énum sont
   couvertes : sans traduction, Shopify renvoie le libellé brut en anglais
   (« PAID ») au milieu d'une page en français. */
function paymentLabel(s: string) {
  const map: Record<string, string> = {
    PAID: "Payé",
    PENDING: "En attente",
    AUTHORIZED: "Autorisé",
    PARTIALLY_PAID: "Partiellement payé",
    PARTIALLY_REFUNDED: "Partiellement remboursé",
    REFUNDED: "Remboursé",
    VOIDED: "Annulé",
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

/* ============================================================
   Suivi du colis
   ------------------------------------------------------------
   Une commande peut avoir plusieurs expéditions, chacune avec
   plusieurs numéros de suivi : on aplatit le tout en une liste
   de lignes « transporteur + numéro + lien ».
   ============================================================ */
interface Tracking {
  company: string | null;
  number: string | null;
  url: string | null;
}

function trackingsOf(order: ShopifyOrder): Tracking[] {
  return (order.successfulFulfillments ?? []).flatMap((f) =>
    f.trackingInfo.map((t) => ({
      company: f.trackingCompany,
      number: t.number,
      url: t.url,
    })),
  );
}

export function OrderDetailShell({ order }: { order: ShopifyOrder }) {
  const [menu, setMenu] = useState(false);

  const items = order.lineItems.edges.map((e) => e.node);
  const trackings = trackingsOf(order);
  /* Le panneau s'affiche dès qu'il y a quelque chose à suivre : un numéro
     de suivi, ou — commande expédiée sans tracking renseigné — la page de
     suivi Shopify, qui existe toujours. */
  const shipped = statusClass(order.fulfillmentStatus) === "fulfilled"
    || order.fulfillmentStatus.toUpperCase() === "PARTIALLY_FULFILLED";
  const showTracking = trackings.length > 0 || (shipped && !!order.statusUrl);

  return (
    <>
      <Nav onMenu={() => setMenu(true)} forceSolid />
      <Drawer open={menu} onClose={() => setMenu(false)} />

      <main className="account-desktop account-desktop--leo">
        <div className="account-win95 account-win95--wide">
          {/* Title bar */}
          <div className="account-win95-bar">
            <span className="account-win95-title">♛ Lil&apos;OG · Commande {order.name}</span>
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
                      <span className={`account-order-status ${statusClass(order.fulfillmentStatus)}`} style={{ fontSize: "0.8125rem" }}>
                        {statusLabel(order.fulfillmentStatus)}
                      </span>
                    </div>
                  </div>
                  <div className="account-field">
                    <span className="account-field-label">Statut paiement</span>
                    {/* Capitales, comme le badge « EXPÉDIÉ » juste à côté :
                        ce champ-là n'a pas le text-transform du badge. */}
                    <div className="account-field-value" style={{ textTransform: "uppercase" }}>
                      {paymentLabel(order.financialStatus)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Suivi du colis : uniquement une fois la commande expédiée */}
            {showTracking && (
              <div className="account-panel">
                <div className="account-panel-bar">
                  <span className="account-panel-title">🚚 Suivi du colis</span>
                </div>
                <div className="account-panel-body">
                  <div className="acct-tracking-list">
                    {trackings.map((t, i) => (
                      <div key={i} className="acct-tracking-row">
                        <div className="acct-tracking-info">
                          {t.company && <span className="acct-tracking-company">{t.company}</span>}
                          {t.number && <span className="acct-tracking-number">{t.number}</span>}
                        </div>
                        {t.url && (
                          <a
                            href={t.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="account-btn primary"
                          >
                            <span>✦</span> Suivre mon colis →
                          </a>
                        )}
                      </div>
                    ))}

                    {/* Repli : expédiée mais aucun lien transporteur */}
                    {!trackings.some((t) => t.url) && order.statusUrl && (
                      <div className="acct-tracking-row">
                        <div className="acct-tracking-info">
                          <span className="acct-tracking-company">Page de suivi Lil&apos;OG</span>
                        </div>
                        <a
                          href={order.statusUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="account-btn primary"
                        >
                          <span>✦</span> Suivre ma commande →
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Articles */}
            <div className="account-panel">
              <div className="account-panel-bar">
                <span className="account-panel-title">🛍 Articles commandés ({items.length})</span>
              </div>
              <div style={{ padding: "0" }}>
                {items.map((item, i) => (
                  <div key={i} className="account-detail-row">
                    {item.variant?.image?.url ? (
                      <SmartImg
                        src={item.variant.image.url}
                        alt={item.variant.image.altText ?? item.title}
                        className="account-detail-img"
                      />
                    ) : (
                      <div className="account-detail-img" style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem" }}>
                        🧥
                      </div>
                    )}
                    <div className="account-detail-name">
                      {item.title}
                      {item.variant?.title && item.variant.title !== "Default Title" && (
                        <div style={{ fontSize: "0.875rem", color: "#555", marginTop: "2px" }}>
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
            <div className="acct-detail-bottom">
              {/* Totals */}
              <div className="account-panel">
                <div className="account-panel-bar">
                  <span className="account-panel-title">💰 Montants</span>
                </div>
                <div className="account-panel-body">
                  {order.subtotalPrice && (
                    <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--mono)", fontSize: "0.875rem" }}>
                      <span style={{ color: "#555" }}>Sous-total</span>
                      <span>{fmt(order.subtotalPrice.amount, order.subtotalPrice.currencyCode)}</span>
                    </div>
                  )}
                  {order.totalShippingPrice && (
                    <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--mono)", fontSize: "0.875rem" }}>
                      <span style={{ color: "#555" }}>Livraison</span>
                      <span>{fmt(order.totalShippingPrice.amount, order.totalShippingPrice.currencyCode)}</span>
                    </div>
                  )}
                  <div style={{
                    display: "flex", justifyContent: "space-between",
                    fontFamily: "var(--mono)", fontSize: "0.9375rem", fontWeight: 700,
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
                  <div className="account-panel-body" style={{ fontFamily: "var(--mono)", fontSize: "0.875rem", lineHeight: 1.6, color: "#000" }}>
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

      <Footer />
    </>
  );
}
