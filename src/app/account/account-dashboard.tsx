"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import type { ShopifyCustomer, ShopifyOrder, ShopifyAddress, AddressInput } from "@/lib/shopify/customers";
import { actionCreateAddress, actionUpdateAddress, actionDeleteAddress, actionSetDefaultAddress } from "./address-actions";
import { MsnProfile } from "./msn-profile";

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

const COUNTRIES = [
  { label: "France",          value: "France" },
  { label: "Belgique",        value: "Belgium" },
  { label: "Suisse",          value: "Switzerland" },
  { label: "Luxembourg",      value: "Luxembourg" },
  { label: "Monaco",          value: "Monaco" },
  { label: "Allemagne",       value: "Germany" },
  { label: "Italie",          value: "Italy" },
  { label: "Espagne",         value: "Spain" },
  { label: "Portugal",        value: "Portugal" },
  { label: "Pays-Bas",        value: "Netherlands" },
  { label: "Royaume-Uni",     value: "United Kingdom" },
  { label: "Canada",          value: "Canada" },
  { label: "États-Unis",      value: "United States" },
];

const EMPTY_ADDR: AddressInput = {
  firstName: "", lastName: "", address1: "", address2: "",
  city: "", province: "", zip: "", country: "France", phone: "",
};

/* Decorative chrome buttons for sub-panels */
function PanelChrome() {
  return (
    <div className="acct-panel-chrome">
      <span>_</span>
      <span>□</span>
      <span>×</span>
    </div>
  );
}

