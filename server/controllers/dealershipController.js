import { getDbPool } from '../db.js';
import bcrypt from 'bcryptjs';

const TIERS_ALLOWED = ['Diamante', 'Ouro', 'Prata', 'Bronze'];
const STATUS_ALLOWED = ['ativa', 'homologacao', 'suspensa', 'bloqueada'];
const REGIONS_ALLOWED = ['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul'];
const WAREHOUSES_ALLOWED = ['empresa_13_armazem', 'manaus_le_16'];

// Converter dd/mm/yyyy -> yyyy-mm-dd (datas chegam do frontend em pt-BR)
const toIsoDate = (brDate) => {
  if (!brDate) return null;
  const m = String(brDate).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  return String(brDate).substring(0, 10);
};

// GET /api/dealerships
export const getDealerships = async (req, res) => {
  try {
    const pool = await getDbPool();
    const result = await pool.request().query(`
      SELECT 
        c.id_concessionaria AS id,
        c.codigo_dealer AS dealerCode,
        c.nome_fantasia AS name,
        c.nome_curto AS shortName,
        c.razao_social AS legalName,
        c.nome_fantasia AS tradeName,
        c.slogan AS tagline,
        c.cnpj,
        c.inscricao_estadual AS stateRegistration,
        c.inscricao_municipal AS municipalRegistration,
        c.cnae,
        c.regime_tributario AS taxRegime,
        c.tipo,
        c.status,
        c.classificacao_tier AS tier,
        c.numero_contrato AS dealerContractNumber,
        c.meta_mensal_faturamento AS monthlyTarget,
        c.limite_credito AS creditLimit,
        c.limite_credito_utilizado AS creditUsed,
        c.limite_floor_plan AS floorPlanLimit,
        c.rating_credito AS creditRating,
        c.saldo_fundo_reserva AS reserveFundBalance,
        c.cor_banner AS bannerColor,
        c.cor_destaque AS accentColor,
        c.telefone AS phone,
        c.email_contato AS contactEmail,
        c.gerente_responsavel AS manager,
        c.cidade AS city,
        c.uf AS state,
        c.regiao_brasil AS region,
        c.cep AS zipCode,
        c.logradouro AS street,
        c.numero AS number,
        c.complemento AS complement,
        c.bairro AS neighborhood,
        c.armazem_origem_padrao AS originWarehouse
      FROM dbo.Concessionarias c
      ORDER BY CASE WHEN c.tipo = 'montadora' THEN 0 ELSE 1 END, c.nome_curto
    `);

    // Busca usuários vinculados a cada concessionária
    const usersRes = await pool.request().query(`
      SELECT 
        u.id_usuario AS id,
        u.id_concessionaria,
        u.nome AS name,
        u.email,
        u.telefone AS phone,
        u.cpf,
        u.cargo AS role,
        p.codigo_perfil AS accessLevel,
        u.status,
        u.trocar_senha_proximo_login AS mustChangePasswordNextLogin
      FROM dbo.Usuarios u
      INNER JOIN dbo.PerfisAcesso p ON u.id_perfil = p.id_perfil
    `);

    const usersByDealer = {};
    for (const u of usersRes.recordset) {
      if (u.id_concessionaria) {
        if (!usersByDealer[u.id_concessionaria]) usersByDealer[u.id_concessionaria] = [];
        usersByDealer[u.id_concessionaria].push({
          ...u,
          passwordMasked: '••••••••••••'
        });
      }
    }

    const dealershipsWithUsers = result.recordset.map(d => ({
      ...d,
      users: usersByDealer[d.id] || []
    }));

    res.json(dealershipsWithUsers);
  } catch (err) {
    console.error('[Dealerships API] Erro ao listar:', err);
    res.status(500).json({ error: 'Erro ao carregar concessionárias.' });
  }
};

// PUT /api/dealerships/:id
export const updateDealership = async (req, res) => {
  const { id } = req.params;
  const d = req.body;

  try {
    const pool = await getDbPool();
    await pool.request()
      .input('id', id)
      .input('meta', d.monthlyTarget || 0)
      .input('credito', d.creditLimit || 0)
      .input('tier', d.tier || 'Prata')
      .input('status', d.status || 'ativa')
      .input('rating', d.creditRating || 'A')
      .input('telefone', d.phone || '')
      .input('email', d.contactEmail || '')
      .input('gerente', d.manager || '')
      .input('armazem', d.originWarehouse || 'empresa_13_armazem')
      .query(`
        UPDATE dbo.Concessionarias
        SET meta_mensal_faturamento = @meta,
            limite_credito = @credito,
            classificacao_tier = @tier,
            status = @status,
            rating_credito = @rating,
            telefone = @telefone,
            email_contato = @email,
            gerente_responsavel = @gerente,
            armazem_origem_padrao = @armazem,
            atualizado_em = SYSUTCDATETIME()
        WHERE id_concessionaria = @id
      `);

    res.json({ success: true, message: 'Concessionária atualizada com sucesso!' });
  } catch (err) {
    console.error('[Dealerships API] Erro ao atualizar:', err);
    res.status(500).json({ error: 'Erro ao salvar alterações da concessionária.' });
  }
};

