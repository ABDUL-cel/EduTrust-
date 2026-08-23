// =========================================================
// student.js
// =========================================================

"use strict";

const API_BASE_URL =
    "https://edutrust-15ii.onrender.com";

const STUDENT_API =
    `${API_BASE_URL}/api/students`;

let allStudents = [];
let filteredStudents = [];
let editingStudentId = null;
let studentEventsBound = false;
let studentLoadInProgress = false;


/* =========================================================
   AUTH
========================================================= */

function getAuthToken() {
    return (
        localStorage.getItem("token") ||
        localStorage.getItem("authToken") ||
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("token") ||
        sessionStorage.getItem("authToken") ||
        sessionStorage.getItem("accessToken") ||
        ""
    );
}


function authHeaders(includeJson = true) {
    const headers = {};

    const token = getAuthToken();

    if (token) {
        headers.Authorization =
            `Bearer ${token}`;
    }

    if (includeJson) {
        headers["Content-Type"] =
            "application/json";
    }

    return headers;
}


/* =========================================================
   API
========================================================= */

async function studentApiRequest(
    endpoint = "",
    options = {}
) {
    const token = getAuthToken();

    if (!token) {
        throw new Error(
            "Authentication required. Please log in again."
        );
    }

    const response = await fetch(
        `${STUDENT_API}${endpoint}`,
        {
            ...options,

            headers: {
                ...authHeaders(
                    options.body !== undefined
                ),

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
        localStorage.removeItem("authToken");
        localStorage.removeItem("accessToken");

        sessionStorage.removeItem("token");
        sessionStorage.removeItem("authToken");
        sessionStorage.removeItem("accessToken");

        throw new Error(
            data?.message ||
            "Your session has expired. Please log in again."
        );
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
            `Request failed with status ${response.status}.`
        );
    }

    return data;
}


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {
        bindStudentEvents();
    }
);


function bindStudentEvents() {
    if (studentEventsBound) {
        return;
    }

    studentEventsBound = true;


    /* REGISTER STUDENT */

    const addButton =
        document.getElementById(
            "studentsAddButton"
        );

    if (addButton) {
        addButton.addEventListener(
            "click",
            () => {
                openStudentModal();
            }
        );
    }


    /* OVERVIEW ADD STUDENT */

    const overviewAddButton =
        document.getElementById(
            "addStudentButton"
        );

    if (overviewAddButton) {
        overviewAddButton.addEventListener(
            "click",
            () => {
                openStudentModal();
            }
        );
    }


    /* SEARCH */

    const searchInput =
        document.getElementById(
            "studentSearchInput"
        );

    if (searchInput) {
        searchInput.addEventListener(
            "input",
            applyStudentFilters
        );
    }


    /* STATUS */

    const statusFilter =
        document.getElementById(
            "studentStatusFilter"
        );

    if (statusFilter) {
        statusFilter.addEventListener(
            "change",
            applyStudentFilters
        );
    }


    /*
    ========================================================
    DO NOT LOAD STUDENTS HERE WITH ANOTHER SETINTERVAL,
    ANOTHER DOMContentLoaded LISTENER, OR ANOTHER FETCH.

    dashboard.js calls window.loadStudents() only when the
    Students page is opened.
    ========================================================
    */
}


/* =========================================================
   LOAD STUDENTS
========================================================= */

async function loadStudents() {
    const table =
        document.getElementById(
            "studentsTable"
        );

    if (!table) {
        return;
    }

    if (studentLoadInProgress) {
        return;
    }

    studentLoadInProgress = true;

    table.innerHTML = `
        <tr>
            <td colspan="6">
                Loading students...
            </td>
        </tr>
    `;

    try {
        const data =
            await studentApiRequest("");

        allStudents =
            Array.isArray(data?.students)
                ? data.students
                : Array.isArray(data?.data)
                    ? data.data
                    : [];

        filteredStudents =
            [...allStudents];

        applyStudentFilters();

    } catch (error) {
        console.error(
            "LOAD STUDENTS ERROR:",
            error
        );

        table.innerHTML = `
            <tr>
                <td colspan="6">
                    ${escapeHtml(
                        error.message ||
                        "Unable to load students."
                    )}
                </td>
            </tr>
        `;

        showStudentToast(
            error.message ||
            "Unable to load students.",
            "error"
        );

    } finally {
        studentLoadInProgress = false;
    }
}


/* =========================================================
   SEARCH + FILTER
========================================================= */

