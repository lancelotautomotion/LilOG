"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  LS_AVATAR_KEY,
  LS_STATUS_KEY,
  MSN_AVATARS,
  MSN_STATUSES,
  useStored,
  writeStored,
} from "@/lib/msn";


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
  const [modalOpen, setModalOpen] = useState(false);
  /* Index de l'avatar affiché dans le carrousel (préparé à l'ouverture) */
  const [slide, setSlide] = useState(0);

  const avatar = useStored(LS_AVATAR_KEY);
  const stored = useStored(LS_STATUS_KEY);
  const statusId = MSN_STATUSES.some(s => s.id === stored)
    ? (stored as string)
    : MSN_STATUSES[0].id;

  const goPrev = useCallback(
    () => setSlide(i => (i - 1 + MSN_AVATARS.length) % MSN_AVATARS.length),
    [],
  );
  const goNext = useCallback(
    () => setSlide(i => (i + 1) % MSN_AVATARS.length),
    [],
  );

  /* Ouvre la modale sur l'avatar courant */
  function openModal() {
    const current = MSN_AVATARS.findIndex(a => a.src === avatar);
    setSlide(current >= 0 ? current : 0);
    setModalOpen(true);
  }

  /* Flèches clavier + Échap, et blocage du scroll de fond */
  useEffect(() => {
    if (!modalOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape")     setModalOpen(false);
      if (e.key === "ArrowLeft")  goPrev();
      if (e.key === "ArrowRight") goNext();
    }
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [modalOpen, goPrev, goNext]);

  function changeStatus(id: string) {
    writeStored(LS_STATUS_KEY, id);
  }

  function saveAvatar() {
    writeStored(LS_AVATAR_KEY, MSN_AVATARS[slide].src);
    setModalOpen(false);
  }

  function clearAvatar() {
    writeStored(LS_AVATAR_KEY, null);
    setModalOpen(false);
  }

  const slideAvatar = MSN_AVATARS[slide];

  return (
    <>
      {/* ── Carte profil ── */}
      <div className="account-panel msn-profile-panel">
        <div className="account-panel-bar">
          <span className="account-panel-title">👤 Mon Profil</span>
        </div>

        <div className="msn-profile-body">

          {/* Avatar + lien de changement */}
          <div className="msn-avatar-wrap">
            <div className="msn-avatar-frame">
              {avatar ? (
                <Image
                  src={avatar}
                  alt="Photo de profil"
                  width={144}
                  height={172}
                  className="msn-avatar-img"
                  unoptimized
                />
              ) : (
                <div className="msn-avatar-placeholder">
                  {firstName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <button className="msn-change-pic-btn" onClick={openModal}>
              [ Changer la photo ]
            </button>
          </div>

          {/* Identité + statut */}
          <div className="msn-identity">
            <h2 className="msn-display-name">{fullName}</h2>

            <div className="msn-status-select-wrap">
              <select
                className="msn-status-select"
                value={statusId}
                onChange={e => changeStatus(e.target.value)}
                aria-label="Statut MSN"
              >
                {MSN_STATUSES.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.emoji}  {s.label}
                  </option>
                ))}
              </select>
              <span className="msn-status-caret" aria-hidden="true">▾</span>
            </div>
          </div>

          {/* Champs d'information */}
          <div className="msn-fields">
            <div className="account-field">
              <span className="account-field-label">Nom complet</span>
              <div className="account-field-value">{fullName}</div>
            </div>
            <div className="account-field">
              <span className="account-field-label">Email</span>
              <div className="account-field-value">{email}</div>
            </div>
          </div>

          {shopifyToken && (
            <a href="/account/edit" className="account-btn primary msn-edit-btn">
              ✏️ Modifier le profil
            </a>
          )}

        </div>
      </div>

      {/* ── Modale carrousel d'avatars ── */}
      {modalOpen && (
        <div className="msn-modal-scrim" onClick={() => setModalOpen(false)}>
          <div
            className="msn-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Choisir un avatar"
            onClick={e => e.stopPropagation()}
          >
            <div className="account-panel-bar msn-modal-bar">
              <span className="account-panel-title">🖼️ Choisir un avatar</span>
              <button
                className="msn-modal-close"
                onClick={() => setModalOpen(false)}
                aria-label="Fermer"
              >
                ×
              </button>
            </div>

            <div className="msn-modal-body">
              <div className="msn-carousel">
                <button
                  className="msn-carousel-arrow"
                  onClick={goPrev}
                  aria-label="Avatar précédent"
                >
                  ◄
                </button>

                <div className="msn-carousel-stage">
                  <Image
                    key={slideAvatar.src}
                    src={slideAvatar.src}
                    alt={slideAvatar.name}
                    width={168}
                    height={168}
                    className="msn-carousel-img"
                    unoptimized
                  />
                </div>

                <button
                  className="msn-carousel-arrow"
                  onClick={goNext}
                  aria-label="Avatar suivant"
                >
                  ►
                </button>
              </div>

              <p className="msn-carousel-name">{slideAvatar.name}</p>

              <div className="msn-carousel-dots">
                {MSN_AVATARS.map((av, i) => (
                  <button
                    key={av.src}
                    className={"msn-carousel-dot" + (i === slide ? " active" : "")}
                    onClick={() => setSlide(i)}
                    aria-label={av.name}
                    aria-current={i === slide}
                  />
                ))}
              </div>

              <button className="msn-carousel-save" onClick={saveAvatar}>
                [ Enregistrer cet avatar ]
              </button>

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
