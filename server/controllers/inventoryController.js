import { getDbPool } from '../db.js';

const STATUS_ALLOWED = ['disponivel', 'reservado', 'vendido'];

// Converter dd/mm/yyyy -> yyyy-mm-dd
const toIsoDate = (brDate) => {
  if (!brDate) return null;
  const m = String(brDate).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  return String(brDate).substring(0, 10);
};

// Converter yyyy-mm-dd -> dd/mm/yyyy
const toBrDate = (iso) => {
  if (!iso) return null;
  const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[3]}/${m[2]}/${m[1]}`;
  return String(iso).substring(0, 10);
};

const rowToInventoryItem = (r) => ({
  id: r.id_veiculo,
  dealershipId: r.id_concessionaria,
  model: r.modelo,
  year: r.ano_fabricacao_modelo,
  vin: r.chassi_vin,
  color: r.cor,
  colorHex: r.codigo_hex,
  costPrice: r.preco_custo,
  retailPrice: r.preco_venda_loja,
  status: r.status,
  plate: r.placa,
  engineDisplacement: r.cilindrada,
  power: r.potencia,
  arrivedDate: toBrDate(r.data_chegada),
  notes: r.notas
});

// GET /api/inventory?dealershipId=
export const getInventory = async (req, res) => {
  const isMontadora = req.user?.scopeType === 'montadora';
  const userDealer = req.user?.dealershipId;
  const targetDealer = req.query.dealershipId || (!isMontadora ? userDealer : null);

  try {
    const pool = await getDbPool();
    let query = `
      SELECT id_veiculo, id_concessionaria, modelo, ano_fabricacao_modelo, chassi_vin,
             cor, codigo_hex, preco_custo, preco_venda_loja, status, placa, cilindrada, potencia,
             data_chegada, notas
      FROM dbo.EstoqueVeiculos
    `;
    let request = pool.request();
    if (targetDealer && targetDealer !== 'jtoledo') {
      query += ` WHERE id_concessionaria = @targetDealer`;
      request = request.input('targetDealer', targetDealer);
    }
    query += ` ORDER BY data_chegada DESC`;
    const result = await request.query(query);
    res.json(result.recordset.map(rowToInventoryItem));
  } catch (err) {
    console.error('[Inventory API] Erro ao listar:', err);
    res.status(500).json({ error: 'Erro ao carregar veículos do estoque.' });
  }
};

// POST /api/inventory
export const createInventoryItem = async (req, res) => {
  const { dealershipId, model, year, vin, color, colorHex, costPrice, retailPrice, status, plate, engineDisplacement, power, arrivedDate, notes } = req.body;
  const isMontadora = req.user?.scopeType === 'montadora';
  const targetDealer = isMontadora ? (dealershipId || null) : (req.user?.dealershipId || dealershipId || null);

  if (!targetDealer) return res.status(400).json({ error: 'Concessionária é obrigatória.' });
  if (!model || !vin || !year || !color) return res.status(400).json({ error: 'Modelo, VIN, ano e cor são obrigatórios.' });
  const finalStatus = status || 'disponivel';
  if (!STATUS_ALLOWED.includes(finalStatus)) return res.status(400).json({ error: 'Status inválido.' });
  // data_chegada é NOT NULL no banco — usa a data de hoje quando não informada
  const dataChegada = toIsoDate(arrivedDate) || new Date().toISOString().slice(0, 10);

  try {
    const pool = await getDbPool();
    const id = req.body.id || `inv-${Date.now()}`;
    await pool.request()
      .input('id', id)
      .input('dealer', targetDealer)
      .input('modelo', String(model).substring(0, 100))
      .input('ano', Number(year))
      .input('vin', String(vin).substring(0, 30))
      .input('cor', String(color).substring(0, 60))
      .input('hex', String(colorHex || '#000000').substring(0, 10))
      .input('custo', Number(costPrice) || 0)
      .input('venda', Number(retailPrice) || 0)
      .input('status', finalStatus)
      .input('placa', plate || null)
      .input('cil', engineDisplacement ? String(engineDisplacement).substring(0, 20) : null)
      .input('pot', power ? String(power).substring(0, 50) : null)
      .input('data', dataChegada)
      .input('notas', notes || null)
      .query(`
        INSERT INTO dbo.EstoqueVeiculos (
          id_veiculo, id_concessionaria, modelo, ano_fabricacao_modelo, chassi_vin,
          cor, codigo_hex, preco_custo, preco_venda_loja, status, placa, cilindrada, potencia, data_chegada, notas
        ) VALUES (
          @id, @dealer, @modelo, @ano, @vin,
          @cor, @hex, @custo, @venda, @status, @placa, @cil, @pot, @data, @notas
        )
      `);
    res.status(201).json({ success: true, message: 'Veículo adicionado ao estoque com sucesso!', id });
  } catch (err) {
    console.error('[Inventory API] Erro ao criar:', err);
    if (/UNIQUE|duplicate|chassi/.test(err.message)) {
      return res.status(409).json({ error: 'Já existe um veículo com este chassi/VIN no estoque.' });
    }
    if (/FK|constraint/.test(err.message)) {
      return res.status(400).json({ error: 'Concessionária não localizada.' });
    }
    res.status(500).json({ error: 'Erro ao adicionar veículo ao estoque.' });
  }
};

// PUT /api/inventory/:id
export const updateInventoryItem = async (req, res) => {
  const { id } = req.params;
  const { dealershipId, model, year, vin, color, colorHex, costPrice, retailPrice, status, plate, engineDisplacement, power, arrivedDate, notes } = req.body;

  if (!model || !vin || !year || !color) return res.status(400).json({ error: 'Modelo, VIN, ano e cor são obrigatórios.' });
  const finalStatus = status || 'disponivel';
  if (!STATUS_ALLOWED.includes(finalStatus)) return res.status(400).json({ error: 'Status inválido.' });

  try {
    const pool = await getDbPool();
    const result = await pool.request()
      .input('id', id)
      .input('dealer', dealershipId || null)
      .input('modelo', String(model).substring(0, 100))
      .input('ano', Number(year))
      .input('vin', String(vin).substring(0, 30))
      .input('cor', String(color).substring(0, 60))
      .input('hex', String(colorHex || '#000000').substring(0, 10))
      .input('custo', Number(costPrice) || 0)
      .input('venda', Number(retailPrice) || 0)
      .input('status', finalStatus)
      .input('placa', plate || null)
      .input('cil', engineDisplacement ? String(engineDisplacement).substring(0, 20) : null)
      .input('pot', power ? String(power).substring(0, 50) : null)
      .input('data', toIsoDate(arrivedDate))
      .input('notas', notes || null)
      .query(`
        UPDATE dbo.EstoqueVeiculos
        SET id_concessionaria = ISNULL(@dealer, id_concessionaria),
            modelo = @modelo,
            ano_fabricacao_modelo = @ano,
            chassi_vin = @vin,
            cor = @cor,
            codigo_hex = @hex,
            preco_custo = @custo,
            preco_venda_loja = @venda,
            status = @status,
            placa = @placa,
            cilindrada = @cil,
            potencia = @pot,
            data_chegada = ISNULL(@data, data_chegada),
            notas = @notas
        WHERE id_veiculo = @id
      `);

    if (result.rowsAffected[0] === 0) return res.status(404).json({ error: 'Veículo não localizado.' });
    res.json({ success: true, message: 'Veículo atualizado com sucesso!' });
  } catch (err) {
    console.error('[Inventory API] Erro ao atualizar:', err);
    if (/UNIQUE|duplicate/.test(err.message)) return res.status(409).json({ error: 'Já existe um veículo com este chassi/VIN.' });
    res.status(500).json({ error: 'Erro ao atualizar veículo.' });
  }
};

// DELETE /api/inventory/:id
export const deleteInventoryItem = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await getDbPool();
    const result = await pool.request()
      .input('id', id)
      .query('DELETE FROM dbo.EstoqueVeiculos WHERE id_veiculo = @id');
    if (result.rowsAffected[0] === 0) return res.status(404).json({ error: 'Veículo não localizado.' });
    res.json({ success: true, message: 'Veículo removido do estoque.' });
  } catch (err) {
    console.error('[Inventory API] Erro ao excluir:', err);
    res.status(500).json({ error: 'Erro ao excluir veículo.' });
  }
};

export default { getInventory, createInventoryItem, updateInventoryItem, deleteInventoryItem };
