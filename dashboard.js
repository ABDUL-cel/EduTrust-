/* =========================================================
   EDUTRUST PRINCIPAL DASHBOARD
   COMPLETE DASHBOARD.JS
   ========================================================= */

/* =========================================================
   AUTH & SESSION INITIALIZATION
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    const storedUser = localStorage.getItem("user");

    if (storedUser) {
        try {
            const user = JSON.parse(storedUser);
            updateProfileUI(user);
        } catch (err) {
            console.error("Error parsing cached user details:", err);
        }
    }

    fetch("/api/auth/profile", {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
        .then((response) => {
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                window.location.href = "login.html";
                return null;
            }

            return response.json();
        })
        .then((data) => {
            if (data && data.success && data.user) {
                localStorage.setItem("user", JSON.stringify(data.user));
                updateProfileUI(data.user);
            }
        })
        .catch((err) => {
            console.error("Error fetching user profile:", err);
        });

    showOverview();
});


/* =========================================================
   GLOBAL HELPERS
   ========================================================= */

function getCurrentUser() {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
        try {
            return JSON.parse(storedUser);
        } catch (err) {
            console.error("Error reading current user:", err);
        }
    }

    return {};
}


function getToken() {
    return localStorage.getItem("token");
}


function updateProfileUI(user) {
    if (!user) return;

    const userRoleElement = document.querySelector(".school-profile p");

    if (userRoleElement) {
        userRoleElement.textContent = user.role || "Principal";
    }

    const userNameElement = document.querySelector(".school-profile h4");

    if (userNameElement) {
        userNameElement.textContent =
            user.school_name ||
            user.full_name ||
            "School Dashboard";
    }
}


/* =========================================================
   AUTHENTICATED API HELPER
   ========================================================= */

async function apiRequest(url, options = {}) {
    const token = getToken();

    const config = {
        method: options.method || "GET",
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        }
    };

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    if (options.body !== undefined) {
        config.body =
            typeof options.body === "string"
                ? options.body
                : JSON.stringify(options.body);
    }

    try {
        const response = await fetch(url, config);

        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "login.html";
            return null;
        }

        const contentType = response.headers.get("content-type") || "";

        let data;

        if (contentType.includes("application/json")) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        if (!response.ok) {
            const message =
                data?.message ||
                data?.error ||
                "Request failed.";

            throw new Error(message);
        }

        return data;
    } catch (error) {
        console.error(`API Error: ${url}`, error);
        throw error;
    }
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


function formatCurrency(amount) {
    const number = Number(amount || 0);

    return `₦${number.toLocaleString("en-NG")}`;
}


function showLoading(message = "Loading...") {
    contentArea.innerHTML = `
        <div class="page-content">
            <div class="dashboard-card">
                <p style="text-align:center; padding:2rem;">
                    ⏳ ${escapeHtml(message)}
                </p>
            </div>
        </div>
    `;
}


function showError(message) {
    contentArea.innerHTML = `
        <div class="page-content">
            <div class="dashboard-card">
                <div style="text-align:center; padding:2rem;">
                    <div style="font-size:2rem;">⚠️</div>
                    <h3>Something went wrong</h3>
                    <p>${escapeHtml(message)}</p>
                    <button
                        class="primary-button"
                        onclick="showOverview()"
                        style="margin-top:1rem;"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        </div>
    `;
}


/* =========================================================
   DOM ELEMENTS & NAVIGATION
   ========================================================= */

const navItems = document.querySelectorAll(
    ".nav-item[data-page], .submenu-item[data-page]"
);

const contentArea = document.getElementById("contentArea");
const sidebar = document.querySelector(".sidebar");
const menuToggle = document.getElementById("menu-toggle");
const notificationButton = document.getElementById("notification-button");
const notificationDropdown =
    document.getElementById("notification-dropdown");


navItems.forEach((item) => {
    item.addEventListener("click", function () {
        const page = item.getAttribute("data-page");

        navItems.forEach((nav) => nav.classList.remove("active"));

        item.classList.add("active");

        switch (page) {

            case "overview":
                showOverview();
                break;

            case "school":
                showSchoolManagement();
                break;

            case "classes":
                showClasses();
                break;

            case "sessions":
                showAcademicSessions();
                break;

            case "fees":
            case "fee-structures":
                showSchoolFees();
                break;

            case "payments":
                showParentPayments();
                break;

            case "outstanding":
                showOutstandingFees();
                break;

            case "students":
                showStudents();
                break;

            case "parents":
                showParents();
                break;

            case "staff":
                showStaff();
                break;

            case "announcements":
                showAnnouncements();
                break;

            case "messages":
                showMessages();
                break;

            case "notifications":
                showNotifications();
                break;

            /* =================================================
               ASSESSMENT
               ================================================= */

            case "assessment":
            case "assessments":
            case "assessment-structure":
                showAssessmentStructure();
                break;

            /* =================================================
               RESULTS
               ================================================= */

            case "results":
            case "student-results":
                showResults();
                break;

            case "school-profile":
                showSchoolProfile();
                break;

            case "user-roles":
                showUserRoles();
                break;

            case "payment-settings":
                showPaymentSettings();
                break;

            case "security":
                showSecurity();
                break;

            case "email-settings":
                showEmailSettings();
                break;

            case "backup":
                showBackup();
                break;

            default:
                showComingSoon(item.textContent.trim());
                break;
        }

        if (window.innerWidth <= 768 && sidebar) {
            sidebar.classList.remove("show");
        }
    });
});


/* =========================================================
   ASSESSMENT STRUCTURE
   ========================================================= */

