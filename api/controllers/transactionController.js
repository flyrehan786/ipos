const Transaction = require('../models/Transaction');
const { getPaginationParams, buildPaginatedResponse } = require('../utils/pagination');
const { toCsv } = require('../utils/csv');

exports.exportTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.getAll(req.user.tenant_id);
    const csv = toCsv(transactions);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="transactions.csv"');
    res.send(csv);
  } catch (error) {
    console.error('Export transactions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getAllTransactions = async (req, res) => {
  try {
    if (req.query.page !== undefined) {
      const { page, limit, offset } = getPaginationParams(req.query);
      const search = req.query.search || req.query.q || '';
      const { data, total } = await Transaction.getPaginated({ limit, offset, search, tenantId: req.user.tenant_id });
      return res.json(buildPaginatedResponse({ data, total, page, limit }));
    }
    const transactions = await Transaction.getAll(req.user.tenant_id);
    res.json(transactions);
  } catch (error) {
    console.error('Get all transactions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id, req.user.tenant_id);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json(transaction);
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getSummary = async (req, res) => {
  try {
    const summary = await Transaction.getSummary(req.user.tenant_id);
    res.json(summary);
  } catch (error) {
    console.error('Get transaction summary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getTransactionsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }
    const transactions = await Transaction.getByDateRange(startDate, endDate, req.user.tenant_id);
    res.json(transactions);
  } catch (error) {
    console.error('Get transactions by date range error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getTransactionsByReference = async (req, res) => {
  try {
    const { referenceType, referenceId } = req.params;
    const transactions = await Transaction.getByReference(referenceType, referenceId, req.user.tenant_id);
    res.json(transactions);
  } catch (error) {
    console.error('Get transactions by reference error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.createTransaction = async (req, res) => {
  try {
    const { transaction_type, reference_type, reference_id, amount, payment_method, transaction_date, notes } = req.body;

    if (!transaction_type || !amount) {
      return res.status(400).json({ error: 'Transaction type and amount are required' });
    }

    const transactionId = await Transaction.create({
      transaction_type,
      reference_type: reference_type || null,
      reference_id: reference_id || null,
      amount,
      payment_method: payment_method || 'cash',
      transaction_date: transaction_date || new Date(),
      notes: notes || null,
      user_id: req.user.id,
      tenant_id: req.user.tenant_id
    });

    res.status(201).json({ message: 'Transaction created successfully', transactionId });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteTransaction = async (req, res) => {
  try {
    await Transaction.delete(req.params.id, req.user.tenant_id);
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
