"use client";

import { useState, useTransition } from "react";
import { PageShell } from "@/components/page-shell";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      await new Promise((r) => setTimeout(r, 600));
      setSent(true);
    });
  };

  return (
    <PageShell>
    <main className="contact-split" style={{ paddingTop: "64px" }}>
      {/* Left — form */}
      <div className="contact-left">
        <a className="auth-back" href="/">← Retour</a>
        <div className="contact-left-inner">
          <span className="mono-label contact-eyebrow">NOUS ÉCRIRE</span>
          <h1 className="contact-heading">
            On adore<br /><em>avoir de vos nouvelles.</em>
          </h1>
          <p className="contact-sub">
            Une question sur votre commande, un problème de taille, une envie de collab ?<br />
            Réponse sous 48h — promis.
          </p>

          {sent ? (
            <div className="contact-thanks">
              <span className="contact-thanks-icon">✦</span>
              <p>Message envoyé. On revient vers vous très vite !</p>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="contact-row">
                <input
                  className="contact-input"
                  type="text"
                  placeholder="Votre prénom"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <input
                  className="contact-input"
                  type="email"
                  placeholder="Votre email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <input
                className="contact-input"
                type="text"
                placeholder="Sujet"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
              <textarea
                className="contact-input contact-textarea"
                placeholder="Votre message…"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={5}
              />
              <button className="auth-submit contact-submit" type="submit" disabled={isPending}>
                {isPending ? "Envoi…" : "Envoyer le message"}
              </button>
            </form>
          )}

          <div className="contact-socials">
            <span className="mono-label">NOUS SUIVRE</span>
            <div className="contact-social-links">
              <a href="https://www.instagram.com/lilog.paris" target="_blank" rel="noopener">Instagram</a>
              <a href="https://www.tiktok.com/@lilог" target="_blank" rel="noopener">TikTok</a>
            </div>
          </div>
        </div>
      </div>

      {/* Right — decorative */}
      <div className="contact-right">
        <div className="contact-right-inner">
          <p className="contact-right-quote">
            &ldquo;On n&rsquo;est pas comme les autres filles.<br />On est <em>Lil&rsquo;OG.</em>&rdquo;
          </p>
        </div>
      </div>
    </main>
    </PageShell>
  );
}
