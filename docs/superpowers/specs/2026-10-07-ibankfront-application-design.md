# Conception de l’application iBank Front

## 1. Objectif

Construire une application Angular pédagogique pour le personnel bancaire. Elle doit illustrer clairement les composants standalone, les formulaires réactifs, les services HTTP, les signaux, l’authentification JWT, les gardes de routes et la gestion de rôles.

Le backend de référence est déployé à l’adresse `https://bank.135-125-182-42.nip.io/`. Le frontend est déployé sur Vercel par l’automatisation GitHub existante.

L’application ne contient aucune donnée de démonstration, fixture ou valeur métier simulée. Tout contenu métier visible provient de l’API.

## 2. Utilisateurs et droits

Deux rôles utilisent l’application :

- `Agent` : tableau de bord, clients, comptes et transactions ;
- `Admin` : tous les droits de l’Agent, plus la gestion des guichets, des types de comptes et la création d’agents.

Les liens d’administration sont absents de la navigation des Agents. Les routes correspondantes sont également protégées par une garde de rôle afin qu’une saisie manuelle d’URL ne contourne pas l’interface.

Cette protection frontend est pédagogique. La sécurité effective des ressources demeure une responsabilité du backend.

## 3. Direction visuelle

La direction retenue est « Institution élégante » :

- fond ivoire et surfaces crème clair ;
- accent cuivre pour les actions principales et les repères actifs ;
- texte brun très sombre à fort contraste ;
- lignes fines, rayons discrets et ombres limitées ;
- typographie éditoriale pour les titres et typographie sans sérif pour les données ;
- densité adaptée à un outil de gestion, sans décoration excessive.

Le même langage couvre la connexion, le shell authentifié, les tableaux, les formulaires, les détails, les confirmations et les états système. Le rendu doit être responsive sur ordinateur, tablette et mobile.

## 4. Architecture frontend

L’application utilise des composants Angular standalone et une organisation par fonctionnalité :

```text
src/app/
  core/
    config/
    guards/
    interceptors/
    services/
  layout/
    app-shell/
    sidebar/
    header/
  features/
    auth/login/
    dashboard/
    clients/
    comptes/
    transactions/
    guichets/
    types-comptes/
    agents/
  shared/
    components/
  models/
  services/
```

Chaque composant possède son propre dossier avec trois fichiers séparés : TypeScript, HTML et CSS. Les routes fonctionnelles sont chargées paresseusement.

Les composants partagés restent purement visuels : chargement, erreur, état vide et confirmation. Ils ne connaissent ni les endpoints ni les règles métier.

## 5. Configuration API

La racine API est centralisée dans une constante ou un jeton d’injection :

```text
https://bank.135-125-182-42.nip.io/api
```

Aucun service ne contient sa propre URL d’hôte. Chaque service construit uniquement le chemin de sa ressource à partir de cette configuration.

## 6. Authentification et session

La réponse de connexion complète est conservée dans `localStorage` sous une clé unique. Elle comprend le token, sa date d’expiration et l’utilisateur.

Le service d’authentification :

- connecte l’utilisateur avec `POST /api/Auth/login` ;
- restaure la session au démarrage ;
- expose l’utilisateur et l’état d’authentification sous forme de signaux ;
- refuse une session dont la date d’expiration est passée ;
- supprime toute la session à la déconnexion.

Un intercepteur ajoute `Authorization: Bearer <token>` aux requêtes vers l’API. Une réponse `401` détruit la session puis redirige vers la connexion.

La garde d’authentification protège le shell. La garde de rôle reçoit les rôles autorisés dans les données de route et redirige un utilisateur non autorisé vers le tableau de bord.

Ce stockage local est volontairement simple pour le tutoriel et ne prétend pas fournir un modèle de haute sécurité.

## 7. Écrans et parcours

### 7.1 Connexion

Formulaire email et mot de passe, validation locale, état d’envoi et erreur du backend. Une session valide redirige directement vers le tableau de bord.

### 7.2 Shell authentifié

Barre latérale responsive, en-tête avec identité et rôle, navigation filtrée selon le rôle et action de déconnexion.

### 7.3 Tableau de bord

Indicateurs calculés exclusivement à partir des données effectivement chargées : nombre de clients, comptes actifs, solde cumulé et guichets actifs pour l’Admin. Des raccourcis ouvrent les principaux formulaires métier. Les indicateurs indisponibles ne sont pas inventés.

### 7.4 Clients

- liste et recherche par terme ;
- création ;
- modification ;
- détail avec les comptes associés ;
- désactivation par l’opération de suppression exposée par l’API.

### 7.5 Comptes

- liste ;
- ouverture avec sélection d’un client, d’un type de compte et d’un guichet ;
- détail ;
- activation ou désactivation ;
- accès à l’historique des transactions du compte.

### 7.6 Transactions

