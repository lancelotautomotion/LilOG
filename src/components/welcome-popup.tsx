"use client";

/* ============================================================
   STAR_CLUB.EXE : -10 % sur la première commande
   ------------------------------------------------------------
   Fenêtre ouverte à la demande (bande de l'accueil, ou tout
   bouton qui appelle `openWelcome()`), jamais d'elle-même.
   La visiteuse laisse son e-mail, /api/welcome l'enregistre et
   renvoie le code, qui s'affiche avec un bouton « Copier ».
   Le code obtenu est gardé en localStorage : rouvrir la fenêtre
   le remontre directement, sans redemander l'adresse.

   Habillage maison : cadre #b8b4cc, barre de titre violette,
   fond uni, VT323 pour les afficheurs ; la photo
   occupe la colonne de droite (le haut, sur téléphone).
   ============================================================ */

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n-context";
import {
  HARD_SHADOW,
  LCD,
  MONO,
  PINK,
  PLASTIC,
  PLASTIC_FACE,
  PLASTIC_PRESS,
  VIOLET_BAR,
} from "@/components/y2k/kit";

const OPEN_EVENT = "lilog:welcome-open";
const CODE_KEY = "lilog-welcome-code";
const PORTRAIT = "/welcome-portrait.png";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Ouvre la fenêtre depuis n'importe quel composant client. */
export function openWelcome() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

const POP_CSS = `
@keyframes lwcIn{from{opacity:0;transform:translateY(14px) scale(.97)}to{opacity:1;transform:none}}
.lwc-in{animation:lwcIn 260ms ease-out both}
@keyframes lwcVeil{from{opacity:0}to{opacity:1}}
.lwc-veil{animation:lwcVeil 200ms ease-out both}
@media (prefers-reduced-motion: reduce){ .lwc-in,.lwc-veil{animation:none} }
`;

function readCode(): string | null {
  try {
    return localStorage.getItem(CODE_KEY);
  } catch {
    return null;
  }
}

