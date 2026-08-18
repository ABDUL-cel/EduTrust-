/**
 * EduTrust Contact Form Script
 * Submits form data to the Express backend endpoint (POST /api/contact)
 */

// Replace with your active backend service URL
const API_BASE_URL = 'https://edutrust-backend.onrender.com/api';

document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }
});

/**
 * Handles contact form submission
 * @param {Event} e 
 */
async function handleContactSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const submitBtn = document.getElementById('submitBtn');
    const alertBox = document.getElementById('formAlert');

    // Reset feedback states
    clearAlert(alertBox);

    // Extract input fields
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone')?.value.trim() || '';
    const userRole = document.getElementById('userRole').value;
    const subject = document.getElementById('subject')?.value.trim() || 'General Inquiry';
    const message = document.getElementById('message').value.trim();

    // Basic Client-side Validation
    if (!fullName || !email || !userRole || !message) {
        showAlert(alertBox, 'error', 'Please fill in all required fields.');
        return;
    }

    if (!isValidEmail(email)) {
        showAlert(alertBox, 'error', 'Please enter a valid email address.');
        return;
    }

    // Set UI to loading state
    setSubmittingState(submitBtn, true);

    try {
        const response = await fetch(`${API_BASE_URL}/contact`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fullName,
                email,
                phone,
                userRole,
                subject,
                message
            })
        });

        const data = await response.json();

        if (response.ok && (data.success || data.status === 'success')) {
            showAlert(alertBox, 'success', data.message || 'Thank you! Your message has been sent successfully. We will contact you shortly.');
            form.reset(); // Clear input fields on success
        } else {
            showAlert(alertBox, 'error', data.message || 'Unable to submit your message. Please try again.');
        }
    } catch (error) {
        console.error('Contact Form Submission Error:', error);
        showAlert(alertBox, 'error', 'Network error. Please check your internet connection and try again.');
    } finally {
        setSubmittingState(submitBtn, false);
    }
}

/**
 * Utility: Toggle submit button loading state
 */
function setSubmittingState(button, isSubmitting) {
    if (!button) return;
    if (isSubmitting) {
        button.disabled = true;
        button.dataset.originalText = button.innerHTML;
        button.innerHTML = `
            <span class="spinner"></span>
            <span>Sending...</span>
        `;
    } else {
        button.disabled = false;
        button.innerHTML = button.dataset.originalText || 'Send Message';
    }
}

/**
 * Utility: Show status alert banner
 */
function showAlert(alertContainer, type, text) {
    if (!alertContainer) return;
    alertContainer.className = `form-alert ${type}`;
    alertContainer.textContent = text;
    alertContainer.style.display = 'block';
}

/**
 * Utility: Clear status alert banner
 */
function clearAlert(alertContainer) {
    if (!alertContainer) return;
    alertContainer.className = 'form-alert';
    alertContainer.textContent = '';
    alertContainer.style.display = 'none';
}

/**
 * Utility: Email pattern validation
 */
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}
