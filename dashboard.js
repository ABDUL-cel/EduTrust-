"use strict";

/* ============================================================
   CONFIGURATION
============================================================ */
const API_BASE_URL = "https://edutrust-15ii.onrender.com/api";

/* ============================================================
   AUTHENTICATION
============================================================ */
const token = localStorage.getItem("token") || sessionStorage.getItem("token");

if (!token) {
    window.location.href = "login.html";
}

/* ============================================================
   API HELPER
============================================================ */
async function apiRequest(endpoint, options = {}) {
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
        throw new Error("Authentication expired. Please log in again.");
    }

    // Handle explicitly returned failed operations (e.g. { success: false })
    if (!response.ok || data.success === false) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data;
}

/* ============================================================
   DOM ELEMENTS
============================================================ */
const sidebar = document.getElementById("sidebar");
const menuToggle = document.getElementById("menu-toggle");
const logoutButton = document.getElementById("logoutButton");
const themeToggle = document.getElementById("theme-toggle");
const notificationButton = document.getElementById("notification-button");
const notificationDropdown = document.getElementById("notification-dropdown");
const toast = document.getElementById("toast");

/* ============================================================
   TOAST
============================================================ */
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
        const data = await apiRequest("/auth/profile");
        currentUser = data.user;
        currentSchool = data.school;

        renderProfile();
        populateSchoolForm();
    } catch (error) {
        console.error("LOAD PROFILE ERROR:", error);
        showToast(error.message || "Unable to load school profile.", "error");
    }
}

function renderProfile() {
    const schoolName = currentSchool?.name || "School";
    const userRole = currentUser?.role || "Administrator";

    const sidebarSchoolName = document.getElementById("sidebarSchoolName");
    const sidebarUserRole = document.getElementById("sidebarUserRole");
    const schoolAvatar = document.getElementById("schoolAvatar");

    if (sidebarSchoolName) sidebarSchoolName.textContent = schoolName;
    if (sidebarUserRole) sidebarUserRole.textContent = userRole;
    if (schoolAvatar) schoolAvatar.textContent = getInitials(schoolName);
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
        principalInput.value = currentUser?.full_name || "Principal";
    }
}

function setValue(id, value) {
    const element = document.getElementById(id);
    if (element) element.value = value ?? "";
}

/* ============================================================
   MAIN PAGE NAVIGATION
============================================================ */
const navItems = document.querySelectorAll(".nav-item[data-page], .submenu-item[data-page], .text-button[data-page]");
const pages = document.querySelectorAll(".page-content");

function showPage(pageName) {
    pages.forEach(page => {
        page.classList.add("hidden");
        page.style.display = "none";
    });

    const targetPage = document.getElementById(`${pageName}Page`);
    if (!targetPage) {
        console.error(`Main content page "${pageName}Page" was not found.`);
        showToast(`Page "${pageName}" is not available.`, "error");
        return;
    }

    targetPage.classList.remove("hidden");
    targetPage.style.display = "block";

    document.querySelectorAll(".nav-item[data-page], .submenu-item[data-page], .text-button[data-page]")
        .forEach(item => item.classList.remove("active"));

    document.querySelectorAll(`[data-page="${pageName}"]`)
        .forEach(item => item.classList.add("active"));

    switch (pageName) {
        case "overview":
            loadDashboardOverview();
            break;
        case "school":
        case "school-profile":
            loadSchoolPage();
            break;
        case "students":
            if (typeof window.loadStudents === "function") {
                window.loadStudents();
            }
            break;
        case "parents":
            loadParents();
            break;
        case "staff":
            loadStaff();
            break;
    }

    if (window.innerWidth <= 900 && sidebar) {
        sidebar.classList.remove("open");
    }
}

navItems.forEach(item => {
    item.addEventListener("click", function(event) {
        event.preventDefault();
        event.stopPropagation();
        const pageName = this.getAttribute("data-page");
        if (pageName) showPage(pageName);
    });
});

/* ============================================================
   STAFF & PARENTS & DASHBOARD
============================================================ */
async function loadStaff() {
    const table = document.querySelector("#staffPage tbody");
    if (!table) return;

    table.innerHTML = `<tr><td colspan="5" style="text-align:center;">Loading staff...</td></tr>`;

    try {
        const data = await apiRequest("/staff");
        const staff = Array.isArray(data) ? data : (data.staff || data.data || []);

        if (!staff.length) {
            table.innerHTML = `<tr><td colspan="5" style="text-align:center;">No staff or teachers registered yet.</td></tr>`;
            return;
        }

        table.innerHTML = staff.map(member => {
            const fullName = member.full_name || [member.first_name, member.last_name].filter(Boolean).join(" ") || "Unnamed";
            return `
                <tr>
                    <td>${escapeHtml(fullName)}</td>
                    <td>${escapeHtml(member.role || "Staff")}</td>
                    <td>${escapeHtml(member.email || "—")}</td>
                    <td>${escapeHtml(member.phone || "—")}</td>
                    <td><span class="status-badge ${String(member.status || "").toLowerCase()}">${escapeHtml(member.status || "Unknown")}</span></td>
                </tr>
            `;
        }).join("");
    } catch (error) {
        console.error("LOAD STAFF ERROR:", error);
        table.innerHTML = `<tr><td colspan="5" style="text-align:center; color: #d9534f;">Failed to load staff.</td></tr>`;
    }
}

async function loadParents() {
    const table = document.getElementById("parentsTable");
    if (!table) return;

    table.innerHTML = `<tr><td colspan="5" style="text-align:center;">Loading parents...</td></tr>`;

    try {
        const data = await apiRequest("/parents");
        const parents = Array.isArray(data) ? data : (data.parents || data.data || []);

        updateElement("totalParents", parents.length.toLocaleString());

        if (!parents.length) {
            table.innerHTML = `<tr><td colspan="5" style="text-align:center;">No parents found.</td></tr>`;
            return;
        }

        table.innerHTML = parents.map(parent => {
            const fullName = [parent.first_name, parent.other_name, parent.last_name].filter(Boolean).join(" ");
            return `
                <tr>
                    <td>${escapeHtml(fullName || "N/A")}</td>
                    <td>${escapeHtml(parent.relationship || "N/A")}</td>
                    <td>${escapeHtml(parent.phone || "N/A")}</td>
                    <td>${escapeHtml(parent.email || "N/A")}</td>
                    <td><span class="status ${getStatusClass(parent.status)}">${escapeHtml(parent.status || "Active")}</span></td>
                </tr>
            `;
        }).join("");
    } catch (error) {
        console.error("LOAD PARENTS ERROR:", error);
        table.innerHTML = `<tr><td colspan="5" style="text-align:center; color: #d9534f;">Unable to load parents.</td></tr>`;
    }
}

async function loadDashboardOverview() {
    const tasks = [loadParents()];
    if (typeof window.loadStudents === "function") {
        tasks.push(window.loadStudents());
    }
    await Promise.allSettled(tasks);
}

async function loadSchoolPage() {
    if (!currentSchool) await loadProfile();
}

function getStatusClass(status) {
    switch (String(status || "").toLowerCase()) {
        case "active":
        case "paid": return "paid";
        case "pending": return "pending";
        case "suspended":
        case "inactive": return "warning";
        default: return "";
    }
}

function updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
}

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/* ============================================================
   LOGOUT & INITIALIZATION
============================================================ */
if (logoutButton) {
    logoutButton.addEventListener("click", () => {
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        window.location.href = "login.html";
    });
}

async function initializeDashboard() {
    showPage("overview");
    await loadProfile();
}

initializeDashboard();
