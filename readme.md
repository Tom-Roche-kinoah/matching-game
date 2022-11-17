# Matching Game 

Le jeu du Memory :space_invader: 

Un grand classique de l'enfance qui consiste à collecter des paires de figures identiques.

Idéal pour travailler sa mémoire et sa concentration.

## Organisation du projet

1. [Mise en place de l'environnement de travail](#1---mise-en-place-de-lenvironnement-de-travail)
2. [Conception statique de l'affichage : html et css](#2---conception-statique-de-laffichage--html-et-css)
3. [dynamisation de l'affichage : js en front](#3---dynamisation-de-laffichage--js-en-front)
4. [persistance des données : js en back, postgresql](#4---persistance-des-données--js-en-back-postgresql)
5. [Connecter l'app et le serveur](#5---connecter-lapp-et-le-serveur)

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
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;┗ 📁 router \
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

L'idée est d'imaginer une carte qui possède 2 états : affichée/masquée. Une classe css associée permetterait de basculer d'un état à l'autre.

Exploiter le principe des "sprites Sheets" : une seule image combine differents éléments visuels, grâce aux propriétés css de positionnement et de tailles de backgrounds, il est possible de n'afficher que la partie qui nous interresse :)

Ne pas hésiter à utiliser des attributs personnalisés pour définir des états applicatifs dans la vue.

**Petit bonus technique** : il est possible de créer un effet "3D Card Flip" en pur css, en utilisant les propriétés de transformation 3D et la perspective.

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

:warning: : Que se passe t'il si on clique 2x de suite sur la meme carte ?
:warning: : Que se passe t'il si deja 2 cartes sont visibles et qu'une nouvelle est cliquée ?

Souvent en game design, on utilise un principe 'd'états machine', on peut l'appliquer dans cet exercice, à notre mesure, en décrivant par exemple des états qui autorisent à jouer ou non. Ce qui permet de vérifier si le joueur à le droit d'effectuer une action.

Par ex. dans notre application :
```JS
const memory = {
    areCardsClickable: true, // le joueur a til le droit de cliquer sur les cartes ?

    // ...

    // au clic sur une carte
    onCardClick: (card) => {
        // si j'ai le droit
        if (memory.areCardsClickable) {
            // j'appelle une méthode qui dévoilera cette carte
            memory.flipCards(card, true);
        }
        // sinon, il ne se passe rien
    },
}
```


##### Etape 4 : Logique de scoring et de condition de fin de jeu

###### Score
Pour marquer des points, il faut découvrir une paire de cartes identiques.\
Un paramètre `currentScore` que l'on incrémente de 1 à chaque bonne paire trouvée fera l'affaire.

###### Timer
Pour le timer, il faut utiliser une methode JS qui permet d'executer des actions toutes les x valeurs de temps.\
Comme la classique `setInterval()` ou la plus récente `requestAnimationFrame()`

Là encore, nous pouvons nous inspirer du game design, en imaginant un moteur qui tournerait sans cesse (l'interval) et qui en fonction des 'etats machine' executerait telle ou telle action.

###### Fin de jeu
Pour chaque action du joueur, ou du temps qui passe, il faut vérifier si le jeu est terminé. Soit par un echec (temps écoulé) soit par une victoire (toutes les paires découvertes)

Il faut donc écrire une méthode qui fera ces vérifications dès que nécéssaire.


## 4 - persistance des données : js en back, postgresql

### Vue d'ensemble
Nous allons utiliser le SGBD **Postgres**, le client **PG** pour Node.js se chargera de dialoguer avec ce SGBD.

**Pour rappel :** \
L'utilisateur (l'internaute) déclenche une requete (en démarrant l'application dans son navigateur par ex.) vers le serveur http (node.js/express), le serveur interroge la base de données via son client, construit une réponse et la retourne à l'utilisateur. \
**Navigateur <-> Serveur <-> SGBD**

Nous allons construire une architecture **'DataMapper pattern'** \
pour séparer les responsabilités du stockage et de la représentation de la data.

### La base de données

#### Créer une base de donnée et son utilisateur dédié
Commençons par nous connecter à notre SGBD Postgres en admin dans un terminal

(par ex: `sudo -i -u postgres` sous linux)

Créer un user : `CREATE ROLE memory WITH LOGIN PASSWORD 'memory';`

Créer la base et y attacher l'user : `CREATE DATABASE memory OWNER memory;`

*Par commodité j'utilise en local le meme nom pour l'utilisateur, le mot de passe et le nom de la base.*

Il nous faut ensuite créer une table 'score' qui va respecter ce MLD :
- ***Score**(codeScore, playerName, playerScore, createdAt, updatedAt)*

Ce qui donne en SQL pour Postgres :

```SQL
CREATE TABLE IF NOT EXISTS "score"(
  "id" INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  "player_name" TEXT NOT NULL,
  "player_score" INTEGER,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ
);
```

:warning: : Ne pas oublier de se positionner sur la bonne base de données avant de créer la table !

#### Créer un peu de data de test
```SQL
INSERT INTO "score" ("player_name", "player_score") VALUES
  ('Louise', '34'),
  ('Camille', '37'),
  ('Tom', '56'),
  ('Cécile', '62'),
  ('Maéva', '76');
```
Effectuons une requete de test toujours avec le CLI :\
*Je veux récuperer les 3 meilleurs scores, je trie donc par score décroissant, et je limite aux 3 premiers résultats.*
```SQL
SELECT * FROM score ORDER BY player_score ASC LIMIT 3;
```

### Le serveur
Le rôle de notre serveur se limitera à jouer les intérmédiaires entre notre app et le sgbd.

La première pierre de l'édifice est l'index du serveur, qui instancie express et permet d'échanger en http avec le client (l'app)

Une fois le serveur opérationnel, on lui demande de servir notre dossier public : 
```JS
app.use(express.static('front'));
```

Ainsi, l'url de base de notre serveur nous affichera notre jeu.

#### L'Api

On commence par préciser, toujours sur le serveur, que les échanges seront parsés en Json : 
```JS
app.use(express.json());
```

La suite en 3 étapes :
- routeur
- controller
- data mapper

Le routeur intercepte les requetes client et, en fonction de l'url et du verbe http utilisé, appelle le controleur associé : 
```JS
router.get('/score', scoreController.allScores);
```

Le controller injecte la logique dans le traitement de la donnée en entrée/sortie, et appelle la bonne fonction du data mapper : 
*par ex. ici la forme que l'on donne à la data (json) qui va repartir au client* : 
```JS
exports.allScores = async (req, res) => {
    try {
        const scores = await dataMapper.fetchAllScores();
        res.json(scores);
    } catch (error) {
        res.json(error);
    }
};
```

Le datamapper requete le sgbd et retourne son resultat :
```JS
exports.fetchAllScores = async () => {
    const scores = await db.query(`
        SELECT *
        FROM "score"
        ORDER BY "player_score" ASC
    `);
    return scores.rows;
};
```

*Note : Les fonctions du controller et du datamapper sont asynchrones, car le serveur de bdd peut prendre un certain laps de temps avant de répondre.*

A ce stade, avec le serveur démarré, en appelant dans notre navigateur : http://localhost:5001/score/ on devrait etre en mesure de récuperer la liste d'objets 'scores' en json.



## 5 - Connecter l'app et le serveur

Pour terminer, il faut retourner dans le code du jeu, pour implémenter les requetes à l'api.



### Fetch mon ami !

Adieu *XMLHttpRequest*, bonjour *fetch* !

Pour récuperer les scores depuis l'application, c'est relativement simple :

Créons une méthode asynchrone qui appelle l'url de notre serveur (par défaut en GET) et quand la promesse est résolue, nous rafraichissons le tableau Hall Of Fame.

```JS
fetchAllScore: async () => {
    try {
      const response = await fetch(`${memory.apiBaseUrl}/score`);
      const scores = await response.json();
      memory.hallOfFame = scores;    
    } catch (error) {
        console.error(error);
    }
  },
```
Pour l'ajout d'un score, il faudra fournir des paramètres à la requete fetch.

https://developer.mozilla.org/fr/docs/Web/API/Fetch_API/Using_Fetch

A vous de finir :)

## Annexes

### Captures
![Capture animée](https://kinoah.com/memory/memory.gif)
![Capture hall of fame](https://kinoah.com/memory/memory-screen-01.jpg)
![Capture time out](https://kinoah.com/memory/memory-screen-02.jpg)
![Capture win](https://kinoah.com/memory/memory-screen-03.jpg)

### Alternatives techniques
- Nous aurions pu utiliser un moteur de vue dans express, comme ejs, plutot qu'une SPA (Single Page Application)

- Une librairie comme React pourrait permettre de rationnaliser la partie front (mais dans ce contexte, sera plus complexe !)

- Pour la persistance des données, nous aurions pu utiliser le module fs de node et simplement écrire dans un fichier.
