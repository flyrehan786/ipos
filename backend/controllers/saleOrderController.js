const SaleOrder = require('../models/SaleOrder');
const Transaction = require('../models/Transaction');

exports.getAllSaleOrders = async (req, res) => {
  try {
    const orders = await SaleOrder.getAll();
    res.json(orders);
  } catch (error) {
    console.error('Get all sale orders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getSaleOrderById = async (req, res) => {
  try {
    const order = await SaleOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Sale order not found' });
    }
    res.json(order);
  } catch (error) {
    console.error('Get sale order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getSaleOrdersByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }
    const orders = await SaleOrder.getByDateRange(startDate, endDate);
    res.json(orders);
  } catch (error) {
    console.error('Get sale orders by date range error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.createSaleOrder = async (req, res) => {
  try {
    const { order_number, client_id, order_date, items, subtotal, discount_type, discount_value, tax_rate, tax_amount, total_amount, paid_amount, payment_method, payment_status, status, notes } = req.body;

    if (!order_number || !items || items.length === 0) {
      return res.status(400).json({ error: 'Order number and items are required' });
    }

    const orderId = await SaleOrder.create({
      order_number,
      client_id: client_id || null,
      user_id: req.user.id,
      order_date: order_date || new Date(),
      items,
      subtotal: subtotal || 0,
      discount_type: discount_type || 'none',
      discount_value: discount_value || 0,
      tax_rate: tax_rate || 0,
      tax_amount: tax_amount || 0,
      total_amount: total_amount || 0,
      paid_amount: paid_amount || 0,
      payment_status: payment_status || 'unpaid',
      status: status || 'completed',
      notes: notes || null
    });

    if (paid_amount > 0) {
      await Transaction.create({
        transaction_type: 'income',
        reference_type: 'sale_order',
        reference_id: orderId,
        amount: paid_amount,
        payment_method: payment_method || 'cash',
        transaction_date: new Date(),
        notes: `Payment for sale order ${order_number}`,
        user_id: req.user.id
      });
    }

    res.status(201).json({ message: 'Sale order created successfully', orderId });
  } catch (error) {
    console.error('Create sale order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateSaleOrder = async (req, res) => {
  try {
    const { client_id, order_date, subtotal, discount_type, discount_value, tax_rate, tax_amount, total_amount, paid_amount, payment_status, status, notes } = req.body;

    await SaleOrder.update(req.params.id, {
      client_id: client_id || null,
      order_date: order_date || new Date(),
      subtotal: subtotal || 0,
      discount_type: discount_type || 'none',
      discount_value: discount_value || 0,
      tax_rate: tax_rate || 0,
      tax_amount: tax_amount || 0,
      total_amount: total_amount || 0,
      paid_amount: paid_amount || 0,
      payment_status: payment_status || 'unpaid',
      status: status || 'completed',
      notes: notes || null
    });

    res.json({ message: 'Sale order updated successfully' });
  } catch (error) {
    console.error('Update sale order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.addPayment = async (req, res) => {
  try {
    const { amount, payment_method } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid payment amount is required' });
    }

    const order = await SaleOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Sale order not found' });
    }

    const newPaidAmount = parseFloat(order.paid_amount) + parseFloat(amount);
    const paymentStatus = newPaidAmount >= order.total_amount ? 'paid' : 'partial';

    await SaleOrder.updatePayment(req.params.id, newPaidAmount, paymentStatus);

    await Transaction.create({
      transaction_type: 'income',
      reference_type: 'sale_order',
      reference_id: req.params.id,
      amount: amount,
      payment_method: payment_method || 'cash',
      transaction_date: new Date(),
      notes: `Payment for sale order ${order.order_number}`,
      user_id: req.user.id
    });

    res.json({ message: 'Payment added successfully' });
  } catch (error) {
    console.error('Add payment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteSaleOrder = async (req, res) => {
  try {
    await SaleOrder.delete(req.params.id);
    res.json({ message: 'Sale order deleted successfully' });
  } catch (error) {
    console.error('Delete sale order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
