"use client";

/* ============================================================
   /contact : LIL_OG_SUPPORT_CENTER.EXE
   Direction artistique Y2K / Windows 95 / Chunky Plastic.

   ⚠ PAREFEU : cette page est 100 % autonome.
   Tout le style vit dans ce fichier via Tailwind (+ quelques
   `style` inline pour les dégradés multiples). AUCUNE classe
   globale de `globals.css` n'est utilisée ni modifiée ici, donc
   aucune autre page du site ne peut être impactée.
   ============================================================ */

import { useState, useTransition } from "react";
import { PageShell } from "@/components/page-shell";
import Y2KPhone from "@/components/contact/Y2KPhone";
import { Floppy, FloppyStyles } from "@/components/contact/floppy";
import { Icon } from "@/components/icons";

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

/* Quadrillage discret « papier millimétré » du fond de fenêtre. */
const GRID_BG = {
  backgroundColor: "#f0f0f5",
  backgroundImage:
    "linear-gradient(rgba(113,71,212,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(113,71,212,0.08) 1px, transparent 1px)",
  backgroundSize: "22px 22px",
};

/* ============================================================
   Boutons de contrôle de fenêtre  [ _ ] [ 🗖 ] [ × ]
   ============================================================ */
function WindowButton({ label, glyph }: { label: string; glyph: string }) {
  return (
    <span
      role="presentation"
      aria-label={label}
      title={label}
      className={`grid h-6 w-7 place-items-center rounded-md border border-[#c6c2d8] bg-[linear-gradient(180deg,#f6f5fb_0%,#e7e5f1_48%,#d3d0e1_100%)] text-[0.875rem] leading-none font-bold text-[#262626] select-none ${PLASTIC}`}
    >
      {glyph}
    </span>
  );
}

/* ============================================================
   Colonne « hotline » : le clapet interactif + les raccourcis
   ------------------------------------------------------------
   Le téléphone lui-même vit dans components/contact/Y2KPhone :
   il est construit par-dessus le visuel public/téléphone.png,
   avec une couche de zones cliquables invisibles.
   ============================================================ */

const SHORTCUTS: {
  icon: React.ReactNode;
  label: string;
  href: string;
  external: boolean;
}[] = [
  /* Le dossier est l'icône partagée du site (components/icons), pas un 📁 :
     le rendu de l'emoji change d'une plateforme à l'autre et ne collerait
     plus au dossier du menu latéral ni à celui de l'accueil. */
  { icon: <Icon.folder className="h-[1.1em] w-auto" />, label: "FAQ.DOC", href: "/faq", external: false },
  { icon: "📦", label: "SUIVI_COLIS.EXE", href: "/livraison", external: false },
  {
    icon: "📸",
    label: "INSTAGRAM.LNK",
    href: "https://www.instagram.com/",
    external: true,
  },
];

/* Le clapet occupe désormais toute la hauteur de la colonne, donc celle
   du formulaire, puisque c'est lui qui dicte la hauteur de la rangée. Les
   raccourcis ont leur propre bande, plus bas. */
function HotlineColumn() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <Y2KPhone />
    </div>
  );
}

/* ============================================================
   Bande de raccourcis : pleine largeur, entre le formulaire et
   les disquettes. Icônes de bureau format « gros bouton ».
   ============================================================ */
