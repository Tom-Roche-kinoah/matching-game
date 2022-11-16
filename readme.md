# Matching Game 

Le jeu du Memory :space_invader: 

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
Nous allons construire le projet dans un environnement **Node.js,** en nous appuyant sur le framework **express**, qui s'occupera de servir la page de jeu, d'interagir avec la base de données **postgresql**, et de répondre aux **requetes asynchrones** de la page de jeu.

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

Exploiter le principe des "sprites Sheets" : une seule image combine differents éléments visuels, grâce aux propriétés css de positionnement et de taills de backgrounds, il est possible de n'afficher que la partie qui nous interresse :)

Ne pas hésiter à utiliser des attributs personnalisés pour définir des états applicatifs dans la vue.

**Petit bonus technique** : il est possible de créer un effet "3D Card Flip" en pure css, en utilisant les propriétés de transformation 3D et la perspective.

## 3 - dynamisation de l'affichage : js en front

### Mise en place du JS front

Nous avons besoin d'un fichier **memory.js** à lier au html.

Créons le dans le répertoire approprié `front/js/` puis relions le au html avec la balise `<script src="js/memory.js" defer></script>` dans le head du document.

Note : placé dans le head, le js qui va manipuler le dom, doit attendre que celui-ci soit entièrement chargé dans le navigateur avant de s'executer, c'est le rôle de la propriété `defer` utilisée ici.

Un petit `console.log('JS chargé !')` en début de fichier permet de vérifier si tout est ok dans la console du navigateur.

#### L'objet princpal : **memory**

```JS
const memory = {

  // Méthode d'initialisation de l'app
  init: () => {
    console.log('Jeu Chargé')
  }
};

memory.init();
```

L'ensemble des propriétés et des méthodes concernant le jeu seront écrites dans cet objet.

##### Etape 1 : identifier quelques états applicatifs

L'application possède 3 états de jeu principaux : 
- Accueil : affiche le Hall Of Fame
- Game : on joue !
- Game Over : on ne joue plus... et on rentre son blaze si on a scoré :sunglasses:

On découvre ensuite quelques paramètres de jeu
- la limite de temps d'une partie
- le nombre de paires à distribuer
- la durée d'affichage des cartes retournées

:information_source: Ces parametres permettront d'ajuster la difficulté du jeu.

On stockera également la data provenant du serveur
- Hall Of Fame

```JS
const memory = {
  // Propriétés générales
  gameState: 1, 
  hallOfFame: [], 

  // Parametres de jeu
  timeLimit: 240,
  cardDisplayTime: 3,
  numberOfCardPairs: 18, 

  // Méthode d'initialisation de l'app
  init: () => {
    console.log('Jeu Chargé')
  }
};
```

##### Etape 2 : Logique de création et ditribution des cartes

On doit distribuer N x 2 cartes, ou N est le nombre de paires parametrées.

Il existe plusieurs manières de créer N éléments puis de les injecter dans le dom.

Nous choisirons la méthode qui consiste à s'appuyer sur un tableau (array) de carte randomisé, sur lequel nous itérerons la création des cartes avec par exemple une boucle `foreach`

##### Etape 3 : Logique d'affichage et de comparaison d'une paire visible

Le but maintenant est de rendre interactive chaque carte, en leur attachant un évenement click, qui déclenchera un certain nombre d'actions :
- La carte doit se retourner (ajout d'une classe css)
- La carte doit se stocker dans un comparateur
- Si la carte est la 2eme du comparateur, alors il faut évaluer s'il s'agit d'une paire
- s'il s'agit bien d'une paire, on les laisse affichées et on désactive leur event
- si ce n'est pas une paire, le jeu les cache au bout de x secondes

:warning: Attention : Que se passe t'il si on clique 2x de suite sur la meme carte ?

##### Etape 4 : Logique de scoring et de condition de fin de jeu



## 4 - persistance des données : js en back, postgresql

