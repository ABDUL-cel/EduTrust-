/**
 * Global cache for currently loaded inquiries
 */
let cachedInquiries = [];
let activeInquiryId = null;

/**
 * Fetch and render inquiry list
 */
async function fetchInquiries() {
    const tableBody = document.getElementById('inquiriesTableBody');
    if (!tableBody) return;

    try {
        const response = await fetch(`${API_BASE_URL}/admin/inquiries?limit=15`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
            }
        });

        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

        const result = await response.json();

        if (result.success && result.data) {
            cachedInquiries = result.data; // Cache array for fast modal lookup
            renderInquiriesTable(cachedInquiries);
        }
    } catch (error) {
        console.error('Failed to fetch inquiries:', error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; color: #ef4444; padding: 20px;">
                    Failed to load inquiries.
                </td>
            </tr>
        `;
    }
}

/**
 * Populate the inquiries summary table
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
                <td>${escapeHTML(item.subject || 'General Inquiry')}</td>
                <td><span class="status-pill ${statusClass}">${escapeHTML(item.status)}</span></td>
                <td>
                    <button class="action-btn" onclick="openInquiryModal('${item._id}')">
                        View Details
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * Open Modal and Populate Inquiry Details
 */
function openInquiryModal(inquiryId) {
    const item = cachedInquiries.find(i => i._id === inquiryId);
    if (!item) return;

    activeInquiryId = item._id;

    // Populate modal DOM fields
    document.getElementById('modalSenderName').textContent = item.fullName || 'N/A';
    document.getElementById('modalSenderEmail').textContent = item.email || 'N/A';
    document.getElementById('modalSenderPhone').textContent = item.phone || 'Not Provided';
    document.getElementById('modalUserRole').textContent = item.userRole || 'User';
    document.getElementById('modalSubject').textContent = item.subject || 'General Inquiry';
    document.getElementById('modalMessageBody').textContent = item.message || '';
    document.getElementById('modalStatusSelect').value = item.status || 'Pending';

    // Format creation timestamp
    const dateObj = new Date(item.createdAt);
    document.getElementById('modalSubmittedDate').textContent = dateObj.toLocaleString('en-GB', {
        dateStyle: 'medium',
        timeStyle: 'short'
    });

    // Configure mailto link for direct reply
    const mailtoSubject = encodeURIComponent(`Re: [EduTrust] ${item.subject || 'Your Inquiry'}`);
    const mailtoBody = encodeURIComponent(`\n\n--- Original Message ---\nFrom: ${item.fullName}\nMessage: ${item.message}`);
    document.getElementById('emailReplyBtn').href = `mailto:${item.email}?subject=${mailtoSubject}&body=${mailtoBody}`;

    // Attach save event listener
    document.getElementById('updateStatusBtn').onclick = handleStatusUpdate;

    // Display overlay
    document.getElementById('inquiryModal').style.display = 'flex';
}

/**
 * Close Modal
 */
function closeInquiryModal() {
    document.getElementById('inquiryModal').style.display = 'none';
    activeInquiryId = null;
}

/**
 * Save updated ticket status to backend
 */
async function handleStatusUpdate() {
    if (!activeInquiryId) return;

    const newStatus = document.getElementById('modalStatusSelect').value;
    const saveBtn = document.getElementById('updateStatusBtn');

    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';

    try {
        const response = await fetch(`${API_BASE_URL}/admin/inquiries/${activeInquiryId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
            },
            body: JSON.stringify({ status: newStatus })
        });

        const result = await response.json();

        if (response.ok && result.success) {
            closeInquiryModal();
            // Refresh table and counter metrics
            fetchInquiries();
            if (typeof fetchDashboardStats === 'function') fetchDashboardStats();
        } else {
            alert(result.message || 'Failed to update inquiry status.');
        }
    } catch (error) {
        console.error('Error updating inquiry status:', error);
        alert('Network error while updating status.');
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Status';
    }
}

// Close modal when user clicks backdrop outside modal-card
window.addEventListener('click', (e) => {
    const modal = document.getElementById('inquiryModal');
    if (e.target === modal) {
        closeInquiryModal();
    }
});
