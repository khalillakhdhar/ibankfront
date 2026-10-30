# Résultats de vérification : double authentification (2FA)

Date : 2026-10-30. Aucun secret (clé d'authentificateur, challenge, JWT, mot de passe, code de récupération) n'est consigné dans ce document ni dans les rapports.

## Ce qui a été exécuté

- Smoke test en direct contre une API **locale** (`dotnet run --project Bank.Api`, `http://127.0.0.1:5199`), avec une base **jetable** SQL Server LocalDB (`BankSmokeTmp_2fa`, créée par les migrations puis supprimée après l'exécution). Résultat : **33/33 routes conformes**.
  - Connexion `POST /Auth/login` acceptée avec la nouvelle forme `{ session, requiresTwoFactor }` (le script accepte aussi l'ancienne forme plate `{ token }` ; si `requiresTwoFactor` est vrai, il échoue avec un message clair).
  - Sans jeton : `GET /Auth/2fa/status`, `POST /Auth/2fa/setup`, `/enable`, `/recovery-codes`, `/disable` renvoient 401 (attendu 4xx).
  - `POST /Auth/login/2fa` avec un challenge et un code manifestement invalides renvoie 400 (attendu 4xx).
  - Les 27 routes existantes restent conformes. Aucune route `setup`/`enable`/`disable` n'est appelée avec un jeton valide (aucune mutation de compte).
- Tests automatisés :
  - Backend : `dotnet test BankManagement.sln` : 49 réussis, 0 échec.
  - Frontend : `npm test` : 39 réussis (3 fichiers), 0 échec.
  - Frontend : `npm run build` : réussi.
- `git diff --check` : sans erreur dans les deux dépôts.

## Ce qui n'a PAS été exécuté

- Le smoke test **n'a pas été lancé contre la production** (`bank.135-125-182-42.nip.io`) : le nouveau code n'y est pas déployé et il s'agit du système réel. Cette vérification reste **en attente après déploiement**.
- Le parcours complet avec un second facteur valide (activation, connexion 2FA réussie, codes de récupération) n'a pas été exécuté en direct : il exige un secret TOTP et muterait un compte. Il est couvert par les tests automatisés uniquement.
- Aucun push ni fusion n'a été effectué par cette étape.

## Commande à exécuter après déploiement

```powershell
powershell -NoProfile -File scripts/smoke-api.ps1
```

Le compte utilisé ne doit pas avoir la 2FA activée. Le rapport `docs/api-smoke-results.md` ne liste que méthodes, routes et statuts.