// INSERT helper (mantém o handler legível)
const insertDealership = async (pool, d, id, tier, status) => {
  await pool.request()
    .input('id', id)
    .input('codigo', String(d.dealerCode).trim())
    .input('nome', String(d.name).trim().substring(0, 150))
    .input('curto', String(d.shortName || d.name).trim().substring(0, 60))
    .input('razao', String(d.legalName || d.name).trim().substring(0, 200))
    .input('slogan', d.tagline || null)
    .input('cnpj', String(d.cnpj).trim())
    .input('ie', d.stateRegistration || null)
    .input('im', d.municipalRegistration || null)
    .input('cnae', d.cnae || null)
    .input('regime', d.taxRegime || null)
    .input('tipo', d.type === 'montadora' ? 'montadora' : 'concessionaria')
    .input('status', status)
    .input('tier', tier)
    .input('contrato', d.dealerContractNumber || null)
    .input('meta', Number(d.monthlyTarget) || 0)
    .input('credito', Number(d.creditLimit) || 0)
    .input('credito_usado', Number(d.creditUsed) || 0)
    .input('floorplan', Number(d.floorPlanLimit) || 0)
    .input('rating', d.creditRating || 'A')
    .input('banner', d.bannerColor || 'from-blue-950 to-neutral-900')
    .input('destaque', d.accentColor || '#2563eb')
    .input('telefone', String(d.phone).substring(0, 30))
    .input('email', d.contactEmail || null)
    .input('gerente', d.manager || null)
    .input('email_fin', d.financialContactEmail || null)
    .input('tel_fin', d.financialContactPhone || null)
    .input('cep', d.zipCode || null)
    .input('logradouro', d.street || null)
    .input('numero', d.number || null)
    .input('complemento', d.complement || null)
    .input('bairro', d.neighborhood || null)
    .input('cidade', String(d.city).trim().substring(0, 100))
    .input('uf', String(d.state).trim().toUpperCase())
    .input('regiao', d.region)
    .input('showroom', Number(d.showroomAreaM2) || null)
    .input('oficina', Number(d.workshopAreaM2) || null)
    .input('armazem', d.originWarehouse || 'empresa_13_armazem')
    .input('notas', d.creditNotes || null)
    .query(`
      INSERT INTO dbo.Concessionarias (
        id_concessionaria, codigo_dealer, nome_fantasia, nome_curto, razao_social, slogan,
        cnpj, inscricao_estadual, inscricao_municipal, cnae, regime_tributario,
        tipo, status, classificacao_tier, numero_contrato,
        meta_mensal_faturamento, limite_credito, limite_credito_utilizado, limite_floor_plan,
        rating_credito, cor_banner, cor_destaque,
        telefone, email_contato, gerente_responsavel, email_financeiro, telefone_financeiro,
        cep, logradouro, numero, complemento, bairro, cidade, uf, regiao_brasil,
        area_showroom_m2, area_oficina_m2, armazem_origem_padrao, notas_credito
      ) VALUES (
        @id, @codigo, @nome, @curto, @razao, @slogan,
        @cnpj, @ie, @im, @cnae, @regime,
        @tipo, @status, @tier, @contrato,
        @meta, @credito, @credito_usado, @floorplan,
        @rating, @banner, @destaque,
        @telefone, @email, @gerente, @email_fin, @tel_fin,
        @cep, @logradouro, @numero, @complemento, @bairro, @cidade, @uf, @regiao,
        @showroom, @oficina, @armazem, @notas
      )
    `);
};

