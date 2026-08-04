document.getElementById('registerForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const messageElement = document.getElementById('message');
    messageElement.textContent = 'Registering school...';
    messageElement.style.color = '#333';

    // 1. Password validation check
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (password !== confirmPassword) {
        messageElement.textContent = 'Passwords do not match.';
        messageElement.style.color = 'red';
        return;
    }

    // 2. Map HTML input IDs to backend schema field names
    const formData = {
        school_name: document.getElementById('school-name').value,
        school_email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value,
        school_type: document.getElementById('school-type').value,
        academic_session: document.getElementById('academic-session').value,
        current_term: document.getElementById('current-term').value,
        school_motto: document.getElementById('school-motto').value || '',
        principal_name: document.getElementById('owner-name').value,
        principal_email: document.getElementById('email').value, // Using school email for admin login
        password: password
    };

    try {
        // 3. Make POST request to Render backend API
        const response = await fetch('https://edutrust-15ii.onrender.com/api/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok && data.success) {
            messageElement.textContent = 'School registered successfully! Redirecting to login...';
            messageElement.style.color = 'green';

            // Optional: Save JWT token if returned by backend
            if (data.token) {
                localStorage.setItem('token', data.token);
            }

            // Redirect to login page after 2 seconds
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            // Display backend error message (e.g. "School already exists")
            messageElement.textContent = data.message || 'Registration failed. Please try again.';
            messageElement.style.color = 'red';
        }
    } catch (error) {
        console.error('Error during registration:', error);
        messageElement.textContent = 'Network error or server waking up. Please try again in a few seconds.';
        messageElement.style.color = 'red';
    }
});
