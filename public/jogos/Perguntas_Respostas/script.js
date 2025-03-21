const questao = document.querySelector("#questao h1");
const respostas = document.querySelector(".alternativas");
const pontuacao = document.querySelector("#pontuacao");
const container = document.querySelector(".container");

let pontos = 0;
let questaoAtual = 0;

//array para as perguntas
const questoes = [
  {
      questaoConst: "1) Qual é o maior bioma do Brasil em extensão territorial?",
      answers: [
        { option: "A) Mata Atlântica", correct: false },
        { option: "B) Cerrado", correct: false },
        { option: "C) Amazônia", correct: true },
        { option: "D) Pantanal", correct: false },
      ],
  },

  {
      questaoConst: "2) Qual bioma brasileiro é conhecido por sua vegetação densa e grande biodiversidade?",
      answers: [
        { option: "A) Pampa", correct: false },
        { option: "B) Pantanal", correct: false },
        { option: "C) Mata Atlântica", correct: true },
        { option: "D) Caatinga", correct: false },
      ],
  },

  {
      questaoConst: "3) Qual bioma é caracterizado por um clima seco e vegetação espinhosa?",
      answers: [
        { option: "A) Pantanal", correct: false },
        { option: "B) Amazônia", correct: false },
        { option: "C) Cerrado", correct: false },
        { option: "D) Caatinga", correct: true },
      ],
  },

  {
      questaoConst: "4) Qual bioma brasileiro sofre maior desmatamento devido à agropecuária?",
      answers: [
        { option: "A) Pantanal", correct: false },
        { option: "B) Amazônia", correct: true },
        { option: "C) Pampa", correct: false },
        { option: "D) Mata Atlântica", correct: false },
      ],
  },

  {
      questaoConst: "5) O que caracteriza o Pantanal?",
      answers: [
        { option: "A) Grandes altitudes", correct: false },
        { option: "B) Florestas tropicais", correct: false },
        { option: "C) Inundações periódicas", correct: true },
        { option: "D) Clima seco", correct: false },
      ],
  },

  {
     questaoConst: "6) Qual bioma é conhecido como a 'savana brasileira'?",
     answers: [
       { option: "A) Cerrado", correct: true },
       { option: "B) Amazônia", correct: false },
       { option: "C) Pampa", correct: false },
       { option: "D) Caatinga", correct: false },
    ],
  },

  {
    questaoConst: "7) Qual animal é um símbolo da Amazônia?",
    answers: [
        { option: "A) Lobo-guará", correct: false },
        { option: "B) Arara-azul", correct: false },
        { option: "C) Onça-pintada", correct: true },
        { option: "D) Tamanduá-bandeira", correct: false },
    ],
  },

  {
    questaoConst: "8) Qual bioma é encontrado no sul do Brasil e possui vegetação de gramíneas?",
    answers: [
        { option: "A) Pampa", correct: true },
        { option: "B) Cerrado", correct: false },
        { option: "C) Pantanal", correct: false },
        { option: "D) Mata Atlântica", correct: false },
    ],
  },

  {
    questaoConst: "9) Qual bioma é o lar de espécies como o lobo-guará e o tamanduá-bandeira?",
    answers: [
        { option: "A) Pampa", correct: false },
        { option: "B) Cerrado", correct: true },
        { option: "C) Amazônia", correct: false },
        { option: "D) Pantanal", correct: false },
    ],
  },

  {
    questaoConst: "10) Qual bioma brasileiro possui o maior número de rios e lagos?",
    answers: [
        { option: "A) Caatinga", correct: false },
        { option: "B) Amazônia", correct: false },
        { option: "C) Pantanal", correct: true },
        { option: "D) Pampa", correct: false },
    ],
  },
];

function carregaQuestao(){
    questao.textContent = questoes[questaoAtual].questaoConst;
    respostas.innerHTML = ""; //limpar
    
    questoes[questaoAtual].answers.forEach((resposta) => {
      const botao = document.createElement("button");
      botao.textContent = resposta.option;
      botao.addEventListener("click", () => verificaResposta(resposta.correct));
      respostas.appendChild(botao);
    });
}

function verificaResposta(certa) {
    if (certa) {
      pontos ++;
      pontuacao.textContent = `Pontuação: ${pontos}`; 
    }
    if (questaoAtual < questoes.length - 1) {
      questaoAtual++;
      carregaQuestao();
    }
    else {
      const score = calculateQuizScore(pontos, questoes.length);
      const playerName = localStorage.getItem('jogador') || 'Anonymous';
      
      rankingManager.updatePlayerScore(playerName, 'quiz', score, {
        correct: pontos,
        total: questoes.length,
        time: 0 // Placeholder se necessário
      });
      
      // Usar a função showGameEnd para mostrar o overlay de fim de jogo
      // igual ao jogo da memória
      if (typeof showGameEnd === 'function') {
        showGameEnd(score, 'quiz');
      } else {
        // Fallback caso a função não esteja disponível
        alert(`Parabéns ${playerName}! Você acertou ${pontos} de ${questoes.length} questões e fez ${score} pontos!`);
      }
    }
}

const homeButton = document.querySelector('.home-button');
homeButton.addEventListener('click', (event) => {
    const confirmExit = confirm('Tem certeza que deseja voltar ao menu?');
    if (!confirmExit) {
        event.preventDefault(); // Cancela o redirecionamento se o jogador cancelar
    }
});

function calculateQuizScore(correct, total) {
  // 20 pontos para cada resposta correta
  return correct * 20;
}

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

// Função para reiniciar o quiz
function restartCurrentGame() {
  // Reiniciar variáveis
  questaoAtual = 0;
  pontos = 0;
  pontuacao.textContent = `Pontuação: ${pontos}`;
  
  // Esconder o overlay de fim de jogo
  if (typeof gameEndOverlay !== 'undefined' && gameEndOverlay.hide) {
    gameEndOverlay.hide();
  }
  
  // Carregar a primeira questão
  carregaQuestao();
}

// Iniciar o quiz
document.addEventListener('DOMContentLoaded', function() {
  carregaQuestao();
});