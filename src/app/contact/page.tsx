"use client";

/* ============================================================
   /contact — LIL_OG_SUPPORT_CENTER.EXE
   Direction artistique Y2K / Windows 95 / Chunky Plastic.

   ⚠ PAREFEU : cette page est 100 % autonome.
   Tout le style vit dans ce fichier via Tailwind (+ quelques
   `style` inline pour les dégradés multiples). AUCUNE classe
   globale de `globals.css` n'est utilisée ni modifiée ici, donc
   aucune autre page du site ne peut être impactée.
   ============================================================ */

import { useCallback, useRef, useState, useTransition } from "react";
import { PageShell } from "@/components/page-shell";

/* ---- Jetons « chunky plastic » ----------------------------
   Gardés en constantes pour rester cohérents d'un élément à
   l'autre. Tailwind scanne le texte brut du fichier : les
   classes ci-dessous sont donc bien détectées à la compilation. */
const PLASTIC =
  "shadow-[inset_0_2px_4px_rgba(255,255,255,0.95),inset_0_-2px_5px_rgba(0,0,0,0.25),0_2px_3px_rgba(30,36,48,0.18)]";
const PLASTIC_PRESS =
  "active:shadow-[inset_0_3px_6px_rgba(0,0,0,0.32),inset_0_-1px_0_rgba(255,255,255,0.7)] active:scale-95";
const INSET_FIELD =
  "shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2)] bg-white border border-gray-300 rounded-lg p-3";

const MONO = "font-[family-name:var(--mono)]";
const LCD_FONT = "font-[family-name:var(--font-lcd)]";

/* Quadrillage discret « papier millimétré » du fond de fenêtre. */
const GRID_BG = {
  backgroundColor: "#f0f0f5",
  backgroundImage:
    "linear-gradient(rgba(113,71,212,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(113,71,212,0.08) 1px, transparent 1px)",
  backgroundSize: "22px 22px",
};

/* ============================================================
   Boutons de contrôle de fenêtre  [ _ ] [ 🗖 ] [ ✖ ]
   ============================================================ */
function WindowButton({ label, glyph }: { label: string; glyph: string }) {
  return (
    <span
      role="presentation"
      aria-label={label}
      title={label}
      className={`grid h-6 w-7 place-items-center rounded-md border border-[#c6c2d8] bg-[linear-gradient(180deg,#f6f5fb_0%,#e7e5f1_48%,#d3d0e1_100%)] text-[0.7rem] leading-none font-bold text-[#262626] select-none ${PLASTIC}`}
    >
      {glyph}
    </span>
  );
}

/* ============================================================
   Widget flip phone Y2K (Motorola RAZR style)
   ============================================================ */

/* Fréquences DTMF réelles : chaque touche = 2 sinusoïdes. */
const DTMF: Record<string, [number, number]> = {
  "1": [697, 1209], "2": [697, 1336], "3": [697, 1477],
  "4": [770, 1209], "5": [770, 1336], "6": [770, 1477],
  "7": [852, 1209], "8": [852, 1336], "9": [852, 1477],
  "*": [941, 1209], "0": [941, 1336], "#": [941, 1477],
};

const KEY_LETTERS: Record<string, string> = {
  "1": "∞", "2": "ABC", "3": "DEF",
  "4": "GHI", "5": "JKL", "6": "MNO",
  "7": "PQRS", "8": "TUV", "9": "WXYZ",
  "*": "+", "0": "␣", "#": "↵",
};

const KEYPAD = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"];

