import "server-only";

import { adminConfigured, findCustomerByEmail, generateActivationUrl } from "./admin";
import { shopifyCustomerActivateByUrl } from "./customers";

/* ============================================================
   Fiches « dormantes » : ne jamais bloquer une création de compte
   ------------------------------------------------------------
   Une fiche client Shopify peut exister SANS compte activé :
   inscrite à la newsletter (pop-up -10 %), ou cliente passée en
   invitée. Le Storefront API refuse alors `customerCreate` sur
   cette adresse et Shopify se contente d'envoyer un e-mail
   « activez votre compte » ; pour une connexion Google, le compte
   miroir ne pouvait tout simplement plus être créé.

   On active donc la fiche existante avec le mot de passe voulu,
   via une URL d'activation générée par l'Admin API et consommée
   aussitôt côté serveur.

   Garde-fou : activer une fiche, c'est donner accès à ce qu'elle
   contient (commandes, adresses). On ne le fait que si
   - l'appelante a PROUVÉ qu'elle contrôle l'adresse (Google, e-mail
     vérifié) : `ownershipProven` ; ou
   - la fiche ne contient rien : aucune commande, aucune adresse —
     le cas d'une simple inscription newsletter.
   Sinon (création par mot de passe d'une adresse qui a un passé de
   commandes) on laisse Shopify faire comme avant : e-mail
   d'activation envoyé à la vraie titulaire.

   Tout échec renvoie `null` et l'appelant reprend son chemin
   habituel : jamais pire qu'avant.
   ============================================================ */

export async function activateDormantCustomer(
  email: string,
  password: string,
  { ownershipProven }: { ownershipProven: boolean },
): Promise<string | null> {
  if (!adminConfigured()) return null;

  try {
    const customer = await findCustomerByEmail(email);
    if (!customer) return null;
    if (customer.state !== "DISABLED" && customer.state !== "INVITED") return null;

    const empty = Number(customer.numberOfOrders) === 0 && !customer.defaultAddress;
    if (!ownershipProven && !empty) return null;

    const url = await generateActivationUrl(customer.id);
    if (!url) return null;

    const { token } = await shopifyCustomerActivateByUrl(url, password);
    return token;
  } catch (err) {
    console.error("[dormant-account] activation impossible :", err instanceof Error ? err.message : err);
    return null;
  }
}
