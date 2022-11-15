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
Pour commencer, nous allons initier le projet à la racine de notre dossier avec la commande `npm install`

## 2 - Conception statique de l'affichage : html et css

## 3 - dynamisation de l'affichage : js en front

## 4 - persistance des données : js en back, postgresql

