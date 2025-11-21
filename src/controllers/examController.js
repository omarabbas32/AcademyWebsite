const Exam = require('../models/examModel.js');
const Submission = require('../models/submissionModel.js');
const User = require('../models/userModel.js');

// ==================== ADMIN ENDPOINTS ====================

// CREATE a new exam (Admin only)
exports.createExam = async (req, res) => {
    try {
        const { title, description, course, isPublished = false, questions = [], duration, passingScore } = req.body;

        if (!title || !questions.length) {
            return res.status(400).json({ message: 'Exam title and at least one question are required' });
        }

        const exam = await Exam.create({
            title,
            description,
            course,
            isPublished,
            questions,
            duration,
            passingScore: passingScore || 60
        });

        res.status(201).json({ message: 'Exam created successfully', exam });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET all exams (Admin only)
exports.getAllExams = async (req, res) => {
    try {
        const exams = await Exam.find()
            .populate('course', 'name')
            .sort({ createdAt: -1 });
        res.json(exams);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// UPDATE exam by ID (Admin only)
exports.updateExam = async (req, res) => {
    try {
        const updatedExam = await Exam.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('course', 'name');

        if (!updatedExam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        res.json({ message: 'Exam updated successfully', exam: updatedExam });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PUBLISH/UNPUBLISH exam (Admin only)
exports.togglePublishExam = async (req, res) => {
    try {
        const { isPublished = true } = req.body;
        const exam = await Exam.findByIdAndUpdate(
            req.params.id,
            { isPublished },
            { new: true }
        );

        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        res.json({
            message: `Exam ${isPublished ? 'published' : 'unpublished'} successfully`,
            exam
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// DELETE exam by ID (Admin only)
exports.deleteExam = async (req, res) => {
    try {
        const exam = await Exam.findByIdAndDelete(req.params.id);
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }
        res.json({ message: 'Exam deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET all submissions (Admin only)
exports.getAllSubmissions = async (req, res) => {
    try {
        const { examId } = req.query;
        const filter = examId ? { exam: examId } : {};

        const submissions = await Submission.find(filter)
            .populate('user', 'name email username')
            .populate('exam', 'title')
            .sort({ createdAt: -1 });

        res.json(submissions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ==================== USER/STUDENT ENDPOINTS ====================

// GET published exams (User/Student)
exports.getPublishedExams = async (req, res) => {
};

// GET single published exam by ID (User/Student)
exports.getPublishedExamById = async (req, res) => {
    try {
        const exam = await Exam.findOne({
            _id: req.params.id,
            isPublished: true
        }).populate('course', 'name instructor');

        if (!exam) {
            return res.status(404).json({ message: 'Exam not found or not published' });
        }

        res.json({
            id: exam._id,
            title: exam.title,
            description: exam.description,
            course: exam.course,
            duration: exam.duration,
            questions: exam.questions.map(q => ({
                prompt: q.prompt,
                options: q.options
            }))
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// SUBMIT exam answers (User/Student)
exports.submitExam = async (req, res) => {
    try {
        const exam = await Exam.findOne({
            _id: req.params.id,
            isPublished: true
        });

        if (!exam) {
            return res.status(404).json({ message: 'Exam not found or not published' });
        }

        const { answers = [] } = req.body;

        if (!Array.isArray(answers) || answers.length !== exam.questions.length) {
            return res.status(400).json({
                message: 'Answers must be provided for every question'
            });
        }

        // Calculate score
        let score = 0;
        answers.forEach((selectedIndex, idx) => {
            if (exam.questions[idx].correctIndex === selectedIndex) {
                score += 1;
            }
        });

        const total = exam.questions.length;
        const percentage = Math.round((score / total) * 100);
        const passed = percentage >= (exam.passingScore || 60);

        // Create submission
        const submission = await Submission.create({
            user: req.session.userId,
            exam: exam._id,
            answers: answers.map((selectedIndex, idx) => ({
                questionIndex: idx,
                selectedIndex
            })),
            score,
            total,
            percentage,
            passed
        });

        res.status(201).json({
            message: 'Exam submitted successfully',
            score,
            total,
            percentage,
            passed,
            submissionId: submission._id
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET user's own submissions (User/Student)
exports.getMySubmissions = async (req, res) => {
    try {
        const submissions = await Submission.find({ user: req.session.userId })
            .populate('exam', 'title')
            .sort({ createdAt: -1 });

        const safeSubmissions = submissions.map(sub => ({
            id: sub._id,
            examTitle: sub.exam?.title ?? 'Exam',
            score: sub.score,
            total: sub.total,
            percentage: sub.percentage,
            passed: sub.passed,
            submittedAt: sub.createdAt
        }));

        res.json(safeSubmissions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ==================== PRIVATE EXAM ENDPOINTS ====================

const crypto = require('crypto');

// GENERATE private link for exam (Admin only)
exports.generatePrivateLink = async (req, res) => {
    try {
        const examId = req.params.id;
        const { allowAnonymous = true } = req.body;

        const exam = await Exam.findById(examId);
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        // Generate unique access token
        const accessToken = crypto.randomBytes(32).toString('hex');

        // Update exam
        exam.isPrivate = true;
        exam.accessToken = accessToken;
        exam.allowAnonymous = allowAnonymous;
        await exam.save();

        const privateLink = `${req.protocol}://${req.get('host')}/take-exam.html?token=${accessToken}`;

        res.json({
            message: 'Private link generated successfully',
            privateLink,
            accessToken
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET exam by access token (Public - no auth)
exports.getExamByToken = async (req, res) => {
    try {
        const { token } = req.params;

        exports.submitPrivateExam = async (req, res) => {
            try {
                const { token } = req.params;
                const { answers = [], userName, userEmail } = req.body;

                const exam = await Exam.findOne({ accessToken: token, isPrivate: true });

                if (!exam) {
                    return res.status(404).json({ message: 'Invalid or expired exam link' });
                }

                if (!Array.isArray(answers) || answers.length !== exam.questions.length) {
                    return res.status(400).json({
                        message: 'Answers must be provided for every question'
                    });
                }

                // Calculate score
                let score = 0;
                answers.forEach((selectedIndex, idx) => {
                    if (exam.questions[idx].correctIndex === selectedIndex) {
                        score += 1;
                    }
                });

                const total = exam.questions.length;
                const percentage = Math.round((score / total) * 100);
                const passed = percentage >= (exam.passingScore || 60);

                // For anonymous submissions, create a temporary user or store differently
                let submissionData = {
                    exam: exam._id,
                    answers: answers.map((selectedIndex, idx) => ({
                        questionIndex: idx,
                        selectedIndex
                    })),
                    score,
                    total,
                    percentage,
                    passed
                };

                // If anonymous allowed and no user session, store with provided info
                if (exam.allowAnonymous && !req.session?.userId) {
                    // Create anonymous submission (you might want to extend Submission model)
                    submissionData.user = null; // Or create anonymous user
                    submissionData.anonymousName = userName;
                    submissionData.anonymousEmail = userEmail;
                } else if (req.session?.userId) {
                    submissionData.user = req.session.userId;
                } else {
                    return res.status(401).json({ message: 'Authentication required for this exam' });
                }

                const submission = await Submission.create(submissionData);

                res.status(201).json({
                    message: 'Exam submitted successfully',
                    score,
                    total,
                    percentage,
                    passed,
                    submissionId: submission._id
                });
            } catch (err) {
                res.status(500).json({ message: err.message });
            }
        };
