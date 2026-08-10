document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("parentRegistrationForm");
    const message = document.getElementById("registerMessage");

    if (!form) {
        console.error("Parent registration form not found.");
        return;
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const formData = new FormData(form);

        const parentData = {
            full_name: formData.get("full_name")?.trim(),
            email: formData.get("email")?.trim(),
            phone: formData.get("phone")?.trim(),
            password: formData.get("password"),
            student_admission_number:
                formData.get("student_admission_number")?.trim()
        };

        if (
            !parentData.full_name ||
            !parentData.email ||
            !parentData.phone ||
            !parentData.password ||
            !parentData.student_admission_number
        ) {
            showMessage("Please fill in all required fields.", "error");
            return;
        }

        try {
            showMessage("Creating parent account...", "info");

            const response = await fetch("/api/parents/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(parentData)
            });

            const contentType = response.headers.get("content-type") || "";

            if (!contentType.includes("application/json")) {
                const text = await response.text();

                console.error("Server returned non-JSON:", text);

                throw new Error(
                    "The server did not return a valid JSON response."
                );
            }

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Parent registration failed."
                );
            }

            showMessage(
                "Parent account created successfully. Redirecting to login...",
                "success"
            );

            form.reset();

            setTimeout(() => {
                window.location.href = "parent-login.html";
            }, 1500);

        } catch (error) {
            console.error("Parent registration error:", error);

            showMessage(
                error.message || "Something went wrong during registration.",
                "error"
            );
        }
    });

    function showMessage(text, type) {
        if (!message) {
            alert(text);
            return;
        }

        message.textContent = text;
        message.className = `register-message ${type}`;
        message.style.display = "block";
    }
});
