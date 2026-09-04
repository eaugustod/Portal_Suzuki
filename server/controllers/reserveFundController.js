import { getDbPool } from '../db.js';

// GET /api/reserve-fund/statement
export const getStatement = async (req, res) => {
  const userScope = req.user?.dealershipId;
  const isMontadora = req.user?.scopeType === 'montadora';
  const targetDealer = req.query.dealershipId || (!isMontadora ? userScope : null);

  try {
    const pool = await getDbPool();
    let query = `
      SELECT 
        rf.id_lancamento AS id,
        rf.id_concessionaria AS dealershipId,
        c.nome_curto AS dealershipName,
        rf.tipo AS type,
        CASE 
          WHEN rf.origem = 'ajuste_direto' AND (CHARINDEX('[SOLICITADO POR', rf.observacao) > 0 OR CHARINDEX('SOLICITAÇÃO', rf.referencia) > 0) THEN 'solicitacao_concessionaria'
          ELSE rf.origem 
        END AS origin,
        rf.marca AS brand,
        rf.valor AS amount,
        rf.referencia AS reference,
        rf.nome_modelo AS modelName,
        rf.chassi,
        rf.id_pedido AS orderId,
        CASE
          WHEN rf.origem = 'ajuste_direto' AND (CHARINDEX('[SOLICITADO POR', rf.observacao) > 0 OR CHARINDEX('SOLICITAÇÃO', rf.referencia) > 0) AND rf.status = 'pendente_financeiro' THEN 'aguardando_aprovacao'
          ELSE rf.status
        END AS status,
        rf.financeiro_aprovado AS financialApproved,
        rf.aprovado_por AS financialApprovedBy,
        CONVERT(VARCHAR(19), rf.aprovado_em, 120) AS financialApprovedAt,
        rf.usuario_responsavel AS userResponsible,
        rf.saldo_resultante AS runningBalance,
        rf.observacao AS observation,
        CONVERT(VARCHAR(10), rf.data_lancamento, 103) AS date
      FROM dbo.FundoReservaLancamentos rf
      INNER JOIN dbo.Concessionarias c ON rf.id_concessionaria = c.id_concessionaria
    `;

    let request = pool.request();
    if (targetDealer && targetDealer !== 'jtoledo') {
      query += ` WHERE rf.id_concessionaria = @targetDealer`;
      request = request.input('targetDealer', targetDealer);
    }

    query += ` ORDER BY rf.data_lancamento DESC`;

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error('[Reserve Fund API] Erro ao carregar extrato:', err);
    res.status(500).json({ error: 'Erro ao carregar extrato do Fundo de Reserva.' });
  }
};

// POST /api/reserve-fund/credit
export const createCredit = async (req, res) => {
  const { dealershipId, amount, brand, reference, modelName, chassi, origin, observation } = req.body;
  const userEmail = req.user?.email || 'comercial@jtoledo.com.br';

  if (!dealershipId || !amount || amount <= 0) {
    return res.status(400).json({ error: 'Concessionária e valor válido são obrigatórios.' });
  }

  // Se origem for RD Station, status é pendente_financeiro
  const isRdStation = origin === 'rd_station';
  const status = isRdStation ? 'pendente_financeiro' : 'aprovado';
  const finApproved = !isRdStation;

  try {
    const pool = await getDbPool();
    const dealerRes = await pool.request()
      .input('id', dealershipId)
      .query('SELECT saldo_fundo_reserva FROM dbo.Concessionarias WHERE id_concessionaria = @id');

    if (dealerRes.recordset.length === 0) {
      return res.status(404).json({ error: 'Concessionária não localizada.' });
    }

    const currentBalance = Number(dealerRes.recordset[0].saldo_fundo_reserva) || 0;
    const nextBalance = finApproved ? (currentBalance + Number(amount)) : currentBalance;

    const idLanc = `rf-c-${Date.now()}`;
    await pool.request()
      .input('id', idLanc)
      .input('dealer', dealershipId)
      .input('origem', origin || 'montadora_credito')
      .input('marca', brand || 'Suzuki')
      .input('valor', amount)
      .input('ref', reference || 'CRÉDITO COMERCIAL')
      .input('modelo', modelName || null)
      .input('chassi', chassi || null)
      .input('status', status)
      .input('fin_aprov', finApproved ? 1 : 0)
      .input('usr', userEmail)
      .input('saldo', nextBalance)
      .input('obs', observation || null)
      .query(`
        INSERT INTO dbo.FundoReservaLancamentos (
          id_lancamento, id_concessionaria, tipo, origem, marca, valor, referencia,
          nome_modelo, chassi, status, financeiro_aprovado, usuario_responsavel,
          saldo_resultante, observacao
        ) VALUES (
          @id, @dealer, 'credito', @origem, @marca, @valor, @ref,
          @modelo, @chassi, @status, @fin_aprov, @usr,
          @saldo, @obs
        )
      `);

    res.status(201).json({
      success: true,
      message: isRdStation 
        ? 'Lançamento do RD Station enviado para aprovação Financeira.' 
        : 'Crédito concedido e incorporado ao saldo com sucesso!'
    });
  } catch (err) {
    console.error('[Reserve Fund API] Erro ao lançar crédito:', err);
    res.status(500).json({ error: 'Erro ao lançar crédito no Fundo de Reserva.' });
  }
};

