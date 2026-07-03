# Lil'OG — Pre-loved Y2K

Boutique e-commerce Y2K vintage. Front-end Next.js (App Router) + TypeScript + Tailwind CSS,
connecté à un back-end **Shopify headless** via l'API Storefront (GraphQL).

- `design-reference/` — prototype HTML/React original (référence design, non exécuté en prod)
- `src/app/` — pages et layout Next.js
- `src/components/` — composants UI (Nav, Hero, ProductCard, Lookbook, Editorial, Footer…)
- `src/lib/shopify/` — client Storefront API, requêtes GraphQL, mapping des produits
- `src/lib/i18n*.ts` — dictionnaire et contexte de langue (9 langues, sélecteur en nav)
- `src/data/` — imagerie éditoriale statique (hero, lookbook) — à remplacer par vos vraies photos de campagne

## Démarrer

```bash
npm install
cp .env.local.example .env.local   # puis renseigner les valeurs Shopify (voir ci-dessous)
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000). Sans les variables Shopify, la page d'accueil
s'affiche quand même (hero, lookbook, histoire, footer) mais la section "Featured Drops" reste vide.

## Configuration Shopify (API Storefront)

Dans l'admin Shopify : **Settings → Apps and sales channels → Develop apps → [créer une app] →
Configuration → Storefront API** → cocher les scopes de lecture produits/collections/panier/checkout
→ **Install app** → onglet **API credentials** → copier le **Storefront API access token**.

Variables à renseigner dans `.env.local` :

| Variable | Description |
|---|---|
| `SHOPIFY_STORE_DOMAIN` | Domaine `.myshopify.com` de la boutique (ex: `lil-og.myshopify.com`) |
| `SHOPIFY_STOREFRONT_ACCESS_TOKEN` | Token d'accès Storefront API généré ci-dessus |
| `SHOPIFY_STOREFRONT_API_VERSION` | Version d'API, ex `2025-01` |

Convention de tags produits utilisée pour l'affichage (`ProductCard`) :
- tag Shopify `new` → badge "NEW"
- tag Shopify `one-of-one` (ou `1-of-1`) → badge "1 OF 1"
- produit non disponible (`availableForSale: false`) → badge "SOLD"

## Prochaines étapes

- Panier réel + checkout via l'API Storefront (`cartCreate`, `cartLinesAdd`, `cart.checkoutUrl`)
- Pages collection / produit individuelles
- Remplacement des photos de campagne placeholder (`src/data/editorial-images.ts`) par les vraies photos
