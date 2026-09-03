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

/** Les spécs, purement décoratives : le contenu réel (capacité, prix) vit
 *  dans l'écran LCD au-dessus, choisi par l'utilisateur à l'étape 1. */
const SPECS: [string, string][] = [
  ["FORMAT", "CD-R VIRTUEL"],
  ["VALIDITÉ", "ILLIMITÉE"],
  ["COMPAT.", "TOUTE LA BOUTIQUE"],
  ["LIVRAISON", "EMAIL INSTANTANÉ"],
];

/** Largeurs des barres du faux code-barres — fixes plutôt que `Math.random()`,
 *  pour que le rendu serveur et l'hydratation client tombent d'accord. */
const BARCODE_WIDTHS = [2, 1, 1, 3, 1, 2, 4, 1, 1, 2, 3, 1, 4, 1, 2, 1, 3, 2, 1, 4, 1, 1, 2, 3, 1, 2, 4, 1, 3, 1, 2, 1];

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

      {/* ---- Fiche technique, purement décorative : comble le vide sous le
             disque plutôt que de laisser la colonne de gauche se terminer
             sur du blanc. Même écran encastré que le LCD du haut. ---- */}
      <div className="w-full rounded-md border-2 border-[#3f3d55] bg-black px-3.5 py-2.5 shadow-[inset_0_2px_6px_rgba(0,0,0,0.6)]">
        <p
          className={`${LCD} text-[0.75rem] tracking-[0.06em] uppercase`}
          style={{ color: MATRIX, textShadow: `0 0 6px ${MATRIX}80` }}
        >
          ▶ Spécifications système
        </p>
        <div className="mt-1.5 space-y-0.5">
          {SPECS.map(([k, v]) => (
            <p
              key={k}
              className={`${LCD} flex items-baseline justify-between gap-3 text-[0.75rem] tracking-[0.04em] text-[#3f6f57] uppercase`}
            >
              <span>{k}</span>
              <span className="truncate text-right" style={{ color: `${MATRIX}cc` }}>
                {v}
              </span>
            </p>
          ))}
        </div>
        {/* Code-barres esthétique, comme sur le dos d'un vrai boîtier de CD. */}
        <div className="mt-2.5 flex h-6 items-end gap-[2px] opacity-70" aria-hidden="true">
          {BARCODE_WIDTHS.map((w, i) => (
            <span
              key={i}
              style={{
                width: `${w}px`,
                height: i % 6 === 0 ? "100%" : "65%",
                background: MATRIX,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
