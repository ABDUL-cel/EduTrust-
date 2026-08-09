document.addEventListener("DOMContentLoaded", () => {

    const registerForm = document.getElementById("registerForm");
    const message = document.getElementById("message");

    if (!registerForm) {
        console.error("Registration form not found.");
        return;
    }

    registerForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        message.textContent = "Registering school...";
        message.style.color = "#333";

        // ==================================================
        // GET FORM VALUES
        // ==================================================

        const schoolName =
            document.getElementById("school-name")?.value.trim();

        const principalName =
            document.getElementById("owner-name")?.value.trim();

        const phone =
            document.getElementById("phone")?.value.trim();

        const schoolEmail =
            document.getElementById("email")?.value.trim();

        const address =
            document.getElementById("address")?.value.trim();

        const schoolType =
            document.getElementById("school-type")?.value.trim() || "";

        const academicSession =
            document.getElementById("academic-session")?.value.trim() || "";

        const currentTerm =
            document.getElementById("current-term")?.value.trim() || "";

        const schoolMotto =
            document.getElementById("school-motto")?.value.trim() || "";

        const website =
            document.getElementById("website")?.value.trim() || "";

        const logo =
            document.getElementById("logo")?.value.trim() || "";

        const password =
            document.getElementById("password")?.value;

        const confirmPassword =
            document.getElementById("confirm-password")?.value;

        // ==================================================
        // BASIC VALIDATION
        // ==================================================

        if (
            !schoolName ||
            !principalName ||
            !phone ||
            !schoolEmail ||
            !address ||
            !password ||
            !confirmPassword
        ) {
            message.textContent =
                "Please fill in all required fields.";

            message.style.color = "red";
            return;
        }

        // ==================================================
        // PASSWORD CHECK
        // ==================================================

        if (password.length < 6) {
            message.textContent =
                "Password must be at least 6 characters.";

            message.style.color = "red";
            return;
        }

        if (password !== confirmPassword) {
            message.textContent =
                "Passwords do not match.";

            message.style.color = "red";
            return;
        }

        // ==================================================
        // PRINCIPAL EMAIL
        //
        // For now the school email is used as the
        // principal login email.
        // ==================================================

        const principalEmail = schoolEmail;

        // ==================================================
        // REQUEST DATA
        // ==================================================

        const formData = {
            school_name: schoolName,
            school_email: schoolEmail,

            phone,
            address,

            school_type: schoolType,
            academic_session: academicSession,
            current_term: currentTerm,
            school_motto: schoolMotto,

            website,
            logo,

            principal_name: principalName,
            principal_email: principalEmail,

            password
        };

        console.log(
            "EduTrust registration payload:",
            formData
        );

        // ==================================================
        // SEND TO BACKEND
        // ==================================================

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

            const data = await response.json();

            console.log(
                "Registration response:",
                data
            );

            // ==================================================
            // SUCCESS
            // ==================================================

            if (response.ok && data.success) {

                message.textContent =
                    "School registered successfully! Redirecting to login...";

                message.style.color = "green";

                // Save returned school information temporarily
                if (data.school) {
                    localStorage.setItem(
                        "school",
                        JSON.stringify(data.school)
                    );
                }

                // Save returned user information temporarily
                if (data.user) {
                    localStorage.setItem(
                        "user",
                        JSON.stringify(data.user)
                    );
                }

                setTimeout(() => {
                    window.location.href = "login.html";
                }, 1500);

                return;
            }

            // ==================================================
            // BACKEND ERROR
            // ==================================================

            message.textContent =
                data.message ||
                "Registration failed. Please try again.";

            message.style.color = "red";

        } catch (error) {

            console.error(
                "Registration error:",
                error
            );

            message.textContent =
                "Unable to connect to EduTrust server. Please try again.";

            message.style.color = "red";
        }
    });
});
