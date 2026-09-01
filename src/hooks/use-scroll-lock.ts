"use client";

import { useEffect } from "react";

/* ============================================================
   Verrou de défilement pour les couches plein écran
   ------------------------------------------------------------
   Menu latéral, tiroir des filtres, zoom photo, modale de
   paiement : tant que l'une de ces couches est ouverte, la page
   du dessous ne doit plus défiler. Sans ce verrou, sur mobile,
   le doigt fait glisser la page derrière le voile — et à la
   fermeture on ne retrouve plus l'endroit qu'on lisait.

   `overflow: hidden` sur `body` ne suffit pas : l'élément qui
   défile est `html`, pas `body`. On fige donc `body` en
   `position: fixed`, décalé de la position courante pour que
   rien ne saute à l'écran, et on rend la position au
   déverrouillage. C'est la seule méthode qui tienne aussi sur
   Safari iOS, où `overflow: hidden` se laisse contourner par
   l'inertie du geste.

   Le compteur est volontairement au niveau du module : deux
   couches peuvent se superposer (le menu par-dessus le tiroir
   des filtres), et c'est la dernière refermée qui rend la main.
   ============================================================ */

let depth = 0;
/** Position et styles à rendre au `body` quand le dernier verrou tombe. */
let restore: { y: number; cssText: string } | null = null;

function lock() {
  if (depth++ > 0) return;

  const body = document.body;
  const y = window.scrollY;
  /* Largeur de l'ascenseur, qui disparaît avec le passage en `fixed` : sans
     cette compensation la page se décale d'une quinzaine de pixels au bureau
     à chaque ouverture de menu. Vaut 0 sur mobile (ascenseurs en surimpression). */
  const gutter = window.innerWidth - document.documentElement.clientWidth;

  restore = { y, cssText: body.style.cssText };
  body.style.position = "fixed";
  body.style.top = `-${y}px`;
  body.style.left = "0";
  body.style.right = "0";
  body.style.width = "100%";
  if (gutter > 0) body.style.paddingRight = `${gutter}px`;
}

function unlock() {
  if (depth === 0) return;
  if (--depth > 0) return;

  const saved = restore;
  restore = null;
  if (!saved) return;

  document.body.style.cssText = saved.cssText;

  /* `scroll-behavior: auto` le temps du retour : si une feuille de style
     déclare un défilement doux, la page repartirait du haut en glissant
     sous les yeux de la visiteuse au lieu de reprendre où elle était. */
  const html = document.documentElement;
  const prevBehavior = html.style.scrollBehavior;
  html.style.scrollBehavior = "auto";
  window.scrollTo(0, saved.y);
  html.style.scrollBehavior = prevBehavior;
}

/**
 * Gèle le défilement de la page tant que `locked` est vrai.
 * Le démontage du composant relâche le verrou : une couche qui
 * disparaît en même temps qu'elle se ferme ne peut pas laisser
 * la page bloquée.
 */
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    lock();
    return unlock;
  }, [locked]);
}
