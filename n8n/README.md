# Workflows n8n — Lil'OG

## `workflows/lilog-traitement-images.json`

Traitement automatique des photos produits : Google Drive → Photoroom → WebP → Drive,
puis déclenchement du workflow de publication Shopify.

### Import

n8n → **Workflows** → **Import from File…** (ou coller le JSON via *Import from URL / Ctrl+V* sur le canvas).

### À renseigner après import

| Où | Quoi |
|---|---|
| Nœud `Config` | `PARENT_FOLDER_ID` (ID du dossier Drive « Lil'OG »), `PHOTOROOM_API_KEY`, `PHOTOROOM_TEMPLATE_ID`, `PREFIXE_TRAITE` (`✓_`) |
| Nœud `Déclencher workflow Shopify` | ID du workflow de publication Shopify |
| Tous les nœuds Google Drive | sélectionner la credential *Google Drive OAuth2* |

L'ID d'un dossier Drive se lit dans son URL : `drive.google.com/drive/folders/<ID>`.

### Logique

1. Liste les sous-dossiers du dossier parent, garde ceux **sans** préfixe `✓_` / `*`.
2. Boucle (1 dossier à la fois) : liste les images, désigne la **photo principale**
   (nom contenant `main` / `principale` / `cover` / `1`, sinon la première par ordre alphanumérique).
3. La principale part chez **Photoroom `/v2/edit`** (détourage + template de fond en un appel),
   les secondaires restent brutes.
4. Toutes les images passent par `Edit Image` : **1500 px max, WebP qualité 80**,
   puis sont uploadées dans le même dossier Drive sous un nom normalisé
   (`slug-du-dossier-01.webp`, `-02.webp`, …).
5. Le dossier est **renommé avec le préfixe `✓_`** → marqueur de validation.
6. En fin de boucle (sortie *done*), un `Execute Workflow` appelle le workflow Shopify
   avec le récapitulatif des dossiers prêts.

### Dépendances

- `Edit Image` nécessite ImageMagick (présent sur n8n Cloud et l'image Docker officielle `n8nio/n8n`).
- Compte Photoroom avec une clé API (`sandbox_…` pour tester sans consommer de crédits).
