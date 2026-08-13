import { AuthForm } from "@/components/auth-form";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Connexion — Lil'OG" };

/* Étoiles métalliques du papier peint. Positions figées : pas de
   Math.random au rendu, donc pas de mismatch d'hydratation. */
const STARS = [
  { top: "7%",  left: "9%",  size: 30, delay: "0s"   },
  { top: "17%", left: "79%", size: 22, delay: "1.2s" },
  { top: "37%", left: "15%", size: 16, delay: "2.4s" },
  { top: "61%", left: "88%", size: 28, delay: "0.6s" },
  { top: "79%", left: "23%", size: 20, delay: "3s"   },
  { top: "87%", left: "63%", size: 24, delay: "1.8s" },
  { top: "11%", left: "45%", size: 14, delay: "3.6s" },
  { top: "50%", left: "5%",  size: 18, delay: "2.1s" },
  { top: "29%", left: "93%", size: 14, delay: "4.2s" },
  { top: "70%", left: "40%", size: 16, delay: "1.5s" },
];

/* Dégradé lilas Y2K : trois halos pastel posés sur un fond violet clair. */
const WALLPAPER =
  "radial-gradient(circle at 15% 12%, rgba(255,190,235,0.75) 0%, transparent 45%)," +
  "radial-gradient(circle at 85% 18%, rgba(186,205,255,0.70) 0%, transparent 42%)," +
  "radial-gradient(circle at 75% 88%, rgba(226,190,255,0.80) 0%, transparent 46%)," +
  "linear-gradient(155deg, #efe6ff 0%, #e6e9ff 40%, #f9e8fb 75%, #ece4ff 100%)";

/* Papier millimétré : petits carreaux de 16px, gros carreaux de 96px. */
const GRAPH_PAPER =
  "linear-gradient(rgba(123,90,200,0.10) 1px, transparent 1px)," +
  "linear-gradient(90deg, rgba(123,90,200,0.10) 1px, transparent 1px)," +
  "linear-gradient(rgba(123,90,200,0.05) 1px, transparent 1px)," +
  "linear-gradient(90deg, rgba(123,90,200,0.05) 1px, transparent 1px)";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      {/* ── Papier peint du bureau ── */}
      <div aria-hidden className="absolute inset-0" style={{ background: WALLPAPER }} />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ backgroundImage: GRAPH_PAPER, backgroundSize: "96px 96px, 96px 96px, 16px 16px, 16px 16px" }}
      />
      <div aria-hidden className="absolute inset-0">
        {STARS.map((star, i) => (
          <span
            key={i}
            className="login-star absolute select-none text-[#b79cf0]"
            style={{
              top: star.top,
              left: star.left,
              fontSize: `${star.size}px`,
              animationDelay: star.delay,
              textShadow: "0 1px 2px rgba(255,255,255,0.9)",
            }}
          >
            ✦
          </span>
        ))}
      </div>

      {/* ── Contenu ── */}
      <Link
        href="/"
        className="login-mono absolute left-4 top-4 z-10 text-[0.62rem] uppercase tracking-[0.1em] text-[#5b3fa8] opacity-70 transition-opacity hover:opacity-100"
      >
        ← Retour
      </Link>

      <div className="relative z-10 flex w-full justify-center">
        <AuthForm />
      </div>
    </main>
  );
}
