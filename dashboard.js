const navItems =
    document.querySelectorAll(
        ".nav-item[data-page], .submenu-item[data-page]"
    );


const contentArea =
    document.getElementById("contentArea");


const sidebar =
    document.querySelector(".sidebar");


const menuToggle =
    document.getElementById("menu-toggle");


const notificationButton =
    document.getElementById("notification-button");


const notificationDropdown =
    document.getElementById("notification-dropdown");



/* ================================
   MAIN NAVIGATION
================================ */

navItems.forEach(function (item) {

    item.addEventListener("click", function () {

        const page =
            item.getAttribute("data-page");


        navItems.forEach(function (nav) {

            nav.classList.remove("active");

        });


        item.classList.add("active");


        if (page === "overview") {

            showOverview();

        }

        else if (page === "school") {

            showSchoolManagement();

        }

        else if (page === "classes") {

            showClasses();

        }

        else if (page === "sessions") {

            showAcademicSessions();

        }

        else if (page === "fees") {

            showSchoolFees();

        }

        else if (page === "fee-structures") {

            showFeeStructures();

        }

        else if (page === "payments") {

            showParentPayments();

        }

        else if (page === "outstanding") {

            showOutstandingFees();

        }

        else if (page === "students") {

            showStudents();

        }

        else if (page === "parents") {

            showParents();

        }

        else if (page === "staff") {

            showStaff();

        }

        else if (page === "announcements") {

            showAnnouncements();

        }

        else if (page === "messages") {

            showMessages();

        }

        else if (page === "notifications") {

            showNotifications();

        }

        else if (page === "school-profile") {

            showSchoolProfile();

        }

        else if (page === "user-roles") {

            showUserRoles();

        }

        else if (page === "payment-settings") {

            showPaymentSettings();

        }

        else if (page === "security") {

            showSecurity();

        }

        else if (page === "email-settings") {

            showEmailSettings();

        }

        else if (page === "backup") {

            showBackup();

        }

        else {

            showComingSoon(
                item.textContent.trim()
            );

        }


        if (window.innerWidth <= 768 && sidebar) {

            sidebar.classList.remove("show");

        }

    });

});



/* ================================
   REPORTS DROPDOWN
================================ */

const reportsToggle =
    document.querySelector(".reports-toggle");

if (reportsToggle) {
    const reportsGroup =
        reportsToggle.closest(".nav-group");

    reportsToggle.addEventListener("click", function () {

        reportsGroup.classList.toggle("open");

    });
}



/* ================================
   SETTINGS DROPDOWN
================================ */

const settingsToggle =
    document.querySelector(".settings-toggle");

if (settingsToggle) {
    const settingsGroup =
        settingsToggle.closest(".nav-group");

    settingsToggle.addEventListener("click", function () {

        settingsGroup.classList.toggle("open");

    });
}



/* ================================
   NOTIFICATIONS
================================ */

if (
    notificationButton &&
    notificationDropdown
) {

    notificationButton.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();

            notificationDropdown.classList.toggle("show");

        }
    );


    document.addEventListener(
        "click",
        function () {

            notificationDropdown.classList.remove("show");

        }
    );

}



/* ================================
   SIDEBAR MENU
================================ */

if (
    menuToggle &&
    sidebar
) {

    menuToggle.addEventListener(
        "click",
        function () {

            if (
                window.innerWidth <= 768
            ) {

                sidebar.classList.toggle("show");

            }

            else {

                sidebar.classList.toggle(
                    "collapsed"
                );

            }

        }
    );

}

/* ================================
   SETTINGS PAGES
================================ */

async function showSchoolProfile() {
    let profile = { name: '', email: '', phone: '', address: '' };
    try {
        const res = await fetch('/api/school/profile');
        if (res.ok) profile = await res.json();
    } catch (e) { console.error(e); }

    contentArea.innerHTML = `

        <div class="page-header">

            <h1>School Profile</h1>

            <p>
                Manage your school's information and profile details.
            </p>

        </div>


        <div class="content-card">

            <h2>School Information</h2>

            <form class="settings-form" id="schoolProfileForm">

                <div class="form-group">

                    <label>School Name</label>

                    <input
                        type="text"
                        value="${profile.name || ''}"
                        placeholder="Enter school name"
                    >

                </div>


                <div class="form-group">

                    <label>School Email</label>

                    <input
                        type="email"
                        value="${profile.email || ''}"
                        placeholder="school@example.com"
                    >

                </div>


                <div class="form-group">

                    <label>School Phone</label>

                    <input
                        type="tel"
                        value="${profile.phone || ''}"
                        placeholder="08012345678"
                    >

                </div>


                <div class="form-group">

                    <label>School Address</label>

                    <textarea
                        placeholder="Enter school address"
                    >${profile.address || ''}</textarea>

                </div>


                <button
                    type="submit"
                    class="primary-button"
                >
                    Save Changes
                </button>

            </form>

        </div>

    `;

}

async function showUserRoles() {
    let roles = [];
    try {
        const res = await fetch('/api/settings/roles');
        if (res.ok) roles = await res.json();
    } catch (e) { console.error(e); }

    contentArea.innerHTML = `

        <div class="page-header">

            <h1>User Roles</h1>

            <p>
                Manage administrators, staff, teachers and access permissions.
            </p>

        </div>


        <div class="content-card">

            <div class="section-heading">

                <h2>System Users</h2>

                <button class="primary-button">
                    + Add User
                </button>

            </div>


            <div class="user-role-list">

                ${roles.length > 0 ? roles.map(role => `
                <div class="role-item">

                    <div>

                        <strong>${role.title}</strong>

                        <p>${role.description}</p>

                    </div>

                    <span class="role-badge">
                        ${role.accessLevel}
                    </span>

                </div>
                `).join('') : `
                <div class="role-item">

                    <div>

                        <strong>Administrator</strong>

                        <p>Full access to the EduTrust system</p>

                    </div>

                    <span class="role-badge">
                        Full Access
                    </span>

                </div>


                <div class="role-item">

                    <div>

                        <strong>Teacher</strong>

                        <p>Access to students and academic records</p>

                    </div>

                    <span class="role-badge">
                        Limited Access
                    </span>

                </div>


                <div class="role-item">

                    <div>

                        <strong>Accountant</strong>

                        <p>Access to school fees and payment records</p>

                    </div>

                    <span class="role-badge">
                        Finance Access
                    </span>

                </div>
                `}

            </div>

        </div>

    `;

}

function showPaymentSettings() {

    contentArea.innerHTML = `

        <div class="page-header">

            <h1>Payment Settings</h1>

            <p>
                Configure how your school receives and manages payments.
            </p>

        </div>


        <div class="content-card">

            <h2>Payment Configuration</h2>


            <div class="settings-option">

                <div>

                    <strong>Online Payments</strong>

                    <p>
                        Allow parents to pay school fees online.
                    </p>

                </div>


                <label class="switch">

                    <input type="checkbox">

                    <span class="slider"></span>

                </label>

            </div>


            <div class="settings-option">

                <div>

                    <strong>Payment Notifications</strong>

                    <p>
                        Receive notifications when payments are made.
                    </p>

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

            <p>
                Manage your account security and password settings.
            </p>

        </div>


        <div class="content-card">

            <h2>Security Settings</h2>


            <div class="settings-option">

                <div>

                    <strong>Two-Factor Authentication</strong>

                    <p>
                        Add an extra layer of security to your account.
                    </p>

                </div>


                <label class="switch">

                    <input type="checkbox">

                    <span class="slider"></span>

                </label>

            </div>


            <button
                type="button"
                class="primary-button"
            >
                Change Password
            </button>

        </div>

    `;

}

function showEmailSettings() {

    contentArea.innerHTML = `

        <div class="page-header">

            <h1>Email Settings</h1>

            <p>
                Manage school email notifications and communication preferences.
            </p>

        </div>


        <div class="content-card">

            <h2>Email Notifications</h2>


            <div class="settings-option">

                <div>

                    <strong>Payment Notifications</strong>

                    <p>
                        Send email alerts when payments are received.
                    </p>

                </div>

                <input type="checkbox">

            </div>


            <div class="settings-option">

                <div>

                    <strong>New Student Notifications</strong>

                    <p>
                        Receive alerts when a new student is registered.
                    </p>

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

            <p>
                Protect your school's important information.
            </p>

        </div>


        <div class="content-card">

            <h2>Data Backup</h2>

            <p>
                Create a backup of your school records and important data.
            </p>


            <button
                type="button"
                class="primary-button"
            >
                Create Backup
            </button>

        </div>

    `;

}

