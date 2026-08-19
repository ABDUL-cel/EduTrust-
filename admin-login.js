/**
 * EduTrust Admin Login Handler
 * Authenticates user, stores JWT in localStorage, and handles dashboard redirection.
 */

const API_BASE_URL = 'https://edutrust-15ii.onrender.com/api';

document.addEventListener('DOMContentLoaded', () => {
    // If token already exists and is valid, redirect straight to dashboard
    const existingToken = localStorage.getItem('token');
    if (existingToken) {
        window.location.href = 'admin-dashboard.html';
        return;
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleAdminLogin);
    }
});

/**
 * Handle submit event for Super Admin login
 */
async function handleAdminLogin(e) {
    e.preventDefault();

    const usernameInput = document.getElementById('username').value.trim();
    const passwordInput = document.getElementById('password').value;
    const loginBtn = document.getElementById('loginBtn');
    const alertBox = document.getElementById('loginAlert');

    // Reset feedback alerts
    hideAlert(alertBox);

    if (!usernameInput || !passwordInput) {
        showAlert(alertBox, 'error', 'Please enter both username/email and password.');
        return;
    }

    // Set UI to loading state
    setLoadingState(loginBtn, true);

    try {
        const response = await fetch(`${API_BASE_URL}/admin/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: usernameInput,
                password: passwordInput
            })
        });

        const data = await response.json();

        if (response.ok && data.success && data.token) {
            showAlert(alertBox, 'success', 'Login successful! Redirecting...');

            // Save JWT token and admin details in client storage
            localStorage.setItem('token', data.token);
            localStorage.setItem('adminUser', JSON.stringify(data.admin));

            // Redirect to admin dashboard after short delay
            setTimeout(() => {
                window.location.href = 'admin-dashboard.html';
            }, 1000);
        } else {
            showAlert(alertBox, 'error', data.message || 'Invalid username or password.');
        }
    } catch (error) {
        console.error('Login Error:', error);
        showAlert(alertBox, 'error', 'Unable to connect to server. Check your network connection.');
    } finally {
        setLoadingState(loginBtn, false);
    }
}

/**
 * Toggle Button Loading Animation
 */
function setLoadingState(button, isLoading) {
    if (!button) return;
    if (isLoading) {
        button.disabled = true;
        button.dataset.originalText = button.innerHTML;
        button.innerHTML = `<span class="spinner"></span> <span>Authenticating...</span>`;
    } else {
        button.disabled = false;
        button.innerHTML = button.dataset.originalText || 'Sign In';
    }
}

/**
 * Display Alert Notification
 */
function showAlert(element, type, message) {
    if (!element) return;
    element.className = `login-alert ${type}`;
    element.textContent = message;
    element.style.display = 'block';
}

/**
 * Hide Alert Notification
 */
function hideAlert(element) {
    if (!element) return;
    element.className = 'login-alert';
    element.style.display = 'none';
}
