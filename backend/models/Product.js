const db = require('../config/database');

class Product {
  static async create(productData) {
    const [result] = await db.execute(
      'INSERT INTO products (name, sku, barcode, description, category, unit, purchase_price, sale_price, stock_quantity, min_stock_level, status, tenant_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [productData.name, productData.sku, productData.barcode, productData.description, productData.category, productData.unit, productData.purchase_price, productData.sale_price, productData.stock_quantity, productData.min_stock_level, productData.status, productData.tenant_id]
    );
    return result.insertId;
  }

  static async findById(id, tenantId) {
    const [rows] = await db.execute('SELECT * FROM products WHERE id = ? AND tenant_id = ?', [id, tenantId]);
    return rows[0];
  }

  static async findByBarcode(barcode, tenantId) {
    const [rows] = await db.execute('SELECT * FROM products WHERE barcode = ? AND tenant_id = ? AND status = "active"', [barcode, tenantId]);
    return rows[0];
  }

  static async findBySku(sku, tenantId) {
    const [rows] = await db.execute('SELECT * FROM products WHERE sku = ? AND tenant_id = ?', [sku, tenantId]);
    return rows[0];
  }

  static async getAll(tenantId) {
    const [rows] = await db.execute('SELECT * FROM products WHERE tenant_id = ? ORDER BY created_at DESC', [tenantId]);
    return rows;
  }

  static async getPaginated({ limit, offset, search, tenantId }) {
    let where = 'WHERE tenant_id = ?';
    const params = [tenantId];
    if (search) {
      where += ' AND (name LIKE ? OR sku LIKE ? OR barcode LIKE ? OR category LIKE ?)';
      const like = `%${search}%`;
      params.push(like, like, like, like);
    }
    const [countRows] = await db.execute(`SELECT COUNT(*) AS total FROM products ${where}`, params);
    const [rows] = await db.execute(
      `SELECT * FROM products ${where} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`,
      params
    );
    return { data: rows, total: countRows[0].total };
  }

  static async search(searchTerm, tenantId) {
    const [rows] = await db.execute(
      'SELECT * FROM products WHERE tenant_id = ? AND (name LIKE ? OR sku LIKE ? OR barcode LIKE ? OR category LIKE ?) ORDER BY name',
      [tenantId, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]
    );
    return rows;
  }

  static async getLowStock(tenantId) {
    const [rows] = await db.execute('SELECT * FROM products WHERE tenant_id = ? AND stock_quantity <= min_stock_level AND status = "active" ORDER BY stock_quantity', [tenantId]);
    return rows;
  }

  static async update(id, productData, tenantId) {
    const [result] = await db.execute(
      'UPDATE products SET name = ?, sku = ?, barcode = ?, description = ?, category = ?, unit = ?, purchase_price = ?, sale_price = ?, stock_quantity = ?, min_stock_level = ?, status = ? WHERE id = ? AND tenant_id = ?',
      [productData.name, productData.sku, productData.barcode, productData.description, productData.category, productData.unit, productData.purchase_price, productData.sale_price, productData.stock_quantity, productData.min_stock_level, productData.status, id, tenantId]
    );
    return result.affectedRows;
  }

  static async updateStock(id, quantity) {
    const [result] = await db.execute('UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?', [quantity, id]);
    return result.affectedRows;
  }

  static async delete(id, tenantId) {
    const [result] = await db.execute('DELETE FROM products WHERE id = ? AND tenant_id = ?', [id, tenantId]);
    return result.affectedRows;
  }

  static async bulkDelete(ids, tenantId) {
    if (!Array.isArray(ids) || ids.length === 0) {
      return 0;
    }
    const placeholders = ids.map(() => '?').join(',');
    const [result] = await db.execute(`DELETE FROM products WHERE id IN (${placeholders}) AND tenant_id = ?`, [...ids, tenantId]);
    return result.affectedRows;
  }

  static async bulkUpdateStatus(ids, status, tenantId) {
    if (!Array.isArray(ids) || ids.length === 0) {
      return 0;
    }
    const placeholders = ids.map(() => '?').join(',');
    const [result] = await db.execute(`UPDATE products SET status = ? WHERE id IN (${placeholders}) AND tenant_id = ?`, [status, ...ids, tenantId]);
    return result.affectedRows;
  }
}

module.exports = Product;
