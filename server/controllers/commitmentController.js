import { getDbPool, sql } from '../db.js';

const STATUS_ALLOWED = ['rascunho', 'enviado', 'em_analise', 'aprovado_fabrica', 'ajustado_fabrica', 'rejeitado'];

const toPayloadRow = (c) => ({
  id: c.id_compromisso,
  dealershipId: c.id_concessionaria,
  dealershipName: c.nome_curto,
  legalName: c.razao_social,
  dealerCode: c.codigo_dealer,
  brand: c.marca,
  period: c.trimestre_referencia,
  periodYear: c.periodo_ano,
  month1Label: c.rotulo_mes1,
  month2Label: c.rotulo_mes2,
  month3Label: c.rotulo_mes3,
  regionalComercial: c.regional_comercial,
  regionalFinanceira: c.regional_financeira,
  avgMonthlyRegistration: c.media_mensal_emplacamentos,
  dealerTier: c.classificacao_tier,
  bikesPerInvoice: c.motos_por_faturamento,
  transporterCode: c.codigo_transportadora,
  originCode: c.codigo_origem,
  status: c.status,
  totalUnitsMonth1: c.total_unidades_mes1,
  totalUnitsMonth2: c.total_unidades_mes2,
  totalUnitsMonth3: c.total_unidades_mes3,
  totalEstimatedAmount: c.valor_total_estimado,
  factoryNotes: c.notas_fabrica,
  dealerNotes: c.notas_dealer,
  createdAt: c.criado_em ? new Date(c.criado_em).toLocaleString('pt-BR') : undefined,
  submittedAt: c.enviado_em ? new Date(c.enviado_em).toLocaleString('pt-BR') : undefined,
  submittedBy: c.enviado_por,
  reviewedAt: c.revisado_em ? new Date(c.revisado_em).toLocaleString('pt-BR') : undefined,
  reviewedBy: c.revisado_por,
  linkedApprovalProposalId: c.id_proposta_aprovacao,
  items: c.items || []
});

const toItemRow = (i) => ({
  id: i.id_item,
  model: i.nome_modelo,
  brand: i.marca,
  category: i.categoria,
  currentStockOwn: i.estoque_proprio_atual,
  currentStockBinBlocked: i.estoque_bin_bloqueado,
  currentStockBinLiberated: i.estoque_bin_liberado,
  month1Commitment: i.compromisso_mes1,
  month1Purchase: i.compra_mes1,
  month2Commitment: i.compromisso_mes2,
  month2Purchase: i.compra_mes2,
  month3Commitment: i.compromisso_mes3,
  month3Purchase: i.compra_mes3,
  suggestedMSRPUnit: i.preco_publico_sugerido,
  factoryCostUnit: i.custo_fabrica_unitario,
  notes: i.notas
});

// GET /api/commitments?dealershipId=
export const getCommitments = async (req, res) => {
  const userScope = req.user?.dealershipId;
  const isMontadora = req.user?.scopeType === 'montadora';
  const targetDealer = req.query.dealershipId || (!isMontadora ? userScope : null);

  try {
    const pool = await getDbPool();
    let query = `
      SELECT 
        c.id_compromisso,
        c.id_concessionaria,
        d.nome_curto,
        d.razao_social,
        d.codigo_dealer,
        c.marca,
        c.trimestre_referencia,
        c.periodo_ano,
        c.rotulo_mes1,
        c.rotulo_mes2,
        c.rotulo_mes3,
        c.regional_comercial,
        c.regional_financeira,
        c.media_mensal_emplacamentos,
        d.classificacao_tier,
        c.motos_por_faturamento,
        c.codigo_transportadora,
        c.codigo_origem,
        c.status,
        c.total_unidades_mes1,
        c.total_unidades_mes2,
        c.total_unidades_mes3,
        c.valor_total_estimado,
        c.notas_fabrica,
        c.notas_dealer,
        c.enviado_por,
        c.enviado_em,
        c.revisado_por,
        c.revisado_em,
        c.id_proposta_aprovacao,
        c.criado_em
      FROM dbo.CompromissosCompra c
      INNER JOIN dbo.Concessionarias d ON c.id_concessionaria = d.id_concessionaria
    `;

    let request = pool.request();
    if (targetDealer && targetDealer !== 'jtoledo') {
      query += ` WHERE c.id_concessionaria = @targetDealer`;
      request = request.input('targetDealer', targetDealer);
    }

    query += ` ORDER BY c.criado_em DESC`;

    const cmtRes = await request.query(query);

    // Itens
    const itemsRes = await pool.request().query(`
      SELECT * FROM dbo.CompromissoCompraItens
    `);

    const itemsByCommitment = {};
    for (const item of itemsRes.recordset) {
      if (!itemsByCommitment[item.id_compromisso]) itemsByCommitment[item.id_compromisso] = [];
      itemsByCommitment[item.id_compromisso].push(toItemRow(item));
    }

    const commitments = cmtRes.recordset.map(c => toPayloadRow({ ...c, items: itemsByCommitment[c.id_compromisso] || [] }));
    res.json(commitments);
  } catch (err) {
    console.error('[Commitments API] Erro ao listar:', err);
    res.status(500).json({ error: 'Erro ao carregar compromissos trimestrais.' });
  }
};

