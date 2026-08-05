"use client";

/* ============================================================
   /cgv — LEGAL_CENTER.EXE
   Direction artistique Y2K / Windows 95 / Chunky Plastic,
   strictement alignée sur /contact (mêmes jetons plastique,
   même quadrillage « papier millimétré », mêmes pastilles,
   mêmes disquettes 3.5").

   ⚠ PAREFEU : cette page est 100 % autonome.
   Tout le style vit dans ce fichier via Tailwind (+ une feuille
   locale préfixée `lilcgv-` pour les animations et l'impression).
   AUCUNE classe globale de `globals.css` n'est utilisée ni
   modifiée ici, donc aucune autre page ne peut être impactée.
   Les pages /cookies, /mentions-legales et /confidentialite
   continuent d'utiliser LegalShell : elles ne bougent pas.
   ============================================================ */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { Floppy, FloppyStyles } from "@/components/contact/floppy";
import { ChromeStar, GemSticker, HoloSmiley } from "@/components/contact/stickers";

/* ---- Jetons « chunky plastic » — identiques à /contact ---- */
const PLASTIC =
  "shadow-[inset_0_2px_4px_rgba(255,255,255,0.95),inset_0_-2px_5px_rgba(0,0,0,0.25),0_2px_3px_rgba(30,36,48,0.18)]";
const PLASTIC_PRESS =
  "active:shadow-[inset_0_3px_6px_rgba(0,0,0,0.32),inset_0_-1px_0_rgba(255,255,255,0.7)] active:scale-95";
const PLASTIC_ON =
  "shadow-[inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-2px_5px_rgba(0,0,0,0.3),0_2px_4px_rgba(80,30,140,0.35)]";

const MONO = "font-[family-name:var(--mono)]";
const LCD = "font-[family-name:var(--font-lcd)]";

/* Quadrillage « papier millimétré » du fond de fenêtre (idem /contact). */
const GRID_BG = {
  backgroundColor: "#f0f0f5",
  backgroundImage:
    "linear-gradient(rgba(113,71,212,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(113,71,212,0.08) 1px, transparent 1px)",
  backgroundSize: "22px 22px",
};

/* Fond de page : grille pastel plus large, posée sur un dégradé lavande. */
const PAGE_BG = {
  backgroundColor: "#e9e6f6",
  backgroundImage:
    "radial-gradient(120% 80% at 50% 0%, rgba(255,255,255,0.85) 0%, rgba(233,230,246,0) 60%)," +
    "linear-gradient(rgba(113,71,212,0.07) 1px, transparent 1px)," +
    "linear-gradient(90deg, rgba(113,71,212,0.07) 1px, transparent 1px)," +
    "linear-gradient(180deg, #efe9fb 0%, #e4e7f8 55%, #f7e9f3 100%)",
  backgroundSize: "100% 100%, 44px 44px, 44px 44px, 100% 100%",
};

/* ---- Feuille locale : bulles de pastilles + mise en page papier ---- */
const CGV_CSS = `
@keyframes lilcgv-bob{
  0%,100%{transform:translate3d(0,0,0) rotate(var(--r,0deg)) scale(1)}
  50%{transform:translate3d(0,-7%,0) rotate(calc(var(--r,0deg) + 6deg)) scale(1.05)}
}
.lilcgv-sticker{animation:lilcgv-bob 7s ease-in-out infinite;
  filter:drop-shadow(0 3px 4px rgba(30,36,48,.3))}
.lilcgv-s2{animation-duration:8.4s;animation-delay:-2.2s}
.lilcgv-s3{animation-duration:6.2s;animation-delay:-3.7s}
.lilcgv-s4{animation-duration:9s;animation-delay:-5.1s}

@media (prefers-reduced-motion: reduce){
  .lilcgv-sticker{animation:none}
}

/* ---- Impression : on ne garde que le document ---- */
@media print{
  nav.nav, footer.footer, .lilcgv-noprint{display:none !important}
  .lilcgv-main{padding:0 !important; background:#fff !important}
  .lilcgv-window{max-width:none !important; border:none !important;
    border-radius:0 !important; box-shadow:none !important; background:#fff !important}
  .lilcgv-body{background:#fff !important; background-image:none !important; padding:0 !important}
  .lilcgv-reader{border:none !important; box-shadow:none !important; padding:0 !important}
  .lilcgv-section{break-inside:avoid; page-break-inside:avoid}
}
`;

/* ============================================================
   Briques de mise en page du « Notepad »
   ============================================================ */

