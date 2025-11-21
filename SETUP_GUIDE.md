# Academy Website - Merged System Setup Guide

## 🎉 Merge Complete!

The exam system has been successfully merged into the main backend. The system now includes:

- ✅ **Team Member Management** - Full CRUD operations with image upload
- ✅ **Courses System** - Replaced projects with comprehensive course management
- ✅ **Exam System** - Create, publish, and manage exams with automatic scoring
- ✅ **User Management** - Admin can create and manage students/users
- ✅ **Submission Tracking** - View all exam submissions with scores and pass/fail status

## 🔧 Environment Setup

### Required Environment Variables

Update your `.env` file in the root directory (`e:\IATD-Backend\.env`) with the following variables:

```env
# MongoDB Connection
MONGO_URL=mongodb://localhost:27017/academy
# OR if using MongoDB Atlas:
# MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/academy?retryWrites=true&w=majority

# Server Configuration
PORT=5000
NODE_ENV=development

# Session Secret (change this to a random string)
SESSION_SECRET=your_super_secret_session_key_change_this_in_production

# Admin Credentials
ADMIN_EMAIL=admin@academy.com
ADMIN_PASSWORD=admin123

# Cloudinary Configuration (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Important Notes:

1. **MONGO_URL**: Must start with `mongodb://` or `mongodb+srv://`
2. **SESSION_SECRET**: Use a strong random string for production
3. **ADMIN_EMAIL & ADMIN_PASSWORD**: These are used for admin login
4. **Cloudinary**: Required for team member and course image uploads

## 🚀 Starting the Server

1. Install dependencies (if not already done):
   ```bash
   npm install
   ```

2. Make sure MongoDB is running (if using local MongoDB)

3. Start the server:
   ```bash
   npm start
   # or
   node server.js
   ```

4. The server will start on `http://localhost:5000`

## 📱 Access Points

Once the server is running, you can access:

- **Admin Dashboard**: http://localhost:5000/admin-dashboard.html
  - Login with ADMIN_EMAIL and ADMIN_PASSWORD from .env
  - Manage team members, courses, exams, users, and view submissions

- **Student Dashboard**: http://localhost:5000/user-dashboard.html
  - Register a new student account or login
  - View courses, take exams, and see your submissions

- **Main Dashboard**: http://localhost:5000/dashboard.html
  - The original dashboard (if you want to keep it)

- **Health Check**: http://localhost:5000/health
  - Verify server is running

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/admin/login` - Admin login
- `POST /api/auth/login` - User/student login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - Logout

### Team Members
- `GET /api/team-members` - Get all team members (public)
- `POST /api/team-members` - Create team member (admin only)
- `PUT /api/team-members/:id` - Update team member (admin only)
- `DELETE /api/team-members/:id` - Delete team member (admin only)

### Courses
- `GET /api/courses` - Get all courses (public)
- `POST /api/courses` - Create course (admin only)
- `PUT /api/courses/:id` - Update course (admin only)
- `DELETE /api/courses/:id` - Delete course (admin only)

### Exams (Admin)
- `POST /api/exams` - Create exam
- `GET /api/exams/admin/all` - Get all exams
- `PATCH /api/exams/:id/publish` - Publish/unpublish exam
- `DELETE /api/exams/:id` - Delete exam
- `GET /api/exams/admin/submissions` - Get all submissions

### Exams (Student)
- `GET /api/exams/published` - Get published exams
- `GET /api/exams/published/:id` - Get single published exam
- `POST /api/exams/:id/submit` - Submit exam answers
- `GET /api/exams/submissions/me` - Get my submissions

### Users (Admin)
- `POST /api/auth/admin/users` - Create user
- `GET /api/auth/admin/users` - Get all users

## 📊 Database Models

### User
- name, username, email, password
- role: 'admin', 'user', or 'student'
- createdByAdmin: boolean

### TeamMember
- name, jobTitle, imagePath

### Course
- name, description, duration, instructor
- imagePath, level, prerequisites, syllabus

### Exam
- title, description, course (reference)
- isPublished, questions[], duration, passingScore

### Submission
- user (reference), exam (reference)
- answers[], score, total, percentage, passed

## 🎯 Key Changes from Original System

1. **Authentication**: Changed from JWT to session-based authentication
2. **Projects → Courses**: Replaced project model with comprehensive course model
3. **Exam System**: Integrated from separate exam system with improvements
4. **Unified Dashboard**: Single admin dashboard for all management tasks
5. **Student Portal**: Dedicated student dashboard for learning and exams

## 🐛 Troubleshooting

### MongoDB Connection Error
- Ensure MONGO_URL in .env starts with `mongodb://` or `mongodb+srv://`
- Check if MongoDB is running (if using local MongoDB)
- Verify connection string credentials (if using MongoDB Atlas)

### Session Issues
- Make sure SESSION_SECRET is set in .env
- Clear browser cookies if experiencing login issues

### Image Upload Issues
- Verify Cloudinary credentials in .env
- Check that the upload middleware is working

### Port Already in Use
- Change PORT in .env to a different port (e.g., 5001)
- Or stop the process using port 5000

## 📝 Next Steps

1. Set up your .env file with correct values
2. Start the server
3. Login to admin dashboard and create some courses
4. Create exams for the courses
5. Create student accounts or let students register
6. Students can take exams and view results

## 🎓 Features

### Admin Features
- ✅ Team member CRUD with image upload
- ✅ Course management with detailed information
- ✅ Exam creation with multiple-choice questions
- ✅ Publish/unpublish exams
- ✅ User management
- ✅ View all submissions with scores

### Student Features
- ✅ User registration and login
- ✅ Browse available courses
- ✅ Take published exams
- ✅ View exam results and submission history
- ✅ See pass/fail status

Enjoy your merged academy system! 🚀
