const { verifyJWT } = require('../utils/jwt');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Token de acesso requerido' });
  }

  const user = verifyJWT(token);
  if (!user) {
    return res.status(403).json({ error: 'Token inválido ou expirado' });
  }

  req.user = user;
  next();
}

module.exports = authenticateToken;