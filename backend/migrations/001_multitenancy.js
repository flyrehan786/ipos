/**
 * Migration 001 — Multi-tenancy foundation.
 *
 * Idempotent and ADDITIVE: safe to run against the existing live database.
 * - Creates `tenants` and `contact_messages` tables.
 * - Adds a nullable `tenant_id` column to every tenant-scoped table.
 * - Widens users.role to include 'super_admin'.
 * - Creates the "Default Organization" tenant (id=1) and backfills all
 *   existing rows to it.
 * - Seeds a dedicated super-admin account (tenant_id NULL).
 *
 * Run with:  node migrations/001_multitenancy.js
 */
require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const TENANT_SCOPED_TABLES = [
  'users',
  'clients',
  'products',
  'sale_orders',
  'purchase_orders',
  'transactions',
  'audit_logs'
];

async function columnExists(conn, table, column) {
  const [rows] = await conn.query(
    `SELECT COUNT(*) AS c FROM information_schema.columns
     WHERE table_schema = ? AND table_name = ? AND column_name = ?`,
    [process.env.DB_NAME, table, column]
  );
  return rows[0].c > 0;
}

async function tableExists(conn, table) {
  const [rows] = await conn.query(
    `SELECT COUNT(*) AS c FROM information_schema.tables
     WHERE table_schema = ? AND table_name = ?`,
    [process.env.DB_NAME, table]
  );
  return rows[0].c > 0;
}

async function addTenantId(conn, table) {
  if (!(await tableExists(conn, table))) {
    console.log(`  - ${table} does not exist, skipping`);
    return;
  }
  if (await columnExists(conn, table, 'tenant_id')) {
    console.log(`  - ${table}.tenant_id already present`);
    return;
  }
  await conn.query(`ALTER TABLE ${table} ADD COLUMN tenant_id INT NULL`);
  await conn.query(`CREATE INDEX idx_${table}_tenant ON ${table} (tenant_id)`);
  console.log(`  + added tenant_id to ${table}`);
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
    console.log('Creating tenants table...');
    await conn.query(`
      CREATE TABLE IF NOT EXISTS tenants (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        slug VARCHAR(80) UNIQUE NOT NULL,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    console.log('Creating contact_messages table...');
    await conn.query(`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        subject VARCHAR(200),
        message TEXT NOT NULL,
        status ENUM('new', 'read', 'archived') DEFAULT 'new',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Ensuring audit_logs table...');
    await conn.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        username VARCHAR(50),
        action VARCHAR(50) NOT NULL,
        entity_type VARCHAR(50),
        entity_id VARCHAR(50),
        details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Widening users.role to include super_admin...');
    await conn.query(
      `ALTER TABLE users MODIFY COLUMN role ENUM('super_admin', 'admin', 'manager', 'cashier') DEFAULT 'cashier'`
    );

    console.log('Adding tenant_id columns...');
    for (const table of TENANT_SCOPED_TABLES) {
      await addTenantId(conn, table);
    }

    console.log('Ensuring Default Organization tenant (id=1)...');
    await conn.query(
      `INSERT INTO tenants (id, name, slug, status) VALUES (1, 'Default Organization', 'default', 'active')
       ON DUPLICATE KEY UPDATE name = name`
    );

    console.log('Backfilling existing rows to tenant 1...');
    for (const table of TENANT_SCOPED_TABLES) {
      if (!(await tableExists(conn, table))) {
        continue;
      }
      const [res] = await conn.query(`UPDATE ${table} SET tenant_id = 1 WHERE tenant_id IS NULL`);
      console.log(`  ${table}: ${res.affectedRows} row(s) assigned`);
    }

    // The super-admin is global and must NOT belong to any tenant.
    await conn.query(`UPDATE users SET tenant_id = NULL WHERE role = 'super_admin'`);

    console.log('Ensuring super-admin account...');
    const [existing] = await conn.query(`SELECT id FROM users WHERE role = 'super_admin' LIMIT 1`);
    if (existing.length === 0) {
      const hashed = await bcrypt.hash('superadmin123', 10);
      await conn.query(
        `INSERT INTO users (username, email, password, full_name, role, status, tenant_id)
         VALUES (?, ?, ?, ?, 'super_admin', 'active', NULL)`,
        ['superadmin', 'superadmin@omnify.com', hashed, 'Super Admin']
      );
      console.log('  + created super-admin (username: superadmin / password: superadmin123)');
    } else {
      console.log('  - super-admin already exists');
    }

    console.log('\nMigration 001 complete.');
  } finally {
    await conn.end();
  }
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
