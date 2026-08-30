"use client";

import { readStored, useStored, writeStored } from "@/lib/stored";

/* ══════════════════════════════════════════════════════════════
   CONSENT.SYS — mémoire du choix cookies et pont vers Google

   Les catégories reprennent mot pour mot celles annoncées sur
   /cookies : strictement nécessaires (jamais désactivables),
   analytiques, préférences, marketing. Toute évolution de cette
   liste doit être répercutée là-bas, et inversement.

   Le choix est relu au chargement par un script `beforeInteractive`
   posé dans le layout racine : il rejoue le consentement dans le
   dataLayer AVANT que gtag ne s'initialise, sinon Google Analytics
   démarre en « denied » et la visite est perdue. Ce module ne gère
   donc que l'écriture et les mises à jour en cours de session.
   ══════════════════════════════════════════════════════════════ */

export const LS_CONSENT_KEY = "lilog_cookie_consent";

/** Version du format stocké. L'incrémenter invalide les choix passés
    et fait revenir le bandeau — à faire si les catégories changent. */
export const CONSENT_VERSION = 2;

/** /cookies annonce un consentement mémorisé 6 mois : on s'y tient. */
export const CONSENT_MAX_AGE_MS = 182 * 24 * 60 * 60 * 1000;

export type Consent = {
  /** Mesure d'audience (Google Analytics 4). */
  analytics: boolean;
  /** Langue, devise et autres conforts d'affichage. */
  preferences: boolean;
  /** Traceurs publicitaires (pixel Meta : Facebook, Instagram). */
  marketing: boolean;
};

type StoredConsent = Consent & { v: number; ts: number };

export const CONSENT_ALL: Consent = { analytics: true, preferences: true, marketing: true };
export const CONSENT_NONE: Consent = { analytics: false, preferences: false, marketing: false };

function parse(raw: string | null): StoredConsent | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<StoredConsent>;
    if (parsed?.v !== CONSENT_VERSION) return null;
    if (typeof parsed.ts !== "number") return null;
    if (Date.now() - parsed.ts > CONSENT_MAX_AGE_MS) return null;
    return {
      v: parsed.v,
      ts: parsed.ts,
      analytics: parsed.analytics === true,
      preferences: parsed.preferences === true,
      marketing: parsed.marketing === true,
    };
  } catch {
    return null;
  }
}

/** Le choix nu, débarrassé de la version et de l'horodatage. */
function pick({ analytics, preferences, marketing }: StoredConsent): Consent {
  return { analytics, preferences, marketing };
}

/** Le choix en vigueur, ou null s'il n'y en a pas (ou s'il a expiré). */
export function readConsent(): Consent | null {
  const stored = parse(readStored(LS_CONSENT_KEY));
  return stored && pick(stored);
}

/**
 * Version hook, resynchronisée entre les onglets.
 *
 * Attention : le snapshot serveur de `useStored` vaut null, donc ce
 * hook renvoie `null` (« aucun choix ») pendant l'hydratation, y
 * compris pour une visiteuse qui a déjà répondu. C'est à l'appelant
 * d'attendre le montage avant d'afficher quoi que ce soit, sinon le
 * bandeau apparaît le temps d'une image à chaque chargement.
 */
export function useConsent(): Consent | null {
  const stored = parse(useStored(LS_CONSENT_KEY));
  return stored ? pick(stored) : null;
}

/** Enregistre le choix et le pousse aussitôt à Google. */
export function saveConsent(consent: Consent) {
  const payload: StoredConsent = { ...consent, v: CONSENT_VERSION, ts: Date.now() };
  writeStored(LS_CONSENT_KEY, JSON.stringify(payload));
  pushConsent(consent);
}

/** Efface le choix : le bandeau réapparaîtra à la prochaine visite. */
export function clearConsent() {
  writeStored(LS_CONSENT_KEY, null);
}

type DataLayerWindow = Window & { dataLayer?: unknown[] };

/**
 * Traduit le choix en signaux Consent Mode v2.
 *
 * Le dataLayer reçoit l'objet `arguments` et non un tableau : c'est la
 * forme qu'attend gtag.js, celle de l'extrait officiel de Google. Un
 * tableau ordinaire n'est pas interprété de la même façon.
 *
 * Rien n'est fait pour la publicité (`ad_storage` et consorts) : ces
 * signaux ne pilotent que les produits publicitaires de Google, dont
 * le site ne se sert pas. Ils restent refusés en permanence, posés
 * par le script de défaut du layout. La catégorie « marketing », elle,
 * ne passe pas par Google : elle conditionne le chargement du pixel
 * Meta (voir `@/components/meta-pixel`), qui n'est tout simplement pas
 * injecté tant qu'elle n'est pas accordée.
 */
export function pushConsent(consent: Consent) {
  if (typeof window === "undefined") return;
  const w = window as DataLayerWindow;
  w.dataLayer = w.dataLayer || [];

  /* Déclarée sans paramètre et poussant `arguments` : c'est l'objet
     `arguments` que gtag.js sait relire, pas un tableau ordinaire.
     Le cast lui rend une signature appelable, faute de paramètres
     nommés à déclarer. */
  const gtag = function () {
    // eslint-disable-next-line prefer-rest-params
    w.dataLayer!.push(arguments);
  } as (...args: unknown[]) => void;

  const granted = (ok: boolean) => (ok ? "granted" : "denied");

  gtag("consent", "update", {
    analytics_storage:       granted(consent.analytics),
    functionality_storage:   granted(consent.preferences),
    personalization_storage: granted(consent.preferences),
  });
}
