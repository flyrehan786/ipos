process.env.JWT_SECRET = 'test-secret';

jest.mock('../models/User');
jest.mock('../models/Tenant');
jest.mock('../utils/audit', () => ({ recordAudit: jest.fn() }));
jest.mock('bcryptjs', () => ({ hash: jest.fn().mockResolvedValue('hashed-password') }));

const User = require('../models/User');
const Tenant = require('../models/Tenant');
const authController = require('../controllers/authController');

function mockRes() {
  return {
    statusCode: null,
    payload: null,
    status(code) { this.statusCode = code; return this; },
    json(obj) { this.payload = obj; return this; }
  };
}

describe('signup controller (public self-service)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    User.findByUsername.mockResolvedValue(null);
    User.findByEmail.mockResolvedValue(null);
    User.create.mockResolvedValue(42);
    Tenant.generateUniqueSlug.mockResolvedValue('new-users-organization');
    Tenant.create.mockResolvedValue(2);
  });

  test('provisions a new tenant and makes the signer its admin (ignoring any role in the body)', async () => {
    const req = { body: { username: 'newuser', email: 'n@e.com', password: 'secret1', full_name: 'New User', role: 'admin', status: 'inactive' } };
    const res = mockRes();
    await authController.signup(req, res);
    expect(Tenant.create).toHaveBeenCalledTimes(1);
    expect(User.create).toHaveBeenCalledWith(
      expect.objectContaining({ role: 'admin', status: 'active', tenant_id: 2 })
    );
    expect(res.statusCode).toBe(201);
    expect(res.payload.userId).toBe(42);
  });

  test('uses organization_name for the tenant when provided', async () => {
    const req = { body: { username: 'newuser', email: 'n@e.com', password: 'secret1', full_name: 'New User', organization_name: 'Acme Inc' } };
    const res = mockRes();
    await authController.signup(req, res);
    expect(Tenant.generateUniqueSlug).toHaveBeenCalledWith('Acme Inc');
    expect(Tenant.create).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Acme Inc', status: 'active' })
    );
    expect(res.statusCode).toBe(201);
  });

  test('rejects a missing required field (400)', async () => {
    const req = { body: { username: 'newuser', email: 'n@e.com', password: 'secret1' } };
    const res = mockRes();
    await authController.signup(req, res);
    expect(res.statusCode).toBe(400);
    expect(User.create).not.toHaveBeenCalled();
  });

  test('rejects a duplicate username (400)', async () => {
    User.findByUsername.mockResolvedValue({ id: 1, username: 'newuser' });
    const req = { body: { username: 'newuser', email: 'n@e.com', password: 'secret1', full_name: 'New User' } };
    const res = mockRes();
    await authController.signup(req, res);
    expect(res.statusCode).toBe(400);
    expect(User.create).not.toHaveBeenCalled();
  });

  test('rejects a duplicate email (400)', async () => {
    User.findByEmail.mockResolvedValue({ id: 2, email: 'n@e.com' });
    const req = { body: { username: 'newuser', email: 'n@e.com', password: 'secret1', full_name: 'New User' } };
    const res = mockRes();
    await authController.signup(req, res);
    expect(res.statusCode).toBe(400);
    expect(User.create).not.toHaveBeenCalled();
  });
});
