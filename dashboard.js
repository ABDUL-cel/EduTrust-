/* ================================
   AUTH & SESSION INITIALIZATION
================================ */
document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    // Load cached profile while fetching fresh user data
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
        try {
            const user = JSON.parse(storedUser);
            updateProfileUI(user);
        } catch (err) {
            console.error("Error parsing cached user details:", err);
        }
    }

    // Fetch fresh user profile from backend endpoint (/api/auth/profile)
    fetch("/api/auth/profile", {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
    .then(response => {
        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "login.html";
            return;
        }
        return response.json();
    })
    .then(data => {
        if (data && data.success && data.user) {
            localStorage.setItem("user", JSON.stringify(data.user));
            updateProfileUI(data.user);
        }
    })
    .catch(err => {
        console.error("Error fetching user profile:", err);
    });

    showOverview();
});

// Helper function to pull the latest user data securely
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

function updateProfileUI(user) {
    if (!user) return;

    // Update Sidebar Profile Info
    const userRoleElement = document.querySelector(".school-profile p");
    if (userRoleElement) {
        userRoleElement.textContent = user.role || "Administrator";
    }

    const userNameElement = document.querySelector(".school-profile h4");
    if (userNameElement) {
        userNameElement.textContent = user.school_name || user.full_name || "School Dashboard";
    }
}

/* ================================
   DOM ELEMENTS & NAVIGATION
================================ */
const navItems = document.querySelectorAll(".nav-item[data-page], .submenu-item[data-page]");
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

/* ================================
   FINANCE & FEES FUNCTIONS
================================ */
function showFeeStructure() {
    contentArea.innerHTML = `
    <div class="page-content">
        <div class="page-introduction">
            <div>
                <h2>Fee Structure</h2>
                <p>Create and manage fee structures for your school.</p>
            </div>
            <button class="primary-button">+ Add Fee</button>
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
                        <input type="text" placeholder="Tuition">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Amount</label>
                        <input type="number" placeholder="35000">
                    </div>
                    <div class="form-group">
                        <label>Category</label>
                        <select>
                            <option>Compulsory</option>
                            <option>Optional</option>
                        </select>
                    </div>
                </div>
                <button class="primary-button" type="button">Save Fee</button>
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
    </div>`;
}

function showCollectPayment() {
    contentArea.innerHTML = `
    <div class="page-content">
        <div class="page-introduction">
            <div>
                <h2>Collect School Fees</h2>
                <p>Search for a student and record fee payments.</p>
            </div>
        </div>
        <div class="dashboard-card">
            <div class="form-group">
                <label>Search Student</label>
                <input type="text" placeholder="Enter Student Name or Admission Number">
            </div>
            <button class="primary-button">🔍 Search</button>
        </div>
        <div class="dashboard-card">
            <h3>Student Information</h3>
            <br>
            <div class="detail-item"><span>Student Name</span><strong>Aisha Bello</strong></div>
            <div class="detail-item"><span>Admission No.</span><strong>PRY00125</strong></div>
            <div class="detail-item"><span>Class</span><strong>Primary 4</strong></div>
            <div class="detail-item"><span>Total Fee</span><strong>₦120,000</strong></div>
            <div class="detail-item"><span>Amount Paid</span><strong>₦70,000</strong></div>
            <div class="detail-item"><span>Outstanding Balance</span><strong style="color:red;">₦50,000</strong></div>
        </div>
        <div class="dashboard-card">
            <h3>Payment Details</h3>
            <br>
            <div class="form-group">
                <label>Amount Paying</label>
                <input type="number" placeholder="Enter Amount">
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
                <textarea placeholder="Optional"></textarea>
            </div>
            <button class="primary-button">Receive Payment</button>
        </div>
    </div>`;
}

function showPaymentHistory() {
    contentArea.innerHTML = `
    <div class="page-content">
        <div class="page-introduction">
            <div>
                <h2>Payment History</h2>
                <p>View all school fee payment records.</p>
            </div>
        </div>
        <div class="dashboard-card">
            <div class="form-row">
                <div class="form-group"><input type="text" placeholder="🔍 Search Student"></div>
                <div class="form-group"><input type="date"></div>
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
                        <td><span class="paid-status">Paid</span></td>
                        <td>👁️ 🖨️</td>
                    </tr>
                    <tr>
                        <td>EDU0002</td>
                        <td>Aliyu Musa</td>
                        <td>₦20,000</td>
                        <td>Transfer</td>
                        <td>30/07/2026</td>
                        <td><span class="part-status">Part Payment</span></td>
                        <td>👁️ 🖨️</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>`;
}