// POST /api/reserve-fund/request
// A Concessionária submete uma solicitação de Fundo de Reserva.
// A solicitação entra como pendente e só impacta o saldo após aprovação da Montadora
// (fluxo de aprovação configurado no menu Workflow -> fundo_reserva).
export const createRequest = async (req, res) => {
  const { dealershipId, amount, brand, reference, modelName, chassi, observation } = req.body;
  const userEmail = req.user?.email || 'concessionaria@jtoledo.com.br';
  const userId = req.user?.name || req.user?.username || 'Concessionária';

  // Concessionária só pode solicitar para o próprio escopo
  const isMontadora = req.user?.scopeType === 'montadora';
  const effectiveDealer = isMontadora ? dealershipId : (req.user?.dealershipId || dealershipId);

  if (!effectiveDealer || !amount || amount <= 0) {
    return res.status(400).json({ error: 'Concessionária e valor válido são obrigatórios.' });
  }

  try {
    const pool = await getDbPool();
    const dealerRes = await pool.request()
      .input('id', effectiveDealer)
      .query('SELECT saldo_fundo_reserva FROM dbo.Concessionarias WHERE id_concessionaria = @id');

    if (dealerRes.recordset.length === 0) {
      return res.status(404).json({ error: 'Concessionária não localizada.' });
    }

    const currentBalance = Number(dealerRes.recordset[0].saldo_fundo_reserva) || 0;
    const idLanc = `rf-req-${Date.now()}`;

    // origem visual 'solicitacao_concessionaria' é persistido como 'ajuste_direto'
    // (valor compatível com a CHECK constraint existente no banco)
    await pool.request()
      .input('id', idLanc)
      .input('dealer', effectiveDealer)
      .input('marca', brand || 'Suzuki')
      .input('valor', amount)
      .input('ref', reference || 'SOLICITAÇÃO FUNDO DE RESERVA')
      .input('modelo', modelName || null)
      .input('chassi', chassi || null)
      .input('usr', userEmail)
      .input('saldo', currentBalance)
      .input('obs', observation ? `[SOLICITADO POR ${userId}] ${observation}` : `Solicitação de Fundo de Reserva enviada por ${userId}.`)
      .query(`
        INSERT INTO dbo.FundoReservaLancamentos (
          id_lancamento, id_concessionaria, tipo, origem, marca, valor, referencia,
          nome_modelo, chassi, status, financeiro_aprovado, usuario_responsavel,
          saldo_resultante, observacao
        ) VALUES (
          @id, @dealer, 'credito', 'ajuste_direto', @marca, @valor, @ref,
          @modelo, @chassi, 'pendente_financeiro', 0, @usr,
          @saldo, @obs
        )
      `);

    res.status(201).json({
      success: true,
      message: 'Solicitação de Fundo de Reserva enviada. Aguardando aprovação da Montadora.',
      id: idLanc
    });
  } catch (err) {
    console.error('[Reserve Fund API] Erro ao solicitar crédito:', err);
    res.status(500).json({ error: 'Erro ao enviar solicitação de Fundo de Reserva.' });
  }
};

