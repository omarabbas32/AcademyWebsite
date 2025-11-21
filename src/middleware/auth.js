// Session-based authentication middleware

const requireAdmin = (req, res, next) => {
    if (req.session?.role === 'admin') {
        return next();
    }
    return res.status(401).json({ message: 'Admin authentication required' });
};

const requireUser = (req, res, next) => {
    if (req.session?.role === 'user' || req.session?.role === 'student') {
        return next();
    }
    return res.status(401).json({ message: 'User authentication required' });
};

const requireStudent = (req, res, next) => {
    if (req.session?.role === 'student') {
        return next();
    }
    return res.status(401).json({ message: 'Student authentication required. Please enroll in courses to become a student.' });
};

const requireAuth = (req, res, next) => {
    if (req.session?.role) {
        return next();
    }
    return res.status(401).json({ message: 'Authentication required' });
};

module.exports = { requireAdmin, requireUser, requireStudent, requireAuth };


