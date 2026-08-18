"use strict";

/* ============================================================
   CONFIGURATION
============================================================ */

const API_BASE_URL = "https://edutrust-15ii.onrender.com/api";


/* ============================================================
   AUTHENTICATION
============================================================ */

const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

if (!token) {
    window.location.href = "login.html";
}


/* ============================================================
   API HELPER
============================================================ */

async function apiRequest(endpoint, options = {}) {

    const response = await fetch(
        `${API_BASE_URL}${endpoint}`,
        {
            ...options,

            headers: {
                "Content-Type": "application/json",

                "Authorization": `Bearer ${token}`,

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

    if (response.status === 401) {

        localStorage.removeItem("token");
        sessionStorage.removeItem("token");

        window.location.href = "login.html";

        throw new Error("Authentication expired.");
    }

    if (!response.ok) {

        throw new Error(
            data.message ||
            "Request failed."
        );
    }

    return data;
}


/* ============================================================
   DOM ELEMENTS
============================================================ */

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


/* ============================================================
   TOAST
============================================================ */

function showToast(message, type = "success") {

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


/* ============================================================
   SCHOOL / USER DATA
============================================================ */

let currentSchool = null;
let currentUser = null;


/* ============================================================
   PROFILE
============================================================ */

async function loadProfile() {

    try {

        const data =
            await apiRequest("/auth/profile");

        if (!data.success) {

            throw new Error(
                data.message ||
                "Unable to load profile."
            );
        }

        currentUser = data.user;
        currentSchool = data.school;

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


/* ============================================================
   RENDER PROFILE
============================================================ */

function renderProfile() {

    const schoolName =
        currentSchool?.name ||
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


/* ============================================================
   INITIALS
============================================================ */

function getInitials(name) {

    return String(name || "School")
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(word =>
            word.charAt(0).toUpperCase()
        )
        .join("");
}


/* ============================================================
   SCHOOL FORM
============================================================ */

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


/* ============================================================
   SET INPUT VALUE
============================================================ */

function setValue(id, value) {

    const element =
        document.getElementById(id);

    if (!element) {
        return;
    }

    element.value =
        value ?? "";
}


/* ============================================================
   ============================================================
   MAIN PAGE NAVIGATION
   ============================================================
============================================================ */

/*
    IMPORTANT:

    Every sidebar button has:

        data-page="students"

    or:

        data-page="parents"

    or:

        data-page="school"

    etc.

    The matching main content page has:

        id="studentsPage"

        id="parentsPage"

        id="schoolPage"

    etc.

    showPage() controls ALL of this.
*/


const navItems =
    document.querySelectorAll(
        ".nav-item[data-page], .submenu-item[data-page], .text-button[data-page]"
    );


const pages =
    document.querySelectorAll(
        ".page-content"
    );


function showPage(pageName) {

    console.log(
        "OPENING PAGE:",
        pageName
    );


    /* --------------------------------------------------------
       1. HIDE EVERY MAIN CONTENT PAGE
    -------------------------------------------------------- */

    pages.forEach(page => {

        page.classList.add("hidden");

        page.style.display = "none";

    });


    /* --------------------------------------------------------
       2. FIND THE PAGE WE WANT
    -------------------------------------------------------- */

    const targetPage =
        document.getElementById(
            `${pageName}Page`
        );


    /* --------------------------------------------------------
       3. OPEN THE PAGE
    -------------------------------------------------------- */

    if (!targetPage) {

        console.error(
            `Main content page "${pageName}Page" was not found.`
        );

        showToast(
            `Page "${pageName}" is not available.`,
            "error"
        );

        return;
    }


    targetPage.classList.remove("hidden");

    targetPage.style.display = "block";


    /* --------------------------------------------------------
       4. UPDATE ACTIVE SIDEBAR BUTTON
    -------------------------------------------------------- */

    document
        .querySelectorAll(
            ".nav-item[data-page], .submenu-item[data-page], .text-button[data-page]"
        )
        .forEach(item => {

            item.classList.remove("active");

        });


    const activeItems =
        document.querySelectorAll(
            `[data-page="${pageName}"]`
        );


    activeItems.forEach(item => {

        item.classList.add("active");

    });


    /* --------------------------------------------------------
       5. LOAD DATA FOR THAT PAGE
    -------------------------------------------------------- */

    switch (pageName) {

        case "overview":

            loadDashboardOverview();

            break;


        case "school":

            loadSchoolPage();

            break;


        case "students":

            loadStudents();

            break;


        case "parents":

            loadParents();

            break;


        case "staff":

            // Staff API can be connected later.
           loadStaff();
            break;


        case "fees":

            // Fee API can be connected later.
            break;


        case "fee-structures":

            // Fee structure API can be connected later.
            break;


        case "payments":

            // Payment API can be connected later.
            break;


        case "outstanding":

            // Outstanding API can be connected later.
            break;


        case "announcements":

            break;


        case "messages":

            break;


        case "notifications":

            break;


        case "school-profile":

            loadSchoolPage();

            break;


        case "user-roles":

            break;


        case "payment-settings":

            break;


        case "security":

            break;


        case "email-settings":

            break;


        case "backup":

            break;

    }


    /* --------------------------------------------------------
       6. CLOSE MOBILE SIDEBAR
    -------------------------------------------------------- */

    if (
        window.innerWidth <= 900 &&
        sidebar
    ) {

        sidebar.classList.remove("open");

    }
}


/* ============================================================
   SIDEBAR CLICK EVENTS
============================================================ */

/*
    THIS IS THE ONLY SIDEBAR NAVIGATION LISTENER.

    Do NOT add another [data-page] listener elsewhere.
*/

navItems.forEach(item => {

    item.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            event.stopPropagation();

            const pageName =
                this.getAttribute(
                    "data-page"
                );

            if (!pageName) {
                return;
            }

            showPage(pageName);

        }
    );

});


/* ============================================================
   REPORTS SUBMENU
============================================================ */

const reportsToggle =
    document.querySelector(
        ".reports-toggle"
    );

if (reportsToggle) {

    reportsToggle.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            event.stopPropagation();

            const group =
                this.closest(
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


/* ============================================================
   SETTINGS SUBMENU
============================================================ */

const settingsToggle =
    document.querySelector(
        ".settings-toggle"
    );

if (settingsToggle) {

    settingsToggle.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            event.stopPropagation();

            const group =
                this.closest(
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


/* ============================================================
   MOBILE SIDEBAR
============================================================ */

if (menuToggle) {

    menuToggle.addEventListener(
        "click",
        () => {

            if (!sidebar) {
                return;
            }

            sidebar.classList.toggle(
                "open"
            );

        }
    );
}


/* ============================================================
   THEME
============================================================ */

const savedTheme =
    localStorage.getItem(
        "edutrust_theme"
    );


if (savedTheme === "dark") {

    document.body.classList.add(
        "dark-mode"
    );

    if (themeToggle) {
        themeToggle.textContent =
            "☀️";
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


/* ============================================================
   NOTIFICATIONS
============================================================ */

if (notificationButton) {

    notificationButton.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            if (notificationDropdown) {

                notificationDropdown.classList.toggle(
                    "show"
                );

            }

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


/* ============================================================
   SCHOOL FORM UPDATE
============================================================ */

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
                    document
                        .getElementById(
                            "schoolName"
                        )
                        ?.value
                        .trim(),

                phone:
                    document
                        .getElementById(
                            "schoolPhone"
                        )
                        ?.value
                        .trim(),

                email:
                    document
                        .getElementById(
                            "schoolEmail"
                        )
                        ?.value
                        .trim()
                        .toLowerCase(),

                address:
                    document
                        .getElementById(
                            "schoolAddress"
                        )
                        ?.value
                        .trim(),

                school_type:
                    document
                        .getElementById(
                            "schoolType"
                        )
                        ?.value
                        .trim(),

                academic_session:
                    document
                        .getElementById(
                            "academicSession"
                        )
                        ?.value
                        .trim(),

                current_term:
                    document
                        .getElementById(
                            "currentTerm"
                        )
                        ?.value,

                motto:
                    document
                        .getElementById(
                            "schoolMotto"
                        )
                        ?.value
                        .trim(),

                website:
                    document
                        .getElementById(
                            "schoolWebsite"
                        )
                        ?.value
                        .trim()

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


/* ============================================================
   SCHOOL PAGE
============================================================ */

async function loadSchoolPage() {

    if (!currentSchool) {

        await loadProfile();

    }

}


/* ============================================================
   STUDENTS
============================================================ */

async function loadStudents() {

    const table =
        document.getElementById(
            "studentsTable"
        );


    if (!table) {
        return;
    }


    /* Show loading state */

    table.innerHTML = `
        <tr>
            <td colspan="5" style="text-align:center;">
                Loading students...
            </td>
        </tr>
    `;


    try {

        const data =
            await apiRequest(
                "/students"
            );


        const students =
            data.students || [];


        updateElement(
            "totalStudents",
            students.length.toLocaleString()
        );


        if (!students.length) {

            table.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align:center;">
                        No students found.
                    </td>
                </tr>
            `;

            return;
        }


        table.innerHTML =
            students
                .map(student => {

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
                                    fullName ||
                                    "N/A"
                                )}
                            </td>

                            <td>
                                ${escapeHtml(
                                    student.gender ||
                                    "N/A"
                                )}
                            </td>

                            <td>
                                ${escapeHtml(
                                    student.class_name ||
                                    "N/A"
                                )}
                            </td>

                            <td>

                                <span
                                    class="status ${getStatusClass(
                                        student.status
                                    )}"
                                >
                                    ${escapeHtml(
                                        student.status ||
                                        "Active"
                                    )}
                                </span>

                            </td>

                        </tr>
                    `;

                })
                .join("");


    } catch (error) {

        console.error(
            "LOAD STUDENTS ERROR:",
            error
        );


        table.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center;">
                    Unable to load students.
                </td>
            </tr>
        `;

    }
}

// =====================================================
// LOAD STAFF & TEACHERS
// =====================================================

async function loadStaff() {
    const table = document.querySelector("#staffPage tbody");

    if (!table) return;

    table.innerHTML = `
        <tr>
            <td colspan="5">Loading staff...</td>
        </tr>
    `;

    try {
        const token = localStorage.getItem("token");

        if (!token) {
            throw new Error("Authentication token not found.");
        }

        const response = await fetch(
            "/api/staff",
            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );
if (!response.ok || !result.success) {
    console.log("STAFF API STATUS:", response.status);
    console.log("STAFF API RESPONSE:", result);

    throw new Error(
        result.message ||
        "Failed to load staff."
    );
}

        const staff = result.staff || [];

        if (!staff.length) {
            table.innerHTML = `
                <tr>
                    <td colspan="5">
                        No staff or teachers registered yet.
                    </td>
                </tr>
            `;
            return;
        }

        table.innerHTML = staff.map(member => {

            const fullName =
                member.full_name ||
                [
                    member.first_name,
                    member.last_name
                ]
                    .filter(Boolean)
                    .join(" ") ||
                "Unnamed";

            return `
                <tr>

                    <td>
                        ${escapeHtml(fullName)}
                    </td>

                    <td>
                        ${escapeHtml(
                            member.role || "Staff"
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            member.email || "—"
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            member.phone || "—"
                        )}
                    </td>

                    <td>
                        <span class="status-badge ${
                            String(member.status)
                                .toLowerCase()
                        }">
                            ${escapeHtml(
                                member.status || "Unknown"
                            )}
                        </span>
                    </td>

                </tr>
            `;

        }).join("");

    } catch (error) {

        console.error(
            "LOAD STAFF ERROR:",
            error
        );

        table.innerHTML = `
            <tr>
                <td colspan="5">
                    Failed to load staff.
                </td>
            </tr>
        `;
    }
}
/* ============================================================
   PARENTS
============================================================ */

async function loadParents() {

    const table =
        document.getElementById(
            "parentsTable"
        );


    if (!table) {
        return;
    }


    table.innerHTML = `
        <tr>
            <td colspan="5" style="text-align:center;">
                Loading parents...
            </td>
        </tr>
    `;


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
                    <td colspan="5" style="text-align:center;">
                        No parents found.
                    </td>
                </tr>
            `;

            return;
        }


        table.innerHTML =
            parents
                .map(parent => {

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
                                    fullName ||
                                    "N/A"
                                )}
                            </td>

                            <td>
                                ${escapeHtml(
                                    parent.relationship ||
                                    "N/A"
                                )}
                            </td>

                            <td>
                                ${escapeHtml(
                                    parent.phone ||
                                    "N/A"
                                )}
                            </td>

                            <td>
                                ${escapeHtml(
                                    parent.email ||
                                    "N/A"
                                )}
                            </td>

                            <td>

                                <span
                                    class="status ${getStatusClass(
                                        parent.status
                                    )}"
                                >
                                    ${escapeHtml(
                                        parent.status ||
                                        "Active"
                                    )}
                                </span>

                            </td>

                        </tr>
                    `;

                })
                .join("");


    } catch (error) {

        console.error(
            "LOAD PARENTS ERROR:",
            error
        );


        table.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center;">
                    Unable to load parents.
                </td>
            </tr>
        `;

    }
}


/* ============================================================
   DASHBOARD OVERVIEW
============================================================ */

async function loadDashboardOverview() {

    /*
        Students and parents are already loaded when needed.

        This function exists so Overview is a proper page
        just like Students, Parents, School, etc.
    */

    try {

        await Promise.allSettled([
            loadStudents(),
            loadParents()
        ]);

    } catch (error) {

        console.error(
            "OVERVIEW ERROR:",
            error
        );

    }
}


/* ============================================================
   STATUS CLASS
============================================================ */

function getStatusClass(status) {

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


/* ============================================================
   UPDATE ELEMENT
============================================================ */

function updateElement(id, value) {

    const element =
        document.getElementById(id);

    if (element) {

        element.textContent =
            value;

    }
}


/* ============================================================
   ESCAPE HTML
============================================================ */

function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* ============================================================
   LOGOUT
============================================================ */

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


/* ============================================================
   ADD STUDENT BUTTONS
============================================================ */

const addStudentButton =
    document.getElementById(
        "addStudentButton"
    );


const studentsAddButton =
    document.getElementById(
        "studentsAddButton"
    );


function openAddStudent() {

    /*
        For now this opens the Students page.

        Later we can replace this with
        your Add Student modal/form.
    */

    showPage("students");

}


if (addStudentButton) {

    addStudentButton.addEventListener(
        "click",
        openAddStudent
    );

}


if (studentsAddButton) {

    studentsAddButton.addEventListener(
        "click",
        openAddStudent
    );

}


/* ============================================================
   ADD PARENT
============================================================ */

const addParentButton =
    document.getElementById(
        "addParentButton"
    );


if (addParentButton) {

    addParentButton.addEventListener(
        "click",
        () => {

            showPage("parents");

        }
    );

}


/* ============================================================
   INITIALIZE DASHBOARD
============================================================ */

async function initializeDashboard() {

    /*
        First make Overview visible.
    */

    showPage("overview");


    /*
        Then load profile.
    */

    await loadProfile();

}


initializeDashboard();
