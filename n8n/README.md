# Workflows n8n — Lil'OG

## `workflows/lilog-traitement-images.json`

Traitement automatique des photos produits : Google Drive → détourage Hugging Face →
superposition du template Y2K → WebP → Drive, puis déclenchement du workflow de publication Shopify.
100 % gratuit : aucune API payante, uniquement l'inference API Hugging Face (tier gratuit)
et les nœuds natifs n8n.

### Import

n8n → **Workflows** → **Import from File…** (ou coller le JSON sur le canvas).

### À renseigner après import

| Où | Quoi |
|---|---|
| Nœud `Config` | `PARENT_FOLDER_ID`, `HUGGINGFACE_API_KEY` (`hf_…`), `HF_MODEL_URL`, `MODE_COMPOSITION`, `TEMPLATE_FOND_FILE_ID`, `TEMPLATE_LARGEUR` / `TEMPLATE_HAUTEUR`, `PREFIXE_TRAITE`, `PREFIXE_ALERTE` |
| Nœud `Détecter la typologie` | objet `PROFILS` : taille, ancrage, fond et modèle par catégorie de produit |
| Nœud `Déclencher workflow Shopify` | ID du workflow de publication Shopify |
| Tous les nœuds Google Drive | sélectionner la credential *Google Drive OAuth2* |

L'ID d'un dossier ou d'un fichier Drive se lit dans son URL :
`drive.google.com/drive/folders/<ID>` · `drive.google.com/file/d/<ID>/view`.
Le token Hugging Face se crée dans *Settings → Access Tokens* (droit lecture suffisant) ;
il n'y a pas de credential n8n à créer, il passe par le header `Authorization`.

### Logique

1. Liste les sous-dossiers du dossier parent, garde ceux **sans** préfixe `✓_` / `*`.
2. Boucle (1 dossier à la fois) : liste les images, désigne la **photo principale**
   (nom contenant `main` / `principale` / `cover` / `1`, sinon la première par ordre alphanumérique).
3. `Détecter la typologie` déduit du nom du dossier s'il s'agit d'un **vêtement, sac, bijou,
   chaussure ou accessoire** (tag explicite possible : `Sac Baguette Rose [sac]`) et charge le profil
   correspondant : taille sur le fond, ancrage, template et modèle de détourage.
4. La principale est envoyée en **binaire brut** à l'inference API Hugging Face
   (`briaai/RMBG-1.4` par défaut). `Normaliser la sortie HF` gère les deux formats de réponse
   possibles : image PNG détourée, ou JSON `[{ label, score, mask }]` — dans ce cas le masque
   base64 est décodé puis posé en couche alpha par un `Edit Image → Composite` (`CopyOpacity`).
5. Le produit détouré est mis à l'échelle selon son profil, mesuré, puis **superposé** sur le
   template Y2K téléchargé depuis Drive (`Edit Image → Composite`, opérateur `Over`) : centré, ou
   posé sur une marge basse pour les chaussures.
6. Toutes les images (principale composée + secondaires brutes) passent par `Edit Image` :
   **1500 px max, WebP qualité 80**, puis sont uploadées dans le même dossier Drive sous un nom
   normalisé (`slug-du-dossier-01.webp`, `-02.webp`, …).
7. Le dossier est **renommé** : `✓_` si le détourage a réussi, `⚠_` s'il est passé en mode dégradé
   (à relire à la main ; retirer le `⚠_` pour relancer le dossier).
8. En fin de boucle (sortie *done*), un `Execute Workflow` appelle le workflow Shopify
   avec le récapitulatif des dossiers prêts.

### Typologies de produits

`MODE_COMPOSITION` (nœud `Config`) pilote le rendu :

- **`cadre`** (défaut) : le produit garde le cadrage de la photo d'origine, seul le fond change.
  Fonctionne pour toutes les typologies sans hypothèse sur la photo.
- **`profil`** : chaque catégorie a sa taille sur le fond (bijou 50 %, accessoire 65 %, sac 75 %,
  chaussure 82 % ancrée en bas, vêtement 90 %). À n'activer que si les photos sont **cadrées serré**
  (le produit remplit le cadre) : le détourage conserve les marges transparentes de la photo d'origine,
  donc l'échelle est calculée sur le cadre, pas sur le sujet.
  Pour une mise à l'échelle exacte quel que soit le cadrage, il faut un *trim* des pixels transparents,
  qui n'existe pas dans le nœud `Edit Image` — possible seulement en self-hosted (`Execute Command`
  avec `convert -trim`, ou un Code node avec `sharp`/`jimp` via `NODE_FUNCTION_ALLOW_EXTERNAL`).

Les profils (taille, ancrage, template et modèle HF par catégorie) et les listes de mots-clés se
règlent dans l'objet `PROFILS` en haut du nœud `Détecter la typologie`.

### Dépendances et limites

- `Edit Image` nécessite ImageMagick (présent sur n8n Cloud et l'image Docker officielle `n8nio/n8n`).
- Tier gratuit Hugging Face : quota mensuel + démarrages à froid (503). Le header
  `x-wait-for-model: true` et 3 tentatives espacées de 15 s absorbent les cold starts.
- Modèle par défaut : `ZhengPeng7/BiRefNet` (MIT, utilisable commercialement). Pour les pièces fines
  (chaînes, bijoux ajourés), un profil peut pointer vers `ZhengPeng7/BiRefNet_HR` via son champ `modele`.
  Éviter `briaai/RMBG-1.4` en production : licence BRIA non commerciale.
- Si le détourage échoue, le workflow ne s'arrête pas : les images sont produites à partir de la photo
  d'origine et le dossier est marqué `⚠_` pour relecture.
- Si `api-inference.huggingface.co` renvoie 404, utiliser la nouvelle route :
  `https://router.huggingface.co/hf-inference/models/<modele>`.