export function WelcomePopup() {
  const { t } = useLanguage();
  const w = t.welcome;

  const [open, setOpen] = useState(false);
  const [code, setCode] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "error" | "invalid">("idle");
  const [copied, setCopied] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  /* Ouverture à la demande : on relit le code déjà obtenu à ce moment-là. */
  useEffect(() => {
    const onOpen = () => {
      setCode(readCode());
      setStatus("idle");
      setOpen(true);
    };
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    dialogRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!EMAIL_RE.test(value)) {
      setStatus("invalid");
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/welcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value, website }),
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; code?: string } | null;
      if (!res.ok || !data?.ok || !data.code) {
        setStatus(res.status === 400 ? "invalid" : "error");
        return;
      }
      setCode(data.code);
      setStatus("idle");
      try {
        localStorage.setItem(CODE_KEY, data.code);
      } catch {
        /* Stockage bloqué : le code reste affiché pour cette ouverture. */
      }
    } catch {
      setStatus("error");
    }
  };

  const copyCode = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* Presse-papiers refusé : le code reste sélectionnable à la main. */
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[170] flex items-center justify-center p-4 sm:p-6">
      <style>{POP_CSS}</style>

      <div
        aria-hidden
        className="lwc-veil absolute inset-0 bg-[#1a0f3a]/55 backdrop-blur-[2px]"
        onClick={() => setOpen(false)}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="lwc-title"
        ref={dialogRef}
        tabIndex={-1}
        className={`lwc-in relative flex max-h-[calc(100svh-2rem)] w-full max-w-[25rem] flex-col overflow-hidden rounded-2xl border-2 border-[#b8b4cc] bg-[#f0f0f5] outline-none md:w-auto md:max-w-[calc(100vw-3rem)] ${HARD_SHADOW}`}
      >
        {/* ── Barre de titre ── */}
        <div
          className="flex shrink-0 items-center gap-2 border-b-2 border-[#2a1370] px-2.5 py-2 select-none"
          style={{ background: VIOLET_BAR }}
        >
          <span
            className={`${MONO} min-w-0 flex-1 truncate text-[0.875rem] font-bold tracking-[0.1em] text-white uppercase [text-shadow:0_1px_2px_rgba(0,0,0,0.45)]`}
          >
            <span aria-hidden>⭐ </span>STAR_CLUB.EXE
          </span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label={t.bf.close}
            title={t.bf.close}
            className={`grid h-6 w-7 shrink-0 place-items-center rounded-md border border-[#c6c2d8] ${PLASTIC_FACE} text-[0.875rem] leading-none font-bold text-[#262626] ${PLASTIC} ${PLASTIC_PRESS}`}
          >
            ×
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto md:flex-row-reverse md:overflow-visible">
          {/* ── Photo : à droite sur ordinateur, en tête sur téléphone ── */}
          {/* Sur ordinateur, la colonne prend exactement les proportions de la
              photo (941 × 1434) : hauteur fixée, largeur déduite, donc rien
              n'est rogné. Sur téléphone, un bandeau cadré sur le visage. */}
          <div className="relative h-40 shrink-0 border-b-2 border-[#b8b4cc] sm:h-52 md:aspect-[941/1434] md:h-[min(34rem,calc(100svh-7rem))] md:border-b-0 md:border-l-2">
            <Image
              src={PORTRAIT}
              alt=""
              fill
              sizes="(min-width: 768px) 360px, 100vw"
              className="object-cover object-top md:object-[center_22%]"
            />
          </div>

          {/* ── Formulaire / code ── */}
          <div className="flex flex-1 flex-col justify-center bg-[#f0f0f5] px-5 py-6 md:w-[28rem] md:flex-none md:px-8 md:py-8">
            <h2
              id="lwc-title"
              className={`${LCD} text-[1.75rem] leading-[0.95] tracking-[0.04em] text-black uppercase md:text-[2rem]`}
            >
              {w.title}
            </h2>
            <p className={`${LCD} mt-2 text-[4.25rem] leading-[0.8] md:text-[5rem]`} style={{ color: PINK }}>
              -10%
            </p>
            <p className={`${MONO} mt-1 text-[0.9375rem] font-bold text-[#2b2340]`}>{w.sub}</p>

            {code ? (
              <div className="mt-5" aria-live="polite">
                <p className={`${MONO} text-[0.8125rem] font-bold tracking-[0.12em] text-[#1f9d55] uppercase`}>
                  ✓ {w.unlocked}
                </p>
                <button
                  type="button"
                  onClick={copyCode}
                  aria-label={`${t.bf.copy} ${code}`}
                  className="mt-2 inline-flex items-center gap-3 rounded-lg border-2 border-dashed bg-white px-4 py-2 transition hover:bg-[#fff0f8]"
                  style={{ borderColor: PINK }}
                >
                  <span className={`${LCD} text-[2rem] leading-none tracking-[0.1em] text-black select-all`}>
                    {code}
                  </span>
                  <span
                    className={`${MONO} rounded-md px-2 py-1 text-[0.6875rem] font-bold tracking-[0.1em] uppercase`}
                    style={{ color: "#fff", background: copied ? "#1f9d55" : PINK }}
                  >
                    {copied ? t.bf.copied : t.bf.copy}
                  </span>
                </button>
                <p className={`${MONO} mt-3 text-[0.8125rem] leading-snug text-[#5b5370]`}>{w.hint}</p>
              </div>
            ) : (
              <form onSubmit={submit} noValidate className="mt-5">
                <p className={`${MONO} text-[0.8125rem] leading-snug text-[#3d3555]`}>{w.body}</p>

                <label htmlFor="lwc-email" className={`${MONO} mt-4 block text-[0.75rem] font-bold tracking-[0.12em] text-[#5b5370] uppercase`}>
                  {w.email}
                </label>
                <input
                  id="lwc-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  required
                  maxLength={200}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status === "invalid" || status === "error") setStatus("idle");
                  }}
                  placeholder={w.placeholder}
                  aria-invalid={status === "invalid"}
                  aria-describedby={status === "invalid" || status === "error" ? "lwc-error" : undefined}
                  className={`${MONO} mt-1.5 w-full rounded-lg border-2 border-t-[#8f8aa6] border-r-white border-b-white border-l-[#8f8aa6] bg-white px-3 py-2.5 text-[1rem] text-black outline-none focus:border-[#7147d4]`}
                />

                {/* Pot de miel : invisible, seuls les robots le remplissent. */}
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="absolute -left-[9999px] h-px w-px opacity-0"
                />

                {(status === "invalid" || status === "error") && (
                  <p id="lwc-error" role="alert" className={`${MONO} mt-2 text-[0.8125rem] font-bold`} style={{ color: PINK }}>
                    {status === "invalid" ? w.invalid : w.error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className={`${MONO} mt-4 w-full rounded-full border border-[#a8004f] px-6 py-3 text-[0.875rem] font-bold tracking-[0.12em] uppercase disabled:opacity-70 ${PLASTIC} ${PLASTIC_PRESS}`}
                  style={{ color: "#fff", background: `linear-gradient(180deg, #ff5ec4 0%, ${PINK} 100%)` }}
                >
                  {status === "sending" ? w.sending : `${w.submit} →`}
                </button>

                <p className={`${MONO} mt-3 text-[0.6875rem] leading-snug text-[#6b6382]`}>
                  {w.consent}{" "}
                  <Link href="/confidentialite" className="underline" onClick={() => setOpen(false)}>
                    {w.privacy}
                  </Link>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
