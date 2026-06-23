const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticateToken = require('../middleware/auth');
const { authorizeRole } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { registerSchema } = require('../middleware/validationSchemas');

router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
// Registration creates privileged accounts; restrict to authenticated admins
// (no public self-service signup in this internal POS tool).
router.post('/register', authenticateToken, authorizeRole('admin'), validate(registerSchema), authController.register);
router.get('/profile', authenticateToken, authController.getProfile);
router.post('/change-password', authenticateToken, authController.changePassword);

module.exports = router;
