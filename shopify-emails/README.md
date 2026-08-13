# Emails Shopify · gabarits Lil'OG

Les emails transactionnels (confirmation de compte, commande, expédition…)
ne sont **pas** envoyés par ce site : c'est Shopify qui les compose et les
expédie. Rien dans ce dossier n'est déployé sur Vercel : les fichiers vivent
ici pour être versionnés et relus, puis **copiés-collés dans l'admin Shopify**.

## 1. Coller un gabarit

`Admin Shopify → Paramètres → Notifications → Clients → Confirmation du compte client`

Cliquer sur la notification, puis **Modifier le code**. Sélectionner tout le
contenu existant, le supprimer, coller le contenu de
[`confirmation-compte-client.liquid`](confirmation-compte-client.liquid),
enregistrer. Le bouton **Aperçu** envoie un test à l'adresse de la boutique.

Garder une copie de l'ancien gabarit avant de coller : Shopify propose
« Rétablir le modèle par défaut », mais celui-ci revient en anglais générique.

### Ce que le gabarit règle

- **Le bouton renvoie sur lilog.shop**, jamais sur `{{ shop.url }}`. La
  boutique Shopify est sans devanture : son URL est le `.myshopify.com`, qui
  n'a rien à faire dans un email client. Les liens sont donc écrits en dur
  vers le domaine du site : c'est la variable `site` en haut du fichier, à
  changer là et nulle part ailleurs si le domaine bouge un jour.
- **L'identité visuelle** : fenêtre Y2K, barre de titre au dégradé violet →
  fuchsia de la maison, logo, bouton chunky rose, barre de statut.

### Contraintes respectées, à ne pas casser en modifiant

- Tout est en `<table>` avec des styles **en ligne** : Outlook ignore le CSS
  externe, `flex` et `grid`.
- Chaque cellule à dégradé porte d'abord un `bgcolor` uni, seul visible sur
  Outlook, qui ne sait pas dégrader.
- Space Mono n'existe pas dans les clients mail : la pile de polices retombe
  sur les monospaces du système.
- Les images doivent être servies en HTTPS depuis un domaine public, ici
  `https://lilog.shop/logo-black.png`, déjà dans `public/`.

## 2. Changer l'adresse d'expéditeur

Par défaut Shopify envoie depuis `store+<id>@shopifyemail.com`, qui a tout
d'une adresse frauduleuse. Pour envoyer depuis une adresse du domaine :

1. `Paramètres → Notifications → Expéditeur` → saisir l'adresse voulue
   (par exemple `bonjour@lilog.shop`).
2. Shopify affiche alors une liste d'enregistrements DNS à ajouter chez le
   gestionnaire du domaine (CNAME de signature DKIM, et un SPF). Tant qu'ils
   ne sont pas en place, Shopify continue d'expédier depuis son propre
   domaine, ou affiche un « via shopifyemail.com » à côté du nom.
3. Une fois les enregistrements propagés, le statut passe à **Authentifié**
   dans cette même page.

⚠️ Le domaine `lilog.shop` pointe sur Vercel. Ces enregistrements doivent être
ajoutés **là où sont gérés les DNS du domaine** (Vercel, ou le bureau
d'enregistrement si les serveurs de noms n'ont pas été délégués), pas dans
Shopify, qui se contente de les vérifier.

## 3. Les autres notifications

Le même habillage se transpose aux autres emails ; seuls le titre, le texte
et le bouton changent. Les plus utiles à traiter ensuite :

| Notification Shopify | Ce qu'elle doit viser sur le site |
| --- | --- |
| Activation du compte client | `{{ customer.account_activation_url }}` (imposé par Shopify) |
| Confirmation de commande | `https://lilog.shop/account/orders` |
| Confirmation d'expédition | l'URL de suivi, puis `…/account/orders` |
| Panier abandonné | `https://lilog.shop/cart` |
