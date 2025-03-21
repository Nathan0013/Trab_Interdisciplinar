document.addEventListener('DOMContentLoaded', async () => {
  // DOM elements
  const rankingTableBody = document.getElementById('ranking-data');
  const tabButtons = document.querySelectorAll('.tab-btn');
  const playerStatsContent = document.querySelector('.stats-content');
  const topPlayerCards = {
    1: document.querySelector('.top-1'),
    2: document.querySelector('.top-2'),
    3: document.querySelector('.top-3')
  };
  
  // Current view settings
  let currentView = 'geral';
  
  // Initial load
  await fetchAndDisplayRanking();
  displayCurrentUserStats();
  
  // Event listeners
  tabButtons.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const game = e.target.dataset.game;
      setActiveTab(game);
      currentView = game;
      await fetchAndDisplayRanking();
    });
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
  
  async function fetchAndDisplayRanking() {
    // Mostrar indicador de carregamento
    rankingTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Carregando ranking...</td></tr>';
    
    // Carregar dados do ranking (primeiro tenta do servidor, depois local)
    let rankingData = [];
    try {
      console.log(`Buscando dados de ranking para: ${currentView}`);
      const response = await fetch(`http://localhost:3000/ranking?game=${currentView}`);
      
      if (response.ok) {
        const data = await response.json();
        rankingData = data.ranking || [];
        console.log("Dados do servidor:", rankingData);
        
        // Salvar nos dados locais como backup
        saveLocalRankingData(rankingData);
      } else {
        console.error(`Erro ao acessar o servidor: ${response.status} ${response.statusText}`);
        throw new Error("Não foi possível obter dados do servidor");
      }
    } catch (error) {
      console.log("Usando dados locais:", error);
      rankingData = getLocalRankingData();
    }
    
    // Exibir o ranking
    displayRanking(rankingData);
  }
  
  function getLocalRankingData() {
    const rankingData = JSON.parse(localStorage.getItem('biomas_ranking_data')) || {
      geral: [],
      forca: [],
      memoria: [],
      quiz: []
    };
    
    return rankingData[currentView] || [];
  }
  
  function saveLocalRankingData(ranking) {
    const rankingData = JSON.parse(localStorage.getItem('biomas_ranking_data')) || {
      geral: [],
      forca: [],
      memoria: [],
      quiz: []
    };
    
    // Converter formato de servidor para o formato local
    const localFormat = ranking.map(player => ({
      name: player.nome,
      score: player.pontuacao,
      date: player.data_pontuacao,
      gameData: player.gameData || {}
    }));
    
    rankingData[currentView] = localFormat;
    localStorage.setItem('biomas_ranking_data', JSON.stringify(rankingData));
  }
  
  function displayRanking(topPlayers) {
    // Clear table
    rankingTableBody.innerHTML = '';
    
    // Update top player cards
    updateTopPlayerCards(topPlayers);
    
    // Populate table
    topPlayers.forEach((player, index) => {
      const row = document.createElement('tr');
      const playerData = {
        nome: player.nome || player.name || '-',
        pontuacao: player.pontuacao || player.score || 0,
        gameData: player.gameData || {}
      };
      
      // Extrair dados específicos do jogo
      const forcaAttempts = playerData.gameData.forca?.attempts || '-';
      const memoriaMoves = playerData.gameData.memoria?.moves || '-';
      const quizTime = playerData.gameData.quiz?.time || '-';
      
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${playerData.nome}</td>
        <td>${playerData.pontuacao}</td>
        <td>${forcaAttempts}</td>
        <td>${memoriaMoves}</td>
        <td>${quizTime}</td>
      `;
      
      rankingTableBody.appendChild(row);
    });
    
    // Show empty state if no players
    if (!topPlayers || topPlayers.length === 0) {
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
    if (players && players.length > 0) {
      players.slice(0, 3).forEach((player, index) => {
        const position = index + 1;
        const card = topPlayerCards[position];
        
        card.querySelector('.player-name').textContent = player.nome || player.name || '-';
        card.querySelector('.player-score').textContent = player.pontuacao || player.score || 0;
      });
    }
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
    
    // Get local data
    const rankingData = JSON.parse(localStorage.getItem('biomas_ranking_data')) || {
      geral: [], forca: [], memoria: [], quiz: []
    };
    
    // Encontrar o jogador pelo nome em rankings locais
    const playerData = rankingData.geral.find(p => p.name === currentPlayer);
    
    // If player exists in rankings
    if (playerData) {
      const rank = rankingData.geral.findIndex(p => p.name === currentPlayer) + 1;
      const gameData = playerData.gameData || {};
      
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
          <p>${gameData.forca?.attempts || '-'}</p>
        </div>
        <div>
          <p class="stat-label">Pontuação Memória:</p>
          <p>${gameData.memoria?.moves || '-'}</p>
        </div>
        <div>
          <p class="stat-label">Pontuação Quiz:</p>
          <p>${gameData.quiz?.time || '-'}</p>
        </div>
      `;
    } else {
      playerStatsContent.innerHTML = `
        <p>Você ainda não possui pontuações! Jogue para aparecer no ranking.</p>
      `;
    }
  }
});