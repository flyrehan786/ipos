const db = require('../config/database');

class AuditLog {
  static async create(data) {
    const [result] = await db.execute(
      'INSERT INTO audit_logs (user_id, username, action, entity_type, entity_id, details, tenant_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        data.user_id ?? null,
        data.username ?? null,
        data.action,
        data.entity_type ?? null,
        data.entity_id ?? null,
        data.details ?? null,
        data.tenant_id ?? null
      ]
    );
    return result.insertId;
  }

  static async getPaginated({ limit, offset, search, tenantId }) {
    const conditions = [];
    const params = [];
    if (tenantId != null) {
      conditions.push('tenant_id = ?');
      params.push(tenantId);
    }
    if (search) {
      conditions.push('(username LIKE ? OR action LIKE ? OR entity_type LIKE ?)');
      const like = `%${search}%`;
      params.push(like, like, like);
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const [countRows] = await db.execute(`SELECT COUNT(*) AS total FROM audit_logs ${where}`, params);
    const [rows] = await db.execute(
      `SELECT * FROM audit_logs ${where} ORDER BY created_at DESC, id DESC LIMIT ${limit} OFFSET ${offset}`,
      params
    );
    return { data: rows, total: countRows[0].total };
  }
}

module.exports = AuditLog;
