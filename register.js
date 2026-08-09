
/* =========================================================
   EDUTRUST SCHOOL REGISTRATION
   Complete registration frontend
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("registerForm");
    const messageElement = document.getElementById("message");

    if (!registerForm) {
        console.error("EduTrust: registerForm was not found.");
        return;
    }

    function showMessage(message, color = "#333") {
        if (!messageElement) return;

        messageElement.textContent = message;
        messageElement.style.color = color;
    }

    registerForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        /* =====================================================
           GET FORM FIELDS
           ===================================================== */

        const schoolName =
            document.getElementById("school-name")?.value.trim() || "";

        const ownerName =
            document.getElementById("owner-name")?.value.trim() || "";

        const phone =
            document.getElementById("phone")?.value.trim() || "";

        const email =
            document.getElementById("email")?.value.trim().toLowerCase() || "";

        const address =
            document.getElementById("address")?.value.trim() || "";

        const password =
            document.getElementById("password")?.value || "";

        const confirmPassword =
            document.getElementById("confirm-password")?.value || "";

        const termsCheckbox =
            registerForm.querySelector('input[type="checkbox"]');

        /* =====================================================
           VALIDATE REQUIRED FIELDS
           ===================================================== */

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

        /* =====================================================
           TERMS & CONDITIONS
           ===================================================== */

        if (termsCheckbox && !termsCheckbox.checked) {
            showMessage(
                "Please agree to the EduTrust Terms & Conditions.",
                "red"
            );
            return;
        }

        /* =====================================================
           PASSWORD VALIDATION
           ===================================================== */

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

        /* =====================================================
           EMAIL VALIDATION
           ===================================================== */

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {
            showMessage(
                "Please enter a valid email address.",
                "red"
            );
            return;
        }

        /* =====================================================
           SUBMIT BUTTON
           ===================================================== */

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

        /* =====================================================
           BACKEND DATA
           ===================================================== */

        const formData = {
            school_name: schoolName,
            school_email: email,
            phone: phone,
            address: address,

            /*
             * These fields are optional in the current form.
             * We send empty values so the backend receives
             * a consistent structure.
             */
            school_type: "",
            academic_session: "",
            current_term: "",
            school_motto: "",

            /*
             * Principal / administrator account
             */
            principal_name: ownerName,
            principal_email: email,
            password: password
        };

        console.log(
            "EduTrust registration payload:",
            {
                ...formData,
                password: "[HIDDEN]"
            }
        );

        /* =====================================================
           SEND TO BACKEND
           ===================================================== */

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

            let data = {};

            try {
                data = await response.json();
            } catch (jsonError) {
                console.error(
                    "EduTrust: Invalid server response.",
                    jsonError
                );
            }

            console.log(
                "EduTrust registration response:",
                data
            );

            /* =================================================
               SUCCESS
               ================================================= */

            if (response.ok && data.success) {
                showMessage(
                    "School registered successfully! Redirecting to login...",
                    "green"
                );

                /*
                 * Clear any old session
                 */
                localStorage.removeItem("token");
                localStorage.removeItem("user");

                setTimeout(() => {
                    window.location.href = "login.html";
                }, 1500);

                return;
            }

            /* =================================================
               BACKEND ERROR
               ================================================= */

            showMessage(
                data.message ||
                "Registration failed. Please try again.",
                "red"
            );

        } catch (error) {
            console.error(
                "EduTrust registration error:",
                error
            );

            showMessage(
                "Unable to connect to EduTrust. Please try again.",
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
});