/* Boutons de contrôle de fenêtre  [ _ ] [ 🗖 ] [ ✖ ] */
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

function P({ children }: { children: React.ReactNode }) {
  return (
    <p className={`${MONO} mb-3.5 text-[clamp(0.7rem,1.5vw,0.78rem)] leading-[1.95] text-[#2b2b33] last:mb-0`}>
      {children}
    </p>
  );
}

/* Puces « étoile pixel » — le marqueur natif est remplacé par une pastille. */
function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="mb-3.5 flex list-none flex-col gap-2 p-0">
      {items.map((t) => (
        <li key={t} className="flex items-start gap-2.5">
          <span className={`${LCD} mt-[1px] shrink-0 text-[0.95rem] leading-none text-[#d24aa0]`}>✦</span>
          <span className={`${MONO} text-[clamp(0.7rem,1.5vw,0.78rem)] leading-[1.8] text-[#2b2b33]`}>{t}</span>
        </li>
      ))}
    </ul>
  );
}

/* Résumé rapide — étiquette de disquette miniature collée dans le texte. */
function Tldr({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="mb-4 flex items-start gap-3 rounded-xl border border-[#e7b9d6] bg-[linear-gradient(180deg,#fff3fa_0%,#ffe6f3_100%)] px-3.5 py-3"
      style={{ boxShadow: "inset 0 2px 3px rgba(255,255,255,0.9), 0 2px 4px rgba(190,80,150,0.15)" }}
    >
      <span className="text-[1.1rem] leading-none">💾</span>
      <p className={`${MONO} text-[clamp(0.66rem,1.4vw,0.72rem)] leading-[1.8] text-[#8a1f63]`}>
        <span className="font-bold tracking-[0.06em]">EN BREF — </span>
        {children}
      </p>
    </div>
  );
}

/* Boîte de dialogue système : l'avertissement qui compte. */
function Notice({ title = "SYSTEM_NOTICE.DLG", children }: { title?: string; children: React.ReactNode }) {
  return (
    <div
      className="my-4 overflow-hidden rounded-xl border-2 border-[#b8b4cc] bg-[#eeecf6]"
      style={{
        boxShadow:
          "inset 0 2px 3px rgba(255,255,255,0.9), inset 0 -3px 6px rgba(0,0,0,0.14), 0 5px 12px rgba(30,36,48,0.18)",
      }}
    >
      <div
        className="flex items-center justify-between gap-2 px-2.5 py-1.5"
        style={{ background: "linear-gradient(90deg, #3b1d8f 0%, #7147d4 60%, #a86fe8 100%)" }}
      >
        <span className={`${MONO} truncate text-[0.55rem] font-bold tracking-[0.06em] text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.45)]`}>
          ⚠️ {title}
        </span>
        <span className="grid h-4 w-5 shrink-0 place-items-center rounded-[3px] border border-[#c6c2d8] bg-[linear-gradient(180deg,#f6f5fb_0%,#d3d0e1_100%)] text-[0.5rem] font-bold text-[#262626]">
          ✖
        </span>
      </div>
      <div className="flex items-start gap-3 px-3.5 py-3">
        <span className="text-[1.4rem] leading-none drop-shadow-[0_2px_2px_rgba(0,0,0,0.2)]">⚠️</span>
        <p className={`${MONO} text-[clamp(0.66rem,1.4vw,0.72rem)] leading-[1.85] text-[#2b2b33]`}>{children}</p>
      </div>
      <div className="flex justify-end px-3.5 pb-3">
        <span
          className={`${MONO} rounded-md border border-[#c6c2d8] bg-[linear-gradient(180deg,#fdfdff_0%,#ebe9f4_48%,#d3d0e1_100%)] px-5 py-1 text-[0.6rem] font-bold text-[#262626] ${PLASTIC}`}
        >
          OK
        </span>
      </div>
    </div>
  );
}

/* ============================================================
   Contenu légal — texte inchangé, habillage neuf
   ============================================================ */

type Section = {
  id: string;
  num: string;
  file: string;
  title: string;
  content: React.ReactNode;
};