async function showAssessmentStructure() {

    showLoading("Loading assessment structure...");

    try {
        const data = await apiRequest("/api/assessments");

        const assessments =
            data?.assessments ||
            data?.data ||
            [];

        contentArea.innerHTML = `
            <div class="page-content">

                <div class="page-introduction">
                    <div>
                        <h2>Assessment Structure</h2>
                        <p>
                            Create and manage examinations, tests,
                            assignments and other assessments.
                        </p>
                    </div>

                    <button
                        class="primary-button"
                        id="create-assessment-btn"
                    >
                        + Create Assessment
                    </button>
                </div>

                <div class="stats-grid">

                    <div class="stat-card">
                        <p>Total Assessments</p>
                        <h3>${assessments.length}</h3>
                        <small>Created in the system</small>
                    </div>

                    <div class="stat-card">
                        <p>Published</p>
                        <h3>
                            ${
                                assessments.filter(
                                    item =>
                                        item.status === "published"
                                ).length
                            }
                        </h3>
                        <small>Available for use</small>
                    </div>

                    <div class="stat-card">
                        <p>Drafts</p>
                        <h3>
                            ${
                                assessments.filter(
                                    item =>
                                        item.status === "draft"
                                ).length
                            }
                        </h3>
                        <small>Still being prepared</small>
                    </div>

                </div>

                <div class="dashboard-card">

                    <div class="card-header">
                        <div>
                            <h3>Assessment List</h3>
                            <p>
                                Manage your school's assessment records.
                            </p>
                        </div>
                    </div>

                    <div class="table-responsive">

                        <table class="fee-table">

                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Type</th>
                                    <th>Class</th>
                                    <th>Term</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>

                                ${
                                    assessments.length
                                        ? assessments
                                              .map(
                                                  assessment => `
                                    <tr>

                                        <td>
                                            ${escapeHtml(
                                                assessment.title ||
                                                assessment.name ||
                                                "Untitled"
                                            )}
                                        </td>

                                        <td>
                                            ${escapeHtml(
                                                assessment.type ||
                                                "Assessment"
                                            )}
                                        </td>

                                        <td>
                                            ${escapeHtml(
                                                assessment.class_name ||
                                                assessment.className ||
                                                "N/A"
                                            )}
                                        </td>

                                        <td>
                                            ${escapeHtml(
                                                assessment.term ||
                                                "N/A"
                                            )}
                                        </td>

                                        <td>
                                            <span class="status ${
                                                assessment.status ===
                                                "published"
                                                    ? "paid"
                                                    : "pending"
                                            }">
                                                ${escapeHtml(
                                                    assessment.status ||
                                                    "draft"
                                                )}
                                            </span>
                                        </td>

                                        <td>

                                            <button
                                                class="primary-button"
                                                style="padding:6px 10px;"
                                                onclick="viewAssessment('${escapeHtml(
                                                    assessment._id ||
                                                    assessment.id ||
                                                    ""
                                                )}')"
                                            >
                                                View
                                            </button>

                                        </td>

                                    </tr>
                                `
                                              )
                                              .join("")
                                        : `
                                    <tr>
                                        <td
                                            colspan="6"
                                            style="text-align:center; padding:2rem;"
                                        >
                                            No assessments found.
                                        </td>
                                    </tr>
                                `
                                }

                            </tbody>

                        </table>

                    </div>

                </div>

            </div>
        `;

        document
            .getElementById("create-assessment-btn")
            ?.addEventListener(
                "click",
                showCreateAssessment
            );

    } catch (error) {
        showError(
            error.message ||
            "Unable to load assessment structure."
        );
    }
}


/* =========================================================
   CREATE ASSESSMENT
   ========================================================= */

function showCreateAssessment() {

    contentArea.innerHTML = `
        <div class="page-content">

            <div class="page-introduction">
                <div>
                    <h2>Create Assessment</h2>
                    <p>
                        Set up a new assessment for your students.
                    </p>
                </div>

                <button
                    class="secondary-button"
                    id="back-assessment-btn"
                >
                    ← Back
                </button>
            </div>

            <div class="dashboard-card">

                <form id="assessment-form">

                    <div class="form-row">

                        <div class="form-group">
                            <label>Assessment Title</label>

                            <input
                                type="text"
                                id="assessment-title"
                                placeholder="First Term Mathematics Test"
                                required
                            >
                        </div>

                        <div class="form-group">
                            <label>Assessment Type</label>

                            <select
                                id="assessment-type"
                                required
                            >
                                <option value="">
                                    Select type
                                </option>

                                <option value="test">
                                    Test
                                </option>

                                <option value="exam">
                                    Examination
                                </option>

                                <option value="assignment">
                                    Assignment
                                </option>

                                <option value="quiz">
                                    Quiz
                                </option>
                            </select>
                        </div>

                    </div>

                    <div class="form-row">

                        <div class="form-group">
                            <label>Class</label>

                            <input
                                type="text"
                                id="assessment-class"
                                placeholder="JSS 1"
                                required
                            >
                        </div>

                        <div class="form-group">
                            <label>Subject</label>

                            <input
                                type="text"
                                id="assessment-subject"
                                placeholder="Mathematics"
                                required
                            >
                        </div>

                    </div>

                    <div class="form-row">

                        <div class="form-group">
                            <label>Academic Session</label>

                            <input
                                type="text"
                                id="assessment-session"
                                value="2025/2026"
                                required
                            >
                        </div>

                        <div class="form-group">
                            <label>Term</label>

                            <select
                                id="assessment-term"
                                required
                            >
                                <option value="">
                                    Select term
                                </option>

                                <option value="First Term">
                                    First Term
                                </option>

                                <option value="Second Term">
                                    Second Term
                                </option>

                                <option value="Third Term">
                                    Third Term
                                </option>
                            </select>
                        </div>

                    </div>

                    <div class="form-row">

                        <div class="form-group">
                            <label>Total Marks</label>

                            <input
                                type="number"
                                id="assessment-total-marks"
                                min="1"
                                value="100"
                                required
                            >
                        </div>

                        <div class="form-group">
                            <label>Status</label>

                            <select
                                id="assessment-status"
                            >
                                <option value="draft">
                                    Draft
                                </option>

                                <option value="published">
                                    Published
                                </option>
                            </select>
                        </div>

                    </div>

                    <div class="modal-actions">

                        <button
                            type="button"
                            class="cancel-button"
                            id="cancel-assessment-btn"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            class="primary-button"
                        >
                            Save Assessment
                        </button>

                    </div>

                </form>

            </div>

        </div>
    `;

    document
        .getElementById("back-assessment-btn")
        ?.addEventListener(
            "click",
            showAssessmentStructure
        );

    document
        .getElementById("cancel-assessment-btn")
        ?.addEventListener(
            "click",
            showAssessmentStructure
        );

    document
        .getElementById("assessment-form")
        ?.addEventListener(
            "submit",
            submitAssessment
        );
}


async function submitAssessment(event) {

    event.preventDefault();

    const submitButton =
        event.target.querySelector(
            'button[type="submit"]'
        );

    submitButton.disabled = true;
    submitButton.textContent = "Saving...";

    const payload = {
        title:
            document.getElementById(
                "assessment-title"
            ).value.trim(),

        type:
            document.getElementById(
                "assessment-type"
            ).value,

        class_name:
            document.getElementById(
                "assessment-class"
            ).value.trim(),

        subject:
            document.getElementById(
                "assessment-subject"
            ).value.trim(),

        academic_session:
            document.getElementById(
                "assessment-session"
            ).value.trim(),

        term:
            document.getElementById(
                "assessment-term"
            ).value,

        total_marks:
            Number(
                document.getElementById(
                    "assessment-total-marks"
                ).value
            ),

        status:
            document.getElementById(
                "assessment-status"
            ).value
    };

    try {

        await apiRequest(
            "/api/assessments",
            {
                method: "POST",
                body: payload
            }
        );

        alert("Assessment created successfully.");

        showAssessmentStructure();

    } catch (error) {

        alert(
            error.message ||
            "Unable to create assessment."
        );

        submitButton.disabled = false;
        submitButton.textContent =
            "Save Assessment";
    }
}


/* =========================================================
   VIEW ASSESSMENT
   ========================================================= */

