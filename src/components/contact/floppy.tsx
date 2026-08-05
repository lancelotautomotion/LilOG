"use client";

/* ============================================================
   Disquette 3.5" — réplique fidèle de public/disquettes.png
   ------------------------------------------------------------
   Extrait de /contact pour être partagé avec les autres pages
   qui parlent le même dialecte Y2K (/cgv notamment). Le rendu
   est strictement identique : aucun réglage n'a bougé.

   Le boîtier est dessiné en SVG dans un viewBox calqué au pixel
   près sur le visuel de référence (corps 494 × 522, soit les
   proportions réelles d'une 3.5" : 90 × 94 mm). Toutes les cotes
   ci-dessous — rainures de moulage, encoches, obturateur, lucarne,
   flèche d'insertion, logo HD, trous de protection — sont relevées
   sur l'image source.

   L'étiquette reste du HTML posé par-dessus (positionné en %) :
   le texte demeure ainsi sélectionnable, traduisible et il se
   remet en page tout seul quelle que soit sa longueur.

   Les tailles typographiques internes sont exprimées en `cqw`
   (1 % de la largeur du conteneur) : la disquette est donc
   parfaitement homothétique à toutes les tailles d'écran.

   ⚠ PAREFEU : aucune classe globale. Les animations vivent dans
   <FloppyStyles /> et sont toutes préfixées `lilfd-`.
   ============================================================ */

import { ChromeStar, GemSticker, HoloAlien, HoloSmiley } from "@/components/contact/stickers";

const MONO = "font-[family-name:var(--mono)]";

export type FloppyVariant = "pink" | "purple" | "black";

type FloppySkin = {
  shellTop: string; // dégradé du plastique
  shellMid: string;
  shellBot: string;
  bevel: string; // liseré clair du chant supérieur
  groove: string; // fond sombre des rainures moulées
  window: string; // plastique vu à travers la lucarne de l'obturateur
  ink: string; // flèche + logo HD embossés
  header: string; // bandeau haut de l'étiquette
  rule: string; // filet du bandeau
  title: string;
  paper: string;
  bodyInk: string;
  grain: number; // opacité du grain plastique
  seed: number; // graine de turbulence (grain différent par disquette)
};

const FLOPPY_SKIN: Record<FloppyVariant, FloppySkin> = {
  pink: {
    shellTop: "#F781B4",
    shellMid: "#ED5D93",
    shellBot: "#E24B85",
    bevel: "rgba(255,255,255,0.55)",
    groove: "rgba(105,6,42,0.62)",
    window: "#E85C92",
    ink: "#1B0710",
    header: "#EBDCDF",
    rule: "rgba(0,0,0,0.12)",
    title: "#FF3D8E",
    paper: "#EDECEC",
    bodyInk: "#2B2B2B",
    grain: 0.17,
    seed: 3,
  },
  purple: {
    shellTop: "#A180DF",
    shellMid: "#8765C4",
    shellBot: "#7A55B8",
    bevel: "rgba(255,255,255,0.5)",
    groove: "rgba(40,10,90,0.6)",
    window: "#8967C9",
    ink: "#3D1C8A",
    header: "#DCD6E1",
    rule: "rgba(0,0,0,0.12)",
    title: "#7B4BD6",
    paper: "#EDECEC",
    bodyInk: "#2B2B2B",
    grain: 0.18,
    seed: 11,
  },
  black: {
    shellTop: "#3A3A3A",
    shellMid: "#262626",
    shellBot: "#1B1B1B",
    bevel: "rgba(255,255,255,0.3)",
    groove: "rgba(0,0,0,0.85)",
    window: "#1D1D1E",
    ink: "#131313",
    header: "#262626",
    rule: "rgba(255,255,255,0.14)",
    title: "#FFFFFF",
    paper: "#EDECEC",
    bodyInk: "#2B2B2B",
    grain: 0.15,
    seed: 23,
  },
};

/* Silhouette du boîtier : coins arrondis + biseau haut-droit
   (le détrompeur anti-insertion à l'envers). */
const SHELL_PATH =
  "M12 0 H468 L494 29 V510 Q494 522 482 522 H12 Q0 522 0 510 V12 Q0 0 12 0 Z";

