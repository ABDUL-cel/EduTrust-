/* ================================
   DOM ELEMENTS & INITIAL SETUP
================================ */
const navItems = document.querySelectorAll(
    ".nav-item[data-page], .submenu-item[data-page]"
);
const contentArea = document.getElementById("contentArea");
const sidebar = document.querySelector(".sidebar");
const menuToggle = document.getElementById("menu-toggle");
const notificationButton = document.getElementById("notification-button");
const notificationDropdown = document.getElementById("notification-dropdown");

/* ================================
   MAIN NAVIGATION
================================ */
navItems.forEach(function (item) {
    item.addEventListener("click", function () {
        const page = item.getAttribute("data-page");

        navItems.forEach(function (nav) {
            nav.classList.remove("active");
        });

        item.classList.add("active");

        if (page === "overview") {
            showOverview();
        } else if (page === "school") {
            showSchoolManagement();
        } else if (page === "classes") {
            showClasses();
        } else if (page === "sessions") {
            showAcademicSessions();
        } else if (page === "fees") {
            showSchoolFees();
        } else if (page === "fee-structures") {
            showFeeStructures();
        } else if (page === "payments") {
            showParentPayments();
        } else if (page === "outstanding") {
            showOutstandingFees();
        } else if (page === "students") {
            showStudents();
        } else if (page === "parents") {
            showParents();
        } else if (page === "staff") {
            showStaff();
        } else if (page === "announcements") {
            showAnnouncements();
        } else if (page === "messages") {
            showMessages();
        } else if (page === "notifications") {
            showNotifications();
        } else if (page === "school-profile") {
            showSchoolProfile();
        } else if (page === "user-roles") {
            showUserRoles();
        } else if (page === "payment-settings") {
            showPaymentSettings();
        } else if (page === "security") {
            showSecurity();
        } else if (page === "email-settings") {
            showEmailSettings();
        } else if (page === "backup") {
            showBackup();
        } else {
            showComingSoon(item.textContent.trim());
        }

        if (window.innerWidth <= 768 && sidebar) {
            sidebar.classList.remove("show");
        }
    });
});

/* ================================
   REPORTS DROPDOWN
================================ */
const reportsToggle = document.querySelector(".reports-toggle");
if (reportsToggle) {
    const reportsGroup = reportsToggle.closest(".nav-group");
    reportsToggle.addEventListener("click", function () {
        reportsGroup.classList.toggle("open");
    });
}

/* ================================
   SETTINGS DROPDOWN
================================ */
const settingsToggle = document.querySelector(".settings-toggle");
if (settingsToggle) {
    const settingsGroup = settingsToggle.closest(".nav-group");
    settingsToggle.addEventListener("click", function () {
        settingsGroup.classList.toggle("open");
    });
}

/* ================================
   NOTIFICATIONS
================================ */
if (notificationButton && notificationDropdown) {
    notificationButton.addEventListener("click", function (event) {
        event.stopPropagation();
        notificationDropdown.classList.toggle("show");
    });

    document.addEventListener("click", function () {
        notificationDropdown.classList.remove("show");
    });
}

/* ================================
   SIDEBAR MENU
================================ */
if (menuToggle && sidebar) {
    menuToggle.addEventListener("click", function () {
        if (window.innerWidth <= 768) {
            sidebar.classList.toggle("show");
        } else {
            sidebar.classList.toggle("collapsed");
        }
    });
}

/* ================================
   SETTINGS PAGES
================================ */

function showSchoolProfile() {
    contentArea.innerHTML = `
        <div class="page-header">
            <h1>School Profile</h1>
            <p>Manage your school's information and profile details.</p>
        </div>
        <div class="content-card">
            <h2>School Information</h2>
            <form class="settings-form">
                <div class="form-group">
                    <label>School Name</label>
                    <input type="text" placeholder="Enter school name">
                </div>
                <div class="form-group">
                    <label>School Email</label>
                    <input type="email" placeholder="school@example.com">
                </div>
                <div class="form-group">
                    <label>School Phone</label>
                    <input type="tel" placeholder="08012345678">
                </div>
                <div class="form-group">
                    <label>School Address</label>
                    <textarea placeholder="Enter school address"></textarea>
                </div>
                <button type="button" class="primary-button">Save Changes</button>
            </form>
        </div>
    `;
}

