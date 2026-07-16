const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const authenticateToken = require('../middleware/auth');
const { requireTenantAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { clientSchema } = require('../middleware/validationSchemas');

router.get('/', authenticateToken, clientController.getAllClients);
router.get('/export', authenticateToken, clientController.exportClients);
router.get('/search', authenticateToken, clientController.searchClients);
router.get('/:id', authenticateToken, clientController.getClientById);
router.post('/', authenticateToken, validate(clientSchema), clientController.createClient);
router.post('/bulk-delete', authenticateToken, requireTenantAdmin, clientController.bulkDeleteClients);
router.post('/bulk-status', authenticateToken, requireTenantAdmin, clientController.bulkUpdateClientStatus);
router.put('/:id', authenticateToken, requireTenantAdmin, validate(clientSchema), clientController.updateClient);
router.delete('/:id', authenticateToken, requireTenantAdmin, clientController.deleteClient);

module.exports = router;
