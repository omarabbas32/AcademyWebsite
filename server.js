require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const path = require('path');

const app = express();

// --- Middlewares ---
// CORS configuration - allow all origins for development
app.use(cors({
    origin: '*', // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For form data

// Session configuration
app.use(
    session({
        secret: process.env.SESSION_SECRET || 'academy_secret_key_change_in_production',
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 1000 * 60 * 60 * 24 // 24 hours
        }
    })
);

// --- Import Routes ---
const authRoutes = require('./src/routes/authRoutes');
const serviceRoutes = require('./src/routes/serviceRoutes');
const courseRoutes = require('./src/routes/courseRoutes');
const contactInfoRoutes = require('./src/routes/contactInfoRoutes');
const teamMemberRoutes = require('./src/routes/teamMemberRoutes');
const aboutUsRoutes = require('./src/routes/aboutUsRoutes.js'); // Fixed case sensitivity
const emailRoutes = require('./src/routes/emailRoutes');
const examRoutes = require('./src/routes/examRoutes');
const offlineSiteRoutes = require('./src/routes/offlineSiteRoutes');

// --- Use Routes ---
app.use('/images', express.static('/images'));
app.use(express.static('public')); // Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Auth routes (public)
app.use('/api/auth', authRoutes);

// Public routes
app.use('/api/email', emailRoutes);

// Protected routes (with session-based auth in route files)
app.use('/api/about', aboutUsRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/courses', courseRoutes); // Replaced projects with courses
app.use('/api/contact-info', contactInfoRoutes);
app.use('/api/team-members', teamMemberRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/offline-sites', offlineSiteRoutes);

// Home route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'IATD Academy Server is running',
        timestamp: new Date().toISOString(),
        env: {
            NODE_ENV: process.env.NODE_ENV,
            MONGO_URL_SET: !!process.env.MONGO_URL,
            SESSION_SECRET_SET: !!process.env.SESSION_SECRET,
            ADMIN_EMAIL_SET: !!process.env.ADMIN_EMAIL
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    if (!res.headersSent) {
        res.status(err.status || 500).json({
            message: err.message || 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? err.stack : {}
        });
    }
});

// Handle connection aborted errors gracefully
process.on('uncaughtException', (err) => {
    if (err.message !== 'aborted' && err.code !== 'ECONNRESET') {
        console.error('Uncaught Exception:', err);
    }
});

process.on('unhandledRejection', (reason, promise) => {
    if (reason && reason.message !== 'aborted' && reason.code !== 'ECONNRESET') {
        console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    }
});

// --- Server and Database Connection ---
const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URL || process.env.MONGO_URI;

if (!MONGO_URL) {
    console.error('❌ MONGO_URL or MONGO_URI is not defined in .env file');
    process.exit(1);
}

mongoose.connect(MONGO_URL)
    .then(() => {
        console.log('=================================');
        console.log('✓ Connected to MongoDB successfully!');
        console.log('=================================');

        const server = app.listen(PORT, () => {
            console.log(`✓ IATD Academy Server running on http://localhost:${PORT}`);
            console.log(`✓ الأكاديمية الدولية للتدريب والتنمية`);
            console.log(`✓ International Academy for Training and Development`);
            console.log(`✓ Admin Dashboard: http://localhost:${PORT}/admin-dashboard.html`);
            console.log(`✓ Student Dashboard: http://localhost:${PORT}/user-dashboard.html`);
            console.log('=================================\n');
        });

        // Handle server errors
        server.on('error', (err) => {
            if (err.code !== 'ECONNRESET' && err.message !== 'aborted') {
                console.error('Server error:', err);
            }
        });
    })
    .catch(err => {
        console.error('❌ CRITICAL: Could not connect to MongoDB');
        console.error('Error Name:', err.name);
        console.error('Error Message:', err.message);
        console.error('Full Error:', err);
        // Do not exit process on Vercel, just log error so we can see it
        if (process.env.NODE_ENV !== 'production') {
            process.exit(1);
        }
    });

// Export for Vercel serverless
module.exports = app;
