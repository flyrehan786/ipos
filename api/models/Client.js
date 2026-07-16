const db = require('../config/database');

class Client {
  static async create(clientData) {
    const [result] = await db.execute(
      'INSERT INTO clients (name, email, phone, address, city, country, tax_id, credit_limit, status, tenant_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [clientData.name, clientData.email, clientData.phone, clientData.address, clientData.city, clientData.country, clientData.tax_id, clientData.credit_limit, clientData.status, clientData.tenant_id]
    );
    return result.insertId;
  }

  static async findById(id, tenantId) {
    const [rows] = await db.execute('SELECT * FROM clients WHERE id = ? AND tenant_id = ?', [id, tenantId]);
    return rows[0];
  }

  static async getAll(tenantId) {
    const [rows] = await db.execute('SELECT * FROM clients WHERE tenant_id = ? ORDER BY created_at DESC', [tenantId]);
    return rows;
  }

  static async getPaginated({ limit, offset, search, tenantId }) {
    let where = 'WHERE tenant_id = ?';
    const params = [tenantId];
    if (search) {
      where += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)';
      const like = `%${search}%`;
      params.push(like, like, like);
    }
    const [countRows] = await db.execute(`SELECT COUNT(*) AS total FROM clients ${where}`, params);
    const [rows] = await db.execute(
      `SELECT * FROM clients ${where} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`,
      params
    );
    return { data: rows, total: countRows[0].total };
  }

  static async search(searchTerm, tenantId) {
    const [rows] = await db.execute(
      'SELECT * FROM clients WHERE tenant_id = ? AND (name LIKE ? OR email LIKE ? OR phone LIKE ?) ORDER BY name',
      [tenantId, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]
    );
    return rows;
  }

  static async update(id, clientData, tenantId) {
    const [result] = await db.execute(
      'UPDATE clients SET name = ?, email = ?, phone = ?, address = ?, city = ?, country = ?, tax_id = ?, credit_limit = ?, status = ? WHERE id = ? AND tenant_id = ?',
      [clientData.name, clientData.email, clientData.phone, clientData.address, clientData.city, clientData.country, clientData.tax_id, clientData.credit_limit, clientData.status, id, tenantId]
    );
    return result.affectedRows;
  }

  static async delete(id, tenantId) {
    const [result] = await db.execute('DELETE FROM clients WHERE id = ? AND tenant_id = ?', [id, tenantId]);
    return result.affectedRows;
  }

  static async bulkDelete(ids, tenantId) {
    if (!Array.isArray(ids) || ids.length === 0) {
      return 0;
    }
    const placeholders = ids.map(() => '?').join(',');
    const [result] = await db.execute(`DELETE FROM clients WHERE id IN (${placeholders}) AND tenant_id = ?`, [...ids, tenantId]);
    return result.affectedRows;
  }

  static async bulkUpdateStatus(ids, status, tenantId) {
    if (!Array.isArray(ids) || ids.length === 0) {
      return 0;
    }
    const placeholders = ids.map(() => '?').join(',');
    const [result] = await db.execute(`UPDATE clients SET status = ? WHERE id IN (${placeholders}) AND tenant_id = ?`, [status, ...ids, tenantId]);
    return result.affectedRows;
  }

  static async getBalance(id, tenantId) {
    const [rows] = await db.execute(
      'SELECT COALESCE(SUM(total_amount - paid_amount), 0) as balance FROM sale_orders WHERE client_id = ? AND tenant_id = ? AND status != "cancelled"',
      [id, tenantId]
    );
    return rows[0].balance;
  }
}

module.exports = Client;