async function viewAssessment(id) {

    if (!id) {
        alert("Assessment ID is missing.");
        return;
    }

    showLoading("Loading assessment...");

    try {

        const data = await apiRequest(
            `/api/assessments/${id}`
        );

        const assessment =
            data?.assessment ||
            data?.data ||
            data;

        contentArea.innerHTML = `
            <div class="page-content">

                <div class="page-introduction">

                    <div>
                        <h2>
                            ${escapeHtml(
                                assessment.title ||
                                assessment.name ||
                                "Assessment"
                            )}
                        </h2>

                        <p>
                            Assessment details
                        </p>
                    </div>

                    <button
                        class="secondary-button"
                        id="back-assessments"
                    >
                        ← Back
                    </button>

                </div>

                <div class="dashboard-card">

                    <div class="detail-item">
                        <span>Title</span>
                        <strong>
                            ${escapeHtml(
                                assessment.title ||
                                assessment.name ||
                                "N/A"
                            )}
                        </strong>
                    </div>

                    <div class="detail-item">
                        <span>Type</span>
                        <strong>
                            ${escapeHtml(
                                assessment.type ||
                                "N/A"
                            )}
                        </strong>
                    </div>

                    <div class="detail-item">
                        <span>Class</span>
                        <strong>
                            ${escapeHtml(
                                assessment.class_name ||
                                assessment.className ||
                                "N/A"
                            )}
                        </strong>
                    </div>

                    <div class="detail-item">
                        <span>Subject</span>
                        <strong>
                            ${escapeHtml(
                                assessment.subject ||
                                "N/A"
                            )}
                        </strong>
                    </div>

                    <div class="detail-item">
                        <span>Academic Session</span>
                        <strong>
                            ${escapeHtml(
                                assessment.academic_session ||
                                assessment.session ||
                                "N/A"
                            )}
                        </strong>
                    </div>

                    <div class="detail-item">
                        <span>Term</span>
                        <strong>
                            ${escapeHtml(
                                assessment.term ||
                                "N/A"
                            )}
                        </strong>
                    </div>

                    <div class="detail-item">
                        <span>Total Marks</span>
                        <strong>
                            ${escapeHtml(
                                assessment.total_marks ||
                                assessment.totalMarks ||
                                "N/A"
                            )}
                        </strong>
                    </div>

                    <div class="detail-item">
                        <span>Status</span>
                        <strong>
                            ${escapeHtml(
                                assessment.status ||
                                "draft"
                            )}
                        </strong>
                    </div>

                </div>

            </div>
        `;

        document
            .getElementById("back-assessments")
            ?.addEventListener(
                "click",
                showAssessmentStructure
            );

    } catch (error) {

        showError(
            error.message ||
            "Unable to load assessment."
        );
    }
}


/* =========================================================
   RESULTS
   ========================================================= */

async function showResults() {

    showLoading("Loading student results...");

    try {

        const data = await apiRequest(
            "/api/results"
        );

        const results =
            data?.results ||
            data?.data ||
            [];

        contentArea.innerHTML = `
            <div class="page-content">

                <div class="page-introduction">

                    <div>
                        <h2>Student Results</h2>

                        <p>
                            View and manage academic results
                            for students in your school.
                        </p>
                    </div>

                    <button
                        class="primary-button"
                        id="refresh-results-btn"
                    >
                        🔄 Refresh
                    </button>

                </div>

                <div class="stats-grid">

                    <div class="stat-card">
                        <p>Total Results</p>
                        <h3>${results.length}</h3>
                        <small>Recorded results</small>
                    </div>

                    <div class="stat-card">
                        <p>Published</p>

                        <h3>
                            ${
                                results.filter(
                                    result =>
                                        result.status ===
                                        "published"
                                ).length
                            }
                        </h3>

                        <small>
                            Available to users
                        </small>
                    </div>

                    <div class="stat-card">
                        <p>Pending</p>

                        <h3>
                            ${
                                results.filter(
                                    result =>
                                        result.status !==
                                        "published"
                                ).length
                            }
                        </h3>

                        <small>
                            Awaiting publication
                        </small>
                    </div>

                </div>

                <div class="dashboard-card">

                    <div class="form-row">

                        <div class="form-group">

                            <label>
                                Search Student
                            </label>

                            <input
                                type="text"
                                id="result-search"
                                placeholder="Student name or admission number"
                            >

                        </div>

                        <div class="form-group">

                            <label>
                                Class
                            </label>

                            <input
                                type="text"
                                id="result-class-filter"
                                placeholder="JSS 1"
                            >

                        </div>

                        <div class="form-group">

                            <label>
                                Subject
                            </label>

                            <input
                                type="text"
                                id="result-subject-filter"
                                placeholder="Mathematics"
                            >

                        </div>

                    </div>

                </div>

                <div
                    class="dashboard-card"
                    id="results-table-container"
                >
                    ${renderResultsTable(results)}
                </div>

            </div>
        `;

        const searchInput =
            document.getElementById(
                "result-search"
            );

        const classInput =
            document.getElementById(
                "result-class-filter"
            );

        const subjectInput =
            document.getElementById(
                "result-subject-filter"
            );

        const filterResults = () => {

            const search =
                searchInput.value
                    .toLowerCase()
                    .trim();

            const classFilter =
                classInput.value
                    .toLowerCase()
                    .trim();

            const subjectFilter =
                subjectInput.value
                    .toLowerCase()
                    .trim();

            const filtered =
                results.filter(result => {

                    const studentName =
                        String(
                            result.student_name ||
                            result.studentName ||
                            result.student?.full_name ||
                            ""
                        ).toLowerCase();

                    const admission =
                        String(
                            result.admission_number ||
                            result.admissionNumber ||
                            result.student?.admission_number ||
                            ""
                        ).toLowerCase();

                    const className =
                        String(
                            result.class_name ||
                            result.className ||
                            ""
                        ).toLowerCase();

                    const subject =
                        String(
                            result.subject ||
                            ""
                        ).toLowerCase();

                    const matchesSearch =
                        !search ||
                        studentName.includes(search) ||
                        admission.includes(search);

                    const matchesClass =
                        !classFilter ||
                        className.includes(classFilter);

                    const matchesSubject =
                        !subjectFilter ||
                        subject.includes(subjectFilter);

                    return (
                        matchesSearch &&
                        matchesClass &&
                        matchesSubject
                    );
                });

            document.getElementById(
                "results-table-container"
            ).innerHTML =
                renderResultsTable(filtered);
        };

        searchInput?.addEventListener(
            "input",
            filterResults
        );

        classInput?.addEventListener(
            "input",
            filterResults
        );

        subjectInput?.addEventListener(
            "input",
            filterResults
        );

        document
            .getElementById(
                "refresh-results-btn"
            )
            ?.addEventListener(
                "click",
                showResults
            );

    } catch (error) {

        showError(
            error.message ||
            "Unable to load student results."
        );
    }
}


/* =========================================================
   RESULTS TABLE
   ========================================================= */

