"use client";

/* ============================================================
   LIL_OG_TASKBAR.EXE : pied de page global
   ------------------------------------------------------------
   Structure de barre des tâches Windows (bouton START, champ
   newsletter, onglets de fenêtres minimisées, zone de
   notification, horloge), mais rendue dans la direction
   artistique du site, pas dans le gris plat de Windows 95.

   Autrement dit : exactement le vocabulaire de /contact, /faq,
   /cgv et /durabilite : fenêtre arrondie bordée #b8b4cc, barre
   de titre violette avec [ _ ] [ 🗖 ] [ × ], fond papier
   millimétré, jetons « chunky plastic », champs encastrés,
   pastilles Y2K, typo MONO pour les libellés et LCD pour
   l'horloge, rose maison sur les petits accents.

   ⚠ PAREFEU : tout le style vit ici, via Tailwind + une feuille
   locale préfixée `liltb-`. Les anciennes classes globales
   `.footer*` de globals.css ne sont plus utilisées, elles
   portaient des `!important` (thème LDL) qui écraseraient la
   fenêtre.
   ============================================================ */

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n-context";
import { ChromeStar, GemSticker } from "@/components/contact/stickers";
import logoBlack from "../../public/logo-black.png";

/* ---- Jetons « chunky plastic » : identiques à /contact et /faq ---- */
const PLASTIC =
  "shadow-[inset_0_2px_4px_rgba(255,255,255,0.95),inset_0_-2px_5px_rgba(0,0,0,0.25),0_2px_3px_rgba(30,36,48,0.18)]";
const PLASTIC_PRESS =
  "active:shadow-[inset_0_3px_6px_rgba(0,0,0,0.32),inset_0_-1px_0_rgba(255,255,255,0.7)] active:scale-95";

/** Surface plastique claire des boutons, reprise telle quelle du reste du site. */
const PLASTIC_FACE = "bg-[linear-gradient(180deg,#fdfdff_0%,#ebe9f4_48%,#d3d0e1_100%)]";

const MONO = "font-[family-name:var(--mono)]";
const LCD = "font-[family-name:var(--font-lcd)]";

/** Le rose de la maison : tous les petits accents roses passent par lui. */
const PINK = "#d3016d";

const VIOLET_BAR = "linear-gradient(90deg, #3b1d8f 0%, #7147d4 45%, #ff3fb0 100%)";

/* Quadrillage « papier millimétré » pastel du fond de fenêtre. */
const GRID_BG = {
  backgroundColor: "#f0f0f5",
  backgroundImage:
    "linear-gradient(rgba(113,71,212,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(113,71,212,0.08) 1px, transparent 1px)",
  backgroundSize: "22px 22px",
};

/* Réseaux sociaux : Instagram est le compte réel de Louna (déjà utilisé
   sur /histoire). ⚠ TikTok pointe pour l'instant sur l'accueil du site :
   remplace l'URL ci-dessous par le vrai compte quand il existe. */
const SOCIALS = {
  instagram: "https://www.instagram.com/lounaliliguitton/",
  tiktok: "https://www.tiktok.com/",
};

/* Raccourcis « icônes de bureau » de la seconde ligne : ce sont les liens
   pratiques que l'ancien footer portait dans sa colonne « Aide », plus le
   panier et la wishlist, qui n'étaient joignables que depuis la nav. */
const SHORTCUTS = [
  { href: "/livraison", icon: "📦", label: "LIVRAISON.DOC", external: false },
  { href: "/retours", icon: "↩️", label: "RETOURS.SYS", external: false },
  { href: "/dressing-machine", icon: "👗", label: "DRESSING.EXE", external: false },
  { href: "/wishlist", icon: "💖", label: "WISHLIST.LNK", external: false },
  { href: "/cart", icon: "🛒", label: "PANIER.EXE", external: false },
  { href: SOCIALS.instagram, icon: "📸", label: "INSTAGRAM.LNK", external: true },
];

