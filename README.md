# iBank Frontend — Google Authenticator (2FA)

Application Angular 21 de formation connectée au backend
[`BankManagementStarter`](https://github.com/khalillakhdhar/BankManagementStarter).
La branche `feature/two-factor-auth` est consacrée à l’interface de
l’authentification à deux facteurs avec Google Authenticator.

> État actuel : le parcours 2FA est conçu mais le code fonctionnel reste à
> implémenter. Ce README décrit pas à pas les changements frontend prévus.

## 1. Récupérer la branche

```powershell
git fetch origin
git switch feature/two-factor-auth
git pull --ff-only
npm ci
npm start
```

Ouvrir `http://localhost:4200`. L’API configurée est :

```text
https://bank.135-125-182-42.nip.io/api
```

## 2. Faut-il une API key Google ?

Non. Google Authenticator utilise le standard TOTP et ne nécessite ni Google
Cloud, ni OAuth, ni API Google, ni API key.

Le backend fournit une URI `otpauth://` contenant la clé secrète :

```text
otpauth://totp/iBank:utilisateur@example.com?secret=CLE&issuer=iBank
```

Le frontend convertira cette URI en QR code directement dans le navigateur. La
clé ne sera jamais envoyée à un générateur de QR code externe.

## 3. Fichiers frontend concernés

Les modifications prévues concernent principalement :

```text
src/app/
├── models/auth.model.ts
├── services/auth.service.ts
├── features/auth/login/
│   ├── login.ts
│   ├── login.html
│   └── login.css
└── features/profile/
    ├── profile.ts
    ├── profile.html
    └── profile.css
```

Un composant spécialisé pourra être ajouté pour afficher le QR code et les
recovery codes sans surcharger la page Profil.

## 4. Adapter les modèles d’authentification

La réponse de `POST /Auth/login` aura deux formes.

### Connexion terminée sans 2FA

```json
{
  "requiresTwoFactor": false,
  "token": "jwt",
  "expiration": "2026-10-30T16:00:00Z",
  "user": {}
}
```

### Second facteur demandé

```json
{
  "requiresTwoFactor": true,
  "twoFactorChallenge": "challenge-signe-temporaire"
}
```

`auth.model.ts` devra représenter explicitement ces deux résultats afin
d’empêcher le frontend de considérer un challenge comme une session complète.

## 5. Adapter `AuthService`

`AuthService.login()` continuera d’envoyer l’e-mail et le mot de passe.

- Si la réponse contient une session JWT complète, le comportement actuel est
  conservé.
- Si `requiresTwoFactor` vaut `true`, aucun élément n’est écrit dans
  `localStorage`. Le challenge est conservé uniquement en mémoire.

Une nouvelle méthode enverra le code :

```http
POST /Auth/login/2fa
```

```json
{
  "challenge": "challenge-signe-temporaire",
  "code": "123456",
  "useRecoveryCode": false
}
```

Le service ne créera la session locale qu’après réception du JWT final.

## 6. Modifier l’écran de connexion

Le formulaire aura deux étapes dans le même écran.

### Étape 1 — mot de passe

1. L’utilisateur saisit son e-mail et son mot de passe.
2. Le frontend appelle `POST /Auth/login`.
3. Sans 2FA, il ouvre directement le tableau de bord.
4. Avec 2FA, il affiche l’étape de validation du code.

### Étape 2 — code Google Authenticator

1. L’utilisateur ouvre Google Authenticator.
2. Il saisit le code à six chiffres affiché sur son téléphone.
3. Le frontend appelle `POST /Auth/login/2fa`.
4. Après validation, il stocke la session et ouvre le tableau de bord.

L’écran proposera aussi :

- **Utiliser un code de récupération** ;
- **Retour à la connexion**, qui efface immédiatement le challenge en mémoire ;
- un message générique lorsque le challenge ou le code est invalide ;
- un état de chargement empêchant les doubles soumissions.

## 7. Ajouter la gestion 2FA au profil

La page **Mon profil** commencera par appeler :

```http
GET /Auth/2fa/status
```

Elle affichera si le 2FA est actif et le nombre de recovery codes disponibles.

### Préparer l’association

Le bouton **Configurer Google Authenticator** appellera :

```http
POST /Auth/2fa/setup
```

Le backend renverra :

```json
{
  "sharedKey": "CLE-MANUELLE",
  "authenticatorUri": "otpauth://totp/..."
}
```

Le frontend affichera :

- le QR code généré localement ;
- la clé manuelle avec un bouton de copie ;
- les instructions pour Google Authenticator ;
- un champ pour confirmer le premier code à six chiffres.

### Activer

Après le scan, le frontend enverra le premier code à :

```http
POST /Auth/2fa/enable
```

Si le code est valide, le backend renverra les recovery codes. Ils seront
affichés une seule fois avec une consigne claire : les conserver hors de
l’application.

### Régénérer les recovery codes

L’utilisateur devra saisir un code Google Authenticator valide avant l’appel :

```http
POST /Auth/2fa/recovery-codes
```

Les nouveaux codes remplaceront tous les anciens.

### Désactiver

L’utilisateur devra confirmer un code Google Authenticator avant l’appel :

```http
POST /Auth/2fa/disable
```

Une boîte de confirmation expliquera que les anciens recovery codes ne seront
plus utilisables.

## 8. Générer le QR code localement

Le frontend utilisera une bibliothèque locale compatible Angular, installée
depuis npm, pour convertir `authenticatorUri` en image ou en canvas. Aucun appel
HTTP ne doit contenir cette URI.

Exigences :

- ne jamais journaliser `sharedKey` ou `authenticatorUri` ;
- effacer la configuration de l’état du composant en quittant la page ;
- ne pas enregistrer la clé dans `localStorage` ou `sessionStorage` ;
- conserver un contraste et un niveau de correction suffisants pour le scan ;
- toujours proposer la clé manuelle si la caméra ne peut pas lire le QR code.

## 9. Parcours complet d’activation

1. Se connecter à iBank.
2. Ouvrir **Mon profil**.
3. Choisir **Configurer Google Authenticator**.
4. Ouvrir Google Authenticator sur le téléphone.
5. Appuyer sur `+`, puis **Scanner un code QR**.
6. Scanner le QR affiché dans iBank.
7. Recopier le code à six chiffres dans le frontend.
8. Valider l’activation.
9. Enregistrer les recovery codes dans un emplacement sûr.
10. Se déconnecter puis vérifier la nouvelle connexion en deux étapes.

## 10. États et erreurs à gérer

L’interface devra gérer explicitement :

- challenge expiré : retour au formulaire e-mail/mot de passe ;
- code TOTP incorrect : rester sur la seconde étape ;
- recovery code incorrect ou déjà utilisé ;
- perte de connexion au backend ;
- QR code impossible à générer : afficher la clé manuelle ;
- 401 reçu après connexion : supprimer la session comme aujourd’hui ;
- rechargement pendant le challenge : revenir à la première étape, puisque le
  challenge n’est volontairement pas persisté.

## 11. Tests et vérifications

Les tests frontend devront vérifier :

- la connexion existante sans 2FA ;
- la transition mot de passe → code TOTP ;
- l’absence de session avant le JWT final ;
- la validation par Authenticator et par recovery code ;
- l’effacement du challenge lors du retour ;
- l’affichage et la suppression en mémoire de la clé de configuration ;
- les états d’activation, de régénération et de désactivation ;
- les erreurs HTTP et les doubles soumissions.

Commandes de vérification :

```powershell
npm ci
npm run build
```

Les tests backend associés devront également réussir :

```powershell
dotnet build BankManagement.sln --configuration Release -warnaserror
dotnet test BankManagement.sln --configuration Release
```

## 12. Identifiants et contexte de formation

```text
Administrateur : admin@bank.local / Admin123!
Agent : agent.test.vps@bank.local / TestAgent123!
```

La session JWT actuelle est stockée dans `localStorage` pour les besoins de la
formation. Le challenge 2FA et la clé Authenticator ne devront jamais y être
stockés. Ces identifiants ne doivent pas être utilisés avec des données réelles.

## 13. Déploiement

La branche `feature/two-factor-auth` doit d’abord être testée avec le backend de
la même branche. Après validation des deux projets, elle pourra être fusionnée
dans `master`, ce qui déclenchera le déploiement Vercel de production.