function FlipPhone() {
  const [dialed, setDialed] = useState("");
  const [muted, setMuted] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);

  const beep = useCallback(
    (key: string) => {
      if (muted) return;
      const tones = DTMF[key];
      if (!tones) return;
      try {
        // L'AudioContext n'est créé qu'au premier clic : on est bien
        // dans un geste utilisateur, donc pas de blocage navigateur.
        ctxRef.current ??= new AudioContext();
        const ctx = ctxRef.current;
        if (ctx.state === "suspended") void ctx.resume();

        const gain = ctx.createGain();
        const now = ctx.currentTime;
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.09, now + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.13);
        gain.connect(ctx.destination);

        for (const f of tones) {
          const osc = ctx.createOscillator();
          osc.type = "sine";
          osc.frequency.setValueAtTime(f, now);
          osc.connect(gain);
          osc.start(now);
          osc.stop(now + 0.14);
        }
      } catch {
        /* Pas de Web Audio : le retour visuel suffit. */
      }
    },
    [muted],
  );

  const press = (key: string) => {
    beep(key);
    setDialed((d) => (key === "#" ? "" : (d + key).slice(-12)));
  };

  return (
    <div className="flex flex-col items-center">
      {/* ---- Coque du téléphone ---- */}
      <div
        className="w-full max-w-[290px] rounded-3xl border-4 border-purple-300/80 p-3 shadow-xl"
        style={{
          background:
            "linear-gradient(150deg, #e9d5ff 0%, #c9a7f5 30%, #f0abfc 58%, #a97fe0 100%)",
          boxShadow:
            "inset 0 3px 8px rgba(255,255,255,0.85), inset 0 -4px 10px rgba(80,30,140,0.35), 0 12px 22px rgba(80,30,140,0.28)",
        }}
      >
        {/* ---- Clapet supérieur : écran LCD ---- */}
        <div
          className="rounded-2xl border-2 border-purple-200/70 p-2"
          style={{
            background: "linear-gradient(180deg, #d8bcf5 0%, #b98fe6 100%)",
            boxShadow: "inset 0 2px 5px rgba(255,255,255,0.8)",
          }}
        >
          {/* Haut-parleur */}
          <div className="mx-auto mb-2 h-[5px] w-12 rounded-full bg-purple-900/30 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]" />

          <div
            className="relative overflow-hidden rounded-lg border-2 border-[#1d3b1f] px-3 py-2"
            style={{
              background:
                "radial-gradient(120% 100% at 50% 0%, #1d4224 0%, #0d2412 100%)",
              boxShadow:
                "inset 0 0 14px rgba(0,0,0,0.75), 0 0 12px rgba(74,222,128,0.22)",
            }}
          >
            {/* Scanlines LCD */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-25"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(180deg, rgba(0,0,0,0.6) 0px, rgba(0,0,0,0.6) 1px, transparent 1px, transparent 3px)",
              }}
            />
            <div
              className={`relative ${LCD_FONT} text-[#7dfba1] [text-shadow:0_0_6px_rgba(125,251,161,0.75)]`}
            >
              <div className="flex items-baseline justify-between text-[1.05rem] leading-tight">
                <span>LIL&apos;OG HOTLINE</span>
                <span className="animate-pulse text-[0.8rem]">🟢</span>
              </div>
              <div className="mt-1 h-px bg-[#7dfba1]/30" />
              <div className="mt-1 text-[0.95rem] leading-snug">
                <div>STATUS: ONLINE</div>
                <div>RESP-TIME: &lt; 2H</div>
              </div>
              <div className="mt-1 h-px bg-[#7dfba1]/30" />
              <div className="mt-1 flex items-center gap-1 text-[0.95rem] leading-none">
                <span className="text-[#7dfba1]/60">DIAL&gt;</span>
                <span className="truncate">{dialed}</span>
                <span className="animate-pulse">_</span>
              </div>
            </div>
          </div>
        </div>

        {/* ---- Charnière ---- */}
        <div className="my-2 flex items-center justify-center gap-1.5">
          <div className="h-1.5 flex-1 rounded-full bg-purple-900/25 shadow-[inset_0_1px_2px_rgba(0,0,0,0.45)]" />
          <button
            type="button"
            onClick={() => setMuted((m) => !m)}
            aria-pressed={muted}
            aria-label={muted ? "Activer le son du clavier" : "Couper le son du clavier"}
            title={muted ? "Son coupé" : "Son actif"}
            className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border border-[#c6c2d8] bg-[linear-gradient(180deg,#f6f5fb_0%,#e7e5f1_48%,#d3d0e1_100%)] text-[0.6rem] transition ${PLASTIC} ${PLASTIC_PRESS} hover:brightness-105`}
          >
            {muted ? "🔇" : "🔊"}
          </button>
          <div className="h-1.5 flex-1 rounded-full bg-purple-900/25 shadow-[inset_0_1px_2px_rgba(0,0,0,0.45)]" />
        </div>

        {/* ---- Clapet inférieur : clavier ---- */}
        <div
          className="rounded-2xl border-2 border-purple-200/70 p-2.5"
          style={{
            background: "linear-gradient(180deg, #e5d0fa 0%, #b98fe6 100%)",
            boxShadow: "inset 0 2px 5px rgba(255,255,255,0.8)",
          }}
        >
          <div className="grid grid-cols-3 gap-1.5">
            {KEYPAD.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => press(key)}
                aria-label={`Touche ${key}`}
                className={`flex flex-col items-center justify-center rounded-lg border border-[#c6c2d8] bg-[linear-gradient(180deg,#fdfdff_0%,#ebe9f4_48%,#d3d0e1_100%)] py-1.5 leading-none text-[#262626] transition ${PLASTIC} ${PLASTIC_PRESS} hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7147d4]`}
              >
                <span className={`${MONO} text-[0.85rem] font-bold`}>{key}</span>
                <span className={`${MONO} text-[0.42rem] tracking-widest text-[#262626]/45`}>
                  {KEY_LETTERS[key]}
                </span>
              </button>
            ))}
          </div>
          <p className={`${MONO} mt-2 text-center text-[0.5rem] tracking-wider text-purple-950/55`}>
            [#] POUR EFFACER
          </p>
        </div>
      </div>

      {/* ---- Raccourcis « icônes de bureau » ---- */}
      <div className="mt-6 grid w-full max-w-[320px] grid-cols-3 gap-3">
        {[
          { icon: "📁", label: "FAQ.DOC", href: "/faq", external: false },
          { icon: "📦", label: "SUIVI_COLIS.EXE", href: "/livraison", external: false },
          { icon: "📸", label: "INSTAGRAM.LNK", href: "https://www.instagram.com/", external: true },
        ].map(({ icon, label, href, external }) => (
          <a
            key={label}
            href={href}
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className={`flex flex-col items-center gap-1.5 rounded-xl border border-[#c6c2d8] bg-[linear-gradient(180deg,#fdfdff_0%,#eeecf6_48%,#d8d5e6_100%)] px-1.5 py-3 text-center no-underline transition ${PLASTIC} ${PLASTIC_PRESS} hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7147d4]`}
          >
            <span className="text-[1.5rem] leading-none drop-shadow-[0_2px_2px_rgba(0,0,0,0.25)]">
              {icon}
            </span>
            <span className={`${MONO} text-[0.47rem] leading-tight font-bold break-all text-[#262626]`}>
              {label}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   Disquette 3.5"
   ============================================================ */
function Floppy({
  tint,
  shell,
  name,
  text,
}: {
  tint: string;
  shell: string;
  name: string;
  text: string;
}) {
  return (
    <div
      /* Proportions d'une vraie disquette 3.5" (~90 × 94 mm) : presque carrée,
         coin bas-droit biseauté (le fameux détroit anti-insertion à l'envers). */
      className="mx-auto flex w-full max-w-[330px] flex-col rounded-md rounded-br-[26px] border border-black/10 p-3 transition hover:-translate-y-1 sm:min-h-[248px]"
      style={{
        background: shell,
        boxShadow:
          "inset 0 2px 4px rgba(255,255,255,0.6), inset 0 -3px 8px rgba(0,0,0,0.22), 0 6px 12px rgba(30,36,48,0.22)",
      }}
    >
      {/* Obturateur métallique + encoche de protection en écriture */}
      <div className="mb-3 flex items-start gap-2">
        <div className="mt-0.5 h-4 w-4 shrink-0 rounded-[2px] bg-black/25 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]" />
        <div
          className="ml-auto h-11 w-[44%] rounded-[3px] border border-black/20"
          style={{
            background: "linear-gradient(180deg,#e8e8ef 0%,#b9b9c6 55%,#8f8f9d 100%)",
            boxShadow: "inset 0 1px 2px rgba(255,255,255,0.8), 0 1px 2px rgba(0,0,0,0.2)",
          }}
        >
          <div className="mx-auto mt-1.5 h-8 w-[38%] rounded-[2px] bg-black/35 shadow-[inset_0_1px_3px_rgba(0,0,0,0.6)]" />
        </div>
      </div>

      {/* Étiquette papier — collée en bas comme sur une vraie disquette */}
      <div className="mt-auto rounded-[3px] border border-black/15 bg-[#fffdf5] px-2.5 py-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.15)]">
        <div className={`${MONO} text-[0.68rem] font-bold tracking-tight`} style={{ color: tint }}>
          {name}
        </div>
        <div className="my-1.5 h-px bg-black/10" />
        <p className={`${MONO} text-[0.56rem] leading-relaxed text-[#3a3a45]`}>{text}</p>
      </div>
    </div>
  );
}

/* ============================================================
   Page
   ============================================================ */

const SUBJECTS = [
  { id: "commande", label: "🎰 Commande" },
  { id: "taille", label: "📏 Conseil Taille" },
  { id: "papotage", label: "💌 Papotage" },
];

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [subjectError, setSubjectError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Les pastilles ne sont pas un <input> : on valide l'objet à la main
    // plutôt que via un champ caché `required`, dont la bulle de validation
    // native serait ancrée à un élément invisible (donc jamais affichée).
    if (!subject) {
      setSubjectError(true);
      return;
    }
    setSubjectError(false);
    startTransition(async () => {
      await new Promise((r) => setTimeout(r, 600));
      setSent(true);
    });
  };

  return (
    <PageShell>
      <main className="px-[clamp(12px,4vw,48px)] pt-[clamp(92px,11vw,132px)] pb-[clamp(48px,8vw,100px)]">
        {/* ================= FENÊTRE WINDOWS 95 ================= */}
        <div
          className="mx-auto max-w-[1180px] overflow-hidden rounded-xl border-2 border-[#b8b4cc] bg-[#e7e5f1]"
          style={{
            boxShadow:
              "inset 0 2px 3px rgba(255,255,255,0.9), inset 0 -3px 6px rgba(0,0,0,0.18), 0 14px 30px rgba(30,36,48,0.28)",
          }}
        >
          {/* ---- Barre de titre ---- */}
          <div
            className="flex items-center justify-between gap-3 px-3 py-2"
            style={{
              background:
                "linear-gradient(90deg, #3b1d8f 0%, #7147d4 55%, #a86fe8 100%)",
            }}
          >
            <div className="flex min-w-0 items-center gap-2">
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-[4px] bg-white/85 text-[0.65rem] shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.3)]">
                ☎
              </span>
              <h1
                className={`${MONO} truncate text-[clamp(0.62rem,2.1vw,0.9rem)] font-bold tracking-[0.05em] text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.45)]`}
              >
                LIL_OG_SUPPORT_CENTER.EXE
              </h1>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <WindowButton label="Réduire" glyph="_" />
              <WindowButton label="Agrandir" glyph="🗖" />
              <WindowButton label="Fermer" glyph="✖" />
            </div>
          </div>

          {/* ---- Corps de la fenêtre ---- */}
          <div
            className="p-[clamp(14px,3vw,32px)]"
            style={GRID_BG}
          >
            {/* ============ 2 COLONNES ============ */}
            <div className="grid grid-cols-1 items-start gap-[clamp(20px,3vw,32px)] lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">

              {/* ---------- COLONNE GAUCHE ---------- */}
              <section aria-label="Hotline Lil'OG" className="justify-self-center lg:justify-self-start">
                <FlipPhone />
              </section>

              {/* ---------- COLONNE DROITE ---------- */}
              <section
                aria-label="Formulaire de contact"
                className="overflow-hidden rounded-xl border border-[#c6c2d8] bg-white/85 backdrop-blur-[1px]"
                style={{
                  boxShadow:
                    "inset 0 2px 3px rgba(255,255,255,0.9), 0 6px 14px rgba(30,36,48,0.14)",
                }}
              >
                <div
                  className="px-3 py-2"
                  style={{
                    background:
                      "linear-gradient(90deg, #5b2fb8 0%, #7147d4 60%, #b184ee 100%)",
                  }}
                >
                  <h2
                    className={`${MONO} text-[0.72rem] font-bold tracking-[0.05em] text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.4)]`}
                  >
                    SEND_MESSAGE.SYS ★
                  </h2>
                </div>

                <div className="p-[clamp(14px,2.4vw,24px)]">
                  {sent ? (
                    <div
                      className={`${MONO} rounded-lg border border-purple-200 bg-purple-50 px-4 py-8 text-center text-[0.75rem] leading-relaxed text-purple-800`}
                    >
                      <div className="mb-2 text-[1.6rem]">💌</div>
                      ★ MESSAGE TRANSMIS !<br />
                      On te répond très vite. ♡
                    </div>
                  ) : (
                    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="flex flex-col gap-1.5">
                          <label
                            className={`${MONO} text-[0.55rem] font-bold tracking-[0.08em] text-[#5b2fb8]`}
                            htmlFor="contact-name"
                          >
                            NOM / PRÉNOM
                          </label>
                          <input
                            id="contact-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            placeholder="Ton petit nom"
                            className={`${INSET_FIELD} ${MONO} w-full text-[0.72rem] text-[#1E2430] outline-none placeholder:text-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-300/50`}
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label
                            className={`${MONO} text-[0.55rem] font-bold tracking-[0.08em] text-[#5b2fb8]`}
                            htmlFor="contact-email"
                          >
                            EMAIL
                          </label>
                          <input
                            id="contact-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="toi@mail.com"
                            className={`${INSET_FIELD} ${MONO} w-full text-[0.72rem] text-[#1E2430] outline-none placeholder:text-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-300/50`}
                          />
                        </div>
                      </div>

                      {/* ---- Sélecteur d'objet : pastilles plastique ---- */}
                      <fieldset className="flex flex-col gap-2">
                        <legend
                          className={`${MONO} mb-1 text-[0.55rem] font-bold tracking-[0.08em] text-[#5b2fb8]`}
                        >
                          OBJET DU MESSAGE
                        </legend>
                        <div className="flex flex-wrap gap-2">
                          {SUBJECTS.map(({ id, label }) => {
                            const on = subject === id;
                            return (
                              <button
                                key={id}
                                type="button"
                                aria-pressed={on}
                                onClick={() => {
                                  setSubject(id);
                                  setSubjectError(false);
                                }}
                                className={`${MONO} rounded-full border px-4 py-2 text-[0.62rem] font-bold transition ${PLASTIC_PRESS} hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7147d4] ${
                                  on
                                    ? "border-purple-700 bg-purple-600 text-white shadow-[inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-2px_5px_rgba(0,0,0,0.3),0_2px_4px_rgba(80,30,140,0.35)]"
                                    : `border-[#c6c2d8] bg-[linear-gradient(180deg,#fdfdff_0%,#ebe9f4_48%,#d3d0e1_100%)] text-[#262626] ${PLASTIC}`
                                }`}
                              >
                                {on ? "◉" : "○"} {label}
                              </button>
                            );
                          })}
                        </div>
                        {subjectError && (
                          <p
                            role="alert"
                            className={`${MONO} mt-0.5 text-[0.55rem] font-bold tracking-wide text-rose-600`}
                          >
                            ⚠ CHOISIS UN OBJET POUR CONTINUER
                          </p>
                        )}
                      </fieldset>

                      <div className="flex flex-col gap-1.5">
                        <label
                          className={`${MONO} text-[0.55rem] font-bold tracking-[0.08em] text-[#5b2fb8]`}
                          htmlFor="contact-msg"
                        >
                          TON MESSAGE
                        </label>
                        <textarea
                          id="contact-msg"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          required
                          rows={6}
                          placeholder="Raconte-nous tout…"
                          className={`${INSET_FIELD} ${MONO} w-full resize-y text-[0.72rem] leading-relaxed text-[#1E2430] outline-none placeholder:text-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-300/50`}
                        />
                      </div>

                      {/* ---- Bouton chunky plastic ---- */}
                      <button
                        type="submit"
                        disabled={isPending}
                        className={`${MONO} mt-1 w-full rounded-full bg-purple-600 p-4 text-[0.7rem] font-bold tracking-[0.04em] text-white shadow-[inset_0_2px_4px_rgba(255,255,255,0.7),0_4px_6px_rgba(0,0,0,0.15)] transition hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7147d4]`}
                      >
                        {isPending
                          ? "[ ⏳ TRANSMISSION_EN_COURS… ]"
                          : "[ ✉️ TRANSMETTRE_LE_MESSAGE.EXE ]"}
                      </button>
                    </form>
                  )}
                </div>
              </section>
            </div>

            {/* ============ DISQUETTES 3.5" ============ */}
            <div className="mt-[clamp(24px,4vw,40px)]">
              <div className={`${MONO} mb-3 flex items-center gap-2 text-[0.58rem] font-bold tracking-[0.08em] text-[#5b2fb8]`}>
                <span className="h-px flex-1 bg-[#5b2fb8]/20" />
                💾 INFOS_PRATIQUES
                <span className="h-px flex-1 bg-[#5b2fb8]/20" />
              </div>
              <div className="grid grid-cols-1 gap-[clamp(12px,2vw,20px)] sm:grid-cols-2 lg:grid-cols-3">
                <Floppy
                  name="LIVRAISON.DOC"
                  tint="#be185d"
                  shell="linear-gradient(150deg,#fbb6d5 0%,#f472b6 55%,#db2777 100%)"
                  text="Expédition sous 24/48h. Numéro de suivi envoyé par email dès le départ du colis."
                />
                <Floppy
                  name="RETOURS.SYS"
                  tint="#6d28d9"
                  shell="linear-gradient(150deg,#d8b4fe 0%,#a78bfa 55%,#7c3aed 100%)"
                  text="14 jours pour changer d'avis. Article non porté, non lavé, étiquette d'origine."
                />
                <Floppy
                  name="PAIEMENT.EXE"
                  tint="#1d4ed8"
                  shell="linear-gradient(150deg,#bfdbfe 0%,#7ea6f8 55%,#2563eb 100%)"
                  text="Transactions 100% cryptées. CB, Apple Pay et PayPal acceptés en toute sécurité."
                />
              </div>
            </div>
          </div>

          {/* ---- Barre de statut ---- */}
          <div className="flex items-center justify-between gap-3 border-t-2 border-[#b8b4cc] bg-[#e7e5f1] px-3 py-1.5">
            <span className={`${MONO} truncate text-[0.5rem] tracking-wider text-[#5a5670]`}>
              ✦ hellolilG@gmail.com — Lun-Ven 10h/18h
            </span>
            <span className={`${MONO} shrink-0 text-[0.5rem] tracking-wider text-[#5a5670]`}>
              3 objet(s) — 1.44 Mo
            </span>
          </div>
        </div>
      </main>
    </PageShell>
  );
}
