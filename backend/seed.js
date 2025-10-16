const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const categories = ['Electronics', 'Clothing', 'Food & Beverages', 'Home & Garden', 'Sports', 'Books', 'Toys', 'Health & Beauty', 'Automotive', 'Office Supplies'];
const units = ['pcs', 'kg', 'ltr', 'box', 'pack', 'dozen'];
const cities = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala'];
const countries = ['Pakistan', 'UAE', 'Saudi Arabia', 'USA', 'UK', 'China', 'India'];
const paymentMethods = ['cash', 'card', 'bank_transfer', 'cheque'];
const firstNames = ['Ahmed', 'Ali', 'Hassan', 'Hussain', 'Usman', 'Bilal', 'Imran', 'Kamran', 'Tariq', 'Zain', 'Fatima', 'Ayesha', 'Sana', 'Maria', 'Hina'];
const lastNames = ['Khan', 'Ahmed', 'Ali', 'Shah', 'Malik', 'Hussain', 'Raza', 'Iqbal', 'Siddiqui', 'Mirza'];

async function createDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
  });

  await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
  console.log(`Database ${process.env.DB_NAME} created or already exists`);
  await connection.end();
}

async function createTables() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
  });

  await connection.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      full_name VARCHAR(100) NOT NULL,
      role ENUM('admin', 'manager', 'cashier') DEFAULT 'cashier',
      status ENUM('active', 'inactive') DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS clients (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100),
      phone VARCHAR(20) NOT NULL,
      address TEXT,
      city VARCHAR(50),
      country VARCHAR(50),
      tax_id VARCHAR(50),
      credit_limit DECIMAL(15, 2) DEFAULT 0,
      status ENUM('active', 'inactive') DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(200) NOT NULL,
      sku VARCHAR(50) UNIQUE NOT NULL,
      barcode VARCHAR(100),
      description TEXT,
      category VARCHAR(50),
      unit VARCHAR(20),
      purchase_price DECIMAL(15, 2) DEFAULT 0,
      sale_price DECIMAL(15, 2) DEFAULT 0,
      stock_quantity INT DEFAULT 0,
      min_stock_level INT DEFAULT 10,
      status ENUM('active', 'inactive') DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS sale_orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_number VARCHAR(50) UNIQUE NOT NULL,
      client_id INT,
      user_id INT NOT NULL,
      order_date DATE NOT NULL,
      subtotal DECIMAL(15, 2) DEFAULT 0,
      discount_type ENUM('none', 'percentage', 'fixed') DEFAULT 'none',
      discount_value DECIMAL(15, 2) DEFAULT 0,
      tax_rate DECIMAL(5, 2) DEFAULT 0,
      tax_amount DECIMAL(15, 2) DEFAULT 0,
      total_amount DECIMAL(15, 2) DEFAULT 0,
      paid_amount DECIMAL(15, 2) DEFAULT 0,
      payment_status ENUM('unpaid', 'partial', 'paid') DEFAULT 'unpaid',
      status ENUM('pending', 'completed', 'cancelled') DEFAULT 'completed',
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS sale_order_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      sale_order_id INT NOT NULL,
      product_id INT NOT NULL,
      quantity INT NOT NULL,
      unit_price DECIMAL(15, 2) NOT NULL,
      discount DECIMAL(15, 2) DEFAULT 0,
      tax_rate DECIMAL(5, 2) DEFAULT 0,
      total DECIMAL(15, 2) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sale_order_id) REFERENCES sale_orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS purchase_orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_number VARCHAR(50) UNIQUE NOT NULL,
      supplier_name VARCHAR(100) NOT NULL,
      user_id INT NOT NULL,
      order_date DATE NOT NULL,
      subtotal DECIMAL(15, 2) DEFAULT 0,
      discount_type ENUM('none', 'percentage', 'fixed') DEFAULT 'none',
      discount_value DECIMAL(15, 2) DEFAULT 0,
      tax_rate DECIMAL(5, 2) DEFAULT 0,
      tax_amount DECIMAL(15, 2) DEFAULT 0,
      total_amount DECIMAL(15, 2) DEFAULT 0,
      paid_amount DECIMAL(15, 2) DEFAULT 0,
      payment_status ENUM('unpaid', 'partial', 'paid') DEFAULT 'unpaid',
      status ENUM('pending', 'completed', 'cancelled') DEFAULT 'completed',
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS purchase_order_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      purchase_order_id INT NOT NULL,
      product_id INT NOT NULL,
      quantity INT NOT NULL,
      unit_price DECIMAL(15, 2) NOT NULL,
      discount DECIMAL(15, 2) DEFAULT 0,
      tax_rate DECIMAL(5, 2) DEFAULT 0,
      total DECIMAL(15, 2) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      transaction_type ENUM('income', 'expense') NOT NULL,
      reference_type VARCHAR(50),
      reference_id INT,
      amount DECIMAL(15, 2) NOT NULL,
      payment_method VARCHAR(50),
      transaction_date DATE NOT NULL,
      notes TEXT,
      user_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  console.log('All tables created successfully');
  await connection.end();
}

