const PurchaseOrder = require('../models/PurchaseOrder');
const Transaction = require('../models/Transaction');

exports.getAllPurchaseOrders = async (req, res) => {
  try {
    const orders = await PurchaseOrder.getAll();
    res.json(orders);
  } catch (error) {
    console.error('Get all purchase orders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getPurchaseOrderById = async (req, res) => {
  try {
    const order = await PurchaseOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }
    res.json(order);
  } catch (error) {
    console.error('Get purchase order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getPurchaseOrdersByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }
    const orders = await PurchaseOrder.getByDateRange(startDate, endDate);
    res.json(orders);
  } catch (error) {
    console.error('Get purchase orders by date range error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.createPurchaseOrder = async (req, res) => {
  try {
    const { order_number, supplier_name, order_date, items, subtotal, discount_type, discount_value, tax_rate, tax_amount, total_amount, paid_amount, payment_method, payment_status, status, notes } = req.body;

    if (!order_number || !supplier_name || !items || items.length === 0) {
      return res.status(400).json({ error: 'Order number, supplier name, and items are required' });
    }

    const orderId = await PurchaseOrder.create({
      order_number,
      supplier_name,
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
        transaction_type: 'expense',
        reference_type: 'purchase_order',
        reference_id: orderId,
        amount: paid_amount,
        payment_method: payment_method || 'cash',
        transaction_date: new Date(),
        notes: `Payment for purchase order ${order_number}`,
        user_id: req.user.id
      });
    }

    res.status(201).json({ message: 'Purchase order created successfully', orderId });
  } catch (error) {
    console.error('Create purchase order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updatePurchaseOrder = async (req, res) => {
  try {
    const { supplier_name, order_date, subtotal, discount_type, discount_value, tax_rate, tax_amount, total_amount, paid_amount, payment_status, status, notes } = req.body;

    await PurchaseOrder.update(req.params.id, {
      supplier_name,
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

    res.json({ message: 'Purchase order updated successfully' });
  } catch (error) {
    console.error('Update purchase order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.addPayment = async (req, res) => {
  try {
    const { amount, payment_method } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid payment amount is required' });
    }

    const order = await PurchaseOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }

    const newPaidAmount = parseFloat(order.paid_amount) + parseFloat(amount);
    const paymentStatus = newPaidAmount >= order.total_amount ? 'paid' : 'partial';

    await PurchaseOrder.updatePayment(req.params.id, newPaidAmount, paymentStatus);

    await Transaction.create({
      transaction_type: 'expense',
      reference_type: 'purchase_order',
      reference_id: req.params.id,
      amount: amount,
      payment_method: payment_method || 'cash',
      transaction_date: new Date(),
      notes: `Payment for purchase order ${order.order_number}`,
      user_id: req.user.id
    });

    res.json({ message: 'Payment added successfully' });
  } catch (error) {
    console.error('Add payment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deletePurchaseOrder = async (req, res) => {
  try {
    await PurchaseOrder.delete(req.params.id);
    res.json({ message: 'Purchase order deleted successfully' });
  } catch (error) {
    console.error('Delete purchase order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
