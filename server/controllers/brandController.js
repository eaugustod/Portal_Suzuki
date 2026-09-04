import { getDbPool } from '../db.js';

const rowToBrand = (r) => ({
  id: r.id,
  nome: r.nome,
  codigo: r.codigo,
  razaoSocial: r.razaoSocial || r.nome,
  cnpj: r.cnpj || '',
  corPrimaria: r.corPrimaria || '#00428c',
  corSecundaria: r.corSecundaria || '#ffffff',
  logoUrl: r.logoUrl || '',
  siteOficial: r.siteOficial || '',
  descricao: r.descricao || '',
  paisOrigem: r.paisOrigem || 'Brasil',
  ativo: r.ativo === 1 || r.ativo === true,
  ordemExibicao: Number(r.ordemExibicao) || 0,
  criadoEm: r.criadoEm,
  atualizadoEm: r.atualizadoEm,
  modelsCount: Number(r.modelsCount) || 0,
  dealersCount: Number(r.dealersCount) || 0
});

// GET /api/brands
export const getBrands = async (req, res) => {
  try {
    const pool = await getDbPool();
    const result = await pool.request().query(`
      SELECT 
        m.id_marca AS id,
        m.nome,
        m.codigo,
        m.razao_social AS razaoSocial,
        m.cnpj,
        m.cor_primaria AS corPrimaria,
        m.cor_secundaria AS corSecundaria,
        m.logo_url AS logoUrl,
        m.site_oficial AS siteOficial,
        m.descricao,
        m.pais_origem AS paisOrigem,
        m.ativo,
        m.ordem_exibicao AS ordemExibicao,
        m.criado_em AS criadoEm,
        m.atualizado_em AS atualizadoEm,
        (SELECT COUNT(*) FROM dbo.ModelosMotos mo WHERE mo.marca = m.nome) AS modelsCount,
        (SELECT COUNT(*) FROM dbo.ConcessionariaMarcas cm WHERE cm.marca = m.nome) AS dealersCount
      FROM dbo.Marcas m
      ORDER BY m.ordem_exibicao ASC, m.nome ASC
    `);

    res.json(result.recordset.map(rowToBrand));
  } catch (err) {
    console.error('[Brands API] Erro ao listar marcas:', err);
    res.status(500).json({ error: 'Erro ao carregar lista de marcas.' });
  }
};