const SECTIONS: Section[] = [
  {
    id: "objet",
    num: "01",
    file: "01_OBJET.TXT",
    title: "Objet",
    content: (
      <>
        <Tldr>en commandant sur Lil&apos;OG, tu acceptes ces conditions telles qu&apos;elles sont affichées le jour de ta commande.</Tldr>
        <P>
          Les présentes Conditions Générales de Vente (ci-après « CGV ») régissent l&apos;ensemble des ventes conclues entre
          Lil&apos;OG (ci-après « le Vendeur ») et tout acheteur (ci-après « le Client ») via le site lil-og.vercel.app.
        </P>
        <P>
          Toute commande implique l&apos;acceptation sans réserve des présentes CGV. Le Vendeur se réserve le droit de les
          modifier à tout moment ; les CGV applicables sont celles en vigueur à la date de la commande.
        </P>
      </>
    ),
  },
  {
    id: "vendeur",
    num: "02",
    file: "02_VENDEUR.INF",
    title: "Vendeur",
    content: (
      <>
        <P>
          <strong>Lil&apos;OG</strong>
          <br />
          Entreprise individuelle — Louna Lili Guitton
          <br />
          26 rue Soubise, 93400 Saint-Ouen-Sur-Seine, France
          <br />
          SIRET : <strong>98014870400011</strong>
          <br />
          Contact : <strong>lilog.shop@gmail.com</strong>
        </P>
      </>
    ),
  },
  {
    id: "produits",
    num: "03",
    file: "03_PRODUITS.DAT",
    title: "Produits",
    content: (
      <>
        <Tldr>chaque pièce est unique, seconde main, nettoyée et décrite telle qu&apos;elle est — usure comprise.</Tldr>
        <P>
          Lil&apos;OG propose exclusivement des articles de seconde main, sélectionnés, expertisés et nettoyés avant mise en
          vente. Chaque pièce est unique (one-of-one) : aucun réassort n&apos;est possible une fois un article vendu.
        </P>
        <P>
          Les photos et descriptions sont réalisées avec soin pour refléter fidèlement l&apos;état réel de chaque pièce.
          L&apos;état d&apos;usure normal inhérent à la nature des articles de seconde main est précisé sur chaque fiche
          produit et ne constitue pas un défaut.
        </P>
      </>
    ),
  },
  {
    id: "prix",
    num: "04",
    file: "04_PRIX.SYS",
    title: "Prix",
    content: (
      <>
        <P>
          Les prix sont affichés en euros toutes taxes comprises (TTC). Lil&apos;OG, en tant que micro-entreprise sous le
          seuil de franchise de TVA (article 293 B du CGI), ne collecte pas de TVA — la mention « TVA non applicable »
          s&apos;applique.
        </P>
        <P>
          Les frais de livraison sont calculés et affichés au moment du passage de commande. Ils ne sont pas inclus dans le
          prix affiché, sauf mention contraire.
        </P>
        <Notice title="PRIX_APPLICABLE.DLG">
          Le Vendeur se réserve le droit de modifier ses prix à tout moment. Le prix applicable est celui affiché au moment
          de la validation de la commande.
        </Notice>
      </>
    ),
  },
  {
    id: "commande",
    num: "05",
    file: "05_COMMANDE.EXE",
    title: "Commande",
    content: (
      <>
        <P>La commande est validée après :</P>
        <Bullets
          items={[
            "Sélection de l'article et ajout au panier",
            "Renseignement des coordonnées et adresse de livraison",
            "Choix du mode de livraison",
            "Validation du paiement",
          ]}
        />
        <P>
          Un e-mail de confirmation est envoyé dès validation. Le contrat de vente est conclu à réception de cet e-mail.
          Lil&apos;OG se réserve le droit d&apos;annuler toute commande en cas de suspicion de fraude ou
          d&apos;indisponibilité imprévue de l&apos;article, avec remboursement intégral sous 14 jours.
        </P>
      </>
    ),
  },
  {
    id: "paiement",
    num: "06",
    file: "06_PAIEMENT.SYS",
    title: "Paiement",
    content: (
      <>
        <Tldr>paiement à la commande, CB / Klarna / Alma selon disponibilité, aucune donnée bancaire conservée.</Tldr>
        <P>
          Le paiement est exigible à la commande. Les moyens de paiement acceptés sont ceux proposés par la plateforme de
          paiement Shopify Payments (carte bancaire Visa, Mastercard, American Express) ainsi que, selon disponibilité,
          Klarna ou Alma pour le paiement fractionné.
        </P>
        <P>
          Les données bancaires sont traitées et sécurisées directement par le prestataire de paiement. Lil&apos;OG ne
          conserve aucune donnée de carte bancaire.
        </P>
      </>
    ),
  },
  {
    id: "livraison",
    num: "07",
    file: "07_LIVRAISON.EXE",
    title: "Livraison",
    content: (
      <>
        <Tldr>expédition sous 2 à 5 jours ouvrés, suivi envoyé par e-mail, Colissimo ou Mondial Relay.</Tldr>
        <P>
          Les commandes sont expédiées dans un délai de 2 à 5 jours ouvrés à compter de la confirmation de paiement, via
          Colissimo ou Mondial Relay selon l&apos;option choisie.
        </P>
        <P>
          Un numéro de suivi est communiqué par e-mail dès l&apos;expédition. En cas de retard imputable au transporteur,
          Lil&apos;OG ne pourra être tenu responsable mais s&apos;engage à faire le nécessaire pour retrouver le colis.
        </P>
        <Notice title="TRANSFERT_DES_RISQUES.DLG">
          Le transfert des risques intervient à la livraison effective au Client (ou à un tiers désigné).
        </Notice>
      </>
    ),
  },
  {
    id: "retractation",
    num: "08",
    file: "08_RETRACTATION.DOC",
    title: "Droit de rétractation",
    content: (
      <>
        <Tldr>14 jours pour changer d&apos;avis, retour à tes frais, remboursement sous 14 jours après réception.</Tldr>
        <P>
          Conformément aux articles L.221-18 et suivants du Code de la consommation, le Client dispose d&apos;un délai de{" "}
          <strong>14 jours calendaires</strong> à compter de la réception pour exercer son droit de rétractation, sans
          justification.
        </P>
        <P>
          Pour exercer ce droit, le Client doit notifier sa décision par e-mail à <strong>lilog.shop@gmail.com</strong>{" "}
          avant l&apos;expiration du délai, en indiquant son numéro de commande.
        </P>
        <Notice title="CONDITIONS_DE_RETOUR.DLG">
          Les articles doivent être retournés non portés, non lavés, dans leur état d&apos;origine, aux frais du Client, à
          l&apos;adresse : Lil&apos;OG, 26 rue Soubise, 93400 Saint-Ouen-Sur-Seine.
        </Notice>
        <P>
          Le remboursement est effectué dans les <strong>14 jours</strong> suivant la réception et vérification du retour,
          par le même moyen de paiement. Les frais de livraison initiaux ne sont pas remboursés.
        </P>
      </>
    ),
  },
  {
    id: "garanties",
    num: "09",
    file: "09_GARANTIES.DLL",
    title: "Garanties légales",
    content: (
      <>
        <P>
          Tout achat bénéficie de la <strong>garantie légale de conformité</strong> (articles L.217-4 et suivants du Code de
          la consommation) et de la <strong>garantie contre les vices cachés</strong> (articles 1641 et suivants du Code
          civil).
        </P>
        <P>
          Les défauts d&apos;usure normaux inhérents aux articles de seconde main, dûment signalés dans la fiche produit, ne
          constituent pas un défaut de conformité. Tout article non conforme à sa description fera l&apos;objet d&apos;un
          remboursement intégral incluant les frais de retour.
        </P>
      </>
    ),
  },
  {
    id: "responsabilite",
    num: "10",
    file: "10_RESPONSABILITE.INI",
    title: "Responsabilité",
    content: (
      <>
        <P>
          Lil&apos;OG ne saurait être tenu responsable des dommages indirects résultant de l&apos;utilisation du site ou des
          produits. La responsabilité du Vendeur est limitée au montant de la commande concernée.
        </P>
        <P>
          Le Vendeur ne peut être tenu responsable en cas de force majeure, d&apos;actes de tiers ou d&apos;utilisation non
          conforme des articles par le Client.
        </P>
      </>
    ),
  },
  {
    id: "litiges",
    num: "11",
    file: "11_LITIGES.LOG",
    title: "Litiges",
    content: (
      <>
        <P>
          En cas de litige, le Client est invité à contacter Lil&apos;OG en premier lieu à{" "}
          <strong>lilog.shop@gmail.com</strong> pour une résolution amiable.
        </P>
        <P>
          À défaut d&apos;accord amiable, le Client peut recourir à la médiation de la consommation via la plateforme
          européenne de règlement en ligne des litiges : <strong>https://ec.europa.eu/consumers/odr</strong>.
        </P>
        <P>
          Les présentes CGV sont soumises au droit français. À défaut de résolution amiable, les tribunaux français seront
          seuls compétents.
        </P>
      </>
    ),
  },
];