function renderResultsTable(results) {

    return `
        <div class="table-responsive">

            <table class="fee-table">

                <thead>

                    <tr>
                        <th>Student</th>
                        <th>Admission No.</th>
                        <th>Class</th>
                        <th>Subject</th>
                        <th>Score</th>
                        <th>Total</th>
                        <th>Grade</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>

                </thead>

                <tbody>

                    ${
                        results.length
                            ? results
                                  .map(
                                      result => {

                                          const studentName =
                                              result.student_name ||
                                              result.studentName ||
                                              result.student?.full_name ||
                                              "Unknown Student";

                                          const admission =
                                              result.admission_number ||
                                              result.admissionNumber ||
                                              result.student?.admission_number ||
                                              "N/A";

                                          const className =
                                              result.class_name ||
                                              result.className ||
                                              "N/A";

                                          const subject =
                                              result.subject ||
                                              "N/A";

                                          const score =
                                              result.score ??
                                              result.marks ??
                                              0;

                                          const total =
                                              result.total_marks ??
                                              result.totalMarks ??
                                              100;

                                          const grade =
                                              result.grade ||
                                              calculateGrade(
                                                  score,
                                                  total
                                              );

                                          return `
                                            <tr>

                                                <td>
                                                    ${escapeHtml(
                                                        studentName
                                                    )}
                                                </td>

                                                <td>
                                                    ${escapeHtml(
                                                        admission
                                                    )}
                                                </td>

                                                <td>
                                                    ${escapeHtml(
                                                        className
                                                    )}
                                                </td>

                                                <td>
                                                    ${escapeHtml(
                                                        subject
                                                    )}
                                                </td>

                                                <td>
                                                    ${escapeHtml(
                                                        score
                                                    )}
                                                </td>

                                                <td>
                                                    ${escapeHtml(
                                                        total
                                                    )}
                                                </td>

                                                <td>
                                                    <strong>
                                                        ${escapeHtml(
                                                            grade
                                                        )}
                                                    </strong>
                                                </td>

                                                <td>
                                                    <span class="status ${
                                                        result.status ===
                                                        "published"
                                                            ? "paid"
                                                            : "pending"
                                                    }">
                                                        ${escapeHtml(
                                                            result.status ||
                                                            "draft"
                                                        )}
                                                    </span>
                                                </td>

                                                <td>

                                                    <button
                                                        class="primary-button"
                                                        style="padding:6px 10px;"
                                                        onclick="viewResult('${escapeHtml(
                                                            result._id ||
                                                            result.id ||
                                                            ""
                                                        )}')"
                                                    >
                                                        View
                                                    </button>

                                                </td>

                                            </tr>
                                          `;
                                      }
                                  )
                                  .join("")
                            : `
                                <tr>
                                    <td
                                        colspan="9"
                                        style="
                                            text-align:center;
                                            padding:2rem;
                                        "
                                    >
                                        No results found.
                                    </td>
                                </tr>
                            `
                    }

                </tbody>

            </table>

        </div>
    `;
}


function calculateGrade(score, total) {

    const percentage =
        total > 0
            ? (Number(score) / Number(total)) * 100
            : 0;

    if (percentage >= 75) return "A";
    if (percentage >= 65) return "B";
    if (percentage >= 55) return "C";
    if (percentage >= 45) return "D";
    if (percentage >= 40) return "E";

    return "F";
}


/* =========================================================
   VIEW SINGLE RESULT
   ========================================================= */

async function viewResult(id) {

    if (!id) {
        alert("Result ID is missing.");
        return;
    }

    showLoading("Loading result...");

    try {

        const data =
            await apiRequest(
                `/api/results/${id}`
            );

        const result =
            data?.result ||
            data?.data ||
            data;

        const studentName =
            result.student_name ||
            result.studentName ||
            result.student?.full_name ||
            "Unknown Student";

        const admission =
            result.admission_number ||
            result.admissionNumber ||
            result.student?.admission_number ||
            "N/A";

        const score =
            result.score ??
            result.marks ??
            0;

        const total =
            result.total_marks ??
            result.totalMarks ??
            100;

        const grade =
            result.grade ||
            calculateGrade(score, total);

        contentArea.innerHTML = `
            <div class="page-content">

                <div class="page-introduction">

                    <div>

                        <h2>
                            Student Result
                        </h2>

                        <p>
                            Academic result details
                        </p>

                    </div>

                    <button
                        class="secondary-button"
                        id="back-results"
                    >
                        ← Back to Results
                    </button>

                </div>

                <div class="dashboard-card">

                    <div class="detail-item">
                        <span>Student Name</span>
                        <strong>
                            ${escapeHtml(studentName)}
                        </strong>
                    </div>

                    <div class="detail-item">
                        <span>Admission Number</span>
                        <strong>
                            ${escapeHtml(admission)}
                        </strong>
                    </div>

                    <div class="detail-item">
                        <span>Class</span>
                        <strong>
                            ${escapeHtml(
                                result.class_name ||
                                result.className ||
                                "N/A"
                            )}
                        </strong>
                    </div>

                    <div class="detail-item">
                        <span>Subject</span>
                        <strong>
                            ${escapeHtml(
                                result.subject ||
                                "N/A"
                            )}
                        </strong>
                    </div>

                    <div class="detail-item">
                        <span>Score</span>
                        <strong>
                            ${escapeHtml(score)}
                            /
                            ${escapeHtml(total)}
                        </strong>
                    </div>

                    <div class="detail-item">
                        <span>Grade</span>
                        <strong>
                            ${escapeHtml(grade)}
                        </strong>
                    </div>

                    <div class="detail-item">
                        <span>Status</span>
                        <strong>
                            ${escapeHtml(
                                result.status ||
                                "draft"
                            )}
                        </strong>
                    </div>

                    <div class="detail-item">
                        <span>Academic Session</span>
                        <strong>
                            ${escapeHtml(
                                result.academic_session ||
                                result.session ||
                                "N/A"
                            )}
                        </strong>
                    </div>

                    <div class="detail-item">
                        <span>Term</span>
                        <strong>
                            ${escapeHtml(
                                result.term ||
                                "N/A"
                            )}
                        </strong>
                    </div>

                </div>

            </div>
        `;

        document
            .getElementById("back-results")
            ?.addEventListener(
                "click",
                showResults
            );

    } catch (error) {

        showError(
            error.message ||
            "Unable to load result."
        );
    }
}


/* =========================================================
   FINANCE & FEES FUNCTIONS
   ========================================================= */

function showFeeStructure() {

    contentArea.innerHTML = `
        <div class="page-content">

            <div class="page-introduction">

                <div>
                    <h2>Fee Structure</h2>
                    <p>
                        Create and manage fee structures
                        for your school.
                    </p>
                </div>

                <button class="primary-button">
                    + Add Fee
                </button>

            </div>

            <div class="dashboard-card">

                <form class="fee-form">

                    <div class="form-row">

                        <div class="form-group">
                            <label>Class</label>

                            <select>
                                <option>Primary 1</option>
                                <option>Primary 2</option>
                                <option>Primary 3</option>
                                <option>JSS 1</option>
                                <option>JSS 2</option>
                                <option>SS 1</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label>Fee Name</label>
                            <input
                                type="text"
                                placeholder="Tuition"
                            >
                        </div>

                    </div>

                    <div class="form-row">

                        <div class="form-group">
                            <label>Amount</label>

                            <input
                                type="number"
                                placeholder="35000"
                            >
                        </div>

                        <div class="form-group">
                            <label>Category</label>

                            <select>
                                <option>Compulsory</option>
                                <option>Optional</option>
                            </select>
                        </div>

                    </div>

                    <button
                        class="primary-button"
                        type="button"
                    >
                        Save Fee
                    </button>

                </form>

            </div>

            <div class="table-responsive">

                <h3>Existing Fee Structure</h3>

                <table class="fee-table">

                    <thead>
                        <tr>
                            <th>Class</th>
                            <th>Fee</th>
                            <th>Amount</th>
                            <th>Category</th>
                            <th>Action</th>
                        </tr>
                    </thead>

                    <tbody>

                        <tr>
                            <td>Primary 1</td>
                            <td>Tuition</td>
                            <td>₦35,000</td>
                            <td>Compulsory</td>
                            <td>✏️ 🗑️</td>
                        </tr>

                        <tr>
                            <td>Primary 1</td>
                            <td>ICT</td>
                            <td>₦5,000</td>
                            <td>Compulsory</td>
                            <td>✏️ 🗑️</td>
                        </tr>

                    </tbody>

                </table>

            </div>

        </div>
    `;
}


