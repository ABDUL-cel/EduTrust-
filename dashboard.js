"use strict";

/*
=========================================================
 EDU TRUST - DASHBOARD
 File: dashboard.js

 IMPORTANT:
 Student management belongs to student.js.

 dashboard.js:
 - handles navigation
 - handles sidebar
 - handles theme
 - handles logout
 - handles school/dashboard information

 dashboard.js DOES NOT load students.
 dashboard.js DOES NOT bind student search.
 dashboard.js DOES NOT bind student lifecycle buttons.
=========================================================
*/

const API_BASE =
    "https://edutrust-15ii.onrender.com";

const DASHBOARD_API =
    `${API_BASE}/api/dashboard`;


/* ======================================================
   AUTH
====================================================== */

function getDashboardToken() {

    return (
        localStorage.getItem("token") ||
        localStorage.getItem("authToken") ||
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("token") ||
        sessionStorage.getItem("authToken") ||
        ""
    );
}


function dashboardHeaders(json = true) {

    const headers = {};

    const token =
        getDashboardToken();


    if (token) {

        headers.Authorization =
            `Bearer ${token}`;
    }


    if (json) {

        headers["Content-Type"] =
            "application/json";
    }


    return headers;
}


/* ======================================================
   API
====================================================== */

async function apiRequest(
    endpoint,
    options = {}
) {

    const response =
        await fetch(
            `${DASHBOARD_API}${endpoint}`,
            {
                ...options,

                headers: {
                    ...dashboardHeaders(
                        options.body !== undefined
                    ),

                    ...(options.headers || {})
                }
            }
        );


    let data = {};

    try {

        data =
            await response.json();

    } catch {

        data = {};
    }


    if (response.status === 401) {

        localStorage.removeItem("token");
        localStorage.removeItem("authToken");
        localStorage.removeItem("accessToken");

        sessionStorage.removeItem("token");
        sessionStorage.removeItem("authToken");


        window.location.href =
            "login.html";


        return null;
    }


    if (response.status === 403) {

        throw new Error(
            data?.message ||
            "You do not have permission to perform this action."
        );
    }


    if (!response.ok) {

        throw new Error(
            data?.message ||
            "Something went wrong."
        );
    }


    return data;
}


/* ======================================================
   DOM READY
====================================================== */

document.addEventListener(
    "DOMContentLoaded",
    initializeDashboard
);


function initializeDashboard() {

    bindNavigation();

    bindSidebar();

    bindTheme();

    bindNotifications();

    bindLogout();

    loadDashboard();


    /*
     * IMPORTANT:
     *
     * We do NOT call loadStudents() here.
     *
     * student.js owns student loading.
     */
}


/* ======================================================
   NAVIGATION
====================================================== */

function bindNavigation() {

    document
        .querySelectorAll(
            "[data-page]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    event => {

                        event.preventDefault();

                        const page =
                            button.dataset.page;

                        if (!page) {
                            return;
                        }

                        showPage(page);
                    }
                );

            }
        );
}


function showPage(page) {

    document
        .querySelectorAll(
            ".page-content"
        )
        .forEach(
            content => {

                content.classList.add(
                    "hidden"
                );
            }
        );


    const target =
        document.getElementById(
            `${page}Page`
        );


    if (target) {

        target.classList.remove(
            "hidden"
        );
    }


    document
        .querySelectorAll(
            ".nav-item, .submenu-item"
        )
        .forEach(
            item => {

                item.classList.remove(
                    "active"
                );
            }
        );


    document
        .querySelectorAll(
            `[data-page="${page}"]`
        )
        .forEach(
            item => {

                item.classList.add(
                    "active"
                );
            }
        );


    /*
     * Student.js owns student loading.
     *
     * We only tell it to refresh when
     * the user actually opens Students.
     */
    if (
        page === "students" &&
        typeof window.loadStudents ===
            "function"
    ) {

        window.loadStudents();
    }


    /*
     * Close mobile sidebar after navigation.
     */
    const sidebar =
        document.getElementById(
            "sidebar"
        );

    if (sidebar) {

        sidebar.classList.remove(
            "mobile-open"
        );
    }
}


