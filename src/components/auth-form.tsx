"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { ChromeStar, GemSticker } from "@/components/contact/stickers";
import { PLASTIC, PLASTIC_FACE, PLASTIC_PRESS } from "@/components/y2k/kit";
import { Icon } from "@/components/icons";
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

/* Strass de la maison : mêmes formes et mêmes teintes que /faq, /contact
   et le bas de page. Collés sur les flancs de la fenêtre, jamais sur ses
   commandes ni sur les champs. */
const STICKERS = [
  { key: "s1", cls: "login-s1 -left-3 -top-5 sm:-left-6 h-[clamp(30px,4.4vw,50px)] w-[clamp(30px,4.4vw,50px)]",       r: "-14deg", node: <ChromeStar uid="lgn-chrome" /> },
  { key: "s2", cls: "login-s2 -right-3 top-[24%] sm:-right-6 h-[clamp(24px,3.4vw,40px)] w-[clamp(24px,3.4vw,40px)]",  r: "12deg",  node: <GemSticker uid="lgn-star-a" shape="star"  hue={["#FFB3D6", "#F0509A", "#B7175C"]} /> },
  { key: "s3", cls: "login-s3 -left-3 bottom-[20%] sm:-left-6 h-[clamp(26px,3.8vw,44px)] w-[clamp(26px,3.8vw,44px)]", r: "10deg",  node: <GemSticker uid="lgn-heart"  shape="heart" hue={["#FFC0DF", "#EE4B96", "#B3155A"]} /> },
  { key: "s4", cls: "login-s4 -right-3 -bottom-5 sm:-right-6 h-[clamp(28px,4vw,46px)] w-[clamp(28px,4vw,46px)]",      r: "-12deg", node: <GemSticker uid="lgn-star-b" shape="star"  hue={["#FFB3D6", "#F0509A", "#B7175C"]} /> },
];