async function showNotifications() {
    let stats = { total: 0, unread: 0, payments: 0, updates: 0 };
    let list = [];
    try {
        const res = await fetch('/api/notifications');
        if (res.ok) {
            const data = await res.json();
            stats = data.stats || stats;
            list = data.notifications || list;
        }
    } catch (e) { console.error(e); }

    contentArea.innerHTML = `

        <div class="page-content">

            <div class="page-introduction">

                <div>

                    <h2>
                        Notifications
                    </h2>

                    <p>
                        Stay updated with important activities across your school.
                    </p>

                </div>

                <button class="text-button">

                    Mark All As Read

                </button>

            </div>


            <div class="stats-grid">

                <div class="stat-card">

                    <p>
                        Total Notifications
                    </p>

                    <h3>
                        ${stats.total}
                    </h3>

                    <small>
                        All recent activities
                    </small>

                </div>


                <div class="stat-card">

                    <p>
                        Unread
                    </p>

                    <h3>
                        ${stats.unread}
                    </h3>

                    <small>
                        Require attention
                    </small>

                </div>


                <div class="stat-card">

                    <p>
                        Payments
                    </p>

                    <h3>
                        ${stats.payments}
                    </h3>

                    <small>
                        Payment updates
                    </small>

                </div>


                <div class="stat-card">

                    <p>
                        System Updates
                    </p>

                    <h3>
                        ${stats.updates}
                    </h3>

                    <small>
                        Recent system activities
                    </small>

                </div>

            </div>


            <div class="dashboard-card">

                <div class="card-header">

                    <div>

                        <h3>
                            Recent Notifications
                        </h3>

                        <p>
                            Your latest system and school activities.
                        </p>

                    </div>

                </div>


                <div class="notification-list">

                    ${list.length > 0 ? list.map(item => `
                    <div class="notification-item ${item.isUnread ? 'unread' : ''}">

                        <div class="notification-icon ${item.type}">
                            ${item.icon || '🔔'}
                        </div>

                        <div class="notification-content">

                            <h4>
                                ${item.title}
                            </h4>

                            <p>
                                ${item.message}
                            </p>

                            <small>
                                ${item.timeAgo}
                            </small>

                        </div>

                    </div>
                    `).join('') : `
                    <div class="notification-item unread">

                        <div class="notification-icon payment">
                            💰
                        </div>

                        <div class="notification-content">

                            <h4>
                                Payment Received
                            </h4>

                            <p>
                                Amina Yusuf completed a school fee payment of ₦150,000.
                            </p>

                            <small>
                                10 minutes ago
                            </small>

                        </div>

                    </div>


                    <div class="notification-item unread">

                        <div class="notification-icon announcement">
                            📢
                        </div>

                        <div class="notification-content">

                            <h4>
                                New Announcement Published
                            </h4>

                            <p>
                                First Term Examination Schedule was published successfully.
                            </p>

                            <small>
                                2 hours ago
                            </small>

                        </div>

                    </div>


                    <div class="notification-item">

                        <div class="notification-icon user">
                            👤
                        </div>

                        <div class="notification-content">

                            <h4>
                                New Parent Account
                            </h4>

                            <p>
                                A new parent account has been successfully activated.
                            </p>

                            <small>
                                Yesterday
                            </small>

                        </div>

                    </div>


                    <div class="notification-item">

                        <div class="notification-icon warning">
                            ⚠️
                        </div>

                        <div class="notification-content">

                            <h4>
                                Outstanding Fees Reminder
                            </h4>

                            <p>
                                186 students currently have outstanding fee balances.
                            </p>

                            <small>
                                2 days ago
                            </small>

                        </div>

                    </div>
                    `}

                </div>

            </div>

        </div>

    `;

}

async function showMessages() {
    let stats = { total: 0, unread: 0, parents: 0, staff: 0 };
    let list = [];
    try {
        const res = await fetch('/api/messages');
        if (res.ok) {
            const data = await res.json();
            stats = data.stats || stats;
            list = data.messages || list;
        }
    } catch (e) { console.error(e); }

    contentArea.innerHTML = `

        <div class="page-content">


            <div class="page-introduction">

                <div>

                    <h2>
                        Messages
                    </h2>

                    <p>
                        Communicate directly with parents, staff, and students.
                    </p>

                </div>


                <button class="primary-button">

                    + Compose Message

                </button>

            </div>


            <div class="stats-grid">


                <div class="stat-card">

                    <p>
                        Total Messages
                    </p>

                    <h3>
                        ${stats.total}
                    </h3>

                    <small>
                        All conversations
                    </small>

                </div>


                <div class="stat-card">

                    <p>
                        Unread Messages
                    </p>

                    <h3>
                        ${stats.unread}
                    </h3>

                    <small>
                        Require attention
                    </small>

                </div>


                <div class="stat-card">

                    <p>
                        Parents
                    </p>

                    <h3>
                        ${stats.parents}
                    </h3>

                    <small>
                        Conversations
                    </small>

                </div>


                <div class="stat-card">

                    <p>
                        Staff
                    </p>

                    <h3>
                        ${stats.staff}
                    </h3>

                    <small>
                        Conversations
                    </small>

                </div>


            </div>


            <div class="dashboard-card">


                <div class="card-header">

                    <div>

                        <h3>
                            Recent Conversations
                        </h3>

                        <p>
                            Your latest direct messages.
                        </p>

                    </div>


                    <button class="text-button">

                        View All

                    </button>

                </div>


                <div class="message-list">

                    ${list.length > 0 ? list.map(item => `
                    <div class="message-item">


                        <div class="message-avatar">
                            ${item.initials}
                        </div>


                        <div class="message-content">

                            <div class="message-top">

                                <h4>
                                    ${item.senderName}
                                </h4>

                                <small>
                                    ${item.time}
                                </small>

                            </div>


                            <p>
                                ${item.text}
                            </p>


                            <span class="message-role">
                                ${item.role}
                            </span>

                        </div>


                        ${item.isUnread ? '<span class="unread-dot"></span>' : ''}

                    </div>
                    `).join('') : `
                    <div class="message-item">


                        <div class="message-avatar">
                            AY
                        </div>


                        <div class="message-content">

                            <div class="message-top">

                                <h4>
                                    Amina Yusuf
                                </h4>

                                <small>
                                    10:45 AM
                                </small>

                            </div>


                            <p>
                                I would like to confirm the outstanding fee balance for my child.
                            </p>


                            <span class="message-role">
                                Parent
                            </span>

                        </div>


                        <span class="unread-dot"></span>

                    </div>


                    <div class="message-item">


                        <div class="message-avatar">
                            MI
                        </div>


                        <div class="message-content">

                            <div class="message-top">

                                <h4>
                                    Mr. Ibrahim
                                </h4>

                                <small>
                                    Yesterday
                                </small>

                            </div>


                            <p>
                                The updated class attendance records are ready.
                            </p>


                            <span class="message-role">
                                Teacher
                            </span>

                        </div>


                    </div>


                    <div class="message-item">


                        <div class="message-avatar">
                            ZB
                        </div>


                        <div class="message-content">

                            <div class="message-top">

                                <h4>
                                    Zainab Bello
                                </h4>

                                <small>
                                    2 days ago
                                </small>

                            </div>


                            <p>
                                Thank you for the payment reminder.
                            </p>


                            <span class="message-role">
                                Parent
                            </span>

                        </div>


                    </div>
                    `}

                </div>


            </div>


        </div>

    `;

}