/* ======================================================
   SIDEBAR
====================================================== */

function bindSidebar() {

    const menuToggle =
        document.getElementById(
            "menu-toggle"
        );


    const sidebar =
        document.getElementById(
            "sidebar"
        );


    if (
        menuToggle &&
        sidebar
    ) {

        menuToggle.addEventListener(
            "click",
            () => {

                sidebar.classList.toggle(
                    "mobile-open"
                );

            }
        );
    }


    const reportsToggle =
        document.querySelector(
            ".reports-toggle"
        );


    if (reportsToggle) {

        reportsToggle.addEventListener(
            "click",
            () => {

                reportsToggle
                    .closest(".nav-group")
                    ?.classList.toggle(
                        "open"
                    );
            }
        );
    }


    const settingsToggle =
        document.querySelector(
            ".settings-toggle"
        );


    if (settingsToggle) {

        settingsToggle.addEventListener(
            "click",
            () => {

                settingsToggle
                    .closest(".nav-group")
                    ?.classList.toggle(
                        "open"
                    );
            }
        );
    }
}


/* ======================================================
   THEME
====================================================== */

function bindTheme() {

    const button =
        document.getElementById(
            "theme-toggle"
        );


    if (!button) {
        return;
    }


    const savedTheme =
        localStorage.getItem(
            "edutrust-theme"
        );


    if (
        savedTheme === "dark"
    ) {

        document.body.classList.add(
            "dark-mode"
        );

        button.textContent =
            "☀️";
    }


    button.addEventListener(
        "click",
        () => {

            const dark =
                document.body.classList.toggle(
                    "dark-mode"
                );


            localStorage.setItem(
                "edutrust-theme",
                dark
                    ? "dark"
                    : "light"
            );


            button.textContent =
                dark
                    ? "☀️"
                    : "🌙";
        }
    );
}


/* ======================================================
   NOTIFICATIONS
====================================================== */

function bindNotifications() {

    const button =
        document.getElementById(
            "notification-button"
        );


    const dropdown =
        document.getElementById(
            "notification-dropdown"
        );


    if (
        !button ||
        !dropdown
    ) {
        return;
    }


    button.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            dropdown.classList.toggle(
                "show"
            );
        }
    );


    document.addEventListener(
        "click",
        event => {

            if (
                !dropdown.contains(
                    event.target
                ) &&
                !button.contains(
                    event.target
                )
            ) {

                dropdown.classList.remove(
                    "show"
                );
            }
        }
    );
}


/* ======================================================
   LOGOUT
====================================================== */

function bindLogout() {

    const button =
        document.getElementById(
            "logoutButton"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        () => {

            localStorage.removeItem(
                "token"
            );

            localStorage.removeItem(
                "authToken"
            );

            localStorage.removeItem(
                "accessToken"
            );

            sessionStorage.removeItem(
                "token"
            );

            sessionStorage.removeItem(
                "authToken"
            );


            window.location.href =
                "login.html";
        }
    );
}


/* ======================================================
   DASHBOARD LOAD
====================================================== */

async function loadDashboard() {

    try {

        const data =
            await apiRequest(
                "/overview"
            );


        if (!data) {
            return;
        }


        updateDashboardStats(
            data
        );


    } catch (error) {

        console.error(
            "DASHBOARD LOAD ERROR:",
            error
        );

        /*
         * Do not break the Students page
         * just because overview data fails.
         */
    }
}


/* ======================================================
   STATS
====================================================== */

function updateDashboardStats(data) {

    const students =
        data.totalStudents ??
        data.students ??
        0;


    const parents =
        data.totalParents ??
        data.parents ??
        0;


    const feesCollected =
        data.feesCollected ??
        0;


    const outstanding =
        data.outstandingFees ??
        0;


    setText(
        "totalStudents",
        students
    );


    setText(
        "totalParents",
        parents
    );


    setText(
        "feesCollected",
        formatCurrency(
            feesCollected
        )
    );


    setText(
        "outstandingFees",
        formatCurrency(
            outstanding
        )
    );


    setText(
        "collectionCollected",
        formatCurrency(
            feesCollected
        )
    );


    setText(
        "collectionOutstanding",
        formatCurrency(
            outstanding
        )
    );


    const total =
        Number(feesCollected) +
        Number(outstanding);


    const percentage =
        total > 0
            ? Math.round(
                (
                    Number(feesCollected) /
                    total
                ) * 100
            )
            : 0;


    setText(
        "collectionPercentage",
        `${percentage}%`
    );
}


