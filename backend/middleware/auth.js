const jwt = require('jsonwebtoken');

if (!process.env.JWT_SECRET) {
  // Fail fast: a missing secret silently disables token verification security.
  throw new Error('JWT_SECRET environment variable is not set. Refusing to start.');
}

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

/**
 * Role-based authorization middleware. Must run after authenticateToken.
 * Usage: router.delete('/:id', authenticateToken, authorizeRole('admin'), handler)
 */
const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

module.exports = authenticateToken;
module.exports.authorizeRole = authorizeRole;
