const questao = document.querySelector("#questao h1");
const respostas = document.querySelector(".alternativas");
const pontuacao = document.querySelector("#pontuacao");
const container = document.querySelector(".container");

let pontos = 0;
let questaoAtual = 0;
let tempoInicio = Date.now(); // Adicionar tracking de tempo

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
      const tempoFim = Date.now();
      const tempoTotal = Math.floor((tempoFim - tempoInicio) / 1000); // Tempo em segundos
      const score = calculateQuizScore(pontos, questoes.length);
      const playerName = localStorage.getItem('jogador') || 'Anonymous';
      
      // Salvando estatísticas completas do jogo
      rankingManager.updatePlayerScore(playerName, 'quiz', score, {
        correct: pontos,
        total: questoes.length,
        time: tempoTotal
      });
      
      container.innerHTML = `
        <div class="espaco_pontuacao">
          <h1>Fim de Jogo!</h1>
          <h2>Você acertou ${pontos} de ${questoes.length}</h2>
          <h3>Pontuação: ${score}</h3>
          <h4>Tempo: ${tempoTotal} segundos</h4>
        </div>
        <div class="espaco_pontuacao" style="margin-top: 20px;">
          <a href="../menu_jogos/indice_jogos.html" class="home-button" style="position: static; display: inline-block; margin: 10px;">🏠 Voltar para o Menu</a>
          <a href="resp_perg.html" class="home-button" style="position: static; display: inline-block; margin: 10px;">🔄 Jogar Novamente</a>
        </div>
      `;
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
  updatePlayerScore: function(playerName, game, score, gameData = {}) {
    const STORAGE_KEY = 'biomas_ranking_data';
    let rankingData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
      geral: [],
      forca: [],
      memoria: [],
      quiz: []
    };

    // Encontrar o jogador no ranking específico do jogo
    let playerIndex = rankingData[game].findIndex(p => p.name === playerName);
    
    if (playerIndex !== -1) {
      // Se o jogador existe e a nova pontuação é maior, atualiza
      if (score > rankingData[game][playerIndex].score) {
        rankingData[game][playerIndex].score = score;
        rankingData[game][playerIndex].gameData = gameData;
      }
    } else {
      // Se o jogador não existe no ranking, adiciona
      rankingData[game].push({ 
        name: playerName, 
        score, 
        gameData 
      });
    }

    // Ordena por pontuação
    rankingData[game].sort((a, b) => b.score - a.score);
    
    // Atualiza o ranking geral
    this.updateGeneralRanking(rankingData, playerName);
    
    // Salva no localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rankingData));

    return score;
  },

  updateGeneralRanking: function(rankingData, playerName) {
    const games = ['forca', 'memoria', 'quiz'];
    let totalScore = 0;
    let gameData = {};

    // Soma as pontuações de todos os jogos
    games.forEach(game => {
      const playerInGame = rankingData[game].find(p => p.name === playerName);
      if (playerInGame) {
        totalScore += playerInGame.score;
        gameData[game] = playerInGame.gameData;
      }
    });

    // Atualiza o ranking geral
    let playerIndex = rankingData.geral.findIndex(p => p.name === playerName);
    if (playerIndex !== -1) {
      rankingData.geral[playerIndex].score = totalScore;
      rankingData.geral[playerIndex].gameData = gameData;
    } else {
      rankingData.geral.push({ 
        name: playerName, 
        score: totalScore, 
        gameData 
      });
    }

    // Ordena o ranking geral
    rankingData.geral.sort((a, b) => b.score - a.score);
  }
};

// Inicializa o quiz
carregaQuestao();