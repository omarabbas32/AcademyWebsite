const Course = require('../models/courseModel.js');
const Enrollment = require('../models/enrollmentModel.js');
const EnrollmentRequest = require('../models/enrollmentRequestModel.js');
const User = require('../models/userModel.js');

// CREATE a new course
exports.createCourse = async (req, res) => {
    try {
        // If file is uploaded, use Cloudinary URL, otherwise use provided imagePath
        const imagePath = req.file ? req.file.path : req.body.imagePath;

        const course = new Course({
            name: req.body.name,
            description: req.body.description,
            duration: req.body.duration,
            instructor: req.body.instructor,
            imagePath: imagePath,
            level: req.body.level || 'Beginner',
            prerequisites: req.body.prerequisites,
            syllabus: req.body.syllabus
        });

        const newCourse = await course.save();
        res.status(201).json(newCourse);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// GET all courses
exports.getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find().sort({ createdAt: -1 });
        res.status(200).json(courses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET a single course by ID
exports.getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.status(200).json(course);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// UPDATE a course by ID
exports.updateCourse = async (req, res) => {
    try {
        const updateData = { ...req.body };

        // If a new file is uploaded, use the Cloudinary URL
        if (req.file) {
            updateData.imagePath = req.file.path;
        }

        const updatedCourse = await Course.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedCourse) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.status(200).json(updatedCourse);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// DELETE a course by ID
exports.deleteCourse = async (req, res) => {
    try {
        const course = await Course.findByIdAndDelete(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.status(200).json({ message: 'Course deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ==================== ENROLLMENT REQUEST ENDPOINTS ====================

// REQUEST enrollment with payment proof (User only)
exports.requestEnrollment = async (req, res) => {
    try {
        const courseId = req.params.id;
        const userId = req.session.userId;

        // Check if course exists
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Check if already enrolled
        const existingEnrollment = await Enrollment.findOne({
            user: userId,
            course: courseId,
            status: 'active'
        });

        if (existingEnrollment) {
            return res.status(400).json({ message: 'Already enrolled in this course' });
        }

        // Check if already has pending request
        const existingRequest = await EnrollmentRequest.findOne({
            user: userId,
            course: courseId,
            status: 'pending'
        });

        if (existingRequest) {
            return res.status(400).json({ message: 'You already have a pending enrollment request for this course' });
        }

        // Payment proof is required
        if (!req.file) {
            return res.status(400).json({ message: 'Payment proof image is required' });
        }

        // Create enrollment request
        const enrollmentRequest = await EnrollmentRequest.create({
            user: userId,
            course: courseId,
            paymentProofUrl: req.file.path, // Cloudinary URL
            message: req.body.message || '',
            status: 'pending'
        });

        res.status(201).json({
            message: 'Enrollment request submitted successfully. Please wait for admin approval.',
            request: enrollmentRequest
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET enrollment status for a course (User)
exports.getEnrollmentStatus = async (req, res) => {
    try {
        const courseId = req.params.id;
        const userId = req.session.userId;

        // Check if enrolled
        const enrollment = await Enrollment.findOne({
            user: userId,
            course: courseId,
            status: 'active'
        });

        if (enrollment) {
            return res.json({ status: 'enrolled', enrollment });
        }

        // Check if has pending/rejected request
        const request = await EnrollmentRequest.findOne({
            user: userId,
            course: courseId
        }).sort({ createdAt: -1 });

        if (request) {
            return res.json({ status: request.status, request });
        }

        res.json({ status: 'not_requested' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET all enrollment requests (Admin only)
exports.getAllEnrollmentRequests = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = status ? { status } : {};

        const requests = await EnrollmentRequest.find(filter)
            .populate('user', 'name email username')
            .populate('course', 'name')
            .sort({ createdAt: -1 });

        res.json(requests);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// APPROVE enrollment request (Admin only)
exports.approveEnrollmentRequest = async (req, res) => {
    try {
        const requestId = req.params.id;

        const enrollmentRequest = await EnrollmentRequest.findById(requestId);
        if (!enrollmentRequest) {
            return res.status(404).json({ message: 'Enrollment request not found' });
        }

        if (enrollmentRequest.status !== 'pending') {
            return res.status(400).json({ message: 'This request has already been processed' });
        }

        // Create actual enrollment
        const enrollment = await Enrollment.create({
            user: enrollmentRequest.user,
            course: enrollmentRequest.course,
            status: 'active'
        });

        // Update user role to student if they're just a user
        await User.findByIdAndUpdate(enrollmentRequest.user, { role: 'student' });

        // Update request status
        enrollmentRequest.status = 'approved';
        enrollmentRequest.adminNote = req.body.adminNote || '';
        await enrollmentRequest.save();

        res.json({
            message: 'Enrollment request approved successfully',
            enrollment,
            request: enrollmentRequest
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// REJECT enrollment request (Admin only)
exports.rejectEnrollmentRequest = async (req, res) => {
    try {
        const requestId = req.params.id;

        const enrollmentRequest = await EnrollmentRequest.findById(requestId);
        if (!enrollmentRequest) {
            return res.status(404).json({ message: 'Enrollment request not found' });
        }

        if (enrollmentRequest.status !== 'pending') {
            return res.status(400).json({ message: 'This request has already been processed' });
        }

        // Update request status
        enrollmentRequest.status = 'rejected';
        enrollmentRequest.adminNote = req.body.adminNote || 'Request rejected';
        await enrollmentRequest.save();

        res.json({
            message: 'Enrollment request rejected',
            request: enrollmentRequest
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ==================== OLD ENROLLMENT ENDPOINTS (Keep for existing enrollments) ====================

// UNENROLL from a course
exports.unenrollFromCourse = async (req, res) => {
    try {
        const courseId = req.params.id;
        const userId = req.session.userId;

        const enrollment = await Enrollment.findOneAndUpdate(
            { user: userId, course: courseId },
            { status: 'cancelled' },
            { new: true }
        );

        if (!enrollment) {
            return res.status(404).json({ message: 'Enrollment not found' });
        }

        res.json({ message: 'Successfully unenrolled from course', enrollment });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET user's enrolled courses
exports.getMyEnrolledCourses = async (req, res) => {
    try {
        const userId = req.session.userId;

        const enrollments = await Enrollment.find({
            user: userId,
            status: 'active'
        }).populate('course');

        const courses = enrollments.map(e => e.course);

        res.json(courses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
