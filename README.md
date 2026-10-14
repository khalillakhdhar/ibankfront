# iBank Frontend — branche Angular complète

Application Angular 21 de formation connectée à l’API BankManagementStarter.
Cette version fonctionnelle vit uniquement sur `feature/angular-complete`.

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
et `ngModel`. Cette branche de cours ne contient volontairement aucun test
unitaire.

## Build

```bash
npm run build
```

## Isolation du déploiement

`vercel.json` désactive les déploiements automatiques uniquement pour
`feature/angular-complete`. Cette branche ne doit pas être fusionnée dans
`master` et ne modifie ni le backend ni la VPS.
