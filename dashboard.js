"use strict";

// ============================================================
// CONFIGURATION
// ============================================================

const API_BASE_URL = "https://edutrust-15ii.onrender.com/api";

// ============================================================
// DOM ELEMENTS
// ============================================================

const sidebar = document.getElementById("sidebar");
const menuToggle = document.getElementById("menu-toggle");
const logoutButton = document.getElementById("logoutButton");
const themeToggle = document.getElementById("theme-toggle");
const notificationButton = document.getElementById("notification-button");
const notificationDropdown = document.getElementById("notification-dropdown");
const toast = document.getElementById("toast");

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

async function apiRequest(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
                ...(options.headers || {})
            }
        });

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
            throw new Error(data.message || "Request failed.");
        }

        return data;
    } catch (error) {
        console.error(`API Request Error [${endpoint}]:`, error);
        throw error;
    }
}

// ============================================================
// SCHOOL & USER STATE
// ============================================================

let currentSchool = null;
let currentUser = null;

// ============================================================
// LOAD & RENDER PROFILE
// ============================================================

async function loadProfile() {
    try {
        const data = await apiRequest("/auth/profile");

        if (data.success || data.user) {
            currentUser = data.user || null;
            currentSchool = data.school || null;
            renderProfile();
            populateSchoolForm();
        }
    } catch (error) {
        showToast(error.message || "Unable to load profile details.", "error");
    }
}

function renderProfile() {
    if (!currentSchool && !currentUser) return;

    const schoolName = currentSchool?.name || "School Overview";
    const userRole = currentUser?.role || "Administrator";

    updateElementText("sidebarSchoolName", schoolName);
    updateElementText("sidebarUserRole", userRole);

    const schoolAvatar = document.getElementById("schoolAvatar");
    if (schoolAvatar) {
        schoolAvatar.textContent = getInitials(schoolName);
    }
}

function getInitials(name) {
    return String(name || "School")
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(word => word.charAt(0).toUpperCase())
        .join("");
}

function populateSchoolForm() {
    if (!currentSchool) return;

    setValue("schoolName", currentSchool.name);
    setValue("schoolCode", currentSchool.school_code);
    setValue("schoolPhone", currentSchool.phone);
    setValue("schoolEmail", currentSchool.email);
    setValue("schoolType", currentSchool.school_type);
    setValue("schoolAddress", currentSchool.address);
    setValue("academicSession", currentSchool.academic_session);
    setValue("currentTerm", currentSchool.current_term);
    setValue("schoolMotto", currentSchool.motto);
    setValue("schoolWebsite", currentSchool.website);

    const principalInput = document.getElementById("schoolPrincipal");
    if (principalInput) {
        principalInput.value = currentUser?.full_name || currentUser?.name || "Principal";
    }
}

function setValue(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.value = value || "";
    }
}

