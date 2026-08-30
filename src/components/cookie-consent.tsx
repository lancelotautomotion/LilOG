"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  BEVEL_IN,
  GRID_BG,
  HARD_SHADOW,
  MONO,
  PINK,
  PLASTIC,
  PLASTIC_FACE,
  PLASTIC_PRESS,
  VIOLET_BAR,
} from "@/components/y2k/kit";
import {
  CONSENT_ALL,
  CONSENT_NONE,
  type Consent,
  saveConsent,
  useConsent,
} from "@/lib/consent";
import { useHydrated } from "@/lib/stored";

/* ══════════════════════════════════════════════════════════════
   AVERTISSEMENT_SYSTÈME.EXE — bandeau de consentement cookies

   Une boîte de dialogue système, pas une bannière marketing :
   même cadre, même barre de titre violette, mêmes jetons plastique
   que les fenêtres du reste du site (kit y2k, /login, /faq). Aucun
   style inventé ici — tout vient de `@/components/y2k/kit`.

   Elle se pose en bas à droite sur grand écran et occupe toute la
   largeur en bas sur mobile, au-dessus du reste de la page mais
   sous la visionneuse plein écran de la fiche produit (z-200),
   qui, elle, ne s'ouvre que sur un geste délibéré.
   ══════════════════════════════════════════════════════════════ */

/* Le [×] de la barre de titre est un décor : fermer sans choisir
   reviendrait à un refus déguisé, et la fenêtre reviendrait au
   rechargement suivant. Il est donc grisé et inerte, comme un bouton
   désactivé de boîte de dialogue Windows. */
function DeadCloseButton() {
  return (
    <span
      aria-hidden
      title="Choisissez une option pour fermer"
      className={`grid h-6 w-7 shrink-0 place-items-center rounded-md border border-[#b6b2c6] ${PLASTIC_FACE} text-[0.875rem] leading-none font-bold text-[#9a96ab] opacity-55 select-none ${PLASTIC}`}
    >
      ×
    </span>
  );
}

