document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("parent-form");
    const messageDiv = document.getElementById("message");
    const submitBtn = document.getElementById("submit-btn");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        messageDiv.innerText = "";
        messageDiv.className = "msg";

        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirm_password").value;

        // Password Match Validation
        if (password !== confirmPassword) {
            messageDiv.innerText = "Passwords do not match!";
            messageDiv.className = "msg error";
            return;
        }

        const payload = {
            first_name: document.getElementById("first_name").value.trim(),
            last_name: document.getElementById("last_name").value.trim(),
            other_name: document.getElementById("other_name").value.trim(),
            relationship: document.getElementById("relationship").value,
            phone: document.getElementById("phone").value.trim(),
            alternate_phone: document.getElementById("alternate_phone").value.trim(),
            email: document.getElementById("email").value.trim(),
            password: password,
            occupation: document.getElementById("occupation").value.trim(),
            home_address: document.getElementById("home_address").value.trim(),
            school_id: document.getElementById("school_id").value.trim()
        };

        submitBtn.disabled = true;
        submitBtn.innerText = "Registering...";

        try {
            const response = await fetch("http://localhost:5000/api/parents/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                messageDiv.innerText = "Registration successful! You can now log in.";
                messageDiv.className = "msg success";
                form.reset();
            } else {
                messageDiv.innerText = data.message || "Registration failed. Please try again.";
                messageDiv.className = "msg error";
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            messageDiv.innerText = "Network error. Please check backend connection.";
            messageDiv.className = "msg error";
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerText = "Register";
        }
    });
});
