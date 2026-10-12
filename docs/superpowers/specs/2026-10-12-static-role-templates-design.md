# Conception des templates statiques Admin et Agent

## Objectif

Transformer iBank Front en démonstrateur d’interfaces bancaires navigable. L’authentification locale choisit un parcours Admin ou Agent. Toutes les pages métier sont des maquettes HTML/CSS complètes, sans données dynamiques, sans appel HTTP et sans liaison aux services Angular.

## Authentification locale

La page de connexion conserve son design actuel et reconnaît exactement deux comptes de démonstration :

- `admin` / `admin` ouvre `/dashboard/admin` ;
- `agent` / `agent` ouvre `/dashboard/agent`.

Toute autre combinaison affiche une erreur locale. Le rôle est conservé dans le stockage du navigateur afin que les guards puissent protéger les routes après un rafraîchissement. La déconnexion supprime cette session locale et retourne à `/login`.

L’authentification locale, les guards, la navigation et la déconnexion constituent la seule logique applicative conservée. Aucun endpoint du backend n’est appelé.

## Routage et accès

Les deux espaces ont des racines distinctes :

- `/dashboard/admin` pour l’administration ;
- `/dashboard/agent` pour les opérations courantes.

Un Agent ne peut pas ouvrir les routes Admin. Un Admin peut accéder aux fonctions opérationnelles et administratives depuis sa navigation. Une session absente ou invalide redirige vers `/login`. Une session déjà authentifiée qui ouvre `/login` retourne vers son tableau de bord.

## Pages communes

Les deux rôles disposent des pages suivantes :

- tableau de bord adapté au rôle ;
- clients : liste avec recherche visuelle, création, modification et détail ;
- comptes : liste, ouverture et détail ;
- transactions : dépôt, retrait, virement et historique ;
- profil ;
- déconnexion.

## Pages Admin

L’Admin dispose en plus des pages suivantes :

- guichets : liste, création, modification et détail ;
- types de comptes : liste, création, modification et détail ;
- agents : création avec affectation facultative à un guichet ;
- tableau de bord administratif avec indicateurs et raccourcis.

Le backend actuel ne fournit pas de liste ou de modification des agents. Aucun écran artificiel de gestion complète des agents n’est ajouté.

## Contenu des templates

Chaque page présente un état complet avec des données statiques réalistes directement écrites dans le HTML : lignes de tableaux, cartes, badges, montants, options de listes, historique et détails. Ces valeurs servent uniquement à montrer le design et ne prétendent pas représenter des données du backend.

Les formulaires utilisent exclusivement des éléments HTML natifs : `form`, `label`, `input`, `select`, `textarea` et `button`. Ils n’utilisent ni `ngModel`, ni `FormGroup`, ni `formControlName`, ni traitement de soumission. Les boutons métier restent visuels. Les liens entre pages utilisent le routeur Angular.

## Composants et fichiers

Chaque composant conserve son dossier et ses trois fichiers séparés : TypeScript, HTML et CSS. Le TypeScript des pages métier se limite à la déclaration du composant et aux imports nécessaires au rendu ou aux liens.

Les composants et styles existants sont réutilisés lorsque leur responsabilité reste pertinente. Aucun moteur CRUD générique, aucune abstraction de formulaire et aucune dépendance supplémentaire ne sont introduits.

Les services et modèles existants peuvent rester dans le dépôt pour un raccordement futur, mais aucun composant de page statique ne les injecte.

## Direction visuelle

Le langage visuel « Institution élégante » existant reste la référence : fond ivoire, surfaces claires, accent cuivre, texte brun sombre, tableaux lisibles et formulaires denses. Les pages restent utilisables sur ordinateur, tablette et mobile.

Les éléments interactifs conservent les bases d’accessibilité : labels reliés aux champs, titres hiérarchisés, navigation identifiable, focus visible et boutons dotés d’un type explicite.

## Vérification

Les tests automatisés couvrent uniquement les comportements réellement présents :

- connexion avec les deux comptes locaux ;
- rejet des identifiants inconnus ;
- restauration et suppression de la session locale ;
- protection des routes et séparation des rôles ;
- redirection vers le bon tableau de bord ;
- présence des principales pages et absence d’injection des services métier dans leurs composants.

La validation finale comprend la suite Angular, le build de production et une vérification des routes principales. Les anciens tests de contrats HTTP deviennent hors périmètre de cette version statique.

## Critères d’acceptation

- `admin/admin` ouvre le parcours Admin et `agent/agent` ouvre le parcours Agent.
- Les deux espaces sont protégés et ne permettent pas un changement de rôle par saisie d’URL.
- Toutes les pages définies existent et sont reliées par la navigation.
- Les pages métier ne contiennent aucun appel de service, abonnement RxJS ou formulaire réactif/template-driven.
- Les formulaires HTML présentent tous les champs nécessaires à un futur raccordement.
- Les tableaux, listes, détails et historiques montrent un rendu complet avec du contenu statique réaliste.
- Chaque composant conserve des fichiers `.ts`, `.html` et `.css` séparés.
- Aucun package supplémentaire n’est ajouté.
- Les tests du comportement local et le build de production réussissent.
