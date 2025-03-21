// Código para gerenciar a tela de fim de jogo
const gameEndOverlay = {
    overlay: null,
    playerName: null,
    finalScore: null,
    playAgainBtn: null,
    rankingBtn: null,
    menuBtn: null,
    
    init: function() {
        // Obter referências aos elementos
        this.overlay = document.getElementById('gameEndOverlay');
        this.playerName = document.getElementById('playerNameEnd');
        this.finalScore = document.getElementById('finalScore');
        this.playAgainBtn = document.getElementById('playAgainBtn');
        this.rankingBtn = document.getElementById('goToRankingBtn');
        this.menuBtn = document.getElementById('goToMenuBtn');
        
        // Verificar se os elementos existem
        if (!this.overlay || !this.playAgainBtn || !this.rankingBtn || !this.menuBtn) {
            return; // Sair se não encontrar os elementos necessários
        }
        
        // Configurar eventos dos botões
        this.playAgainBtn.addEventListener('click', () => {
            this.hide();
            // Reiniciar o jogo atual - cada jogo implementará sua própria lógica de reinício
            if (typeof restartCurrentGame === 'function') {
                restartCurrentGame();
            }
        });
        
        this.rankingBtn.addEventListener('click', () => {
            window.location.href = '/public/jogos/Ranking/ranking.html';
        });
        
        this.menuBtn.addEventListener('click', () => {
            window.location.href = '/public/jogos/menu_jogos/indice_jogos.html';
        });
    },
    
    // Mostrar o overlay com a pontuação final
    show: function(score, gameType) {
        // Verificar se o overlay foi inicializado
        if (!this.overlay) {
            this.init();
            
            // Se ainda não encontrou, provavelmente a estrutura HTML não existe
            if (!this.overlay) {
                console.error('Overlay de fim de jogo não encontrado na página.');
                alert(`Parabéns! Você completou o jogo ${gameType} com ${score} pontos!`);
                return;
            }
        }
        
        // Obter o nome do jogador do localStorage
        const playerName = localStorage.getItem('jogador') || 'Jogador';
        this.playerName.textContent = playerName;
        
        // Definir a pontuação
        this.finalScore.textContent = score;
        
        // Mostrar o overlay
        this.overlay.style.display = 'flex';
        
        // Criar efeito de confete
        this.createConfetti();
        
        // Configurar mensagem específica com base no jogo
        const gameMessage = document.querySelector('.game-end-message');
        switch(gameType) {
            case 'forca':
                gameMessage.textContent = `Parabéns, ${playerName}! Você completou o jogo da Forca!`;
                break;
            case 'memoria':
                gameMessage.textContent = `Parabéns, ${playerName}! Você completou o jogo da Memória!`;
                break;
            case 'quiz':
                gameMessage.textContent = `Parabéns, ${playerName}! Você completou o Quiz!`;
                break;
            default:
                gameMessage.textContent = `Parabéns, ${playerName}!`;
        }
    },
    
    // Esconder o overlay
    hide: function() {
        if (this.overlay) {
            this.overlay.style.display = 'none';
            // Remover confetes
            document.querySelectorAll('.confetti').forEach(el => el.remove());
        }
    },
    
    // Criar efeito de confete
    createConfetti: function() {
        if (!this.overlay) return;
        
        const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722'];
        
        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.width = (Math.random() * 10 + 5) + 'px';
            confetti.style.height = (Math.random() * 10 + 5) + 'px';
            this.overlay.appendChild(confetti);
        }
    }
};

// Inicializar a tela de fim de jogo quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    gameEndOverlay.init();
});

// Função global para mostrar o overlay de fim de jogo
function showGameEnd(score, gameType) {
    gameEndOverlay.show(score, gameType);
}

// Expor função globalmente para que o jogo possa acessá-la
window.showGameEnd = showGameEnd;