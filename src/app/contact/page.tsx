"use client";

import { useState, useTransition } from "react";
import { PageShell } from "@/components/page-shell";
import Image from "next/image";

function Win95Bar({ title }: { title: string }) {
  return (
    <div className="cy2k-titlebar">
      <span className="cy2k-titlebar-text">{title}</span>
      <div className="cy2k-dots">
        <span />
        <span />
        <span className="cy2k-dot-close" />
      </div>
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
      <main className="cy2k-page">

        {/* Top row: title + hello gorgeous window */}
        <div className="cy2k-top-row">
          <h1 className="cy2k-title">
            Contact<span className="cy2k-title-star">★</span>
          </h1>
          <div className="cy2k-win cy2k-hello-win">
            <Win95Bar title="hello gorgeous ★" />
            <div className="cy2k-body">
              <p className="cy2k-hello-text">
                Une question, une hésitation ou juste envie de papoter mode ?<br />
                On est là pour toi ! Écris-nous, on te répond vite. ♡
              </p>
              <div className="cy2k-nav-btns">
                {[
                  { label: "about us", href: "/histoire" },
                  { label: "help",     href: "/faq" },
                  { label: "shipping", href: "/livraison" },
                  { label: "returns",  href: "/retours" },
                  { label: "FAQ",      href: "/faq" },
                ].map(({ label, href }) => (
                  <a key={label} href={href} className="cy2k-nav-btn">{label}</a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Three-column row */}
        <div className="cy2k-main-row">

          {/* Window: get in touch */}
          <div className="cy2k-win">
            <Win95Bar title="get in touch" />
            <div className="cy2k-body">
              <ul className="cy2k-info-list">
                <li className="cy2k-info-item">
                  <span className="cy2k-info-icon cy2k-info-icon--mail" aria-hidden="true">✉</span>
                  <div>
                    <div className="cy2k-info-label">EMAIL</div>
                    <div className="cy2k-info-val">hellolilG@gmail.com</div>
                  </div>
                </li>
                <li className="cy2k-info-item">
                  <span className="cy2k-info-icon cy2k-info-icon--phone" aria-hidden="true">☎</span>
                  <div>
                    <div className="cy2k-info-label">TÉLÉPHONE</div>
                    <div className="cy2k-info-val">
                      06 12 34 56 78<br />
                      <span className="cy2k-info-meta">(Lun-Ven : 10h – 18h)</span>
                    </div>
                  </div>
                </li>
                <li className="cy2k-info-item">
                  <span className="cy2k-info-icon cy2k-info-icon--chat" aria-hidden="true">✦</span>
                  <div>
                    <div className="cy2k-info-label">CHAT</div>
                    <div className="cy2k-info-val">
                      Discute avec nous<br />via Instagram DM !
                    </div>
                  </div>
                </li>
                <li className="cy2k-info-item">
                  <span className="cy2k-info-icon cy2k-info-icon--pin" aria-hidden="true">◆</span>
                  <div>
                    <div className="cy2k-info-label">ADRESSE</div>
                    <div className="cy2k-info-val">
                      Lil&apos;G<br />
                      123 Fashion Street<br />
                      75000 Paris, France
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Window: send us a message */}
          <div className="cy2k-win">
            <Win95Bar title="send us a message ★" />
            <div className="cy2k-body">
              {sent ? (
                <div className="cy2k-thanks">
                  <span className="cy2k-thanks-icon">★</span>
                  <p>Message envoyé ! On te répond très vite. ♡</p>
                </div>
              ) : (
                <form className="cy2k-form" onSubmit={handleSubmit}>
                  <div className="cy2k-field">
                    <label className="cy2k-label" htmlFor="cy2k-name">NOM / PRÉNOM</label>
                    <input
                      id="cy2k-name"
                      className="cy2k-input"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="cy2k-field">
                    <label className="cy2k-label" htmlFor="cy2k-email">EMAIL</label>
                    <input
                      id="cy2k-email"
                      className="cy2k-input"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="cy2k-field">
                    <label className="cy2k-label" htmlFor="cy2k-subject">OBJET</label>
                    <select
                      id="cy2k-subject"
                      className="cy2k-input cy2k-select"
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
                  <div className="cy2k-field">
                    <label className="cy2k-label" htmlFor="cy2k-msg">TON MESSAGE</label>
                    <textarea
                      id="cy2k-msg"
                      className="cy2k-input cy2k-textarea"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      rows={5}
                    />
                  </div>
                  <div className="cy2k-form-footer">
                    <button className="cy2k-submit" type="submit" disabled={isPending}>
                      {isPending ? "ENVOI…" : "ENVOYER"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Window: xoxo — decorative photo */}
          <div className="cy2k-win cy2k-xoxo-win">
            <Win95Bar title="xoxo" />
            <div className="cy2k-xoxo-img-wrap">
              <Image
                src="/louna.jpeg"
                alt="Y2K vibes"
                fill
                style={{ objectFit: "cover" }}
              />
            </div>
          </div>

        </div>

        {/* Window: quick info — full width */}
        <div className="cy2k-win">
          <Win95Bar title="quick info" />
          <div className="cy2k-body cy2k-quick-body">
            <div className="cy2k-quick-item">
              <span className="cy2k-quick-icon" aria-hidden="true">🚚</span>
              <div>
                <div className="cy2k-quick-label">LIVRAISON</div>
                <p>Expédition sous 1 à 3 jours ouvrés.<br />Suivi fourni par email.</p>
              </div>
            </div>
            <div className="cy2k-quick-item">
              <span className="cy2k-quick-icon cy2k-quick-icon--lg" aria-hidden="true">↩</span>
              <div>
                <div className="cy2k-quick-label">RETOURS</div>
                <p>Tu as 14 jours pour changer d&apos;avis.<br />Article non porté, non lavé.</p>
              </div>
            </div>
            <div className="cy2k-quick-item">
              <span className="cy2k-quick-icon cy2k-quick-icon--lg" aria-hidden="true">♡</span>
              <div>
                <div className="cy2k-quick-label">BESOIN D&apos;AIDE ?</div>
                <p>
                  Check notre <a href="/faq" className="cy2k-quick-link">FAQ</a> ou écris-nous,<br />
                  on t&apos;aide avec plaisir !
                </p>
              </div>
            </div>
          </div>
        </div>

      </main>
    </PageShell>
  );
}