function showUserRoles() {
    contentArea.innerHTML = `
        <div class="page-header">
            <h1>User Roles</h1>
            <p>Manage administrators, staff, teachers and access permissions.</p>
        </div>
        <div class="content-card">
            <div class="section-heading">
                <h2>System Users</h2>
                <button class="primary-button">+ Add User</button>
            </div>
            <div class="user-role-list">
                <div class="role-item">
                    <div>
                        <strong>Administrator</strong>
                        <p>Full access to the EduTrust system</p>
                    </div>
                    <span class="role-badge">Full Access</span>
                </div>
                <div class="role-item">
                    <div>
                        <strong>Teacher</strong>
                        <p>Access to students and academic records</p>
                    </div>
                    <span class="role-badge">Limited Access</span>
                </div>
                <div class="role-item">
                    <div>
                        <strong>Accountant</strong>
                        <p>Access to school fees and payment records</p>
                    </div>
                    <span class="role-badge">Finance Access</span>
                </div>
            </div>
        </div>
    `;
}

function showPaymentSettings() {
    contentArea.innerHTML = `
        <div class="page-header">
            <h1>Payment Settings</h1>
            <p>Configure how your school receives and manages payments.</p>
        </div>
        <div class="content-card">
            <h2>Payment Configuration</h2>
            <div class="settings-option">
                <div>
                    <strong>Online Payments</strong>
                    <p>Allow parents to pay school fees online.</p>
                </div>
                <label class="switch">
                    <input type="checkbox">
                    <span class="slider"></span>
                </label>
            </div>
            <div class="settings-option">
                <div>
                    <strong>Payment Notifications</strong>
                    <p>Receive notifications when payments are made.</p>
                </div>
                <label class="switch">
                    <input type="checkbox">
                    <span class="slider"></span>
                </label>
            </div>
        </div>
    `;
}

function showSecurity() {
    contentArea.innerHTML = `
        <div class="page-header">
            <h1>Security</h1>
            <p>Manage your account security and password settings.</p>
        </div>
        <div class="content-card">
            <h2>Security Settings</h2>
            <div class="settings-option">
                <div>
                    <strong>Two-Factor Authentication</strong>
                    <p>Add an extra layer of security to your account.</p>
                </div>
                <label class="switch">
                    <input type="checkbox">
                    <span class="slider"></span>
                </label>
            </div>
            <button type="button" class="primary-button">Change Password</button>
        </div>
    `;
}

function showEmailSettings() {
    contentArea.innerHTML = `
        <div class="page-header">
            <h1>Email Settings</h1>
            <p>Manage school email notifications and communication preferences.</p>
        </div>
        <div class="content-card">
            <h2>Email Notifications</h2>
            <div class="settings-option">
                <div>
                    <strong>Payment Notifications</strong>
                    <p>Send email alerts when payments are received.</p>
                </div>
                <input type="checkbox">
            </div>
            <div class="settings-option">
                <div>
                    <strong>New Student Notifications</strong>
                    <p>Receive alerts when a new student is registered.</p>
                </div>
                <input type="checkbox">
            </div>
        </div>
    `;
}

function showBackup() {
    contentArea.innerHTML = `
        <div class="page-header">
            <h1>Backup</h1>
            <p>Protect your school's important information.</p>
        </div>
        <div class="content-card">
            <h2>Data Backup</h2>
            <p>Create a backup of your school records and important data.</p>
            <button type="button" class="primary-button">Create Backup</button>
        </div>
    `;
}

