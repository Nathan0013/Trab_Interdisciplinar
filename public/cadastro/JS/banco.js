const mysql = require("mysql2/promise");
require("dotenv").config();

// Criar pool de conexões para melhor performance
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Teste de conexão inicial
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("Conexão com o banco de dados estabelecida com sucesso");
    connection.release();
    return true;
  } catch (error) {
    console.error("Erro ao conectar ao banco de dados:", error);
    return false;
  }
}

// Testar conexão na inicialização
testConnection();

module.exports = pool;