document.addEventListener("DOMContentLoaded", () => {

    const form =
        document.getElementById("registerForm");

    const message =
        document.getElementById("message");

    const logoInput =
        document.getElementById("school-logo");

    const logoPreview =
        document.getElementById("logo-preview");

    if (!form) {
        console.error(
            "EduTrust: registerForm not found."
        );
        return;
    }

    /* =====================================================
       LOGO PREVIEW
    ===================================================== */

    if (logoInput) {
        logoInput.addEventListener(
            "change",
            () => {

                const file =
                    logoInput.files?.[0];

                if (!file) {
                    if (logoPreview) {
                        logoPreview.style.display =
                            "none";
                        logoPreview.src = "";
                    }
                    return;
                }

                if (!file.type.startsWith("image/")) {
                    showMessage(
                        "Please select a valid image for the school logo.",
                        "red"
                    );

                    logoInput.value = "";

                    return;
                }

                /*
                 * Keep the image reasonably small because
                 * the logo is stored as a string in MongoDB.
                 */
                if (
                    file.size >
                    500 * 1024
                ) {
                    showMessage(
                        "School logo must be 500KB or smaller.",
                        "red"
                    );

                    logoInput.value = "";

                    return;
                }

                const reader =
                    new FileReader();

                reader.onload = (event) => {

                    if (logoPreview) {
                        logoPreview.src =
                            event.target.result;

                        logoPreview.style.display =
                            "block";
                    }
                };

                reader.readAsDataURL(file);
            }
        );
    }

    /* =====================================================
       FORM SUBMISSION
    ===================================================== */

    form.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            /* -----------------------------
               Read fields safely
            ----------------------------- */

            const schoolName =
                getValue("school-name");

            const ownerName =
                getValue("owner-name");

            const phone =
                getValue("phone");

            const email =
                getValue("email")
                    .toLowerCase();

            const address =
                getValue("address");

            const password =
                getValue("password");

            const confirmPassword =
                getValue("confirm-password");

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

            const terms =
                form.querySelector(
                    'input[type="checkbox"]'
                );

            /* -----------------------------
               Required validation
            ----------------------------- */

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

            if (
                terms &&
                !terms.checked
            ) {
                showMessage(
                    "Please agree to the EduTrust Terms & Conditions.",
                    "red"
                );
                return;
            }

            /* -----------------------------
               Password validation
            ----------------------------- */

            if (
                password.length < 6
            ) {
                showMessage(
                    "Password must be at least 6 characters.",
                    "red"
                );
                return;
            }

            if (
                password !==
                confirmPassword
            ) {
                showMessage(
                    "Passwords do not match.",
                    "red"
                );
                return;
            }

            /* -----------------------------
               Email validation
            ----------------------------- */

            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (
                !emailPattern.test(email)
            ) {
                showMessage(
                    "Please enter a valid email address.",
                    "red"
                );
                return;
            }

            /* -----------------------------
               Logo conversion
            ----------------------------- */

            let logo = "";

            if (
                logoInput &&
                logoInput.files &&
                logoInput.files[0]
            ) {
                try {

                    logo =
                        await readFileAsDataURL(
                            logoInput.files[0]
                        );

                } catch (error) {

                    console.error(
                        "Logo reading error:",
                        error
                    );

                    showMessage(
                        "Unable to read the school logo.",
                        "red"
                    );

                    return;
                }
            }

            /* -----------------------------
               Button state
            ----------------------------- */

            const submitButton =
                form.querySelector(
                    'button[type="submit"]'
                );

            if (submitButton) {
                submitButton.disabled =
                    true;

                submitButton.textContent =
                    "Creating Account...";
            }

            showMessage(
                "Creating your EduTrust school account...",
                "#333"
            );

            /* =================================================
               BACKEND PAYLOAD
            ================================================= */

            const payload = {

                school_name:
                    schoolName,

                school_email:
                    email,

                phone:
                    phone,

                address:
                    address,

                school_type:
                    schoolType,

                academic_session:
                    academicSession,

                current_term:
                    currentTerm,

                school_motto:
                    schoolMotto,

                website:
                    website,

                logo:
                    logo,

                principal_name:
                    ownerName,

                principal_email:
                    email,

                password:
                    password
            };

            console.log(
                "EduTrust registration payload:",
                {
                    ...payload,
                    password:
                        "[HIDDEN]",
                    logo:
                        logo
                            ? "[LOGO DATA]"
                            : ""
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
                                    payload
                                )
                        }
                    );

                let data = {};

                try {
                    data =
                        await response.json();
                } catch (error) {

                    console.error(
                        "Invalid server JSON:",
                        error
                    );
                }

                console.log(
                    "EduTrust registration response:",
                    data
                );

                if (
                    response.ok &&
                    data.success
                ) {

                    showMessage(
                        "School registered successfully! Redirecting to login...",
                        "green"
                    );

                    localStorage.removeItem(
                        "token"
                    );

                    localStorage.removeItem(
                        "user"
                    );

                    setTimeout(
                        () => {
                            window.location.href =
                                "login.html";
                        },
                        1500
                    );

                    return;
                }

                showMessage(
                    data.message ||
                    "Registration failed. Please try again.",
                    "red"
                );

            } catch (error) {

                console.error(
                    "Registration request error:",
                    error
                );

                showMessage(
                    "Unable to connect to EduTrust server. Please try again.",
                    "red"
                );

            } finally {

                if (submitButton) {
                    submitButton.disabled =
                        false;

                    submitButton.textContent =
                        "Create School Account";
                }
            }
        }
    );

    /* =====================================================
       HELPERS
    ===================================================== */

    function getValue(id) {

        const element =
            document.getElementById(id);

        if (!element) {
            return "";
        }

        return String(
            element.value || ""
        ).trim();
    }

    function showMessage(
        text,
        color
    ) {

        if (!message) {
            return;
        }

        message.textContent =
            text;

        message.style.color =
            color;
    }

    function readFileAsDataURL(file) {

        return new Promise(
            (resolve, reject) => {

                const reader =
                    new FileReader();

                reader.onload =
                    () => resolve(
                        reader.result
                    );

                reader.onerror =
                    reject;

                reader.readAsDataURL(
                    file
                );
            }
        );
    }
});
