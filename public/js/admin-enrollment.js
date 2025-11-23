// Admin Enrollment Requests for Specific Course

// Auto-detect environment
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? '/api'
    : 'https://academy-website-test.vercel.app/api';

// Get course ID and name from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const courseId = urlParams.get('courseId');
const courseName = urlParams.get('courseName');

// Set course name in the header
if (courseName) {
    document.getElementById('courseName').textContent = courseName;
}

// Load enrollment requests for this course
async function loadRequests() {
    if (!courseId) {
        alert('No course ID provided');
        window.location.href = '/admin-dashboard.html';
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/courses/${courseId}/enrollment-requests`, {
            credentials: 'include'
        });

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        const requests = await res.json();
        const tbody = document.querySelector('#requestsTable tbody');

        if (!Array.isArray(requests) || requests.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:2rem; color:#6b7280">No pending enrollment requests for this course</td></tr>';
            return;
        }

        tbody.innerHTML = requests.map(req => `
            <tr>
                <td>${req.user ? req.user.name : 'Unknown'}</td>
                <td>${req.user ? req.user.email : 'N/A'}</td>
                <td>${req.message || '-'}</td>
                <td>
                    <a href="${req.paymentProofUrl}" target="_blank" style="color:#2563eb; text-decoration:underline">View Proof</a>
                </td>
                <td>
                    <span class="status-badge status-${req.status}">${req.status}</span>
                </td>
                <td class="actions">
                    ${req.status === 'pending' ? `
                        <button onclick="approveRequest('${req._id}')" style="background:#4caf50; color:white; border:none; padding:6px 12px; border-radius:4px; cursor:pointer">Approve</button>
                        <button onclick="rejectRequest('${req._id}')" style="background:#f44336; color:white; border:none; padding:6px 12px; border-radius:4px; cursor:pointer">Reject</button>
                    ` : '<span style="color:#9ca3af">Processed</span>'}
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Error loading requests:', err);
        const tbody = document.querySelector('#requestsTable tbody');
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:2rem; color:#ef4444">Error loading requests. Please try again.</td></tr>';
    }
}

async function approveRequest(requestId) {
    if (!confirm('Approve this enrollment request?')) return;

    try {
        const res = await fetch(`${API_BASE}/courses/admin/enrollment-requests/${requestId}/approve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ adminNote: 'Approved' })
        });

        const data = await res.json();

        if (res.ok) {
            alert('Request approved successfully!');
            loadRequests(); // Reload the table
        } else {
            alert(data.message || 'Error approving request');
        }
    } catch (err) {
        alert('Error: ' + err.message);
    }
}

async function rejectRequest(requestId) {
    const reason = prompt('Enter reason for rejection (optional):');
    if (reason === null) return; // User cancelled

    try {
        const res = await fetch(`${API_BASE}/courses/admin/enrollment-requests/${requestId}/reject`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ adminNote: reason || 'Rejected' })
        });

        const data = await res.json();

        if (res.ok) {
            alert('Request rejected.');
            loadRequests(); // Reload the table
        } else {
            alert(data.message || 'Error rejecting request');
        }
    } catch (err) {
        alert('Error: ' + err.message);
    }
}

// Load requests when page loads
document.addEventListener('DOMContentLoaded', loadRequests);
