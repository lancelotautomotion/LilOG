# public/sounds

Dépose ici `key.mp3` : le son de touche du clapet Y2K
(`src/components/contact/Y2KPhone.tsx`).

- **Nom exact attendu** : `key.mp3` — le composant le charge depuis `/sounds/key.mp3`.
- **Format** : MP3 court (30–120 ms), mono, ~44,1 kHz. Un « clic » de clavier
  de téléphone des années 2000 fonctionne parfaitement.
- **Aucune configuration** : le fichier est préchargé au montage, décodé au
  premier clic, puis rejoué via un `AudioBufferSourceNode` par frappe — les
  clics rapides se superposent sans se couper.
- **Tant que le fichier est absent**, le composant synthétise les tonalités
  DTMF réelles de chaque touche. Rien ne casse, le son est simplement
  différent.