/** Interrupteur de catégorie du panneau CONFIG.SYS. */
function Toggle({
  label,
  hint,
  checked,
  locked = false,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  locked?: boolean;
  onChange?: (next: boolean) => void;
}) {
  return (
    <label
      className={`flex items-start gap-2.5 rounded-lg bg-white/70 px-2.5 py-2 ${BEVEL_IN} ${
        locked ? "cursor-default opacity-80" : "cursor-pointer"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={locked}
        onChange={e => onChange?.(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 accent-[#c93fe0] disabled:cursor-not-allowed"
      />
      <span className="min-w-0">
        <span className={`${MONO} block text-[0.8125rem] font-bold tracking-[0.06em] text-[#2b2340] uppercase`}>
          {label}
          {locked && <span className="ml-1.5 font-normal text-[#6B7280] normal-case">(obligatoire)</span>}
        </span>
        <span className="mt-0.5 block text-[0.8125rem] leading-snug text-[#4b4560]">{hint}</span>
      </span>
    </label>
  );
}

export function CookieConsent() {
  const consent = useConsent();

  /* `useConsent` s'appuie sur localStorage, illisible au rendu serveur :
     sans cette garde, la fenêtre s'afficherait une image durant à chaque
     chargement, y compris pour qui a déjà répondu. */
  const hydrated = useHydrated();

  const [configOpen, setConfigOpen] = useState(false);
  const [draft, setDraft] = useState<Consent>(CONSENT_ALL);

  /* La fenêtre est `fixed`, donc hors flux : elle publie sa hauteur dans
     `--lcc-h`, comme le bandeau de livraison publie la sienne dans `--lhb-h`.
     Tout ce qui se pose en bas d'écran s'en sert pour passer au-dessus
     d'elle — le bouton FILTRES.EXE des rayons, qu'elle recouvrait
     entièrement sur téléphone : les filtres étaient intouchables tant que
     la visiteuse n'avait pas répondu.
     La hauteur est mesurée, pas devinée : elle change avec la langue, la
     largeur de l'écran et l'ouverture du panneau CONFIG.SYS. */
  const popRef = useRef<HTMLDivElement | null>(null);
  const setPopHeight = useCallback((h: number) => {
    document.documentElement.style.setProperty("--lcc-h", `${Math.round(h)}px`);
  }, []);

  useEffect(() => {
    const el = popRef.current;
    if (!el) return;
    const update = () => setPopHeight(el.getBoundingClientRect().height);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      ro.disconnect();
      /* Choix enregistré : la fenêtre disparaît, la réservation aussi. */
      document.documentElement.style.removeProperty("--lcc-h");
    };
  }, [setPopHeight, hydrated, consent]);

  if (!hydrated || consent) return null;

  const decide = (choice: Consent) => {
    saveConsent(choice);
    setConfigOpen(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="lcc-title"
      ref={popRef}
      className="lcc-pop fixed inset-x-0 bottom-0 z-[150] sm:inset-x-auto sm:right-4 sm:bottom-4 sm:w-[26rem]"
    >
      <div
        className={`overflow-hidden rounded-t-2xl border-2 border-[#b8b4cc] bg-[#f0f0f5] sm:rounded-2xl ${HARD_SHADOW}`}
      >
        {/* ── Barre de titre ── */}
        <div
          className="flex items-center gap-2 border-b-2 border-[#2a1370] px-2.5 py-2 select-none"
          style={{ background: VIOLET_BAR }}
        >
          <span
            id="lcc-title"
            className={`${MONO} min-w-0 flex-1 truncate text-[0.875rem] font-bold tracking-[0.1em] text-white uppercase [text-shadow:0_1px_2px_rgba(0,0,0,0.45)]`}
          >
            ⚠️ AVERTISSEMENT_SYSTÈME.EXE
          </span>
          <DeadCloseButton />
        </div>

        {/* ── Corps ──
            Plafonné et défilant : ouvert, le panneau CONFIG.SYS ajoute
            trois blocs et la fenêtre dépasserait le bas de l'écran sur
            un petit téléphone. La barre de titre, elle, reste en place. */}
        <div
          className="max-h-[70vh] overflow-y-auto overscroll-contain px-3 py-2.5 sm:px-3.5 sm:py-3"
          style={GRID_BG}
        >
          <div className="flex items-start gap-3">
            <span
              aria-hidden
              className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-[1.25rem] leading-none sm:h-11 sm:w-11 sm:text-[1.5rem] ${BEVEL_IN}`}
            >
              🍪
            </span>

            <p className="min-w-0 text-[0.8125rem] leading-snug text-[#2b2340] sm:text-[0.875rem] sm:leading-relaxed">
              Le protocole <strong style={{ color: PINK }}>LIL_OG</strong>{" "}
              requiert l&apos;activation de fichiers de session (Cookies) pour mémoriser votre panier, optimiser
              l&apos;affichage, analyser le trafic du site et mesurer nos publicités. Autorisez-vous
              l&apos;exécution ?
            </p>
          </div>

          {/* ── Panneau CONFIG.SYS ── */}
          {configOpen && (
            <div className="mt-3 flex flex-col gap-1.5">
              <Toggle
                label="SESSION.SYS"
                hint="Panier, connexion, sécurité. Le site ne fonctionne pas sans."
                checked
                locked
              />
              <Toggle
                label="AUDIENCE.LOG"
                hint="Mesure de fréquentation (Google Analytics), pour savoir ce qui plaît."
                checked={draft.analytics}
                onChange={analytics => setDraft(d => ({ ...d, analytics }))}
              />
              <Toggle
                label="PREFERENCES.INI"
                hint="Mémorise la langue et la devise choisies."
                checked={draft.preferences}
                onChange={preferences => setDraft(d => ({ ...d, preferences }))}
              />
              <Toggle
                label="MARKETING.DAT"
                hint="Pixel Meta (Facebook, Instagram) : mesure nos publicités et évite de te montrer celles qui ne te concernent pas."
                checked={draft.marketing}
                onChange={marketing => setDraft(d => ({ ...d, marketing }))}
              />
            </div>
          )}

          {/* ── Boutons ──
              Exigence CNIL : refuser doit être aussi facile et aussi
              visible qu'accepter — même taille, même niveau, un seul
              clic. Les deux actions sont donc deux boutons jumeaux,
              simplement de couleurs différentes ; CONFIG.SYS reste en
              retrait, lui, puisque « personnaliser » n'est pas soumis à
              cette parité. */}
          <div className="mt-3 flex flex-col gap-2">
            {/* Côte à côte dès le téléphone, et non l'un sous l'autre : empilés,
                les deux boutons jumeaux plus CONFIG.SYS poussaient la fenêtre à
                près des deux tiers de l'écran, et la moitié basse de la page
                n'était plus ni défilable (overscroll-contain) ni cliquable.
                La parité CNIL est intacte — même taille, même niveau, un clic
                chacun — et même mieux servie qu'en pile, où « refuser » se
                lisait en second. */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => decide(configOpen ? draft : CONSENT_ALL)}
                className={`${MONO} w-full truncate rounded-xl border-2 border-t-[#ffa6e4] border-l-[#ffa6e4] border-r-[#5b1a9e] border-b-[#5b1a9e] bg-gradient-to-b from-[#ff5cc8] via-[#d63fdd] to-[#7b2ff7] px-2 py-2.5 text-[0.75rem] font-bold tracking-[0.02em] text-white uppercase shadow-[0_4px_0_#4c1d95,0_10px_20px_rgba(76,29,149,0.35)] transition-[transform,box-shadow] active:translate-y-[4px] active:shadow-none`}
              >
                [ 💾 {configOpen ? "ENREGISTRER" : "AUTORISER"} ]
              </button>

              <button
                type="button"
                onClick={() => decide(CONSENT_NONE)}
                className={`${MONO} w-full cursor-pointer truncate rounded-xl border-2 border-t-[#fdfdff] border-l-[#fdfdff] border-r-[#8783a0] border-b-[#8783a0] ${PLASTIC_FACE} px-2 py-2.5 text-[0.75rem] font-bold tracking-[0.02em] text-[#2b2340] uppercase shadow-[0_4px_0_#8783a0] transition-[transform,box-shadow] active:translate-y-[4px] active:shadow-none`}
              >
                [ ⛔ REFUSER ]
              </button>
            </div>

            {!configOpen && (
              <button
                type="button"
                onClick={() => setConfigOpen(true)}
                aria-expanded={false}
                className={`${MONO} w-full cursor-pointer rounded-xl border border-[#c6c2d8] ${PLASTIC_FACE} px-4 py-2 text-[0.8125rem] font-bold tracking-[0.06em] text-[#2b2340] uppercase ${PLASTIC} ${PLASTIC_PRESS}`}
              >
                [ ⚙️ CONFIG.SYS ]
              </button>
            )}
          </div>

          <p className="mt-2 text-center text-[0.75rem] text-[#6B7280]">
            Détail complet dans la{" "}
            <Link
              href="/cookies"
              className="underline decoration-dotted underline-offset-2 hover:text-[#ff3fb0]"
            >
              politique de cookies
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
