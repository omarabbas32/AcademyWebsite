const Course = require('../models/courseModel.js');

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

// ==================== ENROLLMENT ENDPOINTS ====================

const Enrollment = require('../models/enrollmentModel.js');

// ENROLL in a course (User only - converts to student)
exports.enrollInCourse = async (req, res) => {
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
            course: courseId
        });

        if (existingEnrollment) {
            return res.status(400).json({ message: 'Already enrolled in this course' });
        }

        // Create enrollment
        const enrollment = await Enrollment.create({
            user: userId,
            course: courseId,
            status: 'active'
        });

        // Update user role to student if they're just a user
        const User = require('../models/userModel.js');
        await User.findByIdAndUpdate(userId, { role: 'student' });
        req.session.role = 'student'; // Update session

        res.status(201).json({
            message: 'Successfully enrolled in course. You are now a student!',
            enrollment
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

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
