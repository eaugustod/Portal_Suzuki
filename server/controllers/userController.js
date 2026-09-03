import bcrypt from 'bcryptjs';
import { getDbPool } from '../db.js';

// GET /api/users
export const getUsers = async (req, res) => {
  const isMontadora = req.user?.scopeType === 'montadora';
  const userDealerId = req.user?.dealershipId;
  const targetDealer = req.query.dealershipId || (!isMontadora ? userDealerId : null);

  try {
    const pool = await getDbPool();
    let query = `
      SELECT 
        u.id_usuario AS id,
        u.id_concessionaria AS dealershipId,
        c.nome_fantasia AS dealershipName,
        c.codigo_dealer AS dealerCode,
        u.id_departamento AS departmentId,
        d.nome AS departmentName,
        d.sigla AS departmentCode,
        u.id_perfil AS profileId,
        p.codigo_perfil AS profileCode,
        p.nome AS profileName,
        p.tipo_escopo AS scopeType,
        u.nome AS name,
        u.email,
        u.cpf,
        u.telefone AS phone,
        u.cargo AS role,
        u.status,
        u.senha_temporaria AS isTemporaryPassword,
        u.trocar_senha_proximo_login AS mustChangePassword,
        u.tentativas_falhas AS failedAttempts,
        CONVERT(VARCHAR(19), u.ultimo_login, 120) AS lastLogin,
        CONVERT(VARCHAR(19), u.criado_em, 120) AS createdAt
      FROM dbo.Usuarios u
      LEFT JOIN dbo.Concessionarias c ON u.id_concessionaria = c.id_concessionaria
      LEFT JOIN dbo.Departamentos d ON u.id_departamento = d.id_departamento
      LEFT JOIN dbo.PerfisAcesso p ON u.id_perfil = p.id_perfil
    `;

    let request = pool.request();
    if (targetDealer && targetDealer !== 'jtoledo') {
      query += ` WHERE u.id_concessionaria = @targetDealer`;
      request = request.input('targetDealer', targetDealer);
    }

    query += ` ORDER BY u.nome ASC`;

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error('[Users API] Erro ao listar usuários:', err);
    res.status(500).json({ error: 'Erro ao carregar usuários do sistema.' });
  }
};

// GET /api/users/metadata (Departamentos, Perfis e Concessionárias para selects)
export const getMetadata = async (req, res) => {
  try {
    const pool = await getDbPool();

    const deptsRes = await pool.request().query(`
      SELECT id_departamento AS id, nome AS name, sigla AS code, descricao AS description
      FROM dbo.Departamentos
      WHERE ativo = 1
      ORDER BY nome
    `);

    const profilesRes = await pool.request().query(`
      SELECT id_perfil AS id, codigo_perfil AS code, nome AS name, tipo_escopo AS scopeType, descricao AS description
      FROM dbo.PerfisAcesso
      WHERE ativo = 1
      ORDER BY nome
    `);

    const dealersRes = await pool.request().query(`
      SELECT id_concessionaria AS id, codigo_dealer AS dealerCode, nome_fantasia AS name, cidade AS city, uf AS state
      FROM dbo.Concessionarias
      WHERE status = 'ativa'
      ORDER BY CASE WHEN tipo = 'montadora' THEN 0 ELSE 1 END, nome_fantasia
    `);

    res.json({
      departments: deptsRes.recordset,
      profiles: profilesRes.recordset,
      dealerships: dealersRes.recordset
    });
  } catch (err) {
    console.error('[Users API] Erro ao carregar metadados:', err);
    res.status(500).json({ error: 'Erro ao carregar metadados.' });
  }
};