function updateElementText(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

// ============================================================
// NAVIGATION SYSTEM
// ============================================================

function showPage(page) {
    document.querySelectorAll(".page-content").forEach(element => {
        element.classList.add("hidden");
    });

    const pageElement = document.getElementById(`${page}Page`);
    if (pageElement) {
        pageElement.classList.remove("hidden");
    }

    document.querySelectorAll(".nav-item[data-page], .submenu-item[data-page]").forEach(button => {
        button.classList.remove("active");
        if (button.dataset.page === page) {
            button.classList.add("active");
        }
    });

    if (window.innerWidth <= 768 && sidebar) {
        sidebar.classList.remove("open");
    }

    window.scrollTo({ top: 0, behavior: "smooth" });

    // Execute section specific loading handlers
    switch (page) {
        case "overview":
            loadOverviewData();
            break;
        case "students":
            loadStudents();
            break;
        case "parents":
            loadParents();
            break;
        case "staff":
            loadStaff();
            break;
        case "fees":
            loadFees();
            break;
        case "fee-structures":
            loadFeeStructures();
            break;
        case "payments":
            loadPayments();
            break;
        case "outstanding":
            loadOutstandingFees();
            break;
        case "announcements":
            loadAnnouncements();
            break;
        case "messages":
            loadMessages();
            break;
        case "notifications":
            loadNotifications();
            break;
    }
}

// Global Nav Handler Click Registration
document.addEventListener("click", function(e) {
    const btn = e.target.closest("[data-page]");
    if (btn) {
        const page = btn.dataset.page;
        if (page) {
            showPage(page);
        }
    }
});

// ============================================================
// OVERVIEW METRICS & LIVE DATA
// ============================================================

async function loadOverviewData() {
    try {
        const data = await apiRequest("/dashboard/overview-stats");
        
        if (data) {
            updateElementText("totalStudents", data.totalStudents || "0");
            updateElementText("feesCollected", data.feesCollected || "₦0");
            updateElementText("outstandingFees", data.outstandingFees || "₦0");
            updateElementText("totalParents", data.totalParents || "0");

            if (data.outstandingStudentsCount !== undefined) {
                updateElementText("outstandingStudents", `${data.outstandingStudentsCount} students with balances`);
            }

            if (data.collectionPercentage) {
                updateElementText("collectionPercentage", `${data.collectionPercentage}%`);
            }
            if (data.feesCollected) {
                updateElementText("collectionCollected", data.feesCollected);
            }
            if (data.outstandingFees) {
                updateElementText("collectionOutstanding", data.outstandingFees);
            }
        }
    } catch (e) {
        console.warn("Using active data states for overview metrics.");
    }

    loadRecentPayments();
}

async function loadRecentPayments() {
    const table = document.getElementById("recentPaymentsTable");
    if (!table) return;

    try {
        const data = await apiRequest("/payments/recent");
        const payments = data.payments || [];

        if (!payments.length) {
            table.innerHTML = `<tr><td colspan="4">No payment records available.</td></tr>`;
            return;
        }

        table.innerHTML = payments.map(p => `
            <tr>
                <td>${escapeHtml(p.parentName || p.parent || "N/A")}</td>
                <td>${escapeHtml(p.studentName || p.student || "N/A")}</td>
                <td>${escapeHtml(p.amount || "₦0")}</td>
                <td><span class="status ${getStatusClass(p.status)}">${escapeHtml(p.status || "Paid")}</span></td>
            </tr>
        `).join("");
    } catch (e) {
        table.innerHTML = `<tr><td colspan="4">No recent payment records found.</td></tr>`;
    }
}

// ============================================================
// STUDENTS DATA
// ============================================================

async function loadStudents() {
    const table = document.getElementById("studentsTable");
    if (!table) return;

    try {
        const data = await apiRequest("/students");
        const students = data.students || [];

        if (!students.length) {
            table.innerHTML = `<tr><td colspan="5">No students found.</td></tr>`;
            updateElementText("totalStudents", "0");
            return;
        }

        updateElementText("totalStudents", students.length.toLocaleString());

        table.innerHTML = students.map(student => {
            const fullName = [student.first_name || student.firstName, student.other_name, student.last_name || student.lastName]
                .filter(Boolean)
                .join(" ");

            return `
                <tr>
                    <td>${escapeHtml(student.admission_number || student.admissionNo || "N/A")}</td>
                    <td>${escapeHtml(fullName || "Unnamed Student")}</td>
                    <td>${escapeHtml(student.gender || "N/A")}</td>
                    <td>${escapeHtml(student.class_name || student.class || "N/A")}</td>
                    <td>
                        <span class="status ${getStatusClass(student.status)}">
                            ${escapeHtml(student.status || "Active")}
                        </span>
                    </td>
                </tr>
            `;
        }).join("");
    } catch (error) {
        table.innerHTML = `<tr><td colspan="5">Unable to load students from server.</td></tr>`;
    }
}

// ============================================================
// PARENTS DATA
// ============================================================

async function loadParents() {
    const table = document.getElementById("parentsTable");
    if (!table) return;

    try {
        const data = await apiRequest("/parents");
        const parents = data.parents || [];

        updateElementText("totalParents", parents.length.toLocaleString());

        if (!parents.length) {
            table.innerHTML = `<tr><td colspan="5">No parents found.</td></tr>`;
            return;
        }

        table.innerHTML = parents.map(parent => {
            const fullName = [parent.first_name || parent.firstName, parent.other_name, parent.last_name || parent.lastName]
                .filter(Boolean)
                .join(" ");

            return `
                <tr>
                    <td>${escapeHtml(fullName || parent.name || "N/A")}</td>
                    <td>${escapeHtml(parent.relationship || "Parent")}</td>
                    <td>${escapeHtml(parent.phone || "N/A")}</td>
                    <td>${escapeHtml(parent.email || "N/A")}</td>
                    <td>
                        <span class="status ${getStatusClass(parent.status)}">
                            ${escapeHtml(parent.status || "Active")}
                        </span>
                    </td>
                </tr>
            `;
        }).join("");
    } catch (error) {
        table.innerHTML = `<tr><td colspan="5">Unable to load parents.</td></tr>`;
    }
}

// ============================================================
// STAFF DATA
// ============================================================

async function loadStaff() {
    const table = document.getElementById("staffTable");
    if (!table) return;

    try {
        const data = await apiRequest("/staff");
        const staffList = data.staff || [];

        if (!staffList.length) {
            table.innerHTML = `<tr><td colspan="5">No staff records found.</td></tr>`;
            return;
        }

        table.innerHTML = staffList.map(member => `
            <tr>
                <td>${escapeHtml(member.name || member.full_name || "N/A")}</td>
                <td>${escapeHtml(member.role || "Teacher")}</td>
                <td>${escapeHtml(member.email || "N/A")}</td>
                <td>${escapeHtml(member.phone || "N/A")}</td>
                <td><span class="status ${getStatusClass(member.status)}">${escapeHtml(member.status || "Active")}</span></td>
            </tr>
        `).join("");
    } catch (e) {
        table.innerHTML = `<tr><td colspan="5">Unable to load staff directory.</td></tr>`;
    }
}

// ============================================================
// SCHOOL FEES & FEE STRUCTURES
// ============================================================

async function loadFees() {
    const table = document.getElementById("feesTable");
    if (!table) return;

    try {
        const data = await apiRequest("/fees");
        const fees = data.fees || [];

        if (!fees.length) {
            table.innerHTML = `<tr><td colspan="5">No fee records recorded.</td></tr>`;
            return;
        }

        table.innerHTML = fees.map(f => `
            <tr>
                <td>${escapeHtml(f.studentName || "N/A")}</td>
                <td>${escapeHtml(f.class || "N/A")}</td>
                <td>${escapeHtml(f.expectedAmount || "₦0")}</td>
                <td>${escapeHtml(f.paidAmount || "₦0")}</td>
                <td><span class="status ${getStatusClass(f.status)}">${escapeHtml(f.status || "Pending")}</span></td>
            </tr>
        `).join("");
    } catch (e) {
        table.innerHTML = `<tr><td colspan="5">Unable to load fee collections.</td></tr>`;
    }
}

async function loadFeeStructures() {
    const table = document.getElementById("feeStructuresTable");
    if (!table) return;

    try {
        const data = await apiRequest("/fees/structures");
        const structures = data.structures || [];

        if (!structures.length) {
            table.innerHTML = `<tr><td colspan="5">No fee structures defined yet.</td></tr>`;
            return;
        }

        table.innerHTML = structures.map(s => `
            <tr>
                <td>${escapeHtml(s.name || "Standard Fee")}</td>
                <td>${escapeHtml(s.classes || s.class || "All Classes")}</td>
                <td>${escapeHtml(s.term || "Current Term")}</td>
                <td>${escapeHtml(s.amount || "₦0")}</td>
                <td><span class="status ${getStatusClass(s.status)}">${escapeHtml(s.status || "Active")}</span></td>
            </tr>
        `).join("");
    } catch (e) {
        table.innerHTML = `<tr><td colspan="5">Unable to fetch fee structures.</td></tr>`;
    }
}

// ============================================================
// PAYMENTS & OUTSTANDING
// ============================================================

async function loadPayments() {
    const table = document.getElementById("paymentsTable");
    if (!table) return;

    try {
        const data = await apiRequest("/payments/parent-payments");
        const payments = data.payments || [];

        if (!payments.length) {
            table.innerHTML = `<tr><td colspan="5">No parent payment records available.</td></tr>`;
            return;
        }

        table.innerHTML = payments.map(p => `
            <tr>
                <td>${escapeHtml(p.parentName || "N/A")}</td>
                <td>${escapeHtml(p.studentName || "N/A")}</td>
                <td>${escapeHtml(p.amount || "₦0")}</td>
                <td>${escapeHtml(p.date || "N/A")}</td>
                <td><span class="status ${getStatusClass(p.status)}">${escapeHtml(p.status || "Paid")}</span></td>
            </tr>
        `).join("");
    } catch (e) {
        table.innerHTML = `<tr><td colspan="5">Unable to load payment history.</td></tr>`;
    }
}

async function loadOutstandingFees() {
    const table = document.getElementById("outstandingTable");
    if (!table) return;

    try {
        const data = await apiRequest("/fees/outstanding");
        const list = data.outstanding || [];

        if (!list.length) {
            table.innerHTML = `<tr><td colspan="6">No outstanding balance records found.</td></tr>`;
            return;
        }

        table.innerHTML = list.map(item => `
            <tr>
                <td>${escapeHtml(item.studentName || "N/A")}</td>
                <td>${escapeHtml(item.parentName || "N/A")}</td>
                <td>${escapeHtml(item.class || "N/A")}</td>
                <td>${escapeHtml(item.totalFee || "₦0")}</td>
                <td>${escapeHtml(item.balance || "₦0")}</td>
                <td><span class="status warning">${escapeHtml(item.status || "Unpaid")}</span></td>
            </tr>
        `).join("");
    } catch (e) {
        table.innerHTML = `<tr><td colspan="6">Unable to load outstanding records.</td></tr>`;
    }
}

// ============================================================
// ANNOUNCEMENTS, MESSAGES & NOTIFICATIONS
// ============================================================

async function loadAnnouncements() {
    const container = document.getElementById("announcementsListContainer");
    if (!container) return;

    try {
        const data = await apiRequest("/announcements");
        const list = data.announcements || [];

        if (!list.length) {
            container.innerHTML = `<p>No announcements available at this time.</p>`;
            return;
        }

        container.innerHTML = list.map(a => `
            <div class="announcement-item" style="padding: 12px 0; border-bottom: 1px solid #eee;">
                <h4>${escapeHtml(a.title)}</h4>
                <p>${escapeHtml(a.content)}</p>
                <small>${escapeHtml(a.meta || a.date || "")}</small>
            </div>
        `).join("");
    } catch (e) {
        container.innerHTML = `<p>No active announcements.</p>`;
    }
}

async function loadMessages() {
    const container = document.getElementById("messagesListContainer");
    if (!container) return;

    try {
        const data = await apiRequest("/messages");
        const messages = data.messages || [];

        if (!messages.length) {
            container.innerHTML = `<p>No message history found.</p>`;
            return;
        }

        container.innerHTML = messages.map(m => `
            <div class="message-item" style="padding: 12px 0; border-bottom: 1px solid #eee;">
                <strong>${escapeHtml(m.senderName || m.sender)}</strong>
                <p>${escapeHtml(m.text || m.content)}</p>
                <small>${escapeHtml(m.time || "")}</small>
            </div>
        `).join("");
    } catch (e) {
        container.innerHTML = `<p>No messages found.</p>`;
    }
}

async function loadNotifications() {
    const container = document.getElementById("notificationsPageList");
    if (!container) return;

    try {
        const data = await apiRequest("/notifications");
        const list = data.notifications || [];

        if (!list.length) {
            container.innerHTML = `<p>You have no notifications.</p>`;
            return;
        }

        container.innerHTML = list.map(n => `
            <div class="notification-item" style="padding: 12px 0; border-bottom: 1px solid #eee;">
                <h4>${escapeHtml(n.title)}</h4>
                <p>${escapeHtml(n.message)}</p>
                <small>${escapeHtml(n.timeAgo || n.date || "")}</small>
            </div>
        `).join("");
    } catch (e) {
        container.innerHTML = `<p>No notifications available.</p>`;
    }
}

// ============================================================
// SCHOOL PROFILE FORM SUBMISSION
// ============================================================

const schoolForm = document.getElementById("schoolForm");

if (schoolForm) {
    schoolForm.addEventListener("submit", async event => {
        event.preventDefault();

        if (!currentSchool?._id) {
            showToast("School ID is missing. Please reload page.", "error");
            return;
        }

        const saveButton = document.getElementById("saveSchoolButton");

        const payload = {
            name: document.getElementById("schoolName")?.value.trim(),
            phone: document.getElementById("schoolPhone")?.value.trim(),
            email: document.getElementById("schoolEmail")?.value.trim().toLowerCase(),
            address: document.getElementById("schoolAddress")?.value.trim(),
            school_type: document.getElementById("schoolType")?.value.trim(),
            academic_session: document.getElementById("academicSession")?.value.trim(),
            current_term: document.getElementById("currentTerm")?.value,
            motto: document.getElementById("schoolMotto")?.value.trim(),
            website: document.getElementById("schoolWebsite")?.value.trim()
        };

        try {
            if (saveButton) {
                saveButton.disabled = true;
                saveButton.textContent = "Saving...";
            }

            const data = await apiRequest(`/schools/${currentSchool._id}`, {
                method: "PUT",
                body: JSON.stringify(payload)
            });

            if (!data.success && !data.school) {
                throw new Error(data.message || "Failed to update school profile.");
            }

            currentSchool = data.school || { ...currentSchool, ...payload };
            renderProfile();
            populateSchoolForm();
            showToast("School profile updated successfully!");
        } catch (error) {
            showToast(error.message || "Failed to update school.", "error");
        } finally {
            if (saveButton) {
                saveButton.disabled = false;
                saveButton.textContent = "Save School Profile";
            }
        }
    });
}

// ============================================================
// ADD STUDENT MODAL & FORM
// ============================================================

const addStudentButton = document.getElementById("add-student-button");
const studentModal = document.getElementById("student-modal");
const closeStudentModal = document.getElementById("close-student-modal");
const cancelStudentModal = document.getElementById("cancel-student-modal");
const studentForm = document.getElementById("student-form");

if (addStudentButton && studentModal) {
    addStudentButton.addEventListener("click", () => {
        studentModal.style.display = "flex";
    });
}

if (closeStudentModal && studentModal) {
    closeStudentModal.addEventListener("click", () => {
        studentModal.style.display = "none";
    });
}

if (cancelStudentModal && studentModal) {
    cancelStudentModal.addEventListener("click", () => {
        studentModal.style.display = "none";
    });
}

if (studentForm) {
    studentForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const payload = {
            first_name: document.getElementById("student-first-name").value.trim(),
            last_name: document.getElementById("student-last-name").value.trim(),
            gender: document.getElementById("student-gender").value,
            class_name: document.getElementById("student-class").value,
            email: document.getElementById("student-email").value.trim(),
            phone: document.getElementById("student-phone").value.trim()
        };

        try {
            const response = await apiRequest('/students', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            showToast("Student added successfully!");
            studentForm.reset();
            if (studentModal) studentModal.style.display = "none";
            loadStudents();
        } catch (error) {
            showToast(error.message || "Failed to add student.", "error");
        }
    });
}

