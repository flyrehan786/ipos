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
    // Refresh tokens must only be exchanged at /auth/refresh, never used as
    // access tokens for protected routes.
    if (user && user.type === 'refresh') {
      return res.status(403).json({ error: 'Invalid token type' });
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

/**
 * Restricts a route to the platform super-admin (cross-tenant operator).
 * Must run after authenticateToken.
 */
const requireSuperAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Super admin access required' });
  }
  next();
};

/**
 * Restricts a route to tenant administrators. Within a tenant, only the
 * 'admin' role may perform mutating actions (edit/delete/bulk). Non-admin
 * roles (manager/cashier) are read/create only. Super-admins are not tenant
 * users and are intentionally excluded from tenant-scoped routes.
 */
const requireTenantAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin privileges required for this action' });
  }
  next();
};

module.exports = authenticateToken;
module.exports.authorizeRole = authorizeRole;
module.exports.requireSuperAdmin = requireSuperAdmin;
module.exports.requireTenantAdmin = requireTenantAdmin;
