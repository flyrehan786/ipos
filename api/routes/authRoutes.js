const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticateToken = require('../middleware/auth');
const { authorizeRole } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { registerSchema, signupSchema } = require('../middleware/validationSchemas');

router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
// Public self-service signup: open (no auth) but always creates a
// non-privileged 'cashier' account; role is assigned server-side.
router.post('/signup', validate(signupSchema), authController.signup);
// Registration creates privileged accounts; restrict to authenticated admins
// (no public self-service signup in this internal POS tool).
router.post('/register', authenticateToken, authorizeRole('admin'), validate(registerSchema), authController.register);
router.get('/profile', authenticateToken, authController.getProfile);
router.post('/change-password', authenticateToken, authController.changePassword);

module.exports = router;
