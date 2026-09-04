import { getDbPool } from '../db.js';

const WAREHOUSES_ALLOWED = ['empresa_13_armazem', 'manaus_le_16'];
const REGIONS_ALLOWED = ['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul'];
const BRANDS_ALLOWED = ['Suzuki', 'Haojue', 'Zontes', 'Hisun', 'Kymco', 'Quadriciclos'];

const rowToFreightRate = (r) => ({
  id: r.id,
  brand: r.brand || 'Suzuki',
  state: r.state,
  region: r.region,
  originWarehouse: r.originWarehouse,
  originWarehouseLabel: r.originWarehouseLabel,
  costPerUnit: Number(r.costPerUnit),
  estimatedDays: r.estimatedDays,
  locationType: r.locationType || 'capital'
});

// GET /api/freight
export const getFreightRates = async (req, res) => {
  try {
    const pool = await getDbPool();
    const result = await pool.request().query(`
      SELECT
        id_tarifa AS id,
        marca AS brand,
        uf AS state,
        regiao_brasil AS region,
        armazem_origem AS originWarehouse,
        descricao_origem AS originWarehouseLabel,
        custo_por_unidade AS costPerUnit,
        prazo_estimado_dias AS estimatedDays,
        tipo_localidade AS locationType
      FROM dbo.TarifasFrete
      WHERE ativo = 1
      ORDER BY marca, regiao_brasil, uf
    `);
    res.json(result.recordset.map(rowToFreightRate));
  } catch (err) {
    console.error('[Freight API] Erro ao listar tarifas:', err);
    res.status(500).json({ error: 'Erro ao carregar tarifas de frete.' });
  }
};

const validateFreightPayload = (body) => {
  const { brand, state, region, originWarehouse, originWarehouseLabel, costPerUnit, estimatedDays } = body;
  if (brand && !BRANDS_ALLOWED.includes(brand)) return 'Marca inválida.';
  if (!state || String(state).trim().length !== 2) return 'UF inválida (use a sigla com 2 letras, ex.: SP).';
  if (!region || !REGIONS_ALLOWED.includes(region)) return 'Região inválida.';
  if (!originWarehouse || !WAREHOUSES_ALLOWED.includes(originWarehouse)) return 'Armazém de origem inválido.';
  if (!originWarehouseLabel) return 'Descrição do armazém de origem é obrigatória.';
  if (costPerUnit === undefined || costPerUnit === null || Number(costPerUnit) <= 0) return 'Custo por unidade deve ser maior que zero.';
  if (estimatedDays === undefined || estimatedDays === null || Number(estimatedDays) < 0) return 'Prazo estimado (dias) inválido.';
  return null;
};

// POST /api/freight
export const createFreightRate = async (req, res) => {
  const { brand, state, region, originWarehouse, originWarehouseLabel, costPerUnit, estimatedDays, locationType } = req.body;

  const validationError = validateFreightPayload(req.body);
  if (validationError) return res.status(400).json({ error: validationError });

  try {
    const pool = await getDbPool();
    const id = req.body.id || `frt-${Date.now()}`;

    await pool.request()
      .input('id', id)
      .input('marca', brand || 'Suzuki')
      .input('uf', String(state).trim().toUpperCase())
      .input('regiao', region)
      .input('armazem', originWarehouse)
      .input('desc', String(originWarehouseLabel).substring(0, 100))
      .input('custo', Number(costPerUnit))
      .input('dias', Number(estimatedDays))
      .input('localidade', locationType || 'capital')
      .query(`
        INSERT INTO dbo.TarifasFrete (
          id_tarifa, marca, uf, regiao_brasil, armazem_origem, descricao_origem,
          custo_por_unidade, prazo_estimado_dias, tipo_localidade, ativo
        ) VALUES (
          @id, @marca, @uf, @regiao, @armazem, @desc, @custo, @dias, @localidade, 1
        )
      `);
    res.status(201).json({ success: true, message: 'Regra de frete criada com sucesso!', id });
  } catch (err) {
    console.error('[Freight API] Erro ao criar tarifa:', err);
    if (/UNIQUE|duplicate|PRIMARY KEY/i.test(err.message)) {
      return res.status(409).json({ error: 'Já existe uma tarifa com este identificador.' });
    }
    res.status(500).json({ error: 'Erro ao criar regra de frete.' });
  }
};

// PUT /api/freight/:id
export const updateFreightRate = async (req, res) => {
  const { id } = req.params;
  const { brand, state, region, originWarehouse, originWarehouseLabel, costPerUnit, estimatedDays, locationType } = req.body;

  const validationError = validateFreightPayload(req.body);
  if (validationError) return res.status(400).json({ error: validationError });

  try {
    const pool = await getDbPool();
    const result = await pool.request()
      .input('id', id)
      .input('marca', brand || 'Suzuki')
      .input('uf', String(state).trim().toUpperCase())
      .input('regiao', region)
      .input('armazem', originWarehouse)
      .input('desc', String(originWarehouseLabel).substring(0, 100))
      .input('custo', Number(costPerUnit))
      .input('dias', Number(estimatedDays))
      .input('localidade', locationType || 'capital')
      .query(`
        UPDATE dbo.TarifasFrete
        SET marca = @marca,
            uf = @uf,
            regiao_brasil = @regiao,
            armazem_origem = @armazem,
            descricao_origem = @desc,
            custo_por_unidade = @custo,
            prazo_estimado_dias = @dias,
            tipo_localidade = @localidade,
            atualizado_em = SYSUTCDATETIME()
        WHERE id_tarifa = @id AND ativo = 1
      `);

    if (result.rowsAffected[0] === 0) return res.status(404).json({ error: 'Tarifa de frete não localizada.' });
    res.json({ success: true, message: 'Regra de frete atualizada com sucesso!' });
  } catch (err) {
    console.error('[Freight API] Erro ao atualizar tarifa:', err);
    res.status(500).json({ error: 'Erro ao atualizar regra de frete.' });
  }
};

// DELETE /api/freight/:id — soft delete (ativo = 0), preserva histórico
export const deleteFreightRate = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await getDbPool();
    const result = await pool.request()
      .input('id', id)
      .query('UPDATE dbo.TarifasFrete SET ativo = 0, atualizado_em = SYSUTCDATETIME() WHERE id_tarifa = @id AND ativo = 1');

    if (result.rowsAffected[0] === 0) return res.status(404).json({ error: 'Tarifa de frete não localizada.' });
    res.json({ success: true, message: 'Regra de frete removida com sucesso!' });
  } catch (err) {
    console.error('[Freight API] Erro ao remover tarifa:', err);
    res.status(500).json({ error: 'Erro ao remover regra de frete.' });
  }
};

export default {
  getFreightRates,
  createFreightRate,
  updateFreightRate,
  deleteFreightRate
};

