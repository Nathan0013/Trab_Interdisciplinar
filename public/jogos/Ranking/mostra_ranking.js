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
      
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${player.name}</td>
        <td>${player.score}</td>
        <td>${player.gameData?.attempts ? 7 - player.gameData.attempts : '-'}</td>
        <td>${player.gameData?.moves || '-'}</td>
        <td>${player.gameData?.time || '-'}</td>
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
    const playerData = rankingData.geral.find(p => p.name === currentPlayer);
    
    // If player exists in rankings
    if (playerData) {
      const rank = rankingData.geral.findIndex(p => p.name === currentPlayer) + 1;
      
      playerStatsContent.innerHTML = `
        <div>
          <p class="stat-label">Nome:</p>
          <p>${playerData.name}</p>
        </div>
        <div>
          <p class="stat-label">Posição no Ranking:</p>
          <p>${rank}º lugar</p>
        </div>
        <div>
          <p class="stat-label">Pontuação Total:</p>
          <p>${playerData.score}</p>
        </div>
        <div>
          <p class="stat-label">Pontuação Forca:</p>
          <p>${playerData.gameData?.attempts ? 7 - playerData.gameData.attempts : '-'}</p>
        </div>
        <div>
          <p class="stat-label">Pontuação Memória:</p>
          <p>${playerData.gameData?.moves || '-'}</p>
        </div>
        <div>
          <p class="stat-label">Pontuação Quiz:</p>
          <p>${playerData.gameData?.time || '-'}</p>
        </div>
      `;
    } else {
      playerStatsContent.innerHTML = `
        <p>Você ainda não possui pontuações! Jogue para aparecer no ranking.</p>
      `;
    }
  }
});