import type { Metadata } from "next";
import { IBM_Plex_Mono, Montserrat, Space_Mono, Great_Vibes, VT323, Caveat } from "next/font/google";
import localFont from "next/font/local";
import { LanguageProvider } from "@/lib/i18n-context";
import { CartProvider } from "@/lib/cart-context";
import { SessionProvider } from "@/components/session-provider";
import { getCartAction } from "@/lib/actions/cart-actions";
import "./globals.css";

const serif = IBM_Plex_Mono({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const sans = Montserrat({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const script = Great_Vibes({
  variable: "--font-script",
  subsets: ["latin"],
  weight: ["400"],
});

const mono = Space_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
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
   Fichier variable couvrant les graisses 500 à 700, sous-ensemble latin —
   le seul usage est .msn-display-name, un prénom. */
const gothic = localFont({
  src: "./fonts/grenze-gotisch-latin.woff2",
  variable: "--font-gothic",
  weight: "500 700",
  display: "swap",
});

const hand = Caveat({
  variable: "--font-hand",
  subsets: ["latin"],
  weight: ["500", "700"],
});

export const metadata: Metadata = {
  title: "Lil'OG — Pre-loved Y2K",
  description: "Vintage Y2K de seconde main, une pièce à la fois — Paris.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const initialCart = await getCartAction().catch(() => null);

  return (
    <html lang="fr" className={`${serif.variable} ${sans.variable} ${mono.variable} ${script.variable} ${lcd.variable} ${gothic.variable} ${hand.variable}`}>
      <body className="grain">
        <SessionProvider>
          <LanguageProvider>
            <CartProvider initialCart={initialCart}>{children}</CartProvider>
          </LanguageProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
