/* ============================================================
   LICENCE_CADEAU.ISO : module 02 de l'accueil
   ------------------------------------------------------------
   L'encart promotionnel de la carte cadeau, dans l'esprit des
   pochettes CD-ROM que les magazines et AOL glissaient dans les
   boîtes aux lettres des années 2000. Deux colonnes :

     à gauche   le boîtier cristal en lévitation, avec sa
                pastille jaune fluo collée en travers
     à droite   l'argumentaire, trois montants d'accès rapide
                et le bouton qui mène au graveur complet

   Le disque n'est pas redessiné : c'est le composant CdRom de
   /gift-card, réutilisé tel quel dans sa variante non étirée
   (voir le commentaire de `stretch` là-bas). Une seule image,
   déjà dans le cache du navigateur pour qui a visité la page.

   Les montants pointent sur /gift-card?montant=N : l'assistant
   y présélectionne la capacité correspondante, le visiteur
   arrive donc sur un formulaire déjà amorcé plutôt que vide.

   ⚠ PAREFEU : Tailwind + feuille locale préfixée `lhg-`.
   ============================================================ */

import Link from "next/link";
import { CdRom } from "@/components/gift-card/cd-rom";
import { GRID_BG, MONO, PLASTIC, PLASTIC_FACE, SectionLabel, WindowFrame } from "@/components/y2k/kit";

/** Les trois raccourcis de montant. Les capacités réelles vivent dans Shopify :
 *  si l'une d'elles disparaissait du catalogue, le lien reste valide et
 *  l'assistant retombe simplement sur sa première capacité disponible. */
const AMOUNTS = [20, 50, 100] as const;

const PROMO_CSS = `
/* Lévitation du boîtier. */
@keyframes lhgFloat{ 0%,100%{transform:translate3d(0,0,0)} 50%{transform:translate3d(0,-10px,0)} }
.lhg-float{ animation:lhgFloat 4.8s ease-in-out infinite }

/* Reflet diagonal qui traverse le boîtier au survol. */
.lhg-sheen{
  transform:translateX(-150%) skewX(-18deg);
  transition:transform 900ms cubic-bezier(.22,.61,.36,1);
}
.lhg-case:hover .lhg-sheen{ transform:translateX(260%) skewX(-18deg) }

/* Capsules de montant : course courte, façon touche de clavier. */
.lhg-chip{ transition:transform 90ms ease, box-shadow 90ms ease, filter 160ms ease }
.lhg-chip:hover{ filter:brightness(1.05) }
.lhg-chip:active{ transform:translateY(3px); box-shadow:0 0 0 rgba(0,0,0,0.18) }

/* Bouton principal : la même course de 6 px que le reste du site. */
.lhg-cta{
  box-shadow:0 6px 0 #7d0f56, 0 14px 22px rgba(20,6,40,.4), inset 0 2px 0 rgba(255,255,255,.9), inset 0 -5px 12px rgba(120,0,80,.42);
  transition:transform 90ms ease, box-shadow 90ms ease, filter 160ms ease;
}
.lhg-cta:hover{ filter:brightness(1.06) }
.lhg-cta:active{
  transform:translateY(6px);
  box-shadow:0 0 0 #7d0f56, 0 3px 8px rgba(20,6,40,.45), inset 0 2px 0 rgba(255,255,255,.55), inset 0 -3px 8px rgba(120,0,80,.5);
}

@media (prefers-reduced-motion: reduce){
  .lhg-float{ animation:none }
  .lhg-sheen,.lhg-chip,.lhg-cta{ transition:none }
  .lhg-case:hover .lhg-sheen{ transform:translateX(-150%) skewX(-18deg) }
}
`;

