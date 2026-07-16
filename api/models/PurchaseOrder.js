const db = require('../config/database');

class PurchaseOrder {
  static async create(orderData) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const [result] = await connection.execute(
        'INSERT INTO purchase_orders (order_number, supplier_name, supplier_id, user_id, order_date, subtotal, discount_type, discount_value, tax_rate, tax_amount, total_amount, paid_amount, payment_status, status, notes, tenant_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [orderData.order_number, orderData.supplier_name, orderData.supplier_id || null, orderData.user_id, orderData.order_date, orderData.subtotal, orderData.discount_type, orderData.discount_value, orderData.tax_rate, orderData.tax_amount, orderData.total_amount, orderData.paid_amount, orderData.payment_status, orderData.status, orderData.notes, orderData.tenant_id]
      );

      const orderId = result.insertId;

      for (const item of orderData.items) {
        await connection.execute(
          'INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity, unit_price, discount, tax_rate, total) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [orderId, item.product_id, item.quantity, item.unit_price, item.discount, item.tax_rate, item.total]
        );

        await connection.execute('UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?', [item.quantity, item.product_id]);
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

  static async findById(id, tenantId) {
    const [orders] = await db.execute(
      `SELECT po.*, u.full_name as user_name 
       FROM purchase_orders po 
       LEFT JOIN users u ON po.user_id = u.id 
       WHERE po.id = ? AND po.tenant_id = ?`,
      [id, tenantId]
    );

    if (orders.length === 0) return null;

    const [items] = await db.execute(
      `SELECT poi.*, p.name as product_name, p.sku 
       FROM purchase_order_items poi 
       JOIN products p ON poi.product_id = p.id 
       WHERE poi.purchase_order_id = ?`,
      [id]
    );

    return { ...orders[0], items };
  }

  static async getAll(tenantId) {
    const [rows] = await db.execute(
      `SELECT po.*, u.full_name as user_name 
       FROM purchase_orders po 
       LEFT JOIN users u ON po.user_id = u.id 
       WHERE po.tenant_id = ? 
       ORDER BY po.created_at DESC`,
      [tenantId]
    );
    return rows;
  }

  static async getPaginated({ limit, offset, search, tenantId }) {
    let where = 'WHERE po.tenant_id = ?';
    const params = [tenantId];
    if (search) {
      where += ' AND (po.order_number LIKE ? OR po.supplier_name LIKE ? OR po.status LIKE ? OR po.payment_status LIKE ?)';
      const like = `%${search}%`;
      params.push(like, like, like, like);
    }
    const [countRows] = await db.execute(
      `SELECT COUNT(*) AS total FROM purchase_orders po ${where}`,
      params
    );
    const [rows] = await db.execute(
      `SELECT po.*, u.full_name as user_name 
       FROM purchase_orders po 
       LEFT JOIN users u ON po.user_id = u.id 
       ${where} 
       ORDER BY po.created_at DESC LIMIT ${limit} OFFSET ${offset}`,
      params
    );
    return { data: rows, total: countRows[0].total };
  }

  static async getByDateRange(startDate, endDate, tenantId) {
    const [rows] = await db.execute(
      `SELECT po.*, u.full_name as user_name 
       FROM purchase_orders po 
       LEFT JOIN users u ON po.user_id = u.id 
       WHERE po.tenant_id = ? AND po.order_date BETWEEN ? AND ? 
       ORDER BY po.order_date DESC`,
      [tenantId, startDate, endDate]
    );
    return rows;
  }

  static async update(id, orderData, tenantId) {
    const [result] = await db.execute(
      'UPDATE purchase_orders SET supplier_name = ?, order_date = ?, subtotal = ?, discount_type = ?, discount_value = ?, tax_rate = ?, tax_amount = ?, total_amount = ?, paid_amount = ?, payment_status = ?, status = ?, notes = ? WHERE id = ? AND tenant_id = ?',
      [orderData.supplier_name, orderData.order_date, orderData.subtotal, orderData.discount_type, orderData.discount_value, orderData.tax_rate, orderData.tax_amount, orderData.total_amount, orderData.paid_amount, orderData.payment_status, orderData.status, orderData.notes, id, tenantId]
    );
    return result.affectedRows;
  }

  static async updatePayment(id, paidAmount, paymentStatus, tenantId) {
    const [result] = await db.execute(
      'UPDATE purchase_orders SET paid_amount = ?, payment_status = ? WHERE id = ? AND tenant_id = ?',
      [paidAmount, paymentStatus, id, tenantId]
    );
    return result.affectedRows;
  }

  static async delete(id, tenantId) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const [owner] = await connection.execute('SELECT id FROM purchase_orders WHERE id = ? AND tenant_id = ?', [id, tenantId]);
      if (owner.length === 0) {
        await connection.rollback();
        return false;
      }

      const [items] = await connection.execute('SELECT product_id, quantity FROM purchase_order_items WHERE purchase_order_id = ?', [id]);

      for (const item of items) {
        await connection.execute('UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?', [item.quantity, item.product_id]);
      }

      await connection.execute('DELETE FROM purchase_order_items WHERE purchase_order_id = ?', [id]);
      await connection.execute('DELETE FROM purchase_orders WHERE id = ? AND tenant_id = ?', [id, tenantId]);

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async bulkUpdateStatus(ids, status, tenantId) {
    if (!Array.isArray(ids) || ids.length === 0) {
      return 0;
    }
    const placeholders = ids.map(() => '?').join(',');
    const [result] = await db.execute(`UPDATE purchase_orders SET status = ? WHERE id IN (${placeholders}) AND tenant_id = ?`, [status, ...ids, tenantId]);
    return result.affectedRows;
  }
}

module.exports = PurchaseOrder;
