"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { actionSignup } from "@/lib/actions/auth-actions";
import {
  LS_AVATAR_KEY,
  LS_STATUS_KEY,
  MSN_AVATARS,
  MSN_STATUSES,
  useStored,
  writeStored,
} from "@/lib/msn";

type Mode = "login" | "register";

const LS_REMEMBER_KEY = "lilog_login_remember";

/* Biseaux Windows : relief sortant (fenêtre, boutons, onglet actif),
   relief rentrant (cadre photo, zones encastrées). */
const BEVEL_OUT = "border-2 border-t-white border-l-white border-r-gray-800 border-b-gray-800";
const BEVEL_IN  = "border-2 border-t-gray-500 border-l-gray-500 border-r-white border-b-white";

export function AuthForm() {
  const [mode, setMode] = useState<Mode>("login");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  /* Chrome de la fenêtre : réduire l'enroule, agrandir l'élargit,
     fermer renvoie à la boutique. */
  const [shaded, setShaded] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const [wizz, setWizz] = useState(false);

  const avatar = useStored(LS_AVATAR_KEY);
  const storedStatus = useStored(LS_STATUS_KEY);
  const statusId = MSN_STATUSES.some(s => s.id === storedStatus)
    ? (storedStatus as string)
    : MSN_STATUSES[0].id;
  const avatarSrc = MSN_AVATARS.some(a => a.src === avatar)
    ? (avatar as string)
    : MSN_AVATARS[0].src;

  /* « Se souvenir de moi » : l'email revient pré-rempli à la visite
     suivante. La valeur stockée vaut null au premier passage (case
     cochée par défaut), "" si la cliente avait décoché, l'email sinon.
     Elle sert de valeur initiale tant que rien n'a été saisi — pas
     d'effet ni de setState au montage, donc pas de rendu en cascade. */
  const savedLogin = useStored(LS_REMEMBER_KEY);
  const [emailEdit, setEmailEdit] = useState<string | null>(null);
  const [rememberEdit, setRememberEdit] = useState<boolean | null>(null);
  const email = emailEdit ?? savedLogin ?? "";
  const remember = rememberEdit ?? savedLogin !== "";

  function cycleAvatar() {
    const i = MSN_AVATARS.findIndex(a => a.src === avatarSrc);
    writeStored(LS_AVATAR_KEY, MSN_AVATARS[(i + 1) % MSN_AVATARS.length].src);
  }

  const handleCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    writeStored(LS_REMEMBER_KEY, remember ? email : "");

    startTransition(async () => {
      if (mode === "register") {
        const { error: createError } = await actionSignup(email, password, firstName, lastName);
        if (createError) { setError(createError); return; }
      }
      const res = await signIn("credentials", { email, password, redirect: false });
      if (res?.error) {
        setError("Email ou mot de passe incorrect.");
        setWizz(true);
      } else {
        window.location.href = "/account";
      }
    });
  };

  const handleGoogle = () => {
    signIn("google", { callbackUrl: "/account" });
  };

  const status = isPending
    ? "AUTHENTIFICATION..."
    : error
      ? "ERREUR_401_ACCESS_DENIED"
      : "READY_TO_LOGIN";

  return (
    <div
      className={
        "relative w-full transition-[max-width] duration-300 " +
        (maximized ? "max-w-[780px]" : "max-w-[560px]") +
        (wizz ? " login-wizz" : "")
      }
      onAnimationEnd={e => { if (e.target === e.currentTarget) setWizz(false); }}
    >
      <div className={`login-mono overflow-hidden rounded-xl bg-[#ece9d8] shadow-2xl ${BEVEL_OUT}`}>

        {/* ── Barre de titre ── */}
        <div
          className="flex items-center gap-2 px-3 py-2 select-none"
          style={{ backgroundImage: "var(--y2k-titlebar)" }}
        >
          <span className="flex-1 truncate text-[0.68rem] font-bold tracking-[0.08em] text-white sm:text-[0.8rem] drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]">
            🔐 LIL_OG_MESSENGER_V2.0.EXE
          </span>
          <div className="flex shrink-0 items-center gap-1">
            <ChromeButton label="Réduire la fenêtre" onClick={() => setShaded(v => !v)}>_</ChromeButton>
            <ChromeButton label="Agrandir la fenêtre" onClick={() => setMaximized(v => !v)}>🗖</ChromeButton>
            <ChromeButton label="Fermer et retourner à la boutique" href="/">✖</ChromeButton>
          </div>
        </div>

        {/* ── Barre de menus ── */}
        <div className="flex border-b border-gray-400 bg-[#ece9d8] px-1.5 py-0.5">
          {["Fichier", "Contacts", "Aide"].map(item => (
            <span
              key={item}
              className="cursor-default rounded px-3 py-1 text-[0.72rem] uppercase tracking-[0.06em] text-[#3d3550] hover:bg-[#7147d4] hover:text-white"
            >
              {item}
            </span>
          ))}
        </div>

        {/* Corps — enroulé quand la fenêtre est réduite */}
        <div className={shaded ? "hidden" : "block"}>

          {/* ── Bloc avatar + statut ── */}
          <div className="flex items-center gap-3 border-b border-gray-400 bg-gradient-to-b from-[#f6f2ff] to-[#e4ddf7] p-4">
            <button
              type="button"
              onClick={cycleAvatar}
              title="Changer d'avatar"
              className={`shrink-0 rounded-md bg-white p-1 shadow-inner ${BEVEL_IN}`}
            >
              <span className="relative block h-20 w-20 overflow-hidden rounded-sm">
                <Image
                  src={avatarSrc}
                  alt="Avatar"
                  fill
                  sizes="80px"
                  className="object-cover"
                  unoptimized
                />
              </span>
            </button>

            <div className="min-w-0 flex-1">
              <p className="truncate text-[0.9rem] font-bold text-[#2b2340]">
                Invitée_LilOG <span className="hidden text-[0.7rem] font-normal text-[#6B7280] sm:inline">(clique la photo ✎)</span>
              </p>

              <div className="relative mt-1.5">
                <select
                  aria-label="Statut"
                  value={statusId}
                  onChange={e => writeStored(LS_STATUS_KEY, e.target.value)}
                  className={`w-full cursor-pointer appearance-none rounded-md bg-white py-2 pl-2.5 pr-8 text-[0.66rem] tracking-[0.04em] sm:text-[0.74rem] text-[#2b2340] shadow-inner outline-none ${BEVEL_IN}`}
                >
                  {MSN_STATUSES.map(s => (
                    <option key={s.id} value={s.id}>{s.emoji}  {s.loginLabel}</option>
                  ))}
                </select>
                <span aria-hidden className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[0.74rem] text-[#6B7280]">▾</span>
              </div>
            </div>
          </div>

          {/* ── Onglets ── */}
          <div className="flex gap-1 px-2 pt-2.5">
            <Tab active={mode === "login"} onClick={() => { setMode("login"); setError(null); }}>
              🔑 Connexion
            </Tab>
            <Tab active={mode === "register"} onClick={() => { setMode("register"); setError(null); }}>
              ✨ Créer un compte
            </Tab>
          </div>

          {/* ── Panneau ── */}
          <div className="mx-2 mb-2 rounded-b-lg rounded-tr-lg border border-gray-400 bg-[#f7f6fb] px-4 py-5 shadow-inner">
            <form className="flex flex-col gap-3" onSubmit={handleCredentials}>
              {mode === "register" && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="PRENOM.TXT">
                    <input
                      className={INPUT}
                      type="text"
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      required
                      autoComplete="given-name"
                    />
                  </Field>
                  <Field label="NOM.TXT">
                    <input
                      className={INPUT}
                      type="text"
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                      required
                      autoComplete="family-name"
                    />
                  </Field>
                </div>
              )}

              <Field label="ADRESSE_EMAIL.SYS">
                <input
                  className={INPUT}
                  type="email"
                  placeholder="cherie@lilog.shop"
                  value={email}
                  onChange={e => setEmailEdit(e.target.value)}
                  required
                  autoComplete="email"
                />
              </Field>

              <Field label="PASSWORD.RAW">
                <input
                  className={INPUT}
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  minLength={mode === "register" ? 8 : undefined}
                />
              </Field>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="flex cursor-pointer items-center gap-2 text-[0.68rem] text-[#3d3550] sm:text-[0.74rem]">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={e => setRememberEdit(e.target.checked)}
                    className="h-4 w-4 cursor-pointer accent-[#c93fe0]"
                  />
                  Se souvenir de moi sur cet ordinateur
                </label>
                <Link
                  href="/contact"
                  className="text-[0.7rem] text-[#5b3fa8] underline decoration-dotted underline-offset-2 hover:text-[#ff3fb0]"
                >
                  Mot de passe oublié ?
                </Link>
              </div>

              {error && (
                <p className={`flex items-start gap-2 rounded-md bg-[#fff0f4] p-2.5 text-[0.74rem] text-[#b3005e] ${BEVEL_IN}`}>
                  <span aria-hidden>⚠️</span>{error}
                </p>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="mt-1 w-full rounded-xl border-2 border-t-[#ffa6e4] border-l-[#ffa6e4] border-r-[#5b1a9e] border-b-[#5b1a9e] bg-gradient-to-b from-[#ff5cc8] via-[#d63fdd] to-[#7b2ff7] px-4 py-4 text-[0.8rem] font-bold uppercase tracking-[0.12em] text-white sm:text-[0.9rem] shadow-[0_4px_0_#4c1d95,0_10px_20px_rgba(76,29,149,0.35)] transition-[transform,box-shadow] active:translate-y-[4px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending
                  ? "⏳ CHARGEMENT..."
                  : mode === "login"
                    ? "🔓 S'AUTHENTIFIER.EXE"
                    : "✨ CRÉER MON COMPTE.EXE"}
              </button>
            </form>

            {/* ── Séparateur ── */}
            <div className="my-4 flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.14em] text-[#6B7280]">
              <span className="h-px flex-1 bg-gray-300" />ou<span className="h-px flex-1 bg-gray-300" />
            </div>

            {/* ── Google, en bouton d'application rétro ── */}
            <button
              type="button"
              onClick={handleGoogle}
              className={`flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-white to-[#e9e6f5] px-4 py-3.5 text-[0.72rem] font-bold uppercase tracking-[0.08em] text-[#2b2340] sm:text-[0.8rem] shadow-[0_3px_0_rgba(120,100,170,0.45)] transition-[transform,box-shadow] hover:from-white hover:to-[#f4f1ff] active:translate-y-[3px] active:shadow-none ${BEVEL_OUT}`}
            >
              <GoogleIcon />
              Continuer avec Google
            </button>
          </div>
        </div>

        {/* ── Barre de statut ── */}
        <div className="flex items-center gap-2 border-t border-gray-400 bg-[#d9d5c8] px-3 py-1.5">
          <span className="login-led inline-block h-2 w-2 shrink-0 rounded-full bg-[#22c55e]" />
          <span className="min-w-0 flex-1 truncate text-[0.68rem] uppercase tracking-[0.06em] text-[#4b4536]">
            STATUS: {status}
          </span>
          <button
            type="button"
            onClick={() => setWizz(true)}
            title="Envoyer un wizz"
            className={`shrink-0 rounded bg-[#ece9d8] px-2 py-1 text-[0.68rem] tracking-[0.04em] text-[#4b4536] active:translate-y-[1px] ${BEVEL_OUT}`}
          >
            🔔 WIZZ
          </button>
        </div>
      </div>
    </div>
  );
}

