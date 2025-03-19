const jwt = require("jsonwebtoken");

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Verifica se o usuário existe no banco de dados
  db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Erro ao verificar o usuário", error: err });
    }

    if (results.length === 0) {
      return res.status(400).json({ message: "Usuário não encontrado" });
    }

    // Compara a senha fornecida com a senha armazenada no banco
    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Senha incorreta" });
    }

    // Gera um token JWT
    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });

    return res.status(200).json({ message: "Login bem-sucedido", token });
  });
});
