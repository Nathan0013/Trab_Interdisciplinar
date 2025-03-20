// index.js - Logic for the main index page

document.addEventListener('DOMContentLoaded', () => {
    const playerNameInput = document.getElementById('player-name');
    const btnLogin = document.getElementById('btn-login');
    const btnLogout = document.getElementById('btn-logout');
    const playerNameDisplay = document.getElementById('player-name-display');
    const loginSection = document.getElementById('login-section');
    const welcomeSection = document.getElementById('welcome-section');
    
    // Check if player is already logged in
    const currentPlayer = localStorage.getItem('jogador');
    if (currentPlayer) {
      showWelcomeSection(currentPlayer);
    }
    
    // Login button event
    btnLogin.addEventListener('click', () => {
      const playerName = playerNameInput.value.trim();
      if (playerName.length >= 2) {
        localStorage.setItem('jogador', playerName);
        showWelcomeSection(playerName);
      } else {
        alert('Por favor, digite um nome com pelo menos 2 caracteres.');
      }
    });
    
    // Logout button event
    btnLogout.addEventListener('click', () => {
      localStorage.removeItem('jogador');
      showLoginSection();
    });
    
    // Enter key for login
    playerNameInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        btnLogin.click();
      }
    });
    
    // Helper functions
    function showWelcomeSection(name) {
      loginSection.classList.add('hidden');
      welcomeSection.classList.remove('hidden');
      playerNameDisplay.textContent = name;
    }
    
    function showLoginSection() {
      welcomeSection.classList.add('hidden');
      loginSection.classList.remove('hidden');
      playerNameInput.value = '';
      playerNameInput.focus();
    }
  });