function showNotifications() {
    contentArea.innerHTML = `
        <div class="page-content">
            <div class="page-introduction">
                <div>
                    <h2>Notifications</h2>
                    <p>Stay updated with important activities across your school.</p>
                </div>
                <button class="text-button">Mark All As Read</button>
            </div>
            <div class="stats-grid">
                <div class="stat-card">
                    <p>Total Notifications</p>
                    <h3>248</h3>
                    <small>All recent activities</small>
                </div>
                <div class="stat-card">
                    <p>Unread</p>
                    <h3>12</h3>
                    <small>Require attention</small>
                </div>
                <div class="stat-card">
                    <p>Payments</p>
                    <h3>86</h3>
                    <small>Payment updates</small>
                </div>
                <div class="stat-card">
                    <p>System Updates</p>
                    <h3>24</h3>
                    <small>Recent system activities</small>
                </div>
            </div>
            <div class="dashboard-card">
                <div class="card-header">
                    <div>
                        <h3>Recent Notifications</h3>
                        <p>Your latest system and school activities.</p>
                    </div>
                </div>
                <div class="notification-list">
                    <div class="notification-item unread">
                        <div class="notification-icon payment">💰</div>
                        <div class="notification-content">
                            <h4>Payment Received</h4>
                            <p>Amina Yusuf completed a school fee payment of ₦150,000.</p>
                            <small>10 minutes ago</small>
                        </div>
                    </div>
                    <div class="notification-item unread">
                        <div class="notification-icon announcement">📢</div>
                        <div class="notification-content">
                            <h4>New Announcement Published</h4>
                            <p>First Term Examination Schedule was published successfully.</p>
                            <small>2 hours ago</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function showMessages() {
    contentArea.innerHTML = `
        <div class="page-content">
            <div class="page-introduction">
                <div>
                    <h2>Messages</h2>
                    <p>Communicate directly with parents, staff, and students.</p>
                </div>
                <button class="primary-button">+ Compose Message</button>
            </div>
            <div class="stats-grid">
                <div class="stat-card">
                    <p>Total Messages</p>
                    <h3>248</h3>
                </div>
                <div class="stat-card">
                    <p>Unread Messages</p>
                    <h3>12</h3>
                </div>
            </div>
        </div>
    `;
}

function showAnnouncements() {
    contentArea.innerHTML = `
        <div class="page-content">
            <div class="page-introduction">
                <div>
                    <h2>Announcements</h2>
                    <p>Share important updates and information with your school community.</p>
                </div>
                <button class="primary-button">+ Create Announcement</button>
            </div>
            <div class="stats-grid">
                <div class="stat-card">
                    <p>Total Announcements</p>
                    <h3>24</h3>
                </div>
            </div>
        </div>
    `;
}

function showParents() {
    contentArea.innerHTML = `
        <div class="page-content">
            <div class="page-introduction">
                <div>
                    <h2>Parents & Guardians</h2>
                    <p>Manage parents and guardians connected to students.</p>
                </div>
                <button class="primary-button">+ Add Parent</button>
            </div>
            <div class="stats-grid">
                <div class="stat-card">
                    <p>Total Parents</p>
                    <h3>1,020</h3>
                </div>
            </div>
        </div>
    `;
}

function showStaff() {
    contentArea.innerHTML = `
        <div class="page-content">
            <div class="page-introduction">
                <div>
                    <h2>Staff & Teachers</h2>
                    <p>Manage teachers, administrators, and other school staff.</p>
                </div>
                <button class="primary-button">+ Add Staff Member</button>
            </div>
            <div class="stats-grid">
                <div class="stat-card">
                    <p>Total Staff</p>
                    <h3>86</h3>
                </div>
            </div>
        </div>
    `;
}

function showStudents() {
    contentArea.innerHTML = `
        <div class="page-header">
            <div>
                <h1>Students</h1>
                <p>Manage all students registered in your school.</p>
            </div>
            <button class="primary-button" id="add-student-button">+ Add Student</button>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <span class="stat-icon">👨‍🎓</span>
                <div>
                    <p>Total Students</p>
                    <h2>1,248</h2>
                </div>
            </div>
        </div>

        <!-- ADD STUDENT MODAL -->
        <div class="student-modal" id="student-modal" style="display: none;">
            <div class="student-modal-content">
                <div class="modal-header">
                    <h2>Add New Student</h2>
                    <button type="button" class="close-modal" id="close-student-modal">&times;</button>
                </div>
                <form id="student-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="student-first-name">First Name</label>
                            <input type="text" id="student-first-name" required>
                        </div>
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="cancel-button" id="cancel-student-modal">Cancel</button>
                        <button type="submit" class="primary-button">Add Student</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    // Attach student modal listeners dynamically after innerHTML assignment
    bindStudentModalEvents();
}

