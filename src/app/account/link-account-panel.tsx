"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { actionLinkGoogleAccount } from "./link-actions";

/* Panneau affiché quand la connexion Google est tombée sur un compte Lil'OG
   déjà existant. Il remplace le silence : avant, la cliente voyait un espace
   compte sans historique ni carnet d'adresses, sans qu'aucun texte ne lui
   dise pourquoi ni comment y remédier. */
export function LinkAccountPanel({ email }: { email: string }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const { error } = await actionLinkGoogleAccount(password);
      if (error) {
        setError(error);
        return;
      }
      setDone(true);
      /* Le jeton Shopify vit dans le cookie de session, posé à la connexion :
         il est encore vide pour cette session. Une nouvelle connexion Google
         rejoue la liaison — qui réussit maintenant — et le pose. */
      setTimeout(() => signIn("google", { callbackUrl: "/account" }), 1200);
    });
  };

  return (
    <div className="account-panel" style={{ marginBottom: 14 }}>
      <div className="account-panel-bar">
        <span className="account-panel-title">🔗 Relier ton compte</span>
      </div>

      <div className="account-panel-body" style={{ padding: 16 }}>
        {done ? (
          <p style={{ margin: 0 }}>
            ✅ C&apos;est relié. Reconnexion en cours…
          </p>
        ) : (
          <>
            <p style={{ margin: "0 0 10px" }}>
              Un compte Lil&apos;OG existe déjà avec l&apos;adresse{" "}
              <strong>{email}</strong>, protégé par un mot de passe que tu as
              choisi. Tes commandes et tes adresses sont dessus — il faut le
              relier à Google pour les retrouver ici.
            </p>
            <p style={{ margin: "0 0 14px" }}>
              Saisis ce mot de passe une seule fois. Ensuite,{" "}
              <strong>tu te connecteras uniquement avec Google</strong> : ton
              ancien mot de passe ne servira plus.
            </p>

            <form onSubmit={submit} style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              <label className="account-label" htmlFor="link-password" style={{ width: "100%" }}>
                Mot de passe Lil&apos;OG
              </label>
              <input
                id="link-password"
                className="account-input"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ton mot de passe"
                style={{ flex: "1 1 220px" }}
                required
              />
              <button className="account-btn primary" type="submit" disabled={pending}>
                {pending ? "Vérification…" : "Relier mon compte"}
              </button>
            </form>

            {error && (
              <p className="account-error" style={{ marginTop: 12 }}>
                {error}
              </p>
            )}

            <p style={{ margin: "14px 0 0", fontSize: "0.8rem", opacity: 0.7 }}>
              Tu ne t&apos;en souviens plus ?{" "}
              <a href="/mot-de-passe-oublie" className="oc-link">
                Réinitialise-le
              </a>
              , puis reviens ici.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