async function seedData() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    multipleStatements: true
  });

  console.log('Seeding users...');
  const hashedPassword = await bcrypt.hash('password123', 10);
  const userValues = [];
  userValues.push(['admin', 'admin@pos.com', hashedPassword, 'Admin User', 'admin', 'active']);
  userValues.push(['manager', 'manager@pos.com', hashedPassword, 'Manager User', 'manager', 'active']);
  userValues.push(['cashier', 'cashier@pos.com', hashedPassword, 'Cashier User', 'cashier', 'active']);

  for (let i = 4; i <= 1000; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const role = ['admin', 'manager', 'cashier'][Math.floor(Math.random() * 3)];
    const status = Math.random() > 0.1 ? 'active' : 'inactive';
    userValues.push([
      `user${i}`,
      `user${i}@pos.com`,
      hashedPassword,
      `${firstName} ${lastName}`,
      role,
      status
    ]);
  }

  await connection.query(
    'INSERT INTO users (username, email, password, full_name, role, status) VALUES ?',
    [userValues]
  );
  console.log('1000 users seeded');

  console.log('Seeding clients...');
  const clientValues = [];
  for (let i = 1; i <= 1000; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    const country = countries[Math.floor(Math.random() * countries.length)];
    const status = Math.random() > 0.1 ? 'active' : 'inactive';
    clientValues.push([
      `${firstName} ${lastName}`,
      `client${i}@email.com`,
      `+92300${Math.floor(1000000 + Math.random() * 9000000)}`,
      `Address ${i}, Street ${Math.floor(Math.random() * 100)}`,
      city,
      country,
      `TAX${Math.floor(100000 + Math.random() * 900000)}`,
      Math.floor(Math.random() * 100000),
      status
    ]);
  }

  await connection.query(
    'INSERT INTO clients (name, email, phone, address, city, country, tax_id, credit_limit, status) VALUES ?',
    [clientValues]
  );
  console.log('1000 clients seeded');

  console.log('Seeding products...');
  const productValues = [];
  for (let i = 1; i <= 1000; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const unit = units[Math.floor(Math.random() * units.length)];
    const purchasePrice = Math.floor(Math.random() * 5000) + 100;
    const salePrice = purchasePrice + Math.floor(purchasePrice * (0.2 + Math.random() * 0.5));
    const status = Math.random() > 0.05 ? 'active' : 'inactive';
    productValues.push([
      `Product ${i} - ${category}`,
      `SKU${String(i).padStart(6, '0')}`,
      `${Math.floor(1000000000000 + Math.random() * 9000000000000)}`,
      `Description for product ${i}`,
      category,
      unit,
      purchasePrice,
      salePrice,
      Math.floor(Math.random() * 1000),
      Math.floor(Math.random() * 50) + 10,
      status
    ]);
  }

  await connection.query(
    'INSERT INTO products (name, sku, barcode, description, category, unit, purchase_price, sale_price, stock_quantity, min_stock_level, status) VALUES ?',
    [productValues]
  );
  console.log('1000 products seeded');

  console.log('Seeding purchase orders...');
  for (let i = 1; i <= 1000; i++) {
    const userId = Math.floor(Math.random() * 1000) + 1;
    const orderDate = new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000));
    const discountType = ['none', 'percentage', 'fixed'][Math.floor(Math.random() * 3)];
    const discountValue = discountType === 'none' ? 0 : Math.floor(Math.random() * 1000);
    const taxRate = Math.random() > 0.5 ? 17 : 0;
    const status = ['pending', 'completed', 'cancelled'][Math.floor(Math.random() * 3)];

    const itemCount = Math.floor(Math.random() * 5) + 1;
    let subtotal = 0;
    const items = [];

    for (let j = 0; j < itemCount; j++) {
      const productId = Math.floor(Math.random() * 1000) + 1;
      const quantity = Math.floor(Math.random() * 50) + 1;
      const unitPrice = Math.floor(Math.random() * 5000) + 100;
      const discount = Math.floor(Math.random() * 100);
      const total = (quantity * unitPrice) - discount;
      subtotal += total;
      items.push([productId, quantity, unitPrice, discount, taxRate, total]);
    }

    let discountAmount = 0;
    if (discountType === 'percentage') {
      discountAmount = (subtotal * discountValue) / 100;
    } else if (discountType === 'fixed') {
      discountAmount = discountValue;
    }

    const taxAmount = ((subtotal - discountAmount) * taxRate) / 100;
    const totalAmount = subtotal - discountAmount + taxAmount;
    const paidAmount = Math.random() > 0.3 ? totalAmount : Math.floor(totalAmount * Math.random());
    const paymentStatus = paidAmount >= totalAmount ? 'paid' : (paidAmount > 0 ? 'partial' : 'unpaid');

    const [result] = await connection.query(
      'INSERT INTO purchase_orders (order_number, supplier_name, user_id, order_date, subtotal, discount_type, discount_value, tax_rate, tax_amount, total_amount, paid_amount, payment_status, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [`PO${String(i).padStart(6, '0')}`, `Supplier ${Math.floor(Math.random() * 100) + 1}`, userId, orderDate, subtotal, discountType, discountValue, taxRate, taxAmount, totalAmount, paidAmount, paymentStatus, status]
    );

    const orderId = result.insertId;
    const itemValues = items.map(item => [orderId, ...item]);
    await connection.query(
      'INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity, unit_price, discount, tax_rate, total) VALUES ?',
      [itemValues]
    );

    if (paidAmount > 0) {
      await connection.query(
        'INSERT INTO transactions (transaction_type, reference_type, reference_id, amount, payment_method, transaction_date, notes, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        ['expense', 'purchase_order', orderId, paidAmount, paymentMethods[Math.floor(Math.random() * paymentMethods.length)], orderDate, `Payment for PO${String(i).padStart(6, '0')}`, userId]
      );
    }

    if (i % 100 === 0) console.log(`${i} purchase orders seeded...`);
  }
  console.log('1000 purchase orders seeded');

  console.log('Seeding sale orders...');
  for (let i = 1; i <= 1000; i++) {
    const userId = Math.floor(Math.random() * 1000) + 1;
    const clientId = Math.random() > 0.2 ? Math.floor(Math.random() * 1000) + 1 : null;
    const orderDate = new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000));
    const discountType = ['none', 'percentage', 'fixed'][Math.floor(Math.random() * 3)];
    const discountValue = discountType === 'none' ? 0 : Math.floor(Math.random() * 1000);
    const taxRate = Math.random() > 0.5 ? 17 : 0;
    const status = ['pending', 'completed', 'cancelled'][Math.floor(Math.random() * 3)];

    const itemCount = Math.floor(Math.random() * 5) + 1;
    let subtotal = 0;
    const items = [];

    for (let j = 0; j < itemCount; j++) {
      const productId = Math.floor(Math.random() * 1000) + 1;
      const quantity = Math.floor(Math.random() * 20) + 1;
      const unitPrice = Math.floor(Math.random() * 10000) + 200;
      const discount = Math.floor(Math.random() * 100);
      const total = (quantity * unitPrice) - discount;
      subtotal += total;
      items.push([productId, quantity, unitPrice, discount, taxRate, total]);
    }

    let discountAmount = 0;
    if (discountType === 'percentage') {
      discountAmount = (subtotal * discountValue) / 100;
    } else if (discountType === 'fixed') {
      discountAmount = discountValue;
    }

    const taxAmount = ((subtotal - discountAmount) * taxRate) / 100;
    const totalAmount = subtotal - discountAmount + taxAmount;
    const paidAmount = Math.random() > 0.2 ? totalAmount : Math.floor(totalAmount * Math.random());
    const paymentStatus = paidAmount >= totalAmount ? 'paid' : (paidAmount > 0 ? 'partial' : 'unpaid');

    const [result] = await connection.query(
      'INSERT INTO sale_orders (order_number, client_id, user_id, order_date, subtotal, discount_type, discount_value, tax_rate, tax_amount, total_amount, paid_amount, payment_status, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [`SO${String(i).padStart(6, '0')}`, clientId, userId, orderDate, subtotal, discountType, discountValue, taxRate, taxAmount, totalAmount, paidAmount, paymentStatus, status]
    );

    const orderId = result.insertId;
    const itemValues = items.map(item => [orderId, ...item]);
    await connection.query(
      'INSERT INTO sale_order_items (sale_order_id, product_id, quantity, unit_price, discount, tax_rate, total) VALUES ?',
      [itemValues]
    );

    if (paidAmount > 0) {
      await connection.query(
        'INSERT INTO transactions (transaction_type, reference_type, reference_id, amount, payment_method, transaction_date, notes, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        ['income', 'sale_order', orderId, paidAmount, paymentMethods[Math.floor(Math.random() * paymentMethods.length)], orderDate, `Payment for SO${String(i).padStart(6, '0')}`, userId]
      );
    }

    if (i % 100 === 0) console.log(`${i} sale orders seeded...`);
  }
  console.log('1000 sale orders seeded');

  await connection.end();
  console.log('Database seeding completed successfully!');
}

async function main() {
  try {
    console.log('Starting database setup...');
    await createDatabase();
    await createTables();
    await seedData();
    console.log('All done!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