function showReceipts() {
    const user = getCurrentUser();
    
    contentArea.innerHTML = `
    <div class="page-content">
        <div class="page-introduction">
            <div>
                <h2>Digital Receipt</h2>
                <p>Print and download official school fee receipts.</p>
            </div>
        </div>
        <div class="receipt-card">
            <div class="receipt-header">
                <h2>EDUTRUST</h2>
                <h3>${user.school_name || "School Name"}</h3>
                <p>${user.address || "School Address"}</p>
                <p>Official School Fee Receipt</p>
            </div>
            <hr>
            <div class="receipt-body">
                <div class="detail-item"><span>Receipt No.</span><strong>EDU0001</strong></div>
                <div class="detail-item"><span>Student Name</span><strong>Aisha Bello</strong></div>
                <div class="detail-item"><span>Admission No.</span><strong>PRY00125</strong></div>
                <div class="detail-item"><span>Class</span><strong>Primary 4</strong></div>
                <div class="detail-item"><span>Amount Paid</span><strong>₦30,000</strong></div>
                <div class="detail-item"><span>Payment Method</span><strong>Cash</strong></div>
                <div class="detail-item"><span>Outstanding Balance</span><strong style="color:red;">₦20,000</strong></div>
                <div class="detail-item"><span>Issued By</span><strong>${user.full_name || "Administrator"} (${user.role || "Admin"})</strong></div>
                <div class="detail-item"><span>Contact Email</span><strong>${user.email || "N/A"}</strong></div>
            </div>
            <div class="receipt-buttons">
                <button class="primary-button">🖨 Print Receipt</button>
                <button class="primary-button">📄 Download PDF</button>
            </div>
        </div>
    </div>`;
}

function showInstallments() {
    contentArea.innerHTML = `
    <div class="page-content">
        <div class="page-introduction">
            <div>
                <h2>Installment Payments</h2>
                <p>View and record installment payments for students.</p>
            </div>
        </div>
        <div class="dashboard-card">
            <div class="form-group">
                <label>Search Student</label>
                <input type="text" placeholder="Enter Student Name or Admission Number">
            </div>
            <button class="primary-button">🔍 Search Student</button>
        </div>
        <div class="dashboard-card">
            <h3>Student Fee Summary</h3>
            <br>
            <div class="detail-item"><span>Student Name</span><strong>Aisha Bello</strong></div>
            <div class="detail-item"><span>Class</span><strong>Primary 4</strong></div>
            <div class="detail-item"><span>Total Fee</span><strong>₦120,000</strong></div>
            <div class="detail-item"><span>Total Paid</span><strong>₦70,000</strong></div>
            <div class="detail-item"><span>Outstanding Balance</span><strong style="color:red;">₦50,000</strong></div>
            <div class="detail-item"><span>Status</span><strong style="color:orange;">🟡 PART PAYMENT</strong></div>
        </div>
        <div class="dashboard-card">
            <h3>Installment History</h3>
            <table class="fee-table">
                <thead>
                    <tr><th>No.</th><th>Amount</th><th>Method</th><th>Date</th></tr>
                </thead>
                <tbody>
                    <tr><td>1</td><td>₦40,000</td><td>Cash</td><td>30 Jul 2026</td></tr>
                    <tr><td>2</td><td>₦30,000</td><td>Transfer</td><td>02 Aug 2026</td></tr>
                </tbody>
            </table>
        </div>
        <div class="dashboard-card">
            <h3>Record New Installment</h3>
            <br>
            <div class="form-group">
                <label>Amount</label>
                <input type="number" placeholder="Enter Amount">
            </div>
            <div class="form-group">
                <label>Payment Method</label>
                <select>
                    <option>Cash</option>
                    <option>Transfer</option>
                    <option>POS</option>
                </select>
            </div>
            <button class="primary-button">Record Installment</button>
        </div>
    </div>`;
}

