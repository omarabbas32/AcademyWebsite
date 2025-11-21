// User Dashboard JavaScript

const API_BASE = '/api';
let currentUser = null;

// Show/hide sections
function showLogin() {
    document.getElementById('login-section').classList.remove('hidden');
    document.getElementById('register-section').classList.add('hidden');
}

function showRegister() {
    document.getElementById('login-section').classList.add('hidden');
    document.getElementById('register-section').classList.remove('hidden');
}

// Tab switching
function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(`${tab}-tab`).classList.add('active');

    // Load data for the tab
    if (tab === 'courses') loadCourses();
    else if (tab === 'enrolled') loadEnrolledCourses();
    else if (tab === 'exams') loadExams();
    else if (tab === 'submissions') loadSubmissions();
}

// Login
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    try {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await res.json();

        if (res.ok) {
            currentUser = result.user;
            showDashboard();
        } else {
            alert(result.message || 'Login failed');
        }
    } catch (err) {
        alert('Error: ' + err.message);
    }
});

// Register
document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    try {
        const res = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await res.json();

        if (res.ok) {
            alert('Registration successful! Please login.');
            showLogin();
            document.getElementById('register-form').reset();
        } else {
            alert(result.message || 'Registration failed');
        }
    } catch (err) {
        alert('Error: ' + err.message);
    }
});

// Show dashboard
function showDashboard() {
    document.getElementById('login-section').classList.add('hidden');
    document.getElementById('register-section').classList.add('hidden');
    document.getElementById('dashboard-section').classList.add('active');
    document.getElementById('user-info').style.display = 'flex';
    document.getElementById('user-name').textContent = currentUser.name;
    document.getElementById('user-role').textContent = currentUser.role.toUpperCase();

    loadStats();
    loadCourses();
}

// Logout
async function logout() {
    try {
        await fetch(`${API_BASE}/auth/logout`, { method: 'POST' });
        location.reload();
    } catch (err) {
        console.error('Logout error:', err);
        location.reload();
    }
}

// Load stats
async function loadStats() {
    try {
        // Load enrolled courses count
        const enrolledRes = await fetch(`${API_BASE}/courses/enrollments/my-courses`);
        const enrolled = enrolledRes.ok ? await enrolledRes.json() : [];
        document.getElementById('stat-courses').textContent = enrolled.length;

        // Load submissions
        const subRes = await fetch(`${API_BASE}/exams/submissions/me`);
        const submissions = subRes.ok ? await subRes.json() : [];
        document.getElementById('stat-exams').textContent = submissions.length;

        const passed = submissions.filter(s => s.passed).length;
        document.getElementById('stat-passed').textContent = passed;

        const avgScore = submissions.length > 0
            ? Math.round(submissions.reduce((sum, s) => sum + s.percentage, 0) / submissions.length)
            : 0;
        document.getElementById('stat-average').textContent = avgScore + '%';
    } catch (err) {
        console.error('Error loading stats:', err);
    }
}

// Load all courses
async function loadCourses() {
    try {
        const res = await fetch(`${API_BASE}/courses`);
        const courses = await res.json();

        const grid = document.getElementById('courses-grid');
        if (courses.length === 0) {
            grid.innerHTML = '<div class="empty-state"><div class="icon">📚</div><p>No courses available yet.</p></div>';
            return;
        }

        grid.innerHTML = courses.map(course => `
            <div class="card-item">
                ${course.imagePath ? `<img src="${course.imagePath}" alt="${course.name}" />` : ''}
                <h3>${course.name}</h3>
                <p>${course.description}</p>
                <div class="meta">
                    <span class="badge">📅 ${course.duration}</span>
                    <span class="badge">📊 ${course.level}</span>
                    <span class="badge">👨‍🏫 ${course.instructor}</span>
                </div>
                <button class="card-btn primary" onclick="enrollInCourse('${course._id}')">Enroll Now</button>
            </div>
        `).join('');
    } catch (err) {
        console.error('Error loading courses:', err);
    }
}

