const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const authenticateToken = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { clientSchema } = require('../middleware/validationSchemas');

router.get('/', authenticateToken, clientController.getAllClients);
router.get('/search', authenticateToken, clientController.searchClients);
router.get('/:id', authenticateToken, clientController.getClientById);
router.post('/', authenticateToken, validate(clientSchema), clientController.createClient);
router.put('/:id', authenticateToken, validate(clientSchema), clientController.updateClient);
router.delete('/:id', authenticateToken, clientController.deleteClient);

module.exports = router;
