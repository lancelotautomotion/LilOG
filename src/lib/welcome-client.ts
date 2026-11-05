/* ============================================================
   Inscription à la team Lil'OG (-10 %), côté navigateur
   ------------------------------------------------------------
   Un seul chemin pour toutes les portes d'entrée (fenêtre
   STAR_CLUB.EXE, champ e-mail du pied de page) : la même route
   /api/welcome, donc la même fiche Shopify, la même étiquette
   `star-club`, et la même protection des comptes à venir
   (@/lib/shopify/dormant-account). Le code obtenu est gardé
   sous une seule clé, lue par toutes les portes.
   ============================================================ */

export const WELCOME_CODE_KEY = "lilog-welcome-code";
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type WelcomeResult = { ok: true; code: string } | { ok: false; reason: "invalid" | "error" };

export function readWelcomeCode(): string | null {
  try {
    return localStorage.getItem(WELCOME_CODE_KEY);
  } catch {
    return null;
  }
}

/** `website` : le pot de miel du formulaire, vide pour une humaine. */
export async function requestWelcomeCode(email: string, website = ""): Promise<WelcomeResult> {
  const value = email.trim();
  if (!EMAIL_RE.test(value)) return { ok: false, reason: "invalid" };

  try {
    const res = await fetch("/api/welcome", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: value, website }),
    });
    const data = (await res.json().catch(() => null)) as { ok?: boolean; code?: string } | null;
    if (!res.ok || !data?.ok || !data.code) {
      return { ok: false, reason: res.status === 400 ? "invalid" : "error" };
    }
    try {
      localStorage.setItem(WELCOME_CODE_KEY, data.code);
    } catch {
      /* Stockage bloqué : le code reste affiché pour cette fois. */
    }
    return { ok: true, code: data.code };
  } catch {
    return { ok: false, reason: "error" };
  }
}
