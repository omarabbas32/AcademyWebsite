const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController.js');
const { requireAdmin, requireUser, requireAuth } = require('../middleware/auth.js');

// ==================== ADMIN ROUTES ====================
router.post('/admin/login', authController.adminLogin);
router.post('/admin/logout', requireAdmin, authController.adminLogout);

// Admin user management
router.post('/admin/users', requireAdmin, authController.createUserByAdmin);
router.get('/admin/users', requireAdmin, authController.getAllUsers);

// ==================== USER/STUDENT ROUTES ====================
router.post('/register', authController.register);
router.post('/login', authController.userLogin);
router.post('/logout', requireAuth, authController.userLogout);
router.get('/me', requireAuth, authController.getCurrentUser);

module.exports = router;
