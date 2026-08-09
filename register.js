document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("registerForm");
    const messageElement = document.getElementById("message");

    if (!registerForm) {
        console.error("Registration form #registerForm was not found.");
        return;
    }

    registerForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const schoolName = document
            .getElementById("school-name")
            ?.value.trim();

        const ownerName = document
            .getElementById("owner-name")
            ?.value.trim();

        const phone = document
            .getElementById("phone")
            ?.value.trim();

        const email = document
            .getElementById("email")
            ?.value.trim()
            .toLowerCase();

        const address = document
            .getElementById("address")
            ?.value.trim();

        const password = document
            .getElementById("password")
            ?.value;

        const confirmPassword = document
            .getElementById("confirm-password")
            ?.value;

        // =========================
        // Basic validation
        // =========================

        if (
            !schoolName ||
            !ownerName ||
            !phone ||
            !email ||
            !address ||
            !password ||
            !confirmPassword
        ) {
            showMessage(
                "Please fill in all required fields.",
                "red"
            );
            return;
        }

        if (password.length < 6) {
            showMessage(
                "Password must be at least 6 characters.",
                "red"
            );
            return;
        }

        if (password !== confirmPassword) {
            showMessage(
                "Passwords do not match.",
                "red"
            );
            return;
        }

        // =========================
        // Disable button
        // =========================

        const submitButton =
            registerForm.querySelector(
                'button[type="submit"]'
            );

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "Creating Account...";
        }

        showMessage(
            "Creating your EduTrust school account...",
            "#333"
        );

        // =========================
        // Backend payload
        // =========================

        const formData = {
            school_name: schoolName,
            school_email: email,
            phone: phone,
            address: address,

            // Optional school fields
            school_type: "",
            academic_session: "",
            current_term: "",
            school_motto: "",

            // Principal account
            principal_name: ownerName,
            principal_email: email,
            password: password
        };

        try {
            const response = await fetch(
                "https://edutrust-15ii.onrender.com/api/auth/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(formData)
                }
            );

            let data;

            try {
                data = await response.json();
            } catch (jsonError) {
                data = {
                    success: false,
                    message:
                        "The server returned an invalid response."
                };
            }

            console.log("Registration response:", data);

            if (response.ok && data.success) {
                showMessage(
                    "School registered successfully! Redirecting to login...",
                    "green"
                );

                // Clear old authentication data
                localStorage.removeItem("token");
                localStorage.removeItem("user");

                setTimeout(() => {
                    window.location.href = "login.html";
                }, 1500);

                return;
            }

            showMessage(
                data.message ||
                    "Registration failed. Please try again.",
                "red"
            );

        } catch (error) {
            console.error(
                "Registration request failed:",
                error
            );

            showMessage(
                "Unable to connect to EduTrust server. Please try again.",
                "red"
            );
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent =
                    "Create School Account";
            }
        }
    });

    function showMessage(message, color) {
        if (!messageElement) return;

        messageElement.textContent = message;
        messageElement.style.color = color;
    }
});
