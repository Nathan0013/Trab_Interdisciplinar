// Primeiro, vamos adicionar o gerenciador de ranking no início do arquivo
const STORAGE_KEY = 'biomas_ranking_data';

// Gerenciador de ranking
const rankingManager = {
  getPlayerScores() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
      geral: [],
      forca: [],
      memoria: [],
      quiz: []
    };
  },
  
  savePlayerScores(scores) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
  },
  
  updatePlayerScore(playerName, gameType, score, gameData = {}) {
    const allScores = this.getPlayerScores();
    
    // Atualizar o ranking específico do jogo
    this.updateGameRanking(allScores[gameType], playerName, score, gameData);
    
    // Atualizar o ranking geral
    const totalScore = this.calculateTotalScore(allScores, playerName);
    this.updateGameRanking(allScores.geral, playerName, totalScore, null, true);
    
    this.savePlayerScores(allScores);
    return score;
  },
  
  updateGameRanking(rankingList, playerName, score, gameData, isGeral = false) {
    // Procurar jogador existente
    const playerIndex = rankingList.findIndex(p => p.name === playerName);
    
    if (playerIndex >= 0) {
      // Atualizar score apenas se for maior que o atual
      if (score > rankingList[playerIndex].score) {
        rankingList[playerIndex].score = score;
        
        // Atualizar dados específicos de jogo para ranking não-geral
        if (!isGeral && gameData) {
          rankingList[playerIndex].gameData = gameData;
        }
      }
    } else {
      // Adicionar novo jogador
      const newPlayer = { 
        name: playerName, 
        score: score
      };
      
      // Adicionar dados específicos de jogo para ranking não-geral
      if (!isGeral && gameData) {
        newPlayer.gameData = gameData;
      }
      
      rankingList.push(newPlayer);
    }
    
    // Ordenar ranking por pontuação (maior para menor)
    rankingList.sort((a, b) => b.score - a.score);
  },
  
  calculateTotalScore(allScores, playerName) {
    // Soma as pontuações de todos os jogos
    let total = 0;
    
    ['forca', 'memoria', 'quiz'].forEach(gameType => {
      const player = allScores[gameType].find(p => p.name === playerName);
      if (player) {
        total += player.score;
      }
    });
    
    return total;
  }
};

// O restante do seu código original fica aqui
import getWord from "./words.js";

const contentBtns = document.querySelector(".btns");
const contentGuessWord = document.querySelector(".guess-word");
const img = document.querySelector("img");
const contentClue = document.querySelector(".clue");
const btnNew = document.querySelector(".new");
btnNew.onclick = () => init();
let indexImg;
let currentWord;

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
  currentWord = word; // Salvar a palavra atual para uso posterior
  
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
    setTimeout(() => {
      alert("Perdeu :/");
      init();
    }, 100);
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
    handleForcaWin();
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

function handleForcaWin() {
  const playerName = localStorage.getItem('jogador') || 'Anonymous';
  const wordLength = currentWord.length;
  const errors = indexImg - 1;
  const score = calculateForcaScore(errors, wordLength);
  
  // Salvar no ranking
  rankingManager.updatePlayerScore(playerName, 'forca', score, {
    attempts: errors, // quantos erros o jogador cometeu
    word: currentWord, // qual palavra foi adivinhada
    wordLength: wordLength // tamanho da palavra (para referência)
  });
  
  setTimeout(() => {
    alert(`Parabéns! Você ganhou! Pontuação: ${score}`);
    init();
  }, 100);
}

const homeButton = document.querySelector('.home-button');
homeButton.addEventListener('click', (event) => {
    const confirmExit = confirm('Tem certeza que deseja voltar ao menu?');
    if (!confirmExit) {
        event.preventDefault(); // Cancela o redirecionamento se o jogador cancelar
    }
});

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