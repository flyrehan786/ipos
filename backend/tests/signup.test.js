process.env.JWT_SECRET = 'test-secret';

jest.mock('../models/User');
jest.mock('../utils/audit', () => ({ recordAudit: jest.fn() }));
jest.mock('bcryptjs', () => ({ hash: jest.fn().mockResolvedValue('hashed-password') }));

const User = require('../models/User');
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
  });

  test('always assigns the cashier role even if the body asks for admin', async () => {
    const req = { body: { username: 'newuser', email: 'n@e.com', password: 'secret1', full_name: 'New User', role: 'admin', status: 'inactive' } };
    const res = mockRes();
    await authController.signup(req, res);
    expect(User.create).toHaveBeenCalledWith(
      expect.objectContaining({ role: 'cashier', status: 'active' })
    );
    expect(res.statusCode).toBe(201);
    expect(res.payload.userId).toBe(42);
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
