
"use strict";

/*
=========================================================
 EDU TRUST - STUDENT MANAGEMENT FRONTEND
 File: student.js
=========================================================

 Connects dashboard.html to:

 GET    /api/students
 GET    /api/students/:id
 POST   /api/students/register
 PUT    /api/students/:id
 PATCH  /api/students/:id/approve
 PATCH  /api/students/:id/reject
 PATCH  /api/students/:id/suspend
 PATCH  /api/students/:id/reinstate
 PATCH  /api/students/:id/graduate
 PATCH  /api/students/:id/archive
 DELETE /api/students/:id
 GET    /api/students/:id/parent
 PATCH  /api/students/:id/parent
 DELETE /api/students/:id/parent
=========================================================
*/

// student.js (Line 24)
const STUDENT_API = "https://edutrust-15ii.onrender.com/api/students";

let allStudents = [];
let filteredStudents = [];
let editingStudentId = null;

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

// student.js
function authHeaders(json = false) {
    const headers = {};
    const token = getAuthToken();

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    if (json) {
        headers["Content-Type"] = "application/json";
    }

    return headers;
}
/* ======================================================
   API HELPER
====================================================== */

// student.js
async function studentApiRequest(endpoint, options = {}) {
    const response = await fetch(`${STUDENT_API}${endpoint}`, {
        ...options,
        headers: {
            ...authHeaders(options.body !== undefined),
            ...(options.headers || {})
        }
    });
    let data = null;

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
    () => {
        initializeStudentManagement();
    }
);

/* ======================================================
   INITIALIZE
====================================================== */

function initializeStudentManagement() {
    bindStudentEvents();

    /*
     * Load immediately if the Students page already exists.
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

    /* Register student button */
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

    /* Overview Add Student button */
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

    /* Search */
    const searchInput =
        document.getElementById(
            "studentSearchInput"
        );

    if (searchInput) {
        searchInput.addEventListener(
            "input",
            () => {
                applyStudentFilters();
            }
        );
    }

    /* Status filter */
    const statusFilter =
        document.getElementById(
            "studentStatusFilter"
        );

    if (statusFilter) {
        statusFilter.addEventListener(
            "change",
            () => {
                applyStudentFilters();
            }
        );
    }

    /*
     * Listen for dashboard navigation.
     * dashboard.js should already handle page switching.
     */
    document.querySelectorAll(
        "[data-page='students']"
    ).forEach(button => {
        button.addEventListener(
            "click",
            () => {
                setTimeout(
                    () => {
                        loadStudents();
                    },
                    50
                );
            }
        );
    });

    /*
     * Global navigation buttons that may
     * lead back to students.
     */
    document.querySelectorAll(
        "[data-page]"
    ).forEach(button => {
        button.addEventListener(
            "click",
            () => {
                if (
                    button.dataset.page ===
                    "students"
                ) {
                    setTimeout(
                        loadStudents,
                        100
                    );
                }
            }
        );
    });
}

/* ======================================================
   LOAD STUDENTS
====================================================== */

