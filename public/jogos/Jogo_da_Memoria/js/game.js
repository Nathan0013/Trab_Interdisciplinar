const grid = document.querySelector('.grid');
const spanPlayer = document.querySelector('.player');
const timer = document.querySelector('.timer');
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

// Função para adicionar uma pontuação ao ranking
function addScore(playerName, gameType, moves, gameData) {
  // Chave para armazenar os dados no localStorage
  const STORAGE_KEY = 'biomas_ranking_data';
  
  // Obter dados existentes do ranking ou criar estrutura inicial
  let rankingData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
    geral: [],
    forca: [],
    memoria: [],
    quiz: []
  };
  
  // Normalizar a pontuação com base no tipo de jogo
  let normalizedScore;
  
  // Para o jogo da memória, calculamos a pontuação com base no tempo e movimentos
  if (gameType === 'memoria') {
    const timeScore = Math.max(0, 100 - (gameData.time / 3));
    const movesScore = Math.max(0, 100 - (gameData.moves * 5));
    normalizedScore = Math.round((timeScore + movesScore) / 2);
  } else {
    // Pontuação padrão para outros jogos (não deve ser usado neste contexto)
    normalizedScore = 100; 
  }
  
  // Buscar o jogador nas listas específicas do jogo e geral
  let gamePlayerIndex = rankingData[gameType].findIndex(p => p.name === playerName);
  let generalPlayerIndex = rankingData.geral.findIndex(p => p.name === playerName);
  
  // Atualizar ou adicionar o jogador no ranking específico do jogo
  if (gamePlayerIndex !== -1) {
    // Atualizar apenas se a nova pontuação for maior
    if (normalizedScore > rankingData[gameType][gamePlayerIndex].score) {
      rankingData[gameType][gamePlayerIndex].score = normalizedScore;
      rankingData[gameType][gamePlayerIndex].gameData = gameData;
    }
  } else {
    // Adicionar novo jogador
    rankingData[gameType].push({
      name: playerName,
      score: normalizedScore,
      gameData: gameData
    });
  }
  
  // Ordenar por pontuação (maior para menor)
  rankingData[gameType].sort((a, b) => b.score - a.score);
  
  // Atualizar ou adicionar o jogador no ranking geral
  let totalScore = 0;
  let playerGameData = {};
  
  // Calcular pontuação total e reunir dados dos jogos
  for (const game of ['forca', 'memoria', 'quiz']) {
    const playerInGame = rankingData[game].find(p => p.name === playerName);
    if (playerInGame) {
      totalScore += playerInGame.score;
      playerGameData[game] = playerInGame.gameData;
    }
  }
  
  if (generalPlayerIndex !== -1) {
    rankingData.geral[generalPlayerIndex].score = totalScore;
    rankingData.geral[generalPlayerIndex].gameData = playerGameData;
  } else {
    rankingData.geral.push({
      name: playerName,
      score: totalScore,
      gameData: playerGameData
    });
  }
  
  // Ordenar o ranking geral
  rankingData.geral.sort((a, b) => b.score - a.score);
  
  // Salvar dados atualizados
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rankingData));
  
  // Retornar os dados atualizados
  return { gameRank: gamePlayerIndex + 1, generalRank: generalPlayerIndex + 1, score: normalizedScore };
}

const checkEndGame = () => {
    const disabledCards = document.querySelectorAll('.desabilitar-carta');

    if (disabledCards.length === 8) { 
        clearInterval(this.loop);

        // Coletar dados do jogo
        const tempo = +timer.innerHTML; // Tempo em segundos
        const playerName = spanPlayer.innerHTML;

        // Salvar a pontuação no ranking
        const result = addScore(playerName, 'memoria', movimentos, { moves: movimentos, time: tempo });

        setTimeout(() => {
            alert(`Parabéns!!! <<< ${spanPlayer.innerHTML} >>> Você Conseguiu!\nPontuação: ${result.score} pontos`);
        }, 500);
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

const homeButton = document.querySelector('.home-button');
if (homeButton) {
    homeButton.addEventListener('click', (event) => {
        const confirmExit = confirm('Tem certeza que deseja voltar ao menu?');
        if (!confirmExit) {
            event.preventDefault(); // Cancela o redirecionamento se o jogador cancelar
        }
    });
}

const loadGame = () => {
    const duplicapersonagens = [...personagens, ...personagens];
    const embaralha = duplicapersonagens.sort(() => Math.random() - 0.5);

    embaralha.forEach((personagem) => {
        const card = createCard(personagem);
        grid.appendChild(card);
    });
};

const startTimer = () => {
    this.loop = setInterval(() => {
        const currentTime = +timer.innerHTML;
        timer.innerHTML = currentTime + 1;
    }, 1000);
};

window.onload = () => {
    const playerName = localStorage.getItem('jogador');
    spanPlayer.innerHTML = playerName;
    startTimer();
    loadGame();
};