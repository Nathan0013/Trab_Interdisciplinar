const grid = document.querySelector('.grid');
const spanPlayer = document.querySelector('.player')
const timer = document.querySelector('.timer')
let movimentos = 0;

const personagens = [
    'amazonia.jpg',
    'cerrado.jpg',
    'pampas.jpg',
    'pantanal.jpg',
];

const createElement = (tag, className) => {
    const element = document.createElement(tag);
    element.className = className;
    return element;
};

let firstCard = '';
let secondCard = '';

const checkEndGame = () => {
    const disabledCards = document.querySelectorAll('.desabilitar-carta');

    if (disabledCards.length === 8) { 
        clearInterval(this.loop)
        setTimeout(() => {
        alert(`Parabéns!!! <<< ${spanPlayer.innerHTML} >>> Você Conseguiu!`);
    },500)
}
};

const checkCards = () => {
    movimentos++;
    
    document.querySelector('.movimentos').innerHTML = `Movimentos: ${movimentos}`;

    const firstCharacter = firstCard.getAttribute('data-character');
    const secondCharacter = secondCard.getAttribute('data-character');

    if (firstCharacter === secondCharacter) {
        firstCard.firstChild.classList.add('desabilitar-carta');
        secondCard.firstChild.classList.add('desabilitar-carta');

        firstCard = '';
        secondCard = '';

        checkEndGame(); // Verifica o fim do jogo
    } else {
        setTimeout(() => {
            firstCard.classList.remove('reveal-card');
            secondCard.classList.remove('reveal-card');

            firstCard = '';
            secondCard = '';
        }, 500);
    }
};

const revealCard = ({ target }) => {
    if (target.parentNode.className.includes('reveal-card')) {
        return;
    }

    if (firstCard === '') {
        target.parentNode.classList.add('reveal-card');
        firstCard = target.parentNode;
    } else if (secondCard === '') {
        target.parentNode.classList.add('reveal-card');
        secondCard = target.parentNode;

        checkCards();
    }
};

const createCard = (personagem) => {
    const card = createElement('div', 'card');
    const front = createElement('div', 'face front');
    const back = createElement('div', 'face back');

    front.style.backgroundImage = `url('../img/${personagem}')`;

    card.appendChild(front);
    card.appendChild(back);

    card.addEventListener('click', revealCard);
    card.setAttribute('data-character', personagem);

    return card;
};

const loadGame = () => {
    const duplicapersonagens = [...personagens, ...personagens];
    const embaralha = duplicapersonagens.sort(() => Math.random() - 0.5);

    embaralha.forEach((personagem) => {
        const card = createCard(personagem);
        grid.appendChild(card);
    });
};

const startTimer = () =>{
    this.loop = setInterval(() => {
        const currentTime = +timer.innerHTML
        timer.innerHTML = currentTime + 1;
    },1000)
}
window.onload = () =>{
    const playerName = localStorage.getItem('jogador')
    spanPlayer.innerHTML = playerName
    startTimer();

    loadGame();
}



