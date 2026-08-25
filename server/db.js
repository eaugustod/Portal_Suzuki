import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  user: process.env.DB_USER || 'PortalSuzuki',
  password: process.env.DB_PASSWORD || '',
  server: process.env.DB_SERVER || '172.16.0.31',
  port: parseInt(process.env.DB_PORT || '1433', 10),
  database: process.env.DB_NAME || 'PortalSuzukiDB',
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true', // true para Azure, false para servidores locais
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERT !== 'false', // true para certificados autoassinados
    connectTimeout: 15000,
    requestTimeout: 30000,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let poolPromise = null;

export const getDbPool = async () => {
  if (!poolPromise) {
    poolPromise = new sql.ConnectionPool(dbConfig)
      .connect()
      .then((pool) => {
        console.log(`[SQL Server] Conectado com sucesso ao banco ${dbConfig.database} em ${dbConfig.server}:${dbConfig.port}`);
        return pool;
      })
      .catch((err) => {
        console.error('[SQL Server] Erro ao conectar com o banco de dados:', err.message);
        poolPromise = null;
        throw err;
      });
  }
  return poolPromise;
};

export default {
  getDbPool,
  sql,
};
