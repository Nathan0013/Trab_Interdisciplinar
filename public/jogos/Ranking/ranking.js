// URL do backend (local)
const API_URL = 'http://localhost:3000';

// Função para buscar dados do ranking
async function getRankingData(game) {
    try {
        const response = await fetch(`${API_URL}/ranking?game=${game}`);
        const data = await response.json();
        return data.ranking; // Retorna apenas o array de ranking
    } catch (error) {
        console.error('Erro ao buscar ranking:', error);
        return [];
    }
}

// Função para salvar uma pontuação no banco de dados
async function saveScore(playerId, game, score, gameSpecificData = {}) {
    try {
        const response = await fetch(`${API_URL}/save-score`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}` // Adiciona o token de autenticação
            },
            body: JSON.stringify({
                game,
                score,
                gameSpecificData
            }),
        });
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Erro ao salvar pontuação:', error);
        return null;
    }
}

// Função para adicionar uma pontuação ao ranking
async function addScore(playerId, game, score, gameSpecificData = {}) {
    let normalizedScore;

    // Normalizar a pontuação com base no jogo
    switch (game) {
        case 'forca':
            const remainingAttempts = 7 - (gameSpecificData.attempts || 1);
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

    // Salvar a pontuação no banco de dados
    const result = await saveScore(playerId, game, normalizedScore, gameSpecificData);
    return result;
}

// Função para exibir o ranking
async function displayRanking(gameType = 'geral') {
    const rankingList = document.getElementById('ranking-list');
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