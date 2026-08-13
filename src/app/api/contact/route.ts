/* ============================================================
   POST /api/contact — transmission du formulaire SEND_MESSAGE.SYS
   ------------------------------------------------------------
   Le message part par l'API HTTP de Resend (https://resend.com),
   appelée au fetch : pas de dépendance npm à installer, donc rien
   à lancer dans un terminal côté boutique.

   Variables d'environnement (dashboard Vercel → Settings →
   Environment Variables) :
     · RESEND_API_KEY     — obligatoire, la clé « re_… » du compte.
     · CONTACT_TO_EMAIL   — facultatif, boîte de réception.
                            Défaut : lilog.shop@gmail.com
     · CONTACT_FROM_EMAIL — facultatif, expéditeur. Défaut :
                            onboarding@resend.dev, le domaine de
                            test de Resend, qui n'écrit qu'à
                            l'adresse du titulaire du compte. Dès
                            qu'un domaine est vérifié chez Resend,
                            y poser par exemple
                            "Lil'OG <contact@lil-og.com>".

   Sans RESEND_API_KEY la route répond 500 : le formulaire affiche
   une erreur franche plutôt qu'un faux « message transmis ».
   ============================================================ */

/* L'expéditeur écrit à la boutique : rien à mettre en cache, et la
   route lit des variables d'environnement à chaque appel. */
export const dynamic = "force-dynamic";

const RESEND_ENDPOINT = "https://api.resend.com/emails";

const DEFAULT_TO = "lilog.shop@gmail.com";
const DEFAULT_FROM = "Lil'OG <onboarding@resend.dev>";

/* Les mêmes identifiants que les pastilles de /contact. Le libellé
   lisible sert d'objet du mail : « Commande », « Partenariat »… */
const SUBJECT_LABELS: Record<string, string> = {
  commande: "Commande",
  taille: "Conseil taille",
  partenariat: "Partenariat",
  papotage: "Papotage",
};

const LIMITS = { name: 120, email: 200, message: 5000 } as const;

/* Validation volontairement large : le contrôle sérieux d'une adresse,
   c'est la réponse au mail. On écarte juste ce qui ne peut pas être
   une adresse (pas d'arobase, pas de point, des espaces). */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function bad(error: string, status = 400) {
  return Response.json({ ok: false, error }, { status });
}

/* Le corps du mail part en texte brut : la boîte de réception est un
   Gmail lu à la main, pas un gabarit à mettre en forme. On échappe
   quand même les chevrons dans la version HTML pour qu'un message
   contenant du balisage s'affiche tel quel. */
function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return bad("Requête illisible.");
  }

  const body = (payload ?? {}) as Record<string, unknown>;

  /* Pot de miel : un champ que seuls les robots remplissent, masqué
     dans le formulaire. On répond « ok » sans rien envoyer, pour ne
     pas leur signaler qu'ils sont repérés. */
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return Response.json({ ok: true });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const subject = typeof body.subject === "string" ? body.subject.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!name || name.length > LIMITS.name) return bad("Nom manquant ou trop long.");
  if (!email || email.length > LIMITS.email || !EMAIL_RE.test(email)) return bad("Email invalide.");
  if (!SUBJECT_LABELS[subject]) return bad("Objet du message invalide.");
  if (!message || message.length > LIMITS.message) return bad("Message manquant ou trop long.");

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[contact] RESEND_API_KEY absente : le message n'a pas pu être transmis.");
    return bad("Le service d'envoi n'est pas configuré.", 500);
  }

  const to = process.env.CONTACT_TO_EMAIL || DEFAULT_TO;
  const from = process.env.CONTACT_FROM_EMAIL || DEFAULT_FROM;
  const label = SUBJECT_LABELS[subject];

  const text = [
    `Objet   : ${label}`,
    `Nom     : ${name}`,
    `Email   : ${email}`,
    "",
    message,
  ].join("\n");

  const html = [
    `<p><strong>Objet&nbsp;:</strong> ${escapeHtml(label)}<br>`,
    `<strong>Nom&nbsp;:</strong> ${escapeHtml(name)}<br>`,
    `<strong>Email&nbsp;:</strong> ${escapeHtml(email)}</p>`,
    `<p style="white-space:pre-wrap">${escapeHtml(message)}</p>`,
  ].join("");

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        /* Répondre depuis Gmail écrit directement à la personne, sans
           avoir à recopier son adresse depuis le corps du message. */
        reply_to: email,
        subject: `[Lil'OG] ${label} — ${name}`,
        text,
        html,
      }),
    });

    if (!res.ok) {
      /* Le détail de Resend (domaine non vérifié, quota, clé
         révoquée…) part dans les logs Vercel ; le visiteur, lui, ne
         reçoit qu'un message générique. */
      console.error("[contact] Resend a refusé l'envoi :", res.status, await res.text());
      return bad("Le message n'a pas pu être transmis.", 502);
    }
  } catch (err) {
    console.error("[contact] Envoi impossible :", err);
    return bad("Le message n'a pas pu être transmis.", 502);
  }

  return Response.json({ ok: true });
}
