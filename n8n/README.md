# Workflows n8n — Lil'OG

## `workflows/lilog-traitement-images.json`

Traitement automatique des photos produits : Google Drive → détourage via un Space Hugging Face →
superposition du template → WebP → Drive, puis déclenchement du workflow de publication Shopify.
100 % gratuit : aucune API payante, un Space Gradio sur CPU et les nœuds natifs n8n.

### Import

n8n → **Workflows** → **Import from File…** (ou coller le JSON sur le canvas).

### À renseigner après import

| Où | Quoi |
|---|---|
| Nœud `Config` | `PARENT_FOLDER_ID`, `DETOURAGE_SPACE_URL` / `DETOURAGE_FN`, `HUGGINGFACE_API_KEY` (utile seulement pour un Space privé), `MODE_COMPOSITION`, `TEMPLATE_FOND_FILE_ID`, `TEMPLATE_LARGEUR` / `TEMPLATE_HAUTEUR`, `PREFIXE_TRAITE`, `PREFIXE_ALERTE` |
| Nœud `Détecter la typologie` | objet `PROFILS` : taille, ancrage, fond et modèle par catégorie de produit |
| Nœud `Déclencher workflow Shopify` | ID du workflow de publication Shopify |
| Tous les nœuds Google Drive | sélectionner la credential *Google Drive OAuth2* |

L'ID d'un dossier ou d'un fichier Drive se lit dans son URL :
`drive.google.com/drive/folders/<ID>` · `drive.google.com/file/d/<ID>/view`.
Le token Hugging Face se crée dans *Settings → Access Tokens* (droit lecture suffisant) ;
il n'y a pas de credential n8n à créer, il passe par le header `Authorization`.

### Logique

1. Liste les sous-dossiers du dossier parent, garde ceux **sans** préfixe `✓_` / `⚠_` / `*` et
   exclut le dossier du template (par son ID et par le mot « template » dans son nom).
2. Boucle (1 dossier à la fois) : liste les images, désigne la **photo principale**
   (nom contenant `main` / `principale` / `cover` / `1`, sinon la première par ordre alphanumérique).
3. `Détecter la typologie` déduit du nom du dossier s'il s'agit d'un **vêtement, sac, bijou,
   chaussure ou accessoire** (tag explicite possible : `Sac Baguette Rose [sac]`) et charge le profil
   correspondant : taille sur le fond, ancrage, template et modèle de détourage.
4. La principale est envoyée en **binaire brut** à l'inference API Hugging Face
   (`briaai/RMBG-1.4` par défaut). `Normaliser la sortie HF` gère les deux formats de réponse
   possibles : image PNG détourée, ou JSON `[{ label, score, mask }]` — dans ce cas le masque
   base64 est décodé puis posé en couche alpha par un `Edit Image → Composite` (`CopyOpacity`).
5. Le produit détouré est mis à l'échelle selon son profil, mesuré, puis **superposé centré** sur le
   template téléchargé depuis Drive (`Edit Image → Composite`, opérateur `Over`).
6. Toutes les images (principale composée + secondaires brutes) passent par `Edit Image` :
   **1500 px max, WebP qualité 80**, puis sont uploadées dans le même dossier Drive sous un nom
   normalisé (`slug-du-dossier-01.webp`, `-02.webp`, …).
7. Le dossier est **renommé** : `✓_` si le détourage a réussi, `⚠_` s'il est passé en mode dégradé
   (à relire à la main ; retirer le `⚠_` pour relancer le dossier).
8. En fin de boucle (sortie *done*), un `Execute Workflow` appelle le workflow Shopify
   avec le récapitulatif des dossiers prêts.

### Typologies de produits

Deux cas seulement, distingués par `Détecter la typologie` :

- **Porté sur mannequin** (vêtement, bijou, accessoire) : la prise de vue est déjà standardisée,
  le produit occupe **tout le cadre** (`occupation: 1`). Le workflow ne remplace que le fond.
- **Posé à plat** (sac 82 %, chaussure 78 %) : le produit est **réduit et centré** sur le template,
  avec du fond tout autour.

Tags dans le nom du dossier, prioritaires sur les mots-clés : `[sac]`, `[chaussure]`, `[bijou]`… pour
forcer une typologie, `[pose]` pour traiter un produit à plat, `[mannequin]` pour forcer le plein cadre.
`MODE_COMPOSITION = cadre` dans `Config` est un secours : plein cadre pour tout le catalogue.

Les profils (occupation, ancrage, template et modèle HF par catégorie) et les listes de mots-clés se
règlent dans l'objet `PROFILS` en haut du nœud `Détecter la typologie`.

Sur un produit posé, l'échelle porte sur le **cadre de la photo**, pas sur le sujet lui-même
(le détourage conserve les marges transparentes d'origine) : shooter les sacs et chaussures en
cadrage serré et centré. Un recadrage automatique sur le sujet demanderait un *trim* des pixels
transparents, absent du nœud `Edit Image` (possible uniquement en self-hosted).

### Détourage : pourquoi un Space et pas l'inference API

`api-inference.huggingface.co` **n'existe plus** (le domaine ne résout plus). Sur le routeur qui l'a
remplacé, aucun modèle de suppression de fond n'est servi gratuitement : `ZhengPeng7/BiRefNet` et
`briaai/RMBG-1.4` n'ont plus aucun provider, et `briaai/RMBG-2.0` n'est disponible que via fal-ai,
facturé à l'image.

Le workflow appelle donc un **Space Gradio sur CPU** (`hysts-mcp/rembg` par défaut) : gratuit, sans
quota, ~3 à 10 s par image. Recommandé : dupliquer ce Space dans son propre compte HF (CPU basic,
gratuit) et mettre son URL dans `DETOURAGE_SPACE_URL` pour ne pas partager la file d'attente ; le
header `Authorization` est déjà envoyé, un Space privé fonctionne donc aussi.

Pour changer de Space, il suffit de `DETOURAGE_SPACE_URL` + `DETOURAGE_FN` (le nom de l'endpoint
Gradio, visible sur `https://<space>.hf.space/gradio_api/info`), à condition qu'il prenne une image
en entrée et renvoie un fichier.

### Dépendances et limites

- `Edit Image` nécessite ImageMagick (présent sur n8n Cloud et l'image Docker officielle `n8nio/n8n`).
- Un Space gratuit s'endort après 48 h d'inactivité : le premier appel peut prendre une minute.
- Si le détourage échoue, le workflow ne s'arrête pas : les images sont produites à partir de la photo
  d'origine et le dossier est marqué `⚠_` pour relecture.
