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

// Rota para obter ranking
app.get("/ranking", async (req, res) => {
  try {
    const { game } = req.query;
    let ranking;
    
    // Tratamento para o caso do ranking geral
    if (game === 'geral') {
      const [result] = await db.query(
        `SELECT u.nome, 
                SUM(p.pontuacao) as pontuacao, 
                MAX(p.data_pontuacao) as data_pontuacao,
                JSON_OBJECT(
                  'forca', (SELECT JSON_OBJECT('attempts', COUNT(*)) FROM pontuacoes WHERE jogo_id = 1 AND usuario_id = u.id),
                  'memoria', (SELECT JSON_OBJECT('moves', COUNT(*)) FROM pontuacoes WHERE jogo_id = 2 AND usuario_id = u.id),
                  'quiz', (SELECT JSON_OBJECT('time', COUNT(*)) FROM pontuacoes WHERE jogo_id = 3 AND usuario_id = u.id)
                ) as gameData
         FROM pontuacoes p
         JOIN usuarios u ON p.usuario_id = u.id
         GROUP BY u.id
         ORDER BY pontuacao DESC
         LIMIT 10`
      );
      ranking = result;
    } 
    // Tratamento para jogos específicos
    else {
      let jogoId;
      
      // Mapeia o nome do jogo para seu ID
      if (game === 'forca') jogoId = 1;
      else if (game === 'memoria') jogoId = 2;
      else if (game === 'quiz') jogoId = 3;
      else {
        return res.status(404).json({ error: "Jogo não encontrado" });
      }

      const [result] = await db.query(
        `SELECT u.nome, 
                p.pontuacao, 
                p.data_pontuacao,
                CASE 
                  WHEN ? = 1 THEN JSON_OBJECT('attempts', 7 - p.pontuacao) 
                  WHEN ? = 2 THEN JSON_OBJECT('moves', p.pontuacao)
                  WHEN ? = 3 THEN JSON_OBJECT('time', p.pontuacao)
                  ELSE '{}'
                END as gameData
         FROM pontuacoes p
         JOIN usuarios u ON p.usuario_id = u.id
         WHERE p.jogo_id = ?
         ORDER BY p.pontuacao DESC
         LIMIT 10`,
        [jogoId, jogoId, jogoId, jogoId]
      );
      ranking = result;
    }

    // Se não houver registros, retornar array vazio
    if (!ranking) {
      ranking = [];
    }

    res.json({ ranking });
  } catch (error) {
    console.error("Erro ao buscar ranking:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Rota para salvar pontuação
app.post("/save-score", verificarToken, async (req, res) => {
  try {
    const { game, score, gameSpecificData } = req.body;
    const userId = req.userId;

    // Obter o ID do jogo baseado no nome
    let jogoId;
    if (game === 'forca') jogoId = 1;
    else if (game === 'memoria') jogoId = 2;
    else if (game === 'quiz') jogoId = 3;
    else {
      // Se o jogo não existir nos mapeamentos pré-definidos, buscar na tabela
      const [jogo] = await db.query("SELECT id FROM jogos WHERE nome = ?", [game]);
      if (jogo.length === 0) {
        // Se o jogo não existir, criá-lo
        const [result] = await db.query("INSERT INTO jogos (nome) VALUES (?)", [game]);
        jogoId = result.insertId;
      } else {
        jogoId = jogo[0].id;
      }
    }

    // Buscar a melhor pontuação atual do usuário para este jogo
    const [pontuacaoAtual] = await db.query(
      "SELECT pontuacao FROM pontuacoes WHERE usuario_id = ? AND jogo_id = ? ORDER BY pontuacao DESC LIMIT 1",
      [userId, jogoId]
    );
    
    // Salvar a pontuação apenas se for maior que a existente ou se for a primeira
    if (pontuacaoAtual.length === 0 || score > pontuacaoAtual[0].pontuacao) {
      await db.query(
        "INSERT INTO pontuacoes (usuario_id, jogo_id, pontuacao, data_pontuacao) VALUES (?, ?, ?, NOW())",
        [userId, jogoId, score]
      );
      
      // Buscar nome do usuário para retornar
      const [usuario] = await db.query("SELECT nome FROM usuarios WHERE id = ?", [userId]);
      
      res.json({ 
        message: "Pontuação salva com sucesso!", 
        score,
        nome: usuario[0].nome,
        game
      });
    } else {
      res.json({ 
        message: "Pontuação não superou o recorde anterior", 
        score: pontuacaoAtual[0].pontuacao 
      });
    }
  } catch (error) {
    console.error("Erro ao salvar pontuação:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});
// Rota para salvar pontuação


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