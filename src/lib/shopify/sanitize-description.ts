import "server-only";
import sanitizeHtml from "sanitize-html";

/* ── Assainissement des descriptions produit ───────────────────────────────
 *
 * Ce HTML n'est pas écrit à la main : le workflow n8n le fait générer par un
 * modèle de langage à partir des photos du vêtement. Une consigne
 * d'injection lisible sur une étiquette peut donc ressortir dans la fiche,
 * puis s'exécuter chez chaque visiteuse via le dangerouslySetInnerHTML de
 * la page produit.
 *
 * POURQUOI UNE BIBLIOTHÈQUE, ET PLUS DES EXPRESSIONS RÉGULIÈRES
 *
 * La version précédente était faite maison. Elle a laissé passer deux
 * charges lors de la revue :
 *
 *     <img/src=x onerror=…>     barre oblique comme séparateur
 *     <img=x onerror=…>         nom de balise suivi de =
 *
 * Les deux sont des balises valides pour un navigateur, et aucune n'était
 * reconnue comme telle par la regex — donc aucune n'était nettoyée. Ce
 * n'est pas un défaut d'attention : reconnaître du HTML avec des
 * expressions régulières est un problème que l'on ne résout pas, parce que
 * la grammaire réelle des navigateurs est bien plus permissive que ce qu'on
 * imagine en écrivant le motif.
 *
 * `sanitize-html` s'appuie sur htmlparser2, un vrai analyseur, et applique
 * la liste blanche sur l'ARBRE obtenu plutôt que sur le texte. Les formes
 * ci-dessus n'ont plus de prise : elles sont analysées comme le navigateur
 * les analyserait, puis les attributs hors liste sont retirés.
 *
 * OÙ CELA S'EXÉCUTE
 *
 * Ici, à la frontière : au moment où la donnée Shopify entre dans
 * l'application, pas au moment du rendu. Conséquences voulues —
 * l'assainissement a lieu une fois par régénération de page plutôt qu'à
 * chaque affichage, la bibliothèque ne part jamais dans le bundle envoyé au
 * navigateur, et aucun composant ne peut recevoir de HTML non nettoyé.
 */

/* Liste blanche pensée pour préserver le rendu : on garde tout ce qui met
   en forme, on ne retire que ce qui exécute. Une liste plus stricte
   casserait la présentation des fiches retouchées à la main dans l'admin
   Shopify — et un assainisseur qui abîme le rendu finit par être désactivé. */
const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p", "br", "strong", "b", "em", "i", "u", "s", "span", "div",
    "ul", "ol", "li", "a", "img", "h2", "h3", "h4", "blockquote",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel", "title", "class"],
    img: ["src", "alt", "title", "class"],
    "*": ["style", "class", "title"],
  },
  /* Schémas d'URL autorisés. `javascript:` et `vbscript:` sont absents, et
     `data:` n'est toléré que pour les images — c'est là que se logent les
     `data:text/html` porteurs de script. */
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesByTag: { img: ["http", "https", "data"] },
  allowProtocolRelative: true,
  /* Propriétés CSS admises dans un `style`. Tout le reste saute — dont
     `background-image`, qui permettrait de charger une ressource externe et
     donc de signaler la lecture d'une fiche à un tiers. */
  allowedStyles: {
    "*": {
      "text-align": [/^left$|^right$|^center$|^justify$/],
      "font-weight": [/^\d{3}$|^normal$|^bold$/],
      "font-style": [/^normal$|^italic$/],
      "text-decoration": [/^none$|^underline$|^line-through$/],
      color: [/^#[0-9a-fA-F]{3,8}$/, /^rgba?\([\d\s,.%]+\)$/],
      "background-color": [/^#[0-9a-fA-F]{3,8}$/, /^rgba?\([\d\s,.%]+\)$/],
    },
  },
  /* Un lien qui s'ouvre dans un nouvel onglet sans `noopener` donne à la
     page ouverte une poignée sur la nôtre via `window.opener`. */
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }, true),
  },
  /* Le contenu de ces balises est retiré avec elles : n'enlever que la
     balise laisserait le script apparaître en texte, puis être réinterprété
     dans certains contextes. */
  nonTextTags: ["script", "style", "textarea", "option", "noscript", "iframe"],
};

/** Le `descriptionHtml` d'un produit, débarrassé de tout ce qui exécute. */
export function sanitizeDescription(html: string | null | undefined): string {
  if (!html) return "";
  return sanitizeHtml(html, OPTIONS);
}
