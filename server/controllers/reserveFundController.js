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
        rf.origem AS origin,
        rf.marca AS brand,
        rf.valor AS amount,
        rf.referencia AS reference,
        rf.nome_modelo AS modelName,
        rf.chassi,
        rf.id_pedido AS orderId,
        rf.status,
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

// PATCH /api/reserve-fund/:id/approve
export const approveTransaction = async (req, res) => {
  const { id } = req.params;
  const userEmail = req.user?.email || 'financeiro@jtoledo.com.br';

  try {
    const pool = await getDbPool();
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

    res.json({ success: true, message: 'Lançamento aprovado pelo Financeiro com sucesso!' });
  } catch (err) {
    console.error('[Reserve Fund API] Erro ao aprovar:', err);
    res.status(500).json({ error: 'Erro ao aprovar lançamento.' });
  }
};

export default { getStatement, createCredit, approveTransaction };
