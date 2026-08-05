"use client";

/* ============================================================
   Y2KPhone — le clapet Lil'OG interactif
   ------------------------------------------------------------
   Le téléphone N'EST PAS redessiné en HTML/CSS : on affiche le
   visuel de référence (`public/téléphone.png`, détouré et exporté
   en `public/y2k-phone.webp`) et on pose par-dessus une couche
   d'interactions invisible :

     • 12 zones cliquables calées au pixel sur les touches, plus
       les touches ✆ / ⛔ — coordonnées relevées sur l'image
       d'origine (997 × 1577 px, recadrée en 813 × 1483 px) et
       exprimées en % pour rester homothétiques ;
     • un écran LCD reconstruit, lui, en CSS : c'est le seul
       morceau « repeint », puisqu'il doit devenir dynamique ;
     • un reflet glossy masqué par l'alpha de l'image, donc
       parfaitement épousé à la silhouette du téléphone.

   Le clapet s'ouvre pour de vrai : l'image est découpée en deux
   demi-plans (`clip-path`) le long de la charnière, et la moitié
   haute pivote en 3D autour de l'axe du barillet.

   ⚠ PAREFEU : comme le reste de /contact, tout vit dans ce
   fichier. Les classes sont préfixées `y2kp-`, `globals.css`
   n'est ni lu ni modifié.
   ============================================================ */

import { useCallback, useEffect, useRef, useState } from "react";

import { GemSticker } from "@/components/contact/stickers";

/* ------------------------------------------------------------
   Constantes de calage (en % de la boîte image 813 × 1483)
   ------------------------------------------------------------ */

/** Visuel de référence détouré.
 *  Régénération depuis `public/téléphone.png` (997 × 1577) :
 *  fond gris uni supprimé par remplissage depuis les bords, puis
 *  recadrage sur la silhouette — crop (20, 30) → (833, 1513),
 *  soit 813 × 1483 px, exporté en WebP qualité 92 (~150 Ko).
 *  Si l'asset est régénéré avec un autre cadrage, tous les
 *  pourcentages ci-dessous sont à recalculer. */
const ASSET = "/y2k-phone.webp";

/** Son de touche optionnel. Déposer le fichier suffit à l'activer ;
 *  tant qu'il est absent, on retombe sur la synthèse DTMF interne. */
const KEY_SOUND_SRC = "/sounds/key.mp3";

/** Inclinaison du téléphone dans le visuel (mesurée sur l'image). */
const TILT = 7.1;

/** Longueur maximale du numéro composé. */
const MAX_LEN = 18;

/* ------------------------------------------------------------
   Bijoux du clapet
   ------------------------------------------------------------
   Le visuel de référence portait des strass photoréalistes qui
   juraient avec la DA du site. Les petits (ronds facettés, étoiles
   métalliques) ont été gommés dans l'asset lui-même ; les quatre
   grosses gemmes roses, elles, débordent de la silhouette — les
   effacer obligerait à reconstruire le bord du téléphone. On pose
   donc par-dessus le sticker vectoriel de même forme, calibré pour
   les recouvrir entièrement (~1,3× leur emprise). Ce sont les
   mêmes pastilles que les disquettes d'INFOS_PRATIQUES.

   Emprises relevées sur le visuel 813 × 1483 :
     étoile capot   x258-371  y128-247
     cœur capot     x694-808  y511-620
     étoile breloque x7-126   y1133-1265
     cœur base      x604-692  y1295-1389
   ------------------------------------------------------------ */

const PINK_STAR: [string, string, string] = ["#FFB3D6", "#F0509A", "#B7175C"];
const PINK_HEART: [string, string, string] = ["#FFC0DF", "#EE4B96", "#B3155A"];

type Gem = {
  id: string;
  half: "lid" | "base";
  shape: "star" | "heart";
  hue: [string, string, string];
  left: number;
  top: number;
  width: number;
  rot: number;
};

/* Les rotations ne sont pas estimées à l'œil mais relevées sur le visuel :
   angle des cinq pointes de chaque étoile photographiée, ramené modulo 72°
   (l'étoile SVG de référence pointe vers le haut). */
const GEMS: Gem[] = [
  { id: "star-lid", half: "lid", shape: "star", hue: PINK_STAR, left: 27.4, top: 7.0, width: 22.5, rot: 20.5 },
  { id: "heart-lid", half: "lid", shape: "heart", hue: PINK_HEART, left: 82.6, top: 32.6, width: 19.6, rot: 10 },
  { id: "star-charm", half: "base", shape: "star", hue: PINK_STAR, left: -4.0, top: 74.75, width: 24.5, rot: 11.5 },
  { id: "heart-base", half: "base", shape: "heart", hue: PINK_HEART, left: 71.4, top: 85.8, width: 16.6, rot: 6 },
];

