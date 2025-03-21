const grid = document.querySelector('.grid');
const spanPlayer = document.querySelector('.player');
const timer = document.querySelector('.timer');
let moves = 0; // Corrigido de 'movimentos' para 'moves' para manter consistência

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

// Implementação do gerenciador de ranking
const rankingManager = {
    updatePlayerScore: async function(playerName, game, score, gameData = {}) {
      // Se o script ranking.js estiver carregado, usar a implementação de lá
      if (window.rankingManager && window.rankingManager !== this) {
        return window.rankingManager.updatePlayerScore(playerName, game, score, gameData);
      }
      
      // Implementação fallback caso ranking.js não esteja carregado
      const STORAGE_KEY = 'biomas_ranking_data';
      let rankingData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
        geral: [],
        forca: [],
        memoria: [],
        quiz: []
      };
  
      let playerIndex = rankingData[game].findIndex(p => p.name === playerName);
      if (playerIndex !== -1) {
        if (score > rankingData[game][playerIndex].score) {
          rankingData[game][playerIndex].score = score;
          rankingData[game][playerIndex].gameData = gameData;
          rankingData[game][playerIndex].date = new Date().toISOString();
        }
      } else {
        rankingData[game].push({ 
          name: playerName, 
          score, 
          gameData, 
          date: new Date().toISOString()
        });
      }
  
      rankingData[game].sort((a, b) => b.score - a.score);
      this.updateGeneralRanking(rankingData, playerName);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rankingData));
  
      // Tentar salvar no servidor se o token estiver disponível
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch('http://localhost:3000/save-score', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              game,
              score,
              gameSpecificData: gameData
            }),
          });
          await response.json();
        } catch (error) {
          console.error('Erro ao salvar no servidor:', error);
        }
      }
  
      return score;
    },
  
    updateGeneralRanking: function(rankingData, playerName) {
      const games = ['forca', 'memoria', 'quiz'];
      let totalScore = 0;
      let gameData = {};
  
      games.forEach(game => {
        const playerInGame = rankingData[game].find(p => p.name === playerName);
        if (playerInGame) {
          totalScore += playerInGame.score;
          gameData[game] = playerInGame.gameData;
        }
      });
  
      let playerIndex = rankingData.geral.findIndex(p => p.name === playerName);
      if (playerIndex !== -1) {
        rankingData.geral[playerIndex].score = totalScore;
        rankingData.geral[playerIndex].gameData = gameData;
        rankingData.geral[playerIndex].date = new Date().toISOString();
      } else {
        rankingData.geral.push({ 
          name: playerName, 
          score: totalScore, 
          gameData,
          date: new Date().toISOString()
        });
      }
  
      rankingData.geral.sort((a, b) => b.score - a.score);
    }
  };
  
  // Torna o rankingManager disponível globalmente
  window.rankingManager = rankingManager;

function checkEndGame() {
    const disabledCards = document.querySelectorAll('.desabilitar-carta'); // Corrigido para usar a classe correta
    const totalPairs = personagens.length;
    
    if (disabledCards.length === totalPairs * 2) { // Verificar se todas as cartas estão desabilitadas
        clearInterval(this.loop);
        
        // Calcular pontuação
        const time = +timer.innerHTML;
        const score = calculateMemoryScore(moves, time);
        
        // Atualizar a pontuação do jogador
        const playerName = localStorage.getItem('jogador') || 'Anonymous';
        rankingManager.updatePlayerScore(playerName, 'memoria', score, { moves, time });
        
        // Mostrar o overlay de fim de jogo
        if (typeof showGameEnd === 'function') {
            showGameEnd(score, 'memoria');
        } else {
            alert(`Parabéns ${playerName}! Você completou o jogo com ${score} pontos em ${time} segundos e ${moves} movimentos.`);
        }
    }
}

const checkCards = () => {
    moves++; // Incrementa o contador de movimentos
    document.querySelector('.movimentos').innerHTML = `Movimentos: ${moves}`;

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

function calculateMemoryScore(moves, time) {
    const baseScore = 1000;
    const movesPenalty = moves * 10;
    const timePenalty = time * 5;
    
    return Math.max(10, Math.floor(baseScore - movesPenalty - timePenalty));
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

    // Reinicia o timer
    timer.innerHTML = '00';
    
    // Limpa qualquer intervalo existente
    if (this.loop) {
        clearInterval(this.loop);
    }

    this.loop = setInterval(() => {
        const currentTime = +timer.innerHTML;
        timer.innerHTML = currentTime + 1;
    }, 1000);
};

window.onload = () => {
    const playerName = localStorage.getItem('jogador');
    if (spanPlayer) {
        spanPlayer.innerHTML = playerName || 'Jogador';
    }
    startTimer();
    loadGame();
};

function restartCurrentGame() {
    // Reiniciar variáveis
    moves = 0;
    document.querySelector('.movimentos').textContent = `Movimentos: ${moves}`;
    timer.innerHTML = '00';
    firstCard = '';
    secondCard = '';
    
    // Limpar o tabuleiro e criar novamente
    grid.innerHTML = '';
    
    // Reiniciar o timer e carregar o jogo novamente
    startTimer();
    loadGame();
}

// Carregar função de fim de jogo se necessário
if (!window.showGameEnd) {
    window.showGameEnd = function(score, gameType) {
        // Fallback simples se o script tela_fim.html não estiver carregado
        const playerName = localStorage.getItem('jogador') || 'Jogador';
        alert(`Parabéns ${playerName}! Você completou o jogo ${gameType} com ${score} pontos!`);
    };
}
