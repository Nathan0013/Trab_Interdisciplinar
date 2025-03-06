const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000; // Porta do servidor

// Servir arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, "public")));

// Iniciar servidor e permitir acesso na rede local
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor rodando em: http://localhost:${PORT}`);
  console.log(`Acesse pela rede local: http://192.168.15.1:${PORT}`);
});
