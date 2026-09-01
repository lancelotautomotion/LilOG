"use client";

/* ============================================================
   Le disque : un vrai calque qui se détache du boîtier
   ------------------------------------------------------------
   Trois images dérivées de la même photo (public/gift-card-cd.png),
   toutes trois au format du cadre d'origine (1254×1035) pour rester
   alignées au pixel près quel que soit le lettersboxing introduit
   par `object-fit: contain` :

     gift-card-case.png   le boîtier, avec la zone du disque repeinte
                           en tiroir vide (dégradé + spindle central)
     gift-card-disc.png   le disque seul, fond transparent partout
                           ailleurs

   Au repos, le disque est superposé pile sur le tiroir du boîtier :
   invisible à l'œil, on retrouve la photo d'origine. Pendant la
   gravure, il se soulève et tourne sur lui-même — un walkman qu'on
   ouvrirait pendant la lecture — révélant le tiroir en dessous.

   ⚠ Le pivot de rotation doit tomber exactement sur le centre du
   disque dans la photo (51,83 % ; 47,15 % du cadre 1254×1035), pas
   sur le centre du conteneur flexible qui l'accueille : au-delà de
   `lg`, ce conteneur est étiré (`lg:flex-1`, cf. plus bas) pour
   égaler la hauteur de la colonne de droite, et le rapport largeur/
   hauteur qui en résulte ne colle plus à celui de la photo — le
   disque se retrouve alors « en lettersbox » dans son cadre, avec
   des bandes vides au-dessus/en dessous. Un simple pourcentage CSS
   se lirait alors relatif au cadre entier (bandes comprises), pas au
   rectangle réellement occupé par l'image, et le disque tournerait
   autour d'un point décalé de son propre centre. `useContentFrame`
   mesure donc ce rectangle réel (à la `object-fit: contain`) et pose
   un cadre interne qui l'épouse exactement : tout ce qui vit dedans
   (les deux images, le pivot en pourcentage) retombe juste.
   ============================================================ */

import { useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";

/** Dimensions natives des trois photos — voir l'en-tête du fichier. */
const NATIVE_W = 1254;
const NATIVE_H = 1035;
const NATIVE_RATIO = NATIVE_W / NATIVE_H;

/** Centre du disque dans la photo, en pourcentage du cadre : le pivot
 *  de la rotation et de l'ancrage du halo. Mesuré directement sur
 *  gift-card-cd.png (centre ≈ 650,488 px, rayon ≈ 425 px). */
const DISC_CENTER_X_PCT = (650 / NATIVE_W) * 100;
const DISC_CENTER_Y_PCT = (488 / NATIVE_H) * 100;

type Rect = { left: number; top: number; width: number; height: number };

/** Rectangle qu'occuperait réellement une image `object-fit: contain`
 *  de rapport `ratio` dans un conteneur de `w`×`h` — les bandes de
 *  lettersbox exclues. Recalculé à chaque redimensionnement. */
function useContentFrame(ratio: number) {
  const outerRef = useRef<HTMLDivElement>(null);
  const [rect, setRect] = useState<Rect | null>(null);

  useLayoutEffect(() => {
    const el = outerRef.current;
    if (!el) return;

    const update = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w === 0 || h === 0) return;
      const width = w / h > ratio ? h * ratio : w;
      const height = w / h > ratio ? h : w / ratio;
      setRect({ left: (w - width) / 2, top: (h - height) / 2, width, height });
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ratio]);

  return { outerRef, rect };
}

const CD_CSS = `
@keyframes gcPulse{ 0%,100%{opacity:.25} 50%{opacity:.7} }
.gc-halo.spin{ animation:gcPulse 1.1s ease-in-out infinite }

/* Le disque se soulève du tiroir... */
.gc-disc-lift{
  transition:transform 520ms cubic-bezier(.2,.8,.3,1);
}
.gc-disc-lift.spin{
  transform:translateY(-7%) scale(1.045);
}

/* ...puis tourne sur lui-même, en boucle, tant que ça grave. */
@keyframes gcSpin{ to{ transform:rotate(360deg) } }
.gc-disc-spin.spin{
  animation:gcSpin 1.15s linear infinite;
}

@media (prefers-reduced-motion: reduce){
  .gc-halo.spin{ animation:none }
  .gc-disc-lift{ transition:none }
  .gc-disc-lift.spin{ transform:none }
  .gc-disc-spin.spin{ animation:none }
}
`;

