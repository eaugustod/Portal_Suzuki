import { getDbPool, sql } from '../db.js';

// GET /api/purchase/models
export const getPurchaseModels = async (req, res) => {
  try {
    const pool = await getDbPool();
    const modelsRes = await pool.request().query(`
      SELECT 
        m.id_modelo AS id,
        m.marca AS brand,
        m.nome_modelo AS modelName,
        m.ano_modelo AS yearModel,
        m.categoria AS category,
        m.custo_fabrica_base AS factoryCost,
        m.preco_publico_sugerido AS ppsMSRP,
        m.imagem_padrao_url AS image,
        m.descricao AS description,
        m.tipo_motor AS engineType,
        m.cilindrada AS displacement,
        m.potencia AS power,
        m.torque AS torque
      FROM dbo.ModelosMotos m
      WHERE m.ativo = 1
      ORDER BY m.marca, m.nome_modelo
    `);

    const variantsRes = await pool.request().query(`
      SELECT 
        v.id_variante AS id,
        v.id_modelo,
        v.nome_cor AS colorName,
        v.codigo_hex AS colorHex,
        v.imagem_especifica_url AS imageUrl,
        v.status_disponibilidade AS stockStatus,
        v.quantidade_disponivel_fabrica AS factoryStock,
        0 AS quantity
      FROM dbo.ModeloVariantesCores v
      WHERE v.ativo = 1
      ORDER BY v.ordem_exibicao, v.nome_cor
    `);

    const variantsByModel = {};
    for (const v of variantsRes.recordset) {
      if (!variantsByModel[v.id_modelo]) variantsByModel[v.id_modelo] = [];
      variantsByModel[v.id_modelo].push(v);
    }

    const models = modelsRes.recordset.map(m => ({
      ...m,
      storeStock: 4,
      avgRegistration: '12 un/mês',
      monthlyPurchase: 2,
      commitmentMonth3: 6,
      selectedOrderType: 'Compra',
      selectedPayment: 'A Prazo',
      variants: variantsByModel[m.id] || [],
      technicalSpecs: {
        engineType: m.engineType,
        displacement: m.displacement,
        power: m.power,
        torque: m.torque,
        fuelSystem: 'Injeção Eletrônica',
        transmission: '6 velocidades',
        frontSuspension: 'Telescópica invertida',
        rearSuspension: 'Balança monoamortecida',
        frontBrake: 'Disco Duplo ABS',
        rearBrake: 'Disco Simples ABS',
        frontTire: '120/70-ZR17',
        rearTire: '190/50-ZR17',
        fuelTank: '19 Litros',
        curbWeight: '215 kg',
        seatHeight: '825 mm'
      }
    }));

    res.json(models);
  } catch (err) {
    console.error('[Purchase API] Erro ao listar modelos:', err);
    res.status(500).json({ error: 'Erro ao carregar catálogo de motos.' });
  }
};

