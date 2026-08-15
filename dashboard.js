

// dashboard.js

"use strict";


// ============================================================
// CONFIGURATION
// ============================================================

const API_BASE_URL = "https://your-backend-url.onrender.com/api";


// ============================================================
// AUTHENTICATION
// ============================================================

const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");


if (!token) {
    window.location.href = "login.html";
}


// ============================================================
// API HELPER
// ============================================================

async function apiRequest(
    endpoint,
    options = {}
) {

    const response = await fetch(
        `${API_BASE_URL}${endpoint}`,
        {
            ...options,

            headers: {
                "Content-Type": "application/json",

                "Authorization":
                    `Bearer ${token}`,

                ...(options.headers || {})
            }
        }
    );

    let data = {};

    try {
        data = await response.json();
    } catch {
        data = {};
    }

    if (
        response.status === 401
    ) {

        localStorage.removeItem("token");
        sessionStorage.removeItem("token");

        window.location.href = "login.html";

        throw new Error(
            "Authentication expired."
        );
    }

    if (!response.ok) {

        throw new Error(
            data.message ||
            "Request failed."
        );
    }

    return data;
}


// ============================================================
// DOM
// ============================================================

const sidebar =
    document.getElementById("sidebar");

const menuToggle =
    document.getElementById("menu-toggle");

const logoutButton =
    document.getElementById("logoutButton");

const themeToggle =
    document.getElementById("theme-toggle");

const notificationButton =
    document.getElementById("notification-button");

const notificationDropdown =
    document.getElementById("notification-dropdown");

const toast =
    document.getElementById("toast");


// ============================================================
// TOAST
// ============================================================

function showToast(
    message,
    type = "success"
) {

    if (!toast) {
        alert(message);
        return;
    }

    toast.textContent = message;

    toast.className =
        `toast ${type}`;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 3500);
}


// ============================================================
// SCHOOL DATA
// ============================================================

let currentSchool = null;
let currentUser = null;


// ============================================================
// LOAD PROFILE
// ============================================================

async function loadProfile() {

    try {

        const data =
            await apiRequest(
                "/auth/profile"
            );

        if (!data.success) {

            throw new Error(
                data.message ||
                "Unable to load profile."
            );
        }

        currentUser =
            data.user;

        currentSchool =
            data.school;

        renderProfile();

        populateSchoolForm();

    } catch (error) {

        console.error(
            "LOAD PROFILE ERROR:",
            error
        );

        showToast(
            error.message ||
            "Unable to load school profile.",
            "error"
        );
    }
}


// ============================================================
// RENDER PROFILE
// ============================================================

function renderProfile() {

    if (!currentSchool) {
        return;
    }

    const schoolName =
        currentSchool.name ||
        "School";

    const userRole =
        currentUser?.role ||
        "Administrator";

    const sidebarSchoolName =
        document.getElementById(
            "sidebarSchoolName"
        );

    const sidebarUserRole =
        document.getElementById(
            "sidebarUserRole"
        );

    const schoolAvatar =
        document.getElementById(
            "schoolAvatar"
        );

    if (sidebarSchoolName) {

        sidebarSchoolName.textContent =
            schoolName;
    }

    if (sidebarUserRole) {

        sidebarUserRole.textContent =
            userRole;
    }

    if (schoolAvatar) {

        schoolAvatar.textContent =
            getInitials(schoolName);
    }
}


// ============================================================
// INITIALS
// ============================================================

function getInitials(
    name
) {

    return String(name || "School")
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(
            word =>
                word.charAt(0)
                    .toUpperCase()
        )
        .join("");
}


// ============================================================
// POPULATE SCHOOL FORM
// ============================================================

function populateSchoolForm() {

    if (!currentSchool) {
        return;
    }

    setValue(
        "schoolName",
        currentSchool.name
    );

    setValue(
        "schoolCode",
        currentSchool.school_code
    );

    setValue(
        "schoolPhone",
        currentSchool.phone
    );

    setValue(
        "schoolEmail",
        currentSchool.email
    );

    setValue(
        "schoolType",
        currentSchool.school_type
    );

    setValue(
        "schoolAddress",
        currentSchool.address
    );

    setValue(
        "academicSession",
        currentSchool.academic_session
    );

    setValue(
        "currentTerm",
        currentSchool.current_term
    );

    setValue(
        "schoolMotto",
        currentSchool.motto
    );

    setValue(
        "schoolWebsite",
        currentSchool.website
    );


    const principalInput =
        document.getElementById(
            "schoolPrincipal"
        );

    if (principalInput) {

        principalInput.value =
            currentUser?.full_name ||
            "Principal";
    }
}


// ============================================================
// SET VALUE
// ============================================================

function setValue(
    id,
    value
) {

    const element =
        document.getElementById(id);

    if (!element) {
        return;
    }

    element.value =
        value || "";
}


// ============================================================
// NAVIGATION
// ============================================================

