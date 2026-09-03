"use client";

import { useState, useTransition } from "react";
import { Nav } from "@/components/nav";
import { Drawer } from "@/components/drawer";
import { Footer } from "@/components/footer";
import { actionResetPassword } from "./actions";

export function ResetPasswordShell({
  customerId,
  token,
}: {
  customerId: string | null;
  token: string | null;
}) {
  const [menu, setMenu] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  const linkInvalid = !customerId || !token;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }
    if (!customerId || !token) return;
    startTransition(async () => {
      const result = await actionResetPassword(customerId, token, password);
      if (result.error) {
        setError(result.error);
      } else {
        setDone(true);
      }
    });
  };

  return (
    <>
      <Nav onMenu={() => setMenu(true)} forceSolid />
      <Drawer open={menu} onClose={() => setMenu(false)} />

      <main className="account-desktop account-desktop--leo">
        <div className="account-win95">
          <div className="account-win95-bar">
            <span className="account-win95-title">🔒 Nouveau mot de passe</span>
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
                <span className="account-panel-title">🔒 Choisir un nouveau mot de passe</span>
              </div>
              <div className="account-panel-body">
                {linkInvalid ? (
                  <p className="account-error">
                    ⚠ Ce lien de réinitialisation est invalide ou incomplet. Redemande un email depuis la page{" "}
                    <a href="/mot-de-passe-oublie">mot de passe oublié</a>.
                  </p>
                ) : done ? (
                  <p className="account-success">
                    ✓ Mot de passe mis à jour. Tu peux maintenant{" "}
                    <a href="/login">te connecter</a> avec ton nouveau mot de passe.
                  </p>
                ) : (
                  <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div className="account-field">
                      <label className="account-field-label" htmlFor="password">Nouveau mot de passe</label>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        className="account-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={8}
                        autoComplete="new-password"
                      />
                    </div>
                    <div className="account-field">
                      <label className="account-field-label" htmlFor="confirm">Confirmer le mot de passe</label>
                      <input
                        id="confirm"
                        name="confirm"
                        type="password"
                        className="account-input"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        required
                        minLength={8}
                        autoComplete="new-password"
                      />
                    </div>

                    {error && <p className="account-error">⚠ {error}</p>}

                    <div style={{ display: "flex", gap: "8px", paddingTop: "4px" }}>
                      <button type="submit" className="account-btn primary" disabled={isPending}>
                        {isPending ? "…" : "🔒 Valider"}
                      </button>
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
