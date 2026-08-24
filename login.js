document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const message = document.getElementById("message");
    const submitBtn = loginForm?.querySelector("button[type='submit']");

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
            if (submitBtn) submitBtn.disabled = true;

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

            if (!response.ok || (data.success !== undefined && !data.success)) {
                message.textContent = data.message || "Invalid credentials.";
                message.style.color = "red";
                if (submitBtn) submitBtn.disabled = false;
                return;
            }

            // Extract token safely across common payload structures
            const token = data.token || data.accessToken || data.data?.token;

            if (!token || typeof token !== "string" || token === "undefined") {
                message.textContent = "Authentication failed: No valid token returned.";
                message.style.color = "red";
                if (submitBtn) submitBtn.disabled = false;
                return;
            }

            // Clean up any legacy key names from previous sessions
            const legacyKeys = ["authToken", "accessToken", "edutrust_token"];
            legacyKeys.forEach(key => {
                localStorage.removeItem(key);
                sessionStorage.removeItem(key);
            });

            // Save primary storage keys
            localStorage.setItem("token", token);
            if (data.user) {
                localStorage.setItem("user", JSON.stringify(data.user));
            }

            message.textContent = "Login successful!";
            message.style.color = "green";

            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 1000);

        } catch (error) {
            message.textContent = "Unable to connect to server.";
            message.style.color = "red";
            console.error("Login Error:", error);
            if (submitBtn) submitBtn.disabled = false;
        }
    });
});
