const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController.js');
const { requireAdmin, requireUser } = require('../middleware/auth.js');
const { upload, uploadToCloudinary, handleMulterError } = require('../middleware/upload.js');

// ----- User routes -----
// Get user's enrolled courses
router.get('/enrollments/my-courses', requireUser, courseController.getMyEnrolledCourses);

// Request enrollment with payment proof (photo)
router.post('/:id/request-enrollment', requireUser, upload.single('paymentProof'), uploadToCloudinary, handleMulterError, courseController.requestEnrollment);
router.get('/:id/enrollment-status', requireUser, courseController.getEnrollmentStatus);
router.post('/:id/unenroll', requireUser, courseController.unenrollFromCourse);

// ----- Admin routes -----
// Manage courses (CRUD)
router.post('/', requireAdmin, upload.single('image'), uploadToCloudinary, handleMulterError, courseController.createCourse);
router.put('/:id', requireAdmin, upload.single('image'), uploadToCloudinary, handleMulterError, courseController.updateCourse);
router.delete('/:id', requireAdmin, courseController.deleteCourse);

// Admin: view enrollment requests for a specific course
router.get('/:id/enrollment-requests', requireAdmin, courseController.getEnrollmentRequestsForCourse);
// Admin: approve/reject enrollment requests (by request ID)
router.post('/admin/enrollment-requests/:id/approve', requireAdmin, courseController.approveEnrollmentRequest);
router.post('/admin/enrollment-requests/:id/reject', requireAdmin, courseController.rejectEnrollmentRequest);

// ----- Public routes -----
router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourseById);

module.exports = router;
