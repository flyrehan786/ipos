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

  static async getPaginated({ limit, offset, search }) {
    let where = '';
    let params = [];
    if (search) {
      where = 'WHERE t.payment_method LIKE ? OR t.reference_type LIKE ? OR t.notes LIKE ? OR u.full_name LIKE ?';
      const like = `%${search}%`;
      params = [like, like, like, like];
    }
    const [countRows] = await db.execute(
      `SELECT COUNT(*) AS total FROM transactions t LEFT JOIN users u ON t.user_id = u.id ${where}`,
      params
    );
    const [rows] = await db.execute(
      `SELECT t.*, u.full_name as user_name 
       FROM transactions t 
       LEFT JOIN users u ON t.user_id = u.id 
       ${where} 
       ORDER BY t.created_at DESC LIMIT ${limit} OFFSET ${offset}`,
      params
    );
    return { data: rows, total: countRows[0].total };
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

  static async getSummary() {
    const [rows] = await db.execute(
      `SELECT 
         COALESCE(SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END), 0) AS total_income,
         COALESCE(SUM(CASE WHEN transaction_type = 'expense' THEN amount ELSE 0 END), 0) AS total_expense,
         COUNT(*) AS total_count
       FROM transactions`
    );
    const row = rows[0];
    return {
      total_income: Number(row.total_income),
      total_expense: Number(row.total_expense),
      net_balance: Number(row.total_income) - Number(row.total_expense),
      total_count: Number(row.total_count)
    };
  }
}

module.exports = Transaction;
