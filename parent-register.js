document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("parentRegistrationForm");

    const button =
        document.getElementById("registerParentButton");

    const message =
        document.getElementById("parentMessage");


    if (!form) {
        console.error(
            "Parent registration form was not found."
        );

        return;
    }


    function showMessage(text, type = "error") {

        if (!message) return;

        message.style.display = "block";

        message.textContent = text;

        if (type === "success") {

            message.style.background =
                "#e8f7ee";

            message.style.color =
                "#16743a";

        } else {

            message.style.background =
                "#fdecec";

            message.style.color =
                "#b42318";
        }
    }


    form.addEventListener("submit", async (event) => {

        event.preventDefault();


        const token =
            localStorage.getItem("token");


        if (!token) {

            showMessage(
                "Your session has expired. Please login again."
            );

            setTimeout(() => {

                window.location.href =
                    "login.html";

            }, 1200);

            return;
        }


        const formData =
            new FormData(form);


        const parentData = {

            first_name:
                formData.get("first_name")?.trim(),

            last_name:
                formData.get("last_name")?.trim(),

            other_name:
                formData.get("other_name")?.trim() || "",

            relationship:
                formData.get("relationship")?.trim(),

            email:
                formData.get("email")?.trim() || "",

            phone:
                formData.get("phone")?.trim(),

            alternate_phone:
                formData.get("alternate_phone")?.trim() || "",

            home_address:
                formData.get("home_address")?.trim() || "",

            occupation:
                formData.get("occupation")?.trim() || "",

            passport:
                formData.get("passport")?.trim() || ""

        };


        /*
        ========================================
        FRONTEND REQUIRED-FIELD CHECK
        ========================================
        */

        if (
            !parentData.first_name ||
            !parentData.last_name ||
            !parentData.relationship ||
            !parentData.phone
        ) {

            showMessage(
                "Please fill in all required fields."
            );

            return;
        }


        /*
        ========================================
        DISABLE BUTTON
        ========================================
        */

        button.disabled = true;

        button.textContent =
            "Registering...";


        try {

            /*
            ========================================
            IMPORTANT

            This matches parentRoutes.js:

            router.post("/", createParent)

            If server.js mounts:

            /api/parents

            the final endpoint is:

            POST /api/parents
            ========================================
            */

            const response = await fetch(
                "/api/parents",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`
                    },

                    body:
                        JSON.stringify(parentData)
                }
            );


            /*
            ========================================
            HANDLE NON-JSON RESPONSE

            This prevents:

            Unexpected token '<'

            when the server accidentally
            returns HTML.
            ========================================
            */

            const contentType =
                response.headers.get(
                    "content-type"
                ) || "";


            let data;


            if (
                contentType.includes(
                    "application/json"
                )
            ) {

                data =
                    await response.json();

            } else {

                const text =
                    await response.text();

                console.error(
                    "Server returned non-JSON:",
                    text
                );

                throw new Error(
                    "Server returned an unexpected response. Check the /api/parents route."
                );
            }


            /*
            ========================================
            BACKEND ERROR
            ========================================
            */

            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to register parent."
                );
            }


            /*
            ========================================
            SUCCESS
            ========================================
            */

            showMessage(
                data.message ||
                "Parent registered successfully.",
                "success"
            );


            form.reset();


            /*
            ========================================
            RETURN TO PARENT DIRECTORY
            ========================================
            */

            setTimeout(() => {

                if (
                    typeof window.showParents ===
                    "function"
                ) {

                    window.showParents();

                } else {

                    window.history.back();
                }

            }, 1000);


        } catch (error) {

            console.error(
                "PARENT REGISTRATION ERROR:",
                error
            );


            showMessage(
                error.message ||
                "Unable to register parent."
            );


        } finally {

            button.disabled = false;

            button.textContent =
                "Register Parent";
        }

    });

});
