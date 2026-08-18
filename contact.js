document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;

    // Input fields
    const fullName = document.getElementById('fullName');
    const email = document.getElementById('email');
    const phone = document.getElementById('phone');
    const userRole = document.getElementById('userRole');
    const subject = document.getElementById('subject');
    const message = document.getElementById('message');
    const submitBtn = contactForm.querySelector('.submit-btn');

    // Validation patterns
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const phoneRegex = /^[0-9+\s()-]{7,15}$/; // Allows optional +, spaces, dashes, 7-15 digits

    // Helper: Show field error message
    const showError = (input, msg) => {
        const formGroup = input.parentElement;
        formGroup.classList.add('error');
        formGroup.classList.remove('success');

        let errorDisplay = formGroup.querySelector('.error-msg');
        if (!errorDisplay) {
            errorDisplay = document.createElement('span');
            errorDisplay.className = 'error-msg';
            formGroup.appendChild(errorDisplay);
        }
        errorDisplay.textContent = msg;
    };

    // Helper: Mark field as valid
    const showSuccess = (input) => {
        const formGroup = input.parentElement;
        formGroup.classList.remove('error');
        formGroup.classList.add('success');

        const errorDisplay = formGroup.querySelector('.error-msg');
        if (errorDisplay) {
            errorDisplay.remove();
        }
    };

    // Field Validators
    const validateName = () => {
        const value = fullName.value.trim();
        if (value === '') {
            showError(fullName, 'Full name is required.');
            return false;
        } else if (value.length < 3) {
            showError(fullName, 'Name must be at least 3 characters.');
            return false;
        }
        showSuccess(fullName);
        return true;
    };

    const validateEmail = () => {
        const value = email.value.trim();
        if (value === '') {
            showError(email, 'Email address is required.');
            return false;
        } else if (!emailRegex.test(value)) {
            showError(email, 'Please enter a valid email address.');
            return false;
        }
        showSuccess(email);
        return true;
    };

    const validatePhone = () => {
        const value = phone.value.trim();
        // Phone is optional, but if entered, it must match phone format
        if (value !== '' && !phoneRegex.test(value)) {
            showError(phone, 'Please enter a valid phone number.');
            return false;
        }
        showSuccess(phone);
        return true;
    };

    const validateSelect = (selectEl, errorMsg) => {
        if (!selectEl.value) {
            showError(selectEl, errorMsg);
            return false;
        }
        showSuccess(selectEl);
        return true;
    };

    const validateMessage = () => {
        const value = message.value.trim();
        if (value === '') {
            showError(message, 'Message details are required.');
            return false;
        } else if (value.length < 10) {
            showError(message, 'Please provide more details (at least 10 characters).');
            return false;
        }
        showSuccess(message);
        return true;
    };

    // Real-time input validation listeners
    fullName.addEventListener('input', validateName);
    email.addEventListener('input', validateEmail);
    phone.addEventListener('input', validatePhone);
    userRole.addEventListener('change', () => validateSelect(userRole, 'Please select your role.'));
    subject.addEventListener('change', () => validateSelect(subject, 'Please select an inquiry category.'));
    message.addEventListener('input', validateMessage);

    // Form Submission Handler
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Run all validations
        const isNameValid = validateName();
        const isEmailValid = validateEmail();
        const isPhoneValid = validatePhone();
        const isRoleValid = validateSelect(userRole, 'Please select your role.');
        const isSubjectValid = validateSelect(subject, 'Please select an inquiry category.');
        const isMessageValid = validateMessage();

        const isFormValid = isNameValid && isEmailValid && isPhoneValid && isRoleValid && isSubjectValid && isMessageValid;

        if (!isFormValid) {
            // Scroll to the first error
            const firstError = contactForm.querySelector('.form-group.error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        // Collect Payload
        const formData = {
            fullName: fullName.value.trim(),
            email: email.value.trim(),
            phone: phone.value.trim(),
            userRole: userRole.value,
            subject: subject.value,
            message: message.value.trim()
        };

        // Update Button UI to Loading State
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>Sending...</span>`;

        try {
            /* 
               If sending to a live Node.js Express backend endpoint:
               const response = await fetch('/api/contact', {
                   method: 'POST',
                   headers: { 'Content-Type': 'application/json' },
                   body: JSON.stringify(formData)
               });
            */

            // Simulated API network delay (1.5 seconds)
            await new Promise((resolve) => setTimeout(resolve, 1500));

            // Display Success Alert Banner
            showFormFeedback('success', 'Thank you! Your message has been sent successfully. Our team will contact you shortly.');

            // Reset form fields
            contactForm.reset();
            document.querySelectorAll('.form-group').forEach((group) => {
                group.classList.remove('success', 'error');
            });

        } catch (error) {
            showFormFeedback('error', 'Failed to send message. Please check your connection and try again.');
        } finally {
            // Restore button
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    });

    // Helper: Form status banner
    function showFormFeedback(type, messageText) {
        let feedbackBanner = document.getElementById('formFeedback');
        if (!feedbackBanner) {
            feedbackBanner = document.createElement('div');
            feedbackBanner.id = 'formFeedback';
            contactForm.prepend(feedbackBanner);
        }

        feedbackBanner.className = `form-feedback feedback-${type}`;
        feedbackBanner.textContent = messageText;

        feedbackBanner.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Auto hide after 6 seconds
        setTimeout(() => {
            if (feedbackBanner) feedbackBanner.remove();
        }, 6000);
    }
});
