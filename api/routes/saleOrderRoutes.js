const express = require('express');
const router = express.Router();
const saleOrderController = require('../controllers/saleOrderController');
const authenticateToken = require('../middleware/auth');
const { requireTenantAdmin } = require('../middleware/auth');

router.get('/', authenticateToken, saleOrderController.getAllSaleOrders);
router.get('/export', authenticateToken, saleOrderController.exportSaleOrders);
router.get('/date-range', authenticateToken, saleOrderController.getSaleOrdersByDateRange);
router.get('/:id', authenticateToken, saleOrderController.getSaleOrderById);
router.post('/', authenticateToken, saleOrderController.createSaleOrder);
router.post('/bulk-status', authenticateToken, requireTenantAdmin, saleOrderController.bulkUpdateSaleOrderStatus);
router.put('/:id', authenticateToken, requireTenantAdmin, saleOrderController.updateSaleOrder);
router.post('/:id/payment', authenticateToken, saleOrderController.addPayment);
router.delete('/:id', authenticateToken, requireTenantAdmin, saleOrderController.deleteSaleOrder);

module.exports = router;
