/* ================================
   DASHBOARD NAVIGATION
================================ */

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
    document.getElementById(
        "notification-button"
    );


const notificationDropdown =
    document.getElementById(
        "notification-dropdown"
    );



/* ================================
   PAGE NAVIGATION
================================ */

navItems.forEach(function (item) {

    item.addEventListener(
        "click",
        function () {

            const page =
                item.getAttribute(
                    "data-page"
                );


            navItems.forEach(
                function (nav) {

                    nav.classList.remove(
                        "active"
                    );

                }
            );


            item.classList.add(
                "active"
            );


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

            } else if (
                page === "fee-structures"
            ) {

                showFeeStructures();

            } else if (
                page === "payments"
            ) {

                showParentPayments();

            } else if (
                page === "outstanding"
            ) {

                showOutstandingFees();

            } else if (
                page === "students"
            ) {

                showStudents();

            } else if (
                page === "parents"
            ) {

                showParents();

            } else if (
                page === "staff"
            ) {

                showStaff();

            } else if (
                page === "announcements"
            ) {

                showAnnouncements();

            } else if (
                page === "messages"
            ) {

                showMessages();

            } else if (
                page === "notifications"
            ) {

                showNotifications();

            } else if (
                page === "school-profile"
            ) {

                showSchoolProfile();

            } else if (
                page === "user-roles"
            ) {

                showUserRoles();

            } else if (
                page === "payment-settings"
            ) {

                showPaymentSettings();

            } else if (
                page === "security"
            ) {

                showSecurity();

            } else if (
                page === "email-settings"
            ) {

                showEmailSettings();

            } else if (
                page === "backup"
            ) {

                showBackup();

            } else {

                showComingSoon(
                    item.textContent.trim()
                );

            }


            if (
                window.innerWidth <= 768 &&
                sidebar
            ) {

                sidebar.classList.remove(
                    "show"
                );

            }

        }

    );

});



/* ================================
   REPORTS DROPDOWN
================================ */

const reportsToggle =
    document.querySelector(
        ".reports-toggle"
    );


if (reportsToggle) {

    const reportsGroup =
        reportsToggle.closest(
            ".nav-group"
        );


    if (reportsGroup) {

        reportsToggle.addEventListener(
            "click",
            function () {

                reportsGroup.classList.toggle(
                    "open"
                );

            }
        );

    }

}



/* ================================
   SETTINGS DROPDOWN
================================ */

const settingsToggle =
    document.querySelector(
        ".settings-toggle"
    );


if (settingsToggle) {

    const settingsGroup =
        settingsToggle.closest(
            ".nav-group"
        );


    if (settingsGroup) {

        settingsToggle.addEventListener(
            "click",
            function () {

                settingsGroup.classList.toggle(
                    "open"
                );

            }
        );

    }

}



/* ================================
   MOBILE SIDEBAR
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


            notificationDropdown.classList.toggle(
                "show"
            );

        }
    );


    document.addEventListener(
        "click",
        function (event) {

            if (
                !notificationDropdown.contains(
                    event.target
                ) &&
                !notificationButton.contains(
                    event.target
                )
            ) {

                notificationDropdown.classList.remove(
                    "show"
                );

            }

        }
    );

}