function showCollectPayment() {

    contentArea.innerHTML = `
        <div class="page-content">

            <div class="page-introduction">

                <div>
                    <h2>Collect School Fees</h2>

                    <p>
                        Search for a student and
                        record fee payments.
                    </p>
                </div>

            </div>

            <div class="dashboard-card">

                <div class="form-group">

                    <label>Search Student</label>

                    <input
                        type="text"
                        placeholder="Enter Student Name or Admission Number"
                    >

                </div>

                <button class="primary-button">
                    🔍 Search
                </button>

            </div>

            <div class="dashboard-card">

                <h3>Student Information</h3>

                <br>

                <div class="detail-item">
                    <span>Student Name</span>
                    <strong>Aisha Bello</strong>
                </div>

                <div class="detail-item">
                    <span>Admission No.</span>
                    <strong>PRY00125</strong>
                </div>

                <div class="detail-item">
                    <span>Class</span>
                    <strong>Primary 4</strong>
                </div>

                <div class="detail-item">
                    <span>Total Fee</span>
                    <strong>₦120,000</strong>
                </div>

                <div class="detail-item">
                    <span>Amount Paid</span>
                    <strong>₦70,000</strong>
                </div>

                <div class="detail-item">
                    <span>Outstanding Balance</span>
                    <strong style="color:red;">
                        ₦50,000
                    </strong>
                </div>

            </div>

            <div class="dashboard-card">

                <h3>Payment Details</h3>

                <br>

                <div class="form-group">
                    <label>Amount Paying</label>

                    <input
                        type="number"
                        placeholder="Enter Amount"
                    >
                </div>

                <div class="form-group">
                    <label>Payment Method</label>

                    <select>
                        <option>Cash</option>
                        <option>Bank Transfer</option>
                        <option>POS</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>Remarks</label>

                    <textarea
                        placeholder="Optional"
                    ></textarea>
                </div>

                <button class="primary-button">
                    Receive Payment
                </button>

            </div>

        </div>
    `;
}


function showPaymentHistory() {

    contentArea.innerHTML = `
        <div class="page-content">

            <div class="page-introduction">

                <div>
                    <h2>Payment History</h2>

                    <p>
                        View all school fee payment records.
                    </p>
                </div>

            </div>

            <div class="dashboard-card">

                <div class="form-row">

                    <div class="form-group">
                        <input
                            type="text"
                            placeholder="🔍 Search Student"
                        >
                    </div>

                    <div class="form-group">
                        <input type="date">
                    </div>

                </div>

            </div>

            <div class="table-responsive">

                <table class="fee-table">

                    <thead>

                        <tr>
                            <th>Receipt No.</th>
                            <th>Student</th>
                            <th>Amount</th>
                            <th>Method</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>

                    </thead>

                    <tbody>

                        <tr>
                            <td>EDU0001</td>
                            <td>Aisha Bello</td>
                            <td>₦30,000</td>
                            <td>Cash</td>
                            <td>30/07/2026</td>
                            <td>
                                <span class="paid-status">
                                    Paid
                                </span>
                            </td>
                            <td>👁️ 🖨️</td>
                        </tr>

                        <tr>
                            <td>EDU0002</td>
                            <td>Aliyu Musa</td>
                            <td>₦20,000</td>
                            <td>Transfer</td>
                            <td>30/07/2026</td>
                            <td>
                                <span class="part-status">
                                    Part Payment
                                </span>
                            </td>
                            <td>👁️ 🖨️</td>
                        </tr>

                    </tbody>

                </table>

            </div>

        </div>
    `;
}


function showReceipts() {

    const user = getCurrentUser();

    contentArea.innerHTML = `
        <div class="page-content">

            <div class="page-introduction">

                <div>
                    <h2>Digital Receipt</h2>

                    <p>
                        Print and download official
                        school fee receipts.
                    </p>
                </div>

            </div>

            <div class="receipt-card">

                <div class="receipt-header">

                    <h2>EDUTRUST</h2>

                    <h3>
                        ${escapeHtml(
                            user.school_name ||
                            "School Name"
                        )}
                    </h3>

                    <p>
                        ${escapeHtml(
                            user.address ||
                            "School Address"
                        )}
                    </p>

                    <p>
                        Official School Fee Receipt
                    </p>

                </div>

                <hr>

                <div class="receipt-body">

                    <div class="detail-item">
                        <span>Receipt No.</span>
                        <strong>EDU0001</strong>
                    </div>

                    <div class="detail-item">
                        <span>Student Name</span>
                        <strong>Aisha Bello</strong>
                    </div>

                    <div class="detail-item">
                        <span>Admission No.</span>
                        <strong>PRY00125</strong>
                    </div>

                    <div class="detail-item">
                        <span>Class</span>
                        <strong>Primary 4</strong>
                    </div>

                    <div class="detail-item">
                        <span>Amount Paid</span>
                        <strong>₦30,000</strong>
                    </div>

                    <div class="detail-item">
                        <span>Payment Method</span>
                        <strong>Cash</strong>
                    </div>

                    <div class="detail-item">
                        <span>Outstanding Balance</span>
                        <strong style="color:red;">
                            ₦20,000
                        </strong>
                    </div>

                    <div class="detail-item">
                        <span>Issued By</span>

                        <strong>
                            ${escapeHtml(
                                user.full_name ||
                                "Administrator"
                            )}

                            (${escapeHtml(
                                user.role ||
                                "Admin"
                            )})
                        </strong>

                    </div>

                    <div class="detail-item">
                        <span>Contact Email</span>

                        <strong>
                            ${escapeHtml(
                                user.email ||
                                "N/A"
                            )}
                        </strong>

                    </div>

                </div>

                <div class="receipt-buttons">

                    <button class="primary-button">
                        🖨 Print Receipt
                    </button>

                    <button class="primary-button">
                        📄 Download PDF
                    </button>

                </div>

            </div>

        </div>
    `;
}


function showInstallments() {

    contentArea.innerHTML = `
        <div class="page-content">

            <div class="page-introduction">

                <div>
                    <h2>Installment Payments</h2>

                    <p>
                        View and record installment
                        payments for students.
                    </p>
                </div>

            </div>

            <div class="dashboard-card">

                <div class="form-group">
                    <label>Search Student</label>

                    <input
                        type="text"
                        placeholder="Enter Student Name or Admission Number"
                    >
                </div>

                <button class="primary-button">
                    🔍 Search Student
                </button>

            </div>

            <div class="dashboard-card">

                <h3>Student Fee Summary</h3>

                <br>

                <div class="detail-item">
                    <span>Student Name</span>
                    <strong>Aisha Bello</strong>
                </div>

                <div class="detail-item">
                    <span>Class</span>
                    <strong>Primary 4</strong>
                </div>

                <div class="detail-item">
                    <span>Total Fee</span>
                    <strong>₦120,000</strong>
                </div>

                <div class="detail-item">
                    <span>Total Paid</span>
                    <strong>₦70,000</strong>
                </div>

                <div class="detail-item">
                    <span>Outstanding Balance</span>

                    <strong style="color:red;">
                        ₦50,000
                    </strong>
                </div>

                <div class="detail-item">
                    <span>Status</span>

                    <strong style="color:orange;">
                        🟡 PART PAYMENT
                    </strong>
                </div>

            </div>

            <div class="dashboard-card">

                <h3>Installment History</h3>

                <table class="fee-table">

                    <thead>

                        <tr>
                            <th>No.</th>
                            <th>Amount</th>
                            <th>Method</th>
                            <th>Date</th>
                        </tr>

                    </thead>

                    <tbody>

                        <tr>
                            <td>1</td>
                            <td>₦40,000</td>
                            <td>Cash</td>
                            <td>30 Jul 2026</td>
                        </tr>

                        <tr>
                            <td>2</td>
                            <td>₦30,000</td>
                            <td>Transfer</td>
                            <td>02 Aug 2026</td>
                        </tr>

                    </tbody>

                </table>

            </div>

            <div class="dashboard-card">

                <h3>Record New Installment</h3>

                <br>

                <div class="form-group">
                    <label>Amount</label>

                    <input
                        type="number"
                        placeholder="Enter Amount"
                    >
                </div>

                <div class="form-group">
                    <label>Payment Method</label>

                    <select>
                        <option>Cash</option>
                        <option>Transfer</option>
                        <option>POS</option>
                    </select>
                </div>

                <button class="primary-button">
                    Record Installment
                </button>

            </div>

        </div>
    `;
}


