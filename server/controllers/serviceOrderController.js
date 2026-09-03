import { getDbPool } from '../db.js';

const STATUS_ALLOWED = ['em_aberto', 'aguardando_pecas', 'em_execucao', 'finalizado', 'cancelado'];
const PRIORITIES = ['Baixa', 'Normal', 'Alta', 'Urgente'];

const formatKm = (km) => km != null ? `${Number(km).toLocaleString('pt-BR')} km` : undefined;

const rowToServiceOrder = (r) => ({
  id: r.id_os,
  dealershipId: r.id_concessionaria,
  osNumber: r.numero_os,
  status: r.status,
  customerName: r.nome_cliente,
  customerPhone: r.telefone_cliente,
  vehicleModel: r.modelo_veiculo,
  vehiclePlate: r.placa,
  vehicleKm: r.vehicle_km,
  mileage: formatKm(r.vehicle_km),
  fuelLevel: r.fuel_level,
  entryDate: r.entry_date,
  estimatedCompletion: r.estimated_completion,
  mechanic: r.mecanico_responsavel,
  priority: r.priority,
  reportedSymptoms: r.reported_symptoms,
  partsTotal: r.total_pecas,
  laborTotal: r.total_mao_obra,
  totalAmount: r.total_os,
  createdAt: r.criado_em ? new Date(r.criado_em).toLocaleString('pt-BR') : undefined
});

// GET /api/service-orders?dealershipId=
export const getServiceOrders = async (req, res) => {
  const isMontadora = req.user?.scopeType === 'montadora';
  const userDealer = req.user?.dealershipId;
  const targetDealer = req.query.dealershipId || (!isMontadora ? userDealer : null);

  try {
    const pool = await getDbPool();
    let query = `
      SELECT id_os, id_concessionaria, numero_os, nome_cliente, telefone_cliente, modelo_veiculo,
             placa, status, total_pecas, total_mao_obra, total_os, mecanico_responsavel,
             vehicle_km, fuel_level, entry_date, estimated_completion, priority, reported_symptoms, criado_em
      FROM dbo.OficinaOrdensServico
    `;
    let request = pool.request();
    if (targetDealer && targetDealer !== 'jtoledo') {
      query += ` WHERE id_concessionaria = @targetDealer`;
      request = request.input('targetDealer', targetDealer);
    }
    query += ` ORDER BY criado_em DESC`;
    const result = await request.query(query);
    res.json(result.recordset.map(rowToServiceOrder));
  } catch (err) {
    console.error('[ServiceOrder API] Erro ao listar:', err);
    res.status(500).json({ error: 'Erro ao carregar ordens de serviço.' });
  }
};

// POST /api/service-orders
export const createServiceOrder = async (req, res) => {
  const { dealershipId, osNumber, customerName, customerPhone, vehicleModel, vehiclePlate, status, vehicleKm, fuelLevel, entryDate, estimatedCompletion, mechanic, priority, reportedSymptoms, partsTotal, laborTotal, totalAmount } = req.body;
  const isMontadora = req.user?.scopeType === 'montadora';
  const targetDealer = isMontadora ? (dealershipId || null) : (req.user?.dealershipId || dealershipId || null);

  if (!targetDealer) return res.status(400).json({ error: 'Concessionária é obrigatória.' });
  if (!customerName || !customerPhone || !vehicleModel || !vehiclePlate) {
    return res.status(400).json({ error: 'Cliente, telefone, modelo e placa são obrigatórios.' });
  }
  const finalStatus = status || 'em_aberto';
  if (!STATUS_ALLOWED.includes(finalStatus)) return res.status(400).json({ error: 'Status inválido.' });
  if (priority && !PRIORITIES.includes(priority)) return res.status(400).json({ error: 'Prioridade inválida.' });

  try {
    const pool = await getDbPool();
    const id = req.body.id || `os-${Date.now()}`;
    const seq = Math.floor(100 + Math.random() * 899);
    const numeroOs = osNumber || `OS-2026-${seq}`;
    const parts = Number(partsTotal) || 0;
    const labor = Number(laborTotal) || 0;
    const total = Number(totalAmount) || (parts + labor);
    await pool.request()
      .input('id', id)
      .input('dealer', targetDealer)
      .input('numero_os', String(numeroOs).substring(0, 30))
      .input('cliente', String(customerName).substring(0, 150))
      .input('tel', String(customerPhone).substring(0, 30))
      .input('modelo', String(vehicleModel).substring(0, 100))
      .input('placa', String(vehiclePlate).substring(0, 10))
      .input('status', finalStatus)
      .input('total_pecas', parts)
      .input('total_mao', labor)
      .input('total_os', total)
      .input('mec', mechanic ? String(mechanic).substring(0, 100) : null)
      .input('km', vehicleKm != null ? Number(vehicleKm) : null)
      .input('fuel', fuelLevel ? String(fuelLevel).substring(0, 30) : null)
      .input('entrada', entryDate ? String(entryDate).substring(0, 30) : null)
      .input('previsao', estimatedCompletion ? String(estimatedCompletion).substring(0, 60) : null)
      .input('prioridade', priority || null)
      .input('sintomas', reportedSymptoms || null)
      .query(`
        INSERT INTO dbo.OficinaOrdensServico (
          id_os, id_concessionaria, numero_os, nome_cliente, telefone_cliente, modelo_veiculo,
          placa, status, total_pecas, total_mao_obra, total_os, mecanico_responsavel,
          vehicle_km, fuel_level, entry_date, estimated_completion, priority, reported_symptoms
        ) VALUES (
          @id, @dealer, @numero_os, @cliente, @tel, @modelo,
          @placa, @status, @total_pecas, @total_mao, @total_os, @mec,
          @km, @fuel, @entrada, @previsao, @prioridade, @sintomas
        )
      `);
    res.status(201).json({ success: true, message: 'Ordem de serviço criada com sucesso!', id });
  } catch (err) {
    console.error('[ServiceOrder API] Erro ao criar:', err);
    if (/duplicate|UNIQUE/.test(err.message)) return res.status(409).json({ error: 'Já existe uma OS com este número.' });
    res.status(500).json({ error: 'Erro ao criar ordem de serviço.' });
  }
};

