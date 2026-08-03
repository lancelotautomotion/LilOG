import type { Metadata } from "next";
import { IBM_Plex_Mono, Montserrat, Space_Mono, Great_Vibes, VT323, Grenze_Gotisch } from "next/font/google";
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

const gothic = Grenze_Gotisch({
  variable: "--font-gothic",
  subsets: ["latin"],
  weight: ["500", "700"],
});

export const metadata: Metadata = {
  title: "Lil'OG — Pre-loved Y2K",
  description: "Vintage Y2K de seconde main, une pièce à la fois — Londres.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const initialCart = await getCartAction().catch(() => null);

  return (
    <html lang="fr" className={`${serif.variable} ${sans.variable} ${mono.variable} ${script.variable} ${lcd.variable} ${gothic.variable}`}>
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
