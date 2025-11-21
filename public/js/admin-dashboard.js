// Admin Dashboard JavaScript

const API_BASE = '/api';
let questionCount = 0;

// Tab switching
function switchTab(tab) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(`${tab}-tab`).classList.add('active');

    // Load data for the tab
    if (tab === 'team') loadTeamMembers();
    else if (tab === 'courses') loadCourses();
    else if (tab === 'exams') loadExams();
    else if (tab === 'users') loadUsers();
    else if (tab === 'submissions') loadSubmissions();
    else if (tab === 'sites') loadOfflineSites();
}

// Admin Login
document.getElementById('admin-login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    try {
        const res = await fetch(`${API_BASE}/auth/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await res.json();

        if (res.ok) {
            document.getElementById('login-card').classList.add('hidden');
            document.getElementById('admin-area').classList.remove('hidden');
            loadTeamMembers();
        } else {
            alert(result.message || 'Login failed');
        }
    } catch (err) {
        alert('Login error: ' + err.message);
    }
});

// Logout
async function logout() {
    try {
        await fetch(`${API_BASE}/auth/admin/logout`, { method: 'POST' });
        location.reload();
    } catch (err) {
        console.error('Logout error:', err);
        location.reload();
    }
}

// ==================== TEAM MEMBERS ====================

async function loadTeamMembers() {
    try {
        const res = await fetch(`${API_BASE}/team-members`);
        const members = await res.json();

        const tbody = document.getElementById('team-members-table');
        tbody.innerHTML = members.map(member => `
            <tr>
                <td><img src="${member.imagePath}" class="image-preview" alt="${member.name}" /></td>
                <td>${member.name}</td>
                <td>${member.jobTitle}</td>
                <td>
                    <button class="btn-danger btn-small" onclick="deleteTeamMember('${member._id}')">Delete</button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Error loading team members:', err);
    }
}

document.getElementById('create-team-member-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
        const res = await fetch(`${API_BASE}/team-members`, {
            method: 'POST',
            body: formData
        });

        if (res.ok) {
            alert('Team member added successfully');
            e.target.reset();
            loadTeamMembers();
        } else {
            const result = await res.json();
            alert(result.message || 'Failed to add team member');
        }
    } catch (err) {
        alert('Error: ' + err.message);
    }
});

async function deleteTeamMember(id) {
    if (!confirm('Are you sure you want to delete this team member?')) return;

    try {
        const res = await fetch(`${API_BASE}/team-members/${id}`, { method: 'DELETE' });
        if (res.ok) {
            alert('Team member deleted');
            loadTeamMembers();
        }
    } catch (err) {
        alert('Error deleting team member: ' + err.message);
    }
}

// ==================== COURSES ====================

