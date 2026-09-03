import { getDbPool } from '../db.js';

const ESTAGIOS = ['lead', 'proposta', 'documentacao', 'entrega'];
const TIPOS_INTERACAO = ['lead', 'whatsapp', 'call', 'email', 'visita', 'sistema'];

const statusLabelMap = {
  lead: 'Contato Inicial',
  proposta: 'Negociação Aberta',
  documentacao: 'Faturamento Bancário',
  entrega: 'Entrega Técnica'
};

const rowToPipelineCard = (r) => ({
  id: r.id_lead,
  dealershipId: r.id_concessionaria,
  customerName: r.nome_cliente,
  type: r.estagio,
  vehicleInterest: r.veiculo_interesse,
  value: r.valor_proposta,
  notes: r.notas,
  phone: r.telefone,
  email: r.email,
  hot: !!r.lead_quente,
  statusLabel: statusLabelMap[r.estagio] || r.estagio,
  createdAt: r.criado_em ? new Date(r.criado_em).toLocaleString('pt-BR') : undefined
});

// GET /api/sales/pipeline?dealershipId=
export const getPipeline = async (req, res) => {
  const isMontadora = req.user?.scopeType === 'montadora';
  const userDealer = req.user?.dealershipId;
  const targetDealer = req.query.dealershipId || (!isMontadora ? userDealer : null);

  try {
    const pool = await getDbPool();
    let query = `
      SELECT id_lead, id_concessionaria, nome_cliente, estagio, veiculo_interesse,
             valor_proposta, notas, telefone, email, lead_quente, criado_em
      FROM dbo.CrmPipelineLeads
    `;
    let request = pool.request();
    if (targetDealer && targetDealer !== 'jtoledo') {
      query += ` WHERE id_concessionaria = @targetDealer`;
      request = request.input('targetDealer', targetDealer);
    }
    query += ` ORDER BY criado_em DESC`;
    const result = await request.query(query);
    res.json(result.recordset.map(rowToPipelineCard));
  } catch (err) {
    console.error('[Sales API] Erro ao listar pipeline:', err);
    res.status(500).json({ error: 'Erro ao carregar pipeline de vendas.' });
  }
};

// POST /api/sales/pipeline
export const createPipelineLead = async (req, res) => {
  const { dealershipId, customerName, type, vehicleInterest, value, notes, phone, email, hot } = req.body;
  const isMontadora = req.user?.scopeType === 'montadora';
  const targetDealer = isMontadora ? (dealershipId || null) : (req.user?.dealershipId || dealershipId || null);

  if (!targetDealer) return res.status(400).json({ error: 'Concessionária é obrigatória.' });
  if (!customerName || !vehicleInterest) return res.status(400).json({ error: 'Nome do cliente e veículo de interesse são obrigatórios.' });
  const estagio = type || 'lead';
  if (!ESTAGIOS.includes(estagio)) return res.status(400).json({ error: 'Estágio de pipeline inválido.' });

  try {
    const pool = await getDbPool();
    const id = req.body.id || `lead-${Date.now()}`;
    await pool.request()
      .input('id', id)
      .input('dealer', targetDealer)
      .input('nome', String(customerName).substring(0, 150))
      .input('estagio', estagio)
      .input('veiculo', String(vehicleInterest).substring(0, 100))
      .input('valor', Number(value) || 0)
      .input('notas', notes || null)
      .input('tel', phone ? String(phone).substring(0, 30) : null)
      .input('email', email ? String(email).substring(0, 150) : null)
      .input('quente', hot ? 1 : 0)
      .query(`
        INSERT INTO dbo.CrmPipelineLeads (
          id_lead, id_concessionaria, nome_cliente, estagio, veiculo_interesse,
          valor_proposta, notas, telefone, email, lead_quente
        ) VALUES (
          @id, @dealer, @nome, @estagio, @veiculo,
          @valor, @notas, @tel, @email, @quente
        )
      `);
    res.status(201).json({ success: true, message: 'Lead cadastrado no pipeline com sucesso!', id });
  } catch (err) {
    console.error('[Sales API] Erro ao criar lead:', err);
    res.status(500).json({ error: 'Erro ao cadastrar lead.' });
  }
};

