/* =========================================================
   EDUTRUST REGISTRATION
   COMPLETE FRONTEND
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("registerForm");
    const message = document.getElementById("message");
    const submitButton =
        form?.querySelector('button[type="submit"]');

    if (!form) {
        console.error("EduTrust: registerForm not found.");
        return;
    }

    function showMessage(text, color = "#333") {
        if (!message) return;

        message.textContent = text;
        message.style.color = color;
    }

    function value(id) {
        const element = document.getElementById(id);

        if (!element) {
            return "";
        }

        return String(element.value || "").trim();
    }

    form.addEventListener("submit", async (event) => {

        event.preventDefault();

        /* =====================================================
           READ ONLY THE FIELDS THAT ACTUALLY EXIST
        ===================================================== */

        const schoolName = value("school-name");
        const ownerName = value("owner-name");
        const phone = value("phone");
        const email = value("email").toLowerCase();
        const address = value("address");
        const password = value("password");
        const confirmPassword = value("confirm-password");
        const principalName = value("principal-name");
const principalEmail = value("principal-email").toLowerCase();
const schoolEmail = value("school-email").toLowerCase();

        const termsCheckbox =
            form.querySelector('input[type="checkbox"]');

        /* =====================================================
           VALIDATION
        ===================================================== */

        const missingFields = [];

        if (!schoolName) {
            missingFields.push("School Name");
        }

        if (!ownerName) {
            missingFields.push("Owner / Admin Name");
        }

        if (!phone) {
            missingFields.push("Phone Number");
        }

        if (!email) {
            missingFields.push("School Email");
        }

        if (!address) {
            missingFields.push("School Address");
        }

        if (!password) {
            missingFields.push("Password");
        }
       if (!principalName) {
  missingFields.push("Principal Name");
}

if (!principalEmail) {
  missingFields.push("Principal Email");
}

if (!schoolEmail) {
  missingFields.push("School Email");
}


        if (!confirmPassword) {
            missingFields.push("Confirm Password");
        }

        if (missingFields.length > 0) {
            showMessage(
                "Missing: " + missingFields.join(", "),
                "red"
            );
            return;
        }

        if (
            termsCheckbox &&
            !termsCheckbox.checked
        ) {
            showMessage(
                "Please agree to the EduTrust Terms & Conditions.",
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
           BUTTON
        ===================================================== */

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent =
                "Creating Account...";
        }

        showMessage(
            "Connecting to EduTrust...",
            "#333"
        );

        /* =====================================================
           EXACT BACKEND PAYLOAD
           MATCHES authController
        ===================================================== */

        const payload = {
            school_name: name,
            school_email: email,
            phone: phone,
            address: address,

            school_type: "",
            academic_session: "",
            current_term: "",
            school_motto: "",
            website: "",
            logo: "",

            principal_name: principalName,
            principal_email: principalEmail,
            password: password
        };

        console.log(
            "EduTrust registration payload:",
            {
                ...payload,
                password: "[HIDDEN]"
            }
        );

        /* =====================================================
           SEND REQUEST
        ===================================================== */

        try {

            const response = await fetch(
                "https://edutrust-15ii.onrender.com/api/auth/register",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(payload)
                }
            );

            let data = {};

            try {
                data = await response.json();
            } catch (error) {
                console.error(
                    "EduTrust invalid JSON response:",
                    error
                );
            }

            console.log(
                "EduTrust registration response:",
                data
            );

            /* =================================================
               SUCCESS
            ================================================= */

            if (
                response.ok &&
                data.success === true
            ) {

                showMessage(
                    "Registration successful! Redirecting to login...",
                    "green"
                );

                localStorage.removeItem("token");
                localStorage.removeItem("user");

                setTimeout(() => {
                    window.location.href =
                        "login.html";
                }, 1500);

                return;
            }

            /* =================================================
               BACKEND ERROR
            ================================================= */

            showMessage(
                data.message ||
                `Registration failed. Server returned ${response.status}.`,
                "red"
            );

        } catch (error) {

            console.error(
                "EduTrust registration request failed:",
                error
            );

            showMessage(
                "Could not connect to EduTrust server. Please try again.",
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
