import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { getDbPool } from './db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Rota de Healthcheck
app.get('/api/health', async (req, res) => {
  try {
    const pool = await getDbPool();
    const result = await pool.request().query('SELECT 1 AS alive');
    res.json({
      status: 'ok',
      service: 'Portal Suzuki API',
      database: result.recordset[0].alive === 1 ? 'connected' : 'unknown',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      service: 'Portal Suzuki API',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Servir arquivos estáticos do React em produção
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// Redireciona todas as rotas SPA para o index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Portal Suzuki Server] Rodando na porta ${PORT}`);
});
