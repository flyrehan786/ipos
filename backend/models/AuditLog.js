const db = require('../config/database');

class AuditLog {
  static async create(data) {
    const [result] = await db.execute(
      'INSERT INTO audit_logs (user_id, username, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?, ?)',
      [
        data.user_id ?? null,
        data.username ?? null,
        data.action,
        data.entity_type ?? null,
        data.entity_id ?? null,
        data.details ?? null
      ]
    );
    return result.insertId;
  }

  static async getPaginated({ limit, offset, search }) {
    let where = '';
    let params = [];
    if (search) {
      where = 'WHERE username LIKE ? OR action LIKE ? OR entity_type LIKE ?';
      const like = `%${search}%`;
      params = [like, like, like];
    }
    const [countRows] = await db.execute(`SELECT COUNT(*) AS total FROM audit_logs ${where}`, params);
    const [rows] = await db.execute(
      `SELECT * FROM audit_logs ${where} ORDER BY created_at DESC, id DESC LIMIT ${limit} OFFSET ${offset}`,
      params
    );
    return { data: rows, total: countRows[0].total };
  }
}

module.exports = AuditLog;
