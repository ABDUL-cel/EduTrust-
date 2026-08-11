const API_BASE_URL =
    "https://edutrust-15ii.onrender.com/api";


// =======================================
// ELEMENTS
// =======================================

const schoolSearch =
    document.getElementById("schoolSearch");

const schoolResults =
    document.getElementById("schoolResults");

const selectedSchool =
    document.getElementById("selectedSchool");

const selectedSchoolName =
    document.getElementById("selectedSchoolName");

const schoolIdInput =
    document.getElementById("school_id");

const form =
    document.getElementById(
        "parentRegistrationForm"
    );

const message =
    document.getElementById("message");

const submitBtn =
    document.getElementById("submitBtn");


// =======================================
// SHOW MESSAGE
// =======================================

function showMessage(
    text,
    type
) {

    message.textContent = text;

    message.className = "";

    message.classList.add(type);

    message.style.display = "block";

}


// =======================================
// HIDE MESSAGE
// =======================================

function hideMessage() {

    message.style.display = "none";

}


// =======================================
// SCHOOL SEARCH
// =======================================

let searchTimer = null;


schoolSearch.addEventListener(
    "input",
    function () {

        const search =
            schoolSearch.value.trim();


        // Clear selected school
        schoolIdInput.value = "";

        selectedSchool.style.display =
            "none";


        schoolResults.innerHTML = "";

        schoolResults.style.display =
            "none";


        if (search.length < 2) {
            return;
        }


        clearTimeout(searchTimer);


        searchTimer = setTimeout(
            () => searchSchools(search),
            400
        );

    }
);


// =======================================
// SEARCH SCHOOLS FROM BACKEND
// =======================================

async function searchSchools(search) {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/parents/search-schools?search=${encodeURIComponent(search)}`
            );


        const data =
            await response.json();


        if (!response.ok) {

            showSchoolResultsMessage(
                data.message ||
                "Unable to search schools."
            );

            return;
        }


        renderSchools(
            data.schools || []
        );

    } catch (error) {

        console.error(
            "SCHOOL SEARCH ERROR:",
            error
        );

        showSchoolResultsMessage(
            "Unable to connect to the server."
        );

    }

}


// =======================================
// DISPLAY SCHOOL RESULTS
// =======================================

function renderSchools(
    schools
) {

    schoolResults.innerHTML = "";


    if (!schools.length) {

        showSchoolResultsMessage(
            "No active school found."
        );

        return;
    }


    schools.forEach(
        school => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "school-item";


            item.innerHTML = `

                <div class="school-name">
                    ${escapeHtml(
                        school.name || ""
                    )}
                </div>

                <div class="school-address">
                    ${escapeHtml(
                        school.address || "Address not provided"
                    )}
                </div>

            `;


            item.addEventListener(
                "click",
                () => {

                    selectSchool(school);

                }
            );


            schoolResults.appendChild(
                item
            );

        }
    );


    schoolResults.style.display =
        "block";

}


// =======================================
// NO SCHOOL RESULTS
// =======================================

function showSchoolResultsMessage(
    text
) {

    schoolResults.innerHTML = `

        <div
            class="school-item"
            style="cursor:default;"
        >
            ${escapeHtml(text)}
        </div>

    `;

    schoolResults.style.display =
        "block";

}


// =======================================
// SELECT SCHOOL
// =======================================

function selectSchool(
    school
) {

    schoolIdInput.value =
        school._id;


    selectedSchoolName.textContent =
        school.name;


    selectedSchool.style.display =
        "block";


    schoolResults.style.display =
        "none";


    schoolSearch.value =
        school.name;

}


// =======================================
// FORM SUBMISSION
// =======================================

form.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        hideMessage();


        // ===================================
        // CHECK SCHOOL
        // ===================================

        const school_id =
            schoolIdInput.value.trim();


        if (!school_id) {

            showMessage(
                "Please search for and select your school first.",
                "error"
            );

            return;
        }


        // ===================================
        // DISABLE BUTTON
        // ===================================

        submitBtn.disabled =
            true;

        submitBtn.textContent =
            "Registering...";


        try {

            const payload = {

                school_id,

                first_name:
                    document
                        .getElementById(
                            "first_name"
                        )
                        .value
                        .trim(),

                last_name:
                    document
                        .getElementById(
                            "last_name"
                        )
                        .value
                        .trim(),

                other_name:
                    document
                        .getElementById(
                            "other_name"
                        )
                        .value
                        .trim(),

                relationship:
                    document
                        .getElementById(
                            "relationship"
                        )
                        .value,

                email:
                    document
                        .getElementById(
                            "email"
                        )
                        .value
                        .trim(),

                phone:
                    document
                        .getElementById(
                            "phone"
                        )
                        .value
                        .trim(),

                alternate_phone:
                    document
                        .getElementById(
                            "alternate_phone"
                        )
                        .value
                        .trim(),

                home_address:
                    document
                        .getElementById(
                            "home_address"
                        )
                        .value
                        .trim(),

                occupation:
                    document
                        .getElementById(
                            "occupation"
                        )
                        .value
                        .trim(),

                passport:
                    document
                        .getElementById(
                            "passport"
                        )
                        .value
                        .trim()

            };


            // ===================================
            // SEND TO BACKEND
            // ===================================

            const response =
                await fetch(
                    `${API_BASE_URL}/parents/register`,
                    {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                payload
                            )

                    }
                );


            // ===================================
            // READ RESPONSE
            // ===================================

            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Parent registration failed."
                );

            }


            // ===================================
            // SUCCESS
            // ===================================

            showMessage(
                "Parent registration successful!",
                "success"
            );


            form.reset();


            schoolIdInput.value =
                "";

            selectedSchool.style.display =
                "none";


            schoolResults.innerHTML =
                "";

            schoolResults.style.display =
                "none";


            // ===================================
            // OPTIONAL REDIRECT
            // ===================================

            setTimeout(
                () => {

                    window.location.href =
                        "parent-login.html";

                },
                1500
            );


        } catch (error) {

            console.error(
                "PARENT REGISTRATION ERROR:",
                error
            );


            showMessage(
                error.message ||
                "Something went wrong during registration.",
                "error"
            );

        } finally {

            submitBtn.disabled =
                false;

            submitBtn.textContent =
                "Register as Parent";

        }

    }
);


// =======================================
// ESCAPE HTML
// Prevent unsafe HTML injection
// =======================================

function escapeHtml(
    value
) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


// =======================================
// CLOSE SCHOOL RESULTS WHEN CLICKING
// OUTSIDE SEARCH AREA
// =======================================

document.addEventListener(
    "click",
    function (event) {

        if (
            !schoolSearch.contains(
                event.target
            ) &&
            !schoolResults.contains(
                event.target
            )
        ) {

            schoolResults.style.display =
                "none";

        }

    }
);
