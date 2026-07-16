const bcrypt = require('bcryptjs');
const db = require('../config/database');
const Tenant = require('../models/Tenant');
const ContactMessage = require('../models/ContactMessage');
const { getPaginationParams, buildPaginatedResponse } = require('../utils/pagination');
const { parseIds } = require('../utils/ids');
const { isValidStatus } = require('../utils/status');

function tenantFilter(tenantId, column = 'tenant_id') {
  if (tenantId) {
    return { clause: `WHERE ${column} = ?`, params: [tenantId] };
  }
  return { clause: '', params: [] };
}

// Aggregated, cross-tenant platform statistics. Supports an optional
// ?tenantId filter so the super-admin can drill into a single organization.
exports.getStats = async (req, res) => {
  try {
    const tenantId = req.query.tenantId ? parseInt(req.query.tenantId, 10) : null;
    const f = tenantFilter(tenantId);

    const [[tenantCounts]] = await db.query(
      `SELECT COUNT(*) AS total, COALESCE(SUM(status = 'active'), 0) AS active FROM tenants`
    );
    const [[userCount]] = await db.query(
      `SELECT COUNT(*) AS total FROM users WHERE role != 'super_admin'${tenantId ? ' AND tenant_id = ?' : ''}`,
      tenantId ? [tenantId] : []
    );
    const [[clientCount]] = await db.query(`SELECT COUNT(*) AS total FROM clients ${f.clause}`, f.params);
    const [[productCount]] = await db.query(`SELECT COUNT(*) AS total FROM products ${f.clause}`, f.params);
    const [[saleStats]] = await db.query(
      `SELECT COUNT(*) AS count, COALESCE(SUM(total_amount), 0) AS revenue FROM sale_orders ${f.clause}`,
      f.params
    );
    const [[purchaseStats]] = await db.query(
      `SELECT COUNT(*) AS count, COALESCE(SUM(total_amount), 0) AS spend FROM purchase_orders ${f.clause}`,
      f.params
    );
    const [[txStats]] = await db.query(
      `SELECT
         COALESCE(SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END), 0) AS income,
         COALESCE(SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END), 0) AS expense
       FROM transactions ${f.clause}`,
      f.params
    );
    const [[newMessages]] = await db.query(`SELECT COUNT(*) AS total FROM contact_messages WHERE status = 'new'`);

    // Per-tenant breakdown for charts / the tenant filter dropdown.
    const perTenantParams = tenantId ? [tenantId] : [];
    const perTenantWhere = tenantId ? 'WHERE t.id = ?' : '';
    const [perTenant] = await db.query(
      `SELECT t.id, t.name, t.slug, t.status,
         (SELECT COUNT(*) FROM users u WHERE u.tenant_id = t.id AND u.role != 'super_admin') AS users,
         (SELECT COUNT(*) FROM products p WHERE p.tenant_id = t.id) AS products,
         (SELECT COUNT(*) FROM clients c WHERE c.tenant_id = t.id) AS clients,
         (SELECT COALESCE(SUM(so.total_amount), 0) FROM sale_orders so WHERE so.tenant_id = t.id) AS revenue,
         (SELECT COALESCE(SUM(po.total_amount), 0) FROM purchase_orders po WHERE po.tenant_id = t.id) AS spend
       FROM tenants t
       ${perTenantWhere}
       ORDER BY revenue DESC`,
      perTenantParams
    );

    res.json({
      tenants: { total: Number(tenantCounts.total), active: Number(tenantCounts.active) },
      users: Number(userCount.total),
      clients: Number(clientCount.total),
      products: Number(productCount.total),
      saleOrders: { count: Number(saleStats.count), revenue: Number(saleStats.revenue) },
      purchaseOrders: { count: Number(purchaseStats.count), spend: Number(purchaseStats.spend) },
      transactions: {
        income: Number(txStats.income),
        expense: Number(txStats.expense),
        net: Number(txStats.income) - Number(txStats.expense)
      },
      newMessages: Number(newMessages.total),
      perTenant: perTenant.map((t) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        status: t.status,
        users: Number(t.users),
        products: Number(t.products),
        clients: Number(t.clients),
        revenue: Number(t.revenue),
        spend: Number(t.spend)
      }))
    });
  } catch (error) {
    console.error('Super-admin getStats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getTenants = async (req, res) => {
  try {
    if (req.query.page !== undefined) {
      const { page, limit, offset } = getPaginationParams(req.query);
      const search = req.query.search || req.query.q || '';
      const { data, total } = await Tenant.getPaginated({ limit, offset, search });
      return res.json(buildPaginatedResponse({ data, total, page, limit }));
    }
    const tenants = await Tenant.getAll();
    res.json(tenants);
  } catch (error) {
    console.error('Super-admin getTenants error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getTenantById = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    res.json(tenant);
  } catch (error) {
    console.error('Super-admin getTenantById error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.createTenant = async (req, res) => {
  try {
    const { name, admin_username, admin_email, admin_password, admin_full_name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Organization name is required' });
    }

    const slug = await Tenant.generateUniqueSlug(name);
    const tenantId = await Tenant.create({ name, slug, status: 'active' });

    // Optionally provision an initial admin for the new organization.
    if (admin_username && admin_email && admin_password && admin_full_name) {
      const User = require('../models/User');
      const existingUser = await User.findByUsername(admin_username);
      if (existingUser) {
        return res.status(400).json({ error: 'Admin username already exists' });
      }
      const existingEmail = await User.findByEmail(admin_email);
      if (existingEmail) {
        return res.status(400).json({ error: 'Admin email already exists' });
      }
      const hashed = await bcrypt.hash(admin_password, 10);
      await User.create({
        username: admin_username,
        email: admin_email,
        password: hashed,
        full_name: admin_full_name,
        role: 'admin',
        status: 'active',
        tenant_id: tenantId
      });
    }

    res.status(201).json({ message: 'Tenant created successfully', tenantId, slug });
  } catch (error) {
    console.error('Super-admin createTenant error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateTenant = async (req, res) => {
  try {
    const { name, status } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Organization name is required' });
    }
    if (status && !isValidStatus(status)) {
      return res.status(400).json({ error: 'status must be "active" or "inactive"' });
    }
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    await Tenant.update(req.params.id, { name, status: status || tenant.status });
    res.json({ message: 'Tenant updated successfully' });
  } catch (error) {
    console.error('Super-admin updateTenant error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateTenantStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!isValidStatus(status)) {
      return res.status(400).json({ error: 'status must be "active" or "inactive"' });
    }
    const updated = await Tenant.updateStatus(req.params.id, status);
    if (!updated) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    res.json({ message: 'Tenant status updated' });
  } catch (error) {
    console.error('Super-admin updateTenantStatus error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Cross-tenant user listing with an optional ?tenantId filter.
exports.getUsers = async (req, res) => {
  try {
    const tenantId = req.query.tenantId ? parseInt(req.query.tenantId, 10) : null;
    const { page, limit, offset } = getPaginationParams(req.query);
    const search = req.query.search || req.query.q || '';

    const conditions = ["u.role != 'super_admin'"];
    const params = [];
    if (tenantId) {
      conditions.push('u.tenant_id = ?');
      params.push(tenantId);
    }
    if (search) {
      conditions.push('(u.username LIKE ? OR u.email LIKE ? OR u.full_name LIKE ?)');
      const like = `%${search}%`;
      params.push(like, like, like);
    }
    const where = `WHERE ${conditions.join(' AND ')}`;

    const [[countRow]] = await db.query(
      `SELECT COUNT(*) AS total FROM users u ${where}`,
      params
    );
    const [rows] = await db.query(
      `SELECT u.id, u.username, u.email, u.full_name, u.role, u.status, u.tenant_id, u.created_at, t.name AS tenant_name
       FROM users u
       LEFT JOIN tenants t ON u.tenant_id = t.id
       ${where}
       ORDER BY u.created_at DESC
       LIMIT ${limit} OFFSET ${offset}`,
      params
    );
    res.json(buildPaginatedResponse({ data: rows, total: Number(countRow.total), page, limit }));
  } catch (error) {
    console.error('Super-admin getUsers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!isValidStatus(status)) {
      return res.status(400).json({ error: 'status must be "active" or "inactive"' });
    }
    const [result] = await db.execute(
      "UPDATE users SET status = ? WHERE id = ? AND role != 'super_admin'",
      [status, req.params.id]
    );
    if (!result.affectedRows) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User status updated' });
  } catch (error) {
    console.error('Super-admin updateUserStatus error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const [result] = await db.execute(
      "DELETE FROM users WHERE id = ? AND role != 'super_admin'",
      [req.params.id]
    );
    if (!result.affectedRows) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted' });
  } catch (error) {
    console.error('Super-admin deleteUser error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.bulkUpdateUserStatus = async (req, res) => {
  try {
    const ids = parseIds(req.body.ids);
    if (ids.length === 0) {
      return res.status(400).json({ error: 'A non-empty array of valid ids is required' });
    }
    if (!isValidStatus(req.body.status)) {
      return res.status(400).json({ error: 'status must be "active" or "inactive"' });
    }
    const placeholders = ids.map(() => '?').join(',');
    const [result] = await db.execute(
      `UPDATE users SET status = ? WHERE id IN (${placeholders}) AND role != 'super_admin'`,
      [req.body.status, ...ids]
    );
    res.json({ message: `${result.affectedRows} user(s) updated`, updated: result.affectedRows });
  } catch (error) {
    console.error('Super-admin bulkUpdateUserStatus error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