function Gems({ where }: { where: "lid" | "base" }) {
  return (
    <>
      {GEMS.filter((g) => g.half === where).map((g) => (
        <span
          key={g.id}
          aria-hidden
          className="y2kp-gem"
          style={{
            left: `${g.left}%`,
            top: `${g.top}%`,
            width: `${g.width}%`,
            transform: `rotate(${g.rot}deg)`,
          }}
        >
          <GemSticker uid={`y2kp-${g.id}`} shape={g.shape} hue={g.hue} />
        </span>
      ))}
    </>
  );
}

type Hotspot = { id: string; label: string; x: number; y: number };

/** Centres des 12 touches du pavé numérique. */
const KEYPAD: Hotspot[] = [
  { id: "1", label: "1", x: 35.42, y: 70.67 },
  { id: "2", label: "2 ABC", x: 52.83, y: 72.08 },
  { id: "3", label: "3 DEF", x: 69.56, y: 73.23 },
  { id: "4", label: "4 GHI", x: 34.32, y: 75.66 },
  { id: "5", label: "5 JKL", x: 51.78, y: 77.07 },
  { id: "6", label: "6 MNO", x: 68.51, y: 78.25 },
  { id: "7", label: "7 PQRS", x: 33.27, y: 80.71 },
  { id: "8", label: "8 TUV", x: 50.68, y: 82.13 },
  { id: "9", label: "9 WXYZ", x: 67.47, y: 83.24 },
  { id: "*", label: "étoile", x: 32.41, y: 85.74 },
  { id: "0", label: "0", x: 49.57, y: 87.19 },
  { id: "#", label: "dièse, efface le dernier caractère", x: 66.42, y: 88.27 },
];

/** Touches appel / raccrocher du bloc navigation. */
const NAV: Hotspot[] = [
  { id: "call", label: "appel", x: 35.67, y: 64.94 },
  { id: "end", label: "raccrocher, efface le numéro", x: 71.34, y: 67.9 },
];

/* Taille des zones : la surface cliquable (`hit`) déborde
   volontairement la touche pour rester confortable au doigt, le
   capuchon (`cap`) épouse lui le contour réel de la touche. */
const HIT = { key: [16.24, 4.72], nav: [15.25, 3.91] } as const;
const CAP = { key: ["85%", "74%"], nav: ["87%", "86%"] } as const;

/* Tonalités DTMF réelles : deux sinusoïdes par touche. Sert de
   repli tant que `/sounds/key.mp3` n'est pas déposé. */
const DTMF: Record<string, [number, number]> = {
  "1": [697, 1209], "2": [697, 1336], "3": [697, 1477],
  "4": [770, 1209], "5": [770, 1336], "6": [770, 1477],
  "7": [852, 1209], "8": [852, 1336], "9": [852, 1477],
  "*": [941, 1209], "0": [941, 1336], "#": [941, 1477],
  call: [440, 480], end: [480, 620],
};

/* Grain numérique de l'écran — SVG inline, aucun fichier à charger. */
const NOISE_URL =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E\")";

/* ============================================================
   Audio — « déposer le fichier suffit »
   ------------------------------------------------------------
   1. l'ArrayBuffer de key.mp3 est préchargé au montage ;
   2. il est décodé au premier geste utilisateur (l'AudioContext
      n'est créé qu'à ce moment-là, donc jamais bloqué) ;
   3. chaque frappe crée son propre AudioBufferSourceNode : les
      clics rapides se superposent au lieu de se couper, ce qu'un
      <audio> unique qu'il faut rembobiner ne sait pas faire.
   Fichier absent (404) → synthèse DTMF.
   ============================================================ */