function showOutstandingFees() {

    contentArea.innerHTML = `
        <div class="page-content">

            <div class="page-introduction">

                <div>
                    <h2>Outstanding Fees</h2>

                    <p>
                        Monitor students with unpaid
                        school fees.
                    </p>
                </div>

                <button class="primary-button">
                    Send Fee Reminder
                </button>

            </div>

            <div class="stats-grid">

                <div class="stat-card">
                    <p>Total Outstanding</p>
                    <h3>₦2.1M</h3>
                    <small>Awaiting payment</small>
                </div>

                <div class="stat-card">
                    <p>Students With Balance</p>
                    <h3>186</h3>
                    <small>Require attention</small>
                </div>

                <div class="stat-card">
                    <p>Partially Paid</p>
                    <h3>74</h3>
                    <small>Incomplete payments</small>
                </div>

                <div class="stat-card">
                    <p>Payment Rate</p>
                    <h3>80%</h3>
                    <small>Current session</small>
                </div>

            </div>

            <div class="dashboard-card">

                <div class="table-container">

                    <table>

                        <thead>

                            <tr>
                                <th>Student</th>
                                <th>Parent / Guardian</th>
                                <th>Class</th>
                                <th>Total Fee</th>
                                <th>Paid</th>
                                <th>Balance</th>
                                <th>Status</th>
                            </tr>

                        </thead>

                        <tbody>

                            <tr>
                                <td>Maryam Bello</td>
                                <td>Zainab Bello</td>
                                <td>Primary 5</td>
                                <td>₦180,000</td>
                                <td>₦120,000</td>
                                <td>₦60,000</td>
                                <td>
                                    <span class="status pending">
                                        Partial
                                    </span>
                                </td>
                            </tr>

                            <tr>
                                <td>Ahmad Musa</td>
                                <td>Ibrahim Musa</td>
                                <td>JSS 1</td>
                                <td>₦210,000</td>
                                <td>₦95,000</td>
                                <td>₦115,000</td>
                                <td>
                                    <span class="status pending">
                                        Partial
                                    </span>
                                </td>
                            </tr>

                            <tr>
                                <td>Fatima Yusuf</td>
                                <td>Amina Yusuf</td>
                                <td>Primary 4</td>
                                <td>₦150,000</td>
                                <td>₦0</td>
                                <td>₦150,000</td>
                                <td>
                                    <span class="status unpaid">
                                        Unpaid
                                    </span>
                                </td>
                            </tr>

                        </tbody>

                    </table>

                </div>

            </div>

        </div>
    `;
}


function showSchoolFees() {

    contentArea.innerHTML = `
        <div class="page-content">

            <div class="page-introduction">

                <div>
                    <h2>School Fees Management</h2>

                    <p>
                        Manage fee structures,
                        payments, receipts and
                        outstanding balances.
                    </p>

                </div>

                <button class="primary-button">
                    + Create Fee
                </button>

            </div>

            <div class="finance-grid">

                <div
                    class="finance-card"
                    id="btn-fee-struct"
                >
                    <div class="finance-icon">📋</div>

                    <h3>Fee Structure</h3>

                    <p>
                        Create and manage school fees.
                    </p>
                </div>

                <div
                    class="finance-card"
                    id="btn-collect-pay"
                >
                    <div class="finance-icon">💳</div>

                    <h3>Collect Payment</h3>

                    <p>
                        Receive school fee payments.
                    </p>
                </div>

                <div
                    class="finance-card"
                    id="btn-pay-hist"
                >
                    <div class="finance-icon">🧾</div>

                    <h3>Payment History</h3>

                    <p>
                        View all payment records.
                    </p>
                </div>

                <div
                    class="finance-card"
                    id="btn-receipts"
                >
                    <div class="finance-icon">📄</div>

                    <h3>Receipts</h3>

                    <p>
                        Print and download receipts.
                    </p>
                </div>

                <div
                    class="finance-card"
                    id="btn-installments"
                >
                    <div class="finance-icon">💰</div>

                    <h3>Installments</h3>

                    <p>
                        Track installment payments.
                    </p>
                </div>

                <div
                    class="finance-card"
                    id="btn-outstanding"
                >
                    <div class="finance-icon">⚠️</div>

                    <h3>Outstanding Fees</h3>

                    <p>
                        Students with unpaid balances.
                    </p>
                </div>

            </div>

        </div>
    `;

    document
        .getElementById("btn-fee-struct")
        ?.addEventListener(
            "click",
            showFeeStructure
        );

    document
        .getElementById("btn-collect-pay")
        ?.addEventListener(
            "click",
            showCollectPayment
        );

    document
        .getElementById("btn-pay-hist")
        ?.addEventListener(
            "click",
            showPaymentHistory
        );

    document
        .getElementById("btn-receipts")
        ?.addEventListener(
            "click",
            showReceipts
        );

    document
        .getElementById("btn-installments")
        ?.addEventListener(
            "click",
            showInstallments
        );

    document
        .getElementById("btn-outstanding")
        ?.addEventListener(
            "click",
            showOutstandingFees
        );
}


/* =========================================================
   CORE PAGES & VIEWS
   ========================================================= */

function showOverview() {

    const user = getCurrentUser();

    contentArea.innerHTML = `
        <div class="page-content">

            <div class="page-introduction">

                <div>

                    <h2>
                        Welcome,
                        ${escapeHtml(
                            user.full_name ||
                            "Principal"
                        )}
                        👋
                    </h2>

                    <p>
                        Here is what is happening at
                        <strong>
                            ${escapeHtml(
                                user.school_name ||
                                "your school"
                            )}
                        </strong>
                        today.
                    </p>

                </div>

                <button class="primary-button">
                    + Add Student
                </button>

            </div>

            <div class="stats-grid">

                <div class="stat-card">
                    <p>Total Students</p>
                    <h3>1,248</h3>
                </div>

                <div class="stat-card">
                    <p>Fees Collected</p>
                    <h3>₦8.4M</h3>
                </div>

                <div class="stat-card">
                    <p>Outstanding Fees</p>
                    <h3>₦2.1M</h3>
                </div>

                <div class="stat-card">
                    <p>Active Parents</p>
                    <h3>936</h3>
                </div>

            </div>

        </div>
    `;
}


