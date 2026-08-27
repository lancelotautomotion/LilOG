"use client";

/* ============================================================
   Le disque : photo réelle, plus de galette recréée en CSS
   ------------------------------------------------------------
   Le rendu (jewel case ouvert, disque irisé, logo et numéro de
   série factice) vient de public/gift-card-cd.png : rien à
   redessiner, l'image porte déjà tout le détail.

   Pendant la gravure, l'image ne tourne pas — ce serait tout le
   boîtier qui pivoterait, pas seulement le disque, ce qui ne lit
   plus comme un CD qui tourne. À la place : un reflet qui balaie
   le boîtier et un halo qui pulse doucement dessous, pour garder
   un retour « ça travaille » sans animer la photo elle-même.

   À partir de `lg`, où les deux colonnes de l'assistant partagent
   une même rangée de grille, le cadre grandit (`flex-1`) pour
   occuper tout l'espace que la colonne de gauche laissait vide
   sous l'image — voir le commentaire dans setup-wizard.tsx. Le bas
   du voyant colle ainsi toujours au bas du formulaire de droite,
   quel que soit son contenu (avertissement, liste de capacités,
   message d'erreur…), sans dépendre d'un recadrage figé de l'image
   pour une hauteur de formulaire donnée.

   En dessous de `lg`, les deux colonnes s'empilent et n'ont plus de
   rangée commune à égaler : le cadre reprend alors le ratio propre
   du fichier (1254×1035, déjà recadré pour limiter ses marges
   blanches), sans quoi `flex-1` n'aurait rien à occuper et
   écraserait l'image à sa hauteur plancher.
   ============================================================ */

import Image from "next/image";

const CD_CSS = `
@keyframes gcGlare{ 0%{transform:translateX(-130%) skewX(-12deg)} 100%{transform:translateX(230%) skewX(-12deg)} }
.gc-glare.spin{ animation:gcGlare 1.6s ease-in-out infinite }

@keyframes gcPulse{ 0%,100%{opacity:.25} 50%{opacity:.7} }
.gc-halo.spin{ animation:gcPulse 1.1s ease-in-out infinite }

@media (prefers-reduced-motion: reduce){
  .gc-glare.spin, .gc-halo.spin{ animation:none }
}
`;

export function CdRom({
  /** Le graveur travaille : reflet et halo s'animent. */
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

  return (
    <div
      /* Plus de matte blanc derrière l'image : le boîtier repose à même le
         gris système de la fenêtre (Setup Wizard Windows 95), l'ombre
         portée (`drop-shadow-xl`, posée sur l'image ci-dessous puisqu'elle
         doit suivre le contour du boîtier, pas le cadre rectangulaire) lui
         donne son relief. */
      className={`relative aspect-[1254/1035] w-full max-w-[420px] shrink-0${
        stretch ? " lg:aspect-auto lg:min-h-[200px] lg:flex-1" : ""
      }`}
    >
      <style>{CD_CSS}</style>

      {/* Halo qui pulse sous l'image pendant la gravure. */}
      <span
        aria-hidden
        className={`gc-halo pointer-events-none absolute inset-[8%] rounded-full opacity-0${spin}`}
        style={{ background: "radial-gradient(circle, rgba(90,255,160,0.55) 0%, transparent 70%)" }}
      />

      <Image
        src="/gift-card-cd.png"
        alt="Carte cadeau Lil'OG : CD-ROM pastel dans son boîtier, numéro de série gravé au centre du disque."
        fill
        sizes="(min-width: 1024px) 400px, 90vw"
        className="relative object-contain drop-shadow-xl"
        priority={priority}
      />

      {/* Reflet qui balaie le boîtier pendant la gravure. */}
      <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[8px]">
        <span
          className={`gc-glare absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/55 to-transparent${spin}`}
        />
      </span>
    </div>
  );
}
