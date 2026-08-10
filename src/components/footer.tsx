"use client";

/* ============================================================
   LIL_OG_TASKBAR.EXE — pied de page global
   ------------------------------------------------------------
   Le footer du site est une barre des tâches Windows 95/98 :
   bouton START à gauche (logo + UPDATE, il ouvre le menu
   démarrer), champ newsletter encastré, onglets de fenêtres
   « minimisées » au centre, zone de notification à droite
   (réseaux, connexion, horloge). Sous la barre grise, une fine
   ligne de mentions légales sur le fond de page.

   Biseaux Win95 : deux jetons, RAISED (relief) et SUNKEN
   (encastré), appliqués partout pour que boutons, champs et
   zone de notification partagent exactement la même lumière.

   ⚠ PAREFEU : tout le style vit ici, via Tailwind + une feuille
   locale préfixée `liltb-`. Les anciennes classes globales
   `.footer*` de globals.css ne sont plus utilisées — elles
   portaient des `!important` (thème LDL) qui écraseraient le
   gris #c0c0c0 de la barre.
   ============================================================ */

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n-context";
import logoBlack from "../../public/logo-black.png";

/* ---- Biseaux Windows 95 ----------------------------------
   Relief : lumière en haut à gauche, ombre en bas à droite.
   Le liseré interne (`inset`) donne les deux nuances de gris
   (#dfdfdf / #808080) qui font le volume caractéristique. */
const RAISED =
  "border-2 border-t-white border-l-white border-b-[#404040] border-r-[#404040] shadow-[inset_-1px_-1px_0_#808080,inset_1px_1px_0_#dfdfdf]";
/** Encastré : la même chose, à l'envers. */
const SUNKEN =
  "border-2 border-t-[#404040] border-l-[#404040] border-b-white border-r-white shadow-[inset_1px_1px_0_#808080,inset_-1px_-1px_0_#dfdfdf]";
/** Enfoncement au clic : le biseau s'inverse et le contenu glisse d'1 px. */
const PRESS =
  "active:border-t-[#404040] active:border-l-[#404040] active:border-b-white active:border-r-white active:shadow-[inset_1px_1px_0_#808080] active:pt-px active:pl-px";

const MONO = "font-[family-name:var(--mono)]";
const LCD = "font-[family-name:var(--font-lcd)]";

/** Le violet et le rose de la maison, pour les quelques accents. */
const VIOLET = "#3b1d8f";
const PINK = "#d3016d";

/* Réseaux sociaux : Instagram est le compte réel de Louna (déjà utilisé
   sur /histoire). ⚠ TikTok pointe pour l'instant sur l'accueil du site :
   remplace l'URL ci-dessous par le vrai compte quand il existe. */
const SOCIALS = {
  instagram: "https://www.instagram.com/lounaliliguitton/",
  tiktok: "https://www.tiktok.com/",
};

/* Les mentions légales du sous-footer réutilisent les libellés traduits. */
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
/* Les pictogrammes sont dessinés sur une grille de 16 px : pas
   d'antialiasing, sinon l'effet « icône système » disparaît. */
.liltb-pixel{shape-rendering:crispEdges}

/* Diode de connexion réseau. */
@keyframes liltb-blink{0%,100%{opacity:1}50%{opacity:.35}}
.liltb-led{animation:liltb-blink 2.4s ease-in-out infinite}

/* Le menu démarrer surgit depuis le bas, comme sous Win95. */
@keyframes liltb-rise{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
.liltb-menu{animation:liltb-rise 120ms ease-out}

@media (prefers-reduced-motion: reduce){
  .liltb-led,.liltb-menu{animation:none}
}

/* À l'impression, la barre des tâches n'a rien à faire sur le papier. */
@media print{ .liltb{display:none !important} }
`;

/* ============================================================
   Pictogrammes 16 × 16
   ============================================================ */

/** Instagram : carré, objectif et témoin, tracés à l'équerre. */
function InstagramPixel() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" className="liltb-pixel" aria-hidden>
      <rect x="1" y="1" width="14" height="14" fill="none" stroke="#1a1a1a" strokeWidth="2" />
      <rect x="5" y="5" width="6" height="6" fill="none" stroke="#1a1a1a" strokeWidth="2" />
      <rect x="11" y="3" width="2" height="2" fill="#d3016d" />
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
      <TiktokNote dx={1} dy={1} fill="#FE2C55" />
      <TiktokNote dx={0} dy={0} fill="#1a1a1a" />
    </svg>
  );
}

/* ============================================================
   Zone de notification
   ============================================================ */

function TrayIcon({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className="grid h-6 w-6 place-items-center rounded-[2px] transition hover:bg-white/45 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#3b1d8f]"
    >
      {children}
    </a>
  );
}

function Tray() {
  /* L'heure ne peut pas être rendue côté serveur : le HTML livré serait
     figé à l'heure du build et différerait de celui du client (erreur
     d'hydratation). On affiche donc un cadran vide jusqu'au montage. */
  const [clock, setClock] = useState<string | null>(null);

  useEffect(() => {
    const tick = () =>
      setClock(
        new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      );
    tick();
    const id = setInterval(tick, 15_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={`flex shrink-0 items-center gap-1.5 bg-[#c0c0c0] px-2 py-1 ${SUNKEN}`}>
      <TrayIcon href={SOCIALS.instagram} label="Instagram">
        <InstagramPixel />
      </TrayIcon>
      <TrayIcon href={SOCIALS.tiktok} label="TikTok">
        <TiktokPixel />
      </TrayIcon>

      <span
        aria-hidden
        title="Connecté — 56 Kbps"
        className="liltb-led text-[0.8rem] leading-none grayscale-[0.15]"
      >
        💻
      </span>

      <span aria-hidden className="mx-0.5 h-4 w-px bg-[#808080] shadow-[1px_0_0_#dfdfdf]" />

      <time
        suppressHydrationWarning
        className={`${LCD} min-w-[62px] text-center text-[1rem] leading-none tracking-[0.06em] text-[#1a1a1a]`}
      >
        {clock ?? "--:-- --"}
      </time>
    </div>
  );
}

