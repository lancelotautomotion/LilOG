"use client";

/* ============================================================
   GRAVEUR_LIL_OG_OS.EXE : l'assistant de la carte cadeau
   ------------------------------------------------------------
   La carte cadeau n'est pas présentée comme un produit mais
   comme un disque à graver. Une grande fenêtre Windows 95,
   deux colonnes :

     à gauche   la photo du CD-ROM dans son boîtier
     à droite   ÉTAPE 1 la capacité, ÉTAPE 2 la licence

   et, en bas à droite comme dans tout assistant Windows, le
   bouton qui lance la gravure — c'est-à-dire l'ajout au panier.

   Les capacités sont les variantes réelles du produit Shopify,
   converties en mégaoctets pour le décor : le montant en euros
   reste affiché sous chaque bouton, personne n'achète à
   l'aveugle. Sans produit publié, l'assistant s'affiche quand
   même mais refuse de graver, et le dit.

   Le courriel du bénéficiaire et le message voyagent en
   attributs de la ligne de panier, sous les clés réservées du
   thème Dawn (__shopify_send_gift_card_to_recipient, Recipient
   email, Message — voir gift-card-recipient-form.liquid) : ce
   sont les seules que Shopify lit pour envoyer nativement le
   code au bon destinataire plutôt qu'à l'e-mail du compte qui
   paie. Ils appartiennent à la ligne, pas au panier : deux
   cartes dans une même commande ont donc chacune leur
   destinataire.

   ⚠ PAREFEU : Tailwind + une feuille locale préfixée `gc-`.
   Aucune classe de globals.css n'est touchée.
   ============================================================ */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { CdRom } from "@/components/gift-card/cd-rom";
import { ChromeStar, GemSticker } from "@/components/contact/stickers";
import {
  GRID_BG,
  LeopardBackdrop,
  MONO,
  PLASTIC,
  PLASTIC_FACE,
  PLASTIC_PRESS,
  VIOLET_BAR,
  WindowButton,
} from "@/components/y2k/kit";

/** Une capacité de disque : une variante Shopify vue par l'assistant. */
export interface Capacity {
  variantId: string;
  /** Montant en euros de la variante. */
  amount: number;
  available: boolean;
}

const MESSAGE_MAX = 200;

