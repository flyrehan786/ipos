const express = require('express');
const router = express.Router();
const superAdminController = require('../controllers/superAdminController');
const contactController = require('../controllers/contactController');
const authenticateToken = require('../middleware/auth');
const { requireSuperAdmin } = require('../middleware/auth');

// Every route here requires a valid token AND the super_admin role.
router.use(authenticateToken, requireSuperAdmin);

router.get('/stats', superAdminController.getStats);

router.get('/tenants', superAdminController.getTenants);
router.get('/tenants/:id', superAdminController.getTenantById);
router.post('/tenants', superAdminController.createTenant);
router.put('/tenants/:id', superAdminController.updateTenant);
router.put('/tenants/:id/status', superAdminController.updateTenantStatus);

router.get('/users', superAdminController.getUsers);
router.put('/users/:id/status', superAdminController.updateUserStatus);
router.post('/users/bulk-status', superAdminController.bulkUpdateUserStatus);
router.delete('/users/:id', superAdminController.deleteUser);

router.get('/contact-messages', contactController.getMessages);
router.put('/contact-messages/:id/status', contactController.updateMessageStatus);
router.delete('/contact-messages/:id', contactController.deleteMessage);

module.exports = router;
