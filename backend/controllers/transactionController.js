const Transaction = require('../models/Transaction');

exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.getAll();
    res.json(transactions);
  } catch (error) {
    console.error('Get all transactions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json(transaction);
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getTransactionsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }
    const transactions = await Transaction.getByDateRange(startDate, endDate);
    res.json(transactions);
  } catch (error) {
    console.error('Get transactions by date range error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getTransactionsByReference = async (req, res) => {
  try {
    const { referenceType, referenceId } = req.params;
    const transactions = await Transaction.getByReference(referenceType, referenceId);
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
      user_id: req.user.id
    });

    res.status(201).json({ message: 'Transaction created successfully', transactionId });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteTransaction = async (req, res) => {
  try {
    await Transaction.delete(req.params.id);
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