/* Les mentions légales de la barre de statut réutilisent les libellés traduits. */
const LEGAL_HREFS: Record<string, string> = {
  "CGV": "/cgv",
  "Mentions légales": "/mentions-legales",
  "Confidentialité": "/confidentialite",
  "Cookies": "/cookies",
  "Legal notices": "/mentions-legales",
  "Privacy": "/confidentialite",
  "Aviso legal": "/mentions-legales",
  "Privacidad": "/confidentialite",
  "Note legali": "/mentions-legales",
  "Impressum": "/mentions-legales",
  "Datenschutz": "/confidentialite",
  "AGB": "/cgv",
  "Реквизиты": "/mentions-legales",
  "Конфиденциальность": "/confidentialite",
  "Условия": "/cgv",
  "法律声明": "/mentions-legales",
  "隐私": "/confidentialite",
  "条款": "/cgv",
  "法的通知": "/mentions-legales",
  "プライバシー": "/confidentialite",
  "利用規約": "/cgv",
  "법적고지": "/mentions-legales",
  "개인정보": "/confidentialite",
  "이용약관": "/cgv",
};

const TASKBAR_CSS = `
/* Pastilles Y2K : même respiration que sur /faq et les pages légales. */
@keyframes liltb-bob{
  0%,100%{transform:translate3d(0,0,0) rotate(var(--r,0deg)) scale(1)}
  50%{transform:translate3d(0,-8%,0) rotate(calc(var(--r,0deg) + 6deg)) scale(1.06)}
}
.liltb-sticker{animation:liltb-bob 7.4s ease-in-out infinite;
  filter:drop-shadow(0 3px 4px rgba(30,36,48,.28))}
.liltb-s2{animation-duration:8.6s;animation-delay:-3.1s}

/* Les pictogrammes sociaux sont dessinés sur une grille de 16 px :
   pas d'antialiasing, sinon l'effet « icône système » disparaît. */
.liltb-pixel{shape-rendering:crispEdges}

/* Diode de connexion réseau. */
@keyframes liltb-blink{0%,100%{opacity:1}50%{opacity:.4}}
.liltb-led{animation:liltb-blink 2.4s ease-in-out infinite}

/* Le menu démarrer surgit depuis le bas. */
@keyframes liltb-rise{from{opacity:0;transform:translateY(8px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}
.liltb-menu{animation:liltb-rise 140ms cubic-bezier(.2,1.2,.4,1)}

@media (prefers-reduced-motion: reduce){
  .liltb-sticker,.liltb-led,.liltb-menu{animation:none}
}

/* À l'impression, la barre des tâches n'a rien à faire sur le papier. */
@media print{ .liltb{display:none !important} }
`;

/* ============================================================
   Briques d'interface
   ============================================================ */

/** Boutons de contrôle de fenêtre  [ _ ] [ 🗖 ] [ × ] */
function WindowButton({ label, glyph }: { label: string; glyph: string }) {
  return (
    <span
      role="presentation"
      aria-label={label}
      title={label}
      className={`grid h-6 w-7 shrink-0 place-items-center rounded-md border border-[#c6c2d8] ${PLASTIC_FACE} text-[0.875rem] leading-none font-bold text-[#262626] select-none ${PLASTIC}`}
    >
      {glyph}
    </span>
  );
}

/** Instagram : carré, objectif et témoin, tracés à l'équerre. */
function InstagramPixel() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" className="liltb-pixel" aria-hidden>
      <rect x="1" y="1" width="14" height="14" fill="none" stroke="#3b1d8f" strokeWidth="2" />
      <rect x="5" y="5" width="6" height="6" fill="none" stroke="#3b1d8f" strokeWidth="2" />
      <rect x="11" y="3" width="2" height="2" fill={PINK} />
    </svg>
  );
}

/** TikTok : la note, dédoublée en cyan et rose comme le logo. */
function TiktokNote({ dx, dy, fill }: { dx: number; dy: number; fill: string }) {
  return (
    <g transform={`translate(${dx} ${dy})`} fill={fill}>
      <rect x="7" y="2" width="2" height="8" />
      <rect x="9" y="2" width="4" height="2" />
      <rect x="11" y="4" width="2" height="2" />
      <rect x="4" y="9" width="3" height="3" />
    </g>
  );
}

function TiktokPixel() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" className="liltb-pixel" aria-hidden>
      <TiktokNote dx={-1} dy={-1} fill="#25F4EE" />
      <TiktokNote dx={1} dy={1} fill={PINK} />
      <TiktokNote dx={0} dy={0} fill="#3b1d8f" />
    </svg>
  );
}

