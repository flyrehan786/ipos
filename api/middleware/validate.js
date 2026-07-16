/**
 * Lightweight, dependency-free request body validation middleware.
 *
 * Usage:
 *   const { validate } = require('../middleware/validate');
 *   router.post('/', authenticateToken, validate(clientSchema), controller.create);
 *
 * Schema shape (per field):
 *   {
 *     required: true,
 *     type: 'string' | 'number' | 'email' | 'enum',
 *     minLength, maxLength,   // string
 *     min, max,               // number
 *     values: [...]           // enum
 *   }
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(schema) {
  return (req, res, next) => {
    const errors = [];
    const body = req.body || {};

    for (const [field, rules] of Object.entries(schema)) {
      const value = body[field];
      const present = value !== undefined && value !== null && value !== '';

      if (rules.required && !present) {
        errors.push(`${field} is required`);
        continue;
      }
      if (!present) continue;

      switch (rules.type) {
        case 'email':
          if (typeof value !== 'string' || !EMAIL_REGEX.test(value)) {
            errors.push(`${field} must be a valid email address`);
          }
          break;
        case 'number': {
          const num = Number(value);
          if (Number.isNaN(num)) {
            errors.push(`${field} must be a number`);
          } else {
            if (rules.min !== undefined && num < rules.min) errors.push(`${field} must be at least ${rules.min}`);
            if (rules.max !== undefined && num > rules.max) errors.push(`${field} must be at most ${rules.max}`);
          }
          break;
        }
        case 'enum':
          if (!rules.values.includes(value)) {
            errors.push(`${field} must be one of: ${rules.values.join(', ')}`);
          }
          break;
        case 'string':
        default:
          if (typeof value !== 'string') {
            errors.push(`${field} must be a string`);
          } else {
            if (rules.minLength && value.length < rules.minLength) errors.push(`${field} must be at least ${rules.minLength} characters`);
            if (rules.maxLength && value.length > rules.maxLength) errors.push(`${field} must be at most ${rules.maxLength} characters`);
          }
          break;
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ error: errors[0], errors });
    }
    next();
  };
}

module.exports = { validate };