async function loadCourses() {
    try {
        const res = await fetch(`${API_BASE}/courses`);
        const courses = await res.json();

        const tbody = document.getElementById('courses-table');
        tbody.innerHTML = courses.map(course => `
            <tr>
                <td>${course.name}</td>
                <td>${course.instructor}</td>
                <td>${course.duration}</td>
                <td>${course.level}</td>
                <td>
                    <button class="btn-danger btn-small" onclick="deleteCourse('${course._id}')">Delete</button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Error loading courses:', err);
    }
}

document.getElementById('create-course-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
        const res = await fetch(`${API_BASE}/courses`, {
            method: 'POST',
            body: formData
        });

        if (res.ok) {
            alert('Course added successfully');
            e.target.reset();
            loadCourses();
        } else {
            const result = await res.json();
            alert(result.message || 'Failed to add course');
        }
    } catch (err) {
        alert('Error: ' + err.message);
    }
});

async function deleteCourse(id) {
    if (!confirm('Are you sure you want to delete this course?')) return;

    try {
        const res = await fetch(`${API_BASE}/courses/${id}`, { method: 'DELETE' });
        if (res.ok) {
            alert('Course deleted');
            loadCourses();
        }
    } catch (err) {
        alert('Error deleting course: ' + err.message);
    }
}

// ==================== EXAMS ====================

function addQuestion() {
    questionCount++;
    const panel = document.getElementById('questions-panel');
    const div = document.createElement('div');
    div.className = 'question-card';
    div.innerHTML = `
        <h4>Question ${questionCount}</h4>
        <label>Question Prompt</label>
        <input type="text" name="q${questionCount}_prompt" required />
        <label>Option 1</label>
        <input type="text" name="q${questionCount}_opt1" required />
        <label>Option 2</label>
        <input type="text" name="q${questionCount}_opt2" required />
        <label>Option 3</label>
        <input type="text" name="q${questionCount}_opt3" />
        <label>Option 4</label>
        <input type="text" name="q${questionCount}_opt4" />
        <label>Correct Answer (1-4)</label>
        <input type="number" name="q${questionCount}_correct" min="1" max="4" required />
    `;
    panel.appendChild(div);
}

document.getElementById('add-question-btn')?.addEventListener('click', addQuestion);

document.getElementById('create-exam-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const questions = [];
    for (let i = 1; i <= questionCount; i++) {
        const prompt = formData.get(`q${i}_prompt`);
        if (!prompt) continue;

        const options = [
            formData.get(`q${i}_opt1`),
            formData.get(`q${i}_opt2`),
            formData.get(`q${i}_opt3`),
            formData.get(`q${i}_opt4`)
        ].filter(Boolean);

        const correctIndex = parseInt(formData.get(`q${i}_correct`)) - 1;

        questions.push({ prompt, options, correctIndex });
    }

    const examData = {
        title: formData.get('title'),
        description: formData.get('description'),
        duration: formData.get('duration') ? parseInt(formData.get('duration')) : null,
        passingScore: formData.get('passingScore') ? parseInt(formData.get('passingScore')) : 60,
        isPublished: formData.get('isPublished') === 'on',
        questions
    };

    try {
        const res = await fetch(`${API_BASE}/exams`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(examData)
        });

        if (res.ok) {
            alert('Exam created successfully');
            e.target.reset();
            document.getElementById('questions-panel').innerHTML = '';
            questionCount = 0;
            loadExams();
        } else {
            const result = await res.json();
            alert(result.message || 'Failed to create exam');
        }
    } catch (err) {
        alert('Error: ' + err.message);
    }
});

async function loadExams() {
    try {
        const res = await fetch(`${API_BASE}/exams/admin/all`);
        const exams = await res.json();

        const tbody = document.getElementById('exams-table');
        tbody.innerHTML = exams.map(exam => `
            <tr>
                <td>${exam.title}</td>
                <td>${exam.questions.length}</td>
                <td>
                    <span class="status ${exam.isPublished ? 'published' : 'draft'}">
                        ${exam.isPublished ? 'Published' : 'Draft'}
                    </span>
                </td>
                <td>
                    <button class="btn-success btn-small" onclick="togglePublish('${exam._id}', ${!exam.isPublished})">
                        ${exam.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                    <button class="secondary btn-small" onclick="generatePrivateLink('${exam._id}')">
                        🔗 Link
                    </button>
                    <button class="btn-danger btn-small" onclick="deleteExam('${exam._id}')">Delete</button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Error loading exams:', err);
    }
}

async function togglePublish(examId, publish) {
    try {
        const res = await fetch(`${API_BASE}/exams/${examId}/publish`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isPublished: publish })
        });

        if (res.ok) {
            loadExams();
        }
    } catch (err) {
        alert('Error toggling publish status: ' + err.message);
    }
}

async function deleteExam(id) {
    if (!confirm('Are you sure you want to delete this exam?')) return;

    try {
        const res = await fetch(`${API_BASE}/exams/${id}`, { method: 'DELETE' });
        if (res.ok) {
            alert('Exam deleted');
            loadExams();
        }
    } catch (err) {
        alert('Error deleting exam: ' + err.message);
    }
}

