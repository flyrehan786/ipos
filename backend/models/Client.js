const db = require('../config/database');

class Client {
  static async create(clientData) {
    const [result] = await db.execute(
      'INSERT INTO clients (name, email, phone, address, city, country, tax_id, credit_limit, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [clientData.name, clientData.email, clientData.phone, clientData.address, clientData.city, clientData.country, clientData.tax_id, clientData.credit_limit, clientData.status]
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await db.execute('SELECT * FROM clients WHERE id = ?', [id]);
    return rows[0];
  }

  static async getAll() {
    const [rows] = await db.execute('SELECT * FROM clients ORDER BY created_at DESC');
    return rows;
  }

  static async search(searchTerm) {
    const [rows] = await db.execute(
      'SELECT * FROM clients WHERE name LIKE ? OR email LIKE ? OR phone LIKE ? ORDER BY name',
      [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]
    );
    return rows;
  }

  static async update(id, clientData) {
    const [result] = await db.execute(
      'UPDATE clients SET name = ?, email = ?, phone = ?, address = ?, city = ?, country = ?, tax_id = ?, credit_limit = ?, status = ? WHERE id = ?',
      [clientData.name, clientData.email, clientData.phone, clientData.address, clientData.city, clientData.country, clientData.tax_id, clientData.credit_limit, clientData.status, id]
    );
    return result.affectedRows;
  }

  static async delete(id) {
    const [result] = await db.execute('DELETE FROM clients WHERE id = ?', [id]);
    return result.affectedRows;
  }

  static async getBalance(id) {
    const [rows] = await db.execute(
      'SELECT COALESCE(SUM(total_amount - paid_amount), 0) as balance FROM sale_orders WHERE client_id = ? AND status != "cancelled"',
      [id]
    );
    return rows[0].balance;
  }
}

module.exports = Client;