export function CdRom({
  /** Le graveur travaille : le disque se soulève du tiroir et tourne. */
  spinning = false,
  /**
   * L'étirement `lg:flex-1` décrit plus haut n'a de sens que dans
   * l'assistant, où la colonne du disque doit égaler la hauteur du
   * formulaire voisin. Hors de ce contexte (bannière de l'accueil), il
   * faudrait un parent flex pour lui donner quelque chose à occuper :
   * sans cela, `lg:aspect-auto` retire le ratio et le cadre s'écrase à sa
   * hauteur plancher. Ces écrans-là gardent donc le ratio du fichier.
   */
  stretch = true,
  /**
   * Le disque est l'image d'en-tête de /gift-card, mais bien en dessous de
   * la ligne de flottaison sur l'accueil : l'y précharger disputerait la
   * bande passante au vrai visuel principal de la page.
   */
  priority = true,
}: {
  spinning?: boolean;
  stretch?: boolean;
  priority?: boolean;
}) {
  const spin = spinning ? " spin" : "";
  const { outerRef, rect } = useContentFrame(NATIVE_RATIO);

  /* Avant la première mesure (client uniquement, cf. useContentFrame), le
     cadre occupe tout le conteneur : imprécis pour un pivot de rotation,
     mais sans conséquence puisque la gravure ne peut démarrer qu'après une
     interaction, largement après ce premier rendu. */
  const frameStyle: React.CSSProperties = rect
    ? { left: rect.left, top: rect.top, width: rect.width, height: rect.height }
    : { inset: 0 };

  return (
    <div
      ref={outerRef}
      /* Plus de matte blanc derrière l'image : le boîtier repose à même le
         gris système de la fenêtre (Setup Wizard Windows 95), l'ombre
         portée (`drop-shadow-xl`, posée sur chaque image ci-dessous puisqu'elle
         doit suivre le contour du boîtier/disque, pas le cadre rectangulaire)
         leur donne leur relief. */
      /* `lg:shrink-0` et non `shrink-0` : le refus de rétrécir n'a de sens
         qu'au format bureau, où le boîtier partage une ligne flex avec le
         reste. Appliqué à toutes les largeurs, il donnait au boîtier une
         taille minimale de 420 px que le navigateur remontait de proche en
         proche — colonne, grille, puis la fenêtre GRAVEUR elle-même, large
         de 574 px sur un téléphone de 390. Le tiers droit de l'assistant
         sortait de l'écran, hors d'atteinte puisque le débordement
         horizontal est rogné : capacité, montant et bouton de gravure
         coupés. `w-full max-w-[420px]` suffit à le brider au bureau. */
      className={`relative aspect-[1254/1035] w-full max-w-[420px] lg:shrink-0${
        stretch ? " lg:aspect-auto lg:min-h-[200px] lg:flex-1" : ""
      }`}
    >
      <style>{CD_CSS}</style>

      <div className="absolute" style={frameStyle}>
        {/* Halo qui pulse sous le disque pendant la gravure. */}
        <span
          aria-hidden
          className={`gc-halo pointer-events-none absolute inset-[8%] rounded-full opacity-0${spin}`}
          style={{ background: "radial-gradient(circle, rgba(90,255,160,0.55) 0%, transparent 70%)" }}
        />

        {/* Le boîtier, tiroir vide sous le disque (repeint dans le fichier). */}
        <Image
          src="/gift-card-case.png"
          alt="Carte cadeau Lil'OG : boîtier de CD-ROM pastel ouvert."
          fill
          sizes="(min-width: 1024px) 400px, 90vw"
          className="relative object-contain drop-shadow-xl"
          priority={priority}
        />

        {/* Le disque : posé sur le tiroir au repos, soulevé et tournant
            pendant la gravure. Le pivot (`transformOrigin`) tombe sur son
            centre réel dans la photo, pas sur celui du cadre. */}
        <div className={`gc-disc-lift pointer-events-none absolute inset-0${spin}`}>
          <div
            className={`gc-disc-spin absolute inset-0${spin}`}
            style={{ transformOrigin: `${DISC_CENTER_X_PCT}% ${DISC_CENTER_Y_PCT}%` }}
          >
            <Image
              src="/gift-card-disc.png"
              alt="Le disque de la carte cadeau, numéro de série gravé au centre."
              fill
              sizes="(min-width: 1024px) 400px, 90vw"
              className="object-contain drop-shadow-xl"
              priority={priority}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