function showSchoolManagement() {

    const user = getCurrentUser();

    contentArea.innerHTML = `
        <div class="page-content">

            <div class="page-introduction">

                <div>

                    <h2>School Management</h2>

                    <p>
                        Manage basic information for
                        ${escapeHtml(
                            user.school_name ||
                            "your school"
                        )}.
                    </p>

                </div>

                <button
                    class="primary-button"
                    id="openSchoolModalBtn"
                >
                    Edit School Information
                </button>

            </div>

            <div class="school-management-grid">

                <div class="dashboard-card school-information-card">

                    <div class="card-header">

                        <div>
                            <h3>
                                School Information
                            </h3>

                            <p>
                                Registered details
                                for your institution
                            </p>
                        </div>

                    </div>

                    <div class="school-details">

                        <div class="detail-item">
                            <span>School Name</span>
                            <strong>
                                ${escapeHtml(
                                    user.school_name ||
                                    "N/A"
                                )}
                            </strong>
                        </div>

                        <div class="detail-item">
                            <span>School Email</span>
                            <strong>
                                ${escapeHtml(
                                    user.email ||
                                    "N/A"
                                )}
                            </strong>
                        </div>

                        <div class="detail-item">
                            <span>Phone Number</span>
                            <strong>
                                ${escapeHtml(
                                    user.phone ||
                                    "N/A"
                                )}
                            </strong>
                        </div>

                        <div class="detail-item">
                            <span>School Address</span>
                            <strong>
                                ${escapeHtml(
                                    user.address ||
                                    "N/A"
                                )}
                            </strong>
                        </div>

                        <div class="detail-item">
                            <span>School Type</span>
                            <strong>
                                ${escapeHtml(
                                    user.school_type ||
                                    "Private School"
                                )}
                            </strong>
                        </div>

                        <div class="detail-item">
                            <span>
                                Administrator / Principal
                            </span>

                            <strong>
                                ${escapeHtml(
                                    user.full_name ||
                                    "N/A"
                                )}
                            </strong>
                        </div>

                        <div class="detail-item">
                            <span>User Role</span>

                            <strong>
                                ${escapeHtml(
                                    user.role ||
                                    "Principal"
                                )}
                            </strong>
                        </div>

                    </div>

                </div>

                <div class="dashboard-card school-status-card">

                    <div class="card-header">

                        <div>

                            <h3>School Status</h3>

                            <p>
                                Current account status
                            </p>

                        </div>

                    </div>

                    <div class="status-overview">

                        <div class="large-status-icon">
                            ✓
                        </div>

                        <h3>Active</h3>

                        <p>
                            Your school account is active
                            and fully operational.
                        </p>

                    </div>

                    <div class="status-information">

                        <div>
                            <span>Account Created</span>
                            <strong>July 2026</strong>
                        </div>

                        <div>
                            <span>Current Session</span>

                            <strong>
                                ${escapeHtml(
                                    user.academic_session ||
                                    "2025/2026"
                                )}
                            </strong>
                        </div>

                    </div>

                </div>

            </div>

        </div>
    `;

    document
        .getElementById(
            "openSchoolModalBtn"
        )
        ?.addEventListener(
            "click",
            openSchoolModal
        );
}


function showClasses() {

    contentArea.innerHTML = `
        <div class="page-content">

            <div class="page-introduction">

                <div>
                    <h2>Classes</h2>

                    <p>
                        Manage classes and class streams.
                    </p>
                </div>

                <button class="primary-button">
                    + Add New Class
                </button>

            </div>

            <div class="stats-grid">

                <div class="stat-card">
                    <p>Total Classes</p>
                    <h3>24</h3>
                    <small>Across all levels</small>
                </div>

                <div class="stat-card">
                    <p>Primary Classes</p>
                    <h3>12</h3>
                    <small>Primary section</small>
                </div>

                <div class="stat-card">
                    <p>Secondary Classes</p>
                    <h3>12</h3>
                    <small>Secondary section</small>
                </div>

                <div class="stat-card">
                    <p>Total Students</p>
                    <h3>1,248</h3>
                    <small>Assigned to classes</small>
                </div>

            </div>

        </div>
    `;
}


function showAcademicSessions() {

    contentArea.innerHTML = `
        <div class="page-content">

            <div class="page-introduction">

                <div>
                    <h2>Academic Sessions</h2>

                    <p>
                        Manage academic sessions
                        and school terms.
                    </p>
                </div>

                <button class="primary-button">
                    + Create New Session
                </button>

            </div>

            <div class="stats-grid">

                <div class="stat-card">
                    <p>Current Session</p>
                    <h3>2025/2026</h3>
                    <small>
                        Active academic session
                    </small>
                </div>

                <div class="stat-card">
                    <p>Current Term</p>
                    <h3>First Term</h3>
                    <small>
                        Current school term
                    </small>
                </div>

            </div>

        </div>
    `;
}


/* =========================================================
   STUDENTS
   ========================================================= */

function showStudents() {

    contentArea.innerHTML = `
        <div class="page-header">

            <div>
                <h1>Students</h1>

                <p>
                    Manage all students registered
                    in your school.
                </p>
            </div>

            <button
                class="primary-button"
                id="add-student-button"
            >
                + Add Student
            </button>

        </div>

        <div class="stats-grid">

            <div class="stat-card">
                <span class="stat-icon">👨‍🎓</span>

                <div>
                    <p>Total Students</p>
                    <h2>1,248</h2>
                </div>
            </div>

            <div class="stat-card">
                <span class="stat-icon">🟢</span>

                <div>
                    <p>Active Students</p>
                    <h2>1,180</h2>
                </div>
            </div>

            <div class="stat-card">
                <span class="stat-icon">🔴</span>

                <div>
                    <p>Inactive Students</p>
                    <h2>68</h2>
                </div>
            </div>

        </div>

        <div
            class="student-modal"
            id="student-modal"
            style="display:none;"
        >

            <div class="student-modal-content">

                <div class="modal-header">

                    <h2>
                        Add New Student
                    </h2>

                    <button
                        type="button"
                        class="close-modal"
                        id="close-student-modal"
                    >
                        ×
                    </button>

                </div>

                <form id="student-form">

                    <div class="form-row">

                        <div class="form-group">

                            <label>
                                First Name
                            </label>

                            <input
                                type="text"
                                required
                            >

                        </div>

                        <div class="form-group">

                            <label>
                                Last Name
                            </label>

                            <input
                                type="text"
                                required
                            >

                        </div>

                    </div>

                    <div class="modal-actions">

                        <button
                            type="button"
                            class="cancel-button"
                            id="cancel-student-modal"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            class="primary-button"
                        >
                            Add Student
                        </button>

                    </div>

                </form>

            </div>

        </div>
    `;

    const addStudentButton =
        document.getElementById(
            "add-student-button"
        );

    const studentModal =
        document.getElementById(
            "student-modal"
        );

    const closeStudentModal =
        document.getElementById(
            "close-student-modal"
        );

    const cancelStudentModal =
        document.getElementById(
            "cancel-student-modal"
        );

    const studentForm =
        document.getElementById(
            "student-form"
        );

    if (
        addStudentButton &&
        studentModal
    ) {

        addStudentButton.addEventListener(
            "click",
            () => {
                studentModal.style.display =
                    "flex";
            }
        );

        closeStudentModal?.addEventListener(
            "click",
            () => {
                studentModal.style.display =
                    "none";
            }
        );

        cancelStudentModal?.addEventListener(
            "click",
            () => {
                studentModal.style.display =
                    "none";
            }
        );

        studentForm?.addEventListener(
            "submit",
            (e) => {

                e.preventDefault();

                alert(
                    "Student added successfully!"
                );

                studentForm.reset();

                studentModal.style.display =
                    "none";
            }
        );
    }
}


