process.env.JWT_SECRET = 'test-secret';

const jwt = require('jsonwebtoken');
const authenticateToken = require('../middleware/auth');
const { authorizeRole } = authenticateToken;

function mockRes() {
  return {
    statusCode: null,
    payload: null,
    status(code) { this.statusCode = code; return this; },
    json(obj) { this.payload = obj; return this; }
  };
}

describe('authenticateToken middleware', () => {
  test('rejects a request with no token (401)', () => {
    const req = { headers: {} };
    const res = mockRes();
    let called = false;
    authenticateToken(req, res, () => { called = true; });
    expect(called).toBe(false);
    expect(res.statusCode).toBe(401);
  });

  test('rejects an invalid token (403) and does not call next()', () => {
    const req = { headers: { authorization: 'Bearer invalid.token.value' } };
    const res = mockRes();
    let called = false;
    authenticateToken(req, res, () => { called = true; });
    expect(called).toBe(false);
    expect(res.statusCode).toBe(403);
  });

  test('accepts a valid token, sets req.user, and calls next() exactly once', () => {
    const token = jwt.sign({ id: 1, username: 'admin', role: 'admin' }, process.env.JWT_SECRET);
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    let calls = 0;
    authenticateToken(req, res, () => { calls++; });
    expect(calls).toBe(1);
    expect(req.user.role).toBe('admin');
    expect(res.statusCode).toBeNull();
  });

  test('rejects a refresh-typed token used as an access token (403)', () => {
    const token = jwt.sign({ id: 1, type: 'refresh' }, process.env.JWT_SECRET);
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    let called = false;
    authenticateToken(req, res, () => { called = true; });
    expect(called).toBe(false);
    expect(res.statusCode).toBe(403);
  });
});

describe('authorizeRole middleware', () => {
  test('allows a user with an allowed role', () => {
    const req = { user: { role: 'admin' } };
    const res = mockRes();
    let called = false;
    authorizeRole('admin')(req, res, () => { called = true; });
    expect(called).toBe(true);
  });

  test('blocks a user with a disallowed role (403)', () => {
    const req = { user: { role: 'cashier' } };
    const res = mockRes();
    let called = false;
    authorizeRole('admin')(req, res, () => { called = true; });
    expect(called).toBe(false);
    expect(res.statusCode).toBe(403);
  });

  test('blocks an unauthenticated request (401)', () => {
    const req = {};
    const res = mockRes();
    let called = false;
    authorizeRole('admin')(req, res, () => { called = true; });
    expect(called).toBe(false);
    expect(res.statusCode).toBe(401);
  });

  test('supports multiple allowed roles', () => {
    const req = { user: { role: 'manager' } };
    const res = mockRes();
    let called = false;
    authorizeRole('admin', 'manager')(req, res, () => { called = true; });
    expect(called).toBe(true);
  });
});
