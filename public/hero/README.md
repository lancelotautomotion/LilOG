# Vidéo de fond du hero (CAMCORDER_OS)

Le hero de l'accueil est prévu pour tourner sur une vidéo plein écran.

Pour l'activer : dépose ici un fichier nommé **`camcorder.mp4`**.
Aucune modification de code n'est nécessaire — le composant
`src/components/home/hero-camcorder.tsx` le charge automatiquement et ne
l'affiche que lorsqu'il est réellement lisible.

Tant que le fichier est absent, le fond reste la bande de photos de la
marque (`public/histoire/`), qui se fond en boucle : il n'y a donc jamais
d'écran noir, ni en production ni en preview.

Recommandations pour le fichier :

- format `.mp4` (H.264), muet — la lecture automatique n'est autorisée par
  les navigateurs que sur une vidéo sans son ;
- cadrage paysage, 1920 × 1080 suffit (l'habillage caméscope se pose
  par-dessus) ;
- 8 à 15 secondes en boucle, quelques Mo au maximum : la vidéo se charge
  au premier écran, c'est elle qui décide de la vitesse perçue du site.