/* Flèche d'insertion (boîte 24 × 39.5, relevée sur la référence). */
const ARROW_PATH =
  "M12 0 L24 28 L18.5 28 L18.5 37.5 Q18.5 39.5 16.5 39.5 L8 39.5 Q6 39.5 6 37.5 L6 28 L0 28 Z";

/* Logo HD : quatre montants + la panse du « D » en anneau (boîte 37 × 37). */
const HD_BARS_PATH =
  "M0 0 H5 V37 H0 Z M6.5 0 H11.5 V37 H6.5 Z" +
  " M13 0 H18 V37 H13 Z M19.5 0 H24.5 V37 H19.5 Z" +
  " M0 15 H24.5 V20 H0 Z";
const HD_BOWL_PATH =
  "M24.5 0 H27.5 A11 18.5 0 0 1 27.5 37 H24.5 Z" +
  " M24.5 6 H27 A6.5 12.5 0 0 1 27 31 H24.5 Z";

/* ---- Animations des disquettes ----------------------------
   Injectées via une balise <style> locale et toutes préfixées
   `lilfd-` : rien ne fuit vers globals.css ni vers le reste du
   site. Tout est désactivé si l'utilisateur a demandé moins
   d'animations. */
const FLOPPY_CSS = `
.lilfd{transition:transform .38s cubic-bezier(.2,.8,.3,1),filter .38s ease;
  filter:drop-shadow(0 7px 11px rgba(30,36,48,.26))}
.lilfd:hover{transform:translateY(-9px) rotate(-.5deg);
  filter:drop-shadow(0 20px 24px rgba(30,36,48,.3))}
.lilfd-label{transition:box-shadow .38s ease}
.lilfd:hover .lilfd-label{box-shadow:0 3px 8px rgba(0,0,0,.32),inset 0 1px 0 rgba(255,255,255,.7)}

@keyframes lilfd-bob{
  0%,100%{transform:translate3d(0,0,0) rotate(var(--r,0deg)) scale(1)}
  50%{transform:translate3d(0,-4%,0) rotate(calc(var(--r,0deg) + 5deg)) scale(1.04)}
}
.lilfd-sticker{animation:lilfd-bob 6s ease-in-out infinite;
  filter:drop-shadow(0 2px 3px rgba(0,0,0,.32));
  transition:transform .35s cubic-bezier(.2,.8,.3,1)}
.lilfd-d2{animation-duration:7.2s;animation-delay:-1.6s}
.lilfd-d3{animation-duration:5.4s;animation-delay:-3.1s}
.lilfd-d4{animation-duration:8s;animation-delay:-4.4s}
.lilfd:hover .lilfd-sticker{animation-play-state:paused;
  transform:rotate(var(--r,0deg)) scale(1.16)}

@keyframes lilfd-gleam{from{transform:rotate(14deg) translateX(0)}
  to{transform:rotate(14deg) translateX(900px)}}
.lilfd:hover .lilfd-gleam{opacity:.55;animation:lilfd-gleam 1.05s ease-out}

@media (prefers-reduced-motion: reduce){
  .lilfd,.lilfd-sticker,.lilfd-label{transition:none}
  .lilfd:hover{transform:none}
  .lilfd-sticker,.lilfd:hover .lilfd-gleam{animation:none}
  .lilfd:hover .lilfd-sticker{transform:rotate(var(--r,0deg))}
}
`;

/** Feuille de style des disquettes — à monter une fois par page. */
export function FloppyStyles() {
  return <style>{FLOPPY_CSS}</style>;
}

/* ---- Disquette ---- */

