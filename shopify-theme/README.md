# Thème Shopify · le renvoi vers la boutique

Ce dossier n'est **pas déployé sur Vercel**. Comme `shopify-emails/`, il
contient du Liquid versionné ici pour être relu, puis **copié-collé dans
l'admin Shopify**.

## Le problème

Après un paiement, Shopify affiche sa page de remerciement, avec un bouton
bleu **« Retour à la boutique »**. Ce bouton pointe vers le *domaine
principal* déclaré dans Shopify. Ici, ce domaine principal est
`checkout.lilog.shop` — le sous-domaine qui sert le tunnel de paiement — et
non `lilog.shop`, qui vit sur Vercel.

Résultat : la cliente qui vient de payer clique sur « Retour à la boutique »
et tombe sur le thème Shopify par défaut (Horizon), une devanture vide qui
n'est pas la sienne.

Ce lien n'est réglable nulle part :

- il ne se passe pas en paramètre à `checkoutUrl` (API Storefront) ;
- il n'est pas dans l'éditeur de checkout ;
- les extensions d'interface de checkout demandent Shopify Plus ;
- les « scripts additionnels » de la page de statut de commande sont
  supprimés depuis la refonte du checkout ;
- changer le domaine principal pour `lilog.shop` casserait tout : ce nom
  pointe sur Vercel, pas sur Shopify.

La seule prise, c'est la page d'**arrivée**. Elle, elle est rendue par le
thème Shopify : on la fait rebondir sur le site.

## Le correctif

`Admin Shopify → Boutique en ligne → Thèmes → (thème publié) → ⋯ → Modifier
le code → layout/theme.liquid`

Coller le contenu de [`redirection-boutique.liquid`](redirection-boutique.liquid)
**juste après la balise `<head>`**, avant tout le reste, puis enregistrer.

```liquid
<head>
  {%- comment -%} ── Renvoi de la devanture Shopify vers lilog.shop ── {%- endcomment -%}
  ... (contenu du fichier) ...

  <meta charset="utf-8">
  ...
```

Placer le bloc en tête n'est pas cosmétique : le navigateur applique le
`meta refresh` dès qu'il le lit, donc plus il est haut, moins la devanture
Shopify a le temps de s'afficher.

## Vérifier

1. Ouvrir `https://checkout.lilog.shop/` : la page doit repartir aussitôt
   sur `https://lilog.shop`.
2. Ouvrir `https://checkout.lilog.shop/policies/refund-policy` : elle doit
   **rester** sur Shopify (voir plus bas).
3. Passer une commande de test et cliquer sur « Retour à la boutique ».

## Ce qui n'est volontairement pas renvoyé

Le renvoi fonctionne sur liste blanche : une page dont le type n'est pas
listé dans le fichier reste servie par Shopify. Trois familles sont laissées
en place exprès :

- **`/policies/*`** — les liens légaux du pied de page du paiement
  (remboursement, expédition, confidentialité, CGV…). Ils doivent rester
  consultables pendant la commande, et leurs adresses ne se recouvrent pas
  une à une avec `/cgv`, `/retours`, `/confidentialite`… du site. Les
  rebrancher est possible, mais c'est une correspondance à écrire à la main,
  page par page, et une erreur enverrait la cliente sur la mauvaise mention
  légale.
- **`/gift_cards/*`** — la carte cadeau que reçoit la bénéficiaire n'existe
  que sur Shopify ; la renvoyer ailleurs la rendrait inutilisable.
- **comptes clients, mot de passe, vérification anti-robot** — parcours
  internes à Shopify.

Le tunnel de paiement, lui, n'est pas concerné : il ne passe plus par le
thème depuis la refonte du checkout. Le fichier se neutralise également dans
l'éditeur de thème (`request.design_mode`), sinon l'admin ne pourrait plus
ouvrir le thème.

## Si le domaine du site change

Une seule ligne à toucher, en haut du fichier :

```liquid
{%- assign lilog_site = 'https://lilog.shop' -%}
```

(Même règle que dans `shopify-emails/` : le domaine est écrit en dur, à un
seul endroit, jamais `{{ shop.url }}` — qui est précisément l'adresse qu'on
cherche à ne plus montrer.)