// GET /api/brands/:id
export const getBrandById = async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await getDbPool();
    const result = await pool.request()
      .input('id', id)
      .query(`
        SELECT 
          m.id_marca AS id,
          m.nome,
          m.codigo,
          m.razao_social AS razaoSocial,
          m.cnpj,
          m.cor_primaria AS corPrimaria,
          m.cor_secundaria AS corSecundaria,
          m.logo_url AS logoUrl,
          m.site_oficial AS siteOficial,
          m.descricao,
          m.pais_origem AS paisOrigem,
          m.ativo,
          m.ordem_exibicao AS ordemExibicao,
          m.criado_em AS criadoEm,
          m.atualizado_em AS atualizadoEm,
          (SELECT COUNT(*) FROM dbo.ModelosMotos mo WHERE mo.marca = m.nome) AS modelsCount,
          (SELECT COUNT(*) FROM dbo.ConcessionariaMarcas cm WHERE cm.marca = m.nome) AS dealersCount
        FROM dbo.Marcas m
        WHERE m.id_marca = @id OR m.nome = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Marca não localizada.' });
    }

    res.json(rowToBrand(result.recordset[0]));
  } catch (err) {
    console.error('[Brands API] Erro ao buscar marca:', err);
    res.status(500).json({ error: 'Erro ao carregar detalhes da marca.' });
  }
};

// POST /api/brands
export const createBrand = async (req, res) => {
  const {
    nome, codigo, razaoSocial, cnpj, corPrimaria, corSecundaria,
    logoUrl, siteOficial, descricao, paisOrigem, ativo, ordemExibicao
  } = req.body;

  if (!nome || !String(nome).trim()) return res.status(400).json({ error: 'Nome da marca é obrigatório.' });
  if (!codigo || !String(codigo).trim()) return res.status(400).json({ error: 'Código/Sigla da marca é obrigatório.' });

  const cleanName = String(nome).trim();
  const cleanCode = String(codigo).trim().toUpperCase();
  const id = req.body.id || `brand-${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

  try {
    const pool = await getDbPool();
    const dupCheck = await pool.request()
      .input('id', id)
      .input('nome', cleanName)
      .input('codigo', cleanCode)
      .query(`
        SELECT 
          (SELECT COUNT(*) FROM dbo.Marcas WHERE id_marca = @id) AS dup_id,
          (SELECT COUNT(*) FROM dbo.Marcas WHERE nome = @nome) AS dup_nome,
          (SELECT COUNT(*) FROM dbo.Marcas WHERE codigo = @codigo) AS dup_codigo
      `);

    const { dup_id, dup_nome, dup_codigo } = dupCheck.recordset[0];
    if (dup_id > 0) return res.status(409).json({ error: 'Já existe uma marca com este identificador.' });
    if (dup_nome > 0) return res.status(409).json({ error: 'Já existe uma marca cadastrada com este nome.' });
    if (dup_codigo > 0) return res.status(409).json({ error: 'Já existe uma marca cadastrada com esta sigla/código.' });

    await pool.request()
      .input('id', id)
      .input('nome', cleanName)
      .input('codigo', cleanCode)
      .input('razao', razaoSocial ? String(razaoSocial).trim() : cleanName)
      .input('cnpj', cnpj ? String(cnpj).trim() : null)
      .input('cor_pri', corPrimaria || '#00428c')
      .input('cor_sec', corSecundaria || '#ffffff')
      .input('logo', logoUrl ? String(logoUrl).trim() : null)
      .input('site', siteOficial ? String(siteOficial).trim() : null)
      .input('desc', descricao ? String(descricao).trim() : null)
      .input('pais', paisOrigem ? String(paisOrigem).trim() : 'Brasil')
      .input('ativo', ativo !== false ? 1 : 0)
      .input('ordem', Number(ordemExibicao) || 0)
      .query(`
        INSERT INTO dbo.Marcas (
          id_marca, nome, codigo, razao_social, cnpj,
          cor_primaria, cor_secundaria, logo_url, site_oficial,
          descricao, pais_origem, ativo, ordem_exibicao
        ) VALUES (
          @id, @nome, @codigo, @razao, @cnpj,
          @cor_pri, @cor_sec, @logo, @site,
          @desc, @pais, @ativo, @ordem
        )
      `);

    res.status(201).json({ success: true, message: `Marca "${cleanName}" cadastrada com sucesso!`, id });
  } catch (err) {
    console.error('[Brands API] Erro ao criar marca:', err);
    if (/UNIQUE|duplicate|PRIMARY KEY/i.test(err.message)) {
      return res.status(409).json({ error: 'Conflito de unicidade: nome ou código de marca já em uso.' });
    }
    res.status(500).json({ error: 'Erro ao cadastrar marca no banco de dados.' });
  }
};

// PUT /api/brands/:id
export const updateBrand = async (req, res) => {
  const { id } = req.params;
  const {
    nome, codigo, razaoSocial, cnpj, corPrimaria, corSecundaria,
    logoUrl, siteOficial, descricao, paisOrigem, ativo, ordemExibicao
  } = req.body;

  if (!nome || !String(nome).trim()) return res.status(400).json({ error: 'Nome da marca é obrigatório.' });
  if (!codigo || !String(codigo).trim()) return res.status(400).json({ error: 'Código/Sigla da marca é obrigatório.' });

  const cleanName = String(nome).trim();
  const cleanCode = String(codigo).trim().toUpperCase();

  try {
    const pool = await getDbPool();
    const current = await pool.request()
      .input('id', id)
      .query('SELECT nome, codigo FROM dbo.Marcas WHERE id_marca = @id');

    if (current.recordset.length === 0) {
      return res.status(404).json({ error: 'Marca não localizada para atualização.' });
    }

    const oldName = current.recordset[0].nome;
    const dupCheck = await pool.request()
      .input('id', id)
      .input('nome', cleanName)
      .input('codigo', cleanCode)
      .query(`
        SELECT 
          (SELECT COUNT(*) FROM dbo.Marcas WHERE nome = @nome AND id_marca <> @id) AS dup_nome,
          (SELECT COUNT(*) FROM dbo.Marcas WHERE codigo = @codigo AND id_marca <> @id) AS dup_codigo
      `);

    const { dup_nome, dup_codigo } = dupCheck.recordset[0];
    if (dup_nome > 0) return res.status(409).json({ error: 'Já existe outra marca cadastrada com este nome.' });
    if (dup_codigo > 0) return res.status(409).json({ error: 'Já existe outra marca cadastrada com esta sigla/código.' });

    await pool.request()
      .input('id', id)
      .input('nome', cleanName)
      .input('codigo', cleanCode)
      .input('razao', razaoSocial ? String(razaoSocial).trim() : cleanName)
      .input('cnpj', cnpj ? String(cnpj).trim() : null)
      .input('cor_pri', corPrimaria || '#00428c')
      .input('cor_sec', corSecundaria || '#ffffff')
      .input('logo', logoUrl !== undefined ? String(logoUrl).trim() : null)
      .input('site', siteOficial !== undefined ? String(siteOficial).trim() : null)
      .input('desc', descricao !== undefined ? String(descricao).trim() : null)
      .input('pais', paisOrigem ? String(paisOrigem).trim() : 'Brasil')
      .input('ativo', ativo !== false ? 1 : 0)
      .input('ordem', Number(ordemExibicao) || 0)
      .query(`
        UPDATE dbo.Marcas
        SET nome = @nome,
            codigo = @codigo,
            razao_social = @razao,
            cnpj = @cnpj,
            cor_primaria = @cor_pri,
            cor_secundaria = @cor_sec,
            logo_url = @logo,
            site_oficial = @site,
            descricao = @desc,
            pais_origem = @pais,
            ativo = @ativo,
            ordem_exibicao = @ordem,
            atualizado_em = SYSUTCDATETIME()
        WHERE id_marca = @id
      `);

    if (oldName !== cleanName) {
      await pool.request()
        .input('oldName', oldName)
        .input('newName', cleanName)
        .query(`
          UPDATE dbo.ConcessionariaMarcas SET marca = @newName WHERE marca = @oldName;
          UPDATE dbo.ModelosMotos SET marca = @newName WHERE marca = @oldName;
          UPDATE dbo.TarifasFrete SET marca = @newName WHERE marca = @oldName;
          UPDATE dbo.CondicoesPagamento SET marca = @newName WHERE marca = @oldName;
          UPDATE dbo.FundoReservaConfigMarcas SET marca = @newName WHERE marca = @oldName;
          UPDATE dbo.FundoReservaLancamentos SET marca = @newName WHERE marca = @oldName;
          UPDATE dbo.CompromissosCompra SET marca = @newName WHERE marca = @oldName;
          UPDATE dbo.CompromissoCompraItens SET marca = @newName WHERE marca = @oldName;
          UPDATE dbo.PedidoFabricaItens SET marca = @newName WHERE marca = @oldName;
          UPDATE dbo.EpcModelos SET marca = @newName WHERE marca = @oldName;
        `);
    }

    res.json({ success: true, message: `Marca "${cleanName}" atualizada com sucesso!` });
  } catch (err) {
    console.error('[Brands API] Erro ao atualizar marca:', err);
    res.status(500).json({ error: 'Erro ao atualizar dados da marca no banco de dados.' });
  }
};

// DELETE /api/brands/:id
export const deleteBrand = async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await getDbPool();
    const brandRes = await pool.request()
      .input('id', id)
      .query('SELECT nome FROM dbo.Marcas WHERE id_marca = @id');

    if (brandRes.recordset.length === 0) {
      return res.status(404).json({ error: 'Marca não localizada para exclusão.' });
    }

    const brandName = brandRes.recordset[0].nome;
    const usageCheck = await pool.request()
      .input('nome', brandName)
      .query(`
        SELECT 
          (SELECT COUNT(*) FROM dbo.ModelosMotos WHERE marca = @nome) AS models_count,
          (SELECT COUNT(*) FROM dbo.ConcessionariaMarcas WHERE marca = @nome) AS dealers_count,
          (SELECT COUNT(*) FROM dbo.PedidoFabricaItens WHERE marca = @nome) AS order_items_count
      `);

    const { models_count, dealers_count, order_items_count } = usageCheck.recordset[0];
    const forceDelete = req.query.force === 'true';

    if ((models_count > 0 || order_items_count > 0) && !forceDelete) {
      await pool.request()
        .input('id', id)
        .query('UPDATE dbo.Marcas SET ativo = 0, atualizado_em = SYSUTCDATETIME() WHERE id_marca = @id');
      
      return res.json({
        success: true,
        softDeleted: true,
        message: `A marca "${brandName}" possui ${models_count} modelo(s) e/ou pedidos associados. Ela foi desativada no catálogo para manter o histórico íntegro.`
      });
    }

    await pool.request()
      .input('id', id)
      .input('nome', brandName)
      .query(`
        DELETE FROM dbo.ConcessionariaMarcas WHERE marca = @nome;
        DELETE FROM dbo.Marcas WHERE id_marca = @id;
      `);

    res.json({ success: true, message: `Marca "${brandName}" excluída com sucesso do sistema!` });
  } catch (err) {
    console.error('[Brands API] Erro ao excluir marca:', err);
    res.status(500).json({ error: 'Erro ao excluir marca do banco de dados.' });
  }
};

export default {
  getBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand
};