// PUT /api/service-orders/:id
export const updateServiceOrder = async (req, res) => {
  const { id } = req.params;
  const { osNumber, customerName, customerPhone, vehicleModel, vehiclePlate, status, vehicleKm, fuelLevel, entryDate, estimatedCompletion, mechanic, priority, reportedSymptoms, partsTotal, laborTotal, totalAmount } = req.body;
  const finalStatus = status || 'em_aberto';
  if (!STATUS_ALLOWED.includes(finalStatus)) return res.status(400).json({ error: 'Status inválido.' });
  if (priority && !PRIORITIES.includes(priority)) return res.status(400).json({ error: 'Prioridade inválida.' });

  try {
    const pool = await getDbPool();
    const result = await pool.request()
      .input('id', id)
      .input('numero_os', String(osNumber).substring(0, 30))
      .input('cliente', String(customerName).substring(0, 150))
      .input('tel', String(customerPhone).substring(0, 30))
      .input('modelo', String(vehicleModel).substring(0, 100))
      .input('placa', String(vehiclePlate).substring(0, 10))
      .input('status', finalStatus)
      .input('total_pecas', Number(partsTotal) || 0)
      .input('total_mao', Number(laborTotal) || 0)
      .input('total_os', Number(totalAmount) || (Number(partsTotal) + Number(laborTotal)))
      .input('mec', mechanic ? String(mechanic).substring(0, 100) : null)
      .input('km', vehicleKm != null ? Number(vehicleKm) : null)
      .input('fuel', fuelLevel ? String(fuelLevel).substring(0, 30) : null)
      .input('entrada', entryDate ? String(entryDate).substring(0, 30) : null)
      .input('previsao', estimatedCompletion ? String(estimatedCompletion).substring(0, 60) : null)
      .input('prioridade', priority || null)
      .input('sintomas', reportedSymptoms || null)
      .query(`
        UPDATE dbo.OficinaOrdensServico
        SET numero_os = @numero_os,
            nome_cliente = @cliente,
            telefone_cliente = @tel,
            modelo_veiculo = @modelo,
            placa = @placa,
            status = @status,
            total_pecas = @total_pecas,
            total_mao_obra = @total_mao,
            total_os = @total_os,
            mecanico_responsavel = @mec,
            vehicle_km = @km,
            fuel_level = @fuel,
            entry_date = @entrada,
            estimated_completion = @previsao,
            priority = @prioridade,
            reported_symptoms = @sintomas
        WHERE id_os = @id
      `);
    if (result.rowsAffected[0] === 0) return res.status(404).json({ error: 'Ordem de serviço não localizada.' });
    res.json({ success: true, message: 'Ordem de serviço atualizada com sucesso!' });
  } catch (err) {
    console.error('[ServiceOrder API] Erro ao atualizar:', err);
    if (/duplicate|UNIQUE/.test(err.message)) return res.status(409).json({ error: 'Já existe uma OS com este número.' });
    res.status(500).json({ error: 'Erro ao atualizar ordem de serviço.' });
  }
};

// DELETE /api/service-orders/:id
export const deleteServiceOrder = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await getDbPool();
    const result = await pool.request().input('id', id).query('DELETE FROM dbo.OficinaOrdensServico WHERE id_os = @id');
    if (result.rowsAffected[0] === 0) return res.status(404).json({ error: 'Ordem de serviço não localizada.' });
    res.json({ success: true, message: 'Ordem de serviço removida.' });
  } catch (err) {
    console.error('[ServiceOrder API] Erro ao excluir:', err);
    res.status(500).json({ error: 'Erro ao excluir ordem de serviço.' });
  }
};

export default { getServiceOrders, createServiceOrder, updateServiceOrder, deleteServiceOrder };
