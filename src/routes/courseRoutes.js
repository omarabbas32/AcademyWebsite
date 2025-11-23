const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController.js');
const { requireAdmin, requireUser } = require('../middleware/auth.js');
const { upload, uploadToCloudinary, handleMulterError } = require('../middleware/upload.js');

// Public routes - anyone can view courses
router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourseById);

// Admin routes - manage courses
router.post('/', requireAdmin, upload.single('image'), uploadToCloudinary, handleMulterError, courseController.createCourse);
router.put('/:id', requireAdmin, upload.single('image'), uploadToCloudinary, handleMulterError, courseController.updateCourse);
router.delete('/:id', requireAdmin, courseController.deleteCourse);

// Admin routes - manage enrollment requests
router.get('/admin/enrollment-requests', requireAdmin, courseController.getAllEnrollmentRequests);
router.post('/admin/enrollment-requests/:id/approve', requireAdmin, courseController.approveEnrollmentRequest);
router.post('/admin/enrollment-requests/:id/reject', requireAdmin, courseController.rejectEnrollmentRequest);

// User routes - enrollment requests with payment proof
router.post('/:id/request-enrollment', requireUser, upload.single('paymentProof'), uploadToCloudinary, handleMulterError, courseController.requestEnrollment);
router.get('/:id/enrollment-status', requireUser, courseController.getEnrollmentStatus);

// User routes - manage enrollments
router.get('/enrollments/my-courses', requireUser, courseController.getMyEnrolledCourses);
router.post('/:id/unenroll', requireUser, courseController.unenrollFromCourse);

module.exports = router;
