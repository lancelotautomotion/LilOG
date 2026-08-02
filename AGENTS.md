<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Workflow & déploiement

- **Pas de terminal local.** L'utilisateur travaille exclusivement via Claude Code (web) → GitHub → Vercel.
- Ne jamais demander à l'utilisateur de lancer une commande dans un terminal local.
- Ne jamais créer de fichier `.env.local` — les variables d'environnement sont gérées dans le dashboard Vercel.
- Pour toute variable d'environnement nouvelle : indiquer le nom et la valeur à ajouter dans Vercel (Settings → Environment Variables), pas dans un fichier.
- Le déploiement est automatique : un push sur la branche principale déclenche Vercel.
- Les branches de feature déclenchent des preview deployments Vercel.
