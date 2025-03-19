const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../Trab_Interdisciplinar/public/cadastro/JS/banco"); // Novo arquivo unificado de banco de dados
const verificarToken = require("../Trab_Interdisciplinar/public/cadastro/JS/autenticacao");
require("dotenv").config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Servir arquivos estáticos
app.use(express.static('public'));

// Rota de cadastro com validação
app.post("/register", async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    
    // Validação de dados
    if (!nome || !email || !senha) {
      return res.status(400).json({ error: "Todos os campos são obrigatórios" });
    }
    
    if (senha.length < 6) {
      return res.status(400).json({ error: "A senha deve ter pelo menos 6 caracteres" });
    }
    
    // Verificar se o email já está cadastrado
    const [users] = await db.query("SELECT * FROM usuarios WHERE email = ?", [email]);
    if (users.length > 0) {
      return res.status(400).json({ error: "E-mail já cadastrado" });
    }
    
    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);
    
    // Inserir usuário
    await db.query(
      "INSERT INTO usuarios (nome, email, senha, data_cadastro) VALUES (?, ?, ?, NOW())", 
      [nome, email, senhaHash]
    );
    
    res.status(201).json({ message: "Usuário registrado com sucesso!" });
  } catch (error) {
    console.error("Erro no cadastro:", error);
    res.status(500).json({ error: "Erro ao registrar usuário" });
  }
});

// Rota de login
app.post("/login", async (req, res) => {
  try {
    const { email, senha } = req.body;
    
    // Validação de dados
    if (!email || !senha) {
      return res.status(400).json({ error: "E-mail e senha são obrigatórios" });
    }
    
    // Buscar usuário
    const [users] = await db.query("SELECT * FROM usuarios WHERE email = ?", [email]);
    if (users.length === 0) {
      return res.status(401).json({ error: "E-mail ou senha inválidos" });
    }
    
    const user = users[0];
    
    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, user.senha);
    if (!senhaValida) {
      return res.status(401).json({ error: "E-mail ou senha inválidos" });
    }
    
    // Gerar token JWT (2 horas de validade)
    const token = jwt.sign(
      { id: user.id, nome: user.nome }, 
      process.env.JWT_SECRET, 
      { expiresIn: "2h" }
    );
    
    // Registrar login
    await db.query("UPDATE usuarios SET ultimo_login = NOW() WHERE id = ?", [user.id]);
    
    res.json({ 
      message: "Login realizado com sucesso!", 
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email
      }
    });
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ error: "Erro no servidor" });
  }
});

// Exemplo de rota protegida
app.get("/user/profile", verificarToken, async (req, res) => {
  try {
    const [user] = await db.query(
      "SELECT id, nome, email, data_cadastro, ultimo_login FROM usuarios WHERE id = ?", 
      [req.userId]
    );
    
    if (user.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }
    
    res.json({ user: user[0] });
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    res.status(500).json({ error: "Erro no servidor" });
  }
});

// Iniciar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// Tratamento de erros não capturados
process.on("uncaughtException", (error) => {
  console.error("Erro não tratado:", error);
});

process.on("unhandledRejection", (error) => {
  console.error("Promise rejeitada não tratada:", error);
});