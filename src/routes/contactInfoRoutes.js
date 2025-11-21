const express = require('express');
const router = express.Router();
const contactInfoController = require('../controllers/contactInfoController');

// GET the contact info
router.get('/', contactInfoController.getContactInfo);

// POST (Create or Update) the contact info
router.post('/', contactInfoController.createOrUpdateContactInfo);

// DELETE the contact info
router.delete('/', contactInfoController.deleteContactInfo);

module.exports = router;
