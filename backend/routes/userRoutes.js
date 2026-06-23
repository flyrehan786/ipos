const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateToken = require('../middleware/auth');
const { authorizeRole } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { userCreateSchema, userUpdateSchema } = require('../middleware/validationSchemas');

// User management is restricted to administrators only.
router.get('/', authenticateToken, authorizeRole('admin'), userController.getAllUsers);
router.get('/:id', authenticateToken, authorizeRole('admin'), userController.getUserById);
router.post('/', authenticateToken, authorizeRole('admin'), validate(userCreateSchema), userController.createUser);
router.post('/bulk-delete', authenticateToken, authorizeRole('admin'), userController.bulkDeleteUsers);
router.post('/bulk-status', authenticateToken, authorizeRole('admin'), userController.bulkUpdateUserStatus);
router.put('/:id', authenticateToken, authorizeRole('admin'), validate(userUpdateSchema), userController.updateUser);
router.put('/:id/change-password', authenticateToken, authorizeRole('admin'), userController.changePassword);
router.delete('/:id', authenticateToken, authorizeRole('admin'), userController.deleteUser);

module.exports = router;
