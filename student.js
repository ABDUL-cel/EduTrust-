
// student.js
// Complete Students page frontend logic for dashboard.html

"use strict";

const StudentManager = (() => {
    const API_BASE = "/api/students";

    let students = [];
    let filteredStudents = [];

    const elements = {};

    function cacheElements() {
        elements.page = document.getElementById("studentsPage");
        elements.table = document.getElementById("studentsTable");
        elements.search = document.getElementById("studentSearchInput");
        elements.statusFilter = document.getElementById("studentStatusFilter");
        elements.resultCount = document.getElementById("studentResultCount");
        elements.addButton = document.getElementById("studentsAddButton");
    }

    function getToken() {
        return (
            localStorage.getItem("token") ||
            localStorage.getItem("accessToken") ||
            sessionStorage.getItem("token") ||
            sessionStorage.getItem("accessToken")
        );
    }

    function authHeaders() {
        const token = getToken();

        return {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        };
    }

    async function apiRequest(url, options = {}) {
        const response = await fetch(url, {
            ...options,
            headers: {
                ...authHeaders(),
                ...(options.headers || {})
            }
        });

        let data = {};

        try {
            data = await response.json();
        } catch {
            data = {};
        }

        if (!response.ok) {
            throw new Error(
                data.message ||
                data.error ||
                `Request failed with status ${response.status}`
            );
        }

        return data;
    }

    function escapeHtml(value) {
        if (value === null || value === undefined) {
            return "";
        }

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function getFullName(student) {
        if (student.full_name) {
            return student.full_name;
        }

        return [
            student.first_name,
            student.other_name,
            student.last_name
        ]
            .filter(Boolean)
            .join(" ");
    }

    function formatStatus(status) {
        const safeStatus = status || "Pending";

        return `
            <span class="status-badge status-${safeStatus
                .toLowerCase()
                .replace(/\s+/g, "-")}">
                ${escapeHtml(safeStatus)}
            </span>
        `;
    }

    function showToast(message, type = "success") {
        const toast = document.getElementById("toast");

        if (!toast) {
            return;
        }

        toast.textContent = message;
        toast.className = `toast ${type}`;

        requestAnimationFrame(() => {
            toast.classList.add("show");
        });

        setTimeout(() => {
            toast.classList.remove("show");
        }, 3000);
    }

    function renderLoading() {
        if (!elements.table) {
            return;
        }

        elements.table.innerHTML = `
            <tr>
                <td colspan="6">
                    Loading students...
                </td>
            </tr>
        `;
    }

    function renderEmpty(message = "No students found.") {
        if (!elements.table) {
            return;
        }

        elements.table.innerHTML = `
            <tr>
                <td colspan="6">
                    ${escapeHtml(message)}
                </td>
            </tr>
        `;
    }

    function renderStudents() {
        if (!elements.table) {
            return;
        }

        if (!filteredStudents.length) {
            renderEmpty(
                students.length
                    ? "No students match your search or filter."
                    : "No students registered yet."
            );
            updateResultCount();
            return;
        }

        elements.table.innerHTML = filteredStudents
            .map(student => {
                const id = student._id || student.id;

                const admissionNumber =
                    student.admission_number || "—";

                const fullName =
                    getFullName(student) || "Unnamed Student";

                const gender =
                    student.gender || "Not Specified";

                const className =
                    student.class_name || "—";

                const status =
                    student.status || "Pending";

                return `
                    <tr data-student-id="${escapeHtml(id)}">

                        <td>
                            <strong>
                                ${escapeHtml(admissionNumber)}
                            </strong>
                        </td>

                        <td>
                            <div class="student-table-name">

                                <div class="student-mini-avatar">
                                    ${escapeHtml(
                                        getInitials(fullName)
                                    )}
                                </div>

                                <div>
                                    <strong>
                                        ${escapeHtml(fullName)}
                                    </strong>

                                    ${
                                        student.matric_number
                                            ? `
                                                <small>
                                                    ${escapeHtml(
                                                        student.matric_number
                                                    )}
                                                </small>
                                            `
                                            : ""
                                    }
                                </div>

                            </div>
                        </td>

                        <td>
                            ${escapeHtml(gender)}
                        </td>

                        <td>
                            ${escapeHtml(className)}
                            ${
                                student.arm
                                    ? `
                                        <small class="student-arm">
                                            ${escapeHtml(student.arm)}
                                        </small>
                                    `
                                    : ""
                            }
                        </td>

                        <td>
                            ${formatStatus(status)}
                        </td>

                        <td>

                            <div class="student-actions">

                                <button
                                    type="button"
                                    class="student-action-button view-student"
                                    data-id="${escapeHtml(id)}"
                                    title="View student"
                                >
                                    👁️
                                </button>

                                ${
                                    status === "Pending"
                                        ? `
                                            <button
                                                type="button"
                                                class="student-action-button approve-student"
                                                data-id="${escapeHtml(id)}"
                                                title="Approve student"
                                            >
                                                ✓
                                            </button>

                                            <button
                                                type="button"
                                                class="student-action-button reject-student"
                                                data-id="${escapeHtml(id)}"
                                                title="Reject student"
                                            >
                                                ✕
                                            </button>
                                        `
                                        : ""
                                }

                                ${
                                    status === "Active"
                                        ? `
                                            <button
                                                type="button"
                                                class="student-action-button suspend-student"
                                                data-id="${escapeHtml(id)}"
                                                title="Suspend student"
                                            >
                                                ⏸
                                            </button>
                                        `
                                        : ""
                                }

                                ${
                                    status === "Suspended"
                                        ? `
                                            <button
                                                type="button"
                                                class="student-action-button reinstate-student"
                                                data-id="${escapeHtml(id)}"
                                                title="Reinstate student"
                                            >
                                                ▶
                                            </button>
                                        `
                                        : ""
                                }

                                <button
                                    type="button"
                                    class="student-action-button edit-student"
                                    data-id="${escapeHtml(id)}"
                                    title="Edit student"
                                >
                                    ✏️
                                </button>

                            </div>

                        </td>

                    </tr>
                `;
            })
            .join("");

        updateResultCount();
    }

    function getInitials(name) {
        const parts = String(name)
            .trim()
            .split(/\s+/)
            .filter(Boolean);

        if (!parts.length) {
            return "ST";
        }

        if (parts.length === 1) {
            return parts[0].substring(0, 2).toUpperCase();
        }

        return (
            parts[0].charAt(0) +
            parts[parts.length - 1].charAt(0)
        ).toUpperCase();
    }

    function updateResultCount() {
        if (!elements.resultCount) {
            return;
        }

        const count = filteredStudents.length;

        elements.resultCount.textContent =
            `${count} ${count === 1 ? "student" : "students"}`;
    }

    function applyFilters() {
        const searchTerm =
            (elements.search?.value || "")
                .trim()
                .toLowerCase();

        const status =
            elements.statusFilter?.value || "all";

        filteredStudents = students.filter(student => {
            const fullName = getFullName(student).toLowerCase();

            const searchableText = [
                student.admission_number,
                student.matric_number,
                student.first_name,
                student.last_name,
                student.other_name,
                student.class_name,
                student.arm,
                student.department,
                student.gender
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            const matchesSearch =
                !searchTerm ||
                fullName.includes(searchTerm) ||
                searchableText.includes(searchTerm);

            const matchesStatus =
                status === "all" ||
                String(student.status || "").toLowerCase() ===
                    status.toLowerCase();

            return matchesSearch && matchesStatus;
        });

        renderStudents();
    }

    async function loadStudents() {
        renderLoading();

        try {
            const data = await apiRequest(API_BASE);

            if (Array.isArray(data)) {
                students = data;
            } else if (Array.isArray(data.students)) {
                students = data.students;
            } else if (Array.isArray(data.data)) {
                students = data.data;
            } else {
                students = [];
            }

            filteredStudents = [...students];

            renderStudents();

        } catch (error) {
            console.error("Load students error:", error);

            if (error.message.toLowerCase().includes("token") ||
                error.message.toLowerCase().includes("authentication")) {
                renderEmpty("Your session has expired. Please log in again.");
            } else {
                renderEmpty(
                    `Unable to load students: ${error.message}`
                );
            }
        }
    }

    async function getStudent(id) {
        return apiRequest(`${API_BASE}/${id}`);
    }

    async function approveStudent(id) {
        if (!confirm("Approve this student?")) {
            return;
        }

        try {
            await apiRequest(`${API_BASE}/${id}/approve`, {
                method: "PATCH"
            });

            showToast("Student approved successfully.");

            await loadStudents();

        } catch (error) {
            console.error("Approve student error:", error);
            showToast(error.message, "error");
        }
    }

    async function rejectStudent(id) {
        const reason = prompt(
            "Enter a reason for rejecting this student (optional):"
        );

        if (reason === null) {
            return;
        }

        try {
            await apiRequest(`${API_BASE}/${id}/reject`, {
                method: "PATCH",
                body: JSON.stringify({
                    reason: reason.trim()
                })
            });

            showToast("Student rejected.");

            await loadStudents();

        } catch (error) {
            console.error("Reject student error:", error);
            showToast(error.message, "error");
        }
    }

    async function suspendStudent(id) {
        const reason = prompt(
            "Enter the reason for suspending this student:"
        );

        if (reason === null) {
            return;
        }

        if (!reason.trim()) {
            showToast(
                "A suspension reason is required.",
                "error"
            );
            return;
        }

        try {
            await apiRequest(`${API_BASE}/${id}/suspend`, {
                method: "PATCH",
                body: JSON.stringify({
                    reason: reason.trim()
                })
            });

            showToast("Student suspended.");

            await loadStudents();

        } catch (error) {
            console.error("Suspend student error:", error);
            showToast(error.message, "error");
        }
    }

    async function reinstateStudent(id) {
        if (!confirm("Reinstate this student?")) {
            return;
        }

        try {
            await apiRequest(`${API_BASE}/${id}/reinstate`, {
                method: "PATCH"
            });

            showToast("Student reinstated.");

            await loadStudents();

        } catch (error) {
            console.error("Reinstate student error:", error);
            showToast(error.message, "error");
        }
    }

    async function graduateStudent(id) {
        if (!confirm(
            "Mark this student as graduated?"
        )) {
            return;
        }

        try {
            await apiRequest(`${API_BASE}/${id}/graduate`, {
                method: "PATCH"
            });

            showToast("Student marked as graduated.");

            await loadStudents();

        } catch (error) {
            console.error("Graduate student error:", error);
            showToast(error.message, "error");
        }
    }

    async function archiveStudent(id) {
        if (!confirm(
            "Archive this student? This will remove them from active student records."
        )) {
            return;
        }

        try {
            await apiRequest(`${API_BASE}/${id}/archive`, {
                method: "PATCH"
            });

            showToast("Student archived.");

            await loadStudents();

        } catch (error) {
            console.error("Archive student error:", error);
            showToast(error.message, "error");
        }
    }

    async function deleteStudent(id) {
        if (!confirm(
            "Delete this student permanently? This action cannot be undone."
        )) {
            return;
        }

        try {
            await apiRequest(`${API_BASE}/${id}`, {
                method: "DELETE"
            });

            showToast("Student deleted successfully.");

            await loadStudents();

        } catch (error) {
            console.error("Delete student error:", error);
            showToast(error.message, "error");
        }
    }

    function createStudentModal() {
        if (document.getElementById("studentModal")) {
            return;
        }

        const modal = document.createElement("div");

        modal.id = "studentModal";
        modal.className = "modal-overlay hidden";

        modal.innerHTML = `
            <div class="modal student-modal">

                <div class="modal-header">

                    <div>
                        <h3 id="studentModalTitle">
                            Register Student
                        </h3>

                        <p>
                            Enter the student's information.
                        </p>
                    </div>

                    <button
                        type="button"
                        class="modal-close"
                        id="studentModalClose"
                    >
                        ×
                    </button>

                </div>

                <form id="studentForm">

                    <input
                        type="hidden"
                        id="studentEditId"
                    >

                    <div class="form-grid">

                        <div class="form-group">
                            <label>
                                First Name
                            </label>

                            <input
                                type="text"
                                id="studentFirstName"
                                required
                            >
                        </div>

                        <div class="form-group">
                            <label>
                                Last Name
                            </label>

                            <input
                                type="text"
                                id="studentLastName"
                                required
                            >
                        </div>

                        <div class="form-group">
                            <label>
                                Other Name
                            </label>

                            <input
                                type="text"
                                id="studentOtherName"
                            >
                        </div>

                        <div class="form-group">
                            <label>
                                Email
                            </label>

                            <input
                                type="email"
                                id="studentEmail"
                            >
                        </div>

                        <div class="form-group">
                            <label>
                                Phone
                            </label>

                            <input
                                type="text"
                                id="studentPhone"
                            >
                        </div>

                        <div class="form-group">
                            <label>
                                Gender
                            </label>

                            <select id="studentGender">
                                <option value="Not Specified">
                                    Not Specified
                                </option>

                                <option value="Male">
                                    Male
                                </option>

                                <option value="Female">
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
                                id="studentDateOfBirth"
                            >
                        </div>

                        <div class="form-group">
                            <label>
                                Class
                            </label>

                            <input
                                type="text"
                                id="studentClassName"
                                required
                            >
                        </div>

                        <div class="form-group">
                            <label>
                                Arm
                            </label>

                            <input
                                type="text"
                                id="studentArm"
                            >
                        </div>

                        <div class="form-group">
                            <label>
                                Department
                            </label>

                            <input
                                type="text"
                                id="studentDepartment"
                            >
                        </div>

                        <div class="form-group">
                            <label>
                                Academic Session
                            </label>

                            <input
                                type="text"
                                id="studentAcademicSession"
                            >
                        </div>

                        <div class="form-group">
                            <label>
                                Admission Date
                            </label>

                            <input
                                type="date"
                                id="studentAdmissionDate"
                            >
                        </div>

                        <div class="form-group full-width">
                            <label>
                                Home Address
                            </label>

                            <textarea
                                id="studentHomeAddress"
                                rows="3"
                            ></textarea>
                        </div>

                        <div class="form-group full-width">
                            <label>
                                Medical Information
                            </label>

                            <textarea
                                id="studentMedicalInformation"
                                rows="3"
                            ></textarea>
                        </div>

                    </div>

                    <div class="form-actions">

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
                            id="studentSaveButton"
                        >
                            Register Student
                        </button>

                    </div>

                </form>

            </div>
        `;

        document.body.appendChild(modal);

        document
            .getElementById("studentModalClose")
            .addEventListener("click", closeStudentModal);

        document
            .getElementById("studentCancelButton")
            .addEventListener("click", closeStudentModal);

        document
            .getElementById("studentForm")
            .addEventListener("submit", saveStudent);

        modal.addEventListener("click", event => {
            if (event.target === modal) {
                closeStudentModal();
            }
        });
    }

    function openStudentModal(student = null) {
        createStudentModal();

        const modal = document.getElementById("studentModal");
        const form = document.getElementById("studentForm");

        form.reset();

        document.getElementById("studentEditId").value =
            student?._id || "";

        document.getElementById("studentFirstName").value =
            student?.first_name || "";

        document.getElementById("studentLastName").value =
            student?.last_name || "";

        document.getElementById("studentOtherName").value =
            student?.other_name || "";

        document.getElementById("studentEmail").value =
            student?.email || "";

        document.getElementById("studentPhone").value =
            student?.phone || "";

        document.getElementById("studentGender").value =
            student?.gender || "Not Specified";

        document.getElementById("studentClassName").value =
            student?.class_name || "";

        document.getElementById("studentArm").value =
            student?.arm || "";

        document.getElementById("studentDepartment").value =
            student?.department || "";

        document.getElementById("studentAcademicSession").value =
            student?.academic_session || "";

        document.getElementById("studentHomeAddress").value =
            student?.home_address || "";

        document.getElementById("studentMedicalInformation").value =
            student?.medical_information || "";

        if (student?.date_of_birth) {
            document.getElementById("studentDateOfBirth").value =
                formatDateForInput(student.date_of_birth);
        }

        if (student?.admission_date) {
            document.getElementById("studentAdmissionDate").value =
                formatDateForInput(student.admission_date);
        }

        const editing = Boolean(student);

        document.getElementById("studentModalTitle").textContent =
            editing ? "Edit Student" : "Register Student";

        document.getElementById("studentSaveButton").textContent =
            editing ? "Save Changes" : "Register Student";

        modal.classList.remove("hidden");
        document.body.classList.add("modal-open");
    }

    function closeStudentModal() {
        const modal = document.getElementById("studentModal");

        if (!modal) {
            return;
        }

        modal.classList.add("hidden");
        document.body.classList.remove("modal-open");
    }

    function formatDateForInput(value) {
        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "";
        }

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    function collectStudentForm() {
        return {
            first_name:
                document.getElementById("studentFirstName").value.trim(),

            last_name:
                document.getElementById("studentLastName").value.trim(),

            other_name:
                document.getElementById("studentOtherName").value.trim(),

            email:
                document.getElementById("studentEmail").value.trim(),

            phone:
                document.getElementById("studentPhone").value.trim(),

            gender:
                document.getElementById("studentGender").value,

            date_of_birth:
                document.getElementById("studentDateOfBirth").value || null,

            class_name:
                document.getElementById("studentClassName").value.trim(),

            arm:
                document.getElementById("studentArm").value.trim(),

            department:
                document.getElementById("studentDepartment").value.trim(),

            academic_session:
                document
                    .getElementById("studentAcademicSession")
                    .value
                    .trim(),

            admission_date:
                document.getElementById("studentAdmissionDate").value ||
                undefined,

            home_address:
                document.getElementById("studentHomeAddress").value.trim(),

            medical_information:
                document
                    .getElementById("studentMedicalInformation")
                    .value
                    .trim()
        };
    }

    async function saveStudent(event) {
        event.preventDefault();

        const id =
            document.getElementById("studentEditId").value;

        const payload = collectStudentForm();

        const saveButton =
            document.getElementById("studentSaveButton");

        saveButton.disabled = true;

        try {
            if (id) {
                await apiRequest(`${API_BASE}/${id}`, {
                    method: "PUT",
                    body: JSON.stringify(payload)
                });

                showToast("Student updated successfully.");
            } else {
                await apiRequest(`${API_BASE}/register`, {
                    method: "POST",
                    body: JSON.stringify(payload)
                });

                showToast(
                    "Student registered successfully. Awaiting approval."
                );
            }

            closeStudentModal();

            await loadStudents();

        } catch (error) {
            console.error("Save student error:", error);
            showToast(error.message, "error");
        } finally {
            saveButton.disabled = false;
        }
    }

    async function viewStudent(id) {
        try {
            const data = await getStudent(id);

            const student =
                data.student ||
                data.data ||
                data;

            openStudentDetails(student);

        } catch (error) {
            console.error("View student error:", error);
            showToast(error.message, "error");
        }
    }

    function openStudentDetails(student) {
        const existing =
            document.getElementById("studentDetailsModal");

        if (existing) {
            existing.remove();
        }

        const modal = document.createElement("div");

        modal.id = "studentDetailsModal";
        modal.className = "modal-overlay";

        const fullName = getFullName(student);

        modal.innerHTML = `
            <div class="modal student-details-modal">

                <div class="modal-header">

                    <div>
                        <h3>
                            ${escapeHtml(fullName)}
                        </h3>

                        <p>
                            Student Profile
                        </p>
                    </div>

                    <button
                        type="button"
                        class="modal-close"
                        id="studentDetailsClose"
                    >
                        ×
                    </button>

                </div>

                <div class="student-details">

                    <div class="student-details-header">

                        <div class="student-large-avatar">
                            ${escapeHtml(
                                getInitials(fullName)
                            )}
                        </div>

                        <div>

                            <h3>
                                ${escapeHtml(fullName)}
                            </h3>

                            <p>
                                Admission:
                                ${escapeHtml(
                                    student.admission_number || "—"
                                )}
                            </p>

                            ${
                                student.matric_number
                                    ? `
                                        <p>
                                            Matric:
                                            ${escapeHtml(
                                                student.matric_number
                                            )}
                                        </p>
                                    `
                                    : ""
                            }

                            <div>
                                ${formatStatus(student.status)}
                            </div>

                        </div>

                    </div>

                    <div class="student-detail-grid">

                        ${detailItem(
                            "Gender",
                            student.gender || "Not Specified"
                        )}

                        ${detailItem(
                            "Class",
                            student.class_name || "—"
                        )}

                        ${detailItem(
                            "Arm",
                            student.arm || "—"
                        )}

                        ${detailItem(
                            "Department",
                            student.department || "—"
                        )}

                        ${detailItem(
                            "Email",
                            student.email || "—"
                        )}

                        ${detailItem(
                            "Phone",
                            student.phone || "—"
                        )}

                        ${detailItem(
                            "Academic Session",
                            student.academic_session || "—"
                        )}

                        ${detailItem(
                            "Admission Date",
                            formatDisplayDate(student.admission_date)
                        )}

                        ${detailItem(
                            "Date of Birth",
                            formatDisplayDate(student.date_of_birth)
                        )}

                        ${detailItem(
                            "Parent ID",
                            student.parent_id || "Not linked"
                        )}

                    </div>

                    ${
                        student.home_address
                            ? `
                                <div class="student-detail-section">
                                    <strong>Home Address</strong>
                                    <p>
                                        ${escapeHtml(
                                            student.home_address
                                        )}
                                    </p>
                                </div>
                            `
                            : ""
                    }

                    ${
                        student.medical_information
                            ? `
                                <div class="student-detail-section">
                                    <strong>
                                        Medical Information
                                    </strong>

                                    <p>
                                        ${escapeHtml(
                                            student.medical_information
                                        )}
                                    </p>
                                </div>
                            `
                            : ""
                    }

                    ${
                        student.suspension_reason
                            ? `
                                <div class="student-detail-section">
                                    <strong>
                                        Suspension Reason
                                    </strong>

                                    <p>
                                        ${escapeHtml(
                                            student.suspension_reason
                                        )}
                                    </p>
                                </div>
                            `
                            : ""
                    }

                </div>

                <div class="form-actions">

                    <button
                        type="button"
                        class="secondary-button"
                        id="studentDetailsEdit"
                    >
                        Edit Student
                    </button>

                    <button
                        type="button"
                        class="primary-button"
                        id="studentDetailsDone"
                    >
                        Close
                    </button>

                </div>

            </div>
        `;

        document.body.appendChild(modal);
        document.body.classList.add("modal-open");

        document
            .getElementById("studentDetailsClose")
            .addEventListener("click", closeStudentDetails);

        document
            .getElementById("studentDetailsDone")
            .addEventListener("click", closeStudentDetails);

        document
            .getElementById("studentDetailsEdit")
            .addEventListener("click", () => {
                closeStudentDetails();
                openStudentModal(student);
            });

        modal.addEventListener("click", event => {
            if (event.target === modal) {
                closeStudentDetails();
            }
        });
    }

    function detailItem(label, value) {
        return `
            <div class="student-detail-item">

                <span>
                    ${escapeHtml(label)}
                </span>

                <strong>
                    ${escapeHtml(value)}
                </strong>

            </div>
        `;
    }

    function closeStudentDetails() {
        const modal =
            document.getElementById("studentDetailsModal");

        if (modal) {
            modal.remove();
        }

        document.body.classList.remove("modal-open");
    }

    function formatDisplayDate(value) {
        if (!value) {
            return "—";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "—";
        }

        return date.toLocaleDateString("en-NG", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    }

    function handleTableActions(event) {
        const button =
            event.target.closest("button[data-id]");

        if (!button) {
            return;
        }

        const id = button.dataset.id;

        if (!id) {
            return;
        }

        if (button.classList.contains("view-student")) {
            viewStudent(id);
            return;
        }

        if (button.classList.contains("approve-student")) {
            approveStudent(id);
            return;
        }

        if (button.classList.contains("reject-student")) {
            rejectStudent(id);
            return;
        }

        if (button.classList.contains("suspend-student")) {
            suspendStudent(id);
            return;
        }

        if (button.classList.contains("reinstate-student")) {
            reinstateStudent(id);
            return;
        }

        if (button.classList.contains("edit-student")) {
            editStudent(id);
        }
    }

    async function editStudent(id) {
        try {
            const data = await getStudent(id);

            const student =
                data.student ||
                data.data ||
                data;

            openStudentModal(student);

        } catch (error) {
            console.error("Edit student error:", error);
            showToast(error.message, "error");
        }
    }

    function bindEvents() {
        elements.search?.addEventListener(
            "input",
            applyFilters
        );

        elements.statusFilter?.addEventListener(
            "change",
            applyFilters
        );

        elements.table?.addEventListener(
            "click",
            handleTableActions
        );

        elements.addButton?.addEventListener(
            "click",
            () => openStudentModal()
        );
    }

    function init() {
        cacheElements();
        bindEvents();
        createStudentModal();
    }

    return {
        init,
        loadStudents,
        getStudent,
        approveStudent,
        rejectStudent,
        suspendStudent,
        reinstateStudent,
        graduateStudent,
        archiveStudent,
        deleteStudent,
        openStudentModal,
        editStudent
    };
})();

document.addEventListener("DOMContentLoaded", () => {
    StudentManager.init();
});
