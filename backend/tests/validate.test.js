const { validate } = require('../middleware/validate');

function mockReqRes(body) {
  const req = { body };
  const res = {
    statusCode: null,
    payload: null,
    status(code) { this.statusCode = code; return this; },
    json(obj) { this.payload = obj; return this; }
  };
  return { req, res };
}

const schema = {
  name: { required: true, type: 'string', maxLength: 5 },
  email: { type: 'email' },
  age: { type: 'number', min: 0, max: 120 },
  role: { type: 'enum', values: ['a', 'b'] }
};

describe('validate middleware', () => {
  test('passes a valid body and calls next()', () => {
    const { req, res } = mockReqRes({ name: 'abc', email: 'x@y.com', age: 5, role: 'a' });
    let called = false;
    validate(schema)(req, res, () => { called = true; });
    expect(called).toBe(true);
    expect(res.statusCode).toBeNull();
  });

  test('rejects when a required field is missing', () => {
    const { req, res } = mockReqRes({});
    let called = false;
    validate(schema)(req, res, () => { called = true; });
    expect(called).toBe(false);
    expect(res.statusCode).toBe(400);
    expect(res.payload.error).toMatch(/name is required/);
  });

  test('rejects an invalid email', () => {
    const { req, res } = mockReqRes({ name: 'ab', email: 'not-an-email' });
    validate(schema)(req, res, () => {});
    expect(res.statusCode).toBe(400);
  });

  test('rejects a number out of range', () => {
    const { req, res } = mockReqRes({ name: 'ab', age: 999 });
    validate(schema)(req, res, () => {});
    expect(res.statusCode).toBe(400);
  });

  test('rejects a string exceeding maxLength', () => {
    const { req, res } = mockReqRes({ name: 'toolong' });
    validate(schema)(req, res, () => {});
    expect(res.statusCode).toBe(400);
  });

  test('rejects a value outside the enum', () => {
    const { req, res } = mockReqRes({ name: 'ab', role: 'z' });
    validate(schema)(req, res, () => {});
    expect(res.statusCode).toBe(400);
  });

  test('skips optional fields when absent', () => {
    const { req, res } = mockReqRes({ name: 'ab' });
    let called = false;
    validate(schema)(req, res, () => { called = true; });
    expect(called).toBe(true);
  });
});
