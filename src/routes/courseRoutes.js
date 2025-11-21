const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController.js');
const { requireAdmin, requireUser } = require('../middleware/auth.js');
const { upload, uploadToCloudinary, handleMulterError } = require('../middleware/upload.js');

// Enrollment routes - MUST BE BEFORE /:id
router.get('/enrollments/my-courses',
    requireUser,
    courseController.getMyEnrolledCourses
);

router.post('/:id/enroll',
    requireUser,
    courseController.enrollInCourse
);

router.delete('/:id/unenroll',
    requireUser,
    courseController.unenrollFromCourse
);

// Public route - get all courses
router.get('/', courseController.getAllCourses);

// Public route - get single course (Generic route must be last)
router.get('/:id', courseController.getCourseById);

// Protected routes - require admin authentication
router.post('/',
    requireAdmin,
    upload.single('image'),
    handleMulterError,
    uploadToCloudinary,
    courseController.createCourse
);

router.put('/:id',
    requireAdmin,
    upload.single('image'),
    handleMulterError,
    uploadToCloudinary,
    courseController.updateCourse
);

router.delete('/:id',
    requireAdmin,
    courseController.deleteCourse
);

module.exports = router;
