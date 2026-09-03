import { getDbPool } from '../db.js';

const STATUS_ALLOWED = ['aguardando_analise', 'em_analise_credito', 'verificando_estoque', 'aprovado_fabrica', 'integrado_protheus', 'em_separacao_cd', 'faturado_despachado', 'cancelado'];
const TYPES_ALLOWED = ['reposicao', 'urgente_vor', 'garantia_pos_venda'];

const rowToPartsOrder = (r) => ({
  id: r.id_pedido_peca,
  orderNumber: r.numero_pedido,
  dealershipId: r.id_concessionaria,
  dealershipName: r.nome_concessionaria,
  dealershipCnpj: r.cnpj,
  dealershipCity: r.cidade,
  dealershipState: r.uf,
  dealershipRegion: r.regiao_brasil,
  dealershipTier: r.classificacao_tier,
  orderType: r.tipo_pedido,
  status: r.status_pedido,
  createdAt: r.criado_em ? new Date(r.criado_em).toLocaleString('pt-BR') : undefined,
  items: r.items || [],
  totalPartsCount: r.total_pecas,
  totalUniqueItems: r.total_itens_unicos,
  subtotalAmount: r.subtotal_amount,
  discountPercentage: r.discount_percentage,
  freightAmount: r.freight_amount,
  freightMode: r.freight_mode,
  totalAmount: r.total_amount,
  paymentMethod: r.payment_method,
  notes: r.observacoes,
  vinApplication: r.vin_aplicacao,
  allocatedWarehouse: r.warehouse_alocado,
  stockVerified: !!r.estoque_verificado,
  stockVerifiedAt: r.estoque_verificado_em ? new Date(r.estoque_verificado_em).toLocaleString('pt-BR') : undefined,
  stockAnalyst: r.analista_estoque,
  creditApproved: !!r.credito_aprovado,
  creditApprovedAt: r.credito_aprovado_em ? new Date(r.credito_aprovado_em).toLocaleString('pt-BR') : undefined,
  creditAnalyst: r.analista_credito,
  creditNotes: r.notas_credito,
  commercialApproved: !!r.comercial_aprovado,
  commercialApprovedAt: r.comercial_aprovado_em ? new Date(r.comercial_aprovado_em).toLocaleString('pt-BR') : undefined,
  commercialManager: r.gestor_comercial,
  commercialNotes: r.notas_comercial,
  protheusIntegrated: !!r.integrado_protheus,
  protheusOrderNumber: r.numero_pedido_protheus,
  protheusIntegratedAt: r.integrado_protheus_em ? new Date(r.integrado_protheus_em).toLocaleString('pt-BR') : undefined,
  protheusNFeNumber: r.nfe_numero,
  protheusTrackingCode: r.codigo_rastreio,
  protheusCarrierName: r.transportadora
});

const buildItemFromRow = (i) => ({
  id: i.id_item,
  modelId: i.id_modelo,
  modelName: i.nome_modelo,
  brand: i.marca,
  illustrationCode: i.codigo_ilustracao,
  diagramTitle: i.titulo_diagrama,
  partNumber: i.part_number,
  description: i.descricao_peca,
  categoryGroup: i.grupo_categoria,
  unitQuantity: 1,
  quantity: i.quantidade,
  unitPrice: i.preco_unitario,
  totalPrice: i.preco_total,
  ...(i.part_json ? { part: JSON.parse(i.part_json) } : {})
});

// GET /api/parts/orders?dealershipId=
export const getPartsOrders = async (req, res) => {
  const isMontadora = req.user?.scopeType === 'montadora';
  const userDealer = req.user?.dealershipId;
  const targetDealer = req.query.dealershipId || (!isMontadora ? userDealer : null);

  try {
    const pool = await getDbPool();
    let query = `
      SELECT p.*, c.nome_curto AS nome_concessionaria, c.cnpj, c.cidade, c.uf, c.regiao_brasil, c.classificacao_tier
      FROM dbo.PedidosPecas p
      INNER JOIN dbo.Concessionarias c ON p.id_concessionaria = c.id_concessionaria
    `;
    let request = pool.request();
    if (targetDealer && targetDealer !== 'jtoledo') {
      query += ` WHERE p.id_concessionaria = @targetDealer`;
      request = request.input('targetDealer', targetDealer);
    }
    query += ` ORDER BY p.criado_em DESC`;
    const ordersRes = await request.query(query);

    const itemsRes = await pool.request().query(`
      SELECT * FROM dbo.PedidoPecaItens
    `);
    const itemsByOrder = {};
    for (const item of itemsRes.recordset) {
      if (!itemsByOrder[item.id_pedido_peca]) itemsByOrder[item.id_pedido_peca] = [];
      itemsByOrder[item.id_pedido_peca].push(buildItemFromRow(item));
    }

    res.json(ordersRes.recordset.map(o => ({ ...rowToPartsOrder(o), items: itemsByOrder[o.id_pedido_peca] || [] })));
  } catch (err) {
    console.error('[Parts API] Erro ao listar pedidos:', err);
    res.status(500).json({ error: 'Erro ao carregar pedidos de peças.' });
  }
};

