const Client = require('../models/Client');

exports.getAllClients = async (req, res) => {
  try {
    const clients = await Client.getAll();
    res.json(clients);
  } catch (error) {
    console.error('Get all clients error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    const balance = await Client.getBalance(req.params.id);
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
    const clients = await Client.search(q);
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
      status: status || 'active'
    });

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
    });

    res.json({ message: 'Client updated successfully' });
  } catch (error) {
    console.error('Update client error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteClient = async (req, res) => {
  try {
    await Client.delete(req.params.id);
    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Delete client error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
