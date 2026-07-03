import type { Metadata } from "next";
import { Grenze_Gotisch, Montserrat, Space_Mono } from "next/font/google";
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

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${serif.variable} ${sans.variable} ${mono.variable}`}>
      <body className="grain">{children}</body>
    </html>
  );
}
