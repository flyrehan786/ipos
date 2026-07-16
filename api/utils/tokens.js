const jwt = require('jsonwebtoken');

// Short-lived access token; refresh token lives longer and is exchanged at /auth/refresh.
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '15m';
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d';

/**
 * Refresh tokens use a dedicated secret when provided so that a leaked access
 * secret cannot be used to mint refresh tokens. Falls back to JWT_SECRET.
 */
function getRefreshSecret() {
  return process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
}

function generateAccessToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
      tenant_id: user.tenant_id != null ? user.tenant_id : null,
      is_super_admin: user.role === 'super_admin',
      type: 'access'
    },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    { id: user.id, type: 'refresh' },
    getRefreshSecret(),
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );
}

/**
 * Verifies a refresh token and asserts the token type. Throws if invalid,
 * expired, or not a refresh token.
 */
function verifyRefreshToken(token) {
  const payload = jwt.verify(token, getRefreshSecret());
  if (payload.type !== 'refresh') {
    throw new Error('Invalid token type');
  }
  return payload;
}

module.exports = {
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY,
  getRefreshSecret,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken
};
