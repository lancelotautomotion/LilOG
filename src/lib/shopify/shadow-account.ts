import { createHmac } from "crypto";
import { shopifyCustomerCreate, shopifyCustomerLogin } from "./customers";

/* ── Compte Shopify miroir pour les connexions Google ──
   Le Storefront API n'a pas de notion de client "sans mot de passe" : pour
   qu'une commande apparaisse dans l'historique, elle doit être associée à
   un vrai client Shopify via un customerAccessToken. Les comptes Google
   n'ont pas de mot de passe Shopify, donc on en dérive un de façon
   déterministe à partir de l'email (HMAC avec AUTH_SECRET, déjà requis par
   NextAuth) : aucun stockage supplémentaire n'est nécessaire, le même
   email reproduit toujours le même mot de passe côté serveur. */

function derivePassword(email: string): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET must be set");
  const hash = createHmac("sha256", secret).update(email.trim().toLowerCase()).digest("hex");
  // Préfixe/suffixe fixes pour satisfaire toute règle de complexité (maj + chiffre + symbole)
  return `Lg${hash.slice(0, 28)}!9`;
}

export async function getOrCreateShopifyTokenForEmail(
  email: string,
  firstName: string,
  lastName: string,
): Promise<string | null> {
  const password = derivePassword(email);

  const { token } = await shopifyCustomerLogin(email, password);
  if (token) return token;

  // Pas encore de compte miroir : on le crée. Si l'email est déjà pris par
  // un vrai compte Shopify (mot de passe différent), la création échoue et
  // on abandonne, impossible de deviner le mot de passe existant.
  const { error } = await shopifyCustomerCreate(email, password, firstName, lastName);
  if (error) return null;

  const retry = await shopifyCustomerLogin(email, password);
  return retry.token;
}
