const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authenticateToken = require('../middleware/auth');
const { requireTenantAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { productSchema } = require('../middleware/validationSchemas');

router.get('/', authenticateToken, productController.getAllProducts);
router.get('/export', authenticateToken, productController.exportProducts);
router.get('/search', authenticateToken, productController.searchProducts);
router.get('/low-stock', authenticateToken, productController.getLowStockProducts);
router.get('/barcode/:barcode', authenticateToken, productController.getProductByBarcode);
router.get('/:id', authenticateToken, productController.getProductById);
router.post('/', authenticateToken, validate(productSchema), productController.createProduct);
router.post('/bulk-delete', authenticateToken, requireTenantAdmin, productController.bulkDeleteProducts);
router.post('/bulk-status', authenticateToken, requireTenantAdmin, productController.bulkUpdateProductStatus);
router.put('/:id', authenticateToken, requireTenantAdmin, validate(productSchema), productController.updateProduct);
router.delete('/:id', authenticateToken, requireTenantAdmin, productController.deleteProduct);

module.exports = router;
