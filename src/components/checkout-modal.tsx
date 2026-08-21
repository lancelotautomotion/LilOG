"use client";

/* ============================================================
   CHECKOUT_PROTOCOL.EXE — écran de validation Y2K arcade
   ------------------------------------------------------------
   Remplace l'ancien cœur ailé qui traversait l'écran. Ici, une
   vraie modale : voile sombre + balayage CRT, insigne cœur ailé
   en pixel art, verdict en néon, puis le ticket de caisse qui
   sort de l'imprimante thermique.

   Tout le pixel art est décrit en grilles de caractères plus
   bas : un pixel = un caractère, une lettre = une couleur. Ça
   se relit et se retouche comme un sprite, sans avoir à
   déchiffrer des coordonnées SVG.
   ============================================================ */

import Image from "next/image";
import type { CartLine } from "@/lib/shopify/types";
import logoBlack from "../../public/logo-black.png";

/* ---- Palettes ---------------------------------------------------------- */

/* Cœur : rose néon, biseauté clair en haut à gauche, ombré à droite. */
const HEART_COLORS: Record<string, string> = {
  o: "#5C0630", // contour
  d: "#B3005E", // ombre droite
  m: "#FF1E8E", // rose néon
  h: "#FF9BD2", // éclairci
  w: "#FFFFFF", // reflet spéculaire
};

/* 12 × 10. Contour net, lumière en haut à gauche, ombre à droite. */
const HEART = [
  "..oo....oo..",
  ".owwo..ommo.",
  "owhmmmmmmmdo",
  "ohmmmmmmmmdo",
  "ommmmmmmmmdo",
  ".ommmmmmmdo.",
  "..ommmmmdo..",
  "...ommmdo...",
  "....omdo....",
  ".....oo.....",
];

/* Aile : blanche, contour violet, plumes détachées en bas. */
const WING_COLORS: Record<string, string> = {
  o: "#6B4FA8", // contour violet
  s: "#C9C2E4", // gris de relief
  w: "#FFFFFF",
};

/* 16 × 12, dessinée pour l'aile GAUCHE (elle s'accroche par son bord
   droit au cœur). Bord haut en courbe, bord bas en trois lobes : ce sont
   les pointes de plumes. L'aile droite réutilise la même grille, retournée
   en CSS — la symétrie ne peut donc pas dériver. */
const WING = [
  "..........oooooo",
  "........oowwwwws",
  "......oowwwwwwws",
  "....oowwwwwwwwws",
  "..oowwwwwwwwwwws",
  ".owwwwwwwwwwwwws",
  "owwwwswwwwwswwws",
  "oswwwoswwwwoswws",
  ".oswo.oswwo.osws",
  "..oso..owso..oss",
  "...o....oo....os",
  "........o......o",
];

/* ---- Rendu d'une grille en <svg> de carrés -----------------------------
   shapeRendering="crispEdges" : pas d'anti-aliasing, les pixels restent
   carrés même agrandis — c'est tout l'intérêt du pixel art. */
function PixelGrid({
  grid,
  colors,
  className,
}: {
  grid: string[];
  colors: Record<string, string>;
  className?: string;
}) {
  const w = grid[0].length;
  const h = grid.length;
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={className}
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      {grid.flatMap((row, y) =>
        [...row].map((ch, x) =>
          colors[ch] ? (
            <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={colors[ch]} />
          ) : null,
        ),
      )}
    </svg>
  );
}

/* Étoile scintillante à 4 branches, elle aussi en pixels. */
function PixelStar({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 7 7" className={className} style={style} shapeRendering="crispEdges" aria-hidden="true">
      <rect x="3" y="0" width="1" height="7" fill="#FFFFFF" />
      <rect x="0" y="3" width="7" height="1" fill="#FFFFFF" />
      <rect x="2" y="2" width="3" height="3" fill="#FFFFFF" />
      <rect x="2" y="1" width="3" height="5" fill="#FFF2FA" opacity="0.85" />
      <rect x="1" y="2" width="5" height="3" fill="#FFF2FA" opacity="0.85" />
    </svg>
  );
}

/* Position et cadence de chaque étoile autour de l'insigne. */
const STARS = [
  { top: "2%", left: "8%", size: 14, delay: "0ms" },
  { top: "-4%", left: "48%", size: 10, delay: "260ms" },
  { top: "6%", left: "88%", size: 13, delay: "520ms" },
  { top: "62%", left: "2%", size: 11, delay: "160ms" },
  { top: "74%", left: "92%", size: 15, delay: "400ms" },
  { top: "88%", left: "34%", size: 9, delay: "640ms" },
];