// GET /api/purchase/payment-conditions
export const getPaymentConditions = async (req, res) => {
  try {
    const pool = await getDbPool();
    const result = await pool.request().query(`
      SELECT 
        id_condicao AS id,
        marca AS brand,
        codigo_modelo AS modelCode,
        ano_modelo AS modelYear,
        nome_condicao AS paymentMethodName,
        percentual_desconto AS discountPercentage,
        quantidade_parcelas AS installments,
        CONVERT(VARCHAR(10), data_inicio_vigencia, 120) AS startDate,
        CONVERT(VARCHAR(10), data_fim_vigencia, 120) AS endDate,
        em_linha AS inLine,
        descricao AS description
      FROM dbo.CondicoesPagamento
      WHERE ativo = 1
      ORDER BY marca, codigo_modelo
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error('[Purchase API] Erro em condições de pagamento:', err);
    res.status(500).json({ error: 'Erro ao carregar condições de pagamento.' });
  }
};

// GET /api/purchase/freight
export const getFreightTable = async (req, res) => {
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
    res.json(result.recordset);
  } catch (err) {
    console.error('[Purchase API] Erro na tabela de fretes:', err);
    res.status(500).json({ error: 'Erro ao carregar tarifas de frete.' });
  }
};

// GET /api/purchase/orders
export const getFactoryOrders = async (req, res) => {
  const userScope = req.user?.dealershipId;
  const isMontadora = req.user?.scopeType === 'montadora';

  try {
    const pool = await getDbPool();
    let query = `
      SELECT 
        p.id_pedido AS id,
        p.numero_pedido AS orderNumber,
        p.numero_pedido_pai AS parentOrderNumber,
        p.id_concessionaria AS dealershipId,
        c.nome_curto AS dealershipName,
        c.cidade AS dealershipCity,
        c.uf AS dealershipState,
        c.regiao_brasil AS dealershipRegion,
        c.classificacao_tier AS dealershipTier,
        c.cnpj AS dealershipCnpj,
        CONVERT(VARCHAR(19), p.criado_em, 120) AS createdAt,
        p.modalidade_frete AS freightMode,
        p.condicao_pagamento_geral AS paymentMethod,
        p.total_unidades AS totalUnits,
        p.valor_total AS totalAmount,
        p.status_pedido AS status,
        p.status_aprovacao_geral AS overallApprovalStatus,
        p.pendente_aceite_concessionario AS hasPendingDealerAcceptance,
        p.permite_edicao_concessionario AS canDealerEdit,
        p.observacoes AS notes,
        p.credito_aprovado AS creditApproved,
        p.credito_analista AS creditAnalyst,
        p.comercial_aprovado AS commercialApproved,
        p.comercial_gestor AS commercialManager,
        p.integrado_protheus AS protheusIntegrated,
        p.numero_pedido_protheus AS protheusOrderNumber
      FROM dbo.PedidosFabrica p
      INNER JOIN dbo.Concessionarias c ON p.id_concessionaria = c.id_concessionaria
    `;

    if (!isMontadora && userScope) {
      query += ` WHERE p.id_concessionaria = @userScope`;
    }

    query += ` ORDER BY p.criado_em DESC`;

    const request = pool.request();
    if (!isMontadora && userScope) request.input('userScope', userScope);
    const ordersRes = await request.query(query);

    // Itens dos pedidos
    const itemsRes = await pool.request().query(`
      SELECT 
        id_item AS id,
        id_pedido AS orderId,
        id_modelo AS modelId,
        nome_modelo AS modelName,
        marca AS brand,
        categoria AS category,
        nome_cor AS colorName,
        codigo_hex AS colorHex,
        quantidade AS quantity,
        custo_unitario_fabrica AS unitFactoryCost,
        preco_publico_unitario AS unitMSRP,
        custo_total_item AS totalItemCost,
        nome_condicao_pagamento AS paymentConditionName,
        modalidade_frete AS freightMode,
        custo_frete AS freightCost,
        usou_fundo_reserva AS usedReserveFund,
        status_comercial AS commercialStatus,
        status_financeiro AS financialStatus,
        status_aceite_dealer AS dealerAcceptanceStatus,
        status_aprovacao_item AS itemApprovalStatus,
        modificado_pela_montadora AS modifiedByMontadora,
        nota_modificacao AS modificationNote
      FROM dbo.PedidoFabricaItens
    `);

    const itemsByOrder = {};
    for (const item of itemsRes.recordset) {
      if (!itemsByOrder[item.orderId]) itemsByOrder[item.orderId] = [];
      itemsByOrder[item.orderId].push(item);
    }

    const orders = ordersRes.recordset.map(o => ({
      ...o,
      items: itemsByOrder[o.id] || []
    }));

    res.json(orders);
  } catch (err) {
    console.error('[Purchase API] Erro ao listar pedidos:', err);
    res.status(500).json({ error: 'Erro ao carregar pedidos de fábrica.' });
  }
};

// POST /api/purchase/orders
export const createFactoryOrder = async (req, res) => {
  const {
    id,
    orderNumber,
    dealershipId,
    freightMode,
    paymentMethod,
    totalUnits,
    totalAmount,
    notes,
    usedReserveFund,
    reserveFundAmount,
    items
  } = req.body;

  const isMontadora = req.user?.scopeType === 'montadora';
  const targetDealer = isMontadora ? (dealershipId || req.user?.dealershipId) : req.user?.dealershipId;
  const userEmail = req.user?.email || 'portal.sistema@jtoledo.com.br';

  if (!targetDealer) {
    return res.status(400).json({ error: 'Concessionária de destino é obrigatória para transmissão do pedido.' });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'O pedido deve conter ao menos um item.' });
  }
  if (!totalAmount || totalAmount <= 0) {
    return res.status(400).json({ error: 'Valor total do pedido inválido.' });
  }
  const invalidItem = items.find(it => !it.modelId || !it.modelName || !it.quantity || it.quantity <= 0);
  if (invalidItem) {
    return res.status(400).json({ error: `Item inválido no pedido (${invalidItem.modelName || 'sem modelo'}). Quantidade deve ser maior que zero.` });
  }

  const orderId = id || `ped-${Date.now()}`;
  const orderNumberFinal = orderNumber || `PED-${Math.floor(10000 + Math.random() * 89999)}`;
  const computedTotalUnits = totalUnits || items.reduce((acc, it) => acc + Number(it.quantity || 0), 0);
  const computedTotalAmount = Number(totalAmount) || items.reduce((acc, it) => acc + Number(it.totalItemCost || 0), 0);

  let transaction;
  try {
    const pool = await getDbPool();
    transaction = new sql.Transaction(pool);
    await transaction.begin();

    // 1. Executa a procedure atômica com validação do Fundo de Reserva
    await transaction.request()
      .input('IdPedido', orderId)
      .input('NumeroPedido', orderNumberFinal)
      .input('IdConcessionaria', targetDealer)
      .input('ModalidadeFrete', String(freightMode || 'CIF').toUpperCase())
      .input('CondicaoPagamentoGeral', paymentMethod || 'A Prazo')
      .input('TotalUnidades', computedTotalUnits)
      .input('ValorTotal', computedTotalAmount)
      .input('Observacoes', notes || null)
      .input('UsouFundoReserva', usedReserveFund ? 1 : 0)
      .input('ValorAbatimentoFundo', Number(reserveFundAmount) || 0)
      .input('UsuarioEmail', userEmail)
      .execute('dbo.sp_CriarPedidoFabrica');

    // 2. Insere itens na MESMA transação (rollback automático em caso de falha em qualquer item)
    for (const it of items) {
      const rawItemId = it.id || `item-${orderId}-${items.indexOf(it) + 1}`;
      const itemId = String(rawItemId).substring(0, 50);
      await transaction.request()
        .input('id_item', itemId)
        .input('id_pedido', orderId)
        .input('id_mod', String(it.modelId).substring(0, 60))
        .input('nome_mod', String(it.modelName).substring(0, 100))
        .input('marca', String(it.brand || 'Suzuki').substring(0, 30))
        .input('cat', String(it.category || 'Motos').substring(0, 50))
        .input('cor', String(it.colorName || '').substring(0, 100))
        .input('hex', String(it.colorHex || '#000000').substring(0, 10))
        .input('qtd', Number(it.quantity) || 1)
        .input('custo_unit', Number(it.unitFactoryCost) || 0)
        .input('preco_unit', Number(it.unitMSRP) || Number(it.unitFactoryCost) * 1.2)
        .input('total_item', Number(it.totalItemCost) || (Number(it.quantity) * Number(it.unitFactoryCost)))
        .input('cond_nome', String(it.paymentConditionName || paymentMethod || 'A Prazo').substring(0, 150))
        .query(`
          INSERT INTO dbo.PedidoFabricaItens (
            id_item, id_pedido, id_modelo, nome_modelo, marca, categoria,
            nome_cor, codigo_hex, quantidade, custo_unitario_fabrica, preco_publico_unitario,
            custo_total_item, nome_condicao_pagamento
          ) VALUES (
            @id_item, @id_pedido, @id_mod, @nome_mod, @marca, @cat,
            @cor, @hex, @qtd, @custo_unit, @preco_unit,
            @total_item, @cond_nome
          )
        `);
    }

    await transaction.commit();
    res.status(201).json({ success: true, message: 'Pedido transmitido com sucesso à fábrica J. Toledo!', orderId, orderNumber: orderNumberFinal });
  } catch (err) {
    if (transaction) {
      try { await transaction.rollback(); } catch (rollbackErr) { console.error('[Purchase API] Erro ao fazer rollback:', rollbackErr.message); }
    }
    console.error('[Purchase API] Erro ao criar pedido:', err);
    const isFundError = /fundo de reserva/i.test(err.message);
    res.status(isFundError ? 422 : 500).json({ error: err.message || 'Erro ao transmitir pedido de fábrica.' });
  }
};

// PATCH /api/purchase/orders/:id (Atualiza status/decisões da montadora: crédito, comercial, Protheus, aceite)
export const updateFactoryOrder = async (req, res) => {
  const { id } = req.params;
  const {
    status,
    creditApproved,
    creditAnalyst,
    creditNotes,
    commercialApproved,
    commercialManager,
    commercialNotes,
    protheusIntegrated,
    protheusOrderNumber,
    notes,
    items
  } = req.body;
  const userEmail = req.user?.email || 'gestao.rede@jtoledo.com.br';

  try {
    const pool = await getDbPool();
    await pool.request()
      .input('id', id)
      .input('status', status || null)
      .input('credito', creditApproved !== undefined ? (creditApproved ? 1 : 0) : null)
      .input('cred_analista', creditAnalyst || null)
      .input('cred_notas', creditNotes || null)
      .input('comercial', commercialApproved !== undefined ? (commercialApproved ? 1 : 0) : null)
      .input('com_gestor', commercialManager || null)
      .input('com_notas', commercialNotes || null)
      .input('protheus', protheusIntegrated !== undefined ? (protheusIntegrated ? 1 : 0) : null)
      .input('protheus_num', protheusOrderNumber || null)
      .input('notas', notes || null)
      .input('usr', userEmail)
      .query(`
        UPDATE dbo.PedidosFabrica
        SET status_pedido = ISNULL(@status, status_pedido),
            credito_aprovado = ISNULL(@credito, credito_aprovado),
            credito_analista = ISNULL(@cred_analista, credito_analista),
            credito_notas = ISNULL(@cred_notas, credito_notas),
            comercial_aprovado = ISNULL(@comercial, comercial_aprovado),
            comercial_gestor = ISNULL(@com_gestor, comercial_gestor),
            comercial_notas = ISNULL(@com_notas, comercial_notas),
            integrado_protheus = ISNULL(@protheus, integrado_protheus),
            numero_pedido_protheus = ISNULL(@protheus_num, numero_pedido_protheus),
            observacoes = ISNULL(@notas, observacoes),
            status_aprovacao_geral = CASE
              WHEN @credito = 1 AND @comercial = 1 AND @protheus = 1 THEN 'aprovado'
              WHEN @credito = 1 AND @comercial = 1 THEN 'aprovado_parcial'
              ELSE status_aprovacao_geral
            END,
            revisado_por = @usr,
            revisado_em = SYSUTCDATETIME(),
            atualizado_em = SYSUTCDATETIME()
        WHERE id_pedido = @id
      `);

    // Atualiza itens individuais quando enviados (aceite da concessionária / modificações da montadora)
    if (items && Array.isArray(items) && items.length > 0) {
      for (const it of items) {
        if (!it.id) continue;
        await pool.request()
          .input('id_item', it.id)
          .input('aceite', it.dealerAcceptanceStatus || null)
          .input('aprov', it.itemApprovalStatus || null)
          .input('status_com', it.commercialStatus || null)
          .input('status_fin', it.financialStatus || null)
          .input('nota', it.modificationNote || null)
          .query(`
            UPDATE dbo.PedidoFabricaItens
            SET status_aceite_dealer = ISNULL(@aceite, status_aceite_dealer),
                status_aprovacao_item = ISNULL(@aprov, status_aprovacao_item),
                status_comercial = ISNULL(@status_com, status_comercial),
                status_financeiro = ISNULL(@status_fin, status_financeiro),
                nota_modificacao = ISNULL(@nota, nota_modificacao),
                atualizado_em = SYSUTCDATETIME()
            WHERE id_item = @id_item
          `);
      }
    }

    res.json({ success: true, message: 'Pedido atualizado com sucesso!' });
  } catch (err) {
    console.error('[Purchase API] Erro ao atualizar pedido:', err);
    res.status(500).json({ error: 'Erro ao atualizar pedido de fábrica.' });
  }
};

// PUT /api/purchase/models/:id (Salvar alterações de foto, nome, dados, preços e variantes)
export const updatePurchaseModel = async (req, res) => {
  const { id } = req.params;
  const m = req.body;

  try {
    const pool = await getDbPool();

    // 1. Atualiza dados principais do modelo
    await pool.request()
      .input('id', id)
      .input('marca', m.brand || 'Suzuki')
      .input('nome', m.modelName)
      .input('ano', m.yearModel || '2026/2026')
      .input('cat', m.category || 'Motocicleta')
      .input('custo', m.factoryCost || 0)
      .input('pps', m.ppsMSRP || 0)
      .input('img', m.image || null)
      .input('desc', m.description || null)
      .input('motor', m.technicalSpecs?.engineType || null)
      .input('cilindrada', m.technicalSpecs?.displacement || null)
      .input('potencia', m.technicalSpecs?.power || null)
      .input('torque', m.technicalSpecs?.torque || null)
      .query(`
        UPDATE dbo.ModelosMotos
        SET marca = @marca,
            nome_modelo = @nome,
            ano_modelo = @ano,
            categoria = @cat,
            custo_fabrica_base = @custo,
            preco_publico_sugerido = @pps,
            imagem_padrao_url = ISNULL(@img, imagem_padrao_url),
            descricao = @desc,
            tipo_motor = @motor,
            cilindrada = @cilindrada,
            potencia = @potencia,
            torque = @torque,
            atualizado_em = SYSUTCDATETIME()
        WHERE id_modelo = @id
      `);

    // 2. Se houver variantes atualizadas, sincroniza fotos e status
    if (m.variants && Array.isArray(m.variants)) {
      for (const v of m.variants) {
        await pool.request()
          .input('id_var', v.id)
          .input('id_mod', id)
          .input('cor', v.colorName)
          .input('hex', v.colorHex || '#000000')
          .input('img_url', v.imageUrl || null)
          .input('status', v.stockStatus || 'disponivel')
          .query(`
            IF EXISTS (SELECT 1 FROM dbo.ModeloVariantesCores WHERE id_variante = @id_var)
            BEGIN
              UPDATE dbo.ModeloVariantesCores
              SET nome_cor = @cor,
                  codigo_hex = @hex,
                  imagem_especifica_url = ISNULL(@img_url, imagem_especifica_url),
                  status_disponibilidade = @status,
                  atualizado_em = SYSUTCDATETIME()
              WHERE id_variante = @id_var
            END
            ELSE
            BEGIN
              INSERT INTO dbo.ModeloVariantesCores (
                id_variante, id_modelo, nome_cor, codigo_hex,
                imagem_especifica_url, status_disponibilidade
              ) VALUES (
                @id_var, @id_mod, @cor, @hex,
                @img_url, @status
              )
            END
          `);
      }
    }

    res.json({ success: true, message: `Modelo ${m.modelName} atualizado com sucesso no banco de dados!` });
  } catch (err) {
    console.error('[Purchase API] Erro ao atualizar modelo:', err);
    res.status(500).json({ error: 'Erro ao atualizar dados do modelo no banco.' });
  }
};

export default {
  getPurchaseModels,
  getPaymentConditions,
  getFreightTable,
  getFactoryOrders,
  createFactoryOrder,
  updateFactoryOrder,
  updatePurchaseModel
};
