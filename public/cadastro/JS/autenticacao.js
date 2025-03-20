const jwt = require("jsonwebtoken");
require("dotenv").config();

/**
 * Middleware para verificar se o usuário está autenticado
 * @param {Object} req - Objeto de requisição do Express
 * @param {Object} res - Objeto de resposta do Express
 * @param {Function} next - Função next do Express
 */
function verificarToken(req, res, next) {
  // Obter o cabeçalho de autorização
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: "Token não fornecido" });
  }
  
  // Verificar formato do cabeçalho (Bearer TOKEN)
  const parts = authHeader.split(' ');
  if (parts.length !== 2) {
    return res.status(401).json({ error: "Erro no formato do token" });
  }
  
  const [scheme, token] = parts;
  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ error: "Token mal formatado" });
  }
  
  // Verificar validade do token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Token inválido" });
    }
    
    // Armazenar o ID do usuário na requisição para uso posterior
    req.userId = decoded.id;
    return next();
  });
}

module.exports = verificarToken;