// Load enrolled courses
async function loadEnrolledCourses() {
    try {
        const res = await fetch(`${API_BASE}/courses/enrollments/my-courses`);
        const courses = await res.json();

        const grid = document.getElementById('enrolled-grid');
        if (courses.length === 0) {
            grid.innerHTML = '<div class="empty-state"><div class="icon">📚</div><p>You haven\'t enrolled in any courses yet.</p></div>';
            return;
        }

        grid.innerHTML = courses.map(course => `
            <div class="card-item">
                ${course.imagePath ? `<img src="${course.imagePath}" alt="${course.name}" />` : ''}
                <h3>${course.name}</h3>
                <p>${course.description}</p>
                <div class="meta">
                    <span class="badge enrolled">✅ Enrolled</span>
                    <span class="badge">📅 ${course.duration}</span>
                    <span class="badge">📊 ${course.level}</span>
                </div>
                <button class="card-btn disabled" disabled>Already Enrolled</button>
            </div>
        `).join('');
    } catch (err) {
        console.error('Error loading enrolled courses:', err);
    }
}

// Enroll in course
async function enrollInCourse(courseId) {
    try {
        const res = await fetch(`${API_BASE}/courses/${courseId}/enroll`, {
            method: 'POST'
        });

        const result = await res.json();

        if (res.ok) {
            alert(result.message);
            // Update user role if changed
            if (result.user) {
                currentUser = result.user;
                document.getElementById('user-role').textContent = currentUser.role.toUpperCase();
            }
            loadStats();
            loadCourses();
            loadEnrolledCourses();
        } else {
            alert(result.message || 'Failed to enroll');
        }
    } catch (err) {
        alert('Error: ' + err.message);
    }
}

// Load exams
async function loadExams() {
    try {
        const res = await fetch(`${API_BASE}/exams/published`);

        if (!res.ok) {
            const grid = document.getElementById('exams-grid');
            if (res.status === 403) {
                grid.innerHTML = '<div class="empty-state"><div class="icon">🔒</div><p>Please enroll in a course to access exams.</p></div>';
            } else {
                grid.innerHTML = '<div class="empty-state"><div class="icon">📝</div><p>No exams available yet.</p></div>';
            }
            return;
        }

        const exams = await res.json();

        const grid = document.getElementById('exams-grid');
        if (exams.length === 0) {
            grid.innerHTML = '<div class="empty-state"><div class="icon">📝</div><p>No exams available yet.</p></div>';
            return;
        }

        grid.innerHTML = exams.map(exam => `
            <div class="card-item">
                <h3>${exam.title}</h3>
                <p>${exam.description || 'No description available'}</p>
                <div class="meta">
                    <span class="badge">📝 ${exam.questions.length} Questions</span>
                    ${exam.duration ? `<span class="badge">⏱️ ${exam.duration} min</span>` : ''}
                    ${exam.passingScore ? `<span class="badge">✅ Pass: ${exam.passingScore}%</span>` : ''}
                </div>
                <button class="card-btn success" onclick="takeExam('${exam._id}')">Take Exam</button>
            </div>
        `).join('');
    } catch (err) {
        console.error('Error loading exams:', err);
    }
}

// Take exam
function takeExam(examId) {
    // Store exam ID and redirect to exam page
    sessionStorage.setItem('currentExamId', examId);
    window.location.href = `/take-exam-student.html?id=${examId}`;
}

// Load submissions
async function loadSubmissions() {
    try {
        const res = await fetch(`${API_BASE}/exams/submissions/me`);
        const submissions = await res.json();

        const tbody = document.querySelector('#submissions-table tbody');
        if (submissions.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #64748b; padding: 2rem;">No exam submissions yet.</td></tr>';
            return;
        }

        tbody.innerHTML = submissions.map(sub => `
            <tr>
                <td>${sub.exam?.title || 'Unknown'}</td>
                <td>${sub.score}/${sub.total}</td>
                <td>${sub.percentage}%</td>
                <td>
                    <span class="badge ${sub.passed ? 'passed' : 'failed'}">
                        ${sub.passed ? '✅ Passed' : '❌ Failed'}
                    </span>
                </td>
                <td>${new Date(sub.createdAt).toLocaleDateString()}</td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Error loading submissions:', err);
    }
}
