import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { getDbPool } from '../db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runSqlFile(pool, relativePath) {
  const fullPath = path.join(__dirname, relativePath);
  console.log(`[SQL Migration] Lendo ${fullPath}...`);
  const sqlContent = fs.readFileSync(fullPath, 'utf-8');

  // Quebra por comandos 'GO'
  const batches = sqlContent
    .split(/\bGO\b/gi)
    .map(b => b.trim())
    .filter(b => b.length > 0);

  console.log(`[SQL Migration] Executando ${batches.length} lote(s) SQL de ${relativePath}...`);
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    try {
      await pool.request().query(batch);
    } catch (err) {
      console.error(`[SQL Migration] Erro no lote ${i + 1}:`, err.message);
      throw err;
    }
  }
  console.log(`[SQL Migration] Concluído com sucesso: ${relativePath}`);
}

async function main() {
  try {
    const pool = await getDbPool();
    console.log('[SQL Migration] Conectado ao SQL Server. Iniciando criação do Schema...');
    
    // 1. Tabelas
    await runSqlFile(pool, 'init_schema.sql');
    
    // 2. Triggers, Views e Procedures
    await runSqlFile(pool, 'init_programmability.sql');

    // 3. Tabelas/colunas operacionais adicionais (migration idempotente)
    await runSqlFile(pool, 'init_extra_tables.sql');

    // 4. Verificação
    const res = await pool.request().query("SELECT COUNT(*) AS total_tables FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE='BASE TABLE'");
    console.log(`[SQL Migration] Sucesso! Total de tabelas criadas no banco PortalSuzukiDB: ${res.recordset[0].total_tables}`);
    
    process.exit(0);
  } catch (err) {
    console.error('[SQL Migration] Falha crítica na migração do banco de dados:', err);
    process.exit(1);
  }
}

main();
