/* ============================================================
   POST /api/welcome : inscription STAR_CLUB.EXE (-10 %)
   ------------------------------------------------------------
   La visiteuse donne son e-mail, la route l'enregistre puis
   renvoie le code de bienvenue. Le code n'est jamais embarqué
   dans le JavaScript du site : il ne sort que d'ici, après une
   adresse valide.

   Enregistrement, par l'API HTTP de Resend (aucune dépendance) :
     · RESEND_AUDIENCE_ID posée → l'adresse rejoint cette audience
       Resend (liste exportable, envois groupés possibles) ;
     · sinon → un e-mail de notification part dans la boîte de la
       boutique (CONTACT_TO_EMAIL, comme le formulaire de contact).

   Un échec d'enregistrement est journalisé (logs Vercel) mais ne
   prive pas la visiteuse de son code : elle a fait sa part.

   Variables (Vercel → Settings → Environment Variables) :
     · RESEND_API_KEY      : déjà utilisée par /api/contact.
     · RESEND_AUDIENCE_ID  : facultative, l'identifiant de l'audience.
     · WELCOME_CODE        : facultative, défaut STAR10.
   ============================================================ */

export const dynamic = "force-dynamic";

const DEFAULT_CODE = "STAR10";
const DEFAULT_TO = "lilog.shop@gmail.com";
const DEFAULT_FROM = "Lil'OG <onboarding@resend.dev>";

const EMAIL_MAX = 200;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function bad(error: string, status = 400) {
  return Response.json({ ok: false, error }, { status });
}

/* ── Garde-fou de débit ──────────────────────────────────────────────
   Même principe que /api/contact : compteur en mémoire par instance,
   qui absorbe les rafales. Le plafond réel est à poser dans le pare-feu
   Vercel. Sans lui, la route servirait à remplir l'audience d'adresses
   arbitraires ou à brûler le quota d'envoi. */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const MAX_TRACKED_IPS = 5000;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) return true;
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > MAX_TRACKED_IPS) hits.clear();
  return false;
}

function clientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function store(email: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[welcome] RESEND_API_KEY absente : inscription non enregistrée.");
    return;
  }

  const headers = { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" };
  const audience = process.env.RESEND_AUDIENCE_ID;

  try {
    const res = audience
      ? await fetch(`https://api.resend.com/audiences/${encodeURIComponent(audience)}/contacts`, {
          method: "POST",
          headers,
          body: JSON.stringify({ email, unsubscribed: false }),
        })
      : await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers,
          body: JSON.stringify({
            from: process.env.CONTACT_FROM_EMAIL || DEFAULT_FROM,
            to: [process.env.CONTACT_TO_EMAIL || DEFAULT_TO],
            subject: `[Lil'OG] Star Club -10 % · ${email}`,
            text: `Nouvelle inscription Star Club (-10 % première commande) :\n${email}`,
            html: `<p>Nouvelle inscription Star Club (-10&nbsp;% première commande)&nbsp;:<br><strong>${escapeHtml(email)}</strong></p>`,
          }),
        });

    if (!res.ok) {
      console.error("[welcome] Resend a refusé l'enregistrement :", res.status, await res.text());
    }
  } catch (err) {
    console.error("[welcome] Enregistrement impossible :", err);
  }
}

export async function POST(request: Request) {
  if (rateLimited(clientIp(request))) {
    return bad("Trop de tentatives. Réessaie dans quelques minutes.", 429);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return bad("Requête illisible.");
  }
  const body = (payload ?? {}) as Record<string, unknown>;
  const code = process.env.WELCOME_CODE || DEFAULT_CODE;

  /* Pot de miel : réponse normale, rien d'enregistré. */
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return Response.json({ ok: true, code });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email || email.length > EMAIL_MAX || !EMAIL_RE.test(email)) {
    return bad("Email invalide.");
  }

  await store(email);
  return Response.json({ ok: true, code });
}
