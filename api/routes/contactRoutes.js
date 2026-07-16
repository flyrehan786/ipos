const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

// Public endpoint used by the marketing website's Contact Us form.
router.post('/', contactController.submitMessage);

module.exports = router;
