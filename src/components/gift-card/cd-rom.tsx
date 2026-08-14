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
}: {
  spinning?: boolean;
}) {
  const spin = spinning ? " spin" : "";

  return (
    <div
      /* Le ratio suit celui du fichier (1254×1035) : gift-card-cd.png a été
         recadré pour retirer l'essentiel des marges blanches au-dessus et
         en dessous du boîtier, un carré aurait sinon réintroduit ce vide en
         creux plutôt qu'en pixels. */
      className="relative aspect-[1254/1035] w-full max-w-[420px] overflow-hidden rounded-[8px] bg-white/40 p-[4%] backdrop-blur-sm"
      style={{ boxShadow: "8px 8px 0 rgba(24,12,58,0.38)" }}
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
        className="relative object-contain"
        priority
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
