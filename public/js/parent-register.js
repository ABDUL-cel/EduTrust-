// ============================================================
// EduTrust Parent Registration
// ============================================================

const API_BASE = "";

// ------------------------------------------------------------
// HELPERS
// ------------------------------------------------------------

function getValue(id) {
    const element =
        document.getElementById(id);

    return element
        ? element.value.trim()
        : "";
}

function showMessage(message, type = "error") {
    let box =
        document.getElementById(
            "registerMessage"
        );

    if (!box) {
        box =
            document.createElement(
                "div"
            );

        box.id =
            "registerMessage";

        box.style.marginTop =
            "15px";

        box.style.padding =
            "12px";

        box.style.borderRadius =
            "8px";

        const form =
            document.querySelector("form");

        if (form) {
            form.appendChild(box);
        }
    }

    box.textContent =
        message;

    box.style.display =
        "block";

    if (type === "success") {
        box.style.background =
            "#ecfdf5";

        box.style.color =
            "#047857";
    } else {
        box.style.background =
            "#fef2f2";

        box.style.color =
            "#b91c1c";
    }
}

// ------------------------------------------------------------
// SCHOOL SEARCH
// ------------------------------------------------------------

async function searchSchools(search) {
    try {
        const response =
            await fetch(
                `${API_BASE}/parent/search-schools?search=${encodeURIComponent(search)}`
            );

        const data =
            await response.json();

        if (!response.ok) {
            throw new Error(
                data.message ||
                "Unable to search schools."
            );
        }

        return data.schools || [];

    } catch (error) {
        console.error(
            "SCHOOL SEARCH ERROR:",
            error
        );

        return [];
    }
}

// ------------------------------------------------------------
// REGISTRATION
// ------------------------------------------------------------

async function registerParent(event) {
    event.preventDefault();

    const first_name =
        getValue("first_name");

    const last_name =
        getValue("last_name");

    const other_name =
        getValue("other_name");

    const relationship =
        getValue("relationship");

    const email =
        getValue("email");

    const phone =
        getValue("phone");

    const alternate_phone =
        getValue("alternate_phone");

    const home_address =
        getValue("home_address");

    const occupation =
        getValue("occupation");

    const passport =
        getValue("passport");

    const school_id =
        getValue("school_id");

    const password =
        getValue("password");

    const confirm_password =
        getValue("confirm_password");

    // --------------------------------------------------------
    // VALIDATION
    // --------------------------------------------------------

    if (
        !first_name ||
        !last_name ||
        !relationship ||
        !phone ||
        !school_id
    ) {
        showMessage(
            "Please complete all required fields."
        );

        return;
    }

    if (
        password &&
        password !== confirm_password
    ) {
        showMessage(
            "Passwords do not match."
        );

        return;
    }

    const submitButton =
        document.querySelector(
            'button[type="submit"]'
        );

    if (submitButton) {
        submitButton.disabled =
            true;

        submitButton.textContent =
            "Creating account...";
    }

    try {
        const response =
            await fetch(
                `${API_BASE}/parent/register`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            first_name,
                            last_name,
                            other_name,
                            relationship,
                            email,
                            phone,
                            alternate_phone,
                            home_address,
                            occupation,
                            passport,
                            school_id,
                            password
                        })
                }
            );

        const data =
            await response.json();

        if (!response.ok) {
            throw new Error(
                data.message ||
                "Parent registration failed."
            );
        }

        // ----------------------------------------------------
        // SAVE AUTH TOKEN
        // ----------------------------------------------------

        if (data.token) {
            localStorage.setItem(
                "edutrust_token",
                data.token
            );
        }

        // ----------------------------------------------------
        // SAVE PARENT INFORMATION
        // ----------------------------------------------------

        if (data.parent) {
            localStorage.setItem(
                "edutrust_parent",
                JSON.stringify(
                    data.parent
                )
            );
        }

        // ----------------------------------------------------
        // SUCCESS
        // ----------------------------------------------------

        showMessage(
            "Registration successful. Opening your parent dashboard...",
            "success"
        );

        setTimeout(() => {
            window.location.href =
                data.redirect ||
                "/parent-dashboard.html";
        }, 800);

    } catch (error) {
        console.error(
            "PARENT REGISTRATION ERROR:",
            error
        );

        showMessage(
            error.message ||
            "Registration failed."
        );

        if (submitButton) {
            submitButton.disabled =
                false;

            submitButton.textContent =
                "Register";
        }
    }
}

// ------------------------------------------------------------
// FORM CONNECTION
// ------------------------------------------------------------

document.addEventListener(
    "DOMContentLoaded",
    () => {
        const form =
            document.querySelector(
                "form"
            );

        if (form) {
            form.addEventListener(
                "submit",
                registerParent
            );
        }
    }
);
