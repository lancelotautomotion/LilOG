# Workflows n8n — Lil'OG

Deux workflows enchaînés, reliés par le nom des dossiers Drive :

| Préfixe du dossier | Posé par | Signification |
|---|---|---|
| *(aucun)* | — | photos brutes, à traiter |
| `✓_` | workflow 1 (images) | photos détourées, composées et optimisées |
| `$_` | workflow 2 (Shopify) | produit créé sur Shopify avec ses images |
| `⚠_` | workflow 1 | détourage en échec, à relire à la main |

Le workflow 1 appelle le workflow 2 en fin d'exécution (`Execute Workflow`), et chacun ne traite que
les dossiers portant le préfixe qui le concerne : un dossier ne peut donc pas être traité deux fois.

## Workflow de traitement des images

Traitement automatique des photos produits : Google Drive → détourage via un Space Hugging Face →
superposition du template → WebP → Drive, puis déclenchement du workflow de publication Shopify.
100 % gratuit : aucune API payante, un Space Gradio sur CPU et les nœuds natifs n8n.

> Comme le workflow de publication, son export JSON n'est plus versionné ici : la version
> qui fait foi est celle qui tourne dans n8n.

### Réglages du workflow

| Où | Quoi |
|---|---|
| Nœud `Config` | `PARENT_FOLDER_ID`, `DETOURAGE_SPACE_URL` / `DETOURAGE_FN`, `MODE_COMPOSITION`, `TEMPLATE_FOND_FILE_ID`, `TEMPLATE_LARGEUR` / `TEMPLATE_HAUTEUR`, `PREFIXE_TRAITE`, `PREFIXE_ALERTE` |
| Nœud `Détecter la typologie` | objet `PROFILS` : taille, ancrage, fond et modèle par catégorie de produit |
| Nœud `Déclencher workflow Shopify` | ID du workflow de publication Shopify |
| Tous les nœuds Google Drive | sélectionner la credential *Google Drive OAuth2* |

L'ID d'un dossier ou d'un fichier Drive se lit dans son URL :
`drive.google.com/drive/folders/<ID>` · `drive.google.com/file/d/<ID>/view`.
Le token Hugging Face se crée dans *Settings → Access Tokens* (droit lecture suffisant) ;
il n'y a pas de credential n8n à créer, il passe par le header `Authorization`.

### Logique

1. Liste les sous-dossiers du dossier parent. `Filtrer et compter les dossiers` garde ceux **sans**
   préfixe `✓_` (traité), `$_` (publié), `⚠_` (à relire) ni `*`, exclut le dossier du template, et
   produit toujours **1 seul item** récapitulatif (`dossiers[]` + `count`) — même vide, pour ne jamais
   bloquer la suite : un Filter classique à 0 résultat empêcherait tout ce qui suit de s'exécuter,
   y compris l'appel au workflow Shopify.
2. `Y a-t-il des dossiers à traiter ?` saute toute la boucle et va **directement** déclencher le
   workflow Shopify si `count = 0` — utile pour rattraper des dossiers `✓_` qu'une exécution
   précédente du workflow Shopify n'aurait pas publiés (échec Gemini, quota, etc.).
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
   **1500 px max, WebP qualité 80**, puis sont uploadées dans le même dossier Drive sous les noms
   `1.webp`, `2.webp`, `3.webp`… (la principale est toujours la n°1). Chaque original est ensuite mis
   à la **corbeille Drive** — sauf si `SUPPRIMER_ORIGINAUX` = `false` ou si le dossier est en mode
   dégradé, auquel cas les originaux restent pour permettre une relance.
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

Le workflow appelle donc un **Space Gradio sur CPU** — `KenjieDec/RemBG` — gratuit, sans quota GPU,
sans compte ni authentification. Ce Space laisse **choisir le modèle**, réglé dans `DETOURAGE_PARAMS`
(nœud `Config`), au format `[modèle, x, y]` :

| Valeur | Qualité | Temps/image (CPU) | Licence |
|---|---|---|---|
| `["birefnet-general", null, null]` (défaut) | la meilleure | ~35 s | BiRefNet, **MIT** |
| `["birefnet-general-lite", null, null]` | très bonne | ~20 s | BiRefNet, **MIT** |
| `["u2net", null, null]` | grossière, rate les sujets peu contrastés | ~2 s | U-2-Net, **Apache 2.0** |