async function generatePrivateLink(examId) {
    try {
        const res = await fetch(`${API_BASE}/exams/${examId}/generate-link`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ allowAnonymous: true })
        });

        if (res.ok) {
            const data = await res.json();
            const link = data.privateLink;

            // Create a modal-like display
            const linkHtml = `
                <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); z-index: 1000; max-width: 600px;">
                    <h3>🔗 Private Exam Link Generated!</h3>
                    <p>Share this link with anyone to take the exam without logging in:</p>
                    <div class="link-display" style="background: #f1f5f9; padding: 1rem; border-radius: 8px; word-break: break-all; font-family: monospace; margin: 1rem 0;">${link}</div>
                    <button class="primary" onclick="copyToClipboard('${link}')">Copy Link</button>
                    <button class="secondary" onclick="this.parentElement.remove(); document.getElementById('overlay').remove();">Close</button>
                </div>
                <div id="overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 999;" onclick="this.remove(); this.previousElementSibling.remove();"></div>
            `;
            document.body.insertAdjacentHTML('beforeend', linkHtml);
        } else {
            alert('Failed to generate private link');
        }
    } catch (err) {
        alert('Error: ' + err.message);
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('Link copied to clipboard!');
    }).catch(() => {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert('Link copied to clipboard!');
    });
}

// ==================== USERS ====================

async function loadUsers() {
    try {
        const res = await fetch(`${API_BASE}/auth/admin/users`);
        const users = await res.json();

        const tbody = document.getElementById('users-table');
        tbody.innerHTML = users.map(user => `
            <tr>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.role}</td>
                <td>${new Date(user.createdAt).toLocaleDateString()}</td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Error loading users:', err);
    }
}

document.getElementById('create-user-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    try {
        const res = await fetch(`${API_BASE}/auth/admin/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            alert('User created successfully');
            e.target.reset();
            loadUsers();
        } else {
            const result = await res.json();
            alert(result.message || 'Failed to create user');
        }
    } catch (err) {
        alert('Error: ' + err.message);
    }
});

// ==================== SUBMISSIONS ====================

async function loadSubmissions() {
    try {
        const res = await fetch(`${API_BASE}/exams/admin/submissions`);
        const submissions = await res.json();

        const tbody = document.getElementById('submissions-table');
        tbody.innerHTML = submissions.map(sub => `
            <tr>
                <td>${sub.user?.name || sub.anonymousName || 'Anonymous'}</td>
                <td>${sub.exam?.title || 'Unknown'}</td>
                <td>${sub.score}/${sub.total}</td>
                <td>${sub.percentage}%</td>
                <td>
                    <span class="status ${sub.passed ? 'published' : 'draft'}">
                        ${sub.passed ? 'Passed' : 'Failed'}
                    </span>
                </td>
                <td>${new Date(sub.createdAt).toLocaleString()}</td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Error loading submissions:', err);
    }
}

// ==================== OFFLINE SITES ====================

async function loadOfflineSites() {
    try {
        const res = await fetch(`${API_BASE}/offline-sites/admin/all`);
        const sites = await res.json();

        const tbody = document.getElementById('sites-table');
        tbody.innerHTML = sites.map(site => `
            <tr>
                <td>${site.name}</td>
                <td>${site.nameAr}</td>
                <td>${site.city}</td>
                <td>${site.phone}</td>
                <td>
                    <span class="status ${site.isActive ? 'published' : 'draft'}">
                        ${site.isActive ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td>
                    <button class="btn-danger btn-small" onclick="deleteOfflineSite('${site._id}')">Delete</button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Error loading offline sites:', err);
    }
}

document.getElementById('create-site-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    data.isActive = formData.get('isActive') === 'on';

    try {
        const res = await fetch(`${API_BASE}/offline-sites`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            alert('Offline site added successfully');
            e.target.reset();
            loadOfflineSites();
        } else {
            const result = await res.json();
            alert(result.message || 'Failed to add offline site');
        }
    } catch (err) {
        alert('Error: ' + err.message);
    }
});

async function deleteOfflineSite(id) {
    if (!confirm('Are you sure you want to delete this offline site?')) return;

    try {
        const res = await fetch(`${API_BASE}/offline-sites/${id}`, { method: 'DELETE' });
        if (res.ok) {
            alert('Offline site deleted');
            loadOfflineSites();
        }
    } catch (err) {
        alert('Error deleting offline site: ' + err.message);
    }
}