/* ======================================================
   SCHOOL PROFILE
====================================================== */

async function loadSchoolProfile() {

    try {

        const data =
            await apiRequest(
                "/school"
            );


        if (!data) {
            return;
        }


        const school =
            data.school ||
            data;


        setInput(
            "schoolName",
            school.name
        );


        setInput(
            "schoolCode",
            school.school_code
        );


        setInput(
            "schoolPhone",
            school.phone
        );


        setInput(
            "schoolEmail",
            school.email
        );


        setInput(
            "schoolType",
            school.school_type
        );


        setInput(
            "schoolAddress",
            school.address
        );


        setInput(
            "academicSession",
            school.academic_session
        );


        setInput(
            "currentTerm",
            school.current_term
        );


        setInput(
            "schoolMotto",
            school.motto
        );


        setInput(
            "schoolWebsite",
            school.website
        );


        setText(
            "sidebarSchoolName",
            school.name ||
            "EduTrust School"
        );


        const initials =
            getInitials(
                school.name
            );


        setText(
            "schoolAvatar",
            initials
        );


    } catch (error) {

        console.error(
            "SCHOOL PROFILE ERROR:",
            error
        );
    }
}


/* ======================================================
   SCHOOL FORM
====================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const form =
            document.getElementById(
                "schoolForm"
            );


        if (!form) {
            return;
        }


        form.addEventListener(
            "submit",
            async event => {

                event.preventDefault();


                const formData =
                    new FormData(form);


                const payload = {};


                formData.forEach(
                    (value, key) => {

                        payload[key] =
                            value;
                    }
                );


                try {

                    await apiRequest(
                        "/school",
                        {
                            method: "PUT",
                            body:
                                JSON.stringify(
                                    payload
                                )
                        }
                    );


                    showToast(
                        "School profile saved successfully.",
                        "success"
                    );


                    await loadSchoolProfile();


                } catch (error) {

                    showToast(
                        error.message ||
                        "Unable to save school profile.",
                        "error"
                    );
                }
            }
        );
    }
);


/* ======================================================
   HELPERS
====================================================== */

function setText(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (element) {

        element.textContent =
            value ??
            "0";
    }
}


function setInput(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (element) {

        element.value =
            value ??
            "";
    }
}


function formatCurrency(
    value
) {

    const number =
        Number(value) || 0;


    return (
        "₦" +
        number.toLocaleString(
            "en-NG"
        )
    );
}


function getInitials(
    name
) {

    const parts =
        String(name || "")
            .trim()
            .split(/\s+/)
            .filter(Boolean);


    if (!parts.length) {
        return "ET";
    }


    if (parts.length === 1) {

        return parts[0]
            .substring(0, 2)
            .toUpperCase();
    }


    return (
        parts[0][0] +
        parts[parts.length - 1][0]
    ).toUpperCase();
}


function showToast(
    message,
    type = "success"
) {

    let toast =
        document.getElementById(
            "toast"
        );


    if (!toast) {

        toast =
            document.createElement(
                "div"
            );

        toast.id =
            "toast";

        toast.className =
            "toast";

        document.body.appendChild(
            toast
        );
    }


    toast.textContent =
        message;


    toast.classList.remove(
        "show",
        "success",
        "error"
    );


    toast.classList.add(
        type,
        "show"
    );


    clearTimeout(
        showToast.timer
    );


    showToast.timer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            3500
        );
}


/* ======================================================
   START SCHOOL LOAD
====================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadSchoolProfile();
    }
);


/* ======================================================
   PUBLIC API
====================================================== */

window.showPage =
    showPage;

window.apiRequest =
    apiRequest;
