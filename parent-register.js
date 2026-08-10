const API_BASE_URL =
"https://edutrust-15ii.onrender.com";

document.addEventListener("DOMContentLoaded", () => {


const form =
    document.getElementById("parent-register-form");

const messageBox =
    document.getElementById("form-message");

const submitButton =
    document.getElementById("register-parent-button");


if (!form) {
    console.error(
        "Parent registration form was not found."
    );

    return;
}


function showMessage(message, type = "error") {

    if (!messageBox) return;

    messageBox.textContent = message;

    messageBox.style.display = "block";

    messageBox.className =
        `form-message ${type}`;

}


function setLoading(loading) {

    if (!submitButton) return;

    submitButton.disabled = loading;

    submitButton.textContent = loading
        ? "Creating Account..."
        : "Create Parent Account";

}


function getValue(id) {

    const element =
        document.getElementById(id);

    return element
        ? element.value.trim()
        : "";

}


form.addEventListener("submit", async (event) => {

    event.preventDefault();


    if (messageBox) {
        messageBox.style.display = "none";
    }


    const school_email =
        getValue("school_email");

    const first_name =
        getValue("first_name");

    const last_name =
        getValue("last_name");

    const other_name =
        getValue("other_name");

    const relationship =
        getValue("relationship");

    const phone =
        getValue("phone");

    const email =
        getValue("email");

    const alternate_phone =
        getValue("alternate_phone");

    const home_address =
        getValue("home_address");

    const occupation =
        getValue("occupation");

    const password =
        document.getElementById("password")?.value || "";

    const confirm_password =
        document.getElementById("confirm_password")?.value || "";


    /*
    ============================================
    FRONTEND VALIDATION
    ============================================
    */

    if (
        !school_email ||
        !first_name ||
        !last_name ||
        !relationship ||
        !phone ||
        !email ||
        !password ||
        !confirm_password
    ) {

        showMessage(
            "Please fill in all required fields."
        );

        return;
    }


    if (password.length < 6) {

        showMessage(
            "Password must contain at least 6 characters."
        );

        return;
    }


    if (password !== confirm_password) {

        showMessage(
            "Passwords do not match."
        );

        return;
    }


    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (!emailPattern.test(email)) {

        showMessage(
            "Please enter a valid parent email address."
        );

        return;
    }


    if (!emailPattern.test(school_email)) {

        showMessage(
            "Please enter a valid school email address."
        );

        return;
    }


    /*
    ============================================
    REQUEST DATA
    ============================================
    */

    const payload = {

        school_email,

        first_name,

        last_name,

        other_name,

        relationship,

        email,

        phone,

        alternate_phone,

        home_address,

        occupation,

        password

    };


    setLoading(true);


    try {

        const response = await fetch(
            `${API_BASE_URL}/api/parents/register`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json",

                    "Accept":
                        "application/json"
                },

                body:
                    JSON.stringify(payload)
            }
        );


        /*
        IMPORTANT:
        Read as text first.

        This prevents the old:
        "Unexpected token '<'"
        problem when a server accidentally
        returns HTML instead of JSON.
        */

        const responseText =
            await response.text();


        let data = null;


        try {

            data =
                JSON.parse(responseText);

        } catch (jsonError) {

            console.error(
                "Server returned non-JSON:",
                responseText
            );

            throw new Error(
                "The server returned an unexpected response. Please try again."
            );

        }


        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Parent registration failed."
            );

        }


        /*
        ============================================
        SUCCESS
        ============================================
        */

        showMessage(
            data.message ||
            "Parent account created successfully.",
            "success"
        );


        form.reset();


        /*
        Give the user a moment to see
        the success message.
        */

        setTimeout(() => {

            window.location.href =
                "login.html";

        }, 1500);


    } catch (error) {

        console.error(
            "PARENT REGISTRATION ERROR:",
            error
        );


        showMessage(
            error.message ||
            "Unable to create parent account. Please try again."
        );


    } finally {

        setLoading(false);

    }

});


});

