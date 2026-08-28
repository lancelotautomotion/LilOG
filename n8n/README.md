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
| Nœud `Config` | `PARENT_FOLDER_ID`, `HUGGINGFACE_API_KEY` (`hf_…`), `HF_MODEL_URL`, `TEMPLATE_FOND_FILE_ID`, `TEMPLATE_LARGEUR` / `TEMPLATE_HAUTEUR`, `VETEMENT_MAX`, `PREFIXE_TRAITE` |
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
3. La principale est envoyée en **binaire brut** à l'inference API Hugging Face
   (`briaai/RMBG-1.4` par défaut). `Normaliser la sortie HF` gère les deux formats de réponse
   possibles : image PNG détourée, ou JSON `[{ label, score, mask }]` — dans ce cas le masque
   base64 est décodé puis posé en couche alpha par un `Edit Image → Composite` (`CopyOpacity`).
4. Le vêtement détouré est mis à l'échelle (`VETEMENT_MAX`), mesuré, puis **superposé centré**
   sur le template Y2K téléchargé depuis Drive (`Edit Image → Composite`, opérateur `Over`).
5. Toutes les images (principale composée + secondaires brutes) passent par `Edit Image` :
   **1500 px max, WebP qualité 80**, puis sont uploadées dans le même dossier Drive sous un nom
   normalisé (`slug-du-dossier-01.webp`, `-02.webp`, …).
6. Le dossier est **renommé avec le préfixe `✓_`** → marqueur de validation.
7. En fin de boucle (sortie *done*), un `Execute Workflow` appelle le workflow Shopify
   avec le récapitulatif des dossiers prêts.

### Dépendances et limites

- `Edit Image` nécessite ImageMagick (présent sur n8n Cloud et l'image Docker officielle `n8nio/n8n`).
- Tier gratuit Hugging Face : quota mensuel + démarrages à froid (503). Le header
  `x-wait-for-model: true` et 3 tentatives espacées de 15 s absorbent les cold starts.
- **Licence du modèle** : `briaai/RMBG-1.4` est sous licence BRIA *non commerciale*. Pour un usage
  boutique, prendre une licence BRIA ou pointer `HF_MODEL_URL` sur un modèle permissif, par exemple
  `https://api-inference.huggingface.co/models/ZhengPeng7/BiRefNet` (MIT).
- Si `api-inference.huggingface.co` renvoie 404, utiliser la nouvelle route :
  `https://router.huggingface.co/hf-inference/models/<modele>`.
