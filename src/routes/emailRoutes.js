const express = require('express');
const router = express.Router();
const { sendEmail, test } = require('../controllers/emailController');

// ✅ POST endpoint
router.post('/send', sendEmail);

// ✅ GET test endpoint
router.get('/test', test);

module.exports = router;