/* ============================================================
   Newsletter — champ encastré + bouton [ OK ]
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
        className={`${MONO} flex items-center gap-1.5 px-1 text-[0.58rem] font-bold tracking-[0.04em] text-[#1a1a1a] ${className}`}
      >
        <span aria-hidden>💾</span> ADRESSE ENREGISTRÉE — À TRÈS VITE ★
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
        className={`${MONO} h-[26px] w-full min-w-0 bg-white px-2 text-[0.58rem] text-[#1a1a1a] outline-none placeholder:text-[#8a8a8a] focus:outline-2 focus:outline-offset-[-2px] focus:outline-[#3b1d8f] md:w-[168px] ${SUNKEN}`}
      />
      <button
        type="submit"
        className={`${MONO} h-[26px] shrink-0 bg-[#c0c0c0] px-2.5 text-[0.58rem] font-bold text-[#1a1a1a] transition hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#3b1d8f] ${RAISED} ${PRESS}`}
      >
        [ OK ]
      </button>
    </form>
  );
}

/* ============================================================
   Barre des tâches
   ============================================================ */

type Tab = { href: string; icon: string; label: string };

export function Footer() {
  const { t } = useLanguage();
  const [menu, setMenu] = useState(false);
  const startRef = useRef<HTMLDivElement | null>(null);

  /* Les onglets reprennent les libellés déjà traduits du site : la barre
     des tâches suit la langue choisie dans le sélecteur de la nav. */
  const TABS: Tab[] = [
    { href: "/#drops", icon: "🛍", label: t.footer.shop },
    { href: "/histoire", icon: "📖", label: t.footer.aboutLinks[0] },
    { href: "/durabilite", icon: "🌿", label: t.footer.aboutLinks[1] },
    { href: "/faq", icon: "❓", label: "FAQ" },
    { href: "/contact", icon: "☎", label: "Contact" },
  ];

  /* Menu démarrer : fermé au clic à l'extérieur et à la touche Échap. */
  useEffect(() => {
    if (!menu) return;
    const onDown = (e: PointerEvent) => {
      if (!startRef.current?.contains(e.target as Node)) setMenu(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menu]);

  return (
    <footer className="liltb relative z-30">
      <style>{TASKBAR_CSS}</style>

      {/* ================= LA BARRE GRISE ================= */}
      {/* Elle reste dans le flux du document (comportement de footer du
          layout) : en `fixed`, elle recouvrirait le bas de chaque page. */}
      <div className="border-t-2 border-b-2 border-t-white border-b-[#404040] bg-[#c0c0c0] shadow-[inset_0_-1px_0_#808080]">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-1.5 px-2 py-2 md:h-[46px] md:flex-nowrap md:gap-2 md:py-0">

          {/* ---------- BOUTON START ---------- */}
          <div ref={startRef} className="relative order-1 shrink-0">
            <button
              type="button"
              onClick={() => setMenu((v) => !v)}
              aria-expanded={menu}
              aria-haspopup="menu"
              className={`flex h-[30px] items-center gap-1.5 bg-[#c0c0c0] px-2 transition hover:brightness-[1.04] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#3b1d8f] ${
                menu ? SUNKEN : `${RAISED} ${PRESS}`
              }`}
            >
              <Image src={logoBlack} alt="" aria-hidden className="h-3.5 w-auto" />
              <span className={`${MONO} text-[0.62rem] font-bold tracking-[0.06em] text-[#1a1a1a]`}>
                UPDATE
              </span>
            </button>

            {/* ---- Menu démarrer ---- */}
            {menu && (
              <div
                role="menu"
                aria-label="Menu Lil'OG"
                className={`liltb-menu absolute bottom-full left-0 z-50 mb-1.5 flex w-[248px] bg-[#c0c0c0] ${RAISED}`}
              >
                {/* Tranche verticale, comme la bannière « Windows 95 ». */}
                <div
                  aria-hidden
                  className="flex w-7 shrink-0 items-end justify-center pb-2.5"
                  style={{ background: `linear-gradient(180deg, #a86fe8 0%, #7147d4 45%, ${VIOLET} 100%)` }}
                >
                  <span
                    className={`${MONO} text-[0.6rem] font-bold tracking-[0.14em] whitespace-nowrap text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.45)]`}
                    style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
                  >
                    LIL&apos;OG <span style={{ color: "#ffd7ea" }}>2000</span>
                  </span>
                </div>

                <div className="min-w-0 flex-1 p-1">
                  {TABS.map(({ href, icon, label }) => (
                    <Link
                      key={href}
                      href={href}
                      role="menuitem"
                      onClick={() => setMenu(false)}
                      className={`${MONO} flex items-center gap-2 px-2 py-2 text-[0.62rem] font-bold tracking-[0.03em] text-[#1a1a1a] no-underline hover:bg-[#3b1d8f] hover:text-white focus-visible:bg-[#3b1d8f] focus-visible:text-white focus-visible:outline-none`}
                    >
                      <span aria-hidden className="text-[0.85rem] leading-none">
                        {icon}
                      </span>
                      <span className="truncate uppercase">{label}</span>
                    </Link>
                  ))}

                  <span aria-hidden className="my-1 block h-px bg-[#808080] shadow-[0_1px_0_#fff]" />

                  {t.footer.legalLinks.map((l) => (
                    <Link
                      key={l}
                      href={LEGAL_HREFS[l] ?? "#"}
                      role="menuitem"
                      onClick={() => setMenu(false)}
                      className={`${MONO} flex items-center gap-2 px-2 py-1.5 text-[0.55rem] tracking-[0.03em] text-[#3a3a3a] no-underline hover:bg-[#3b1d8f] hover:text-white focus-visible:bg-[#3b1d8f] focus-visible:text-white focus-visible:outline-none`}
                    >
                      <span aria-hidden className="text-[0.7rem] leading-none">
                        📄
                      </span>
                      <span className="truncate uppercase">{l}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ---------- ZONE DE NOTIFICATION ---------- */}
          {/* En mobile elle remonte sur la première ligne, à côté du bouton
              START ; en desktop elle reprend sa place tout à droite. */}
          <div className="order-2 ml-auto md:order-4 md:ml-0">
            <Tray />
          </div>

          {/* ---------- NEWSLETTER ---------- */}
          <Newsletter className="order-3 w-full md:order-2 md:w-auto md:shrink-0" />

          <span aria-hidden className="order-2 hidden h-7 w-px bg-[#808080] shadow-[1px_0_0_#dfdfdf] md:block" />

          {/* ---------- ONGLETS DES FENÊTRES MINIMISÉES ---------- */}
          <nav
            aria-label="Navigation du site"
            className="order-4 grid w-full grid-cols-2 gap-1 md:order-3 md:flex md:w-auto md:min-w-0 md:flex-1 md:gap-1.5"
          >
            {TABS.map(({ href, icon, label }) => (
              <Link
                key={href}
                href={href}
                className={`${MONO} flex h-[28px] min-w-0 items-center gap-1.5 bg-[#c0c0c0] px-2 text-[0.55rem] font-bold tracking-[0.03em] text-[#1a1a1a] no-underline transition hover:bg-[#cac9d4] hover:brightness-[1.04] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#3b1d8f] md:max-w-[150px] md:flex-1 ${RAISED} ${PRESS}`}
              >
                <span aria-hidden className="shrink-0 text-[0.75rem] leading-none">
                  {icon}
                </span>
                <span className="truncate uppercase">{label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* ================= SOUS-FOOTER LÉGAL ================= */}
      {/* Fond de page volontairement repeint : /faq, /contact ou /cgv
          posent une photo en `fixed` qui court sous toute la fenêtre, et
          la ligne légale deviendrait illisible par-dessus. */}
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 bg-[#F7F8FC] px-3 py-2.5 text-center">
        <span className={`${LCD} text-[0.86rem] leading-none tracking-[0.08em] text-[#6b6480]`}>
          © 2026 LIL&apos;OG VINTAGE. ALL RIGHTS RESERVED.
        </span>
        <span aria-hidden className={`${LCD} text-[0.86rem] leading-none`} style={{ color: PINK }}>
          ★
        </span>
        <nav aria-label="Mentions légales" className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
          {t.footer.legalLinks.map((l, i) => (
            <span key={l} className="flex items-center gap-2">
              {i > 0 && (
                <span aria-hidden className={`${LCD} text-[0.86rem] leading-none text-[#b3aec6]`}>
                  ·
                </span>
              )}
              <Link
                href={LEGAL_HREFS[l] ?? "#"}
                className={`${LCD} text-[0.86rem] leading-none tracking-[0.08em] text-[#6b6480] underline decoration-dotted underline-offset-2 transition hover:text-[#3b1d8f]`}
              >
                {l.toUpperCase()}
              </Link>
            </span>
          ))}
        </nav>
      </div>
    </footer>
  );
}