u2net (2020) échoue sur les sujets peu contrastés — un mannequin beige sur mur blanc perd son torse.
BiRefNet gère ces frontières faibles, au prix d'un temps de calcul plus long sur CPU.
**Éviter** les modèles `isnet-*` (jeu de données DIS5K aux conditions d'usage académiques) et tout
modèle BRIA / RMBG (accord payant obligatoire pour le commercial).

Dupliquer ce Space dans son propre compte **n'est plus gratuit** : Hugging Face réserve désormais la
création d'un Space CPU Basic aux comptes PRO. On utilise donc le Space public tel quel — file
d'attente partagée, mais aucun quota.

**Licence et usage commercial.** `rembg` est sous MIT ; le modèle choisi par défaut ici,
`birefnet-general`, provient de ZhengPeng7/BiRefNet, sous **MIT** : usage commercial autorisé sans
redevance. Ne jamais laisser le modèle par défaut de rembg sur une instance auto-hébergée récente :
c'est `bria-rmbg` (RMBG-2.0), sous licence BRIA qui exige un accord payant pour le commercial.

Filet de sécurité : 3 tentatives espacées de 15 s à chaque étape, puis mode dégradé (dossier marqué
`⚠_`, photo d'origine conservée, boucle jamais bloquée). Il suffit de retirer le `⚠_` pour relancer
un dossier au run suivant.

Pour changer de Space, il suffit de `DETOURAGE_SPACE_URL` + `DETOURAGE_FN` (le nom de l'endpoint
Gradio, visible sur `https://<space>.hf.space/gradio_api/info`), à condition qu'il prenne une image
en entrée et renvoie un fichier.

### Ménage des originaux : archivage, pas suppression

Google Drive n'autorise **que le propriétaire d'un fichier** à le mettre à la corbeille — un Éditeur ne
le peut pas, même avec accès complet. Or les photos brutes sont souvent uploadées depuis un autre
compte (téléphone) que celui connecté à n8n : une suppression échoue alors silencieusement (l'appel
API renvoie une erreur de permission, absorbée par `onError: continueRegularOutput`).

`ARCHIVER_ORIGINAUX` (`Config`) vaut `true` : les originaux sont donc **déplacés** (changement de
parent Drive, une opération d'édition autorisée à tout compte Éditeur) dans un sous-dossier
**`_originaux`**, créé une fois par produit. `Préparer le ménage` relit la liste établie par
`Classer les images` en début d'itération, `Créer le sous-dossier _originaux` crée le sous-dossier une
seule fois, `Préparer les déplacements` éclate la liste, `Déplacer l'original` change le parent de
chaque fichier. Les `.webp` créés pendant l'itération ne figurent pas dans cette liste.

Rien n'est déplacé si le dossier a échoué (`⚠_`) ni si l'interrupteur est à `false` ; dans ces cas la
branche *faux* rejoint directement le renommage, la boucle n'est jamais bloquée.

`Classer les images` ignore les `.webp` d'un dossier tant qu'il y reste des originaux, pour ne jamais
retraiter une image déjà produite par le workflow.

### Dépendances et limites

- `Edit Image` nécessite ImageMagick (présent sur n8n Cloud et l'image Docker officielle `n8nio/n8n`).
- Un Space gratuit s'endort après 48 h d'inactivité : le premier appel peut prendre une minute.
- Si le détourage échoue, le workflow ne s'arrête pas : les images sont produites à partir de la photo
  d'origine et le dossier est marqué `⚠_` pour relecture.

---

## Workflow de publication Shopify

Génère la fiche produit avec Gemini à partir des photos, crée le produit Shopify en **brouillon**,
y attache les images, puis marque le dossier comme publié.

> L'export JSON de ce workflow n'est plus versionné ici : la version qui fait foi est celle
> qui tourne dans n8n. Le fichier du dépôt avait divergé, et un export figé qui prend du retard
> induit en erreur plus qu'il n'aide. La documentation ci-dessous, elle, reste valable.

### Réglages du workflow

| Où | Quoi |
|---|---|
| `Rechercher dossiers` | ID du dossier Drive « Lil'OG » |
| `Appel Gemini (génération fiche)` | clé API Gemini (paramètre de requête `key`) |
| `Créer produit Shopify` / `Uploader image Shopify` | domaine `*.myshopify.com` et credential Shopify |
| Tous les nœuds Google Drive | credential *Google Drive OAuth2* |

Côté workflow 1, le nœud `Déclencher workflow Shopify` doit recevoir **l'ID de ce workflow**
(visible dans son URL n8n).

### Logique

1. Déclenché automatiquement par le workflow images (`Execute Workflow Trigger`, entrée *passthrough*)
   ou à la main.
2. Liste les sous-dossiers et ne garde que ceux préfixés **`✓_`**.
3. Pour chaque dossier : télécharge les photos, les **trie numériquement** (`1.webp` d'abord — c'est
   l'image principale de la fiche), en fait une version 1200 px pour l'IA et garde l'originale pour
   Shopify.
4. Gemini (`gemini-3.5-flash`) renvoie un JSON structuré : titre, mood, conseils de style, marque,
   état, composition, taille, catégorie, tags.
5. Création du produit Shopify en `status: draft`, puis upload des images dans l'ordre (`position`).
6. Le dossier est renommé **`$_<titre>`** : il sort du périmètre des deux workflows.

En cas d'échec Gemini ou Shopify, le dossier **n'est pas renommé** : il reste en `✓_` et sera retenté
à l'exécution suivante. Aucun produit n'est publié deux fois.
