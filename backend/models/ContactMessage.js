const db = require('../config/database');

class ContactMessage {
  static async create({ name, email, subject, message }) {
    const [result] = await db.execute(
      'INSERT INTO contact_messages (name, email, subject, message, status) VALUES (?, ?, ?, ?, ?)',
      [name, email, subject || null, message, 'new']
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await db.execute('SELECT * FROM contact_messages WHERE id = ?', [id]);
    return rows[0];
  }

  static async getPaginated({ limit, offset, search, status }) {
    const conditions = [];
    const params = [];
    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }
    if (search) {
      conditions.push('(name LIKE ? OR email LIKE ? OR subject LIKE ? OR message LIKE ?)');
      const like = `%${search}%`;
      params.push(like, like, like, like);
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const [countRows] = await db.execute(`SELECT COUNT(*) AS total FROM contact_messages ${where}`, params);
    const [rows] = await db.execute(
      `SELECT * FROM contact_messages ${where} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`,
      params
    );
    return { data: rows, total: countRows[0].total };
  }

  static async updateStatus(id, status) {
    const [result] = await db.execute('UPDATE contact_messages SET status = ? WHERE id = ?', [status, id]);
    return result.affectedRows;
  }

  static async delete(id) {
    const [result] = await db.execute('DELETE FROM contact_messages WHERE id = ?', [id]);
    return result.affectedRows;
  }

  static async countByStatus() {
    const [rows] = await db.execute(
      `SELECT status, COUNT(*) AS count FROM contact_messages GROUP BY status`
    );
    return rows;
  }
}

module.exports = ContactMessage;
