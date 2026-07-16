/**
 * Migration 002 — Suppliers.
 *
 * Idempotent and ADDITIVE: safe to run against the existing live database.
 * - Creates the `suppliers` table.
 * - Adds an optional `supplier_id` FK column to `purchase_orders`.
 *
 * Run with:  node migrations/002_suppliers.js
 */
require('dotenv').config();
const mysql = require('mysql2/promise');

async function columnExists(conn, table, column) {
  const [rows] = await conn.query(
    `SELECT COUNT(*) AS c FROM information_schema.columns
     WHERE table_schema = ? AND table_name = ? AND column_name = ?`,
    [process.env.DB_NAME, table, column]
  );
  return rows[0].c > 0;
}

async function run() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
  });

  try {
    console.log('Creating suppliers table...');
    await conn.query(`
      CREATE TABLE IF NOT EXISTS suppliers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(100),
        phone VARCHAR(30) NOT NULL,
        address VARCHAR(500),
        city VARCHAR(100),
        country VARCHAR(100),
        tax_id VARCHAR(100),
        notes TEXT,
        status ENUM('active', 'inactive') DEFAULT 'active',
        tenant_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_suppliers_tenant (tenant_id)
      )
    `);
    console.log('  + suppliers table ready');

    console.log('Adding supplier_id to purchase_orders...');
    if (!(await columnExists(conn, 'purchase_orders', 'supplier_id'))) {
      await conn.query(`ALTER TABLE purchase_orders ADD COLUMN supplier_id INT NULL`);
      await conn.query(`CREATE INDEX idx_po_supplier ON purchase_orders (supplier_id)`);
      console.log('  + supplier_id added to purchase_orders');
    } else {
      console.log('  - supplier_id already present');
    }

    console.log('Migration 002 complete.');
  } finally {
    await conn.end();
  }
}

run().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
