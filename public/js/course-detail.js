// Course Detail JavaScript

// Auto-detect environment
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? '/api'
    : 'https://academy-website-test.vercel.app/api';

// Get course ID from URL
const urlParams = new URLSearchParams(window.location.search);
const courseId = urlParams.get('id');

if (!courseId) {
    alert('No course specified');
    window.location.href = '/user-dashboard.html';
}

// Load course details
async function loadCourseDetails() {
    try {
        const res = await fetch(`${API_BASE}/courses/${courseId}`, { credentials: 'include' });

        if (!res.ok) {
            throw new Error('Failed to load course');
        }

        const course = await res.json();

        // Update page content
        document.getElementById('courseName').textContent = course.name;
        document.getElementById('courseDescription').textContent = course.description;
        document.getElementById('courseDuration').textContent = course.duration;
        document.getElementById('courseLevel').textContent = course.level;
        document.getElementById('courseInstructor').textContent = course.instructor;
        document.getElementById('coursePrerequisites').textContent = course.prerequisites || 'None';
        document.getElementById('courseSyllabus').innerHTML = course.syllabus || 'To be announced';

        // Load enrollment status
        await loadEnrollmentStatus();
    } catch (err) {
        console.error('Error loading course:', err);
        alert('Failed to load course details');
    }
}

// Load enrollment status
async function loadEnrollmentStatus() {
    try {
        const res = await fetch(`${API_BASE}/courses/${courseId}/enrollment-status`, {
            credentials: 'include'
        });

        if (!res.ok) {
            // Not authenticated - show login prompt
            document.getElementById('enrollmentStatus').innerHTML = `
                <div class="alert info">
                    <p>Please <a href="/user-dashboard.html">login</a> to enroll in this course.</p>
                </div>
            `;
            return;
        }

        const data = await res.json();

        if (data.status === 'enrolled') {
            document.getElementById('enrollmentStatus').innerHTML = `
                <div class="alert success">
                    <span class="status-badge status-enrolled">✅ Enrolled</span>
                    <p style="margin-top: 1rem;">You are enrolled in this course!</p>
                </div>
            `;
        } else if (data.status === 'pending') {
            document.getElementById('enrollmentStatus').innerHTML = `
                <div class="alert warning">
                    <span class="status-badge status-pending">⏳ Pending Approval</span>
                    <p style="margin-top: 1rem;">Your enrollment request is awaiting admin approval.</p>
                    ${data.request.message ? `<p><strong>Your message:</strong> ${data.request.message}</p>` : ''}
                </div>
            `;
        } else if (data.status === 'rejected') {
            document.getElementById('enrollmentStatus').innerHTML = `
                <div class="alert error">
                    <span class="status-badge status-rejected">❌ Request Rejected</span>
                    <p style="margin-top: 1rem;">${data.request.adminNote || 'Your enrollment request was rejected.'}</p>
                    <button class="primary" onclick="showEnrollmentForm()">Request Again</button>
                </div>
            `;
        } else {
            // Not requested - show form
            showEnrollmentForm();
        }
    } catch (err) {
        console.error('Error loading enrollment status:', err);
        showEnrollmentForm();
    }
}

// Show enrollment form
function showEnrollmentForm() {
    document.getElementById('enrollmentStatus').style.display = 'none';
    document.getElementById('enrollmentForm').style.display = 'flex';
}

// File upload handling
const fileUploadArea = document.getElementById('fileUploadArea');
const fileInput = document.getElementById('paymentProof');
const imagePreview = document.getElementById('imagePreview');

// Click to upload
fileUploadArea.addEventListener('click', () => {
    fileInput.click();
});

// File input change
fileInput.addEventListener('change', (e) => {
    handleFileSelect(e.target.files[0]);
});

// Drag and drop
fileUploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    fileUploadArea.classList.add('dragover');
});

fileUploadArea.addEventListener('dragleave', () => {
    fileUploadArea.classList.remove('dragover');
});

fileUploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    fileUploadArea.classList.remove('dragover');

    const file = e.dataTransfer.files[0];
    if (file) {
        fileInput.files = e.dataTransfer.files;
        handleFileSelect(file);
    }
});

// Handle file selection
function handleFileSelect(file) {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
        imagePreview.src = e.target.result;
        imagePreview.style.display = 'block';
        fileUploadArea.querySelector('p').textContent = `✅ ${file.name} selected`;
    };
    reader.readAsDataURL(file);
}

// Form submission
document.getElementById('enrollmentForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.textContent;

    try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';

        const formData = new FormData();
        formData.append('paymentProof', fileInput.files[0]);
        formData.append('message', document.getElementById('message').value);

        const res = await fetch(`${API_BASE}/courses/${courseId}/request-enrollment`, {
            method: 'POST',
            credentials: 'include',
            body: formData
        });

        const result = await res.json();

        if (res.ok) {
            alert(result.message);
            window.location.reload();
        } else {
            alert(result.message || 'Failed to submit enrollment request');
        }
    } catch (err) {
        console.error('Error submitting enrollment:', err);
        alert('Error submitting enrollment request');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
});

// Load course details on page load
loadCourseDetails();
