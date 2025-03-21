
// Remova a linha import getWord from "./words.js"; e adicione a função getWord diretamente no arquivo
// ou mantenha a linha abaixo se estiver usando módulos
import getWord from "./words.js";

const contentBtns = document.querySelector(".btns");
const contentGuessWord = document.querySelector(".guess-word");
const img = document.querySelector("img");
const contentClue = document.querySelector(".clue");
const btnNew = document.querySelector(".new");
btnNew.onclick = () => init();
let indexImg;

init();

function init() {
  indexImg = 1;
  img.src = `img/img1.png`;

  generateGuessSection();
  generateButtons();
}

function generateGuessSection() {
  contentGuessWord.textContent = "";

  const { word, clue } = getWord();
  const wordWithoutAccent = word
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  Array.from(wordWithoutAccent).forEach((letter) => {
    const span = document.createElement("span");

    span.textContent = "_";
    span.setAttribute("word", letter.toUpperCase());
    contentGuessWord.appendChild(span);
  });

  contentClue.textContent = `Dica: ${clue}`;
}

function wrongAnswer() {
  indexImg++;
  img.src = `img/img${indexImg}.png`;

  if (indexImg === 7) {
    // Em vez de usar alert, vamos usar o overlay de fim de jogo
    const playerName = localStorage.getItem('jogador') || 'Anonymous';
    const wordLength = document.querySelectorAll('.guess-word span').length;
    const score = 0; // Pontuação zero para derrota
    
    // Atualizar ranking
    rankingManager.updatePlayerScore(playerName, 'forca', score, {
      wordLength: wordLength,
      errors: 6,
      remainingAttempts: 0,
      outcome: 'defeat'
    });
    
    // Mostrar overlay com mensagem de derrota
    if (typeof showGameEnd === 'function') {
      // O terceiro parâmetro true indica que é uma derrota
      showGameEnd(score, 'forca', true);
    } else {
      alert("Você perdeu!");
      setTimeout(() => {
        init();
      }, 100);
    }
  }
}

function verifyLetter(letter) {
  const arr = document.querySelectorAll(`[word="${letter}"]`);

  if (!arr.length) wrongAnswer();

  arr.forEach((e) => {
    e.textContent = letter;
  });

  const spans = document.querySelectorAll(`.guess-word span`);
  const won = !Array.from(spans).find((span) => span.textContent === "_");

  if (won) {
    // Chamar a função de vitória modificada
    handleForcaWin();
  }
}

function handleForcaWin() {
  const playerName = localStorage.getItem('jogador') || 'Anonymous';
  const wordLength = document.querySelectorAll('.guess-word span').length;
  const errors = indexImg - 1;
  const score = calculateForcaScore(errors, wordLength);
  
  // Atualizar a pontuação do jogador
  rankingManager.updatePlayerScore(playerName, 'forca', score, {
    wordLength: wordLength,
    errors: errors,
    remainingAttempts: 6 - errors,
    outcome: 'victory'
  });
  
  // Mostrar o overlay de fim de jogo
  if (typeof showGameEnd === 'function') {
    showGameEnd(score, 'forca');
  } else {
    alert(`Parabéns ${playerName}! Você ganhou com ${score} pontos!`);
    setTimeout(() => {
      init();
    }, 100);
  }
}

function generateButtons() {
  contentBtns.textContent = "";

  for (let i = 97; i < 123; i++) {
    const btn = document.createElement("button");
    const letter = String.fromCharCode(i).toUpperCase();
    btn.textContent = letter;

    btn.onclick = () => {
      btn.disabled = true;
      btn.style.backgroundColor = "gray";
      verifyLetter(letter);
    };

    contentBtns.appendChild(btn);
  }
}

function calculateForcaScore(errors, wordLength) {
  // Pontuação base: 100 pontos
  // Subtrai 10 pontos para cada erro
  // Adiciona um bônus com base no tamanho da palavra
  const baseScore = 100;
  const errorPenalty = errors * 10;
  const lengthBonus = wordLength * 5;
  
  return Math.max(0, baseScore - errorPenalty + lengthBonus);
}

// Função para reiniciar o jogo (chamada pelo overlay de fim de jogo)
function restartCurrentGame() {
  init();
}

// Adicionar confirmação ao botão de voltar
const homeButton = document.querySelector('.home-button');
homeButton.addEventListener('click', (event) => {
    const confirmExit = confirm('Tem certeza que deseja voltar ao menu?');
    if (!confirmExit) {
        event.preventDefault(); // Cancela o redirecionamento se o jogador cancelar
    }
});

// Sistema de ranking para integrar com o overlay de fim de jogo
const rankingManager = {
  updatePlayerScore: function(playerName, game, score, gameData = {}) {
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
      }
    } else {
      rankingData[game].push({ name: playerName, score, gameData });
    }

    rankingData[game].sort((a, b) => b.score - a.score);
    this.updateGeneralRanking(rankingData, playerName);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rankingData));

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
    } else {
      rankingData.geral.push({ name: playerName, score: totalScore, gameData });
    }

    rankingData.geral.sort((a, b) => b.score - a.score);
  }
};

// Torna a função restartCurrentGame disponível globalmente para ser chamada pelo overlay
window.restartCurrentGame = restartCurrentGame;
