# iBank Frontend

Application Angular 21 de formation connectée à l’API BankManagementStarter.
La version de production est publiée depuis la branche `master` par
l’intégration GitHub de Vercel.

## Installation et lancement

Prérequis : Node.js compatible avec Angular 21 et npm 12.

```bash
npm ci
npm start
```

Ouvrir ensuite `http://localhost:4200`. L’API configurée est
`https://bank.135-125-182-42.nip.io/api`.

## Accès de formation

- Administrateur : `admin@bank.local` / `Admin123!`
- Agent de test : `agent.test.vps@bank.local` / `TestAgent123!`

La connexion utilise un JWT réel. Pour simplifier le tutoriel, la session est
stockée dans `localStorage`; ce choix n’est pas destiné à une application
bancaire de production.

## Fonctionnalités

- authentification, déconnexion, guards et rôles Admin/Agent ;
- clients : recherche, consultation, création, modification et suppression ;
- comptes : liste, ouverture, consultation et activation/désactivation ;
- guichets et types de comptes : consultation et administration ;
- agents : création par un administrateur ;
- transactions : dépôt, retrait, virement et historique ;
- tableaux de bord alimentés par l’API et profil de session.

Tous les formulaires utilisent l’approche Template-driven avec `FormsModule`
et `ngModel`.

## Build

```bash
npm run build
```

## Déploiement

Vercel construit automatiquement chaque push sur `master`. Le fallback défini
dans `vercel.json` renvoie les routes Angular (par exemple
`/dashboard/admin/clients`) vers `index.html`, afin qu’un rechargement ou un
lien direct ne produise pas de page 404.
