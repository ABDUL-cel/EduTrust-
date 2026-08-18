/**
 * EduTrust Super Admin Dashboard Script
 * Handles real-time API fetches for dashboard metrics and inquiry tables.
 */

const API_BASE_URL = 'https://edutrust-backend.onrender.com/api'; // Replace with your backend URL if different

document.addEventListener('DOMContentLoaded', () => {
    fetchDashboardStats();
    fetchInquiries();
});

/**
 * Fetch and display top summary metrics (Cards)
 */
async function fetchDashboardStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/dashboard-stats`, {
            headers: {
                'Content-Type': 'application/json',
                // Include authorization header if JWT auth is enabled
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success && result.data) {
            const { totalSchools, totalUsers, resultsProcessed, openInquiries } = result.data;

            // Update UI elements dynamically
            animateCounter('totalSchoolsCount', totalSchools);
            animateCounter('totalUsersCount', totalUsers);
            animateCounter('resultsProcessedCount', resultsProcessed);
            animateCounter('openInquiriesCount', openInquiries);
        }
    } catch (error) {
        console.error('Failed to load dashboard metrics:', error);
    }
}

/**
 * Fetch and populate the recent contact/support inquiries table
 */
async function fetchInquiries() {
    const tableBody = document.getElementById('inquiriesTableBody');
    if (!tableBody) return;

    try {
        const response = await fetch(`${API_BASE_URL}/admin/inquiries?limit=10`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success && result.data) {
            renderInquiriesTable(result.data);
        }
    } catch (error) {
        console.error('Failed to load inquiries:', error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; color: #ef4444; padding: 20px;">
                    Failed to load inquiries from server.
                </td>
            </tr>
        `;
    }
}

/**
 * Render array of inquiry records into HTML table rows
 */
function renderInquiriesTable(inquiries) {
    const tableBody = document.getElementById('inquiriesTableBody');

    if (!inquiries || inquiries.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; color: #64748b; padding: 20px;">
                    No inquiries received yet.
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = inquiries.map(item => {
        // Date formatting
        const formattedDate = new Date(item.createdAt).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });

        // Pill status styling mapping
        let statusClass = 'pending';
        if (item.status === 'In Progress') statusClass = 'active';
        if (item.status === 'Resolved') statusClass = 'resolved';

        return `
            <tr>
                <td>
                    <strong>${escapeHTML(item.fullName)}</strong><br>
                    <small class="text-muted">${escapeHTML(item.email)}</small>
                </td>
                <td>${escapeHTML(item.userRole)}</td>
                <td>${escapeHTML(item.subject || 'General')}</td>
                <td><span class="status-pill ${statusClass}">${escapeHTML(item.status)}</span></td>
                <td>
                    <button class="action-btn" onclick="openInquiryModal('${item._id}', '${escapeHTML(item.fullName)}', '${escapeHTML(item.message)}')">
                        View
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * Update an inquiry status (New -> In Progress -> Resolved)
 */
async function updateStatus(inquiryId, newStatus) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/inquiries/${inquiryId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
            },
            body: JSON.stringify({ status: newStatus })
        });

        const result = await response.json();

        if (result.success) {
            // Refresh counts and inquiry table
            fetchDashboardStats();
            fetchInquiries();
        } else {
            alert(result.message || 'Status update failed.');
        }
    } catch (error) {
        console.error('Error updating inquiry status:', error);
    }
}

/**
 * Helper function for number counter animation
 */
function animateCounter(elementId, targetValue) {
    const element = document.getElementById(elementId);
    if (!element) return;

    let currentValue = 0;
    const increment = Math.ceil(targetValue / 25) || 1;

    const timer = setInterval(() => {
        currentValue += increment;
        if (currentValue >= targetValue) {
            element.textContent = Number(targetValue).toLocaleString();
            clearInterval(timer);
        } else {
            element.textContent = currentValue.toLocaleString();
        }
    }, 20);
}

/**
 * Utility to prevent XSS string injections
 */
function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}
