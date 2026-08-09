document.addEventListener("DOMContentLoaded", () => {

    const registerForm =
        document.getElementById("registerForm");

    if (!registerForm) {
        console.error(
            "Registration form #registerForm was not found."
        );
        return;
    }

    registerForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const messageElement =
                document.getElementById("message");

            const getValue = (id) => {
                const element =
                    document.getElementById(id);

                return element
                    ? element.value.trim()
                    : "";
            };

            // --------------------------------------------------
            // Read fields
            // --------------------------------------------------

            const schoolName =
                getValue("school-name");

            const principalName =
                getValue("owner-name");

            const schoolEmail =
                getValue("email");

            const phone =
                getValue("phone");

            const address =
                getValue("address");

            const schoolType =
                getValue("school-type");

            const academicSession =
                getValue("academic-session");

            const currentTerm =
                getValue("current-term");

            const schoolMotto =
                getValue("school-motto");

            const website =
                getValue("website");

            const logo =
                getValue("logo");

            const password =
                getValue("password");

            const confirmPassword =
                getValue("confirm-password");

            // --------------------------------------------------
            // Frontend validation
            // --------------------------------------------------

            if (
                !schoolName ||
                !principalName ||
                !schoolEmail ||
                !phone ||
                !address ||
                !password ||
                !confirmPassword
            ) {

                if (messageElement) {
                    messageElement.textContent =
                        "Please fill in all required fields.";

                    messageElement.style.color = "red";
                }

                return;
            }

            // --------------------------------------------------
            // Password confirmation
            // --------------------------------------------------

            if (password !== confirmPassword) {

                if (messageElement) {
                    messageElement.textContent =
                        "Passwords do not match.";

                    messageElement.style.color = "red";
                }

                return;
            }

            // --------------------------------------------------
            // Show loading
            // --------------------------------------------------

            if (messageElement) {
                messageElement.textContent =
                    "Registering your school...";

                messageElement.style.color = "#333";
            }

            // --------------------------------------------------
            // Build backend payload
            // --------------------------------------------------

            const formData = {

                school_name: schoolName,

                school_email: schoolEmail,

                phone,

                address,

                school_type: schoolType,

                academic_session:
                    academicSession,

                current_term:
                    currentTerm,

                school_motto:
                    schoolMotto,

                website,

                logo,

                principal_name:
                    principalName,

                // Current registration design
                // uses school email for principal login.
                principal_email:
                    schoolEmail,

                password
            };

            console.log(
                "EDUTRUST REGISTRATION DATA:",
                {
                    ...formData,
                    password: "***"
                }
            );

            try {

                const response =
                    await fetch(
                        "https://edutrust-15ii.onrender.com/api/auth/register",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(
                                    formData
                                )
                        }
                    );

                const data =
                    await response.json();

                console.log(
                    "EDUTRUST REGISTRATION RESPONSE:",
                    data
                );

                // --------------------------------------------------
                // Successful registration
                // --------------------------------------------------

                if (
                    response.ok &&
                    data.success
                ) {

                    if (messageElement) {

                        messageElement.textContent =
                            "School registered successfully! Redirecting to login...";

                        messageElement.style.color =
                            "green";
                    }

                    // Save returned user data
                    if (data.user) {
                        localStorage.setItem(
                            "user",
                            JSON.stringify(
                                data.user
                            )
                        );
                    }

                    // Redirect
                    setTimeout(() => {

                        window.location.href =
                            "login.html";

                    }, 1500);

                    return;
                }

                // --------------------------------------------------
                // Backend error
                // --------------------------------------------------

                if (messageElement) {

                    messageElement.textContent =
                        data.message ||
                        "Registration failed. Please try again.";

                    messageElement.style.color =
                        "red";
                }

            } catch (error) {

                console.error(
                    "REGISTRATION NETWORK ERROR:",
                    error
                );

                if (messageElement) {

                    messageElement.textContent =
                        "Unable to connect to EduTrust server. Please try again.";

                    messageElement.style.color =
                        "red";
                }
            }
        }
    );
});
