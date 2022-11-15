# Matching Game 

**Le jeu du Memory**

Un grand classique de l'enfance qui consiste à collecter des paires de figures identiques.

Idéal pour travailler sa mémoire et sa concentration.

## Organisation du projet

1. [Mise en place de l'environnement de travail](#1---mise-en-place-de-lenvironnement-de-travail)
2. [Conception statique de l'affichage : html et css](#2---conception-statique-de-laffichage--html-et-css)
3. [dynamisation de l'affichage : js en front](#3---dynamisation-de-laffichage--js-en-front)
4. [persistance des données : js en back, postgresql](#4---persistance-des-données--js-en-back-postgresql)

## Rappel des spécifications (les fonctionnalités souhaitées)

- le jeu distribue aléatoirement les 18 paires de carte, soit 36 cartes, face cachée, dans une grille.
- le joueur peut cliquer sur 2 cartes pour les retourner simultanément
    - si les cartes sont identiques, la paire est gagnée et les cartes restent visibles
    - si les cartes sont differentes, le joueur dispose d'un court laps de temps pour les mémoriser, puis elles sont retournées face cachée automatiquement
- un timer demarre avec la partie
    - pour gagner le joueur doit découvrir toutes les paires avant la fin du timer
- une partie gagnée verra son temps sauvegardé en base de données
    - <details>
        <summary>Bonus optionnel</summary>
        le joueur gagnant peut fournir son nom pour immortaliser sa performance ! :v:
    </details>
- l'écran d'accueil affiche les meilleurs scores (Hall Of Fame)

## 1 - Mise en place de l'environnement de travail
Nous allons construire le projet dans un environnement **Node.js,** en nous appuyant sur le framework **express**, qui s'occupera de servir la page de jeu, d'interagir avec la base de données **postresql**, et de répondre aux **requetes asynchrones** de la page de jeu.

Il s'agit d'une application monolitique, mais avec une ouverture sur le concept d'api.

### Node.js
Pour commencer, nous allons initier le projet à la racine de notre dossier avec la commande `npm init`

*( `npm init -y` pour ignorer le générateur interactif )*

Ensuite nous installons les modules nécéssaires à notre projet, pour le moment nous avons besoin de :
- **express** (le couteau suisse des serveurs http sous node) `npm install express`
- **pg** (le client postgresql pour node) `npm install pg`
- **dotenv** (pour stocker des variables d'environnement) `npm install dotenv`

Pour nous simplifier le développement, nous allons nous assister de **nodemon** que l'on installera en dépendances de développement. Il se chargera de relancer le serveur à notre place lors de nos modifications. `npm install nodemon --save-dev`

:bulb: *Astuce 1 : il est possible d'installer plusieurs dépendances en enchainant leur nom dans la commande d'install, ex :* `npm install express pg dotenv`

:bulb: *Astuce 2 : on n'oublie pas de créer et définir le fichier .gitignore, pour éviter de synchroniser les modules node et le .env qui contiendra des informations sensibles !*

### Structure de l'application
Créer les dossiers en suivant l'architecture proposée ici :

📁 matching-game \
┗ 📁 server \
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;┣ 📁 controllers \
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;┗ 📁 dataMappers \
┣ 📁 front \
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;┗ 📁 css \
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;┗ 📁 img \
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;┗ 📁 js



## 2 - Conception statique de l'affichage : html et css

### Html et CSS
En s'appuyant sur la maquette, intégrer la vue principale de l'application.

:bulb: *Astuce  : flex est ton ami !*

L'idée est d'imaginer une carte qui a 2 états : affichée/masquée. Une classe css associée permetterait de basculer d'un état à l'autre.

## 3 - dynamisation de l'affichage : js en front

## 4 - persistance des données : js en back, postgresql

