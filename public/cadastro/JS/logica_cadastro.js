// Lógica compartilhada para formulários de autenticação
document.addEventListener("DOMContentLoaded", function() {
  // Gerenciar o formulário de login
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
      loginForm.addEventListener("submit", async function(event) {
          event.preventDefault();
          
          // Obter dados do formulário
          const email = this.querySelector("input[name='email']").value.trim();
          const senha = this.querySelector("input[name='senha']").value;
          
          // Validação básica
          if (!email || !senha) {
              showMessage("error", "E-mail e senha são obrigatórios");
              return;
          }
          
          if (!validateEmail(email)) {
              showMessage("error", "Formato de e-mail inválido");
              return;
          }
          
          // Desabilitar botão durante o envio
          const submitButton = this.querySelector("button[type='submit']");
          const originalText = submitButton.innerHTML;
          submitButton.disabled = true;
          submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Entrando...';
          
          try {
              const response = await fetch("http://localhost:3000/login", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email, senha })
              });
              
              const data = await response.json();
              
              if (response.ok && data.token) {
                  // Guardar o token em sessionStorage
                  sessionStorage.setItem("token", data.token);
                  showMessage("success", "Login realizado com sucesso!");
                  
                  // Redirecionar após breve delay
                  setTimeout(() => {
                      redirectToGame();
                  }, 1000);
              } else {
                  showMessage("error", data.error || "E-mail ou senha incorretos");
                  // Resetar botão
                  submitButton.disabled = false;
                  submitButton.innerHTML = originalText;
              }
          } catch (error) {
              showMessage("error", "Erro de conexão com o servidor");
              console.error(error);
              // Resetar botão
              submitButton.disabled = false;
              submitButton.innerHTML = originalText;
          }
      });
  }
  
  // Gerenciar o formulário de cadastro
  const registerForm = document.getElementById("register-form");
  if (registerForm) {
      registerForm.addEventListener("submit", async function(event) {
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
              showMessage("error", "Formato de e-mail inválido");
              return;
          }
          
          // Desabilitar botão durante o envio
          const submitButton = this.querySelector("button[type='submit']");
          const originalText = submitButton.innerHTML;
          submitButton.disabled = true;
          submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Criando conta...';
          
          try {
              const response = await fetch("http://localhost:3000/register", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ nome, email, senha })
              });
              
              const data = await response.json();
              
              if (response.ok) {
                  showMessage("success", "Conta criada com sucesso!");
                  
                  // Redirecionar após breve delay
                  setTimeout(() => {
                      redirectToGame();
                  }, 1500);
              } else {
                  showMessage("error", data.error || "Erro ao cadastrar");
                  // Resetar botão
                  submitButton.disabled = false;
                  submitButton.innerHTML = originalText;
              }
          } catch (error) {
              showMessage("error", "Erro de conexão com o servidor");
              console.error(error);
              // Resetar botão
              submitButton.disabled = false;
              submitButton.innerHTML = originalText;
          }
      });
  }
  
  // Funções auxiliares (compartilhadas)
  function validateEmail(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
  }
  
  function showMessage(type, message) {
      const messageContainer = document.querySelector(".message-container");
      if (messageContainer) {
          messageContainer.textContent = message;
          messageContainer.className = `message-container ${type}`;
          messageContainer.style.display = "block";
          
          // Auto-esconder após 5 segundos
          setTimeout(() => {
              messageContainer.style.display = "none";
          }, 5000);
      }
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
          }, 1000);
      }
  }
  
  // Verificar login ao carregar a página
  function verificarLogin() {
      const token = sessionStorage.getItem("token");
      if (token) {
          const jogoSelecionado = localStorage.getItem("jogoSelecionado");
          if (jogoSelecionado) {
              window.location.href = jogoSelecionado;
          } else {
              window.location.href = "../paginas_biomas/index.html";
          }
      }
  }
  
  // Função global para selecionar jogo (mantida para compatibilidade)
  window.selecionarJogo = function(jogo) {
      let caminhoJogo = "";

      if (jogo === "memoria") {
          caminhoJogo = "jogos/Jogo_da_Memoria/jogo_memoria.html";
      } else if (jogo === "forca") {
          caminhoJogo = "jogos/Jogo_Da_Forca/jogo_forca.html";
      } else if (jogo === "perguntas") {
          caminhoJogo = "jogos/Perguntas_Respostas/resp_perg.html";
      }

      localStorage.setItem("jogoSelecionado", caminhoJogo);
      console.log("Jogo selecionado:", caminhoJogo);
  };
  
  // Verificar login ao carregar
  verificarLogin();
});