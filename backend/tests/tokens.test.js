process.env.JWT_SECRET = 'access-secret';
process.env.JWT_REFRESH_SECRET = 'refresh-secret';

const jwt = require('jsonwebtoken');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken
} = require('../utils/tokens');

const user = { id: 7, username: 'alice', role: 'manager', status: 'active' };

describe('generateAccessToken', () => {
  test('produces a token verifiable with the access secret carrying user claims', () => {
    const token = generateAccessToken(user);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    expect(decoded.id).toBe(7);
    expect(decoded.username).toBe('alice');
    expect(decoded.role).toBe('manager');
    expect(decoded.type).toBe('access');
  });

  test('is not verifiable with the refresh secret', () => {
    const token = generateAccessToken(user);
    expect(() => jwt.verify(token, process.env.JWT_REFRESH_SECRET)).toThrow();
  });
});

describe('generateRefreshToken', () => {
  test('produces a refresh-typed token verifiable with the refresh secret', () => {
    const token = generateRefreshToken(user);
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    expect(decoded.id).toBe(7);
    expect(decoded.type).toBe('refresh');
  });
});

describe('verifyRefreshToken', () => {
  test('accepts a genuine refresh token and returns its payload', () => {
    const token = generateRefreshToken(user);
    const payload = verifyRefreshToken(token);
    expect(payload.id).toBe(7);
    expect(payload.type).toBe('refresh');
  });

  test('rejects an access token (wrong type)', () => {
    const token = generateAccessToken(user);
    expect(() => verifyRefreshToken(token)).toThrow();
  });

  test('rejects a tampered/invalid token', () => {
    expect(() => verifyRefreshToken('not.a.valid.token')).toThrow();
  });
});
