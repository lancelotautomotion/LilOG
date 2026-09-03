"use client";

import { useState, useTransition } from "react";
import { Nav } from "@/components/nav";
import { Drawer } from "@/components/drawer";
import { Footer } from "@/components/footer";
import { actionRequestPasswordReset } from "./actions";

export function ForgotPasswordShell() {
  const [menu, setMenu] = useState(false);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(async () => {
      await actionRequestPasswordReset(email);
      /* Message identique que le compte existe ou non : voir le
         commentaire de shopifyCustomerRecover. */
      setSent(true);
    });
  };

  return (
    <>
      <Nav onMenu={() => setMenu(true)} forceSolid />
      <Drawer open={menu} onClose={() => setMenu(false)} />

      <main className="account-desktop account-desktop--leo">
        <div className="account-win95">
          <div className="account-win95-bar">
            <span className="account-win95-title">🔑 Mot de passe oublié</span>
            <div className="account-win95-chrome">
              <span>_</span>
              <span>□</span>
              <a href="/login" title="Fermer">×</a>
            </div>
          </div>

          <div className="account-win95-toolbar">
            <a href="/login" className="account-toolbar-btn">← Retour à la connexion</a>
          </div>

          <div className="account-win95-full-content">
            <div className="account-panel">
              <div className="account-panel-bar">
                <span className="account-panel-title">✉️ Réinitialiser mon mot de passe</span>
              </div>
              <div className="account-panel-body">
                {sent ? (
                  <p className="account-success">
                    ✓ Si un compte existe pour cette adresse, un e-mail de réinitialisation vient de partir.
                    Pense à vérifier tes spams.
                  </p>
                ) : (
                  <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <p style={{ margin: 0 }}>
                      Indique l&apos;adresse email de ton compte, on t&apos;envoie un lien pour choisir un nouveau mot de passe.
                    </p>
                    <div className="account-field">
                      <label className="account-field-label" htmlFor="email">Email</label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        className="account-input"
                        placeholder="cherie@lilog.shop"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                      />
                    </div>
                    <div style={{ display: "flex", gap: "8px", paddingTop: "4px" }}>
                      <button type="submit" className="account-btn primary" disabled={isPending}>
                        {isPending ? "…" : "✉️ Envoyer le lien"}
                      </button>
                      <a href="/login" className="account-btn">Annuler</a>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