function showPage(
    page
) {

    document
        .querySelectorAll(
            ".page-content"
        )
        .forEach(
            element => {

                element.classList.add(
                    "hidden"
                );

            }
        );


    const pageElement =
        document.getElementById(
            `${page}Page`
        );

    if (pageElement) {

        pageElement.classList.remove(
            "hidden"
        );
    }


    document
        .querySelectorAll(
            ".nav-item[data-page], .submenu-item[data-page]"
        )
        .forEach(
            button => {

                button.classList.remove(
                    "active"
                );

                if (
                    button.dataset.page ===
                    page
                ) {

                    button.classList.add(
                        "active"
                    );
                }
            }
        );


    if (window.innerWidth <= 900) {

        sidebar?.classList.remove(
            "open"
        );
    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// ============================================================
// NAV BUTTONS
// ============================================================

document
    .querySelectorAll(
        "[data-page]"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const page =
                        button.dataset.page;

                    if (page) {

                        showPage(page);
                    }

                }
            );

        }
    );


// ============================================================
// REPORTS TOGGLE
// ============================================================

document
    .querySelectorAll(
        ".reports-toggle, .settings-toggle"
    )
    .forEach(
        toggle => {

            toggle.addEventListener(
                "click",
                () => {

                    const group =
                        toggle.closest(
                            ".nav-group"
                        );

                    if (!group) {
                        return;
                    }

                    group.classList.toggle(
                        "open"
                    );

                }
            );

        }
    );


// ============================================================
// MOBILE SIDEBAR
// ============================================================

if (menuToggle) {

    menuToggle.addEventListener(
        "click",
        () => {

            sidebar?.classList.toggle(
                "open"
            );

        }
    );
}


// ============================================================
// THEME
// ============================================================

const savedTheme =
    localStorage.getItem(
        "edutrust_theme"
    );

if (savedTheme === "dark") {

    document.body.classList.add(
        "dark-mode"
    );

    if (themeToggle) {
        themeToggle.textContent = "☀️";
    }
}


if (themeToggle) {

    themeToggle.addEventListener(
        "click",
        () => {

            document.body.classList.toggle(
                "dark-mode"
            );

            const dark =
                document.body.classList.contains(
                    "dark-mode"
                );

            localStorage.setItem(
                "edutrust_theme",
                dark
                    ? "dark"
                    : "light"
            );

            themeToggle.textContent =
                dark
                    ? "☀️"
                    : "🌙";
        }
    );
}


// ============================================================
// NOTIFICATIONS
// ============================================================

if (notificationButton) {

    notificationButton.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            notificationDropdown?.classList.toggle(
                "show"
            );

        }
    );
}


document.addEventListener(
    "click",
    event => {

        if (
            notificationDropdown &&
            !notificationDropdown.contains(
                event.target
            ) &&
            !notificationButton?.contains(
                event.target
            )
        ) {

            notificationDropdown.classList.remove(
                "show"
            );
        }

    }
);


// ============================================================
// SCHOOL UPDATE
// ============================================================

const schoolForm =
    document.getElementById(
        "schoolForm"
    );


if (schoolForm) {

    schoolForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            if (!currentSchool?._id) {

                showToast(
                    "School information is not loaded.",
                    "error"
                );

                return;
            }


            const saveButton =
                document.getElementById(
                    "saveSchoolButton"
                );


            const payload = {

                name:
                    document.getElementById(
                        "schoolName"
                    )?.value.trim(),

                phone:
                    document.getElementById(
                        "schoolPhone"
                    )?.value.trim(),

                email:
                    document.getElementById(
                        "schoolEmail"
                    )?.value.trim()
                        .toLowerCase(),

                address:
                    document.getElementById(
                        "schoolAddress"
                    )?.value.trim(),

                school_type:
                    document.getElementById(
                        "schoolType"
                    )?.value.trim(),

                academic_session:
                    document.getElementById(
                        "academicSession"
                    )?.value.trim(),

                current_term:
                    document.getElementById(
                        "currentTerm"
                    )?.value,

                motto:
                    document.getElementById(
                        "schoolMotto"
                    )?.value.trim(),

                website:
                    document.getElementById(
                        "schoolWebsite"
                    )?.value.trim()
            };


            try {

                if (saveButton) {

                    saveButton.disabled =
                        true;

                    saveButton.textContent =
                        "Saving...";
                }


                const data =
                    await apiRequest(
                        `/schools/${currentSchool._id}`,
                        {
                            method: "PUT",
                            body:
                                JSON.stringify(
                                    payload
                                )
                        }
                    );


                if (!data.success) {

                    throw new Error(
                        data.message ||
                        "Failed to update school."
                    );
                }


                currentSchool =
                    data.school;

                renderProfile();

                populateSchoolForm();

                showToast(
                    "School profile updated successfully."
                );


            } catch (error) {

                console.error(
                    "UPDATE SCHOOL ERROR:",
                    error
                );

                showToast(
                    error.message ||
                    "Failed to update school.",
                    "error"
                );


            } finally {

                if (saveButton) {

                    saveButton.disabled =
                        false;

                    saveButton.textContent =
                        "Save School Profile";
                }

            }

        }
    );
}


