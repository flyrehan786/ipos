const express = require('express');
const router = express.Router();
const auditLogController = require('../controllers/auditLogController');
const authenticateToken = require('../middleware/auth');
const { authorizeRole } = require('../middleware/auth');

// Audit logs are restricted to administrators only.
router.get('/', authenticateToken, authorizeRole('admin'), auditLogController.getAuditLogs);

module.exports = router;
