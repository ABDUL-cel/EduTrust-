/* =========================================================
   EDUTRUST PRINCIPAL DASHBOARD - DASHBOARD.JS
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
    if (!contentArea) return;
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
    if (!contentArea) return;
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
const notificationDropdown = document.getElementById("notification-dropdown");


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
   OVERVIEW & PLACEHOLDERS
   ========================================================= */

function showOverview() {
    if (!contentArea) return;
    contentArea.innerHTML = `
        <div class="page-content" id="overviewPage">
            <div class="page-introduction">
                <div>
                    <h2>School Overview</h2>
                    <p>Here's what's happening in your school today.</p>
                </div>
                <button class="primary-button">+ Add Student</button>
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

function showComingSoon(pageName) {
    if (!contentArea) return;
    contentArea.innerHTML = `
        <div class="page-content">
            <div class="dashboard-card" style="text-align: center; padding: 3rem;">
                <h2>${escapeHtml(pageName)}</h2>
                <p style="margin-top: 1rem; color: #666;">This feature is currently under development.</p>
            </div>
        </div>
    `;
}


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

                    <div class="modal-actions" style="margin-top: 1.5rem;">

                        <button
                            type="button"
                            class="secondary-button"
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
        ?.addEventListener("submit", handleCreateAssessmentSubmit);
}


/* =========================================================
   SUBMIT CREATE ASSESSMENT FORM
   ========================================================= */

async function handleCreateAssessmentSubmit(e) {
    e.preventDefault();

    const payload = {
        title: document.getElementById("assessment-title").value,
        type: document.getElementById("assessment-type").value,
        class_name: document.getElementById("assessment-class").value,
        subject: document.getElementById("assessment-subject").value,
        session: document.getElementById("assessment-session").value,
        term: document.getElementById("assessment-term").value,
        total_marks: Number(document.getElementById("assessment-total-marks").value),
        status: document.getElementById("assessment-status").value
    };

    try {
        await apiRequest("/api/assessments", {
            method: "POST",
            body: payload
        });

        showAssessmentStructure();
    } catch (error) {
        alert("Error creating assessment: " + error.message);
    }
}


/* =========================================================
   VIEW ASSESSMENT DETAILS
   ========================================================= */

async function viewAssessment(id) {
    if (!id) return;
    showLoading("Fetching assessment details...");

    try {
        const data = await apiRequest(`/api/assessments/${id}`);
        const assessment = data.assessment || data.data || data;

        contentArea.innerHTML = `
            <div class="page-content">

                <div class="page-introduction">
                    <div>
                        <h2>${escapeHtml(assessment.title || "Assessment View")}</h2>
                        <p>Assessment Details</p>
                    </div>

                    <button
                        class="secondary-button"
                        onclick="showAssessmentStructure()"
                    >
                        ← Back to Assessments
                    </button>
                </div>

                <div class="dashboard-card">
                    <p><strong>Type:</strong> ${escapeHtml(assessment.type || "N/A")}</p>
                    <p><strong>Class:</strong> ${escapeHtml(assessment.class_name || assessment.className || "N/A")}</p>
                    <p><strong>Subject:</strong> ${escapeHtml(assessment.subject || "N/A")}</p>
                    <p><strong>Term:</strong> ${escapeHtml(assessment.term || "N/A")}</p>
                    <p><strong>Status:</strong> ${escapeHtml(assessment.status || "draft")}</p>
                    <p><strong>Total Marks:</strong> ${escapeHtml(assessment.total_marks || 100)}</p>
                </div>

            </div>
        `;
    } catch (error) {
        showError(error.message || "Failed to retrieve assessment details.");
    }
}
