console.log('❤ Memory');

const memory = {
  // ------------
  // Propriétés
  // ------------

  // Propriétés générales
  gameState: 1,            // le jeu possède 4 états (hall-of-fame 1/game 2/time-out 3/victory 4)
  currentPair: [],         // tableau qui contient les 2 cartes en cours d'affichage
  areCardsClickable: true, // l'event de click est il disponible
  isGameActive: true,      // le jeu est il en cours
  currentScore: 0,         // nombre de paires découvertes
  currentTime: 0,          // chrono en cours en 10e de secondes
  hallOfFame: [],          // le tableau des milleurs scores
  apiBaseUrl: "xxx",       // url à requeter pour la gestion des scores

  // Parametres de jeu
  timeLimit: 15,           // temps alloué pour jouer en secondes
  cardDisplayTime: 1,      // temps d'affichage d'une paire de carte retournée en secondes
  numberOfCardPairs: 2,    // nombre de paires de cartes (max 18 en l'état)

  // Elements du dom (les éléments auquels on a besoin d'acceder régulièrement)
  gameElement: document.querySelector('.game'), // la zone globale, qui change de state
  cardsGridElement: document.querySelector('.cards'), // la zone où l'on distribue les cartes
  scoreDisplayElement: document.querySelector('.score .ui-element-content'), // le texte du score
  timerDisplayElement: document.querySelector('.timer .ui-element-content'), // le texte du temps
  timerBarElement: document.querySelector('.timer-bar .bar'), // la barre de temps
  victoryMessageElement: document.querySelector('.victory .message'), // la barre de temps

  // Méthode d'initialisation de l'app
  init: () => {
    memory.gameTimeEngine();
    memory.handleNewGame();
    memory.handleCloseGameOver();
    memory.displayScore();
    memory.dealCards();
    console.log('Jeu Chargé');
  },

  // ------------
  // Méthodes
  // ------------

  // créer le tableau d'id de cartes, et le retourner mélangé
  createArrayOfCards: () => {
    const arrayOfCards = [];
    // pour chaque paire de cartes
    for (let i = 1; i <= memory.numberOfCardPairs; i++) {
      // on ajoute 2x l'id dans le tableau
      arrayOfCards.push(i, i); // par ex. pour 4 paires => [1, 1, 2, 2, 3, 3, 4, 4]
    }
    // puis on mélange le tableau
    memory.shuffleArray(arrayOfCards);
    return arrayOfCards;
  },

  // distribuer les cartes
  dealCards: () => {
    // autant de fois que le double de 'numberOfCardPairs'
    // créer et injecter une carte dans le dom
    const pairsOfCards = memory.createArrayOfCards();
    console.log(pairsOfCards);
    pairsOfCards.forEach((cardId, index) => {
      memory.createCardElement(cardId, index);
    });

  },

  // créer une carte
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

  // evenement click sur une carte
  handleCardClick: (e) => {
    memory.onCardClick(e.target.closest(".card-outer"));
  },

  // au clic sur une carte
  onCardClick: (card) => {
    if (memory.areCardsClickable) {
      memory.flipCards([card], true);
      memory.addToCurrentPair(card);
    }
  },

  // logique de stockage de la paire en cours
  addToCurrentPair: (card) => {
    // si la première carte est recliquée, on ignore
    if (memory.currentPair.length === 1 && memory.currentPair[0] === card) {
      console.error('carte déja cliquée...');
      // le return ici termine la fonction
      return;
    }
    // on ajoute la carte au comparateur 
    memory.currentPair.push(card);
    //console.log(memory.currentPair);

    // si le comparateur contient 2 cartes 
    if (memory.currentPair.length === 2) {
      // on vérifie si c'est une paire
      console.log('2 cartes affichées, on check si c\'est une paire');
      memory.checkIfGoodPair();
    }
  },

  // vérifier si la paire visible est valide (2 id identiques)
  checkIfGoodPair: () => {
    // une paire est affichée, on désactive le click sur les cartes
    memory.areCardsClickable = false;
    // si les cartes du comparateur ont le meme id
    if (memory.currentPair[0].dataset.id === memory.currentPair[1].dataset.id) {
      console.log('Yes ! C\'est une paire !');
      // pour chaque carte du comparateur
      memory.currentPair.forEach(card => {
        // on retire l'event de click
        card.removeEventListener('click', memory.handleCardClick);
        // on ajoute la class css 'discovered'
        card.classList.add('discovered');
      });
      // on ajoute un point au score
      memory.scoreUp();
      // puis on vide le comparateur
      memory.resetCurrentPair();
      // et on réactive le click sur les cartes
      memory.areCardsClickable = true;
    } else {
      // si ce n'est pas une paire, on les cache à la fin du délai
      console.log('C\'est pas une paire...');
      memory.displayCardTimeOut();
    }
  },

  // cacher les cartes au bout du délai
  displayCardTimeOut: () => {
    const displayTime = memory.cardDisplayTime * 1000;
    const displayTimer = setTimeout(() => {
      console.log('On les cache');
      memory.flipCards(memory.currentPair, false);
      memory.resetCurrentPair();
      memory.areCardsClickable = true;
      clearTimeout(displayTimer);
    }, displayTime);
  },

  /**
   * retourner (montrer ou cacher) des cartes 
   * @param {array} cardsArray est un tableau de cartes à retourner (flip)
   * @param {boolean} visible est un boolean pour indiquer le sens final du retournement, true : affiché, false : caché
   */
  flipCards: (cardsArray, visible) => {
      cardsArray.forEach(card => {
        if (visible) card.classList.add('visible');
        else card.classList.remove('visible');
      });
  },

  // vider le comparateur de carte
  resetCurrentPair: () => {
    memory.currentPair = [];
  },

  // ajouter 1 point au score
  scoreUp: () => {
    memory.currentScore ++;
    memory.displayScore();
    memory.isGameOver();
  },

  // afficher le score dans l'ui
  displayScore: () => {
    const score = `${memory.currentScore}/${memory.numberOfCardPairs}`
    memory.scoreDisplayElement.textContent = score;
  },

  // animer la barre de progression du temps dans l'ui
  displayTimeBarProgress: () => {
    let percentage = memory.currentTime / memory.timeLimit * 10;
    memory.timerBarElement.style.width = `${percentage}%`;
  },

  // afficher le compteur de temps dans l'ui
  displayTimer: () => {
    memory.timerDisplayElement.textContent = `${Math.floor(memory.currentTime * 0.1)}s`;
  },

  // afficher le message de victoire personnalisé
  displayVictoryMessage: () => {
    memory.victoryMessageElement.textContent = `${memory.currentScore} paires trouvées en ${Math.floor(memory.currentTime * 0.1)} secondes`;
  },

  // fermer le panneau game over, retour à l'accueil
  handleCloseGameOver: () => {
    document.querySelector('.game-over .btn').addEventListener('click', () => {
      memory.resetGame();
      memory.setGameState(1);
    })
  },

  // changer l'état du jeu
  setGameState: (state) => {
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

  // le jeu est il fini ?
  isGameOver: () => {
    // il existe 2 conditions de fin de jeu

    // VICTOIRE
    // si toutes les paires ont été trouvées : score = paires distribuées
    if (memory.currentScore >= memory.numberOfCardPairs ) {
      memory.setGameState(4);
      memory.displayVictoryMessage();
      memory.isGameActive = false;
      memory.areCardsClickable = false;
    }
    
    // ECHEC
    // si le temps alloué est écoulé : temps actuel >= limite de temps
    if (memory.currentTime * 0.1 >= memory.timeLimit ) {
      memory.setGameState(3);
      memory.isGameActive = false;
      memory.areCardsClickable = false;
      memory.flipCards(document.querySelectorAll('.card-outer'), true);
    }
  },

  handleNewGame: () => {
    document.querySelector('.new-game-btn').addEventListener('click', () => memory.newGame());
  },

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

  resetGame: () => {
    // réinitilisation des propriétés
    memory.currentPair = [];
    memory.areCardsClickable = false;
    memory.isGameActive = false;
    memory.currentScore = 0;
    memory.currentTime = 0;
    memory.hallOfFame = [];
    // on vide la zone de jeu
    memory.cardsGridElement.innerHTML = '';
    // on reset les affchages
    memory.displayScore();
    memory.displayTimer();
    memory.displayTimeBarProgress();
  },


  // utilitaires
  // mélanger un array
  shuffleArray: (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
  },

};

memory.init();