function showOutstandingFees() {
    contentArea.innerHTML = `
    <div class="page-content">
        <div class="page-introduction">
            <div>
                <h2>Outstanding Fees</h2>
                <p>Monitor students with unpaid school fees.</p>
            </div>
            <button class="primary-button">Send Fee Reminder</button>
        </div>
        <div class="stats-grid">
            <div class="stat-card"><p>Total Outstanding</p><h3>₦2.1M</h3><small>Awaiting payment</small></div>
            <div class="stat-card"><p>Students With Balance</p><h3>186</h3><small>Require attention</small></div>
            <div class="stat-card"><p>Partially Paid</p><h3>74</h3><small>Incomplete payments</small></div>
            <div class="stat-card"><p>Payment Rate</p><h3>80%</h3><small>Current session</small></div>
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
                            <td><span class="status pending">Partial</span></td>
                        </tr>
                        <tr>
                            <td>Ahmad Musa</td>
                            <td>Ibrahim Musa</td>
                            <td>JSS 1</td>
                            <td>₦210,000</td>
                            <td>₦95,000</td>
                            <td>₦115,000</td>
                            <td><span class="status pending">Partial</span></td>
                        </tr>
                        <tr>
                            <td>Fatima Yusuf</td>
                            <td>Amina Yusuf</td>
                            <td>Primary 4</td>
                            <td>₦150,000</td>
                            <td>₦0</td>
                            <td>₦150,000</td>
                            <td><span class="status unpaid">Unpaid</span></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>`;
}

function showSchoolFees() {
    contentArea.innerHTML = `
    <div class="page-content">
        <div class="page-introduction">
            <div>
                <h2>School Fees Management</h2>
                <p>Manage fee structures, payments, receipts and outstanding balances.</p>
            </div>
            <button class="primary-button">+ Create Fee</button>
        </div>
        <div class="finance-grid">
            <div class="finance-card" id="btn-fee-struct">
                <div class="finance-icon">📋</div>
                <h3>Fee Structure</h3>
                <p>Create and manage school fees.</p>
            </div>
            <div class="finance-card" id="btn-collect-pay">
                <div class="finance-icon">💳</div>
                <h3>Collect Payment</h3>
                <p>Receive school fee payments.</p>
            </div>
            <div class="finance-card" id="btn-pay-hist">
                <div class="finance-icon">🧾</div>
                <h3>Payment History</h3>
                <p>View all payment records.</p>
            </div>
            <div class="finance-card" id="btn-receipts">
                <div class="finance-icon">📄</div>
                <h3>Receipts</h3>
                <p>Print and download receipts.</p>
            </div>
            <div class="finance-card" id="btn-installments">
                <div class="finance-icon">💰</div>
                <h3>Installments</h3>
                <p>Track installment payments.</p>
            </div>
            <div class="finance-card" id="btn-outstanding">
                <div class="finance-icon">⚠️</div>
                <h3>Outstanding Fees</h3>
                <p>Students with unpaid balances.</p>
            </div>
        </div>
    </div>`;

    document.getElementById("btn-fee-struct")?.addEventListener("click", showFeeStructure);
    document.getElementById("btn-collect-pay")?.addEventListener("click", showCollectPayment);
    document.getElementById("btn-pay-hist")?.addEventListener("click", showPaymentHistory);
    document.getElementById("btn-receipts")?.addEventListener("click", showReceipts);
    document.getElementById("btn-installments")?.addEventListener("click", showInstallments);
    document.getElementById("btn-outstanding")?.addEventListener("click", showOutstandingFees);
}

/* ================================
   CORE PAGES & VIEWS
================================ */
function showOverview() {
    const user = getCurrentUser();
    
    contentArea.innerHTML = `
        <div class="page-content">
            <div class="page-introduction">
                <div>
                    <h2>Welcome, ${user.full_name || "Administrator"} 👋</h2>
                    <p>Here is what is happening at <strong>${user.school_name || "your school"}</strong> today.</p>
                </div>
                <button class="primary-button">+ Add Student</button>
            </div>
            <div class="stats-grid">
                <div class="stat-card"><p>Total Students</p><h3>1,248</h3></div>
                <div class="stat-card"><p>Fees Collected</p><h3>₦8.4M</h3></div>
                <div class="stat-card"><p>Outstanding Fees</p><h3>₦2.1M</h3></div>
                <div class="stat-card"><p>Active Parents</p><h3>936</h3></div>
            </div>
        </div>`;
}

