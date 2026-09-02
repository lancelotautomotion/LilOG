# Confirmation de commande : habillage Lil'OG

`Paramètres → Notifications → Commandes → Confirmation de commande`

Contrairement à l'email de bienvenue, ce gabarit **n'est pas réécrit**. Sa
logique Liquid gère les lots, les remises par ligne, les cartes-cadeaux, les
paniers scindés, les arrondis en espèces, les paiements échelonnés, les
remboursements et les adresses. La réécrire à la main reviendrait à parier
sur des cas qu'on ne verra qu'en production, sur de vraies commandes.

On garde donc le gabarit de Shopify et on l'habille : quatre modifications
chirurgicales, dont une seule fait l'essentiel du travail.

**[confirmation-commande.liquid](confirmation-commande.liquid) contient le
fichier complet, les quatre modifications déjà appliquées** : à sélectionner
en entier et coller directement dans « Modifier le code ». Reconstruit à
partir du gabarit par défaut envoyé par la boutique, puis vérifié
automatiquement (équilibre des balises Liquid `if`/`for`/`unless`/`capture`/
`case`, plus aucun `{{ shop.url }}`, aucun résidu des blocs supprimés). Ce
qui suit n'est utile que pour retrouver chaque modification isolément, par
exemple pour la reporter à la main si Shopify a fait évoluer le gabarit par
défaut entre-temps.

⚠️ Avant de coller, copier le gabarit actuel dans un fichier de côté.

---

## 1. Le bloc de style (fait 80 % du travail)

Coller **juste avant `</head>`**, après le `<style>` existant. L'ordre
compte : ces règles viennent après celles de Shopify, donc elles gagnent.

```html
<style>
  /* Lil'OG : habillage Y2K posé par-dessus la feuille de Shopify. */
  body, .body { background: #ffffff !important; }

  .body, .body td, .body p, .body span, .body a, .body strong, .body small,
  .body del, .body h1, .body h2, .body h3, .body h4 {
    font-family: 'Courier New', Courier, monospace !important;
  }

  .body h2 { font-size: 22px !important; color: #1E2430 !important; }
  .body h3 { font-size: 13px !important; text-transform: uppercase; letter-spacing: 2px; color: #7147d4 !important; }
  .body h4 { font-size: 12px !important; text-transform: uppercase; letter-spacing: 1.5px; color: #7147d4 !important; }
  a, a:hover, a:active, a:visited { color: #7147d4 !important; }

  /* Barre de titre : le dégradé des fenêtres du site. */
  .header__cell {
    background: #7147d4 !important;
    background-image: linear-gradient(90deg, #3b1d8f, #7147d4 45%, #ff3fb0) !important;
    padding: 14px 0 !important;
  }
  .shop-name__text, .shop-name__text a, .order-number__text, .po-number__text {
    color: #ffffff !important;
    font-weight: bold !important;
    letter-spacing: 1px !important;
    text-decoration: none !important;
  }

  /* Boutons : la pastille « DRESSING MACHINE » de la navbar. */
  .button__cell, .actions-buttons .button__cell--primary {
    background: #e7e5f1 !important;
    background-image: linear-gradient(180deg, #f6f5fb, #e7e5f1 48%, #d3d0e1) !important;
    border: 1px solid #c6c2d8 !important;
    border-radius: 999px !important;
  }
  .button__text {
    color: #262626 !important;
    font-size: 13px !important;
    font-weight: bold !important;
    text-transform: uppercase;
    letter-spacing: 1.5px;
  }

  /* Récapitulatif. */
  .section__cell { background: #ffffff !important; border-top: 1px solid #ded7f0 !important; }
  .order-list__item-title { font-weight: bold !important; color: #1E2430 !important; }
  .order-list__item-variant { color: #6B7280 !important; }
  .order-list__product-image { border-radius: 8px; border: 1px solid #ded7f0; }
  .subtotal-line__title span { color: #3d3550 !important; }
  .subtotal-line__value strong { color: #1E2430 !important; }
  .subtotal-table--total .subtotal-line__value strong { color: #7147d4 !important; font-size: 17px !important; }
  .total-discount--amount { color: #d3016d !important; }

  /* Pied : le gris de la barre de statut du site. */
  .footer__cell { background: #e7e5f1 !important; border-top: 2px solid #b8b4cc !important; }
  .disclaimer__subtext { color: #3d3550 !important; font-size: 11px !important; }
</style>
```

## 2. L'en-tête

Remplacer tout le bloc `<table class="header row"> … </table>` (le premier
tableau après `<table class="body">`) par :

```liquid
<table class="header row">
  <tr>
    <td class="header__cell">
      <center>
        <table class="container">
          <tr>
            <td>
              <table class="row" width="100%">
                <tr>
                  <td style="font:bold 13px 'Courier New',Courier,monospace;letter-spacing:1px;color:#ffffff;">LIL_OG_ORDER.EXE</td>
                  <td align="right" style="font:13px 'Courier New',Courier,monospace;color:#ffffff;">Commande {{ order_name }}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </center>
    </td>
  </tr>
</table>
<table class="row" width="100%">
  <tr>
    <td align="center" style="background:#ffffff;padding:30px 12px 0;">
      <img src="https://lilog.shop/logo-black.png" width="140" alt="Lil'OG" style="display:block;margin:0 auto;width:140px;max-width:55%;height:auto;border:0;">
    </td>
  </tr>
</table>
```

## 3. Les boutons d'action

Le gabarit d'origine porte trois variantes du même bloc, dont deux poussent
l'application Shop de Shopify. Sélectionner depuis `{% if order_status_url %}`
jusqu'au `{% endif %}` qui le referme (juste avant `</td>`, environ 90 lignes
plus bas), et remplacer l'ensemble par :

```liquid
{% if order_status_url %}
  <table class="row actions">
    <tr><td class="empty-line">&nbsp;</td></tr>
    <tr>
      <td class="actions__cell">
        <table class="button main-action-cell">
          <tr><td class="button__cell"><a href="https://lilog.shop/account" class="button__text">Voir ma commande</a></td></tr>
        </table>
        <table class="link secondary-action-cell">
          <tr><td class="link__cell">ou <a href="{{ order_status_url }}">suivre l'expédition</a></td></tr>
        </table>
      </td>
    </tr>
  </table>
{% else %}
  <table class="row actions">
    <tr>
      <td class="actions__cell">
        <table class="button main-action-cell">
          <tr><td class="button__cell"><a href="https://lilog.shop" class="button__text">Visiter la boutique</a></td></tr>
        </table>
      </td>
    </tr>
  </table>
{% endif %}
```

Le bouton principal mène au site ; `order_status_url` reste en lien
secondaire, car c'est la seule page qui porte le suivi du transporteur.

## 4. Les liens restants vers la boutique Shopify

Chercher `{{ shop.url }}` dans tout le gabarit et remplacer chaque
occurrence par `https://lilog.shop`. Sans ça, « Visitez notre boutique »
renvoie sur le `.myshopify.com`.

---

## Vérifier

Le bouton **Aperçu** en haut à droite envoie un vrai test avec une commande
fictive. C'est le seul rendu fiable : la mise en page vient de la feuille de
style de Shopify (`/assets/notifications/styles.css`), servie depuis leurs
serveurs, donc impossible à prévisualiser ailleurs.

À regarder en priorité sur le test : les vignettes produit, la colonne des
prix, le total, et le bloc adresses.
