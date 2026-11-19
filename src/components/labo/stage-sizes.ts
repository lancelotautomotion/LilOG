/** Place réelle de la photo du brouillon : pleine largeur sur téléphone et
 *  tablette, ~640 px au bureau. Partagée par la galerie et le préchargement
 *  de page.tsx : les deux doivent dire la même chose, sinon le navigateur
 *  télécharge deux variantes de la même photo. Module sans "use client"
 *  pour que le composant serveur lise la vraie valeur. */
export const LAB_STAGE_SIZES = "(max-width: 1023px) 100vw, 640px";