// POST /api/commitments
// Cria compromisso trimestral com itens (transação atômica)
export const createCommitment = async (req, res) => {
  const {
    id,
    dealershipId,
    brand,
    period,
    periodYear,
    month1Label,
    month2Label,
    month3Label,
    regionalComercial,
    regionalFinanceira,
    avgMonthlyRegistration,
    bikesPerInvoice,
    transporterCode,
    originCode,
    totalUnitsMonth1,
    totalUnitsMonth2,
    totalUnitsMonth3,
    totalEstimatedAmount,
    notes,
    dealerNotes,
    items
  } = req.body;

  const isMontadora = req.user?.scopeType === 'montadora';
  const targetDealer = isMontadora ? (dealershipId || null) : (req.user?.dealershipId || dealershipId || null);

  if (!targetDealer || !brand || !period) {
    return res.status(400).json({ error: 'Concessionária, marca e trimestre de referência são obrigatórios.' });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'O compromisso deve conter ao menos um item.' });
  }

  const commitmentId = id || `comp-${Date.now()}`;
  const totalM1 = Number(totalUnitsMonth1) || items.reduce((s, it) => s + Number(it.month1Commitment || 0), 0);
  const totalM2 = Number(totalUnitsMonth2) || items.reduce((s, it) => s + Number(it.month2Commitment || 0), 0);
  const totalM3 = Number(totalUnitsMonth3) || items.reduce((s, it) => s + Number(it.month3Commitment || 0), 0);
  const totalValue = Number(totalEstimatedAmount) || items.reduce((s, it) => s + (Number(it.month1Commitment || 0) + Number(it.month2Commitment || 0) + Number(it.month3Commitment || 0)) * Number(it.factoryCostUnit || 0), 0);

  let transaction;
  try {
    const pool = await getDbPool();
    transaction = new sql.Transaction(pool);
    await transaction.begin();

    await transaction.request()
      .input('id', commitmentId)
      .input('dealer', targetDealer)
      .input('marca', String(brand).substring(0, 30))
      .input('trimestre', String(period).substring(0, 20))
      .input('ano', Number(periodYear) || new Date().getFullYear())
      .input('mes1', String(month1Label || '').substring(0, 30))
      .input('mes2', String(month2Label || '').substring(0, 30))
      .input('mes3', String(month3Label || '').substring(0, 30))
      .input('reg_com', regionalComercial ? String(regionalComercial).substring(0, 100) : null)
      .input('reg_fin', regionalFinanceira ? String(regionalFinanceira).substring(0, 100) : null)
      .input('media', Number(avgMonthlyRegistration) || 0)
      .input('motos', Number(bikesPerInvoice) || 4)
      .input('transp', transporterCode ? String(transporterCode).substring(0, 50) : null)
      .input('origem', originCode ? String(originCode).substring(0, 20) : null)
      .input('total1', totalM1)
      .input('total2', totalM2)
      .input('total3', totalM3)
      .input('valor', totalValue)
      .input('notas_dealer', dealerNotes || notes || null)
      .query(`
        INSERT INTO dbo.CompromissosCompra (
          id_compromisso, id_concessionaria, marca, trimestre_referencia, periodo_ano,
          rotulo_mes1, rotulo_mes2, rotulo_mes3, regional_comercial, regional_financeira,
          media_mensal_emplacamentos, motos_por_faturamento, codigo_transportadora, codigo_origem,
          status, total_unidades_mes1, total_unidades_mes2, total_unidades_mes3,
          valor_total_estimado, notas_dealer
        ) VALUES (
          @id, @dealer, @marca, @trimestre, @ano,
          @mes1, @mes2, @mes3, @reg_com, @reg_fin,
          @media, @motos, @transp, @origem,
          'rascunho', @total1, @total2, @total3,
          @valor, @notas_dealer
        )
      `);

    for (const it of items) {
      const itemId = it.id || `ci-${commitmentId}-${items.indexOf(it) + 1}`;
      await transaction.request()
        .input('id_item', itemId)
        .input('id_comp', commitmentId)
        .input('modelo', String(it.model).substring(0, 100))
        .input('marca', String(it.brand || brand).substring(0, 30))
        .input('cat', it.category ? String(it.category).substring(0, 50) : null)
        .input('est_proprio', Number(it.currentStockOwn) || 0)
        .input('est_bin_bloq', Number(it.currentStockBinBlocked) || 0)
        .input('est_bin_lib', Number(it.currentStockBinLiberated) || 0)
        .input('comp1', Number(it.month1Commitment) || 0)
        .input('compra1', Number(it.month1Purchase) || 0)
        .input('comp2', Number(it.month2Commitment) || 0)
        .input('compra2', Number(it.month2Purchase) || 0)
        .input('comp3', Number(it.month3Commitment) || 0)
        .input('compra3', Number(it.month3Purchase) || 0)
        .input('pps', Number(it.suggestedMSRPUnit) || 0)
        .input('custo', Number(it.factoryCostUnit) || 0)
        .input('notas', it.notes ? String(it.notes).substring(0, 255) : null)
        .query(`
          INSERT INTO dbo.CompromissoCompraItens (
            id_item, id_compromisso, nome_modelo, marca, categoria,
            estoque_proprio_atual, estoque_bin_bloqueado, estoque_bin_liberado,
            compromisso_mes1, compra_mes1, compromisso_mes2, compra_mes2,
            compromisso_mes3, compra_mes3, preco_publico_sugerido, custo_fabrica_unitario, notas
          ) VALUES (
            @id_item, @id_comp, @modelo, @marca, @cat,
            @est_proprio, @est_bin_bloq, @est_bin_lib,
            @comp1, @compra1, @comp2, @compra2,
            @comp3, @compra3, @pps, @custo, @notas
          )
        `);
    }

    await transaction.commit();
    res.status(201).json({ success: true, message: 'Compromisso trimestral criado com sucesso!', id: commitmentId });
  } catch (err) {
    if (transaction) {
      try { await transaction.rollback(); } catch (e) { console.error('[Commitments API] Rollback falhou:', e.message); }
    }
    console.error('[Commitments API] Erro ao criar:', err);
    if (/duplicate|UNIQUE|PK/.test(err.message)) return res.status(409).json({ error: 'Já existe um compromisso com este identificador.' });
    res.status(500).json({ error: 'Erro ao criar compromisso trimestral.' });
  }
};

