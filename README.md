# iBank Frontend — Google Authenticator (2FA)

Application Angular 21 de formation connectée au backend
[`BankManagementStarter`](https://github.com/khalillakhdhar/BankManagementStarter).
La branche `feature/two-factor-auth` ajoute l’interface de l’authentification à
deux facteurs avec Google Authenticator.

> **État actuel : implémenté.** La connexion en deux étapes et la gestion du 2FA
> depuis **Mon profil** sont fonctionnelles et testées (Vitest).

> **Aucune clé API Google n’est nécessaire.** TOTP est un standard ouvert
> (RFC 6238) calculé localement par ASP.NET Core Identity côté backend ; le QR
> code est généré dans le navigateur avec le paquet npm `qrcode`.

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

## 2. Activer Google Authenticator (pas à pas)

1. Installer **Google Authenticator** (ou une application TOTP équivalente) sur
   le téléphone.
2. Se connecter à iBank et ouvrir **Mon profil**.
3. Cliquer sur **Activer la double authentification** : un QR code et une clé
   manuelle s’affichent.
4. Dans Google Authenticator : `+` puis **Scanner un code QR**. Sans caméra :
   **Saisir une clé de configuration** et recopier la clé manuelle.
5. Saisir le code à six chiffres affiché par l’application puis cliquer sur
   **Activer**.
6. **Enregistrer les codes de récupération** affichés : ils ne sont montrés
   qu’une seule fois et chacun est à usage unique. Cliquer sur **J’ai
   enregistré mes codes**.
7. Se déconnecter puis vérifier la nouvelle connexion en deux étapes.

Une fois le 2FA actif, le profil permet de **régénérer les codes de
récupération** ou de **désactiver** le 2FA ; chaque action demande un code
Authenticator valide.

## 3. Connexion en deux étapes

1. **Étape 1** : e-mail et mot de passe → `POST /Auth/login`. Sans 2FA, la
   session est créée et le tableau de bord s’ouvre. Avec 2FA, le serveur
   renvoie `requiresTwoFactor: true` et un challenge valable 5 minutes.
2. **Étape 2** : code Google Authenticator (ou **Utiliser un code de
   récupération**) → `POST /Auth/login/2fa`. La session n’est créée qu’après
   réception du JWT final.
3. **Retour à la connexion** efface immédiatement le challenge en mémoire.
   Recharger la page pendant le challenge ramène à l’étape 1 : le challenge
   n’est volontairement jamais persisté.

Après 5 codes invalides consécutifs, le compte est verrouillé 15 minutes
(message d’erreur générique, identique à un mauvais code).

## 4. Endpoints utilisés

Chemins relatifs à l’URL de l’API ci-dessus (`/api/Auth/...`). Les routes
`2fa/*` envoient le JWT (`Authorization: Bearer`). Exemples fictifs.

| Méthode | Route                     | Requête                                      | Réponse                                                                                                                  |
| ------- | ------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| POST    | `Auth/login`              | `{ "email", "password" }`                    | `{ "requiresTwoFactor": false, "session": {…} }` ou `{ "requiresTwoFactor": true, "twoFactorChallenge": "<challenge>" }` |
| POST    | `Auth/login/2fa`          | `{ "twoFactorChallenge", "code": "123456" }` | `{ "token", "expiration", "user" }`                                                                                      |
| GET     | `Auth/2fa/status`         | —                                            | `{ "enabled": true, "recoveryCodesLeft": 8 }`                                                                            |
| POST    | `Auth/2fa/setup`          | `{}`                                         | `{ "sharedKey": "ABCD EFGH", "authenticatorUri": "otpauth://totp/…" }`                                                   |
| POST    | `Auth/2fa/enable`         | `{ "code": "123456" }`                       | `{ "recoveryCodes": ["aaaaa-bbbbb", …] }`                                                                                |
| POST    | `Auth/2fa/recovery-codes` | `{ "code": "123456" }`                       | `{ "recoveryCodes": [...] }`                                                                                             |
| POST    | `Auth/2fa/disable`        | `{ "code": "123456" }`                       | `204 No Content`                                                                                                         |

Le champ `code` de `login/2fa` accepte un code TOTP ou un code de récupération.
Les erreurs de code renvoient `400 { "message": "Code ou jeton invalide." }` ;
le frontend affiche ce message dans une zone `role="alert"`.

> Changement de format : `POST /Auth/login` renvoie désormais le JWT sous
> `session`. Les clients non Angular doivent être adaptés.

## 5. Fichiers frontend

```text
src/app/
├── models/auth.model.ts                  LoginResult, TwoFactor* (client typé)
├── services/auth.service.ts              login, completeTwoFactorLogin, méthodes 2FA
├── features/auth/login/                  connexion en deux étapes
└── features/profile/
    ├── profile.ts | .html | .css         gestion 2FA
    ├── qr-renderer.ts                    QR code local (jeton d’injection QR_RENDERER)
    └── profile.spec.ts                   tests
```

## 6. Sécurité des secrets

- La clé partagée, l’URI `otpauth://`, le QR code et les codes de récupération
  restent uniquement dans l’état du composant Profil ; ils sont effacés à
  l’annulation, après la désactivation, quand on quitte la vue de
  configuration et à la destruction du composant.
- Ils ne sont jamais écrits dans `localStorage`/`sessionStorage`, jamais
  journalisés et jamais envoyés à un service tiers.
- Si le QR code ne peut pas être généré, la clé manuelle reste disponible.
- Seule la session JWT est stockée (comme avant) ; ni le challenge ni la clé ne
  le sont.

## 7. Journal des changements (frontend)

- Infrastructure de tests Vitest + jsdom pour Angular (`npm test`).
- Client typé : modèles `LoginResult`, `TwoFactorStatus`, `TwoFactorSetup`,
  `TwoFactorRecoveryCodes` ; `AuthService` gère le challenge en mémoire et les
  méthodes de gestion 2FA.
- Connexion en deux étapes avec code de récupération et retour arrière.
- Gestion 2FA dans le profil : statut, QR code local, clé manuelle,
  confirmation par code, affichage unique des codes de récupération,
  régénération, désactivation, gestion des erreurs API (dont le 400
  générique).
- Dépendances ajoutées : `qrcode`, `@types/qrcode` (dev), `vitest`, `jsdom`
  (dev). Le build signale un avertissement « `qrcode` n’est pas ESM »
  (sans conséquence fonctionnelle).

## 8. Tests et vérifications

```powershell
npm ci
npm test -- --watch=false
npm run build
```

Backend associé (dépôt `BankManagementStarter`) :

```powershell
dotnet build BankManagement.sln --configuration Release -warnaserror
dotnet test BankManagement.sln --configuration Release
```

## 9. Identifiants et contexte de formation

```text
Administrateur : admin@bank.local / Admin123!
Agent : agent.test.vps@bank.local / TestAgent123!
```

La session JWT est stockée dans `localStorage` pour les besoins de la
formation. Ces identifiants ne doivent pas être utilisés avec des données
réelles.

## 10. Déploiement

La branche `feature/two-factor-auth` doit d’abord être testée avec le backend de
la même branche (voir la section « Déploiement sur le VPS » du README backend :
HTTPS, horloge NTP, trousseau Data Protection). Après validation des deux
projets, elle pourra être fusionnée dans `master`, ce qui déclenche le
déploiement Vercel de production.