function TrayIcon({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className="grid h-6 w-6 place-items-center rounded-md transition hover:bg-purple-100 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#7147d4]"
    >
      {children}
    </a>
  );
}

/* ============================================================
   Zone de notification : panneau encastré, comme les champs du site
   ============================================================ */

function Tray() {
  /* L'heure ne peut pas être rendue côté serveur : le HTML livré serait
     figé à l'heure du build et différerait de celui du client (erreur
     d'hydratation). On affiche donc un cadran vide jusqu'au montage. */
  const [clock, setClock] = useState<string | null>(null);

  useEffect(() => {
    /* `undefined` en locale = celle du système : l'horloge affiche
       exactement ce qu'affiche la barre des tâches du visiteur, 18:40 en
       France, 06:40 PM aux États-Unis : dans son propre fuseau. */
    const render = () =>
      setClock(new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }));

    render();

    /* Recalage sur la minute pleine, puis une mise à jour par minute :
       l'affichage change à la seconde près en même temps que l'horloge du
       système, sans faire tourner un rendu chaque seconde. */
    let interval: ReturnType<typeof setInterval> | undefined;
    const timeout = setTimeout(() => {
      render();
      interval = setInterval(render, 60_000);
    }, 60_000 - (Date.now() % 60_000));

    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, []);

  return (
    <div className="flex h-[42px] shrink-0 items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-2.5 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2)]">
      <TrayIcon href={SOCIALS.instagram} label="Instagram">
        <InstagramPixel />
      </TrayIcon>
      <TrayIcon href={SOCIALS.tiktok} label="TikTok">
        <TiktokPixel />
      </TrayIcon>

      <span aria-hidden title="Connecté · 56 Kbps" className="liltb-led text-[1rem] leading-none">
        💻
      </span>

      <span aria-hidden className="mx-0.5 h-5 w-px bg-[#d8d5e6]" />

      <time
        suppressHydrationWarning
        className={`${LCD} min-w-[58px] text-center text-[1.25rem] leading-none tracking-[0.06em] text-[#3b1d8f]`}
      >
        {clock ?? "--:--"}
      </time>
    </div>
  );
}

/* ============================================================
   Newsletter : champ encastré + bouton plastique
   ============================================================ */

function Newsletter({ className = "" }: { className?: string }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  /* Pas de backend newsletter à ce stade : on accuse réception côté
     client, sans prétendre que l'adresse est partie quelque part. */
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  if (sent) {
    return (
      <p
        className={`${MONO} flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-3.5 py-2 text-[0.8125rem] font-bold tracking-[0.04em] text-purple-800 ${className}`}
      >
        <span aria-hidden>💾</span> ADRESSE ENREGISTRÉE · À TRÈS VITE
        <span style={{ color: PINK }}>★</span>
      </p>
    );
  }

  return (
    <form onSubmit={submit} className={`flex items-center gap-1.5 ${className}`}>
      <label htmlFor="liltb-email" className="sr-only">
        Email
      </label>
      <input
        id="liltb-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="ENTER_EMAIL.EXE"
        className={`${MONO} h-[42px] w-full min-w-0 rounded-xl border border-gray-300 bg-white px-3.5 text-[0.8125rem] text-[#1E2430] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2)] outline-none placeholder:text-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-300/50 md:w-[190px]`}
      />
      <button
        type="submit"
        className={`${MONO} h-[42px] shrink-0 rounded-full border border-[#c6c2d8] ${PLASTIC_FACE} px-4 text-[1rem] font-bold tracking-[0.04em] text-[#262626] transition hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7147d4] ${PLASTIC} ${PLASTIC_PRESS}`}
      >
        [ OK ]
      </button>
    </form>
  );
}

/* ============================================================
   Pied de page
   ============================================================ */

type Tab = { href: string; icon: string; label: string };

