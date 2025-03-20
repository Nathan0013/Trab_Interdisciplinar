// Esta função verifica se o usuário está logado antes de acessar um jogo
function verificarCadastro(jogoUrl) {
    // Verifica se há um token de sessão (usuário logado)
    const token = sessionStorage.getItem("token");
    
    if (token) {
        // Usuário já está logado, redireciona diretamente para o jogo
        window.location.href = jogoUrl;
    } else {
        // Usuário não está logado, salva o jogo selecionado e redireciona para login
        localStorage.setItem('jogoSelecionado', jogoUrl);
        window.location.href = 'tela_cadastro.html';
    }
}

// Se estiver na página de login, verifica se há um jogo selecionado no URL
document.addEventListener("DOMContentLoaded", function() {
    // Verifica se estamos na página de login
    if (window.location.pathname.includes('tela_cadastro.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const game = urlParams.get('game');
        
        if (game) {
            // Salva o jogo selecionado para redirecionamento após login
            localStorage.setItem('jogoSelecionado', game);
        }
    }
});