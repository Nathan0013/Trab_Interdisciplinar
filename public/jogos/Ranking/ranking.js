// Versão corrigida de ranking.js
const API_URL = 'http://localhost:3000';
const STORAGE_KEY = 'biomas_ranking_data';

// Função para buscar dados do ranking
async function getRankingData(gameType = 'geral') {
    try {
        // Primeiro tentar buscar do servidor
        const response = await fetch(`${API_URL}/ranking?game=${gameType}`);
        
        if (response.ok) {
            const data = await response.json();
            console.log("Dados do servidor:", data.ranking);
            // Armazenar os dados recebidos do servidor no localStorage
            updateLocalStorageFromServer(gameType, data.ranking);
            return data.ranking;
        } else {
            // Caso falhe, usar dados locais
            return getLocalRankingData(gameType);
        }
    } catch (error) {
        console.error('Erro ao buscar ranking:', error);
        // Fallback para dados locais em caso de falha
        return getLocalRankingData(gameType);
    }
}

// Atualiza dados locais com dados do servidor
function updateLocalStorageFromServer(gameType, serverData) {
    try {
        let rankingData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
            geral: [],
            forca: [],
            memoria: [],
            quiz: []
        };
        
        // Converter formato do servidor para formato local
        const localFormatData = serverData.map(player => ({
            name: player.nome,
            score: player.pontuacao,
            date: player.data_pontuacao,
            gameData: player.gameData || {}
        }));
        
        // Atualizar dados locais
        rankingData[gameType] = localFormatData;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(rankingData));
    } catch (e) {
        console.error("Erro ao atualizar localStorage:", e);
    }
}

// Função para buscar dados do localStorage
function getLocalRankingData(gameType = 'geral') {
    const rankingData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
        geral: [],
        forca: [],
        memoria: [],
        quiz: []
    };
    
    return rankingData[gameType].map(player => ({
        nome: player.name,
        pontuacao: player.score,
        data_pontuacao: player.date || new Date().toISOString(),
        gameData: player.gameData || {}
    }));
}

// Função para salvar uma pontuação
async function saveScore(game, score, gameSpecificData = {}) {
    try {
        const token = localStorage.getItem('token');
        const playerName = localStorage.getItem('jogador') || 'Anônimo';
        
        // Se tiver token, salva no servidor
        if (token) {
            const response = await fetch(`${API_URL}/save-score`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    game,
                    score,
                    gameSpecificData
                }),
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log("Pontuação salva no servidor:", result);
                
                // Também salva localmente para garantir consistência
                saveScoreLocally(game, score, gameSpecificData);
                return result;
            } else {
                throw new Error("Falha ao salvar no servidor");
            }
        } else {
            // Se não tiver token, salva apenas localmente
            return saveScoreLocally(game, score, gameSpecificData);
        }
    } catch (error) {
        console.error('Erro ao salvar pontuação:', error);
        // Fallback para salvar localmente em caso de falha
        return saveScoreLocally(game, score, gameSpecificData);
    }
}

// Função para salvar pontuação localmente
function saveScoreLocally(game, score, gameSpecificData = {}) {
    const playerName = localStorage.getItem('jogador') || 'Anônimo';
    
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
            rankingData[game][playerIndex].gameData = gameSpecificData;
            rankingData[game][playerIndex].date = new Date().toISOString();
        }
    } else {
        rankingData[game].push({ 
            name: playerName, 
            score, 
            gameData: gameSpecificData,
            date: new Date().toISOString()
        });
    }

    rankingData[game].sort((a, b) => b.score - a.score);
    
    // Chama com os dados de ranking completos, sem especificar jogador
    updateGeneralRanking(rankingData);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rankingData));

    return { score, nome: playerName };
}

// Função para atualizar o ranking geral
function updateGeneralRanking(rankingData) {
    const games = ['forca', 'memoria', 'quiz'];
    // Obter todos os nomes de jogadores únicos de todos os jogos
    const allPlayers = new Set();
    
    games.forEach(game => {
        rankingData[game].forEach(player => {
            allPlayers.add(player.name);
        });
    });
    
    // Recalcular pontuações para todos os jogadores
    rankingData.geral = [];
    
    allPlayers.forEach(playerName => {
        let totalScore = 0;
        let gameData = {};
        
        games.forEach(game => {
            const playerInGame = rankingData[game].find(p => p.name === playerName);
            if (playerInGame) {
                totalScore += playerInGame.score;
                gameData[game] = playerInGame.gameData;
            }
        });
        
        rankingData.geral.push({
            name: playerName,
            score: totalScore,
            gameData: gameData,
            date: new Date().toISOString()
        });
    });
    
    // Ordenar ranking geral
    rankingData.geral.sort((a, b) => b.score - a.score);
}

// Função para normalizar pontuação
function normalizeScore(game, score, gameSpecificData) {
    switch (game) {
        case 'forca':
            const remainingAttempts = 7 - (gameSpecificData.errors || 1);
            return Math.round((remainingAttempts / 6) * 100);

        case 'memoria':
            const timeScore = Math.max(0, 100 - (gameSpecificData.time / 3));
            const movesScore = Math.max(0, 100 - (gameSpecificData.moves * 5));
            return Math.round((timeScore + movesScore) / 2);

        case 'quiz':
            return Math.round((score / 10) * 100);

        default:
            return score;
    }
}

// Função para adicionar uma pontuação ao ranking
async function addScore(game, score, gameSpecificData = {}) {
    // Normalizar a pontuação
    const normalizedScore = normalizeScore(game, score, gameSpecificData);
    
    // Salvar a pontuação
    const result = await saveScore(game, normalizedScore, gameSpecificData);
    return result;
}

// Exportar funções para serem usadas em outros arquivos
window.rankingManager = {
    updatePlayerScore: async function(playerName, game, score, gameSpecificData = {}) {
        try {
            // Normalizar pontuação
            const normalizedScore = normalizeScore(game, score, gameSpecificData);
            
            // Salvar no servidor se tiver token
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await fetch(`${API_URL}/save-score`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            game,
                            score: normalizedScore,
                            gameSpecificData
                        }),
                    });
                    
                    if (response.ok) {
                        const result = await response.json();
                        console.log("Servidor:", result);
                    }
                } catch (error) {
                    console.error('Erro ao salvar no servidor:', error);
                }
            }
            
            // Sempre salva localmente para garantir consistência
            saveScoreLocally(game, normalizedScore, gameSpecificData);
            
            return normalizedScore;
        } catch (error) {
            console.error('Erro ao atualizar pontuação:', error);
            return score;
        }
    },
    
    getRankingData
};

// Inicializar event listeners se estiver na página de ranking
document.addEventListener('DOMContentLoaded', () => {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const rankingList = document.getElementById('ranking-list');

    if (tabButtons.length > 0) {
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                const gameType = button.dataset.game;
                
                if (typeof displayRanking === 'function') {
                    displayRanking(gameType);
                }
            });
        });
        
        // Exibir o ranking geral por padrão se a função estiver disponível
        if (typeof displayRanking === 'function') {
            displayRanking('geral');
        }
    }
});