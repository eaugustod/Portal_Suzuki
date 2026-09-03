import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { getDbPool } from '../db.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'SuzukiPortal_SecretKey_2026_Enterprise_SecureToken';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';

// POST /api/auth/login
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
  }

  try {
    const pool = await getDbPool();
    const result = await pool.request()
      .input('Email', email.trim().toLowerCase())
      .execute('dbo.sp_AutenticarUsuario');

    if (result.recordset.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas ou usuário não cadastrado.' });
    }

    const user = result.recordset[0];

    // Verifica status do usuário
    if (user.status === 'bloqueado') {
      return res.status(403).json({ error: 'Usuário temporariamente bloqueado por segurança. Contate o administrador.' });
    }

    if (user.status === 'inativo') {
      return res.status(403).json({ error: 'Conta inativa no sistema. Contate a gestão da rede.' });
    }

    // Compara senha com o hash bcrypt
    const passwordMatch = await bcrypt.compare(password, user.senha_hash);

    if (!passwordMatch) {
      // Incrementa tentativas falhas
      await pool.request()
        .input('id', user.id_usuario)
        .query('UPDATE dbo.Usuarios SET tentativas_falhas = tentativas_falhas + 1 WHERE id_usuario = @id');

      return res.status(401).json({ error: 'Senha incorreta. Verifique os dados informados.' });
    }

    // Zera tentativas falhas e atualiza último login
    await pool.request()
      .input('id', user.id_usuario)
      .query('UPDATE dbo.Usuarios SET tentativas_falhas = 0, ultimo_login = SYSUTCDATETIME() WHERE id_usuario = @id');

    // Monta o payload do JWT
    const tokenPayload = {
      id: user.id_usuario,
      name: user.nome,
      email: user.email,
      role: user.cargo,
      profileCode: user.codigo_perfil,
      department: user.nome_departamento,
      scopeType: user.tipo_escopo, // 'montadora' | 'concessionaria'
      dealershipId: user.id_concessionaria, // null se for Montadora
      dealershipName: user.nome_concessionaria,
      dealerCode: user.codigo_dealer,
      state: user.concessionaria_uf,
      warehouse: user.armazem_origem_padrao,
      mustChangePassword: user.trocar_senha_proximo_login === true || user.trocar_senha_proximo_login === 1
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.json({
      success: true,
      token,
      user: tokenPayload
    });
  } catch (err) {
    console.error('[Auth API] Erro no login:', err);
    res.status(500).json({ error: 'Erro interno ao autenticar usuário.' });
  }
};

// POST /api/auth/change-password
export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: 'Usuário não autenticado.' });
  }

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'A nova senha deve possuir no mínimo 6 caracteres.' });
  }

  try {
    const pool = await getDbPool();
    const userRes = await pool.request()
      .input('id', userId)
      .query('SELECT senha_hash FROM dbo.Usuarios WHERE id_usuario = @id');

    if (userRes.recordset.length === 0) {
      return res.status(404).json({ error: 'Usuário não localizado.' });
    }

    const currentHash = userRes.recordset[0].senha_hash;
    const match = await bcrypt.compare(currentPassword, currentHash);

    if (!match) {
      return res.status(400).json({ error: 'A senha atual informada está incorreta.' });
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    await pool.request()
      .input('id', userId)
      .input('hash', newHash)
      .query(`
        UPDATE dbo.Usuarios 
        SET senha_hash = @hash, 
            senha_temporaria = 0, 
            trocar_senha_proximo_login = 0,
            atualizado_em = SYSUTCDATETIME()
        WHERE id_usuario = @id
      `);

    res.json({ success: true, message: 'Senha redefinida com sucesso!' });
  } catch (err) {
    console.error('[Auth API] Erro ao trocar senha:', err);
    res.status(500).json({ error: 'Erro interno ao redefinir senha.' });
  }
};

// POST /api/auth/forgot-password
// Gera senha temporária segura ou token de recuperação para o e-mail informado
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email || !email.trim()) {
    return res.status(400).json({ error: 'Por favor, informe seu e-mail corporativo.' });
  }

  try {
    const pool = await getDbPool();
    const userRes = await pool.request()
      .input('email', email.trim().toLowerCase())
      .query(`
        SELECT id_usuario, nome, email, status 
        FROM dbo.Usuarios 
        WHERE email = @email
      `);

    if (userRes.recordset.length === 0) {
      return res.status(404).json({ error: 'Nenhum usuário cadastrado com este e-mail corporativo.' });
    }

    const user = userRes.recordset[0];

    if (user.status === 'inativo' || user.status === 'bloqueado') {
      return res.status(403).json({ error: 'Conta inativa ou bloqueada. Entre em contato com a gestão da rede J. Toledo.' });
    }

    // Gera senha temporária de 8 caracteres alfanuméricos com padrão corporativo Suzuki
    const tempPassword = `SZK@${Math.floor(1000 + Math.random() * 9000)}`;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(tempPassword, salt);

    await pool.request()
      .input('id', user.id_usuario)
      .input('hash', hash)
      .query(`
        UPDATE dbo.Usuarios
        SET senha_hash = @hash,
            senha_temporaria = 1,
            trocar_senha_proximo_login = 1,
            tentativas_falhas = 0,
            atualizado_em = SYSUTCDATETIME()
        WHERE id_usuario = @id
      `);

    console.log(`[Auth API] Recuperação de senha para ${user.email} - Senha Provisória: ${tempPassword}`);

    res.json({
      success: true,
      message: 'Senha temporária gerada com sucesso!',
      userEmail: user.email,
      userName: user.nome,
      temporaryPassword: tempPassword // Exibido diretamente no modal para facilidade de testes/desenvolvimento
    });
  } catch (err) {
    console.error('[Auth API] Erro no esqueci minha senha:', err);
    res.status(500).json({ error: 'Erro interno ao processar recuperação de senha.' });
  }
};

// GET /api/auth/me
export const me = (req, res) => {
  res.json({ user: req.user });
};

export default { login, changePassword, forgotPassword, me };