/* =========================================================
   EXISTING PAGES
   ========================================================= */

function showParents() {
    contentArea.innerHTML = `
        <div class="page-content">
            <h2>Parents & Guardians</h2>
        </div>
    `;
}


function showStaff() {
    contentArea.innerHTML = `
        <div class="page-content">
            <h2>Staff & Teachers</h2>
        </div>
    `;
}


function showAnnouncements() {
    contentArea.innerHTML = `
        <div class="page-content">
            <h2>Announcements</h2>
        </div>
    `;
}


function showMessages() {
    contentArea.innerHTML = `
        <div class="page-content">
            <h2>Messages</h2>
        </div>
    `;
}


function showNotifications() {
    contentArea.innerHTML = `
        <div class="page-content">

            <div class="page-introduction">

                <div>
                    <h2>Notifications</h2>

                    <p>
                        School alerts and system
                        notifications.
                    </p>
                </div>

            </div>

            <div class="dashboard-card">

                <p>
                    No new notifications at the moment.
                </p>

            </div>

        </div>
    `;
}


function showParentPayments() {
    contentArea.innerHTML = `
        <div class="page-content">
            <h2>Parent Payments</h2>
        </div>
    `;
}


/* =========================================================
   SETTINGS PAGES
   ========================================================= */

function showSchoolProfile() {

    const user = getCurrentUser();

    contentArea.innerHTML = `
        <div class="page-content">

            <h2>
                School Profile Settings
            </h2>

            <div
                class="dashboard-card"
                style="margin-top:1rem;"
            >

                <div class="detail-item">
                    <span>School Name</span>

                    <strong>
                        ${escapeHtml(
                            user.school_name ||
                            "N/A"
                        )}
                    </strong>
                </div>

                <div class="detail-item">
                    <span>Email Address</span>

                    <strong>
                        ${escapeHtml(
                            user.email ||
                            "N/A"
                        )}
                    </strong>
                </div>

                <div class="detail-item">
                    <span>Phone Number</span>

                    <strong>
                        ${escapeHtml(
                            user.phone ||
                            "N/A"
                        )}
                    </strong>
                </div>

                <div class="detail-item">
                    <span>Address</span>

                    <strong>
                        ${escapeHtml(
                            user.address ||
                            "N/A"
                        )}
                    </strong>
                </div>

            </div>

        </div>
    `;
}


function showUserRoles() {

    contentArea.innerHTML = `
        <div class="page-content">
            <h2>User Roles & Permissions</h2>
        </div>
    `;
}


function showPaymentSettings() {

    contentArea.innerHTML = `
        <div class="page-content">
            <h2>Payment Gateway Settings</h2>
        </div>
    `;
}


function showSecurity() {

    contentArea.innerHTML = `
        <div class="page-content">
            <h2>Security Settings</h2>
        </div>
    `;
}


function showEmailSettings() {

    const user = getCurrentUser();

    contentArea.innerHTML = `
        <div class="page-content">

            <h2>Email Settings</h2>

            <div
                class="dashboard-card"
                style="margin-top:1rem;"
            >

                <p>
                    Notification & communication email:
                    <strong>
                        ${escapeHtml(
                            user.email ||
                            "N/A"
                        )}
                    </strong>
                </p>

            </div>

        </div>
    `;
}


function showBackup() {

    contentArea.innerHTML = `
        <div class="page-content">
            <h2>Backup & Export</h2>
        </div>
    `;
}


function showComingSoon(pageName) {

    contentArea.innerHTML = `
        <div class="empty-page">

            <div class="empty-icon">
                🚧
            </div>

            <h2>
                ${escapeHtml(pageName)}
            </h2>

            <p>
                This section will be built next.
            </p>

        </div>
    `;
}


/* =========================================================
   SIDEBAR & UTILITY CONTROLS
   ========================================================= */

const reportsToggle =
    document.querySelector(
        ".reports-toggle"
    );

if (reportsToggle) {

    const reportsGroup =
        reportsToggle.closest(
            ".nav-group"
        );

    reportsToggle.addEventListener(
        "click",
        () => {
            reportsGroup?.classList.toggle(
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

    const settingsGroup =
        settingsToggle.closest(
            ".nav-group"
        );

    settingsToggle.addEventListener(
        "click",
        () => {
            settingsGroup?.classList.toggle(
                "open"
            );
        }
    );
}


/* =========================================================
   NOTIFICATION DROPDOWN
   ========================================================= */

if (
    notificationButton &&
    notificationDropdown
) {

    notificationButton.addEventListener(
        "click",
        (e) => {

            e.stopPropagation();

            notificationDropdown.classList.toggle(
                "show"
            );
        }
    );

    document.addEventListener(
        "click",
        () => {
            notificationDropdown.classList.remove(
                "show"
            );
        }
    );
}


/* =========================================================
   MOBILE / DESKTOP MENU
   ========================================================= */

if (menuToggle && sidebar) {

    menuToggle.addEventListener(
        "click",
        () => {

            if (
                window.innerWidth <= 768
            ) {

                sidebar.classList.toggle(
                    "show"
                );

            } else {

                sidebar.classList.toggle(
                    "collapsed"
                );
            }
        }
    );
}


/* =========================================================
   LOGOUT
   ========================================================= */

const logoutButton =
    document.getElementById(
        "logoutButton"
    );

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        () => {

            localStorage.removeItem(
                "token"
            );

            localStorage.removeItem(
                "user"
            );

            window.location.href =
                "login.html";
        }
    );
}


/* =========================================================
   SCHOOL MODAL CONTROLS
   ========================================================= */

function openSchoolModal() {

    const modal =
        document.getElementById(
            "schoolModal"
        );

    if (modal) {
        modal.style.display = "flex";
    }
}


function closeSchoolModal() {

    const modal =
        document.getElementById(
            "schoolModal"
        );

    if (modal) {
        modal.style.display = "none";
    }
}


window.onclick = function (event) {

    const modal =
        document.getElementById(
            "schoolModal"
        );

    if (
        modal &&
        event.target === modal
    ) {

        modal.style.display =
            "none";
    }
};


/* =========================================================
   GLOBAL FUNCTIONS
   Make dynamically generated buttons accessible.
   ========================================================= */

window.showOverview = showOverview;
window.showAssessmentStructure =
    showAssessmentStructure;
window.showCreateAssessment =
    showCreateAssessment;
window.viewAssessment =
    viewAssessment;
window.showResults =
    showResults;
window.viewResult =
    viewResult;
window.showStudents =
    showStudents;
window.showParents =
    showParents;
window.showSchoolFees =
    showSchoolFees;
window.showNotifications =
    showNotifications;
window.openSchoolModal =
    openSchoolModal;
window.closeSchoolModal =
    closeSchoolModal;