/* Onglets de navigation rapide entre les pages légales. */
const TABS = [
  { href: "/cgv", icon: "📜", label: "CGV" },
  { href: "/cookies", icon: "📄", label: "COOKIES" },
  { href: "/mentions-legales", icon: "💬", label: "MENTIONS LÉGALES" },
  { href: "/confidentialite", icon: "🔒", label: "CONFIDENTIALITÉ" },
];

const DATE = "14 juillet 2026";

/* ============================================================
   Page
   ============================================================ */

export default function CgvPage() {
  const [active, setActive] = useState(SECTIONS[0].id);
  const [treeOpen, setTreeOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  /* Scrollspy : le dossier ouvert dans l'arborescence suit la lecture. */
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    );
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observerRef.current?.observe(el);
    });
    return () => observerRef.current?.disconnect();
  }, []);

  const openFile = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    setTreeOpen(false);
    const top = el.getBoundingClientRect().top + window.scrollY - 100;
    window.scrollTo({ top, behavior: "smooth" });
  };

  /* « Télécharger le PDF » passe par la boîte d'impression du navigateur
     (option « Enregistrer au format PDF ») : pas de dépendance en plus. */
  const print = () => window.print();

  return (
    <PageShell>
      <main
        className="lilcgv-main relative px-[clamp(12px,4vw,48px)] pt-[clamp(92px,11vw,132px)] pb-[clamp(48px,8vw,100px)]"
        style={PAGE_BG}
      >
        <style>{CGV_CSS}</style>
        <FloppyStyles />

        {/* Le conteneur relatif porte les pastilles : elles peuvent ainsi
            déborder de la fenêtre, qui elle reste en overflow-hidden. */}
        <div className="relative mx-auto max-w-[1180px]">

          {/* ---- Pastilles décoratives (mêmes bijoux que /contact) ---- */}
          <span aria-hidden className="lilcgv-noprint pointer-events-none absolute inset-0 z-20">
            <span
              className="lilcgv-sticker absolute h-[clamp(34px,5vw,58px)] w-[clamp(34px,5vw,58px)] -left-[10px] -top-[18px]"
              style={{ ["--r" as string]: "-16deg" }}
            >
              <ChromeStar uid="cgv-star-a" />
            </span>
            {/* Volontairement calée sur le flanc gauche, sous les onglets :
                elle ne doit jamais recouvrir les boutons de fenêtre. */}
            <span
              className="lilcgv-sticker lilcgv-s2 absolute h-[clamp(26px,3.6vw,42px)] w-[clamp(26px,3.6vw,42px)] -left-[16px] top-[70px]"
              style={{ ["--r" as string]: "12deg" }}
            >
              <GemSticker uid="cgv-star-b" shape="star" hue={["#FFB3D6", "#F0509A", "#B7175C"]} />
            </span>
            <span
              className="lilcgv-sticker lilcgv-s3 absolute h-[clamp(30px,4.2vw,50px)] w-[clamp(30px,4.2vw,50px)] -bottom-[16px] -left-[6px]"
              style={{ ["--r" as string]: "10deg" }}
            >
              <HoloSmiley uid="cgv-smiley" />
            </span>
            <span
              className="lilcgv-sticker lilcgv-s4 absolute h-[clamp(26px,3.6vw,42px)] w-[clamp(26px,3.6vw,42px)] -right-[6px] -bottom-[18px]"
              style={{ ["--r" as string]: "-12deg" }}
            >
              <GemSticker uid="cgv-heart" shape="heart" hue={["#FFC0DF", "#EE4B96", "#B3155A"]} />
            </span>
          </span>

          {/* ================= FENÊTRE WINDOWS 95 ================= */}
          <div
            className="lilcgv-window relative z-[1] overflow-hidden rounded-xl border-2 border-[#b8b4cc] bg-[#e7e5f1]"
            style={{
              boxShadow:
                "inset 0 2px 3px rgba(255,255,255,0.9), inset 0 -3px 6px rgba(0,0,0,0.18), 0 14px 30px rgba(30,36,48,0.28)",
            }}
          >
            {/* ---- Barre de titre ---- */}
            <div
              className="flex items-center justify-between gap-3 px-3 py-2"
              style={{ background: "linear-gradient(90deg, #3b1d8f 0%, #7147d4 55%, #a86fe8 100%)" }}
            >
              <div className="flex min-w-0 items-center gap-2">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-[4px] bg-white/85 text-[0.65rem] shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.3)]">
                  📜
                </span>
                <h1
                  className={`${MONO} truncate text-[clamp(0.62rem,2.1vw,0.9rem)] font-bold tracking-[0.05em] text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.45)]`}
                >
                  LEGAL_CENTER.EXE
                </h1>
              </div>
              <div className="lilcgv-noprint flex shrink-0 items-center gap-1.5">
                <WindowButton label="Réduire" glyph="_" />
                <WindowButton label="Agrandir" glyph="🗖" />
                <WindowButton label="Fermer" glyph="✖" />
              </div>
            </div>

            {/* ---- Sous-barre d'onglets légaux ---- */}
            <nav
              aria-label="Pages légales"
              className="lilcgv-noprint flex gap-1 overflow-x-auto border-b-2 border-[#b8b4cc] bg-[#ded9ee] px-2 pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {TABS.map(({ href, icon, label }) => {
                const on = href === "/cgv";
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={on ? "page" : undefined}
                    className={`${MONO} shrink-0 rounded-t-lg border border-b-0 px-3 py-2 text-[clamp(0.5rem,1.5vw,0.62rem)] font-bold tracking-[0.04em] whitespace-nowrap no-underline transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7147d4] ${
                      on
                        ? "relative top-px border-[#b8b4cc] bg-white text-[#3b1d8f] shadow-[inset_0_3px_7px_rgba(0,0,0,0.16)]"
                        : `border-[#c6c2d8] bg-[linear-gradient(180deg,#fdfdff_0%,#ebe9f4_48%,#d3d0e1_100%)] text-[#4a4560] hover:bg-purple-100 hover:brightness-105 ${PLASTIC} ${PLASTIC_PRESS}`
                    }`}
                  >
                    {icon} {label}
                  </Link>
                );
              })}
            </nav>

            {/* ---- Corps de la fenêtre : papier millimétré ---- */}
            <div className="lilcgv-body p-[clamp(14px,3vw,32px)]" style={GRID_BG}>

              {/* ============ EN-TÊTE DU DOCUMENT ============ */}
              <header
                className="mb-[clamp(18px,3vw,28px)] flex flex-wrap items-center gap-[clamp(12px,2.4vw,20px)] rounded-2xl border border-[#c6c2d8] bg-white/85 p-[clamp(14px,2.4vw,22px)] backdrop-blur-[1px]"
                style={{ boxShadow: "inset 0 2px 3px rgba(255,255,255,0.9), 0 6px 14px rgba(30,36,48,0.14)" }}
              >
                <span
                  className={`grid h-[clamp(48px,7vw,62px)] w-[clamp(48px,7vw,62px)] shrink-0 place-items-center rounded-2xl border border-[#8f6ae0] text-[clamp(1.5rem,3.6vw,2rem)] ${PLASTIC}`}
                  style={{ background: "linear-gradient(180deg, #b58cf5 0%, #7147d4 55%, #5b2fb8 100%)" }}
                >
                  📜
                </span>
                <div className="min-w-[180px] flex-1">
                  <p className={`${MONO} mb-1 text-[0.55rem] font-bold tracking-[0.14em] text-[#5b2fb8]`}>
                    C:\LILOG\LEGAL\ ★ DOCUMENT_OFFICIEL
                  </p>
                  <h2 className={`${LCD} text-[clamp(1.5rem,5vw,2.4rem)] leading-[1.05] tracking-[0.02em] text-[#2a1266] uppercase`}>
                    Conditions Générales de Vente
                  </h2>
                  <p className={`${MONO} mt-1.5 text-[clamp(0.62rem,1.5vw,0.7rem)] leading-relaxed text-[#4a4560]`}>
                    Conditions applicables à tout achat effectué sur lil-og.vercel.app.
                  </p>
                </div>
                <div
                  className={`${MONO} w-full shrink-0 basis-full rounded-lg border border-[#c6c2d8] bg-[linear-gradient(180deg,#fdfdff_0%,#ebe9f4_100%)] px-3 py-2 text-[0.55rem] leading-relaxed font-bold tracking-[0.06em] text-[#4a4560] sm:w-auto sm:basis-auto ${PLASTIC}`}
                >
                  VERSION : {DATE}
                  <br />
                  {SECTIONS.length} FICHIER(S) — 1.44 Mo
                </div>
              </header>

              {/* ============ 2 COLONNES : EXPLORATEUR + LECTEUR ============ */}
              <div className="grid grid-cols-1 gap-[clamp(16px,2.6vw,28px)] lg:grid-cols-[minmax(0,286px)_minmax(0,1fr)]">

                {/* ---------- COLONNE GAUCHE : ARBORESCENCE ---------- */}
                <aside aria-label="Sommaire" className="lilcgv-noprint lg:sticky lg:top-[100px] lg:self-start">
                  <div
                    className="overflow-hidden rounded-xl border border-[#c6c2d8] bg-white/85 backdrop-blur-[1px]"
                    style={{ boxShadow: "inset 0 2px 3px rgba(255,255,255,0.9), 0 6px 14px rgba(30,36,48,0.14)" }}
                  >
                    <div
                      className="px-3 py-2"
                      style={{ background: "linear-gradient(90deg, #5b2fb8 0%, #7147d4 60%, #b184ee 100%)" }}
                    >
                      <h3 className={`${MONO} text-[0.66rem] font-bold tracking-[0.05em] text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.4)]`}>
                        📂 SOMMAIRE.DIR ★
                      </h3>
                    </div>

                    {/* Accordéon mobile : l'arborescence se replie sous ce bouton. */}
                    <button
                      type="button"
                      onClick={() => setTreeOpen((v) => !v)}
                      aria-expanded={treeOpen}
                      className={`${MONO} flex w-full items-center justify-between gap-2 border-b border-[#e2dff0] px-3 py-2.5 text-[0.62rem] font-bold tracking-[0.05em] text-[#3b1d8f] lg:hidden`}
                    >
                      <span>{treeOpen ? "▼" : "▶"} PARCOURIR ({SECTIONS.length})</span>
                      <span className="text-[0.55rem] text-[#7147d4]">
                        {treeOpen ? "REPLIER" : "DÉPLIER"}
                      </span>
                    </button>

                    <div className={`${treeOpen ? "block" : "hidden"} p-2.5 lg:block`}>
                      <p className={`${MONO} mb-2 truncate px-1 text-[0.5rem] tracking-[0.08em] text-[#8b86a3]`}>
                        C:\LILOG\LEGAL\CGV\
                      </p>
                      <div className="flex flex-col gap-1.5">
                        {SECTIONS.map(({ id, file }, i) => {
                          const on = active === id;
                          const last = i === SECTIONS.length - 1;
                          return (
                            <button
                              key={id}
                              type="button"
                              onClick={() => openFile(id)}
                              aria-current={on ? "true" : undefined}
                              className={`${MONO} flex w-full items-center gap-1.5 rounded-xl border px-2.5 py-2 text-left text-[clamp(0.55rem,1.4vw,0.63rem)] font-bold tracking-[0.02em] transition ${PLASTIC_PRESS} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7147d4] ${
                                on
                                  ? `border-purple-700 bg-purple-600 text-white ${PLASTIC_ON}`
                                  : `border-[#c6c2d8] bg-white/80 text-[#3a3550] shadow-md hover:bg-purple-100 ${PLASTIC}`
                              }`}
                            >
                              <span className={`shrink-0 opacity-60 ${on ? "text-white" : "text-[#8b86a3]"}`}>
                                {last ? "└─" : "├─"}
                              </span>
                              <span className="shrink-0 text-[0.8rem] leading-none">{on ? "📂" : "📁"}</span>
                              <span className="truncate">{file}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* ---- Boutons d'action chunky plastic ---- */}
                  <div className="mt-3 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={print}
                      className={`${MONO} w-full rounded-full bg-purple-600 px-3 py-3 text-[clamp(0.58rem,1.5vw,0.68rem)] font-bold tracking-[0.04em] text-white shadow-[inset_0_2px_4px_rgba(255,255,255,0.7),0_4px_6px_rgba(0,0,0,0.15)] transition hover:brightness-110 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7147d4]`}
                    >
                      [ 🖨️ IMPRIMER_DOC.EXE ]
                    </button>
                    <button
                      type="button"
                      onClick={print}
                      title="Ouvre la boîte d'impression : choisis « Enregistrer au format PDF »."
                      className={`${MONO} w-full rounded-full border border-[#c6c2d8] bg-[linear-gradient(180deg,#fdfdff_0%,#ebe9f4_48%,#d3d0e1_100%)] px-3 py-3 text-[clamp(0.58rem,1.5vw,0.68rem)] font-bold tracking-[0.04em] text-[#262626] transition hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7147d4] ${PLASTIC} ${PLASTIC_PRESS}`}
                    >
                      [ 💾 TÉLÉCHARGER_PDF.EXE ]
                    </button>
                    <Link
                      href="/contact"
                      className={`${MONO} w-full rounded-full border border-[#c6c2d8] bg-[linear-gradient(180deg,#fdfdff_0%,#ebe9f4_48%,#d3d0e1_100%)] px-3 py-3 text-center text-[clamp(0.58rem,1.5vw,0.68rem)] font-bold tracking-[0.04em] text-[#262626] no-underline transition hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7147d4] ${PLASTIC} ${PLASTIC_PRESS}`}
                    >
                      [ ☎ UNE_QUESTION.LNK ]
                    </Link>
                  </div>
                </aside>

                {/* ---------- COLONNE DROITE : LECTEUR « NOTEPAD » ---------- */}
                <section aria-label="Texte des conditions générales de vente" className="min-w-0">
                  <div
                    className="lilcgv-reader rounded-2xl border border-gray-200 bg-white p-[clamp(16px,3.4vw,32px)]"
                    style={{ boxShadow: "inset 2px 2px 6px rgba(0,0,0,0.15)" }}
                  >
                    {SECTIONS.map(({ id, num, file, title, content }, i) => (
                      <article
                        key={id}
                        id={id}
                        className={`lilcgv-section scroll-mt-[110px] ${i > 0 ? "mt-[clamp(30px,5vw,48px)]" : ""}`}
                      >
                        {/* Scotch adhésif + titre rétro */}
                        <div className="mb-3">
                          <span
                            className={`${MONO} inline-block -rotate-1 border border-yellow-200/70 bg-yellow-100/80 px-3 py-1 text-[0.52rem] font-bold tracking-[0.1em] text-[#7a6412] shadow-sm`}
                          >
                            📎 {file}
                          </span>
                          <h3
                            className={`${LCD} mt-2 text-[clamp(1.35rem,4.4vw,2rem)] leading-none tracking-[0.03em] text-[#2a1266] uppercase`}
                          >
                            <span className="text-[#d24aa0]">{num}.</span> {title}
                          </h3>
                          <div
                            className="mt-2 h-[3px] w-full opacity-45"
                            style={{
                              backgroundImage:
                                "repeating-linear-gradient(90deg,#7147d4 0 6px,transparent 6px 12px)",
                            }}
                          />
                        </div>
                        {content}
                      </article>
                    ))}

                    <p className={`${MONO} mt-[clamp(26px,4vw,40px)] border-t border-dashed border-[#d8d5e6] pt-4 text-[0.55rem] tracking-[0.08em] text-[#8b86a3]`}>
                      ✦ FIN_DU_DOCUMENT — Version en vigueur : {DATE} — Lil&apos;OG © 2026
                    </p>
                  </div>
                </section>
              </div>

              {/* ============ DISQUETTES « EN BREF » ============ */}
              <div className="lilcgv-noprint mt-[clamp(26px,4.5vw,44px)]">
                <div className={`${MONO} mb-3 flex items-center gap-2 text-[0.58rem] font-bold tracking-[0.08em] text-[#5b2fb8]`}>
                  <span className="h-px flex-1 bg-[#5b2fb8]/20" />
                  💾 RÉSUMÉS_RAPIDES
                  <span className="h-px flex-1 bg-[#5b2fb8]/20" />
                </div>
                <div className="grid grid-cols-1 gap-[clamp(14px,2.4vw,26px)] sm:grid-cols-2 lg:grid-cols-3">
                  <Floppy
                    variant="pink"
                    name="RETOURS_14J.DOC"
                    text="14 jours pour te rétracter. Article non porté, non lavé, retour à tes frais, remboursé sous 14 jours."
                  />
                  <Floppy
                    variant="purple"
                    name="LIVRAISON.SYS"
                    text="Expédition sous 2 à 5 jours ouvrés. Colissimo ou Mondial Relay, suivi envoyé par e-mail."
                  />
                  <Floppy
                    variant="black"
                    name="PAIEMENT.EXE"
                    text="Paiement à la commande, 100% sécurisé par Shopify Payments. Aucune donnée bancaire conservée."
                  />
                </div>
              </div>
            </div>

            {/* ---- Barre de statut ---- */}
            <div className="lilcgv-noprint flex items-center justify-between gap-3 border-t-2 border-[#b8b4cc] bg-[#e7e5f1] px-3 py-1.5">
              <span className={`${MONO} truncate text-[0.5rem] tracking-wider text-[#5a5670]`}>
                ✦ lilog.shop@gmail.com — SIRET 98014870400011
              </span>
              <span className={`${MONO} shrink-0 text-[0.5rem] tracking-wider text-[#5a5670]`}>
                {SECTIONS.length} objet(s) — 1.44 Mo
              </span>
            </div>
          </div>
        </div>
      </main>
    </PageShell>
  );
}
