import type { SVGProps } from "react";

export const Icon = {
  search: (p: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  ),
  /* Le sac occupait 12 unités de large sur les 24 du cadre, quand le cœur
     voisin dans la nav en remplit 19 : à taille de rendu égale, il
     paraissait deux fois plus petit. Corps élargi et fond arrondi pour
     qu'ils pèsent pareil côte à côte. */
  bag: (p: SVGProps<SVGSVGElement>) => (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
      {...p}
    >
      <path d="M4 7.2h16l-1.1 11.9a1.9 1.9 0 0 1-1.9 1.7H7a1.9 1.9 0 0 1-1.9-1.7Z" />
      <path d="M8.6 7.2V5.5a3.4 3.4 0 0 1 6.8 0v1.7" />
    </svg>
  ),
  user: (p: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  ),
  arrowL: (p: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}>
      <path d="M19 12H5" />
      <path d="m11 6-6 6 6 6" />
    </svg>
  ),
  arrowR: (p: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  ),
  upRight: (p: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}>
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </svg>
  ),
  /* Cœur symétrique : le creux entre les lobes et la pointe sont tous deux
     sur l'axe x=12, et les deux moitiés sont des courbes miroir. L'ancien
     tracé plaçait le creux à x=10 pour une pointe à x=12 : le lobe gauche
     était plus large que le droit, ce qui donnait un cœur de travers. */
  heart: (p: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...p}>
      <path d="M12 20.7 3.9 12.6a5.15 5.15 0 0 1 0-7.3 5.15 5.15 0 0 1 7.3 0l.8.8.8-.8a5.15 5.15 0 0 1 7.3 0 5.15 5.15 0 0 1 0 7.3Z" />
    </svg>
  ),
  heartO: (p: SVGProps<SVGSVGElement>) => (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
      {...p}
    >
      <path d="M12 20.7 3.9 12.6a5.15 5.15 0 0 1 0-7.3 5.15 5.15 0 0 1 7.3 0l.8.8.8-.8a5.15 5.15 0 0 1 7.3 0 5.15 5.15 0 0 1 0 7.3Z" />
    </svg>
  ),
  x: (p: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  ),
  chevD: (p: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.3" {...p}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  ),
  /* Dossier Win95, jaune fixe : indépendant du rendu emoji de la plateforme.
     C'est LE dossier du site : menu latéral, explorateur de l'accueil,
     raccourcis de /contact, arborescences de /faq et des pages légales
     utilisent tous celui-ci, jamais un 📁 ou un dessin maison. */
  folder: (p: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 20 16" width="16" height="14" {...p}>
      <path
        d="M1.5 2.5C1.5 1.94772 1.94772 1.5 2.5 1.5H7.29289C7.5598 1.5 7.81607 1.60357 8.00889 1.78823L9.4 3.1H17.5C18.0523 3.1 18.5 3.54772 18.5 4.1V13.1C18.5 13.6523 18.0523 14.1 17.5 14.1H2.5C1.94772 14.1 1.5 13.6523 1.5 13.1V2.5Z"
        fill="#FFC83D"
        stroke="#B8860B"
        strokeWidth="0.9"
        strokeLinejoin="round"
      />
    </svg>
  ),
  // Sa version ouverte, même trait et même jaune, pour les états dépliés.
  folderOpen: (p: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 20 16" width="16" height="14" {...p}>
      <path
        d="M1.5 2.5C1.5 1.94772 1.94772 1.5 2.5 1.5H7.29289C7.5598 1.5 7.81607 1.60357 8.00889 1.78823L9.4 3.1H17.5C18.0523 3.1 18.5 3.54772 18.5 4.1V7H1.5V2.5Z"
        fill="#FFC83D"
        stroke="#B8860B"
        strokeWidth="0.9"
        strokeLinejoin="round"
      />
      <path
        d="M1.5 6.4H19.05C19.5 6.4 19.83 6.82 19.73 7.26L18.36 13.36C18.26 13.79 17.88 14.1 17.44 14.1H2.5C1.94772 14.1 1.5 13.6523 1.5 13.1V6.4Z"
        fill="#FFDA82"
        stroke="#B8860B"
        strokeWidth="0.9"
        strokeLinejoin="round"
      />
    </svg>
  ),
};
