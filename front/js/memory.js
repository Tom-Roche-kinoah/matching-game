console.log('❤ Memory');

const memory = {
  // ------------
  // Propriétés
  // ------------
  // Propriétés générales
  gameState: 1, // le jeu possède 3 états (hall of fame/jeu/game over)
  currentPair: [], // tableau qui contient les 2 cartes en cours d'affichage
  currentScore: 0, // nombre de paires découvertes
  currentTime: 0, // chrono en cours
  hallOfFame: [], // le tableau des milleurs scores
  apiBaseUrl: "xxx", // url à requeter pour la gestion des scores

  // Parametres de jeu
  timeLimit: 240, // temps alloué pour jouer en secondes
  cardDisplayTime: 1, // temps d'affichage d'une paire de carte retournée en secondes
  numberOfCardPairs: 2, // nombre de paires de cartes (max 18 en l'état)

  // Elements du dom
  gameElement: document.querySelector('.game'), // la zone globale, qui change de state
  cardsGridElement: document.querySelector('.cards'), // la zone qui reçoit les cartes
  scoreDisplayElement: document.querySelector('.score .ui-element-content'), // le texte du score
  timerDisplayElement: document.querySelector('.timer .ui-element-content'), // le texte du temps
  timerBarElement: document.querySelector('.timer-bar .bar'), // la barre de temps

  // Méthode d'initialisation de l'app
  init: () => {
    memory.gameTimeOut();
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
    // ajouter son id de pair en data-id
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
    card.classList.add('visible');
    memory.addToCurrentPair(card);
  },

  // logique de stockage de la paire en cours
  addToCurrentPair: (card) => {
    // si la carte est recliquée, on ignore
    if (memory.currentPair.length === 1 && memory.currentPair[0] === card) {
      console.error('carte déja cliquée...');
      return;
    }
    // on ajoute la carte au comparateur 
    memory.currentPair.push(card);
    //console.log(memory.currentPair);

    // si le comparateur contient 2 cartes 
    if (memory.currentPair.length === 2) {
      console.log('2 cartes affichées, on check si c\'est une paire');
      // on vérifie si c'est une paire
      memory.checkIfGoodPair();
    }
  },

  // vérifier si la paire visible est valide (2 id identiques)
  checkIfGoodPair: () => {
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
      memory.currentPair.forEach(card => {
        card.classList.remove('visible');
      });
      memory.resetCurrentPair();
    }, displayTime);
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

  // chrono 
  gameTimeOut: () => {
    const timeLimit = memory.timeLimit * 1000;
    let currentTime = 0;
    let currentSeconds = 0;
    const gameTimer = setInterval(() => {
      currentTime++;
      currentSeconds = Math.floor(currentTime * 0.1);
      memory.timerDisplayElement.textContent = `${currentSeconds}s`;
      memory.timerBarElement.style.width = `${currentTime / memory.timeLimit * 100 * 0.1}%`;
    }, 100);
  },

  isGameOver: () => {
    if (memory.currentScore >= memory.numberOfCardPairs ) {
      memory.gameElement.dataset.gameState = 3;
    }
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