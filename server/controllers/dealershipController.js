import { getDbPool } from '../db.js';

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

export default { getDealerships, updateDealership };
