const db = require('../config/database');

class SaleOrder {
  static async create(orderData) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const [result] = await connection.execute(
        'INSERT INTO sale_orders (order_number, client_id, user_id, order_date, subtotal, discount_type, discount_value, tax_rate, tax_amount, total_amount, paid_amount, payment_status, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [orderData.order_number, orderData.client_id, orderData.user_id, orderData.order_date, orderData.subtotal, orderData.discount_type, orderData.discount_value, orderData.tax_rate, orderData.tax_amount, orderData.total_amount, orderData.paid_amount, orderData.payment_status, orderData.status, orderData.notes]
      );

      const orderId = result.insertId;

      for (const item of orderData.items) {
        await connection.execute(
          'INSERT INTO sale_order_items (sale_order_id, product_id, quantity, unit_price, discount, tax_rate, total) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [orderId, item.product_id, item.quantity, item.unit_price, item.discount, item.tax_rate, item.total]
        );

        await connection.execute('UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?', [item.quantity, item.product_id]);
      }

      await connection.commit();
      return orderId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async findById(id) {
    const [orders] = await db.execute(
      `SELECT so.*, c.name as client_name, u.full_name as user_name 
       FROM sale_orders so 
       LEFT JOIN clients c ON so.client_id = c.id 
       LEFT JOIN users u ON so.user_id = u.id 
       WHERE so.id = ?`,
      [id]
    );

    if (orders.length === 0) return null;

    const [items] = await db.execute(
      `SELECT soi.*, p.name as product_name, p.sku 
       FROM sale_order_items soi 
       JOIN products p ON soi.product_id = p.id 
       WHERE soi.sale_order_id = ?`,
      [id]
    );

    return { ...orders[0], items };
  }

  static async getAll() {
    const [rows] = await db.execute(
      `SELECT so.*, c.name as client_name, u.full_name as user_name 
       FROM sale_orders so 
       LEFT JOIN clients c ON so.client_id = c.id 
       LEFT JOIN users u ON so.user_id = u.id 
       ORDER BY so.created_at DESC`
    );
    return rows;
  }

  static async getByDateRange(startDate, endDate) {
    const [rows] = await db.execute(
      `SELECT so.*, c.name as client_name, u.full_name as user_name 
       FROM sale_orders so 
       LEFT JOIN clients c ON so.client_id = c.id 
       LEFT JOIN users u ON so.user_id = u.id 
       WHERE so.order_date BETWEEN ? AND ? 
       ORDER BY so.order_date DESC`,
      [startDate, endDate]
    );
    return rows;
  }

  static async update(id, orderData) {
    const [result] = await db.execute(
      'UPDATE sale_orders SET client_id = ?, order_date = ?, subtotal = ?, discount_type = ?, discount_value = ?, tax_rate = ?, tax_amount = ?, total_amount = ?, paid_amount = ?, payment_status = ?, status = ?, notes = ? WHERE id = ?',
      [orderData.client_id, orderData.order_date, orderData.subtotal, orderData.discount_type, orderData.discount_value, orderData.tax_rate, orderData.tax_amount, orderData.total_amount, orderData.paid_amount, orderData.payment_status, orderData.status, orderData.notes, id]
    );
    return result.affectedRows;
  }

  static async updatePayment(id, paidAmount, paymentStatus) {
    const [result] = await db.execute(
      'UPDATE sale_orders SET paid_amount = ?, payment_status = ? WHERE id = ?',
      [paidAmount, paymentStatus, id]
    );
    return result.affectedRows;
  }

  static async delete(id) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const [items] = await connection.execute('SELECT product_id, quantity FROM sale_order_items WHERE sale_order_id = ?', [id]);

      for (const item of items) {
        await connection.execute('UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?', [item.quantity, item.product_id]);
      }

      await connection.execute('DELETE FROM sale_order_items WHERE sale_order_id = ?', [id]);
      await connection.execute('DELETE FROM sale_orders WHERE id = ?', [id]);

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = SaleOrder;
