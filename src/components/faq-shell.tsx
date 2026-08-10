"use client";

/* ============================================================
   HELP_CENTER_2000.EXE — /faq
   ------------------------------------------------------------
   Toute la page vit dans une seule fenêtre applicative Y2K /
   Windows 95, direction « chunky plastic », strictement alignée
   sur le vocabulaire de /contact, /cgv (DocCenter) et
   /durabilite : mêmes jetons plastique, même barre de titre
   violette, même quadrillage « papier millimétré », mêmes
   pastilles ChromeStar / GemSticker / HoloSmiley.

   Trois outils de navigation, du plus large au plus fin :
   • la recherche (tape un mot-clé, on filtre sur tout le texte),
   • les dossiers de catégories (onglets plastique),
   • les accordéons, qui ne dévoilent qu'une réponse à la fois.

   ⚠ PAREFEU : tout le style vit ici, via Tailwind + une feuille
   locale entièrement préfixée `lilfaq-`. AUCUNE classe globale de
   `globals.css` n'est utilisée (les anciennes `.faq-*` sont
   abandonnées) : les autres pages ne peuvent pas être impactées.
   ============================================================ */

import { useMemo, useState } from "react";
import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { ChromeStar, GemSticker, HoloSmiley } from "@/components/contact/stickers";
import { Icon } from "@/components/icons";

/* ---- Jetons « chunky plastic » — identiques à /contact ---- */
const PLASTIC =
  "shadow-[inset_0_2px_4px_rgba(255,255,255,0.95),inset_0_-2px_5px_rgba(0,0,0,0.25),0_2px_3px_rgba(30,36,48,0.18)]";
const PLASTIC_PRESS =
  "active:shadow-[inset_0_3px_6px_rgba(0,0,0,0.32),inset_0_-1px_0_rgba(255,255,255,0.7)] active:scale-95";
const PLASTIC_ON =
  "shadow-[inset_0_3px_7px_rgba(0,0,0,0.3),inset_0_-1px_0_rgba(255,255,255,0.45),0_2px_4px_rgba(80,30,140,0.35)]";

const MONO = "font-[family-name:var(--mono)]";
const LCD = "font-[family-name:var(--font-lcd)]";

/* Le rose de la maison : tous les petits accents roses passent par lui. */
const PINK = "#d3016d";

const VIOLET_BAR = "linear-gradient(90deg, #3b1d8f 0%, #7147d4 55%, #a86fe8 100%)";
const VIOLET_BAR_SOFT = "linear-gradient(90deg, #5b2fb8 0%, #7147d4 60%, #b184ee 100%)";
const VIOLET_BUMP = "linear-gradient(180deg, #b58cf5 0%, #7147d4 55%, #5b2fb8 100%)";

/* Quadrillage « papier millimétré » pastel du fond de fenêtre. */
const GRID_BG = {
  backgroundColor: "#f0f0f5",
  backgroundImage:
    "linear-gradient(rgba(113,71,212,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(113,71,212,0.08) 1px, transparent 1px)",
  backgroundSize: "22px 22px",
};

/* ---- Feuille locale : pastilles, accordéon, surlignage ---- */
const FAQ_CSS = `
@keyframes lilfaq-bob{
  0%,100%{transform:translate3d(0,0,0) rotate(var(--r,0deg)) scale(1)}
  50%{transform:translate3d(0,-8%,0) rotate(calc(var(--r,0deg) + 6deg)) scale(1.06)}
}
.lilfaq-sticker{animation:lilfaq-bob 7s ease-in-out infinite;
  filter:drop-shadow(0 3px 4px rgba(30,36,48,.28))}
.lilfaq-s2{animation-duration:8.4s;animation-delay:-2.2s}
.lilfaq-s3{animation-duration:6.2s;animation-delay:-3.7s}
.lilfaq-s4{animation-duration:9s;animation-delay:-5.1s}

/* Accordéon : la grille 0fr → 1fr anime la hauteur réelle du panneau,
   sans max-height arbitraire qui rognerait les réponses longues. */
.lilfaq-panel{display:grid;grid-template-rows:0fr;
  transition:grid-template-rows .28s ease}
.lilfaq-panel[data-open="true"]{grid-template-rows:1fr}
.lilfaq-panel > .lilfaq-panel-inner{overflow:hidden}

/* Surlignage des occurrences trouvées par la recherche. */
.lilfaq-mark{background:#fff2a8;color:#7a2b00;border-radius:3px;
  padding:0 2px;box-shadow:inset 0 -2px 0 rgba(211,1,109,.28)}

@media (prefers-reduced-motion: reduce){
  .lilfaq-sticker{animation:none}
  .lilfaq-panel{transition:none}
}
`;

/* ============================================================
   Données
   ============================================================ */