export function AuthForm() {
  const [mode, setMode] = useState<Mode>("login");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
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
  const currentStatus = MSN_STATUSES.find(s => s.id === statusId) ?? MSN_STATUSES[0];
  const avatarSrc = MSN_AVATARS.some(a => a.src === avatar)
    ? (avatar as string)
    : MSN_AVATARS[0].src;

  /* « Se souvenir de moi » : l'email revient pré-rempli à la visite
     suivante. La valeur stockée vaut null au premier passage (case
     cochée par défaut), "" si la cliente avait décoché, l'email sinon.
     Elle sert de valeur initiale tant que rien n'a été saisi : pas
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
      /* Largeur de la fenêtre, et rien d'autre.
         Elle portait un ajustement automatique qui mettait toute la fenêtre
         à l'échelle (`transform: scale()`) dès que son contenu dépassait la
         hauteur de l'écran — pour lui éviter de défiler. Mais une mise à
         l'échelle est uniforme : la fenêtre rétrécissait AUSSI en largeur.
         Il suffisait d'un mot de passe refusé pour que la bannière d'erreur
         l'allonge et la fasse maigrir de 358 à 300px sur un téléphone de
         390 — elle changeait de taille sous les yeux de la visiteuse à
         chaque essai. L'onglet « Créer un compte », plus haut de deux
         champs, produisait le même effet.
         La fenêtre garde donc sa largeur en toutes circonstances et la page
         défile quand le contenu est plus haut que l'écran, ce que le
         `<main>` de /login prévoit déjà (aucun rognage vertical). */
      className={
        "relative w-full transition-[max-width] duration-300 " +
        (maximized ? "max-w-[780px]" : "max-w-[560px]")
      }
    >
    <div
      className={"relative w-full" + (wizz ? " login-wizz" : "")}
      onAnimationEnd={e => { if (e.target === e.currentTarget) setWizz(false); }}
    >
      {STICKERS.map(s => (
        <span
          key={s.key}
          aria-hidden
          className={`login-sticker pointer-events-none absolute z-20 ${s.cls}`}
          style={{ ["--r" as string]: s.r }}
        >
          {s.node}
        </span>
      ))}

      <div className={`login-mono overflow-hidden rounded-xl bg-[#ece9d8] shadow-[var(--y2k-win-shadow)] ${BEVEL_OUT}`}>

        {/* ── Barre de titre ── */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 select-none"
          style={{ backgroundImage: "var(--y2k-titlebar)" }}
        >
          <span className="flex-1 truncate text-[0.875rem] font-bold tracking-[0.08em] text-white sm:text-[1rem] drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]">
            🔐 LIL_OG_MESSENGER_V2.0.EXE
          </span>
          <div className="flex shrink-0 items-center gap-1">
            <ChromeButton label="Réduire" onClick={() => setShaded(v => !v)}>_</ChromeButton>
            <ChromeButton label="Agrandir" onClick={() => setMaximized(v => !v)}>🗖</ChromeButton>
            <ChromeButton label="Fermer" href="/">×</ChromeButton>
          </div>
        </div>

        {/* ── Barre de menus ── */}
        <div className="flex border-b border-gray-400 bg-[#ece9d8] px-1.5">
          {["Fichier", "Contacts", "Aide"].map(item => (
            <span
              key={item}
              className="cursor-default rounded px-3 py-0.5 text-[0.9375rem] uppercase tracking-[0.06em] text-[#3d3550] hover:bg-[#7147d4] hover:text-white"
            >
              {item}
            </span>
          ))}
        </div>

        {/* Corps : enroulé quand la fenêtre est réduite */}
        <div className={shaded ? "hidden" : "block"}>

          {/* ── Bloc avatar + statut ── */}
          {/* Grille plutôt que rangée flex : un `<select>` ne sait ni passer
              à la ligne ni mettre en ellipse, il coupe. Coincé à côté de
              l'avatar, il n'offrait que 208px sur un écran de 390 pour un
              statut qui en demande près de 300 : « J'ÉCOUTE BRITNEY EN
              BOUCLE » s'arrêtait à « EN ». Sur téléphone il passe donc sur
              sa propre ligne, sous l'avatar et le pseudo, où il dispose de
              toute la largeur de la fenêtre. Au bureau, l'avatar reprend
              ses deux rangées et la mise en page ne bouge pas. */}
          <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-2 border-b border-gray-400 bg-gradient-to-b from-[#f6f2ff] to-[#e4ddf7] p-2.5">
            <button
              type="button"
              onClick={cycleAvatar}
              title="Changer d'avatar"
              className={`shrink-0 self-center rounded-md bg-white p-1 shadow-inner sm:row-span-2 ${BEVEL_IN}`}
            >
              <span className="relative block h-14 w-14 overflow-hidden rounded-sm">
                <Image
                  src={avatarSrc}
                  alt="Avatar"
                  fill
                  sizes="56px"
                  className="object-cover"
                  unoptimized
                />
              </span>
            </button>

            <p className="min-w-0 truncate text-[1rem] font-bold text-[#2b2340]">
              Invitée_LilOG <span className="hidden text-[0.875rem] font-normal text-[#6B7280] sm:inline">(clique la photo ✎)</span>
            </p>

            {/* Statut : toute la largeur sous l'avatar au téléphone, deuxième
                rangée de la colonne de droite au bureau.

                Le libellé visible est un `<span>`, et le vrai `<select>` est
                posé transparent par-dessus. Un `<select>` natif ne sait ni
                passer à la ligne ni mettre en ellipse — il coupe — et il est
                servi à 16px minimum par la règle anti-zoom iOS de
                globals.css, qu'on ne contourne pas. Résultat : « J'ÉCOUTE
                BRITNEY EN BOUCLE » demande 254px alors qu'un écran de 360
                n'en offre que 242, et la phrase s'arrêtait à « EN ». Le span,
                lui, se replie sur deux lignes quand il le faut, à n'importe
                quelle largeur. Le select garde le clavier, le lecteur d'écran
                et le sélecteur natif du téléphone ; sa taille de police reste
                celle de la règle, il est invisible de toute façon. */}
            <div className="relative col-span-2 sm:col-span-1 sm:col-start-2">
              <select
                aria-label="Statut"
                value={statusId}
                onChange={e => writeStored(LS_STATUS_KEY, e.target.value)}
                className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0"
              >
                {MSN_STATUSES.map(s => (
                  <option key={s.id} value={s.id}>{s.emoji}  {s.loginLabel}</option>
                ))}
              </select>

              <div
                aria-hidden
                className={`pointer-events-none rounded-md bg-white py-1.5 pl-2.5 pr-7 text-[0.875rem] leading-snug tracking-[0.04em] text-[#2b2340] shadow-inner peer-focus-visible:outline-2 peer-focus-visible:outline-offset-1 peer-focus-visible:outline-[#7b2ff7] sm:text-[0.9375rem] ${BEVEL_IN}`}
              >
                {currentStatus.emoji}  {currentStatus.loginLabel}
              </div>
              <span aria-hidden className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[0.875rem] text-[#6B7280] sm:right-2.5 sm:text-[0.9375rem]">▾</span>
            </div>
          </div>

          {/* ── Onglets ── */}
          <div className="flex gap-1 px-2 pt-2">
            <Tab active={mode === "login"} onClick={() => { setMode("login"); setError(null); }}>
              🔑 Connexion
            </Tab>
            <Tab active={mode === "register"} onClick={() => { setMode("register"); setError(null); }}>
              ✨ Créer un compte
            </Tab>
          </div>

          {/* ── Panneau ── */}
          <div className="mx-2 mb-2 rounded-b-lg rounded-tr-lg border border-gray-400 bg-[#f7f6fb] px-4 py-3 shadow-inner">
            <form className="flex flex-col gap-2" onSubmit={handleCredentials}>
              {mode === "register" && (
                <div className="grid gap-2 sm:grid-cols-2">
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
                {/* Œil d'affichage : une faute de frappe dans un mot de passe
                    masqué est invisible, et sur un clavier de téléphone elle
                    est vite arrivée. Le bouton est DANS le <label> du champ,
                    mais un descendant interactif n'active pas le label : le
                    clic bascule l'affichage sans donner le focus au champ. */}
                <div className="relative">
                  <input
                    className={`${INPUT} pr-12`}
                    type={passwordVisible ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    minLength={mode === "register" ? 8 : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setPasswordVisible(v => !v)}
                    aria-label={passwordVisible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    aria-pressed={passwordVisible}
                    title={passwordVisible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    className="absolute inset-y-0 right-0 flex w-11 cursor-pointer items-center justify-center rounded-r-xl text-[#6b6480] transition-colors hover:text-[#7147d4] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#7147d4]"
                  >
                    {passwordVisible ? <Icon.eyeOff /> : <Icon.eye />}
                  </button>
                </div>
              </Field>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="flex cursor-pointer items-center gap-2 text-[0.875rem] text-[#3d3550] sm:text-[0.9375rem]">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={e => setRememberEdit(e.target.checked)}
                    className="h-4 w-4 cursor-pointer accent-[#c93fe0]"
                  />
                  Se souvenir de moi sur cet ordinateur
                </label>
                <Link
                  href="/mot-de-passe-oublie"
                  className="text-[0.875rem] text-[#5b3fa8] underline decoration-dotted underline-offset-2 hover:text-[#ff3fb0]"
                >
                  Mot de passe oublié ?
                </Link>
              </div>

              {error && (
                <p className={`flex items-start gap-2 rounded-md bg-[#fff0f4] p-2.5 text-[0.9375rem] text-[#b3005e] ${BEVEL_IN}`}>
                  <span aria-hidden>⚠️</span>{error}
                </p>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="w-full rounded-xl border-2 border-t-[#ffa6e4] border-l-[#ffa6e4] border-r-[#5b1a9e] border-b-[#5b1a9e] bg-gradient-to-b from-[#ff5cc8] via-[#d63fdd] to-[#7b2ff7] px-4 py-3 text-[1rem] font-bold uppercase tracking-[0.12em] text-white sm:text-[1rem] shadow-[0_4px_0_#4c1d95,0_10px_20px_rgba(76,29,149,0.35)] transition-[transform,box-shadow] active:translate-y-[4px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending
                  ? "⏳ CHARGEMENT..."
                  : mode === "login"
                    ? "🔓 S'AUTHENTIFIER.EXE"
                    : "✨ CRÉER MON COMPTE.EXE"}
              </button>
            </form>

            {/* ── Séparateur ── */}
            <div className="my-2 flex items-center gap-2 text-[0.875rem] uppercase tracking-[0.14em] text-[#6B7280]">
              <span className="h-px flex-1 bg-gray-300" />ou<span className="h-px flex-1 bg-gray-300" />
            </div>

            {/* ── Google, en bouton d'application rétro ── */}
            <button
              type="button"
              onClick={handleGoogle}
              className={`flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-white to-[#e9e6f5] px-4 py-2.5 text-[1rem] font-bold uppercase tracking-[0.08em] text-[#2b2340] sm:text-[1rem] shadow-[0_3px_0_rgba(120,100,170,0.45)] transition-[transform,box-shadow] hover:from-white hover:to-[#f4f1ff] active:translate-y-[3px] active:shadow-none ${BEVEL_OUT}`}
            >
              <GoogleIcon />
              Continuer avec Google
            </button>
          </div>
        </div>

        {/* ── Barre de statut ── */}
        <div className="flex items-center gap-2 border-t border-gray-400 bg-[#d9d5c8] px-3 py-1">
          <span className="login-led inline-block h-2 w-2 shrink-0 rounded-full bg-[#22c55e]" />
          <span className="min-w-0 flex-1 truncate text-[0.875rem] uppercase tracking-[0.06em] text-[#4b4536]">
            STATUS: {status}
          </span>
          <button
            type="button"
            onClick={() => setWizz(true)}
            title="Envoyer un wizz"
            className={`shrink-0 rounded bg-[#ece9d8] px-2 py-1 text-[0.875rem] tracking-[0.04em] text-[#4b4536] active:translate-y-[1px] ${BEVEL_OUT}`}
          >
            🔔 WIZZ
          </button>
        </div>
      </div>
    </div>
    </div>
  );
}

/* Champ encastré + étiquette rétro */
const INPUT =
  "w-full rounded-xl border border-gray-400 bg-white px-3.5 py-2.5 text-base text-[#1E2430] shadow-inner outline-none transition-[border-color,box-shadow] placeholder:text-gray-400 focus:border-[#7147d4] focus:shadow-[inset_0_1px_3px_rgba(0,0,0,0.12),0_0_0_3px_rgba(255,63,176,0.18)]";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-0.5 block text-[0.875rem] font-bold uppercase tracking-[0.14em] text-[#5b3fa8]">
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
      /* Sur téléphone, les deux onglets se partagent la rangée à parts
         égales (`flex-1 min-w-0`) et leur libellé peut passer à la ligne.
         Ils étaient à largeur libre, en `whitespace-nowrap`, dans un corps
         PLUS GROS qu'au bureau (1rem contre 0.9375rem) : les deux
         demandaient 460px pour une rangée qui n'en offre que 338 sur un
         écran de 390, et « CRÉER UN COMPTE » disparaissait sous le
         `overflow-hidden` de la fenêtre. Les crochets décoratifs, qui
         coûtent quatre caractères par onglet, ne reviennent qu'au bureau.
         Le corps reste à 14px, au-dessus du plancher de lisibilité. */
      className={
        "relative -mb-px min-w-0 flex-1 rounded-t-lg border border-b-0 border-gray-400 px-2 py-1.5 text-center text-[0.875rem] uppercase tracking-[0.04em] transition-colors sm:flex-none sm:px-3.5 sm:text-[0.9375rem] sm:tracking-[0.08em] sm:whitespace-nowrap " +
        (active
          ? "z-10 bg-[#f7f6fb] font-bold text-[#7b2ff7]"
          : "bg-[#ddd9ea] text-[#6B7280] hover:bg-[#e9e6f5] hover:text-[#2b2340]")
      }
    >
      <span className="hidden sm:inline">[ </span>
      {children}
      <span className="hidden sm:inline"> ]</span>
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
  /* Exactement les boutons de fenêtre du reste du site (kit y2k,
     bas de page, /faq…) : pastille plastique claire, biseau `PLASTIC`,
     glyphes `_` `🗖` `×`. Seuls l'enfoncement et le curseur sont
     ajoutés : ici, contrairement au décor des autres fenêtres, ils
     cliquent vraiment. */
  const className =
    `grid h-6 w-7 shrink-0 place-items-center rounded-md border border-[#c6c2d8] ${PLASTIC_FACE} text-[0.875rem] leading-none font-bold text-[#262626] select-none ${PLASTIC} ${PLASTIC_PRESS} cursor-pointer`;

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
