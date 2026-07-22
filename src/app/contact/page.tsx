"use client";

import { useState, useTransition } from "react";
import { PageShell } from "@/components/page-shell";

function W95Bar({ title }: { title: string }) {
  return (
    <div className="cat-vibe-w95-bar">
      <span className="cat-vibe-w95-title">{title}</span>
      <div className="w95-dots"><span /><span /><span /></div>
    </div>
  );
}

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
      <main className="category-page">
        <div className="contact-layout">

          {/* Header row: titre + hello gorgeous */}
          <div className="contact-header-row">
            <h1 className="category-title">Contact★</h1>
            <div className="cat-vibe-card contact-header-card">
              <W95Bar title="hello gorgeous ★" />
              <div className="cat-vibe-body">
                <p className="cat-vibe-desc">
                  Une question, une hésitation ou juste envie de papoter mode ?<br />
                  On est là pour toi ! Écris-nous, on te répond vite. ♡
                </p>
                <div className="cat-vibe-tags">
                  {[
                    { label: "about us", href: "/histoire" },
                    { label: "help",     href: "/faq" },
                    { label: "shipping", href: "/livraison" },
                    { label: "returns",  href: "/retours" },
                    { label: "FAQ",      href: "/faq" },
                  ].map(({ label, href }) => (
                    <a key={label} href={href} className="cat-vibe-tag" style={{ textDecoration: "none" }}>{label}</a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Two panels: get in touch + form */}
          <div className="contact-panels">

            {/* Get in touch */}
            <div className="cat-vibe-card">
              <W95Bar title="get in touch" />
              <div className="cat-vibe-body">
                <ul className="contact-info-list">
                  <li className="contact-info-item">
                    <span className="contact-info-icon">✉</span>
                    <div>
                      <div className="contact-info-label">EMAIL</div>
                      <div className="contact-info-val">hellolilG@gmail.com</div>
                    </div>
                  </li>
                  <li className="contact-info-item">
                    <span className="contact-info-icon">☎</span>
                    <div>
                      <div className="contact-info-label">TÉLÉPHONE</div>
                      <div className="contact-info-val">
                        06 12 34 56 78<br />
                        <span className="contact-info-meta">(Lun-Ven : 10h – 18h)</span>
                      </div>
                    </div>
                  </li>
                  <li className="contact-info-item">
                    <span className="contact-info-icon">✦</span>
                    <div>
                      <div className="contact-info-label">CHAT</div>
                      <div className="contact-info-val">
                        Discute avec nous<br />via Instagram DM !
                      </div>
                    </div>
                  </li>
                  <li className="contact-info-item">
                    <span className="contact-info-icon">◆</span>
                    <div>
                      <div className="contact-info-label">ADRESSE</div>
                      <div className="contact-info-val">
                        Lil&apos;G<br />
                        123 Fashion Street<br />
                        75000 Paris, France
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* Send us a message */}
            <div className="cat-vibe-card">
              <W95Bar title="send us a message ★" />
              <div className="cat-vibe-body">
                {sent ? (
                  <div className="contact-thanks">
                    ★ Message envoyé ! On te répond très vite. ♡
                  </div>
                ) : (
                  <form className="contact-form" onSubmit={handleSubmit}>
                    <div className="contact-field">
                      <label className="contact-label" htmlFor="contact-name">NOM / PRÉNOM</label>
                      <input
                        id="contact-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="contact-field">
                      <label className="contact-label" htmlFor="contact-email">EMAIL</label>
                      <input
                        id="contact-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="contact-field">
                      <label className="contact-label" htmlFor="contact-subject">OBJET</label>
                      <select
                        id="contact-subject"
                        className="contact-select"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        required
                      >
                        <option value="" disabled>Sélectionner un sujet</option>
                        <option value="commande">Ma commande</option>
                        <option value="retour">Retour / Échange</option>
                        <option value="info">Information produit</option>
                        <option value="collab">Collaboration</option>
                        <option value="autre">Autre</option>
                      </select>
                    </div>
                    <div className="contact-field">
                      <label className="contact-label" htmlFor="contact-msg">TON MESSAGE</label>
                      <textarea
                        id="contact-msg"
                        className="contact-textarea"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                        rows={5}
                      />
                    </div>
                    <div className="contact-form-footer">
                      <button type="submit" disabled={isPending}>
                        {isPending ? "ENVOI…" : "ENVOYER"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

          </div>

          {/* Quick info */}
          <div className="cat-vibe-card">
            <W95Bar title="quick info" />
            <div className="cat-vibe-body" style={{ padding: 0 }}>
              <div className="contact-quick-grid">
                <div className="contact-quick-item">
                  <span className="contact-quick-icon">🚚</span>
                  <div>
                    <div className="contact-quick-label">LIVRAISON</div>
                    <p className="contact-quick-text">
                      Expédition sous 1 à 3 jours ouvrés.<br />Suivi fourni par email.
                    </p>
                  </div>
                </div>
                <div className="contact-quick-item">
                  <span className="contact-quick-icon">↩</span>
                  <div>
                    <div className="contact-quick-label">RETOURS</div>
                    <p className="contact-quick-text">
                      Tu as 14 jours pour changer d&apos;avis.<br />Article non porté, non lavé.
                    </p>
                  </div>
                </div>
                <div className="contact-quick-item">
                  <span className="contact-quick-icon">♡</span>
                  <div>
                    <div className="contact-quick-label">BESOIN D&apos;AIDE ?</div>
                    <p className="contact-quick-text">
                      Check notre <a href="/faq" className="contact-quick-link">FAQ</a> ou écris-nous,<br />
                      on t&apos;aide avec plaisir !
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </PageShell>
  );
}
