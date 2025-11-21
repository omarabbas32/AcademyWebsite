const User = require('../models/userModel.js');
const bcrypt = require('bcryptjs');

// ==================== ADMIN AUTHENTICATION ====================

// Admin Login
exports.adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body; // Can be username or email
        const usernameOrEmail = email; // The field is named 'email' in the form but can accept username

        if (!usernameOrEmail || !password) {
            return res.status(400).json({ message: 'Username/Email and password are required' });
        }

        // First, check environment-based admin credentials
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (adminEmail && adminPassword && usernameOrEmail === adminEmail && password === adminPassword) {
            req.session.role = 'admin';
            req.session.adminEmail = usernameOrEmail;
            return res.json({ message: 'Admin logged in successfully', role: 'admin' });
        }

        // If env credentials don't match, check database for admin user
        const adminUser = await User.findOne({
            $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }],
            role: 'admin'
        });

        if (!adminUser) {
            return res.status(401).json({ message: 'Invalid admin credentials' });
        }

        const isMatch = await adminUser.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid admin credentials' });
        }

        // Login successful
        req.session.role = 'admin';
        req.session.userId = adminUser._id.toString();
        req.session.adminEmail = adminUser.email;
        req.session.userName = adminUser.name;

        return res.json({
            message: 'Admin logged in successfully',
            role: 'admin',
            user: {
                name: adminUser.name,
                username: adminUser.username,
                email: adminUser.email
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Admin Logout
exports.adminLogout = async (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Logout failed' });
        }
        res.json({ message: 'Admin logged out successfully' });
    });
};

// ==================== USER/STUDENT AUTHENTICATION ====================

// User Registration
exports.register = async (req, res) => {
    try {
        const { name, username, email, password } = req.body;

        if (!name || !username || !email || !password) {
            return res.status(400).json({
                message: 'Name, username, email, and password are required'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email: email.toLowerCase() }, { username }]
        });

        if (existingUser) {
            return res.status(400).json({
                message: 'User with this email or username already exists'
            });
        }

        // Create new user (password will be hashed by pre-save hook)
        const newUser = await User.create({
            name,
            username,
            email: email.toLowerCase(),
            password,
            role: 'student'
        });

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: newUser._id,
                name: newUser.name,
                username: newUser.username,
                email: newUser.email
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// User login (email or username)
exports.userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email/username and password are required' });
        }

        // Find user by email OR username
        const user = await User.findOne({
            $or: [
                { email: email },
                { username: email }
            ],
            role: { $in: ['user', 'student'] }
        });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Store user info in session
        req.session.userId = user._id;
        req.session.role = user.role;
        req.session.user = {
            id: user._id,
            name: user.name,
            email: user.email,
            username: user.username,
            role: user.role
        };

        res.json({
            message: 'Login successful',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        console.error('User login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// User Logout
exports.userLogout = async (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Logout failed' });
        }
        res.json({ message: 'User logged out successfully' });
    });
};

// Get current user info
exports.getCurrentUser = async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        const user = await User.findById(req.session.userId).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ==================== ADMIN USER MANAGEMENT ====================

// Create user by admin
exports.createUserByAdmin = async (req, res) => {
    try {
        const { name, username, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: 'Name, email, and password are required'
            });
        }

        const newUser = await User.create({
            name,
            username: username || email.split('@')[0],
            email: email.toLowerCase(),
            password,
            role: role || 'student',
            createdByAdmin: true
        });

        res.status(201).json({
            message: 'User created successfully',
            user: {
                id: newUser._id,
                name: newUser.name,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get all users (Admin only)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
