"use strict";

/*
=========================================================
 EDU TRUST - STUDENT MANAGEMENT
 File: student.js

 IMPORTANT:
 - dashboard.js handles dashboard navigation.
 - student.js handles ONLY student management.
 - Do NOT load students from dashboard.js.
=========================================================
*/

const API_BASE = "https://edutrust-15ii.onrender.com";
const STUDENT_API = `${API_BASE}/api/students`;

let allStudents = [];
let filteredStudents = [];
let editingStudentId = null;
let studentEventsBound = false;
let studentsLoading = false;


/* ======================================================
   AUTH
====================================================== */

function getAuthToken() {
    return (
        localStorage.getItem("token") ||
        localStorage.getItem("authToken") ||
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("token") ||
        sessionStorage.getItem("authToken") ||
        ""
    );
}


function authHeaders(json = true) {

    const headers = {};

    const token = getAuthToken();

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    if (json) {
        headers["Content-Type"] = "application/json";
    }

    return headers;
}


/* ======================================================
   API REQUEST
====================================================== */

async function studentApiRequest(endpoint = "", options = {}) {

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

        showStudentToast(
            "Your session has expired. Please log in again.",
            "error"
        );

        return null;
    }


    if (response.status === 403) {

        throw new Error(
            data?.message ||
            "You do not have permission to manage students."
        );
    }


    if (response.status === 404) {

        throw new Error(
            data?.message ||
            "Student API route was not found."
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
   INITIALIZATION
====================================================== */

document.addEventListener(
    "DOMContentLoaded",
    initializeStudentManagement
);


function initializeStudentManagement() {

    if (studentEventsBound) {
        return;
    }

    studentEventsBound = true;

    bindStudentEvents();

    /*
     * Only load if Students page is currently visible.
     */
    const studentsPage =
        document.getElementById("studentsPage");

    if (
        studentsPage &&
        !studentsPage.classList.contains("hidden")
    ) {
        loadStudents();
    }
}


/* ======================================================
   EVENTS
====================================================== */

function bindStudentEvents() {

    const addButton =
        document.getElementById(
            "studentsAddButton"
        );

    if (addButton) {

        addButton.addEventListener(
            "click",
            () => openStudentModal()
        );
    }


    const overviewAddButton =
        document.getElementById(
            "addStudentButton"
        );

    if (overviewAddButton) {

        overviewAddButton.addEventListener(
            "click",
            () => openStudentModal()
        );
    }


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
}


/* ======================================================
   LOAD STUDENTS
====================================================== */

async function loadStudents() {

    if (studentsLoading) {
        return;
    }

    const table =
        document.getElementById(
            "studentsTable"
        );

    if (!table) {
        return;
    }

    studentsLoading = true;

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


        if (!data) {
            return;
        }


        allStudents =
            Array.isArray(data.students)
                ? data.students
                : [];


        filteredStudents =
            [...allStudents];


        renderStudents();

        updateStudentResultCount();


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

        studentsLoading = false;
    }
}


/* ======================================================
   SEARCH + FILTER
====================================================== */

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
        (
            searchInput?.value ||
            ""
        )
            .trim()
            .toLowerCase();


    const status =
        statusFilter?.value ||
        "all";


    filteredStudents =
        allStudents.filter(
            student => {

                const fullName = [

                    student.first_name,
                    student.other_name,
                    student.last_name

                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();


                const admission =
                    String(
                        student.admission_number ||
                        ""
                    )
                        .toLowerCase();


                const matric =
                    String(
                        student.matric_number ||
                        ""
                    )
                        .toLowerCase();


                const className =
                    String(
                        student.class_name ||
                        ""
                    )
                        .toLowerCase();


                const email =
                    String(
                        student.email ||
                        ""
                    )
                        .toLowerCase();


                const matchesSearch =
                    !search ||

                    admission.includes(search) ||

                    matric.includes(search) ||

                    fullName.includes(search) ||

                    className.includes(search) ||

                    email.includes(search);


                const matchesStatus =
                    status === "all" ||
                    String(
                        student.status || ""
                    ) === status;


                return (
                    matchesSearch &&
                    matchesStatus
                );
            }
        );


    renderStudents();

    updateStudentResultCount();
}


/* ======================================================
   RENDER
====================================================== */

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


/* ======================================================
   STUDENT ROW
====================================================== */

function createStudentRow(student) {

    const id =
        student._id ||
        student.id;


    const fullName = [

        student.first_name,
        student.other_name,
        student.last_name

    ]
        .filter(Boolean)
        .join(" ");


    const status =
        student.status ||
        "Pending";


    return `
        <tr data-student-id="${escapeAttribute(id)}">

            <td>
                <strong>
                    ${escapeHtml(
                        student.admission_number ||
                        "—"
                    )}
                </strong>

                ${
                    student.matric_number
                        ? `
                            <small class="student-matric">
                                ${escapeHtml(
                                    student.matric_number
                                )}
                            </small>
                          `
                        : ""
                }
            </td>


            <td>

                <div class="student-name-cell">

                    <div class="student-mini-avatar">
                        ${getInitials(fullName)}
                    </div>

                    <div>

                        <strong>
                            ${escapeHtml(
                                fullName ||
                                "Unnamed Student"
                            )}
                        </strong>

                        ${
                            student.email
                                ? `
                                    <small>
                                        ${escapeHtml(
                                            student.email
                                        )}
                                    </small>
                                  `
                                : ""
                        }

                    </div>

                </div>

            </td>


            <td>
                ${escapeHtml(
                    student.gender ||
                    "Not Specified"
                )}
            </td>


            <td>

                ${escapeHtml(
                    student.class_name ||
                    "—"
                )}

                ${
                    student.arm
                        ? `
                            <small class="student-arm">
                                ${escapeHtml(
                                    student.arm
                                )}
                            </small>
                          `
                        : ""
                }

            </td>


            <td>

                <span
                    class="student-status ${getStatusClass(status)}"
                >
                    ${escapeHtml(status)}
                </span>

            </td>


            <td>

                <div class="student-actions">

                    <button
                        type="button"
                        class="student-action-button view"
                        onclick="viewStudent('${escapeAttribute(id)}')"
                        title="View student"
                    >
                        👁️
                    </button>


                    <button
                        type="button"
                        class="student-action-button edit"
                        onclick="editStudent('${escapeAttribute(id)}')"
                        title="Edit student"
                    >
                        ✏️
                    </button>


                    ${getLifecycleActions(student)}


                    <button
                        type="button"
                        class="student-action-button delete"
                        onclick="deleteStudent('${escapeAttribute(id)}')"
                        title="Delete student"
                    >
                        🗑️
                    </button>

                </div>

            </td>

        </tr>
    `;
}


/* ======================================================
   LIFECYCLE ACTIONS
====================================================== */

function getLifecycleActions(student) {

    const id =
        student._id ||
        student.id;


    switch (student.status) {

        case "Pending":

            return `

                <button
                    type="button"
                    class="student-action-button approve"
                    onclick="approveStudent('${escapeAttribute(id)}')"
                    title="Approve student"
                >
                    ✓
                </button>


                <button
                    type="button"
                    class="student-action-button reject"
                    onclick="rejectStudent('${escapeAttribute(id)}')"
                    title="Reject student"
                >
                    ✕
                </button>

            `;


        case "Active":

            return `

                <button
                    type="button"
                    class="student-action-button suspend"
                    onclick="suspendStudent('${escapeAttribute(id)}')"
                    title="Suspend student"
                >
                    ⏸
                </button>


                <button
                    type="button"
                    class="student-action-button graduate"
                    onclick="graduateStudent('${escapeAttribute(id)}')"
                    title="Graduate student"
                >
                    🎓
                </button>


                <button
                    type="button"
                    class="student-action-button archive"
                    onclick="archiveStudent('${escapeAttribute(id)}')"
                    title="Archive student"
                >
                    📦
                </button>

            `;


        case "Suspended":

            return `

                <button
                    type="button"
                    class="student-action-button approve"
                    onclick="reinstateStudent('${escapeAttribute(id)}')"
                    title="Reinstate student"
                >
                    ▶
                </button>

            `;


        case "Graduated":

            return `

                <button
                    type="button"
                    class="student-action-button archive"
                    onclick="archiveStudent('${escapeAttribute(id)}')"
                    title="Archive student"
                >
                    📦
                </button>

            `;


        case "Rejected":

            return `

                <button
                    type="button"
                    class="student-action-button approve"
                    onclick="approveStudent('${escapeAttribute(id)}')"
                    title="Approve student"
                >
                    ✓
                </button>

            `;


        case "Archived":

            return "";


        default:

            return "";
    }
}


/* ======================================================
   RESULT COUNT
====================================================== */

function updateStudentResultCount() {

    const element =
        document.getElementById(
            "studentResultCount"
        );


    if (!element) {
        return;
    }


    const count =
        filteredStudents.length;


    element.textContent =
        `${count} ${
            count === 1
                ? "student"
                : "students"
        }`;
}


/* ======================================================
   REGISTER / EDIT MODAL
====================================================== */

function openStudentModal(student = null) {

    editingStudentId =
        student?._id ||
        student?.id ||
        null;


    document
        .getElementById("studentModal")
        ?.remove();


    const modal =
        document.createElement("div");


    modal.id =
        "studentModal";


    modal.className =
        "student-modal-overlay";


    modal.innerHTML = `

        <div class="student-modal">

            <div class="student-modal-header">

                <div>

                    <h2>
                        ${
                            student
                                ? "Edit Student"
                                : "Register Student"
                        }
                    </h2>

                    <p>
                        ${
                            student
                                ? "Update student information."
                                : "Create a new student registration."
                        }
                    </p>

                </div>


                <button
                    type="button"
                    class="student-modal-close"
                    id="studentModalClose"
                >
                    ×
                </button>

            </div>


            <form
                id="studentForm"
                class="student-form"
            >

                ${
                    student
                        ? ""
                        : `

                            <div class="student-form-section">

                                <h3>
                                    Account
                                </h3>

                                <div class="student-form-grid">

                                    <div class="form-group">

                                        <label>
                                            Password
                                        </label>

                                        <input
                                            type="password"
                                            name="password"
                                            minlength="6"
                                            placeholder="Optional"
                                        >

                                    </div>

                                </div>

                            </div>

                          `
                }


                <div class="student-form-section">

                    <h3>
                        Personal Information
                    </h3>


                    <div class="student-form-grid">

                        <div class="form-group">

                            <label>
                                First Name *
                            </label>

                            <input
                                type="text"
                                name="first_name"
                                required
                                value="${escapeAttribute(
                                    student?.first_name || ""
                                )}"
                            >

                        </div>


                        <div class="form-group">

                            <label>
                                Last Name *
                            </label>

                            <input
                                type="text"
                                name="last_name"
                                required
                                value="${escapeAttribute(
                                    student?.last_name || ""
                                )}"
                            >

                        </div>


                        <div class="form-group">

                            <label>
                                Other Name
                            </label>

                            <input
                                type="text"
                                name="other_name"
                                value="${escapeAttribute(
                                    student?.other_name || ""
                                )}"
                            >

                        </div>


                        <div class="form-group">

                            <label>
                                Gender
                            </label>

                            <select name="gender">

                                <option value="Not Specified">
                                    Not Specified
                                </option>

                                <option value="Male"
                                    ${
                                        student?.gender === "Male"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    Male
                                </option>

                                <option value="Female"
                                    ${
                                        student?.gender === "Female"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    Female
                                </option>

                            </select>

                        </div>


                        <div class="form-group">

                            <label>
                                Date of Birth
                            </label>

                            <input
                                type="date"
                                name="date_of_birth"
                                value="${formatDateInput(
                                    student?.date_of_birth
                                )}"
                            >

                        </div>


                        <div class="form-group">

                            <label>
                                Phone
                            </label>

                            <input
                                type="text"
                                name="phone"
                                value="${escapeAttribute(
                                    student?.phone || ""
                                )}"
                            >

                        </div>


                        <div class="form-group">

                            <label>
                                Email
                            </label>

                            <input
                                type="email"
                                name="email"
                                value="${escapeAttribute(
                                    student?.email || ""
                                )}"
                            >

                        </div>

                    </div>

                </div>


                <div class="student-form-section">

                    <h3>
                        Academic Information
                    </h3>


                    <div class="student-form-grid">

                        <div class="form-group">

                            <label>
                                Class *
                            </label>

                            <input
                                type="text"
                                name="class_name"
                                required
                                value="${escapeAttribute(
                                    student?.class_name || ""
                                )}"
                            >

                        </div>


                        <div class="form-group">

                            <label>
                                Arm
                            </label>

                            <input
                                type="text"
                                name="arm"
                                value="${escapeAttribute(
                                    student?.arm || ""
                                )}"
                            >

                        </div>


                        <div class="form-group">

                            <label>
                                Department
                            </label>

                            <input
                                type="text"
                                name="department"
                                value="${escapeAttribute(
                                    student?.department || ""
                                )}"
                            >

                        </div>


                        <div class="form-group">

                            <label>
                                Academic Session
                            </label>

                            <input
                                type="text"
                                name="academic_session"
                                placeholder="2026/2027"
                                value="${escapeAttribute(
                                    student?.academic_session || ""
                                )}"
                            >

                        </div>

                    </div>

                </div>


                <div class="student-form-section">

                    <h3>
                        Additional Information
                    </h3>


                    <div class="student-form-grid">

                        <div class="form-group full-width">

                            <label>
                                Home Address
                            </label>

                            <textarea
                                name="home_address"
                                rows="3"
                            >${escapeHtml(
                                student?.home_address || ""
                            )}</textarea>

                        </div>


                        <div class="form-group">

                            <label>
                                Passport URL
                            </label>

                            <input
                                type="text"
                                name="passport"
                                value="${escapeAttribute(
                                    student?.passport || ""
                                )}"
                            >

                        </div>

                    </div>

                </div>


                <div class="student-modal-actions">

                    <button
                        type="button"
                        class="secondary-button"
                        id="studentCancelButton"
                    >
                        Cancel
                    </button>


                    <button
                        type="submit"
                        class="primary-button"
                    >
                        ${
                            student
                                ? "Save Changes"
                                : "Register Student"
                        }
                    </button>

                </div>

            </form>

        </div>
    `;


    document.body.appendChild(modal);


    document
        .getElementById("studentModalClose")
        ?.addEventListener(
            "click",
            closeStudentModal
        );


    document
        .getElementById("studentCancelButton")
        ?.addEventListener(
            "click",
            closeStudentModal
        );


    document
        .getElementById("studentForm")
        ?.addEventListener(
            "submit",
            handleStudentFormSubmit
        );


    modal.addEventListener(
        "click",
        event => {

            if (event.target === modal) {
                closeStudentModal();
            }

        }
    );
}


function closeStudentModal() {

    document
        .getElementById("studentModal")
        ?.remove();

    editingStudentId = null;
}


/* ======================================================
   FORM SUBMIT
====================================================== */

async function handleStudentFormSubmit(event) {

    event.preventDefault();


    const form =
        event.currentTarget;


    const formData =
        new FormData(form);


    const payload = {};


    formData.forEach(
        (value, key) => {

            if (
                String(value).trim() !== ""
            ) {
                payload[key] =
                    String(value).trim();
            }

        }
    );


    const button =
        form.querySelector(
            "button[type='submit']"
        );


    try {

        if (button) {
            button.disabled = true;
            button.textContent =
                editingStudentId
                    ? "Saving..."
                    : "Registering...";
        }


        if (editingStudentId) {

            await studentApiRequest(
                `/${editingStudentId}`,
                {
                    method: "PUT",
                    body: JSON.stringify(payload)
                }
            );


            showStudentToast(
                "Student updated successfully.",
                "success"
            );

        } else {

            const result =
                await studentApiRequest(
                    "/register",
                    {
                        method: "POST",
                        body: JSON.stringify(payload)
                    }
                );


            /*
             * Your backend should generate the admission number.
             * Example: EDU749279
             */
            if (result?.student?.admission_number) {

                showStudentToast(
                    `Student registered: ${result.student.admission_number}`,
                    "success"
                );

            } else {

                showStudentToast(
                    "Student registered successfully.",
                    "success"
                );
            }
        }


        closeStudentModal();

        await loadStudents();


    } catch (error) {

        console.error(
            "STUDENT FORM ERROR:",
            error
        );


        showStudentToast(
            error.message ||
            "Unable to save student.",
            "error"
        );


        if (button) {

            button.disabled = false;

            button.textContent =
                editingStudentId
                    ? "Save Changes"
                    : "Register Student";
        }
    }
}


/* ======================================================
   VIEW
====================================================== */

async function viewStudent(id) {

    try {

        const data =
            await studentApiRequest(
                `/${id}`
            );


        if (!data?.student) {
            return;
        }


        openStudentViewModal(
            data.student
        );

    } catch (error) {

        showStudentToast(
            error.message ||
            "Unable to load student.",
            "error"
        );
    }
}


/* ======================================================
   VIEW MODAL
====================================================== */

function openStudentViewModal(student) {

    document
        .getElementById("studentViewModal")
        ?.remove();


    const fullName = [

        student.first_name,
        student.other_name,
        student.last_name

    ]
        .filter(Boolean)
        .join(" ");


    const modal =
        document.createElement("div");


    modal.id =
        "studentViewModal";


    modal.className =
        "student-modal-overlay";


    modal.innerHTML = `

        <div class="student-modal">

            <div class="student-modal-header">

                <div>

                    <h2>
                        Student Profile
                    </h2>

                    <p>
                        ${escapeHtml(fullName)}
                    </p>

                </div>


                <button
                    type="button"
                    class="student-modal-close"
                    onclick="closeStudentViewModal()"
                >
                    ×
                </button>

            </div>


            <div class="student-profile-view">

                <div class="student-profile-avatar">
                    ${getInitials(fullName)}
                </div>


                <h2>
                    ${escapeHtml(fullName)}
                </h2>


                <span
                    class="student-status ${getStatusClass(
                        student.status
                    )}"
                >
                    ${escapeHtml(
                        student.status ||
                        "Pending"
                    )}
                </span>


                <div class="student-detail-grid">

                    <div>
                        <small>
                            Admission Number
                        </small>

                        <strong>
                            ${escapeHtml(
                                student.admission_number ||
                                "—"
                            )}
                        </strong>
                    </div>


                    <div>
                        <small>
                            Matric Number
                        </small>

                        <strong>
                            ${escapeHtml(
                                student.matric_number ||
                                "Not assigned"
                            )}
                        </strong>
                    </div>


                    <div>
                        <small>
                            Gender
                        </small>

                        <strong>
                            ${escapeHtml(
                                student.gender ||
                                "—"
                            )}
                        </strong>
                    </div>


                    <div>
                        <small>
                            Class
                        </small>

                        <strong>
                            ${escapeHtml(
                                student.class_name ||
                                "—"
                            )}
                        </strong>
                    </div>


                    <div>
                        <small>
                            Arm
                        </small>

                        <strong>
                            ${escapeHtml(
                                student.arm ||
                                "—"
                            )}
                        </strong>
                    </div>


                    <div>
                        <small>
                            Department
                        </small>

                        <strong>
                            ${escapeHtml(
                                student.department ||
                                "—"
                            )}
                        </strong>
                    </div>


                    <div>
                        <small>
                            Email
                        </small>

                        <strong>
                            ${escapeHtml(
                                student.email ||
                                "—"
                            )}
                        </strong>
                    </div>


                    <div>
                        <small>
                            Phone
                        </small>

                        <strong>
                            ${escapeHtml(
                                student.phone ||
                                "—"
                            )}
                        </strong>
                    </div>


                    <div>
                        <small>
                            Academic Session
                        </small>

                        <strong>
                            ${escapeHtml(
                                student.academic_session ||
                                "—"
                            )}
                        </strong>
                    </div>


                    <div>
                        <small>
                            Admission Date
                        </small>

                        <strong>
                            ${formatDisplayDate(
                                student.admission_date
                            )}
                        </strong>
                    </div>

                </div>

            </div>


            <div class="student-modal-actions">

                <button
                    type="button"
                    class="secondary-button"
                    onclick="closeStudentViewModal()"
                >
                    Close
                </button>


                <button
                    type="button"
                    class="primary-button"
                    onclick="editStudent('${escapeAttribute(
                        student._id
                    )}')"
                >
                    Edit Student
                </button>

            </div>

        </div>
    `;


    document.body.appendChild(modal);
}


function closeStudentViewModal() {

    document
        .getElementById(
            "studentViewModal"
        )
        ?.remove();
}


/* ======================================================
   EDIT
====================================================== */

async function editStudent(id) {

    closeStudentViewModal();


    try {

        const data =
            await studentApiRequest(
                `/${id}`
            );


        if (!data?.student) {
            return;
        }


        openStudentModal(
            data.student
        );

    } catch (error) {

        showStudentToast(
            error.message ||
            "Unable to load student.",
            "error"
        );
    }
}


/* ======================================================
   APPROVE
====================================================== */

async function approveStudent(id) {

    if (
        !window.confirm(
            "Approve this student?"
        )
    ) {
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


/* ======================================================
   REJECT
====================================================== */

async function rejectStudent(id) {

    if (
        !window.confirm(
            "Reject this student registration?"
        )
    ) {
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
            "Student registration rejected.",
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


/* ======================================================
   SUSPEND
====================================================== */

async function suspendStudent(id) {

    const reason =
        window.prompt(
            "Enter suspension reason:"
        );


    if (reason === null) {
        return;
    }


    try {

        await studentApiRequest(
            `/${id}/suspend`,
            {
                method: "PATCH",
                body: JSON.stringify({
                    reason
                })
            }
        );


        showStudentToast(
            "Student suspended successfully.",
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


/* ======================================================
   REINSTATE
====================================================== */

async function reinstateStudent(id) {

    if (
        !window.confirm(
            "Reinstate this student?"
        )
    ) {
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
            "Student reinstated successfully.",
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


/* ======================================================
   GRADUATE
====================================================== */

async function graduateStudent(id) {

    if (
        !window.confirm(
            "Mark this student as graduated?"
        )
    ) {
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
            "Student graduated successfully.",
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


/* ======================================================
   ARCHIVE
====================================================== */

async function archiveStudent(id) {

    if (
        !window.confirm(
            "Archive this student?"
        )
    ) {
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
            "Student archived successfully.",
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


/* ======================================================
   DELETE
====================================================== */

async function deleteStudent(id) {

    if (
        !window.confirm(
            "Delete this student permanently? This cannot be undone."
        )
    ) {
        return;
    }


    try {

        await studentApiRequest(
            `/${id}`,
            {
                method: "DELETE"
            }
        );


        showStudentToast(
            "Student deleted successfully.",
            "success"
        );


        await loadStudents();

    } catch (error) {

        showStudentToast(
            error.message ||
            "Unable to delete student.",
            "error"
        );
    }
}


/* ======================================================
   STATUS
====================================================== */

function getStatusClass(status) {

    return String(status || "")
        .toLowerCase()
        .replace(/\s+/g, "-");
}


/* ======================================================
   INITIALS
====================================================== */

function getInitials(name) {

    const parts =
        String(name || "")
            .trim()
            .split(/\s+/)
            .filter(Boolean);


    if (!parts.length) {
        return "ST";
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


/* ======================================================
   DATE
====================================================== */

function formatDateInput(date) {

    if (!date) {
        return "";
    }


    const parsed =
        new Date(date);


    if (
        Number.isNaN(
            parsed.getTime()
        )
    ) {
        return "";
    }


    return parsed
        .toISOString()
        .split("T")[0];
}


function formatDisplayDate(date) {

    if (!date) {
        return "—";
    }


    const parsed =
        new Date(date);


    if (
        Number.isNaN(
            parsed.getTime()
        )
    ) {
        return "—";
    }


    return parsed.toLocaleDateString(
        "en-GB",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


/* ======================================================
   HTML SAFETY
====================================================== */

function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function escapeAttribute(value) {

    return escapeHtml(value);
}


/* ======================================================
   TOAST
====================================================== */

function showStudentToast(
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
        showStudentToast.timer
    );


    showStudentToast.timer =
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
   PUBLIC FUNCTIONS
====================================================== */

window.loadStudents =
    loadStudents;

window.viewStudent =
    viewStudent;

window.editStudent =
    editStudent;

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

window.deleteStudent =
    deleteStudent;

window.openStudentModal =
    openStudentModal;

window.closeStudentModal =
    closeStudentModal;

window.closeStudentViewModal =
    closeStudentViewModal;