export function AccountDashboard({
  customer,
  orders,
  email,
  firstName,
  fullName,
  shopifyToken,
  initialAddresses,
  initialDefaultAddressId,
}: {
  customer: ShopifyCustomer | null;
  orders: ShopifyOrder[];
  email: string;
  firstName: string;
  fullName: string;
  shopifyToken: string | null;
  initialAddresses: ShopifyAddress[];
  initialDefaultAddressId: string | null;
}) {
  const [section, setSection]             = useState<"orders" | "addresses">("orders");
  const [addrView, setAddrView]           = useState<"list" | "form">("list");
  const [addresses, setAddresses]         = useState<ShopifyAddress[]>(initialAddresses);
  const [defaultAddrId, setDefaultAddrId] = useState<string | null>(initialDefaultAddressId);
  const [editingId, setEditingId]         = useState<string | null>(null);
  const [formData, setFormData]           = useState<AddressInput>(EMPTY_ADDR);
  const [formError, setFormError]         = useState<string | null>(null);
  const [saving, setSaving]               = useState(false);

  function openNew() {
    setFormData(EMPTY_ADDR);
    setEditingId(null);
    setFormError(null);
    setSection("addresses");
    setAddrView("form");
  }

  function openEdit(addr: ShopifyAddress) {
    setFormData({
      firstName: addr.firstName,   lastName: addr.lastName,
      address1:  addr.address1,    address2: addr.address2  ?? "",
      city:      addr.city,        province: addr.province  ?? "",
      zip:       addr.zip,         country:  addr.country,
      phone:     addr.phone ?? "",
    });
    setEditingId(addr.id);
    setFormError(null);
    setSection("addresses");
    setAddrView("form");
  }

  function cancelForm() {
    setAddrView("list");
    setEditingId(null);
    setFormError(null);
  }

  async function handleSave() {
    setSaving(true);
    setFormError(null);
    const input: AddressInput = {
      firstName: formData.firstName,
      lastName:  formData.lastName,
      address1:  formData.address1,
      city:      formData.city,
      zip:       formData.zip,
      country:   formData.country,
      ...(formData.address2 && { address2: formData.address2 }),
      ...(formData.province  && { province: formData.province }),
      ...(formData.phone     && { phone:    formData.phone    }),
    };
    try {
      if (editingId) {
        const res = await actionUpdateAddress(editingId, input);
        if (res.error) { setFormError(res.error); return; }
        if (res.address) setAddresses(prev => prev.map(a => a.id === editingId ? res.address! : a));
      } else {
        const res = await actionCreateAddress(input);
        if (res.error) { setFormError(res.error); return; }
        if (res.address) {
          const isFirst = addresses.length === 0;
          setAddresses(prev => [...prev, res.address!]);
          if (isFirst) setDefaultAddrId(res.address.id);
        }
      }
      setAddrView("list");
    } finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    const res = await actionDeleteAddress(id);
    if (!res.error) {
      setAddresses(prev => {
        const next = prev.filter(a => a.id !== id);
        if (defaultAddrId === id) setDefaultAddrId(next[0]?.id ?? null);
        return next;
      });
    }
  }

  async function handleSetDefault(id: string) {
    const res = await actionSetDefaultAddress(id);
    if (!res.error) setDefaultAddrId(id);
  }

  function fld(key: keyof AddressInput, label: string) {
    return (
      <div className="acct-addr-form-group">
        <label className="acct-addr-form-label">{label}</label>
        <input
          className="acct-addr-form-input"
          value={(formData[key] as string) ?? ""}
          onChange={e => setFormData(prev => ({ ...prev, [key]: e.target.value }))}
        />
      </div>
    );
  }

  return (
    <main className="acct-desktop">
      <div className="acct-window">

        {/* ── Title bar ─────────────────────────────────────── */}
        <div className="account-win95-bar">
          <span className="account-win95-title">♛ Lil&apos;OG — Espace Client</span>
          <div className="account-win95-chrome">
            <span>_</span>
            <span>□</span>
            <a href="/" title="Retour à la boutique">×</a>
          </div>
        </div>

        {/* ── Toolbar ───────────────────────────────────────── */}
        <div className="acct-toolbar">
          <a href="/wishlist" className="account-toolbar-btn">♥ Wishlist</a>
          {shopifyToken && <a href="/account/edit" className="account-toolbar-btn">Modifier le profil</a>}
          <div className="account-toolbar-sep" />
          <button className="account-toolbar-btn danger" onClick={() => signOut({ callbackUrl: "/" })}>
            Déconnexion
          </button>
        </div>

        {/* ── Body ──────────────────────────────────────────── */}
        <div className="acct-body">

          {/* ── Left column ───────────────────────────────────── */}
          <div className="acct-col">

            {/* MSN Profile */}
            <MsnProfile
              firstName={firstName}
              fullName={fullName}
              email={email}
              shopifyToken={shopifyToken}
            />

            {/* Navigation — bascule le contenu de la fenêtre de droite */}
            <div className="acct-nav-panel">
              <button
                className={"acct-nav-btn" + (section === "orders" ? " active" : "")}
                onClick={() => setSection("orders")}
              >
                📦 Mes commandes
              </button>
              <button
                className={"acct-nav-btn" + (section === "addresses" ? " active" : "")}
                onClick={() => { setSection("addresses"); setAddrView("list"); }}
              >
                📖 My city contacts
              </button>
            </div>

          </div>

          {/* ── Right column ──────────────────────────────────── */}
          <div className="acct-col">
            <div className="account-panel" style={{ flex: 1, display: "flex", flexDirection: "column" }}>

              {section === "orders" && (
                shopifyToken ? (
                  <>
                    <div className="account-panel-bar">
                      <span className="account-panel-title">📦 Dernières commandes</span>
                      {orders.length > 0 && (
                        <a href="/account/orders" style={{ fontFamily: "var(--mono)", fontSize: "0.54rem", color: "#fff", opacity: 0.8, textDecoration: "underline" }}>
                          Voir tout
                        </a>
                      )}
                      <PanelChrome />
                    </div>
                    <div className="account-panel-body" style={{ padding: "8px", flex: 1 }}>
                      {orders.length === 0 ? (
                        <div className="account-orders-empty acct-orders-cta">
                          <p className="acct-orders-cta-text">
                            ⚠️ Alerte style : Get in, babe.<br />
                            Ta première pépite t&apos;attend déjà.
                          </p>
                          <a href="/#drops" className="account-btn primary acct-orders-cta-btn">SETUP_MY_LOOK.EXE →</a>
                        </div>
                      ) : (
                        <>
                          <table className="acct-order-table">
                            <thead>
                              <tr>
                                <th>N° Commande</th><th>Date</th><th>Statut</th><th>Total</th><th></th>
                              </tr>
                            </thead>
                            <tbody>
                              {orders.map((order) => {
                                const st = statusInfo(order.fulfillmentStatus);
                                return (
                                  <tr key={order.id}>
                                    <td><span style={{ fontFamily: "var(--mono)", fontWeight: 700, color: "#000080", fontSize: "0.66rem" }}>{order.name}</span></td>
                                    <td style={{ color: "#555", fontSize: "0.62rem" }}>{fmtDate(order.processedAt)}</td>
                                    <td><span className={`acct-badge acct-badge-${st.cls}`}>{st.icon} {st.label}</span></td>
                                    <td style={{ fontWeight: 700, color: "#d4006e", fontFamily: "var(--mono)", fontSize: "0.68rem" }}>{fmt(order.currentTotalPrice.amount, order.currentTotalPrice.currencyCode)}</td>
                                    <td><a href={`/account/orders/${encodeURIComponent(order.id)}`} className="acct-see-btn">Voir →</a></td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                          <div style={{ paddingTop: "10px", display: "flex", justifyContent: "center" }}>
                            <a href="/account/orders" className="account-btn primary"><span>✦</span> Voir toutes mes commandes</a>
                          </div>
                        </>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="account-panel-bar">
                      <span className="account-panel-title">📦 Dernières commandes</span>
                      <PanelChrome />
                    </div>
                    <div className="account-panel-body" style={{ padding: "8px", flex: 1 }}>
                      <div className="account-orders-empty acct-orders-cta">
                        <p className="acct-orders-cta-text">
                          ⚠️ Alerte style : Get in, babe.<br />
                          Ta première pépite t&apos;attend déjà.
                        </p>
                        <a href="/#drops" className="account-btn primary acct-orders-cta-btn">SETUP_MY_LOOK.EXE →</a>
                      </div>
                    </div>
                  </>
                )
              )}

              {section === "addresses" && (
                !shopifyToken ? (
                  <>
                    <div className="account-panel-bar">
                      <span className="account-panel-title">📖 My City Contacts - Adresses</span>
                      <PanelChrome />
                    </div>
                    <div className="acct-addr-upsell">
                      <p className="acct-addr-upsell-text">
                        Crée un compte Lil&apos;OG pour enregistrer tes adresses de livraison et accélérer tes prochaines commandes.
                      </p>
                      <a href="/login" className="account-btn primary"><span>✦</span> Créer un compte</a>
                    </div>
                  </>
                ) : addrView === "form" ? (
                  <>
                    <div className="account-panel-bar">
                      <span className="account-panel-title">
                        📍 {editingId ? "Modifier l'adresse" : "Nouvelle adresse"}
                      </span>
                      <PanelChrome />
                    </div>
                    <div className="acct-addr-form">
                      <div className="acct-addr-form-grid">
                        {fld("firstName", "Prénom")}
                        {fld("lastName",  "Nom")}
                      </div>
                      {fld("address1", "Adresse")}
                      {fld("address2", "Complément (optionnel)")}
                      <div className="acct-addr-form-grid">
                        {fld("city", "Ville")}
                        {fld("zip",  "Code postal")}
                      </div>
                      <div className="acct-addr-form-grid">
                        <div className="acct-addr-form-group">
                          <label className="acct-addr-form-label">Pays</label>
                          <select
                            className="acct-addr-form-select"
                            value={formData.country}
                            onChange={e => setFormData(prev => ({ ...prev, country: e.target.value }))}
                          >
                            {COUNTRIES.map(c => (
                              <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                          </select>
                        </div>
                        {fld("phone", "Téléphone (optionnel)")}
                      </div>
                      {formError && <div className="acct-addr-form-error">{formError}</div>}
                      <div className="acct-addr-form-actions">
                        <button className="account-btn primary" onClick={handleSave} disabled={saving}>
                          <span>✦</span> {saving ? "Enregistrement…" : editingId ? "Mettre à jour" : "Enregistrer"}
                        </button>
                        <button className="account-btn" onClick={cancelForm}>Annuler</button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="account-panel-bar">
                      <span className="account-panel-title">📖 My City Contacts - Adresses</span>
                      <PanelChrome />
                    </div>
                    <div className="account-panel-body" style={{ padding: "10px", flex: 1 }}>
                      {addresses.length === 0 ? (
                        <div className="account-orders-empty">
                          <p style={{ marginBottom: "16px" }}>
                            Ton carnet d&apos;adresses est vide.<br />
                            Ajoute ta première adresse de livraison !
                          </p>
                          <button className="account-btn primary" onClick={openNew}>+ Ajouter une nouvelle adresse</button>
                        </div>
                      ) : (
                        <>
                          <div className="acct-city-toolbar">
                            <button className="account-btn primary" onClick={openNew}>+ Ajouter une nouvelle adresse</button>
                          </div>
                          <div className="acct-addr-list">
                            {addresses.map(addr => (
                              <div key={addr.id} className={"acct-addr-item" + (addr.id === defaultAddrId ? " is-default" : "")}>
                                <div>
                                  {addr.id === defaultAddrId && (
                                    <div className="acct-addr-default-tag">✦ Par défaut</div>
                                  )}
                                  <div className="acct-addr-text">
                                    {addr.firstName} {addr.lastName}<br />
                                    {addr.address1}{addr.address2 ? `, ${addr.address2}` : ""}<br />
                                    {addr.zip} {addr.city}, {addr.country}
                                    {addr.phone && <><br />☎ {addr.phone}</>}
                                  </div>
                                </div>
                                <div className="acct-addr-actions">
                                  <button className="acct-addr-action-btn" onClick={() => openEdit(addr)}>[ Modifier ]</button>
                                  {addr.id !== defaultAddrId && (
                                    <button className="acct-addr-action-btn" onClick={() => handleSetDefault(addr.id)}>[ Par défaut ]</button>
                                  )}
                                  <button className="acct-addr-action-btn danger" onClick={() => handleDelete(addr.id)}>[ Supprimer ]</button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </>
                )
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
          {addresses.length > 0 && (
            <div className="account-status-cell">
              📍 {addresses.length} adresse{addresses.length > 1 ? "s" : ""}
            </div>
          )}
          <div className="account-status-cell">♛ Lil&apos;OG © 2025</div>
        </div>

      </div>
    </main>
  );
}
