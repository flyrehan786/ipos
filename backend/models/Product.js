const db = require('../config/database');

class Product {
  static async create(productData) {
    const [result] = await db.execute(
      'INSERT INTO products (name, sku, barcode, description, category, unit, purchase_price, sale_price, stock_quantity, min_stock_level, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [productData.name, productData.sku, productData.barcode, productData.description, productData.category, productData.unit, productData.purchase_price, productData.sale_price, productData.stock_quantity, productData.min_stock_level, productData.status]
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await db.execute('SELECT * FROM products WHERE id = ?', [id]);
    return rows[0];
  }

  static async findByBarcode(barcode) {
    const [rows] = await db.execute('SELECT * FROM products WHERE barcode = ? AND status = "active"', [barcode]);
    return rows[0];
  }

  static async findBySku(sku) {
    const [rows] = await db.execute('SELECT * FROM products WHERE sku = ?', [sku]);
    return rows[0];
  }

  static async getAll() {
    const [rows] = await db.execute('SELECT * FROM products ORDER BY created_at DESC');
    return rows;
  }

  static async search(searchTerm) {
    const [rows] = await db.execute(
      'SELECT * FROM products WHERE name LIKE ? OR sku LIKE ? OR barcode LIKE ? OR category LIKE ? ORDER BY name',
      [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]
    );
    return rows;
  }

  static async getLowStock() {
    const [rows] = await db.execute('SELECT * FROM products WHERE stock_quantity <= min_stock_level AND status = "active" ORDER BY stock_quantity');
    return rows;
  }

  static async update(id, productData) {
    const [result] = await db.execute(
      'UPDATE products SET name = ?, sku = ?, barcode = ?, description = ?, category = ?, unit = ?, purchase_price = ?, sale_price = ?, stock_quantity = ?, min_stock_level = ?, status = ? WHERE id = ?',
      [productData.name, productData.sku, productData.barcode, productData.description, productData.category, productData.unit, productData.purchase_price, productData.sale_price, productData.stock_quantity, productData.min_stock_level, productData.status, id]
    );
    return result.affectedRows;
  }

  static async updateStock(id, quantity) {
    const [result] = await db.execute('UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?', [quantity, id]);
    return result.affectedRows;
  }

  static async delete(id) {
    const [result] = await db.execute('DELETE FROM products WHERE id = ?', [id]);
    return result.affectedRows;
  }
}

module.exports = Product;