function showSchoolManagement() {
    const user = getCurrentUser();

    contentArea.innerHTML = `
        <div class="page-content">
            <div class="page-introduction">
                <div>
                    <h2>School Management</h2>
                    <p>Manage basic information for ${user.school_name || "your school"}.</p>
                </div>
                <button class="primary-button" id="openSchoolModalBtn">Edit School Information</button>
            </div>
            <div class="school-management-grid">
                <div class="dashboard-card school-information-card">
                    <div class="card-header">
                        <div>
                            <h3>School Information</h3>
                            <p>Registered details for your institution</p>
                        </div>
                    </div>
                    <div class="school-details">
                        <div class="detail-item"><span>School Name</span><strong>${user.school_name || "N/A"}</strong></div>
                        <div class="detail-item"><span>School Email</span><strong>${user.email || "N/A"}</strong></div>
                        <div class="detail-item"><span>Phone Number</span><strong>${user.phone || "N/A"}</strong></div>
                        <div class="detail-item"><span>School Address</span><strong>${user.address || "N/A"}</strong></div>
                        <div class="detail-item"><span>School Type</span><strong>${user.school_type || "Private School"}</strong></div>
                        <div class="detail-item"><span>Administrator / Principal</span><strong>${user.full_name || "N/A"}</strong></div>
                        <div class="detail-item"><span>User Role</span><strong>${user.role || "Admin"}</strong></div>
                    </div>
                </div>
                <div class="dashboard-card school-status-card">
                    <div class="card-header">
                        <div>
                            <h3>School Status</h3>
                            <p>Current account status</p>
                        </div>
                    </div>
                    <div class="status-overview">
                        <div class="large-status-icon">✓</div>
                        <h3>Active</h3>
                        <p>Your school account is active and fully operational.</p>
                    </div>
                    <div class="status-information">
                        <div><span>Account Created</span><strong>July 2026</strong></div>
                        <div><span>Current Session</span><strong>${user.academic_session || "2025/2026"}</strong></div>
                    </div>
                </div>
            </div>
        </div>`;

    document.getElementById("openSchoolModalBtn")?.addEventListener("click", openSchoolModal);
}

function showClasses() {
    contentArea.innerHTML = `
    <div class="page-content">
        <div class="page-introduction">
            <div>
                <h2>Classes</h2>
                <p>Manage classes and class streams.</p>
            </div>
            <button class="primary-button">+ Add New Class</button>
        </div>
        <div class="stats-grid">
            <div class="stat-card"><p>Total Classes</p><h3>24</h3><small>Across all levels</small></div>
            <div class="stat-card"><p>Primary Classes</p><h3>12</h3><small>Primary section</small></div>
            <div class="stat-card"><p>Secondary Classes</p><h3>12</h3><small>Secondary section</small></div>
            <div class="stat-card"><p>Total Students</p><h3>1,248</h3><small>Assigned to classes</small></div>
        </div>
    </div>`;
}