function useKeySound(muted: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);
  const rawRef = useRef<ArrayBuffer | null>(null);
  const bufRef = useRef<AudioBuffer | null>(null);
  const decodingRef = useRef(false);

  useEffect(() => {
    let alive = true;
    fetch(KEY_SOUND_SRC)
      .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error("absent"))))
      .then((b) => {
        if (alive) rawRef.current = b;
      })
      .catch(() => {
        /* Pas de fichier : la synthèse prend le relais. */
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(
    () => () => {
      void ctxRef.current?.close();
    },
    [],
  );

  return useCallback(
    (key: string) => {
      if (muted) return;

      let ctx: AudioContext;
      try {
        ctxRef.current ??= new AudioContext();
        ctx = ctxRef.current;
        if (ctx.state === "suspended") void ctx.resume();
      } catch {
        return; // Web Audio indisponible : le retour visuel suffit.
      }

      // Décodage paresseux, une seule fois.
      if (!bufRef.current && rawRef.current && !decodingRef.current) {
        decodingRef.current = true;
        const raw = rawRef.current;
        rawRef.current = null;
        void ctx
          .decodeAudioData(raw)
          .then((b) => {
            bufRef.current = b;
          })
          .catch(() => {})
          .finally(() => {
            decodingRef.current = false;
          });
      }

      if (bufRef.current) {
        const src = ctx.createBufferSource();
        src.buffer = bufRef.current;
        // Micro-variation de hauteur : deux frappes ne sonnent
        // jamais exactement pareil, comme sur un vrai clavier.
        src.playbackRate.value = 0.97 + Math.random() * 0.06;
        const g = ctx.createGain();
        g.gain.value = 0.55;
        src.connect(g).connect(ctx.destination);
        src.start();
        return;
      }

      const tones = DTMF[key] ?? DTMF["1"];
      const now = ctx.currentTime;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.085, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
      gain.connect(ctx.destination);
      for (const f of tones) {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(f, now);
        osc.connect(gain);
        osc.start(now);
        osc.stop(now + 0.13);
      }
    },
    [muted],
  );
}

/** Vibration matérielle (mobile) — silencieuse si non supportée. */
function buzz(pattern: number | number[]) {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* iOS Safari : pas d'API vibration. */
  }
}

/* ============================================================
   Feuille de style locale (toutes les classes en `y2kp-`)
   ============================================================ */
