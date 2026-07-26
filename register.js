const registerForm = document.getElementById("registerForm");
const message = document.getElementById("message");

registerForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const schoolName = document.getElementById("school-name").value.trim();
    const ownerName = document.getElementById("owner-name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const email = document.getElementById("email").value.trim();
    const address = document.getElementById("address").value.trim();

    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    // Check empty fields
    if (
        schoolName === "" ||
        ownerName === "" ||
        phone === "" ||
        email === "" ||
        address === "" ||
        password === "" ||
        confirmPassword === ""
    ) {
        message.textContent = "Please fill in all fields.";
        message.style.color = "red";
        return;
    }

    // Check password length
    if (password.length < 6) {
        message.textContent = "Password must be at least 6 characters.";
        message.style.color = "red";
        return;
    }

    // Check password match
    if (password !== confirmPassword) {
        message.textContent = "Passwords do not match.";
        message.style.color = "red";
        return;
    }

    // Success
    message.textContent = "Registration successful!";
    message.style.color = "green";

    // Redirect
    setTimeout(function () {
        window.location.href = "login.html";
    }, 1500);
});