// POST /api/parts/orders
export const createPartsOrder = async (req, res) => {
  const { dealershipId, orderType, status, items, subtotalAmount, discountPercentage, freightAmount, freightMode, totalAmount, paymentMethod, notes, vinApplication } = req.body;
  const isMontadora = req.user?.scopeType === 'montadora';
  const targetDealer = isMontadora ? (dealershipId || null) : (req.user?.dealershipId || dealershipId || null);

  if (!targetDealer) return res.status(400).json({ error: 'Concessionária é obrigatória.' });
  if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'O pedido deve conter ao menos um item.' });
  const tipo = orderType || 'reposicao';
  if (!TYPES_ALLOWED.includes(tipo)) return res.status(400).json({ error: 'Tipo de pedido inválido.' });
  const finalStatus = status || 'aguardando_analise';
  if (!STATUS_ALLOWED.includes(finalStatus)) return res.status(400).json({ error: 'Status inválido.' });

  const orderId = req.body.id || `pp-${Date.now()}`;
  const orderNumber = req.body.orderNumber || `PED-PEC-${Math.floor(1000 + Math.random() * 8999)}`;
  const totalPecas = items.reduce((s, it) => s + Number(it.quantity || 0), 0);
  const totalUnique = items.length;
  const subtotal = Number(subtotalAmount) || items.reduce((s, it) => s + Number(it.totalPrice || 0), 0);
  const discount = Number(discountPercentage) || 0;
  const freight = Number(freightAmount) || 0;
  const total = Number(totalAmount) || (subtotal - subtotal * (discount / 100) + freight);

  try {
    const pool = await getDbPool();
    await pool.request()
      .input('id', orderId)
      .input('numero', String(orderNumber).substring(0, 30))
      .input('dealer', targetDealer)
      .input('tipo', tipo)
      .input('status', finalStatus)
      .input('subtotal', subtotal)
      .input('disc', discount)
      .input('frete', freight)
      .input('modo', String(freightMode || 'CIF').toUpperCase().substring(0, 10))
      .input('total', total)
      .input('pagto', paymentMethod ? String(paymentMethod).substring(0, 100) : null)
      .input('notas', notes || null)
      .input('vin', vinApplication ? String(vinApplication).substring(0, 20) : null)
      .input('total_pecas', totalPecas)
      .input('total_unicos', totalUnique)
      .query(`
        INSERT INTO dbo.PedidosPecas (
          id_pedido_peca, numero_pedido, id_concessionaria, tipo_pedido, status_pedido,
          subtotal_amount, discount_percentage, freight_amount, freight_mode, total_amount,
          payment_method, observacoes, vin_aplicacao, total_pecas, total_itens_unicos
        ) VALUES (
          @id, @numero, @dealer, @tipo, @status,
          @subtotal, @disc, @frete, @modo, @total,
          @pagto, @notas, @vin, @total_pecas, @total_unicos
        )
      `);

    for (const it of items) {
      const itemId = it.id || `ppi-${orderId}-${items.indexOf(it) + 1}`;
      await pool.request()
        .input('id_item', itemId)
        .input('id_ped', orderId)
        .input('modelo_id', it.modelId ? String(it.modelId).substring(0, 60) : null)
        .input('modelo_nome', it.modelName ? String(it.modelName).substring(0, 100) : null)
        .input('marca', it.brand ? String(it.brand).substring(0, 30) : null)
        .input('ilustracao', it.illustrationCode ? String(it.illustrationCode).substring(0, 50) : null)
        .input('titulo', it.diagramTitle ? String(it.diagramTitle).substring(0, 150) : null)
        .input('part_number', String(it.partNumber || it.part?.partNumber || '').substring(0, 60))
        .input('desc', String(it.description || it.part?.description || '').substring(0, 200))
        .input('grupo', it.categoryGroup ? String(it.categoryGroup).substring(0, 60) : null)
        .input('essencial', (it.isEssentialMaintenance || it.part?.isEssentialMaintenance) ? 1 : 0)
        .input('qtd', Number(it.quantity) || 1)
        .input('preco_unit', Number(it.unitPrice || it.part?.factoryPrice || 0))
        .input('preco_total', Number(it.totalPrice || (Number(it.quantity) * Number(it.unitPrice || it.part?.factoryPrice || 0))))
        .input('part_json', JSON.stringify(it.part || null))
        .query(`
          INSERT INTO dbo.PedidoPecaItens (
            id_item, id_pedido_peca, id_modelo, nome_modelo, marca, codigo_ilustracao,
            titulo_diagrama, part_number, descricao_peca, grupo_categoria, essencial_manutencao,
            quantidade, preco_unitario, preco_total, part_json
          ) VALUES (
            @id_item, @id_ped, @modelo_id, @modelo_nome, @marca, @ilustracao,
            @titulo, @part_number, @desc, @grupo, @essencial,
            @qtd, @preco_unit, @preco_total, @part_json
          )
        `);
    }

    res.status(201).json({ success: true, message: 'Pedido de peças transmitido com sucesso!', id: orderId, orderNumber });
  } catch (err) {
    console.error('[Parts API] Erro ao criar pedido:', err);
    if (/duplicate|UNIQUE/.test(err.message)) return res.status(409).json({ error: 'Já existe um pedido com este número.' });
    res.status(500).json({ error: 'Erro ao transmitir pedido de peças.' });
  }
};