const CSS = `
.y2kp{position:relative;width:100%;max-width:340px;margin-inline:auto;
  -webkit-tap-highlight-color:transparent}
.y2kp:focus{outline:none}
.y2kp:focus-visible{outline:2px solid #7147d4;outline-offset:6px;border-radius:18px}
/* Le contexte de conteneur vit sur la scène, pas sur .y2kp : les tailles
   internes sont en cqw et doivent suivre la largeur du VISUEL, laquelle
   se décorrèle de celle de .y2kp dès que le clapet est piloté en hauteur. */
.y2kp-stage{position:relative;width:100%;aspect-ratio:813/1483;
  container-type:inline-size;
  perspective:1500px;perspective-origin:52% 40%}

/* En deux colonnes, c'est la HAUTEUR disponible qui commande : le
   clapet se cale exactement sur celle du bloc SEND_MESSAGE.SYS et
   sa largeur se déduit du ratio. En pile (mobile), on revient au
   dimensionnement par la largeur — sans hauteur de référence, une
   taille pilotée par la hauteur s'effondrerait.

   .y2kp devient une colonne flex : la scène absorbe la hauteur restante
   et en déduit sa largeur par le ratio, tandis que le bandeau d'aide
   garde sa hauteur propre — sans quoi il déborderait sous le clapet et
   viendrait chevaucher les raccourcis. */
@media (min-width:1024px){
  .y2kp{height:100%;display:flex;flex-direction:column}
  .y2kp-stage{flex:1 1 0%;min-height:0;width:auto;height:auto;align-self:center}
  .y2kp-hint{flex:0 0 auto}
}
.y2kp-intro,.y2kp-float,.y2kp-shake,.y2kp-tilt{position:absolute;inset:0;
  transform-style:preserve-3d}

/* ---- Arrivée : rotation 3D + rebond, jouée une seule fois ---- */
@keyframes y2kp-arrive{
  0%{opacity:0;transform:translate3d(0,30px,0) scale(.82) rotateX(11deg) rotateY(-17deg)}
  55%{opacity:1;transform:translate3d(0,-9px,0) scale(1.035) rotateX(-3deg) rotateY(5deg)}
  78%{transform:translate3d(0,4px,0) scale(.992) rotateX(1.2deg) rotateY(-2deg)}
  100%{opacity:1;transform:none}
}
.y2kp[data-phase="idle"] .y2kp-intro{opacity:0}
.y2kp[data-phase="in"] .y2kp-intro,
.y2kp[data-phase="open"] .y2kp-intro,
.y2kp[data-phase="live"] .y2kp-intro{
  animation:y2kp-arrive 620ms cubic-bezier(.22,.9,.24,1.02) both}

/* ---- Flottement permanent : jamais figé ---- */
@keyframes y2kp-float{
  0%,100%{transform:translate3d(0,0,0) rotate(0deg)}
  33%{transform:translate3d(1px,-6px,0) rotate(-.42deg)}
  66%{transform:translate3d(-1px,-2px,0) rotate(.3deg)}
}
.y2kp[data-phase="live"] .y2kp-float{animation:y2kp-float 7.5s ease-in-out infinite}

/* ---- Vibration de fin d'ouverture ---- */
@keyframes y2kp-buzz{
  0%,100%{transform:translate3d(0,0,0) rotate(0deg)}
  12%{transform:translate3d(-2.4px,1.2px,0) rotate(.55deg)}
  27%{transform:translate3d(2.2px,-1.4px,0) rotate(-.5deg)}
  42%{transform:translate3d(-1.6px,1px,0) rotate(.34deg)}
  60%{transform:translate3d(1.4px,-.8px,0) rotate(-.26deg)}
  80%{transform:translate3d(-.6px,.4px,0) rotate(.12deg)}
}
.y2kp-shake.is-buzz{animation:y2kp-buzz 320ms ease-out}

/* ---- Parallaxe / suivi du curseur ---- */
.y2kp-tilt{
  transform:rotateX(calc(var(--py,0) * -3.4deg)) rotateY(calc(var(--px,0) * 5.2deg))
            scale(var(--hs,1));
  transition:transform 420ms cubic-bezier(.2,.8,.3,1)}
.y2kp:hover .y2kp-tilt{--hs:1.022}

/* ---- Les deux moitiés, découpées le long de la charnière ----
   Purement décoratives : le pointer-events:none garantit que la
   couche de touches reçoit les clics quel que soit l'empilement
   3D, sans avoir à la pousser en avant — un translateZ ici
   déroute le hit-testing de Chromium dans une chaîne
   preserve-3d imbriquée. */
.y2kp-half,.y2kp-fold{pointer-events:none}
.y2kp-half{position:absolute;inset:0}
.y2kp-half img{position:absolute;inset:0;width:100%;height:100%;display:block;
  filter:drop-shadow(0 18px 26px rgba(72,28,128,.26))}
.y2kp-clip-top{clip-path:polygon(0 0,100% 0,100% 53.48%,0 46.65%)}
.y2kp-clip-bottom{clip-path:polygon(0 46.65%,100% 53.48%,100% 100%,0 100%)}

/* Bijoux vectoriels — voir STICKERS plus bas. Posés dans la moitié
   à laquelle ils appartiennent, ils suivent donc le pliage. */
.y2kp-gem{position:absolute;aspect-ratio:1;
  filter:drop-shadow(0 2px 3px rgba(72,28,128,.34))}

.y2kp-fold{position:absolute;inset:0;transform-style:preserve-3d;
  transform-origin:56.21% 53%;
  transform:translateZ(2px) rotate(${TILT}deg) rotateX(var(--fold,0deg)) rotate(-${TILT}deg);
  transition:transform 900ms cubic-bezier(.62,.03,.26,1.03)}
.y2kp[data-phase="idle"] .y2kp-fold,
.y2kp[data-phase="in"] .y2kp-fold{--fold:-178deg;transition:none}
.y2kp-face,.y2kp-back{position:absolute;inset:0;
  backface-visibility:hidden;-webkit-backface-visibility:hidden}
.y2kp-back{transform:rotateY(180deg)}
/* Coque extérieure du clapet, vue de dos quand le téléphone est
   fermé. Le rotateY du parent mirore tout : le scaleX ci-dessous
   l'annule, si bien que la découpe et le masque (l'alpha du visuel)
   redonnent très exactement la silhouette du clapet. */
.y2kp-back-shell{position:absolute;inset:0;transform:scaleX(-1);
  clip-path:polygon(0 0,100% 0,100% 53.48%,0 46.65%);
  -webkit-mask-image:url(${ASSET});mask-image:url(${ASSET});
  -webkit-mask-size:100% 100%;mask-size:100% 100%;
  -webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;
  background:
    radial-gradient(120% 70% at 26% 12%,rgba(255,255,255,.7),transparent 55%),
    radial-gradient(88% 72% at 50% 46%,transparent 62%,rgba(88,44,150,.34) 100%),
    linear-gradient(${100 - TILT}deg,#cbb2ec 0%,#bda2e4 34%,#a98ad6 62%,#c3a9e8 100%)}
/* Écran externe / haut-parleur embossé dans la coque. */
.y2kp-back-shell::after{content:"";position:absolute;left:34%;right:34%;top:20%;height:3.6%;
  border-radius:14%/45%;background:rgba(72,32,128,.2);
  box-shadow:inset 0 2px 3px rgba(52,18,100,.4),0 1px 0 rgba(255,255,255,.5);
  transform:rotate(${TILT}deg)}

/* ---- Reflet glossy, masqué par l'alpha de l'image ---- */
.y2kp-gloss{position:absolute;inset:0;pointer-events:none;mix-blend-mode:screen;
  opacity:.4;transition:opacity .4s ease;
  -webkit-mask-image:url(${ASSET});mask-image:url(${ASSET});
  -webkit-mask-size:100% 100%;mask-size:100% 100%;
  -webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;
  background:
    radial-gradient(38% 26% at calc(42% + var(--px,0) * 26%) calc(30% + var(--py,0) * 22%),
      rgba(255,255,255,.85),rgba(255,255,255,.2) 45%,transparent 72%),
    linear-gradient(${104 - TILT}deg,transparent calc(28% + var(--px,0) * 9%),
      rgba(255,255,255,.38) calc(38% + var(--px,0) * 9%),
      transparent calc(50% + var(--px,0) * 9%))}
.y2kp:hover .y2kp-gloss{opacity:.56}

/* ---- Couche d'interactions : invisible, mais bien des <button> ---- */
.y2kp-keys{position:absolute;inset:0}
.y2kp[data-phase="idle"] .y2kp-keys,
.y2kp[data-phase="in"] .y2kp-keys,
.y2kp[data-phase="open"] .y2kp-keys{pointer-events:none}
.y2kp-key{position:absolute;transform:translate(-50%,-50%);appearance:none;border:0;padding:0;
  margin:0;background:none;cursor:pointer;display:grid;place-items:center;
  font:inherit;color:transparent}
.y2kp-key:focus{outline:none}
.y2kp-cap{position:relative;border-radius:15%/32%;transform:rotate(${TILT}deg);
  background-color:transparent;
  transition:transform 130ms cubic-bezier(.3,.7,.3,1),box-shadow 130ms ease,
             background-color 130ms ease}
.y2kp-cap::before{content:"";position:absolute;inset:0;border-radius:inherit;opacity:0;
  transition:opacity 160ms ease;
  background:radial-gradient(72% 130% at 32% 16%,rgba(255,255,255,.85),transparent 64%)}
.y2kp-key:hover .y2kp-cap::before{opacity:.7}
.y2kp-key:focus-visible .y2kp-cap{box-shadow:0 0 0 2px #7147d4,0 0 12px rgba(113,71,212,.75)}
.y2kp-key:active .y2kp-cap,
.y2kp-key[data-down="1"] .y2kp-cap{
  transform:rotate(${TILT}deg) scale(.93) translateY(2%);
  background-color:rgba(58,20,96,.2);
  box-shadow:inset 0 3px 6px rgba(28,6,52,.45),inset 0 -1px 0 rgba(255,255,255,.45)}
.y2kp-key:active .y2kp-cap::before,
.y2kp-key[data-down="1"] .y2kp-cap::before{opacity:0}

/* ---- Écran LCD ---- */
.y2kp-screen{position:absolute;left:61.14%;top:29.11%;width:47.25%;height:23.89%;
  transform:translate(-50%,-50%) rotate(${TILT}deg);
  container-type:inline-size;overflow:hidden;border-radius:5.4%/5.8%;
  font-family:var(--font-lcd),ui-monospace,monospace;
  background:radial-gradient(115% 90% at 42% 8%,#17572c 0%,#0d3a1c 42%,#062010 100%);
  box-shadow:inset 0 0 9px rgba(0,0,0,.8),inset 0 2px 4px rgba(0,0,0,.6);
  color:#3ff06c;text-shadow:0 0 4px rgba(63,240,108,.85),0 0 12px rgba(63,240,108,.32)}
.y2kp-screen-in{position:absolute;inset:0;padding:6cqw 7cqw;display:flex;
  flex-direction:column;opacity:0;transition:opacity 260ms ease 60ms}
.y2kp-screen.is-on .y2kp-screen-in{opacity:1}
/* Voile d'extinction tant que le clapet est fermé. */
.y2kp-screen::after{content:"";position:absolute;inset:0;pointer-events:none;
  background:linear-gradient(160deg,rgba(4,16,8,.9),rgba(4,14,7,.98));
  opacity:1;transition:opacity 380ms ease}
.y2kp-screen.is-on::after{opacity:0}

.y2kp-bar{display:flex;align-items:flex-end;justify-content:space-between;height:6.5cqw}
.y2kp-sig,.y2kp-bat{display:flex;align-items:flex-end;gap:.9cqw}
.y2kp-sig i{display:block;width:1.8cqw;background:currentColor;border-radius:.4cqw}
.y2kp-bat i{display:block;width:3.4cqw;height:5.4cqw;background:currentColor;
  border-radius:.4cqw}
@keyframes y2kp-blink{0%,100%{opacity:1}50%{opacity:.35}}
.y2kp-sig i:nth-child(4){animation:y2kp-blink 2.8s ease-in-out infinite}
.y2kp-bat i:last-child{animation:y2kp-blink 4.6s ease-in-out infinite}

.y2kp-title{font-size:11cqw;line-height:1.14;margin-top:1.4cqw;letter-spacing:.02em}
.y2kp-rule{height:1px;background:currentColor;opacity:.32;margin:1.6cqw 0}
.y2kp-row{font-size:9.5cqw;line-height:1.2}
.y2kp-dial{flex:1;min-height:0;font-size:9.5cqw;line-height:1.22;word-break:break-all}
.y2kp-prompt{opacity:.62}
@keyframes y2kp-caret{0%,45%{opacity:1}55%,100%{opacity:0}}
.y2kp-caret{animation:y2kp-caret 1.05s steps(1,end) infinite}

/* Allumage : les lignes s'inscrivent comme sur un terminal. */
@keyframes y2kp-type{from{clip-path:inset(0 100% 0 0)}to{clip-path:inset(0 0 0 0)}}
.y2kp-typed{clip-path:inset(0 100% 0 0)}
.y2kp-screen.is-on .y2kp-typed{animation:y2kp-type 260ms steps(18,end) both}
.y2kp-screen.is-on .y2kp-t1{animation-delay:60ms}
.y2kp-screen.is-on .y2kp-t2{animation-delay:330ms}
.y2kp-screen.is-on .y2kp-t3{animation-delay:520ms}
.y2kp-screen.is-on .y2kp-t4{animation-delay:720ms}

/* Chaque caractère frappé s'inscrit avec un pic de luminance. */
@keyframes y2kp-char{0%{opacity:.15;filter:brightness(2.6)}100%{opacity:1;filter:none}}
.y2kp-char{animation:y2kp-char 180ms ease-out both}

/* Effets de frappe : flash vert, scanline, grain. */
@keyframes y2kp-flash{0%{opacity:.5}100%{opacity:0}}
.y2kp-fx-flash{position:absolute;inset:0;pointer-events:none;background:#5cff8d;
  mix-blend-mode:screen;opacity:0;animation:y2kp-flash 190ms ease-out}
@keyframes y2kp-sweep{0%{transform:translateY(-115%)}100%{transform:translateY(340%)}}
.y2kp-fx-sweep{position:absolute;left:0;right:0;top:0;height:32%;pointer-events:none;
  mix-blend-mode:screen;animation:y2kp-sweep 420ms cubic-bezier(.3,.5,.4,1);
  background:linear-gradient(180deg,transparent,rgba(150,255,190,.32) 55%,transparent)}
@keyframes y2kp-noise{0%,100%{opacity:.16}50%{opacity:.05}}
.y2kp-fx-noise{position:absolute;inset:-30%;pointer-events:none;opacity:0;
  mix-blend-mode:screen;background-image:${NOISE_URL};background-size:38% 38%;
  animation:y2kp-noise 240ms steps(3,end) 2}
/* Scanlines CRT permanentes + bombé du verre. */
.y2kp-scan{position:absolute;inset:0;pointer-events:none;opacity:.28;
  background:repeating-linear-gradient(180deg,rgba(0,0,0,.55) 0 1px,transparent 1px 3px)}
.y2kp-glass{position:absolute;inset:0;pointer-events:none;
  background:
    linear-gradient(146deg,rgba(255,255,255,.13) 0 22%,transparent 46%),
    radial-gradient(120% 90% at 50% 108%,rgba(0,0,0,.48),transparent 58%)}

/* ---- Bandeau d'aide sous le téléphone ---- */
.y2kp-hint{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;
  gap:.55rem;margin-top:.9rem;font-family:var(--mono),ui-monospace,monospace;
  font-size:.5rem;letter-spacing:.14em;color:rgba(59,29,143,.62);text-align:center}
.y2kp-mute{appearance:none;border:1px solid #c6c2d8;border-radius:999px;cursor:pointer;
  padding:.3rem .62rem;font:inherit;letter-spacing:.1em;color:#3b1d8f;
  background:linear-gradient(180deg,#fdfdff 0%,#ebe9f4 48%,#d3d0e1 100%);
  box-shadow:inset 0 1px 2px rgba(255,255,255,.95),0 1px 2px rgba(30,36,48,.2);
  transition:filter 140ms ease,transform 140ms ease}
.y2kp-mute:hover{filter:brightness(1.06)}
.y2kp-mute:active{transform:scale(.94);box-shadow:inset 0 2px 4px rgba(0,0,0,.3)}
.y2kp-mute:focus-visible{outline:2px solid #7147d4;outline-offset:2px}

/* ---- Accessibilité : mouvement réduit ---- */
@media (prefers-reduced-motion:reduce){
  .y2kp[data-phase] .y2kp-intro{animation:none;opacity:1}
  .y2kp[data-phase] .y2kp-float{animation:none}
  .y2kp-shake.is-buzz{animation:none}
  .y2kp-fold{transition:none}
  .y2kp-tilt{transition:none;transform:none}
  .y2kp-typed,.y2kp-screen.is-on .y2kp-typed{animation:none;clip-path:none}
  .y2kp-char,.y2kp-caret,.y2kp-sig i,.y2kp-bat i{animation:none}
  .y2kp-fx-flash,.y2kp-fx-sweep,.y2kp-fx-noise{display:none}
}
`;

