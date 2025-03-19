const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./public/cadastro/JS/banco.js"); // Confirme que o caminho está correto
const verificarToken = require("./public/cadastro/JS/autenticacao.js");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(express.static(path.join(__dirname, "public")));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());



// Função para validar e-mail
function validarEmail(email) {
  const re = /^[^\s@]+@[^\s@]+$/;
  return re.test(email);
}

// Rota de cadastro
app.post("/register", async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ error: "Todos os campos são obrigatórios" });
    }
    if (!validarEmail(email)) {
      return res.status(400).json({ error: "E-mail inválido" });
    }
    if (senha.length < 6) {
      return res.status(400).json({ error: "A senha deve ter pelo menos 6 caracteres" });
    }

    const [users] = await db.query("SELECT * FROM usuarios WHERE email = ?", [email]);
    if (users.length > 0) {
      return res.status(400).json({ error: "E-mail já cadastrado" });
    }

    const senhaHash = await bcrypt.hash(senha, 10);
    await db.query("INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)", [nome, email, senhaHash]);

    res.status(201).json({ message: "Usuário registrado com sucesso!" });
  } catch (error) {
    console.error("Erro no cadastro:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Rota de login
app.post("/login", async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: "E-mail e senha são obrigatórios" });
    }

    const [users] = await db.query("SELECT * FROM usuarios WHERE email = ?", [email]);
    if (users.length === 0) {
      return res.status(401).json({ error: "E-mail ou senha inválidos" });
    }

    const user = users[0];
    const senhaValida = await bcrypt.compare(senha, user.senha);
    if (!senhaValida) {
      return res.status(401).json({ error: "E-mail ou senha inválidos" });
    }

    const token = jwt.sign({ id: user.id, nome: user.nome }, process.env.JWT_SECRET, { expiresIn: "2h" });

    res.json({ message: "Login realizado com sucesso!", token });
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Rota protegida (Exemplo)
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
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Iniciar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;

// Tratamento de erros
process.on("uncaughtException", (error) => {
  console.error("Erro não tratado:", error);
});

process.on("unhandledRejection", (error) => {
  console.error("Promise rejeitada não tratada:", error);
});
