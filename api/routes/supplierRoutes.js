const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const authenticateToken = require('../middleware/auth');
const { requireTenantAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { supplierSchema } = require('../middleware/validationSchemas');

router.get('/', authenticateToken, supplierController.getAllSuppliers);
router.get('/export', authenticateToken, supplierController.exportSuppliers);
router.get('/search', authenticateToken, supplierController.searchSuppliers);
router.get('/:id', authenticateToken, supplierController.getSupplierById);
router.post('/', authenticateToken, validate(supplierSchema), supplierController.createSupplier);
router.post('/bulk-delete', authenticateToken, requireTenantAdmin, supplierController.bulkDeleteSuppliers);
router.post('/bulk-status', authenticateToken, requireTenantAdmin, supplierController.bulkUpdateSupplierStatus);
router.put('/:id', authenticateToken, requireTenantAdmin, validate(supplierSchema), supplierController.updateSupplier);
router.delete('/:id', authenticateToken, requireTenantAdmin, supplierController.deleteSupplier);

module.exports = router;
