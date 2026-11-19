"use client";

import { GoogleAnalytics } from "@next/third-parties/google";
import { useConsent } from "@/lib/consent";
import { useHydrated } from "@/lib/stored";

/* ══════════════════════════════════════════════════════════════
   Google Analytics, derrière le bandeau de cookies

   Jusqu'ici gtag.js se chargeait pour tout le monde, en « Consent
   Mode » refusé : Google reçoit alors des pings anonymes avant tout
   accord. Pour la CNIL, la mesure d'audience qui n'est pas exemptée
   suppose un accord préalable : on ne charge donc plus du tout le
   script tant que la catégorie « mesure d'audience » n'est pas
   accordée, comme pour le pixel Meta.

   Le script `consent-default` du layout reste en place : il pose le
   dataLayer en « denied » puis rejoue le choix enregistré, de sorte
   que gtag démarre avec le bon consentement quand il est enfin chargé.

   `useConsent` vaut null pendant l'hydratation, y compris pour qui a
   déjà accepté : on attend le montage pour ne pas charger puis
   décharger le script.
   ══════════════════════════════════════════════════════════════ */
export function ConsentGatedAnalytics({ gaId }: { gaId: string }) {
  const hydrated = useHydrated();
  const consent = useConsent();
  if (!hydrated || consent?.analytics !== true) return null;
  return <GoogleAnalytics gaId={gaId} />;
}
