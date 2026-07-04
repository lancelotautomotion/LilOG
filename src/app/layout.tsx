import type { Metadata } from "next";
import { Grenze_Gotisch, Montserrat, Space_Mono } from "next/font/google";
import { LanguageProvider } from "@/lib/i18n-context";
import { CartProvider } from "@/lib/cart-context";
import { getCartAction } from "@/lib/actions/cart-actions";
import "./globals.css";

const serif = Grenze_Gotisch({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const sans = Montserrat({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const mono = Space_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Lil'OG — Pre-loved Y2K",
  description: "Vintage Y2K de seconde main, une pièce à la fois — Londres.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const initialCart = await getCartAction().catch(() => null);

  return (
    <html lang="fr" className={`${serif.variable} ${sans.variable} ${mono.variable}`}>
      <body className="grain">
        <LanguageProvider>
          <CartProvider initialCart={initialCart}>{children}</CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
