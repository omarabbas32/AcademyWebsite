const express = require('express');
const router = express.Router();
const offlineSiteController = require('../controllers/offlineSiteController.js');
const { requireAdmin } = require('../middleware/auth.js');

// Public route - get all active offline sites
router.get('/', offlineSiteController.getAllOfflineSites);

// Public route - get single offline site
router.get('/:id', offlineSiteController.getOfflineSiteById);

// Admin routes
router.get('/admin/all', requireAdmin, offlineSiteController.getAllOfflineSitesAdmin);

router.post('/',
    requireAdmin,
    offlineSiteController.createOfflineSite
);

router.put('/:id',
    requireAdmin,
    offlineSiteController.updateOfflineSite
);

router.delete('/:id',
    requireAdmin,
    offlineSiteController.deleteOfflineSite
);

module.exports = router;