// POST /api/users (Criar Novo Usuário)
export const createUser = async (req, res) => {
  const {
    dealershipId,
    departmentId,
    profileId,
    name,
    email,
    password,
    cpf,
    phone,
    role,
    status = 'ativo',
    mustChangePassword = true
  } = req.body;

  if (!name || !email || !departmentId || !profileId || !role) {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes (Nome, E-mail, Departamento, Perfil, Cargo).' });
  }

  const initialPassword = password || 'Suzuki@2026';

  try {
    const pool = await getDbPool();

    // Verifica se e-mail já existe
    const existsRes = await pool.request()
      .input('email', email.trim().toLowerCase())
      .query('SELECT id_usuario FROM dbo.Usuarios WHERE email = @email');

    if (existsRes.recordset.length > 0) {
      return res.status(400).json({ error: 'Já existe um usuário cadastrado com este e-mail.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(initialPassword, salt);
    const userId = `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    await pool.request()
      .input('id', userId)
      .input('dealer', dealershipId || null)
      .input('dept', departmentId)
      .input('perfil', profileId)
      .input('nome', name.trim())
      .input('email', email.trim().toLowerCase())
      .input('senha', hash)
      .input('cpf', cpf || null)
      .input('tel', phone || null)
      .input('cargo', role.trim())
      .input('status', status)
      .input('temp', 1)
      .input('trocar', mustChangePassword ? 1 : 0)
      .query(`
        INSERT INTO dbo.Usuarios (
          id_usuario, id_concessionaria, id_departamento, id_perfil,
          nome, email, senha_hash, cpf, telefone, cargo,
          status, senha_temporaria, trocar_senha_proximo_login
        ) VALUES (
          @id, @dealer, @dept, @perfil,
          @nome, @email, @senha, @cpf, @tel, @cargo,
          @status, @temp, @trocar
        )
      `);

    res.status(201).json({
      success: true,
      message: 'Usuário cadastrado com sucesso!',
      userId,
      temporaryPassword: initialPassword
    });
  } catch (err) {
    console.error('[Users API] Erro ao criar usuário:', err);
    res.status(500).json({ error: err.message || 'Erro ao criar usuário.' });
  }
};

// PUT /api/users/:id (Atualizar Usuário)
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const {
    dealershipId,
    departmentId,
    profileId,
    name,
    email,
    cpf,
    phone,
    role,
    status
  } = req.body;

  try {
    const pool = await getDbPool();

    await pool.request()
      .input('id', id)
      .input('dealer', dealershipId || null)
      .input('dept', departmentId)
      .input('perfil', profileId)
      .input('nome', name.trim())
      .input('email', email.trim().toLowerCase())
      .input('cpf', cpf || null)
      .input('tel', phone || null)
      .input('cargo', role.trim())
      .input('status', status)
      .query(`
        UPDATE dbo.Usuarios
        SET id_concessionaria = @dealer,
            id_departamento = @dept,
            id_perfil = @perfil,
            nome = @nome,
            email = @email,
            cpf = @cpf,
            telefone = @tel,
            cargo = @cargo,
            status = @status,
            atualizado_em = SYSUTCDATETIME()
        WHERE id_usuario = @id
      `);

    res.json({ success: true, message: 'Usuário atualizado com sucesso!' });
  } catch (err) {
    console.error('[Users API] Erro ao atualizar usuário:', err);
    res.status(500).json({ error: 'Erro ao atualizar dados do usuário.' });
  }
};

// POST /api/users/:id/reset-password (Reset Administrativo de Senha)
export const adminResetPassword = async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await getDbPool();
    const tempPassword = `SZK@${Math.floor(1000 + Math.random() * 9000)}`;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(tempPassword, salt);

    await pool.request()
      .input('id', id)
      .input('hash', hash)
      .query(`
        UPDATE dbo.Usuarios
        SET senha_hash = @hash,
            senha_temporaria = 1,
            trocar_senha_proximo_login = 1,
            tentativas_falhas = 0,
            status = 'ativo',
            atualizado_em = SYSUTCDATETIME()
        WHERE id_usuario = @id
      `);

    res.json({
      success: true,
      message: 'Senha resetada pelo administrador com sucesso!',
      temporaryPassword: tempPassword
    });
  } catch (err) {
    console.error('[Users API] Erro ao resetar senha:', err);
    res.status(500).json({ error: 'Erro ao resetar senha.' });
  }
};

// PATCH /api/users/:id/toggle-status (Ativar / Bloquear / Desativar)
export const toggleStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['ativo', 'inativo', 'bloqueado'].includes(status)) {
    return res.status(400).json({ error: 'Status inválido.' });
  }

  try {
    const pool = await getDbPool();
    await pool.request()
      .input('id', id)
      .input('status', status)
      .query(`
        UPDATE dbo.Usuarios
        SET status = @status,
            tentativas_falhas = CASE WHEN @status = 'ativo' THEN 0 ELSE tentativas_falhas END,
            atualizado_em = SYSUTCDATETIME()
        WHERE id_usuario = @id
      `);

    res.json({ success: true, message: `Status do usuário alterado para ${status}.` });
  } catch (err) {
    console.error('[Users API] Erro ao alterar status:', err);
    res.status(500).json({ error: 'Erro ao atualizar status.' });
  }
};

export default {
  getUsers,
  getMetadata,
  createUser,
  updateUser,
  adminResetPassword,
  toggleStatus
};