/* Volontairement permissif : c'est un garde-fou de frappe, pas un contrôle
   d'existence. Seul l'envoi réel dira si l'adresse est bonne. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const WIZARD_CSS = `
/* LED de capacité : une bille verte qui s'allume. */
.gc-led{
  width:11px;height:11px;border-radius:9999px;flex:0 0 auto;
  background:radial-gradient(circle at 35% 30%, #0f3d22 0%, #0b2a18 60%, #061309 100%);
  box-shadow:inset 0 1px 1px rgba(255,255,255,.25), 0 1px 0 rgba(255,255,255,.5);
}
.gc-led.on{
  background:radial-gradient(circle at 35% 30%, #d5ffe8 0%, #5affa0 45%, #12b45c 100%);
  box-shadow:0 0 8px rgba(90,255,160,.95), 0 0 16px rgba(90,255,160,.55), inset 0 1px 1px rgba(255,255,255,.8);
  animation:gcPulse 1.5s ease-in-out infinite;
}
@keyframes gcPulse{ 0%,100%{filter:brightness(1)} 50%{filter:brightness(1.28)} }

/* Jauge de progression Windows 95 : des blocs, pas une barre lisse. */
.gc-gauge-fill{
  background-image:repeating-linear-gradient(90deg,#3b1d8f 0 10px, transparent 10px 13px);
  transition:width 180ms linear;
}

@media (prefers-reduced-motion: reduce){
  .gc-led.on{ animation:none }
  .gc-gauge-fill{ transition:none }
}
`;

/** « 50,00 € » — même écriture que le reste du site, sans dépendre d'Intl. */
function euros(amount: number) {
  return `${amount.toFixed(2).replace(".", ",")} €`;
}

/** « 50.00 MB » — la capacité, à la mode disquette. */
function megabytes(amount: number) {
  return `${amount.toFixed(2)} MB`;
}

/* ============================================================
   Briques
   ============================================================ */

function StepTitle({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <h2
      className={`${MONO} mb-3 flex items-center gap-2 text-[1rem] font-bold tracking-[0.06em] text-[#2b0f6b] uppercase`}
    >
      <span
        className="grid h-6 w-6 shrink-0 place-items-center rounded-[4px] text-[0.8125rem] text-white"
        style={{ background: VIOLET_BAR }}
      >
        {n}
      </span>
      {children}
    </h2>
  );
}

/** Champ encastré : le creux Windows 95 autour d'une zone de saisie. */
const FIELD =
  "w-full rounded-[3px] border border-gray-500 bg-white px-3 py-2.5 text-[1rem] " +
  "text-[#1e2430] shadow-inner outline-none placeholder:text-[#9490a8] " +
  "focus-visible:border-[#7147d4] focus-visible:ring-2 focus-visible:ring-[#7147d4]/40 " +
  "disabled:cursor-not-allowed disabled:bg-[#e7e5f1] disabled:text-[#6b6880]";

/* ============================================================
   Assistant
   ============================================================ */

export function SetupWizard({
  capacities,
  productName,
  initialAmount = null,
}: {
  capacities: Capacity[];
  /** Titre du produit Shopify, affiché dans la barre d'état. */
  productName: string | null;
  /**
   * Montant demandé en arrivant (?montant=50), pour les raccourcis de
   * l'encart de l'accueil. Un montant qui ne correspond à aucune capacité
   * disponible est ignoré sans bruit : mieux vaut un formulaire amorcé sur
   * une autre valeur qu'une page en erreur parce qu'une variante a changé
   * de prix dans Shopify.
   */
  initialAmount?: number | null;
}) {
  const { addItems } = useCart();

  /* Le disque le plus vendu est celui du milieu : l'assistant arrive avec
     une capacité déjà choisie plutôt qu'un formulaire vide. */
  const firstAvailable = capacities.find((c) => c.available) ?? null;
  const requested =
    initialAmount == null
      ? null
      : (capacities.find((c) => c.available && c.amount === initialAmount) ?? null);
  const [picked, setPicked] = useState<Capacity | null>(requested ?? firstAvailable);

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [touched, setTouched] = useState(false);

  const [burning, setBurning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const timers = useRef<ReturnType<typeof setInterval>[]>([]);

  useEffect(() => {
    const running = timers.current;
    return () => running.forEach(clearInterval);
  }, []);

  const noDisc = capacities.length === 0;
  const emailOk = EMAIL_RE.test(email.trim());
  const ready = !noDisc && picked !== null && emailOk;

  async function burn() {
    setTouched(true);
    setError(null);
    if (!ready || !picked || burning) return;

    setDone(false);
    setBurning(true);
    setProgress(3);

    /* La jauge avance pendant l'aller-retour Shopify et s'arrête à 92 % :
       les 8 derniers pour cent n'appartiennent qu'à la réponse réelle. Une
       jauge qui atteindrait 100 % avant elle mentirait sur l'état de la
       commande. */
    const tick = setInterval(() => setProgress((p) => (p < 92 ? p + 7 : p)), 110);
    timers.current.push(tick);

    try {
      await addItems([
        {
          variantId: picked.variantId,
          quantity: 1,
          // Clés réservées du thème Dawn (gift-card-recipient-form.liquid) :
          // ce sont les seules que Shopify reconnaît pour dérouter l'envoi
          // natif de la carte cadeau vers ce destinataire. Un intitulé libre
          // ("E-mail du bénéficiaire", par ex.) n'est qu'une note visible
          // sur la commande — Shopify continue alors d'envoyer le code à
          // l'e-mail du compte qui paie, sans jamais lire cet attribut-là.
          attributes: [
            { key: "__shopify_send_gift_card_to_recipient", value: "if_present" },
            { key: "Recipient email", value: email.trim() },
            ...(message.trim() ? [{ key: "Message", value: message.trim() }] : []),
          ],
        },
      ]);
      setProgress(100);
      setDone(true);
    } catch (err) {
      setProgress(0);
      setError(
        err instanceof Error
          ? err.message
          : "La gravure a échoué. Réessaie dans un instant.",
      );
    } finally {
      clearInterval(tick);
      timers.current = timers.current.filter((t) => t !== tick);
      setBurning(false);
    }
  }

  return (
    <main className="relative px-[clamp(12px,4vw,48px)] pt-[clamp(92px,11vw,132px)] pb-[clamp(24px,4vw,48px)]">
      <style>{WIZARD_CSS}</style>
      <LeopardBackdrop />

      {/* ================= FENÊTRE ================= */}
      <div
        className="relative z-[1] mx-auto max-w-[1180px] overflow-hidden rounded-xl border-2 border-[#b8b4cc] bg-[#e7e5f1]"
        style={{
          boxShadow:
            "inset 0 2px 3px rgba(255,255,255,0.9), inset 0 -3px 6px rgba(0,0,0,0.18), var(--y2k-win-shadow)",
        }}
      >
        {/* ---- Barre de titre ---- */}
        <div className="flex items-center justify-between gap-3 px-3 py-2" style={{ background: VIOLET_BAR }}>
          <div className="flex min-w-0 items-center gap-2">
            <span className="grid h-5 w-5 shrink-0 place-items-center rounded-[4px] bg-white/85 text-[0.875rem] shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.3)]">
              💿
            </span>
            <h1
              className={`${MONO} truncate text-[clamp(0.875rem,2.1vw,1rem)] font-bold tracking-[0.05em] text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.45)]`}
            >
              GRAVEUR_LIL_OG_OS.EXE — Assistant de création
            </h1>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <WindowButton label="Réduire" glyph="_" />
            <WindowButton label="Agrandir" glyph="🗖" />
            <WindowButton label="Fermer" glyph="✖" />
          </div>
        </div>

        {/* ---- Corps ---- */}
        <div className="relative p-[clamp(14px,3vw,32px)]" style={GRID_BG}>
          {/* Pastilles décoratives, comme /faq et /contact. */}
          <span aria-hidden className="pointer-events-none absolute inset-0 z-[2] hidden sm:block">
            <span
              className="absolute top-[4px] right-[4px] h-[clamp(26px,4vw,44px)] w-[clamp(26px,4vw,44px)]"
              style={{ transform: "rotate(14deg)" }}
            >
              <ChromeStar uid="gc-star" />
            </span>
            {/* Coin bas gauche : sous la colonne du disque, la seule zone
                du corps qui reste libre — à droite, la pastille passerait
                par-dessus le compteur d'octets du message. */}
            <span
              className="absolute bottom-[4px] left-[4px] h-[clamp(24px,3.6vw,40px)] w-[clamp(24px,3.6vw,40px)]"
              style={{ transform: "rotate(-12deg)" }}
            >
              <GemSticker uid="gc-heart" shape="heart" hue={["#FFC0DF", "#EE4B96", "#B3155A"]} />
            </span>
          </span>

          <div className="relative z-[1] grid gap-[clamp(20px,3vw,36px)] lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)]">
            {/* ================= COLONNE GAUCHE : LE DISQUE =================
                `h-full` prend la hauteur que la grille lui étire déjà (elle
                égale par défaut celle de la colonne de droite, la plus
                grande des deux) : sans elle, ce flex-col n'a qu'une hauteur
                intrinsèque et `flex-1` dans CdRom n'a rien à occuper. */}
            <div className="flex h-full flex-col items-center gap-4">
              <CdRom spinning={burning} />

              {/* Voyant du graveur : la capacité choisie y est rappelée,
                  faute de pouvoir encore l'écrire sur la photo du disque. */}
              <div
                className={`${MONO} flex w-full max-w-[420px] shrink-0 items-center gap-2 rounded-[4px] border border-[#3f3d55] bg-black px-3 py-2 text-[0.9375rem] font-bold tracking-[0.06em] uppercase`}
                style={{ color: burning ? "#ff5ec4" : done ? "#5affa0" : "#8e8aa8" }}
              >
                <span className={`gc-led${burning || done ? " on" : ""}`} aria-hidden />
                <span className="min-w-0 truncate">
                  {burning
                    ? "GRAVURE EN COURS…"
                    : done
                      ? "DISQUE GRAVÉ · OK"
                      : noDisc
                        ? "AUCUN DISQUE DANS LE LECTEUR"
                        : `LECTEUR PRÊT${picked ? ` · ${euros(picked.amount)}` : ""}`}
                </span>
              </div>
            </div>

            {/* ================= COLONNE DROITE : LES RÉGLAGES ================= */}
            <div className="min-w-0">
              {/* ---------- ÉTAPE 1 ---------- */}
              <section>
                <StepTitle n="1">Sélectionner la capacité du disque</StepTitle>

                {noDisc ? (
                  <p
                    className={`${MONO} rounded-[3px] border border-amber-500 bg-amber-100 px-3 py-2.5 text-[0.9375rem] text-amber-900`}
                  >
                    ⚠ DISQUE_INTROUVABLE.SYS — aucune carte cadeau n&apos;est publiée dans la
                    boutique pour le moment.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {capacities.map((c, i) => {
                      const on = picked?.variantId === c.variantId;
                      const max = i === capacities.length - 1 && capacities.length > 1;
                      return (
                        <button
                          key={c.variantId}
                          type="button"
                          aria-pressed={on}
                          disabled={!c.available || burning}
                          onClick={() => setPicked(c)}
                          className={`${MONO} flex items-center gap-2.5 rounded-lg border-2 px-3 py-3 text-left transition disabled:cursor-not-allowed disabled:opacity-40 ${
                            on
                              ? "translate-y-[3px] border-[#12b45c] bg-[#1e2430] text-white"
                              : `border-[#c6c2d8] ${PLASTIC_FACE} text-[#262626] ${PLASTIC} ${PLASTIC_PRESS} hover:brightness-105`
                          }`}
                          style={
                            on
                              ? {
                                  boxShadow:
                                    "inset 0 3px 7px rgba(0,0,0,0.55), 0 0 0 2px rgba(90,255,160,0.55), 0 0 14px rgba(90,255,160,0.4)",
                                }
                              : { boxShadow: "0 4px 0 rgba(0,0,0,0.18)" }
                          }
                        >
                          <span className={`gc-led${on ? " on" : ""}`} aria-hidden />
                          <span className="min-w-0">
                            <span className="block text-[1rem] font-bold tracking-[0.04em] uppercase">
                              {max ? "[ CAPACITÉ MAX 💸 ]" : `[ ${megabytes(c.amount)} ]`}
                            </span>
                            <span
                              className="block text-[0.9375rem]"
                              style={{ color: on ? "#5affa0" : "#5b2fb8" }}
                            >
                              {euros(c.amount)}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* ---------- ÉTAPE 2 ---------- */}
              <section className="mt-[clamp(20px,3vw,30px)]">
                <StepTitle n="2">Informations de licence</StepTitle>

                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="gc-email"
                      className={`${MONO} mb-1.5 block text-[1rem] font-bold tracking-[0.05em] text-[#2b0f6b] uppercase`}
                    >
                      EMAIL_DU_BÉNÉFICIAIRE.TXT
                    </label>
                    <input
                      id="gc-email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      required
                      disabled={noDisc || burning}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => setTouched(true)}
                      placeholder="destinataire@exemple.com"
                      aria-invalid={touched && !emailOk}
                      aria-describedby="gc-email-help"
                      className={`${MONO} ${FIELD}`}
                    />
                    <p
                      id="gc-email-help"
                      className={`${MONO} mt-1.5 text-[0.9375rem] ${
                        touched && !emailOk ? "text-[#d4006e]" : "text-[#5b5670]"
                      }`}
                    >
                      {touched && !emailOk
                        ? "⚠ Adresse invalide : le disque ne peut pas être livré."
                        : "C'est à cette adresse que le code du disque sera envoyé."}
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="gc-message"
                      className={`${MONO} mb-1.5 block text-[1rem] font-bold tracking-[0.05em] text-[#2b0f6b] uppercase`}
                    >
                      MESSAGE_PERSONNALISÉ.SYS
                    </label>
                    <textarea
                      id="gc-message"
                      rows={4}
                      maxLength={MESSAGE_MAX}
                      disabled={noDisc || burning}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Joyeux anniversaire, va piller l'archive…"
                      className={`${MONO} ${FIELD} resize-y`}
                    />
                    <p className={`${MONO} mt-1.5 text-right text-[0.9375rem] text-[#5b5670]`}>
                      {message.length} / {MESSAGE_MAX} octets
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* ================= PIED DE L'ASSISTANT ================= */}
        {/* Séparé du corps par une rainure, et le bouton d'action à droite :
            c'est la disposition d'un assistant Windows. */}
        <div className="border-t-2 border-[#c6c2d8] bg-[#e9e7f2] px-[clamp(12px,3vw,32px)] py-[clamp(12px,2vw,18px)]">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            {/* Jauge + journal */}
            <div className="min-w-0 flex-1">
              <div
                className="h-[18px] w-full max-w-[360px] rounded-[2px] border border-[#8b87a3] bg-white p-[2px]"
                style={{ boxShadow: "inset 1px 1px 2px rgba(0,0,0,0.28)" }}
              >
                <div className="gc-gauge-fill h-full" style={{ width: `${progress}%` }} />
              </div>
              <p
                className={`${MONO} mt-1.5 text-[0.9375rem] text-[#3b3550]`}
                role="status"
                aria-live="polite"
              >
                {error ? (
                  <span className="text-[#d4006e]">⚠ ERREUR : {error}</span>
                ) : done ? (
                  <>
                    <span className="text-[#0f7a3a]">✓ Disque ajouté au panier.</span>{" "}
                    <Link href="/cart" className="font-bold text-[#5b2fb8] underline">
                      Ouvrir le panier →
                    </Link>
                  </>
                ) : burning ? (
                  <>Gravure du disque… {progress}%</>
                ) : (
                  <>
                    {productName ? `${productName} · ` : ""}
                    {noDisc ? "En attente d'un disque." : "Prêt à graver."}
                  </>
                )}
              </p>
            </div>

            {/* Bouton d'action */}
            <button
              type="button"
              onClick={burn}
              disabled={noDisc || burning || !picked}
              className={`${MONO} w-full shrink-0 rounded-lg border-b-4 border-[#0f5c26] md:w-auto bg-gradient-to-b from-[#4fbe84] to-[#12833f] px-[clamp(14px,2.4vw,26px)] py-3.5 text-[1rem] font-black tracking-[0.05em] text-white uppercase transition active:translate-y-1 active:border-b-0 disabled:cursor-not-allowed disabled:opacity-45 disabled:active:translate-y-0`}
              style={{ boxShadow: "0 5px 0 rgba(0,0,0,0.18)" }}
            >
              {burning
                ? "[ ⏳ GRAVURE… ]"
                : done
                  ? "[ 💾 GRAVER UN AUTRE DISQUE ]"
                  : "[ 💾 GRAVER LE DISQUE (AJOUTER AU PANIER) ]"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
