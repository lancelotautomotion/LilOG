"use server";

import { headers } from "next/headers";
import { auth } from "@/auth";
import { shopifyCustomerLogin, shopifyUpdateCustomer } from "@/lib/shopify/customers";
import { shadowPasswordFor } from "@/lib/shopify/shadow-account";
import { clientIp, rateLimited } from "@/lib/rate-limit";

/* ── Relier un compte Google à un compte Lil'OG existant ───────────────────
 *
 * Le cas que ça répare : une cliente crée un compte avec un mot de passe,
 * puis revient plus tard en cliquant « Se connecter avec Google » parce que
 * c'est plus rapide. Le compte miroir ne peut pas se connecter — le mot de
 * passe dérivé n'est pas celui qu'elle a choisi — et elle se retrouvait
 * devant un historique de commandes vide, sans explication.
 *
 * Le seul à connaître ce mot de passe, c'est elle. On le lui demande une
 * fois, on vérifie auprès de Shopify que c'est bien le bon, puis on aligne
 * le compte sur le mot de passe dérivé pour que Google fonctionne
 * définitivement ensuite.
 *
 * CONSÉQUENCE ASSUMÉE, et annoncée à l'écran avant validation : son ancien
 * mot de passe cesse de fonctionner. Il n'y a qu'un champ mot de passe chez
 * Shopify et deux méthodes de connexion qui veulent le contrôler — on ne
 * peut pas garder les deux. Elle se connectera désormais avec Google.
 */

/* Vérifier un mot de passe, c'est offrir un oracle : on le plafonne.
   La règle du pare-feu Vercel ne couvre pas ce point d'entrée — une Server
   Action n'a pas de chemin d'URL propre. */
const MAX_ATTEMPTS_PER_ACCOUNT = 5;
const MAX_ATTEMPTS_PER_IP = 15;

export async function actionLinkGoogleAccount(
  password: string,
): Promise<{ error: string | null }> {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return { error: "Session expirée. Reconnecte-toi et réessaie." };

  const h = await headers();
  /* Deux clés : par compte pour qu'aucune IP ne martèle une adresse donnée,
     par IP pour qu'une machine ne balaie pas plusieurs comptes. */
  if (
    rateLimited(`link:acct:${email.toLowerCase()}`, MAX_ATTEMPTS_PER_ACCOUNT) ||
    rateLimited(`link:ip:${clientIp(h)}`, MAX_ATTEMPTS_PER_IP)
  ) {
    return { error: "Trop de tentatives. Réessaie dans quelques minutes." };
  }

  if (typeof password !== "string" || password.length === 0) {
    return { error: "Renseigne ton mot de passe Lil'OG." };
  }

  /* Preuve que le compte lui appartient. Google a déjà prouvé qu'elle
     contrôle l'adresse ; ce mot de passe prouve qu'elle est bien la
     titulaire du compte Lil'OG portant cette adresse. */
  const { token } = await shopifyCustomerLogin(email, password);
  if (!token) {
    return { error: "Mot de passe incorrect. Utilise « mot de passe oublié » si besoin." };
  }

  const { error } = await shopifyUpdateCustomer(token, {
    password: shadowPasswordFor(email),
  });
  if (error) {
    return { error: "La liaison a échoué. Réessaie dans un instant." };
  }

  return { error: null };
}
