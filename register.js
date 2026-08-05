document.addEventListener("DOMContentLoaded", () => {

    const registerForm = document.getElementById("registerForm");
    const message = document.getElementById("message");

    registerForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        // ===========================
        // School Information
        // ===========================

        const school_name = document.getElementById("school-name").value.trim();
        const school_email = document.getElementById("school-email").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const address = document.getElementById("address").value.trim();
        const school_type = document.getElementById("school-type").value;
        const academic_session = document.getElementById("academic-session").value.trim();
        const current_term = document.getElementById("current-term").value;
        const school_motto = document.getElementById("school-motto").value.trim();
        const website = document.getElementById("school-website").value.trim();

        // Logo (We'll upload later)
        const logo = "";

        // ===========================
        // Principal Information
        // ===========================

        const principal_name = document.getElementById("principal-name").value.trim();
        const principal_email = document.getElementById("principal-email").value.trim();

        // ===========================
        // Password
        // ===========================

        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirm-password").value;

        // ===========================
        // Validation
        // ===========================

        if (
            !school_name ||
            !school_email ||
            !phone ||
            !address ||
            !school_type ||
            !academic_session ||
            !current_term ||
            !principal_name ||
            !principal_email ||
            !password ||
            !confirmPassword
        ) {
            message.style.color = "red";
            message.textContent = "Please fill all required fields.";
            return;
        }

        if (password.length < 6) {
            message.style.color = "red";
            message.textContent = "Password must be at least 6 characters.";
            return;
        }

        if (password !== confirmPassword) {
            message.style.color = "red";
            message.textContent = "Passwords do not match.";
            return;
        }

        // ===========================
        // Data
        // ===========================

        const data = {

            school_name,
            school_email,
            phone,
            address,
            school_type,
            academic_session,
            current_term,
            school_motto,
            website,
            logo,

            principal_name,
            principal_email,

            password

        };

        try {

            message.style.color = "blue";
            message.textContent = "Creating school account...";

            const response = await fetch(
                "https://edutrust-15ii.onrender.com/api/auth/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(data)
                }
            );

            const result = await response.json();

            if (result.success) {

                message.style.color = "green";
                message.textContent = result.message;

                setTimeout(() => {

                    window.location.href = "login.html";

                }, 1500);

            } else {

                message.style.color = "red";
                message.textContent = result.message;

            }

        } catch (err) {

            console.error(err);

            message.style.color = "red";
            message.textContent =
                "Unable to connect to the server.";

        }

    });

});