function applyStudentFilters() {
    const searchInput =
        document.getElementById(
            "studentSearchInput"
        );

    const statusFilter =
        document.getElementById(
            "studentStatusFilter"
        );

    const search =
        String(
            searchInput?.value || ""
        )
            .trim()
            .toLowerCase();

    const status =
        String(
            statusFilter?.value || "all"
        );


    filteredStudents =
        allStudents.filter(student => {

            const firstName =
                student.first_name || "";

            const lastName =
                student.last_name || "";

            const fullName =
                `${firstName} ${lastName}`
                    .trim();

            const admission =
                student.admission_number || "";

            const matric =
                student.matric_number || "";

            const studentClass =
                student.class_name ||
                student.class ||
                student.current_class ||
                "";

            const searchable =
                [
                    fullName,
                    firstName,
                    lastName,
                    admission,
                    matric,
                    studentClass
                ]
                    .join(" ")
                    .toLowerCase();

            const matchesSearch =
                !search ||
                searchable.includes(search);

            const matchesStatus =
                status === "all" ||
                String(
                    student.status || ""
                ) === status;

            return (
                matchesSearch &&
                matchesStatus
            );
        });


    renderStudents();
    updateStudentResultCount();
}


/* =========================================================
   RENDER
========================================================= */

function renderStudents() {
    const table =
        document.getElementById(
            "studentsTable"
        );

    if (!table) {
        return;
    }


    if (!filteredStudents.length) {
        table.innerHTML = `
            <tr>
                <td colspan="6">
                    No students found.
                </td>
            </tr>
        `;

        return;
    }


    table.innerHTML =
        filteredStudents
            .map(createStudentRow)
            .join("");
}


/* =========================================================
   STUDENT ROW
========================================================= */

function createStudentRow(student) {
    const id =
        student._id ||
        student.id;

    const firstName =
        student.first_name || "";

    const lastName =
        student.last_name || "";

    const fullName =
        `${firstName} ${lastName}`
            .trim() ||
        student.name ||
        "Unnamed Student";

    const admission =
        student.admission_number ||
        "—";

    const gender =
        student.gender ||
        "—";

    const studentClass =
        student.class_name ||
        student.class ||
        student.current_class ||
        "—";

    const status =
        student.status ||
        "Pending";


    return `
        <tr data-student-id="${escapeAttribute(id)}">

            <td>
                <strong>
                    ${escapeHtml(admission)}
                </strong>
            </td>

            <td>
                ${escapeHtml(fullName)}
            </td>

            <td>
                ${escapeHtml(gender)}
            </td>

            <td>
                ${escapeHtml(studentClass)}
            </td>

            <td>
                <span class="status ${getStatusClass(status)}">
                    ${escapeHtml(status)}
                </span>
            </td>

            <td>
                <div class="student-actions">

                    <button
                        type="button"
                        class="text-button"
                        onclick="viewStudent('${escapeAttribute(id)}')"
                    >
                        View
                    </button>

                    ${getLifecycleActions(student)}

                </div>
            </td>

        </tr>
    `;
}


/* =========================================================
   LIFECYCLE ACTIONS
========================================================= */

function getLifecycleActions(student) {
    const id =
        student._id ||
        student.id;

    const status =
        String(
            student.status || "Pending"
        );


    if (status === "Pending") {
        return `
            <button
                type="button"
                class="text-button"
                onclick="approveStudent('${escapeAttribute(id)}')"
            >
                Approve
            </button>

            <button
                type="button"
                class="text-button danger"
                onclick="rejectStudent('${escapeAttribute(id)}')"
            >
                Reject
            </button>
        `;
    }


    if (status === "Active") {
        return `
            <button
                type="button"
                class="text-button"
                onclick="suspendStudent('${escapeAttribute(id)}')"
            >
                Suspend
            </button>

            <button
                type="button"
                class="text-button"
                onclick="graduateStudent('${escapeAttribute(id)}')"
            >
                Graduate
            </button>

            <button
                type="button"
                class="text-button"
                onclick="editStudent('${escapeAttribute(id)}')"
            >
                Edit
            </button>
        `;
    }


    if (status === "Suspended") {
        return `
            <button
                type="button"
                class="text-button"
                onclick="reinstateStudent('${escapeAttribute(id)}')"
            >
                Reinstate
            </button>
        `;
    }


    if (status === "Rejected") {
        return `
            <button
                type="button"
                class="text-button"
                onclick="editStudent('${escapeAttribute(id)}')"
            >
                Edit
            </button>
        `;
    }


    if (status === "Graduated") {
        return `
            <button
                type="button"
                class="text-button"
                onclick="archiveStudent('${escapeAttribute(id)}')"
            >
                Archive
            </button>
        `;
    }


    return "";
}


