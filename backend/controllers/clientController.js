const Client = require('../models/Client');
const { getPaginationParams, buildPaginatedResponse } = require('../utils/pagination');
const { toCsv } = require('../utils/csv');
const { parseIds } = require('../utils/ids');
const { isValidStatus } = require('../utils/status');
const { recordAudit } = require('../utils/audit');

exports.exportClients = async (req, res) => {
  try {
    const clients = await Client.getAll(req.user.tenant_id);
    const csv = toCsv(clients);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="clients.csv"');
    res.send(csv);
  } catch (error) {
    console.error('Export clients error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getAllClients = async (req, res) => {
  try {
    if (req.query.page !== undefined) {
      const { page, limit, offset } = getPaginationParams(req.query);
      const search = req.query.search || req.query.q || '';
      const { data, total } = await Client.getPaginated({ limit, offset, search, tenantId: req.user.tenant_id });
      return res.json(buildPaginatedResponse({ data, total, page, limit }));
    }
    const clients = await Client.getAll(req.user.tenant_id);
    res.json(clients);
  } catch (error) {
    console.error('Get all clients error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id, req.user.tenant_id);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    const balance = await Client.getBalance(req.params.id, req.user.tenant_id);
    res.json({ ...client, balance });
  } catch (error) {
    console.error('Get client error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.searchClients = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Search term is required' });
    }
    const clients = await Client.search(q, req.user.tenant_id);
    res.json(clients);
  } catch (error) {
    console.error('Search clients error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.createClient = async (req, res) => {
  try {
    const { name, email, phone, address, city, country, tax_id, credit_limit, status } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone are required' });
    }

    const clientId = await Client.create({
      name,
      email: email || null,
      phone,
      address: address || null,
      city: city || null,
      country: country || null,
      tax_id: tax_id || null,
      credit_limit: credit_limit || 0,
      status: status || 'active',
      tenant_id: req.user.tenant_id
    });

    await recordAudit(req, 'create', 'client', clientId);
    res.status(201).json({ message: 'Client created successfully', clientId });
  } catch (error) {
    console.error('Create client error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateClient = async (req, res) => {
  try {
    const { name, email, phone, address, city, country, tax_id, credit_limit, status } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone are required' });
    }

    await Client.update(req.params.id, {
      name,
      email: email || null,
      phone,
      address: address || null,
      city: city || null,
      country: country || null,
      tax_id: tax_id || null,
      credit_limit: credit_limit || 0,
      status: status || 'active'
    }, req.user.tenant_id);

    res.json({ message: 'Client updated successfully' });
  } catch (error) {
    console.error('Update client error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteClient = async (req, res) => {
  try {
    await Client.delete(req.params.id, req.user.tenant_id);
    await recordAudit(req, 'delete', 'client', req.params.id);
    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Delete client error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.bulkDeleteClients = async (req, res) => {
  try {
    const ids = parseIds(req.body.ids);
    if (ids.length === 0) {
      return res.status(400).json({ error: 'A non-empty array of valid ids is required' });
    }
    const deleted = await Client.bulkDelete(ids, req.user.tenant_id);
    await recordAudit(req, 'bulk-delete', 'client', ids.join(','), { deleted });
    res.json({ message: `${deleted} client(s) deleted successfully`, deleted });
  } catch (error) {
    console.error('Bulk delete clients error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.bulkUpdateClientStatus = async (req, res) => {
  try {
    const ids = parseIds(req.body.ids);
    if (ids.length === 0) {
      return res.status(400).json({ error: 'A non-empty array of valid ids is required' });
    }
    if (!isValidStatus(req.body.status)) {
      return res.status(400).json({ error: 'status must be "active" or "inactive"' });
    }
    const updated = await Client.bulkUpdateStatus(ids, req.body.status, req.user.tenant_id);
    await recordAudit(req, 'bulk-status', 'client', ids.join(','), { status: req.body.status, updated });
    res.json({ message: `${updated} client(s) updated successfully`, updated });
  } catch (error) {
    console.error('Bulk update client status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