// PATCH /api/parts/orders/:id/status
// Atualiza status e decisões (estoque, crédito, comercial, Protheus).
export const updatePartsOrder = async (req, res) => {
  const { id } = req.params;
  const { status, stockVerified, stockVerifiedAt, stockAnalyst, creditApproved, creditAnalyst, creditNotes, commercialApproved, commercialManager, commercialNotes, protheusIntegrated, protheusOrderNumber, protheusNFeNumber, protheusTrackingCode, protheusCarrierName } = req.body;

  if (status && !STATUS_ALLOWED.includes(status)) return res.status(400).json({ error: 'Status inválido.' });

  try {
    const pool = await getDbPool();
    const result = await pool.request()
      .input('id', id)
      .input('status', status || null)
      .input('estoque', stockVerified !== undefined ? (stockVerified ? 1 : 0) : null)
      .input('estoque_at', stockVerifiedAt || null)
      .input('analista_estoque', stockAnalyst || null)
      .input('credito', creditApproved !== undefined ? (creditApproved ? 1 : 0) : null)
      .input('cred_analista', creditAnalyst || null)
      .input('cred_notas', creditNotes || null)
      .input('comercial', commercialApproved !== undefined ? (commercialApproved ? 1 : 0) : null)
      .input('com_gestor', commercialManager || null)
      .input('com_notas', commercialNotes || null)
      .input('protheus', protheusIntegrated !== undefined ? (protheusIntegrated ? 1 : 0) : null)
      .input('protheus_num', protheusOrderNumber || null)
      .input('nfe', protheusNFeNumber || null)
      .input('rastreio', protheusTrackingCode || null)
      .input('transportadora', protheusCarrierName || null)
      .query(`
        UPDATE dbo.PedidosPecas
        SET status_pedido = ISNULL(@status, status_pedido),
            estoque_verificado = ISNULL(@estoque, estoque_verificado),
            estoque_verificado_em = ISNULL(@estoque_at, estoque_verificado_em),
            analista_estoque = ISNULL(@analista_estoque, analista_estoque),
            credito_aprovado = ISNULL(@credito, credito_aprovado),
            credito_aprovado_em = CASE WHEN @credito = 1 AND credito_aprovado = 0 THEN SYSUTCDATETIME() ELSE credito_aprovado_em END,
            analista_credito = ISNULL(@cred_analista, analista_credito),
            notas_credito = ISNULL(@cred_notas, notas_credito),
            comercial_aprovado = ISNULL(@comercial, comercial_aprovado),
            comercial_aprovado_em = CASE WHEN @comercial = 1 AND comercial_aprovado = 0 THEN SYSUTCDATETIME() ELSE comercial_aprovado_em END,
            gestor_comercial = ISNULL(@com_gestor, gestor_comercial),
            notas_comercial = ISNULL(@com_notas, notas_comercial),
            integrado_protheus = ISNULL(@protheus, integrado_protheus),
            integrado_protheus_em = CASE WHEN @protheus = 1 AND integrado_protheus = 0 THEN SYSUTCDATETIME() ELSE integrado_protheus_em END,
            numero_pedido_protheus = ISNULL(@protheus_num, numero_pedido_protheus),
            nfe_numero = ISNULL(@nfe, nfe_numero),
            codigo_rastreio = ISNULL(@rastreio, codigo_rastreio),
            transportadora = ISNULL(@transportadora, transportadora)
        WHERE id_pedido_peca = @id
      `);
    if (result.rowsAffected[0] === 0) return res.status(404).json({ error: 'Pedido de peças não localizado.' });
    res.json({ success: true, message: 'Pedido de peças atualizado com sucesso!' });
  } catch (err) {
    console.error('[Parts API] Erro ao atualizar:', err);
    res.status(500).json({ error: 'Erro ao atualizar pedido de peças.' });
  }
};

// DELETE /api/parts/orders/:id
export const deletePartsOrder = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await getDbPool();
    const result = await pool.request().input('id', id).query('DELETE FROM dbo.PedidosPecas WHERE id_pedido_peca = @id');
    if (result.rowsAffected[0] === 0) return res.status(404).json({ error: 'Pedido de peças não localizado.' });
    res.json({ success: true, message: 'Pedido de peças removido.' });
  } catch (err) {
    console.error('[Parts API] Erro ao excluir:', err);
    res.status(500).json({ error: 'Erro ao excluir pedido de peças.' });
  }
};

export default { getPartsOrders, createPartsOrder, updatePartsOrder, deletePartsOrder };
