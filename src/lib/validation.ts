/* Règles de validation partagées entre les Server Actions du compte.
 *
 * Module neutre à dessein : un fichier `"use server"` ne peut exporter que
 * des fonctions asynchrones, il ne peut donc pas héberger ces constantes ni
 * ce validateur synchrone.
 *
 * Ces contrôles doublent ceux du formulaire, ils ne les remplacent pas : un
 * `minLength` HTML se contourne depuis la console, et les Server Actions
 * sont des endpoints HTTP publics. Shopify n'exige de son côté que 5
 * caractères — trop peu pour un compte portant un historique de commandes
 * et un carnet d'adresses.
 */

export const MIN_PASSWORD = 8;
const MAX_PASSWORD = 200;
export const MAX_NAME = 100;

/** Volontairement large : le contrôle sérieux d'une adresse, c'est l'email
 *  de confirmation. On écarte juste ce qui ne peut pas être une adresse. */
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** `null` si le mot de passe convient, sinon le message à afficher. */
export function validatePassword(password: unknown): string | null {
  if (typeof password !== "string" || password.length < MIN_PASSWORD) {
    return `Le mot de passe doit faire au moins ${MIN_PASSWORD} caractères.`;
  }
  if (password.length > MAX_PASSWORD) return "Mot de passe trop long.";
  return null;
}
