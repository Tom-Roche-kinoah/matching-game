console.log('❤ Memory');

const memory = {
  // ------------
  // Propriétés
  // ------------
  // Propriétés générales
  gameState: 1, // le jeu possède 4 états (hall-of-fame 1/game 2/time-out 3/victory 4)
  currentPair: [], // tableau qui contient les 2 cartes en cours d'affichage
  areCardsClickable: false, // l'event de click est il disponible
  isGameActive: false, // le jeu est il en cours
  currentScore: 0, // nombre de paires découvertes
  currentTime: 0, // chrono en cours en 10e de secondes
  hallOfFame: [], // le tableau des meilleurs scores
  apiBaseUrl: "http://localhost:5001", // url à requeter pour la gestion des scores

  // Parametres de jeu
  timeLimit: 300, // temps alloué pour ue partie, en secondes
  cardDisplayTime: 1, // temps d'affichage d'une paire de cartes retournée, en secondes
  numberOfCardPairs: 4, // nombre de paires de cartes (max 18 en l'état)

  // Elements du dom (les éléments auquels on a besoin d'acceder régulièrement)
  gameElement: document.querySelector('.game'), // la zone globale, qui change de state
  cardsGridElement: document.querySelector('.cards'), // la zone où l'on distribue les cartes
  scoreDisplayElement: document.querySelector('.score .ui-element-content'), // le texte du score
  timerDisplayElement: document.querySelector('.timer .ui-element-content'), // le texte du temps
  timerBarElement: document.querySelector('.timer-bar .bar'), // la barre de temps
  victoryMessageElement: document.querySelector('.victory .message'), // le message de victoire
  HallOfFameListElement: document.querySelector('.player-list'), // le Hall of Fame

  // Méthode d'initialisation de l'app
  init: async () => {
    await memory.fetchAllScore();
    memory.displayHallOfFamePlayers();
    memory.gameTimeEngine();
    memory.handleNewGame();
    memory.handleCloseGameOver();
    memory.handleSubmitScoreForm();
    memory.displayScore();
    memory.dealCards();
    console.log('Jeu Chargé');
  },

  // ------------
  // Méthodes
  // ------------
  // Créer le tableau d'id de cartes, et le retourner mélangé
  createArrayOfCards: () => {
    const arrayOfCards = [];
    // pour chaque paire de cartes
    for (let id = 1; id <= memory.numberOfCardPairs; id++) {
      // on ajoute 2x l'id dans le tableau
      arrayOfCards.push(id, id); // par ex. pour 4 paires => [1, 1, 2, 2, 3, 3, 4, 4]
    }
    // puis on mélange le tableau
    memory.shuffleArray(arrayOfCards);
    return arrayOfCards;
  },

  // Distribuer les cartes
  dealCards: () => {
    // créer le tableau d'id de carte
    const cards = memory.createArrayOfCards();
    // console.log(pairsOfCards);
    // itérer sur le tableau d'id de carte
    cards.forEach((cardId, index) => {
      // créer une carte et l'injecter dans le dom
      memory.createCardElement(cardId, index);
    });
  },

  // Créer une carte
  createCardElement: (cardId, cardNumber) => {
    // créer l'élément
    const cardElement = document.createElement('div');
    // ajouter sa classe css
    cardElement.classList.add('card-outer');
    // ajouter son id de paire en data-id
    cardElement.dataset.id = cardId;
    // ajouter son numéro de carte en data-number
    cardElement.dataset.number = cardNumber;
    // définir son contenu (chaine html sans risque ici)
    cardElement.innerHTML = `
      <div class="card">
          <div class="face front"></div>
          <div class="face back"></div>
      </div>
    `;
    // attacher l'événement au click
    cardElement.addEventListener('click', memory.handleCardClick);
    // injecter l'élément dans le dom
    memory.cardsGridElement.appendChild(cardElement);
  },

  // Evenement click sur une carte
  handleCardClick: (e) => {
    // au clic, on récupère l'élément .card-outer le plus proche
    memory.onCardClick(e.target.closest(".card-outer"));
  },

  // Au clic sur une carte
  onCardClick: (card) => {
    // si les cartes sont cliquables
    if (memory.areCardsClickable) {
      // Retourner la carte ciblée
      memory.flipCards([card], true);
      // Ajouter la carte ciblée au comparateur
      memory.addToCurrentPair(card);
    }
  },

  // Stockage de la paire en cours
  addToCurrentPair: (card) => {
    // si la première carte est recliquée, ignorer l'evenement
    // => si une seule carte présente dans le comparateur, ET si cette carte est identique à celle cliquée
    if (memory.currentPair.length === 1 && memory.currentPair[0] === card) {
      console.error('Carte déja cliquée...');
      // le return ici termine la fonction
      return;
    }

    // ajouter la carte au comparateur 
    memory.currentPair.push(card);

    // si le comparateur contient 2 cartes 
    if (memory.currentPair.length === 2) {
      // on vérifie si c'est une paire gagnante
      console.log('2 cartes affichées, on check si c\'est une paire');
      memory.checkIfGoodPair();
    }
  },

  // Vérifier si la paire visible est valide (2 id identiques)
  checkIfGoodPair: () => {
    // une paire est affichée, on désactive le click sur les cartes
    memory.areCardsClickable = false;
    // si les cartes du comparateur ont le meme id
    if (memory.currentPair[0].dataset.id === memory.currentPair[1].dataset.id) {
      // C'est une paire gagnante
      console.log('🟢 Yes ! C\'est une paire !');
      // pour chaque carte du comparateur
      memory.currentPair.forEach(card => {
        // on leur retire définitivement l'event de click
        card.removeEventListener('click', memory.handleCardClick);
        // on ajoute la class css 'discovered'
        card.classList.add('discovered');
      });
      // on ajoute un point au score
      memory.scoreUp();
      // on vide le comparateur
      memory.resetCurrentPair();
      // puis on réactive le click sur les cartes restantes
      memory.areCardsClickable = true;
    } else {
      // sinon, ce n'est pas une paire gagnante, on les cache à la fin du délai
      console.log('🔴 C\'est pas une paire...');
      memory.displayCardTimeOut();
    }
  },

  // Cacher la paire visible au bout du délai
  displayCardTimeOut: () => {
    // Convertir le délai paramétré en ms
    const displayTime = memory.cardDisplayTime * 1000;
    const displayTimer = setTimeout(() => {
      // toutes les actions dans le timeOut seront éxecutées apres 'displayTime' ms
      console.log('On les cache');
      // flip, coté caché, de la paire courante
      memory.flipCards(memory.currentPair, false);
      // Vider le comparateur
      memory.resetCurrentPair();
      // Réactiver le click sur les cartes restantes
      memory.areCardsClickable = true;
      clearTimeout(displayTimer);
    }, displayTime);
  },

  // exemple de JSdoc
  /**
   * Retourner (montrer ou cacher) des cartes 
   * @param {array} cardsArray est un tableau de cartes à retourner (flip)
   * @param {boolean} visible est un boolean pour indiquer le sens final du retournement, true : affiché, false : caché
   */
  flipCards: (cardsArray, visible) => {
      cardsArray.forEach(card => {
        // exemple d'opérateur conditionnel (ternaire)
        visible ? card.classList.add('visible') : card.classList.remove('visible');
      });
  },

  // Vider le comparateur de carte
  resetCurrentPair: () => {
    memory.currentPair = [];
  },

  // Ajouter 1 point au score
  scoreUp: () => {
    // incrémentation de currentScore de 1 (++ équivalent à += 1, ou encore maVar = maVar + 1 )
    memory.currentScore ++;
    // Mise à jour du score dans l'affichage
    memory.displayScore();
    // Test de condition de victoire
    memory.isGameOver();
  },

  // Afficher le score dans l'ui
  displayScore: () => {
    const score = `${memory.currentScore}/${memory.numberOfCardPairs}`
    memory.scoreDisplayElement.textContent = score;
  },

  // Animer la barre de progression du temps dans l'ui
  displayTimeBarProgress: () => {
    // la barre de temps remplit progressivement toute la largeur de l'ui
    // cette largeur est variable, il faut donc convertir le temps absolu en %age
    let percentage = memory.currentTime / memory.timeLimit * 100;
    memory.timerBarElement.style.width = `${percentage * .1}%`; // x .1 pour convertir les 10emes de s en s
  },

  // Afficher le compteur de temps dans l'ui
  displayTimer: () => {
    memory.timerDisplayElement.textContent = `${Math.floor(memory.currentTime * .1)}s`;
  },

  // Afficher le message de victoire personnalisé
  displayVictoryMessage: () => {
    // Indiquer au joueur victorieux ses statistiques
    memory.victoryMessageElement.textContent = `${memory.currentScore} paires trouvées en ${Math.floor(memory.currentTime * 0.1)} secondes`;
  },

  // Afficher le contenu du Hall of Fame avec la data
  displayHallOfFamePlayers: () => {
    // Tri du tableau Hall of Fame par score croissant
    memory.hallOfFame.sort((p1, p2) => p1.playerScore - p2.playerScore );
    // Vider la zone du dom 
    memory.HallOfFameListElement.innerHTML = '';
    // Itérer sur les 9 premiers joueurs de la liste
    memory.hallOfFame.slice(0,9).forEach((player, index) => {
      const rank = index + 1; // l'index commence à zéro, on lui ajoute 1
      const { player_score, player_name } = player; // astuce d'écriture : déstructurer l'objet
      // on construit l'élément
      const playerItemElement = document.createElement('li');
      const playerItemContent = `
          <div class="player">
            <span class="player-rank">${rank}</span>
            <span class="player-name">${player_name}</span>
            <span class="player-score">${player_score}s</span>
          </div>
      `;
      // Insèrer le contenu dans l'élément
      playerItemElement.innerHTML = playerItemContent;
      // Injecter l'élément dans le dom
      memory.HallOfFameListElement.appendChild(playerItemElement);
    });
  },

  // Lorsque le joueur soumets son score
  handleSubmitScoreForm: () => {
    // le formulaire est soumis
    document.querySelector('.player-score-form').addEventListener('submit', (e) => {
      // Si le jeu n'est pas en state de victoire on bloque
      if (memory.gameState !== 4) return;
      // Empecher le rechargement de page par défaut
      e.preventDefault();
      // Collecter les infos pour construire l'objet 'player'
      const playerName = memory.sanitizeInput(e.target.playerName.value); // la methode sanitizeInput nettoie les balises problématiques
      const playerScore = Math.floor(memory.currentTime * .1);
      // Dans cet objet, clés et valeurs ont le meme nom, on peut réduire le code avec un peu de sucre syntaxique 
      const player = { 
        playerName,
        playerScore
      };
      memory.hallOfFame.push(player);
      // Rafraichissement de l'affichage
      memory.displayHallOfFamePlayers();
      // Réinitalisation du jeu
      memory.resetGame();
      // Retour à l'accueil
      memory.setGameState(1);
    })
  },

  // Fermer le panneau game over, retour à l'accueil
  handleCloseGameOver: () => {
    // au clic sur la X de fermeture
    document.querySelector('.game-over .btn').addEventListener('click', () => {
      // Réinitalisation du jeu
      memory.resetGame();
      // Retour à l'accueil
      memory.setGameState(1);
    })
  },

  // Changer l'état du jeu
  setGameState: (state) => {
    // l'état du jeu permet de limiter les actions possibles et gérer l'affichage
    memory.gameState = state;
    memory.gameElement.dataset.gameState = memory.gameState;
  },

  // Time engine : gestion du chrono et des events basés sur le temps 
  gameTimeEngine: () => {
    // le moteur tourne en permanence
    const gameTimer = setInterval(() => {
      // actions qui sont executées seulement si le jeu est actif
      if (memory.isGameActive) {
        // on incrémente le timer de 1/10 de s
        memory.currentTime++;
        // on appelle les fonctions qui sont dépendantes du timer
        memory.displayTimer();
        memory.displayTimeBarProgress();
        memory.isGameOver();        
      }
    }, 100);
  },

  // Le jeu est il fini ?
  isGameOver: () => {
    // il existe 2 conditions de fin de jeu

    // VICTOIRE 😁
    // si toutes les paires ont été trouvées : score = paires distribuées
    if (memory.currentScore >= memory.numberOfCardPairs ) {
      memory.setGameState(4);
      memory.displayVictoryMessage();
      memory.isGameActive = false;
      memory.areCardsClickable = false;
    }
    
    // ECHEC 😭
    // si le temps alloué est écoulé : temps actuel >= limite de temps
    if (memory.currentTime * .1 >= memory.timeLimit ) {
      memory.setGameState(3);
      memory.isGameActive = false;
      memory.areCardsClickable = false;
      memory.flipCards(document.querySelectorAll('.card-outer'), true);
    }
  },

  // Attacher l'évenement Nouvelle partie
  handleNewGame: () => {
    document.querySelector('.new-game-btn').addEventListener('click', () => memory.newGame());
  },

  // Nouvelle partie
  newGame: () => {
    // nouvelle partie, on réinitialise les propriétés
    memory.resetGame();
    // passage à la vue du jeu
    memory.setGameState(2);
    // et on reditribue !
    memory.dealCards();
    memory.areCardsClickable = true;
    memory.isGameActive = true;
  },

  // Réinitialiser le jeu
  resetGame: () => {
    // réinitilisation des propriétés
    memory.currentPair = [];
    memory.areCardsClickable = false;
    memory.isGameActive = false;
    memory.currentScore = 0;
    memory.currentTime = 0;
    // on vide la zone de jeu
    memory.cardsGridElement.innerHTML = '';
    // on reset les affichages
    memory.displayScore();
    memory.displayTimer();
    memory.displayTimeBarProgress();
  },

  // ------------
  // méthodes API
  // ------------
  fetchAllScore: async () => {
    try {
      const response = await fetch(`${memory.apiBaseUrl}/score`);
      const scores = await response.json();
      console.log(scores);
      memory.hallOfFame = scores;    
      memory.displayHallOfFamePlayers();
  } catch (error) {
      console.error(error);
  }
  },

  // ------------
  // utilitaires
  // ------------
  // Mélanger un array
  shuffleArray: (array) => {
    // Implémentation de l'algorithme Fisher-Yates
    // https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
  },

  // Nettoyage des saisies
  sanitizeInput: (input) => {
    // on return la chaine débarrassée des tags problématiques '<>' et des espaces de début et fin de chaine
    return input.replace( /(<([^>]+)>)/ig, '').trim();
  },

};

memory.init();