// Gerenciamento de formulários de autenticação
document.addEventListener("DOMContentLoaded", function() {
  // Toggle entre formulários de login e cadastro
  const links = document.querySelectorAll(".message a");
  links.forEach(link => {
    link.addEventListener("click", function(event) {
      event.preventDefault();
      document.querySelector(".register-form").classList.toggle("hidden");
      document.querySelector(".login-form").classList.toggle("hidden");
    });
  });

  // Validação e envio do formulário de cadastro
  document.querySelector(".register-form").addEventListener("submit", async function(event) {
    event.preventDefault();
    
    // Obter dados do formulário
    const nome = this.querySelector("input[name='nome']").value.trim();
    const email = this.querySelector("input[name='email']").value.trim();
    const senha = this.querySelector("input[name='senha']").value;
    
    // Validação básica
    if (!nome || !email || !senha) {
      showMessage("error", "Todos os campos são obrigatórios");
      return;
    }
    
    if (senha.length < 6) {
      showMessage("error", "A senha deve ter pelo menos 6 caracteres");
      return;
    }
    
    if (!validateEmail(email)) {
      showMessage("error", "E-mail inválido");
      return;
    }
    
    try {
      const response = await fetch("http://localhost:3000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, senha })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        showMessage("success", data.message);
        redirectToGame();
      } else {
        showMessage("error", data.error || "Erro ao cadastrar");
      }
    } catch (error) {
      showMessage("error", "Erro de conexão com o servidor");
      console.error(error);
    }
  });
  
  // Validação e envio do formulário de login
  document.querySelector(".login-form").addEventListener("submit", async function(event) {
    event.preventDefault();
    
    // Obter dados do formulário
    const email = this.querySelector("input[name='email']").value.trim();
    const senha = this.querySelector("input[name='senha']").value;
    
    // Validação básica
    if (!email || !senha) {
      showMessage("error", "E-mail e senha são obrigatórios");
      return;
    }
    
    try {
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha })
      });
      
      const data = await response.json();
      
      if (response.ok && data.token) {
        // Guardar o token em sessionStorage (mais seguro que localStorage)
        sessionStorage.setItem("token", data.token);
        showMessage("success", "Login realizado com sucesso!");
        redirectToGame();
      } else {
        showMessage("error", data.error || "Falha na autenticação");
      }
    } catch (error) {
      showMessage("error", "Erro de conexão com o servidor");
      console.error(error);
    }
  });
  
  // Funções auxiliares
  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
  
  function showMessage(type, message) {
    // Substitui os alerts por um elemento na interface
    const messageContainer = document.querySelector(".message-container") || createMessageContainer();
    messageContainer.textContent = message;
    messageContainer.className = `message-container ${type}`;
    messageContainer.style.display = "block";
    
    // Auto-esconder após 5 segundos
    setTimeout(() => {
      messageContainer.style.display = "none";
    }, 5000);
  }
  
  function createMessageContainer() {
    const container = document.createElement("div");
    container.className = "message-container";
    document.querySelector(".form").appendChild(container);
    return container;
  }
  
  function redirectToGame() {
    const jogoSelecionado = localStorage.getItem('jogoSelecionado');
    if (jogoSelecionado) {
      // Limpa o item do localStorage para evitar redirecionamentos indesejados
      localStorage.removeItem('jogoSelecionado');
      // Redireciona para o jogo selecionado
      window.location.href = jogoSelecionado;
    } else {
      // Se não há jogo selecionado, redireciona para a página inicial
      showMessage("info", "Redirecionando para a página inicial...");
      setTimeout(() => {
        window.location.href = "../paginas_biomas/index.html";
      }, 2000);
    }
  }
  
  // Verificar se o usuário já está logado
  function verificarLogin() {
    const token = sessionStorage.getItem("token");
    if (token) {
      // Opcionalmente verificar se o token é válido com uma chamada ao backend
      const jogoSelecionado = localStorage.getItem('jogoSelecionado');
      if (jogoSelecionado) {
        window.location.href = `/public/jogos/${jogoSelecionado}`;
      }
    }
  }
  
  // Verificar login ao carregar a página
  verificarLogin();
});