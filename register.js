document.addEventListener("DOMContentLoaded", function () {

    const registerForm =
        document.getElementById("registerForm");

    const message =
        document.getElementById("message");


    registerForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const schoolName =
                document
                    .getElementById("school-name")
                    .value
                    .trim();


            const ownerName =
                document
                    .getElementById("owner-name")
                    .value
                    .trim();


            const phone =
                document
                    .getElementById("phone")
                    .value
                    .trim();


            const email =
                document
                    .getElementById("email")
                    .value
                    .trim();


            const address =
                document
                    .getElementById("address")
                    .value
                    .trim();


            const password =
                document
                    .getElementById("password")
                    .value;


            const confirmPassword =
                document
                    .getElementById("confirm-password")
                    .value;


            if (

                schoolName === "" ||

                ownerName === "" ||

                phone === "" ||

                email === "" ||

                address === "" ||

                password === "" ||

                confirmPassword === ""

            ) {

                message.textContent =
                    "Please fill in all fields.";

                message.style.color = "red";

                return;

            }


            if (password.length < 6) {

                message.textContent =
                    "Password must be at least 6 characters.";

                message.style.color = "red";

                return;

            }


            if (password !== confirmPassword) {

                message.textContent =
                    "Passwords do not match.";

                message.style.color = "red";

                return;

            }
const schoolType =
    document.getElementById("school-type").value;

const academicSession =
    document.getElementById("academic-session").value;

const currentTerm =
    document.getElementById("current-term").value;

const schoolMotto =
    document.getElementById("school-motto").value;

const data = {
    school_name: schoolName,
    school_email: email,
    phone: phone,
    address: address,
    school_type: schoolType,
    academic_session: academicSession,
    current_term: currentTerm,
    school_motto: schoolMotto,
    principal_name: ownerName,
    principal_email: email,
    password: password
};
            fetch('https://edutrust-15ii.onrender.com/api/users/register', {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
})
.then(response => response.json())
.then(result => {

    if (result.success) {

        message.style.color = "green";
        message.textContent = result.message;

        setTimeout(() => {
            window.location.href = "login.html";
        }, 1500);

    } else {

        message.style.color = "red";
        message.textContent = result.message;

    }

})
.catch(error => {

    console.error(error);

    message.style.color = "yellow";
    message.textContent = "Unable to connect to the server.";

});
        }

    );

});




