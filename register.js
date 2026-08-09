document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("registerForm");
    const message = document.getElementById("message");

    if (!registerForm) {
        console.error("registerForm not found");
        return;
    }

    registerForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (message) {
            message.textContent = "Registering...";
            message.style.color = "#333";
        }

        // Read fields directly from the form
        const getValue = (id) => {
            const element = document.getElementById(id);
            return element ? element.value.trim() : "";
        };

        const schoolName = getValue("school-name");
        const principalName = getValue("owner-name");
        const phone = getValue("phone");
        const schoolEmail = getValue("email");
        const address = getValue("address");

        const schoolType = getValue("school-type");
        const academicSession = getValue("academic-session");
        const currentTerm = getValue("current-term");
        const schoolMotto = getValue("school-motto");
        const website = getValue("website");
        const logo = getValue("logo");

        const passwordElement =
            document.getElementById("password");

        const confirmPasswordElement =
            document.getElementById("confirm-password");

        const password =
            passwordElement ? passwordElement.value : "";

        const confirmPassword =
            confirmPasswordElement
                ? confirmPasswordElement.value
                : "";

        console.log("Registration fields:", {
            schoolName,
            principalName,
            phone,
            schoolEmail,
            address,
            schoolType,
            academicSession,
            currentTerm,
            schoolMotto,
            website,
            logo,
            hasPassword: !!password,
            hasConfirmPassword: !!confirmPassword
        });

        // Only check the fields that MUST exist
        // for the backend registration.
        if (
            !schoolName ||
            !principalName ||
            !schoolEmail ||
            !password ||
            !confirmPassword
        ) {
            if (message) {
                message.textContent =
                    "Please enter the school name, principal name, email and password.";
                message.style.color = "red";
            }

            return;
        }

        if (password !== confirmPassword) {
            if (message) {
                message.textContent =
                    "Passwords do not match.";
                message.style.color = "red";
            }

            return;
        }

        if (password.length < 6) {
            if (message) {
                message.textContent =
                    "Password must be at least 6 characters.";
                message.style.color = "red";
            }

            return;
        }

        // IMPORTANT:
        // The principal login email is the same
        // email entered in the registration form.
        const payload = {
            school_name: schoolName,
            school_email: schoolEmail,

            phone: phone,
            address: address,

            school_type: schoolType,
            academic_session: academicSession,
            current_term: currentTerm,
            school_motto: schoolMotto,

            website: website,
            logo: logo,

            principal_name: principalName,
            principal_email: schoolEmail,

            password: password
        };

        console.log(
            "Sending EduTrust registration:",
            payload
        );

        try {
            const response = await fetch(
                "https://edutrust-15ii.onrender.com/api/auth/register",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(payload)
                }
            );

            const data = await response.json();

            console.log(
                "EduTrust server response:",
                data
            );

            if (response.ok && data.success) {

                if (message) {
                    message.textContent =
                        "Registration successful! Redirecting to login...";
                    message.style.color = "green";
                }

                if (data.school) {
                    localStorage.setItem(
                        "school",
                        JSON.stringify(data.school)
                    );
                }

                if (data.user) {
                    localStorage.setItem(
                        "user",
                        JSON.stringify(data.user)
                    );
                }

                setTimeout(() => {
                    window.location.href = "login.html";
                }, 1200);

                return;
            }

            // Show the REAL backend error
            if (message) {
                message.textContent =
                    data.message ||
                    "Registration failed.";
                message.style.color = "red";
            }

        } catch (error) {

            console.error(
                "EduTrust registration error:",
                error
            );

            if (message) {
                message.textContent =
                    "Unable to connect to EduTrust server.";
                message.style.color = "red";
            }
        }
    });
});
