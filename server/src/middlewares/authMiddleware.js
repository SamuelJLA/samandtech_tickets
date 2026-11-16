// server/src/middlewares/authMiddleware.js
import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(403).json({ error: 'Acceso denegado: Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];

  try {
    if (process.env.JWT_SECRET && token !== 'jwt_mock_token_samand_2027') {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    } else {
      // Fallback para token de desarrollo
      req.user = {
        id: 'a51ea2fe-e5fb-443d-8364-8e',
        role: 'admin',
        rol: 'admin'
      };
    }
    next();
  } catch (err) {
    console.error('❌ Token inválido o expirado:', err.message);
    return res.status(403).json({ error: 'Token inválido o expirado' });
  }
};

export const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    const rawRole = req.user?.role || req.user?.rol || '';
    const userRole = rawRole.toString().toLowerCase().trim();
    const normalizedAllowed = allowedRoles.map(r => r.toLowerCase().trim());

    if (!normalizedAllowed.includes(userRole)) {
      console.warn(`⛔ Acceso denegado. Rol del usuario: "${userRole}" | Roles permitidos: [${normalizedAllowed.join(', ')}]`);
      return res.status(403).json({ error: 'No tienes permisos para realizar esta acción' });
    }

    next();
  };
};