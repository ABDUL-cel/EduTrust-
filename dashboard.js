// dashboard.js
// =========================================================
// DASHBOARD NAVIGATION
// student.js owns student functionality.
// =========================================================

"use strict";

let dashboardInitialized = false;

function getNavItems() {
    return document.querySelectorAll(
        ".nav-item[data-page], .submenu-item[data-page]"
    );
}

function showStaticPage(pageName) {
    if (!pageName) {
        pageName = "overview";
    }

    const pages = document.querySelectorAll(".page-content");

    // Hide EVERY page first
    pages.forEach(page => {
        page.classList.add("hidden");
    });

    // Find requested page
    const target = document.getElementById(
        `${pageName}Page`
    );

    if (!target) {
        console.warn(
            `Dashboard page not found: ${pageName}Page`
        );

        // Fall back to overview
        const overview =
            document.getElementById("overviewPage");

        if (overview) {
            overview.classList.remove("hidden");
        }

        return;
    }

    // Show ONLY requested page
    target.classList.remove("hidden");

    // Update navigation
    getNavItems().forEach(item => {
        item.classList.remove("active");
    });

    const activeItem = document.querySelector(
        `[data-page="${CSS.escape(pageName)}"]`
    );

    if (activeItem) {
        activeItem.classList.add("active");
    }

    // Update page title if element exists
    const pageTitle =
        document.getElementById("pageTitle");

    if (pageTitle) {
        pageTitle.textContent =
            activeItem?.textContent?.trim() ||
            pageName
                .replace(/-/g, " ")
                .replace(/\b\w/g, letter =>
                    letter.toUpperCase()
                );
    }

    // =====================================================
    // STUDENTS
    // student.js owns loading students.
    // =====================================================

    if (pageName === "students") {
        if (typeof window.loadStudents === "function") {
            window.loadStudents();
        }
    }

    // Mobile sidebar
    if (window.innerWidth <= 768) {
        document
            .getElementById("sidebar")
            ?.classList.remove("show");
    }
}


// =========================================================
// NAVIGATION EVENTS
// =========================================================

function bindDashboardNavigation() {

    if (dashboardInitialized) {
        return;
    }

    dashboardInitialized = true;

    getNavItems().forEach(item => {

        item.addEventListener("click", event => {

            event.preventDefault();
            event.stopPropagation();

            const page =
                item.dataset.page;

            if (!page) {
                return;
            }

            showStaticPage(page);
        });

    });
}


// =========================================================
// REPORTS / SETTINGS DROPDOWN
// =========================================================

function bindDropdownMenus() {

    const reportsToggle =
        document.querySelector(
            ".reports-toggle"
        );

    const settingsToggle =
        document.querySelector(
            ".settings-toggle"
        );

    const reportGroup =
        reportsToggle?.closest(
            ".nav-group"
        );

    const settingsGroup =
        settingsToggle?.closest(
            ".nav-group"
        );


    if (reportsToggle && reportGroup) {

        reportsToggle.addEventListener(
            "click",
            event => {

                event.preventDefault();
                event.stopPropagation();

                reportGroup.classList.toggle(
                    "open"
                );

            }
        );
    }


    if (settingsToggle && settingsGroup) {

        settingsToggle.addEventListener(
            "click",
            event => {

                event.preventDefault();
                event.stopPropagation();

                settingsGroup.classList.toggle(
                    "open"
                );

            }
        );
    }
}


// =========================================================
// MOBILE SIDEBAR
// =========================================================

function bindMobileMenu() {

    const menuButton =
        document.getElementById(
            "menu-toggle"
        );

    const sidebar =
        document.getElementById(
            "sidebar"
        );

    if (!menuButton || !sidebar) {
        return;
    }

    menuButton.addEventListener(
        "click",
        event => {

            event.preventDefault();

            sidebar.classList.toggle(
                "show"
            );

        }
    );
}


// =========================================================
// INITIALIZATION
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        // Navigation
        bindDashboardNavigation();

        // Reports / Settings
        bindDropdownMenus();

        // Mobile menu
        bindMobileMenu();

        // Determine initial page
        const visiblePage =
            document.querySelector(
                ".page-content:not(.hidden)"
            );

        if (
            visiblePage &&
            visiblePage.id &&
            visiblePage.id.endsWith("Page")
        ) {

            const pageName =
                visiblePage.id.slice(
                    0,
                    -4
                );

            showStaticPage(
                pageName
            );

        } else {

            showStaticPage(
                "overview"
            );

        }

    }
);
