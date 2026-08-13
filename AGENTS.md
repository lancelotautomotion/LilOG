<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes: APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
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