export function GiftCardPromo() {
  return (
    <section id="gift-card" className="px-4 py-[clamp(48px,8vw,96px)] sm:px-6">
      <div className="mx-auto w-full max-w-[1200px]">
        <SectionLabel n="02" file="LICENCE_CADEAU.ISO" tone="wallpaper" />

        <style>{PROMO_CSS}</style>

        <WindowFrame
          title="CARTE_CADEAU.ISO"
          icon="💿"
          bodyClassName="px-[clamp(16px,4vw,48px)] py-[clamp(24px,4vw,44px)]"
          bodyStyle={GRID_BG}
        >
          <div className="grid items-center gap-[clamp(24px,4vw,48px)] lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
            {/* ---------- Colonne gauche : le boîtier ---------- */}
            <div className="mx-auto w-full max-w-[320px] lg:mx-0">
              <div className="lhg-float lhg-case relative">
                <CdRom stretch={false} priority={false} />

                {/* Reflet diagonal, contenu dans le cadre du boîtier. */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 overflow-hidden rounded-[8px]"
                >
                  <span className="lhg-sheen absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                </span>

                {/* Pastille collée en travers du boîtier. */}
                <span
                  className={`${MONO} pointer-events-none absolute -top-3 -right-2 z-10 rounded-[3px] border-2 border-black bg-[#f5ff3d] px-2.5 py-1 text-[0.8125rem] font-black tracking-[0.04em] text-black uppercase`}
                  style={{
                    transform: "rotate(-9deg)",
                    boxShadow: "3px 3px 0 rgba(24,12,58,0.5)",
                  }}
                >
                  [ 100% Digital Credit ]
                </span>
              </div>
            </div>

            {/* ---------- Colonne droite : l'argumentaire ---------- */}
            <div className="min-w-0 text-center lg:text-left">
              {/* En-tête « terminal ». */}
              <p
                className={`${MONO} inline-block rounded-[3px] border border-[#0c2a1b] bg-[#04140c] px-2.5 py-1 text-[0.8125rem] font-bold tracking-[0.14em] uppercase`}
                style={{ color: "#5affa0", textShadow: "0 0 10px rgba(90,255,160,.55)" }}
              >
                [ SYS.OFFER ] /// LICENCE_CADEAU
              </p>

              <h2
                className={`${MONO} mt-4 text-[clamp(1.35rem,3.6vw,2.1rem)] leading-[1.15] font-black text-[#2a1266] uppercase`}
              >
                Offrez du crédit LIL_OG_OS 💿
              </h2>

              <p className={`${MONO} mt-4 text-[1rem] leading-[1.7] text-[#3b3550]`}>
                En manque d&apos;inspiration ? Générez un disque de crédit personnalisé avec clé
                d&apos;activation instantanée par email.
              </p>

              {/* Accès rapide : trois montants qui amorcent le graveur. */}
              <div className="mt-6 flex flex-wrap justify-center gap-2.5 lg:justify-start">
                {AMOUNTS.map((amount) => (
                  <Link
                    key={amount}
                    href={`/gift-card?montant=${amount}`}
                    className={`${MONO} lhg-chip rounded-lg border-2 border-[#c6c2d8] ${PLASTIC_FACE} px-4 py-2.5 text-[0.9375rem] font-bold tracking-[0.04em] text-[#262626] uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7147d4] ${PLASTIC}`}
                    style={{ boxShadow: "0 3px 0 rgba(0,0,0,0.18)" }}
                  >
                    [ {amount}€ ]
                  </Link>
                ))}
              </div>

              <Link
                href="/gift-card"
                className={`${MONO} lhg-cta mt-6 inline-block rounded-2xl border-2 border-[#5d0b46] px-[clamp(16px,3vw,30px)] py-3.5 text-[clamp(0.875rem,2vw,1rem)] font-black tracking-[0.06em] text-white uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff5ec4]`}
                style={{
                  background: "linear-gradient(180deg,#ff9ee4 0%,#ff45b4 42%,#d61f8f 74%,#a6106b 100%)",
                  textShadow: "0 2px 0 rgba(90,0,60,.55)",
                }}
              >
                [ 💾 Graver un disque (dès 20€) ]
              </Link>
            </div>
          </div>
        </WindowFrame>
      </div>
    </section>
  );
}