/* Numéro de ticket dérivé du contenu du panier, et non de Date.now() :
   une valeur tirée à l'affichage diffère entre le rendu serveur et le
   rendu client, et React signale une erreur d'hydratation. Ici, mêmes
   articles = même numéro, des deux côtés. */
function ticketNumber(lines: CartLine[], subtotal: number): string {
  const seed = lines.map((l) => `${l.id}x${l.quantity}`).join("|") + `#${subtotal}`;
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 1000000;
  return String(h).padStart(6, "0");
}

export function CheckoutModal({
  lines,
  subtotal,
  message,
  onContinue,
}: {
  lines: CartLine[];
  subtotal: number;
  message: string;
  /* Part tout de suite au paiement, sans attendre la redirection
     automatique. */
  onContinue?: () => void;
}) {
  const count = lines.reduce((n, l) => n + l.quantity, 0);
  const ticket = ticketNumber(lines, subtotal);
  /* Un gros panier ne doit pas pousser le bouton hors de l'écran : au-delà
     de 4 lignes le ticket résume le reste, comme un vrai ticket de caisse
     tronqué — plutôt qu'une barre de défilement dans le papier. */
  const shown = lines.slice(0, 4);
  const hidden = lines.length - shown.length;

  return (
    <div
      className="ok-overlay fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Paiement en cours"
      aria-live="polite"
    >
      {/* Balayage CRT : purement décoratif, ne doit jamais capter le clic. */}
      <div className="ok-crt pointer-events-none fixed inset-0" aria-hidden="true" />

      <div className="ok-modal relative my-auto w-[min(430px,94vw)]">
        {/* ---- Insigne cœur ailé ---- */}
        <div className="ok-badge relative mx-auto h-[128px] w-[min(300px,80vw)]">
          {/* Le battement anime le conteneur, le retournement de l'aile
              droite vit sur le <svg> à l'intérieur : les deux transforms
              ne se marchent donc jamais dessus. */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="ok-wing ok-wing-l">
              <PixelGrid grid={WING} colors={WING_COLORS} />
            </span>
            <PixelGrid grid={HEART} colors={HEART_COLORS} className="ok-heart" />
            <span className="ok-wing ok-wing-r">
              <PixelGrid grid={WING} colors={WING_COLORS} />
            </span>
          </div>

          {STARS.map((s, i) => (
            <PixelStar
              key={i}
              className="ok-star absolute"
              style={{ top: s.top, left: s.left, width: s.size, height: s.size, animationDelay: s.delay }}
            />
          ))}
        </div>

        {/* ---- Verdict ---- */}
        <p className="ok-title mt-3 text-center">&gt; OUTFIT SECURED &lt;</p>
        <p className="ok-sub mt-1 text-center">TRANSACTION_APPROVED // TICKET_GENERATED</p>

        {/* ---- Ticket de caisse thermique ---- */}
        <div className="ok-receipt mx-auto mt-4 w-[min(320px,86vw)]">
          <div className="ok-receipt-paper">
            {/* Même logo que le header, pas un nom retapé à la main. */}
            <Image src={logoBlack} alt="Lil'OG" className="ok-r-logo" priority />
            <p className="ok-r-sub">Seconde main Y2K - Paris</p>
            <div className="ok-r-rule" />

            <ul className="ok-r-lines">
              {shown.map((l) => (
                <li key={l.id}>
                  <span className="ok-r-name">
                    {l.quantity > 1 && `${l.quantity}× `}
                    {l.title}
                  </span>
                  <span className="ok-r-price">{(l.price * l.quantity).toFixed(2)}€</span>
                </li>
              ))}
              {hidden > 0 && (
                <li className="ok-r-more">
                  <span>… ET {hidden} AUTRE{hidden > 1 ? "S" : ""} ARTICLE{hidden > 1 ? "S" : ""}</span>
                </li>
              )}
            </ul>

            <div className="ok-r-rule" />
            <p className="ok-r-total">
              <span>TOTAL ({count})</span>
              <span>{subtotal.toFixed(2)}€</span>
            </p>
            <p className="ok-r-meta">TICKET #{ticket} · CAISSE 01</p>
            <p className="ok-r-msn">{message}</p>
          </div>
          {/* Bord déchiré du papier thermique */}
          <div className="ok-receipt-tear" aria-hidden="true" />
        </div>

        {/* ---- Redirection ----
            Le départ vers le paiement est automatique au bout de 3 s ; le
            bouton sert à ne pas attendre. */}
        <div className="mt-4 flex flex-col items-center gap-2">
          <button type="button" className="ok-btn" onClick={onContinue} autoFocus>
            [ 💾 CONTINUER VERS LE PAIEMENT ]
          </button>
          <p className="ok-redir">REDIRECTION AUTOMATIQUE…</p>
        </div>
      </div>
    </div>
  );
}