function showAcademicSessions() {
    contentArea.innerHTML = `
    <div class="page-content">
        <div class="page-introduction">
            <div>
                <h2>Academic Sessions</h2>
                <p>Manage academic sessions and school terms.</p>
            </div>
            <button class="primary-button">+ Create New Session</button>
        </div>
        <div class="stats-grid">
            <div class="stat-card"><p>Current Session</p><h3>2025/2026</h3><small>Active academic session</small></div>
            <div class="stat-card"><p>Current Term</p><h3>First Term</h3><small>Current school term</small></div>
        </div>
    </div>`;
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
        <div class="stat-card"><span class="stat-icon">👨‍🎓</span><div><p>Total Students</p><h2>1,248</h2></div></div>
        <div class="stat-card"><span class="stat-icon">🟢</span><div><p>Active Students</p><h2>1,180</h2></div></div>
        <div class="stat-card"><span class="stat-icon">🔴</span><div><p>Inactive Students</p><h2>68</h2></div></div>
    </div>
    <div class="student-modal" id="student-modal" style="display:none;">
        <div class="student-modal-content">
            <div class="modal-header">
                <h2>Add New Student</h2>
                <button type="button" class="close-modal" id="close-student-modal">×</button>
            </div>
            <form id="student-form">
                <div class="form-row">
                    <div class="form-group"><label>First Name</label><input type="text" required></div>
                    <div class="form-group"><label>Last Name</label><input type="text" required></div>
                </div>
                <div class="modal-actions">
                    <button type="button" class="cancel-button" id="cancel-student-modal">Cancel</button>
                    <button type="submit" class="primary-button">Add Student</button>
                </div>
            </form>
        </div>
    </div>`;

    const addStudentButton = document.getElementById("add-student-button");
    const studentModal = document.getElementById("student-modal");
    const closeStudentModal = document.getElementById("close-student-modal");
    const cancelStudentModal = document.getElementById("cancel-student-modal");
    const studentForm = document.getElementById("student-form");

    if (addStudentButton && studentModal) {
        addStudentButton.addEventListener("click", () => studentModal.style.display = "flex");
        closeStudentModal?.addEventListener("click", () => studentModal.style.display = "none");
        cancelStudentModal?.addEventListener("click", () => studentModal.style.display = "none");
        studentForm?.addEventListener("submit", (e) => {
            e.preventDefault();
            alert("Student added successfully!");
            studentForm.reset();
            studentModal.style.display = "none";
        });
    }
}

function showParents() {
    contentArea.innerHTML = `<div class="page-content"><h2>Parents & Guardians</h2></div>`;
}

function showStaff() {
    contentArea.innerHTML = `<div class="page-content"><h2>Staff & Teachers</h2></div>`;
}

function showAnnouncements() {
    contentArea.innerHTML = `<div class="page-content"><h2>Announcements</h2></div>`;
}

function showMessages() {
    contentArea.innerHTML = `<div class="page-content"><h2>Messages</h2></div>`;
}

function showNotifications() {
    contentArea.innerHTML = `<div class="page-content"><h2>Notifications</h2></div>`;
}

function showParentPayments() {
    contentArea.innerHTML = `<div class="page-content"><h2>Parent Payments</h2></div>`;
}

/* ================================
   SETTINGS PAGES
================================ */
function showSchoolProfile() {
    const user = getCurrentUser();
    contentArea.innerHTML = `
    <div class="page-content">
        <h2>School Profile Settings</h2>
        <div class="dashboard-card" style="margin-top: 1rem;">
            <div class="detail-item"><span>School Name</span><strong>${user.school_name || "N/A"}</strong></div>
            <div class="detail-item"><span>Email Address</span><strong>${user.email || "N/A"}</strong></div>
            <div class="detail-item"><span>Phone Number</span><strong>${user.phone || "N/A"}</strong></div>
            <div class="detail-item"><span>Address</span><strong>${user.address || "N/A"}</strong></div>
        </div>
    </div>`;
}

function showUserRoles() {
    contentArea.innerHTML = `<div class="page-content"><h2>User Roles & Permissions</h2></div>`;
}

function showPaymentSettings() {
    contentArea.innerHTML = `<div class="page-content"><h2>Payment Gateway Settings</h2></div>`;
}

function showSecurity() {
    contentArea.innerHTML = `<div class="page-content"><h2>Security Settings</h2></div>`;
}

function showEmailSettings() {
    const user = getCurrentUser();
    contentArea.innerHTML = `
    <div class="page-content">
        <h2>Email Settings</h2>
        <div class="dashboard-card" style="margin-top: 1rem;">
            <p>Notification & communication email: <strong>${user.email || "N/A"}</strong></p>
        </div>
    </div>`;
}

function showBackup() {
    contentArea.innerHTML = `<div class="page-content"><h2>Backup & Export</h2></div>`;
}

function showComingSoon(pageName) {
    contentArea.innerHTML = `
        <div class="empty-page">
            <div class="empty-icon">🚧</div>
            <h2>${pageName}</h2>
            <p>This section will be built next.</p>
        </div>`;
}

/* ================================
   SIDEBAR & UTILITY CONTROLS
================================ */
const reportsToggle = document.querySelector(".reports-toggle");
if (reportsToggle) {
    const reportsGroup = reportsToggle.closest(".nav-group");
    reportsToggle.addEventListener("click", () => reportsGroup?.classList.toggle("open"));
}

const settingsToggle = document.querySelector(".settings-toggle");
if (settingsToggle) {
    const settingsGroup = settingsToggle.closest(".nav-group");
    settingsToggle.addEventListener("click", () => settingsGroup?.classList.toggle("open"));
}

if (notificationButton && notificationDropdown) {
    notificationButton.addEventListener("click", (e) => {
        e.stopPropagation();
        notificationDropdown.classList.toggle("show");
    });
    document.addEventListener("click", () => notificationDropdown.classList.remove("show"));
}

if (menuToggle && sidebar) {
    menuToggle.addEventListener("click", () => {
        if (window.innerWidth <= 768) {
            sidebar.classList.toggle("show");
        } else {
            sidebar.classList.toggle("collapsed");
        }
    });
}

const logoutButton = document.getElementById("logoutButton");
if (logoutButton) {
    logoutButton.addEventListener("click", () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "login.html";
    });
}

/* ============================
   MODAL CONTROLS
============================ */
function openSchoolModal() {
    const modal = document.getElementById("schoolModal");
    if (modal) modal.style.display = "flex";
}

function closeSchoolModal() {
    const modal = document.getElementById("schoolModal");
    if (modal) modal.style.display = "none";
}

window.onclick = function (event) {
    const modal = document.getElementById("schoolModal");
    if (modal && event.target === modal) {
        modal.style.display = "none";
    }
};
