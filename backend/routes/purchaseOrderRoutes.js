const express = require('express');
const router = express.Router();
const purchaseOrderController = require('../controllers/purchaseOrderController');
const authenticateToken = require('../middleware/auth');

router.get('/', authenticateToken, purchaseOrderController.getAllPurchaseOrders);
router.get('/export', authenticateToken, purchaseOrderController.exportPurchaseOrders);
router.get('/date-range', authenticateToken, purchaseOrderController.getPurchaseOrdersByDateRange);
router.get('/:id', authenticateToken, purchaseOrderController.getPurchaseOrderById);
router.post('/', authenticateToken, purchaseOrderController.createPurchaseOrder);
router.post('/bulk-status', authenticateToken, purchaseOrderController.bulkUpdatePurchaseOrderStatus);
router.put('/:id', authenticateToken, purchaseOrderController.updatePurchaseOrder);
router.post('/:id/payment', authenticateToken, purchaseOrderController.addPayment);
router.delete('/:id', authenticateToken, purchaseOrderController.deletePurchaseOrder);

module.exports = router;
