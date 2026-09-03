import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'SuzukiPortal_SecretKey_2026_Enterprise_SecureToken';

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Acesso não autorizado. Token JWT ausente.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Sessão expirada ou token inválido. Por favor, realize login novamente.' });
  }
};

export const requireMontadora = (req, res, next) => {
  // Payload do JWT (authController.login): scopeType ('montadora' | 'concessionaria'), dealershipId (null para montadora)
  const isMontadora = req.user?.scopeType === 'montadora';
  if (!isMontadora) {
    return res.status(403).json({ error: 'Acesso restrito à Diretoria e Gestão da Montadora J. Toledo.' });
  }
  next();
};

export default { authMiddleware, requireMontadora };
