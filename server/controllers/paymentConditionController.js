import { getDbPool } from '../db.js';

const rowToCondition = (r) => ({
  id: r.id_condicao,
  brand: r.marca,
  modelCode: r.codigo_modelo,
  modelYear: r.ano_modelo,
  paymentMethodName: r.nome_condicao,
  discountPercentage: r.percentual_desconto,
  installments: r.quantidade_parcelas,
  startDate: r.data_inicio_vigencia ? String(r.data_inicio_vigencia).substring(0, 10) : null,
  endDate: r.data_fim_vigencia ? String(r.data_fim_vigencia).substring(0, 10) : null,
  inLine: !!r.em_linha,
  active: !!r.ativo,
  description: r.descricao
});

// POST /api/payment-conditions
export const createPaymentCondition = async (req, res) => {
  const { brand, modelCode, modelYear, paymentMethodName, discountPercentage, installments, startDate, endDate, inLine, description } = req.body;

  if (!brand || !modelCode || !paymentMethodName) {
    return res.status(400).json({ error: 'Marca, modelo e nome da condição são obrigatórios.' });
  }
  if (!startDate || !endDate) return res.status(400).json({ error: 'Período de vigência é obrigatório.' });

  try {
    const pool = await getDbPool();
    const id = req.body.id || `pay-${Date.now()}`;
    await pool.request()
      .input('id', id)
      .input('marca', String(brand).substring(0, 30))
      .input('modelo', String(modelCode).substring(0, 50))
      .input('ano', String(modelYear || '2026').substring(0, 10))
      .input('nome', String(paymentMethodName).substring(0, 150))
      .input('desc', Number(discountPercentage) || 0)
      .input('parcelas', Math.max(1, Number(installments) || 1))
      .input('ini', String(startDate).substring(0, 10))
      .input('fim', String(endDate).substring(0, 10))
      .input('linha', inLine !== false ? 1 : 0)
      .input('descricao', description ? String(description).substring(0, 255) : null)
      .query(`
        INSERT INTO dbo.CondicoesPagamento (
          id_condicao, marca, codigo_modelo, ano_modelo, nome_condicao, percentual_desconto,
          quantidade_parcelas, data_inicio_vigencia, data_fim_vigencia, em_linha, ativo, descricao
        ) VALUES (
          @id, @marca, @modelo, @ano, @nome, @desc,
          @parcelas, @ini, @fim, @linha, 1, @descricao
        )
      `);
    res.status(201).json({ success: true, message: 'Condição de pagamento criada com sucesso!', id });
  } catch (err) {
    console.error('[PaymentConditions API] Erro ao criar:', err);
    if (/duplicate|UNIQUE|PK/.test(err.message)) return res.status(409).json({ error: 'Já existe uma condição com este identificador.' });
    res.status(500).json({ error: 'Erro ao criar condição de pagamento.' });
  }
};

// PUT /api/payment-conditions/:id
export const updatePaymentCondition = async (req, res) => {
  const { id } = req.params;
  const { brand, modelCode, modelYear, paymentMethodName, discountPercentage, installments, startDate, endDate, inLine, active, description } = req.body;

  if (!paymentMethodName) return res.status(400).json({ error: 'Nome da condição é obrigatório.' });

  try {
    const pool = await getDbPool();
    const result = await pool.request()
      .input('id', id)
      .input('marca', String(brand || 'Suzuki').substring(0, 30))
      .input('modelo', String(modelCode || '').substring(0, 50))
      .input('ano', String(modelYear || '2026').substring(0, 10))
      .input('nome', String(paymentMethodName).substring(0, 150))
      .input('desc', Number(discountPercentage) || 0)
      .input('parcelas', Math.max(1, Number(installments) || 1))
      .input('ini', String(startDate || new Date().toISOString().substring(0, 10)).substring(0, 10))
      .input('fim', String(endDate || '2099-12-31').substring(0, 10))
      .input('linha', inLine !== false ? 1 : 0)
      .input('ativo', active !== false ? 1 : 0)
      .input('descricao', description ? String(description).substring(0, 255) : null)
      .query(`
        UPDATE dbo.CondicoesPagamento
        SET marca = @marca,
            codigo_modelo = @modelo,
            ano_modelo = @ano,
            nome_condicao = @nome,
            percentual_desconto = @desc,
            quantidade_parcelas = @parcelas,
            data_inicio_vigencia = @ini,
            data_fim_vigencia = @fim,
            em_linha = @linha,
            ativo = @ativo,
            descricao = @descricao,
            criado_em = criado_em
        WHERE id_condicao = @id
      `);
    if (result.rowsAffected[0] === 0) return res.status(404).json({ error: 'Condição de pagamento não localizada.' });
    res.json({ success: true, message: 'Condição de pagamento atualizada com sucesso!' });
  } catch (err) {
    console.error('[PaymentConditions API] Erro ao atualizar:', err);
    res.status(500).json({ error: 'Erro ao atualizar condição de pagamento.' });
  }
};

// DELETE /api/payment-conditions/:id (desativação lógica: pedidos podem referenciar a condição)
export const deletePaymentCondition = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await getDbPool();
    const result = await pool.request()
      .input('id', id)
      .query('UPDATE dbo.CondicoesPagamento SET ativo = 0, em_linha = 0 WHERE id_condicao = @id');
    if (result.rowsAffected[0] === 0) return res.status(404).json({ error: 'Condição de pagamento não localizada.' });
    res.json({ success: true, message: 'Condição de pagamento desativada com sucesso!' });
  } catch (err) {
    console.error('[PaymentConditions API] Erro ao excluir:', err);
    res.status(500).json({ error: 'Erro ao excluir condição de pagamento.' });
  }
};

export default { createPaymentCondition, updatePaymentCondition, deletePaymentCondition };
