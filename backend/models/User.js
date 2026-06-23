const db = require('../config/database');

class User {
  static async create(userData) {
    const [result] = await db.execute(
      'INSERT INTO users (username, email, password, full_name, role, status, tenant_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userData.username, userData.email, userData.password, userData.full_name, userData.role, userData.status, userData.tenant_id != null ? userData.tenant_id : null]
    );
    return result.insertId;
  }

  static async findByUsername(username) {
    const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
    return rows[0];
  }

  static async findByEmail(email) {
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await db.execute('SELECT id, username, email, full_name, role, status, tenant_id, created_at FROM users WHERE id = ?', [id]);
    return rows[0];
  }

  static async findByIdWithPassword(id) {
    const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
  }

  // Tenant-scoped lookup used by tenant user-management routes so that one
  // tenant's admin cannot read users from another tenant.
  static async findByIdInTenant(id, tenantId) {
    const [rows] = await db.execute(
      'SELECT id, username, email, full_name, role, status, tenant_id, created_at FROM users WHERE id = ? AND tenant_id = ?',
      [id, tenantId]
    );
    return rows[0];
  }

  static async getAll(tenantId) {
    const [rows] = await db.execute(
      'SELECT id, username, email, full_name, role, status, tenant_id, created_at FROM users WHERE tenant_id = ? ORDER BY created_at DESC',
      [tenantId]
    );
    return rows;
  }

  static async getPaginated({ limit, offset, search, tenantId }) {
    let where = 'WHERE tenant_id = ?';
    const params = [tenantId];
    if (search) {
      where += ' AND (username LIKE ? OR email LIKE ? OR full_name LIKE ?)';
      const like = `%${search}%`;
      params.push(like, like, like);
    }
    const [countRows] = await db.execute(`SELECT COUNT(*) AS total FROM users ${where}`, params);
    const [rows] = await db.execute(
      `SELECT id, username, email, full_name, role, status, tenant_id, created_at FROM users ${where} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`,
      params
    );
    return { data: rows, total: countRows[0].total };
  }

  static async update(id, userData, tenantId) {
    const [result] = await db.execute(
      'UPDATE users SET username = ?, email = ?, full_name = ?, role = ?, status = ? WHERE id = ? AND tenant_id = ?',
      [userData.username, userData.email, userData.full_name, userData.role, userData.status, id, tenantId]
    );
    return result.affectedRows;
  }

  static async updatePassword(id, password) {
    const [result] = await db.execute('UPDATE users SET password = ? WHERE id = ?', [password, id]);
    return result.affectedRows;
  }

  static async delete(id, tenantId) {
    const [result] = await db.execute('DELETE FROM users WHERE id = ? AND tenant_id = ?', [id, tenantId]);
    return result.affectedRows;
  }

  static async bulkDelete(ids, tenantId) {
    if (!Array.isArray(ids) || ids.length === 0) {
      return 0;
    }
    const placeholders = ids.map(() => '?').join(',');
    const [result] = await db.execute(
      `DELETE FROM users WHERE id IN (${placeholders}) AND tenant_id = ?`,
      [...ids, tenantId]
    );
    return result.affectedRows;
  }

  static async bulkUpdateStatus(ids, status, tenantId) {
    if (!Array.isArray(ids) || ids.length === 0) {
      return 0;
    }
    const placeholders = ids.map(() => '?').join(',');
    const [result] = await db.execute(
      `UPDATE users SET status = ? WHERE id IN (${placeholders}) AND tenant_id = ?`,
      [status, ...ids, tenantId]
    );
    return result.affectedRows;
  }
}

module.exports = User;