/* ============================================================
   Composant
   ============================================================ */

type Phase = "idle" | "in" | "open" | "live";

export default function Y2KPhone() {
  const rootRef = useRef<HTMLDivElement>(null);
  const shakeRef = useRef<HTMLDivElement>(null);

  const [phase, setPhase] = useState<Phase>("idle");
  const [screenOn, setScreenOn] = useState(false);
  const [dialed, setDialed] = useState("");
  const [pulse, setPulse] = useState(0);
  const [muted, setMuted] = useState(false);
  const [down, setDown] = useState<string | null>(null);

  const playKey = useKeySound(muted);

  /* ---- Séquence d'arrivée : une seule fois, à l'entrée du
     téléphone dans le viewport.
     fermé → rebond 3D (620 ms) → ouverture du clapet (900 ms)
     → allumage de l'écran → vibration. ---------------------- */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const timers: ReturnType<typeof setTimeout>[] = [];
    const start = () => {
      // Mouvement réduit : on saute directement au clapet ouvert.
      if (reduced) {
        setPhase("live");
        setScreenOn(true);
        return;
      }
      setPhase("in");
      timers.push(setTimeout(() => setPhase("open"), 640));
      timers.push(setTimeout(() => setScreenOn(true), 1090));
      timers.push(
        setTimeout(() => {
          setPhase("live");
          shakeRef.current?.classList.add("is-buzz");
          buzz([0, 16, 45, 26]);
          timers.push(
            setTimeout(() => shakeRef.current?.classList.remove("is-buzz"), 340),
          );
        }, 1560),
      );
    };

    if (typeof IntersectionObserver !== "function") {
      timers.push(setTimeout(start, 0));
      return () => timers.forEach(clearTimeout);
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          start();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(root);
    return () => {
      io.disconnect();
      timers.forEach(clearTimeout);
    };
  }, []);

  /* ---- Parallaxe : écrite en variables CSS via le DOM, pour ne
     pas déclencher un rendu React à chaque pixel parcouru. ---- */
  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const root = rootRef.current;
    if (!root) return;
    const r = root.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * 2 - 1;
    const py = ((e.clientY - r.top) / r.height) * 2 - 1;
    root.style.setProperty("--px", Math.max(-1, Math.min(1, px)).toFixed(3));
    root.style.setProperty("--py", Math.max(-1, Math.min(1, py)).toFixed(3));
  }, []);

  const resetTilt = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;
    root.style.setProperty("--px", "0");
    root.style.setProperty("--py", "0");
  }, []);

  /* ---- Frappe ------------------------------------------------ */
  const press = useCallback(
    (id: string) => {
      playKey(id);
      buzz(12);
      setPulse((p) => p + 1);
      setDialed((d) => {
        if (id === "#") return d.slice(0, -1);
        if (id === "end") return "";
        if (id === "call") return d;
        return d.length >= MAX_LEN ? d : d + id;
      });
    },
    [playKey],
  );

  /* Clavier physique : le téléphone reste utilisable sans souris. */
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (phase !== "live" || e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key;
      if (/^[0-9*]$/.test(k)) {
        e.preventDefault();
        press(k);
      } else if (k === "#" || k === "Backspace") {
        e.preventDefault();
        press("#");
      } else if (k === "Escape") {
        e.preventDefault();
        press("end");
      }
    },
    [phase, press],
  );

  const hotspot = (h: Hotspot, kind: "key" | "nav") => (
    <button
      key={h.id}
      type="button"
      className="y2kp-key"
      style={{
        left: `${h.x}%`,
        top: `${h.y}%`,
        width: `${HIT[kind][0]}%`,
        height: `${HIT[kind][1]}%`,
      }}
      aria-label={`Touche ${h.label}`}
      disabled={phase !== "live"}
      data-down={down === h.id ? "1" : undefined}
      onPointerDown={() => setDown(h.id)}
      onPointerUp={() => setDown(null)}
      onPointerCancel={() => setDown(null)}
      onPointerLeave={() => setDown((d) => (d === h.id ? null : d))}
      onClick={() => press(h.id)}
    >
      <span
        className="y2kp-cap"
        style={{ width: CAP[kind][0], height: CAP[kind][1] }}
      />
    </button>
  );

  const chars = dialed.split("");

  return (
    <div
      ref={rootRef}
      className="y2kp"
      data-phase={phase}
      role="group"
      aria-label="Clapet Lil'OG — clavier interactif"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onPointerMove={onPointerMove}
      onPointerLeave={resetTilt}
      onBlur={resetTilt}
    >
      <style>{CSS}</style>

      <div className="y2kp-stage">
        <div className="y2kp-intro">
          <div className="y2kp-float">
            <div ref={shakeRef} className="y2kp-shake">
              <div className="y2kp-tilt">
                {/* ---------- Socle : clavier, charnière, breloque ---------- */}
                <div className="y2kp-half y2kp-clip-bottom">
                  {/* eslint-disable-next-line @next/next/no-img-element -- visuel décoratif piloté par des transforms 3D ; le wrapper de next/image casserait le pliage du clapet. */}
                  <img src={ASSET} alt="" width={813} height={1483} draggable={false} />
                  <span className="y2kp-gloss" aria-hidden />
                  <Gems where="base" />
                </div>

                {/* ---------- Clapet : la moitié haute qui pivote ---------- */}
                <div className="y2kp-fold">
                  <div className="y2kp-face">
                    <div className="y2kp-half y2kp-clip-top">
                      {/* eslint-disable-next-line @next/next/no-img-element -- idem : même visuel, découpé au-dessus de la charnière. */}
                      <img src={ASSET} alt="" width={813} height={1483} draggable={false} />
                      <span className="y2kp-gloss" aria-hidden />
                      <Gems where="lid" />
                    </div>

                    {/* ---- Écran LCD dynamique ---- */}
                    <div className={`y2kp-screen${screenOn ? " is-on" : ""}`}>
                      <div className="y2kp-screen-in">
                        <div className="y2kp-bar" aria-hidden>
                          <span className="y2kp-sig">
                            <i style={{ height: "2.4cqw" }} />
                            <i style={{ height: "3.6cqw" }} />
                            <i style={{ height: "4.8cqw" }} />
                            <i style={{ height: "6.2cqw" }} />
                          </span>
                          <span className="y2kp-bat">
                            <i />
                            <i />
                            <i />
                            <i />
                          </span>
                        </div>

                        <div className="y2kp-title y2kp-typed y2kp-t1">
                          LIL&apos;OG HOTLINE
                        </div>
                        <div className="y2kp-rule" aria-hidden />
                        <div className="y2kp-row y2kp-typed y2kp-t2">STATUS: ONLINE</div>
                        <div className="y2kp-row y2kp-typed y2kp-t3">
                          RESP-TIME: &lt; 2H
                        </div>
                        <div className="y2kp-rule" aria-hidden />

                        <div className="y2kp-dial y2kp-typed y2kp-t4">
                          <span className="y2kp-prompt">DIAL&gt;&nbsp;</span>
                          <span role="status" aria-live="polite" aria-atomic="true">
                            {chars.map((c, i) => (
                              <span
                                key={`${i}-${c}`}
                                className={i === chars.length - 1 ? "y2kp-char" : undefined}
                              >
                                {c}
                              </span>
                            ))}
                          </span>
                          <span className="y2kp-caret" aria-hidden>
                            _
                          </span>
                        </div>
                      </div>

                      <span className="y2kp-scan" aria-hidden />
                      <span className="y2kp-glass" aria-hidden />
                      {/* La clé React remonte les effets à chaque frappe. */}
                      {pulse > 0 && (
                        <span key={`fx-${pulse}`} aria-hidden>
                          <span className="y2kp-fx-flash" />
                          <span className="y2kp-fx-sweep" />
                          <span className="y2kp-fx-noise" />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Dos du clapet — visible uniquement téléphone fermé. */}
                  <div className="y2kp-back" aria-hidden>
                    <div className="y2kp-back-shell" />
                  </div>
                </div>

                {/* ---------- Couche d'interactions ---------- */}
                <div className="y2kp-keys">
                  {NAV.map((h) => hotspot(h, "nav"))}
                  {KEYPAD.map((h) => hotspot(h, "key"))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="y2kp-hint">
        <span>[#] EFFACE — [✆] APPEL</span>
        <button
          type="button"
          className="y2kp-mute"
          onClick={() => setMuted((m) => !m)}
          aria-pressed={muted}
          aria-label={muted ? "Activer le son du clavier" : "Couper le son du clavier"}
        >
          {muted ? "SON OFF" : "SON ON"}
        </button>
      </div>
    </div>
  );
}