type CategoryId = "authenticite" | "tailles" | "livraison" | "retours" | "paiement";

type Category = { id: CategoryId; icon: string; label: string };

/* L'onglet « TOUT » est ajouté à part : il n'est pas une catégorie de
   fiche, seulement un filtre neutre. */
const CATEGORIES: Category[] = [
  { id: "authenticite", icon: "💎", label: "AUTHENTICITÉ" },
  { id: "tailles", icon: "📏", label: "TAILLES" },
  { id: "livraison", icon: "📦", label: "LIVRAISON" },
  { id: "retours", icon: "↺", label: "RETOURS" },
  { id: "paiement", icon: "💳", label: "PAIEMENT" },
];

type Faq = {
  id: string;
  cat: CategoryId;
  q: string;
  /** Paragraphes de la réponse. */
  a: string[];
  /** Puces « étoile », affichées entre le premier et le dernier paragraphe. */
  bullets?: string[];
  /** Renvoi vers la page qui détaille le sujet. */
  link?: { href: string; label: string };
};

const FAQS: Faq[] = [
  /* ---------------- 💎 AUTHENTICITÉ ---------------- */
  {
    id: "authentification",
    cat: "authenticite",
    q: "Comment authentifiez-vous les pièces ?",
    a: [
      "Chaque pièce est inspectée à la main par Louna, styliste de formation. Elle vérifie les étiquettes, les coutures, les matières et l'état général avant toute mise en vente.",
      "Aucune pièce douteuse ne passe — si on a un doute, on ne vend pas.",
    ],
  },
  {
    id: "nettoyage",
    cat: "authenticite",
    q: "Les pièces sont-elles nettoyées avant expédition ?",
    a: [
      "Oui. Toutes les pièces sont nettoyées et préparées avant d'être expédiées. Tu reçois une pièce prête à porter, pas un article de fripe qui sent le grenier.",
    ],
  },
  {
    id: "reservation",
    cat: "authenticite",
    q: "Est-ce qu'une pièce peut être réservée ?",
    a: [
      "Non. Chaque pièce est unique et disponible en premier arrivé, premier servi. Si tu hésites, quelqu'un d'autre peut l'acheter entre-temps — c'est la nature de la seconde main sélective.",
      "Pas de réservation, pas d'exception.",
    ],
  },
  {
    id: "usure",
    cat: "authenticite",
    q: "L'usure d'une pièce vintage, est-ce un défaut ?",
    a: [
      "Non : l'usure normale fait partie de la vie d'une pièce de seconde main. Elle est signalée sur la fiche produit, photos à l'appui, et ne constitue pas un défaut de conformité.",
      "En revanche, tout article qui ne correspondrait pas à sa description est intégralement remboursé, frais de retour compris.",
    ],
    link: { href: "/cgv", label: "LIRE_LES_CGV.DOC" },
  },
  {
    id: "depot-vente",
    cat: "authenticite",
    q: "Puis-je vous vendre mes propres pièces ?",
    a: [
      "Lil'OG n'est pas une plateforme de dépôt-vente pour le moment : la sélection est entièrement curatée par Louna.",
      "Si tu as des pièces exceptionnelles à proposer, envoie-nous un message à lilog.shop@gmail.com — on ne promet rien, mais on regarde.",
    ],
    link: { href: "/contact", label: "NOUS_ÉCRIRE.EXE" },
  },

  /* ---------------- 📏 TAILLES ---------------- */
  {
    id: "tailles-vintage",
    cat: "tailles",
    q: "Les tailles sont-elles fiables sur des pièces vintage ?",
    a: [
      "Le vintage a ses propres codes : un L des années 90 peut correspondre à un M actuel.",
      "C'est pourquoi chaque fiche produit indique les mesures réelles de la pièce — pas seulement la taille étiquetée. Mesure-toi et compare, c'est le seul moyen fiable.",
    ],
  },
  {
    id: "mesures",
    cat: "tailles",
    q: "Où trouver les mesures exactes d'une pièce ?",
    a: ["Directement sur la fiche produit, sous les photos. Tu y trouves systématiquement :"],
    bullets: [
      "Le tour de poitrine, mesuré à plat",
      "La longueur totale de la pièce",
      "La carrure d'épaules",
    ],
    link: { href: "/contact", label: "DEMANDER_UNE_MESURE.EXE" },
  },
  {
    id: "taille-ne-va-pas",
    cat: "tailles",
    q: "Et si la taille ne me va finalement pas ?",
    a: [
      "Tu disposes de 14 jours calendaires après réception pour changer d'avis. L'article doit revenir non porté, non lavé et dans son état d'origine ; les frais de retour sont à ta charge.",
      "Comme chaque pièce est unique, aucun échange de taille n'est possible : c'est un retour, puis une nouvelle commande.",
    ],
    link: { href: "/retours", label: "PROCÉDURE_RETOURS.SYS" },
  },

  /* ---------------- 📦 LIVRAISON ---------------- */
  {
    id: "delais",
    cat: "livraison",
    q: "Combien de temps prend la livraison ?",
    a: [
      "Compte 2 à 5 jours ouvrés pour la préparation et l'expédition, auxquels s'ajoutent les délais du transporteur (Colissimo ou Mondial Relay).",
      "Tu reçois un e-mail avec ton numéro de suivi dès l'expédition.",
    ],
    link: { href: "/livraison", label: "DÉTAIL_LIVRAISON.DOC" },
  },
  {
    id: "frais-livraison",
    cat: "livraison",
    q: "Quels sont les frais de livraison ?",
    a: [
      "Ils dépendent du mode choisi et sont affichés clairement au moment du passage de commande. Aucun frais caché.",
      "La livraison est offerte dès 150 € d'achat en France métropolitaine.",
    ],
  },
  {
    id: "international",
    cat: "livraison",
    q: "Livrez-vous en dehors de la France ?",
    a: [
      "Colissimo dessert la France, Mondial Relay la France et l'Europe. Les livraisons partent du lundi au vendredi, hors jours fériés.",
      "Pour une demande express ou une destination hors zone standard, écris-nous à lilog.shop@gmail.com avant de commander.",
    ],
  },
  {
    id: "suivi",
    cat: "livraison",
    q: "Comment suivre mon colis ?",
    a: [
      "Un premier e-mail confirme ta commande, un second t'envoie le numéro de suivi dès que le colis part.",
      "Sans nouvelle dans les délais annoncés, écris-nous avec ton numéro de commande : on part à la recherche du colis.",
    ],
  },

  /* ---------------- ↺ RETOURS ---------------- */
  {
    id: "retour",
    cat: "retours",
    q: "Puis-je retourner un article ?",
    a: [
      "Oui, tu disposes de 14 jours calendaires à compter de la réception pour exercer ton droit de rétractation, sans justification.",
      "L'article doit être non porté, non lavé et dans son état d'origine.",
    ],
    link: { href: "/retours", label: "OUVRIR_RETOURS.SYS" },
  },
  {
    id: "frais-retour",
    cat: "retours",
    q: "Qui paie les frais de retour ?",
    a: ["Les frais de renvoi sont à ta charge, sauf si l'article n'est pas conforme à sa description.", "Ensuite :"],
    bullets: [
      "Remboursement sous 14 jours après réception et vérification du retour",
      "Par le même moyen de paiement que la commande",
      "Les frais de livraison initiaux ne sont pas remboursés",
    ],
  },
  {
    id: "colis-endommage",
    cat: "retours",
    q: "Mon colis est arrivé endommagé, je fais quoi ?",
    a: [
      "Signale-le immédiatement au transporteur et prends des photos avant d'ouvrir le colis.",
      "Envoie-nous ensuite ces photos à lilog.shop@gmail.com avec ton numéro de commande : on prend le litige en charge et on trouve une solution rapide, renvoi ou remboursement.",
    ],
    link: { href: "/contact", label: "SIGNALER_UN_COLIS.EXE" },
  },

  /* ---------------- 💳 PAIEMENT ---------------- */
  {
    id: "paiement-fractionne",
    cat: "paiement",
    q: "Acceptez-vous le paiement en plusieurs fois ?",
    a: [
      "Oui, le paiement en 3 ou 4 fois sans frais est disponible via Klarna ou Alma selon les montants, directement au moment du paiement.",
    ],
  },
  {
    id: "moyens-paiement",
    cat: "paiement",
    q: "Quels moyens de paiement acceptez-vous ?",
    a: ["Le paiement est exigible à la commande, via la plateforme sécurisée Shopify Payments :"],
    bullets: [
      "Carte bancaire Visa, Mastercard, American Express",
      "Klarna ou Alma pour le paiement fractionné, selon disponibilité",
    ],
    link: { href: "/cgv", label: "CONDITIONS_PAIEMENT.SYS" },
  },
];

