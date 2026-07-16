const Supplier = require('../models/Supplier');
const { getPaginationParams, buildPaginatedResponse } = require('../utils/pagination');
const { toCsv } = require('../utils/csv');
const { parseIds } = require('../utils/ids');
const { recordAudit } = require('../utils/audit');

exports.exportSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.getAll(req.user.tenant_id);
    const csv = toCsv(suppliers);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="suppliers.csv"');
    res.send(csv);
  } catch (error) {
    console.error('Export suppliers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getAllSuppliers = async (req, res) => {
  try {
    if (req.query.page !== undefined) {
      const { page, limit, offset } = getPaginationParams(req.query);
      const search = req.query.search || req.query.q || '';
      const { data, total } = await Supplier.getPaginated({ limit, offset, search, tenantId: req.user.tenant_id });
      return res.json(buildPaginatedResponse({ data, total, page, limit }));
    }
    const suppliers = await Supplier.getAll(req.user.tenant_id);
    res.json(suppliers);
  } catch (error) {
    console.error('Get all suppliers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id, req.user.tenant_id);
    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    res.json(supplier);
  } catch (error) {
    console.error('Get supplier error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.searchSuppliers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Search term is required' });
    }
    const suppliers = await Supplier.search(q, req.user.tenant_id);
    res.json(suppliers);
  } catch (error) {
    console.error('Search suppliers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.createSupplier = async (req, res) => {
  try {
    const { name, email, phone, address, city, country, tax_id, notes, status } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone are required' });
    }

    const supplierId = await Supplier.create({
      name,
      email: email || null,
      phone,
      address: address || null,
      city: city || null,
      country: country || null,
      tax_id: tax_id || null,
      notes: notes || null,
      status: status || 'active',
      tenant_id: req.user.tenant_id
    });

    await recordAudit(req, 'create', 'supplier', supplierId);
    res.status(201).json({ message: 'Supplier created successfully', supplierId });
  } catch (error) {
    console.error('Create supplier error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateSupplier = async (req, res) => {
  try {
    const { name, email, phone, address, city, country, tax_id, notes, status } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone are required' });
    }

    const affected = await Supplier.update(req.params.id, {
      name,
      email: email || null,
      phone,
      address: address || null,
      city: city || null,
      country: country || null,
      tax_id: tax_id || null,
      notes: notes || null,
      status: status || 'active'
    }, req.user.tenant_id);

    if (!affected) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    await recordAudit(req, 'update', 'supplier', req.params.id);
    res.json({ message: 'Supplier updated successfully' });
  } catch (error) {
    console.error('Update supplier error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteSupplier = async (req, res) => {
  try {
    const affected = await Supplier.delete(req.params.id, req.user.tenant_id);
    if (!affected) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    await recordAudit(req, 'delete', 'supplier', req.params.id);
    res.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    console.error('Delete supplier error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.bulkDeleteSuppliers = async (req, res) => {
  try {
    const ids = parseIds(req.body.ids);
    if (!ids) {
      return res.status(400).json({ error: 'Invalid IDs' });
    }
    await Supplier.bulkDelete(ids, req.user.tenant_id);
    await recordAudit(req, 'bulk_delete', 'supplier', null);
    res.json({ message: 'Suppliers deleted successfully' });
  } catch (error) {
    console.error('Bulk delete suppliers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.bulkUpdateSupplierStatus = async (req, res) => {
  try {
    const ids = parseIds(req.body.ids);
    const { status } = req.body;
    if (!ids || !status) {
      return res.status(400).json({ error: 'Invalid IDs or status' });
    }
    await Supplier.bulkUpdateStatus(ids, status, req.user.tenant_id);
    await recordAudit(req, 'bulk_update_status', 'supplier', null);
    res.json({ message: 'Suppliers status updated successfully' });
  } catch (error) {
    console.error('Bulk update supplier status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
