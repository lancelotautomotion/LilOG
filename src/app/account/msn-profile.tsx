"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const LS_KEY = "lilog_msn_avatar";

const MSN_AVATARS = [
  { name: "Carrie Bradshaw", src: "/MSN/Carrie Bradshaw.png" },
  { name: "Cher Horowitz",   src: "/MSN/Cher Horowitz.png"   },
  { name: "Elle Woods",      src: "/MSN/Elle Woods.png"       },
  { name: "Gabriella Montez",src: "/MSN/Gabriella Montez.png" },
  { name: "Regina George",   src: "/MSN/Regina George.png"    },
  { name: "Sharpay Evans",   src: "/MSN/Sharpay Evans.png"    },
];

const MSN_STATUSES = [
  { emoji: "🟢", label: "En ligne" },
  { emoji: "🛍️", label: "Partie faire du shopping 🛍️" },
  { emoji: "🎧", label: "Occupée — écoute Britney 🎧" },
  { emoji: "📵", label: "Ne pas déranger" },
  { emoji: "💤", label: "Absente" },
  { emoji: "✨", label: "À plus tard ✨" },
];

export function MsnProfile({
  firstName,
  fullName,
  email,
  shopifyToken,
}: {
  firstName: string;
  fullName: string;
  email: string;
  shopifyToken: string | null;
}) {
  const [avatar, setAvatar]             = useState<string | null>(null);
  const [modalOpen, setModalOpen]       = useState(false);
  const [status, setStatus]             = useState(MSN_STATUSES[0]);
  const [customStatus, setCustomStatus] = useState("");
  const [editingStatus, setEditingStatus] = useState(false);

  /* Charge l'avatar depuis localStorage au premier rendu */
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) setAvatar(saved);
    } catch {/* SSR / private browsing */}
  }, []);

  function pickAvatar(src: string) {
    setAvatar(src);
    try { localStorage.setItem(LS_KEY, src); } catch {/* ignore */}
    setModalOpen(false);
  }

  function clearAvatar() {
    setAvatar(null);
    try { localStorage.removeItem(LS_KEY); } catch {/* ignore */}
    setModalOpen(false);
  }

  const displayStatus = customStatus || status.label;

  return (
    <>
      {/* ── MSN Profile card ── */}
      <div className="account-panel msn-profile-panel">
        <div className="account-panel-bar">
          <span className="account-panel-title">👤 Mon Profil</span>
          <span className="msn-panel-bar-icon">💬</span>
        </div>

        <div className="msn-profile-body">

          {/* Avatar + change button */}
          <div className="msn-avatar-wrap">
            <div className="msn-avatar-frame">
              {avatar ? (
                <Image
                  src={avatar}
                  alt="Display pic"
                  width={96}
                  height={96}
                  className="msn-avatar-img"
                  unoptimized
                />
              ) : (
                <div className="msn-avatar-placeholder">
                  {firstName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="msn-avatar-online-dot" />
            </div>
            <button
              className="msn-change-pic-btn"
              onClick={() => setModalOpen(true)}
              title="Changer de display pic"
            >
              [ Changer de display pic ]
            </button>
          </div>

          {/* Name + status */}
          <div className="msn-identity">
            <div className="msn-display-name">{fullName}</div>

            <div className="msn-status-row">
              <span className="msn-status-emoji">{status.emoji}</span>
              {editingStatus ? (
                <input
                  className="msn-status-input"
                  value={customStatus}
                  placeholder="Tape ton statut perso…"
                  autoFocus
                  onChange={e => setCustomStatus(e.target.value)}
                  onBlur={() => setEditingStatus(false)}
                  onKeyDown={e => { if (e.key === "Enter") setEditingStatus(false); }}
                  maxLength={60}
                />
              ) : (
                <button
                  className="msn-status-text"
                  onClick={() => setEditingStatus(true)}
                  title="Cliquer pour modifier"
                >
                  {displayStatus}
                  <span className="msn-status-edit-icon">✏️</span>
                </button>
              )}
            </div>

            <div className="msn-status-presets">
              {MSN_STATUSES.map(s => (
                <button
                  key={s.label}
                  className={"msn-status-preset" + (status.label === s.label && !customStatus ? " active" : "")}
                  onClick={() => { setStatus(s); setCustomStatus(""); setEditingStatus(false); }}
                  title={s.label}
                >
                  {s.emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="msn-divider" />

          {/* Info fields */}
          <div className="msn-fields">
            <div className="account-field">
              <span className="account-field-label">Nom complet</span>
              <div className="account-field-value">{fullName}</div>
            </div>
            <div className="account-field">
              <span className="account-field-label">Email</span>
              <div className="account-field-value">{email}</div>
            </div>
            {!shopifyToken && (
              <div className="account-field">
                <span className="account-field-label">Compte</span>
                <div className="account-field-value" style={{ color: "#555" }}>Google OAuth</div>
              </div>
            )}
          </div>

          {shopifyToken && (
            <a href="/account/edit" className="account-btn primary msn-edit-btn">
              ✏️ Modifier le profil
            </a>
          )}

        </div>
      </div>

      {/* ── Avatar picker modal ── */}
      {modalOpen && (
        <div className="msn-modal-scrim" onClick={() => setModalOpen(false)}>
          <div className="msn-modal" onClick={e => e.stopPropagation()}>
            <div className="msn-modal-bar">
              <span className="msn-modal-title">🖼️ Choisir une display pic</span>
              <div className="msn-modal-chrome">
                <span /><span />
                <button
                  className="msn-modal-close"
                  onClick={() => setModalOpen(false)}
                  aria-label="Fermer"
                >✕</button>
              </div>
            </div>

            <div className="msn-modal-body">
              <p className="msn-modal-hint">Sélectionne ton icône MSN :</p>
              <div className="msn-avatar-grid">
                {MSN_AVATARS.map(av => (
                  <button
                    key={av.name}
                    className={"msn-avatar-option" + (avatar === av.src ? " selected" : "")}
                    onClick={() => pickAvatar(av.src)}
                    title={av.name}
                  >
                    <Image
                      src={av.src}
                      alt={av.name}
                      width={80}
                      height={80}
                      className="msn-avatar-option-img"
                      unoptimized
                    />
                    <span className="msn-avatar-option-name">{av.name}</span>
                  </button>
                ))}
              </div>

              {avatar && (
                <button className="msn-clear-avatar" onClick={clearAvatar}>
                  Retirer la photo
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