// PUT /api/commitments/:id
export const updateCommitment = async (req, res) => {
  const { id } = req.params;
  const {
    status,
    factoryNotes,
    dealerNotes,
    linkedApprovalProposalId,
    notes
  } = req.body;

  if (status && !STATUS_ALLOWED.includes(status)) return res.status(400).json({ error: 'Status inválido.' });

  const userEmail = req.user?.email || 'gestao.rede@jtoledo.com.br';

  try {
    const pool = await getDbPool();
    const result = await pool.request()
      .input('id', id)
      .input('status', status || null)
      .input('notas_fab', factoryNotes || notes || null)
      .input('notas_dealer', dealerNotes || null)
      .input('prop', linkedApprovalProposalId || null)
      .input('usr', userEmail)
      .query(`
        UPDATE dbo.CompromissosCompra
        SET status = ISNULL(@status, status),
            notas_fabrica = ISNULL(@notas_fab, notas_fabrica),
            notas_dealer = ISNULL(@notas_dealer, notas_dealer),
            id_proposta_aprovacao = ISNULL(@prop, id_proposta_aprovacao),
            enviado_por = CASE WHEN @status = 'enviado' AND status <> 'enviado' THEN @usr ELSE enviado_por END,
            enviado_em = CASE WHEN @status = 'enviado' AND status <> 'enviado' THEN SYSUTCDATETIME() ELSE enviado_em END,
            revisado_por = CASE WHEN @status IN ('aprovado_fabrica', 'ajustado_fabrica', 'rejeitado') THEN @usr ELSE revisado_por END,
            revisado_em = CASE WHEN @status IN ('aprovado_fabrica', 'ajustado_fabrica', 'rejeitado') THEN SYSUTCDATETIME() ELSE revisado_em END,
            atualizado_em = SYSUTCDATETIME()
        WHERE id_compromisso = @id
      `);
    if (result.rowsAffected[0] === 0) return res.status(404).json({ error: 'Compromisso não localizado.' });
    res.json({ success: true, message: `Compromisso atualizado para ${status || 'mesmos dados'}.` });
  } catch (err) {
    console.error('[Commitments API] Erro ao atualizar:', err);
    res.status(500).json({ error: 'Erro ao atualizar compromisso.' });
  }
};

