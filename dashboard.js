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
                showParentsFromBackend();
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

            case "assessment":
            case "assessments":
            case "assessment-structure":
                showAssessmentStructure();
                break;

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
                                    item => item.status === "published"
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
                                    item => item.status === "draft"
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
                                                assessment.status === "published"
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
                                <option value="">Select type</option>
                                <option value="test">Test</option>
                                <option value="exam">Examination</option>
                                <option value="assignment">Assignment</option>
                                <option value="quiz">Quiz</option>
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
                                <option value="">Select term</option>
                                <option value="First Term">First Term</option>
                                <option value="Second Term">Second Term</option>
                                <option value="Third Term">Third Term</option>
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

                            <select id="assessment-status">
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
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
        ?.addEventListener("click", showAssessmentStructure);

    document
        .getElementById("cancel-assessment-btn")
        ?.addEventListener("click", showAssessmentStructure);

    document
        .getElementById("assessment-form")
        ?.addEventListener("submit", submitAssessment);
}


async function submitAssessment(event) {

    event.preventDefault();

    const submitButton = event.target.querySelector('button[type="submit"]');

    submitButton.disabled = true;
    submitButton.textContent = "Saving...";

    const payload = {
        title: document.getElementById("assessment-title").value.trim(),
        type: document.getElementById("assessment-type").value,
        class_name: document.getElementById("assessment-class").value.trim(),
        subject: document.getElementById("assessment-subject").value.trim(),
        academic_session: document.getElementById("assessment-session").value.trim(),
        term: document.getElementById("assessment-term").value,
        total_marks: Number(document.getElementById("assessment-total-marks").value),
        status: document.getElementById("assessment-status").value
    };

    try {

        await apiRequest("/api/assessments", {
            method: "POST",
            body: payload
        });

        alert("Assessment created successfully.");
        showAssessmentStructure();

    } catch (error) {

        alert(error.message || "Unable to create assessment.");
        submitButton.disabled = false;
        submitButton.textContent = "Save Assessment";
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

        const data = await apiRequest(`/api/assessments/${id}`);

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

                        <p>Assessment details</p>
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
                            ${escapeHtml(assessment.type || "N/A")}
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
                            ${escapeHtml(assessment.subject || "N/A")}
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
                            ${escapeHtml(assessment.term || "N/A")}
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
                            ${escapeHtml(assessment.status || "draft")}
                        </strong>
                    </div>

                </div>

            </div>
        `;

        document
            .getElementById("back-assessments")
            ?.addEventListener("click", showAssessmentStructure);

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

        const data = await apiRequest("/api/results");

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
                                    result => result.status === "published"
                                ).length
                            }
                        </h3>
                        <small>Available to parents/students</small>
                    </div>

                    <div class="stat-card">
                        <p>Pending Review</p>
                        <h3>
                            ${
                                results.filter(
                                    result => result.status !== "published"
                                ).length
                            }
                        </h3>
                        <small>Drafts or awaiting approval</small>
                    </div>

                </div>

                <div class="dashboard-card">

                    <div class="card-header">
                        <h3>Results List</h3>
                    </div>

                    <div class="table-responsive">

                        <table class="fee-table">

                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Class</th>
                                    <th>Subject</th>
                                    <th>Score</th>
                                    <th>Status</th>
                                </tr>
                            </thead>

                            <tbody>

                                ${
                                    results.length
                                        ? results
                                              .map(
                                                  res => `
                                    <tr>
                                        <td>${escapeHtml(res.student_name || "N/A")}</td>
                                        <td>${escapeHtml(res.class_name || "N/A")}</td>
                                        <td>${escapeHtml(res.subject || "N/A")}</td>
                                        <td>${escapeHtml(res.score ?? "N/A")}</td>
                                        <td>
                                            <span class="status ${
                                                res.status === "published"
                                                    ? "paid"
                                                    : "pending"
                                            }">
                                                ${escapeHtml(res.status || "draft")}
                                            </span>
                                        </td>
                                    </tr>
                                `
                                              )
                                              .join("")
                                        : `
                                    <tr>
                                        <td colspan="5" style="text-align:center; padding:2rem;">
                                            No results found.
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
            .getElementById("refresh-results-btn")
            ?.addEventListener("click", showResults);

    } catch (error) {

        showError(
            error.message ||
            "Unable to load student results."
        );
    }
}


/* =========================================================
   STUB & PLACEHOLDER FUNCTIONS
   ========================================================= */

function showOverview() {
    contentArea.innerHTML = `
        <div class="page-content">
            <h2>Overview</h2>
            <p>Welcome to the EduTrust Principal Dashboard.</p>
        </div>
    `;
}

function showSchoolManagement() { showComingSoon("School Management"); }
function showClasses() { showComingSoon("Classes"); }
function showAcademicSessions() { showComingSoon("Academic Sessions"); }
function showSchoolFees() { showComingSoon("School Fees"); }
function showParentPayments() { showComingSoon("Parent Payments"); }
function showOutstandingFees() { showComingSoon("Outstanding Fees"); }
function showStudents() { showComingSoon("Students"); }
function showParentsFromBackend() { showComingSoon("Parents"); }
function showStaff() { showComingSoon("Staff"); }
function showAnnouncements() { showComingSoon("Announcements"); }
function showMessages() { showComingSoon("Messages"); }
function showNotifications() { showComingSoon("Notifications"); }
function showSchoolProfile() { showComingSoon("School Profile"); }
function showUserRoles() { showComingSoon("User Roles"); }
function showPaymentSettings() { showComingSoon("Payment Settings"); }
function showSecurity() { showComingSoon("Security Settings"); }
function showEmailSettings() { showComingSoon("Email Settings"); }
function showBackup() { showComingSoon("Backup & Restore"); }

function showComingSoon(featureName) {
    contentArea.innerHTML = `
        <div class="page-content">
            <div class="dashboard-card">
                <div style="text-align:center; padding:3rem;">
                    <h3>${escapeHtml(featureName)}</h3>
                    <p>This module is currently under development.</p>
                </div>
            </div>
        </div>
    `;
}
