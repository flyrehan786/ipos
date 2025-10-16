const db = require('../config/database');

class Transaction {
  static async create(transactionData) {
    const [result] = await db.execute(
      'INSERT INTO transactions (transaction_type, reference_type, reference_id, amount, payment_method, transaction_date, notes, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [transactionData.transaction_type, transactionData.reference_type, transactionData.reference_id, transactionData.amount, transactionData.payment_method, transactionData.transaction_date, transactionData.notes, transactionData.user_id]
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await db.execute(
      `SELECT t.*, u.full_name as user_name 
       FROM transactions t 
       LEFT JOIN users u ON t.user_id = u.id 
       WHERE t.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async getAll() {
    const [rows] = await db.execute(
      `SELECT t.*, u.full_name as user_name 
       FROM transactions t 
       LEFT JOIN users u ON t.user_id = u.id 
       ORDER BY t.created_at DESC`
    );
    return rows;
  }

  static async getByDateRange(startDate, endDate) {
    const [rows] = await db.execute(
      `SELECT t.*, u.full_name as user_name 
       FROM transactions t 
       LEFT JOIN users u ON t.user_id = u.id 
       WHERE t.transaction_date BETWEEN ? AND ? 
       ORDER BY t.transaction_date DESC`,
      [startDate, endDate]
    );
    return rows;
  }

  static async getByReference(referenceType, referenceId) {
    const [rows] = await db.execute(
      `SELECT t.*, u.full_name as user_name 
       FROM transactions t 
       LEFT JOIN users u ON t.user_id = u.id 
       WHERE t.reference_type = ? AND t.reference_id = ? 
       ORDER BY t.created_at DESC`,
      [referenceType, referenceId]
    );
    return rows;
  }

  static async delete(id) {
    const [result] = await db.execute('DELETE FROM transactions WHERE id = ?', [id]);
    return result.affectedRows;
  }
}

module.exports = Transaction;