// ============================================================
// LOAD STUDENTS
// ============================================================

async function loadStudents() {

    const table =
        document.getElementById(
            "studentsTable"
        );

    if (!table) {
        return;
    }


    try {

        const data =
            await apiRequest(
                "/students"
            );


        const students =
            data.students || [];


        if (!students.length) {

            table.innerHTML = `
                <tr>
                    <td colspan="5">
                        No students found.
                    </td>
                </tr>
            `;

            updateElement(
                "totalStudents",
                "0"
            );

            return;
        }


        updateElement(
            "totalStudents",
            students.length.toLocaleString()
        );


        table.innerHTML =
            students
                .map(
                    student => {

                        const fullName =
                            [
                                student.first_name,
                                student.other_name,
                                student.last_name
                            ]
                                .filter(Boolean)
                                .join(" ");


                        return `
                            <tr>

                                <td>
                                    ${escapeHtml(
                                        student.admission_number ||
                                        ""
                                    )}
                                </td>

                                <td>
                                    ${escapeHtml(
                                        fullName
                                    )}
                                </td>

                                <td>
                                    ${escapeHtml(
                                        student.gender ||
                                        ""
                                    )}
                                </td>

                                <td>
                                    ${escapeHtml(
                                        student.class_name ||
                                        ""
                                    )}
                                </td>

                                <td>
                                    <span class="status ${getStatusClass(
                                        student.status
                                    )}">
                                        ${escapeHtml(
                                            student.status ||
                                            ""
                                        )}
                                    </span>
                                </td>

                            </tr>
                        `;

                    }
                )
                .join("");


    } catch (error) {

        console.error(
            "LOAD STUDENTS ERROR:",
            error
        );

        table.innerHTML = `
            <tr>
                <td colspan="5">
                    Unable to load students.
                </td>
            </tr>
        `;
    }
}


// ============================================================
// LOAD PARENTS
// ============================================================

async function loadParents() {

    const table =
        document.getElementById(
            "parentsTable"
        );

    if (!table) {
        return;
    }


    try {

        const data =
            await apiRequest(
                "/parents"
            );


        const parents =
            data.parents || [];


        updateElement(
            "totalParents",
            parents.length.toLocaleString()
        );


        if (!parents.length) {

            table.innerHTML = `
                <tr>
                    <td colspan="5">
                        No parents found.
                    </td>
                </tr>
            `;

            return;
        }


        table.innerHTML =
            parents
                .map(
                    parent => {

                        const fullName =
                            [
                                parent.first_name,
                                parent.other_name,
                                parent.last_name
                            ]
                                .filter(Boolean)
                                .join(" ");


                        return `
                            <tr>

                                <td>
                                    ${escapeHtml(
                                        fullName
                                    )}
                                </td>

                                <td>
                                    ${escapeHtml(
                                        parent.relationship ||
                                        ""
                                    )}
                                </td>

                                <td>
                                    ${escapeHtml(
                                        parent.phone ||
                                        ""
                                    )}
                                </td>

                                <td>
                                    ${escapeHtml(
                                        parent.email ||
                                        ""
                                    )}
                                </td>

                                <td>
                                    <span class="status ${getStatusClass(
                                        parent.status
                                    )}">
                                        ${escapeHtml(
                                            parent.status ||
                                            ""
                                        )}
                                    </span>
                                </td>

                            </tr>
                        `;

                    }
                )
                .join("");


    } catch (error) {

        console.error(
            "LOAD PARENTS ERROR:",
            error
        );

        table.innerHTML = `
            <tr>
                <td colspan="5">
                    Unable to load parents.
                </td>
            </tr>
        `;
    }
}


// ============================================================
// STATUS CLASS
// ============================================================

function getStatusClass(
    status
) {

    switch (
        String(status || "")
            .toLowerCase()
    ) {

        case "active":
        case "paid":
            return "paid";

        case "pending":
            return "pending";

        case "suspended":
        case "inactive":
            return "warning";

        default:
            return "";
    }
}


// ============================================================
// UPDATE ELEMENT
// ============================================================

function updateElement(
    id,
    value
) {

    const element =
        document.getElementById(id);

    if (element) {

        element.textContent =
            value;
    }
}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHtml(
    value
) {

    return String(value ?? "")
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


// ============================================================
// LOGOUT
// ============================================================

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        () => {

            localStorage.removeItem(
                "token"
            );

            sessionStorage.removeItem(
                "token"
            );

            window.location.href =
                "login.html";

        }
    );
}


// ============================================================
// INITIAL LOAD
// ============================================================

async function initializeDashboard() {

    await loadProfile();

    await Promise.allSettled([
        loadStudents(),
        loadParents()
    ]);

}


initializeDashboard();
