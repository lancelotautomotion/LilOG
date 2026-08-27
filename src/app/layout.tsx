import type { Metadata } from "next";
import { IBM_Plex_Mono, VT323 } from "next/font/google";
import localFont from "next/font/local";
import Script from "next/script";
import { GoogleAnalytics } from "@next/third-parties/google";
import { LanguageProvider } from "@/lib/i18n-context";
import { CartProvider } from "@/lib/cart-context";
import { SessionProvider } from "@/components/session-provider";
import { CookieConsent } from "@/components/cookie-consent";
import { getCartAction } from "@/lib/actions/cart-actions";
import "./globals.css";

const serif = IBM_Plex_Mono({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const lcd = VT323({
  variable: "--font-lcd",
  subsets: ["latin"],
  weight: ["400"],
});

/* Grenze Gotisch est servie depuis le dépôt, pas depuis Google.
   Le déploiement du 13 août est tombé dessus : le cache de build de Vercel
   avait gardé une feuille de style Google pointant vers un fichier que
   Google avait entre-temps supprimé, et la compilation s'arrêtait sur six
   « Module not found » (404 sur fonts.gstatic.com). Le fichier vit
   désormais dans le dépôt : plus rien à demander à Google au moment du
   build, donc plus de déploiement à la merci de son CDN.
   Fichier variable couvrant les graisses 500 à 700, sous-ensemble latin :
   le seul usage est .msn-display-name, un prénom. */
const gothic = localFont({
  src: "./fonts/grenze-gotisch-latin.woff2",
  variable: "--font-gothic",
  weight: "500 700",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://lilog.shop"),
  title: "Lil'OG · Pre-loved Y2K",
  description: "Vintage Y2K de seconde main, une pièce à la fois · Paris.",
};

const gaId = process.env.NEXT_PUBLIC_GA_ID;

/*
 * Consent Mode v2, posé avant tout le reste.
 *
 * Google exige que `consent default` soit dans le dataLayer AVANT que
 * gtag ne s'initialise ; d'où `beforeInteractive`, qui injecte ce
 * script dans le HTML initial, alors que <GoogleAnalytics> se charge
 * en `afterInteractive`. Inverser les deux ferait démarrer la mesure
 * sans consentement.
 *
 * Tout part refusé, puis le choix déjà enregistré est rejoué dans la
 * foulée : sans cette relecture, une visiteuse ayant accepté repartirait
 * en « denied » à chaque page. Les signaux publicitaires restent refusés
 * en toutes circonstances — le site n'a pas de régie.
 *
 * Les valeurs dupliquées ici (clé, version, péremption) viennent de
 * `@/lib/consent` : ce script s'exécute avant tout module applicatif et
 * ne peut rien importer. Les modifier d'un côté impose de les modifier
 * de l'autre.
 */
const CONSENT_BOOTSTRAP = `
window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments);}
gtag('consent','default',{
  ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',
  analytics_storage:'denied',functionality_storage:'denied',
  personalization_storage:'denied',security_storage:'granted',
  wait_for_update:500
});
try{
  var s=localStorage.getItem('lilog_cookie_consent');
  if(s){
    var c=JSON.parse(s);
    if(c&&c.v===1&&typeof c.ts==='number'&&Date.now()-c.ts<15724800000){
      gtag('consent','update',{
        analytics_storage:c.analytics?'granted':'denied',
        functionality_storage:c.preferences?'granted':'denied',
        personalization_storage:c.preferences?'granted':'denied'
      });
    }
  }
}catch(e){}
`;

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const initialCart = await getCartAction().catch(() => null);

  return (
    <html lang="fr" className={`${serif.variable} ${lcd.variable} ${gothic.variable}`}>
      <body className="grain">
        {gaId && (
          <Script id="consent-default" strategy="beforeInteractive">
            {CONSENT_BOOTSTRAP}
          </Script>
        )}
        <SessionProvider>
          <LanguageProvider>
            <CartProvider initialCart={initialCart}>{children}</CartProvider>
          </LanguageProvider>
        </SessionProvider>
        <CookieConsent />
      </body>
      {gaId && <GoogleAnalytics gaId={gaId} />}
    </html>
  );
}
