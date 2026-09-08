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
- `vestes.jpg` — `WhatsApp Image 2026-08-28 at 14.27.17.jpeg` (racine du
  dépôt), reprise telle quelle : 1200 × 1600, 252 Ko, sans métadonnées, elle
  respectait déjà les recommandations ci-dessous — la réencoder n'aurait fait
  que lui coûter de la qualité.

## Recommandations pour les fichiers

- **Cadrage portrait**, sujet centré : la vignette est rognée en
  `object-cover object-center` dans une fenêtre d'environ 400 × 380 px.
- **Côté le plus long ≤ 2000 px**, JPEG qualité ~82 : au-delà, c'est du poids
  de dépôt sans gain visible, `next/image` réencode de toute façon à la
  taille réellement affichée.
- **Orientation redressée dans le fichier**, pas seulement dans l'EXIF, et
  métadonnées de l'appareil retirées.
