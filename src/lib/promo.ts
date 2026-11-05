/* ============================================================
   Black Friday Month : fenêtre d'affichage commune
   ------------------------------------------------------------
   Lue par l'encart du hero et par la fenêtre d'accueil, pour
   que les deux s'allument et s'éteignent ensemble.
   Décision prise côté visiteur, au montage : les pages sont
   servies en statique, un test au rendu serveur figerait la
   réponse au moment du build. `?promo=preview` force
   l'affichage pour vérifier avant l'ouverture.
   ============================================================ */

/** 15 nov. 00:00 et 30 nov. 00:00, heure de Paris (UTC+1 en novembre). */
export const PROMO_START = Date.parse("2026-11-15T00:00:00+01:00");
export const PROMO_END = Date.parse("2026-11-30T00:00:00+01:00");

/** À n'appeler que dans le navigateur (effet ou gestionnaire). */
export function isPromoLive(): boolean {
  const now = Date.now();
  const preview = new URLSearchParams(window.location.search).get("promo") === "preview";
  return preview || (now >= PROMO_START && now < PROMO_END);
}
