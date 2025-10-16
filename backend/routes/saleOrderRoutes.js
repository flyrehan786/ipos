const express = require('express');
const router = express.Router();
const saleOrderController = require('../controllers/saleOrderController');
const authenticateToken = require('../middleware/auth');

router.get('/', authenticateToken, saleOrderController.getAllSaleOrders);
router.get('/date-range', authenticateToken, saleOrderController.getSaleOrdersByDateRange);
router.get('/:id', authenticateToken, saleOrderController.getSaleOrderById);
router.post('/', authenticateToken, saleOrderController.createSaleOrder);
router.put('/:id', authenticateToken, saleOrderController.updateSaleOrder);
router.post('/:id/payment', authenticateToken, saleOrderController.addPayment);
router.delete('/:id', authenticateToken, saleOrderController.deleteSaleOrder);

module.exports = router;