async function loadStudents() {

    const table =
        document.getElementById(
            "studentsTable"
        );

    if (!table) return;

    table.innerHTML = `
        <tr>
            <td colspan="6">
                Loading students...
            </td>
        </tr>
    `;

    try {

        const data =
            await studentApiRequest(
                ""
            );

        if (!data) return;

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
                    Unable to load students.
                </td>
            </tr>
        `;

        showStudentToast(
            error.message ||
            "Unable to load students.",
            "error"
        );
    }
}

/* ======================================================
   FILTER STUDENTS
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

                const matchesSearch =
                    !search ||
                    String(
                        student.admission_number ||
                        ""
                    )
                        .toLowerCase()
                        .includes(search) ||

                    String(
                        student.matric_number ||
                        ""
                    )
                        .toLowerCase()
                        .includes(search) ||

                    fullName.includes(
                        search
                    ) ||

                    String(
                        student.class_name ||
                        ""
                    )
                        .toLowerCase()
                        .includes(search);

                const matchesStatus =
                    status === "all" ||
                    student.status === status;

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
   RENDER STUDENTS
====================================================== */

function renderStudents() {

    const table =
        document.getElementById(
            "studentsTable"
        );

    if (!table) return;

    if (
        !filteredStudents.length
    ) {
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
            .map(
                student =>
                    createStudentRow(
                        student
                    )
            )
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

    const admissionNumber =
        escapeHtml(
            student.admission_number ||
            "—"
        );

    const gender =
        escapeHtml(
            student.gender ||
            "Not Specified"
        );

    const className =
        escapeHtml(
            student.class_name ||
            "—"
        );

    const status =
        student.status ||
        "Pending";

    return `
        <tr data-student-id="${id}">

            <td>
                <strong>
                    ${admissionNumber}
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
                        ${getInitials(
                            fullName
                        )}
                    </div>

                    <div>
                        <strong>
                            ${escapeHtml(
                                fullName
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
                ${gender}
            </td>

            <td>
                ${className}

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
                <span class="student-status ${getStatusClass(
                    status
                )}">
                    ${escapeHtml(status)}
                </span>
            </td>

            <td>
                <div class="student-actions">

                    <button
                        type="button"
                        class="student-action-button view"
                        onclick="viewStudent('${id}')"
                        title="View student"
                    >
                        👁️
                    </button>

                    <button
                        type="button"
                        class="student-action-button edit"
                        onclick="editStudent('${id}')"
                        title="Edit student"
                    >
                        ✏️
                    </button>

                    ${getLifecycleActions(
                        student
                    )}

                    <button
                        type="button"
                        class="student-action-button delete"
                        onclick="deleteStudent('${id}')"
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
                    onclick="approveStudent('${id}')"
                    title="Approve student"
                >
                    ✓
                </button>

                <button
                    type="button"
                    class="student-action-button reject"
                    onclick="rejectStudent('${id}')"
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
                    onclick="suspendStudent('${id}')"
                    title="Suspend student"
                >
                    ⏸
                </button>

                <button
                    type="button"
                    class="student-action-button graduate"
                    onclick="graduateStudent('${id}')"
                    title="Graduate student"
                >
                    🎓
                </button>

                <button
                    type="button"
                    class="student-action-button archive"
                    onclick="archiveStudent('${id}')"
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
                    onclick="reinstateStudent('${id}')"
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
                    onclick="archiveStudent('${id}')"
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
                    onclick="approveStudent('${id}')"
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

    if (!element) return;

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
   OPEN STUDENT MODAL
====================================================== */

function openStudentModal(
    student = null
) {

    editingStudentId =
        student?._id ||
        student?.id ||
        null;

    const existing =
        document.getElementById(
            "studentModal"
        );

    if (existing) {
        existing.remove();
    }

    const modal =
        document.createElement(
            "div"
        );

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
                                    student?.first_name ||
                                    ""
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
                                    student?.last_name ||
                                    ""
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
                                    student?.other_name ||
                                    ""
                                )}"
                            >
                        </div>

                        <div class="form-group">
                            <label>
                                Gender
                            </label>

                            <select
                                name="gender"
                            >

                                <option value="Not Specified"
                                    ${
                                        student?.gender ===
                                        "Not Specified"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    Not Specified
                                </option>

                                <option value="Male"
                                    ${
                                        student?.gender ===
                                        "Male"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    Male
                                </option>

                                <option value="Female"
                                    ${
                                        student?.gender ===
                                        "Female"
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
                                    student?.phone ||
                                    ""
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
                                    student?.email ||
                                    ""
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
                                    student?.class_name ||
                                    ""
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
                                    student?.arm ||
                                    ""
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
                                    student?.department ||
                                    ""
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
                                    student?.academic_session ||
                                    ""
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
                                student?.home_address ||
                                ""
                            )}</textarea>
                        </div>

                        <div class="form-group full-width">
                            <label>
                                Medical Information
                            </label>

                            <textarea
                                name="medical_information"
                                rows="3"
                            >${escapeHtml(
                                student?.medical_information ||
                                ""
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
                                    student?.passport ||
                                    ""
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

    document.body.appendChild(
        modal
    );

    document
        .getElementById(
            "studentModalClose"
        )
        ?.addEventListener(
            "click",
            closeStudentModal
        );

    document
        .getElementById(
            "studentCancelButton"
        )
        ?.addEventListener(
            "click",
            closeStudentModal
        );

    document
        .getElementById(
            "studentForm"
        )
        ?.addEventListener(
            "submit",
            handleStudentFormSubmit
        );

    modal.addEventListener(
        "click",
        event => {
            if (
                event.target === modal
            ) {
                closeStudentModal();
            }
        }
    );
}

/* ======================================================
   CLOSE MODAL
====================================================== */

function closeStudentModal() {

    const modal =
        document.getElementById(
            "studentModal"
        );

    if (modal) {
        modal.remove();
    }

    editingStudentId = null;
}

/* ======================================================
   FORM SUBMIT
====================================================== */

async function handleStudentFormSubmit(
    event
) {

    event.preventDefault();

    const form =
        event.currentTarget;

    const formData =
        new FormData(form);

    const payload = {};

    formData.forEach(
        (value, key) => {

            if (
                value !== ""
            ) {
                payload[key] =
                    value;
            }
        }
    );

    try {

        const button =
            form.querySelector(
                "button[type='submit']"
            );

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
                    body: JSON.stringify(
                        payload
                    )
                }
            );

            showStudentToast(
                "Student updated successfully.",
                "success"
            );

        } else {

            await studentApiRequest(
                "/register",
                {
                    method: "POST",
                    body: JSON.stringify(
                        payload
                    )
                }
            );

            showStudentToast(
                "Student registered successfully.",
                "success"
            );
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

        const button =
            form.querySelector(
                "button[type='submit']"
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
   VIEW STUDENT
====================================================== */

async function viewStudent(id) {

    try {

        const data =
            await studentApiRequest(
                `/${id}`
            );

        if (!data?.student) return;

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

function openStudentViewModal(
    student
) {

    const existing =
        document.getElementById(
            "studentViewModal"
        );

    if (existing) {
        existing.remove();
    }

    const fullName = [
        student.first_name,
        student.other_name,
        student.last_name
    ]
        .filter(Boolean)
        .join(" ");

    const modal =
        document.createElement(
            "div"
        );

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
                        ${escapeHtml(
                            fullName
                        )}
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
                    ${getInitials(
                        fullName
                    )}
                </div>

                <h2>
                    ${escapeHtml(
                        fullName
                    )}
                </h2>

                <span class="student-status ${getStatusClass(
                    student.status
                )}">
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
                    onclick="editStudent('${student._id}')"
                >
                    Edit Student
                </button>

            </div>

        </div>
    `;

    document.body.appendChild(
        modal
    );
}

function closeStudentViewModal() {

    document
        .getElementById(
            "studentViewModal"
        )
        ?.remove();
}

/* ======================================================
   EDIT STUDENT
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

    const confirmed =
        window.confirm(
            "Approve this student?"
        );

    if (!confirmed) return;

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

    const confirmed =
        window.confirm(
            "Reject this student registration?"
        );

    if (!confirmed) return;

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

    if (
        reason === null
    ) {
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

    const confirmed =
        window.confirm(
            "Reinstate this student?"
        );

    if (!confirmed) return;

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

    const confirmed =
        window.confirm(
            "Mark this student as graduated?"
        );

    if (!confirmed) return;

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

    const confirmed =
        window.confirm(
            "Archive this student?"
        );

    if (!confirmed) return;

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

    const confirmed =
        window.confirm(
            "Delete this student permanently? This cannot be undone."
        );

    if (!confirmed) return;

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
   STATUS CLASS
====================================================== */

function getStatusClass(
    status
) {

    return String(
        status || ""
    )
        .toLowerCase()
        .replace(/\s+/g, "-");
}

/* ======================================================
   INITIALS
====================================================== */

function getInitials(
    name
) {

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
   DATE HELPERS
====================================================== */

function formatDateInput(
    date
) {

    if (!date) return "";

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

function formatDisplayDate(
    date
) {

    if (!date) return "—";

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

function escapeHtml(
    value
) {

    return String(
        value ?? ""
    )
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

function escapeAttribute(
    value
) {
    return escapeHtml(
        value
    );
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
   REFRESH PUBLIC API
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