/* Champ encastré + étiquette rétro */
const INPUT =
  "w-full rounded-xl border border-gray-400 bg-white p-3.5 text-base text-[#1E2430] shadow-inner outline-none transition-[border-color,box-shadow] placeholder:text-gray-400 focus:border-[#7147d4] focus:shadow-[inset_0_1px_3px_rgba(0,0,0,0.12),0_0_0_3px_rgba(255,63,176,0.18)]";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[#5b3fa8]">
        {label}
      </span>
      {children}
    </label>
  );
}

function Tab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "relative -mb-px rounded-t-lg border border-b-0 whitespace-nowrap border-gray-400 px-2.5 py-2 text-[0.62rem] uppercase tracking-[0.08em] transition-colors sm:px-3.5 sm:text-[0.74rem] " +
        (active
          ? "z-10 bg-[#f7f6fb] font-bold text-[#7b2ff7]"
          : "bg-[#ddd9ea] text-[#6B7280] hover:bg-[#e9e6f5] hover:text-[#2b2340]")
      }
    >
      [ {children} ]
    </button>
  );
}

function ChromeButton({
  children,
  label,
  onClick,
  href,
}: {
  children: React.ReactNode;
  label: string;
  onClick?: () => void;
  href?: string;
}) {
  const className =
    "flex h-6 w-8 items-center justify-center rounded border border-white/55 bg-white/15 text-[12px] leading-none text-white/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_1px_2px_rgba(0,0,0,0.2)] transition-colors hover:bg-white/30 active:translate-y-[1px]";

  if (href) {
    return <Link href={href} aria-label={label} title={label} className={className}>{children}</Link>;
  }
  return (
    <button type="button" aria-label={label} title={label} onClick={onClick} className={className}>
      {children}
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
    </svg>
  );
}
