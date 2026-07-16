const db = require('../config/database');

function slugify(name) {
  return String(name)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'tenant';
}

class Tenant {
  static async create({ name, slug, status }) {
    const [result] = await db.execute(
      'INSERT INTO tenants (name, slug, status) VALUES (?, ?, ?)',
      [name, slug, status || 'active']
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await db.execute('SELECT * FROM tenants WHERE id = ?', [id]);
    return rows[0];
  }

  static async findBySlug(slug) {
    const [rows] = await db.execute('SELECT * FROM tenants WHERE slug = ?', [slug]);
    return rows[0];
  }

  // Generates a unique slug derived from the given name, appending a numeric
  // suffix when the base slug is already taken.
  static async generateUniqueSlug(name) {
    const base = slugify(name);
    let candidate = base;
    let counter = 1;
    // eslint-disable-next-line no-await-in-loop
    while (await Tenant.findBySlug(candidate)) {
      candidate = `${base}-${counter}`;
      counter += 1;
    }
    return candidate;
  }

  static async getAll() {
    const [rows] = await db.execute('SELECT * FROM tenants ORDER BY created_at DESC');
    return rows;
  }

  static async getPaginated({ limit, offset, search }) {
    let where = '';
    let params = [];
    if (search) {
      where = 'WHERE name LIKE ? OR slug LIKE ?';
      const like = `%${search}%`;
      params = [like, like];
    }
    const [countRows] = await db.execute(`SELECT COUNT(*) AS total FROM tenants ${where}`, params);
    const [rows] = await db.execute(
      `SELECT * FROM tenants ${where} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`,
      params
    );
    return { data: rows, total: countRows[0].total };
  }

  static async update(id, { name, status }) {
    const [result] = await db.execute(
      'UPDATE tenants SET name = ?, status = ? WHERE id = ?',
      [name, status, id]
    );
    return result.affectedRows;
  }

  static async updateStatus(id, status) {
    const [result] = await db.execute('UPDATE tenants SET status = ? WHERE id = ?', [status, id]);
    return result.affectedRows;
  }
}

Tenant.slugify = slugify;

module.exports = Tenant;
