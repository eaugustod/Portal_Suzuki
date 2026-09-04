import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { getDbPool } from '../db.js';

// Importa dados mockados do projeto
import { INITIAL_DEALERSHIPS_FULL } from '../../src/data/dealershipsData.js';
import { INITIAL_BRANDS } from '../../src/data/mockBrandsData.js';
import { INITIAL_PURCHASE_MODELS } from '../../src/data/mockData.js';
import { INITIAL_PAYMENT_CONDITIONS } from '../../src/data/mockPaymentConditions.js';
import { INITIAL_WORKFLOW_STEPS } from '../../src/data/workflowStepsData.js';
import { INITIAL_RESERVE_FUND_TRANSACTIONS } from '../../src/data/mockReserveFundData.js';
import { INITIAL_MONTHLY_COMMITMENTS } from '../../src/data/monthlyCommitmentsData.js';
import { INITIAL_FACTORY_ORDERS } from '../../src/data/mockData.js';
import { INITIAL_INVENTORY, INITIAL_TRANSIT_ORDERS } from '../../src/data/mockData.js';

dotenv.config();

async function seedData() {
  const pool = await getDbPool();
  console.log('[Seed] Iniciando população de dados no SQL Server...');

  // ==========================================
  // 0. Marcas (Cadastro Centralizado de Marcas)
  // ==========================================
  console.log('[Seed] Inserindo Marcas...');
  for (const b of INITIAL_BRANDS) {
    await pool.request()
      .input('id', b.id)
      .input('nome', b.nome)
      .input('codigo', b.codigo)
      .input('razao', b.razaoSocial || b.nome)
      .input('cnpj', b.cnpj || null)
      .input('cor_pri', b.corPrimaria || '#00428c')
      .input('cor_sec', b.corSecundaria || '#ffffff')
      .input('logo', b.logoUrl || null)
      .input('site', b.siteOficial || null)
      .input('desc', b.descricao || null)
      .input('pais', b.paisOrigem || 'Brasil')
      .input('ordem', b.ordemExibicao || 0)
      .query(`
        IF NOT EXISTS (SELECT 1 FROM dbo.Marcas WHERE id_marca = @id OR nome = @nome)
        BEGIN
          INSERT INTO dbo.Marcas (
            id_marca, nome, codigo, razao_social, cnpj, cor_primaria, cor_secundaria,
            logo_url, site_oficial, descricao, pais_origem, ativo, ordem_exibicao
          ) VALUES (
            @id, @nome, @codigo, @razao, @cnpj, @cor_pri, @cor_sec,
            @logo, @site, @desc, @pais, 1, @ordem
          )
        END
      `);
  }


  // ==========================================
  // 1. Departamentos
  // ==========================================
  console.log('[Seed] Inserindo Departamentos...');
  const departamentos = [
    { nome: 'Diretoria Executiva', sigla: 'DIR', descricao: 'Diretoria Geral e Operações Grupo J. Toledo' },
    { nome: 'Comercial & Rede', sigla: 'COM', descricao: 'Gestão comercial da rede e distribuição de cotas' },
    { nome: 'Crédito & Finanças', sigla: 'FIN', descricao: 'Análise de risco, crédito e faturamento' },
    { nome: 'Logística & Distribuição', sigla: 'LOG', descricao: 'Armazéns Manaus / Jundiaí e transportadoras' },
    { nome: 'Pós-Venda & Garantia', sigla: 'POS', descricao: 'Garantias, peças e auditorias de rede' },
    { nome: 'Concessionária - Titular / Diretoria', sigla: 'DLR-DIR', descricao: 'Sócios e Diretores da concessionária' },
    { nome: 'Concessionária - Vendas', sigla: 'DLR-VND', descricao: 'Gerência e consultores de vendas do dealer' },
    { nome: 'Concessionária - Financeiro', sigla: 'DLR-FIN', descricao: 'Administrativo e financeiro do dealer' },
    { nome: 'Concessionária - Oficina', sigla: 'DLR-OFC', descricao: 'Chefe de oficina e pós-vendas do dealer' }
  ];

  for (const dep of departamentos) {
    await pool.request()
      .input('nome', dep.nome)
      .input('sigla', dep.sigla)
      .input('descricao', dep.descricao)
      .query(`
        IF NOT EXISTS (SELECT 1 FROM dbo.Departamentos WHERE nome = @nome)
        BEGIN
          INSERT INTO dbo.Departamentos (nome, sigla, descricao) VALUES (@nome, @sigla, @descricao)
        END
      `);
  }

  // ==========================================
  // 2. Perfis de Acesso (Roles)
  // ==========================================
  console.log('[Seed] Inserindo Perfis de Acesso...');
  const perfis = [
    { codigo: 'admin_montadora', nome: 'Administrador Montadora J. Toledo', escopo: 'montadora', desc: 'Acesso total corporativo nacional' },
    { codigo: 'comercial_montadora', nome: 'Gerente Comercial Montadora', escopo: 'montadora', desc: 'Aprovações comerciais e cotas' },
    { codigo: 'credito_montadora', nome: 'Analista de Crédito Montadora', escopo: 'montadora', desc: 'Aprovações financeiras e Fundo de Reserva' },
    { codigo: 'admin_dealer', nome: 'Diretor / Titular Concessionária', escopo: 'concessionaria', desc: 'Acesso total de gestão da loja' },
    { codigo: 'vendas', nome: 'Gerente / Consultor de Vendas', escopo: 'concessionaria', desc: 'Pedidos de motos e consulta de estoque' },
    { codigo: 'financeiro', nome: 'Analista Financeiro Dealer', escopo: 'concessionaria', desc: 'Fundo de reserva e pagamentos' },
    { codigo: 'pos_vendas', nome: 'Chefe de Oficina / Pós-Venda', escopo: 'concessionaria', desc: 'Ordens de serviço e garantias' }
  ];

  for (const perf of perfis) {
    await pool.request()
      .input('codigo', perf.codigo)
      .input('nome', perf.nome)
      .input('escopo', perf.escopo)
      .input('desc', perf.desc)
      .query(`
        IF NOT EXISTS (SELECT 1 FROM dbo.PerfisAcesso WHERE codigo_perfil = @codigo)
        BEGIN
          INSERT INTO dbo.PerfisAcesso (codigo_perfil, nome, tipo_escopo, descricao) VALUES (@codigo, @nome, @escopo, @desc)
        END
      `);
  }

  // Cache de IDs de Perfis e Departamentos
  const perfisDb = (await pool.request().query("SELECT id_perfil, codigo_perfil FROM dbo.PerfisAcesso")).recordset;
  const perfilMap = Object.fromEntries(perfisDb.map(p => [p.codigo_perfil, p.id_perfil]));

  const depsDb = (await pool.request().query("SELECT id_departamento, nome FROM dbo.Departamentos")).recordset;
  const depMap = Object.fromEntries(depsDb.map(d => [d.nome, d.id_departamento]));

  // ==========================================
  // 3. Concessionárias e Usuários
  // ==========================================
  console.log('[Seed] Inserindo Concessionárias e Usuários...');
  const salt = await bcrypt.genSalt(10);
  const defaultPasswordHash = await bcrypt.hash('Suzuki@2026', salt);

  // Usuário Master da Montadora (Eduardo Donato)
  await pool.request()
    .input('id', 'usr-montadora-master')
    .input('id_dealer', null)
    .input('id_dep', depMap['Diretoria Executiva'])
    .input('id_perfil', perfilMap['admin_montadora'])
    .input('nome', 'Eduardo Donato')
    .input('email', 'eduardo.donato@jtoledo.com.br')
    .input('senha', defaultPasswordHash)
    .input('cargo', 'Diretor Nacional de Operações & Rede')
    .query(`
      IF NOT EXISTS (SELECT 1 FROM dbo.Usuarios WHERE email = @email)
      BEGIN
        INSERT INTO dbo.Usuarios (id_usuario, id_concessionaria, id_departamento, id_perfil, nome, email, senha_hash, cargo, status, trocar_senha_proximo_login)
        VALUES (@id, @id_dealer, @id_dep, @id_perfil, @nome, @email, @senha, @cargo, 'ativo', 0)
      END
    `);

  // Montadora J. Toledo
  await pool.request().query(`
    IF NOT EXISTS (SELECT 1 FROM dbo.Concessionarias WHERE id_concessionaria = 'jtoledo')
    BEGIN
      INSERT INTO dbo.Concessionarias (
        id_concessionaria, codigo_dealer, nome_fantasia, nome_curto, razao_social, slogan, cnpj,
        tipo, status, classificacao_tier, meta_mensal_faturamento, telefone, email_contato, gerente_responsavel,
        cidade, uf, regiao_brasil, armazem_origem_padrao
      ) VALUES (
        'jtoledo', 'JT-0001', 'Grupo J. Toledo Brasil', 'Montadora J. Toledo', 'J. Toledo Suzuki Motos do Brasil Ltda.',
        'Montadora Oficial Suzuki • Zontes • Haojue • Kymco Brasil', '61.123.456/0001-90',
        'montadora', 'ativa', 'Diamante', 18500000, '0800 707 8020', 'diretoria.rede@jtoledo.com.br', 'Diretoria de Operações & Rede',
        'Jundiaí / Manaus', 'SP', 'Sudeste', 'empresa_13_armazem'
      )
    END
  `);

  for (const [key, d] of Object.entries(INITIAL_DEALERSHIPS_FULL)) {
    // Insere ou atualiza Dealer
    await pool.request()
      .input('id', d.id)
      .input('codigo', d.dealerCode || `DLR-${d.id}`)
      .input('fantasia', d.tradeName || d.name)
      .input('curto', d.shortName)
      .input('razao', d.legalName || d.name)
      .input('slogan', d.tagline || '')
      .input('cnpj', d.cnpj)
      .input('ie', d.stateRegistration || '')
      .input('im', d.municipalRegistration || '')
      .input('cnae', d.cnae || '')
      .input('regime', d.taxRegime || 'Lucro Real')
      .input('tier', d.tier || 'Prata')
      .input('status', d.status || 'ativa')
      .input('meta', d.monthlyTarget || 1000000)
      .input('credito', d.creditLimit || 2000000)
      .input('cred_usado', d.creditUsed || 0)
      .input('floor_plan', d.floorPlanLimit || 1000000)
      .input('rating', d.creditRating || 'A')
      .input('telefone', d.phone)
      .input('email', d.contactEmail || '')
      .input('gerente', d.manager || '')
      .input('cep', d.zipCode || '')
      .input('logradouro', d.street || '')
      .input('numero', d.number || '')
      .input('bairro', d.neighborhood || '')
      .input('cidade', d.city)
      .input('uf', d.state)
      .input('regiao', d.region || 'Sudeste')
      .input('armazem', d.originWarehouse || (['Sul', 'Sudeste'].includes(d.region) && d.state !== 'ES' ? 'empresa_13_armazem' : 'manaus_le_16'))
      .input('saldo_fundo', d.reserveFundBalance || 0)
      .query(`
        IF NOT EXISTS (SELECT 1 FROM dbo.Concessionarias WHERE id_concessionaria = @id)
        BEGIN
          INSERT INTO dbo.Concessionarias (
            id_concessionaria, codigo_dealer, nome_fantasia, nome_curto, razao_social, slogan, cnpj,
            inscricao_estadual, inscricao_municipal, cnae, regime_tributario, tipo, status, classificacao_tier,
            meta_mensal_faturamento, limite_credito, limite_credito_utilizado, limite_floor_plan, rating_credito,
            telefone, email_contato, gerente_responsavel, cep, logradouro, numero, bairro, cidade, uf, regiao_brasil,
            armazem_origem_padrao, saldo_fundo_reserva
          ) VALUES (
            @id, @codigo, @fantasia, @curto, @razao, @slogan, @cnpj,
            @ie, @im, @cnae, @regime, 'concessionaria', @status, @tier,
            @meta, @credito, @cred_usado, @floor_plan, @rating,
            @telefone, @email, @gerente, @cep, @logradouro, @numero, @bairro, @cidade, @uf, @regiao,
            @armazem, @saldo_fundo
          )
        END
      `);

    // Dados Bancários
    if (d.bankAccount) {
      await pool.request()
        .input('id_dealer', d.id)
        .input('banco_cod', d.bankAccount.bankCode || '001')
        .input('banco_nome', d.bankAccount.bankName || 'Banco')
        .input('agencia', d.bankAccount.agency || '0001')
        .input('conta', d.bankAccount.accountNumber || '0000-0')
        .input('pix', d.bankAccount.pixKey || '')
        .input('pix_tipo', d.bankAccount.pixKeyType || 'CNPJ')
        .query(`
          IF NOT EXISTS (SELECT 1 FROM dbo.ConcessionariaContasBancarias WHERE id_concessionaria = @id_dealer)
          BEGIN
            INSERT INTO dbo.ConcessionariaContasBancarias (id_concessionaria, banco_codigo, banco_nome, agencia, conta_numero, chave_pix, tipo_chave_pix)
            VALUES (@id_dealer, @banco_cod, @banco_nome, @agencia, @conta, @pix, @pix_tipo)
          END
        `);
    }

    // Usuários da Concessionária
    if (d.users && Array.isArray(d.users)) {
      for (const u of d.users) {
        let perfilCodigo = 'vendas';
        let depNome = 'Concessionária - Vendas';

        if (u.accessLevel === 'admin_dealer' || u.role.includes('Diretor')) {
          perfilCodigo = 'admin_dealer';
          depNome = 'Concessionária - Titular / Diretoria';
        } else if (u.accessLevel === 'financeiro') {
          perfilCodigo = 'financeiro';
          depNome = 'Concessionária - Financeiro';
        } else if (u.accessLevel === 'pos_vendas') {
          perfilCodigo = 'pos_vendas';
          depNome = 'Concessionária - Oficina';
        }

        await pool.request()
          .input('id_usr', u.id || `usr-${d.id}-${Math.random()}`)
          .input('id_dealer', d.id)
          .input('id_dep', depMap[depNome] || depMap['Concessionária - Vendas'])
          .input('id_perfil', perfilMap[perfilCodigo] || perfilMap['vendas'])
          .input('nome', u.name)
          .input('email', u.email)
          .input('senha', defaultPasswordHash)
          .input('cpf', u.cpf || '')
          .input('telefone', u.phone || '')
          .input('cargo', u.role)
          .query(`
            IF NOT EXISTS (SELECT 1 FROM dbo.Usuarios WHERE email = @email)
            BEGIN
              INSERT INTO dbo.Usuarios (
                id_usuario, id_concessionaria, id_departamento, id_perfil, nome, email, senha_hash,
                cpf, telefone, cargo, status, trocar_senha_proximo_login
              ) VALUES (
                @id_usr, @id_dealer, @id_dep, @id_perfil, @nome, @email, @senha,
                @cpf, @telefone, @cargo, 'ativo', 0
              )
            END
          `);
      }
    }
  }

  // ==========================================
  // 4. Modelos e Variantes de Cores
  // ==========================================
  console.log('[Seed] Inserindo Modelos de Motos e Variantes...');
  for (const m of INITIAL_PURCHASE_MODELS) {
    await pool.request()
      .input('id', m.id)
      .input('marca', m.brand)
      .input('nome', m.modelName)
      .input('comercial', m.modelName)
      .input('ano', m.yearModel || '2026')
      .input('cat', m.category || 'Motos')
      .input('cc', m.technicalSpecs?.displacement || '0 cc')
      .input('motor', m.technicalSpecs?.engineType || '')
      .input('potencia', m.technicalSpecs?.power || '')
      .input('torque', m.technicalSpecs?.torque || '')
      .input('custo', m.factoryCost)
      .input('pps', m.ppsMSRP)
      .input('img', m.image || '')
      .input('desc', m.description || '')
      .query(`
        IF NOT EXISTS (SELECT 1 FROM dbo.ModelosMotos WHERE id_modelo = @id)
        BEGIN
          INSERT INTO dbo.ModelosMotos (
            id_modelo, marca, nome_modelo, nome_comercial, ano_modelo, categoria, cilindrada,
            tipo_motor, potencia, torque, custo_fabrica_base, preco_publico_sugerido, imagem_padrao_url, descricao
          ) VALUES (
            @id, @marca, @nome, @comercial, @ano, @cat, @cc,
            @motor, @potencia, @torque, @custo, @pps, @img, @desc
          )
        END
      `);

    // Cores
    if (m.variants && Array.isArray(m.variants)) {
      for (const v of m.variants) {
        const vId = `${m.id}-${v.id}`;
        await pool.request()
          .input('id_var', vId)
          .input('id_mod', m.id)
          .input('nome_cor', v.colorName)
          .input('hex', v.colorHex)
          .input('img_var', v.imageUrl || m.image || '')
          .input('status', v.stockStatus === 'sem_estoque' ? 'indisponivel' : (v.stockStatus === 'poucas' ? 'poucas_unidades' : 'disponivel'))
          .input('qtd', v.quantity || 10)
          .query(`
            IF NOT EXISTS (SELECT 1 FROM dbo.ModeloVariantesCores WHERE id_variante = @id_var)
            BEGIN
              INSERT INTO dbo.ModeloVariantesCores (
                id_variante, id_modelo, nome_cor, codigo_hex, imagem_especifica_url, status_disponibilidade, quantidade_disponivel_fabrica
              ) VALUES (
                @id_var, @id_mod, @nome_cor, @hex, @img_var, @status, @qtd
              )
            END
          `);
      }
    }
  }

  // ==========================================
  // 5. Condições de Pagamento
  // ==========================================
  console.log('[Seed] Inserindo Condições de Pagamento...');
  for (const cp of INITIAL_PAYMENT_CONDITIONS) {
    await pool.request()
      .input('id', cp.id)
      .input('marca', cp.brand)
      .input('modelo', cp.modelCode)
      .input('ano', cp.modelYear)
      .input('nome', cp.paymentMethodName)
      .input('desc_pct', cp.discountPercentage)
      .input('parc', cp.installments)
      .input('dt_ini', cp.startDate)
      .input('dt_fim', cp.endDate)
      .input('inline', cp.inLine ? 1 : 0)
      .input('descr', cp.description || '')
      .query(`
        IF NOT EXISTS (SELECT 1 FROM dbo.CondicoesPagamento WHERE id_condicao = @id)
        BEGIN
          INSERT INTO dbo.CondicoesPagamento (
            id_condicao, marca, codigo_modelo, ano_modelo, nome_condicao, percentual_desconto,
            quantidade_parcelas, data_inicio_vigencia, data_fim_vigencia, em_linha, descricao
          ) VALUES (
            @id, @marca, @modelo, @ano, @nome, @desc_pct,
            @parc, @dt_ini, @dt_fim, @inline, @descr
          )
        END
      `);
  }

  // ==========================================
  // 6. Fundo de Reserva (Lançamentos e Extrato)
  // ==========================================
  console.log('[Seed] Inserindo Lançamentos do Fundo de Reserva...');
  for (const rf of INITIAL_RESERVE_FUND_TRANSACTIONS) {
    await pool.request()
      .input('id', rf.id)
      .input('dealer', rf.dealershipId)
      .input('tipo', rf.type)
      .input('origem', rf.origin || 'montadora_credito')
      .input('marca', rf.brand)
      .input('valor', rf.amount)
      .input('ref', rf.reference)
      .input('modelo', rf.modelName || '')
      .input('chassi', rf.chassi || '')
      .input('status', rf.status || 'aprovado')
      .input('fin_aprov', rf.financialApproved ? 1 : 0)
      .input('aprov_por', rf.financialApprovedBy || 'Financeiro JTA')
      .input('usr', rf.userResponsible || 'Montadora J. Toledo')
      .input('saldo', rf.amount)
      .input('obs', rf.observation || '')
      .query(`
        IF NOT EXISTS (SELECT 1 FROM dbo.FundoReservaLancamentos WHERE id_lancamento = @id)
        BEGIN
          INSERT INTO dbo.FundoReservaLancamentos (
            id_lancamento, id_concessionaria, tipo, origem, marca, valor, referencia,
            nome_modelo, chassi, status, financeiro_aprovado, aprovado_por, usuario_responsavel,
            saldo_resultante, observacao
          ) VALUES (
            @id, @dealer, @tipo, @origem, @marca, @valor, @ref,
            @modelo, @chassi, @status, @fin_aprov, @aprov_por, @usr,
            @saldo, @obs
          )
        END
      `);
  }

  // ==========================================
  // 7. Workflow Steps
  // ==========================================
  console.log('[Seed] Inserindo Etapas do Workflow...');
  for (const wf of INITIAL_WORKFLOW_STEPS) {
    await pool.request()
      .input('id', wf.id)
      .input('ordem', wf.stepOrder)
      .input('nome', wf.stepName)
      .input('dep', wf.department)
      .input('usr', wf.responsibleUser)
      .input('email', wf.userEmail)
      .input('status_dest', wf.targetStatusOnApprove)
      .input('auto_protheus', wf.autoIntegrateProtheus ? 1 : 0)
      .input('tipo', wf.workflowType || 'pedido')
      .input('obs', wf.notes || '')
      .query(`
        IF NOT EXISTS (SELECT 1 FROM dbo.WorkflowEtapas WHERE id_etapa = @id)
        BEGIN
          INSERT INTO dbo.WorkflowEtapas (
            id_etapa, ordem_etapa, nome_etapa, departamento, usuario_responsavel, email_responsavel,
            status_destino_ao_aprovar, integrar_protheus_automatico, tipo_workflow, observacoes
          ) VALUES (
            @id, @ordem, @nome, @dep, @usr, @email,
            @status_dest, @auto_protheus, @tipo, @obs
          )
        END
      `);
  }

  // ==========================================
  // 8. Tarifas de Frete Padrão por Região e Marca
  // ==========================================
  console.log('[Seed] Inserindo Tarifas de Frete Padrão...');
  const fretes = [
    { id: 'frt-sp-13', marca: 'Suzuki', uf: 'SP', regiao: 'Sudeste', armazem: 'empresa_13_armazem', desc: 'CD Jundiaí (SP)', custo: 650.00, dias: 2 },
    { id: 'frt-rj-13', marca: 'Suzuki', uf: 'RJ', regiao: 'Sudeste', armazem: 'empresa_13_armazem', desc: 'CD Jundiaí (SP)', custo: 780.00, dias: 3 },
    { id: 'frt-mg-13', marca: 'Suzuki', uf: 'MG', regiao: 'Sudeste', armazem: 'empresa_13_armazem', desc: 'CD Jundiaí (SP)', custo: 820.00, dias: 4 },
    { id: 'frt-rs-13', marca: 'Suzuki', uf: 'RS', regiao: 'Sul', armazem: 'empresa_13_armazem', desc: 'CD Jundiaí (SP)', custo: 950.00, dias: 5 },
    { id: 'frt-pr-13', marca: 'Suzuki', uf: 'PR', regiao: 'Sul', armazem: 'empresa_13_armazem', desc: 'CD Jundiaí (SP)', custo: 880.00, dias: 4 },
    { id: 'frt-sc-13', marca: 'Suzuki', uf: 'SC', regiao: 'Sul', armazem: 'empresa_13_armazem', desc: 'CD Jundiaí (SP)', custo: 900.00, dias: 4 },
    { id: 'frt-df-16', marca: 'Suzuki', uf: 'DF', regiao: 'Centro-Oeste', armazem: 'manaus_le_16', desc: 'Manaus (AM) LE 16', custo: 1150.00, dias: 8 },
    { id: 'frt-go-16', marca: 'Suzuki', uf: 'GO', regiao: 'Centro-Oeste', armazem: 'manaus_le_16', desc: 'Manaus (AM) LE 16', custo: 1200.00, dias: 8 },
    { id: 'frt-ba-16', marca: 'Suzuki', uf: 'BA', regiao: 'Nordeste', armazem: 'manaus_le_16', desc: 'Manaus (AM) LE 16', custo: 1350.00, dias: 10 },
    { id: 'frt-pe-16', marca: 'Suzuki', uf: 'PE', regiao: 'Nordeste', armazem: 'manaus_le_16', desc: 'Manaus (AM) LE 16', custo: 1400.00, dias: 12 },
    { id: 'frt-am-16', marca: 'Suzuki', uf: 'AM', regiao: 'Norte', armazem: 'manaus_le_16', desc: 'Manaus (AM) LE 16', custo: 350.00, dias: 1 }
  ];

  for (const f of fretes) {
    await pool.request()
      .input('id', f.id)
      .input('marca', f.marca || 'Suzuki')
      .input('uf', f.uf)
      .input('regiao', f.regiao)
      .input('armazem', f.armazem)
      .input('desc', f.desc)
      .input('custo', f.custo)
      .input('dias', f.dias)
      .query(`
        IF NOT EXISTS (SELECT 1 FROM dbo.TarifasFrete WHERE id_tarifa = @id)
        BEGIN
          INSERT INTO dbo.TarifasFrete (id_tarifa, marca, uf, regiao_brasil, armazem_origem, descricao_origem, custo_por_unidade, prazo_estimado_dias)
          VALUES (@id, @marca, @uf, @regiao, @armazem, @desc, @custo, @dias)
        END
      `);
  }

  // ==========================================
  // 9. Pedidos de Fábrica Iniciais
  // ==========================================
  console.log('[Seed] Inserindo Pedidos de Fábrica Iniciais...');
  for (const ord of INITIAL_FACTORY_ORDERS) {
    await pool.request()
      .input('id', ord.id)
      .input('numero', ord.orderNumber)
      .input('dealer', ord.dealershipId)
      .input('frete', ord.freightMode || 'CIF')
      .input('cond_pag', ord.paymentMethod || 'A Prazo (30/60/90)')
      .input('status', ord.status || 'aguardando_analise')
      .input('unidades', ord.totalUnits)
      .input('total', ord.totalAmount)
      .input('obs', ord.notes || '')
      .input('cred_aprov', ord.creditApproved ? 1 : 0)
      .input('com_aprov', ord.commercialApproved ? 1 : 0)
      .input('prot_int', ord.protheusIntegrated ? 1 : 0)
      .input('prot_num', ord.protheusOrderNumber || null)
      .query(`
        IF NOT EXISTS (SELECT 1 FROM dbo.PedidosFabrica WHERE id_pedido = @id)
        BEGIN
          INSERT INTO dbo.PedidosFabrica (
            id_pedido, numero_pedido, id_concessionaria, modalidade_frete, condicao_pagamento_geral,
            status_pedido, total_unidades, valor_total, observacoes, credito_aprovado, comercial_aprovado,
            integrado_protheus, numero_pedido_protheus
          ) VALUES (
            @id, @numero, @dealer, @frete, @cond_pag,
            @status, @unidades, @total, @obs, @cred_aprov, @com_aprov,
            @prot_int, @prot_num
          )
        END
      `);

    // Itens do Pedido
    if (ord.items && Array.isArray(ord.items)) {
      for (const item of ord.items) {
        await pool.request()
          .input('id_item', item.id)
          .input('id_pedido', ord.id)
          .input('id_mod', item.modelId)
          .input('nome_mod', item.modelName)
          .input('marca', item.brand)
          .input('cat', item.category || 'Motos')
          .input('cor', item.colorName)
          .input('hex', item.colorHex)
          .input('qtd', item.quantity)
          .input('custo_unit', item.unitFactoryCost)
          .input('preco_unit', item.unitMSRP)
          .input('total_item', item.totalItemCost)
          .input('cond_nome', item.paymentConditionName || '')
          .query(`
            IF NOT EXISTS (SELECT 1 FROM dbo.PedidoFabricaItens WHERE id_item = @id_item)
            BEGIN
              INSERT INTO dbo.PedidoFabricaItens (
                id_item, id_pedido, id_modelo, nome_modelo, marca, categoria,
                nome_cor, codigo_hex, quantidade, custo_unitario_fabrica, preco_publico_unitario,
                custo_total_item, nome_condicao_pagamento
              ) VALUES (
                @id_item, @id_pedido, @id_mod, @nome_mod, @marca, @cat,
                @cor, @hex, @qtd, @custo_unit, @preco_unit,
                @total_item, @cond_nome
              )
            END
          `);
      }
    }
  }

  // ==========================================
  // 10. Compromissos Mensais / Trimestrais
  // ==========================================
  console.log('[Seed] Inserindo Compromissos Trimestrais...');
  for (const cmt of INITIAL_MONTHLY_COMMITMENTS) {
    await pool.request()
      .input('id', cmt.id)
      .input('dealer', cmt.dealershipId)
      .input('marca', cmt.brand)
      .input('tri', '2º Trimestre')
      .input('ano', 2026)
      .input('m1', cmt.month1Label || 'Abril')
      .input('m2', cmt.month2Label || 'Maio')
      .input('m3', cmt.month3Label || 'Junho')
      .input('reg_com', cmt.regionalComercial || '')
      .input('reg_fin', cmt.regionalFinanceira || '')
      .input('avg_empl', cmt.avgMonthlyRegistration || 0)
      .input('status', cmt.status || 'aprovado_fabrica')
      .input('tot_m1', cmt.totalUnitsMonth1 || 0)
      .input('tot_m2', cmt.totalUnitsMonth2 || 0)
      .input('tot_m3', cmt.totalUnitsMonth3 || 0)
      .input('tot_val', cmt.totalEstimatedAmount || 0)
      .input('notas_fab', cmt.factoryNotes || '')
      .input('notas_dlr', cmt.dealerNotes || '')
      .query(`
        IF NOT EXISTS (SELECT 1 FROM dbo.CompromissosCompra WHERE id_compromisso = @id)
        BEGIN
          INSERT INTO dbo.CompromissosCompra (
            id_compromisso, id_concessionaria, marca, trimestre_referencia, periodo_ano,
            rotulo_mes1, rotulo_mes2, rotulo_mes3, regional_comercial, regional_financeira,
            media_mensal_emplacamentos, status, total_unidades_mes1, total_unidades_mes2,
            total_unidades_mes3, valor_total_estimado, notas_fabrica, notas_dealer
          ) VALUES (
            @id, @dealer, @marca, @tri, @ano,
            @m1, @m2, @m3, @reg_com, @reg_fin,
            @avg_empl, @status, @tot_m1, @tot_m2,
            @tot_m3, @tot_val, @notas_fab, @notas_dlr
          )
        END
      `);

    if (cmt.items && Array.isArray(cmt.items)) {
      for (const it of cmt.items) {
        await pool.request()
          .input('id_it', it.id)
          .input('id_cmt', cmt.id)
          .input('modelo', it.model)
          .input('marca', it.brand)
          .input('cat', it.category || 'Motos')
          .input('est_prop', it.currentStockOwn || 0)
          .input('est_bloq', it.currentStockBinBlocked || 0)
          .input('est_lib', it.currentStockBinLiberated || 0)
          .input('c_m1', it.month1Commitment || 0)
          .input('p_m1', it.month1Purchase || 0)
          .input('c_m2', it.month2Commitment || 0)
          .input('p_m2', it.month2Purchase || 0)
          .input('c_m3', it.month3Commitment || 0)
          .input('p_m3', it.month3Purchase || 0)
          .input('pps', it.suggestedMSRPUnit || 0)
          .input('custo', it.factoryCostUnit || 0)
          .input('notas', it.notes || '')
          .query(`
            IF NOT EXISTS (SELECT 1 FROM dbo.CompromissoCompraItens WHERE id_item = @id_it)
            BEGIN
              INSERT INTO dbo.CompromissoCompraItens (
                id_item, id_compromisso, nome_modelo, marca, categoria,
                estoque_proprio_atual, estoque_bin_bloqueado, estoque_bin_liberado,
                compromisso_mes1, compra_mes1, compromisso_mes2, compra_mes2,
                compromisso_mes3, compra_mes3, preco_publico_sugerido, custo_fabrica_unitario, notas
              ) VALUES (
                @id_it, @id_cmt, @modelo, @marca, @cat,
                @est_prop, @est_bloq, @est_lib,
                @c_m1, @p_m1, @c_m2, @p_m2,
                @c_m3, @p_m3, @pps, @custo, @notas
              )
            END
          `);
      }
    }
  }

  // ==========================================
  // Estoque de Veículos (Inventário concedido)
  // Mesmo conjunto de dados exibido na visão da concessionária
  // ==========================================
  console.log('[Seed] Inserindo Estoque de Veículos / Inventário...');
  for (const item of INITIAL_INVENTORY) {
    await pool.request()
      .input('id', item.id)
      .input('dealer', item.dealershipId || 'motosul')
      .input('modelo', String(item.model).substring(0, 100))
      .input('ano', Number(item.year))
      .input('vin', String(item.vin).substring(0, 30))
      .input('cor', String(item.color).substring(0, 60))
      .input('hex', String(item.colorHex || '#000000').substring(0, 10))
      .input('custo', Number(item.costPrice) || 0)
      .input('venda', Number(item.retailPrice) || 0)
      .input('status', item.status)
      .input('placa', item.plate || null)
      .input('cil', String(item.engineDisplacement || '').substring(0, 20) || null)
      .input('pot', String(item.power || '').substring(0, 50) || null)
      .input('data', String(item.arrivedDate || '01/01/2024').replace(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, '$3-$2-$1'))
      .input('notas', item.notes || null)
      .query(`
        IF NOT EXISTS (SELECT 1 FROM dbo.EstoqueVeiculos WHERE id_veiculo = @id)
        BEGIN
          INSERT INTO dbo.EstoqueVeiculos (
            id_veiculo, id_concessionaria, modelo, ano_fabricacao_modelo, chassi_vin,
            cor, codigo_hex, preco_custo, preco_venda_loja, status, placa, cilindrada,
            potencia, data_chegada, notas
          ) VALUES (
            @id, @dealer, @modelo, @ano, @vin,
            @cor, @hex, @custo, @venda, @status, @placa, @cil,
            @pot, @data, @notas
          )
        END
      `);
  }
  console.log(`[Seed] ${INITIAL_INVENTORY.length} veículo(s) de estoque inserido(s).`);

  // ==========================================
  // Garantia de credenciais padrão (idempotente)
  // Ambiente de teste: usuários semeados devem sempre autenticar com a senha padrão
  // ==========================================
  console.log('[Seed] Garantindo credenciais padrao dos usuarios semeados...');
  const usersDb = (await pool.request().query('SELECT id_usuario, email, senha_hash FROM dbo.Usuarios WHERE email IS NOT NULL')).recordset;
  let pwdFixed = 0;
  for (const u of usersDb) {
    const matchesDefault = await bcrypt.compare('Suzuki@2026', u.senha_hash || '');
    if (!matchesDefault) {
      await pool.request()
        .input('id', u.id_usuario)
        .input('hash', defaultPasswordHash)
        .query('UPDATE dbo.Usuarios SET senha_hash = @hash, tentativas_falhas = 0 WHERE id_usuario = @id');
      pwdFixed++;
    }
  }
  console.log(`[Seed] ${pwdFixed} senha(s) redefinida(s) para o padrao Suzuki@2026.`);

  console.log('[Seed] Carga inicial de dados finalizada com sucesso no SQL Server!');
  process.exit(0);
}

seedData().catch(err => {
  console.error('[Seed] Erro na população inicial:', err);
  process.exit(1);
});
