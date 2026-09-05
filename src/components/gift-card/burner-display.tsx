"use client";

/* ============================================================
   L'écran LCD + le disque, dans le Setup Wizard de /gift-card
   ------------------------------------------------------------
   Le disque (public/CD_LilOG.png) est déjà un visuel complet,
   centré, fond transparent : pas besoin du montage à deux calques
   (boîtier + disque décalé) de CdRom. Il tourne sur son propre
   centre pendant la gravure — rien d'autre.

   Le disque est posé sur une platine : plateau, axe central et
   bras de lecture. Le socle de la platine joint l'écran du haut à
   la fiche du bas — les trois panneaux forment un seul appareil,
   plutôt que trois blocs qui flottent l'un sous l'autre.

   L'écran LCD au-dessus reprend le vocabulaire des afficheurs du
   reste du site (encre verte sur fond noir, police --font-lcd) et
   reflète l'état réel de l'assistant : deux lignes passées par le
   composant parent plutôt que recalculées ici, pour ne pas dupliquer
   la logique de progression/format qui vit déjà dans SetupWizard.
   ============================================================ */

import Image from "next/image";
import { LCD, MATRIX, MONO } from "@/components/y2k/kit";

const BURNER_CSS = `
@keyframes burnerSpin{ to{ transform:rotate(360deg) } }
.burner-disc.spin{ animation:burnerSpin 1.15s linear infinite; }

@keyframes burnerHalo{ 0%,100%{opacity:.2} 50%{opacity:.6} }
.burner-halo.spin{ animation:burnerHalo 1.1s ease-in-out infinite; }

@keyframes burnerBlink{ 0%,100%{opacity:1} 50%{opacity:.35} }
.burner-blink{ animation:burnerBlink 900ms step-end infinite; }

/* Plateau de la platine : le feutre sombre sur lequel repose le disque.
   Les sillons concentriques sont dessinés au dégradé radial répété, pas au
   trait : ils restent doux et ne réapparaissent pas en escalier au zoom. */
.burner-platter{
  background-image:
    repeating-radial-gradient(circle at 50% 50%, rgba(255,255,255,.055) 0 1px, transparent 1px 5px),
    radial-gradient(circle at 50% 46%, #3a3750 0%, #232132 46%, #16141f 100%);
  box-shadow:
    inset 0 3px 10px rgba(0,0,0,.65),
    inset 0 -2px 6px rgba(255,255,255,.07),
    0 4px 12px rgba(20,18,30,.35);
}

/* Bras de lecture : au repos il pointe sur le bord du disque ; pendant la
   gravure il dérive lentement vers le centre, comme un bras qui suit le
   sillon. L'animation vit ici et non en style inline pour rester au même
   endroit que sa keyframe. */
.burner-arm{ transform:rotate(-24deg); transform-origin:100% 50%; }
@keyframes burnerTrack{ from{ transform:rotate(-24deg) } to{ transform:rotate(-31deg) } }
.burner-arm.spin{ animation:burnerTrack 9s ease-in-out infinite alternate; }

@media (prefers-reduced-motion: reduce){
  .burner-disc.spin{ animation:none }
  .burner-halo.spin{ animation:none }
  .burner-blink{ animation:none }
  .burner-arm.spin{ animation:none }
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
    <div className="flex h-full w-full max-w-[360px] flex-col items-center">
      <style>{BURNER_CSS}</style>

      {/* ---- Écran LCD, juste au-dessus du disque ---- */}
      <div className="w-full rounded-t-md border-2 border-b-0 border-[#3f3d55] bg-black px-3.5 py-2.5 shadow-[inset_0_2px_6px_rgba(0,0,0,0.6)]">
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

      {/* ---- Le disque, sur sa platine ----
             Socle sans bordure haute ni basse : il se raccorde à l'écran du
             haut et à la fiche du bas, dont les coins intérieurs sont eux
             aussi carrés. Les trois panneaux ne font plus qu'un appareil, et
             le disque n'est plus posé dans le vide. */}
      <div className="relative flex w-full flex-1 items-center justify-center border-x-2 border-[#3f3d55] bg-[linear-gradient(180deg,#eceaf6_0%,#dedbec_55%,#cbc7dd_100%)] px-[clamp(14px,5%,26px)] py-[clamp(16px,2.6vh,26px)] shadow-[inset_0_2px_6px_rgba(255,255,255,0.8),inset_0_-3px_8px_rgba(63,61,85,0.18)]">
        {/* Plateau + disque + axe. */}
        <div className="relative aspect-square w-full max-w-[268px]">
          <span aria-hidden className="burner-platter pointer-events-none absolute inset-0 rounded-full" />
          <span
            aria-hidden
            className={`burner-halo pointer-events-none absolute inset-[8%] rounded-full opacity-0${spinning ? " spin" : ""}`}
            style={{ background: "radial-gradient(circle, rgba(90,255,160,0.5) 0%, transparent 70%)" }}
          />
          <Image
            src="/CD_LilOG.png"
            alt="Le disque de la carte cadeau Lil'OG"
            fill
            sizes="(min-width: 1024px) 268px, 70vw"
            className={`burner-disc object-contain p-[6%] drop-shadow-xl${spinning ? " spin" : ""}`}
          />
          {/* Axe central : le disque est enfilé dessus, il passe donc
              par-dessus l'image et ne tourne pas avec elle. */}
          <span
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-1/2 h-[5.5%] w-[5.5%] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background: "linear-gradient(150deg,#ffffff 0%,#d7d4e4 45%,#8e8aa8 100%)",
              boxShadow: "0 1px 2px rgba(0,0,0,.45), inset 0 1px 1px rgba(255,255,255,.9)",
            }}
          />

          {/* Bras de lecture. Il vit dans le carré du plateau, pas dans le
              socle : ses pourcentages se lisent alors sur le diamètre du
              disque, et la géométrie du bras reste la même quelle que soit
              la hauteur que la grille donne à la colonne. Pivot juste
              au-dessus du coin haut-droit, pointe posée entre le bord et
              l'étiquette. */}
          <span
            aria-hidden
            className="pointer-events-none absolute top-[-3%] right-[-6%] h-[10%] w-[10%] rounded-full border border-[#8e8aa8]"
            style={{
              background: "radial-gradient(circle at 35% 30%,#ffffff 0%,#dcd9e8 45%,#9b97b3 100%)",
              boxShadow: "0 2px 4px rgba(30,36,48,.3), inset 0 1px 2px rgba(255,255,255,.9)",
            }}
          />
          <span
            aria-hidden
            className={`burner-arm pointer-events-none absolute top-[1.2%] right-[-2%] h-[1.9%] w-[38%] rounded-full${spinning ? " spin" : ""}`}
            style={{
              background: "linear-gradient(180deg,#ffffff 0%,#dedbec 40%,#8e8aa8 100%)",
              boxShadow: "0 2px 3px rgba(30,36,48,.28)",
            }}
          >
            {/* Tête de lecture au bout du bras, et sa pointe sur le disque. */}
            <span
              className="absolute top-1/2 left-0 h-[13px] w-[15px] -translate-y-1/2 rounded-[2px] border border-[#8e8aa8]"
              style={{
                background: "linear-gradient(180deg,#f6f5fb 0%,#cfccdf 100%)",
                boxShadow: "0 1px 2px rgba(30,36,48,.35)",
              }}
            />
            <span className="absolute top-[9px] left-[6px] h-[5px] w-[2px] rounded-b-[1px] bg-[#5b5670]" />
            {/* Contrepoids, de l'autre côté du pivot. */}
            <span
              className="absolute top-1/2 right-[-15px] h-[10px] w-[12px] -translate-y-1/2 rounded-[3px] border border-[#8e8aa8]"
              style={{ background: "linear-gradient(180deg,#eeecf7 0%,#b5b1c8 100%)" }}
            />
          </span>
        </div>

        {/* Vitesse de rotation, gravée dans le socle comme sur une platine. */}
        <span
          aria-hidden
          className={`${MONO} pointer-events-none absolute bottom-[6px] left-[10px] text-[0.625rem] tracking-[0.18em] text-[#8e8aa8] uppercase`}
        >
          33 ⅓ rpm
        </span>
      </div>

      {/* ---- Fiche technique, purement décorative : comble le vide sous le
             disque plutôt que de laisser la colonne de gauche se terminer
             sur du blanc. Même écran encastré que le LCD du haut. ---- */}
      <div className="w-full rounded-b-md border-2 border-t-0 border-[#3f3d55] bg-black px-3.5 py-2.5 shadow-[inset_0_2px_6px_rgba(0,0,0,0.6)]">
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