/* =========================================================
   RESULT COUNT
========================================================= */

function updateStudentResultCount() {
    const count =
        document.getElementById(
            "studentResultCount"
        );

    if (!count) {
        return;
    }

    const total =
        filteredStudents.length;

    count.textContent =
        `${total} student${total === 1 ? "" : "s"}`;
}


/* =========================================================
   STATUS CLASS
========================================================= */

function getStatusClass(status) {
    return String(status)
        .toLowerCase()
        .replace(/\s+/g, "-");
}


/* =========================================================
   ESCAPING
========================================================= */

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function escapeAttribute(value) {
    return String(value ?? "")
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'");
}


/* =========================================================
   APPROVE
========================================================= */

async function approveStudent(id) {
    if (!confirm(
        "Approve this student registration?"
    )) {
        return;
    }

    try {
        await studentApiRequest(
            `/${id}/approve`,
            {
                method: "PATCH"
            }
        );

        showStudentToast(
            "Student approved successfully.",
            "success"
        );

        await loadStudents();

    } catch (error) {
        showStudentToast(
            error.message ||
            "Unable to approve student.",
            "error"
        );
    }
}


/* =========================================================
   REJECT
========================================================= */

async function rejectStudent(id) {
    if (!confirm(
        "Reject this student registration?"
    )) {
        return;
    }

    try {
        await studentApiRequest(
            `/${id}/reject`,
            {
                method: "PATCH"
            }
        );

        showStudentToast(
            "Student rejected.",
            "success"
        );

        await loadStudents();

    } catch (error) {
        showStudentToast(
            error.message ||
            "Unable to reject student.",
            "error"
        );
    }
}


/* =========================================================
   SUSPEND
========================================================= */

async function suspendStudent(id) {
    if (!confirm(
        "Suspend this student account?"
    )) {
        return;
    }

    try {
        await studentApiRequest(
            `/${id}/suspend`,
            {
                method: "PATCH"
            }
        );

        showStudentToast(
            "Student suspended.",
            "success"
        );

        await loadStudents();

    } catch (error) {
        showStudentToast(
            error.message ||
            "Unable to suspend student.",
            "error"
        );
    }
}


/* =========================================================
   REINSTATE
========================================================= */

async function reinstateStudent(id) {
    if (!confirm(
        "Reinstate this student account?"
    )) {
        return;
    }

    try {
        await studentApiRequest(
            `/${id}/reinstate`,
            {
                method: "PATCH"
            }
        );

        showStudentToast(
            "Student reinstated.",
            "success"
        );

        await loadStudents();

    } catch (error) {
        showStudentToast(
            error.message ||
            "Unable to reinstate student.",
            "error"
        );
    }
}


/* =========================================================
   GRADUATE
========================================================= */

async function graduateStudent(id) {
    if (!confirm(
        "Mark this student as graduated?"
    )) {
        return;
    }

    try {
        await studentApiRequest(
            `/${id}/graduate`,
            {
                method: "PATCH"
            }
        );

        showStudentToast(
            "Student marked as graduated.",
            "success"
        );

        await loadStudents();

    } catch (error) {
        showStudentToast(
            error.message ||
            "Unable to graduate student.",
            "error"
        );
    }
}


/* =========================================================
   ARCHIVE
========================================================= */

async function archiveStudent(id) {
    if (!confirm(
        "Archive this student?"
    )) {
        return;
    }

    try {
        await studentApiRequest(
            `/${id}/archive`,
            {
                method: "PATCH"
            }
        );

        showStudentToast(
            "Student archived.",
            "success"
        );

        await loadStudents();

    } catch (error) {
        showStudentToast(
            error.message ||
            "Unable to archive student.",
            "error"
        );
    }
}


/* =========================================================
   PUBLIC
========================================================= */

window.loadStudents =
    loadStudents;

window.approveStudent =
    approveStudent;

window.rejectStudent =
    rejectStudent;

window.suspendStudent =
    suspendStudent;

window.reinstateStudent =
    reinstateStudent;

window.graduateStudent =
    graduateStudent;

window.archiveStudent =
    archiveStudent;
