const STORAGE_KEY = 'biomas_ranking_data';

document.addEventListener('DOMContentLoaded', () => {
  // DOM elements
  const rankingTableBody = document.getElementById('ranking-data');
  const tabButtons = document.querySelectorAll('.tab-btn');
  const resetButton = document.getElementById('reset-scores');
  const playerStatsContent = document.querySelector('.stats-content');
  const topPlayerCards = {
    1: document.querySelector('.top-1'),
    2: document.querySelector('.top-2'),
    3: document.querySelector('.top-3')
  };
  
  // Current view settings
  let currentView = 'geral';
  
  // Initial load
  displayRanking();
  displayCurrentUserStats();
  
  // Event listeners
  tabButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const game = e.target.dataset.game;
      setActiveTab(game);
      currentView = game;
      displayRanking();
    });
  });
  
  resetButton.addEventListener('click', () => {
    const confirmReset = confirm('Tem certeza que deseja limpar todas as pontuações? Esta ação não pode ser desfeita.');
    if (confirmReset) {
      localStorage.removeItem(STORAGE_KEY);
      window.location.reload();
    }
  });
  
  // Functions
  function setActiveTab(game) {
    tabButtons.forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.game === game) {
        btn.classList.add('active');
      }
    });
  }
  
  function getRankingData() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
      geral: [],
      forca: [],
      memoria: [],
      quiz: []
    };
  }
  
  function displayRanking() {
    const rankingData = getRankingData();
    const topPlayers = rankingData[currentView].slice(0, 10);
    
    // Clear table
    rankingTableBody.innerHTML = '';
    
    // Update top player cards
    updateTopPlayerCards(topPlayers);
    
    // Populate table
    topPlayers.forEach((player, index) => {
      const row = document.createElement('tr');
      
      // Obter dados específicos do jogo de forma padronizada
      const forcaInfo = getGameSpecificInfo(player, 'forca');
      const memoriaInfo = getGameSpecificInfo(player, 'memoria');
      const quizInfo = getGameSpecificInfo(player, 'quiz');
      
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${player.name}</td>
        <td>${player.score}</td>
        <td>${forcaInfo}</td>
        <td>${memoriaInfo}</td>
        <td>${quizInfo}</td>
      `;
      
      rankingTableBody.appendChild(row);
    });
    
    // Show empty state if no players
    if (topPlayers.length === 0) {
      const emptyRow = document.createElement('tr');
      emptyRow.innerHTML = `
        <td colspan="6" style="text-align: center;">Ainda não há jogadores no ranking.</td>
      `;
      rankingTableBody.appendChild(emptyRow);
    }
  }
  
  function getGameSpecificInfo(player, gameType) {
    // Se estamos na visualização geral, buscar dados do tipo de jogo
    if (currentView === 'geral' && player.gameData && player.gameData[gameType]) {
      const gameData = player.gameData[gameType];
      
      switch (gameType) {
        case 'forca':
          return gameData.attempts ? `${7 - gameData.attempts}/7` : '-';
        case 'memoria':
          return gameData.moves ? `${gameData.moves} mov.` : '-';
        case 'quiz':
          return gameData.correct ? `${gameData.correct}/${gameData.total}` : '-';
        default:
          return '-';
      }
    } 
    // Se estamos em uma visualização específica de jogo
    else if (currentView === gameType && player.gameData) {
      const gameData = player.gameData;
      
      switch (gameType) {
        case 'forca':
          return gameData.attempts ? `${7 - gameData.attempts}/7` : '-';
        case 'memoria':
          return gameData.moves ? `${gameData.moves} mov.` : '-';
        case 'quiz':
          return gameData.correct ? `${gameData.correct}/${gameData.total}` : '-';
        default:
          return '-';
      }
    }
    
    return '-';
  }
  
  function updateTopPlayerCards(players) {
    // Reset cards first
    for (let i = 1; i <= 3; i++) {
      topPlayerCards[i].querySelector('.player-name').textContent = '-';
      topPlayerCards[i].querySelector('.player-score').textContent = '-';
    }
    
    // Update with player data
    players.slice(0, 3).forEach((player, index) => {
      const position = index + 1;
      const card = topPlayerCards[position];
      
      card.querySelector('.player-name').textContent = player.name;
      card.querySelector('.player-score').textContent = player.score;
    });
  }
  
  function displayCurrentUserStats() {
    const currentPlayer = localStorage.getItem('jogador');
    
    // If no player is logged in
    if (!currentPlayer) {
      playerStatsContent.innerHTML = `
        <p>Faça login para ver suas estatísticas!</p>
      `;
      return;
    }
    
    const rankingData = getRankingData();
    
    // Buscar dados do jogador em cada jogo
    const quizData = rankingData.quiz.find(p => p.name === currentPlayer);
    const forcaData = rankingData.forca.find(p => p.name === currentPlayer);
    const memoriaData = rankingData.memoria.find(p => p.name === currentPlayer);
    const geralData = rankingData.geral.find(p => p.name === currentPlayer);
    
    // Calcular posição no ranking geral
    const geralRank = rankingData.geral.findIndex(p => p.name === currentPlayer) + 1;
    
    // Se jogador existe em pelo menos um ranking
    if (geralData || quizData || forcaData || memoriaData) {
      playerStatsContent.innerHTML = `
        <div>
          <p class="stat-label">Nome:</p>
          <p>${currentPlayer}</p>
        </div>
        <div>
          <p class="stat-label">Posição no Ranking:</p>
          <p>${geralRank > 0 ? `${geralRank}º lugar` : 'Não classificado'}</p>
        </div>
        <div>
          <p class="stat-label">Pontuação Total:</p>
          <p>${geralData ? geralData.score : 0}</p>
        </div>
        <div>
          <p class="stat-label">Forca:</p>
          <p>${forcaData ? `${forcaData.score} pts` : 'Não jogou'}</p>
        </div>
        <div>
          <p class="stat-label">Memória:</p>
          <p>${memoriaData ? `${memoriaData.score} pts` : 'Não jogou'}</p>
        </div>
        <div>
          <p class="stat-label">Quiz:</p>
          <p>${quizData ? `${quizData.score} pts (${quizData.gameData.correct}/${quizData.gameData.total})` : 'Não jogou'}</p>
        </div>
      `;
    } else {
      playerStatsContent.innerHTML = `
        <p>Você ainda não possui pontuações! Jogue para aparecer no ranking.</p>
      `;
    }
  }
});