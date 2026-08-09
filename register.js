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


    // =====================================================
    // MESSAGE
    // =====================================================

    function showMessage(
        text,
        color = "#333"
    ) {

        if (!message) return;

        message.textContent = text;

        message.style.color = color;
    }


    // =====================================================
    // VALUE HELPER
    // =====================================================

    function getValue(id) {

        const element =
            document.getElementById(id);

        return element
            ? element.value.trim()
            : "";
    }


    // =====================================================
    // LOGO PREVIEW
    // =====================================================

    if (logoInput) {

        logoInput.addEventListener(
            "change",
            () => {

                const file =
                    logoInput.files[0];

                if (!file) {

                    logoPreview.style.display =
                        "none";

                    logoPreview.src = "";

                    return;
                }

                if (
                    !file.type.startsWith(
                        "image/"
                    )
                ) {

                    showMessage(
                        "Please select a valid image logo.",
                        "red"
                    );

                    logoInput.value = "";

                    return;
                }

                const reader =
                    new FileReader();

                reader.onload = (event) => {

                    logoPreview.src =
                        event.target.result;

                    logoPreview.style.display =
                        "block";
                };

                reader.readAsDataURL(file);
            }
        );
    }


    // =====================================================
    // FILE → BASE64
    // =====================================================

    function fileToBase64(file) {

        return new Promise(
            (resolve, reject) => {

                const reader =
                    new FileReader();

                reader.onload = () =>
                    resolve(
                        reader.result
                    );

                reader.onerror =
                    reject;

                reader.readAsDataURL(file);
            }
        );
    }


    // =====================================================
    // SUBMIT
    // =====================================================

    form.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            // ------------------------------------------------
            // READ FORM
            // ------------------------------------------------

            const schoolName =
                getValue("school-name");

            const schoolEmail =
                getValue("school-email")
                    .toLowerCase();

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

            const principalName =
                getValue("principal-name");

            const principalEmail =
                getValue("principal-email")
                    .toLowerCase();

            const password =
                getValue("password");

            const confirmPassword =
                getValue("confirm-password");

            const terms =
                document.getElementById(
                    "terms"
                );


            // ------------------------------------------------
            // REQUIRED VALIDATION
            // ------------------------------------------------

            const missing = [];

            if (!schoolName)
                missing.push("School Name");

            if (!schoolEmail)
                missing.push("School Email");

            if (!phone)
                missing.push("Phone Number");

            if (!address)
                missing.push("School Address");

            if (!schoolType)
                missing.push("School Type");

            if (!academicSession)
                missing.push("Academic Session");

            if (!currentTerm)
                missing.push("Current Term");

            if (!principalName)
                missing.push(
                    "Principal Name"
                );

            if (!principalEmail)
                missing.push(
                    "Principal Email"
                );

            if (!password)
                missing.push("Password");

            if (!confirmPassword)
                missing.push(
                    "Confirm Password"
                );


            if (missing.length > 0) {

                showMessage(
                    "Please fill: " +
                    missing.join(", "),
                    "red"
                );

                return;
            }


            // ------------------------------------------------
            // TERMS
            // ------------------------------------------------

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


            // ------------------------------------------------
            // PASSWORD
            // ------------------------------------------------

            if (password.length < 6) {

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


            // ------------------------------------------------
            // EMAIL VALIDATION
            // ------------------------------------------------

            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


            if (
                !emailPattern.test(
                    schoolEmail
                )
            ) {

                showMessage(
                    "Please enter a valid school email.",
                    "red"
                );

                return;
            }


            if (
                !emailPattern.test(
                    principalEmail
                )
            ) {

                showMessage(
                    "Please enter a valid principal email.",
                    "red"
                );

                return;
            }


            // ------------------------------------------------
            // WEBSITE VALIDATION
            // ------------------------------------------------

            let normalizedWebsite = "";

            if (website) {

                try {

                    let websiteValue =
                        website;

                    if (
                        !websiteValue.startsWith(
                            "http://"
                        ) &&
                        !websiteValue.startsWith(
                            "https://"
                        )
                    ) {

                        websiteValue =
                            "https://" +
                            websiteValue;
                    }

                    const websiteURL =
                        new URL(
                            websiteValue
                        );

                    normalizedWebsite =
                        websiteURL.href;

                } catch (error) {

                    showMessage(
                        "Please enter a valid website address.",
                        "red"
                    );

                    return;
                }
            }


            // ------------------------------------------------
            // BUTTON
            // ------------------------------------------------

            const button =
                form.querySelector(
                    'button[type="submit"]'
                );

            if (button) {

                button.disabled = true;

                button.textContent =
                    "Creating Account...";
            }

            showMessage(
                "Registering school...",
                "#333"
            );


            try {

                // ------------------------------------------------
                // LOGO
                // ------------------------------------------------

                let logo = "";

                if (
                    logoInput &&
                    logoInput.files &&
                    logoInput.files.length > 0
                ) {

                    const file =
                        logoInput.files[0];

                    // Prevent enormous MongoDB documents
                    if (
                        file.size >
                        1024 * 1024
                    ) {

                        showMessage(
                            "School logo must be smaller than 1MB.",
                            "red"
                        );

                        return;
                    }

                    logo =
                        await fileToBase64(
                            file
                        );
                }


                // ------------------------------------------------
                // EXACT AUTH CONTROLLER PAYLOAD
                // ------------------------------------------------

                const payload = {

                    school_name:
                        schoolName,

                    school_email:
                        schoolEmail,

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
                        normalizedWebsite,

                    logo:
                        logo,

                    principal_name:
                        principalName,

                    principal_email:
                        principalEmail,

                    password:
                        password
                };


                console.log(
                    "EduTrust registration payload:",
                    {
                        ...payload,
                        password:
                            "[HIDDEN]"
                    }
                );


                // ------------------------------------------------
                // SEND TO RENDER
                // ------------------------------------------------

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


                // ------------------------------------------------
                // READ RESPONSE
                // ------------------------------------------------

                let data = {};

                try {

                    data =
                        await response.json();

                } catch (error) {

                    console.error(
                        "Invalid backend response:",
                        error
                    );
                }


                console.log(
                    "EduTrust registration response:",
                    data
                );


                // ------------------------------------------------
                // SUCCESS
                // ------------------------------------------------

                if (
                    response.ok &&
                    data.success
                ) {

                    showMessage(
                        "School registered successfully! Redirecting to login...",
                        "green"
                    );


                    // Save returned information
                    // but DO NOT save password

                    if (data.user) {

                        localStorage.setItem(
                            "user",
                            JSON.stringify(
                                data.user
                            )
                        );
                    }


                    setTimeout(
                        () => {

                            window.location.href =
                                "login.html";

                        },
                        1500
                    );

                    return;
                }


                // ------------------------------------------------
                // BACKEND ERROR
                // ------------------------------------------------

                let errorMessage =
                    data.message ||
                    "Registration failed.";


                if (
                    data.missingFields &&
                    Array.isArray(
                        data.missingFields
                    )
                ) {

                    errorMessage +=
                        " Missing: " +
                        data.missingFields.join(
                            ", "
                        );
                }


                showMessage(
                    errorMessage,
                    "red"
                );

            } catch (error) {

                console.error(
                    "EduTrust registration error:",
                    error
                );

                showMessage(
                    "Unable to connect to EduTrust server. Render may be waking up. Please try again.",
                    "red"
                );

            } finally {

                if (button) {

                    button.disabled =
                        false;

                    button.textContent =
                        "Create School Account";
                }
            }
        }
    );
});
