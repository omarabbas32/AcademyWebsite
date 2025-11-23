const Course = require('../models/courseModel.js');
const Enrollment = require('../models/enrollmentModel.js');
const EnrollmentRequest = require('../models/enrollmentRequestModel.js');
const User = require('../models/userModel.js');

// ==================== COURSE CRUD ====================

// CREATE a new course
exports.createCourse = async (req, res) => {
    try {
        const imagePath = req.file ? req.file.path : req.body.imagePath;
        const course = new Course({
            name: req.body.name,
            description: req.body.description,
            duration: req.body.duration,
            instructor: req.body.instructor,
            imagePath,
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
        if (!course) return res.status(404).json({ message: 'Course not found' });
        res.status(200).json(course);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// UPDATE a course by ID
exports.updateCourse = async (req, res) => {
    try {
        const updateData = { ...req.body };
        if (req.file) updateData.imagePath = req.file.path;
        const updatedCourse = await Course.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
        if (!updatedCourse) return res.status(404).json({ message: 'Course not found' });
        res.status(200).json(updatedCourse);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// DELETE a course by ID
exports.deleteCourse = async (req, res) => {
    try {
        const course = await Course.findByIdAndDelete(req.params.id);
        if (!course) return res.status(404).json({ message: 'Course not found' });
        res.status(200).json({ message: 'Course deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ==================== ENROLLMENT REQUESTS ====================

// USER: request enrollment with payment proof (photo)
exports.requestEnrollment = async (req, res) => {
    try {
        const courseId = req.params.id;
        const userId = req.session.userId;
        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: 'Course not found' });
        const existingEnrollment = await Enrollment.findOne({ user: userId, course: courseId, status: 'active' });
        if (existingEnrollment) return res.status(400).json({ message: 'Already enrolled in this course' });
        const existingRequest = await EnrollmentRequest.findOne({ user: userId, course: courseId, status: 'pending' });
        if (existingRequest) return res.status(400).json({ message: 'You already have a pending enrollment request for this course' });
        if (!req.file) return res.status(400).json({ message: 'Payment proof image is required' });
        const enrollmentRequest = await EnrollmentRequest.create({
            user: userId,
            course: courseId,
            paymentProofUrl: req.file.path,
            message: req.body.message || '',
            status: 'pending'
        });
        res.status(201).json({ message: 'Enrollment request submitted successfully. Please wait for admin approval.', request: enrollmentRequest });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// USER: get enrollment status for a specific course
exports.getEnrollmentStatus = async (req, res) => {
    try {
        const courseId = req.params.id;
        const userId = req.session.userId;
        const enrollment = await Enrollment.findOne({ user: userId, course: courseId, status: 'active' });
        if (enrollment) return res.json({ status: 'enrolled', enrollment });
        const request = await EnrollmentRequest.findOne({ user: userId, course: courseId }).sort({ createdAt: -1 });
        if (request) return res.json({ status: request.status, request });
        res.json({ status: 'not_requested' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ADMIN: view pending enrollment requests for a specific course
exports.getEnrollmentRequestsForCourse = async (req, res) => {
    try {
        if (req.session.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
        const courseId = req.params.id;
        const requests = await EnrollmentRequest.find({ course: courseId, status: 'pending' })
            .populate('user', 'name email')
            .sort({ createdAt: -1 });
        res.status(200).json(requests);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ADMIN: approve enrollment request
exports.approveEnrollmentRequest = async (req, res) => {
    try {
        if (req.session.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
        const requestId = req.params.id;
        const enrollmentRequest = await EnrollmentRequest.findById(requestId);
        if (!enrollmentRequest) return res.status(404).json({ message: 'Enrollment request not found' });
        if (enrollmentRequest.status !== 'pending') return res.status(400).json({ message: 'This request has already been processed' });
        const enrollment = await Enrollment.create({ user: enrollmentRequest.user, course: enrollmentRequest.course, status: 'active' });
        await User.findByIdAndUpdate(enrollmentRequest.user, { role: 'student' });
        enrollmentRequest.status = 'approved';
        enrollmentRequest.adminNote = req.body.adminNote || '';
        await enrollmentRequest.save();
        res.json({ message: 'Enrollment request approved', enrollment, request: enrollmentRequest });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ADMIN: reject enrollment request
exports.rejectEnrollmentRequest = async (req, res) => {
    try {
        if (req.session.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
        const requestId = req.params.id;
        const enrollmentRequest = await EnrollmentRequest.findById(requestId);
        if (!enrollmentRequest) return res.status(404).json({ message: 'Enrollment request not found' });
        if (enrollmentRequest.status !== 'pending') return res.status(400).json({ message: 'This request has already been processed' });
        enrollmentRequest.status = 'rejected';
        enrollmentRequest.adminNote = req.body.adminNote || 'Request rejected';
        await enrollmentRequest.save();
        res.json({ message: 'Enrollment request rejected', request: enrollmentRequest });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ==================== ENROLLMENT MANAGEMENT (existing) ====================

// USER: unenroll from a course
exports.unenrollFromCourse = async (req, res) => {
    try {
        const courseId = req.params.id;
        const userId = req.session.userId;
        const enrollment = await Enrollment.findOneAndUpdate({ user: userId, course: courseId }, { status: 'cancelled' }, { new: true });
        if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' });
        res.json({ message: 'Successfully unenrolled from course', enrollment });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// USER: get all enrolled courses for current user
exports.getMyEnrolledCourses = async (req, res) => {
    try {
        const userId = req.session.userId;
        const enrollments = await Enrollment.find({ user: userId, status: 'active' }).populate('course');
        const courses = enrollments.map(e => e.course);
        res.json(courses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