// DELETE /api/commitments/:id (apenas rascunho, para proteger histórico)
export const deleteCommitment = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await getDbPool();
    // Verifica se é rascunho (único caso removível por regra de negócio)
    const check = await pool.request().input('id', id).query('SELECT status FROM dbo.CompromissosCompra WHERE id_compromisso = @id');
    if (check.recordset.length === 0) return res.status(404).json({ error: 'Compromisso não localizado.' });
    if (check.recordset[0].status !== 'rascunho') {
      return res.status(422).json({ error: 'Somente compromissos em rascunho podem ser excluídos.' });
    }
    const result = await pool.request().input('id', id).query('DELETE FROM dbo.CompromissosCompra WHERE id_compromisso = @id');
    if (result.rowsAffected[0] === 0) return res.status(404).json({ error: 'Compromisso não localizado.' });
    res.json({ success: true, message: 'Compromisso removido.' });
  } catch (err) {
    console.error('[Commitments API] Erro ao excluir:', err);
    res.status(500).json({ error: 'Erro ao excluir compromisso.' });
  }
};

// PATCH /api/commitments/:id/status (decisão da montadora)
export const updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status, factoryNotes } = req.body;
  if (status && !STATUS_ALLOWED.includes(status)) return res.status(400).json({ error: 'Status inválido.' });
  const userEmail = req.user?.email || 'gestao.rede@jtoledo.com.br';

  try {
    const pool = await getDbPool();
    await pool.request()
      .input('id', id)
      .input('status', status)
      .input('notas', factoryNotes || null)
      .input('usr', userEmail)
      .query(`
        UPDATE dbo.CompromissosCompra
        SET status = @status,
            notas_fabrica = ISNULL(@notas, notas_fabrica),
            revisado_por = @usr,
            revisado_em = SYSUTCDATETIME(),
            atualizado_em = SYSUTCDATETIME()
        WHERE id_compromisso = @id
      `);

    res.json({ success: true, message: `Status do compromisso atualizado para ${status}.` });
  } catch (err) {
    console.error('[Commitments API] Erro ao atualizar status:', err);
    res.status(500).json({ error: 'Erro ao salvar decisão da montadora.' });
  }
};

export default { getCommitments, createCommitment, updateCommitment, deleteCommitment, updateStatus };
