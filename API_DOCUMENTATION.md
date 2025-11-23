# IATD Academy API Documentation

**Base URL:** `http://localhost:5000/api` (Development)  
**Production URL:** `https://academy-website-test.vercel.app/api`

**Authentication:** Session-based authentication using cookies  
**Content-Type:** `application/json` (except for file uploads which use `multipart/form-data`)

---

## Table of Contents

1. [Authentication](#authentication)
2. [Courses](#courses)
3. [Enrollment Requests](#enrollment-requests)
4. [Exams](#exams)
5. [Team Members](#team-members)
6. [Services](#services)
7. [About Us](#about-us)
8. [Contact Info](#contact-info)
9. [Offline Sites](#offline-sites)
10. [Email](#email)

---

## Authentication

### Admin Login
**POST** `/api/auth/admin/login`

Login as an administrator.

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "adminpassword"
}
```

**Response:** `200 OK`
```json
{
  "message": "Admin login successful",
  "admin": {
    "_id": "...",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

---

### Admin Logout
**POST** `/api/auth/admin/logout`

**Auth Required:** Admin

**Response:** `200 OK`
```json
{
  "message": "Admin logged out successfully"
}
```

---

### User Registration
**POST** `/api/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response:** `201 Created`
```json
{
  "message": "User registered successfully",
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

---

### User Login
**POST** `/api/auth/login`

Login as a regular user or student.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response:** `200 OK`
```json
{
  "message": "Login successful",
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

---

### User Logout
**POST** `/api/auth/logout`

**Auth Required:** User/Student

**Response:** `200 OK`
```json
{
  "message": "Logged out successfully"
}
```

---

### Get Current User
**GET** `/api/auth/me`

**Auth Required:** User/Student/Admin

**Response:** `200 OK`
```json
{
  "_id": "...",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "student"
}
```

---

### Create User (Admin)
**POST** `/api/auth/admin/users`

**Auth Required:** Admin

Create a new user account (admin only).

**Request Body:**
```json
{
  "name": "Jane Smith",
  "username": "janesmith",
  "email": "jane@example.com",
  "password": "temporarypass",
  "role": "student"
}
```

**Response:** `201 Created`

---

### Get All Users (Admin)
**GET** `/api/auth/admin/users`

**Auth Required:** Admin

**Response:** `200 OK`
```json
[
  {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

## Courses

### Get All Courses
**GET** `/api/courses`

**Auth Required:** None (Public)

**Response:** `200 OK`
```json
[
  {
    "_id": "...",
    "name": "Web Development Fundamentals",
    "description": "Learn HTML, CSS, and JavaScript",
    "duration": "8 weeks",
    "instructor": "Dr. Ahmed Hassan",
    "level": "Beginner",
    "imagePath": "https://...",
    "prerequisites": "None",
    "syllabus": "Week 1: HTML basics...",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### Get Course by ID
**GET** `/api/courses/:id`

**Auth Required:** None (Public)

**Response:** `200 OK`
```json
{
  "_id": "...",
  "name": "Web Development Fundamentals",
  "description": "Learn HTML, CSS, and JavaScript",
  "duration": "8 weeks",
  "instructor": "Dr. Ahmed Hassan",
  "level": "Beginner",
  "imagePath": "https://...",
  "prerequisites": "None",
  "syllabus": "Week 1: HTML basics..."
}
```

---

### Create Course
**POST** `/api/courses`

**Auth Required:** Admin  
**Content-Type:** `multipart/form-data`

**Form Data:**
- `name` (required): Course name
- `description` (required): Course description
- `duration` (required): Course duration (e.g., "8 weeks")
- `instructor` (required): Instructor name
- `level`: "Beginner", "Intermediate", or "Advanced"
- `prerequisites`: Prerequisites text
- `syllabus`: Syllabus text
- `image`: Course image file (optional)

**Response:** `201 Created`

---

### Update Course
**PUT** `/api/courses/:id`

**Auth Required:** Admin  
**Content-Type:** `multipart/form-data`

**Form Data:** Same as Create Course

**Response:** `200 OK`

---

### Delete Course
**DELETE** `/api/courses/:id`

**Auth Required:** Admin

**Response:** `200 OK`
```json
{
  "message": "Course deleted successfully"
}
```

---

## Enrollment Requests

### Request Enrollment
**POST** `/api/courses/:id/request-enrollment`

**Auth Required:** User  
**Content-Type:** `multipart/form-data`

Submit an enrollment request with payment proof.

**Form Data:**
- `paymentProof` (required): Payment proof image file (max 5MB)
- `message`: Optional message to admin

**Response:** `201 Created`
```json
{
  "message": "Enrollment request submitted successfully. Please wait for admin approval.",
  "request": {
    "_id": "...",
    "user": "...",
    "course": "...",
    "paymentProofUrl": "https://...",
    "status": "pending",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### Get Enrollment Status
**GET** `/api/courses/:id/enrollment-status`

**Auth Required:** User

Check enrollment status for a specific course.

**Response:** `200 OK`
```json
{
  "status": "pending",
  "request": {
    "_id": "...",
    "status": "pending",
    "message": "Waiting for approval",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Possible status values:**
- `not_requested`: No enrollment request submitted
- `pending`: Request submitted, awaiting approval
- `approved`: Request approved
- `rejected`: Request rejected
- `enrolled`: Already enrolled in the course

---

### Get Enrollment Requests for Course (Admin)
**GET** `/api/courses/:id/enrollment-requests`

**Auth Required:** Admin

Get all pending enrollment requests for a specific course.

**Response:** `200 OK`
```json
[
  {
    "_id": "...",
    "user": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "course": "...",
    "paymentProofUrl": "https://...",
    "message": "Please approve my enrollment",
    "status": "pending",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### Approve Enrollment Request (Admin)
**POST** `/api/courses/admin/enrollment-requests/:id/approve`

**Auth Required:** Admin

**Request Body:**
```json
{
  "adminNote": "Approved - payment verified"
}
```

**Response:** `200 OK`
```json
{
  "message": "Enrollment request approved",
  "enrollment": {
    "_id": "...",
    "user": "...",
    "course": "...",
    "status": "active"
  },
  "request": {
    "_id": "...",
    "status": "approved",
    "adminNote": "Approved - payment verified"
  }
}
```

---

### Reject Enrollment Request (Admin)
**POST** `/api/courses/admin/enrollment-requests/:id/reject`

**Auth Required:** Admin

**Request Body:**
```json
{
  "adminNote": "Invalid payment proof"
}
```

**Response:** `200 OK`
```json
{
  "message": "Enrollment request rejected",
  "request": {
    "_id": "...",
    "status": "rejected",
    "adminNote": "Invalid payment proof"
  }
}
```

---

### Get My Enrolled Courses
**GET** `/api/courses/enrollments/my-courses`

**Auth Required:** User

**Response:** `200 OK`
```json
[
  {
    "_id": "...",
    "name": "Web Development Fundamentals",
    "description": "Learn HTML, CSS, and JavaScript",
    "instructor": "Dr. Ahmed Hassan"
  }
]
```

---

### Unenroll from Course
**POST** `/api/courses/:id/unenroll`

**Auth Required:** User

**Response:** `200 OK`
```json
{
  "message": "Successfully unenrolled from course",
  "enrollment": {
    "_id": "...",
    "status": "cancelled"
  }
}
```

---

## Exams

### Create Exam (Admin)
**POST** `/api/exams`

**Auth Required:** Admin

**Request Body:**
```json
{
  "title": "JavaScript Fundamentals Quiz",
  "description": "Test your JavaScript knowledge",
  "duration": 60,
  "passingScore": 70,
  "isPublished": false,
  "questions": [
    {
      "prompt": "What is a closure in JavaScript?",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "points": 10
    }
  ]
}
```

**Response:** `201 Created`

---

### Get All Exams (Admin)
**GET** `/api/exams/admin/all`

**Auth Required:** Admin

**Response:** `200 OK`
```json
[
  {
    "_id": "...",
    "title": "JavaScript Fundamentals Quiz",
    "description": "Test your JavaScript knowledge",
    "duration": 60,
    "passingScore": 70,
    "isPublished": true,
    "questions": [...]
  }
]
```

---

### Get Published Exams (Student)
**GET** `/api/exams/published`

**Auth Required:** Student

**Response:** `200 OK`
```json
[
  {
    "_id": "...",
    "title": "JavaScript Fundamentals Quiz",
    "description": "Test your JavaScript knowledge",
    "duration": 60,
    "passingScore": 70
  }
]
```

---

### Get Published Exam by ID (Student)
**GET** `/api/exams/published/:id`

**Auth Required:** Student

**Response:** `200 OK`
```json
{
  "_id": "...",
  "title": "JavaScript Fundamentals Quiz",
  "description": "Test your JavaScript knowledge",
  "duration": 60,
  "passingScore": 70,
  "questions": [
    {
      "prompt": "What is a closure?",
      "options": ["A", "B", "C", "D"],
      "points": 10
    }
  ]
}
```

---

### Submit Exam (Student)
**POST** `/api/exams/:id/submit`

**Auth Required:** Student

**Request Body:**
```json
{
  "answers": [0, 2, 1, 3]
}
```

**Response:** `201 Created`
```json
{
  "message": "Exam submitted successfully",
  "submission": {
    "_id": "...",
    "exam": "...",
    "user": "...",
    "answers": [0, 2, 1, 3],
    "score": 80,
    "percentage": 80,
    "passed": true,
    "submittedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### Get My Submissions (Student)
**GET** `/api/exams/submissions/me`

**Auth Required:** Student

**Response:** `200 OK`
```json
[
  {
    "_id": "...",
    "exam": {
      "_id": "...",
      "title": "JavaScript Fundamentals Quiz"
    },
    "score": 80,
    "percentage": 80,
    "passed": true,
    "submittedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### Get All Submissions (Admin)
**GET** `/api/exams/admin/submissions`

**Auth Required:** Admin

**Response:** `200 OK`
```json
[
  {
    "_id": "...",
    "user": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "exam": {
      "_id": "...",
      "title": "JavaScript Fundamentals Quiz"
    },
    "score": 80,
    "percentage": 80,
    "passed": true,
    "submittedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### Update Exam (Admin)
**PUT** `/api/exams/:id`

**Auth Required:** Admin

**Request Body:** Same as Create Exam

**Response:** `200 OK`

---

### Toggle Publish Status (Admin)
**PATCH** `/api/exams/:id/publish`

**Auth Required:** Admin

**Response:** `200 OK`
```json
{
  "message": "Exam published successfully",
  "exam": {
    "_id": "...",
    "isPublished": true
  }
}
```

---

### Delete Exam (Admin)
**DELETE** `/api/exams/:id`

**Auth Required:** Admin

**Response:** `200 OK`
```json
{
  "message": "Exam deleted successfully"
}
```

---

### Generate Private Exam Link (Admin)
**POST** `/api/exams/:id/generate-link`

**Auth Required:** Admin

Generate a private access link for an exam.

**Response:** `200 OK`
```json
{
  "message": "Private link generated successfully",
  "accessToken": "abc123...",
  "link": "http://localhost:5000/take-exam.html?token=abc123..."
}
```

---

### Get Exam by Token (Public)
**GET** `/api/exams/public/:token`

**Auth Required:** None

Access an exam using a private token.

**Response:** `200 OK`

---

### Submit Private Exam (Public)
**POST** `/api/exams/public/:token/submit`

**Auth Required:** None

**Request Body:**
```json
{
  "userName": "Guest User",
  "userEmail": "guest@example.com",
  "answers": [0, 2, 1, 3]
}
```

**Response:** `201 Created`

---

## Team Members

### Get All Team Members
**GET** `/api/team-members`

**Auth Required:** None (Public)

**Response:** `200 OK`
```json
[
  {
    "_id": "...",
    "name": "Dr. Ahmed Hassan",
    "jobTitle": "Lead Instructor",
    "imagePath": "https://..."
  }
]
```

---

### Create Team Member (Admin)
**POST** `/api/team-members`

**Auth Required:** Admin  
**Content-Type:** `multipart/form-data`

**Form Data:**
- `name` (required): Member name
- `jobTitle` (required): Job title
- `image`: Profile image file

**Response:** `201 Created`

---

### Delete Team Member (Admin)
**DELETE** `/api/team-members/:id`

**Auth Required:** Admin

**Response:** `200 OK`

---

## Services

### Get All Services
**GET** `/api/services`

**Auth Required:** None (Public)

**Response:** `200 OK`

---

### Create Service (Admin)
**POST** `/api/services`

**Auth Required:** Admin

**Response:** `201 Created`

---

### Delete Service (Admin)
**DELETE** `/api/services/:id`

**Auth Required:** Admin

**Response:** `200 OK`

---

## About Us

### Get About Us Info
**GET** `/api/about`

**Auth Required:** None (Public)

**Response:** `200 OK`

---

### Update About Us (Admin)
**PUT** `/api/about`

**Auth Required:** Admin

**Response:** `200 OK`

---

## Contact Info

### Get Contact Info
**GET** `/api/contact-info`

**Auth Required:** None (Public)

**Response:** `200 OK`

---

### Update Contact Info (Admin)
**PUT** `/api/contact-info`

**Auth Required:** Admin

**Response:** `200 OK`

---

## Offline Sites

### Get All Offline Sites
**GET** `/api/offline-sites`

**Auth Required:** None (Public)

**Response:** `200 OK`
```json
[
  {
    "_id": "...",
    "name": "Cairo Branch",
    "nameAr": "فرع القاهرة",
    "address": "123 Main St",
    "city": "Cairo",
    "phone": "+20123456789",
    "email": "cairo@iatd.com",
    "googleMapsLink": "https://maps.google.com/...",
    "isActive": true
  }
]
```

---

### Create Offline Site (Admin)
**POST** `/api/offline-sites`

**Auth Required:** Admin

**Request Body:**
```json
{
  "name": "Cairo Branch",
  "nameAr": "فرع القاهرة",
  "address": "123 Main St",
  "city": "Cairo",
  "phone": "+20123456789",
  "email": "cairo@iatd.com",
  "googleMapsLink": "https://maps.google.com/..."
}
```

**Response:** `201 Created`

---

### Toggle Site Status (Admin)
**PATCH** `/api/offline-sites/:id/toggle`

**Auth Required:** Admin

**Response:** `200 OK`

---

### Delete Offline Site (Admin)
**DELETE** `/api/offline-sites/:id`

**Auth Required:** Admin

**Response:** `200 OK`

---

## Email

### Send Contact Email
**POST** `/api/email/contact`

**Auth Required:** None (Public)

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Inquiry about courses",
  "message": "I would like to know more about..."
}
```

**Response:** `200 OK`
```json
{
  "message": "Email sent successfully"
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "message": "Invalid request data"
}
```

### 401 Unauthorized
```json
{
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "message": "Admin access required"
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Internal server error"
}
```

---

## Notes

- All authenticated requests must include credentials (cookies)
- File uploads are limited to 5MB
- Supported image formats: JPG, PNG, GIF, WebP
- Session cookies expire after 7 days of inactivity
- All timestamps are in ISO 8601 format (UTC)