// ============================================================
// UTILITIES & HELPERS
// ============================================================

function getStatusClass(status) {
    switch (String(status || "").toLowerCase()) {
        case "active":
        case "paid":
        case "published":
            return "paid";
        case "pending":
        case "partial":
        case "draft":
            return "pending";
        case "suspended":
        case "inactive":
        case "unpaid":
        case "warning":
            return "warning";
        default:
            return "paid";
    }
}

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function showToast(message, type = "success") {
    if (!toast) {
        alert(message);
        return;
    }
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3500);
}

// UI Toggles & Dropdowns
const reportsToggle = document.querySelector(".reports-toggle");
if (reportsToggle) {
    reportsToggle.addEventListener("click", () => {
        reportsToggle.closest(".nav-group")?.classList.toggle("open");
    });
}

const settingsToggle = document.querySelector(".settings-toggle");
if (settingsToggle) {
    settingsToggle.addEventListener("click", () => {
        settingsToggle.closest(".nav-group")?.classList.toggle("open");
    });
}

if (menuToggle && sidebar) {
    menuToggle.addEventListener("click", () => {
        sidebar.classList.toggle("open");
    });
}

if (notificationButton && notificationDropdown) {
    notificationButton.addEventListener("click", (e) => {
        e.stopPropagation();
        notificationDropdown.classList.toggle("show");
    });

    document.addEventListener("click", (e) => {
        if (!notificationDropdown.contains(e.target) && !notificationButton.contains(e.target)) {
            notificationDropdown.classList.remove("show");
        }
    });
}

if (themeToggle) {
    const savedTheme = localStorage.getItem("edutrust_theme");
    if (savedTheme === "dark") {
        document.body.classList.add("dark-mode");
        themeToggle.textContent = "☀️";
    }

    themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
        const dark = document.body.classList.contains("dark-mode");
        localStorage.setItem("edutrust_theme", dark ? "dark" : "light");
        themeToggle.textContent = dark ? "☀️" : "🌙";
    });
}

if (logoutButton) {
    logoutButton.addEventListener("click", () => {
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        window.location.href = "login.html";
    });
}

// ============================================================
// INITIALIZATION
// ============================================================

async function initializeDashboard() {
    await loadProfile();
    await loadOverviewData();
}

initializeDashboard();
