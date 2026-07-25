const loginForm = document.getElementById("loginForm");

const message = document.getElementById("message");


loginForm.addEventListener("submit", function (event) {

    event.preventDefault();


    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;


    // Check if fields are empty

    if (email === "" || password === "") {

        message.textContent =
            "Please enter your email and password.";

        message.style.color = "red";

        return;

    }


    // Check password length

    if (password.length < 6) {

        message.textContent =
            "Password must be at least 6 characters.";

        message.style.color = "red";

        return;

    }


    // Login successful

    message.textContent =
        "Login successful!";

    message.style.color = "green";


    // Go to dashboard

    setTimeout(function () {

        window.location.href = "dashboard.html";

    }, 1000);

});
