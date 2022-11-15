console.log('❤ Memory');

// const cardElements = document.querySelectorAll('.card');
// cardElements.forEach(card => {
//   card.addEventListener('click', (e) => {
//     e.target.closest('.card').classList.toggle('visible');
//   })
// });

const memory = {
  // Propriétés générales
  gameState: 1, // le jeu possède 3 états (hall of fame/jeu/game over)
  apiBaseUrl: "xxx", // url à requeter pour la gestion des scores

  // Parametres de jeu
  timeLimit: 240, // temps alloué pour jouer en secondes
  numberOfCardPairs: 18, // nombre de paires de cartes

  // Elements du dom
  cardsGrid: document.querySelector('.cards'), // la zone qui reçoit les cartes

  // Méthode d'initialisation de l'app
  init: () => {
    memory.dealCards();
    console.log('Jeu Chargé');
  },

  // ------------
  // Méthodes
  // ------------
  dealCards: () => {
    // autant de fois que le double de 'numberOfCardPairs'
    // créer et injecter une carte dans le dom
    const pairsOfCards = memory.createArrayOfCards();
    console.log(pairsOfCards);
    pairsOfCards.forEach(cardId => {
      memory.createCardElement(cardId);
    });

  },

  createCardElement: (cardId) => {
    // créer l'élément
    const cardElement = document.createElement('div');
    // ajouter sa classe css
    cardElement.classList.add('card-outer');
    // définir son contenu (chaine html sans risque ici)
    cardElement.innerHTML = `
      <div class="card" data-card="${cardId}">
          <div class="face front"></div>
          <div class="face back"></div>
      </div>
    `;
    // ajouter l'événement au click
    cardElement.addEventListener('click', () => {
      memory.handleCardClick(cardElement);
    })
    // injecter l'élément dans le dom
    memory.cardsGrid.appendChild(cardElement);
  },

  handleCardClick: (card) => {
    card.querySelector('.card').classList.toggle('visible');
  },


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