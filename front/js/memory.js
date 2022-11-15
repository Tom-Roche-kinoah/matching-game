console.log('❤ Memory');

const cardElements = document.querySelectorAll('.card');
cardElements.forEach(card => {
  card.addEventListener('click', (e) => {
    e.target.closest('.card').classList.toggle('visible');
  })
});