function bindStudentModalEvents() {
    const addStudentButton = document.getElementById("add-student-button");
    const studentModal = document.getElementById("student-modal");
    const closeStudentModal = document.getElementById("close-student-modal");
    const cancelStudentModal = document.getElementById("cancel-student-modal");
    const studentForm = document.getElementById("student-form");

    if (addStudentButton && studentModal) {
        addStudentButton.addEventListener("click", function () {
            studentModal.style.display = "flex";
        });
    }

    if (closeStudentModal && studentModal) {
        closeStudentModal.addEventListener("click", function () {
            studentModal.style.display = "none";
        });
    }

    if (cancelStudentModal && studentModal) {
        cancelStudentModal.addEventListener("click", function () {
            studentModal.style.display = "none";
        });
    }

    if (studentForm) {
        studentForm.addEventListener("submit", function (event) {
            event.preventDefault();
            alert("Student added successfully!");
            studentForm.reset();
            studentModal.style.display = "none";
        });
    }
}

function showOutstandingFees() {
    contentArea.innerHTML = `
        <div class="page-content">
            <div class="page-introduction">
                <div>
                    <h2>Outstanding Fees</h2>
                    <p>Monitor unpaid and partially paid school fees.</p>
                </div>
            </div>
        </div>
    `;
}

function showParentPayments() {
    contentArea.innerHTML = `
        <div class="page-content">
            <div class="page-introduction">
                <div>
                    <h2>Parent Payments</h2>
                    <p>View and monitor payments made by parents.</p>
                </div>
            </div>
        </div>
    `;
}

function showFeeStructures() {
    contentArea.innerHTML = `
        <div class="page-content">
            <div class="page-introduction">
                <div>
                    <h2>Fee Structures</h2>
                    <p>Create and manage fees for different classes and academic terms.</p>
                </div>
            </div>
        </div>
    `;
}

async function showOverview() {
    // 1. Keep your layout container and show a sleek loading state first
    contentArea.innerHTML = `
        <div class="page-content">
            <div class="page-introduction">
                <div>
                    <h2>School Overview</h2>
                    <p>Loading real-time data...</p>
                </div>
            </div>
        </div>
    `;

    try {
        // 2. Fetch live data from your backend
        const response = await fetch('/api/dashboard/overview-stats');
        const data = await response.json();

        // 3. Render your EXACT beautiful structure with live numbers inserted
        contentArea.innerHTML = `
            <div class="page-content">
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
                        <h3>${data.totalStudents.toLocaleString()}</h3>
                    </div>
                    <div class="stat-card">
                        <p>Fees Collected</p>
                        <h3>₦${data.feesCollected.toLocaleString()}</h3>
                    </div>
                    <div class="stat-card">
                        <p>Outstanding Fees</p>
                        <h3>₦${data.outstandingFees.toLocaleString()}</h3>
                    </div>
                    <div class="stat-card">
                        <p>Active Parents</p>
                        <h3>${data.activeParents.toLocaleString()}</h3>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error("Error fetching overview data:", error);
    }
}

function showSchoolManagement() {
    contentArea.innerHTML = `
        <div class="page-content">
            <div class="page-introduction">
                <div>
                    <h2>School Management</h2>
                    <p>Manage your school's basic information and details.</p>
                </div>
            </div>
        </div>
    `;
}

function showClasses() {
    contentArea.innerHTML = `
        <div class="page-content">
            <div class="page-introduction">
                <div>
                    <h2>Classes</h2>
                    <p>Manage your school's classes and class information.</p>
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
                    <p>Manage academic sessions and school terms.</p>
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
                    <h2>School Fee Management</h2>
                    <p>Create, manage, and monitor school fee payments.</p>
                </div>
            </div>
        </div>
    `;
}

function showComingSoon(pageName) {
    contentArea.innerHTML = `
        <div class="empty-page">
            <div class="empty-icon">🚧</div>
            <h2>${pageName}</h2>
            <p>This section will be built next.</p>
        </div>
    `;
}

/* ================================
   LOGOUT
================================ */
const logoutButton = document.getElementById("logoutButton");
if (logoutButton) {
    logoutButton.addEventListener("click", function () {
        window.location.href = "login.html";
    });
}
