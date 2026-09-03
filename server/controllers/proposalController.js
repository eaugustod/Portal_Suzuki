import { getDbPool } from '../db.js';

// GET /api/proposals?dealershipId=
export const getProposals = async (req, res) => {
  const isMontadora = req.user?.scopeType === 'montadora';
  const userDealer = req.user?.dealershipId;
  const targetDealer = req.query.dealershipId || (!isMontadora ? userDealer : null);

  try {
    const pool = await getDbPool();
    let query = `
      SELECT id_proposta, numero_proposta, id_concessionaria, marca, status,
             financeiro_aprovado, comercial_aprovado, protheus_integrado, documento_json,
             criado_em, atualizado_em
      FROM dbo.PropostasAprovacao
    `;
    let request = pool.request();
    if (targetDealer && targetDealer !== 'jtoledo') {
      query += ` WHERE id_concessionaria = @targetDealer`;
      request = request.input('targetDealer', targetDealer);
    }
    query += ` ORDER BY criado_em DESC`;
    const result = await request.query(query);

    const proposals = result.recordset.map(r => {
      let doc = {};
      try { doc = JSON.parse(r.documento_json || '{}'); } catch { doc = {}; }
      return {
        ...doc,
        id: r.id_proposta,
        proposalNumber: r.numero_proposta,
        dealershipId: r.id_concessionaria,
        brand: r.marca,
        status: r.status,
        financialApproved: !!r.financeiro_aprovado,
        commercialApproved: !!r.comercial_aprovado,
        protheusIntegrated: !!r.protheus_integrado
      };
    });
    res.json(proposals);
  } catch (err) {
    console.error('[Proposals API] Erro ao listar:', err);
    res.status(500).json({ error: 'Erro ao carregar propostas de aprovação.' });
  }
};

// POST /api/proposals
// Aceita o documento OrderApprovalDocument inteiro; persiste envelope + JSON completo.
export const createProposal = async (req, res) => {
  const doc = req.body;
  const isMontadora = req.user?.scopeType === 'montadora';
  const targetDealer = isMontadora ? (doc.dealershipId || null) : (req.user?.dealershipId || doc.dealershipId || null);

  if (!doc.id || !doc.proposalNumber || !targetDealer || !doc.brand) {
    return res.status(400).json({ error: 'Identificador, número, concessionária e marca da proposta são obrigatórios.' });
  }

  try {
    const pool = await getDbPool();
    await pool.request()
      .input('id', String(doc.id).substring(0, 60))
      .input('numero', String(doc.proposalNumber).substring(0, 60))
      .input('dealer', targetDealer)
      .input('marca', String(doc.brand).substring(0, 30))
      .input('status', String(doc.status || 'em_analise').substring(0, 30))
      .input('fin', doc.financialApproved ? 1 : 0)
      .input('com', doc.commercialApproved ? 1 : 0)
      .input('protheus', doc.protheusIntegrated ? 1 : 0)
      .input('json', JSON.stringify(doc))
      .query(`
        INSERT INTO dbo.PropostasAprovacao (
          id_proposta, numero_proposta, id_concessionaria, marca, status,
          financeiro_aprovado, comercial_aprovado, protheus_integrado, documento_json
        ) VALUES (
          @id, @numero, @dealer, @marca, @status,
          @fin, @com, @protheus, @json
        )
      `);
    res.status(201).json({ success: true, message: 'Proposta de aprovação criada com sucesso!', id: doc.id });
  } catch (err) {
    console.error('[Proposals API] Erro ao criar:', err);
    if (/duplicate|UNIQUE|PK/.test(err.message)) return res.status(409).json({ error: 'Já existe uma proposta com este identificador/número.' });
    res.status(500).json({ error: 'Erro ao criar proposta de aprovação.' });
  }
};

const getPool = async () => getDbPool();

// PUT /api/proposals/:id
export const updateProposal = async (req, res) => {
  const { id } = req.params;
  const doc = req.body;

  try {
    const pool = await getDbPool();
    // Verifica se a proposta existe e atualiza envelope + documento completo
    const check = await pool.request().input('id', id).query('SELECT id_proposta FROM dbo.PropostasAprovacao WHERE id_proposta = @id');
    if (check.recordset.length === 0) return res.status(404).json({ error: 'Proposta não localizada.' });

    await pool.request()
      .input('id', id)
      .input('status', String(doc.status || 'em_analise').substring(0, 30))
      .input('fin', doc.financialApproved ? 1 : 0)
      .input('com', doc.commercialApproved ? 1 : 0)
      .input('protheus', doc.protheusIntegrated ? 1 : 0)
      .input('json', JSON.stringify(doc))
      .query(`
        UPDATE dbo.PropostasAprovacao
        SET status = @status,
            financeiro_aprovado = @fin,
            comercial_aprovado = @com,
            protheus_integrado = @protheus,
            documento_json = @json,
            atualizado_em = SYSUTCDATETIME()
        WHERE id_proposta = @id
      `);
    res.json({ success: true, message: 'Proposta atualizada com sucesso!' });
  } catch (err) {
    console.error('[Proposals API] Erro ao atualizar:', err);
    res.status(500).json({ error: 'Erro ao atualizar proposta.' });
  }
};

// DELETE /api/proposals/:id
export const deleteProposal = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await getPool();
    const result = await pool.request().input('id', id).query('DELETE FROM dbo.PropostasAprovacao WHERE id_proposta = @id');
    if (result.rowsAffected[0] === 0) return res.status(404).json({ error: 'Proposta não localizada.' });
    res.json({ success: true, message: 'Proposta de aprovação removida.' });
  } catch (err) {
    console.error('[Proposals API] Erro ao excluir:', err);
    res.status(500).json({ error: 'Erro ao excluir proposta.' });
  }
};

export default { getProposals, createProposal, updateProposal, deleteProposal };