export function Floppy({
  variant,
  name,
  text,
}: {
  variant: FloppyVariant;
  name: string;
  text: string;
}) {
  const s = FLOPPY_SKIN[variant];
  const uid = `fd-${variant}`;

  return (
    <div
      className="lilfd group relative mx-auto w-full max-w-[340px]"
      style={{ containerType: "inline-size" }}
    >
      {/* ---------- Boîtier ---------- */}
      <svg
        viewBox="0 0 494 522"
        className="lilfd-shell block w-full"
        role="presentation"
        aria-hidden="true"
      >
        <defs>
          <clipPath id={`${uid}-clip`}>
            <path d={SHELL_PATH} />
          </clipPath>

          <linearGradient id={`${uid}-shell`} x1="0.1" y1="0" x2="0.55" y2="1">
            <stop offset="0%" stopColor={s.shellTop} />
            <stop offset="28%" stopColor={s.shellMid} />
            <stop offset="100%" stopColor={s.shellBot} />
          </linearGradient>

          {/* Obturateur métal : dégradé relevé sur la référence (233 → 198). */}
          <linearGradient id={`${uid}-metal`} x1="0" y1="0" x2="0.25" y2="1">
            <stop offset="0%" stopColor="#EDEDEC" />
            <stop offset="22%" stopColor="#E1E1E0" />
            <stop offset="58%" stopColor="#CFCFCE" />
            <stop offset="100%" stopColor="#C4C4C3" />
          </linearGradient>

          {/* Grain « plastique moulé » : turbulence + seuillage en bandes,
              ce qui recrée les volutes gravées du visuel d'origine. */}
          <filter id={`${uid}-grain`} x="0" y="0" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.085"
              numOctaves="2"
              seed={s.seed}
              result="t"
            />
            <feColorMatrix
              in="t"
              type="matrix"
              values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  1 0 0 0 0"
              result="a"
            />
            <feComponentTransfer in="a">
              <feFuncA type="table" tableValues="0 1 0 1 0 1 0" />
            </feComponentTransfer>
          </filter>

          <filter id={`${uid}-brushed`} x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9 0.14" numOctaves="2" seed="5" result="t" />
            <feColorMatrix
              in="t"
              type="matrix"
              values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0.5 0 0 0 0"
            />
          </filter>

          <linearGradient id={`${uid}-sweep`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#fff" stopOpacity="0" />
            <stop offset="50%" stopColor="#fff" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>

        <g clipPath={`url(#${uid}-clip)`}>
          {/* Plastique */}
          <rect width="494" height="522" fill={`url(#${uid}-shell)`} />

          {/* Volutes gravées : une passe creuse + une passe en relief. */}
          <g style={{ mixBlendMode: "multiply" }} opacity={s.grain}>
            <rect width="494" height="522" filter={`url(#${uid}-grain)`} />
          </g>
          <g style={{ mixBlendMode: "screen" }} opacity={s.grain * 0.55} transform="translate(-1.2,-1.2)">
            <rect width="494" height="522" filter={`url(#${uid}-grain)`} />
          </g>

          {/* Rainures de moulage verticales (relevées à x = 50 et x = 445) */}
          <rect x="47.5" y="0" width="3" height="522" fill={s.groove} opacity="0.75" />
          <rect x="50.5" y="0" width="1.6" height="522" fill="#fff" opacity="0.3" />
          <rect x="443.5" y="0" width="2.6" height="522" fill={s.groove} opacity="0.7" />
          <rect x="446" y="0" width="1.6" height="522" fill="#fff" opacity="0.28" />

          {/* Contour du logement d'obturateur (rainure en L) */}
          <path
            d="M49 0 V152 Q49 168 65 168 H385"
            fill="none"
            stroke={s.groove}
            strokeWidth="2.6"
            opacity="0.7"
          />
          <path
            d="M52 0 V152 Q52 171 68 171 H385"
            fill="none"
            stroke="#fff"
            strokeWidth="1.6"
            opacity="0.26"
          />

          {/* Petites encoches du chant supérieur */}
          <rect x="52" y="0" width="19" height="6" fill="#fff" opacity="0.28" />
          <rect x="52" y="5.4" width="19" height="1.4" fill={s.groove} opacity="0.55" />
          <rect x="390" y="0" width="50" height="6" fill="#fff" opacity="0.24" />
          <rect x="390" y="5.4" width="50" height="1.4" fill={s.groove} opacity="0.5" />

          {/* Flèche d'insertion embossée
              (relevé : pointe à 25.5/31.5, base de tête à y=59.5,
              hampe de 12.5 de large jusqu'à y=71) */}
          <g transform="translate(13.5,31.5)">
            <path
              d={ARROW_PATH}
              fill="none"
              stroke="#fff"
              strokeWidth="2"
              opacity="0.34"
              transform="translate(0.8,1.6)"
            />
            <path d={ARROW_PATH} fill={s.ink} opacity="0.94" />
          </g>

          {/* Logo « HD » haute densité, embossé dans le plastique */}
          <g transform="translate(413.5,37.5)">
            <g transform="translate(0.8,1.6)" fill="none" stroke="#fff" opacity="0.3">
              <path d={HD_BARS_PATH} fill="#fff" stroke="none" />
              <path d={HD_BOWL_PATH} fill="#fff" fillRule="evenodd" stroke="none" />
            </g>
            <g fill={s.ink} opacity="0.94">
              <path d={HD_BARS_PATH} />
              <path d={HD_BOWL_PATH} fillRule="evenodd" />
            </g>
          </g>

          {/* ---------- Obturateur métallique ---------- */}
          <g>
            <path
              d="M122 -4 H383 V158 Q383 168 373 168 H132 Q122 168 122 158 Z"
              fill={`url(#${uid}-metal)`}
            />
            <g clipPath={`url(#${uid}-clip)`} opacity="0.5" style={{ mixBlendMode: "overlay" }}>
              <path
                d="M122 -4 H383 V158 Q383 168 373 168 H132 Q122 168 122 158 Z"
                filter={`url(#${uid}-brushed)`}
              />
            </g>
            {/* chants */}
            <rect x="122" y="0" width="261" height="1.6" fill="#fff" opacity="0.75" />
            <rect x="122" y="0" width="1.6" height="166" fill="#fff" opacity="0.5" />
            <path
              d="M122 166 H383"
              stroke="rgba(0,0,0,0.35)"
              strokeWidth="3"
              fill="none"
            />
            <path
              d="M122 169.5 H385"
              stroke="rgba(0,0,0,0.22)"
              strokeWidth="3"
              fill="none"
            />

            {/* Lucarne : on voit le plastique du boîtier au travers */}
            <g>
              <rect x="275" y="18" width="67" height="140" rx="7" fill={s.window} />
              <rect
                x="275"
                y="18"
                width="67"
                height="140"
                rx="7"
                fill="none"
                stroke="rgba(0,0,0,0.45)"
                strokeWidth="2.4"
              />
              <rect x="277" y="20" width="63" height="11" rx="5" fill="rgba(0,0,0,0.13)" />
            </g>

            {/* Sérigraphie technique */}
            <g fill="#111" fontFamily="Arial, Helvetica, sans-serif" fontWeight="700">
              <text x="136" y="72" fontSize="13" textLength="80" lengthAdjust="spacingAndGlyphs">
                FORMATTED
              </text>
              <text x="136" y="103" fontSize="12" textLength="45" lengthAdjust="spacingAndGlyphs">
                1.44MB
              </text>
              <text x="136" y="127" fontSize="14" textLength="91.5" lengthAdjust="spacingAndGlyphs">
                HIGH DENSITY
              </text>
              <text x="136" y="149" fontSize="25" textLength="122.5" lengthAdjust="spacingAndGlyphs">
                MFD-2HD
              </text>
            </g>
          </g>

          {/* Trous de protection en écriture / haute densité */}
          {[16, 458].map((x) => (
            <g key={x}>
              <rect x={x} y="466" width="20" height="20" rx="1.5" fill="#DCDBE0" />
              <path
                d={`M${x} 486 V466 H${x + 20}`}
                fill="none"
                stroke="rgba(0,0,0,0.45)"
                strokeWidth="2.4"
              />
              <path
                d={`M${x} 486 H${x + 20} V466`}
                fill="none"
                stroke="rgba(255,255,255,0.5)"
                strokeWidth="1.6"
              />
            </g>
          ))}

          {/* Logement de l'étiquette (l'étiquette elle-même est en HTML) */}
          <rect
            x="49"
            y="210"
            width="397"
            height="300"
            rx="13"
            fill="none"
            stroke={s.groove}
            strokeWidth="2.6"
            opacity="0.6"
          />

          {/* Chant supérieur + ombrage interne du boîtier */}
          <path d={SHELL_PATH} fill="none" stroke={s.bevel} strokeWidth="2" />
          <path
            d={SHELL_PATH}
            fill="none"
            stroke="rgba(0,0,0,0.28)"
            strokeWidth="2.4"
            transform="translate(0,3)"
          />

          {/* Éclat qui balaie le plastique au survol */}
          <rect
            className="lilfd-gleam"
            x="-260"
            y="-120"
            width="150"
            height="780"
            fill={`url(#${uid}-sweep)`}
            opacity="0"
            transform="rotate(14 247 261)"
          />
        </g>
      </svg>

      {/* ---------- Étiquette (HTML) ---------- */}
      <div
        className="lilfd-label absolute flex flex-col overflow-hidden"
        style={{
          left: "10.53%",
          right: "9.92%",
          top: "40.8%",
          bottom: "2.68%",
          borderRadius: "clamp(3px,1.7cqw,9px)",
          background: s.paper,
          boxShadow:
            "0 1px 3px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.65)",
        }}
      >
        <div className="relative shrink-0" style={{ height: "24.4%", background: s.header }}>
          <div
            className="absolute inset-x-0"
            style={{ top: "30%", height: 1, background: s.rule }}
          />
          <div
            className={`${MONO} absolute inset-x-0 bottom-0 top-[30%] flex items-center justify-center px-[6%] text-center font-bold`}
            style={{ color: s.title, fontSize: "4.55cqw", letterSpacing: "0.085em" }}
          >
            {name}
          </div>
        </div>
        <div className="flex flex-1 items-center px-[7.5%]">
          <p
            className={MONO}
            style={{ color: s.bodyInk, fontSize: "3.85cqw", lineHeight: 1.78 }}
          >
            {text}
          </p>
        </div>
      </div>

      {/* ---------- Pastilles ---------- */}
      {variant === "pink" && (
        <>
          <div
            className="lilfd-sticker absolute"
            style={{ left: "2.6%", top: "32.2%", width: "15.6%", aspectRatio: "1", ["--r" as string]: "-14deg" }}
          >
            <GemSticker uid={`${uid}-a`} shape="star" hue={["#FFB3D6", "#F0509A", "#B7175C"]} />
          </div>
          <div
            className="lilfd-sticker lilfd-d2 absolute"
            style={{ left: "76.5%", top: "81%", width: "16.2%", aspectRatio: "1", ["--r" as string]: "10deg" }}
          >
            <GemSticker uid={`${uid}-b`} shape="heart" hue={["#FFC0DF", "#EE4B96", "#B3155A"]} />
          </div>
        </>
      )}

      {variant === "purple" && (
        <>
          {/* Grappe d'étoiles chrome — positions relevées sur la référence */}
          <div
            className="absolute"
            style={{ left: "80.5%", top: "22.9%", width: "17.7%", aspectRatio: "0.847" }}
          >
            <div className="lilfd-sticker absolute" style={{ left: "22.9%", top: "0%", width: "55.2%", aspectRatio: "1", ["--r" as string]: "14deg" }}>
              <ChromeStar uid={`${uid}-s1`} />
            </div>
            <div className="lilfd-sticker lilfd-d2 absolute" style={{ left: "0%", top: "39.5%", width: "34.9%", aspectRatio: "1", ["--r" as string]: "-20deg" }}>
              <ChromeStar uid={`${uid}-s2`} />
            </div>
            <div className="lilfd-sticker lilfd-d3 absolute" style={{ left: "46.3%", top: "53.2%", width: "53.7%", aspectRatio: "1", ["--r" as string]: "-6deg" }}>
              <ChromeStar uid={`${uid}-s3`} />
            </div>
            <div className="lilfd-sticker lilfd-d4 absolute" style={{ left: "2.9%", top: "72.6%", width: "36.2%", aspectRatio: "1", ["--r" as string]: "10deg" }}>
              <ChromeStar uid={`${uid}-s4`} />
            </div>
          </div>
          <div
            className="lilfd-sticker lilfd-d3 absolute"
            style={{ left: "3.4%", top: "83%", width: "16.2%", aspectRatio: "1", ["--r" as string]: "-10deg" }}
          >
            <HoloSmiley uid={`${uid}-sm`} />
          </div>
        </>
      )}

      {variant === "black" && (
        <>
          <div
            className="lilfd-sticker absolute"
            style={{ left: "83%", top: "24.5%", width: "19.2%", aspectRatio: "1", ["--r" as string]: "8deg" }}
          >
            <HoloAlien uid={`${uid}-al`} />
          </div>
          <div
            className="lilfd-sticker lilfd-d2 absolute"
            style={{ left: "8.1%", top: "84.9%", width: "12.6%", aspectRatio: "1", ["--r" as string]: "-16deg" }}
          >
            <ChromeStar uid={`${uid}-cs`} />
          </div>
        </>
      )}
    </div>
  );
}