// PATCH /api/reserve-fund/:id/workflow
// Registra o avanço de etapa do workflow fundo_reserva (sem liberar saldo ainda).
export const updateWorkflow = async (req, res) => {
  const { id } = req.params;
  const { stepIndex, stepName, approvedBy } = req.body;
  const userEmail = approvedBy || req.user?.email || 'montadora@jtoledo.com.br';

  try {
    const pool = await getDbPool();
    const obsSuffix = stepName ? ` | Etapa aprovada (${stepIndex}): ${String(stepName).substring(0, 90)} por ${userEmail}` : '';
    await pool.request()
      .input('id', id)
      .input('usr', userEmail)
      .input('obs', obsSuffix.substring(0, 250))
      .query(`
        UPDATE dbo.FundoReservaLancamentos
        SET observacao = CONCAT(ISNULL(observacao, ''), @obs),
            status = 'pendente_financeiro'
        WHERE id_lancamento = @id
      `);
    res.json({ success: true, message: 'Etapa do workflow registrada.' });
  } catch (err) {
    console.error('[Reserve Fund API] Erro ao registrar etapa:', err);
    res.status(500).json({ error: 'Erro ao registrar etapa do workflow.' });
  }
};
// PATCH /api/reserve-fund/:id/approve
export const approveTransaction = async (req, res) => {
  const { id } = req.params;
  const userEmail = req.user?.email || 'financeiro@jtoledo.com.br';


  try {
    const pool = await getDbPool();
    // Localiza o lançamento e a concessionária para creditar o saldo
    const txRes = await pool.request()
      .input('id', id)
      .query('SELECT id_concessionaria, valor, tipo FROM dbo.FundoReservaLancamentos WHERE id_lancamento = @id');

    if (txRes.recordset.length === 0) return res.status(404).json({ error: 'Lançamento não localizado.' });

    const { id_concessionaria, valor, tipo } = txRes.recordset[0];

    // Atualiza o lançamento para Aprovado
    await pool.request()
      .input('id', id)
      .input('usr', userEmail)
      .query(`
        UPDATE dbo.FundoReservaLancamentos
        SET status = 'aprovado',
            financeiro_aprovado = 1,
            aprovado_por = @usr,
            aprovado_em = SYSUTCDATETIME()
        WHERE id_lancamento = @id
      `);

    // Atualiza o saldo da concessionária (soma crédito aprovado / subtrai débito aprovado)
    const saldoRes = await pool.request()
      .input('dealer', id_concessionaria)
      .query('SELECT saldo_fundo_reserva FROM dbo.Concessionarias WHERE id_concessionaria = @dealer');
    const currentBalance = Number(saldoRes.recordset[0]?.saldo_fundo_reserva) || 0;
    const delta = tipo === 'credito' ? Number(valor) : -Number(valor);
    const nextBalance = Math.max(0, currentBalance + delta);

    await pool.request()
      .input('dealer', id_concessionaria)
      .input('saldo', nextBalance)
      .input('id', id)
      .query(`
        UPDATE dbo.Concessionarias SET saldo_fundo_reserva = @saldo WHERE id_concessionaria = @dealer;
        UPDATE dbo.FundoReservaLancamentos SET saldo_resultante = @saldo WHERE id_lancamento = @id;
      `);

    res.json({ success: true, message: 'Lançamento aprovado e incorporado ao saldo disponível!' });
  } catch (err) {
    console.error('[Reserve Fund API] Erro ao aprovar:', err);
    res.status(500).json({ error: 'Erro ao aprovar lançamento.' });
  }
};

// PATCH /api/reserve-fund/:id/reject
export const rejectTransaction = async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body || {};
  const userEmail = req.user?.email || 'montadora@jtoledo.com.br';

  try {
    const pool = await getDbPool();
    await pool.request()
      .input('id', id)
      .input('usr', userEmail)
      .input('reason', reason ? String(reason).substring(0, 500) : 'Solicitação reprovada pela Montadora.')
      .query(`
        UPDATE dbo.FundoReservaLancamentos
        SET status = 'rejeitado',
            financeiro_aprovado = 0,
            aprovado_por = @usr,
            aprovado_em = SYSUTCDATETIME(),
            observacao = CONCAT(ISNULL(observacao, ''), ' | MOTIVO DE REJEIÇÃO: ', @reason)
        WHERE id_lancamento = @id
      `);
    res.json({ success: true, message: 'Solicitação rejeitada.' });
  } catch (err) {
    console.error('[Reserve Fund API] Erro ao rejeitar:', err);
    res.status(500).json({ error: 'Erro ao rejeitar lançamento.' });
  }
};

export default { getStatement, createCredit, createRequest, updateWorkflow, approveTransaction, rejectTransaction };
