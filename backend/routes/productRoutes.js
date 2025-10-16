const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authenticateToken = require('../middleware/auth');

router.get('/', authenticateToken, productController.getAllProducts);
router.get('/search', authenticateToken, productController.searchProducts);
router.get('/low-stock', authenticateToken, productController.getLowStockProducts);
router.get('/barcode/:barcode', authenticateToken, productController.getProductByBarcode);
router.get('/:id', authenticateToken, productController.getProductById);
router.post('/', authenticateToken, productController.createProduct);
router.put('/:id', authenticateToken, productController.updateProduct);
router.delete('/:id', authenticateToken, productController.deleteProduct);

module.exports = router;