function Shortcuts() {
  return (
    <section
      aria-label="Raccourcis"
      className="mt-[clamp(26px,4.5vw,44px)]"
    >
      <div className={`${MONO} mb-3 flex items-center gap-2 text-[0.8125rem] font-bold tracking-[0.08em] text-[#5b2fb8]`}>
        <span className="h-px flex-1 bg-[#5b2fb8]/20" />
        🖱 RACCOURCIS
        <span className="h-px flex-1 bg-[#5b2fb8]/20" />
      </div>
      {/* Grille à colonnes égales : les trois pastilles ont exactement la
          même largeur et la même hauteur, quel que soit leur libellé. */}
      <div className="mx-auto grid w-full max-w-[760px] grid-cols-3 gap-[clamp(8px,2vw,20px)]">
        {SHORTCUTS.map(({ icon, label, href, external }) => (
          <a
            key={label}
            href={href}
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className={`flex flex-col items-center justify-center gap-2.5 rounded-2xl border border-[#c6c2d8] bg-[linear-gradient(180deg,#fdfdff_0%,#eeecf6_48%,#d8d5e6_100%)] px-2 py-[clamp(16px,2.6vw,26px)] text-center no-underline transition sm:px-4 ${PLASTIC} ${PLASTIC_PRESS} hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7147d4]`}
          >
            <span className="flex h-[clamp(1.7rem,4vw,2.6rem)] items-center justify-center text-[clamp(1.7rem,4vw,2.6rem)] leading-none drop-shadow-[0_3px_3px_rgba(0,0,0,0.25)]">
              {icon}
            </span>
            <span className={`${MONO} text-[clamp(0.8125rem,1.1vw,0.9375rem)] leading-tight font-bold break-all tracking-[0.02em] text-[#262626]`}>
              {label}
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}

/* ============================================================
   Page
   ============================================================ */

/* Les identifiants sont repris tels quels par /api/contact, qui les
   traduit en objet de mail : toute pastille ajoutée ici doit l'être
   aussi dans SUBJECT_LABELS côté route, sinon l'envoi est refusé. */
const SUBJECTS = [
  { id: "commande", label: "🎰 Commande" },
  { id: "taille", label: "📏 Conseil Taille" },
  { id: "partenariat", label: "🤝 Partenariat" },
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
  const [sendError, setSendError] = useState("");

  /* Pot de miel anti-robots : invisible et hors du parcours clavier,
     un humain ne peut pas le remplir. /api/contact jette en silence
     tout message qui arrive avec ce champ rempli. */
  const [website, setWebsite] = useState("");

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
    setSendError("");
    startTransition(async () => {
      try {
        const res = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, subject, message, website }),
        });
        const data = (await res.json().catch(() => null)) as { ok?: boolean } | null;
        if (!res.ok || !data?.ok) {
          /* Pas de faux « message transmis » : si la boîte de la
             boutique n'a rien reçu, on le dit, et on laisse le
             message dans le formulaire pour ne pas le perdre. */
          setSendError(
            "La transmission a échoué. Réessaie dans un moment, ou écris directement à lilog.shop@gmail.com.",
          );
          return;
        }
        setSent(true);
      } catch {
        setSendError(
          "La transmission a échoué. Réessaie dans un moment, ou écris directement à lilog.shop@gmail.com.",
        );
      }
    });
  };

  return (
    <PageShell>
      {/* Fond photo, comme le panier : leo.jpeg plein cadre avec un voile
          sombre pour que la fenêtre Win95 garde son contraste par-dessus.
          Le décor est posé en `fixed` plutôt qu'en fond du <main> : cadrée
          sur toute la hauteur du document (~3600 px ici), la photo se
          retrouverait grossie à l'extrême, donc floue. Calée sur le
          viewport, elle reste nette et le décor ne défile pas. */}
      <main className="relative px-[clamp(12px,4vw,48px)] pt-[clamp(92px,11vw,132px)] pb-[clamp(24px,4vw,48px)]">
        <span
          aria-hidden
          className="pointer-events-none fixed inset-0 z-0"
          style={{
            backgroundImage: "url('/leo.jpeg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
        <span
          aria-hidden
          className="pointer-events-none fixed inset-0 z-0 bg-black/25"
        />
        {/* ================= FENÊTRE WINDOWS 95 ================= */}
        <div
          className="relative z-[1] mx-auto max-w-[1400px] overflow-hidden rounded-xl border-2 border-[#b8b4cc] bg-[#e7e5f1]"
          style={{
            boxShadow:
              "inset 0 2px 3px rgba(255,255,255,0.9), inset 0 -3px 6px rgba(0,0,0,0.18), var(--y2k-win-shadow)",
          }}
        >
          {/* ---- Barre de titre ---- */}
          <div
            className="flex items-center justify-between gap-3 px-3 py-2"
            style={{
              background:
                "linear-gradient(90deg, #3b1d8f 0%, #7147d4 45%, #ff3fb0 100%)",
            }}
          >
            <div className="flex min-w-0 items-center gap-2">
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-[4px] bg-white/85 text-[0.875rem] shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.3)]">
                ☎
              </span>
              <h1
                className={`${MONO} truncate text-[clamp(0.875rem,2.1vw,1rem)] font-bold tracking-[0.05em] text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.45)]`}
              >
                LIL_OG_SUPPORT_CENTER.EXE
              </h1>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <WindowButton label="Réduire" glyph="_" />
              <WindowButton label="Agrandir" glyph="🗖" />
              <WindowButton label="Fermer" glyph="×" />
            </div>
          </div>

          {/* ---- Corps de la fenêtre ---- */}
          <div
            className="p-[clamp(14px,3vw,32px)]"
            style={GRID_BG}
          >
            {/* ============ 2 COLONNES ============ */}
            {/* `items-stretch` (défaut) : les deux colonnes prennent la
                hauteur de la rangée, donc s'alignent en haut ET en bas. */}
            <div className="grid grid-cols-1 gap-[clamp(20px,3vw,32px)] lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">

              {/* ---------- COLONNE GAUCHE ---------- */}
              {/* En deux colonnes, le contenu est sorti du flux (absolute) :
                  sinon la hauteur naturelle du clapet imposerait la hauteur
                  de la rangée et c'est le formulaire qui s'étirerait, soit
                  l'inverse de ce qu'on veut. La rangée est donc dictée par
                  le formulaire, et le clapet se cale dessus. */}
              <section
                aria-label="Hotline Lil'OG"
                className="relative w-full justify-self-center lg:justify-self-start"
              >
                <div className="lg:absolute lg:inset-0">
                  <HotlineColumn />
                </div>
              </section>

              {/* ---------- COLONNE DROITE ---------- */}
              <section
                aria-label="Formulaire de contact"
                className="overflow-hidden rounded-xl border border-[#c6c2d8] bg-white/85 backdrop-blur-[1px]"
                style={{
                  boxShadow:
                    "inset 0 2px 3px rgba(255,255,255,0.9), var(--y2k-win-shadow)",
                }}
              >
                <div
                  className="px-3 py-2"
                  style={{
                    background:
                      "linear-gradient(90deg, #3b1d8f 0%, #7147d4 45%, #ff3fb0 100%)",
                  }}
                >
                  <h2
                    className={`${MONO} text-[0.9375rem] font-bold tracking-[0.05em] text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.4)]`}
                  >
                    SEND_MESSAGE.SYS ★
                  </h2>
                </div>

                <div className="p-[clamp(14px,2.4vw,24px)]">
                  {sent ? (
                    <div
                      className={`${MONO} rounded-lg border border-purple-200 bg-purple-50 px-4 py-8 text-center text-[0.9375rem] leading-relaxed text-purple-800`}
                    >
                      <div className="mb-2 text-[1.6rem]">💌</div>
                      ★ MESSAGE TRANSMIS !<br />
                      On te répond très vite. ♡
                    </div>
                  ) : (
                    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                      {/* Pot de miel : hors écran plutôt qu'en `hidden`, que
                          certains robots savent détecter. tabIndex={-1} et
                          aria-hidden le retirent du clavier et des lecteurs
                          d'écran, autocomplete="off" du remplissage auto. */}
                      <input
                        type="text"
                        name="website"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        tabIndex={-1}
                        autoComplete="off"
                        aria-hidden
                        className="pointer-events-none absolute -left-[9999px] h-0 w-0 opacity-0"
                      />

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="flex flex-col gap-1.5">
                          <label
                            className={`${MONO} text-[0.8125rem] font-bold tracking-[0.08em] text-[#5b2fb8]`}
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
                            className={`${INSET_FIELD} ${MONO} w-full text-[0.9375rem] text-[#1E2430] outline-none placeholder:text-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-300/50`}
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label
                            className={`${MONO} text-[0.8125rem] font-bold tracking-[0.08em] text-[#5b2fb8]`}
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
                            className={`${INSET_FIELD} ${MONO} w-full text-[0.9375rem] text-[#1E2430] outline-none placeholder:text-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-300/50`}
                          />
                        </div>
                      </div>

                      {/* ---- Sélecteur d'objet : pastilles plastique ---- */}
                      <fieldset className="flex flex-col gap-2">
                        <legend
                          className={`${MONO} mb-1 text-[0.8125rem] font-bold tracking-[0.08em] text-[#5b2fb8]`}
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
                                className={`${MONO} rounded-full border px-4 py-2 text-[0.875rem] font-bold transition ${PLASTIC_PRESS} hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7147d4] ${
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
                            className={`${MONO} mt-0.5 text-[0.8125rem] font-bold tracking-wide text-rose-600`}
                          >
                            ⚠ CHOISIS UN OBJET POUR CONTINUER
                          </p>
                        )}
                      </fieldset>

                      <div className="flex flex-col gap-1.5">
                        <label
                          className={`${MONO} text-[0.8125rem] font-bold tracking-[0.08em] text-[#5b2fb8]`}
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
                          className={`${INSET_FIELD} ${MONO} w-full resize-y text-[0.9375rem] leading-relaxed text-[#1E2430] outline-none placeholder:text-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-300/50`}
                        />
                      </div>

                      {/* ---- Bouton chunky plastic ---- */}
                      <button
                        type="submit"
                        disabled={isPending}
                        className={`${MONO} mt-1 w-full rounded-full bg-purple-600 p-4 text-[1rem] font-bold tracking-[0.04em] text-white shadow-[inset_0_2px_4px_rgba(255,255,255,0.7),0_4px_6px_rgba(0,0,0,0.15)] transition hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7147d4]`}
                      >
                        {isPending
                          ? "[ ⏳ TRANSMISSION_EN_COURS… ]"
                          : "[ ✉️ TRANSMETTRE_LE_MESSAGE.EXE ]"}
                      </button>

                      {sendError && (
                        <p
                          role="alert"
                          className={`${MONO} rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[0.8125rem] leading-relaxed font-bold text-rose-700`}
                        >
                          ⚠ {sendError}
                        </p>
                      )}
                    </form>
                  )}
                </div>
              </section>
            </div>

            {/* ============ RACCOURCIS ============ */}
            <Shortcuts />

            {/* ============ DISQUETTES 3.5" ============ */}
            <div className="mt-[clamp(26px,4.5vw,44px)]">
              <FloppyStyles />
              <div className={`${MONO} mb-3 flex items-center gap-2 text-[0.8125rem] font-bold tracking-[0.08em] text-[#5b2fb8]`}>
                <span className="h-px flex-1 bg-[#5b2fb8]/20" />
                💾 INFOS_PRATIQUES
                <span className="h-px flex-1 bg-[#5b2fb8]/20" />
              </div>
              <div className="grid grid-cols-1 gap-[clamp(14px,2.4vw,26px)] sm:grid-cols-2 lg:grid-cols-3">
                <Floppy
                  variant="pink"
                  name="LIVRAISON.DOC"
                  text="Expédition sous 24/48h. Numéro de suivi envoyé par email dès le départ du colis."
                />
                <Floppy
                  variant="purple"
                  name="RETOURS.SYS"
                  text="14 jours pour changer d'avis. Article non porté, non lavé, étiquette d'origine."
                />
                <Floppy
                  variant="black"
                  name="PAIEMENT.EXE"
                  text="Transactions 100% cryptées. CB, Apple Pay et PayPal acceptés en toute sécurité."
                />
              </div>
            </div>
          </div>

          {/* ---- Barre de statut ---- */}
          <div className="flex items-center justify-between gap-3 border-t-2 border-[#b8b4cc] bg-[#e7e5f1] px-3 py-1.5">
            <span className={`${MONO} truncate text-[0.8125rem] tracking-wider text-[#5a5670]`}>
              ✦ lilog.shop@gmail.com · Lun-Ven 10h/18h
            </span>
            <span className={`${MONO} shrink-0 text-[0.8125rem] tracking-wider text-[#5a5670]`}>
              3 objet(s) · 1.44 Mo
            </span>
          </div>
        </div>
      </main>
    </PageShell>
  );
}
