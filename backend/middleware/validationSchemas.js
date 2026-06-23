/**
 * Validation schemas for request bodies, consumed by middleware/validate.js.
 * Field rules intentionally align with the database column constraints.
 */

const userCreateSchema = {
  username: { required: true, type: 'string', minLength: 3, maxLength: 50 },
  email: { required: true, type: 'email', maxLength: 100 },
  password: { required: true, type: 'string', minLength: 6, maxLength: 255 },
  full_name: { required: true, type: 'string', maxLength: 100 },
  role: { type: 'enum', values: ['admin', 'manager', 'cashier'] },
  status: { type: 'enum', values: ['active', 'inactive'] }
};

const userUpdateSchema = {
  username: { required: true, type: 'string', minLength: 3, maxLength: 50 },
  email: { required: true, type: 'email', maxLength: 100 },
  full_name: { required: true, type: 'string', maxLength: 100 },
  role: { type: 'enum', values: ['admin', 'manager', 'cashier'] },
  status: { type: 'enum', values: ['active', 'inactive'] }
};

const clientSchema = {
  name: { required: true, type: 'string', maxLength: 255 },
  email: { type: 'email', maxLength: 100 },
  phone: { required: true, type: 'string', maxLength: 30 },
  address: { type: 'string', maxLength: 500 },
  city: { type: 'string', maxLength: 100 },
  country: { type: 'string', maxLength: 100 },
  tax_id: { type: 'string', maxLength: 100 },
  credit_limit: { type: 'number', min: 0 },
  status: { type: 'enum', values: ['active', 'inactive'] }
};

const productSchema = {
  name: { required: true, type: 'string', maxLength: 255 },
  sku: { required: true, type: 'string', maxLength: 50 },
  barcode: { type: 'string', maxLength: 100 },
  description: { type: 'string', maxLength: 1000 },
  category: { type: 'string', maxLength: 100 },
  unit: { type: 'string', maxLength: 50 },
  purchase_price: { type: 'number', min: 0 },
  sale_price: { type: 'number', min: 0 },
  stock_quantity: { type: 'number', min: 0 },
  min_stock_level: { type: 'number', min: 0 },
  status: { type: 'enum', values: ['active', 'inactive'] }
};

const registerSchema = {
  username: { required: true, type: 'string', minLength: 3, maxLength: 50 },
  email: { required: true, type: 'email', maxLength: 100 },
  password: { required: true, type: 'string', minLength: 6, maxLength: 255 },
  full_name: { required: true, type: 'string', maxLength: 100 },
  role: { type: 'enum', values: ['admin', 'manager', 'cashier'] }
};

// Public self-service signup: no `role` field — the server always assigns a
// non-privileged role, so clients cannot escalate by sending one.
const signupSchema = {
  username: { required: true, type: 'string', minLength: 3, maxLength: 50 },
  email: { required: true, type: 'email', maxLength: 100 },
  password: { required: true, type: 'string', minLength: 6, maxLength: 255 },
  full_name: { required: true, type: 'string', maxLength: 100 }
};

module.exports = {
  userCreateSchema,
  userUpdateSchema,
  clientSchema,
  productSchema,
  registerSchema,
  signupSchema
};