// PATCH /api/sales/pipeline/:id/status { type }
export const movePipelineLead = async (req, res) => {
  const { id } = req.params;
  const { type } = req.body;
  if (!ESTAGIOS.includes(type)) return res.status(400).json({ error: 'Estágio de pipeline inválido.' });

  try {
    const pool = await getDbPool();
    const result = await pool.request()
      .input('id', id)
      .input('estagio', type)
      .query('UPDATE dbo.CrmPipelineLeads SET estagio = @estagio WHERE id_lead = @id');
    if (result.rowsAffected[0] === 0) return res.status(404).json({ error: 'Lead não localizado.' });
    res.json({ success: true, message: `Lead movido para ${type}.` });
  } catch (err) {
    console.error('[Sales API] Erro ao mover lead:', err);
    res.status(500).json({ error: 'Erro ao mover lead de estágio.' });
  }
};

// DELETE /api/sales/pipeline/:id
export const deletePipelineLead = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await getDbPool();
    const result = await pool.request().input('id', id).query('DELETE FROM dbo.CrmPipelineLeads WHERE id_lead = @id');
    if (result.rowsAffected[0] === 0) return res.status(404).json({ error: 'Lead não localizado.' });
    res.json({ success: true, message: 'Lead removido do pipeline.' });
  } catch (err) {
    console.error('[Sales API] Erro ao excluir lead:', err);
    res.status(500).json({ error: 'Erro ao excluir lead.' });
  }
};

// GET /api/sales/interactions?dealershipId=
export const getInteractions = async (req, res) => {
  const isMontadora = req.user?.scopeType === 'montadora';
  const userDealer = req.user?.dealershipId;
  const targetDealer = req.query.dealershipId || (!isMontadora ? userDealer : null);

  try {
    const pool = await getDbPool();
    let query = `
      SELECT id_interacao, id_concessionaria, tipo, titulo, descricao, criado_em
      FROM dbo.InteracoesCrm
    `;
    let request = pool.request();
    if (targetDealer && targetDealer !== 'jtoledo') {
      query += ` WHERE id_concessionaria = @targetDealer`;
      request = request.input('targetDealer', targetDealer);
    }
    query += ` ORDER BY criado_em DESC`;
    const result = await request.query(query);
    res.json(result.recordset.map(r => ({
      id: r.id_interacao,
      dealershipId: r.id_concessionaria,
      type: r.tipo,
      title: r.titulo,
      description: r.descricao,
      time: r.criado_em ? new Date(r.criado_em).toLocaleString('pt-BR') : undefined
    })));
  } catch (err) {
    console.error('[Sales API] Erro ao listar interações:', err);
    res.status(500).json({ error: 'Erro ao carregar interações.' });
  }
};

// POST /api/sales/interactions
export const createInteraction = async (req, res) => {
  const { dealershipId, type, title, description } = req.body;
  const isMontadora = req.user?.scopeType === 'montadora';
  const targetDealer = isMontadora ? (dealershipId || null) : (req.user?.dealershipId || dealershipId || null);

  if (!targetDealer) return res.status(400).json({ error: 'Concessionária é obrigatória.' });
  if (!title) return res.status(400).json({ error: 'Título da interação é obrigatório.' });
  const tipo = type || 'lead';
  if (!TIPOS_INTERACAO.includes(tipo)) return res.status(400).json({ error: 'Tipo de interação inválido.' });

  try {
    const pool = await getDbPool();
    const id = req.body.id || `log-${Date.now()}`;
    await pool.request()
      .input('id', id)
      .input('dealer', targetDealer)
      .input('tipo', tipo)
      .input('titulo', String(title).substring(0, 200))
      .input('desc', description ? String(description).substring(0, 4000) : null)
      .query(`
        INSERT INTO dbo.InteracoesCrm (id_interacao, id_concessionaria, tipo, titulo, descricao)
        VALUES (@id, @dealer, @tipo, @titulo, @desc)
      `);
    res.status(201).json({ success: true, message: 'Interação registrada com sucesso!', id });
  } catch (err) {
    console.error('[Sales API] Erro ao criar interação:', err);
    res.status(500).json({ error: 'Erro ao registrar interação.' });
  }
};

export default {
  getPipeline,
  createPipelineLead,
  movePipelineLead,
  deletePipelineLead,
  getInteractions,
  createInteraction
};
