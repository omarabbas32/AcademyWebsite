// Script to create initial admin user
// Run: node create-admin.js [name] [username] [email] [password]
// Example: node create-admin.js "Admin User" admin admin@academy.com 123456

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/userModel');

const MONGO_URL = process.env.MONGO_URL;

async function createAdmin() {
    try {
        await mongoose.connect(MONGO_URL);
        console.log('Connected to MongoDB');

        const name = process.argv[2] || 'Admin User';
        const username = process.argv[3] || 'admin';
        const email = process.argv[4] || 'admin@academy.com';
        const password = process.argv[5] || '123456';

        // Check if user exists
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            console.log(`User with username "${username}" or email "${email}" already exists!`);
            process.exit(0);
        }

        // Create admin user
        const user = new User({
            name,
            username,
            email,
            password,
            role: 'admin'
        });

        await user.save();
        console.log('✅ Admin user created successfully!');
        console.log('Name:', name);
        console.log('Username:', username);
        console.log('Email:', email);
        console.log('Password:', password);
        console.log('\n⚠️  Please change the password after first login!');

        process.exit(0);
    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
}

createAdmin();
