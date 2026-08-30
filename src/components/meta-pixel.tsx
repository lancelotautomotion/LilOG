"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { useConsent } from "@/lib/consent";
import { useHydrated } from "@/lib/stored";

/* ══════════════════════════════════════════════════════════════
   META_PIXEL.DLL — traceur publicitaire Facebook / Instagram

   Rien n'est chargé tant que la catégorie « marketing » du bandeau
   de cookies n'a pas été accordée : contrairement à Google, Meta
   n'a pas de mode « consentement » qui laisserait le script tourner
   à vide, et la CNIL n'admet pas qu'un pixel publicitaire se pose
   avant l'accord. Le composant ne rend donc strictement rien tant
   que le choix n'est pas lu (localStorage, donc après hydratation)
   ou qu'il refuse le marketing.

   Deux conséquences assumées :

   • Pas de balise <noscript><img …></noscript> comme dans l'extrait
     fourni par Meta. Sans JavaScript, le choix stocké est illisible :
     cette image traquerait tout le monde, consentement ou pas.

   • Le pixel n'existe pas dans le HTML initial. C'est ce qu'on veut,
     mais cela signifie qu'un test « voir le script dans le code
     source » échouera : il faut accepter le marketing, puis vérifier
     l'appel à connect.facebook.net dans l'onglet Réseau (ou avec
     l'extension Meta Pixel Helper).
   ══════════════════════════════════════════════════════════════ */

/* L'identifiant vient de Vercel (Settings → Environment Variables),
   comme NEXT_PUBLIC_GA_ID. Il est public par nature — il circule en
   clair dans chaque requête au pixel — mais reste hors du dépôt pour
   que les previews et la production puissent diverger.
   Le filtre sur les chiffres n'est pas décoratif : la valeur est
   interpolée dans un <script> inline, une chaîne fantaisiste y serait
   du code exécutable. */
const rawPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const PIXEL_ID = rawPixelId && /^\d{6,20}$/.test(rawPixelId) ? rawPixelId : null;

/* Extrait officiel de Meta, à ceci près que `fbq('track','PageView')`
   y reste : c'est la vue de la page sur laquelle le pixel s'installe.
   Les navigations suivantes, purement côté client, ne rechargent pas
   ce script — l'effet plus bas s'en charge. */
const PIXEL_BOOTSTRAP = `
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${PIXEL_ID}');
fbq('track', 'PageView');
`;

type FbqWindow = Window & { fbq?: (...args: unknown[]) => void };

export function MetaPixel() {
  /* `useConsent` lit localStorage : null pendant l'hydratation, y
     compris pour qui a déjà accepté. Sans cette garde, le pixel
     serait injecté puis retiré à la première image. */
  const hydrated = useHydrated();
  const consent = useConsent();
  const granted = hydrated && consent?.marketing === true;

  const pathname = usePathname();

  /* Volontairement sans useSearchParams : l'appeler ici, dans un
     composant du layout racine, basculerait tout le site en rendu
     dynamique. Un changement de filtre sur /catalogue ne compte donc
     pas comme une nouvelle vue — ce que Meta attend de toute façon
     d'un catalogue à facettes. */

  /* La première vue est comptée par le script lui-même : cet effet ne
     doit reprendre la main qu'aux navigations suivantes. Le drapeau
     tombe à la première exécution *avec* consentement, c'est-à-dire au
     moment où le script est injecté, pas avant. */
  const bootstrapped = useRef(false);

  useEffect(() => {
    const fbq = (window as FbqWindow).fbq;

    if (!granted) {
      /* Consentement retiré (depuis un autre onglet, ou expiré) : le
         script chargé ne peut plus être décroché, on lui coupe le son. */
      if (bootstrapped.current) fbq?.("consent", "revoke");
      bootstrapped.current = false;
      return;
    }

    if (!bootstrapped.current) {
      bootstrapped.current = true;
      return;
    }

    fbq?.("track", "PageView");
  }, [granted, pathname]);

  if (!PIXEL_ID || !granted) return null;

  return (
    <Script id="meta-pixel" strategy="afterInteractive">
      {PIXEL_BOOTSTRAP}
    </Script>
  );
}
