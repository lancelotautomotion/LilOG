<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Workflow & déploiement

- **Pas de terminal local.** L'utilisateur travaille exclusivement via Claude Code (web) → GitHub → Vercel.
- Ne jamais demander à l'utilisateur de lancer une commande dans un terminal local.
- Ne jamais créer de fichier `.env.local` : les variables d'environnement sont gérées dans le dashboard Vercel.
- Pour toute variable d'environnement nouvelle : indiquer le nom et la valeur à ajouter dans Vercel (Settings → Environment Variables), pas dans un fichier.
- Le déploiement est automatique : un push sur la branche principale déclenche Vercel.
- Les branches de feature déclenchent des preview deployments Vercel.

# Fin de tâche : toujours merger et pousser sur `main`

Ces deux consignes s'appliquent par défaut à **toute** tâche sur ce projet,
sans qu'il soit nécessaire de les redemander. Elles existent pour éviter que
le travail s'accumule sur des branches divergentes et finisse en conflit.

1. **Merger.** Une fois le travail terminé et vérifié, fusionner la branche de
   travail dans `main`.
2. **Pousser sur `main`.** Pousser ensuite `main` vers `origin`, ce qui
   déclenche le déploiement de production Vercel.

Précisions :

- Avant de merger, faire un `git fetch origin main` et repartir de l'état à
  jour ; si `main` a avancé, intégrer ces commits d'abord et résoudre les
  conflits avant de pousser.
- Ne merger que du travail vérifié : `npm run build` doit passer.
- Ne jamais forcer (`--force`, `--force-with-lease`) sur `main`.
- Si une autre branche non fusionnée contient un travail dont dépend la tâche
  en cours, le signaler explicitement à l'utilisateur avant de l'embarquer
  dans le merge : il part sinon en production sans avoir été relu.
- Continuer à travailler sur une branche dédiée, jamais directement sur
  `main` : la branche sert de preview Vercel et de point de relecture.

# Sécurité : ne jamais régresser

Le site a fait l'objet d'un audit complet et de plusieurs lots de correction.
Ce qui suit est un **acquis à préserver**, pas une suggestion. Aucune
modification future ne doit dégrader ces points, quelle qu'en soit la raison
invoquée (rapidité, confort de développement, contournement d'un blocage).

## Invariants

1. **Aucun secret dans le code.** Ni token, ni clé, ni mot de passe, ni
   identifiant d'application — même « temporairement », même dans une branche.
   Tout passe par les variables d'environnement Vercel.
2. **Le `customerAccessToken` Shopify ne franchit jamais la frontière
   serveur → client.** Il vit dans le JWT et se relit uniquement via
   `getShopifyToken()` (`@/lib/shopify/session-token`). Ne jamais le poser sur
   l'objet `Session` (servi en clair par `/api/auth/session`) ni le passer en
   prop à un composant `"use client"` (sérialisé dans le HTML).
3. **Tout HTML issu de Shopify est assaini** par `sanitizeDescription`
   (`@/lib/shopify/sanitize-description`), à la frontière de données, avant
   tout `dangerouslySetInnerHTML`. Les descriptions sont générées par un
   modèle de langage à partir de photos : elles ne sont pas de confiance.
   Ne jamais remplacer cet assainisseur par des expressions régulières — deux
   tentatives maison ont laissé passer des charges exécutables.
4. **Chaque Server Action revérifie la session** (`auth()`) et valide ses
   entrées. Une Server Action est un endpoint HTTP public : avoir été rendue
   depuis une page authentifiée ne prouve rien sur l'appelant.
5. **Les en-têtes de sécurité de `next.config.ts` restent en place**, CSP
   comprise et en mode bloquant. Élargir la CSP est possible, la désactiver ne
   l'est pas.
6. **Les mutations Shopify ne sont jamais rejouées** automatiquement
   (`shopifyFetch`) : un `cartLinesAdd` relancé ajouterait la pièce deux fois.
7. **`SHOPIFY_SHADOW_SECRET` ne change jamais.** Il commande le mot de passe
   Shopify de chaque cliente connectée via Google ; le modifier les prive
   toutes de leur historique de commandes.

## Réflexes

- Après toute modification de dépendances : `npm audit` doit rester à 0.
- Ne jamais désactiver une vérification pour faire passer un build.
- En cas de doute entre sécurité et confort, signaler l'arbitrage à
  l'utilisateur plutôt que de trancher seul.