export const createDealership = async (req, res) => {
  const d = req.body;

  // Colunas NOT NULL da tabela Concessionarias
  if (!d.name || !String(d.name).trim()) return res.status(400).json({ error: 'Nome da concessionária é obrigatório.' });
  if (!d.dealerCode || !String(d.dealerCode).trim()) return res.status(400).json({ error: 'Código dealer é obrigatório.' });
  if (!d.cnpj || !String(d.cnpj).trim()) return res.status(400).json({ error: 'CNPJ é obrigatório.' });
  if (!d.phone) return res.status(400).json({ error: 'Telefone é obrigatório.' });
  if (!d.city) return res.status(400).json({ error: 'Cidade é obrigatória.' });
  if (!d.state || String(d.state).trim().length !== 2) return res.status(400).json({ error: 'UF inválida (2 letras).' });

  const REGION_ALLOWED = ['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul'];
  if (!d.region || !REGION_ALLOWED.includes(d.region)) return res.status(400).json({ error: 'Região inválida.' });

  const TIERS = ['Diamante', 'Ouro', 'Prata', 'Bronze'];
  const tier = d.tier || 'Prata';
  if (!TIERS.includes(tier)) return res.status(400).json({ error: 'Tier inválido.' });

  const STATUSES = ['ativa', 'homologacao', 'suspensa', 'bloqueada'];
  const status = d.status || 'ativa';
  if (!STATUSES.includes(status)) return res.status(400).json({ error: 'Status inválido.' });

  const id = d.id || `dealer-${Date.now()}`;

  try {
    const pool = await getDbPool();

    // Duplicidades: id, codigo_dealer e cnpj são UNIQUE
    const dup = await pool.request()
      .input('id', id)
      .input('codigo', String(d.dealerCode).trim())
      .input('cnpj', String(d.cnpj).trim())
      .query(`
        SELECT
          (SELECT COUNT(*) FROM dbo.Concessionarias WHERE id_concessionaria = @id) AS dup_id,
          (SELECT COUNT(*) FROM dbo.Concessionarias WHERE codigo_dealer = @codigo) AS dup_codigo,
          (SELECT COUNT(*) FROM dbo.Concessionarias WHERE cnpj = @cnpj) AS dup_cnpj
      `);
    const { dup_id, dup_codigo, dup_cnpj } = dup.recordset[0];
    if (dup_id > 0) return res.status(409).json({ error: 'Já existe uma concessionária com este identificador.' });
    if (dup_codigo > 0) return res.status(409).json({ error: 'Já existe uma concessionária com este código dealer.' });
    if (dup_cnpj > 0) return res.status(409).json({ error: 'Já existe uma concessionária com este CNPJ.' });

    await insertDealership(pool, d, id, tier, status);
    res.status(201).json({ success: true, message: 'Concessionária cadastrada com sucesso!', id });
  } catch (err) {
    console.error('[Dealerships API] Erro ao criar:', err);
    if (/UNIQUE|duplicate|CHECK/i.test(err.message)) {
      return res.status(409).json({ error: 'Registro duplicado ou dados fora das regras de negócio (verifique CNPJ/código/status/tier).' });
    }
    res.status(500).json({ error: 'Erro ao cadastrar concessionária.' });
  }
};

// DELETE /api/dealerships/:id
export const deleteDealership = async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await getDbPool();

    const dealerRes = await pool.request()
      .input('id', id)
      .query('SELECT tipo FROM dbo.Concessionarias WHERE id_concessionaria = @id');
    if (dealerRes.recordset.length === 0) {
      return res.status(404).json({ error: 'Concessionária não localizada.' });
    }
    if (dealerRes.recordset[0].tipo === 'montadora') {
      return res.status(400).json({ error: 'A montadora não pode ser excluída.' });
    }

    // Dependências com FK sem CASCADE impedem a exclusão física.
    // Checagem dinâmica via metadados: descobre as tabelas que referenciam
    // Concessionarias e conta registros apontando para o id excluído.
    const fkRes = await pool.request().query(`
      SELECT DISTINCT
        OBJECT_NAME(fk.parent_object_id) AS tabela,
        COL_NAME(fkc.parent_object_id, fkc.parent_column_id) AS coluna
      FROM sys.foreign_keys fk
      JOIN sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id
      WHERE OBJECT_NAME(fk.referenced_object_id) = 'Concessionarias'
    `);

    const fkTables = fkRes.recordset.filter(fk => /^[A-Za-z_]+$/.test(fk.tabela) && /^[A-Za-z_]+$/.test(fk.coluna));
    let depsQuery = '';
    if (fkTables.length > 0) {
      depsQuery = fkTables
        .map(fk => `SELECT '${fk.tabela}' AS tabela, COUNT(*) AS n FROM dbo.[${fk.tabela}] WHERE [${fk.coluna}] = @id`)
        .join(' UNION ALL ');
    }
    const depsRes = depsQuery ? await pool.request().input('id', id).query(depsQuery) : { recordset: [] };
    const blocked = depsRes.recordset.filter(d => d.n > 0);
    if (blocked.length > 0) {
      const parts = blocked.map(d => `${d.n} registro(s) em ${d.tabela}`).join(', ');
      return res.status(409).json({
        error: `Exclusão bloqueada: existem registros vinculados (${parts}). Bloqueie ou suspenda a concessionária em vez de excluí-la.`
      });
    }

    const result = await pool.request()
      .input('id', id)
      .query('DELETE FROM dbo.Concessionarias WHERE id_concessionaria = @id');

    if (result.rowsAffected[0] === 0) return res.status(404).json({ error: 'Concessionária não localizada.' });
    res.json({ success: true, message: 'Concessionária excluída com sucesso!' });
  } catch (err) {
    console.error('[Dealerships API] Erro ao excluir:', err);
    if (/REFERENCE|FOREIGN KEY|conflicted/i.test(err.message)) {
      return res.status(409).json({ error: 'Existem registros vinculados a esta concessionária.' });
    }
    res.status(500).json({ error: 'Erro ao excluir concessionária.' });
  }
};

export default { getDealerships, updateDealership, createDealership, deleteDealership };