/* ============================================================
   Recherche
   ============================================================ */

/** Comparaison sans accents ni casse : « authenticite » trouve
    « authenticité », « retour » trouve « Retours ». */
const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const haystack = (f: Faq) =>
  norm([f.q, ...f.a, ...(f.bullets ?? []), f.cat].join(" "));

/** Surligne les occurrences de la recherche dans un texte. */
function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  if (q.length < 2) return <>{text}</>;
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  if (parts.length === 1) return <>{text}</>;
  return (
    <>
      {parts.map((part, i) =>
        /* split() avec groupe capturant : un index impair = une correspondance. */
        i % 2 === 1 ? (
          <mark key={i} className="lilfaq-mark">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

/* ============================================================
   Briques d'interface
   ============================================================ */

/** Boutons de contrôle de fenêtre  [ _ ] [ 🗖 ] [ ✖ ] */
function WindowButton({ label, glyph }: { label: string; glyph: string }) {
  return (
    <span
      role="presentation"
      aria-label={label}
      title={label}
      className={`grid h-6 w-7 shrink-0 place-items-center rounded-md border border-[#c6c2d8] bg-[linear-gradient(180deg,#f6f5fb_0%,#e7e5f1_48%,#d3d0e1_100%)] text-[0.7rem] leading-none font-bold text-[#262626] select-none ${PLASTIC}`}
    >
      {glyph}
    </span>
  );
}

/** Accordéon « chunky plastic » : carte bombée fermée, fond encastré ouverte. */
function FaqCard({
  item,
  query,
  open,
  onToggle,
}: {
  item: Faq;
  query: string;
  open: boolean;
  onToggle: () => void;
}) {
  const panelId = `lilfaq-panel-${item.id}`;
  const cat = CATEGORIES.find((c) => c.id === item.cat);

  return (
    <div
      className={`rounded-2xl border bg-white/90 p-3 backdrop-blur-[1px] transition-all sm:p-4 ${
        open
          ? "border-purple-300 shadow-lg"
          : "border-[#c6c2d8] shadow-md hover:border-purple-300 hover:brightness-[1.02]"
      }`}
      style={{ boxShadow: open ? undefined : "inset 0 2px 3px rgba(255,255,255,0.9), 0 5px 12px rgba(30,36,48,0.14)" }}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full cursor-pointer items-center gap-3 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#7147d4]"
      >
        <span
          aria-hidden
          className="flex shrink-0 items-center text-[clamp(1.1rem,3vw,1.4rem)] leading-none drop-shadow-[0_2px_2px_rgba(0,0,0,0.18)]"
        >
          {open ? <Icon.folderOpen className="h-[1.05em] w-auto" /> : <Icon.folder className="h-[1.05em] w-auto" />}
        </span>
        <span className="min-w-0 flex-1">
          <span
            className={`${MONO} block text-[clamp(0.68rem,1.9vw,0.8rem)] leading-[1.5] font-bold tracking-[0.01em] ${
              open ? "text-[#2a1266]" : "text-[#2b2b33]"
            }`}
          >
            <Highlight text={item.q} query={query} />
          </span>
          {cat && (
            <span className={`${MONO} mt-1 block text-[0.5rem] tracking-[0.1em] text-[#8b86a3]`}>
              C:\LILOG\AIDE\FAQ\{cat.label}
            </span>
          )}
        </span>
        <span
          aria-hidden
          className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl border text-[0.95rem] leading-none font-bold transition ${
            open
              ? `border-purple-700 text-white ${PLASTIC_ON}`
              : `border-[#8f6ae0] text-white ${PLASTIC}`
          }`}
          style={{ background: open ? "linear-gradient(180deg,#5b2fb8 0%,#7147d4 100%)" : VIOLET_BUMP }}
        >
          {open ? "−" : "+"}
        </span>
      </button>

      {/* Panneau : encastré façon champ Win95 pour bien détacher la réponse. */}
      <div id={panelId} className="lilfaq-panel" data-open={open}>
        <div className="lilfaq-panel-inner">
          {/* `inert` quand replié : le contenu reste dans le DOM pour que la
              hauteur s'anime, mais il sort de l'arbre d'accessibilité et du
              parcours clavier. */}
          <div
            inert={!open}
            className="mt-3 rounded-xl border border-gray-300 bg-white p-3.5 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2)] sm:p-4"
          >
            {item.a.map((para, i) => (
              <p
                key={para}
                className={`${MONO} text-[clamp(0.66rem,1.6vw,0.74rem)] leading-[1.95] text-[#2b2b33] ${
                  i > 0 ? "mt-3" : ""
                }`}
              >
                <Highlight text={para} query={query} />
              </p>
            ))}

            {item.bullets && (
              <ul className="mt-3 flex list-none flex-col gap-2 p-0">
                {item.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2.5">
                    <span className={`${LCD} mt-[1px] shrink-0 text-[0.95rem] leading-none`} style={{ color: PINK }}>
                      ✦
                    </span>
                    <span className={`${MONO} text-[clamp(0.66rem,1.6vw,0.74rem)] leading-[1.8] text-[#2b2b33]`}>
                      <Highlight text={b} query={query} />
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {item.link && (
              <Link
                href={item.link.href}
                tabIndex={open ? undefined : -1}
                className={`${MONO} mt-4 inline-block rounded-full border border-[#c6c2d8] bg-[linear-gradient(180deg,#fdfdff_0%,#ebe9f4_48%,#d3d0e1_100%)] px-4 py-2 text-[0.58rem] font-bold tracking-[0.04em] text-[#262626] no-underline transition hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7147d4] ${PLASTIC} ${PLASTIC_PRESS}`}
              >
                [ ➜ {item.link.label} ]
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Page
   ============================================================ */

export function FaqShell() {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<CategoryId | "all">("all");
  const [openIds, setOpenIds] = useState<string[]>([]);

  /* Deux passes : la recherche d'abord (elle sert aussi à compter les
     résultats de chaque dossier), le dossier ensuite. */
  const found = useMemo(() => {
    const q = norm(query.trim());
    if (!q) return FAQS;
    return FAQS.filter((f) => haystack(f).includes(q));
  }, [query]);

  const visible = useMemo(() => (cat === "all" ? found : found.filter((f) => f.cat === cat)), [found, cat]);

  const counts = useMemo(() => {
    const map = {} as Record<CategoryId, number>;
    CATEGORIES.forEach(({ id }) => {
      map[id] = found.filter((f) => f.cat === id).length;
    });
    return map;
  }, [found]);

  /* Résultats trouvés par la recherche mais rangés dans un autre dossier :
     sans ce compteur, filtrer sur « TAILLES » puis chercher « colis »
     donnerait un écran vide sans explication. */
  const elsewhere = found.length - visible.length;

  const toggle = (id: string) =>
    setOpenIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));

  const allOpen = visible.length > 0 && visible.every((f) => openIds.includes(f.id));
  const toggleAll = () => setOpenIds(allOpen ? [] : visible.map((f) => f.id));

  const reset = () => {
    setQuery("");
    setCat("all");
  };

  return (
    <PageShell>
      <main className="relative px-[clamp(12px,4vw,48px)] pt-[clamp(92px,11vw,132px)] pb-[clamp(48px,8vw,100px)]">
        <style>{FAQ_CSS}</style>

        {/* Décor photo, comme /contact et les pages légales : calé sur le
            viewport (et non sur la hauteur du document) pour rester net. */}
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
        <span aria-hidden className="pointer-events-none fixed inset-0 z-0 bg-black/25" />

        {/* ================= FENÊTRE WINDOWS 95 ================= */}
        <div
          className="relative z-[1] mx-auto max-w-[1180px] overflow-hidden rounded-xl border-2 border-[#b8b4cc] bg-[#e7e5f1]"
          style={{
            boxShadow:
              "inset 0 2px 3px rgba(255,255,255,0.9), inset 0 -3px 6px rgba(0,0,0,0.18), 0 14px 30px rgba(30,36,48,0.28)",
          }}
        >
          {/* ---- Barre de titre ---- */}
          <div className="flex items-center justify-between gap-3 px-3 py-2" style={{ background: VIOLET_BAR }}>
            <div className="flex min-w-0 items-center gap-2">
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-[4px] bg-white/85 text-[0.65rem] shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.3)]">
                ❓
              </span>
              <h1
                className={`${MONO} truncate text-[clamp(0.62rem,2.1vw,0.9rem)] font-bold tracking-[0.05em] text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.45)]`}
              >
                HELP_CENTER_2000.EXE
              </h1>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <WindowButton label="Réduire" glyph="_" />
              <WindowButton label="Agrandir" glyph="🗖" />
              <WindowButton label="Fermer" glyph="✖" />
            </div>
          </div>

          {/* ---- Corps de la fenêtre : papier millimétré + stickers ---- */}
          <div className="relative p-[clamp(14px,3vw,32px)]" style={GRID_BG}>

            {/* Pastilles collées aux quatre coins du papier millimétré.
                Décor pur : au-dessus des cartes (z-2) pour donner l'effet
                « autocollant posé par-dessus », mais jamais cliquable, et
                calées à l'intérieur du cadre pour n'être jamais rognées. */}
            <span aria-hidden className="pointer-events-none absolute inset-0 z-[2]">
              <span
                className="lilfaq-sticker absolute top-[3px] left-[3px] h-[clamp(30px,4.6vw,50px)] w-[clamp(30px,4.6vw,50px)]"
                style={{ ["--r" as string]: "-16deg" }}
              >
                <ChromeStar uid="faq-star-a" />
              </span>
              <span
                className="lilfaq-sticker lilfaq-s2 absolute top-[3px] right-[3px] h-[clamp(26px,4vw,44px)] w-[clamp(26px,4vw,44px)]"
                style={{ ["--r" as string]: "14deg" }}
              >
                <HoloSmiley uid="faq-smiley" />
              </span>
              <span
                className="lilfaq-sticker lilfaq-s3 absolute bottom-[3px] left-[3px] h-[clamp(24px,3.6vw,40px)] w-[clamp(24px,3.6vw,40px)]"
                style={{ ["--r" as string]: "10deg" }}
              >
                <GemSticker uid="faq-heart" shape="heart" hue={["#FFC0DF", "#EE4B96", "#B3155A"]} />
              </span>
              <span
                className="lilfaq-sticker lilfaq-s4 absolute right-[3px] bottom-[3px] h-[clamp(28px,4.4vw,46px)] w-[clamp(28px,4.4vw,46px)]"
                style={{ ["--r" as string]: "-12deg" }}
              >
                <GemSticker uid="faq-star-b" shape="star" hue={["#FFB3D6", "#F0509A", "#B7175C"]} />
              </span>
            </span>

            <div className="relative z-[1]">

              {/* ============ EN-TÊTE ============ */}
              <header
                className="mb-[clamp(16px,2.8vw,26px)] flex flex-wrap items-center gap-[clamp(12px,2.4vw,20px)] rounded-2xl border border-[#c6c2d8] bg-white/85 p-[clamp(14px,2.4vw,22px)] backdrop-blur-[1px]"
                style={{ boxShadow: "inset 0 2px 3px rgba(255,255,255,0.9), 0 6px 14px rgba(30,36,48,0.14)" }}
              >
                <span
                  className={`grid h-[clamp(48px,7vw,62px)] w-[clamp(48px,7vw,62px)] shrink-0 place-items-center rounded-2xl border border-[#8f6ae0] text-[clamp(1.5rem,3.6vw,2rem)] ${PLASTIC}`}
                  style={{ background: VIOLET_BUMP }}
                >
                  ❓
                </span>
                <div className="min-w-[180px] flex-1">
                  <p className={`${MONO} mb-1 text-[0.55rem] font-bold tracking-[0.14em] text-[#5b2fb8]`}>
                    C:\LILOG\AIDE\FAQ\ <span style={{ color: PINK }}>★</span> BASE_DE_CONNAISSANCES
                  </p>
                  <h2 className={`${LCD} text-[clamp(1.5rem,5vw,2.4rem)] leading-[1.05] tracking-[0.02em] text-[#2a1266] uppercase`}>
                    Questions fréquentes
                  </h2>
                  <p className={`${MONO} mt-1.5 text-[clamp(0.62rem,1.5vw,0.7rem)] leading-relaxed text-[#4a4560]`}>
                    Authenticité, tailles, livraison, retours — les réponses, sans blabla.
                  </p>
                </div>
                <div
                  className={`${MONO} w-full shrink-0 basis-full rounded-lg border border-[#c6c2d8] bg-[linear-gradient(180deg,#fdfdff_0%,#ebe9f4_100%)] px-3 py-2 text-[0.55rem] leading-relaxed font-bold tracking-[0.06em] text-[#4a4560] sm:w-auto sm:basis-auto ${PLASTIC}`}
                >
                  {FAQS.length} FICHE(S) INDEXÉE(S)
                  <br />
                  MISE À JOUR : 14 juillet 2026
                </div>
              </header>

              {/* ============ RECHERCHE ============ */}
              <section
                aria-label="Rechercher dans la FAQ"
                className="mb-[clamp(14px,2.4vw,22px)] overflow-hidden rounded-xl border border-[#c6c2d8] bg-white/85 backdrop-blur-[1px]"
                style={{ boxShadow: "inset 0 2px 3px rgba(255,255,255,0.9), 0 6px 14px rgba(30,36,48,0.14)" }}
              >
                <div className="px-3 py-2" style={{ background: VIOLET_BAR_SOFT }}>
                  <h3 className={`${MONO} text-[0.66rem] font-bold tracking-[0.05em] text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.4)]`}>
                    🔎 RECHERCHE.EXE ★
                  </h3>
                </div>
                <div className="p-[clamp(12px,2.2vw,20px)]">
                  <label htmlFor="lilfaq-search" className={`${MONO} mb-1.5 block text-[0.55rem] font-bold tracking-[0.08em] text-[#5b2fb8]`}>
                    MOT-CLÉ
                  </label>
                  <div className="relative">
                    <input
                      id="lilfaq-search"
                      type="search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="🔍 Tape un mot-clé (ex: retours, taille, livraison)..."
                      className={`${MONO} w-full rounded-xl border border-gray-300 bg-white p-3 pr-11 text-[clamp(0.66rem,1.6vw,0.74rem)] text-[#1E2430] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2)] outline-none placeholder:text-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-300/50 [&::-webkit-search-cancel-button]:hidden`}
                    />
                    {query && (
                      <button
                        type="button"
                        onClick={() => setQuery("")}
                        aria-label="Effacer la recherche"
                        className={`${MONO} absolute top-1/2 right-2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md border border-[#c6c2d8] bg-[linear-gradient(180deg,#f6f5fb_0%,#e7e5f1_48%,#d3d0e1_100%)] text-[0.65rem] font-bold text-[#262626] transition hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7147d4] ${PLASTIC} ${PLASTIC_PRESS}`}
                      >
                        ✖
                      </button>
                    )}
                  </div>
                </div>
              </section>

              {/* ============ DOSSIERS DE CATÉGORIES ============ */}
              {/* Onglets « dossiers plastique » : sur mobile, la rangée défile
                  horizontalement plutôt que de passer à la ligne. */}
              <nav
                aria-label="Filtrer par catégorie"
                className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {[{ id: "all" as const, icon: "🗂", label: "TOUT" }, ...CATEGORIES].map(({ id, icon, label }) => {
                  const on = cat === id;
                  const n = id === "all" ? found.length : counts[id];
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setCat(id)}
                      aria-pressed={on}
                      className={`${MONO} shrink-0 rounded-t-2xl rounded-b-md border px-3.5 py-2.5 text-[clamp(0.52rem,1.5vw,0.64rem)] font-bold tracking-[0.04em] whitespace-nowrap transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7147d4] ${
                        on
                          ? `border-purple-700 text-white ${PLASTIC_ON}`
                          : `border-[#c6c2d8] bg-[linear-gradient(180deg,#fdfdff_0%,#ebe9f4_48%,#d3d0e1_100%)] text-[#4a4560] hover:bg-purple-100 hover:brightness-105 ${PLASTIC} ${PLASTIC_PRESS}`
                      }`}
                      style={on ? { background: VIOLET_BUMP } : undefined}
                    >
                      [ {icon} {label} ]{" "}
                      <span className={on ? "text-white/75" : "text-[#8b86a3]"}>({n})</span>
                    </button>
                  );
                })}
              </nav>

              {/* ---- Ligne d'état : compteur + tout déplier ---- */}
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-t border-dashed border-[#c6c2d8] pt-3">
                <p className={`${MONO} text-[0.55rem] tracking-[0.08em] text-[#5b2fb8]`}>
                  <span style={{ color: PINK }}>✦</span> {visible.length} FICHE(S) AFFICHÉE(S)
                  {query.trim() && ` — RECHERCHE : « ${query.trim()} »`}
                </p>
                {visible.length > 0 && (
                  <button
                    type="button"
                    onClick={toggleAll}
                    className={`${MONO} rounded-full border border-[#c6c2d8] bg-[linear-gradient(180deg,#fdfdff_0%,#ebe9f4_48%,#d3d0e1_100%)] px-3.5 py-1.5 text-[0.55rem] font-bold tracking-[0.04em] text-[#262626] transition hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7147d4] ${PLASTIC} ${PLASTIC_PRESS}`}
                  >
                    [ {allOpen ? "▲ TOUT_REPLIER" : "▼ TOUT_DÉPLIER"} ]
                  </button>
                )}
              </div>

              {/* ============ ACCORDÉONS ============ */}
              {visible.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {visible.map((item) => (
                    <FaqCard
                      key={item.id}
                      item={item}
                      query={query}
                      open={openIds.includes(item.id)}
                      onToggle={() => toggle(item.id)}
                    />
                  ))}
                </div>
              ) : (
                /* ---- Boîte de dialogue « aucun résultat » ---- */
                <div
                  className="overflow-hidden rounded-xl border-2 border-[#b8b4cc] bg-[#eeecf6]"
                  style={{
                    boxShadow:
                      "inset 0 2px 3px rgba(255,255,255,0.9), inset 0 -3px 6px rgba(0,0,0,0.14), 0 5px 12px rgba(30,36,48,0.18)",
                  }}
                >
                  <div className="flex items-center justify-between gap-2 px-2.5 py-1.5" style={{ background: VIOLET_BAR }}>
                    <span className={`${MONO} truncate text-[0.55rem] font-bold tracking-[0.06em] text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.45)]`}>
                      ⚠️ AUCUN_RESULTAT.DLG
                    </span>
                    <span className="grid h-4 w-5 shrink-0 place-items-center rounded-[3px] border border-[#c6c2d8] bg-[linear-gradient(180deg,#f6f5fb_0%,#d3d0e1_100%)] text-[0.5rem] font-bold text-[#262626]">
                      ✖
                    </span>
                  </div>
                  <div className="flex items-start gap-3 px-3.5 py-4">
                    <span className="text-[1.4rem] leading-none drop-shadow-[0_2px_2px_rgba(0,0,0,0.2)]">🔍</span>
                    <p className={`${MONO} text-[clamp(0.66rem,1.4vw,0.72rem)] leading-[1.85] text-[#2b2b33]`}>
                      Aucune fiche ne correspond à ta recherche dans ce dossier.
                      {elsewhere > 0 && (
                        <>
                          {" "}
                          <strong>{elsewhere} fiche(s)</strong> attendent dans les autres dossiers.
                        </>
                      )}
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-end gap-2 px-3.5 pb-3.5">
                    <button
                      type="button"
                      onClick={reset}
                      className={`${MONO} rounded-md border border-[#c6c2d8] bg-[linear-gradient(180deg,#fdfdff_0%,#ebe9f4_48%,#d3d0e1_100%)] px-4 py-1.5 text-[0.58rem] font-bold text-[#262626] transition hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7147d4] ${PLASTIC} ${PLASTIC_PRESS}`}
                    >
                      [ 🗂 VOIR TOUTES LES FICHES ]
                    </button>
                  </div>
                </div>
              )}

              {/* ============ HOTLINE ============ */}
              <section
                aria-label="Encore besoin d'aide ?"
                className="mt-[clamp(22px,4vw,40px)] overflow-hidden rounded-2xl border-2 border-[#b8b4cc] bg-[#eeecf6]"
                style={{
                  boxShadow:
                    "inset 0 2px 3px rgba(255,255,255,0.9), inset 0 -3px 6px rgba(0,0,0,0.14), 0 8px 18px rgba(30,36,48,0.2)",
                }}
              >
                <div className="flex items-center justify-between gap-2 px-3 py-1.5" style={{ background: VIOLET_BAR }}>
                  <span className={`${MONO} truncate text-[clamp(0.55rem,1.7vw,0.7rem)] font-bold tracking-[0.06em] text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.45)]`}>
                    ⚠️ STILL_NEED_HELP.SYS
                  </span>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <WindowButton label="Réduire" glyph="_" />
                    <WindowButton label="Fermer" glyph="✖" />
                  </div>
                </div>

                <div className="flex flex-col items-center gap-[clamp(12px,2.4vw,20px)] p-[clamp(16px,3vw,30px)] text-center">
                  <span
                    className={`grid h-[clamp(52px,8vw,68px)] w-[clamp(52px,8vw,68px)] place-items-center rounded-2xl border border-[#8f6ae0] text-[clamp(1.6rem,4vw,2.2rem)] ${PLASTIC}`}
                    style={{ background: VIOLET_BUMP }}
                  >
                    ☎
                  </span>
                  <p className={`${LCD} text-[clamp(1.1rem,3.6vw,1.7rem)] leading-tight tracking-[0.02em] text-[#2a1266] uppercase`}>
                    Un doute sur une pièce ?
                    <br />
                    Une question sur ta commande ?
                  </p>
                  <p className={`${MONO} max-w-[46ch] text-[clamp(0.64rem,1.5vw,0.72rem)] leading-[1.9] text-[#4a4560]`}>
                    On répond du lundi au vendredi, de 10h à 18h. Mesures, état d&apos;une pièce, suivi de colis — écris-nous,
                    on regarde ça tout de suite.
                  </p>

                  <Link
                    href="/contact"
                    className={`${MONO} w-full max-w-[420px] rounded-full bg-purple-600 px-4 py-4 text-[clamp(0.62rem,1.7vw,0.75rem)] font-bold tracking-[0.04em] text-white no-underline shadow-[inset_0_2px_4px_rgba(255,255,255,0.7),0_4px_6px_rgba(0,0,0,0.15)] transition hover:brightness-110 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7147d4]`}
                  >
                    [ 📞 CONTACTER_LA_HOTLINE.EXE ]
                  </Link>

                  {/* Raccourcis vers les deux autres pages du centre d'aide. */}
                  <div className="flex flex-wrap justify-center gap-2">
                    {[
                      { href: "/livraison", label: "📦 LIVRAISON.DOC" },
                      { href: "/retours", label: "↩️ RETOURS.SYS" },
                    ].map(({ href, label }) => (
                      <Link
                        key={href}
                        href={href}
                        className={`${MONO} rounded-full border border-[#c6c2d8] bg-[linear-gradient(180deg,#fdfdff_0%,#ebe9f4_48%,#d3d0e1_100%)] px-4 py-2 text-[0.58rem] font-bold tracking-[0.04em] text-[#262626] no-underline transition hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7147d4] ${PLASTIC} ${PLASTIC_PRESS}`}
                      >
                        [ {label} ]
                      </Link>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* ---- Barre de statut ---- */}
          <div className="flex items-center justify-between gap-3 border-t-2 border-[#b8b4cc] bg-[#e7e5f1] px-3 py-1.5">
            <span className={`${MONO} truncate text-[0.5rem] tracking-wider text-[#5a5670]`}>
              <span style={{ color: PINK }}>✦</span> lilog.shop@gmail.com — Lun-Ven 10h/18h
            </span>
            <span className={`${MONO} shrink-0 text-[0.5rem] tracking-wider text-[#5a5670]`}>
              {visible.length} objet(s) — 1.44 Mo
            </span>
          </div>
        </div>
      </main>
    </PageShell>
  );
}
