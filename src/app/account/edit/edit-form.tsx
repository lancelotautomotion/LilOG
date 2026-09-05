"use client";

import { useState, useTransition } from "react";
import type { ShopifyCustomer } from "@/lib/shopify/customers";

type UpdateAction = (formData: FormData) => Promise<{ error: string | null | undefined }>;

export function EditProfileForm({
  customer,
  updateAction,
  emailLocked,
}: {
  customer: ShopifyCustomer;
  updateAction: UpdateAction;
  emailLocked: boolean;
}) {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccess(false);
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updateAction(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
      }
    });
  };

  return (
    <div className="account-panel">
      <div className="account-panel-bar">
        <span className="account-panel-title">✏️ Informations du compte</span>
      </div>
      <div className="account-panel-body">
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div className="account-info-grid">
            <div className="account-field">
              <label className="account-field-label" htmlFor="firstName">Prénom</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                className="account-input"
                defaultValue={customer.firstName}
                placeholder="Prénom"
              />
            </div>
            <div className="account-field">
              <label className="account-field-label" htmlFor="lastName">Nom</label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                className="account-input"
                defaultValue={customer.lastName}
                placeholder="Nom"
              />
            </div>
          </div>

          <div className="account-field">
            <label className="account-field-label" htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              /* Compte relié à Google : le compte miroir Shopify est retrouvé
                 par l'e-mail Google à chaque connexion. Le laisser diverger
                 dédoublerait la cliente côté Shopify. Le serveur refuse aussi
                 le changement — ceci n'est que la version visible. */
              readOnly={emailLocked}
              title={emailLocked ? "Adresse gérée par ton compte Google" : undefined}
              className="account-input"
              defaultValue={customer.email}
              placeholder="votre@email.com"
            />
          </div>

          <div className="account-field">
            <label className="account-field-label" htmlFor="phone">Téléphone (optionnel)</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              className="account-input"
              defaultValue={customer.phone ?? ""}
              placeholder="+33 6 00 00 00 00"
            />
          </div>

          <div style={{ borderTop: "1px solid #888", paddingTop: "10px", marginTop: "2px" }}>
            <div className="account-field">
              <label className="account-field-label" htmlFor="password">
                Nouveau mot de passe (optionnel, min. 8 caractères)
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className="account-input"
                placeholder="Laisser vide pour ne pas changer"
                minLength={8}
                autoComplete="new-password"
              />
            </div>
          </div>

          {success && (
            <p className="account-success">✓ Profil mis à jour avec succès.</p>
          )}
          {error && (
            <p className="account-error">⚠ {error}</p>
          )}

          <div style={{ display: "flex", gap: "8px", paddingTop: "4px" }}>
            <button type="submit" className="account-btn primary" disabled={isPending}>
              {isPending ? "…" : "💾 Enregistrer"}
            </button>
            <a href="/account" className="account-btn">Annuler</a>
          </div>
        </form>
      </div>
    </div>
  );
}
