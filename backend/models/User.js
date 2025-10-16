const db = require('../config/database');

class User {
  static async create(userData) {
    const [result] = await db.execute(
      'INSERT INTO users (username, email, password, full_name, role, status) VALUES (?, ?, ?, ?, ?, ?)',
      [userData.username, userData.email, userData.password, userData.full_name, userData.role, userData.status]
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
    const [rows] = await db.execute('SELECT id, username, email, full_name, role, status, created_at FROM users WHERE id = ?', [id]);
    return rows[0];
  }

  static async getAll() {
    const [rows] = await db.execute('SELECT id, username, email, full_name, role, status, created_at FROM users ORDER BY created_at DESC');
    return rows;
  }

  static async update(id, userData) {
    const [result] = await db.execute(
      'UPDATE users SET username = ?, email = ?, full_name = ?, role = ?, status = ? WHERE id = ?',
      [userData.username, userData.email, userData.full_name, userData.role, userData.status, id]
    );
    return result.affectedRows;
  }

  static async updatePassword(id, password) {
    const [result] = await db.execute('UPDATE users SET password = ? WHERE id = ?', [password, id]);
    return result.affectedRows;
  }

  static async delete(id) {
    const [result] = await db.execute('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows;
  }
}

module.exports = User;
