const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const authenticateToken = require('../middleware/auth');

router.get('/', authenticateToken, transactionController.getAllTransactions);
router.get('/date-range', authenticateToken, transactionController.getTransactionsByDateRange);
router.get('/reference/:referenceType/:referenceId', authenticateToken, transactionController.getTransactionsByReference);
router.get('/:id', authenticateToken, transactionController.getTransactionById);
router.post('/', authenticateToken, transactionController.createTransaction);
router.delete('/:id', authenticateToken, transactionController.deleteTransaction);

module.exports = router;