Trois formulaires explicites : dépôt, retrait et virement. Les comptes sont choisis depuis les données réelles. L’historique d’un compte affiche la référence, le type, le montant, la date, la description et les comptes concernés.

### 7.7 Administration

- guichets : liste, création, modification et désactivation ;
- types de comptes : liste, création, modification et désactivation ;
- agents : création et affectation facultative à un guichet.

Le backend ne fournit pas d’endpoint de liste ou de modification des agents. L’écran Agents est donc limité au formulaire de création et n’affiche pas de tableau artificiel.

## 8. Services et contrats

Les modèles TypeScript restent alignés sur les DTO JSON du backend. Les services exposent des méthodes explicites et typées, retournent des `Observable` pour les mutations et conservent des signaux de liste, sélection, chargement et erreur lorsque cela sert plusieurs écrans.

Endpoints couverts :

- Auth : `POST /Auth/login`, `POST /Auth/agent` ;
- Clients : `GET /Clients`, `GET /Clients/{id}`, `GET /Clients/search`, `POST /Clients`, `PUT /Clients/{id}`, `DELETE /Clients/{id}` ;
- Comptes : `GET /Comptes`, `GET /Comptes/{id}`, `POST /Comptes`, `PUT /Comptes/{id}` ;
- Guichets : `GET /Guichets`, `GET /Guichets/{id}`, `POST /Guichets`, `PUT /Guichets/{id}`, `DELETE /Guichets/{id}` ;
- Types de comptes : `GET /TypesComptes`, `GET /TypesComptes/{id}`, `POST /TypesComptes`, `PUT /TypesComptes/{id}`, `DELETE /TypesComptes/{id}` ;
- Transactions : `GET /Transactions/compte/{compteId}`, `POST /Transactions/depot`, `POST /Transactions/retrait`, `POST /Transactions/virement` ;
- Santé : `GET /Health`.

Après une mutation réussie, le composant met à jour l’état local ou recharge la ressource pertinente. Il ne duplique pas de règle métier du backend.

## 9. Formulaires et validation

Tous les formulaires sont réactifs et reproduisent les contraintes utiles des DTO : champs requis, longueurs, email, valeurs positives et identifiants valides. Les champs facultatifs transmettent `null` lorsqu’ils sont vides si le contrat l’autorise.

Chaque formulaire distingue les erreurs de validation locale du message retourné par l’API. Les boutons d’envoi sont désactivés pendant la requête afin d’éviter les doubles soumissions.

## 10. Gestion des états et erreurs

Chaque vue de données prévoit quatre états : chargement, erreur, liste vide et contenu. Les erreurs HTTP sont converties en messages cohérents tout en conservant le message métier fourni par le backend lorsqu’il existe.

Traitement attendu :

- `400` : validation ou opération métier invalide ;
- `401` : session supprimée et retour à la connexion ;
- `403` : accès refusé et retour au tableau de bord ;
- `404` : ressource introuvable ;
- `409` : conflit de données, par exemple code ou CIN déjà utilisé ;
- erreur réseau : API indisponible avec possibilité de réessayer.

Les actions de désactivation demandent une confirmation explicite.

## 11. Stratégie de test

Le développement suit des tests écrits avant le comportement correspondant.

La suite automatisée couvre :

- chaque URL, verbe, paramètre et corps des services HTTP ;
- stockage, restauration, expiration et suppression de session ;
- ajout du token par l’intercepteur et traitement du `401` ;
- gardes d’authentification et de rôle ;
- validations et soumissions essentielles des composants ;
- routage et visibilité des éléments selon le rôle.

La vérification finale comprend les tests Angular et le build de production.

Le backend déployé est contrôlé directement avec :

- `GET /Health` ;
- une connexion réelle avec l’administrateur de formation documenté ;
- tous les endpoints `GET` disponibles ;
- les endpoints d’écriture avec des corps volontairement invalides pour vérifier routage, CORS, authentification et validation sans créer de données persistantes.

Les tests directs ne créent aucun client, compte, agent ou transaction de démonstration.

## 12. Critères d’acceptation

- Le frontend utilise uniquement la base API déployée centralisée.
- La connexion, la restauration de session, la déconnexion et l’expiration fonctionnent avec `localStorage`.
- Les routes sont protégées par authentification et par rôle lorsque nécessaire.
- Tous les endpoints disposent d’une méthode de service correcte et d’un test de contrat HTTP.
- Tous les écrans prévus existent avec formulaires, tableaux, listes et états nécessaires.
- Aucun écran ne contient de donnée métier de démonstration.
- Chaque composant est séparé en fichiers `.ts`, `.html` et `.css` dans son propre dossier.
- Le design suit la direction « Institution élégante » et reste responsive.
- Les tests Angular réussissent et le build de production aboutit.
- Les tests directs de l’API n’altèrent pas les données déployées.
