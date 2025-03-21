// URL do backend (local)
const API_URL = 'http://localhost:3000';
const STORAGE_KEY = 'biomas_ranking_data';

// Função para buscar dados do ranking
async function getRankingData(gameType = 'geral') {
    try {
        // Primeiro tentar buscar do servidor
        const response = await fetch(`${API_URL}/ranking?game=${gameType}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
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
        data_pontuacao: player.date || new Date().toISOString()
    }));
}

// Função para salvar uma pontuação no banco de dados
async function saveScore(game, score, gameSpecificData = {}) {
    try {
        const token = localStorage.getItem('token');
        
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
            const result = await response.json();
            return result;
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
    updateGeneralRanking(rankingData, playerName);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rankingData));

    return { score };
}

// Função para adicionar uma pontuação ao ranking
async function addScore(game, score, gameSpecificData = {}) {
    let normalizedScore;

    // Normalizar a pontuação com base no jogo
    switch (game) {
        case 'forca':

            const remainingAttempts = 7 - (gameSpecificData.errors || 1);

            normalizedScore = Math.round((remainingAttempts / 6) * 100);
            break;

        case 'memoria':
            const timeScore = Math.max(0, 100 - (gameSpecificData.time / 3));
            const movesScore = Math.max(0, 100 - (gameSpecificData.moves * 5));
            normalizedScore = Math.round((timeScore + movesScore) / 2);
            break;

        case 'quiz':
            normalizedScore = Math.round((score / 10) * 100);
            break;

        default:
            normalizedScore = score;
    }

    // Salvar a pontuação
    const result = await saveScore(game, normalizedScore, gameSpecificData);
    return result;
}

// Função para atualizar o ranking geral
function updateGeneralRanking(rankingData, playerName) {
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
        rankingData.geral.push({ 
            name: playerName, 
            score: totalScore, 
            gameData,
            date: new Date().toISOString()
        });
    }

    rankingData.geral.sort((a, b) => b.score - a.score);
}

// Função para exibir o ranking
async function displayRanking(gameType = 'geral') {
    const rankingList = document.getElementById('ranking-list');
    if (!rankingList) return;
    
    rankingList.innerHTML = '';

    // Buscar os dados do ranking
    const rankingData = await getRankingData(gameType);

    // Exibir os top 10 jogadores
    rankingData.slice(0, 10).forEach((player, index) => {
        const rankingItem = document.createElement('div');
        rankingItem.classList.add('ranking-item');

        // Posição
        const positionEl = document.createElement('div');
        positionEl.classList.add('position');
        if (index < 3) {
            const medalPosition = document.createElement('div');
            medalPosition.classList.add('top-position', `position-${index + 1}`);
            medalPosition.textContent = index + 1;
            positionEl.appendChild(medalPosition);
        } else {
            positionEl.textContent = index + 1;
        }

        // Nome do jogador
        const nameEl = document.createElement('div');
        nameEl.classList.add('player-name');
        nameEl.textContent = player.nome;

        // Pontuação
        const scoreEl = document.createElement('div');
        scoreEl.classList.add('player-score');
        scoreEl.textContent = `${player.pontuacao} pts`;

        // Adicionar elementos ao item do ranking
        rankingItem.appendChild(positionEl);
        rankingItem.appendChild(nameEl);
        rankingItem.appendChild(scoreEl);

        // Adicionar item à lista
        rankingList.appendChild(rankingItem);
    });

    // Mensagem se não houver jogadores
    if (rankingData.length === 0) {
        const noPlayersMsg = document.createElement('div');
        noPlayersMsg.classList.add('no-players-msg');
        noPlayersMsg.textContent = 'Nenhum jogador registrado ainda.';
        rankingList.appendChild(noPlayersMsg);
    }
}

// Event listeners para abas
document.addEventListener('DOMContentLoaded', () => {
    const tabButtons = document.querySelectorAll('.tab-btn');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const gameType = button.dataset.game;
            displayRanking(gameType);
        });
    });

    // Exibir o ranking geral por padrão
    displayRanking('geral');
});

// Exportar funções para serem usadas em outros arquivos
window.rankingManager = {
    updatePlayerScore: async function(playerName, game, score, gameSpecificData = {}) {
        // Salvar no localStorage
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
        updateGeneralRanking(rankingData, playerName);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(rankingData));
        
        // Tentar salvar no servidor
        try {
            await addScore(game, score, gameSpecificData);
        } catch (error) {
            console.error('Erro ao salvar pontuação no servidor:', error);
        }

        return score;
    }
};
