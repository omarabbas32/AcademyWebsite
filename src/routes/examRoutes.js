const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController.js');
const { requireAdmin, requireStudent } = require('../middleware/auth.js');

// ==================== ADMIN ROUTES ====================

// Create exam (Admin only)
router.post('/', requireAdmin, examController.createExam);

// Get all exams (Admin only)
router.get('/admin/all', requireAdmin, examController.getAllExams);

// Update exam (Admin only)
router.put('/:id', requireAdmin, examController.updateExam);

// Toggle publish status (Admin only)
router.patch('/:id/publish', requireAdmin, examController.togglePublishExam);

// Delete exam (Admin only)
router.delete('/:id', requireAdmin, examController.deleteExam);

// Get all submissions (Admin only)
router.get('/admin/submissions', requireAdmin, examController.getAllSubmissions);

// ==================== USER/STUDENT ROUTES ====================

// Get published exams (Student only)
router.get('/published', requireStudent, examController.getPublishedExams);

// Get single published exam (Student only)
router.get('/published/:id', requireStudent, examController.getPublishedExamById);

// Submit exam answers (Student only)
router.post('/:id/submit', requireStudent, examController.submitExam);

// Get user's own submissions (Student only)
router.get('/submissions/me', requireStudent, examController.getMySubmissions);

// ==================== PRIVATE EXAM ROUTES (No Auth Required) ====================

// Get exam by access token (public)
router.get('/public/:token', examController.getExamByToken);

// Submit private exam answers (public)
router.post('/public/:token/submit', examController.submitPrivateExam);

// Generate private link for exam (Admin only)
router.post('/:id/generate-link', requireAdmin, examController.generatePrivateLink);

module.exports = router;
