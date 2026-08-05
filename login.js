document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const message = document.getElementById("message");

    if (!loginForm) return;

    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        if (email === "" || password === "") {
            message.textContent = "Please enter your email and password.";
            message.style.color = "red";
            return;
        }

        if (password.length < 6) {
            message.textContent = "Password must be at least 6 characters.";
            message.style.color = "red";
            return;
        }

        try {
            message.textContent = "Logging in...";
            message.style.color = "blue";

            const response = await fetch("https://edutrust-15ii.onrender.com/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                message.textContent = data.message || "Invalid credentials.";
                message.style.color = "red";
                return;
            }

            // Save JWT Token & User profile (backend returns data.user)
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            message.textContent = "Login successful!";
            message.style.color = "green";

            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 1000);
        } catch (error) {
            message.textContent = "Unable to connect to server.";
            message.style.color = "red";
            console.error("Login Error:", error);
        }
    });
});
