const db = require('../config/database');

class Supplier {
  static async create(supplierData) {
    const [result] = await db.execute(
      'INSERT INTO suppliers (name, email, phone, address, city, country, tax_id, notes, status, tenant_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [supplierData.name, supplierData.email, supplierData.phone, supplierData.address, supplierData.city, supplierData.country, supplierData.tax_id, supplierData.notes, supplierData.status, supplierData.tenant_id]
    );
    return result.insertId;
  }

  static async findById(id, tenantId) {
    const [rows] = await db.execute('SELECT * FROM suppliers WHERE id = ? AND tenant_id = ?', [id, tenantId]);
    return rows[0];
  }

  static async getAll(tenantId) {
    const [rows] = await db.execute('SELECT * FROM suppliers WHERE tenant_id = ? ORDER BY name ASC', [tenantId]);
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
    const [countRows] = await db.execute(`SELECT COUNT(*) AS total FROM suppliers ${where}`, params);
    const [rows] = await db.execute(
      `SELECT * FROM suppliers ${where} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`,
      params
    );
    return { data: rows, total: countRows[0].total };
  }

  static async search(searchTerm, tenantId) {
    const [rows] = await db.execute(
      'SELECT * FROM suppliers WHERE tenant_id = ? AND (name LIKE ? OR email LIKE ? OR phone LIKE ?) AND status = ? ORDER BY name',
      [tenantId, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, 'active']
    );
    return rows;
  }

  static async update(id, supplierData, tenantId) {
    const [result] = await db.execute(
      'UPDATE suppliers SET name = ?, email = ?, phone = ?, address = ?, city = ?, country = ?, tax_id = ?, notes = ?, status = ? WHERE id = ? AND tenant_id = ?',
      [supplierData.name, supplierData.email, supplierData.phone, supplierData.address, supplierData.city, supplierData.country, supplierData.tax_id, supplierData.notes, supplierData.status, id, tenantId]
    );
    return result.affectedRows;
  }

  static async delete(id, tenantId) {
    const [result] = await db.execute('DELETE FROM suppliers WHERE id = ? AND tenant_id = ?', [id, tenantId]);
    return result.affectedRows;
  }

  static async bulkDelete(ids, tenantId) {
    if (!Array.isArray(ids) || ids.length === 0) {
      return 0;
    }
    const placeholders = ids.map(() => '?').join(',');
    const [result] = await db.execute(`DELETE FROM suppliers WHERE id IN (${placeholders}) AND tenant_id = ?`, [...ids, tenantId]);
    return result.affectedRows;
  }

  static async bulkUpdateStatus(ids, status, tenantId) {
    if (!Array.isArray(ids) || ids.length === 0) {
      return 0;
    }
    const placeholders = ids.map(() => '?').join(',');
    const [result] = await db.execute(`UPDATE suppliers SET status = ? WHERE id IN (${placeholders}) AND tenant_id = ?`, [status, ...ids, tenantId]);
    return result.affectedRows;
  }
}

module.exports = Supplier;
