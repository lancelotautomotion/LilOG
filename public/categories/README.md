# Photos des raccourcis de rayon (CATEGORIES.EXE)

Les trois mini-fenêtres posées juste sous le hero de l'accueil
(`src/components/home/category-windows.tsx`) lisent leurs photos ici, à
noms fixes :

| Fichier      | Fenêtre       | Rayon                        |
| ------------ | ------------- | ---------------------------- |
| `robes.jpg`  | `ROBES.EXE`   | `/category/robes`            |
| `vestes.jpg` | `VESTES.EXE`  | `/category/manteaux-et-vestes` |
| `tops.jpg`   | `TOPS.EXE`    | `/category/tops`             |

**Pour changer une photo : remplace le fichier, garde le nom.** Aucune
modification de code n'est nécessaire.

## Provenance des fichiers actuels

- `robes.jpg` — `DSC08745.JPG` (racine du dépôt), redressée et allégée.
- `tops.jpg` — `public/DSC08486.JPG`, allégée.
- `vestes.jpg` — **image d'attente.** La photo demandée pour ce rayon
  (`WhatsApp Image 2026-08-28 at 14.27.17.jpeg`) n'existe nulle part dans le
  dépôt : elle n'a jamais été versée. En attendant, la fenêtre affiche le
  blazer en tweed de `public/histoire/look-04.jpg`, qui est bien une photo de
  veste. Dépose la vraie photo sous le nom `vestes.jpg` et le module la prend
  telle quelle — pense alors à mettre à jour le texte alternatif dans
  `category-windows.tsx`, qui décrit la photo actuelle.

## Recommandations pour les fichiers

- **Cadrage portrait**, sujet centré : la vignette est rognée en
  `object-cover object-center` dans une fenêtre d'environ 400 × 380 px.
- **Côté le plus long ≤ 2000 px**, JPEG qualité ~82 : au-delà, c'est du poids
  de dépôt sans gain visible, `next/image` réencode de toute façon à la
  taille réellement affichée.
- **Orientation redressée dans le fichier**, pas seulement dans l'EXIF, et
  métadonnées de l'appareil retirées.