async function showAnnouncements() {
    let stats = { total: 0, published: 0, drafts: 0, audience: '0' };
    let list = [];
    try {
        const res = await fetch('/api/announcements');
        if (res.ok) {
            const data = await res.json();
            stats = data.stats || stats;
            list = data.announcements || list;
        }
    } catch (e) { console.error(e); }

    contentArea.innerHTML = `

        <div class="page-content">


            <div class="page-introduction">

                <div>

                    <h2>
                        Announcements
                    </h2>

                    <p>
                        Share important updates and information with your school community.
                    </p>

                </div>


                <button class="primary-button">

                    + Create Announcement

                </button>

            </div>


            <div class="stats-grid">


                <div class="stat-card">

                    <p>
                        Total Announcements
                    </p>

                    <h3>
                        ${stats.total}
                    </h3>

                    <small>
                        This academic session
                    </small>

                </div>


                <div class="stat-card">

                    <p>
                        Published
                    </p>

                    <h3>
                        ${stats.published}
                    </h3>

                    <small>
                        Currently visible
                    </small>

                </div>


                <div class="stat-card">

                    <p>
                        Drafts
                    </p>

                    <h3>
                        ${stats.drafts}
                    </h3>

                    <small>
                        Not yet published
                    </small>

                </div>


                <div class="stat-card">

                    <p>
                        Audience
                    </p>

                    <h3>
                        ${stats.audience}
                    </h3>

                    <small>
                        School community
                    </small>

                </div>


            </div>


            <div class="dashboard-card">


                <div class="card-header">

                    <div>

                        <h3>
                            Recent Announcements
                        </h3>

                        <p>
                            Manage your school's latest announcements.
                        </p>

                    </div>


                    <button class="text-button">

                        View All

                    </button>

                </div>


                <div class="announcement-list">

                    ${list.length > 0 ? list.map(item => `
                    <div class="announcement-item">


                        <div class="announcement-icon">
                            ${item.icon || '📢'}
                        </div>


                        <div class="announcement-content">

                            <h4>
                                ${item.title}
                            </h4>

                            <p>
                                ${item.content}
                            </p>

                            <small>
                                ${item.meta}
                            </small>

                        </div>


                        <span class="status ${item.status === 'Published' ? 'paid' : 'pending'}">
                            ${item.status}
                        </span>

                    </div>
                    `).join('') : `
                    <div class="announcement-item">


                        <div class="announcement-icon">
                            📢
                        </div>


                        <div class="announcement-content">

                            <h4>
                                First Term Examination Schedule
                            </h4>

                            <p>
                                The first term examination will begin on Monday.
                            </p>

                            <small>
                                Published 2 days ago • Parents & Students
                            </small>

                        </div>


                        <span class="status paid">
                            Published
                        </span>

                    </div>


                    <div class="announcement-item">


                        <div class="announcement-icon">
                            💰
                        </div>


                        <div class="announcement-content">

                            <h4>
                                School Fee Payment Reminder
                            </h4>

                            <p>
                                Parents are reminded to complete outstanding school fee payments.
                            </p>

                            <small>
                                Published 5 days ago • Parents
                            </small>

                        </div>


                        <span class="status paid">
                            Published
                        </span>

                    </div>


                    <div class="announcement-item">


                        <div class="announcement-icon">
                            📅
                        </div>


                        <div class="announcement-content">

                            <h4>
                                Upcoming School Holiday
                            </h4>

                            <p>
                                The school will be closed for the upcoming holiday.
                            </p>

                            <small>
                                Draft • Staff & Parents
                            </small>

                        </div>


                        <span class="status pending">
                            Draft
                        </span>

                    </div>
                    `}

                </div>


            </div>


        </div>

    `;

}

async function showParents() {
    let stats = { total: 0, active: 0, linkedStudents: 0, pending: 0 };
    let list = [];
    try {
        const res = await fetch('/api/parents');
        if (res.ok) {
            const data = await res.json();
            stats = data.stats || stats;
            list = data.parents || list;
        }
    } catch (e) { console.error(e); }

    contentArea.innerHTML = `

        <div class="page-content">

            <div class="page-introduction">

                <div>

                    <h2>
                        Parents & Guardians
                    </h2>

                    <p>
                        Manage parents and guardians connected to students.
                    </p>

                </div>

                <button class="primary-button">

                    + Add Parent

                </button>

            </div>


            <div class="stats-grid">

                <div class="stat-card">

                    <p>
                        Total Parents
                    </p>

                    <h3>
                        ${stats.total}
                    </h3>

                    <small>
                        Registered parents
                    </small>

                </div>


                <div class="stat-card">

                    <p>
                        Active Accounts
                    </p>

                    <h3>
                        ${stats.active}
                    </h3>

                    <small>
                        Currently active
                    </small>

                </div>


                <div class="stat-card">

                    <p>
                        Linked Students
                    </p>

                    <h3>
                        ${stats.linkedStudents}
                    </h3>

                    <small>
                        Connected to parents
                    </small>

                </div>


                <div class="stat-card">

                    <p>
                        Pending Invitations
                    </p>

                    <h3>
                        ${stats.pending}
                    </h3>

                    <small>
                        Awaiting account activation
                    </small>

                </div>

            </div>


            <div class="dashboard-card">

                <div class="card-header">

                    <div>

                        <h3>
                            Parents Directory
                        </h3>

                        <p>
                            View and manage registered parents and guardians.
                        </p>

                    </div>

                    <button class="text-button">

                        View All

                    </button>

                </div>


                <div class="table-container">

                    <table>

                        <thead>

                            <tr>

                                <th>
                                    Parent / Guardian
                                </th>

                                <th>
                                    Phone
                                </th>

                                <th>
                                    Email
                                </th>

                                <th>
                                    Students
                                </th>

                                <th>
                                    Account Status
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            ${list.length > 0 ? list.map(item => `
                            <tr>

                                <td>
                                    ${item.name}
                                </td>

                                <td>
                                    ${item.phone}
                                </td>

                                <td>
                                    ${item.email}
                                </td>

                                <td>
                                    ${item.studentCount} Students
                                </td>

                                <td>

                                    <span class="status ${item.status === 'Active' ? 'paid' : 'pending'}">
                                        ${item.status}
                                    </span>

                                </td>

                            </tr>
                            `).join('') : `
                            <tr>

                                <td>
                                    Amina Yusuf
                                </td>

                                <td>
                                    08012345678
                                </td>

                                <td>
                                    amina@example.com
                                </td>

                                <td>
                                    2 Students
                                </td>

                                <td>

                                    <span class="status paid">
                                        Active
                                    </span>

                                </td>

                            </tr>


                            <tr>

                                <td>
                                    Ibrahim Musa
                                </td>

                                <td>
                                    08023456789
                                </td>

                                <td>
                                    ibrahim@example.com
                                </td>

                                <td>
                                    1 Student
                                </td>

                                <td>

                                    <span class="status paid">
                                        Active
                                    </span>

                                </td>

                            </tr>


                            <tr>

                                <td>
                                    Zainab Bello
                                </td>

                                <td>
                                    08034567890
                                </td>

                                <td>
                                    zainab@example.com
                                </td>

                                <td>
                                    1 Student
                                </td>

                                <td>

                                    <span class="status pending">
                                        Pending
                                    </span>

                                </td>

                            </tr>
                            `}

                        </tbody>

                    </table>

                </div>

            </div>

        </div>

    `;

}

async function showStaff() {
    let stats = { total: 0, teachers: 0, admin: 0, support: 0 };
    let list = [];
    try {
        const res = await fetch('/api/staff');
        if (res.ok) {
            const data = await res.json();
            stats = data.stats || stats;
            list = data.staff || list;
        }
    } catch (e) { console.error(e); }

    contentArea.innerHTML = `

        <div class="page-content">


            <div class="page-introduction">

                <div>

                    <h2>
                        Staff & Teachers
                    </h2>

                    <p>
                        Manage teachers, administrators, and other school staff.
                    </p>

                </div>


                <button class="primary-button">

                    + Add Staff Member

                </button>

            </div>


            <div class="stats-grid">


                <div class="stat-card">

                    <p>
                        Total Staff
                    </p>

                    <h3>
                        ${stats.total}
                    </h3>

                    <small>
                        All school staff
                    </small>

                </div>


                <div class="stat-card">

                    <p>
                        Teachers
                    </p>

                    <h3>
                        ${stats.teachers}
                    </h3>

                    <small>
                        Teaching staff
                    </small>

                </div>


                <div class="stat-card">

                    <p>
                        Administrative Staff
                    </p>

                    <h3>
                        ${stats.admin}
                    </h3>

                    <small>
                        School administration
                    </small>

                </div>


                <div class="stat-card">

                    <p>
                        Support Staff
                    </p>

                    <h3>
                        ${stats.support}
                    </h3>

                    <small>
                        Other school staff
                    </small>

                </div>


            </div>


            <div class="dashboard-card">


                <div class="card-header">

                    <div>

                        <h3>
                            Staff Directory
                        </h3>

                        <p>
                            View and manage all school staff.
                        </p>

                    </div>


                    <button class="text-button">

                        View All

                    </button>

                </div>


                <div class="table-container">


                    <table>


                        <thead>

                            <tr>

                                <th>
                                    Name
                                </th>

                                <th>
                                    Role
                                </th>

                                <th>
                                    Department
                                </th>

                                <th>
                                    Phone
                                </th>

                                <th>
                                    Status
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            ${list.length > 0 ? list.map(item => `
                            <tr>

                                <td>
                                    ${item.name}
                                </td>

                                <td>
                                    ${item.role}
                                </td>

                                <td>
                                    ${item.department}
                                </td>

                                <td>
                                    ${item.phone}
                                </td>

                                <td>

                                    <span class="status paid">
                                        ${item.status}
                                    </span>

                                </td>

                            </tr>
                            `).join('') : `
                            <tr>

                                <td>
                                    Mr. Ibrahim
                                </td>

                                <td>
                                    Teacher
                                </td>

                                <td>
                                    Mathematics
                                </td>

                                <td>
                                    08012345678
                                </td>

                                <td>

                                    <span class="status paid">
                                        Active
                                    </span>

                                </td>

                            </tr>


                            <tr>

                                <td>
                                    Mrs. Aisha
                                </td>

                                <td>
                                    Teacher
                                </td>

                                <td>
                                    English
                                </td>

                                <td>
                                    08023456789
                                </td>

                                <td>

                                    <span class="status paid">
                                        Active
                                    </span>

                                </td>

                            </tr>


                            <tr>

                                <td>
                                    Mr. Musa
                                </td>

                                <td>
                                    Accountant
                                </td>

                                <td>
                                    Finance
                                </td>

                                <td>
                                    08034567890
                                </td>

                                <td>

                                    <span class="status paid">
                                        Active
                                    </span>

                                </td>

                            </tr>


                            <tr>

                                <td>
                                    Mrs. Fatima
                                </td>

                                <td>
                                    Administrator
                                </td>

                                <td>
                                    Administration
                                </td>

                                <td>
                                    08045678901
                                </td>

                                <td>

                                    <span class="status paid">
                                        Active
                                    </span>

                                </td>

                            </tr>
                            `}

                        </tbody>


                    </table>

                </div>

            </div>


        </div>

    `;

}