export function Footer() {
  const { t } = useLanguage();

  /* Les onglets reprennent les libellés déjà traduits du site : la barre
     des tâches suit la langue choisie dans le sélecteur de la nav. */
  const TABS: Tab[] = [
    { href: "/#drops", icon: "🛍", label: t.footer.shop },
    { href: "/histoire", icon: "📖", label: t.footer.aboutLinks[0] },
    { href: "/durabilite", icon: "🌿", label: t.footer.aboutLinks[1] },
    { href: "/faq", icon: "❓", label: "FAQ" },
    { href: "/contact", icon: "☎", label: "Contact" },
  ];

  return (
    <footer className="liltb relative z-30 px-[clamp(10px,1.6vw,22px)] pt-[clamp(26px,4vw,48px)] pb-[clamp(20px,3vw,36px)]">
      <style>{TASKBAR_CSS}</style>

      {/* Le conteneur relatif porte les pastilles : elles débordent de la
          fenêtre. Plus large que les fenêtres de contenu (1180 px) : une
          barre des tâches court d'un bord à l'autre de l'écran. La borne
          haute n'existe que pour les écrans très larges. */}
      <div className="relative mx-auto max-w-[2200px]">

        {/* ---- Pastilles décoratives (mêmes bijoux que /contact) ---- */}
        <span aria-hidden className="pointer-events-none absolute inset-0 z-20">
          <span
            className="liltb-sticker absolute -left-[8px] h-[clamp(28px,4vw,46px)] w-[clamp(28px,4vw,46px)]"
            style={{ ["--r" as string]: "-16deg", top: "calc(-1 * clamp(18px, 2.6vw, 30px))" }}
          >
            <ChromeStar uid="tb-star" />
          </span>
          {/* Posée quasiment hors de la fenêtre : elle embrasse le coin sans
              recouvrir les mentions légales de la barre de statut. */}
          <span
            className="liltb-sticker liltb-s2 absolute -right-[14px] h-[clamp(24px,3.4vw,38px)] w-[clamp(24px,3.4vw,38px)]"
            style={{ ["--r" as string]: "12deg", bottom: "calc(-1 * clamp(19px, 2.9vw, 31px))" }}
          >
            <GemSticker uid="tb-heart" shape="heart" hue={["#FFC0DF", "#EE4B96", "#B3155A"]} />
          </span>
        </span>

        {/* ================= FENÊTRE ================= */}
        {/* Pas d'`overflow-hidden` ici, sinon le menu démarrer, qui s'ouvre
            vers le haut, donc au-dessus de la fenêtre, serait rogné. Les
            angles sont arrondis par la barre de titre et la barre de statut,
            les deux seules bandes qui touchent les coins. */}
        <div
          className="relative z-[1] rounded-xl border-2 border-[#b8b4cc] bg-[#e7e5f1]"
          style={{
            boxShadow:
              "inset 0 2px 3px rgba(255,255,255,0.9), inset 0 -3px 6px rgba(0,0,0,0.18), 0 14px 30px rgba(30,36,48,0.28)",
          }}
        >
          {/* ---- Barre de titre ---- */}
          <div
            className="flex items-center justify-between gap-3 rounded-t-[9px] px-3 py-2"
            style={{ background: VIOLET_BAR }}
          >
            <div className="flex min-w-0 items-center gap-2">
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-[4px] bg-white/85 text-[0.875rem] shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.3)]">
                🖥
              </span>
              <h2
                className={`${MONO} truncate text-[clamp(0.875rem,2.1vw,1rem)] font-bold tracking-[0.05em] text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.45)]`}
              >
                LIL_OG_TASKBAR.EXE
              </h2>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <WindowButton label="Réduire" glyph="_" />
              <WindowButton label="Agrandir" glyph="🗖" />
              <WindowButton label="Fermer" glyph="×" />
            </div>
          </div>

          {/* ---- Corps : papier millimétré + barre des tâches ---- */}
          <div className="p-[clamp(12px,2vw,22px)]" style={GRID_BG}>

            {/* ---------- LIGNE 1 : marque, newsletter, notifications ----------
                Le logo n'est plus enfermé dans un bouton : il a sa propre
                plaque blanche, à la taille d'une enseigne, et renvoie à
                l'accueil. C'est le premier élément de la barre. */}
            <div className="flex flex-wrap items-center gap-2.5 md:flex-nowrap">
              <Link
                href="/"
                aria-label="Lil'OG, accueil"
                className={`order-1 flex shrink-0 items-center gap-3 rounded-xl border border-[#c6c2d8] bg-white px-[clamp(12px,1.8vw,20px)] py-[clamp(8px,1.2vw,13px)] no-underline transition hover:brightness-[1.03] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7147d4] ${PLASTIC} ${PLASTIC_PRESS}`}
              >
                <Image src={logoBlack} alt="Lil'OG" className="h-[clamp(30px,4vw,42px)] w-auto" />
                <span className="hidden lg:block">
                  <span className={`${MONO} block text-[0.8125rem] font-bold tracking-[0.14em] text-[#3b1d8f] uppercase`}>
                    Lil&apos;OG Vintage
                  </span>
                  <span className={`${MONO} mt-0.5 block text-[0.8125rem] tracking-[0.03em] text-[#6b6480]`}>
                    {t.foot.tagline}
                  </span>
                </span>
              </Link>

              {/* En mobile la zone de notification remonte à côté du logo ;
                  en desktop elle reprend sa place tout à droite. */}
              <div className="order-2 ml-auto md:order-4 md:ml-0">
                <Tray />
              </div>

              <Newsletter className="order-3 w-full md:order-2 md:w-auto md:min-w-0 md:flex-1" />

              <span aria-hidden className="order-2 hidden h-7 w-px bg-[#c6c2d8] md:order-3 md:block" />
            </div>

            {/* ---------- LIGNE 2 : navigation principale ----------
                Les vraies destinations du site : ce sont elles qui portent
                les gros jetons, pas les raccourcis pratiques en dessous. */}
            <nav
              aria-label="Navigation du site"
              className="mt-[clamp(12px,1.8vw,18px)] grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5"
            >
              {TABS.map(({ href, icon, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`${MONO} flex h-[clamp(44px,5vw,52px)] min-w-0 items-center justify-center gap-2 rounded-xl border border-[#c6c2d8] ${PLASTIC_FACE} px-3 text-[clamp(0.8125rem,1.2vw,0.875rem)] font-bold tracking-[0.04em] text-[#3a3550] no-underline transition hover:bg-purple-100 hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7147d4] ${PLASTIC} ${PLASTIC_PRESS}`}
                >
                  <span aria-hidden className="shrink-0 text-[1rem] leading-none">
                    {icon}
                  </span>
                  <span className="truncate uppercase">{label}</span>
                </Link>
              ))}
            </nav>

            {/* ---------- LIGNE 3 : raccourcis pratiques ----------
                Volontairement plus petits que la navigation ci-dessus : ce
                sont des liens de service, pas les rayons de la boutique.
                Plus de filet en pointillés ni d'intertitre : la différence
                de taille suffit à les distinguer. */}
            <div className="mt-[clamp(10px,1.6vw,14px)] flex flex-wrap items-center gap-1.5">
              {SHORTCUTS.map(({ href, icon, label, external }) => (
                <Link
                  key={href}
                  href={href}
                  {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className={`${MONO} flex h-[30px] items-center gap-1.5 rounded-lg border border-[#c6c2d8] bg-white/70 px-2.5 text-[0.8125rem] font-bold tracking-[0.03em] text-[#6b6480] no-underline transition hover:bg-purple-100 hover:text-[#3b1d8f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7147d4]`}
                >
                  <span aria-hidden className="shrink-0 text-[0.9375rem] leading-none">
                    {icon}
                  </span>
                  <span className="uppercase">{label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* ---- Barre de statut : copyright + mentions légales ---- */}
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-b-[9px] border-t-2 border-[#b8b4cc] bg-[#e7e5f1] px-3 py-1.5">
            <span className={`${MONO} text-[0.8125rem] tracking-wider text-[#5a5670]`}>
              <span style={{ color: PINK }}>✦</span> © 2026 LIL&apos;OG VINTAGE. ALL RIGHTS RESERVED.
            </span>
            <nav aria-label="Mentions légales" className="flex flex-wrap items-center gap-x-2 gap-y-1">
              {t.footer.legalLinks.map((l, i) => (
                <span key={l} className="flex items-center gap-2">
                  {i > 0 && (
                    <span aria-hidden className="text-[0.8125rem] text-[#b3aec6]">
                      ·
                    </span>
                  )}
                  <Link
                    href={LEGAL_HREFS[l] ?? "#"}
                    className={`${MONO} text-[0.8125rem] tracking-wider text-[#5a5670] transition hover:text-[#3b1d8f]`}
                  >
                    {l.toUpperCase()}
                  </Link>
                </span>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
