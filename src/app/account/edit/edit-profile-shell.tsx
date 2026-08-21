"use client";

/* ============================================================
   Coquille client de /account/edit
   ------------------------------------------------------------
   Même découpage que /account : la page (serveur) récupère les
   données et l'action, cette coquille (client) porte l'état du
   menu et encadre le contenu avec la Nav, le Drawer et le pied
   de page communs au reste du site — absents jusqu'ici de cette
   page, contrairement à /account.
   ============================================================ */

import { useState } from "react";
import { Nav } from "@/components/nav";
import { Drawer } from "@/components/drawer";
import { Footer } from "@/components/footer";
import { EditProfileForm } from "./edit-form";
import type { ShopifyCustomer } from "@/lib/shopify/customers";

type UpdateAction = (formData: FormData) => Promise<{ error: string | null | undefined }>;

export function EditProfileShell({
  customer,
  updateAction,
}: {
  customer: ShopifyCustomer;
  updateAction: UpdateAction;
}) {
  const [menu, setMenu] = useState(false);

  return (
    <>
      <Nav onMenu={() => setMenu(true)} forceSolid />
      <Drawer open={menu} onClose={() => setMenu(false)} />

      <main className="account-desktop account-desktop--leo">
        <div className="account-win95 account-win95--wide">
          {/* Title bar */}
          <div className="account-win95-bar">
            <span className="account-win95-title">♛ Lil&apos;OG · Modifier le profil</span>
            <div className="account-win95-chrome">
              <span>_</span>
              <span>□</span>
              <a href="/account" title="Fermer">×</a>
            </div>
          </div>

          {/* Toolbar */}
          <div className="account-win95-toolbar">
            <a href="/account" className="account-toolbar-btn">← Retour</a>
            <div className="account-toolbar-sep" />
            <a href="/account" className="account-toolbar-btn">📦 Commandes</a>
          </div>

          {/* Content */}
          <div className="account-win95-full-content">
            <EditProfileForm customer={customer} updateAction={updateAction} />
          </div>

          {/* Status bar */}
          <div className="account-win95-statusbar">
            <div className="account-status-cell">Modifications sécurisées</div>
            <div className="account-status-cell grow"></div>
            <div className="account-status-cell">♛ Lil&apos;OG © 2025</div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