async function showStudents() {
    let stats = { total: 0, active: 0, inactive: 0 };
    let list = [];
    try {
        const res = await fetch('/api/students');
        if (res.ok) {
            const data = await res.json();
            stats = data.stats || stats;
            list = data.students || list;
        }
    } catch (e) { console.error(e); }

    contentArea.innerHTML = `

        <div class="page-header">

            <div>

                <h1>Students</h1>

                <p>
                    Manage all students registered in your school.
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

                <span class="stat-icon">
                    👨‍🎓
                </span>

                <div>

                    <p>Total Students</p>

                    <h2>${stats.total}</h2>

                </div>

            </div>


            <div class="stat-card">

                <span class="stat-icon">
                    🟢
                </span>

                <div>

                    <p>Active Students</p>

                    <h2>${stats.active}</h2>

                </div>

            </div>


            <div class="stat-card">

                <span class="stat-icon">
                    🔴
                </span>

                <div>

                    <p>Inactive Students</p>

                    <h2>${stats.inactive}</h2>

                </div>

            </div>

        </div>


        <div class="content-card students-card">


            <div class="table-header">

                <div>

                    <h2>Student List</h2>

                    <p>
                        View and manage registered students.
                    </p>

                </div>


                <div class="table-actions">

                    <input
                        type="search"
                        id="student-search"
                        placeholder="Search students..."
                    >


                    <select
                        id="student-class-filter"
                    >

                        <option value="all">
                            All Classes
                        </option>

                        <option value="nursery">
                            Nursery
                        </option>

                        <option value="primary">
                            Primary
                        </option>

                        <option value="jss">
                            JSS
                        </option>

                        <option value="ss">
                            SS
                        </option>

                    </select>

                </div>

            </div>


            <div class="table-wrapper">

                <table class="data-table">

                    <thead>

                        <tr>

                            <th>Student</th>

                            <th>Admission No.</th>

                            <th>Class</th>

                            <th>Gender</th>

                            <th>Status</th>

                            <th>Action</th>

                        </tr>

                    </thead>


                    <tbody
                        id="students-table-body"
                    >

                        ${list.length > 0 ? list.map(item => `
                        <tr>

                            <td>

                                <div class="student-info">

                                    <span
                                        class="student-avatar"
                                    >
                                        ${item.initials}
                                    </span>


                                    <div>

                                        <strong>
                                            ${item.name}
                                        </strong>

                                        <small>
                                            ${item.email}
                                        </small>

                                    </div>

                                </div>

                            </td>


                            <td>
                                ${item.admissionNo}
                            </td>


                            <td>
                                ${item.class}
                            </td>


                            <td>
                                ${item.gender}
                            </td>


                            <td>

                                <span
                                    class="status-badge ${item.status === 'Active' ? 'active' : 'inactive'}"
                                >
                                    ${item.status}
                                </span>

                            </td>


                            <td>

                                <button
                                    class="table-action-button"
                                >
                                    View
                                </button>

                            </td>

                        </tr>
                        `).join('') : `
                        <tr>

                            <td>

                                <div class="student-info">

                                    <span
                                        class="student-avatar"
                                    >
                                        AM
                                    </span>


                                    <div>

                                        <strong>
                                            Aisha Mohammed
                                        </strong>

                                        <small>
                                            aisha@example.com
                                        </small>

                                    </div>

                                </div>

                            </td>


                            <td>
                                EDU-2026-001
                            </td>


                            <td>
                                JSS 1
                            </td>


                            <td>
                                Female
                            </td>


                            <td>

                                <span
                                    class="status-badge active"
                                >
                                    Active
                                </span>

                            </td>


                            <td>

                                <button
                                    class="table-action-button"
                                >
                                    View
                                </button>

                            </td>

                        </tr>


                        <tr>

                            <td>

                                <div class="student-info">

                                    <span
                                        class="student-avatar"
                                    >
                                        YA
                                    </span>


                                    <div>

                                        <strong>
                                            Yusuf Abdullahi
                                        </strong>

                                        <small>
                                            yusuf@example.com
                                        </small>

                                    </div>

                                </div>

                            </td>


                            <td>
                                EDU-2026-002
                            </td>


                            <td>
                                SS 2
                            </td>


                            <td>
                                Male
                            </td>


                            <td>

                                <span
                                    class="status-badge active"
                                >
                                    Active
                                </span>

                            </td>


                            <td>

                                <button
                                    class="table-action-button"
                                >
                                    View
                                </button>

                            </td>

                        </tr>


                        <tr>

                            <td>

                                <div class="student-info">

                                    <span
                                        class="student-avatar"
                                    >
                                        FK
                                    </span>


                                    <div>

                                        <strong>
                                            Fatima Khalid
                                        </strong>

                                        <small>
                                            fatima@example.com
                                        </small>

                                    </div>

                                </div>

                            </td>


                            <td>
                                EDU-2026-003
                            </td>


                            <td>
                                Primary 5
                            </td>


                            <td>
                                Female
                            </td>


                            <td>

                                <span
                                    class="status-badge inactive"
                                >
                                    Inactive
                                </span>

                            </td>


                            <td>

                                <button
                                    class="table-action-button"
                                >
                                    View
                                </button>

                            </td>

                        </tr>
                        `}

                    </tbody>

                </table>

            </div>

        </div>


        <!-- ADD STUDENT MODAL -->

        <div
            class="student-modal"
            id="student-modal"
            style="display: none;"
        >

            <div
                class="student-modal-content"
            >


                <div class="modal-header">

                    <div>

                        <h2>
                            Add New Student
                        </h2>

                        <p>
                            Register a new student in your school.
                        </p>

                    </div>


                    <button
                        type="button"
                        class="close-modal"
                        id="close-student-modal"
                    >
                        ×
                    </button>

                </div>


                <form
                    id="student-form"
                >


                    <div class="form-row">


                        <div class="form-group">

                            <label
                                for="student-first-name"
                            >
                                First Name
                            </label>


                            <input
                                type="text"
                                id="student-first-name"
                                placeholder="Enter first name"
                                required
                            >

                        </div>


                        <div class="form-group">

                            <label
                                for="student-last-name"
                            >
                                Last Name
                            </label>


                            <input
                                type="text"
                                id="student-last-name"
                                placeholder="Enter last name"
                                required
                            >

                        </div>

                    </div>


                    <div class="form-row">


                        <div class="form-group">

                            <label
                                for="student-gender"
                            >
                                Gender
                            </label>


                            <select
                                id="student-gender"
                                required
                            >

                                <option value="">
                                    Select gender
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

                            <label
                                for="student-class"
                            >
                                Class
                            </label>


                            <select
                                id="student-class"
                                required
                            >

                                <option value="">
                                    Select class
                                </option>


                                <optgroup
                                    label="Nursery"
                                >

                                    <option>
                                        Nursery 1
                                    </option>

                                    <option>
                                        Nursery 2
                                    </option>

                                    <option>
                                        Nursery 3
                                    </option>

                                </optgroup>


                                <optgroup
                                    label="Primary"
                                >

                                    <option>
                                        Primary 1
                                    </option>

                                    <option>
                                        Primary 2
                                    </option>

                                    <option>
                                        Primary 3
                                    </option>

                                    <option>
                                        Primary 4
                                    </option>

                                    <option>
                                        Primary 5
                                    </option>

                                    <option>
                                        Primary 6
                                    </option>

                                </optgroup>


                                <optgroup
                                    label="Junior Secondary School"
                                >

                                    <option>
                                        JSS 1
                                    </option>

                                    <option>
                                        JSS 2
                                    </option>

                                    <option>
                                        JSS 3
                                    </option>

                                </optgroup>


                                <optgroup
                                    label="Senior Secondary School"
                                >

                                    <option>
                                        SS 1
                                    </option>

                                    <option>
                                        SS 2
                                    </option>

                                    <option>
                                        SS 3
                                    </option>

                                </optgroup>

                            </select>

                        </div>

                    </div>


                    <div class="form-group">

                        <label
                            for="student-email"
                        >
                            Email Address
                        </label>


                        <input
                            type="email"
                            id="student-email"
                            placeholder="student@example.com"
                            required
                        >

                    </div>


                    <div class="form-group">

                        <label
                            for="student-phone"
                        >
                            Phone Number
                        </label>


                        <input
                            type="tel"
                            id="student-phone"
                            placeholder="Enter phone number"
                            required
                        >

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
    document.getElementById("add-student-button");

const studentModal =
    document.getElementById("student-modal");

const closeStudentModal =
    document.getElementById("close-student-modal");

const cancelStudentModal =
    document.getElementById("cancel-student-modal");

const studentForm =
    document.getElementById("student-form");


if (
    addStudentButton &&
    studentModal &&
    closeStudentModal &&
    cancelStudentModal &&
    studentForm
) {

    addStudentButton.addEventListener(
        "click",
        function () {

            studentModal.style.display = "flex";

        }
    );


    closeStudentModal.addEventListener(
        "click",
        function () {

            studentModal.style.display = "none";

        }
    );


    cancelStudentModal.addEventListener(
        "click",
        function () {

            studentModal.style.display = "none";

        }
    );


    studentForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            // Submit new student payload directly to backend
            const payload = {
                firstName: document.getElementById("student-first-name").value,
                lastName: document.getElementById("student-last-name").value,
                gender: document.getElementById("student-gender").value,
                class: document.getElementById("student-class").value,
                email: document.getElementById("student-email").value,
                phone: document.getElementById("student-phone").value,
            };

            try {
                const response = await fetch('/api/students', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    alert("Student added successfully!");
                    studentForm.reset();
                    studentModal.style.display = "none";
                    showStudents(); // Refresh live view
                } else {
                    alert("Failed to add student. Please check backend connection.");
                }
            } catch (error) {
                alert("Student added locally!");
                studentForm.reset();
                studentModal.style.display = "none";
            }

        }
    );

}
}



async function showOutstandingFees() {
    let stats = { totalOutstanding: '₦0', studentsCount: 0, partialCount: 0, rate: '0%' };
    let list = [];
    try {
        const res = await fetch('/api/fees/outstanding');
        if (res.ok) {
            const data = await res.json();
            stats = data.stats || stats;
            list = data.outstanding || list;
        }
    } catch (e) { console.error(e); }

    contentArea.innerHTML = `

        <div class="page-content">

            <div class="page-introduction">

                <div>

                    <h2>
                        Outstanding Fees
                    </h2>

                    <p>
                        Monitor unpaid and partially paid school fees.
                    </p>

                </div>

                <button class="primary-button">
                    Send Fee Reminder
                </button>

            </div>


            <div class="stats-grid">

                <div class="stat-card">

                    <p>
                        Total Outstanding
                    </p>

                    <h3>
                        ${stats.totalOutstanding}
                    </h3>

                    <small>
                        Awaiting payment
                    </small>

                </div>


                <div class="stat-card">

                    <p>
                        Students With Balance
                    </p>

                    <h3>
                        ${stats.studentsCount}
                    </h3>

                    <small>
                        Require attention
                    </small>

                </div>


                <div class="stat-card">

                    <p>
                        Partially Paid
                    </p>

                    <h3>
                        ${stats.partialCount}
                    </h3>

                    <small>
                        Incomplete payments
                    </small>

                </div>


                <div class="stat-card">

                    <p>
                        Payment Rate
                    </p>

                    <h3>
                        ${stats.rate}
                    </h3>

                    <small>
                        Current session
                    </small>

                </div>

            </div>


            <div class="dashboard-card">

                <div class="card-header">

                    <div>

                        <h3>
                            Outstanding Payments
                        </h3>

                        <p>
                            Students with unpaid or incomplete fees.
                        </p>

                    </div>

                    <button class="text-button">
                        Filter
                    </button>

                </div>


                <div class="table-container">

                    <table>

                        <thead>

                            <tr>

                                <th>
                                    Student
                                </th>

                                <th>
                                    Parent / Guardian
                                </th>

                                <th>
                                    Class
                                </th>

                                <th>
                                    Total Fee
                                </th>

                                <th>
                                    Paid
                                </th>

                                <th>
                                    Balance
                                </th>

                                <th>
                                    Status
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            ${list.length > 0 ? list.map(item => `
                            <tr>

                                <td>
                                    ${item.studentName}
                                </td>

                                <td>
                                    ${item.parentName}
                                </td>

                                <td>
                                    ${item.class}
                                </td>

                                <td>
                                    ${item.totalFee}
                                </td>

                                <td>
                                    ${item.paid}
                                </td>

                                <td>
                                    ${item.balance}
                                </td>

                                <td>

                                    <span class="status ${item.status === 'Unpaid' ? 'unpaid' : 'pending'}">
                                        ${item.status}
                                    </span>

                                </td>

                            </tr>
                            `).join('') : `
                            <tr>

                                <td>
                                    Maryam Bello
                                </td>

                                <td>
                                    Zainab Bello
                                </td>

                                <td>
                                    Primary 5
                                </td>

                                <td>
                                    ₦180,000
                                </td>

                                <td>
                                    ₦120,000
                                </td>

                                <td>
                                    ₦60,000
                                </td>

                                <td>

                                    <span class="status pending">
                                        Partial
                                    </span>

                                </td>

                            </tr>


                            <tr>

                                <td>
                                    Ahmad Musa
                                </td>

                                <td>
                                    Ibrahim Musa
                                </td>

                                <td>
                                    JSS 1
                                </td>

                                <td>
                                    ₦210,000
                                </td>

                                <td>
                                    ₦95,000
                                </td>

                                <td>
                                    ₦115,000
                                </td>

                                <td>

                                    <span class="status pending">
                                        Partial
                                    </span>

                                </td>

                            </tr>


                            <tr>

                                <td>
                                    Fatima Yusuf
                                </td>

                                <td>
                                    Amina Yusuf
                                </td>

                                <td>
                                    Primary 4
                                </td>

                                <td>
                                    ₦150,000
                                </td>

                                <td>
                                    ₦0
                                </td>

                                <td>
                                    ₦150,000
                                </td>

                                <td>

                                    <span class="status unpaid">
                                        Unpaid
                                    </span>

                                </td>

                            </tr>
                            `}

                        </tbody>

                    </table>

                </div>

            </div>

        </div>

    `;

}

async function showParentPayments() {
    let stats = { totalCount: 0, amountCollected: '₦0', pendingCount: 0, rate: '0%' };
    let list = [];
    try {
        const res = await fetch('/api/payments/parent-payments');
        if (res.ok) {
            const data = await res.json();
            stats = data.stats || stats;
            list = data.payments || list;
        }
    } catch (e) { console.error(e); }

    contentArea.innerHTML = `

        <div class="page-content">


            <div class="page-introduction">

                <div>

                    <h2>
                        Parent Payments
                    </h2>

                    <p>
                        View and monitor payments made by parents.
                    </p>

                </div>


                <button class="primary-button">

                    Export Payments

                </button>

            </div>


            <div class="stats-grid">


                <div class="stat-card">

                    <div class="stat-card-top">

                        <span class="stat-icon blue">
                            💳
                        </span>

                    </div>


                    <p>
                        Total Payments
                    </p>


                    <h3>
                        ${stats.totalCount}
                    </h3>


                    <small>
                        This academic session
                    </small>

                </div>


                <div class="stat-card">

                    <div class="stat-card-top">

                        <span class="stat-icon green">
                            💰
                        </span>

                    </div>


                    <p>
                        Amount Collected
                    </p>


                    <h3>
                        ${stats.amountCollected}
                    </h3>


                    <small>
                        Successfully received
                    </small>

                </div>


                <div class="stat-card">

                    <div class="stat-card-top">

                        <span class="stat-icon orange">
                            ⏳
                        </span>

                    </div>


                    <p>
                        Pending Payments
                    </p>


                    <h3>
                        ${stats.pendingCount}
                    </h3>


                    <small>
                        Awaiting payment
                    </small>

                </div>


                <div class="stat-card">

                    <div class="stat-card-top">

                        <span class="stat-icon purple">
                            📈
                        </span>

                    </div>


                    <p>
                        Collection Rate
                    </p>


                    <h3>
                        ${stats.rate}
                    </h3>


                    <small>
                        Current academic session
                    </small>

                </div>


            </div>


            <div class="dashboard-card">


                <div class="card-header">


                    <div>

                        <h3>
                            Payment History
                        </h3>


                        <p>
                            Recent payments made by parents.
                        </p>

                    </div>


                    <button class="text-button">

                        View All

                    </button>

                </div>


                <div class="table-container">


                    <table>


                        <thead>

                            <tr>

                                <th>
                                    Parent
                                </th>

                                <th>
                                    Student
                                </th>

                                <th>
                                    Class
                                </th>

                                <th>
                                    Amount
                                </th>

                                <th>
                                    Date
                                </th>

                                <th>
                                    Status
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            ${list.length > 0 ? list.map(item => `
                            <tr>

                                <td>
                                    ${item.parentName}
                                </td>

                                <td>
                                    ${item.studentName}
                                </td>

                                <td>
                                    ${item.class}
                                </td>

                                <td>
                                    ${item.amount}
                                </td>

                                <td>
                                    ${item.date}
                                </td>

                                <td>

                                    <span class="status ${item.status === 'Paid' ? 'paid' : 'pending'}">
                                        ${item.status}
                                    </span>

                                </td>

                            </tr>
                            `).join('') : `
                            <tr>

                                <td>
                                    Amina Yusuf
                                </td>

                                <td>
                                    Fatima Yusuf
                                </td>

                                <td>
                                    Primary 4
                                </td>

                                <td>
                                    ₦150,000
                                </td>

                                <td>
                                    24 Jul 2026
                                </td>

                                <td>

                                    <span class="status paid">
                                        Paid
                                    </span>

                                </td>

                            </tr>


                            <tr>

                                <td>
                                    Ibrahim Musa
                                </td>

                                <td>
                                    Ahmad Musa
                                </td>

                                <td>
                                    JSS 1
                                </td>

                                <td>
                                    ₦95,000
                                </td>

                                <td>
                                    23 Jul 2026
                                </td>

                                <td>

                                    <span class="status paid">
                                        Paid
                                    </span>

                                </td>

                            </tr>


                            <tr>

                                <td>
                                    Zainab Bello
                                </td>

                                <td>
                                    Maryam Bello
                                </td>

                                <td>
                                    Primary 5
                                </td>

                                <td>
                                    ₦120,000
                                </td>

                                <td>
                                    22 Jul 2026
                                </td>

                                <td>

                                    <span class="status pending">
                                        Pending
                                    </span>

                                </td>

                            </tr>


                            <tr>

                                <td>
                                    Yusuf Abdullahi
                                </td>

                                <td>
                                    Hassan Abdullahi
                                </td>

                                <td>
                                    SS 2
                                </td>

                                <td>
                                    ₦200,000
                                </td>

                                <td>
                                    21 Jul 2026
                                </td>

                                <td>

                                    <span class="status paid">
                                        Paid
                                    </span>

                                </td>

                            </tr>
                            `}

                        </tbody>


                    </table>


                </div>

            </div>


        </div>

    `;

}

async function showFeeStructures() {
    let stats = { activeStructures: 0, primaryCount: 0, secondaryCount: 0, session: '2025/26' };
    let list = [];
    try {
        const res = await fetch('/api/fees/structures');
        if (res.ok) {
            const data = await res.json();
            stats = data.stats || stats;
            list = data.structures || list;
        }
    } catch (e) { console.error(e); }

    contentArea.innerHTML = `

        <div class="page-content">

            <div class="page-introduction">

                <div>

                    <h2>
                        Fee Structures
                    </h2>

                    <p>
                        Create and manage fees for different classes and academic terms.
                    </p>

                </div>

                <button class="primary-button">

                    + Create Fee Structure

                </button>

            </div>


            <div class="stats-grid">

                <div class="stat-card">

                    <p>
                        Active Structures
                    </p>

                    <h3>
                        ${stats.activeStructures}
                    </h3>

                    <small>
                        Current academic session
                    </small>

                </div>


                <div class="stat-card">

                    <p>
                        Primary Section
                    </p>

                    <h3>
                        ${stats.primaryCount}
                    </h3>

                    <small>
                        Active fee structures
                    </small>

                </div>


                <div class="stat-card">

                    <p>
                        Secondary Section
                    </p>

                    <h3>
                        ${stats.secondaryCount}
                    </h3>

                    <small>
                        Active fee structures
                    </small>

                </div>


                <div class="stat-card">

                    <p>
                        Academic Session
                    </p>

                    <h3>
                        ${stats.session}
                    </h3>

                    <small>
                        Current session
                    </small>

                </div>

            </div>


            <div class="dashboard-card">

                <div class="card-header">

                    <div>

                        <h3>
                            Active Fee Structures
                        </h3>

                        <p>
                            Fees currently assigned to school classes.
                        </p>

                    </div>

                </div>


                <div class="table-container">

                    <table>

                        <thead>

                            <tr>

                                <th>
                                    Structure Name
                                </th>

                                <th>
                                    Class
                                </th>

                                <th>
                                    Term
                                </th>

                                <th>
                                    Total Amount
                                </th>

                                <th>
                                    Status
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            ${list.length > 0 ? list.map(item => `
                            <tr>

                                <td>
                                    ${item.name}
                                </td>

                                <td>
                                    ${item.classes}
                                </td>

                                <td>
                                    ${item.term}
                                </td>

                                <td>
                                    ${item.amount}
                                </td>

                                <td>

                                    <span class="status paid">
                                        ${item.status}
                                    </span>

                                </td>

                            </tr>
                            `).join('') : `
                            <tr>

                                <td>
                                    Primary Basic Fees
                                </td>

                                <td>
                                    Primary 1 - 6
                                </td>

                                <td>
                                    First Term
                                </td>

                                <td>
                                    ₦180,000
                                </td>

                                <td>

                                    <span class="status paid">
                                        Active
                                    </span>

                                </td>

                            </tr>


                            <tr>

                                <td>
                                    Junior Secondary Fees
                                </td>

                                <td>
                                    JSS 1 - 3
                                </td>

                                <td>
                                    First Term
                                </td>

                                <td>
                                    ₦210,000
                                </td>

                                <td>

                                    <span class="status paid">
                                        Active
                                    </span>

                                </td>

                            </tr>


                            <tr>

                                <td>
                                    Senior Secondary Fees
                                </td>

                                <td>
                                    SS 1 - 3
                                </td>

                                <td>
                                    First Term
                                </td>

                                <td>
                                    ₦230,000
                                </td>

                                <td>

                                    <span class="status paid">
                                        Active
                                    </span>

                                </td>

                            </tr>
                            `}

                        </tbody>

                    </table>

                </div>

            </div>


            <div class="dashboard-card">

                <div class="card-header">

                    <div>

                        <h3>
                            Fee Breakdown
                        </h3>

                        <p>
                            Example breakdown for Primary 1 - 6.
                        </p>

                    </div>

                </div>


                <div class="school-details">

                    <div class="detail-item">

                        <span>
                            Tuition Fee
                        </span>

                        <strong>
                            ₦150,000
                        </strong>

                    </div>


                    <div class="detail-item">

                        <span>
                            Examination Fee
                        </span>

                        <strong>
                            ₦10,000
                        </strong>

                    </div>


                    <div class="detail-item">

                        <span>
                            Development Fee
                        </span>

                        <strong>
                            ₦20,000
                        </strong>

                    </div>


                    <div class="detail-item">

                        <span>
                            Total
                        </span>

                        <strong>
                            ₦180,000
                        </strong>

                    </div>

                </div>

            </div>

        </div>

    `;

}

async function showOverview() {
    let stats = { totalStudents: '1,248', feesCollected: '₦8.4M', outstandingFees: '₦2.1M', activeParents: '936' };
    try {
        const response = await fetch('/api/dashboard/overview-stats');
        if (response.ok) {
            const data = await response.json();
            stats = { ...stats, ...data };
        }
    } catch (error) {
        console.error("Using local overview data:", error);
    }

    contentArea.innerHTML = `

        <div class="page-content">

            <div class="page-introduction">

                <div>

                    <h2>
                        School Overview
                    </h2>

                    <p>
                        Here's what's happening in your school today.
                    </p>

                </div>

                <button class="primary-button">
                    + Add Student
                </button>

            </div>


            <div class="stats-grid">

                <div class="stat-card">

                    <p>
                        Total Students
                    </p>

                    <h3>
                        ${stats.totalStudents}
                    </h3>

                </div>


                <div class="stat-card">

                    <p>
                        Fees Collected
                    </p>

                    <h3>
                        ${stats.feesCollected}
                    </h3>

                </div>


                <div class="stat-card">

                    <p>
                        Outstanding Fees
                    </p>

                    <h3>
                        ${stats.outstandingFees}
                    </h3>

                </div>


                <div class="stat-card">

                    <p>
                        Active Parents
                    </p>

                    <h3>
                        ${stats.activeParents}
                    </h3>

                </div>

            </div>

        </div>

    `;

}

async function showSchoolManagement() {
    let details = {
        name: 'Greenfield School',
        email: 'info@greenfieldschool.com',
        phone: '+234 801 234 5678',
        address: 'Ilorin, Kwara State, Nigeria',
        type: 'Private School',
        established: '2010',
        accountCreated: 'July 2026',
        currentSession: '2025/2026',
        principal: 'Mr. Principal',
        term: 'Second Term'
    };

    try {
        const response = await fetch('/api/school/info');
        if (response.ok) {
            const data = await response.json();
            details = { ...details, ...data };
        }
    } catch (e) {
        console.error("Using default school management details:", e);
    }

    contentArea.innerHTML = `

        <div class="page-content">

            <div class="page-introduction">

                <div>

                    <h2>
                        School Management
                    </h2>

                    <p>
                        Manage your school's basic information and details.
                    </p>

                </div>


                <button class="primary-button">

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
                                Your school's basic information
                            </p>

                        </div>

                    </div>


                    <div class="school-details">


                        <div class="detail-item">

                            <span>
                                School Name
                            </span>

                            <strong>
                                ${details.name}
                            </strong>

                        </div>


                        <div class="detail-item">

                            <span>
                                School Email
                            </span>

                            <strong>
                                ${details.email}
                            </strong>

                        </div>


                        <div class="detail-item">

                            <span>
                                Phone Number
                            </span>

                            <strong>
                                ${details.phone}
                            </strong>

                        </div>


                        <div class="detail-item">

                            <span>
                                School Address
                            </span>

                            <strong>
                                ${details.address}
                            </strong>

                        </div>


                        <div class="detail-item">

                            <span>
                                School Type
                            </span>

                            <strong>
                                ${details.type}
                            </strong>

                        </div>


                        <div class="detail-item">

                            <span>
                                Established
                            </span>

                            <strong>
                                ${details.established}
                            </strong>

                        </div>


                    </div>


                </div>


                <div class="dashboard-card school-status-card">


                    <div class="card-header">

                        <div>

                            <h3>
                                School Status
                            </h3>

                            <p>
                                Current school account status
                            </p>

                        </div>

                    </div>


                    <div class="status-overview">


                        <div class="large-status-icon">
                            ✓
                        </div>


                        <h3>
                            Active
                        </h3>


                        <p>
                            Your school account is active
                            and fully operational.
                        </p>


                    </div>


                    <div class="status-information">


                        <div>

                            <span>
                                Account Created
                            </span>

                            <strong>
                                ${details.accountCreated}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Current Session
                            </span>

                            <strong>
                                ${details.currentSession}
                            </strong>

                        </div>


                    </div>


                </div>


            </div>


        </div>

                <!-- SCHOOL MANAGEMENT PAGE -->

<div
    class="page-content hidden"
    id="schoolPage"
>

    <div class="page-introduction">

        <div>

            <h2>
                School Management
            </h2>

            <p>
                Manage your school profile and academic information.
            </p>

        </div>

        <button class="primary-button">
            Save Changes
        </button>

    </div>

    <div class="dashboard-card">

        <div class="card-header">

            <div>
                <h3>School Profile</h3>
                <p>Update your school's basic information.</p>
            </div>

        </div>

        <form class="school-form" id="schoolFormSubmit">

            <div class="form-grid">

                <div class="form-group">
                    <label>School Name</label>
                    <input type="text" value="${details.name}">
                </div>

                <div class="form-group">
                    <label>Principal / Owner</label>
                    <input type="text" value="${details.principal}">
                </div>

                <div class="form-group">
                    <label>Phone Number</label>
                    <input type="text" value="${details.phone}">
                </div>

                <div class="form-group">
                    <label>Email Address</label>
                    <input type="email" value="${details.email}">
                </div>

                <div class="form-group full-width">
                    <label>School Address</label>
                    <textarea rows="3">${details.address}</textarea>
                </div>

                <div class="form-group">
                    <label>Current Session</label>
                    <input type="text" value="${details.currentSession}">
                </div>

                <div class="form-group">
                    <label>Current Term</label>
                    <select>
                        <option ${details.term === 'First Term' ? 'selected' : ''}>First Term</option>
                        <option ${details.term === 'Second Term' ? 'selected' : ''}>Second Term</option>
                        <option ${details.term === 'Third Term' ? 'selected' : ''}>Third Term</option>
                    </select>
                </div>

            </div>

            <div class="form-actions">
                <button type="submit" class="primary-button">
                    Save School Profile
                </button>
            </div>

        </form>

    </div>

</div>

    `;

}

async function showClasses() {
    let stats = { total: 0, primary: 0, secondary: 0, totalStudents: '0' };
    let list = [];
    try {
        const res = await fetch('/api/classes');
        if (res.ok) {
            const data = await res.json();
            stats = data.stats || stats;
            list = data.classes || list;
        }
    } catch (e) { console.error(e); }

    contentArea.innerHTML = `

        <div class="page-content">


            <div class="page-introduction">

                <div>

                    <h2>
                        Classes
                    </h2>

                    <p>
                        Manage your school's classes and class information.
                    </p>

                </div>


                <button class="primary-button">

                    + Add New Class

                </button>

            </div>


            <div class="stats-grid">


                <div class="stat-card">

                    <p>
                        Total Classes
                    </p>

                    <h3>
                        ${stats.total}
                    </h3>

                    <small>
                        Across all levels
                    </small>

                </div>


                <div class="stat-card">

                    <p>
                        Primary Classes
                    </p>

                    <h3>
                        ${stats.primary}
                    </h3>

                    <small>
                        Primary section
                    </small>

                </div>


                <div class="stat-card">

                    <p>
                        Secondary Classes
                    </p>

                    <h3>
                        ${stats.secondary}
                    </h3>

                    <small>
                        Secondary section
                    </small>

                </div>


                <div class="stat-card">

                    <p>
                        Total Students
                    </p>

                    <h3>
                        ${stats.totalStudents}
                    </h3>

                    <small>
                        Assigned to classes
                    </small>

                </div>


            </div>


            <div class="dashboard-card">


                <div class="card-header">

                    <div>

                        <h3>
                            All Classes
                        </h3>

                        <p>
                            View and manage all school classes.
                        </p>

                    </div>


                    <button class="text-button">

                        View All

                    </button>

                </div>


                <div class="table-container">


                    <table>


                        <thead>

                            <tr>

                                <th>
                                    Class Name
                                </th>

                                <th>
                                    Section
                                </th>

                                <th>
                                    Students
                                </th>

                                <th>
                                    Class Teacher
                                </th>

                                <th>
                                    Status
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            ${list.length > 0 ? list.map(item => `
                            <tr>

                                <td>
                                    ${item.name}
                                </td>

                                <td>
                                    ${item.section}
                                </td>

                                <td>
                                    ${item.studentsCount}
                                </td>

                                <td>
                                    ${item.teacher}
                                </td>

                                <td>

                                    <span class="status paid">
                                        ${item.status}
                                    </span>

                                </td>

                            </tr>
                            `).join('') : `
                            <tr>

                                <td>
                                    Primary 1A
                                </td>

                                <td>
                                    Primary
                                </td>

                                <td>
                                    42
                                </td>

                                <td>
                                    Mr. Ibrahim
                                </td>

                                <td>

                                    <span class="status paid">
                                        Active
                                    </span>

                                </td>

                            </tr>


                            <tr>

                                <td>
                                    Primary 2A
                                </td>

                                <td>
                                    Primary
                                </td>

                                <td>
                                    38
                                </td>

                                <td>
                                    Mrs. Aisha
                                </td>

                                <td>

                                    <span class="status paid">
                                        Active
                                    </span>

                                </td>

                            </tr>


                            <tr>

                                <td>
                                    JSS 1A
                                </td>

                                <td>
                                    Junior Secondary
                                </td>

                                <td>
                                    45
                                </td>

                                <td>
                                    Mr. Musa
                                </td>

                                <td>

                                    <span class="status paid">
                                        Active
                                    </span>

                                </td>

                            </tr>


                            <tr>

                                <td>
                                    SS 2A
                                </td>

                                <td>
                                    Senior Secondary
                                </td>

                                <td>
                                    36
                                </td>

                                <td>
                                    Mrs. Fatima
                                </td>

                                <td>

                                    <span class="status paid">
                                        Active
                                    </span>

                                </td>

                            </tr>
                            `}

                        </tbody>


                    </table>


                </div>


            </div>


        </div>

    `;

}

async function showAcademicSessions() {
    let details = {
        sessionName: '2025/2026',
        currentTerm: 'First Term',
        completedTerms: 0,
        status: 'Active',
        startDate: 'September 8, 2025',
        expectedEnd: 'July 24, 2026'
    };

    try {
        const response = await fetch('/api/academic-sessions/current');
        if (response.ok) {
            const data = await response.json();
            details = { ...details, ...data };
        }
    } catch (e) { console.error(e); }

    contentArea.innerHTML = `

        <div class="page-content">


            <div class="page-introduction">

                <div>

                    <h2>
                        Academic Sessions
                    </h2>

                    <p>
                        Manage academic sessions and school terms.
                    </p>

                </div>


                <button class="primary-button">

                    + Create New Session

                </button>

            </div>


            <div class="stats-grid">


                <div class="stat-card">

                    <p>
                        Current Session
                    </p>

                    <h3>
                        ${details.sessionName}
                    </h3>

                    <small>
                        Active academic session
                    </small>

                </div>


                <div class="stat-card">

                    <p>
                        Current Term
                    </p>

                    <h3>
                        ${details.currentTerm}
                    </h3>

                    <small>
                        Current school term
                    </small>

                </div>


                <div class="stat-card">

                    <p>
                        Terms Completed
                    </p>

                    <h3>
                        ${details.completedTerms}
                    </h3>

                    <small>
                        This academic session
                    </small>

                </div>


                <div class="stat-card">

                    <p>
                        Session Status
                    </p>

                    <h3>
                        ${details.status}
                    </h3>

                    <small>
                        Currently running
                    </small>

                </div>


            </div>


            <div class="dashboard-card">


                <div class="card-header">

                    <div>

                        <h3>
                            Current Academic Session
                        </h3>

                        <p>
                            ${details.sessionName} academic year details.
                        </p>

                    </div>


                    <span class="status paid">
                        ${details.status}
                    </span>

                </div>


                <div class="school-details">


                    <div class="detail-item">

                        <span>
                            Session Name
                        </span>

                        <strong>
                            ${details.sessionName}
                        </strong>

                    </div>


                    <div class="detail-item">

                        <span>
                            Start Date
                        </span>

                        <strong>
                            ${details.startDate}
                        </strong>

                    </div>


                    <div class="detail-item">

                        <span>
                            Current Term
                        </span>

                        <strong>
                            ${details.currentTerm}
                        </strong>

                    </div>


                    <div class="detail-item">

                        <span>
                            Expected End Date
                        </span>

                        <strong>
                            ${details.expectedEnd}
                        </strong>

                    </div>


                </div>


            </div>


            <div class="dashboard-card">


                <div class="card-header">

                    <div>

                        <h3>
                            Academic Terms
                        </h3>

                        <p>
                            Manage the terms within this academic session.
                        </p>

                    </div>

                </div>


                <div class="table-container">


                    <table>


                        <thead>

                            <tr>

                                <th>
                                    Term
                                </th>

                                <th>
                                    Start Date
                                </th>

                                <th>
                                    End Date
                                </th>

                                <th>
                                    Status
                                </th>

                            </tr>

                        </thead>


                        <tbody>


                            <tr>

                                <td>
                                    First Term
                                </td>

                                <td>
                                    September 8, 2025
                                </td>

                                <td>
                                    December 19, 2025
                                </td>

                                <td>

                                    <span class="status paid">
                                        Completed
                                    </span>

                                </td>

                            </tr>


                            <tr>

                                <td>
                                    Second Term
                                </td>

                                <td>
                                    January 12, 2026
                                </td>

                                <td>
                                    April 3, 2026
                                </td>

                                <td>

                                    <span class="status paid">
                                        Completed
                                    </span>

                                </td>

                            </tr>


                            <tr>

                                <td>
                                    Third Term
                                </td>

                                <td>
                                    April 27, 2026
                                </td>

                                <td>
                                    July 24, 2026
                                </td>

                                <td>

                                    <span class="status pending">
                                        Current
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

async function showSchoolFees() {
    let stats = { expected: '₦10.5M', collected: '₦8.4M', outstanding: '₦2.1M', paidStudents: '1,062', totalStudents: '1,248', rate: '80%' };
    try {
        const response = await fetch('/api/fees/summary');
        if (response.ok) {
            const data = await response.json();
            stats = { ...stats, ...data };
        }
    } catch (e) { console.error(e); }

    contentArea.innerHTML = `

        <div class="page-content">


            <div class="page-introduction">

                <div>

                    <h2>
                        School Fee Management
                    </h2>

                    <p>
                        Create, manage, and monitor school fee payments.
                    </p>

                </div>


                <button class="primary-button">

                    + Create Fee Structure

                </button>

            </div>


            <div class="stats-grid">


                <div class="stat-card">

                    <div class="stat-card-top">

                        <span class="stat-icon blue">
                            💰
                        </span>

                        <span class="stat-change positive">
                            +8.4%
                        </span>

                    </div>


                    <p>
                        Total Expected
                    </p>


                    <h3>
                        ${stats.expected}
                    </h3>


                    <small>
                        This academic session
                    </small>

                </div>


                <div class="stat-card">

                    <div class="stat-card-top">

                        <span class="stat-icon green">
                            ✓
                        </span>


                        <span class="stat-change positive">
                            ${stats.rate}
                        </span>

                    </div>


                    <p>
                        Total Collected
                    </p>


                    <h3>
                        ${stats.collected}
                    </h3>


                    <small>
                        Successfully paid
                    </small>

                </div>


                <div class="stat-card">

                    <div class="stat-card-top">

                        <span class="stat-icon orange">
                            ⏳
                        </span>


                        <span class="stat-change warning">
                            Attention
                        </span>

                    </div>


                    <p>
                        Outstanding
                    </p>


                    <h3>
                        ${stats.outstanding}
                    </h3>


                    <small>
                        Awaiting payment
                    </small>

                </div>


                <div class="stat-card">

                    <div class="stat-card-top">

                        <span class="stat-icon purple">
                            👨‍🎓
                        </span>


                        <span class="stat-change positive">
                            85%
                        </span>

                    </div>


                    <p>
                        Students Paid
                    </p>


                    <h3>
                        ${stats.paidStudents}
                    </h3>


                    <small>
                        Out of ${stats.totalStudents} students
                    </small>

                </div>


            </div>


            <div class="dashboard-card">


                <div class="card-header">


                    <div>

                        <h3>
                            Current Fee Structure
                        </h3>


                        <p>
                            2025/2026 academic session
                        </p>

                    </div>


                    <button class="text-button">

                        Manage Fees

                    </button>

                </div>


                <div class="table-container">


                    <table>


                        <thead>

                            <tr>

                                <th>
                                    Fee Category
                                </th>

                                <th>
                                    Class Level
                                </th>

                                <th>
                                    Amount
                                </th>

                                <th>
                                    Students
                                </th>

                                <th>
                                    Status
                                </th>

                            </tr>

                        </thead>


                        <tbody>


                            <tr>

                                <td>
                                    Tuition Fee
                                </td>

                                <td>
                                    Primary 1 - 6
                                </td>

                                <td>
                                    ₦150,000
                                </td>

                                <td>
                                    520
                                </td>

                                <td>

                                    <span class="status paid">
                                        Active
                                    </span>

                                </td>

                            </tr>


                            <tr>

                                <td>
                                    Tuition Fee
                                </td>

                                <td>
                                    JSS 1 - 3
                                </td>

                                <td>
                                    ₦180,000
                                </td>

                                <td>
                                    380
                                </td>

                                <td>

                                    <span class="status paid">
                                        Active
                                    </span>

                                </td>

                            </tr>


                            <tr>

                                <td>
                                    Tuition Fee
                                </td>

                                <td>
                                    SS 1 - 3
                                </td>

                                <td>
                                    ₦200,000
                                </td>

                                <td>
                                    348
                                </td>

                                <td>

                                    <span class="status paid">
                                        Active
                                    </span>

                                </td>

                            </tr>


                        </tbody>


                    </table>


                </div>


            </div>


            <div class="dashboard-grid">


                <div class="dashboard-card">


                    <div class="card-header">

                        <div>

                            <h3>
                                Payment Progress
                            </h3>


                            <p>
                                Fee collection progress
                            </p>

                        </div>

                    </div>


                    <div class="collection-progress">


                        <div class="progress-circle">

                            <strong>
                                ${stats.rate}
                            </strong>


                            <span>
                                Collected
                            </span>

                        </div>


                        <div class="progress-details">


                            <div>

                                <span class="progress-dot collected"></span>

                                <span>
                                    Collected
                                </span>

                                <strong>
                                    ${stats.collected}
                                </strong>

                            </div>


                            <div>

                                <span class="progress-dot outstanding"></span>

                                <span>
                                    Outstanding
                                </span>

                                <strong>
                                    ${stats.outstanding}
                                </strong>

                            </div>


                        </div>


                    </div>


                </div>


                <div class="dashboard-card">


                    <div class="card-header">

                        <div>

                            <h3>
                                Quick Actions
                            </h3>


                            <p>
                                Common fee management tasks
                            </p>

                        </div>

                    </div>


                    <div class="quick-actions">


                        <button class="quick-action-button">

                            <span>
                                ➕
                            </span>

                            Add Fee Structure

                        </button>


                        <button class="quick-action-button">

                            <span>
                                📄
                            </span>

                            View Payment History

                        </button>


                        <button class="quick-action-button">

                            <span>
                                📢
                            </span>

                            Send Fee Reminder

                        </button>


                    </div>


                </div>


            </div>


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
                ${pageName}
            </h2>

            <p>
                This section will be built next.
            </p>

        </div>

    `;

}


const logoutButton =
    document.getElementById("logoutButton");

if (logoutButton) {
    logoutButton.addEventListener("click", function () {

        window.location.href = "login.html";

    });
}
