"use client";

/* ============================================================
   L'écran LCD + le disque, dans le Setup Wizard de /gift-card
   ------------------------------------------------------------
   Le disque (public/CD_LilOG.png) est déjà un visuel complet,
   centré, fond transparent : pas besoin du montage à deux calques
   (boîtier + disque décalé) de CdRom. Il tourne sur son propre
   centre pendant la gravure — rien d'autre.

   L'écran LCD au-dessus reprend le vocabulaire des afficheurs du
   reste du site (encre verte sur fond noir, police --font-lcd) et
   reflète l'état réel de l'assistant : deux lignes passées par le
   composant parent plutôt que recalculées ici, pour ne pas dupliquer
   la logique de progression/format qui vit déjà dans SetupWizard.
   ============================================================ */

import Image from "next/image";
import { LCD, MATRIX } from "@/components/y2k/kit";

const BURNER_CSS = `
@keyframes burnerSpin{ to{ transform:rotate(360deg) } }
.burner-disc.spin{ animation:burnerSpin 1.15s linear infinite; }

@keyframes burnerHalo{ 0%,100%{opacity:.2} 50%{opacity:.6} }
.burner-halo.spin{ animation:burnerHalo 1.1s ease-in-out infinite; }

@keyframes burnerBlink{ 0%,100%{opacity:1} 50%{opacity:.35} }
.burner-blink{ animation:burnerBlink 900ms step-end infinite; }

@media (prefers-reduced-motion: reduce){
  .burner-disc.spin{ animation:none }
  .burner-halo.spin{ animation:none }
  .burner-blink{ animation:none }
}
`;

export function BurnerDisplay({
  /** Le graveur travaille : le disque tourne, le curseur de l'écran clignote. */
  spinning,
  /** Ligne du haut de l'écran LCD : l'état de la piste. */
  status,
  /** Ligne du bas, plus discrète : capacité/prix, ou une invite. */
  detail,
}: {
  spinning: boolean;
  status: string;
  detail: string;
}) {
  return (
    <div className="flex h-full w-full max-w-[360px] flex-col items-center gap-4">
      <style>{BURNER_CSS}</style>

      {/* ---- Écran LCD, juste au-dessus du disque ---- */}
      <div className="w-full rounded-md border-2 border-[#3f3d55] bg-black px-3.5 py-2.5 shadow-[inset_0_2px_6px_rgba(0,0,0,0.6)]">
        <p
          className={`${LCD} truncate text-[0.9375rem] tracking-[0.06em] uppercase`}
          style={{ color: MATRIX, textShadow: `0 0 8px ${MATRIX}99` }}
        >
          {status}
          {spinning && <span className="burner-blink">_</span>}
        </p>
        <p className={`${LCD} mt-1 truncate text-[0.75rem] tracking-[0.05em] text-[#3f6f57] uppercase`}>
          {detail}
        </p>
      </div>

      {/* ---- Le disque ---- */}
      <div className="relative aspect-square w-full max-w-[280px]">
        <span
          aria-hidden
          className={`burner-halo pointer-events-none absolute inset-[4%] rounded-full opacity-0${spinning ? " spin" : ""}`}
          style={{ background: "radial-gradient(circle, rgba(90,255,160,0.5) 0%, transparent 70%)" }}
        />
        <Image
          src="/CD_LilOG.png"
          alt="Le disque de la carte cadeau Lil'OG"
          fill
          sizes="(min-width: 1024px) 280px, 70vw"
          className={`burner-disc object-contain drop-shadow-xl${spinning ? " spin" : ""}`}
        />
      </div>
    </div>
  );
}
