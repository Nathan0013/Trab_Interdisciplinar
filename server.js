const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

// Configuração da conexão com MySQL
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "12345",
  database: "banco_interdiciplinar"
});

db.connect(err => {
  if (err) {
    console.log("Erro ao conectar ao MySQL:", err);
  } else {
    console.log("Conectado ao MySQL!");
  }
});

// Rota de cadastro
app.post("/register", async (req, res) => {
  const { nome, email, senha } = req.body;

  // Verifica se o email já está cadastrado
  db.query("SELECT * FROM usuarios WHERE email = ?", [email], async (err, result) => {
    if (err) return res.status(500).json({ error: "Erro no servidor" });

    if (result.length > 0) {
      return res.status(400).json({ error: "E-mail já cadastrado" });
    }

    // Criptografa a senha antes de salvar
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    db.query("INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)", [nome, email, senhaHash], (err, result) => {
      if (err) return res.status(500).json({ error: "Erro ao registrar usuário" });
      res.status(201).json({ message: "Usuário registrado com sucesso!" });
    });
  });
});

// Rota de login
app.post("/login", (req, res) => {
  const { email, senha } = req.body;

  db.query("SELECT * FROM usuarios WHERE email = ?", [email], async (err, result) => {
    if (err) return res.status(500).json({ error: "Erro no servidor" });

    if (result.length === 0) {
      return res.status(401).json({ error: "E-mail ou senha inválidos" });
    }

    const user = result[0];

    // Verifica a senha
    const senhaValida = await bcrypt.compare(senha, user.senha);
    if (!senhaValida) {
      return res.status(401).json({ error: "E-mail ou senha inválidos" });
    }

    // Gera token JWT
    const token = jwt.sign({ id: user.id }, "secreto", { expiresIn: "1h" });

    res.json({ message: "Login realizado com sucesso!", token });
  });
});

// Iniciar o servidor
app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});
