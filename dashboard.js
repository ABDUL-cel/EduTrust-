/* =============================================================
   EDUTRUST PRINCIPAL DASHBOARD
   COMPLETE FRONTEND CONTROLLER
   -------------------------------------------------------------
   IMPORTANT:
   - This file DOES NOT rebuild or replace dashboard HTML.
   - It keeps your existing sidebar, cards, grids and page sections.
   - It only switches existing .page-content sections and hydrates
     them with real backend data.
   ============================================================= */

(() => {
    "use strict";

    const API_BASE_URL =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1"
            ? "http://localhost:5000/api"
            : "https://edutrust-15ii.onrender.com/api";

    const TOKEN_KEYS = ["edutrust_token", "token"];

    const navItems = document.querySelectorAll(
        ".nav-item[data-page], .submenu-item[data-page]"
    );

    const pageTitle =
        document.getElementById("pageTitle");

    const contentArea =
        document.getElementById("contentArea");

    const sidebar =
        document.querySelector(".sidebar");

    const menuToggle =
        document.getElementById("menu-toggle");

    const logoutButton =
        document.getElementById("logoutButton");

    const notificationButton =
        document.getElementById("notification-button");

    const notificationDropdown =
        document.getElementById("notification-dropdown");

    const themeToggle =
        document.getElementById("theme-toggle");

    const globalSearch =
        document.getElementById("global-search");

    let dashboardData = null;


    /* =============================================================
       AUTH
       ============================================================= */

    function getToken() {

        for (const key of TOKEN_KEYS) {

            const token =
                localStorage.getItem(key);

            if (token) {
                return token;
            }
        }

        return "";
    }


    function clearAuth() {

        [
            "edutrust_token",
            "token",
            "school_id",
            "school",
            "user",
            "principal",
            "dashboard"
        ].forEach(key => {

            localStorage.removeItem(key);

        });
    }


    function authHeaders(json = false) {

        const token =
            getToken();

        const headers = {};

        if (json) {

            headers["Content-Type"] =
                "application/json";
        }

        if (token) {

            headers.Authorization =
                `Bearer ${token}`;
        }

        return headers;
    }


    async function apiRequest(
        path,
        options = {}
    ) {

        const response =
            await fetch(
                `${API_BASE_URL}${path}`,
                {
                    ...options,

                    headers: {
                        ...authHeaders(
                            Boolean(options.body)
                        ),

                        ...(options.headers || {})
                    }
                }
            );


        let data = {};


        try {

            data =
                await response.json();

        } catch (_) {

            data = {};
        }


        if (response.status === 401) {

            clearAuth();

            window.location.href =
                "index.html";

            throw new Error(
                "Your session has expired. Please login again."
            );
        }


        if (
            !response.ok ||
            data.success === false
        ) {

            throw new Error(
                data.message ||
                `Request failed with status ${response.status}.`
            );
        }


        return data;
    }


    async function apiGet(path) {

        return apiRequest(
            path,
            {
                method: "GET"
            }
        );
    }


    async function apiPut(
        path,
        body
    ) {

        return apiRequest(
            path,
            {
                method: "PUT",
                body: JSON.stringify(body)
            }
        );
    }


    /* =============================================================
       HELPERS
       ============================================================= */

    function escapeHtml(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    function fullName(person) {

        const name = [
            person?.first_name,
            person?.other_name,
            person?.last_name
        ]
            .filter(Boolean)
            .join(" ")
            .trim();


        return (
            name ||
            person?.full_name ||
            "Unknown"
        );
    }


    function initials(name) {

        return String(
            name || "U"
        )
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map(
                part =>
                    part.charAt(0).toUpperCase()
            )
            .join("");
    }


    function formatDate(value) {

        if (!value) {
            return "—";
        }


        const date =
            new Date(value);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return "—";
        }


        return date.toLocaleDateString(
            "en-NG",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    }


    function formatNumber(value) {

        return Number(
            value || 0
        ).toLocaleString(
            "en-NG"
        );
    }


    function statusClass(status) {

        const value =
            String(
                status || ""
            ).toLowerCase();


        if (
            value === "active" ||
            value === "paid" ||
            value === "completed"
        ) {

            return "paid";
        }


        return "pending";
    }


    function getPageElement(page) {

        return document.getElementById(
            `${page}Page`
        );
    }


    function getCurrentPage() {

        const visible =
            document.querySelector(
                ".page-content:not(.hidden)"
            );


        return (
            visible?.id?.replace(
                /Page$/,
                ""
            ) ||
            "overview"
        );
    }


    function toast(
        message,
        type = "success"
    ) {

        const toastElement =
            document.getElementById(
                "toast"
            );


        if (!toastElement) {

            console.log(message);

            return;
        }


        toastElement.textContent =
            message;


        toastElement.className =
            `toast show ${type}`;


        window.clearTimeout(
            toast._timer
        );


        toast._timer =
            window.setTimeout(
                () => {

                    toastElement.classList.remove(
                        "show"
                    );

                },
                3500
            );
    }


    /* =============================================================
       PAGE NAVIGATION
       ============================================================= */

    function showPage(
        page,
        clickedItem = null
    ) {

        if (!contentArea) {
            return;
        }


        const target =
            getPageElement(page);


        if (!target) {

            console.warn(
                `Dashboard page '${page}' was not found in dashboard.html.`
            );

            return;
        }


        document
            .querySelectorAll(
                ".page-content"
            )
            .forEach(
                section => {

                    section.classList.add(
                        "hidden"
                    );

                }
            );


        target.classList.remove(
            "hidden"
        );


        navItems.forEach(
            item =>
                item.classList.remove(
                    "active"
                )
        );


        if (clickedItem) {

            clickedItem.classList.add(
                "active"
            );

        } else {

            document
                .querySelectorAll(
                    `[data-page="${CSS.escape(page)}"]`
                )
                .forEach(
                    item =>
                        item.classList.add(
                            "active"
                        )
                );
        }


        if (pageTitle) {

            const label =
                clickedItem
                    ? clickedItem.textContent.trim()
                    : document
                        .querySelector(
                            `[data-page="${CSS.escape(page)}"]`
                        )
                        ?.textContent
                        ?.trim();


            if (label) {

                pageTitle.textContent =
                    label;
            }
        }


        if (
            window.innerWidth <= 768 &&
            sidebar
        ) {

            sidebar.classList.remove(
                "show"
            );
        }


        if (page === "overview") {

            hydrateOverview();
        }


        if (
            page === "school" ||
            page === "school-profile"
        ) {

            hydrateSchoolPages();
        }


        if (page === "students") {

            hydrateStudentsPage();
        }


        if (page === "parents") {

            hydrateParentsPage();
        }


        if (page === "staff") {

            hydrateStaffPage();
        }
    }


    function setupNavigation() {

        navItems.forEach(
            item => {

                item.addEventListener(
                    "click",
                    event => {

                        event.preventDefault();


                        const page =
                            item.getAttribute(
                                "data-page"
                            );


                        if (!page) {
                            return;
                        }


                        showPage(
                            page,
                            item
                        );
                    }
                );
            }
        );


        document
            .querySelectorAll(
                ".text-button[data-page]"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        event => {

                            event.preventDefault();

                            const page =
                                button.getAttribute(
                                    "data-page"
                                );

                            if (page) {

                                showPage(
                                    page
                                );
                            }
                        }
                    );
                }
            );
    }


    /* =============================================================
       SIDEBAR
       ============================================================= */

    function setupSidebar() {

        if (
            menuToggle &&
            sidebar
        ) {

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


        const settingsToggle =
            document.querySelector(
                ".settings-toggle"
            );


        const reportsToggle =
            document.querySelector(
                ".reports-toggle"
            );


        if (settingsToggle) {

            const group =
                settingsToggle.closest(
                    ".nav-group"
                );


            settingsToggle.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    group?.classList.toggle(
                        "open"
                    );
                }
            );
        }


        if (reportsToggle) {

            const group =
                reportsToggle.closest(
                    ".nav-group"
                );


            reportsToggle.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    group?.classList.toggle(
                        "open"
                    );
                }
            );
        }
    }


    /* =============================================================
       NOTIFICATIONS
       ============================================================= */

    function setupNotifications() {

        if (
            !notificationButton ||
            !notificationDropdown
        ) {

            return;
        }


        notificationButton.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                notificationDropdown.classList.toggle(
                    "show"
                );
            }
        );


        notificationDropdown.addEventListener(
            "click",
            event => {

                event.stopPropagation();
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


    /* =============================================================
       THEME
       ============================================================= */

    function setupTheme() {

        const savedTheme =
            localStorage.getItem(
                "edutrust_theme"
            );


        if (
            savedTheme === "dark"
        ) {

            document.body.classList.add(
                "dark-mode"
            );


            if (themeToggle) {

                themeToggle.textContent =
                    "☀️";
            }
        }


        if (!themeToggle) {
            return;
        }


        themeToggle.addEventListener(
            "click",
            () => {

                const dark =
                    document.body.classList.toggle(
                        "dark-mode"
                    );


                localStorage.setItem(
                    "edutrust_theme",
                    dark
                        ? "dark"
                        : "light"
                );


                themeToggle.textContent =
                    dark
                        ? "☀️"
                        : "🌙";
            }
        );
    }


    /* =============================================================
       LOGOUT
       ============================================================= */

    function setupLogout() {

        if (!logoutButton) {
            return;
        }


        logoutButton.addEventListener(
            "click",
            () => {

                clearAuth();

                window.location.href =
                    "index.html";
            }
        );
    }


    /* =============================================================
       GLOBAL SEARCH
       ============================================================= */

    function setupSearch() {

        if (!globalSearch) {
            return;
        }


        globalSearch.addEventListener(
            "input",
            () => {

                const query =
                    globalSearch.value
                        .trim()
                        .toLowerCase();


                if (!query) {

                    document
                        .querySelectorAll(
                            ".page-content:not(.hidden) tbody tr"
                        )
                        .forEach(
                            row => {

                                row.style.display =
                                    "";
                            }
                        );

                    return;
                }


                document
                    .querySelectorAll(
                        ".page-content:not(.hidden) tbody tr"
                    )
                    .forEach(
                        row => {

                            row.style.display =
                                row.textContent
                                    .toLowerCase()
                                    .includes(query)
                                    ? ""
                                    : "none";
                        }
                    );
            }
        );
    }


    /* =============================================================
       SCHOOL HEADER
       ============================================================= */

    function hydrateSchoolHeader(
        school,
        user
    ) {

        if (!school) {
            return;
        }


        document
            .querySelectorAll(
                ".school-profile h3"
            )
            .forEach(
                element => {

                    element.textContent =
                        school.name ||
                        "School";
                }
            );


        document
            .querySelectorAll(
                ".school-profile p"
            )
            .forEach(
                element => {

                    element.textContent =
                        user?.role ||
                        "Administrator";
                }
            );


        const avatar =
            document.querySelector(
                ".school-avatar"
            );


        if (avatar) {

            avatar.textContent =
                initials(
                    school.name
                );
        }


        const profileButton =
            document.getElementById(
                "profile-button"
            );


        if (profileButton) {

            const strong =
                profileButton.querySelector(
                    "strong"
                );


            const small =
                profileButton.querySelector(
                    "small"
                );


            const avatarElement =
                profileButton.querySelector(
                    ".profile-avatar"
                );


            if (strong) {

                strong.textContent =
                    user?.full_name ||
                    fullName(user) ||
                    "Principal";
            }


            if (small) {

                small.textContent =
                    user?.role ||
                    "Principal";
            }


            if (avatarElement) {

                avatarElement.textContent =
                    initials(
                        user?.full_name ||
                        fullName(user)
                    );
            }
        }
    }


    /* =============================================================
       STAT CARDS
       ============================================================= */

    function findStatCard(
        label,
        root = document
    ) {

        const cards =
            root.querySelectorAll(
                ".stat-card"
            );


        const wanted =
            String(
                label
            ).toLowerCase();


        for (const card of cards) {

            const text =
                card.textContent
                    .replace(
                        /\s+/g,
                        " "
                    )
                    .trim()
                    .toLowerCase();


            if (
                text.includes(
                    wanted
                )
            ) {

                return card;
            }
        }


        return null;
    }


    function setStat(
        label,
        value,
        root = document
    ) {

        const card =
            findStatCard(
                label,
                root
            );


        if (!card) {
            return;
        }


        const heading =
            card.querySelector(
                "h2, h3"
            );


        if (heading) {

            heading.textContent =
                value;
        }
    }


    /* =============================================================
       DASHBOARD OVERVIEW
       ============================================================= */

    async function loadDashboardOverview() {

        const data =
            await apiGet(
                "/dashboard/overview"
            );


        dashboardData =
            data;


        if (data.school) {

            localStorage.setItem(
                "school",
                JSON.stringify(
                    data.school
                )
            );


            localStorage.setItem(
                "school_id",
                String(
                    data.school.id ||
                    ""
                )
            );
        }


        if (data.user) {

            localStorage.setItem(
                "user",
                JSON.stringify(
                    data.user
                )
            );
        }


        return data;
    }


    function hydrateOverviewFromData(
        data
    ) {

        if (!data) {
            return;
        }


        const stats =
            data.statistics ||
            {};


        const finance =
            data.finance ||
            {};


        const overview =
            getPageElement(
                "overview"
            );


        if (!overview) {
            return;
        }


        setStat(
            "Total Students",
            formatNumber(
                stats.totalStudents
            ),
            overview
        );


        setStat(
            "Active Parents",
            formatNumber(
                stats.activeParents
            ),
            overview
        );


        if (
            finance.feesCollected !==
                null &&
            finance.feesCollected !==
                undefined
        ) {

            setStat(
                "Fees Collected",
                finance.feesCollected,
                overview
            );
        }


        if (
            finance.outstandingFees !==
                null &&
            finance.outstandingFees !==
                undefined
        ) {

            setStat(
                "Outstanding Fees",
                finance.outstandingFees,
                overview
            );
        }


        renderRecentPayments(
            data.recent?.payments ||
            [],
            overview
        );


        updateCollectionProgress(
            finance,
            overview
        );


        renderRecentActivity(
            data.recent?.activity ||
            [],
            overview
        );
    }


    function renderRecentPayments(
        payments,
        root = document
    ) {

        const table =
            root.querySelector(
                "#recentPaymentsTable"
            );


        if (!table) {
            return;
        }


        if (!payments.length) {

            table.innerHTML = `
                <tr>
                    <td colspan="4">
                        No payment records available.
                    </td>
                </tr>
            `;

            return;
        }


        table.innerHTML =
            payments
                .slice(0, 10)
                .map(
                    payment => `
                        <tr>

                            <td>
                                ${escapeHtml(
                                    payment.parent_name ||
                                    payment.parent ||
                                    "—"
                                )}
                            </td>

                            <td>
                                ${escapeHtml(
                                    payment.student_name ||
                                    payment.student ||
                                    "—"
                                )}
                            </td>

                            <td>
                                ${escapeHtml(
                                    payment.amount_display ||
                                    payment.amount ||
                                    "₦0"
                                )}
                            </td>

                            <td>

                                <span class="status ${statusClass(
                                    payment.status
                                )}">
                                    ${escapeHtml(
                                        payment.status ||
                                        "Pending"
                                    )}
                                </span>

                            </td>

                        </tr>
                    `
                )
                .join("");
    }


    function updateCollectionProgress(
        finance,
        root = document
    ) {

        const collected =
            Number(
                finance.feesCollectedRaw ??
                finance.feesCollected ??
                0
            );


        const outstanding =
            Number(
                finance.outstandingFeesRaw ??
                finance.outstandingFees ??
                0
            );


        const total =
            collected +
            outstanding;


        const percentage =
            total > 0
                ? Math.round(
                    (collected / total) *
                    100
                )
                : 0;


        const percentageElement =
            root.querySelector(
                "#collectionPercentage"
            );


        const collectedElement =
            root.querySelector(
                "#collectionCollected"
            );


        const outstandingElement =
            root.querySelector(
                "#collectionOutstanding"
            );


        if (percentageElement) {

            percentageElement.textContent =
                `${percentage}%`;
        }


        if (collectedElement) {

            collectedElement.textContent =
                finance.feesCollected ||
                `₦${formatNumber(collected)}`;
        }


        if (outstandingElement) {

            outstandingElement.textContent =
                finance.outstandingFees ||
                `₦${formatNumber(outstanding)}`;
        }
    }


    function renderRecentActivity(
        activity,
        root = document
    ) {

        const candidates =
            root.querySelectorAll(
                ".activity-list, .recent-activity, .dashboard-activity"
            );


        if (!candidates.length) {
            return;
        }


        const container =
            candidates[0];


        container.innerHTML =
            activity
                .slice(0, 10)
                .map(
                    item => `

                        <div class="activity-item">

                            <div class="activity-icon">
                                ${escapeHtml(
                                    item.icon ||
                                    "📌"
                                )}
                            </div>

                            <div class="activity-content">

                                <strong>
                                    ${escapeHtml(
                                        item.title ||
                                        "Activity"
                                    )}
                                </strong>

                                <p>
                                    ${escapeHtml(
                                        item.name ||
                                        "Unknown"
                                    )}
                                </p>

                                <small>
                                    ${escapeHtml(
                                        item.description ||
                                        ""
                                    )}
                                </small>

                            </div>

                            <span class="status ${statusClass(
                                item.status
                            )}">
                                ${escapeHtml(
                                    item.status ||
                                    "Active"
                                )}
                            </span>

                        </div>

                    `
                )
                .join("");
    }


    async function hydrateOverview() {

        try {

            const data =
                await loadDashboardOverview();


            hydrateSchoolHeader(
                data.school,
                data.user
            );


            hydrateOverviewFromData(
                data
            );

        } catch (error) {

            console.error(
                "Dashboard overview error:",
                error
            );


            toast(
                error.message,
                "error"
            );
        }
    }


    /* =============================================================
       STUDENTS
       ============================================================= */

    function renderStudents(
        students,
        root = document
    ) {

        const table =
            root.querySelector(
                "#studentsTable"
            );


        if (!table) {
            return;
        }


        table.innerHTML =
            students.length

                ? students
                    .map(
                        student => `

                            <tr>

                                <td>
                                    ${escapeHtml(
                                        student.admission_number ||
                                        "—"
                                    )}
                                </td>

                                <td>
                                    ${escapeHtml(
                                        fullName(
                                            student
                                        )
                                    )}
                                </td>

                                <td>
                                    ${escapeHtml(
                                        student.gender ||
                                        "—"
                                    )}
                                </td>

                                <td>

                                    ${escapeHtml(
                                        student.class_name ||
                                        "—"
                                    )}

                                    ${
                                        student.arm
                                            ? ` ${escapeHtml(
                                                student.arm
                                            )}`
                                            : ""
                                    }

                                </td>

                                <td>

                                    <span class="status ${statusClass(
                                        student.status
                                    )}">
                                        ${escapeHtml(
                                            student.status ||
                                            "Unknown"
                                        )}
                                    </span>

                                </td>

                            </tr>

                        `
                    )
                    .join("")

                : `

                    <tr>

                        <td colspan="5">
                            No students found.
                        </td>

                    </tr>

                `;
    }


    function hydrateStudentsFromOverview(
        data
    ) {

        const page =
            getPageElement(
                "students"
            );


        if (!page) {
            return;
        }


        const stats =
            data.statistics ||
            {};


        const students =
            data.recent?.students ||
            [];


        setStat(
            "Total Students",
            formatNumber(
                stats.totalStudents
            ),
            page
        );


        setStat(
            "Active Students",
            formatNumber(
                stats.activeStudents
            ),
            page
        );


        setStat(
            "New Students",
            formatNumber(
                stats.newStudentsLast30Days
            ),
            page
        );


        renderStudents(
            students,
            page
        );
    }


    async function hydrateStudentsPage() {

        try {

            const data =
                dashboardData ||
                await loadDashboardOverview();


            hydrateStudentsFromOverview(
                data
            );

        } catch (error) {

            console.error(
                "Students page error:",
                error
            );


            toast(
                error.message,
                "error"
            );
        }
    }


    /* =============================================================
       PARENTS
       ============================================================= */

    function renderParents(
        parents,
        root = document
    ) {

        const table =
            root.querySelector(
                "#parentsTable"
            );


        if (!table) {
            return;
        }


        table.innerHTML =
            parents.length

                ? parents
                    .map(
                        parent => `

                            <tr>

                                <td>
                                    ${escapeHtml(
                                        fullName(
                                            parent
                                        )
                                    )}
                                </td>

                                <td>
                                    ${escapeHtml(
                                        parent.relationship ||
                                        "Parent/Guardian"
                                    )}
                                </td>

                                <td>
                                    ${escapeHtml(
                                        parent.phone ||
                                        "—"
                                    )}
                                </td>

                                <td>
                                    ${escapeHtml(
                                        parent.email ||
                                        "—"
                                    )}
                                </td>

                                <td>

                                    <span class="status ${statusClass(
                                        parent.status
                                    )}">
                                        ${escapeHtml(
                                            parent.status ||
                                            "Unknown"
                                        )}
                                    </span>

                                </td>

                            </tr>

                        `
                    )
                    .join("")

                : `

                    <tr>

                        <td colspan="5">
                            No parents found.
                        </td>

                    </tr>

                `;
    }


    async function hydrateParentsPage() {

        try {

            const data =
                dashboardData ||
                await loadDashboardOverview();


            const page =
                getPageElement(
                    "parents"
                );


            if (!page) {
                return;
            }


            const stats =
                data.statistics ||
                {};


            const parents =
                data.recent?.parents ||
                [];


            setStat(
                "Total Parents",
                formatNumber(
                    stats.totalParents
                ),
                page
            );


            setStat(
                "Active Parents",
                formatNumber(
                    stats.activeParents
                ),
                page
            );


            renderParents(
                parents,
                page
            );

        } catch (error) {

            console.error(
                "Parents page error:",
                error
            );


            toast(
                error.message,
                "error"
            );
        }
    }


    /* =============================================================
       STAFF & TEACHERS
       ============================================================= */

    function renderStaff(
        staff,
        root = document
    ) {

        const table =
            Array.from(
                root.querySelectorAll(
                    ".table-container table"
                )
            )
                .find(
                    candidate => {

                        const headers =
                            Array.from(
                                candidate.querySelectorAll(
                                    "thead th"
                                )
                            )
                                .map(
                                    th =>
                                        th.textContent
                                            .trim()
                                            .toLowerCase()
                                );


                        return (
                            headers.includes(
                                "name"
                            ) &&
                            headers.includes(
                                "role"
                            ) &&
                            headers.includes(
                                "email"
                            ) &&
                            headers.includes(
                                "phone"
                            ) &&
                            headers.includes(
                                "status"
                            )
                        );
                    }
                );


        if (!table) {
            return;
        }


        table.innerHTML =
            staff.length

                ? staff
                    .map(
                        user => `

                            <tr>

                                <td>
                                    ${escapeHtml(
                                        fullName(
                                            user
                                        )
                                    )}
                                </td>

                                <td>
                                    ${escapeHtml(
                                        user.role ||
                                        "Staff"
                                    )}
                                </td>

                                <td>
                                    ${escapeHtml(
                                        user.email ||
                                        "—"
                                    )}
                                </td>

                                <td>
                                    ${escapeHtml(
                                        user.phone ||
                                        "—"
                                    )}
                                </td>

                                <td>

                                    <span class="status ${statusClass(
                                        user.status
                                    )}">
                                        ${escapeHtml(
                                            user.status ||
                                            "Unknown"
                                        )}
                                    </span>

                                </td>

                            </tr>

                        `
                    )
                    .join("")

                : `

                    <tr>

                        <td colspan="5">
                            No staff records found.
                        </td>

                    </tr>

                `;
    }


    async function hydrateStaffPage() {

        try {

            const data =
                dashboardData ||
                await loadDashboardOverview();


            const page =
                getPageElement(
                    "staff"
                );


            if (!page) {
                return;
            }


            const stats =
                data.statistics ||
                {};


            const staff =
                data.recent?.staff ||
                [];


            setStat(
                "Total Staff",
                formatNumber(
                    stats.totalStaff
                ),
                page
            );


            setStat(
                "Teachers",
                formatNumber(
                    stats.teachers
                ),
                page
            );


            setStat(
                "Administrative Staff",
                formatNumber(
                    stats.administrativeStaff
                ),
                page
            );


            setStat(
                "Support Staff",
                formatNumber(
                    stats.supportStaff
                ),
                page
            );


            renderStaff(
                staff,
                page
            );

        } catch (error) {

            console.error(
                "Staff page error:",
                error
            );


            toast(
                error.message,
                "error"
            );
        }
    }


    /* =============================================================
       SCHOOL MANAGEMENT
       ============================================================= */

    function hydrateSchoolDetails(
        school,
        root = document
    ) {

        if (!school) {
            return;
        }


        const mappings = {

            "School Name":
                school.name,

            "School Email":
                school.email,

            "Phone Number":
                school.phone,

            "School Address":
                school.address,

            "School Type":
                school.school_type,

            "Current Session":
                school.academic_session,

            "Current Term":
                school.current_term,

            "School Code":
                school.school_code,

            "Website":
                school.website,

            "Account Status":
                school.status,

            "School Status":
                school.status
        };


        root
            .querySelectorAll(
                ".detail-item"
            )
            .forEach(
                item => {

                    const label =
                        item
                            .querySelector(
                                "span"
                            )
                            ?.textContent
                            ?.trim();


                    const value =
                        mappings[label];


                    if (
                        value ===
                        undefined
                    ) {
                        return;
                    }


                    const strong =
                        item.querySelector(
                            "strong"
                        );


                    if (strong) {

                        strong.textContent =
                            value ||
                            "—";
                    }
                }
            );


        root
            .querySelectorAll(
                ".status-overview h3"
            )
            .forEach(
                element => {

                    element.textContent =
                        school.status ||
                        "Unknown";
                }
            );


        const sessionElements =
            root.querySelectorAll(
                ".status-information strong"
            );


        sessionElements.forEach(
            element => {

                if (
                    element.parentElement
                        ?.textContent
                        ?.toLowerCase()
                        .includes(
                            "session"
                        )
                ) {

                    element.textContent =
                        school.academic_session ||
                        "—";
                }
            }
        );
    }


    function fillSchoolForm(
        school,
        user
    ) {

        const form =
            document.querySelector(
                ".school-form"
            );


        if (
            !form ||
            !school
        ) {
            return;
        }


        const inputs =
            form.querySelectorAll(
                "input, textarea, select"
            );


        inputs.forEach(
            input => {

                const label =
                    input
                        .parentElement
                        ?.querySelector(
                            "label"
                        )
                        ?.textContent
                        ?.trim()
                        .toLowerCase();


                if (!label) {
                    return;
                }


                if (
                    label.includes(
                        "school name"
                    )
                ) {

                    input.value =
                        school.name ||
                        "";
                }


                if (
                    label.includes(
                        "school code"
                    )
                ) {

                    input.value =
                        school.school_code ||
                        "";
                }


                if (
                    label.includes(
                        "principal"
                    )
                ) {

                    input.value =
                        user?.full_name ||
                        "";
                }


                if (
                    label.includes(
                        "phone"
                    )
                ) {

                    input.value =
                        school.phone ||
                        "";
                }


                if (
                    label.includes(
                        "email"
                    )
                ) {

                    input.value =
                        school.email ||
                        "";
                }


                if (
                    label.includes(
                        "address"
                    )
                ) {

                    input.value =
                        school.address ||
                        "";
                }


                if (
                    label.includes(
                        "school type"
                    )
                ) {

                    input.value =
                        school.school_type ||
                        "";
                }


                if (
                    label.includes(
                        "session"
                    )
                ) {

                    input.value =
                        school.academic_session ||
                        "";
                }


                if (
                    label.includes(
                        "term"
                    )
                ) {

                    input.value =
                        school.current_term ||
                        "";
                }


                if (
                    label.includes(
                        "motto"
                    )
                ) {

                    input.value =
                        school.motto ||
                        "";
                }


                if (
                    label.includes(
                        "website"
                    )
                ) {

                    input.value =
                        school.website ||
                        "";
                }
            }
        );
    }


    async function hydrateSchoolPages() {

        try {

            const data =
                dashboardData ||
                await loadDashboardOverview();


            hydrateSchoolHeader(
                data.school,
                data.user
            );


            const schoolPage =
                getPageElement(
                    "school"
                );


            const profilePage =
                getPageElement(
                    "school-profile"
                );


            if (schoolPage) {

                hydrateSchoolDetails(
                    data.school,
                    schoolPage
                );
            }


            if (profilePage) {

                hydrateSchoolDetails(
                    data.school,
                    profilePage
                );
            }


            fillSchoolForm(
                data.school,
                data.user
            );

        } catch (error) {

            console.error(
                "School page error:",
                error
            );


            toast(
                error.message,
                "error"
            );
        }
    }


    /* =============================================================
       SCHOOL FORM
       -------------------------------------------------------------
       The current backend exposes dashboard overview.
       Until a confirmed PUT school endpoint is available,
       the dashboard does not pretend that a school update
       succeeded.
       ============================================================= */

    function setupSchoolForm() {

        const form =
            document.querySelector(
                ".school-form"
            );


        if (!form) {
            return;
        }


        form.addEventListener(
            "submit",
            async event => {

                event.preventDefault();


                toast(
                    "School editing UI is ready. Add the authenticated school PUT endpoint before saving changes.",
                    "error"
                );
            }
        );
    }


    /* =============================================================
       ADD STUDENT BUTTONS
       ============================================================= */

    function setupAddStudentButtons() {

        document.addEventListener(
            "click",
            event => {

                const button =
                    event.target.closest(
                        ".primary-button"
                    );


                if (!button) {
                    return;
                }


                const text =
                    button.textContent
                        .trim()
                        .toLowerCase();


                if (
                    text.includes(
                        "add student"
                    )
                ) {

                    showPage(
                        "students"
                    );


                    toast(
                        "Students section opened."
                    );
                }
            }
        );
    }


    /* =============================================================
       INITIAL LOAD
       ============================================================= */

    async function initDashboard() {

        if (!getToken()) {

            window.location.href =
                "index.html";

            return;
        }


        setupNavigation();

        setupSidebar();

        setupNotifications();

        setupTheme();

        setupLogout();

        setupSearch();

        setupSchoolForm();

        setupAddStudentButtons();


        showPage(
            "overview"
        );
    }


    document.addEventListener(
        "DOMContentLoaded",
        initDashboard
    );

})();
