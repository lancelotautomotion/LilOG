"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { shopifyCustomerCreate } from "@/lib/shopify/customers";

type Mode = "login" | "register";

export function AuthForm() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      if (mode === "register") {
        const { error: createError } = await shopifyCustomerCreate(email, password, firstName, lastName);
        if (createError) { setError(createError); return; }
      }
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (res?.error) {
        setError("Email ou mot de passe incorrect.");
      } else {
        window.location.href = "/account";
      }
    });
  };

  const handleGoogle = () => {
    signIn("google", { callbackUrl: "/account" });
  };

  return (
    <div className="auth-card">
      <div className="auth-tabs">
        <button
          className={"auth-tab" + (mode === "login" ? " active" : "")}
          onClick={() => { setMode("login"); setError(null); }}
        >
          Connexion
        </button>
        <button
          className={"auth-tab" + (mode === "register" ? " active" : "")}
          onClick={() => { setMode("register"); setError(null); }}
        >
          Créer un compte
        </button>
      </div>

      <form className="auth-form" onSubmit={handleCredentials}>
        {mode === "register" && (
          <div className="auth-row">
            <input
              className="auth-input"
              type="text"
              placeholder="Prénom"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <input
              className="auth-input"
              type="text"
              placeholder="Nom"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
        )}
        <input
          className="auth-input"
          type="email"
          placeholder="Adresse email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <input
          className="auth-input"
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          minLength={mode === "register" ? 8 : undefined}
        />

        {error && <p className="auth-error">{error}</p>}

        <button className="auth-submit" type="submit" disabled={isPending}>
          {isPending
            ? "..."
            : mode === "login"
            ? "Se connecter"
            : "Créer mon compte"}
        </button>
      </form>

      <div className="auth-divider"><span>ou</span></div>

      <button className="auth-google" onClick={handleGoogle} type="button">
        <GoogleIcon />
        Continuer avec Google
      </button>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
    </svg>
  );
}
