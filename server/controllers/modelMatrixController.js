import { getDbPool } from '../db.js';

// GET /api/model-matrix?dealershipId=
export const getModelMatrix = async (req, res) => {
  const isMontadora = req.user?.scopeType === 'montadora';
  const userDealer = req.user?.dealershipId;
  const targetDealer = req.query.dealershipId || (!isMontadora ? userDealer : 'jtoledo');

  try {
    const pool = await getDbPool();
    const request = pool.request().input('dealer', targetDealer || 'jtoledo');
    const result = await request.query(`
      SELECT chave_item, habilitado
      FROM dbo.MatrizHabilitacaoModelos
      WHERE id_concessionaria = @dealer
    `);
    const map = {};
    for (const row of result.recordset) {
      map[row.chave_item] = !!row.habilitado;
    }
    res.json({ dealershipId: targetDealer || 'jtoledo', enabledMap: map });
  } catch (err) {
    console.error('[ModelMatrix API] Erro ao listar:', err);
    res.status(500).json({ error: 'Erro ao carregar matriz de habilitação de modelos.' });
  }
};

// PUT /api/model-matrix  { dealershipId, enabledMap: { chave: bool } }
export const saveModelMatrix = async (req, res) => {
  const { dealershipId, enabledMap } = req.body;
  const isMontadora = req.user?.scopeType === 'montadora';
  const targetDealer = isMontadora ? (dealershipId || 'jtoledo') : (req.user?.dealershipId || 'jtoledo');

  if (!enabledMap || typeof enabledMap !== 'object') {
    return res.status(400).json({ error: 'Matriz de habilitação inválida.' });
  }

  try {
    const pool = await getDbPool();
    const entries = Object.entries(enabledMap);
    for (const [chave, habilitado] of entries) {
      await pool.request()
        .input('dealer', targetDealer)
        .input('chave', String(chave).substring(0, 100))
        .input('hab', habilitado ? 1 : 0)
        .query(`
          IF EXISTS (SELECT 1 FROM dbo.MatrizHabilitacaoModelos WHERE id_concessionaria = @dealer AND chave_item = @chave)
          BEGIN
            UPDATE dbo.MatrizHabilitacaoModelos
            SET habilitado = @hab, atualizado_em = SYSUTCDATETIME()
            WHERE id_concessionaria = @dealer AND chave_item = @chave
          END
          ELSE
          BEGIN
            INSERT INTO dbo.MatrizHabilitacaoModelos (id_concessionaria, chave_item, habilitado)
            VALUES (@dealer, @chave, @hab)
          END
        `);
    }
    res.json({ success: true, message: `Matriz de habilitação atualizada (${entries.length} chave(s)).` });
  } catch (err) {
    console.error('[ModelMatrix API] Erro ao salvar:', err);
    res.status(500).json({ error: 'Erro ao salvar matriz de habilitação.' });
  }
};

export default { getModelMatrix, saveModelMatrix };
