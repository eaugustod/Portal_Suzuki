import { getDbPool } from '../db.js';

const STATUS_ALLOWED = ['Chegando', 'Atrasado', 'No Prazo'];

const rowToTransit = (r) => ({
  id: r.id_transito,
  dealershipId: r.id_concessionaria,
  batchName: r.nome_lote,
  eta: r.previsao_chegada_eta,
  status: r.status,
  location: r.localizacao_atual,
  unitsCount: r.quantidade_unidades,
  value: r.valor_lote,
  createdAt: r.criado_em ? new Date(r.criado_em).toLocaleString('pt-BR') : undefined
});

// GET /api/transit?dealershipId=
export const getTransitOrders = async (req, res) => {
  const isMontadora = req.user?.scopeType === 'montadora';
  const userDealer = req.user?.dealershipId;
  const targetDealer = req.query.dealershipId || (!isMontadora ? userDealer : null);

  try {
    const pool = await getDbPool();
    let query = `
      SELECT id_transito, id_concessionaria, nome_lote, previsao_chegada_eta, status,
             localizacao_atual, quantidade_unidades, valor_lote, criado_em
      FROM dbo.OrdensTransito
    `;
    let request = pool.request();
    if (targetDealer && targetDealer !== 'jtoledo') {
      query += ` WHERE id_concessionaria = @targetDealer`;
      request = request.input('targetDealer', targetDealer);
    }
    query += ` ORDER BY criado_em DESC`;
    const result = await request.query(query);
    res.json(result.recordset.map(rowToTransit));
  } catch (err) {
    console.error('[Transit API] Erro ao listar:', err);
    res.status(500).json({ error: 'Erro ao carregar lotes em trânsito.' });
  }
};

// POST /api/transit (criado automaticamente quando pedido é integrado ao Protheus)
export const createTransitOrder = async (req, res) => {
  const { dealershipId, batchName, eta, status, location, unitsCount, value } = req.body;
  const isMontadora = req.user?.scopeType === 'montadora';
  const targetDealer = isMontadora ? (dealershipId || null) : (req.user?.dealershipId || dealershipId || null);

  if (!targetDealer || !batchName || !unitsCount) {
    return res.status(400).json({ error: 'Concessionária, nome do lote e quantidade são obrigatórios.' });
  }
  const finalStatus = status || 'No Prazo';
  if (!STATUS_ALLOWED.includes(finalStatus)) return res.status(400).json({ error: 'Status inválido.' });

  try {
    const pool = await getDbPool();
    const id = req.body.id || `to-${Date.now()}`;
    await pool.request()
      .input('id', id)
      .input('dealer', targetDealer)
      .input('lote', String(batchName).substring(0, 100))
      .input('eta', String(eta || 'Previsão: 4 dias úteis').substring(0, 50))
      .input('status', finalStatus)
      .input('loc', location ? String(location).substring(0, 150) : null)
      .input('qtd', Number(unitsCount))
      .input('valor', Number(value) || 0)
      .query(`
        INSERT INTO dbo.OrdensTransito (
          id_transito, id_concessionaria, nome_lote, previsao_chegada_eta,
          status, localizacao_atual, quantidade_unidades, valor_lote
        ) VALUES (
          @id, @dealer, @lote, @eta,
          @status, @loc, @qtd, @valor
        )
      `);
    res.status(201).json({ success: true, message: 'Lote em trânsito registrado com sucesso!', id });
  } catch (err) {
    console.error('[Transit API] Erro ao criar:', err);
    res.status(500).json({ error: 'Erro ao registrar lote em trânsito.' });
  }
};

// DELETE /api/transit/:id
export const deleteTransitOrder = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await getDbPool();
    const result = await pool.request().input('id', id).query('DELETE FROM dbo.OrdensTransito WHERE id_transito = @id');
    if (result.rowsAffected[0] === 0) return res.status(404).json({ error: 'Lote não localizado.' });
    res.json({ success: true, message: 'Lote em trânsito removido.' });
  } catch (err) {
    console.error('[Transit API] Erro ao excluir:', err);
    res.status(500).json({ error: 'Erro ao excluir lote em trânsito.' });
  }
};

export default { getTransitOrders, createTransitOrder, deleteTransitOrder };
